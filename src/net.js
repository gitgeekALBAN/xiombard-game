import { Peer } from 'peerjs';

// Peer-to-peer co-op over WebRTC data channels (PeerJS).
// The host's browser runs the simulation; guests send input and render snapshots.
// Signaling uses the free PeerJS cloud broker by default. For local testing pass
// ?peerhost=localhost&peerport=9000 and run `npx peerjs --port 9000`.
const PREFIX = 'xiombard-gy-';
const LETTERS = 'BCDFGHJKLMNPQRSTVWXZ';

// ---------- ICE: how two browsers find a way to each other ----------
// STUN lets most home networks link up directly. Some networks never do (mobile data, carrier-grade NAT, office and
// campus Wi-Fi): those need a TURN relay that forwards the traffic. PeerJS's own default relays are gone (their host
// names no longer resolve), so the relay is ours to set. Fill ONE of these once the team has a TURN account:
//  - TURN_ENDPOINT: a URL that returns ICE servers as JSON, fetched on Host/Join. Metered:
//    https://<app>.metered.live/api/v1/turn/credentials?apiKey=<key> (an array). A Cloudflare Worker that mints
//    short-lived Cloudflare TURN credentials returns { iceServers: {...} }; both shapes are accepted.
//  - TURN_SERVERS: fixed servers, [{ urls: ['turn:host:3478', ...], username, credential }].
// Anything here ends up in the public page, so prefer the endpoint with short-lived credentials.
// Testing: ?turn=turn:host:3478&tuser=..&tpass=.. adds a relay; ?relay sends every link through a relay (to check it).
export const TURN_ENDPOINT = '';
export const TURN_SERVERS = [];
const STUN = [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun.cloudflare.com:3478' }];

let iceCache = null;
function iceConfig() {
  if (iceCache) return iceCache;
  const q = new URLSearchParams(location.search);
  const servers = [...STUN, ...TURN_SERVERS];
  if (q.get('turn')) servers.push({ urls: q.get('turn').split(','), username: q.get('tuser') || '', credential: q.get('tpass') || '' });
  const fetched = !TURN_ENDPOINT ? Promise.resolve([]) : Promise.race([
    fetch(TURN_ENDPOINT).then((r) => r.json()).then((j) => {
      const list = Array.isArray(j) ? j : j && j.iceServers ? [].concat(j.iceServers) : [];
      return list.filter((s) => s && s.urls);
    }),
    new Promise((res) => setTimeout(() => res([]), 4000)), // a slow endpoint must not hold the game up
  ]).catch(() => []);
  iceCache = fetched.then((turn) => {
    const all = [...servers, ...turn];
    return { iceServers: all, iceTransportPolicy: q.has('relay') ? 'relay' : 'all', relays: all.filter((s) => [].concat(s.urls).some((u) => /^turns?:/.test(u))).length };
  });
  return iceCache;
}

async function peerOptions() {
  const q = new URLSearchParams(location.search);
  const host = q.get('peerhost');
  const { iceServers, iceTransportPolicy } = await iceConfig();
  const opts = { debug: 1, config: { iceServers, iceTransportPolicy } };
  if (host) Object.assign(opts, { host, port: +(q.get('peerport') || 9000), path: '/', secure: q.get('peersecure') === '1' });
  return opts;
}

// Is a link going directly or through a relay? ('direct' | 'relay' | '?') For the status line and for tests.
export async function routeOf(conn) {
  try {
    const stats = await conn.peerConnection.getStats();
    let pair = null;
    stats.forEach((s) => { if (s.type === 'candidate-pair' && s.state === 'succeeded' && (s.nominated || !pair)) pair = s; });
    const local = pair && stats.get(pair.localCandidateId), remote = pair && stats.get(pair.remoteCandidateId);
    if (!local) return '?';
    return local.candidateType === 'relay' || (remote && remote.candidateType === 'relay') ? 'relay' : 'direct';
  } catch { return '?'; }
}

export const randomCode = () => Array.from({ length: 4 }, () => LETTERS[Math.floor(Math.random() * LETTERS.length)]).join('');

// Resolves with { peer, code } once the room is registered with the broker.
// onGuest(conn) fires as soon as someone starts knocking, before the link is up (see onGuest in main.js).
export async function hostRoom(onGuest, tries = 4) {
  const opts = await peerOptions();
  return new Promise((resolve, reject) => {
    const code = randomCode();
    const peer = new Peer(PREFIX + code, opts);
    peer.on('open', () => resolve({ peer, code }));
    peer.on('connection', (conn) => onGuest(conn));
    // keep the room joinable if the link to the signaling broker drops
    peer.on('disconnected', () => { if (!peer.destroyed) setTimeout(() => { try { peer.reconnect(); } catch { /* destroyed meanwhile */ } }, 1500); });
    peer.on('error', (err) => {
      if (err.type === 'unavailable-id' && tries > 0) { peer.destroy(); hostRoom(onGuest, tries - 1).then(resolve, reject); }
      else if (err.type !== 'peer-unavailable') reject(err); // after 'open' this only matters for the first call
    });
  });
}

// Resolves with an open DataConnection to the host. onStage(text) narrates the steps for the status line; the
// error message says which step failed, so a player (or whoever they send a screenshot to) knows what to try.
export async function joinRoom(code, onStage = () => {}) {
  code = code.toUpperCase();
  onStage('Finding the matchmaker...');
  const opts = await peerOptions();
  const { relays } = await iceConfig();
  return new Promise((resolve, reject) => {
    const peer = new Peer(opts);
    let stage = 'broker', settled = false;
    const fail = (msg) => { if (settled) return; settled = true; clearTimeout(timer); try { peer.destroy(); } catch { /* gone */ } reject(new Error(msg)); };
    const unreachable = () => `Couldn't reach the host of ${code}: your two networks won't link up directly`
      + (relays ? ' and the relay did not help.' : ' (no relay server is set up yet).') + ' A phone hotspot on one side often works.';
    const timer = setTimeout(() => fail(stage === 'broker' ? "Can't reach the matchmaking server. Check your connection and try again." : unreachable()), 30000);
    peer.on('open', () => {
      stage = 'knock';
      onStage(`Knocking on the crypt door of ${code}...`);
      const conn = peer.connect(PREFIX + code, { reliable: true });
      conn.on('iceStateChanged', (s) => {
        if (s === 'checking') { stage = 'reach'; onStage(`The host of ${code} answered, finding a way through...`); }
      });
      conn.on('open', () => { if (settled) return; settled = true; clearTimeout(timer); onStage('Connected, joining...'); resolve({ peer, conn }); });
      conn.on('error', (e) => fail(e.type === 'negotiation-failed' ? unreachable() : e.message || String(e)));
    });
    peer.on('error', (err) => fail(err.type === 'peer-unavailable' ? `No game with code ${code}. Check the code; the host has to keep the game open.`
      : err.type === 'network' || err.type === 'server-error' || err.type === 'socket-error' ? "Can't reach the matchmaking server. Check your connection and try again."
        : err.message || String(err)));
  });
}

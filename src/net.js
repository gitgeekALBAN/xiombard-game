import { joinRoom as tryJoin, selfId } from 'trystero';

// Peer-to-peer co-op over WebRTC data channels. The host's browser runs the whole simulation; guests send their input
// and draw the snapshots the host sends back (see main.js). This file only finds the other browsers and carries the
// messages.
// Finding each other: Trystero over public Nostr relays (many independent servers, so one being down or blocked does not
// stop a game), the same way the team's car prototype connects. A room is the 4-letter code. Everyone in a room links
// to everyone, but the game only talks host <-> guest: the host says who it is ('hi'), guests talk to that peer only.
const APP = 'gravequota-v1';
const LETTERS = 'BCDFGHJKLMNPQRSTVWXZ';
const BUILD_N = typeof __BUILD_N__ === 'number' ? __BUILD_N__ : 0; // a host and a guest on different builds must not mix

// ---------- ICE: how two browsers find a way to each other ----------
// Trystero brings its own STUN servers, which let most home networks link up directly. Some networks never do (mobile
// data, carrier-grade NAT, office Wi-Fi) would need a TURN relay that forwards the traffic. Not needed so far (decided):
// the team's car prototype runs the same way without one on the team's networks. Only if some player can never join
// (and the car prototype fails for them too) fill TURN_SERVERS ([{ urls: ['turn:host:3478', ...], username, credential }]). Anything
// here ends up in the public page. Testing: ?turn=turn:host:3478&tuser=..&tpass=.. adds one from the URL; ?relay sends
// every link through a relay (to check it).
export const TURN_SERVERS = [];
function roomConfig() {
  const q = new URLSearchParams(location.search), turn = [...TURN_SERVERS];
  if (q.get('turn')) turn.push({ urls: q.get('turn').split(','), username: q.get('tuser') || '', credential: q.get('tpass') || '' });
  return { appId: APP, turnConfig: turn, ...(q.has('relay') ? { rtcConfig: { iceTransportPolicy: 'relay' } } : {}), relays: turn.length };
}

// One peer as the game sees it: a little "connection" with send(msg), on('data' | 'close', fn), open and peerConnection,
// so main.js does not care how the bytes travel. A message carrying a binary snapshot (msg.buf, an ArrayBuffer) goes as
// binary with the rest as metadata; everything else goes as JSON.
function link(room, actions, peerId) {
  const handlers = { data: [], close: [] };
  const conn = {
    peer: peerId, open: true,
    get peerConnection() { return room.getPeers()[peerId]; },
    on(ev, fn) { (handlers[ev] || (handlers[ev] = [])).push(fn); return conn; },
    send(msg) {
      if (!conn.open) return;
      const p = msg && msg.buf instanceof ArrayBuffer
        ? actions.bin.send(msg.buf, { target: peerId, metadata: { ...msg, buf: undefined } })
        : actions.msg.send(msg, { target: peerId });
      if (p && p.catch) p.catch(() => {});
    },
    _data(msg) { for (const f of handlers.data) f(msg); },
    _close() { if (!conn.open) return; conn.open = false; for (const f of handlers.close) f(); },
  };
  return conn;
}
function wire(room) {
  const actions = { msg: room.makeAction('msg'), bin: room.makeAction('bin'), hi: room.makeAction('hi') };
  const links = new Map();
  actions.msg.onMessage = (data, { peerId }) => links.get(peerId)?._data(data);
  actions.bin.onMessage = (data, { peerId, metadata }) => {
    const buf = data instanceof ArrayBuffer ? data : ArrayBuffer.isView(data) ? data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) : null;
    if (buf) links.get(peerId)?._data({ ...(metadata || {}), buf });
  };
  return { actions, links };
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

// Opens a room and resolves with { room, code } right away. onGuest(conn) fires for every guest whose link comes up;
// conn closes when they leave.
export async function hostRoom(onGuest) {
  const code = randomCode(), cfg = roomConfig();
  const room = tryJoin(cfg, code);
  const { actions, links } = wire(room);
  room.onPeerJoin = (peerId) => {
    actions.hi.send({ host: true, build: BUILD_N }, { target: peerId }).catch(() => {});
    const conn = link(room, actions, peerId);
    links.set(peerId, conn);
    onGuest(conn);
  };
  room.onPeerLeave = (peerId) => { links.get(peerId)?._close(); links.delete(peerId); };
  return { room, code, selfId };
}

// Resolves with { room, conn } once the host of `code` has answered. onStage(text) narrates the steps for the status
// line; the error says which step failed and what to try.
export async function joinRoom(code, onStage = () => {}) {
  code = code.toUpperCase();
  const cfg = roomConfig();
  onStage(`Looking for game ${code}...`);
  const room = tryJoin(cfg, code);
  const { actions, links } = wire(room);
  return new Promise((resolve, reject) => {
    let settled = false, seen = 0;
    const fail = (msg) => { if (settled) return; settled = true; clearTimeout(timer); room.leave().catch(() => {}); reject(new Error(msg)); };
    const timer = setTimeout(() => fail(seen
      ? `Found game ${code}, but the host never answered. Ask them to reload and host again.`
      : `Couldn't find or reach game ${code}. Check the code (the host has to keep the game open). If it is right, your networks won't link up`
        + (cfg.relays ? ' even through the relay.' : '.') + ' A phone hotspot on one side often works.'), 30000);
    room.onPeerJoin = () => { seen++; if (!settled) onStage(`Found game ${code}, saying hello...`); };
    actions.hi.onMessage = (data, { peerId }) => {
      if (settled || !data || !data.host) return;
      if (data.build && BUILD_N && data.build !== BUILD_N) {
        fail(`The host is on build ${data.build}, you are on build ${BUILD_N}. Both of you reload the page (Ctrl+Shift+R).`);
        return;
      }
      settled = true;
      clearTimeout(timer);
      const conn = link(room, actions, peerId);
      links.set(peerId, conn);
      room.onPeerLeave = (id) => { if (id === peerId) conn._close(); };
      onStage('Connected, joining...');
      resolve({ room, conn });
    };
  });
}

// ---------- the lobby ----------
// Everyone with the menu open sits in one shared room, 'lobby' (like the car prototype). A host keeps announcing its
// game there ({ code, name, n players, max }, plus our build), so the menu lists open games to join with one click
// instead of a code to pass around. A game that stops announcing (closed tab) drops off the list after a few seconds.
// onChange(list) gets [{ code, name, n, max, old }] (old: another build, cannot be joined until everyone reloads).
export function joinLobby(onChange) {
  const room = tryJoin(roomConfig(), 'lobby');
  const ad = room.makeAction('game');
  const games = new Map(); // peerId -> announcement
  let mine = null;        // our own game's announcement while we host
  const changed = () => onChange([...games.values()].sort((a, b) => b.n - a.n || a.name.localeCompare(b.name)));
  ad.onMessage = (data, { peerId }) => {
    if (!data || !data.code) { if (games.delete(peerId)) changed(); return; } // { code: null }: that game closed
    games.set(peerId, { code: String(data.code).slice(0, 4), name: String(data.name || 'Someone').slice(0, 16), n: +data.n || 1, max: +data.max || 6,
      old: !!(data.build && BUILD_N && data.build !== BUILD_N), t: Date.now() });
    changed();
  };
  room.onPeerJoin = (peerId) => { if (mine) ad.send(mine, { target: peerId }).catch(() => {}); };
  room.onPeerLeave = (peerId) => { if (games.delete(peerId)) changed(); };
  const sweep = setInterval(() => {
    const now = Date.now();
    let gone = false;
    for (const [k, g] of games) if (now - g.t > 9000) { games.delete(k); gone = true; }
    if (gone) changed();
  }, 3000);
  const beat = setInterval(() => { if (mine) ad.send(mine).catch(() => {}); }, 3000);
  return {
    // g: { code, name, n, max } while hosting, null to take the game off the list
    announce(g) { mine = g ? { ...g, build: BUILD_N } : null; ad.send(mine || { code: null }).catch(() => {}); },
    leave() { clearInterval(sweep); clearInterval(beat); room.leave().catch(() => {}); },
  };
}

import { Peer } from 'peerjs';

// Peer-to-peer co-op over WebRTC data channels (PeerJS).
// The host's browser runs the simulation; guests send input and render snapshots.
// Signaling uses the free PeerJS cloud broker by default. For local testing pass
// ?peerhost=localhost&peerport=9000 and run `npx peerjs --port 9000`.
const PREFIX = 'xiombard-gy-';
const LETTERS = 'BCDFGHJKLMNPQRSTVWXZ';

function peerOptions() {
  const q = new URLSearchParams(location.search);
  const host = q.get('peerhost');
  const opts = { debug: 1 };
  if (host) Object.assign(opts, { host, port: +(q.get('peerport') || 9000), path: '/', secure: q.get('peersecure') === '1' });
  return opts;
}

export const randomCode = () => Array.from({ length: 4 }, () => LETTERS[Math.floor(Math.random() * LETTERS.length)]).join('');

// Resolves with { peer, code } once the room is registered with the broker.
export function hostRoom(onGuest, tries = 4) {
  return new Promise((resolve, reject) => {
    const code = randomCode();
    const peer = new Peer(PREFIX + code, peerOptions());
    peer.on('open', () => resolve({ peer, code }));
    peer.on('connection', (conn) => onGuest(conn));
    // keep the room joinable if the link to the signaling broker drops
    peer.on('disconnected', () => { if (!peer.destroyed) setTimeout(() => { try { peer.reconnect(); } catch { /* destroyed meanwhile */ } }, 1500); });
    peer.on('error', (err) => {
      if (err.type === 'unavailable-id' && tries > 0) { peer.destroy(); hostRoom(onGuest, tries - 1).then(resolve, reject); }
      else reject(err);
    });
  });
}

// Resolves with an open DataConnection to the host.
export function joinRoom(code) {
  return new Promise((resolve, reject) => {
    const peer = new Peer(peerOptions());
    const timer = setTimeout(() => reject(new Error('Timed out connecting to the host')), 15000);
    peer.on('open', () => {
      const conn = peer.connect(PREFIX + code.toUpperCase(), { reliable: true });
      conn.on('open', () => { clearTimeout(timer); resolve({ peer, conn }); });
      conn.on('error', (e) => { clearTimeout(timer); reject(e); });
    });
    peer.on('error', (err) => {
      clearTimeout(timer);
      reject(err.type === 'peer-unavailable' ? new Error(`No game with code ${code.toUpperCase()}`) : err);
    });
  });
}

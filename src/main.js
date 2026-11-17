import { View } from './view/view.js';
import { Sim } from './sim/game.js';
import { hostRoom, joinRoom } from './net.js';
import { unlockAudio } from './audio.js';
import { touch, initTouch, isTouchDevice } from './touch.js';

const $ = (id) => document.getElementById(id);
const view = new View(document.body);
const canvas = view.renderer.domElement;

// ---------- input ----------
const keys = new Set();
const look = { yaw: Math.PI, pitch: 0.32 };
const input = { mx: 0, mz: 0, yaw: look.yaw, run: false, jump: false, dig: false, g: 0, th: 0, fl: 0 };
let playing = false;
const SENS = 0.0024;

addEventListener('keydown', (e) => {
  if (!playing || e.target.tagName === 'INPUT') return;
  if (e.repeat) return;
  keys.add(e.code);
  if (e.code === 'KeyE') input.g++;
  if (e.code === 'KeyQ') input.th++;
  if (e.code === 'KeyR') input.fl++;
  if (e.code === 'KeyH') $('help').classList.toggle('open');
  if (e.code === 'Space') e.preventDefault();
});
addEventListener('keyup', (e) => keys.delete(e.code));
addEventListener('blur', () => keys.clear());
canvas.addEventListener('contextmenu', (e) => e.preventDefault());
// Pointer lock needs a user gesture and is missing on phones — never let a refusal break the game.
function lockPointer() {
  if (touch.active) return;
  try { canvas.requestPointerLock?.()?.catch?.(() => {}); } catch { /* not available */ }
}
canvas.addEventListener('pointerdown', (e) => {
  if (!playing || e.pointerType !== 'mouse') return;
  unlockAudio();
  if (document.pointerLockElement !== canvas) { lockPointer(); return; }
  if (e.button === 0) input.g++;
  if (e.button === 2) input.th++;
});
addEventListener('mousemove', (e) => {
  if (!playing || document.pointerLockElement !== canvas) return;
  look.yaw -= e.movementX * SENS;
  look.pitch = Math.max(-0.35, Math.min(1.2, look.pitch + e.movementY * SENS));
});

function readInput(dt) {
  const k = (c) => keys.has(c);
  if (k('ArrowLeft')) look.yaw += dt * 2.2;
  if (k('ArrowRight')) look.yaw -= dt * 2.2;
  if (k('ArrowUp')) look.pitch = Math.max(-0.35, look.pitch - dt * 1.2);
  if (k('ArrowDown')) look.pitch = Math.min(1.2, look.pitch + dt * 1.2);
  input.mz = (k('KeyW') ? 1 : 0) - (k('KeyS') ? 1 : 0) + touch.mz;
  input.mx = (k('KeyD') ? 1 : 0) - (k('KeyA') ? 1 : 0) + touch.mx;
  input.run = k('ShiftLeft') || k('ShiftRight') || touch.run;
  input.jump = k('Space') || touch.jump;
  input.dig = k('KeyF') || touch.dig;
  input.yaw = look.yaw;
  return input;
}

// ---------- session ----------
let sim = null;      // host only
let myId = 0;
let hostConn = null; // guest only
const guests = new Map(); // conn -> { id, ver }
let netAcc = 0, inAcc = 0;

function startPlaying() {
  playing = true;
  document.body.classList.add('playing');
  $('menu').classList.add('hidden');
  $('hud').classList.add('visible');
  unlockAudio();
  lockPointer();
}

function playerName() {
  const n = $('name').value.trim() || 'Digger';
  try { localStorage.setItem('xiombard-name', n); } catch {}
  return n;
}

async function host() {
  unlockAudio();
  setStatus('Opening the graveyard gates...');
  sim = new Sim();
  window.__xiom = { sim, view, look };
  myId = sim.addPlayer(playerName()).id;
  view.myId = myId;
  startPlaying();
  try {
    const { code } = await hostRoom(onGuest);
    showRoom(code);
  } catch (err) {
    showRoom(null, `Playing solo — couldn't open a co-op room (${err.type || err.message}).`);
  }
}

function onGuest(conn) {
  conn.on('data', (msg) => {
    if (msg.t === 'hello') {
      if ([...guests.values()].length >= 5) { conn.send({ t: 'full' }); setTimeout(() => conn.close(), 500); return; }
      const p = sim.addPlayer(msg.name);
      guests.set(conn, { id: p.id, ver: -1 });
      conn.send({ t: 'welcome', id: p.id });
      view.toast(`${p.name} joined the night shift`, [0, 3, 8], true);
    } else if (msg.t === 'in') {
      const g = guests.get(conn);
      if (g) sim.setInput(g.id, msg);
    }
  });
  const bye = () => {
    const g = guests.get(conn);
    if (!g) return;
    guests.delete(conn);
    sim.removePlayer(g.id);
  };
  conn.on('close', bye);
  conn.on('error', bye);
}

async function join(code) {
  if (!/^[A-Za-z]{4}$/.test(code)) { setStatus('Room codes are 4 letters.'); return; }
  unlockAudio();
  setStatus('Knocking on the crypt door...');
  try {
    const { conn } = await joinRoom(code);
    hostConn = conn;
    conn.send({ t: 'hello', name: playerName() });
    conn.on('data', (msg) => {
      if (msg.t === 'welcome') { myId = msg.id; view.myId = myId; startPlaying(); showRoom(code.toUpperCase()); }
      else if (msg.t === 'ents') view.setEntities(msg.list, msg.v);
      else if (msg.t === 'snap') { view.setTransforms(new Float32Array(msg.buf), msg.v, false); applyState(msg.st); }
      else if (msg.t === 'full') setStatus('That graveyard is full (6 diggers max).');
    });
    conn.on('close', () => { playing = false; document.body.classList.remove('playing'); document.exitPointerLock?.(); $('lost').classList.add('open'); });
  } catch (err) {
    setStatus(err.message || String(err));
  }
}

function setStatus(t) { $('status').textContent = t; }
function showRoom(code, note) {
  const box = $('room');
  if (!code) { box.innerHTML = `<span>${note}</span>`; return; }
  const link = `${location.origin}${location.pathname}?join=${code}`;
  box.innerHTML = `Room <b>${code}</b> <button id="copy">Copy invite link</button>`;
  $('copy').onclick = () => { navigator.clipboard?.writeText(link); $('copy').textContent = 'Copied!'; };
}

function applyState(st) {
  view.setState(st);
  $('score').textContent = st.score;
  const me = st.players.find((p) => p.id === myId);
  $('hint').textContent = me ? hintText(me.hint) : '';
  const grip = me ? me.grip : -1;
  $('grip').classList.toggle('show', grip >= 0);
  $('gripfill').style.width = `${Math.max(0, grip) * 100}%`;
  $('gripfill').style.background = grip < 0.3 ? '#e2584a' : '#cfe8a0';
  $('players').innerHTML = st.players.map((p) => `<li style="--c:${p.color}">${escapeHtml(p.name)}${p.id === myId ? ' (you)' : ''}</li>`).join('');
}
// Hints are written by the host in keyboard terms; on a touch screen show the button names instead.
const TOUCH_WORDS = [[/Hold F/g, 'Hold DIG'], [/Right-click to throw/g, 'THROW to throw'], [/Click to grab/g, 'Tap GRAB'],
  [/Click to drop/g, 'GRAB to drop'], [/Press R/g, 'Tap LIMP']];
const hintText = (h) => (touch.active ? TOUCH_WORDS.reduce((t, [re, w]) => t.replace(re, w), h) : h);
const escapeHtml = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// ---------- loop ----------
let last = performance.now();
function tick(dt) {
  if (sim) {
    if (playing) sim.setInput(myId, { ...readInput(dt) });
    sim.update(dt);
    if (sim.version !== view.version) view.setEntities(sim.describe(), sim.version);
    view.setTransforms(sim.transforms(), sim.version, true);
    netAcc += dt;
    if (netAcc >= 0.05) {
      netAcc = 0;
      const st = sim.state();
      applyState(st);
      if (guests.size) {
        const buf = sim.transforms().buffer;
        const desc = sim.describe();
        for (const [conn, g] of guests) {
          if (!conn.open) continue;
          if (g.ver !== sim.version) { conn.send({ t: 'ents', list: desc, v: sim.version }); g.ver = sim.version; }
          conn.send({ t: 'snap', buf, v: sim.version, st });
        }
      }
    }
  } else if (hostConn && playing) {
    readInput(dt);
    inAcc += dt;
    if (inAcc >= 1 / 30) { inAcc = 0; hostConn.send({ t: 'in', ...input }); }
  }
}
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  tick(dt);
  view.frame(dt, look);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// Browsers pause requestAnimationFrame in background tabs. If the host switches tabs the whole
// game would freeze for everyone, so a worker timer keeps the simulation ticking while hidden.
try {
  const ticker = new Worker(URL.createObjectURL(new Blob(['setInterval(() => postMessage(0), 33)'], { type: 'text/javascript' })));
  ticker.onmessage = () => {
    if (!document.hidden || !sim) return;
    const now = performance.now();
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    keys.clear();
    for (let t = dt; t > 0; t -= 0.05) tick(Math.min(0.05, t));
  };
} catch { /* no worker support: the game just pauses in the background */ }

// ---------- menu ----------
try { $('name').value = localStorage.getItem('xiombard-name') || ''; } catch {}
$('host').onclick = host;
$('join').onclick = () => join($('code').value.trim());
$('code').addEventListener('keydown', (e) => { if (e.key === 'Enter') join($('code').value.trim()); });
$('lost').onclick = () => location.reload();
if (isTouchDevice()) {
  initTouch($('touch'), look, { grab: () => input.g++, throw: () => input.th++, flop: () => input.fl++ });
  view.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
}
if (innerHeight < 520) $('help').classList.remove('open'); // keep short screens uncluttered
const autoJoin = new URLSearchParams(location.search).get('join');
if (autoJoin) { $('code').value = autoJoin.toUpperCase(); $('join').textContent = 'Join friends'; $('join').focus(); }

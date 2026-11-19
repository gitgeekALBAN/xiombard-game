import { View } from './view/view.js';
import { Sim } from './sim/game.js';
import { hostRoom, joinRoom } from './net.js';
import { unlockAudio } from './audio.js';
import { touch, initTouch, isTouchDevice } from './touch.js';
import { outfitLabel } from './shared/layout.js';
import { createBots } from './sim/bots.js';

const $ = (id) => document.getElementById(id);
// which build is this? Shown at the bottom edge, on the menu and in the game (see build-info.js); the middle of the
// bottom edge is free on phones too, between the stick and the buttons
const BUILD = typeof __BUILD__ === 'string' ? __BUILD__ : 'dev build';
{
  const el = document.createElement('div');
  el.id = 'build';
  el.textContent = BUILD;
  el.style.cssText = 'position:fixed;z-index:3;left:50%;transform:translateX(-50%);bottom:calc(4px + env(safe-area-inset-bottom, 0px));font:11px/1.2 system-ui,sans-serif;color:#efe6d6;opacity:.62;text-shadow:1px 1px 0 #000;pointer-events:none;letter-spacing:.02em;white-space:nowrap';
  document.body.appendChild(el);
}
const view = new View(document.body);
const canvas = view.renderer.domElement;

// ---------- input ----------
const keys = new Set();
// pitch > 0 looks down; min/max change with the camera mode (see setFirstPerson)
const look = { yaw: Math.PI, pitch: 0.32, min: -0.35, max: 1.2 };
const clampPitch = (v) => Math.max(look.min, Math.min(look.max, v));
// First person is the default view; V switches to the third-person camera and back (?view=third starts there).
function setFirstPerson(on) {
  view.firstPerson = on;
  Object.assign(look, on ? { min: -1.3, max: 1.35 } : { min: -0.35, max: 1.2 });
  look.pitch = clampPitch(on ? Math.min(look.pitch, 0.15) : Math.max(look.pitch, 0.32));
}
setFirstPerson(new URLSearchParams(location.search).get('view') !== 'third');
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
  if (e.code === 'KeyV') setFirstPerson(!view.firstPerson);
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
  look.pitch = clampPitch(look.pitch + e.movementY * SENS);
});

function readInput(dt) {
  const k = (c) => keys.has(c);
  if (k('ArrowLeft')) look.yaw += dt * 2.2;
  if (k('ArrowRight')) look.yaw -= dt * 2.2;
  if (k('ArrowUp')) look.pitch = clampPitch(look.pitch - dt * 1.2);
  if (k('ArrowDown')) look.pitch = clampPitch(look.pitch + dt * 1.2);
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
let bots = null;     // host only: AI teammates
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
  // ?daylen=<s>&nightlen=<s> shorten or stretch the two halves of the shift (testing, tuning)
  const q = new URLSearchParams(location.search);
  sim = new Sim({ dayLen: +q.get('daylen') || 0, nightLen: +q.get('nightlen') || 0 });
  myId = sim.addPlayer(playerName()).id;
  // AI teammates so nobody digs alone: ?bots=N (0..5), 3 by default; they step aside for joining humans
  bots = createBots(sim, q.has('botlog') ? { log: (m) => (window.__botlog || (window.__botlog = [])).push(m) } : {}); // ?botlog: what the bots are up to
  const nBots = Math.max(0, Math.min(5, +(new URLSearchParams(location.search).get('bots') ?? 3)));
  for (let i = 0; i < nBots; i++) bots.add(); // each takes the next free crew member and its name
  window.__xiom = { sim, view, look, bots };
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
      // a bot steps aside so the yard never holds more than six diggers
      if (bots.ids.length && 1 + guests.size + bots.ids.length >= 6) bots.remove(bots.ids[bots.ids.length - 1]);
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

// The delivery note card: who this is, what they should wear, and the laying-to-rest checklist.
let lastCard = '';
function renderCard(me) {
  const c = me && me.card, it = me && me.item, key = JSON.stringify([c, it]);
  if (key === lastCard) return;
  lastCard = key;
  const el = $('card');
  el.classList.toggle('show', !!(c || it));
  if (!c && !it) return;
  const li = (ok, text, bad) => `<li class="${ok ? 'ok' : bad ? 'bad' : ''}">${text}</li>`;
  let html = '';
  if (c) {
    const closed = c.stage === 'closed' || c.stage === 'nailed', dressed = c.outfit !== 'Plain shroud';
    html += `<h3>DELIVERY NOTE</h3><div class="who">${escapeHtml(c.name)}</div><div>wants: ${escapeHtml(c.suit.toLowerCase())}</div><ul>`
      + li(c.tagOk, c.tag ? `name tag: ${escapeHtml(c.tag)}` : 'hang the name tag', c.tag && !c.tagOk)
      + li(c.suitOk, dressed ? `wearing: ${escapeHtml(c.outfit.toLowerCase())}` : 'dress them', dressed && !c.suitOk)
      + li(c.stage === 'coffin' || closed, 'in a coffin') + li(closed, 'lid closed') + li(c.stage === 'nailed', 'nailed shut (calms them)') + li(false, 'buried') + '</ul>';
  }
  if (it) html += `<div class="held">In hand: ${it.type === 'tag' ? `name tag "${escapeHtml(it.name)}"` : escapeHtml(outfitLabel(it.suit).toLowerCase())}</div>`;
  el.innerHTML = html;
}

function applyState(st) {
  view.setState(st);
  $('score').textContent = st.buried ?? st.score;
  $('points').textContent = st.score;
  $('nails').textContent = st.nails ?? 0;
  $('boards').textContent = st.boards ?? 0;
  renderCard(st.players.find((p) => p.id === myId));
  if (st.phase) {
    const [night, left, day, light, zombies] = st.phase;
    view.setDay?.(light);
    document.body.classList.toggle('night', !!night);
    const clock = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
    $('phase').innerHTML = night ? `<b>Night ${day}</b> ${clock} to dawn<small>${zombies ? `${zombies} on their feet: whack them!` : 'quiet... for now'}</small>`
      : `<b>Day ${day}</b> ${clock} to dusk<small>bury them before dark</small>`;
  }
  const me = st.players.find((p) => p.id === myId);
  $('hint').textContent = me ? hintText(me.hint) : '';
  const grip = me ? me.grip : -1;
  $('grip').classList.toggle('show', grip >= 0);
  $('gripfill').style.width = `${Math.max(0, grip) * 100}%`;
  $('gripfill').style.background = grip < 0.3 ? '#e2584a' : '#cfe8a0';
  $('players').innerHTML = st.players.map((p) => `<li style="--c:${p.color}">${escapeHtml(p.name)}${p.id === myId ? ' (you)' : ''}</li>`).join('');
}
// Hints are written by the host in keyboard terms; on a touch screen show the button names instead.
const TOUCH_WORDS = [[/Hold F/g, 'Hold WORK'], [/\bE:/g, 'GRAB:'], [/Q to put it back/g, 'THROW to put it back'], [/Right-click to throw/g, 'THROW to throw'], [/Click to grab/g, 'Tap GRAB'], [/Click to whack/g, 'Tap GRAB to whack'],
  [/Click to drop/g, 'GRAB to drop'], [/Press R/g, 'Tap LIMP']];
const hintText = (h) => (touch.active ? TOUCH_WORDS.reduce((t, [re, w]) => t.replace(re, w), h) : h);
const escapeHtml = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// ---------- loop ----------
let last = performance.now();
function tick(dt) {
  if (sim) {
    if (playing) sim.setInput(myId, { ...readInput(dt) });
    bots.update(dt);
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
// Performance meter: F3 toggles it, or open the page with ?fps or #fps. Shows real frame rate, worst frame,
// draw calls and triangles, so testers on real hardware can report numbers.
const perf = { el: null, n: 0, t0: 0, worst: 0 };
function togglePerf(on = !perf.el) {
  if (on && !perf.el) {
    perf.el = Object.assign(document.createElement('div'), { id: 'perf' });
    perf.el.style.cssText = 'position:fixed;right:max(8px,env(safe-area-inset-right,0px));bottom:max(8px,env(safe-area-inset-bottom,0px));z-index:5;'
      + 'font:12px/1.35 ui-monospace,Consolas,monospace;color:#efe6d6;background:rgba(20,15,28,.82);padding:6px 9px;border-radius:8px;pointer-events:none;white-space:pre';
    perf.el.textContent = 'measuring...';
    document.body.appendChild(perf.el);
  } else if (!on && perf.el) { perf.el.remove(); perf.el = null; }
}
if (/fps/.test(location.search + location.hash)) togglePerf(true);
addEventListener('keydown', (e) => { if (e.code === 'F3') { e.preventDefault(); togglePerf(); } });
function measure(now, dt) {
  if (!perf.el) return;
  perf.n++;
  perf.worst = Math.max(perf.worst, dt);
  if (now - perf.t0 < 1000) return;
  const fps = (perf.n * 1000) / (now - perf.t0), r = view.renderer.info.render;
  perf.el.textContent = `${fps.toFixed(0)} fps  worst ${(perf.worst * 1000).toFixed(0)} ms\n`
    + `${r.calls} draws  ${(r.triangles / 1000).toFixed(0)}k tris\n${innerWidth}x${innerHeight} @${view.renderer.getPixelRatio()}x  post ${view.post?.quality ?? '-'}`;
  perf.n = 0; perf.t0 = now; perf.worst = 0;
}

function frame(now) {
  const raw = (now - last) / 1000;
  const dt = Math.min(0.05, raw);
  last = now;
  tick(dt);
  view.frame(dt, look);
  measure(now, raw);
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

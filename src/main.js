import { View } from './view/view.js';
import { Sim } from './sim/game.js';
import { hostRoom, joinRoom, routeOf } from './net.js';
import { unlockAudio } from './audio.js';
import { touch, initTouch, isTouchDevice, goLandscape } from './touch.js';
import { OUTFITS, RITES, CANDLES, MAX_CANDLES } from './shared/layout.js';
import { drawCharm } from './view/models/charms.js';
import { createBots } from './sim/bots.js';
import { warmUp } from './view/warmup.js';

const $ = (id) => document.getElementById(id);
// which build is this? Shown at the bottom edge, on the menu and in the game (see build-info.js); the middle of the
// bottom edge is free on phones too, between the stick and the buttons
const BUILD = typeof __BUILD__ === 'string' ? __BUILD__ : 'dev build';
const BUILD_N = typeof __BUILD_N__ === 'number' ? __BUILD_N__ : 0;
{
  const el = document.createElement('div');
  el.id = 'build';
  el.textContent = BUILD;
  el.style.cssText = 'position:fixed;z-index:3;left:50%;transform:translateX(-50%);bottom:calc(4px + env(safe-area-inset-bottom, 0px));font:11px/1.2 system-ui,sans-serif;color:#efe6d6;opacity:.62;text-shadow:1px 1px 0 #000;pointer-events:none;letter-spacing:.02em;white-space:nowrap';
  document.body.appendChild(el);
  // A newer build out? build.json sits next to index.html on the web host (written by build-info.js). Then the label
  // turns into a button: a tap fetches the page past the browser cache and reloads (what Ctrl+Shift+R does).
  // Not on the dev server or from a single file on disk: there is no build.json, so the check stays quiet.
  const hardReload = () => {
    const go = () => { try { location.reload(); } catch { /* nothing to do */ } };
    try { fetch(location.href.split('#')[0], { cache: 'reload' }).then(go, go); setTimeout(go, 2500); } catch { go(); }
  };
  const checkBuild = () => {
    if (!BUILD_N || el.dataset.upd || !/^https?:$/.test(location.protocol)) return;
    fetch(`./build.json?t=${Date.now()}`, { cache: 'no-store' }).then((r) => (r.ok ? r.json() : null)).then((j) => {
      if (!j || !(+j.n > BUILD_N)) return;
      el.dataset.upd = '1';
      el.textContent = `build ${BUILD_N} → ${j.n} is out · tap to update`;
      el.title = 'Reloads the page with the new build (a game in progress ends)';
      Object.assign(el.style, { pointerEvents: 'auto', cursor: 'pointer', opacity: '1', color: '#fff', background: '#b0401a',
        padding: '3px 10px', borderRadius: '7px', font: '700 12px/1.2 system-ui,sans-serif', textShadow: 'none' });
    }).catch(() => { /* offline or no build.json */ });
  };
  // keep the tap to itself: the canvas would grab the mouse, the touch zones would start a stick
  for (const ev of ['pointerdown', 'mousedown', 'touchstart']) el.addEventListener(ev, (e) => e.stopPropagation());
  el.addEventListener('click', (e) => { e.stopPropagation(); if (el.dataset.upd) { el.textContent = 'updating…'; hardReload(); } });
  checkBuild();
  setInterval(checkBuild, 90000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) checkBuild(); });
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
// g/th/fl/pk count presses (one-shot actions survive a dropped packet); pv is the outfit picked with the last pk
const input = { mx: 0, mz: 0, yaw: look.yaw, run: false, jump: false, dig: false, g: 0, th: 0, fl: 0, pk: 0, pv: 0, cw: 0, cc: 0, cn: 1, us: 0 };
let choosing = false; // the host says my outfit choice is open (dressing table)
const pickOutfit = (i) => { input.pv = i; input.pk++; };
// cw: the chapel charm I want in hand (index into RITES), sent with every input; the host applies it while I hold the charms
let myCharm = -1; // the charm the host says I hold (-1 none)
const pickCharm = (i) => { input.cw = ((i % RITES.length) + RITES.length) % RITES.length; };
// cc/cn: the candles I want at a headstone (color index into CANDLES, how many), applied while the candle choice is open
let myCandles = null; // [color, count, name] from the host while my candle choice is open
const setCandles = (c, n) => { input.cc = Math.max(0, Math.min(CANDLES.length - 1, c)); input.cn = Math.max(1, Math.min(MAX_CANDLES, n)); };
addEventListener('wheel', (e) => {
  if (!playing || !e.deltaY) return;
  if (myCharm >= 0) pickCharm(myCharm + Math.sign(e.deltaY));
  else if (myCandles) setCandles(myCandles[0], myCandles[1] - Math.sign(e.deltaY)); // wheel up: one more
}, { passive: true });
let playing = false;
const SENS = 0.0024;

addEventListener('keydown', (e) => {
  if (!playing || e.target.tagName === 'INPUT') return;
  if (e.repeat) return;
  keys.add(e.code);
  if (e.code === 'KeyE') input.g++;
  if (e.code === 'KeyQ') input.th++;
  if (e.code === 'KeyR') input.fl++;
  if (e.code === 'KeyU') input.us++; // unstick: wriggle out of whatever you got wedged in
  const digit = /^(?:Digit|Numpad)([1-9])$/.exec(e.code);
  if (digit && choosing && +digit[1] <= OUTFITS.length) pickOutfit(+digit[1] - 1);
  else if (digit && myCharm >= 0 && +digit[1] <= RITES.length) pickCharm(+digit[1] - 1);
  else if (digit && myCandles && +digit[1] <= CANDLES.length) setCandles(+digit[1] - 1, myCandles[1]);
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
let ready = false;   // warmUp is done: the scene may be drawn and a game may start
let queued = null;   // a Host / Join pressed before that, run when it is

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
  // ?botlog: what the bots are up to; ?botwork: bots run the whole chain (by default they just stand outside)
  bots = createBots(sim, { work: q.has('botwork'), ...(q.has('botlog') ? { log: (m) => (window.__botlog || (window.__botlog = [])).push(m) } : {}) });
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

// A guest's link is up (net.js): they join the game once they say hello.
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
      routeOf(conn).then((r) => { console.info(`[net] ${p.name} linked ${r}`); (window.__net ||= { routes: [] }).routes.push(r); });
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
    const { conn } = await joinRoom(code, setStatus);
    hostConn = conn;
    routeOf(conn).then((r) => { console.info(`[net] linked to the host ${r}`); (window.__net ||= { routes: [] }).routes.push(r); });
    conn.send({ t: 'hello', name: playerName() });
    conn.on('data', (msg) => {
      if (msg.t === 'welcome') { myId = msg.id; view.myId = myId; setStatus(''); startPlaying(); showRoom(code.toUpperCase()); }
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
  const c = me && me.card, key = JSON.stringify(c);
  if (key === lastCard) return;
  lastCard = key;
  const el = $('card');
  el.classList.toggle('show', !!c);
  if (!c) return;
  const li = (ok, text, bad) => `<li class="${ok ? 'ok' : bad ? 'bad' : ''}">${text}</li>`;
  const closed = c.stage === 'closed' || c.stage === 'nailed', dressed = c.outfit !== 'Plain shroud';
  el.innerHTML = `<h3>DELIVERY NOTE</h3><div class="who">${escapeHtml(c.name)}</div><div>wants: ${escapeHtml(c.suit.toLowerCase())}</div>`
    + `<div>blessing: ${escapeHtml(c.rite)} · candles: ${escapeHtml(c.cand)}</div><ul>`
    + li(c.tagOk, c.tag ? `name tag: ${escapeHtml(c.tag)}` : 'register at the desk (name tag)', c.tag && !c.tagOk)
    + li(c.suitOk, dressed ? `wearing: ${escapeHtml(c.outfit.toLowerCase())}` : 'dress at the dressing table', dressed && !c.suitOk)
    + li(c.riteOk, c.blessed ? `blessed with the ${escapeHtml(c.blessed)}` : 'bless them at the chapel', c.blessed && !c.riteOk)
    + li(c.stage === 'coffin' || closed, 'in a coffin') + li(closed, 'lid closed') + li(c.stage === 'nailed', 'nailed shut (calms them)')
    + li(false, 'buried, then candles at the headstone') + '</ul>';
}

// The outfit choice at the dressing table: a list of the outfits, picked with keys 1-5 or a tap.
function renderWardrobe(me) {
  const open = !!(me && me.choose);
  const el = $('wardrobe');
  if (open === choosing && el.childElementCount) return;
  choosing = open;
  el.classList.toggle('show', open);
  if (!open || el.childElementCount) return;
  el.innerHTML = '<h3>DRESS THEM IN</h3>' + OUTFITS.map((o, i) => `<button data-i="${i}"><kbd>${i + 1}</kbd>${escapeHtml(o.label)}</button>`).join('')
    + `<small>${touch.active ? 'THROW to cancel' : 'Q to cancel'}</small>`;
  for (const b of el.querySelectorAll('button')) b.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); pickOutfit(+b.dataset.i); });
}

// The chapel's charms while I hold them: four buttons along the bottom, the one in hand lit; wheel, keys 1-4 or a tap.
function renderCharms(me) {
  const ch = me ? me.ch ?? -1 : -1, el = $('charms');
  myCharm = ch;
  el.classList.toggle('show', ch >= 0);
  if (ch < 0) return;
  if (!el.childElementCount) {
    el.innerHTML = RITES.map((r, i) => `<button data-i="${i}"><canvas width="64" height="64"></canvas><span><kbd>${i + 1}</kbd>${escapeHtml(r.label)}</span></button>`).join('')
      + `<small>${touch.active ? 'GRAB: bless · THROW: put back' : 'wheel or 1-4 · E: bless · Q: put back'}</small>`;
    el.querySelectorAll('button').forEach((b, i) => {
      drawCharm(b.querySelector('canvas').getContext('2d'), RITES[i].id, 32, 33, 52, '#efe6d0');
      b.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); pickCharm(i); });
    });
  }
  el.querySelectorAll('button').forEach((b, i) => b.classList.toggle('on', i === ch));
  el.classList.toggle('chant', !!me.chant);
}

// The candle choice at a headstone: three colors and one to four candles; keys/wheel on a computer, taps on a phone.
function renderCandles(me) {
  const c = me ? me.cnd : null, el = $('candles');
  myCandles = c;
  el.classList.toggle('show', !!c);
  if (!c) return;
  if (!el.childElementCount) {
    el.innerHTML = '<h3>CANDLES FOR <b></b></h3><div class="row colors">'
      + CANDLES.map((k, i) => `<button data-c="${i}"><i style="background:${k.color}"></i><span><kbd>${i + 1}</kbd>${escapeHtml(k.label)}</span></button>`).join('')
      + '</div><div class="row count">' + Array.from({ length: MAX_CANDLES }, (_, i) => `<button data-n="${i + 1}">${i + 1}</button>`).join('')
      + `</div><button class="light">Light them</button><small>${touch.active ? 'THROW to cancel' : '1-3 color · wheel how many · E light · Q cancel'}</small>`;
    const tap = (b, fn) => b.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); fn(); });
    el.querySelectorAll('[data-c]').forEach((b) => tap(b, () => setCandles(+b.dataset.c, myCandles ? myCandles[1] : 1)));
    el.querySelectorAll('[data-n]').forEach((b) => tap(b, () => setCandles(myCandles ? myCandles[0] : 0, +b.dataset.n)));
    tap(el.querySelector('.light'), () => input.g++);
  }
  el.querySelector('h3 b').textContent = c[2];
  el.querySelectorAll('[data-c]').forEach((b) => b.classList.toggle('on', +b.dataset.c === c[0]));
  el.querySelectorAll('[data-n]').forEach((b) => b.classList.toggle('on', +b.dataset.n <= c[1]));
}

function applyState(st) {
  view.setState(st);
  $('score').textContent = st.buried ?? st.score;
  $('points').textContent = st.score;
  $('nails').textContent = st.nails ?? 0;
  $('boards').textContent = st.boards ?? 0;
  $('cash').textContent = st.cash ?? 0;
  renderCard(st.players.find((p) => p.id === myId));
  renderWardrobe(st.players.find((p) => p.id === myId));
  renderCharms(st.players.find((p) => p.id === myId));
  renderCandles(st.players.find((p) => p.id === myId));
  { const me = st.players.find((p) => p.id === myId), inf = !!(me && me.inf); document.body.classList.toggle('infected', inf); $('health').textContent = inf ? 'infected' : 'healthy'; } // only my own bite shows
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
const TOUCH_WORDS = [[/Hold F/g, 'Hold WORK'], [/\bE:/g, 'GRAB:'], [/keys 1-5 · Q to cancel/g, 'tap one · THROW to cancel'], [/Right-click to throw/g, 'THROW to throw'], [/Click to grab/g, 'Tap GRAB'], [/Click to whack/g, 'Tap GRAB to whack'],
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
  if (ready) view.frame(dt, look); // nothing is drawn until warmUp has compiled the shaders: a draw would compile them on the spot
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
// on a phone the game goes fullscreen and sideways on the tap that starts it (the tap is the gesture both need)
const sideways = () => { if (touch.active) goLandscape(); };
$('host').onclick = () => { sideways(); whenReady(host); };
$('join').onclick = () => { sideways(); const c = $('code').value.trim(); whenReady(() => join(c)); };
$('code').addEventListener('keydown', (e) => { if (e.key === 'Enter') { sideways(); const c = $('code').value.trim(); whenReady(() => join(c)); } });

// ---------- warm-up: shaders and meshes made behind a progress bar (view/warmup.js) ----------
// The menu works meanwhile: you can type your name, and Host / Join pressed early start the moment it is done.
function whenReady(fn) {
  if (ready) { fn(); return; }
  queued = fn;
  setStatus('Starting as soon as the graveyard is ready...');
}
{
  const bar = $('loadbar'), note = $('loadnote');
  warmUp(view, ({ done, total, stage }) => {
    bar.style.width = `${((100 * done) / Math.max(1, total)).toFixed(1)}%`;
    note.textContent = `${stage}... ${Math.floor((100 * done) / Math.max(1, total))}%`;
  }).catch((err) => console.error('warm-up failed, compiling on the fly instead', err)).finally(() => {
    ready = true;
    document.body.classList.add('ready');
    if (queued) { const fn = queued; queued = null; setStatus(''); fn(); }
  });
}
$('lost').onclick = () => location.reload();
if (isTouchDevice()) {
  initTouch($('touch'), look, { grab: () => input.g++, throw: () => input.th++, flop: () => input.fl++ });
  view.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
}
if (innerHeight < 520) $('help').classList.remove('open'); // keep short screens uncluttered
const autoJoin = new URLSearchParams(location.search).get('join');
if (autoJoin) { $('code').value = autoJoin.toUpperCase(); $('join').textContent = 'Join friends'; $('join').focus(); }

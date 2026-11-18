import * as THREE from 'three';
import { isTouchDevice } from '../touch.js';
import { DAY, keyLight } from '../shaders/toon.js';
import { CREW, crewRig, crewPose, rigPose } from '../shared/crew.js';
import { ZOMBIES, zombieRig, zombiePose } from '../shared/zombies.js';
import { corpseRig, REST_ROTS } from '../shared/corpses.js';
import { Character } from './index.js';

// The cast page: every character of the game on one sheet, for looking at shapes and paint up close.
// ?set=crew|dead|zombies|walkers|dogs|odd (default: all)   ?mode=night   ?only=<index within the set>
const $ = (id) => document.getElementById(id);
const q = new URLSearchParams(location.search);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, isTouchDevice() ? 1.5 : 2));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.prepend(renderer.domElement);
const scene = new THREE.Scene();
scene.background = new THREE.Color();
const camera = new THREE.PerspectiveCamera(30, innerWidth / innerHeight, 0.1, 200);

const groundMat = new THREE.ShaderMaterial({
  uniforms: { uGround: { value: new THREE.Color() }, uBg: { value: scene.background } },
  vertexShader: 'varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
  fragmentShader: `uniform vec3 uGround, uBg; varying vec3 vW;
    void main(){ gl_FragColor = vec4(mix(uGround, uBg, smoothstep(4.0, 16.0, length(vW.xz))), 1.0);
      #include <colorspace_fragment>
    }`,
});
scene.add(new THREE.Mesh(new THREE.CircleGeometry(60, 48).rotateX(-Math.PI / 2), groundMat));
const shadowMat = new THREE.ShaderMaterial({
  uniforms: { uOpacity: { value: 0.3 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv * 2.0 - 1.0; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: 'uniform float uOpacity; varying vec2 vUv; void main(){ gl_FragColor = vec4(0.1, 0.06, 0.14, pow(1.0 - smoothstep(0.0, 1.0, length(vUv)), 1.6) * uOpacity); }',
  transparent: true, depthWrite: false,
});

// ---------- the cast ----------
const zs = { speed: 0, phase: 0, t: 0, attack: 0 }, cs = { speed: 0, phase: 0, t: 0, carry: null, dig: false, air: false, swing: 0 };
const SETS = {
  crew: CREW.map((d, i) => ({ name: d.name, note: d.role, color: d.color, rig: crewRig(i), pose: (rig, root, w, t, out) => { cs.speed = w * 3.4; cs.phase = t * 7; cs.t = t + i; return crewPose(rig, root, cs, out); } })),
  dead: [11, 24, 37, 50, 63, 76].map((seed) => ({ name: 'Body', note: `#${seed}`, color: '#8a8f9a', rig: corpseRig(seed), pose: (rig, root, w, t, out) => rigPose(rig, root, REST_ROTS, out) })),
  zombies: ZOMBIES.map((d, i) => ({ name: d.name, note: ['walker', 'dragger', 'dog'][d.type], color: '#6f9a4a', rig: zombieRig(i), pose: (rig, root, w, t, out) => { zs.speed = w * d.speed; zs.phase = t * (d.type === 2 ? 11 : 5) + i; zs.t = t + i; return zombiePose(rig, root, zs, out); } })),
};
SETS.zombies.forEach((c, i) => { if (i >= 10) c.note = 'odd one'; });
SETS.dogs = SETS.zombies.filter((c) => c.note === 'dog');
SETS.walkers = SETS.zombies.filter((c) => c.note === 'walker' || c.note === 'dragger');
SETS.odd = SETS.zombies.filter((c) => c.note === 'odd one');
const pick = q.get('set') || 'all';
let cast = pick === 'all' ? [...SETS.crew, ...SETS.dead, ...SETS.zombies] : SETS[pick] || SETS.crew;
if (q.get('only') !== null) cast = [cast[+q.get('only')]];
const perRow = Math.min(cast.length, pick === 'all' ? 11 : 8), GAP = 1.5, ROW = 2.6;
const root = new THREE.Matrix4(), xf = new Float32Array(42), _p = new THREE.Vector3(), _q = new THREE.Quaternion(), _s = new THREE.Vector3(), _t = new THREE.Matrix4();
let tris = 0;
const t0 = performance.now();
for (const [i, c] of cast.entries()) {
  const row = Math.floor(i / perRow), col = i % perRow, n = Math.min(perRow, cast.length - row * perRow);
  c.home = new THREE.Vector3((col - (n - 1) / 2) * GAP, 0, -row * ROW);
  c.ch = new Character(c.rig.def, { fog: false });
  c.rest = c.rig.rest.map((r) => r.clone().divideScalar(c.rig.S));
  scene.add(c.ch.group);
  tris += c.ch.triangles;
  const sh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), shadowMat);
  sh.position.set(c.home.x, 0.006, c.home.z); sh.scale.setScalar(c.rig.belly * 3.2); sh.renderOrder = 1;
  scene.add(sh);
  const el = document.createElement('div');
  el.className = 'tag'; el.style.setProperty('--c', c.color);
  el.innerHTML = `<b>${c.name}</b><span>${c.note}</span>`;
  $('labels').appendChild(el);
  c.el = el;
}
const buildMs = performance.now() - t0, rows = Math.ceil(cast.length / perRow);
$('stats').textContent = `${cast.length} characters · ${Math.round(tris / cast.length).toLocaleString('en')} triangles each · sculpted in ${Math.round(buildMs)} ms`;

// ---------- look ----------
const MODES = { sheet: { bg: '#d8d4cf', ground: '#cdc8c4', day: 1, shadow: 0.26 }, night: { bg: '#2b2348', ground: '#342c50', day: 0, shadow: 0.5 } };
let mode = 'sheet';
function setMode(name) {
  mode = name;
  const m = MODES[name];
  scene.background.set(m.bg); groundMat.uniforms.uGround.value.set(m.ground); shadowMat.uniforms.uOpacity.value = m.shadow;
  DAY.value = m.day;
  document.documentElement.dataset.mode = name;
  $('mode').textContent = name === 'sheet' ? 'Night' : 'Model sheet';
}
const view = { yaw: 0, pitch: 0.08, dist: 1, target: new THREE.Vector3(0, 0.85, -((rows - 1) * ROW) / 2) };
const fit = () => Math.max(5 + rows * 2.2, (perRow * GAP * 0.56) / (Math.tan((camera.fov * Math.PI) / 360) * camera.aspect));
function placeCamera() {
  const d = fit() * view.dist, cp = Math.cos(view.pitch);
  camera.position.set(view.target.x + Math.sin(view.yaw) * cp * d, view.target.y + Math.sin(view.pitch) * d, view.target.z + Math.cos(view.yaw) * cp * d);
  camera.lookAt(view.target);
}
const canvas = renderer.domElement, pointers = new Map();
let pinch = 0;
canvas.addEventListener('pointerdown', (e) => { canvas.setPointerCapture(e.pointerId); pointers.set(e.pointerId, [e.clientX, e.clientY]); });
canvas.addEventListener('pointermove', (e) => {
  const p = pointers.get(e.pointerId);
  if (!p) return;
  const dx = e.clientX - p[0], dy = e.clientY - p[1];
  pointers.set(e.pointerId, [e.clientX, e.clientY]);
  if (pointers.size === 2) {
    const [a, b] = [...pointers.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]);
    if (pinch) view.dist = Math.max(0.12, Math.min(1.6, (view.dist * pinch) / d));
    pinch = d;
    return;
  }
  view.yaw -= dx * 0.006;
  view.pitch = Math.max(-0.05, Math.min(1.2, view.pitch + dy * 0.005));
});
const release = (e) => { pointers.delete(e.pointerId); pinch = 0; };
canvas.addEventListener('pointerup', release);
canvas.addEventListener('pointercancel', release);
canvas.addEventListener('wheel', (e) => { e.preventDefault(); view.dist = Math.max(0.12, Math.min(1.6, view.dist * Math.exp(e.deltaY * 0.001))); }, { passive: false });

const ui = { walk: false, turn: false, wire: false, walkK: 0, turnA: 0 };
const toggle = (id, key, fn) => { $(id).onclick = () => { ui[key] = !ui[key]; $(id).setAttribute('aria-pressed', ui[key]); fn?.(); }; $(id).setAttribute('aria-pressed', ui[key]); };
toggle('walk', 'walk');
toggle('turn', 'turn');
toggle('wire', 'wire', () => { for (const c of cast) c.ch.group.children[0].material.wireframe = ui.wire; });
$('mode').onclick = () => setMode(mode === 'sheet' ? 'night' : 'sheet');
addEventListener('resize', () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); });
setMode(q.get('mode') === 'night' ? 'night' : 'sheet');

let last = performance.now(), time = 0;
const fpsEl = $('fps'), perf = { n: 0, t0: last }, proj = new THREE.Vector3();
function tick(dt) {
  time += dt;
  ui.walkK += ((ui.walk ? 1 : 0) - ui.walkK) * Math.min(1, dt * 5);
  if (ui.turn) ui.turnA += dt * 0.7;
  const key = keyLight();
  for (const c of cast) {
    root.makeRotationY(ui.turnA).setPosition(c.home);
    c.pose(c.rig, root, ui.walkK, time, xf);
    for (let i = 0; i < 6; i++) {
      const o = i * 7;
      c.ch.parts[i].compose(_p.set(xf[o], xf[o + 1], xf[o + 2]), _q.set(xf[o + 3], xf[o + 4], xf[o + 5], xf[o + 6]), _s.setScalar(c.rig.S)).multiply(_t.makeTranslation(-c.rest[i].x, -c.rest[i].y, -c.rest[i].z));
    }
    const u = c.ch.uniforms;
    u.uLightDir.value.copy(key.dir); u.uLightCol.value.copy(key.lit).multiplyScalar(mode === 'sheet' ? 1.0 : 0.85); u.uShadeCol.value.copy(key.shade).multiplyScalar(mode === 'sheet' ? 1.25 : 1);
  }
}
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  tick(dt);
  placeCamera();
  for (const c of cast) {
    proj.set(c.home.x, 0, c.home.z + 0.55).project(camera);
    c.el.style.transform = `translate(-50%, 0) translate(${((proj.x * 0.5 + 0.5) * innerWidth).toFixed(1)}px, ${((-proj.y * 0.5 + 0.5) * innerHeight).toFixed(1)}px)`;
    c.el.style.display = proj.z < 1 && view.dist > 0.5 ? '' : 'none';
  }
  renderer.render(scene, camera);
  perf.n++;
  if (now - perf.t0 >= 1000) { fpsEl.textContent = `${Math.round((perf.n * 1000) / (now - perf.t0))} fps`; perf.n = 0; perf.t0 = now; }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
window.__sdf = { cast, view, ui, camera, tick, setMode };

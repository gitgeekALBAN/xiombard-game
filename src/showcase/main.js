import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { createSky } from '../shaders/sky.js';
import { toon, glowMat } from '../shaders/toon.js';
import { part, geo } from '../view/models/common.js';
import { buildBackdrop } from '../view/backdrop.js';
import { Post } from '../view/post.js';
import { PAL } from '../view/palette.js';
import { isTouchDevice } from '../touch.js';
import { rng } from '../shared/rng.js';
import { SplatCloud } from './splats.js';
import { Brush } from './brush.js';
import { PUPPETS } from './puppets.js';
import { Puppet, PART } from './rig.js';

// Puppet lineup: candidate looks for the bot team, built from Gaussian splats and shown on a little stage.
// Every puppet is six rigid parts and five joints; click one to drop it as a ragdoll.
const $ = (id) => document.getElementById(id);
const STAGE_Y = 0.16, PED_H = 0.14, PED_R = 0.56, GAP = 1.32;
const LAMPS = [[-3.45, 1.95, 1.05], [3.45, 1.95, 1.05]];

const renderer = new THREE.WebGLRenderer({ antialias: false });
renderer.setPixelRatio(Math.min(devicePixelRatio, isTouchDevice() ? 1.5 : 2));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.prepend(renderer.domElement);
const post = new Post(renderer, isTouchDevice() ? 'low' : 'high');
const scene = new THREE.Scene();
const fogColor = new THREE.Color('#2a2344');
scene.fog = new THREE.FogExp2(fogColor, 0.0145);
const camera = new THREE.PerspectiveCamera(38, innerWidth / innerHeight, 0.1, 1200);
const sky = createSky(fogColor);
scene.add(sky);
const backdrop = buildBackdrop(scene);

// ---------- stage ----------
const lawn = new THREE.Mesh(new THREE.CircleGeometry(46, 48).rotateX(-Math.PI / 2), toon('#2a3336', { mottle: 0.7, rim: 0 }));
scene.add(lawn);
scene.add(part(geo.BOX, toon(PAL.wood, { color2: PAL.plumDark, stripes: 2.4, axis: 2, mottle: 0.5 }), { pos: [0, STAGE_Y / 2, 0.1], scale: [7.6, STAGE_Y, 2.7], outline: 0.025 }));
PUPPETS.forEach((_, i) => {
  scene.add(part(geo.CYL, toon(PAL.stone, { gradColor: PAL.stoneDark, gradY: [-0.07, 0.05], mottle: 0.5 }), { pos: [(i - 2) * GAP, STAGE_Y + PED_H / 2, 0], scale: [PED_R, PED_H, PED_R], outline: 0.018 }));
});
const billboards = [];
for (const [x, y, z] of LAMPS) {
  scene.add(part(geo.CYL, toon(PAL.coal), { pos: [x, y / 2 - 0.1, z], scale: [0.035, y - 0.2, 0.035], outline: 0.012 }));
  scene.add(part(geo.CYL, toon(PAL.coal), { pos: [x, 0.05, z], scale: [0.14, 0.1, 0.14], outline: 0.012 }));
  scene.add(part(geo.BOX, toon(PAL.amber, { emissive: 1 }), { pos: [x, y, z], scale: [0.2, 0.26, 0.2], outline: 0.014 }));
  scene.add(part(new THREE.ConeGeometry(0.2, 0.16, 4), toon(PAL.coal), { pos: [x, y + 0.21, z], rot: [0, Math.PI / 4, 0], outline: 0.012 }));
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 2.4), glowMat('#ffb860', 0.8));
  glow.position.set(x, y, z);
  scene.add(glow);
  billboards.push(glow);
}

// ---------- physics ----------
const world = new CANNON.World({ gravity: new CANNON.Vec3(0, -12, 0) });
world.allowSleep = true;
world.solver.iterations = 14;
const mat = new CANNON.Material('puppet');
world.addContactMaterial(new CANNON.ContactMaterial(mat, mat, { friction: 0.5, restitution: 0.08 }));
const fixed = (shape, x, y, z) => {
  const b = new CANNON.Body({ mass: 0, material: mat, collisionFilterGroup: 1, collisionFilterMask: -1 });
  b.addShape(shape);
  b.position.set(x, y, z);
  world.addBody(b);
  return b;
};
fixed(new CANNON.Plane(), 0, 0, 0).quaternion.setFromEuler(-Math.PI / 2, 0, 0);
fixed(new CANNON.Box(new CANNON.Vec3(3.8, STAGE_Y / 2, 1.35)), 0, STAGE_Y / 2, 0.1);
PUPPETS.forEach((_, i) => fixed(new CANNON.Cylinder(PED_R, PED_R, PED_H, 16), (i - 2) * GAP, STAGE_Y + PED_H / 2, 0));

// ---------- puppets made of splats ----------
const cloud = new SplatCloud(PUPPETS.length * 6);
const counts = [];
PUPPETS.forEach((def, i) => {
  const before = cloud.n, base = i * 6;
  def.paint(new Brush(cloud, rng(101 + i * 17)), Object.fromEntries(Object.entries(PART).map(([k, p]) => [k, base + p])));
  counts.push(cloud.n - before);
});
scene.add(cloud.build());
cloud.material.uniforms.uLampPos.value.forEach((p, i) => p.set(...LAMPS[i]));
const puppets = PUPPETS.map((def, i) => new Puppet(def, i, cloud, world, mat, new THREE.Vector3((i - 2) * GAP, STAGE_Y + PED_H, 0), (2 - i) * 0.12));

const shadowMat = new THREE.ShaderMaterial({
  uniforms: { uOpacity: { value: 0.6 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv * 2.0 - 1.0; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: `uniform float uOpacity; varying vec2 vUv;
    void main(){ float r = length(vUv); gl_FragColor = vec4(0.027, 0.016, 0.05, pow(1.0 - smoothstep(0.0, 1.0, r), 1.7) * uOpacity); }`,
  transparent: true, depthWrite: false,
});
const shadows = puppets.map(() => {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), shadowMat);
  m.renderOrder = 1;
  scene.add(m);
  return m;
});
const floorAt = (x, z) => {
  for (let i = 0; i < puppets.length; i++) if (Math.hypot(x - (i - 2) * GAP, z) < PED_R) return STAGE_Y + PED_H;
  return Math.abs(x) < 3.8 && Math.abs(z - 0.1) < 1.35 ? STAGE_Y : 0;
};

// ---------- camera: drag to orbit, wheel or pinch to zoom ----------
const view = { yaw: 0, pitch: 0.1, dist: 1, target: new THREE.Vector3(0, 0.98, 0) };
const fit = () => Math.max(7.6, 4.35 / (Math.tan((camera.fov * Math.PI) / 360) * camera.aspect));
function placeCamera() {
  const d = fit() * view.dist, cp = Math.cos(view.pitch);
  camera.position.set(view.target.x + Math.sin(view.yaw) * cp * d, view.target.y + Math.sin(view.pitch) * d, view.target.z + Math.cos(view.yaw) * cp * d);
  camera.lookAt(view.target);
}
const canvas = renderer.domElement, pointers = new Map();
let moved = 0, pinch = 0;
canvas.addEventListener('pointerdown', (e) => { canvas.setPointerCapture(e.pointerId); pointers.set(e.pointerId, [e.clientX, e.clientY]); if (pointers.size === 1) moved = 0; });
canvas.addEventListener('pointermove', (e) => {
  const p = pointers.get(e.pointerId);
  if (!p) return;
  const dx = e.clientX - p[0], dy = e.clientY - p[1];
  pointers.set(e.pointerId, [e.clientX, e.clientY]);
  if (pointers.size === 2) {
    const [a, b] = [...pointers.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]);
    if (pinch) view.dist = Math.max(0.35, Math.min(1.6, (view.dist * pinch) / d));
    pinch = d; moved = 99;
    return;
  }
  moved += Math.abs(dx) + Math.abs(dy);
  view.yaw -= dx * 0.006;
  view.pitch = Math.max(-0.05, Math.min(1.1, view.pitch + dy * 0.005));
});
const release = (e) => {
  if (pointers.delete(e.pointerId) && pointers.size === 0 && moved < 6 && e.type === 'pointerup') poke(e.clientX, e.clientY);
  pinch = 0;
};
canvas.addEventListener('pointerup', release);
canvas.addEventListener('pointercancel', release);
canvas.addEventListener('wheel', (e) => { e.preventDefault(); view.dist = Math.max(0.35, Math.min(1.6, view.dist * Math.exp(e.deltaY * 0.001))); }, { passive: false });

// click a puppet: knock it off its pedestal, or help it up
const ray = new THREE.Raycaster(), hit = new THREE.Vector3(), ball = new THREE.Sphere();
function poke(x, y) {
  ray.setFromCamera(new THREE.Vector2((x / innerWidth) * 2 - 1, -(y / innerHeight) * 2 + 1), camera);
  let best = null, bestD = Infinity;
  for (const p of puppets) {
    ball.set(p.center, 0.55);
    if (ray.ray.intersectSphere(ball, hit)) { const d = hit.distanceTo(camera.position); if (d < bestD) { bestD = d; best = p; } }
  }
  if (!best) return;
  if (best.state === 'rag') best.rise();
  else best.flop(shove(ray.ray.direction));
}
// a pop upward plus a nudge along dir, gentle enough that puppets land on the stage
const shove = (dir) => new THREE.Vector3(dir.x * 1.5 + (Math.random() - 0.5) * 0.6, 2.3 + Math.random() * 0.8, dir.z * 1.5 + (Math.random() - 0.5) * 0.6);

// ---------- controls ----------
const ui = { walk: true, turn: false, walkK: 1, turnA: 0 };
$('drop').onclick = () => puppets.forEach((p, i) => setTimeout(() => p.flop(shove(new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.3))), i * 130));
$('up').onclick = () => puppets.forEach((p) => p.rise());
const toggle = (id, key) => { $(id).onclick = () => { ui[key] = !ui[key]; $(id).setAttribute('aria-pressed', ui[key]); }; $(id).setAttribute('aria-pressed', ui[key]); };
toggle('walk', 'walk');
toggle('turn', 'turn');
$('size').oninput = (e) => { cloud.material.uniforms.uSize.value = +e.target.value; };
$('soft').oninput = (e) => { cloud.material.uniforms.uSharp.value = +e.target.value; };
$('stats').textContent = `${cloud.n.toLocaleString('en-US')} splats · 6 parts and 5 joints per puppet`;

const labels = PUPPETS.map((def, i) => {
  const el = document.createElement('div');
  el.className = 'tag';
  el.style.setProperty('--c', def.color);
  el.innerHTML = `<b>${def.name}</b><span>${def.role} · ${(counts[i] / 1000).toFixed(1)}k</span>`;
  $('labels').appendChild(el);
  return el;
});

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

// ---------- loop ----------
let last = performance.now(), time = 0, acc = 0;
const fpsEl = $('fps'), perf = { n: 0, t0: last };
const size = new THREE.Vector2(), proj = new THREE.Vector3();
// advance physics and puppets by dt (also used by scripted checks, which cannot wait for real time)
function tick(dt) {
  time += dt;
  acc = Math.min(acc + dt, 4 / 60);
  while (acc >= 1 / 60) { world.step(1 / 60); acc -= 1 / 60; }
  ui.walkK += ((ui.walk ? 1 : 0) - ui.walkK) * Math.min(1, dt * 5);
  if (ui.turn) ui.turnA += dt * 0.7;
  for (const p of puppets) p.update(dt, time, ui.walkK, ui.turnA);
}
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  tick(dt);
  placeCamera();
  camera.updateMatrixWorld();
  puppets.forEach((p, i) => {
    const c = p.center, y = floorAt(c.x, c.z), s = 0.95 + Math.max(0, c.y - y - 0.5) * 0.5;
    shadows[i].position.set(c.x, y + 0.012, c.z);
    shadows[i].scale.set(s, 1, s);
    proj.set(p.home.x, STAGE_Y, 1.42).project(camera);
    labels[i].style.transform = `translate(-50%, 0) translate(${((proj.x * 0.5 + 0.5) * innerWidth).toFixed(1)}px, ${((-proj.y * 0.5 + 0.5) * innerHeight).toFixed(1)}px)`;
    labels[i].style.display = proj.z < 1 ? '' : 'none';
  });
  renderer.getDrawingBufferSize(size);
  cloud.material.uniforms.uViewport.value.copy(size);
  cloud.sort(camera);
  for (const b of billboards) b.quaternion.copy(camera.quaternion);
  sky.position.copy(camera.position);
  sky.material.uniforms.uTime.value = time;
  backdrop.update(time, dt, camera);
  post.render(scene, camera, time);
  perf.n++;
  if (now - perf.t0 >= 1000) { fpsEl.textContent = `${Math.round((perf.n * 1000) / (now - perf.t0))} fps`; perf.n = 0; perf.t0 = now; }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
window.__show = { puppets, cloud, view, ui, camera, post, tick, shove };

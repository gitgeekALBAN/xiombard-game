import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { isTouchDevice } from '../touch.js';
import { Puppet } from '../showcase/rig.js';
import { SdfCharacter } from './shader.js';
import { TEAM } from './team.js';

// Shader crew: five characters with no meshes and no textures. Each one is a signed distance function raymarched
// in a box, posed by the same six-part skeleton and ragdoll as the splat puppets.
const $ = (id) => document.getElementById(id);
const GAP = 1.16;
const MODES = {
  sheet: { bg: '#d8d4cf', ground: '#cdc8c4', light: [-0.45, 0.75, 0.5], lightCol: [1, 0.99, 0.97], shade: [0.5, 0.45, 0.66], rim: [0, 0, 0], ink: '#231628', shadow: 0.26 },
  night: { bg: '#2b2348', ground: '#342c50', light: [-0.5, 0.7, 0.45], lightCol: [0.86, 0.86, 1.05], shade: [0.36, 0.31, 0.56], rim: [0.95, 0.5, 0.18], ink: '#120b1c', shadow: 0.5 },
};

const renderer = new THREE.WebGLRenderer({ antialias: false });
renderer.setPixelRatio(Math.min(devicePixelRatio, isTouchDevice() ? 1.5 : 2));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.prepend(renderer.domElement);
const scene = new THREE.Scene();
scene.background = new THREE.Color();
const camera = new THREE.PerspectiveCamera(30, innerWidth / innerHeight, 0.1, 200);

// ---------- backdrop: a floor that fades into the paper, guide lines for the sheet, a moon for the night ----------
const groundMat = new THREE.ShaderMaterial({
  uniforms: { uGround: { value: new THREE.Color() }, uBg: { value: scene.background } },
  vertexShader: 'varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
  fragmentShader: `uniform vec3 uGround, uBg; varying vec3 vW;
    void main(){ gl_FragColor = vec4(mix(uGround, uBg, smoothstep(3.0, 11.0, length(vW.xz))), 1.0);
      #include <colorspace_fragment>
    }`,
});
scene.add(new THREE.Mesh(new THREE.CircleGeometry(40, 48).rotateX(-Math.PI / 2), groundMat));
const guides = new THREE.Mesh(new THREE.PlaneGeometry(7.4, 2.2), new THREE.ShaderMaterial({
  vertexShader: 'varying vec2 vP; void main(){ vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: `varying vec2 vP;
    void main(){ float y = vP.y + 1.1, d = abs(fract(y / 0.5 + 0.5) - 0.5) * 0.5;
      float a = smoothstep(0.006, 0.002, d) * smoothstep(3.7, 3.0, abs(vP.x)) * 0.32; if (a < 0.01) discard; gl_FragColor = vec4(0.25, 0.2, 0.28, a); }`,
  transparent: true, depthWrite: false,
}));
guides.position.set(0, 1.1, -1.3);
scene.add(guides);
const moon = new THREE.Mesh(new THREE.CircleGeometry(1.5, 48), new THREE.MeshBasicMaterial({ color: '#efe9ff', fog: false }));
moon.position.set(6.5, 5.6, -16);
scene.add(moon);
const shadowMat = new THREE.ShaderMaterial({
  uniforms: { uOpacity: { value: 0.3 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv * 2.0 - 1.0; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: 'uniform float uOpacity; varying vec2 vUv; void main(){ gl_FragColor = vec4(0.1, 0.06, 0.14, pow(1.0 - smoothstep(0.0, 1.0, length(vUv)), 1.6) * uOpacity); }',
  transparent: true, depthWrite: false,
});

// ---------- physics for the ragdolls ----------
const world = new CANNON.World({ gravity: new CANNON.Vec3(0, -12, 0) });
world.allowSleep = true;
world.solver.iterations = 14;
const mat = new CANNON.Material('puppet');
world.addContactMaterial(new CANNON.ContactMaterial(mat, mat, { friction: 0.5, restitution: 0.08 }));
const floor = new CANNON.Body({ mass: 0, material: mat, collisionFilterGroup: 1, collisionFilterMask: -1 });
floor.addShape(new CANNON.Plane());
floor.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
world.addBody(floor);

// ---------- the crew ----------
const frames = { parts: Array.from({ length: TEAM.length * 6 }, () => new THREE.Matrix4()) }; // stands in for the splat cloud
const puppets = TEAM.map((def, i) => new Puppet(def, i, frames, world, mat, new THREE.Vector3((i - 2) * GAP, 0, 0), (2 - i) * 0.1));
const crew = TEAM.map((def) => { const c = new SdfCharacter(def, camera); scene.add(c.mesh); return c; });
const shadows = TEAM.map((def) => {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), shadowMat);
  m.userData.size = def.look.bean[1] * 3.4;
  m.renderOrder = 1;
  scene.add(m);
  return m;
});

let mode = 'sheet';
function setMode(name) {
  mode = name;
  const m = MODES[name];
  scene.background.set(m.bg);
  groundMat.uniforms.uGround.value.set(m.ground);
  guides.visible = name === 'sheet';
  moon.visible = name === 'night';
  shadowMat.uniforms.uOpacity.value = m.shadow;
  for (const c of crew) {
    const u = c.material.uniforms;
    u.uLightDir.value.set(...m.light).normalize();
    u.uLightCol.value.setRGB(...m.lightCol);
    u.uShadeCol.value.setRGB(...m.shade);
    u.uRimDir.value.set(0.85, 0.25, -0.3).normalize();
    u.uRimCol.value.setRGB(...m.rim);
    u.uInk.value.set(m.ink);
  }
  document.documentElement.dataset.mode = name;
  $('mode').textContent = name === 'sheet' ? 'Night' : 'Model sheet';
}

// ---------- camera: drag to orbit, wheel or pinch to zoom ----------
const view = { yaw: 0, pitch: 0.06, dist: 1, target: new THREE.Vector3(0, 0.82, 0) };
const fit = () => Math.max(6.2, 3.5 / (Math.tan((camera.fov * Math.PI) / 360) * camera.aspect));
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
    if (pinch) view.dist = Math.max(0.3, Math.min(1.6, (view.dist * pinch) / d));
    pinch = d; moved = 99;
    return;
  }
  moved += Math.abs(dx) + Math.abs(dy);
  view.yaw -= dx * 0.006;
  view.pitch = Math.max(-0.02, Math.min(1.1, view.pitch + dy * 0.005));
});
const release = (e) => {
  if (pointers.delete(e.pointerId) && pointers.size === 0 && moved < 6 && e.type === 'pointerup') poke(e.clientX, e.clientY);
  pinch = 0;
};
canvas.addEventListener('pointerup', release);
canvas.addEventListener('pointercancel', release);
canvas.addEventListener('wheel', (e) => { e.preventDefault(); view.dist = Math.max(0.3, Math.min(1.6, view.dist * Math.exp(e.deltaY * 0.001))); }, { passive: false });

// click a character: knock it over, or help it up
const ray = new THREE.Raycaster(), hit = new THREE.Vector3(), ball = new THREE.Sphere();
function poke(x, y) {
  ray.setFromCamera(new THREE.Vector2((x / innerWidth) * 2 - 1, -(y / innerHeight) * 2 + 1), camera);
  let best = null, bestD = Infinity;
  for (const p of puppets) {
    ball.set(p.center, 0.5);
    if (ray.ray.intersectSphere(ball, hit)) { const d = hit.distanceTo(camera.position); if (d < bestD) { bestD = d; best = p; } }
  }
  if (!best) return;
  if (best.state === 'rag') best.rise();
  else best.flop(shove(ray.ray.direction));
}
const shove = (dir) => new THREE.Vector3(dir.x * 1.5 + (Math.random() - 0.5) * 0.6, 2.3 + Math.random() * 0.8, dir.z * 1.5 + (Math.random() - 0.5) * 0.6);

// ---------- controls ----------
const ui = { walk: false, turn: false, walkK: 0, turnA: 0 };
$('drop').onclick = () => puppets.forEach((p, i) => setTimeout(() => p.flop(shove(new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.3))), i * 130));
$('up').onclick = () => puppets.forEach((p) => p.rise());
const toggle = (id, key) => { $(id).onclick = () => { ui[key] = !ui[key]; $(id).setAttribute('aria-pressed', ui[key]); }; $(id).setAttribute('aria-pressed', ui[key]); };
toggle('walk', 'walk');
toggle('turn', 'turn');
$('mode').onclick = () => setMode(mode === 'sheet' ? 'night' : 'sheet');
$('ink').oninput = (e) => { for (const c of crew) c.material.uniforms.uLine.value = +e.target.value; };
$('stats').textContent = '0 meshes · 0 textures · one fragment shader per character';
const labels = TEAM.map((def) => {
  const el = document.createElement('div');
  el.className = 'tag';
  el.style.setProperty('--c', def.color);
  el.innerHTML = `<b>${def.name}</b><span>${def.role}</span>`;
  $('labels').appendChild(el);
  return el;
});
addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
setMode(new URLSearchParams(location.search).get('mode') === 'night' ? 'night' : 'sheet');

// ---------- loop ----------
let last = performance.now(), time = 0, acc = 0;
const fpsEl = $('fps'), perf = { n: 0, t0: last };
const size = new THREE.Vector2(), proj = new THREE.Vector3();
// advance physics and characters by dt (also used by scripted checks, which cannot wait for real time)
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
  renderer.getDrawingBufferSize(size);
  const pix = (2 * Math.tan((camera.fov * Math.PI) / 360)) / size.y;
  puppets.forEach((p, i) => {
    crew[i].update(frames.parts, i * 6, p.center);
    crew[i].material.uniforms.uPix.value = pix;
    const c = p.center, s = shadows[i].userData.size * (1 + Math.max(0, c.y - 0.9) * 0.4);
    shadows[i].position.set(c.x, 0.006, c.z);
    shadows[i].scale.set(s, 1, s);
    proj.set(p.home.x, 0, 0.75).project(camera);
    labels[i].style.transform = `translate(-50%, 0) translate(${((proj.x * 0.5 + 0.5) * innerWidth).toFixed(1)}px, ${((-proj.y * 0.5 + 0.5) * innerHeight).toFixed(1)}px)`;
    labels[i].style.display = proj.z < 1 ? '' : 'none';
  });
  renderer.render(scene, camera);
  perf.n++;
  if (now - perf.t0 >= 1000) { fpsEl.textContent = `${Math.round((perf.n * 1000) / (now - perf.t0))} fps`; perf.n = 0; perf.t0 = now; }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
window.__sdf = { puppets, crew, view, ui, camera, tick, shove, setMode };

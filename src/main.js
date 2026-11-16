import * as THREE from 'three';
import { createSky } from './shaders/sky.js';
import { createTerrain, heightAt } from './shaders/terrain.js';
import { createCrystalMaterial } from './shaders/crystal.js';

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.1, 1000);
camera.rotation.order = 'YXZ';

const sky = createSky();
const terrain = createTerrain();
scene.add(sky, terrain);

// Collectible crystals
const crystalMat = createCrystalMaterial();
const crystalGeo = new THREE.OctahedronGeometry(1.2, 0);
const crystals = [];
function spawnCrystal() {
  const m = new THREE.Mesh(crystalGeo, crystalMat);
  const a = Math.random() * Math.PI * 2, r = 15 + Math.random() * 100;
  m.position.set(Math.cos(a) * r, 0, Math.sin(a) * r);
  m.userData.phase = Math.random() * 10;
  crystals.push(m);
  scene.add(m);
}
for (let i = 0; i < 24; i++) spawnCrystal();

// Input
const keys = new Set();
addEventListener('keydown', (e) => keys.add(e.code));
addEventListener('keyup', (e) => keys.delete(e.code));
let yaw = 0, pitch = -0.1, playing = false, score = 0;
const sens = 0.0025;
addEventListener('mousemove', (e) => {
  if (!playing) return;
  if (document.pointerLockElement || e.buttons) {
    yaw -= e.movementX * sens;
    pitch = Math.max(-1.3, Math.min(1.3, pitch - e.movementY * sens));
  }
});

const ui = document.getElementById('ui');
const hud = document.getElementById('hud');
const scoreEl = document.getElementById('score');
document.getElementById('play').addEventListener('click', () => {
  playing = true;
  ui.classList.add('hidden');
  hud.classList.add('visible');
  renderer.domElement.requestPointerLock?.();
});

// Loop
const pos = new THREE.Vector3(0, 0, 0);
const clock = new THREE.Clock();
function frame() {
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;
  sky.material.uniforms.uTime.value = t;
  terrain.material.uniforms.uTime.value = t;
  crystalMat.uniforms.uTime.value = t;

  if (playing) {
    const speed = (keys.has('ShiftLeft') ? 28 : 14) * dt;
    const fwd = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw));
    const right = new THREE.Vector3(-fwd.z, 0, fwd.x);
    if (keys.has('KeyW')) pos.addScaledVector(fwd, speed);
    if (keys.has('KeyS')) pos.addScaledVector(fwd, -speed);
    if (keys.has('KeyD')) pos.addScaledVector(right, speed);
    if (keys.has('KeyA')) pos.addScaledVector(right, -speed);
  } else {
    // attract-mode camera drift on the title screen
    yaw = t * 0.05;
  }
  pos.y = heightAt(pos.x, pos.z) + 3;
  camera.position.copy(pos);
  camera.rotation.set(pitch, yaw, 0);
  sky.position.copy(camera.position);

  for (const c of crystals) {
    c.rotation.y = t + c.userData.phase;
    c.position.y = heightAt(c.position.x, c.position.z) + 2.5 + Math.sin(t * 2 + c.userData.phase) * 0.4;
    if (playing && c.visible && c.position.distanceTo(pos) < 3) {
      c.visible = false;
      scoreEl.textContent = ++score;
    }
  }

  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
frame();

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

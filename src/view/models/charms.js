import * as THREE from 'three';
import { RITES } from '../../shared/layout.js';

// The graveyard's own charms for the blessing (see RITES in shared/layout.js), drawn with canvas 2D paths: on the
// delivery notes, on the plaques the crew hold up at the chapel, and in the chapel's charm rack. They are invented for
// this game on purpose: a moth, a snail, a key and a moon in a teacup. No real religion's symbols.
// drawCharm(g, id, cx, cy, s, ink): s is the size of the charm's box in pixels.
export function drawCharm(g, id, cx, cy, s, ink = '#231d33') {
  g.save();
  g.translate(cx, cy);
  g.scale(s / 100, s / 100);
  g.strokeStyle = ink; g.fillStyle = ink; g.lineWidth = 6; g.lineCap = 'round'; g.lineJoin = 'round';
  const path = (f) => { g.beginPath(); f(); };
  if (id === 'moth') {
    // body, four wings with eye spots, two curled feelers
    path(() => g.ellipse(0, 4, 7, 26, 0, 0, Math.PI * 2)); g.fill();
    for (const sx of [-1, 1]) {
      path(() => { g.moveTo(0, -8); g.bezierCurveTo(sx * 48, -46, sx * 52, 4, sx * 4, 2); }); g.stroke();
      path(() => { g.moveTo(0, 8); g.bezierCurveTo(sx * 40, 10, sx * 34, 44, sx * 3, 22); }); g.stroke();
      path(() => g.arc(sx * 26, -16, 6, 0, Math.PI * 2)); g.fill();
      path(() => { g.moveTo(sx * 3, -20); g.quadraticCurveTo(sx * 10, -40, sx * 20, -38); g.arc(sx * 20, -42, 4, Math.PI / 2, Math.PI * 2.4 * sx); }); g.stroke();
    }
  } else if (id === 'snail') {
    // a spiral shell on a long soft foot with two eye stalks
    path(() => { for (let a = 0; a < Math.PI * 5; a += 0.15) { const r = 3 + a * 2.7; const x = -6 + Math.cos(a) * r, y = -6 + Math.sin(a) * r; a === 0 ? g.moveTo(x, y) : g.lineTo(x, y); } }); g.stroke();
    path(() => { g.moveTo(-44, 32); g.quadraticCurveTo(10, 40, 44, 30); g.quadraticCurveTo(48, 14, 34, 12); }); g.stroke();
    path(() => { g.moveTo(36, 14); g.lineTo(42, -12); g.moveTo(32, 14); g.lineTo(28, -10); }); g.stroke();
    for (const [x, y] of [[42, -14], [28, -12]]) { path(() => g.arc(x, y, 5, 0, Math.PI * 2)); g.fill(); }
  } else if (id === 'key') {
    // a skull-bow key: round bow with two eye holes, a long shank, three crooked teeth
    path(() => g.arc(0, -26, 22, 0, Math.PI * 2)); g.stroke();
    for (const sx of [-1, 1]) { path(() => g.arc(sx * 8, -28, 5, 0, Math.PI * 2)); g.fill(); }
    path(() => { g.moveTo(-6, -14); g.lineTo(0, -10); g.lineTo(6, -14); }); g.stroke();
    path(() => { g.moveTo(0, -4); g.lineTo(0, 44); g.moveTo(0, 20); g.lineTo(14, 22); g.moveTo(0, 30); g.lineTo(18, 30); g.moveTo(0, 40); g.lineTo(12, 44); }); g.stroke();
  } else if (id === 'teacup') {
    // a crescent moon sitting in a teacup, steam curls above
    path(() => { g.moveTo(-34, 6); g.lineTo(34, 6); g.quadraticCurveTo(30, 40, 0, 40); g.quadraticCurveTo(-30, 40, -34, 6); }); g.stroke();
    path(() => g.arc(40, 18, 10, -Math.PI / 2, Math.PI / 2)); g.stroke();
    path(() => { g.moveTo(-26, 46); g.lineTo(26, 46); }); g.stroke();
    path(() => { g.arc(-4, -14, 18, Math.PI * 0.45, Math.PI * 1.75); g.arc(4, -18, 13, Math.PI * 1.65, Math.PI * 0.55, true); g.closePath(); }); g.fill();
    for (const x of [16, 28]) { path(() => { g.moveTo(x, -6); g.quadraticCurveTo(x + 8, -16, x, -26); g.quadraticCurveTo(x - 8, -36, x + 2, -44); }); g.stroke(); }
  }
  g.restore();
}

// A charm's face: a bone-white disc with an ink ring and the charm painted on it (one canvas per charm, made once).
const faces = new Map();
export function charmTexture(id) {
  if (faces.has(id)) return faces.get(id);
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  g.fillStyle = '#efe6d0'; g.beginPath(); g.arc(64, 64, 62, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#7a5f4a'; g.lineWidth = 7; g.beginPath(); g.arc(64, 64, 57, 0, Math.PI * 2); g.stroke();
  drawCharm(g, id, 64, 66, 92);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  faces.set(id, tex);
  return tex;
}

// The chapel's charms as held: a stack of four discs fanned in the right mitten, the one in use in front. Picking
// another (wheel, keys, a tap) shuffles the stack: the front disc slides to the back and the chosen one comes forward.
// The stack sits on the origin (the mitten), discs facing +z. userData.setCharm(id) picks, userData.update(dt) animates.
// Materials: each face uses the signs' settings (map, alpha test, fog); the rims are plain wood.
const DISC = new THREE.CylinderGeometry(0.1, 0.1, 0.016, 22).rotateX(Math.PI / 2);
const RIM = new THREE.TorusGeometry(0.1, 0.008, 6, 22);
const wood = new THREE.MeshBasicMaterial({ color: '#5a3a2a', fog: true });
export function buildCharmStack() {
  const g = new THREE.Group();
  const discs = RITES.map((r) => {
    const d = new THREE.Group();
    d.add(new THREE.Mesh(DISC, new THREE.MeshBasicMaterial({ map: charmTexture(r.id), alphaTest: 0.5, fog: true })), new THREE.Mesh(RIM, wood));
    g.add(d);
    return d;
  });
  let front = 0;
  const slot = (k, out) => out.set(0.028 * k, 0.11 - 0.022 * k, 0.03 - 0.022 * k); // fanned back and to the side
  discs.forEach((d, i) => { slot(i, d.position); d.rotation.z = -0.16 * i; });
  g.userData.setCharm = (id) => { const i = RITES.findIndex((r) => r.id === id); if (i >= 0) front = i; };
  const _p = new THREE.Vector3();
  g.userData.update = (dt) => {
    const k = Math.min(1, dt * 12);
    discs.forEach((d, i) => {
      const n = (i - front + discs.length) % discs.length; // place in the stack: 0 in front
      slot(n, _p);
      d.position.lerp(_p, k);
      d.rotation.z += (-0.16 * n - d.rotation.z) * k;
      d.scale.setScalar(1 - 0.06 * n);
    });
  };
  return g;
}

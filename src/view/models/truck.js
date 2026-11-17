import * as THREE from 'three';
import { toon, glowMat } from '../../shaders/toon.js';
import { TRUCK } from '../../shared/layout.js';
import { SPH, CYL, BOX, part } from './common.js';

// Wobbly little hearse-truck. Faces -X, open bed at +X.
export function buildTruck() {
  const g = new THREE.Group();
  const body = toon('#4b2c5e');
  const trim = toon('#d8cdb8');
  const box = (b, mat, grow = 0) => part(BOX, mat, { pos: b.c, scale: [b.h[0] * 2 + grow, b.h[1] * 2 + grow, b.h[2] * 2 + grow], outline: 0.025 });
  const [hood, cab, bed, w1, w2] = TRUCK.boxes;
  g.add(box(hood, body));
  g.add(part(SPH, body, { pos: [-2.5, 1.38, 0], scale: [0.55, 0.18, 0.88] }));
  g.add(box(cab, body));
  g.add(part(SPH, body, { pos: [-1.3, 2.38, 0], scale: [0.78, 0.22, 1.02] }));
  g.add(box(bed, toon('#3a2340')));
  g.add(box(w1, toon('#5a3a6e', { color2: '#3a2348', stripes: 5 })));
  g.add(box(w2, toon('#5a3a6e', { color2: '#3a2348', stripes: 5 })));
  // windows
  for (const z of [-1.005, 1.005]) g.add(part(BOX, toon('#2e3f66', { emissive: 0.35 }), { pos: [-1.35, 1.85, z], scale: [0.9, 0.5, 0.02], outline: 0 }));
  g.add(part(BOX, toon('#2e3f66', { emissive: 0.35 }), { pos: [-2.005, 1.85, 0], scale: [0.02, 0.5, 1.6], outline: 0 }));
  // grille, bumper, skull ornament, headlights
  g.add(part(BOX, trim, { pos: [-3.02, 0.85, 0], scale: [0.06, 0.6, 1.4] }));
  g.add(part(BOX, trim, { pos: [-3.1, 0.4, 0], scale: [0.15, 0.15, 2.0] }));
  g.add(part(SPH, toon('#f2ecdc'), { pos: [-2.85, 1.55, 0], scale: [0.14, 0.15, 0.13] }));
  for (const z of [-0.6, 0.6]) {
    g.add(part(SPH, toon('#ffe9a8', { emissive: 1 }), { pos: [-3.02, 1.1, z], scale: [0.08, 0.16, 0.16] }));
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.4), glowMat('#ffd890', 0.7));
    glow.position.set(-3.1, 1.1, z);
    glow.userData.billboard = true;
    g.add(glow);
  }
  // wheels
  const wheels = [];
  for (const [x, z] of [[-2.2, 1.0], [-2.2, -1.0], [2.0, 1.0], [2.0, -1.0]]) {
    const w = new THREE.Group();
    w.position.set(x, 0.5, z);
    w.add(part(CYL, toon('#15111c'), { rot: [Math.PI / 2, 0, 0], scale: [0.5, 0.32, 0.5] }));
    w.add(part(CYL, toon('#e8e0d0'), { rot: [Math.PI / 2, 0, 0], scale: [0.26, 0.34, 0.26], outline: 0 }));
    w.add(part(BOX, toon('#15111c'), { scale: [0.42, 0.06, 0.36], outline: 0 }));
    g.add(w);
    wheels.push(w);
    g.add(part(SPH, body, { pos: [x, 0.95, z * 1.02], scale: [0.62, 0.3, 0.2] })); // fenders
  }
  // tailgate (opens on delivery)
  const gate = new THREE.Group();
  gate.position.set(3.0, 0.9, 0);
  gate.add(part(BOX, toon('#5a3a6e', { color2: '#3a2348', stripes: 5 }), { pos: [0, 0.12, 0], scale: [0.08, 0.24, 1.9] }));
  g.add(gate);
  g.userData = { wheels, gate };
  return [g];
}

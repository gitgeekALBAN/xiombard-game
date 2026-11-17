import * as THREE from 'three';

// One skeleton for every character (gravediggers and corpses).
// Rest pose: feet at the origin, facing +Z, units in meters.
// c = part center, j = joint pivot to the parent, size = physics box, r = physics sphere.
// Index order is part of the network format — do not reorder.
export const PARTS = [
  { name: 'pelvis', parent: -1, size: [0.36, 0.24, 0.24], c: [0, 0.95, 0], j: [0, 0.95, 0], mass: 0.18 },
  { name: 'chest', parent: 0, size: [0.46, 0.44, 0.28], c: [0, 1.28, 0], j: [0, 1.07, 0], mass: 0.24, cone: 0.35, up: true },
  { name: 'head', parent: 1, r: 0.25, c: [0, 1.78, 0], j: [0, 1.52, 0], mass: 0.1, cone: 0.55, up: true },
  { name: 'uarmL', parent: 1, size: [0.13, 0.34, 0.13], c: [0.31, 1.3, 0], j: [0.31, 1.46, 0], mass: 0.05, cone: 1.4 },
  { name: 'farmL', parent: 3, size: [0.12, 0.34, 0.12], c: [0.31, 0.97, 0], j: [0.31, 1.13, 0], mass: 0.04, cone: 1.1 },
  { name: 'uarmR', parent: 1, size: [0.13, 0.34, 0.13], c: [-0.31, 1.3, 0], j: [-0.31, 1.46, 0], mass: 0.05, cone: 1.4 },
  { name: 'farmR', parent: 5, size: [0.12, 0.34, 0.12], c: [-0.31, 0.97, 0], j: [-0.31, 1.13, 0], mass: 0.04, cone: 1.1 },
  { name: 'thighL', parent: 0, size: [0.15, 0.4, 0.15], c: [0.11, 0.64, 0], j: [0.11, 0.84, 0], mass: 0.08, cone: 1.0 },
  { name: 'shinL', parent: 7, size: [0.14, 0.4, 0.14], c: [0.11, 0.24, 0], j: [0.11, 0.44, 0], mass: 0.06, cone: 0.9 },
  { name: 'thighR', parent: 0, size: [0.15, 0.4, 0.15], c: [-0.11, 0.64, 0], j: [-0.11, 0.84, 0], mass: 0.08, cone: 1.0 },
  { name: 'shinR', parent: 9, size: [0.14, 0.4, 0.14], c: [-0.11, 0.24, 0], j: [-0.11, 0.44, 0], mass: 0.06, cone: 0.9 },
];
export const NPARTS = PARTS.length;
export const P = Object.fromEntries(PARTS.map((p, i) => [p.name, i]));

const _m = PARTS.map(() => new THREE.Matrix4());
const _rot = new THREE.Matrix4(), _a = new THREE.Matrix4(), _b = new THREE.Matrix4();
const _e = new THREE.Euler(), _v = new THREE.Vector3(), _q = new THREE.Quaternion();

// Forward kinematics: root matrix + per-part local euler rotations → world transforms.
// Writes 7 floats per part (px,py,pz,qx,qy,qz,qw) into `out` starting at `off`.
export function fk(root, rots, out, off = 0) {
  for (let i = 0; i < NPARTS; i++) {
    const part = PARTS[i], r = rots[i], j = part.j;
    _e.set(r[0], r[1], r[2], 'XYZ');
    _rot.makeRotationFromEuler(_e);
    _a.makeTranslation(j[0], j[1], j[2]).multiply(_rot).multiply(_b.makeTranslation(-j[0], -j[1], -j[2]));
    if (part.parent < 0) _m[i].multiplyMatrices(root, _a);
    else _m[i].multiplyMatrices(_m[part.parent], _a);
    _v.fromArray(part.c).applyMatrix4(_m[i]);
    _q.setFromRotationMatrix(_m[i]);
    const o = off + i * 7;
    out[o] = _v.x; out[o + 1] = _v.y; out[o + 2] = _v.z;
    out[o + 3] = _q.x; out[o + 4] = _q.y; out[o + 5] = _q.z; out[o + 6] = _q.w;
  }
  return out;
}

export const restRots = () => PARTS.map(() => [0, 0, 0]);

// Procedural gravedigger animation. s = {speed, phase, t, carry, dig, air}
export function animRots(s, rots = restRots()) {
  const k = Math.min(s.speed / 4, 1.4), ph = s.phase, t = s.t;
  for (const r of rots) r[0] = r[1] = r[2] = 0;
  const swing = Math.sin(ph);
  rots[P.chest][0] = 0.08 * k + Math.sin(t * 1.7) * 0.02;
  rots[P.chest][1] = swing * 0.12 * k;
  rots[P.head][0] = -0.08 * k;
  rots[P.head][2] = Math.sin(t * 1.3) * 0.06;
  rots[P.thighL][0] = swing * 0.75 * k;
  rots[P.thighR][0] = -swing * 0.75 * k;
  rots[P.shinL][0] = Math.max(0, Math.sin(ph + 1.3)) * 1.1 * k;
  rots[P.shinR][0] = Math.max(0, Math.sin(ph + 1.3 + Math.PI)) * 1.1 * k;
  rots[P.uarmL][0] = -swing * 0.7 * k; rots[P.uarmL][2] = 0.14;
  rots[P.uarmR][0] = swing * 0.7 * k; rots[P.uarmR][2] = -0.14;
  rots[P.farmL][0] = -0.35 - 0.3 * k; rots[P.farmR][0] = -0.35 - 0.3 * k;
  if (s.carry) {
    const low = s.carry === 'coffin';
    rots[P.uarmL][0] = rots[P.uarmR][0] = low ? -0.45 : -1.3;
    rots[P.uarmL][2] = 0.05; rots[P.uarmR][2] = -0.05;
    rots[P.farmL][0] = rots[P.farmR][0] = low ? -0.2 : -0.25;
    rots[P.chest][0] += low ? 0.35 : -0.08;
  }
  if (s.dig) {
    const c = Math.sin(t * 7);
    rots[P.chest][0] = 0.45 + c * 0.2;
    rots[P.uarmL][0] = rots[P.uarmR][0] = -0.6 + c * 0.55;
    rots[P.farmL][0] = rots[P.farmR][0] = -0.7;
    rots[P.uarmL][2] = -0.25; rots[P.uarmR][2] = 0.25;
    rots[P.thighL][0] = -0.35; rots[P.shinL][0] = 0.5;
    rots[P.thighR][0] = 0.15; rots[P.shinR][0] = 0.2;
  }
  if (s.air) {
    rots[P.thighL][0] = -0.6; rots[P.shinL][0] = 1.0;
    rots[P.thighR][0] = -0.2; rots[P.shinR][0] = 0.6;
    if (!s.carry) { rots[P.uarmL][2] = 1.2; rots[P.uarmR][2] = -1.2; }
  }
  return rots;
}

// A limp, slightly sprawled pose for freshly delivered corpses.
export function limpRots(r) {
  const rots = restRots();
  rots[P.uarmL][2] = r.range(0.2, 1.0); rots[P.uarmR][2] = -r.range(0.2, 1.0);
  rots[P.farmL][0] = -r.range(0, 0.8); rots[P.farmR][0] = -r.range(0, 0.8);
  rots[P.thighL][2] = r.range(0, 0.3); rots[P.thighR][2] = -r.range(0, 0.3);
  rots[P.head][1] = r.range(-0.5, 0.5);
  return rots;
}

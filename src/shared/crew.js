import * as THREE from 'three';

// The digging crew: one source of truth for how each digger looks (the SDF shader reads these numbers),
// how it is posed (six rigid parts) and what its ragdoll is made of (the simulation reads the same numbers).
// Rest pose: feet on y = 0, facing +Z, +X is the character's left, arms held out in a relaxed A-pose.
//   bean      [belly y, belly radius, neck y, neck radius]   the body is one bean: two round cones
//   head      [head y, head radius, depth squash]
//   arm       [arm radius, mitten radius]      leg  [hip x, hip y, leg radius, boot top]
//   hat       [base y, brim radius (0 = none), crown radius, crown height]
//   hat2      [0 = felt cylinder / 1 = knitted dome, band height, band padding, pompom radius]
//   scarf     [y, ring radius, tube radius, tail length]     tail [x of tail one, x of tail two (9 = none), half width]
const LOOKS = [
  {
    name: 'Stilt', role: 'tall one', color: '#c63a2f',
    look: {
      bean: [0.5, 0.225, 1.15, 0.135], head: [1.38, 0.135, 0.9], shoulder: [0.14, 1.0, 0], hand: [0.4, 0.74, 0.02], arm: [0.028, 0.05],
      leg: [0.065, 0.27, 0.028, 0.11], hat: [1.44, 0.2, 0.15, 0.2], hat2: [1, 0.055, 0.008, 0.035], scarf: [1.1, 0.16, 0.045, 0.5], tail: [0.045, 9, 0.045],
      colors: { skin: '#e6e0e4', scarf: '#c63a2f', hat: '#3a2a42', band: '#c63a2f', mitten: '#3b2a45', leg: '#8d8792', boot: '#2c2233', nose: '#b9aeb8' },
    },
  },
  {
    name: 'Dumpling', role: 'round one', color: '#2f8f8a',
    look: {
      bean: [0.42, 0.265, 0.7, 0.18], head: [0.8, 0.19, 0.9], shoulder: [0.2, 0.62, 0], hand: [0.4, 0.46, 0.02], arm: [0.036, 0.055],
      leg: [0.08, 0.16, 0.032, 0.085], hat: [0.87, 0, 0.205, 0.17], hat2: [1, 0.085, 0.02, 0.04], scarf: [0.645, 0.215, 0.048, 0.33], tail: [-0.1, 9, 0.05],
      colors: { skin: '#dfe9e3', scarf: '#2f8f8a', hat: '#2f585c', band: '#3a8a86', mitten: '#3f8f8a', leg: '#7d9590', boot: '#2f4f52', nose: '#8fa3a0' },
    },
  },
  {
    name: 'Gaffer', role: 'the boss', color: '#d9a92e',
    look: {
      bean: [0.58, 0.36, 1.05, 0.2], head: [1.2, 0.2, 0.82], shoulder: [0.27, 0.95, 0], hand: [0.46, 0.63, 0.03], arm: [0.043, 0.065],
      leg: [0.125, 0.23, 0.04, 0.1], hat: [1.335, 0.25, 0.155, 0.2], hat2: [0, 0.05, 0.006, 0], scarf: [0.975, 0.255, 0.055, 0.42], tail: [0.12, 9, 0.05],
      colors: { skin: '#b9a9c4', scarf: '#d9a92e', hat: '#3d2547', band: '#d9a92e', mitten: '#3b2545', leg: '#3a2540', boot: '#2e1d35', nose: '#8f8299' },
    },
  },
  {
    name: 'Twig', role: 'slim one', color: '#8e44ad',
    look: {
      bean: [0.42, 0.16, 0.95, 0.085], head: [1.1, 0.115, 0.92], shoulder: [0.09, 0.85, 0], hand: [0.36, 0.6, 0.02], arm: [0.022, 0.045],
      leg: [0.05, 0.26, 0.023, 0.13], hat: [1.145, 0, 0.135, 0.15], hat2: [1, 0.07, 0.016, 0.035], scarf: [0.895, 0.108, 0.038, 0.38], tail: [-0.04, 9, 0.04], hair: true,
      colors: { skin: '#dfe2ec', scarf: '#8e44ad', hat: '#8a3fb0', band: '#9a4fc0', mitten: '#5a2d7a', leg: '#9a9aa8', boot: '#4a2a66', nose: '#9a98aa', hair: '#77707c' },
    },
  },
  {
    name: 'Pebble', role: 'stocky one', color: '#2f6fc0',
    look: {
      bean: [0.43, 0.25, 0.7, 0.17], head: [0.8, 0.175, 0.88], shoulder: [0.2, 0.62, 0], hand: [0.42, 0.45, 0.02], arm: [0.036, 0.055],
      leg: [0.08, 0.19, 0.036, 0.09], hat: [0.9, 0.215, 0.16, 0.19], hat2: [1, 0.05, 0.006, 0.02], scarf: [0.64, 0.205, 0.048, 0.32], tail: [-0.08, 0.07, 0.042],
      colors: { skin: '#9aa3ad', scarf: '#2f6fc0', hat: '#2a2a45', band: '#2f6fc0', mitten: '#2a2f4a', leg: '#2f3348', boot: '#23263a', nose: '#77808c' },
    },
  },
  {
    name: 'Sprout', role: 'new one', color: '#e0679f',
    look: {
      bean: [0.46, 0.21, 0.86, 0.13], head: [1.0, 0.15, 0.9], shoulder: [0.15, 0.76, 0], hand: [0.4, 0.54, 0.02], arm: [0.03, 0.05],
      leg: [0.07, 0.24, 0.03, 0.1], hat: [1.05, 0, 0.17, 0.16], hat2: [1, 0.07, 0.016, 0.04], scarf: [0.805, 0.155, 0.042, 0.38], tail: [0.06, -0.07, 0.042],
      colors: { skin: '#eadfe4', scarf: '#e0679f', hat: '#7a2f5c', band: '#e0679f', mitten: '#6a2a50', leg: '#8f8590', boot: '#3a2238', nose: '#b3a3ad' },
    },
  },
];

// the same numbers give the six-part skeleton for animation and the ragdoll
export function lookRig(k) {
  const [yB, rB, yN] = k.bean, [yH, rH, zs] = k.head;
  return {
    // a carried head (headAt) hangs off the hand that holds it instead of the neck
    body: { c: [0, (yB - rB + yN) / 2, 0], r: [rB * 0.9, (yN - yB + rB) / 2, rB * zs * 0.9] }, head: { c: k.headAt || [0, yH, 0], r: rH }, neck: k.headAt ? k.hand : [0, yN, 0],
    shoulder: k.shoulder, hand: k.hand, armR: Math.max(k.arm[0], 0.04), hip: [k.leg[0], k.leg[1], 0], legR: Math.max(k.leg[2], 0.04),
  };
}
export const CREW = LOOKS.map((d) => ({ ...d, rig: lookRig(d.look) }));
export const TEAM = CREW.slice(0, 5); // the lineup from the concept sheet

// ---------- the crew in the game ----------
// Part order is the network format for diggers (7 floats per part) — do not reorder.
export const CP = { body: 0, head: 1, armL: 2, armR: 3, legL: 4, legR: 5 };
export const NCREW = 6;
export const CREW_SCALE = 1.3; // the sheet is drawn at toy size; the graveyard is built for people

const v3 = (a, s = 1) => new THREE.Vector3(a[0] * s, a[1] * s, a[2] * s);
const rigs = new Map();
// Everything the game needs about one crew member, in meters at game scale:
//   rest[i]   part centers, pivot[i] joint pivots (the body turns about the hips)
//   shapes[i] ragdoll collider and mass share, joints[i] cone limits, radius[i] a sphere that encloses the drawn part
export function crewRig(look) {
  const index = ((look % CREW.length) + CREW.length) % CREW.length;
  if (!rigs.has(index)) rigs.set(index, humanRig(CREW[index], CREW_SCALE, index));
  return rigs.get(index);
}
// the same for any two-legged character drawn by the crew shader (the zombies reuse it)
export function humanRig(def, S, index = 0) {
  const k = def.look, r = def.rig, mx = (a) => [-a[0], a[1], a[2]];
  const mid = (a, b) => v3(a, S).add(v3(b, S)).multiplyScalar(0.5);
  // Arms bend at an elbow. Parts 2 and 3 are the FOREARMS (elbow to mitten); the upper arm is not a part of its own:
  // whoever draws the character stretches it from the shoulder to wherever the forearm begins. The ragdoll keeps
  // one straight box per arm, so `bodyC` (collider centers) differs from `rest` (part centers) for the arms.
  const elbow = !k.brute, armC = [mid(r.shoulder, r.hand), mid(mx(r.shoulder), mx(r.hand))];
  const fore = (a, b) => v3(a, S).lerp(v3(b, S), 0.75);
  const legC = [new THREE.Vector3(r.hip[0] * S, r.hip[1] * S / 2, 0), new THREE.Vector3(-r.hip[0] * S, r.hip[1] * S / 2, 0)];
  const rest = [v3(r.body.c, S), v3(r.head.c, S), elbow ? fore(r.shoulder, r.hand) : armC[0], elbow ? fore(mx(r.shoulder), mx(r.hand)) : armC[1], ...legC];
  const bodyC = [rest[0], rest[1], armC[0], armC[1], rest[4], rest[5]], elbowAt = [null, null, armC[0], armC[1]];
  const pivot = [new THREE.Vector3(0, r.hip[1] * S, 0), v3(r.neck, S), v3(r.shoulder, S), v3(mx(r.shoulder), S), v3(r.hip, S), v3(mx(r.hip), S)];
  const br = Math.min(r.body.r[0], r.body.r[2]) * 0.95 * S, tall = r.body.r[1] * S - br;
  const armLen = v3(r.shoulder, S).distanceTo(v3(r.hand, S)), limb = (x) => Math.max(x * S, 0.06);
  const armDir = (a, b) => v3(b).sub(v3(a)).normalize().toArray();
  const shapes = [
    { mass: 0.52, spheres: tall > 0.04 ? [[0, -tall, 0, br], [0, tall, 0, br]] : [[0, 0, 0, br]] },
    { mass: 0.12, spheres: [[0, 0, 0, r.head.r * S]], grabR: r.head.r * S },
    { mass: 0.06, box: [limb(r.armR), armLen / 2, limb(r.armR)], dir: armDir(r.shoulder, r.hand) },
    { mass: 0.06, box: [limb(r.armR), armLen / 2, limb(r.armR)], dir: armDir(mx(r.shoulder), mx(r.hand)) },
    { mass: 0.12, box: [limb(r.legR), r.hip[1] * S / 2, limb(r.legR) * 1.25] },
    { mass: 0.12, box: [limb(r.legR), r.hip[1] * S / 2, limb(r.legR) * 1.25] },
  ];
  const joints = [null, { cone: 0.5, up: true }, { cone: 1.35 }, { cone: 1.35 }, { cone: 0.9 }, { cone: 0.9 }];
  const hatTop = k.hat ? (k.hat[0] - k.head[0] + k.hat[3] + k.hat2[3] * 1.6) * S : r.head.r * S;
  const radius = [r.body.r[1] * S + 0.12, Math.max(hatTop, k.hat ? k.hat[1] * S : 0, r.head.r * S) + 0.06, armLen / 2 + k.arm[1] * S * 2.4,
    armLen / 2 + k.arm[1] * S * 2.4, Math.hypot(r.hip[1] * S / 2 + 0.04, k.leg[2] * S * 4.6) + 0.03, Math.hypot(r.hip[1] * S / 2 + 0.04, k.leg[2] * S * 4.6) + 0.03];
  return { index, def, S, rest, bodyC, elbow, elbowAt, pivot, shapes, joints, radius, hatTop, armLen, belly: k.bean[1] * S, hand: v3(r.hand, S),
    height: (k.head[0] + k.head[1]) * S, back: k.bean[1] * k.head[2] * S };
}

const _body = new THREE.Matrix4(), _m = new THREE.Matrix4(), _a = new THREE.Matrix4(), _b = new THREE.Matrix4(), _r = new THREE.Matrix4();
const _e = new THREE.Euler(), _v = new THREE.Vector3(), _q = new THREE.Quaternion();
const _rot = Array.from({ length: NCREW }, () => [0, 0, 0]);
const set = (r, x, y, z) => { r[0] = x; r[1] = y; r[2] = z; };
const about = (out, parent, j, r) => out.copy(parent).multiply(_a.makeTranslation(j.x, j.y, j.z))
  .multiply(_r.makeRotationFromEuler(_e.set(r[0], r[1], r[2], 'XYZ'))).multiply(_b.makeTranslation(-j.x, -j.y, -j.z));

// ---------- arms: two bones and an elbow ----------
// Where a mitten should be is given from the shoulder in arm lengths: x away from the body, y up, z forward; `pole`
// says which way the elbow points. solveArm leaves the elbow (_E), the mitten (_H) and the forearm's direction (_F)
// in the body's own frame; writeArm turns that into the forearm part's transform.
const _S = new THREE.Vector3(), _H = new THREE.Vector3(), _E = new THREE.Vector3(), _F = new THREE.Vector3(), _pd = new THREE.Vector3(), _pp = new THREE.Vector3();
const _qa = new THREE.Quaternion(), _qb = new THREE.Quaternion(), _hop = new THREE.Matrix4();
export function solveArm(rig, i, h, pole) {
  const side = i === 2 ? 1 : -1, L = rig.armLen, l = L / 2;
  _H.set(h[0] * side, h[1], h[2]);
  const d = _H.length(), dist = Math.min(Math.max(d, 0.25), 0.995) * L;
  _pd.copy(_H).multiplyScalar(1 / Math.max(d, 1e-6));
  _pp.set(pole[0] * side, pole[1], pole[2]);
  _pp.addScaledVector(_pd, -_pp.dot(_pd));
  if (_pp.lengthSq() < 1e-6) _pp.set(0, -1, 0).addScaledVector(_pd, _pd.y);
  _pp.normalize();
  const a = dist / 2;
  _E.copy(rig.pivot[i]).addScaledVector(_pd, a).addScaledVector(_pp, Math.sqrt(Math.max(l * l - a * a, 0)));
  _H.copy(rig.pivot[i]).addScaledVector(_pd, dist);
  _F.copy(_H).sub(_E).normalize();
}
// body: the body's rest -> world matrix. Returns the forearm's world rotation (also left in _qa).
export function writeArm(rig, i, body, out, off) {
  const o = off + i * 7;
  _qa.setFromUnitVectors(_v.fromArray(rig.shapes[i].dir), _F).premultiply(_qb.setFromRotationMatrix(body));
  _v.copy(_E).addScaledVector(_F, rig.armLen / 4).applyMatrix4(body);
  out[o] = _v.x; out[o + 1] = _v.y; out[o + 2] = _v.z;
  out[o + 3] = _qa.x; out[o + 4] = _qa.y; out[o + 5] = _qa.z; out[o + 6] = _qa.w;
  return _qa;
}
const mix3 = (a, b, t, o) => { o[0] = a[0] + (b[0] - a[0]) * t; o[1] = a[1] + (b[1] - a[1]) * t; o[2] = a[2] + (b[2] - a[2]) * t; return o; };
const ease = (x) => x * x * (3 - 2 * x);
// the shovel is carried in the right mitten like a weapon at the hip; these are that pose's mitten and elbow
const HOLD = [0.05, -0.42, 0.62], HOLD_POLE = [0.5, -0.6, -0.6];
// which way the right forearm (and so the shovel) points when carried, in the body's frame
export function shovelHoldDir(rig) { solveArm(rig, 3, HOLD, HOLD_POLE); return _F.clone(); }
const _lh = [0, 0, 0], _lp = [0, 0, 0], _rh = [0, 0, 0], _rp = [0, 0, 0];

// Procedural digger animation, straight to part transforms. s = { speed, phase, t, carry, dig, air, swing 0..1 }.
// Writes 7 floats per part (px,py,pz,qx,qy,qz,qw) into `out` from `off`. The legs hang from the root, so a leaning
// body keeps its feet under it; head and arms ride on the body.
export function crewPose(rig, root, s, out, off = 0) {
  const k = Math.min(s.speed / 4, 1.4), sw = Math.sin(s.phase), t = s.t, idle = 1 - Math.min(k, 1), R = _rot;
  // A cartoon walk: the whole figure hops up between footfalls and rocks from side to side over the standing leg,
  // the head rolls back the other way and nods. Running does more of all of it.
  const wad = s.dig || s.air ? 0 : k * (s.carry ? 0.55 : 1), bounce = Math.abs(Math.cos(s.phase));
  set(R[0], 0.09 * k + Math.sin(t * 1.7) * 0.02, sw * 0.1 * k, -sw * 0.17 * wad + Math.sin(t * 0.9) * 0.02 * idle);
  set(R[1], -0.07 * k + Math.cos(s.phase * 2) * 0.05 * wad + Math.sin(t * 1.1) * 0.04, Math.sin(t * 0.7) * 0.2 * idle, sw * 0.1 * wad + Math.sin(t * 1.3) * 0.06);
  set(R[2], 0, 0, 0); set(R[3], 0, 0, 0);
  set(R[4], sw * 0.75 * k, 0, 0);
  set(R[5], -sw * 0.75 * k, 0, 0);
  // the mittens: the left one hangs and swings with the step, the right one carries the shovel at the hip
  let grip = false; // the left mitten takes the shovel's shaft too
  mix3([0.2, -0.93, 0.1 - sw * 0.5 * k], _lh, 0, _lh); mix3([0.3, -0.2, -1], _lp, 0, _lp);
  mix3(HOLD, _rh, 0, _rh); mix3(HOLD_POLE, _rp, 0, _rp);
  _rh[1] += Math.sin(s.phase * 2) * 0.03 * k + Math.sin(t * 1.4) * 0.01;
  if (s.carry) { // both mittens out in front: low and bent for a coffin, up and forward for a body
    const low = s.carry === 'coffin';
    mix3(low ? [-0.1, -0.6, 0.62] : [-0.12, 0.05, 0.88], _lh, 0, _lh); mix3(_lh, _rh, 0, _rh);
    mix3(low ? [0.7, -0.3, -0.6] : [0.6, -0.7, -0.3], _lp, 0, _lp); mix3(_lp, _rp, 0, _rp);
    R[0][0] += low ? 0.3 : -0.08;
  } else {
    if (s.dig) { // a jab forward and down into the ground with both mittens on the shovel, the body leaning into it
      const push = 0.5 + 0.5 * Math.sin(t * 7);
      mix3([0.05, -0.45, 0.5], [0.02, -0.72, 0.66], push, _rh); mix3([0.4, 0.2, -1], _rp, 0, _rp);
      set(R[0], 0.22 + 0.3 * push, 0, 0);
      set(R[4], -0.3, 0, 0);
      set(R[5], 0.25, 0, 0);
      grip = true;
    }
    if (s.swing) { // up over the shoulder, then down hard; the blow lands a third of the way in
      const up = ease(Math.min(s.swing / 0.26, 1)), down = s.swing > 0.26 ? ease(Math.min((s.swing - 0.26) / 0.2, 1)) : 0, back = s.swing > 0.6 ? ease((s.swing - 0.6) / 0.4) : 0;
      mix3(_rh, [0.2, 0.78, -0.15], up, _rh); mix3(_rh, [-0.1, -0.5, 0.82], down, _rh); mix3(_rh, HOLD, back * down, _rh);
      mix3(_rp, [0.4, -0.9, 0.4], up, _rp); mix3(_rp, [0.5, 0.4, -0.8], down, _rp); mix3(_rp, HOLD_POLE, back * down, _rp);
      R[0][0] += -0.22 * up * (1 - down) + 0.5 * down * (1 - back);
      R[0][1] += 0.35 * up * (1 - down) - 0.5 * down * (1 - back); // wind up with the shoulder, follow through
      mix3(_lh, [0.45, -0.55, -0.15], up * (1 - back), _lh);
    }
    if (s.air) { mix3([0.75, 0.45, 0.05], _lh, 0, _lh); mix3([0, -1, -0.2], _lp, 0, _lp); }
  }
  if (s.air) {
    set(R[4], -0.6, 0, 0);
    set(R[5], -0.2, 0, 0);
  }
  if (wad > 0.01) root = _hop.copy(root).multiply(_a.makeTranslation(sw * 0.045 * wad, bounce * 0.085 * wad, 0)); // feet and all
  rigPose(rig, root, R, out, off);
  if (!rig.elbow) return out;
  solveArm(rig, 3, _rh, _rp);
  writeArm(rig, 3, _body, out, off);
  if (grip) { // the left mitten goes to a point on the shaft, a little way up from the right one
    _v.copy(_H).addScaledVector(_F, 0.26).sub(rig.pivot[2]).multiplyScalar(1 / rig.armLen);
    _lh[0] = _v.x; _lh[1] = _v.y; _lh[2] = _v.z;
    mix3([0.3, -0.6, -0.7], _lp, 0, _lp);
  }
  solveArm(rig, 2, _lh, _lp);
  writeArm(rig, 2, _body, out, off);
  return out;
}

// Six euler rotations (body about the hips, head and arms on the body, legs on the root) -> 7 floats per part.
// A rotated arm stays straight: this is for bodies laid out or propped up, and for anything without elbows.
export function rigPose(rig, root, R, out, off = 0) {
  about(_body, root, rig.pivot[0], R[0]);
  for (let i = 0; i < NCREW; i++) {
    const m = i === 0 ? _body : about(_m, i < 4 ? _body : root, rig.pivot[i], R[i]);
    const o = off + i * 7;
    _v.copy(rig.rest[i]).applyMatrix4(m);
    _q.setFromRotationMatrix(m);
    out[o] = _v.x; out[o + 1] = _v.y; out[o + 2] = _v.z;
    out[o + 3] = _q.x; out[o + 4] = _q.y; out[o + 5] = _q.z; out[o + 6] = _q.w;
  }
  return out;
}

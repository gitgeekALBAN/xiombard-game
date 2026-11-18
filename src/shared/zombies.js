import * as THREE from 'three';
import { CREW, CREW_SCALE, NCREW, lookRig, humanRig } from './crew.js';

// The night shift's visitors. They are drawn by the same shader as the crew and move on the same six rigid parts,
// so the simulation and the view treat them like diggers with different numbers.
//   walker   one of the crew gone green: arms out, shuffling
//   dragger  hunched, with enormous fists that trail along the ground
//   dog      four legs: part order is body, head, front-left, front-right, back-left, back-right
export const ZTYPE = { walker: 0, dragger: 1, dog: 2 };

// mix a hex color toward a sickly green-grey and darken it
function sick(hex, k = 0.55, dark = 0.82, green = '#7f9a6a') {
  const c = new THREE.Color(hex).lerp(new THREE.Color(green), k).multiplyScalar(dark);
  return '#' + c.getHexString();
}
const walkers = CREW.map((d, i) => {
  const c = d.look.colors;
  const look = {
    ...d.look, face: 1, hair: false, hat: i % 2 ? d.look.hat : null, // every other one lost its hat in the ground
    colors: { skin: sick(c.skin, 0.72, 0.8, '#6fae58'), scarf: sick(c.scarf, 0.3, 0.7), hat: sick(c.hat, 0.35, 0.8), band: sick(c.band, 0.3, 0.7),
      mitten: sick(c.mitten, 0.4, 0.75), leg: sick(c.leg, 0.5, 0.75), boot: sick(c.boot, 0.3, 0.8), nose: sick(c.nose, 0.6, 0.7) },
  };
  return { name: 'Zombie', type: ZTYPE.walker, hp: 2, speed: 2.1, reach: 1.15, look, rig: lookRig(look) };
});
const draggerLook = {
  face: 1, bean: [0.5, 0.27, 0.9, 0.17], head: [1.0, 0.17, 0.9], shoulder: [0.25, 0.83, 0], hand: [0.62, -0.02, 0], arm: [0.05, 0.135],
  leg: [0.1, 0.25, 0.042, 0.1], hat: null, hat2: [1, 0.05, 0.01, 0], scarf: [0.85, 0.2, 0.042, 0.26], tail: [0.1, 9, 0.045],
  colors: { skin: '#7fa56a', scarf: '#5b3f52', hat: '#333', band: '#333', mitten: '#6f8468', leg: '#59665a', boot: '#2f3530', nose: '#5f7359' },
};
const dragger = { name: 'Knuckles', type: ZTYPE.dragger, hp: 3, speed: 1.5, reach: 1.7, look: draggerLook, rig: lookRig(draggerLook) };

// dog: half body length, body radius, body height; head [radius, snout length, snout radius];
// leg [x, z, radius]; ear [0 flap / 1 long wavy flap / 2 pompom, length, width]; tail [length, radius, lift 0..1];
// pom [on the head, at the ankles, on the tail tip] radii (poodles only)
const dogColors = (fur, ear, collar, paw) => ({ skin: sick(fur, 0.35, 0.92), scarf: collar, hat: sick(ear, 0.3, 0.9), band: '#000', mitten: '#000',
  leg: sick(fur, 0.4, 0.82), boot: sick(paw, 0.3, 0.85), nose: '#2a2030', hair: '#d77f95' });
const dogs = [
  { name: 'Dachshund', dog: { len: 0.4, r: 0.125, h: 0.25, head: [0.12, 0.17, 0.055], leg: [0.085, 0.3, 0.036], ear: [0, 0.16, 0.06], tail: [0.26, 0.022, 0.5], pom: [0, 0, 0] },
    colors: dogColors('#9a6238', '#6a3f22', '#c63a2f', '#6a3f22'), speed: 4.6 },
  { name: 'Spaniel', dog: { len: 0.25, r: 0.15, h: 0.38, head: [0.135, 0.11, 0.065], leg: [0.1, 0.17, 0.042], ear: [1, 0.27, 0.085], tail: [0.1, 0.035, 0.7], pom: [0, 0, 0] },
    colors: dogColors('#e8e2d6', '#9a5a34', '#2f6fc0', '#e8e2d6'), speed: 5.0 },
  { name: 'Poodle', dog: { len: 0.2, r: 0.125, h: 0.5, head: [0.11, 0.12, 0.045], leg: [0.085, 0.14, 0.027], ear: [2, 0.085, 0.07], tail: [0.2, 0.018, 1.0], pom: [0.095, 0.062, 0.07] },
    colors: dogColors('#f0dfe6', '#f0dfe6', '#e0679f', '#f0dfe6'), speed: 5.2 },
].map((d) => ({ name: d.name, type: ZTYPE.dog, hp: 1, speed: d.speed, reach: 0.95, look: { dog: d.dog, face: 2, colors: d.colors } }));

// index = the `look` number sent over the network: 0-5 walkers, 6 dragger, 7-9 dogs — do not reorder
export const ZOMBIES = [...walkers, dragger, ...dogs];
export const Z_WALKERS = walkers.map((_, i) => i), Z_DRAGGER = walkers.length, Z_DOGS = dogs.map((_, i) => walkers.length + 1 + i);

function dogRig(def, index) {
  const g = def.look.dog, [hr, sl] = g.head, [lx, lz, lr] = g.leg, V = (x, y, z) => new THREE.Vector3(x, y, z);
  const headC = V(0, g.h + g.r * 0.55 + hr * 0.55, g.len + hr * 0.45), lw = Math.max(lr, 0.05);
  const legs = [[lx, lz], [-lx, lz], [lx, -lz], [-lx, -lz]];
  const rest = [V(0, g.h, 0), headC, ...legs.map(([x, z]) => V(x, g.h / 2, z))];
  const pivot = [V(0, g.h, 0), V(0, g.h + g.r * 0.4, g.len - 0.02), ...legs.map(([x, z]) => V(x, g.h, z))];
  const zb = Math.max(g.len - g.r, 0.02);
  const shapes = [
    { mass: 0.6, spheres: [[0, 0, -zb, g.r], [0, 0, zb, g.r]] }, { mass: 0.16, spheres: [[0, 0, 0, hr]], grabR: hr },
    ...legs.map(() => ({ mass: 0.06, box: [lw, g.h / 2, lw] })),
  ];
  const joints = [null, { cone: 0.6, up: true }, { cone: 0.9 }, { cone: 0.9 }, { cone: 0.9 }, { cone: 0.9 }];
  const radius = [g.len + g.r + g.tail[0] + g.pom[2] + 0.06, hr + Math.max(sl + 0.05, g.ear[1] + 0.04, g.pom[0] * 2) + 0.05, ...legs.map(() => g.h / 2 + 0.1)];
  return { index, def, S: 1, rest, pivot, shapes, joints, radius, hatTop: hr, belly: g.r * 1.5, dog: g };
}

const rigs = new Map();
export function zombieRig(look) {
  const index = ((look % ZOMBIES.length) + ZOMBIES.length) % ZOMBIES.length;
  if (!rigs.has(index)) rigs.set(index, ZOMBIES[index].type === ZTYPE.dog ? dogRig(ZOMBIES[index], index) : humanRig(ZOMBIES[index], CREW_SCALE, index));
  return rigs.get(index);
}

// ---------- poses ----------
const _body = new THREE.Matrix4(), _m = new THREE.Matrix4(), _a = new THREE.Matrix4(), _b = new THREE.Matrix4(), _r = new THREE.Matrix4();
const _e = new THREE.Euler(), _v = new THREE.Vector3(), _q = new THREE.Quaternion(), _qr = new THREE.Quaternion();
const _s = new THREE.Vector3(), _d = new THREE.Vector3(), _f = new THREE.Vector3(), _side = new THREE.Vector3(), _rd = new THREE.Vector3();
const _rot = Array.from({ length: NCREW }, () => [0, 0, 0]);
const set = (r, x, y, z) => { r[0] = x; r[1] = y; r[2] = z; };
const about = (out, parent, j, r) => out.copy(parent).multiply(_a.makeTranslation(j.x, j.y, j.z))
  .multiply(_r.makeRotationFromEuler(_e.set(r[0], r[1], r[2], 'XYZ'))).multiply(_b.makeTranslation(-j.x, -j.y, -j.z));
function write(rig, i, m, out, off) {
  const o = off + i * 7;
  _v.copy(rig.rest[i]).applyMatrix4(m);
  _q.setFromRotationMatrix(m);
  out[o] = _v.x; out[o + 1] = _v.y; out[o + 2] = _v.z;
  out[o + 3] = _q.x; out[o + 4] = _q.y; out[o + 5] = _q.z; out[o + 6] = _q.w;
}
const ease = (x) => x * x * (3 - 2 * x);

// s = { speed, phase, t, attack }  attack: 0 = none, otherwise 0..1 progress of the swing (the hit lands near 0.6).
// Writes 7 floats per part into `out` from `off`, like crewPose.
export function zombiePose(rig, root, s, out, off = 0) {
  const type = rig.def.type;
  if (type === ZTYPE.dog) return dogPose(rig, root, s, out, off);
  const k = Math.min(s.speed / 2.2, 1.3), sw = Math.sin(s.phase), t = s.t, R = _rot, drag = type === ZTYPE.dragger;
  const a = s.attack || 0, wind = a ? Math.sin(Math.min(a / 0.55, 1) * Math.PI * 0.5) : 0, slam = a > 0.55 ? ease(Math.min((a - 0.55) / 0.2, 1)) : 0;
  // a lurching body, a head hanging to one side, stiff little steps
  set(R[0], (drag ? 0.42 : 0.14) + Math.sin(t * 1.3) * 0.03 - wind * 0.25 + slam * 0.5, sw * 0.12 * k, sw * 0.13 * k + Math.sin(t * 0.8) * 0.03);
  set(R[1], drag ? -0.3 : 0.05, Math.sin(t * 0.6) * 0.15, 0.38 + Math.sin(t * 1.1) * 0.06);
  set(R[4], sw * 0.5 * k, 0, 0.04);
  set(R[5], -sw * 0.5 * k, 0, -0.04);
  // walkers hold both arms out; the swing lifts them overhead and chops down
  const up = -1.35 - wind * 1.2 + slam * 1.5;
  set(R[2], up + Math.sin(t * 2.3) * 0.08, 0, -0.42);
  set(R[3], up + Math.sin(t * 2.3 + 1.7) * 0.08, 0, 0.42);
  about(_body, root, rig.pivot[0], R[0]);
  write(rig, 0, _body, out, off);
  write(rig, 1, about(_m, _body, rig.pivot[1], R[1]), out, off);
  write(rig, 4, about(_m, root, rig.pivot[4], R[4]), out, off);
  write(rig, 5, about(_m, root, rig.pivot[5], R[5]), out, off);
  if (!drag) {
    write(rig, 2, about(_m, _body, rig.pivot[2], R[2]), out, off);
    write(rig, 3, about(_m, _body, rig.pivot[3], R[3]), out, off);
    return out;
  }
  // The dragger's arms are longer than its shoulders are high: each fist rests on the ground behind the shoulder
  // and slides as it walks. A rigid arm that must touch the ground can only swing on a circle around the shoulder,
  // so the pose picks an angle on that circle. The swing aims both arms up and over instead.
  _qr.setFromRotationMatrix(root);
  _f.set(0, 0, 1).applyQuaternion(_qr);
  const gy = root.elements[13] + rig.def.look.arm[1] * rig.S * 0.9;
  for (let i = 2; i < 4; i++) {
    const sgn = i === 2 ? 1 : -1, o = off + i * 7;
    _s.copy(rig.pivot[i]).applyMatrix4(_body);
    _side.set(sgn, 0, 0).applyQuaternion(_qr);
    const L = rig.armLen, drop = Math.min(Math.max(_s.y - gy, 0), L * 0.98), d = Math.sqrt(L * L - drop * drop);
    const beta = 0.55 + 0.3 * Math.sin(s.phase + (i === 2 ? 0 : Math.PI)) * Math.min(k, 1);
    _d.copy(_f).multiplyScalar(-Math.cos(beta) * d).addScaledVector(_side, Math.sin(beta) * d);
    _d.y = -drop;
    _d.normalize();
    if (a) { // overhead: from behind, up, and down in front
      const ang = 2.4 - wind * 0.9 - slam * 2.0, lift = ease(Math.min(a / 0.3, 1));
      _v.copy(_f).multiplyScalar(Math.cos(ang)).addScaledVector(_side, 0.25);
      _v.y = Math.sin(ang);
      _d.lerp(_v.normalize(), lift).normalize();
    }
    _rd.copy(rig.hand).sub(rig.pivot[2]).normalize();
    if (i === 3) _rd.x = -_rd.x;
    _rd.applyQuaternion(_qr);
    _q.setFromUnitVectors(_rd, _d).multiply(_qr);
    _v.copy(rig.rest[i]).sub(rig.pivot[i]).applyQuaternion(_q).add(_s);
    out[o] = _v.x; out[o + 1] = _v.y; out[o + 2] = _v.z;
    out[o + 3] = _q.x; out[o + 4] = _q.y; out[o + 5] = _q.z; out[o + 6] = _q.w;
  }
  return out;
}

function dogPose(rig, root, s, out, off) {
  const k = Math.min(s.speed / 4, 1.2), sw = Math.sin(s.phase), cw = Math.cos(s.phase), t = s.t, R = _rot;
  const a = s.attack || 0, lunge = a ? Math.sin(Math.min(a, 1) * Math.PI) : 0;
  set(R[0], -sw * 0.1 * k - lunge * 0.35, 0, cw * 0.05 * k);
  set(R[1], cw * 0.12 * k + Math.sin(t * 3.1) * 0.06 - lunge * 0.3, Math.sin(t * 0.9) * 0.2 * (1 - Math.min(k, 1)), 0.25 + Math.sin(t * 1.7) * 0.08);
  const am = 0.8 * k;
  set(R[2], sw * am, 0, 0); set(R[5], sw * am * 0.9, 0, 0);
  set(R[3], -sw * am, 0, 0); set(R[4], -sw * am * 0.9, 0, 0);
  _a.makeTranslation(0, Math.abs(cw) * 0.03 * k + lunge * 0.12, 0);
  _m.copy(root).multiply(_a);
  about(_body, _m, rig.pivot[0], R[0]);
  write(rig, 0, _body, out, off);
  for (let i = 1; i < NCREW; i++) write(rig, i, about(_m, _body, rig.pivot[i], R[i]), out, off);
  return out;
}

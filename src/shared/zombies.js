import * as THREE from 'three';
import { CREW, CREW_SCALE, NCREW, lookRig, humanRig, solveArm, writeArm } from './crew.js';

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
// Walkers are the crew's own shapes gone grey-green: a ragged scarf in a faded version of the old color, a
// moth-eaten hat (or none), earth all over, and a few patches stitched onto the belly.
const PATCH = ['#8a5a44', '#4a6a8a', '#7a5a86', '#8a7a4a', '#5a7a66'];
const walkers = CREW.map((d, i) => {
  const c = d.look.colors, [yB, rB] = d.look.bean, R = (n) => { const s = Math.sin((i + 1) * 12.9898 + n * 78.233) * 43758.5453; return s - Math.floor(s); };
  const patches = [0, 1, 2].slice(0, 2 + (i % 2)).map((n) => [(n - 0.9) * 0.85 + R(n) * 0.3 - 0.1, yB + (R(n + 5) - 0.55) * rB * 0.9, 0.034 + R(n + 9) * 0.016, 0.03 + R(n + 13) * 0.016, PATCH[(i + n * 2) % PATCH.length]]);
  const look = {
    ...d.look, face: 1, hair: false, torn: true, grime: 0.85, patches, hat: i % 3 === 0 ? null : d.look.hat, // every third one lost its hat in the ground
    hatPatch: [0.9 - i * 0.5, d.look.hat[0] + d.look.hat[3] * 0.5, 0.032, 0.028, PATCH[(i + 3) % PATCH.length]],
    colors: { skin: sick(c.skin, 0.8, 0.86, '#93ad84'), scarf: sick(c.scarf, 0.22, 0.74), hat: sick(c.hat, 0.3, 0.82), band: sick(c.band, 0.25, 0.72), pom: sick(c.band, 0.25, 0.78),
      mitten: sick(c.scarf, 0.3, 0.6), leg: sick(c.leg, 0.5, 0.7), boot: sick(c.boot, 0.3, 0.8), nose: sick(c.nose, 0.6, 0.7) },
  };
  return { name: 'Zombie', type: ZTYPE.walker, hp: 2, speed: 2.1, reach: 1.15, look, rig: lookRig(look) };
});
// The dragger: a hunched boulder, face sunk between the shoulders, arms longer than it is tall. `brute` selects
// its own sculptor; the usual arrays still describe the rig (and so the ragdoll and the pose).
const draggerLook = {
  face: 1, brute: true, grime: 1, faceAt: [0, 0.76, 0.2, 0.15],
  bean: [0.5, 0.33, 0.76, 0.22], head: [0.76, 0.15, 0.9], shoulder: [0.3, 0.76, 0], hand: [0.5, 0.07, 0.02], arm: [0.085, 0.15],
  leg: [0.13, 0.21, 0.05, 0.1], hat: null, hat2: [1, 0.05, 0.01, 0], scarf: null, tail: [0.1, 9, 0.045],
  patches: [[-0.75, 0.42, 0.05, 0.045, '#6a5a48'], [0.9, 0.55, 0.04, 0.04, '#4a5f6a']],
  colors: { skin: '#8c9d86', scarf: '#6b4f3f', hat: '#333', band: '#333', mitten: '#6f8468', leg: '#5c6a5e', boot: '#2f3530', nose: '#5f7359' },
};
const dragger = { name: 'Knuckles', type: ZTYPE.dragger, hp: 3, speed: 1.5, reach: 2.05, look: draggerLook, rig: lookRig(draggerLook) };

// dog: half body length, body radius, body height; head [radius, snout length, snout radius];
// leg [x, z, radius]; ear [0 flap / 1 long wavy flap / 2 pompom, length, width]; tail [length, radius, lift 0..1];
// pom [on the head, at the ankles, on the tail tip] radii (poodles only)
const dogColors = (fur, ear, collar, paw) => ({ skin: sick(fur, 0.42, 0.92), scarf: collar, hat: sick(ear, 0.3, 0.9), band: '#000', mitten: '#000',
  leg: sick(fur, 0.45, 0.84), boot: sick(paw, 0.2, 0.8), nose: '#241c2a', hair: '#d77f95' });
const dogs = [
  { name: 'Dachshund', dog: { len: 0.42, r: 0.125, h: 0.25, head: [0.125, 0.19, 0.05], leg: [0.085, 0.3, 0.036], ear: [0, 0.2, 0.075], tail: [0.28, 0.02, 0.62], pom: [0, 0, 0] },
    colors: dogColors('#8f9a6a', '#4a4650', '#3f8f8a', '#5a3f56'), speed: 4.6 },
  { name: 'Spaniel', dog: { len: 0.26, r: 0.15, h: 0.38, head: [0.135, 0.12, 0.06], leg: [0.1, 0.17, 0.042], ear: [1, 0.3, 0.09], tail: [0.16, 0.04, 0.75], pom: [0, 0, 0] },
    colors: dogColors('#d9d6a8', '#c9b27a', '#c9722e', '#5a3f56'), speed: 5.0 },
  { name: 'Poodle', dog: { len: 0.2, r: 0.125, h: 0.5, head: [0.11, 0.13, 0.042], leg: [0.085, 0.14, 0.028], ear: [2, 0.085, 0.07], tail: [0.2, 0.018, 1.0], pom: [0.1, 0.06, 0.07] },
    colors: dogColors('#cfd6c8', '#e6e2d6', '#8a4f9a', '#b9a6c6'), speed: 5.2 },
].map((d) => ({ name: d.name, type: ZTYPE.dog, hp: 1, speed: d.speed, reach: 0.95, look: { dog: d.dog, face: 2, grime: 0.5, colors: d.colors } }));

// ---------- the odd ones. They walk and fight like walkers (type 0) unless a field says otherwise:
//   atk: seconds a swing takes, cool: seconds between swings, push: [sideways, up] speed given to whoever is hit,
//   mass: ragdoll weight, fly: how far a shovel sends it (1 = like a walker), split: looks it falls apart into
const ZSKIN = '#9db093';
const odd = (name, stats, look) => ({ name, type: ZTYPE.walker, hp: 2, speed: 2, reach: 1.15, ...stats, look: { face: 1, grime: 0.8, torn: true, tail: [0.03, 9, 0.04], hat2: [1, 0.06, 0.016, 0], ...look }, rig: null });
const odds = [
  // a ball of a belly on little legs with a head on a stalk: slow, hard to put down, and it bumps you a long way
  odd('Bloat', { hp: 4, speed: 1.3, reach: 1.3, atk: 0.9, push: [7, 5], mass: 60, fly: 0.75 }, {
    ball: true, bounce: true, bean: [0.47, 0.37, 0.84, 0.05], head: [1.02, 0.105, 0.95], shoulder: [0.31, 0.62, 0], hand: [0.48, 0.44, 0.03], arm: [0.03, 0.052],
    leg: [0.13, 0.14, 0.035, 0.09], hat: null, scarf: [0.87, 0.07, 0.034, 0.2], patches: [[-0.5, 0.42, 0.05, 0.045, '#8a5a44'], [0.7, 0.56, 0.04, 0.04, '#4a6a8a'], [0.1, 0.3, 0.045, 0.035, '#7a5a86']],
    colors: { skin: '#a6b79d', scarf: '#5a5562', hat: '#333', band: '#333', mitten: '#4a3a36', leg: '#7f8f7a', boot: '#3f332f', nose: '#6a7a66' },
  }),
  // all legs: quick, reaches a long way, and goes down from one good whack
  odd('Longshanks', { hp: 1, speed: 3.3, reach: 1.5, atk: 0.6 }, {
    bean: [0.86, 0.12, 1.14, 0.085], head: [1.3, 0.115, 0.92], shoulder: [0.09, 1.04, 0], hand: [0.3, 0.64, 0.02], arm: [0.03, 0.045],
    leg: [0.05, 0.76, 0.03, 0.11], hat: [1.345, 0, 0.135, 0.15], hat2: [1, 0.06, 0.016, 0.035], scarf: [1.09, 0.108, 0.036, 0.3], patches: [[0.3, 0.9, 0.03, 0.03, '#8a5a44']],
    colors: { skin: ZSKIN, scarf: '#7a5a3a', hat: '#c9772e', band: '#a85f22', pom: '#b96a26', mitten: '#5a4a3a', leg: '#8d9c86', boot: '#5a4030', nose: '#6a7a66' },
  }),
  // two small ones under one long coat: the first whack knocks them apart
  odd('Stack', { hp: 1, speed: 1.8, split: [1, 4] }, {
    coat: { color: '#6b4a34', hem: 0.13 }, face2: [0, 0.6, 0.2, 0.115], bean: [0.42, 0.25, 1.0, 0.15], head: [1.16, 0.14, 0.9], shoulder: [0.17, 0.9, 0], hand: [0.38, 0.62, 0.02], arm: [0.036, 0.05],
    leg: [0.08, 0.17, 0.032, 0.09], hat: [1.215, 0, 0.16, 0.14], scarf: null, patches: [],
    colors: { skin: ZSKIN, scarf: '#444', hat: '#5f6a66', band: '#4f5a56', mitten: '#4a3a30', leg: '#5a4a3a', boot: '#3a2e28', nose: '#6a7a66' },
  }),
  // small, quick, and never stops swinging that rolling pin
  odd('Granny', { hp: 1, speed: 3.0, reach: 1.05, atk: 0.45, cool: 1.0, push: [2.8, 2.4] }, {
    coat: { color: '#6a5a68', hem: 0.1 }, shawl: '#7a5038', hair: true, bun: true, prop: 'pin', bean: [0.34, 0.2, 0.6, 0.13], head: [0.72, 0.15, 0.9], shoulder: [0.14, 0.55, 0], hand: [0.33, 0.4, 0.04], arm: [0.03, 0.05],
    leg: [0.07, 0.15, 0.03, 0.08], hat: [0.78, 0, 0.165, 0.13], hat2: [1, 0.06, 0.014, 0.035], scarf: null, patches: [],
    colors: { skin: ZSKIN, scarf: '#444', hat: '#a8403a', band: '#8a3430', pom: '#b84a44', mitten: '#5a4a52', leg: '#6a6a70', boot: '#3a3038', nose: '#6a7a66', hair: '#cfcac6' },
  }),
  // lost its head and carries it in one mitten, which makes a fine club
  odd('Headless', { hp: 2, speed: 2.0, reach: 1.25 }, {
    headAt: [0.47, 0.66, 0.07], bean: [0.45, 0.24, 0.86, 0.15], head: [1.0, 0.15, 0.9], shoulder: [0.2, 0.74, 0], hand: [0.4, 0.52, 0.03], arm: [0.034, 0.055],
    leg: [0.085, 0.2, 0.034, 0.09], hat: [1.055, 0, 0.17, 0.15], hat2: [1, 0.06, 0.016, 0.035], scarf: [0.82, 0.175, 0.045, 0.3], patches: [[-0.4, 0.5, 0.04, 0.04, '#8a7a4a'], [0.6, 0.4, 0.035, 0.04, '#7a5a86']],
    colors: { skin: ZSKIN, scarf: '#4a6a8a', hat: '#8a3a36', band: '#74302c', pom: '#9a443e', mitten: '#3f4f66', leg: '#7f8f7a', boot: '#33303a', nose: '#6a7a66' },
  }),
  // came up still wearing the coffin: the staves take the blows, so it needs a lot of them and hardly flies
  odd('Barrel', { hp: 4, speed: 1.6, mass: 70, fly: 0.6 }, {
    barrel: { y0: 0.3, y1: 0.82 }, bean: [0.56, 0.33, 1.0, 0.19], head: [1.15, 0.18, 0.86], shoulder: [0.3, 0.95, 0], hand: [0.5, 0.68, 0.03], arm: [0.04, 0.06],
    leg: [0.12, 0.22, 0.04, 0.1], hat: null, scarf: [0.935, 0.24, 0.05, 0.2], patches: [],
    colors: { skin: '#93ad84', scarf: '#6a4a6a', hat: '#333', band: '#333', mitten: '#5a4a5a', leg: '#6f7f6a', boot: '#2f2a30', nose: '#5f7359' },
  }),
];
for (const d of odds) d.rig = lookRig(d.look);

// index = the `look` number sent over the network: 0-5 walkers, 6 dragger, 7-9 dogs, 10-15 the odd ones — do not reorder
export const ZOMBIES = [...walkers, dragger, ...dogs, ...odds];
export const Z_ODD = Object.fromEntries(odds.map((d, i) => [d.name.toLowerCase(), walkers.length + 1 + dogs.length + i]));
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
  return { index, def, S: 1, rest, bodyC: rest, elbow: false, pivot, shapes, joints, radius, hatTop: hr, belly: g.r * 1.5, dog: g };
}

const rigs = new Map();
export function zombieRig(look) {
  const index = ((look % ZOMBIES.length) + ZOMBIES.length) % ZOMBIES.length;
  if (!rigs.has(index)) rigs.set(index, ZOMBIES[index].type === ZTYPE.dog ? dogRig(ZOMBIES[index], index) : humanRig(ZOMBIES[index], CREW_SCALE, index));
  return rigs.get(index);
}

// ---------- poses ----------
const _body = new THREE.Matrix4(), _m = new THREE.Matrix4(), _a = new THREE.Matrix4(), _b = new THREE.Matrix4(), _r = new THREE.Matrix4(), _hop = new THREE.Matrix4();
const _e = new THREE.Euler(), _v = new THREE.Vector3(), _q = new THREE.Quaternion(), _qr = new THREE.Quaternion();
const _s = new THREE.Vector3(), _d = new THREE.Vector3(), _f = new THREE.Vector3(), _side = new THREE.Vector3(), _rd = new THREE.Vector3();
const _rot = Array.from({ length: NCREW }, () => [0, 0, 0]);
const set = (r, x, y, z) => { r[0] = x; r[1] = y; r[2] = z; };
const _h = [0, 0, 0], mix3 = (a, b, t, o) => { o[0] = a[0] + (b[0] - a[0]) * t; o[1] = a[1] + (b[1] - a[1]) * t; o[2] = a[2] + (b[2] - a[2]) * t; return o; };
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
// digging at a grave with bare hands: each mitten reaches down and forward, then rakes back, the two out of step
const _scr = [0, 0, 0];
const scratch = (t, ph) => { const c = Math.sin(t * 9 + ph); _scr[0] = 0.05; _scr[1] = -0.62 - 0.22 * c; _scr[2] = 0.62 + 0.25 * c; return _scr.slice(); };

// s = { speed, phase, t, attack, dig }  attack: 0 = none, otherwise 0..1 progress of the swing (the hit lands near 0.6);
// dig: digging up a grave with bare hands (paws); dizzy: stunned, swaying with its head lolling.
// Writes 7 floats per part into `out` from `off`, like crewPose.
export function zombiePose(rig, root, s, out, off = 0) {
  const type = rig.def.type;
  if (type === ZTYPE.dog) return dogPose(rig, root, s, out, off);
  const k = Math.min(s.speed / 2.2, 1.3), sw = Math.sin(s.phase), t = s.t, R = _rot, drag = type === ZTYPE.dragger;
  const a = s.attack || 0, wind = a ? Math.sin(Math.min(a / 0.55, 1) * Math.PI * 0.5) : 0, slam = a > 0.55 ? ease(Math.min((a - 0.55) / 0.2, 1)) : 0;
  // a lurching body, a head hanging to one side, stiff little steps
  // the same hop and side-to-side rock as the crew's walk, heavier and slower (see crewPose)
  const wad = Math.min(k, 1.2) * (drag ? 0.5 : 1) * (a ? 0.3 : 1), bounce = Math.abs(Math.cos(s.phase));
  set(R[0], (drag ? 0.2 : 0.14) + Math.sin(t * 1.3) * 0.03 - wind * 0.25 + slam * 0.5 + (s.dig ? 0.6 + Math.sin(t * 9) * 0.06 : 0), sw * 0.12 * k, -sw * 0.2 * wad + Math.sin(t * 0.8) * 0.03); // bent right over a grave it digs
  set(R[1], drag ? -0.3 : 0.05, Math.sin(t * 0.6) * 0.15, 0.38 + Math.sin(t * 1.1) * 0.06);
  if (s.dizzy) { R[0][2] += Math.sin(t * 3.3) * 0.18; R[1][2] += Math.sin(t * 4.1) * 0.35; R[1][1] += Math.cos(t * 3.7) * 0.3; } // seeing stars: swaying, head lolling
  set(R[4], sw * 0.5 * k, 0, 0.04);
  set(R[5], -sw * 0.5 * k, 0, -0.04);
  const look = rig.def.look;
  if (!look.bounce && wad > 0.01) root = _hop.copy(root).multiply(_a.makeTranslation(sw * 0.05 * wad, bounce * 0.06 * wad, 0));
  if (look.bounce) { // a ball of a zombie gets about in little hops
    root = _hop.copy(root).multiply(_a.makeTranslation(0, Math.abs(sw) * 0.2 * Math.min(k * 1.6, 1) + 0.02, 0));
    R[0][0] = 0.06 + sw * 0.08; R[4][0] *= 0.5; R[5][0] *= 0.5;
  }
  about(_body, root, rig.pivot[0], R[0]);
  write(rig, 0, _body, out, off);
  if (!look.headAt) write(rig, 1, about(_m, _body, rig.pivot[1], R[1]), out, off);
  write(rig, 4, about(_m, root, rig.pivot[4], R[4]), out, off);
  write(rig, 5, about(_m, root, rig.pivot[5], R[5]), out, off);
  if (!drag) {
    // Arms reach for a point and the elbow bends by itself (see solveArm in crew.js). Walkers hold both mittens out
    // in front; a swing lifts them over the head and brings them down. The odd ones differ in what they hold.
    const reach = (i, base, pole, up, down) => {
      mix3(base, up, wind, _h); mix3(_h, down, slam, _h);
      _h[1] += Math.sin(t * 2.3 + i * 1.7) * 0.05 * (1 - wind);
      solveArm(rig, i, _h, pole);
      return writeArm(rig, i, _body, out, off);
    };
    if (look.headAt) { // the head sits in the left mitten, held low at the side and swung like a club
      const q = reach(2, [0.25, -0.72, 0.28], [0.3, -0.3, -1], [0.3, 0.7, 0.1], [0, -0.4, 0.85]), o = off + 7, a = off + 14;
      _v.copy(rig.rest[1]).sub(rig.rest[2]).applyQuaternion(q); // the head goes wherever that forearm goes
      out[o] = out[a] + _v.x; out[o + 1] = out[a + 1] + _v.y; out[o + 2] = out[a + 2] + _v.z;
      out[o + 3] = q.x; out[o + 4] = q.y; out[o + 5] = q.z; out[o + 6] = q.w;
    } else if (s.dig) reach(2, scratch(t, 0), [0.4, -0.9, 0], [0.1, 0.75, 0.3], [-0.05, -0.45, 0.85]);
    else reach(2, [-0.05, 0.03, 0.93], [0.4, -0.9, 0], [0.1, 0.75, 0.3], [-0.05, -0.45, 0.85]);
    if (s.dig && !look.prop) reach(3, scratch(t, Math.PI), [0.4, -0.9, 0], [0.1, 0.75, 0.3], [-0.05, -0.45, 0.85]);
    else if (look.prop) reach(3, [0.1, -0.05, 0.6], [0.4, -1, -0.2], [0.2, 0.65, -0.05], [-0.05, -0.4, 0.9]); // a club, held up at the ready
    else reach(3, [-0.05, 0.03, 0.93], [0.4, -0.9, 0], [0.1, 0.75, 0.3], [-0.05, -0.45, 0.85]);
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
  set(R[0], -sw * 0.14 * k - lunge * 0.35, 0, cw * 0.1 * k); // a rocking-horse gallop
  set(R[1], cw * 0.12 * k + Math.sin(t * 3.1) * 0.06 - lunge * 0.3, Math.sin(t * 0.9) * 0.2 * (1 - Math.min(k, 1)), 0.25 + Math.sin(t * 1.7) * 0.08);
  const am = 0.8 * k;
  set(R[2], sw * am, 0, 0); set(R[5], sw * am * 0.9, 0, 0);
  set(R[3], -sw * am, 0, 0); set(R[4], -sw * am * 0.9, 0, 0);
  if (s.dig) { // digging like a dog: nose down, the front paws going like mad
    const c = Math.sin(t * 14);
    set(R[0], 0.3, 0, 0); set(R[1], 0.35, 0, 0); set(R[2], -0.6 + c * 0.7, 0, 0); set(R[3], -0.6 - c * 0.7, 0, 0);
  }
  _a.makeTranslation(0, Math.abs(cw) * 0.07 * k + lunge * 0.12, 0);
  _m.copy(root).multiply(_a);
  about(_body, _m, rig.pivot[0], R[0]);
  write(rig, 0, _body, out, off);
  for (let i = 1; i < NCREW; i++) write(rig, i, about(_m, _body, rig.pivot[i], R[i]), out, off);
  return out;
}

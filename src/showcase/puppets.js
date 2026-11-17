// Five simplified puppets for the bot team, each made of six rigid parts (body, head, two arms, two legs)
// joined by five joints (neck, shoulders, hips). Rest pose: feet on y = 0, facing +Z, +X is the puppet's left.
// `rig` gives the physics and animation skeleton; `paint` draws the look as brush-dab splats, part by part.
// Shapes follow the team's concept sheets; they are original designs, not copies of existing characters.

const INK = '#1b1424', COAL = '#2a2136', NIGHT = '#252030', BONE = '#d8d2dc', GOLD = '#c9913a', AMBER = '#ffc46b';
const TAU = Math.PI * 2;
const ringStripes = (a, b, n) => (l) => (Math.floor((Math.atan2(l.z, l.x) / TAU + 1) * n) % 2 ? a : b);
const bandStripes = (a, b, k, off = 0) => (l) => (Math.floor(l.y * k + off + 100) % 2 ? a : b);
// ragged hem: drops the lower edge of a frustum in a zigzag (l.y is -h/2 at the hem)
const ragged = (h, depth, teeth) => (l) => l.y > -h / 2 + depth * Math.abs(Math.sin(Math.atan2(l.z, l.x) * teeth * 0.5));
// run a painter for the left (s = 1) and right (s = -1) side
const sides = (fn) => { fn(1); fn(-1); };
// a polyline of thin capsules (mouths, stitches, brows)
function line(b, pts, r, color, size = 0.007) {
  for (let i = 0; i < pts.length - 1; i++) b.capsule({ a: pts[i], b: pts[i + 1], ra: r, color, size, density: 1.4, flat: true });
}
const eyeDot = (b, x, y, z, rx, ry, color = INK) => b.ellipsoid({ c: [x, y, z], r: [rx, ry, 0.012], color, size: 0.008, density: 1.5, flat: true });
const glint = (b, x, y, z, r = 0.008) => b.ellipsoid({ c: [x, y, z], r: [r, r, r * 0.6], color: '#fff8e8', size: 0.005, density: 2, emissive: 1, flat: true });

export const PUPPETS = [
  {
    name: 'Mortimer', role: 'foreman', color: GOLD,
    rig: {
      body: { c: [0, 0.68, 0], r: [0.33, 0.36, 0.29] }, head: { c: [0, 1.23, 0], r: 0.19 }, neck: [0, 1.05, 0],
      shoulder: [0.31, 0.92, 0], hand: [0.43, 0.47, 0.03], armR: 0.07, hip: [0.13, 0.34, 0], legR: 0.09,
    },
    paint(b, P) {
      const body = '#3a2a4a', scarf = ringStripes(GOLD, '#3d2c52', 12);
      b.part(P.body);
      b.ellipsoid({ c: [0, 0.64, 0], r: [0.34, 0.33, 0.3], color: body });
      b.ellipsoid({ c: [0, 0.87, 0], r: [0.25, 0.2, 0.22], color: body });
      b.frustum({ c: [0, 0.95, 0], r0: 0.37, r1: 0.16, h: 0.2, top: false, color: NIGHT, keep: ragged(0.2, 0.09, 9) });
      b.torus({ c: [0, 1.05, 0], R: 0.19, r: 0.075, squash: 0.8, color: scarf, size: 0.014 });
      b.box({ c: [0.1, 0.85, 0.27], h: [0.055, 0.17, 0.02], rot: [0.2, 0, 0.08], color: bandStripes(GOLD, '#3d2c52', 14), size: 0.012 });
      b.part(P.head);
      b.ellipsoid({ c: [0, 1.23, 0], r: [0.2, 0.185, 0.19], color: BONE });
      sides((s) => {
        eyeDot(b, s * 0.07, 1.25, 0.178, 0.02, 0.025);
        glint(b, s * 0.064, 1.258, 0.19);
        line(b, [[s * 0.03, 1.303, 0.182], [s * 0.1, 1.288, 0.165]], 0.007, INK);
        line(b, [[0, 1.192, 0.192], [s * 0.055, 1.18, 0.182], [s * 0.088, 1.198, 0.168]], 0.014, INK, 0.009);
      });
      line(b, [[-0.022, 1.158, 0.186], [0, 1.164, 0.19], [0.022, 1.158, 0.186]], 0.006, INK);
      b.ellipsoid({ c: [0, 1.385, 0], r: [0.27, 0.028, 0.25], rot: [0.06, 0, 0.08], color: COAL, size: 0.02 });
      b.frustum({ c: [0.02, 1.58, 0], r0: 0.15, r1: 0.175, h: 0.36, rot: [0, 0, -0.1], color: COAL });
      b.frustum({ c: [0.002, 1.435, 0], r0: 0.16, r1: 0.16, h: 0.065, rot: [0, 0, -0.1], top: false, color: GOLD, size: 0.018 });
      sides((s) => {
        b.part(s > 0 ? P.armL : P.armR);
        b.capsule({ a: [s * 0.31, 0.92, 0], b: [s * 0.42, 0.56, 0.02], ra: 0.07, rb: 0.065, color: BONE, size: 0.022 });
        b.ellipsoid({ c: [s * 0.43, 0.46, 0.03], r: [0.085, 0.1, 0.075], color: COAL, size: 0.022 });
        b.ellipsoid({ c: [s * 0.395, 0.5, 0.1], r: [0.03, 0.045, 0.03], color: COAL, size: 0.016 });
        b.part(s > 0 ? P.legL : P.legR);
        b.capsule({ a: [s * 0.13, 0.34, 0], b: [s * 0.13, 0.16, 0], ra: 0.045, color: BONE, size: 0.018 });
        b.frustum({ c: [s * 0.13, 0.17, 0], r0: 0.088, r1: 0.078, h: 0.14, color: COAL, size: 0.02 });
        b.ellipsoid({ c: [s * 0.13, 0.085, 0.045], r: [0.105, 0.085, 0.15], color: COAL, size: 0.022 });
      });
    },
  },
  {
    name: 'Peg', role: 'jointed puppet', color: '#d9912f',
    rig: {
      body: { c: [0, 0.8, 0], r: [0.2, 0.3, 0.17] }, head: { c: [0, 1.28, 0], r: 0.2 }, neck: [0, 1.08, 0],
      shoulder: [0.25, 0.98, 0], hand: [0.35, 0.5, 0.02], armR: 0.075, hip: [0.12, 0.5, 0], legR: 0.09,
    },
    paint(b, P) {
      const wood = '#8d8696', orange = '#d9912f', joint = '#e0a030';
      b.part(P.body);
      b.ellipsoid({ c: [0, 0.68, 0], r: [0.2, 0.2, 0.17], color: wood });
      b.ellipsoid({ c: [0, 0.8, 0], r: [0.165, 0.14, 0.145], color: wood });
      b.ellipsoid({ c: [0, 0.92, 0], r: [0.19, 0.17, 0.16], color: wood });
      line(b, [[-0.05, 0.875, 0.158], [0.05, 0.935, 0.152]], 0.011, '#4a3a66', 0.008);
      line(b, [[0.05, 0.875, 0.158], [-0.05, 0.935, 0.152]], 0.011, '#4a3a66', 0.008);
      b.torus({ c: [0, 1.08, 0], R: 0.165, r: 0.062, squash: 0.85, color: ringStripes('#5c4a78', '#33273f', 12), size: 0.014 });
      b.box({ c: [0.12, 0.92, 0.175], h: [0.05, 0.15, 0.02], rot: [0.1, 0, -0.08], color: bandStripes('#5c4a78', '#33273f', 15), size: 0.015 });
      b.part(P.head);
      b.ellipsoid({ c: [0, 1.28, 0], r: [0.21, 0.2, 0.2], color: '#a19baa' });
      sides((s) => {
        b.ellipsoid({ c: [s * 0.125, 1.225, 0.155], r: [0.04, 0.03, 0.015], color: '#cf8f8c', size: 0.012, alpha: 0.7 });
        eyeDot(b, s * 0.075, 1.288, 0.19, 0.034, 0.03, '#3c3352');
        b.ellipsoid({ c: [s * 0.075, 1.306, 0.197], r: [0.04, 0.02, 0.012], rot: [0, 0, s * -0.25], color: '#7d7590', size: 0.008, density: 1.5, flat: true });
      });
      line(b, [[-0.03, 1.198, 0.2], [0, 1.212, 0.206], [0.03, 1.198, 0.2]], 0.006, INK);
      b.ellipsoid({ c: [0, 1.46, 0], r: [0.25, 0.025, 0.23], rot: [0, 0, 0.12], color: NIGHT, size: 0.02 });
      b.frustum({ c: [-0.015, 1.585, 0], r0: 0.15, r1: 0.165, h: 0.22, rot: [0, 0, 0.12], color: NIGHT });
      b.frustum({ c: [-0.004, 1.5, 0], r0: 0.158, r1: 0.158, h: 0.05, rot: [0, 0, 0.12], top: false, color: '#4a3a66', size: 0.016 });
      b.box({ c: [0, 1.5, 0.16], h: [0.03, 0.028, 0.008], color: joint, size: 0.01 });
      line(b, [[0.235, 1.435, 0.02], [0.24, 1.39, 0.02]], 0.005, INK);
      b.frustum({ c: [0.24, 1.385, 0.02], r0: 0.032, r1: 0.008, h: 0.025, color: COAL, size: 0.008 });
      b.ellipsoid({ c: [0.24, 1.345, 0.02], r: [0.026, 0.034, 0.026], color: AMBER, emissive: 1, size: 0.01, density: 2 });
      b.frustum({ c: [0.24, 1.308, 0.02], r0: 0.02, r1: 0.03, h: 0.014, color: COAL, size: 0.008, bottom: true });
      sides((s) => {
        b.part(s > 0 ? P.armL : P.armR);
        b.ellipsoid({ c: [s * 0.25, 0.98, 0], r: [0.035, 0.035, 0.035], color: joint, size: 0.012 });
        b.capsule({ a: [s * 0.26, 0.96, 0], b: [s * 0.33, 0.62, 0], ra: 0.068, rb: 0.076, color: wood, size: 0.022 });
        b.frustum({ c: [s * 0.336, 0.6, 0], r0: 0.092, r1: 0.088, h: 0.075, rot: [0, 0, s * 0.2], color: '#33273f', size: 0.018, bottom: true });
        b.ellipsoid({ c: [s * 0.35, 0.5, 0.02], r: [0.08, 0.095, 0.07], color: orange, size: 0.02 });
        b.ellipsoid({ c: [s * 0.32, 0.53, 0.085], r: [0.03, 0.045, 0.03], color: orange, size: 0.015 });
        b.part(s > 0 ? P.legL : P.legR);
        b.ellipsoid({ c: [s * 0.12, 0.5, 0], r: [0.035, 0.035, 0.035], color: joint, size: 0.012 });
        b.capsule({ a: [s * 0.12, 0.48, 0], b: [s * 0.12, 0.22, 0], ra: 0.075, rb: 0.07, color: wood, size: 0.022 });
        b.frustum({ c: [s * 0.12, 0.19, 0], r0: 0.095, r1: 0.09, h: 0.2, color: COAL, size: 0.02 });
        b.ellipsoid({ c: [s * 0.12, 0.07, 0.06], r: [0.1, 0.07, 0.16], color: COAL, size: 0.02 });
        b.ellipsoid({ c: [s * 0.12, 0.062, 0.165], r: [0.085, 0.058, 0.07], color: orange, size: 0.018 });
      });
    },
  },
  {
    name: 'Mr. Sack', role: 'the client', color: '#8d76ad',
    rig: {
      body: { c: [0, 0.5, 0], r: [0.35, 0.33, 0.3] }, head: { c: [0, 0.98, 0], r: 0.2 }, neck: [0, 0.8, 0],
      shoulder: [0.32, 0.68, 0], hand: [0.43, 0.38, 0.02], armR: 0.065, hip: [0.13, 0.2, 0], legR: 0.09,
    },
    paint(b, P) {
      const pj = bandStripes('#8d76ad', '#4b3a66', 13), skin = '#9a94a0';
      b.part(P.body);
      b.ellipsoid({ c: [0, 0.5, 0], r: [0.36, 0.34, 0.3], color: pj, size: 0.018 });
      b.torus({ c: [0, 0.8, 0], R: 0.15, r: 0.045, squash: 0.6, color: '#e8e2ee', size: 0.016 });
      for (const y of [0.7, 0.58, 0.46]) b.ellipsoid({ c: [0, y, 0.3 - (0.7 - y) * 0.03 - (y > 0.6 ? 0.05 : 0)], r: [0.016, 0.016, 0.01], color: '#e8e2ee', size: 0.007, density: 1.5, flat: true });
      line(b, [[0.16, 0.42, 0.262], [0.24, 0.47, 0.215]], 0.006, INK);
      for (const t of [0.25, 0.75]) line(b, [[0.16 + t * 0.08 - 0.012, 0.42 + t * 0.05 + 0.02, 0.262 - t * 0.047], [0.16 + t * 0.08 + 0.012, 0.42 + t * 0.05 - 0.02, 0.262 - t * 0.047]], 0.005, INK);
      b.part(P.head);
      b.ellipsoid({ c: [0, 0.98, 0], r: [0.22, 0.2, 0.2], color: skin });
      sides((s) => {
        b.ellipsoid({ c: [s * 0.085, 1.0, 0.172], r: [0.055, 0.05, 0.02], color: '#6f687a', size: 0.012, density: 1.3 });
        line(b, [[s * 0.085 - 0.028, 1.028, 0.195], [s * 0.085 + 0.028, 0.972, 0.195]], 0.007, COAL);
        line(b, [[s * 0.085 + 0.028, 1.028, 0.195], [s * 0.085 - 0.028, 0.972, 0.195]], 0.007, COAL);
      });
      const smile = [[-0.105, 0.905, 0.162], [-0.055, 0.884, 0.186], [0, 0.877, 0.194], [0.055, 0.884, 0.186], [0.105, 0.905, 0.162]];
      line(b, smile, 0.006, COAL);
      for (const [x, y, z] of smile) line(b, [[x, y + 0.02, z + 0.004], [x, y - 0.02, z + 0.004]], 0.005, COAL);
      line(b, [[-0.06, 1.165, 0.07], [0.02, 1.178, 0.04]], 0.006, '#5e5868');
      for (const t of [0.3, 0.7]) line(b, [[-0.06 + t * 0.08, 1.19, 0.07 - t * 0.03], [-0.06 + t * 0.08, 1.155, 0.085 - t * 0.03]], 0.005, '#5e5868');
      sides((s) => {
        b.part(s > 0 ? P.armL : P.armR);
        b.capsule({ a: [s * 0.32, 0.68, 0], b: [s * 0.42, 0.46, 0.02], ra: 0.068, rb: 0.062, color: bandStripes('#8d76ad', '#4b3a66', 13), size: 0.02 });
        b.frustum({ c: [s * 0.425, 0.445, 0.02], r0: 0.07, r1: 0.068, h: 0.035, rot: [0, 0, s * 0.4], color: '#e8e2ee', size: 0.014, top: false });
        b.ellipsoid({ c: [s * 0.44, 0.385, 0.02], r: [0.055, 0.062, 0.05], color: '#8a8491', size: 0.016 });
        b.part(s > 0 ? P.legL : P.legR);
        b.capsule({ a: [s * 0.13, 0.2, 0], b: [s * 0.13, 0.08, 0], ra: 0.09, rb: 0.078, color: bandStripes('#8d76ad', '#4b3a66', 13, 0.5), size: 0.02 });
        b.ellipsoid({ c: [s * 0.13, 0.042, 0.05], r: [0.085, 0.045, 0.125], color: COAL, size: 0.018 });
      });
    },
  },
  {
    name: 'Hood', role: 'night hauler', color: '#7a52a8',
    rig: {
      body: { c: [0, 0.55, 0], r: [0.29, 0.3, 0.26] }, head: { c: [0, 0.92, 0], r: 0.22 }, neck: [0, 0.76, 0],
      shoulder: [0.27, 0.7, 0], hand: [0.41, 0.4, 0.05], armR: 0.05, hip: [0.11, 0.27, 0], legR: 0.07,
    },
    paint(b, P) {
      const skin = '#5a3878', cloak = NIGHT;
      b.part(P.body);
      b.ellipsoid({ c: [0, 0.55, 0], r: [0.3, 0.3, 0.27], color: skin });
      b.frustum({ c: [0, 0.6, -0.03], r0: 0.39, r1: 0.25, h: 0.5, top: false, color: cloak, keep: (l) => l.z < 0.1 && ragged(0.5, 0.12, 8)(l) });
      b.torus({ c: [0, 0.46, 0], R: 0.292, r: 0.024, color: '#5c4632', size: 0.014 });
      b.ellipsoid({ c: [0, 0.46, 0.3], r: [0.042, 0.046, 0.02], color: BONE, size: 0.01, density: 1.4 });
      sides((s) => eyeDot(b, s * 0.016, 0.468, 0.32, 0.009, 0.011));
      b.box({ c: [-0.25, 0.5, 0.15], h: [0.07, 0.075, 0.045], rot: [0, -0.95, 0], color: '#6b573f', size: 0.016 });
      line(b, [[-0.22, 0.58, 0.19], [0.05, 0.82, 0.2]], 0.012, '#5c4632', 0.01);
      b.part(P.head);
      b.ellipsoid({ c: [0, 0.9, 0.02], r: [0.2, 0.19, 0.19], color: '#63407f' });
      b.ellipsoid({ c: [0, 0.93, -0.02], r: [0.255, 0.255, 0.25], color: cloak, keep: (l) => !(l.z > 0.1 && l.y < 0.13) });
      b.frustum({ c: [0.02, 1.2, -0.1], r0: 0.12, r1: 0.004, h: 0.22, rot: [-0.55, 0, -0.2], color: cloak, size: 0.018 });
      b.torus({ c: [0, 0.77, 0], R: 0.235, r: 0.07, squash: 0.9, color: cloak, size: 0.022 });
      sides((s) => {
        eyeDot(b, s * 0.066, 0.9, 0.2, 0.015, 0.028);
        line(b, [[s * 0.03, 0.948, 0.205], [s * 0.1, 0.966, 0.185]], 0.007, INK);
      });
      line(b, [[-0.025, 0.842, 0.203], [0, 0.85, 0.208], [0.025, 0.842, 0.203]], 0.006, INK);
      sides((s) => {
        b.part(s > 0 ? P.armL : P.armR);
        b.capsule({ a: [s * 0.27, 0.7, 0], b: [s * 0.4, 0.46, 0.05], ra: 0.046, rb: 0.04, color: skin, size: 0.016 });
        b.ellipsoid({ c: [s * 0.41, 0.4, 0.05], r: [0.05, 0.056, 0.046], color: skin, size: 0.015 });
        if (s > 0) { // the lantern travels with the left arm
          line(b, [[0.41, 0.37, 0.06], [0.42, 0.325, 0.07]], 0.005, INK);
          b.frustum({ c: [0.42, 0.315, 0.07], r0: 0.055, r1: 0.014, h: 0.035, color: COAL, size: 0.01 });
          b.frustum({ c: [0.42, 0.255, 0.07], r0: 0.042, r1: 0.046, h: 0.085, color: AMBER, emissive: 1, size: 0.012, density: 2 });
          b.frustum({ c: [0.42, 0.205, 0.07], r0: 0.04, r1: 0.05, h: 0.018, color: COAL, size: 0.01, bottom: true });
        }
        b.part(s > 0 ? P.legL : P.legR);
        b.capsule({ a: [s * 0.11, 0.27, 0], b: [s * 0.11, 0.1, 0], ra: 0.042, color: COAL, size: 0.016 });
        b.ellipsoid({ c: [s * 0.11, 0.06, 0.04], r: [0.078, 0.06, 0.118], color: '#231b2e', size: 0.018 });
      });
    },
  },
  {
    name: 'Doc Beak', role: 'plague doctor', color: '#8d7fb3',
    rig: {
      body: { c: [0, 0.66, 0], r: [0.27, 0.34, 0.24] }, head: { c: [0, 1.17, 0], r: 0.19 }, neck: [0, 1.0, 0],
      shoulder: [0.27, 0.93, 0], hand: [0.375, 0.47, 0.04], armR: 0.08, hip: [0.12, 0.34, 0], legR: 0.1,
    },
    paint(b, P) {
      const coat = '#2c2738', trim = '#3a2c4e', mask = '#cfcad6';
      b.part(P.body);
      b.frustum({ c: [0, 0.62, 0], r0: 0.31, r1: 0.2, h: 0.62, top: false, color: coat, keep: ragged(0.62, 0.07, 10) });
      b.ellipsoid({ c: [0, 0.38, 0], r: [0.26, 0.05, 0.22], color: '#17121f', size: 0.03 });
      b.ellipsoid({ c: [0, 0.91, 0], r: [0.24, 0.12, 0.2], color: coat });
      b.frustum({ c: [0, 0.93, 0], r0: 0.37, r1: 0.16, h: 0.21, top: false, color: trim, keep: ragged(0.21, 0.08, 10) });
      b.torus({ c: [0, 0.62, 0], R: 0.268, r: 0.02, color: '#b08a55', size: 0.012 });
      b.box({ c: [0, 0.62, 0.285], h: [0.04, 0.03, 0.01], color: GOLD, size: 0.011 });
      b.box({ c: [0.17, 0.51, 0.265], h: [0.045, 0.06, 0.03], rot: [0, 0.5, 0], color: '#c9822f', size: 0.014 });
      b.part(P.head);
      b.ellipsoid({ c: [0, 1.15, -0.06], r: [0.225, 0.22, 0.2], color: '#221c2c', keep: (l) => l.z < 0.03 });
      sides((s) => b.capsule({ a: [s * 0.19, 1.16, -0.01], b: [s * 0.215, 0.99, 0.03], ra: 0.04, rb: 0.022, color: '#221c2c', size: 0.016 }));
      b.ellipsoid({ c: [0, 1.17, 0], r: [0.19, 0.18, 0.18], color: mask });
      sides((s) => {
        b.ellipsoid({ c: [s * 0.08, 1.19, 0.162], r: [0.058, 0.068, 0.02], color: '#17121f', size: 0.01, density: 1.5, flat: true });
        glint(b, s * 0.062, 1.212, 0.184, 0.01);
      });
      b.frustum({ c: [0, 1.12, 0.25], r0: 0.052, r1: 0.006, h: 0.17, rot: [Math.PI / 2 + 0.35, 0, 0], color: '#3d2c52', size: 0.012 });
      b.ellipsoid({ c: [0.088, 1.105, 0.17], r: [0.013, 0.022, 0.01], color: '#d98a2f', size: 0.006, density: 2, flat: true });
      line(b, [[-0.02, 1.062, 0.176], [0, 1.068, 0.18], [0.02, 1.062, 0.176]], 0.005, INK);
      b.ellipsoid({ c: [0, 1.34, 0], r: [0.36, 0.03, 0.34], rot: [0.05, 0, -0.04], color: NIGHT, size: 0.024 });
      b.frustum({ c: [0, 1.445, 0], r0: 0.19, r1: 0.18, h: 0.2, color: NIGHT });
      b.frustum({ c: [0, 1.385, 0], r0: 0.197, r1: 0.194, h: 0.055, top: false, color: '#8d7fb3', size: 0.016 });
      b.box({ c: [0, 1.385, 0.2], h: [0.04, 0.03, 0.008], color: GOLD, size: 0.011 });
      sides((s) => {
        b.part(s > 0 ? P.armL : P.armR);
        b.capsule({ a: [s * 0.27, 0.93, 0], b: [s * 0.36, 0.6, 0.03], ra: 0.075, rb: 0.086, color: coat, size: 0.022 });
        b.frustum({ c: [s * 0.366, 0.575, 0.03], r0: 0.102, r1: 0.098, h: 0.08, rot: [0, 0, s * 0.2], color: trim, size: 0.018, bottom: true });
        b.ellipsoid({ c: [s * 0.375, 0.47, 0.04], r: [0.085, 0.095, 0.075], color: mask, size: 0.02 });
        b.ellipsoid({ c: [s * 0.345, 0.5, 0.105], r: [0.03, 0.045, 0.03], color: mask, size: 0.015 });
        if (s < 0) { // the shovel travels with the right arm
          b.capsule({ a: [-0.4, 0.2, 0.13], b: [-0.37, 1.22, 0.05], ra: 0.018, color: '#7a5236', size: 0.012 });
          b.ellipsoid({ c: [-0.366, 1.34, 0.04], r: [0.095, 0.125, 0.014], rot: [0.08, 0, -0.03], color: '#8d8f9c', size: 0.016 });
          b.ellipsoid({ c: [-0.34, 1.4, 0.052], r: [0.035, 0.04, 0.006], color: '#a8652f', size: 0.012, alpha: 0.8 });
        }
        b.part(s > 0 ? P.legL : P.legR);
        b.capsule({ a: [s * 0.12, 0.34, 0], b: [s * 0.12, 0.2, 0], ra: 0.06, color: '#1f1a28', size: 0.018 });
        b.frustum({ c: [s * 0.12, 0.2, 0], r0: 0.102, r1: 0.098, h: 0.085, color: trim, size: 0.018 });
        b.ellipsoid({ c: [s * 0.12, 0.085, 0.06], r: [0.12, 0.09, 0.17], color: '#b9b4c2', size: 0.022 });
        b.box({ c: [s * 0.12, 0.155, 0.135], h: [0.035, 0.024, 0.01], rot: [-0.5, 0, 0], color: GOLD, size: 0.01 });
      });
    },
  },
];

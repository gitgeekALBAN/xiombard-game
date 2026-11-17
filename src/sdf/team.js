// The cheerful digging crew from the team concept sheet, described as numbers for the SDF shader.
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
];

// the same numbers give the six-part skeleton for animation and the ragdoll
export const TEAM = LOOKS.map((d) => {
  const k = d.look, [yB, rB, yN] = k.bean, [yH, rH, zs] = k.head;
  return {
    ...d,
    rig: {
      body: { c: [0, (yB - rB + yN) / 2, 0], r: [rB * 0.9, (yN - yB + rB) / 2, rB * zs * 0.9] }, head: { c: [0, yH, 0], r: rH }, neck: [0, yN, 0],
      shoulder: k.shoulder, hand: k.hand, armR: Math.max(k.arm[0], 0.04), hip: [k.leg[0], k.leg[1], 0], legR: Math.max(k.leg[2], 0.04),
    },
  };
});

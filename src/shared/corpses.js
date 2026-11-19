import { rng } from './rng.js';
import { CREW_SCALE, lookRig, humanRig } from './crew.js';

// The dead are the same folk as the crew, drawn by the same shader on the same six parts: pale, eyes crossed out,
// and every one a little different. A body is described by its seed alone, so the host and every guest build the
// same one. Sizes are kept inside a coffin: no wider than 0.8 m at the belly, no taller than about 1.9 m.
const SKIN = ['#c9d2dc', '#d4cde0', '#c5d6cf', '#ddd6c8', '#b9c3cf', '#d9cbd2'];
const CLOTH = ['#7d5a6a', '#5a6f8a', '#6a7d5a', '#8a7a4a', '#6a5a8a', '#8a5a4a', '#4f7a78', '#7a6a8f'];
const DARK = ['#3a2f45', '#2f3a48', '#3f3a2f', '#45303a', '#2f4040'];
const shade = (hex, k) => '#' + hex.slice(1).match(/../g).map((h) => Math.round(parseInt(h, 16) * k).toString(16).padStart(2, '0')).join('');

function corpseLook(seed) {
  const R = rng(seed * 7 + 3), build = R(); // 0 = a beanpole, 1 = a dumpling
  const rB = 0.16 + 0.12 * build + R.range(-0.01, 0.01), hipY = R.range(0.16, 0.26);
  const yB = hipY + rB * 0.85, rN = Math.max(0.085, rB * R.range(0.55, 0.68)), rH = Math.min(0.2, Math.max(0.115, rN * R.range(1.0, 1.25)));
  let yN = yB + R.range(0.26, 0.56) * (1.15 - 0.4 * build), yH = yN + rH * R.range(0.55, 1.1);
  const over = yH + rH - 1.46;
  if (over > 0) { yN -= over; yH -= over; }
  const sx = rN + R.range(0, 0.05), sy = yN - R.range(0.1, 0.15);
  const cloth = R.pick(CLOTH), dark = R.pick(DARK), skin = R.pick(SKIN), dome = R() < 0.6;
  const look = {
    face: 3, bean: [yB, rB, yN, rN], head: [yH, rH, R.range(0.84, 0.92)],
    shoulder: [sx, sy, 0], hand: [sx + R.range(0.2, 0.26), sy - R.range(0.16, 0.26), 0.02], arm: [0.022 + 0.02 * build, 0.045 + 0.02 * build],
    leg: [rB * R.range(0.29, 0.36), hipY, 0.023 + 0.017 * build, R.range(0.085, 0.13)],
    hat: R() < 0.4 ? (dome ? [yH + rH * 0.4, 0, rH * 1.08 + 0.01, R.range(0.14, 0.19)] : [yH + rH * 0.65, rH * 1.25, rH * 0.78, R.range(0.15, 0.2)]) : null,
    hat2: [dome ? 1 : 0, R.range(0.05, 0.08), dome ? 0.016 : 0.006, dome && R() < 0.5 ? 0.035 : 0],
    scarf: R() < 0.65 ? [yN - 0.05, rN + 0.025, 0.038 + 0.012 * build, R.range(0.25, 0.42)] : null,
    tail: [R.range(-0.1, 0.1), 9, 0.045], hair: R() < 0.3,
    colors: { skin, scarf: cloth, hat: dark, band: cloth, mitten: shade(cloth, 0.6), leg: shade(skin, 0.6), boot: dark, nose: shade(skin, 0.72), hair: R() < 0.5 ? '#77707c' : '#e6e1da' },
  };
  return look;
}

// What a body wears. Bodies arrive in a plain shroud; the delivery note asks for one of OUTFITS (layout.js).
// Clothes in this art style are the hat, scarf, mittens, legs and boots, so an outfit is a look override.
function dressLook(base, outfit, tagged) {
  const L = { ...base, colors: { ...base.colors } }, c = L.colors;
  const [yH, rH] = L.head, [yB, , yN, rN] = L.bean;
  const tall = [yH + rH * 0.4, 0, rH * 1.08 + 0.01, 0.17], cap = [yH + rH * 0.65, rH * 1.25, rH * 0.78, 0.15], scarf = [yN - 0.05, rN + 0.025, 0.045, 0.34];
  switch (outfit) {
    case 'tux':
      Object.assign(L, { hat: tall, hat2: [1, 0.065, 0.016, 0.035], scarf: [yN - 0.05, rN + 0.02, 0.03, 0.2] });
      Object.assign(c, { hat: '#1e1a26', band: '#9a1d34', scarf: '#1e1a26', mitten: '#f2eee6', leg: '#2a2633', boot: '#1e1a26' });
      break;
    case 'sailor':
      Object.assign(L, { hat: cap, hat2: [0, 0.05, 0.006, 0], scarf });
      Object.assign(c, { hat: '#f2eee2', band: '#2c3e70', scarf: '#2c3e70', mitten: '#f2eee2', leg: '#2c3e70', boot: '#f2eee2' });
      break;
    case 'clown':
      Object.assign(L, { hat: [yH + rH * 0.65, rH * 1.25, rH * 0.6, 0.24], hat2: [0, 0.05, 0.006, 0], scarf: [yN - 0.05, rN + 0.05, 0.07, 0.42] });
      Object.assign(c, { hat: '#f0c23a', band: '#d8433a', scarf: '#f4efe4', mitten: '#f4efe4', leg: '#d8433a', boot: '#d8433a', nose: '#d8433a' });
      break;
    case 'gown':
      Object.assign(L, { hat: tall, hat2: [1, 0.09, 0.012, 0.03], scarf });
      Object.assign(c, { hat: '#6b3a7a', band: '#e9d9f0', scarf: '#7d4a8c', mitten: '#e9d9f0', leg: '#6b3a7a', boot: '#3a2a40' });
      break;
    case 'pajamas':
      Object.assign(L, { hat: [yH + rH * 0.65, rH * 1.25, rH * 0.7, 0.26], hat2: [0, 0.05, 0.006, 0], scarf: null });
      Object.assign(c, { hat: '#5d6f8c', band: '#e8e2d4', mitten: c.skin, leg: '#5d6f8c', boot: '#e8e2d4' });
      break;
    default: // shroud
      Object.assign(L, { hat: null, scarf: null });
      Object.assign(c, { mitten: '#d6d0c2', leg: '#d6d0c2', boot: '#c9c2b2' });
  }
  // the name tag hung on them: a little pale patch on the chest
  if (tagged) L.patches = [...(L.patches || []), [0, yB, 0.05, 0.035, '#e9dcc0']];
  return L;
}

// The rig of a body. The simulation always asks for the plain one (the six parts do not depend on clothes); the
// view passes what the body wears and whether a name tag hangs on it.
const defs = new Map();
export function corpseRig(seed, outfit = 'shroud', tagged = 0) {
  const key = `${seed}|${outfit}|${tagged ? 1 : 0}`;
  let rig = defs.get(key);
  if (!rig) {
    if (defs.size > 200) defs.clear();
    const look = dressLook(corpseLook(seed), outfit, tagged);
    rig = humanRig({ look, rig: lookRig(look) }, CREW_SCALE);
    defs.set(key, rig);
  }
  return rig;
}

// six euler rotations: body, head, armL, armR, legL, legR (see rigPose)
export const REST_ROTS = [0, 1, 2, 3, 4, 5].map(() => [0, 0, 0]);
// laid out in a coffin: mittens folded on the belly
export const COFFIN_ROTS = [[0, 0, 0], [0, 0, 0], [-0.55, 0, -0.75], [-0.55, 0, 0.75], [0, 0, 0.03], [0, 0, -0.03]];
// a limp, slightly sprawled pose for a freshly delivered body
export function limpRots(r) {
  return [[0, 0, 0], [r.range(-0.2, 0.2), r.range(-0.5, 0.5), r.range(-0.3, 0.3)], [r.range(-0.5, 0.3), 0, r.range(-0.5, 0.8)], [r.range(-0.5, 0.3), 0, -r.range(-0.5, 0.8)],
    [r.range(-0.3, 0.3), 0, r.range(0, 0.3)], [r.range(-0.3, 0.3), 0, -r.range(0, 0.3)]];
}

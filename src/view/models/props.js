import * as THREE from 'three';
import { toon } from '../../shaders/toon.js';
import { PAL } from '../palette.js';
import { COFFIN } from '../../shared/layout.js';
import { rng } from '../../shared/rng.js';
import { SPH_LO, BOX } from './common.js';
import { Kit, mat4, ribbon, curlPts, offsetPoly, prism } from './propkit.js';

const BALL = new THREE.SphereGeometry(1, 8, 6);
const ROD6 = new THREE.CylinderGeometry(1, 1, 1, 6);
const iron = toon('#3c3848', { mottle: 0.4, rim: 1.2 });

// Classic tapered six-sided coffin, open on top so you can see who is inside.
// Centered on the coffin's center, long axis Z, head end at +Z.
export function buildCoffin(seed) {
  const R = rng(seed);
  const { hx, hy, hz, wall } = COFFIN;
  const out = [[-0.6 * hx, -hz], [0.6 * hx, -hz], [hx, 0.42 * hz], [0.72 * hx, hz], [-0.72 * hx, hz], [-hx, 0.42 * hz]];
  const inn = offsetPoly(out, -(wall + 0.005));
  const woodC = R.pick(['#4d2c4a', '#432a48', '#55304a', '#3e2b4f']);
  const wood = toon(woodC, { color2: PAL.plumDark, stripes: 7, stripeDuty: 0.1, axis: 0, mottle: 0.55 });
  const dark = toon(PAL.plumDark, { mottle: 0.4 });
  const bw = R() < 0.7;
  const rimA = toon(bw ? PAL.stripeLight : PAL.boneShade), rimB = toon(bw ? PAL.stripeDark : PAL.plum);
  const lining = toon(R() < 0.75 ? PAL.redDark : '#5c1f4c', { color2: '#5e1028', stripes: 11, stripeDuty: 0.4, axis: 2, rim: 0.4, emissive: 0.35 });
  const k = new Kit();

  k.add(prism(offsetPoly(out, 0.03), -hy, -hy + 0.07), dark);
  k.add(prism(out, -hy + 0.06, hy - 0.04, inn), wood);
  // striped top rail: real blocks along each edge, so the stripes follow the coffin's outline
  const ro = offsetPoly(out, 0.025), ri = offsetPoly(inn, -0.014);
  let odd = 0;
  for (let e = 0; e < 6; e++) {
    const f = (+e + 1) % 6, n = Math.max(2, Math.round(Math.hypot(ro[f][0] - ro[e][0], ro[f][1] - ro[e][1]) / 0.09));
    const L = (A, t) => [A[e][0] + (A[f][0] - A[e][0]) * t, A[e][1] + (A[f][1] - A[e][1]) * t];
    for (let j = 0; j < n; j++, odd++) k.add(prism([L(ro, j / n), L(ro, (j + 1) / n), L(ri, (j + 1) / n), L(ri, j / n)], hy - 0.05, hy), odd % 2 ? rimB : rimA);
  }
  // red lining on the floor and inner walls; it sits inside the wood, so the inner width is unchanged
  k.add(prism(inn, -hy + 0.06, -hy + 0.08), lining, { outline: false });
  // the end walls are skewed a hair: a face with a constant stripe coordinate makes the toon stripes speckle
  const li = offsetPoly(inn, -0.012);
  li[0][1] += 0.012; li[3][1] -= 0.012;
  k.add(prism(inn, -hy + 0.08, hy - 0.05, li), lining, { outline: false });
  // iron: a band or two, corner posts, ring handles on the long sides
  for (const y of R() < 0.5 ? [-0.03] : [-0.11, 0.07]) k.add(prism(offsetPoly(out, 0.014), y - 0.028, y + 0.028, out), iron);
  for (const [x, z] of offsetPoly(out, 0.012)) k.add(ROD6, iron, { pos: [x, 0, z], scale: [0.028, hy * 2 - 0.1, 0.028] });
  const ring = new THREE.TorusGeometry(0.065, 0.013, 4, 9, Math.PI);
  for (const [a, b] of [[out[1], out[2]], [out[5], out[0]]]) {
    const dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz), nx = dz / l * Math.sign(a[0] + b[0]), nz = -dx / l * Math.sign(a[0] + b[0]);
    const n = Math.sign(nx * (a[0] + b[0])) < 0 ? -1 : 1;
    for (const f of [0.3, 0.72]) {
      const x = a[0] + dx * f + nx * n * 0.035, z = a[1] + dz * f + nz * n * 0.035;
      k.add(ring, iron, { pos: [x, 0.03, z], rot: [0, Math.atan2(-dz, dx), Math.PI], outline: false });
      k.add(BOX, iron, { pos: [x - nx * n * 0.015, 0.035, z - nz * n * 0.015], rot: [0, Math.atan2(-dz, dx), 0], scale: [0.05, 0.05, 0.02], outline: false });
    }
  }
  // a small lumpy pillow at the head end
  k.add(SPH_LO, toon('#ddd2e6', { mottle: 0.3 }), { pos: [0, -hy + 0.12, hz - 0.24], scale: [0.21 + R.range(0, 0.03), 0.06, 0.12], outline: false });
  const g = new THREE.Group();
  k.build(g, 0.02);
  return [g];
}

// ---------- headstones ----------
// Each headstone bakes to one stone mesh, one carving mesh and one outline: about fifty stand in the yard.
const STONES = ['#9a93ad', '#8d88a2', '#a59eb5', '#8a90a5'];
const stoneMat = (c) => toon(c, { gradColor: '#38463c', gradY: [0.04, 0.4], mottle: 0.6 });
const carve = toon('#353048', { rim: 0.15 });

function slabGeo(shape, T, b = 0.025) {
  const g = new THREE.ExtrudeGeometry(shape, { depth: T - 2 * b, bevelEnabled: true, bevelThickness: b, bevelSize: b, bevelSegments: 1, curveSegments: 7 });
  g.translate(0, 0, -(T - 2 * b) / 2);
  return g;
}
const shear = (k, y0) => new THREE.Matrix4().set(1, k, 0, -k * y0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
const poly = (pts) => new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y)));
const circle = (r) => new THREE.CircleGeometry(r, 9);

// Carved and raised motifs, drawn around (cx, cy) on a face at depth z, scale s.
function motif(kind, add, cx, cy, z, s, R) {
  if (kind === 'skull') {
    add(BALL, 'stone', { pos: [cx, cy, z], scale: [0.07 * s, 0.072 * s, 0.03] });
    add(BOX, 'stone', { pos: [cx, cy - 0.066 * s, z], scale: [0.075 * s, 0.04 * s, 0.035] });
    for (const sx of [-1, 1]) add(circle(0.019 * s), 'carve', { pos: [cx + sx * 0.028 * s, cy - 0.002, z + 0.027] });
    add(circle(0.008 * s), 'carve', { pos: [cx, cy - 0.035 * s, z + 0.022] });
    for (const sx of [-1, 1]) {
      add(ribbon([[-0.13 * s, -0.11 * s], [0.13 * s, 0.11 * s]], 0.02 * s), 'carve', { pos: [cx, cy - 0.02 * s, z + 0.002], scale: [sx, 1, 1] });
      for (const e of [-1, 1]) add(circle(0.017 * s), 'carve', { pos: [cx + sx * e * 0.135 * s, cy - 0.02 * s + e * 0.115 * s, z + 0.002] });
    }
  } else if (kind === 'curls') {
    for (const sx of [-1, 1]) add(ribbon(curlPts(0.05 * s, 1.5, 1.1, -sx), (t) => (0.006 + 0.012 * Math.sin(Math.PI * Math.min(1, t * 1.15))) * s), 'carve', { pos: [cx + sx * 0.075 * s, cy, z + 0.002] });
    add(circle(0.014 * s), 'carve', { pos: [cx, cy - 0.06 * s, z + 0.002] });
  } else if (kind === 'cross') {
    add(new THREE.PlaneGeometry(0.03 * s, 0.2 * s), 'carve', { pos: [cx, cy, z + 0.002] });
    add(new THREE.PlaneGeometry(0.13 * s, 0.03 * s), 'carve', { pos: [cx, cy + 0.035 * s, z + 0.002] });
  } else if (kind === 'heart') {
    const h = new THREE.Shape();
    h.moveTo(0, -0.07); h.bezierCurveTo(0.03, -0.035, 0.08, -0.01, 0.07, 0.03); h.bezierCurveTo(0.06, 0.07, 0.01, 0.07, 0, 0.035);
    h.bezierCurveTo(-0.01, 0.07, -0.06, 0.07, -0.07, 0.03); h.bezierCurveTo(-0.08, -0.01, -0.03, -0.035, 0, -0.07);
    add(new THREE.ShapeGeometry(h, 5), 'carve', { pos: [cx, cy, z + 0.002], scale: [s, s, 1] });
  } else if (kind === 'moon') {
    const m = new THREE.Shape();
    m.absarc(0, 0, 0.07, Math.PI * 0.3, Math.PI * 1.7, false);
    m.absarc(0.035, 0, 0.055, Math.PI * 1.55, Math.PI * 0.45, true);
    add(new THREE.ShapeGeometry(m, 8), 'carve', { pos: [cx, cy, z + 0.002], scale: [s, s, 1] });
    for (const [x, y] of [[0.06, 0.05], [0.09, -0.02]]) add(circle(0.009), 'carve', { pos: [cx + x * s, cy + y * s, z + 0.002] });
  }
  void R;
}

// A zigzag crack running in from one edge of the face.
function crack(add, x0, y0, dir, z, R, len = 0.22) {
  const pts = [[0, 0]];
  for (let i = 1; i <= 4; i++) pts.push([dir * len * i / 4, pts[i - 1][1] + R.range(-0.06, 0.05)]);
  add(ribbon(pts, (t) => 0.016 * (1 - t) + 0.003), 'carve', { pos: [x0, y0, z + 0.002] });
}

// Small procedural headstone. kind: round | cross | obelisk | slab. Origin on the ground, face toward +Z.
// opts.blank (round and slab only) leaves the inscription area empty for a name plate and returns that area
// in group.userData.face = { y, w, h, z }; opts.extra = [{ geo, mat, matrix }] is baked into the same meshes.
export function buildHeadstone(kind, w, h, seed, opts = {}) {
  const R = rng(seed);
  const mats = { stone: stoneMat(R.pick(STONES)), carve };
  const k = new Kit();
  let warp = new THREE.Matrix4();
  const add = (geo, m, o = {}) => k.add(geo, mats[m], { matrix: warp.clone().multiply(mat4(o.pos, o.rot, o.scale)), outline: m === 'stone' && o.outline !== false, flat: o.flat });
  const lines = (cx, y, z, ww, n) => { for (let i = 0; i < n; i++) add(new THREE.PlaneGeometry(ww * (1 - i * 0.18) * R.range(0.8, 1), 0.02), 'carve', { pos: [cx, y - i * 0.055, z + 0.002] }); };
  const motifs = ['skull', 'skull', 'curls', 'cross', 'heart', 'moon'];
  const T = kind === 'slab' ? 0.22 : 0.19;
  const ph = R.range(0.1, 0.14);
  let face = null;

  // plinth, sometimes in two cracked blocks
  if (kind !== 'obelisk' && R() < 0.4) {
    for (const sx of [-1, 1]) add(BOX, 'stone', { pos: [sx * w * 0.3, ph / 2, R.range(-0.01, 0.01)], rot: [0, R.range(-0.06, 0.06), 0], scale: [w * 0.58, ph, 0.32], flat: true });
  } else add(BOX, 'stone', { pos: [0, ph / 2, 0], rot: [0, R.range(-0.05, 0.05), 0], scale: [w * 1.16, ph, kind === 'obelisk' ? 0.34 : 0.32], flat: true });
  warp = shear(R.range(-0.06, 0.06), ph);

  if (kind === 'round') {
    const b = 0.025, hw = w / 2 - b, e = 0.035, r = hw - e, yc = h - b - r, y0 = ph - 0.02;
    const s = new THREE.Shape();
    s.moveTo(-hw, y0); s.lineTo(hw, y0); s.lineTo(hw, yc); s.lineTo(hw - e, yc + 0.012);
    s.absarc(0, yc + 0.012, r, 0, Math.PI, false); s.lineTo(-hw, yc);
    add(slabGeo(s, T, b), 'stone');
    const z = T / 2;
    if (opts.blank) {
      face = { y: (y0 + yc + r * 0.55) / 2 + 0.03, w: hw * 1.7, h: yc + r * 0.55 - y0 - 0.1, z };
    } else {
      motif(R.pick(motifs), add, 0, yc + r * 0.25, z, Math.min(1, w * 1.4), R);
      lines(0, yc - 0.1, z, hw * 1.1, R() < 0.5 ? 3 : 2);
    }
    if (!opts.blank && R() < 0.55) crack(add, R() < 0.5 ? -hw : hw, R.range(y0 + 0.15, yc), R() < 0.5 ? 1 : -1, z, R);
  } else if (kind === 'slab') {
    const b = 0.025, hw = w / 2 - b, top = h - b, y0 = ph - 0.02, c = R.range(0.04, 0.09), chip = R() < 0.5;
    const pts = [[-hw, y0], [hw, y0], [hw, top - c], [hw - c, top], [-hw + c, top], [-hw, top - c]];
    if (chip) pts.splice(3, 1, [hw - c * 0.4, top - c * 0.2 - 0.05], [hw - c - 0.08, top - 0.03], [hw - c - 0.1, top]);
    add(slabGeo(poly(pts), T, b), 'stone');
    const z = T / 2;
    // a raised frame around the inscription panel
    const fw = hw - 0.06, fy0 = y0 + 0.08, fy1 = top - 0.07;
    for (const sx of [-1, 1]) add(BOX, 'stone', { pos: [sx * fw, (fy0 + fy1) / 2, z], scale: [0.025, fy1 - fy0, 0.02], outline: false });
    for (const y of [fy0, fy1]) add(BOX, 'stone', { pos: [0, y, z], scale: [fw * 2 + 0.025, 0.025, 0.02], outline: false });
    if (opts.blank) {
      face = { y: (fy0 + fy1) / 2, w: fw * 1.85, h: fy1 - fy0 - 0.05, z };
    } else {
      motif(R.pick(['cross', 'skull', 'curls', 'moon']), add, 0, fy1 - 0.15, z, 0.9, R);
      lines(0, fy1 - 0.33, z, fw * 1.2, Math.max(1, Math.min(4, Math.floor((fy1 - fy0 - 0.35) / 0.06))));
    }
    if (!opts.blank && R() < 0.6) crack(add, -hw, R.range(y0 + 0.1, top - 0.2), 1, z, R, 0.18);
  } else if (kind === 'cross') {
    const pw = w * 0.5, pH = R.range(0.14, 0.22);
    add(BOX, 'stone', { pos: [0, ph + pH / 2 - 0.01, 0], scale: [pw, pH, 0.26], flat: true });
    lines(0, ph + pH * 0.6, 0.13, pw * 0.6, 1);
    const b = 0.022, y1 = ph + pH - 0.03, top = h - b, bw = Math.min(0.095, Math.max(0.065, w * 0.12)), aw = w / 2 - b, ay = y1 + (top - y1) * 0.66, f = 1.4;
    const pts = [[-bw, y1], [bw, y1], [bw, ay - bw], [aw, ay - bw * f], [aw, ay + bw * f], [bw, ay + bw], [bw * f, top], [-bw * f, top], [-bw, ay + bw], [-aw, ay + bw * f], [-aw, ay - bw * f], [-bw, ay - bw]];
    add(slabGeo(poly(pts), 0.17, b), 'stone');
    add(new THREE.TorusGeometry(aw * 0.6, 0.026, 4, 18), 'stone', { pos: [0, ay, 0], scale: [1, 1, 4] });
    const z = 0.085;
    if (R() < 0.6) motif('skull', add, 0, ay, z, 0.6, R);
    else add(circle(0.035), 'carve', { pos: [0, ay, z + 0.002] });
    if (R() < 0.5) crack(add, bw, R.range(y1 + 0.1, ay - 0.15), -1, z, R, 0.1);
  } else { // obelisk
    const pH = 0.24, pw = Math.min(0.42, w * 0.62);
    add(BOX, 'stone', { pos: [0, ph + pH / 2 - 0.01, 0], scale: [pw, pH, 0.3], flat: true });
    lines(0, ph + pH * 0.62, 0.15, pw * 0.6, 2);
    const y1 = ph + pH - 0.02, sb = Math.min(0.24, w * 0.4), st = sb * 0.62, tipH = sb * 0.85, H = h - y1 - tipH;
    add(new THREE.CylinderGeometry(st / Math.SQRT2, sb / Math.SQRT2, H, 4, 1), 'stone', { pos: [0, y1 + H / 2, 0], rot: [0, Math.PI / 4, 0], flat: true });
    add(new THREE.ConeGeometry(st / Math.SQRT2, tipH, 4), 'stone', { pos: [0, y1 + H + tipH / 2, 0], rot: [0, Math.PI / 4, 0], flat: true });
    const my = y1 + H * 0.68, z = (sb + (st - sb) * 0.68) / 2;
    motif(R.pick(['skull', 'curls', 'cross']), add, 0, my, z, 0.75, R);
    if (R() < 0.6) crack(add, -sb / 2, y1 + H * R.range(0.15, 0.4), 1, (sb + (st - sb) * 0.3) / 2, R, 0.1);
  }
  for (const e of opts.extra || []) k.add(e.geo, e.mat, { matrix: e.matrix });
  const g = new THREE.Group();
  k.build(g, 0.018);
  if (face) g.userData.face = face;
  return g;
}

import * as THREE from 'three';
import { PAL } from '../palette.js';
import { COFFIN } from '../../shared/layout.js';
import { rng } from '../../shared/rng.js';
import { BOX } from './common.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { Kit, PaintKit, mat4, offsetPoly, prism } from './propkit.js';
import { outlineMat } from '../../shaders/toon.js';
import { propPaint, PAINT } from '../../shaders/paint-props.js';

// Classic tapered six-sided coffin, open on top so you can see who is inside.
// Centered on the coffin's center, long axis Z, head end at +Z.
// The solids carry the silhouette only: a plinth, the walls, the striped top rail, the lining's floor, a pillow and
// four ring handles. Planks, nails, iron bands and corner posts, rivets, handle plates and the pleated lining are
// painted (paint-props.js). One mesh plus one ink hull.
// Quads with a chosen facing: face(A, B, C, D, want, u) adds two triangles whose normal points along `want`,
// and keeps a per-vertex value u (one per corner) in step with the winding.
class Soup {
  constructor() { this.pos = []; this.u = []; }
  face(A, B, C, D, want, u = [0, 0, 0, 0]) {
    const e1 = [B[0] - A[0], B[1] - A[1], B[2] - A[2]], e2 = [C[0] - A[0], C[1] - A[1], C[2] - A[2]];
    const n = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]];
    const ok = n[0] * want[0] + n[1] * want[1] + n[2] * want[2] >= 0;
    const idx = ok ? [0, 1, 2, 0, 2, 3] : [0, 2, 1, 0, 3, 2], V = [A, B, C, D];
    for (const i of idx) { this.pos.push(...V[i]); this.u.push(u[i]); }
  }
  geometry() {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.pos, 3));
    g.computeVertexNormals();
    return g;
  }
}
// outward horizontal normal of the edge a -> b of a polygon around the origin
const outward = (a, b) => { const dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz); let nx = dz / l, nz = -dx / l; if (nx * (a[0] + b[0]) + nz * (a[1] + b[1]) < 0) { nx = -nx; nz = -nz; } return [nx, 0, nz]; };
const HANDLE_RING = new THREE.TorusGeometry(0.065, 0.013, 3, 5, Math.PI);
const PILLOW = new THREE.SphereGeometry(1, 7, 4);
// lid: 0 open, 1 closed, 2 nailed shut (the cross and the nail heads are paint, see coffinLid in paint-props.js)
export function buildCoffin(seed, lid = 0) {
  const R = rng(seed);
  const { hx, hy, hz, wall } = COFFIN;
  const out = [[-0.6 * hx, -hz], [0.6 * hx, -hz], [hx, 0.42 * hz], [0.72 * hx, hz], [-0.72 * hx, hz], [-hx, 0.42 * hz]];
  const inn = offsetPoly(out, -(wall + 0.005));
  const woodC = R.pick(['#4d2c4a', '#432a48', '#55304a', '#3e2b4f']);
  const bw = R() < 0.7;
  const rimA = bw ? PAL.stripeLight : PAL.boneShade, rimB = new THREE.Color(bw ? PAL.stripeDark : PAL.plum);
  const liningC = R() < 0.75 ? PAL.redDark : '#5c1f4c';
  const twoBands = R() < 0.5 ? 0 : 1;
  const k = new PaintKit();
  const plain = (color, mottle = 0.4, rim = 1, em = 0) => ({ id: PAINT.PLAIN, color, k: [mottle, rim, em] });
  // the outline polygon runs clockwise seen from above (x right, z toward the viewer), so walls wind as below
  const y0 = -hy + 0.06, y1 = hy - 0.05;
  k.add(prism(offsetPoly(out, 0.03), -hy, -hy + 0.07), plain(PAL.plumDark));
  const walls = new Soup(), lining = new Soup();
  for (let e = 0; e < 6; e++) {
    const f = (e + 1) % 6, A = out[e], B = out[f], a = inn[e], b = inn[f], o = outward(A, B);
    walls.face([A[0], y0, A[1]], [A[0], y1, A[1]], [B[0], y1, B[1]], [B[0], y0, B[1]], o);
    lining.face([a[0], y0, a[1]], [a[0], y1, a[1]], [b[0], y1, b[1]], [b[0], y0, b[1]], o.map((x) => -x));
  }
  // floor of the lining (seen from above only)
  for (let e = 1; e < 5; e++) lining.face([inn[0][0], y0 + 0.02, inn[0][1]], [inn[e][0], y0 + 0.02, inn[e][1]], [inn[e + 1][0], y0 + 0.02, inn[e + 1][1]], [inn[e + 1][0], y0 + 0.02, inn[e + 1][1]], [0, 1, 0]);
  k.add(walls.geometry(), { id: PAINT.COFFIN_WOOD, color: woodC, k: [twoBands, R() * 50, 0] });
  k.add(lining.geometry(), { id: PAINT.COFFIN_LINING, color: liningC }, { outline: false });
  // striped top rail: one block per edge; the stripe index (aQ.x) runs along it so the stripes follow the outline
  const ro = offsetPoly(out, 0.025), ri = offsetPoly(inn, -0.014), t0 = hy - 0.05, t1 = hy;
  const rail = new Soup();
  let odd = 0;
  for (let e = 0; e < 6; e++) {
    const f = (e + 1) % 6, n = Math.max(2, Math.round(Math.hypot(ro[f][0] - ro[e][0], ro[f][1] - ro[e][1]) / 0.09));
    const P = (A, y) => [A[0], y, A[1]], o = outward(out[e], out[f]);
    // the top and bottom are trapezoids: u rides as (u * q, q) with q the length of the side it is on, so the
    // stripes divide both sides evenly and run straight across (projective interpolation)
    const qo = Math.hypot(ro[f][0] - ro[e][0], ro[f][1] - ro[e][1]), qi = Math.hypot(ri[f][0] - ri[e][0], ri[f][1] - ri[e][1]);
    const U = (u, q) => [u * q, q];
    rail.face(P(ro[e], t1), P(ri[e], t1), P(ri[f], t1), P(ro[f], t1), [0, 1, 0], [U(odd, qo), U(odd, qi), U(odd + n, qi), U(odd + n, qo)]);
    rail.face(P(ro[e], t0), P(ro[e], t1), P(ro[f], t1), P(ro[f], t0), o, [U(odd, 1), U(odd, 1), U(odd + n, 1), U(odd + n, 1)]);
    rail.face(P(ri[e], t0), P(ri[e], t1), P(ri[f], t1), P(ri[f], t0), o.map((x) => -x), [U(odd, 1), U(odd, 1), U(odd + n, 1), U(odd + n, 1)]);
    rail.face(P(ro[e], t0), P(ri[e], t0), P(ri[f], t0), P(ro[f], t0), [0, -1, 0], [U(odd, qo), U(odd, qi), U(odd + n, qi), U(odd + n, qo)]);
    odd += n;
  }
  k.add(rail.geometry(), { id: PAINT.COFFIN_RAIL, color: rimA, k: [rimB.r, rimB.g, rimB.b] });
  { const Q = k.parts[k.parts.length - 1].attributes.aQ; rail.u.forEach(([uq, q], i) => Q.setXY(i, uq, q)); }
  // ring handles on the long sides (their plates are painted on the wall)
  for (const [a, b] of [[out[1], out[2]], [out[5], out[0]]]) {
    const dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz), nx = dz / l * Math.sign(a[0] + b[0]), nz = -dx / l * Math.sign(a[0] + b[0]);
    const n = Math.sign(nx * (a[0] + b[0])) < 0 ? -1 : 1;
    for (const f of [0.3, 0.72]) {
      const x = a[0] + dx * f + nx * n * 0.035, z = a[1] + dz * f + nz * n * 0.035;
      k.add(HANDLE_RING, plain('#3c3848', 0.4, 1.2), { pos: [x, 0.03, z], rot: [0, Math.atan2(-dz, dx), Math.PI], outline: false });
    }
  }
  // a small lumpy pillow at the head end
  k.add(PILLOW, plain('#ddd2e6', 0.3), { pos: [0, -hy + 0.12, hz - 0.24], scale: [0.21 + R.range(0, 0.03), 0.06, 0.12], outline: false });
  if (lid) k.add(prism(offsetPoly(out, 0.035), hy - 0.005, hy + 0.06), { id: PAINT.COFFIN_LID, color: woodC, k: [lid === 2 ? 1 : 0, R() * 50, 0] });
  const g = new THREE.Group();
  const { geo, hull } = k.bake();
  g.add(new THREE.Mesh(geo, propPaint()));
  g.add(new THREE.Mesh(hull, outlineMat(0.02)));
  return [g];
}

// ---------- headstones ----------
// A headstone is its outline extruded once, on a plinth: one painted mesh and one ink hull. Bevels, the raised
// frame, carved motifs, lettering, cracks, lichen and moss are paint (paint-props.js, stonePaint), drawn from the
// stone's own unsheared coordinates; the crooked lean is a shear of the solid. About fifty stand in the yard.
const STONES = ['#9a93ad', '#8d88a2', '#a59eb5', '#8a90a5'];
const MOTIF = { skull: 0, curls: 1, cross: 2, heart: 3, moon: 4, dot: 5 };
const KIND = { round: 0, slab: 1, cross: 2, obelisk: 3 };
const shear = (k, y0) => new THREE.Matrix4().set(1, k, 0, -k * y0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
const poly = (pts) => new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y)));
function slabGeo(shape, T, seg = 5) {
  const g = new THREE.ExtrudeGeometry(shape, { depth: T, bevelEnabled: false, curveSegments: seg });
  g.translate(0, 0, -T / 2);
  return g;
}

// Small procedural headstone. kind: round | cross | obelisk | slab. Origin on the ground, face toward +Z.
// opts.blank (round and slab only) leaves the inscription area empty for a name plate and returns that area
// in group.userData.face = { y, w, h, z }; opts.extra = [{ geo, mat, matrix }] is baked in too (one mesh per
// extra material, and into the same ink hull).
export function buildHeadstone(kind, w, h, seed, opts = {}) {
  const R = rng(seed);
  const color = R.pick(STONES);
  const parts = []; // [geo, { matrix, pspace, flat }]
  const T = kind === 'slab' ? 0.22 : 0.19;
  const ph = R.range(0.1, 0.14);
  let face = null, motif = MOTIF.dot, blank = !!opts.blank && (kind === 'round' || kind === 'slab'), cracked = false, nl = 0, extra = 0;
  const box = (pos, rot, scale) => parts.push([BOX, { matrix: mat4(pos, rot, scale), flat: true }]);

  // plinth, sometimes in two cracked blocks
  if (kind !== 'obelisk' && R() < 0.4) {
    for (const sx of [-1, 1]) box([sx * w * 0.3, ph / 2, R.range(-0.01, 0.01)], [0, R.range(-0.06, 0.06), 0], [w * 0.58, ph, 0.32]);
  } else box([0, ph / 2, 0], [0, R.range(-0.05, 0.05), 0], [w * 1.16, ph, kind === 'obelisk' ? 0.34 : 0.32]);
  const warp = shear(R.range(-0.06, 0.06), ph);
  const lean = (geo, m = new THREE.Matrix4(), flat = false) => parts.push([geo, { matrix: warp.clone().multiply(m), pspace: m, flat }]);

  if (kind === 'round') {
    const hw = w / 2, e = 0.035, r = hw - 0.025 - e, yc = h - 0.025 - r, y0 = ph - 0.02;
    const s = new THREE.Shape();
    s.moveTo(-hw, y0); s.lineTo(hw, y0); s.lineTo(hw, yc); s.lineTo(hw - e, yc + 0.012);
    s.absarc(0, yc + 0.012, hw - e, 0, Math.PI, false); s.lineTo(-hw, yc);
    lean(slabGeo(s, T, 6));
    if (blank) face = { y: (y0 + yc + r * 0.55) / 2 + 0.03, w: (hw - 0.025) * 1.7, h: yc + r * 0.55 - y0 - 0.1, z: T / 2 };
    else { motif = MOTIF[R.pick(['skull', 'skull', 'curls', 'cross', 'heart', 'moon'])]; nl = R() < 0.5 ? 3 : 2; }
    cracked = !blank && R() < 0.55;
  } else if (kind === 'slab') {
    const b = 0.025, hw = w / 2 - b, top = h - b, y0 = ph - 0.02, c = R.range(0.04, 0.09), chip = R() < 0.5;
    const pts = [[-hw, y0], [hw, y0], [hw, top - c], [hw - c, top], [-hw + c, top], [-hw, top - c]];
    if (chip) pts.splice(3, 1, [hw - c * 0.4, top - c * 0.2 - 0.05], [hw - c - 0.08, top - 0.03], [hw - c - 0.1, top]);
    lean(slabGeo(poly(offsetPoly(pts, b)), T));
    extra = c;
    const fw = hw - 0.06, fy0 = y0 + 0.08, fy1 = top - 0.07;
    if (blank) face = { y: (fy0 + fy1) / 2, w: fw * 1.85, h: fy1 - fy0 - 0.05, z: T / 2 };
    else { motif = MOTIF[R.pick(['cross', 'skull', 'curls', 'moon'])]; nl = Math.max(1, Math.min(4, Math.floor((fy1 - fy0 - 0.35) / 0.06))); }
    cracked = !blank && R() < 0.6;
  } else if (kind === 'cross') {
    const pw = w * 0.5, pH = R.range(0.14, 0.22);
    box([0, ph + pH / 2 - 0.01, 0], [0, 0, 0], [pw, pH, 0.26]);
    extra = pH;
    const b = 0.022, y1 = ph + pH - 0.03, top = h - b, bw = Math.min(0.095, Math.max(0.065, w * 0.12)), aw = w / 2 - b, ay = y1 + (top - y1) * 0.66, f = 1.4;
    const B = bw + b, A = w / 2, F = bw * f + b, E = bw * f + b;
    lean(slabGeo(poly([[-B, y1], [B, y1], [B, ay - B], [A, ay - F], [A, ay + F], [B, ay + B], [E, h], [-E, h], [-B, ay + B], [-A, ay + F], [-A, ay - F], [-B, ay - B]]), 0.17));
    lean(new THREE.TorusGeometry(aw * 0.6, 0.026, 4, 9), mat4([0, ay, 0], [0, 0, 0], [1, 1, 4]));
    motif = R() < 0.6 ? MOTIF.skull : MOTIF.dot;
    cracked = R() < 0.5;
  } else { // obelisk
    const pH = 0.24, pw = Math.min(0.42, w * 0.62);
    box([0, ph + pH / 2 - 0.01, 0], [0, 0, 0], [pw, pH, 0.3]);
    const y1 = ph + pH - 0.02, sb = Math.min(0.24, w * 0.4), st = sb * 0.62, tipH = sb * 0.85, H = h - y1 - tipH;
    lean(new THREE.CylinderGeometry(st / Math.SQRT2, sb / Math.SQRT2, H, 4, 1), mat4([0, y1 + H / 2, 0], [0, Math.PI / 4, 0]), true);
    lean(new THREE.ConeGeometry(st / Math.SQRT2, tipH, 4), mat4([0, y1 + H + tipH / 2, 0], [0, Math.PI / 4, 0]), true);
    motif = MOTIF[R.pick(['skull', 'curls', 'cross'])];
    cracked = R() < 0.6;
  }
  const paint = { id: PAINT.STONE, color, k: [KIND[kind], motif, (blank ? 1 : 0) + (cracked ? 2 : 0) + nl * 8], q: [w, h, ph, extra] };
  const k = new PaintKit();
  for (const [geo, o] of parts) k.add(geo, paint, o);
  const { geo, hull } = k.bake();
  const g = new THREE.Group();
  g.add(new THREE.Mesh(geo, propPaint()));
  let hullGeo = hull;
  if (opts.extra && opts.extra.length) {
    const ek = new Kit();
    for (const e of opts.extra) ek.add(e.geo, e.mat, { matrix: e.matrix });
    const { meshes, hull: eh } = ek.bake();
    for (const { geo: eg, mat } of meshes) g.add(new THREE.Mesh(eg, mat));
    hull.deleteAttribute('aRig');
    hullGeo = mergeGeometries([hull, eh]);
  }
  g.add(new THREE.Mesh(hullGeo, outlineMat(0.018)));
  if (face) g.userData.face = face;
  return g;
}

// All the old headstones of the yard in one painted mesh and one ink hull (2 draw calls for the lot instead of 2
// each). stones: [{ kind, w, h, seed, x, z, rx, ry, rz }] as in DECOR.stones; each one looks exactly as
// buildHeadstone(kind, w, h, seed) placed at (x, 0, z) with rotation (rx, ry, rz). The paint reads the stone's own
// coordinates (aP, aPN), so baking the placement into the vertices does not move the carvings.
export function buildHeadstoneField(stones) {
  const paint = [], hull = [];
  const m = new THREE.Matrix4(), e = new THREE.Euler(), q = new THREE.Quaternion(), one = new THREE.Vector3(1, 1, 1);
  for (const st of stones) {
    const g = buildHeadstone(st.kind, st.w, st.h, st.seed);
    m.compose(new THREE.Vector3(st.x, 0, st.z), q.setFromEuler(e.set(st.rx || 0, st.ry || 0, st.rz || 0)), one);
    const [p, h] = g.children.map((c) => c.geometry.clone().applyMatrix4(m));
    paint.push(p);
    hull.push(h);
  }
  const g = new THREE.Group();
  g.add(new THREE.Mesh(mergeGeometries(paint), propPaint()));
  g.add(new THREE.Mesh(mergeGeometries(hull), outlineMat(0.018)));
  return g;
}

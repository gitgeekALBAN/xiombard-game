import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { outlineMat, LANTERN_Y } from '../../shaders/toon.js';
import { paintMat, paintAttrs, spec, P } from '../../shaders/paint-env.js';
import { rng } from '../../shared/rng.js';
import { PAL } from '../palette.js';
import { outlineGeo } from './common.js';

// Static set pieces for the yard: trees, shed, fence, gates, lantern posts, small dressing.
// Hard shapes are plain primitives with as few triangles as the silhouette needs; small relief (planks, shingles,
// mortar, bark grooves, window frames, skull eyes, scarf stripes) is painted by the yard's one material
// (shaders/paint-env.js). Everything static is written into a Batch: one painted mesh plus an ink hull per line weight.

// Paint specs (what each piece is painted with), not materials: the whole Batch shares paintMat().
export const MAT = {
  bark: spec('#2c2338', { pat: P.bark, p1: 5, rim: 1.3 }),
  twig: spec('#2c2338', { pat: P.bark, p1: 2, rim: 1.3 }),
  wood: spec(PAL.wood, { p1: 0.6, rim: 0.8 }),
  woodDark: spec('#33243a', { p1: 0.6, rim: 0.8 }),
  woodLight: spec(PAL.woodLight, { p1: 0.5 }),
  board: spec(PAL.wood, { pat: P.grain, p1: 2, rim: 0.8 }),
  boardDark: spec('#33243a', { pat: P.grain, p1: 2, rim: 0.8 }),
  boardLight: spec(PAL.woodLight, { pat: P.grain, p1: 2 }),
  planks: spec(PAL.wood, { pat: P.planks, p1: 0.3, rim: 0.8 }),
  shingle: spec(PAL.plum, { pat: P.shingles }),
  iron: spec(PAL.coal, { rim: 1.5 }),
  stone: spec('#8e88a6', { pat: P.stone }),
  bone: spec(PAL.bone),
  skull2: spec(PAL.bone, { pat: P.skull, p1: 1 }),
  ink: spec(PAL.ink, { rim: 0.6 }),
  crowHead: spec(PAL.ink, { pat: P.eyes, rim: 0.6 }),
  glass: spec(PAL.amber, { p2: 0.88 }),
  scarf: spec(PAL.bone, { pat: P.stripes, p1: 7 }),
  lid: spec('#33243a', { pat: P.lid, rim: 0.8 }),
};

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const UP = V(0, 1, 0);
const _q = new THREE.Quaternion(), _e = new THREE.Euler(), _s = new THREE.Vector3();
// matrix from position, euler rotation and scale (arrays or numbers)
export function M(pos = [0, 0, 0], rot = [0, 0, 0], scale = 1) {
  const s = Array.isArray(scale) ? scale : [scale, scale, scale];
  return new THREE.Matrix4().compose(V(...pos), _q.setFromEuler(_e.set(...rot)), _s.set(...s));
}

const KEEP = new Set(['position', 'normal', 'uv', 'aObj']);
// Collects painted geometry and merges it once at the end: one mesh for the paint, one ink hull per line weight.
// add(geo, spec, matrix, outline, local): `matrix` places the piece in the world; `local` (default `matrix`) places it
// in the paint space of its set piece, so patterns stay put when the piece is moved. A geometry that already has an
// aObj attribute keeps it (boxes made by paintBox paint in their own centered meters).
export class Batch {
  constructor() { this.geos = []; this.hulls = new Map(); }
  add(geo, s, matrix, outline = 0.02, local) {
    const g = geo.index ? geo.toNonIndexed() : geo.clone();
    for (const k of Object.keys(g.attributes)) if (!KEEP.has(k)) g.deleteAttribute(k);
    if (!g.attributes.normal) g.computeVertexNormals();
    paintAttrs(g, s, local || matrix);
    if (matrix) g.applyMatrix4(matrix);
    this.geos.push(g);
    // two line weights only, so the whole batch costs at most two hull meshes
    outline = outline ? (outline <= 0.012 ? 0.01 : 0.02) : 0;
    if (outline) {
      if (!this.hulls.has(outline)) this.hulls.set(outline, []);
      const h = new THREE.BufferGeometry();
      h.setAttribute('position', g.attributes.position);
      this.hulls.get(outline).push(h);
    }
    return g;
  }
  // a parent matrix applied to everything added through the returned adder; paint space stays the piece's own
  sub(parent) {
    return (geo, s, matrix, outline, local) => this.add(geo, s, matrix ? parent.clone().multiply(matrix) : parent, outline, local || matrix || new THREE.Matrix4());
  }
  build(parent) {
    let tris = 0;
    if (this.geos.length) {
      const merged = mergeGeometries(this.geos);
      merged.computeBoundingSphere();
      parent.add(new THREE.Mesh(merged, paintMat()));
      tris += merged.attributes.position.count / 3;
    }
    for (const [w, list] of this.hulls) {
      const hull = outlineGeo(mergeGeometries(list));
      hull.computeBoundingSphere();
      parent.add(new THREE.Mesh(hull, outlineMat(w)));
      tris += hull.index.count / 3;
    }
    this.geos = []; this.hulls.clear();
    return tris;
  }
}

// shared low-poly primitives (decoration does not need many segments)
export const G = {
  box: new THREE.BoxGeometry(1, 1, 1),
  cyl6: new THREE.CylinderGeometry(1, 1, 1, 6),
  tube6: new THREE.CylinderGeometry(1, 1, 1, 6, 1, true), // no caps, for pieces whose ends are hidden
  tube4: new THREE.CylinderGeometry(1, 1, 1, 4, 1, true),
  sph: new THREE.SphereGeometry(1, 8, 6),
  sphLo: new THREE.SphereGeometry(1, 6, 4),
  ball: new THREE.SphereGeometry(1, 6, 3),
  oct: new THREE.OctahedronGeometry(1, 0),
  cone4: new THREE.ConeGeometry(1, 1, 4),
  cone4open: new THREE.ConeGeometry(1, 1, 4, 1, true),
  cone6: new THREE.ConeGeometry(1, 1, 6),
};

// A box of the given size that paints in its own centered meters (doors, windows, lantern glass).
export function paintBox(w, h, d) {
  const g = new THREE.BoxGeometry(w, h, d).toNonIndexed();
  g.setAttribute('aObj', g.attributes.position.clone());
  return g;
}

// Tapered tube along a curve. r(t, angle) gives the radius, so trunks can carry twisted ridges.
// Sampled by the curve's own parameter (not arc length), so dense control points (curls) get dense rings.
// Frames are parallel-transported, so spirals do not flip. uv: x around (0..1), y meters along (for bark).
export function tube(curve, segs, radial, r) {
  const pts = [];
  for (let i = 0; i <= segs; i++) pts.push(curve.getPoint(i / segs));
  const tan = pts.map((p, i) => pts[Math.min(segs, i + 1)].clone().sub(pts[Math.max(0, i - 1)]).normalize());
  let N = Math.abs(tan[0].y) < 0.9 ? V(0, 1, 0) : V(1, 0, 0);
  N.addScaledVector(tan[0], -N.dot(tan[0])).normalize();
  const pos = [], uv = [], idx = [], d = V(), B = V();
  let along = 0;
  for (let i = 0; i <= segs; i++) {
    if (i) {
      const q = new THREE.Quaternion().setFromUnitVectors(tan[i - 1], tan[i]);
      N.applyQuaternion(q).addScaledVector(tan[i], -N.dot(tan[i])).normalize();
      along += pts[i].distanceTo(pts[i - 1]);
    }
    B.crossVectors(tan[i], N);
    const p = pts[i], t = i / segs;
    // the seam column is doubled so the bark's "around" coordinate does not wrap inside a face
    for (let j = 0; j <= radial; j++) {
      const a = (j / radial) * Math.PI * 2;
      const rr = r(t, a);
      d.copy(N).multiplyScalar(Math.cos(a)).addScaledVector(B, Math.sin(a));
      pos.push(p.x + d.x * rr, p.y + d.y * rr, p.z + d.z * rr);
      uv.push(j / radial, along);
    }
  }
  const W = radial + 1;
  for (let i = 0; i < segs; i++) {
    for (let j = 0; j < radial; j++) {
      const a = i * W + j, b = a + 1, c = a + W, e = b + W;
      idx.push(a, c, b, b, c, e);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  // the doubled seam would split the smooth shading: give both copies the same normal
  const n = g.attributes.normal;
  for (let i = 0; i <= segs; i++) {
    const a = i * W, b = a + radial;
    const x = n.getX(a) + n.getX(b), y = n.getY(a) + n.getY(b), z = n.getZ(a) + n.getZ(b), l = Math.hypot(x, y, z) || 1;
    n.setXYZ(a, x / l, y / l, z / l); n.setXYZ(b, x / l, y / l, z / l);
  }
  return g;
}

// Points of a flat, tightening spiral that continues a path ending at `end` heading `dir`.
// `bend` is the in-plane side the spiral curls toward.
export function spiralPts(end, dir, bend, radius, turns = 1.3, n = 10) {
  const d = dir.clone().normalize();
  const nrm = bend.clone().addScaledVector(d, -bend.dot(d)).normalize();
  const c = end.clone().addScaledVector(nrm, radius);
  const out = [];
  for (let k = 1; k <= n; k++) {
    const a = (k / n) * turns * Math.PI * 2;
    const R = radius * Math.exp(-0.32 * a);
    out.push(c.clone().addScaledVector(nrm, -Math.cos(a) * R).addScaledVector(d, Math.sin(a) * R));
  }
  return out;
}

// A wandering limb that ends in a curl. Returns { geo, pts, curve }.
function limb(R, start, dir, len, r0, r1, curlR, opts = {}) {
  const { steps = 4, rise = 0.15, wob = 0.35, segs = 22, radial = 6, turns = R.range(1.1, 1.6) } = opts;
  const pts = [start.clone()];
  const d = dir.clone().normalize();
  let p = start.clone();
  for (let i = 0; i < steps; i++) {
    d.applyAxisAngle(UP, R.range(-wob, wob));
    d.y += rise + R.range(-0.12, 0.12);
    d.normalize();
    p = p.clone().addScaledVector(d, len / steps);
    pts.push(p);
  }
  const bendUp = opts.bendUp ?? R() < 0.6;
  const bend = bendUp ? UP.clone() : UP.clone().negate();
  pts.push(...spiralPts(p, d, bend, curlR, turns, opts.curlN || 9));
  const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
  const geo = tube(curve, segs, radial, (t) => r0 + (r1 - r0) * Math.pow(t, 0.75));
  return { geo, pts, curve, tipStart: p };
}

// Twisted storybook tree: a ridged trunk on spreading roots, a hollow, and limbs that end in spiral curls.
// The limbs and their curls are the silhouette and stay geometry (thin tubes, three sides); the bark grooves,
// knots and the striped scarf are paint. `face` is the yaw (radians) the hollow looks toward.
// Returns { perch } in tree space: a spot for a crow.
export function treeParts(add, seed, height, face) {
  const R = rng(seed);
  face ??= R() * Math.PI * 2;
  const H = height * 0.46;
  const ph = R() * 6;
  const lean = V(R.range(-1, 1), 0, R.range(-1, 1)).normalize().multiplyScalar(R.range(0.25, 0.6));
  const tp = [];
  for (let i = 0; i <= 5; i++) {
    const t = i / 5;
    tp.push(V(Math.sin(t * 4.2 + ph) * 0.3 * t + lean.x * t * t, t * H - (i === 0 ? 0.3 : 0), Math.cos(t * 3.6 + ph) * 0.3 * t + lean.z * t * t));
  }
  const trunk = new THREE.CatmullRomCurve3(tp);
  const twist = R.range(5, 8) * (R() < 0.5 ? -1 : 1);
  // six sides: the three twisting ridges land on alternate corners, so the trunk keeps its lumpy, turning outline
  add(tube(trunk, 10, 6, (t, a) => {
    const base = 0.42 - t * 0.16 + 0.42 * Math.exp(-t * 9);
    return base * (1 + 0.17 * Math.sin(a * 3 + t * twist));
  }), MAT.bark, null, 0.03);

  // roots: start inside the trunk, arch out and dive into the ground
  const nr = 4 + Math.floor(R() * 2);
  for (let i = 0; i < nr; i++) {
    const a = (i / nr) * Math.PI * 2 + R.range(-0.4, 0.4), L = R.range(1.2, 1.9);
    const dx = Math.cos(a), dz = Math.sin(a);
    const pts = [V(dx * 0.1, 0.8, dz * 0.1), V(dx * 0.55, 0.32, dz * 0.55), V(dx * L * 0.7, 0.1, dz * L * 0.7), V(dx * L, -0.12, dz * L)];
    add(tube(new THREE.CatmullRomCurve3(pts), 3, 3, (t) => 0.27 - t * 0.22), MAT.twig, null, 0.03);
  }

  // main limbs fork from the top, side branches from the upper trunk
  const top = trunk.getPointAt(1);
  const nl = 2 + Math.floor(R() * 2);
  let perch = null;
  for (let i = 0; i < nl; i++) {
    const a = (i / nl) * Math.PI * 2 + R.range(-0.5, 0.5);
    const dir = V(Math.cos(a), R.range(0.8, 1.3), Math.sin(a));
    const l = limb(R, top.clone().addScaledVector(dir, -0.25), dir, height * R.range(0.3, 0.42), 0.21, 0.025, R.range(0.38, 0.55), { rise: -0.08, wob: 0.45, segs: 11, radial: 3, steps: 3, curlN: 8 });
    add(l.geo, MAT.bark, null, 0.025);
    // a twig with its own little curl
    const mid = l.curve.getPointAt(0.3);
    const ta = a + (R() < 0.5 ? 1.2 : -1.2);
    add(limb(R, mid, V(Math.cos(ta), 0.5, Math.sin(ta)), R.range(0.6, 1.0), 0.06, 0.015, 0.18, { steps: 2, segs: 6, radial: 3, curlN: 5 }).geo, MAT.twig, null, 0.02);
  }
  const nb = 3 + Math.floor(R() * 2);
  for (let i = 0; i < nb; i++) {
    const t0 = R.range(0.45, 0.9);
    const start = trunk.getPointAt(t0);
    const a = (i / nb) * Math.PI * 2 + R.range(-0.6, 0.6) + 0.7;
    const dir = V(Math.cos(a), R.range(0.0, 0.45), Math.sin(a));
    const l = limb(R, start, dir, R.range(1.8, 2.8) * (1.25 - t0 * 0.4), 0.14, 0.02, R.range(0.28, 0.42), { rise: 0.12, segs: 10, radial: 3, steps: 3, curlN: 8 });
    add(l.geo, MAT.twig, null, 0.025);
    if (!perch && l.pts[2].y > 2.5) perch = { pos: l.curve.getPointAt(0.42), yaw: -a };
  }

  // a hollow (or two) on the trunk, turned toward `face` (ink on its own: a hull would only fatten it)
  const holes = R() < 0.4 ? 2 : 1;
  for (let i = 0; i < holes; i++) {
    const t = i ? R.range(0.5, 0.6) : R.range(0.22, 0.3);
    const p = trunk.getPointAt(t);
    const yaw = face + (i ? R.range(-1.2, 1.2) : 0);
    const out = V(Math.cos(yaw), 0, Math.sin(yaw));
    const r = 0.42 - t * 0.16 + 0.42 * Math.exp(-t * 9);
    p.addScaledVector(out, r * 0.8);
    const m = new THREE.Matrix4().lookAt(V(), out, UP).setPosition(p);
    m.multiply(M([0, 0, 0], [0, 0, R.range(-0.2, 0.2)], i ? [0.09, 0.15, 0.08] : [0.13, 0.24, 0.1]));
    add(G.sphLo, MAT.ink, m, 0);
  }
  // striped scarf on some trunks: one band, the stripes are paint
  if (R() < 0.45) {
    const t = R.range(0.42, 0.55), p = trunk.getPointAt(t), tg = trunk.getTangentAt(t);
    const m = new THREE.Matrix4().compose(p, new THREE.Quaternion().setFromUnitVectors(UP, tg), V(1, 1, 1));
    m.multiply(M([0, 0, 0], [R.range(-0.15, 0.15), 0, R.range(-0.15, 0.15)]));
    const r = (0.42 - t * 0.16 + 0.42 * Math.exp(-t * 9)) * 1.22;
    add(new THREE.CylinderGeometry(r, r * 1.04, 0.26, 10, 1, true), MAT.scarf, m, 0.012);
  }
  return { perch: perch || { pos: top.clone(), yaw: 0 } };
}

// Exported single tree (height 5–8 m) for anyone who wants one on its own.
export function buildTree(seed, height) {
  const b = new Batch();
  treeParts(b.add.bind(b), seed, height);
  const g = new THREE.Group();
  b.build(g);
  return g;
}

// A crow perched at the origin facing +z. The head is returned separately so it can turn.
export function crowParts(add) {
  add(G.sph, MAT.ink, M([0, 0.16, 0], [-0.35, 0, 0], [0.1, 0.11, 0.17]), 0.015);
  add(G.cone4, MAT.ink, M([0, 0.13, -0.2], [-1.2, Math.PI / 4, 0], [0.07, 0.2, 0.03]), 0.012);
  for (const s of [-1, 1]) {
    add(G.sphLo, MAT.ink, M([s * 0.075, 0.17, -0.03], [-0.4, s * 0.15, 0], [0.04, 0.08, 0.15]), 0.012);
    add(G.box, MAT.iron, M([s * 0.035, 0.03, 0.02], [0, 0, 0], [0.012, 0.08, 0.012]), 0);
  }
}
// The head: one painted mesh (bone eyes are paint) and its hull.
export function buildCrowHead() {
  const g = new THREE.Group();
  const b = new Batch();
  b.add(G.sph, MAT.crowHead, M([0, 0, 0], [0, 0, 0], [0.075, 0.07, 0.08]), 0.012, new THREE.Matrix4());
  b.add(G.cone4, MAT.ink, M([0, -0.01, 0.1], [Math.PI / 2, Math.PI / 4, 0], [0.025, 0.1, 0.02]), 0.01);
  b.build(g);
  return g;
}

// A glass lantern centered on its flame: a glass box with its iron frame painted on, a base plate, a pyramid roof
// and a finial.
export function lanternParts(add, m, s = 1) {
  const a = (geo, mat, mm, o) => add(geo, mat, m.clone().multiply(mm), o);
  const glass = spec(PAL.amber, { pat: P.lantern, p1: 0.11 * s, p2: 0.16 * s });
  a(paintBox(0.22 * s, 0.32 * s, 0.22 * s), glass, new THREE.Matrix4(), 0.01);
  a(G.box, MAT.iron, M([0, -0.18 * s, 0], [0, 0, 0], [0.28 * s, 0.05 * s, 0.28 * s]), 0.012);
  a(G.cone4, MAT.iron, M([0, 0.26 * s, 0], [0, Math.PI / 4, 0], [0.24 * s, 0.2 * s, 0.24 * s]), 0.012);
  a(G.oct, MAT.iron, M([0, 0.39 * s, 0], [0, 0, 0], 0.04 * s), 0.01);
  a(G.cone4open, MAT.iron, M([0, 0.47 * s, 0], [0, 0, 0], [0.02 * s, 0.12 * s, 0.02 * s]), 0);
}

// Iron lantern post with curled feet and a curl bracket under the lantern. Flame sits at LANTERN_Y.
// The curls are silhouette (three-sided tubes); the collars are thin open rings.
export function lanternPostParts(add, seed) {
  const R = rng(seed);
  add(G.cyl6, MAT.iron, M([0, 0.06, 0], [0, 0, 0], [0.16, 0.12, 0.16]), 0.015);
  add(G.cyl6, MAT.iron, M([0, 0.22, 0], [0, 0, 0], [0.09, 0.22, 0.09]), 0.015);
  add(G.tube6, MAT.iron, M([0, 1.18, 0], [0, 0, 0], [0.04, 1.8, 0.04]), 0.012);
  for (const y of [0.36, 1.25, 1.98]) add(G.tube6, MAT.iron, M([0, y, 0], [0, 0, 0], [0.065, 0.05, 0.065]), 0.01);
  const yaw = R() * Math.PI;
  for (let k = 0; k < 4; k++) {
    const a = yaw + (k * Math.PI) / 2, d = V(Math.cos(a), 0, Math.sin(a));
    // feet: low curls hugging the pole
    if (k % 2 === 0) {
      const pts = [V(d.x * 0.03, 0.75, d.z * 0.03), V(d.x * 0.1, 0.6, d.z * 0.1)];
      pts.push(...spiralPts(pts[1], V(d.x, -1.2, d.z), d.clone().negate(), 0.07, 1.2, 7));
      add(tube(new THREE.CatmullRomCurve3(pts), 6, 3, (t) => 0.018 - t * 0.01), MAT.iron, null, 0.008);
    }
    // bracket: rises out from the pole and curls back down under the lantern base
    const p0 = V(d.x * 0.03, 1.7, d.z * 0.03), p1 = V(d.x * 0.16, 1.95, d.z * 0.16);
    const pts = [p0, p1, ...spiralPts(p1, V(d.x * 0.6, 1, d.z * 0.6), V(0, -1, 0).addScaledVector(d, 0.4), 0.075, 1.2, 8)];
    add(tube(new THREE.CatmullRomCurve3(pts), 7, 3, (t) => 0.02 - t * 0.011), MAT.iron, null, 0.008);
  }
  lanternParts(add, M([0, LANTERN_Y, 0], [0, yaw, 0]));
}

// Stone pillar: a footing, one shaft with its stacked courses painted on, and a cap. Height to the cap top is returned.
export function pillarParts(add, R, w, h) {
  add(G.box, MAT.stone, M([0, 0.15, 0], [0, R.range(-0.05, 0.05), 0], [w * 1.3, 0.3, w * 1.3]), 0.02);
  const n = 3, bh = (h - 0.5) / n;
  const course = spec('#8e88a6', { pat: P.stone, p1: bh, p2: 0.3 });
  add(G.box, course, M([R.range(-0.02, 0.02), 0.3 + (h - 0.5) / 2, R.range(-0.02, 0.02)], [0, R.range(-0.05, 0.05), R.range(-0.015, 0.015)], [w, h - 0.48, w]), 0.02);
  add(G.box, MAT.stone, M([0, h - 0.11, 0], [0, R.range(-0.1, 0.1), 0], [w * 1.3, 0.22, w * 1.3]), 0.02);
  return h;
}

// Open gate leaf in its own space: hinge on the y axis, leaf along +x, width w. The top rises toward the free edge.
export function gateLeafParts(add, R, w) {
  const topY = (x) => 1.85 + 0.55 * Math.pow(x / w, 1.6);
  add(G.box, MAT.iron, M([0.04, 1.15, 0], [0, 0, 0], [0.07, 2.3, 0.07]), 0.015);
  add(G.box, MAT.iron, M([w - 0.04, 1.25, 0], [0, 0, 0], [0.06, 2.5, 0.06]), 0.015);
  add(G.cone4, MAT.iron, M([w - 0.04, 2.6, 0], [0, Math.PI / 4, 0], [0.07, 0.22, 0.07]), 0.012);
  for (const y of [0.15, 0.95]) add(G.box, MAT.iron, M([w / 2, y, 0], [0, 0, 0], [w, 0.06, 0.05]), 0);
  const arc = [];
  for (let i = 0; i <= 6; i++) arc.push(V((i / 6) * w, topY((i / 6) * w), 0));
  add(tube(new THREE.CatmullRomCurve3(arc), 10, 3, () => 0.03), MAT.iron, null, 0.012);
  // spear bars and rails: thin rods as dark as the ink, so like the fence bars they go without a hull
  for (let x = 0.22; x < w - 0.1; x += 0.2) {
    const h = topY(x) + 0.14;
    add(G.tube4, MAT.iron, M([x, h / 2 + 0.07, 0], [0, Math.PI / 4, 0], [0.018, h - 0.14, 0.018]), 0);
    add(G.cone4open, MAT.iron, M([x, h + 0.05, 0], [0, Math.PI / 4, 0], [0.045, 0.16, 0.045]), 0);
  }
  // scrolls and a skull medallion between the rails
  const scroll = (x, y, dir, bend, r) => {
    const p = V(x, y, 0);
    const pts = [p.clone().addScaledVector(dir, -0.2), p, ...spiralPts(p, dir, bend, r, 1.4, 7)];
    add(tube(new THREE.CatmullRomCurve3(pts), 8, 3, (t) => 0.022 - t * 0.01), MAT.iron, null, 0.01);
  };
  const cx = w * 0.52, cy = 1.45;
  add(new THREE.TorusGeometry(0.3, 0.025, 3, 10), MAT.iron, M([cx, cy, 0]), 0.012);
  scroll(cx - 0.3, cy - 0.25, V(-1, -0.3, 0), V(0, 1, 0), 0.14);
  scroll(cx + 0.3, cy - 0.25, V(1, -0.3, 0), V(0, 1, 0), 0.14);
  scroll(cx - 0.25, 0.95, V(-1, 0.4, 0), V(0, -1, 0), 0.12);
  scroll(cx + 0.25, 0.95, V(1, 0.4, 0), V(0, -1, 0), 0.12);
  // the skull's sockets are painted on both faces
  add(G.sph, MAT.skull2, M([cx, cy + 0.03, 0], [0, 0, 0], [0.15, 0.16, 0.07]), 0.012, new THREE.Matrix4());
  add(G.box, MAT.bone, M([cx, cy - 0.11, 0], [0, 0, 0], [0.13, 0.08, 0.08]), 0.01);
}

// Coffin-lid outline (toe-pincher), in the xy plane, length along y.
function coffinShapeGeo(w, l, depth) {
  const pts = [[-0.3, -0.5], [0.3, -0.5], [0.5, 0.25], [0.36, 0.5], [-0.36, 0.5], [-0.5, 0.25]];
  const shape = new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x * w, y * l)));
  return new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false });
}

// A shovel standing on its blade tip, handle up, at the origin, leaning by `rot`.
export function shovelParts(add, m) {
  const a = (geo, mat, mm, o) => add(geo, mat, m.clone().multiply(mm), o);
  a(G.tube6, MAT.woodLight, M([0, 0.85, 0], [0, 0, 0], [0.025, 1.1, 0.025]), 0.01);
  a(G.box, MAT.woodLight, M([0, 1.42, 0], [0, 0, 0], [0.16, 0.035, 0.035]), 0.01);
  for (const s of [-1, 1]) a(G.box, MAT.woodLight, M([s * 0.07, 1.36, 0], [0, 0, s * 0.3], [0.025, 0.13, 0.03]), 0.008);
  a(G.sphLo, MAT.iron, M([0, 0.17, 0], [0, 0, 0], [0.13, 0.2, 0.025]), 0.012);
  a(G.tube6, MAT.iron, M([0, 0.36, 0], [0, 0, 0], [0.04, 0.12, 0.04]), 0.01);
}

// A sagging roof slope as one slab: P(u, v) gives the top surface (u across 0..1, v down the slope 0..1);
// the underside is the same grid pushed down by `thick`. aObj carries (x along the ridge, meters down the slope).
function roofSlab(nu, nv, Pf, thick, len) {
  const top = [], obj = [];
  for (let j = 0; j <= nv; j++) for (let i = 0; i <= nu; i++) { const p = Pf(i / nu, j / nv); top.push(p); obj.push([p.x, (j / nv) * len, 0]); }
  const pos = [], ob = [];
  const at = (i, j) => j * (nu + 1) + i;
  const quad = (a, b, c, d, oa, ob_, oc, od) => {
    pos.push(...a, ...b, ...c, ...a, ...c, ...d);
    ob.push(...oa, ...ob_, ...oc, ...oa, ...oc, ...od);
  };
  const T = (k, dy = 0) => [top[k].x, top[k].y - dy, top[k].z];
  for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) {
    const a = at(i, j), b = at(i + 1, j), c = at(i + 1, j + 1), d = at(i, j + 1);
    quad(T(a), T(d), T(c), T(b), obj[a], obj[d], obj[c], obj[b]); // top, facing up
    quad(T(a, thick), T(b, thick), T(c, thick), T(d, thick), obj[a], obj[b], obj[c], obj[d]); // underside
  }
  // edges: around the rim of the grid
  const rim = [];
  for (let i = 0; i < nu; i++) rim.push([at(i, 0), at(i + 1, 0)]);
  for (let j = 0; j < nv; j++) rim.push([at(nu, j), at(nu, j + 1)]);
  for (let i = nu; i > 0; i--) rim.push([at(i, nv), at(i - 1, nv)]);
  for (let j = nv; j > 0; j--) rim.push([at(0, j), at(0, j - 1)]);
  for (const [a, b] of rim) quad(T(a), T(b), T(b, thick), T(a, thick), obj[a], obj[b], obj[b], obj[a]);
  // the grid was laid out for one slope; turn every triangle over if its top ended up facing down
  if (((pos[5] - pos[2]) * (pos[6] - pos[0]) - (pos[3] - pos[0]) * (pos[8] - pos[2])) < 0) {
    for (const arr of [pos, ob]) for (let i = 0; i < arr.length; i += 9) for (let c = 0; c < 3; c++) { const t = arr[i + 3 + c]; arr[i + 3 + c] = arr[i + 6 + c]; arr[i + 6 + c] = t; }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('aObj', new THREE.Float32BufferAttribute(ob, 3));
  g.computeVertexNormals();
  return g;
}

// The gravedigger's shed in its own space: footprint hx x hz (the collider), door and window on -z.
// Walls lean a little (shear), the roof sags and overhangs. The walls are single boards with their planks painted on,
// the roof two sagging slabs with painted shingles, the door and windows boxes with their frames painted on.
export function shedParts(add, sh, seed) {
  const R = rng(seed);
  const { hx, hz } = sh;
  const shear = new THREE.Matrix4().set(1, 0.045, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
  // planks lean with the wall: paint space is the unsheared shed space
  const w = (geo, mat, mm, o, local) => add(geo, mat, mm ? shear.clone().multiply(mm) : shear.clone(), o, local || mm || new THREE.Matrix4());
  const eave = 2.35, ridge = 3.95, over = 0.5;
  const slope = (ridge - eave + 0.08) / (hz + over);
  const roofY = (z) => ridge - Math.abs(z) * slope;
  const wallT = 0.09;
  // long walls (front -z, back +z), slightly crooked
  for (const sz of [-1, 1]) w(G.box, MAT.planks, M([0, eave / 2 - 0.02, sz * (hz - wallT / 2)], [R.range(-0.01, 0.01), 0, 0], [hx * 2 - 0.04, eave - 0.02, wallT]), 0.014);
  // gable ends (+-x): a five-sided board up to the roof line
  for (const sx of [-1, 1]) {
    const s = new THREE.Shape([new THREE.Vector2(-hz + 0.02, 0), new THREE.Vector2(hz - 0.02, 0), new THREE.Vector2(hz - 0.02, roofY(hz) - 0.05), new THREE.Vector2(0, ridge - 0.05), new THREE.Vector2(-hz + 0.02, roofY(hz) - 0.05)]);
    const g = new THREE.ExtrudeGeometry(s, { depth: wallT, bevelEnabled: false, curveSegments: 1 });
    g.translate(0, 0, -wallT / 2).rotateY(sx * Math.PI / 2);
    w(g, MAT.planks, M([sx * (hx - wallT / 2), 0, 0]), 0.014);
  }
  // corner posts and top plates
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) w(G.box, MAT.woodDark, M([sx * (hx - 0.02), eave / 2, sz * (hz - 0.02)], [0, 0, R.range(-0.03, 0.03)], [0.18, eave + 0.1, 0.18]), 0.016);
  for (const sz of [-1, 1]) w(G.box, MAT.boardDark, M([0, eave - 0.05, sz * (hz + 0.01)], [0, 0, 0.015], [hx * 2 + 0.2, 0.14, 0.14]), 0.016);
  // a diagonal brace on the back wall
  w(G.box, MAT.boardDark, M([0.9, 1.2, hz + 0.02], [0, 0, 0.75], [0.12, 2.2, 0.06]), 0.012);

  // roof: two sagging slabs (shingles painted), a ridge beam and barge boards
  const L = Math.hypot(hz + over, ridge - eave);
  const ang = Math.atan2(ridge - eave, hz + over);
  const x0 = -hx - 0.47, x1 = hx + 0.5;
  for (const sz of [-1, 1]) {
    const Pf = (u, v) => {
      const x = x0 + (x1 - x0) * u, d = v * (L + 0.05);
      const sag = 0.2 * Math.sin(Math.PI * u) * Math.sin(Math.PI * Math.min(1, d / L));
      return V(x, ridge + 0.06 - Math.sin(ang) * d - sag + x * 0.04, sz * Math.cos(ang) * d);
    };
    add(roofSlab(6, 3, Pf, 0.07, L), MAT.shingle, null, 0.012);
    for (const sx of [-1, 1]) {
      const m = M([sx * (hx + 0.47), ridge - Math.sin(ang) * L / 2 - 0.04, sz * Math.cos(ang) * L / 2], [sz * ang, 0, 0], [0.07, 0.2, L + 0.1]);
      add(G.box, MAT.woodDark, m, 0.014);
    }
  }
  add(G.box, MAT.boardDark, M([0.05, ridge + 0.1, 0], [Math.PI / 4, 0, -0.04], [hx * 2 + 1.2, 0.16, 0.16]), 0.016);

  // stovepipe chimney with a crooked elbow and a hat
  const cx = -hx + 0.9, cz = -0.55;
  const cy = roofY(cz);
  add(G.tube6, MAT.iron, M([cx, cy + 0.4, cz], [0.05, 0, 0.06], [0.12, 1.0, 0.12]), 0.015);
  add(G.tube6, MAT.iron, M([cx - 0.12, cy + 1.08, cz], [0, 0, 0.45], [0.11, 0.55, 0.11]), 0.015);
  add(G.cone6, MAT.iron, M([cx - 0.27, cy + 1.48, cz], [0, 0, 0.3], [0.24, 0.18, 0.24]), 0.015);
  // weathervane on the +x end of the ridge
  const vx = hx + 0.1, vy = ridge + 0.15;
  add(G.tube6, MAT.iron, M([vx, vy + 0.45, 0], [0, 0, 0.06], [0.025, 0.9, 0.025]), 0.008);
  add(G.box, MAT.iron, M([vx + 0.04, vy + 0.62, 0], [0, 0.5, 0], [0.5, 0.025, 0.025]), 0.006);
  add(G.box, MAT.iron, M([vx + 0.04, vy + 0.62, 0], [0, 2.07, 0], [0.5, 0.025, 0.025]), 0.006);
  const vm = M([vx + 0.05, vy + 0.86, 0], [0, 0.9, 0]);
  add(G.box, MAT.iron, vm.clone().multiply(M([0, 0, 0], [0, 0, 0], [0.7, 0.03, 0.03])), 0.008);
  add(G.cone4, MAT.iron, vm.clone().multiply(M([0.4, 0, 0], [0, 0, -Math.PI / 2], [0.08, 0.16, 0.02])), 0.008);
  add(coffinShapeGeo(0.22, 0.4, 0.02), MAT.iron, vm.clone().multiply(M([-0.38, 0.0, -0.01], [0, 0, Math.PI / 2])), 0.008);

  // door: one board with its planks, rails, Z brace, nails and knob painted on; a frame; a skull plaque above
  const dz = -hz - 0.03, dx = 0.55;
  const door = spec('#33243a', { pat: P.door, p1: 0.45, p2: 0.95 });
  w(paintBox(0.9, 1.9, 0.07), door, M([dx, 0.97, dz - 0.03], [0, 0, R.range(-0.012, 0.012)]), 0.012);
  for (const s of [-1, 1]) w(G.box, MAT.board, M([dx + s * 0.52, 1.02, dz - 0.03], [0, 0, 0], [0.12, 2.05, 0.08]), 0.014);
  w(G.box, MAT.board, M([dx, 2.08, dz - 0.03], [0, 0, 0.04], [1.25, 0.14, 0.1]), 0.014);
  w(G.sph, MAT.skull2, M([dx, 2.3, dz - 0.04], [0, 0, 0], [0.12, 0.13, 0.06]), 0.012, new THREE.Matrix4());
  w(G.box, MAT.bone, M([dx, 2.2, dz - 0.04], [0, 0, 0], [0.1, 0.06, 0.06]), 0.01);
  for (const s of [-1, 1]) w(G.box, MAT.bone, M([dx + s * 0.15, 2.28, dz - 0.04], [0, 0, s * 0.5], [0.16, 0.04, 0.04]), 0.008);
  add(G.box, MAT.stone, M([dx, 0.07, dz - 0.25], [0, 0.05, 0], [1.1, 0.14, 0.45]), 0.016);

  // lit windows: front (crooked) and on the +x gable end; frame and mullions are paint on one box
  const win = (m, ww, wh) => w(paintBox(ww + 0.18, wh + 0.18, 0.07), spec(PAL.amber, { pat: P.window, p1: ww / 2 + 0.09, p2: wh / 2 + 0.09 }), m.clone().multiply(M([0, 0, -0.02])), 0.012);
  const wf = M([-1.15, 1.6, -hz - 0.02], [0, 0, 0.09]);
  win(wf, 0.58, 0.68);
  // a shutter hanging off one hinge
  w(G.box, MAT.boardDark, wf.clone().multiply(M([-0.62, -0.08, -0.06], [0, 0.35, -0.25], [0.32, 0.72, 0.04])), 0.012);
  win(M([hx + 0.02, 2.55, 0.05], [0, -Math.PI / 2, -0.06]), 0.36, 0.44);

  // lantern on an iron hook beside the door
  const hk = V(-0.25, 2.15, -hz - 0.02);
  w(G.box, MAT.iron, M([hk.x, hk.y, hk.z - 0.22], [0, 0, 0], [0.03, 0.03, 0.45]), 0.008);
  const curl = [V(hk.x, hk.y, hk.z - 0.42), ...spiralPts(V(hk.x, hk.y, hk.z - 0.42), V(0, 0, -1), V(0, 1, 0), 0.07, 1.2, 7)];
  add(tube(new THREE.CatmullRomCurve3(curl.map((p) => p.applyMatrix4(shear))), 8, 3, (t) => 0.016 - t * 0.008), MAT.iron, null, 0.008);
  const lanternPos = V(hk.x + 0.1, hk.y - 0.32, hk.z - 0.36);
  add(G.box, MAT.iron, M([lanternPos.x, hk.y - 0.08, lanternPos.z], [0, 0, 0], [0.012, 0.16, 0.012]), 0);
  lanternParts(add, M([lanternPos.x, lanternPos.y, lanternPos.z], [0, 0.3, 0]), 0.7);

  // shovels leaning on the +x gable wall
  shovelParts(add, M([hx + 0.32, 0, 0.55], [0.05, 0, 0.22]));
  shovelParts(add, M([hx + 0.28, 0, 1.0], [-0.1, 0.4, 0.18]));
  return { lantern: V(lanternPos.x, lanternPos.y, lanternPos.z), window: V(-1.15, 1.6, -hz - 0.3), window2: V(hx + 0.3, 2.55, 0.05) };
}

// Carpenter's corner by the coffin pile: trestles with a plank, a stack of boards, a lid leaning on the shed.
export function carpenterParts(add) {
  const trestle = (m) => {
    const a = (geo, mat, mm, o) => add(geo, mat, m.clone().multiply(mm), o);
    a(G.box, MAT.wood, M([0, 0.72, 0], [0, 0, 0], [1.0, 0.1, 0.12]), 0.012);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) a(G.box, MAT.woodDark, M([sx * 0.36, 0.36, sz * 0.13], [sz * 0.32, 0, sx * 0.12], [0.07, 0.78, 0.07]), 0.01);
    a(G.box, MAT.woodDark, M([0, 0.32, 0], [0, 0, 0], [0.7, 0.06, 0.04]), 0.008);
  };
  trestle(M([0, 0, -0.75], [0, 0.06, 0]));
  trestle(M([0.05, 0, 0.75], [0, -0.04, 0]));
  // a half-made coffin side on top: two boards and a saw
  add(G.box, MAT.boardLight, M([0, 0.8, 0], [0, 0.03, 0.02], [0.55, 0.05, 2.1]), 0.012);
  add(G.box, MAT.board, M([0.1, 0.85, 0.15], [0, -0.08, 0], [0.32, 0.05, 1.7]), 0.012);
  add(G.box, MAT.iron, M([-0.12, 0.9, -0.45], [0, 0.5, 0], [0.12, 0.012, 0.55]), 0.006);
  add(G.box, MAT.woodDark, M([-0.25, 0.92, -0.73], [0, 0.5, 0], [0.08, 0.05, 0.16]), 0.008);
  // a stack of boards on the ground
  for (let i = 0; i < 4; i++) add(G.box, i % 2 ? MAT.boardDark : MAT.board, M([1.45 + (i % 2) * 0.05, 0.05 + i * 0.09, -0.2 + i * 0.04], [0, 0.04 * (i - 1.5), 0.02], [0.32, 0.08, 1.9]), 0.012);
  add(G.box, MAT.boardDark, M([1.5, 0.2, 0.85], [0.6, 0.2, 0.1], [0.3, 0.07, 1.0]), 0.012);
}
// A coffin lid: the toe-pincher board; the bone cross and the striped band at the foot are paint.
export function coffinLidParts(add, m) {
  add(coffinShapeGeo(0.62, 1.9, 0.06), MAT.lid, m, 0.016, new THREE.Matrix4());
}

// Painted signboard labels drawn into a canvas at runtime (one atlas for every board).
export function signLabels(labels) {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 128 * labels.length;
  const ctx = c.getContext('2d');
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  labels.forEach((t, i) => {
    let size = 76;
    do { ctx.font = `bold ${size}px Georgia, 'Times New Roman', serif`; size -= 4; } while (ctx.measureText(t).width > 470);
    ctx.save();
    ctx.translate(256, 128 * i + 66);
    ctx.rotate((i % 2 ? -1 : 1) * 0.03);
    ctx.fillStyle = '#efe6d4';
    ctx.fillText(t, 0, 0);
    ctx.restore();
  });
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

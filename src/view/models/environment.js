import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { toon, outlineMat, glowMat, LANTERN_Y } from '../../shaders/toon.js';
import { rng } from '../../shared/rng.js';
import { PAL } from '../palette.js';
import { outlineGeo } from './common.js';

// Static set pieces for the yard: trees, shed, fence, gates, lantern posts, small dressing.
// Everything static is written into a Batch and merged per material, so the whole yard costs a few dozen draw calls.

export const MAT = {
  bark: toon('#2c2338', { mottle: 0.55, gradColor: '#18121f', gradY: [-0.1, 1.4], rim: 1.3 }),
  wood: toon(PAL.wood, { mottle: 0.6, rim: 0.8 }),
  woodDark: toon('#33243a', { mottle: 0.6, rim: 0.8 }),
  woodLight: toon(PAL.woodLight, { mottle: 0.5 }),
  shingle: toon(PAL.plum, { mottle: 0.7, color2: '#3a2546', stripes: 2.2, axis: 1, stripeDuty: 0.3 }),
  iron: toon(PAL.coal, { rim: 1.5 }),
  stone: toon('#8e88a6', { mottle: 0.7, gradColor: PAL.stoneDark, gradY: [0, 0.7] }),
  bone: toon(PAL.bone),
  ink: toon(PAL.ink, { rim: 0.6 }),
  glass: toon(PAL.amber, { emissive: 0.88 }),
  flame: toon(PAL.amberHot, { emissive: 1 }),
  shroom: toon('#b9a6d6', { gradColor: '#efe6ff', gradY: [0, 0.12], emissive: 0.25 }),
  stem: toon(PAL.boneShade, { rim: 0.5 }),
  grass: toon(PAL.grassLight, { gradColor: '#1e2430', gradY: [0, 0.32], side: THREE.DoubleSide, rim: 0.4 }),
};

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const UP = V(0, 1, 0);
const _q = new THREE.Quaternion(), _e = new THREE.Euler(), _s = new THREE.Vector3();
// matrix from position, euler rotation and scale (arrays or numbers)
export function M(pos = [0, 0, 0], rot = [0, 0, 0], scale = 1) {
  const s = Array.isArray(scale) ? scale : [scale, scale, scale];
  return new THREE.Matrix4().compose(V(...pos), _q.setFromEuler(_e.set(...rot)), _s.set(...s));
}

// Collects geometry per (material, outline width) and merges it once at the end.
export class Batch {
  constructor() { this.lists = new Map(); }
  add(geo, mat, matrix, outline = 0.02) {
    let g = geo.index ? geo.toNonIndexed() : geo.clone();
    for (const k of Object.keys(g.attributes)) if (k !== 'position' && k !== 'normal') g.deleteAttribute(k);
    if (!g.attributes.normal) g.computeVertexNormals();
    if (matrix) g.applyMatrix4(matrix);
    // two line weights only, so each material costs at most two merged meshes (plus their hulls)
    outline = outline ? (outline <= 0.012 ? 0.01 : 0.02) : 0;
    const key = `${mat.uuid}|${outline}`;
    if (!this.lists.has(key)) this.lists.set(key, { mat, outline, geos: [] });
    this.lists.get(key).geos.push(g);
    return g;
  }
  // a parent matrix applied to everything added through the returned adder
  sub(parent) {
    return (geo, mat, matrix, outline) => this.add(geo, mat, matrix ? parent.clone().multiply(matrix) : parent, outline);
  }
  build(parent) {
    let tris = 0;
    for (const { mat, outline, geos } of this.lists.values()) {
      const merged = mergeGeometries(geos);
      merged.computeBoundingSphere();
      const mesh = new THREE.Mesh(merged, mat);
      if (outline) mesh.add(new THREE.Mesh(outlineGeo(merged), outlineMat(outline)));
      parent.add(mesh);
      tris += merged.attributes.position.count / 3 * (outline ? 2 : 1);
    }
    this.lists.clear();
    return tris;
  }
}

// shared low-poly primitives (decoration does not need many segments)
export const G = {
  box: new THREE.BoxGeometry(1, 1, 1),
  cyl6: new THREE.CylinderGeometry(1, 1, 1, 6),
  cyl8: new THREE.CylinderGeometry(1, 1, 1, 8),
  sph: new THREE.SphereGeometry(1, 10, 7),
  sphLo: new THREE.SphereGeometry(1, 7, 5),
  cone4: new THREE.ConeGeometry(1, 1, 4),
  cone6: new THREE.ConeGeometry(1, 1, 6),
};

// Tapered tube along a curve. r(t, angle) gives the radius, so trunks can carry twisted ridges.
// Sampled by the curve's own parameter (not arc length), so dense control points (curls) get dense rings.
// Frames are parallel-transported, so spirals do not flip.
export function tube(curve, segs, radial, r) {
  const pts = [];
  for (let i = 0; i <= segs; i++) pts.push(curve.getPoint(i / segs));
  const tan = pts.map((p, i) => pts[Math.min(segs, i + 1)].clone().sub(pts[Math.max(0, i - 1)]).normalize());
  let N = Math.abs(tan[0].y) < 0.9 ? V(0, 1, 0) : V(1, 0, 0);
  N.addScaledVector(tan[0], -N.dot(tan[0])).normalize();
  const pos = [], idx = [], d = V(), B = V();
  for (let i = 0; i <= segs; i++) {
    if (i) {
      const q = new THREE.Quaternion().setFromUnitVectors(tan[i - 1], tan[i]);
      N.applyQuaternion(q).addScaledVector(tan[i], -N.dot(tan[i])).normalize();
    }
    B.crossVectors(tan[i], N);
    const p = pts[i], t = i / segs;
    for (let j = 0; j < radial; j++) {
      const a = (j / radial) * Math.PI * 2;
      const rr = r(t, a);
      d.copy(N).multiplyScalar(Math.cos(a)).addScaledVector(B, Math.sin(a));
      pos.push(p.x + d.x * rr, p.y + d.y * rr, p.z + d.z * rr);
    }
  }
  for (let i = 0; i < segs; i++) {
    for (let j = 0; j < radial; j++) {
      const a = i * radial + j, b = i * radial + ((j + 1) % radial), c = a + radial, e = b + radial;
      idx.push(a, c, b, b, c, e);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
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

// Ring of alternating bone / ink segments: the striped scarf accent from the concept art.
function stripedRing(add, matrix, r, h, n = 12) {
  for (let i = 0; i < n; i++) {
    const g = new THREE.CylinderGeometry(r, r * 1.04, h, 2, 1, true, (i / n) * Math.PI * 2, (Math.PI * 2) / n);
    add(g, i % 2 ? MAT.ink : MAT.bone, matrix, 0.012);
  }
}

// Twisted storybook tree: a ridged trunk on spreading roots, a hollow, and limbs that end in spiral curls.
// `face` is the yaw (radians) the hollow looks toward. Returns { perch } in tree space: a spot for a crow.
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
  add(tube(trunk, 13, 8, (t, a) => {
    const base = 0.42 - t * 0.16 + 0.42 * Math.exp(-t * 9);
    return base * (1 + 0.17 * Math.sin(a * 3 + t * twist));
  }), MAT.bark, null, 0.03);

  // roots: start inside the trunk, arch out and dive into the ground
  const nr = 4 + Math.floor(R() * 2);
  for (let i = 0; i < nr; i++) {
    const a = (i / nr) * Math.PI * 2 + R.range(-0.4, 0.4), L = R.range(1.2, 1.9);
    const dx = Math.cos(a), dz = Math.sin(a);
    const pts = [V(dx * 0.1, 0.8, dz * 0.1), V(dx * 0.55, 0.32, dz * 0.55), V(dx * L * 0.7, 0.1, dz * L * 0.7), V(dx * L, -0.12, dz * L)];
    add(tube(new THREE.CatmullRomCurve3(pts), 4, 4, (t) => 0.27 - t * 0.22), MAT.bark, null, 0.03);
  }

  // main limbs fork from the top, side branches from the upper trunk
  const top = trunk.getPointAt(1);
  const nl = 2 + Math.floor(R() * 2);
  let perch = null;
  for (let i = 0; i < nl; i++) {
    const a = (i / nl) * Math.PI * 2 + R.range(-0.5, 0.5);
    const dir = V(Math.cos(a), R.range(0.8, 1.3), Math.sin(a));
    const l = limb(R, top.clone().addScaledVector(dir, -0.25), dir, height * R.range(0.3, 0.42), 0.21, 0.025, R.range(0.38, 0.55), { rise: -0.08, wob: 0.45, segs: 15, radial: 5, steps: 3 });
    add(l.geo, MAT.bark, null, 0.025);
    // a twig with its own little curl
    const mid = l.curve.getPointAt(0.3);
    const ta = a + (R() < 0.5 ? 1.2 : -1.2);
    add(limb(R, mid, V(Math.cos(ta), 0.5, Math.sin(ta)), R.range(0.6, 1.0), 0.06, 0.015, 0.18, { steps: 2, segs: 8, radial: 3, curlN: 6 }).geo, MAT.bark, null, 0.02);
  }
  const nb = 3 + Math.floor(R() * 2);
  for (let i = 0; i < nb; i++) {
    const t0 = R.range(0.45, 0.9);
    const start = trunk.getPointAt(t0);
    const a = (i / nb) * Math.PI * 2 + R.range(-0.6, 0.6) + 0.7;
    const dir = V(Math.cos(a), R.range(0.0, 0.45), Math.sin(a));
    const l = limb(R, start, dir, R.range(1.8, 2.8) * (1.25 - t0 * 0.4), 0.14, 0.02, R.range(0.28, 0.42), { rise: 0.12, segs: 13, radial: 4, steps: 3 });
    add(l.geo, MAT.bark, null, 0.025);
    if (!perch && l.pts[2].y > 2.5) perch = { pos: l.curve.getPointAt(0.42), yaw: -a };
  }

  // a hollow (or two) on the trunk, turned toward `face`
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
    add(G.sphLo, MAT.ink, m, 0.03);
  }
  // striped scarf on some trunks
  if (R() < 0.45) {
    const t = R.range(0.42, 0.55), p = trunk.getPointAt(t), tg = trunk.getTangentAt(t);
    const m = new THREE.Matrix4().compose(p, new THREE.Quaternion().setFromUnitVectors(UP, tg), V(1, 1, 1));
    m.multiply(M([0, 0, 0], [R.range(-0.15, 0.15), 0, R.range(-0.15, 0.15)]));
    stripedRing(add, m, (0.42 - t * 0.16 + 0.42 * Math.exp(-t * 9)) * 1.22, 0.26, 14);
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
    add(G.sph, MAT.ink, M([s * 0.075, 0.17, -0.03], [-0.4, s * 0.15, 0], [0.04, 0.08, 0.15]), 0.012);
    add(G.box, MAT.iron, M([s * 0.035, 0.03, 0.02], [0, 0, 0], [0.012, 0.08, 0.012]), 0);
  }
}
export function buildCrowHead() {
  const g = new THREE.Group();
  const b = new Batch();
  b.add(G.sph, MAT.ink, M([0, 0, 0], [0, 0, 0], [0.075, 0.07, 0.08]), 0.012);
  b.add(G.cone4, MAT.ink, M([0, -0.01, 0.1], [Math.PI / 2, Math.PI / 4, 0], [0.025, 0.1, 0.02]), 0.01);
  b.build(g);
  for (const s of [-1, 1]) {
    const e = new THREE.Mesh(G.sphLo, MAT.bone);
    e.position.set(s * 0.05, 0.02, 0.04);
    e.scale.setScalar(0.017);
    g.add(e);
  }
  return g;
}

// A glass lantern centered on its flame. Iron frame, amber glass, pyramid roof with a finial.
export function lanternParts(add, m, s = 1) {
  const a = (geo, mat, mm, o) => add(geo, mat, m.clone().multiply(mm), o);
  a(G.box, MAT.glass, M([0, 0, 0], [0, 0, 0], [0.2 * s, 0.3 * s, 0.2 * s]), 0);
  for (const [x, z] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) a(G.box, MAT.iron, M([x * 0.105 * s, 0, z * 0.105 * s], [0, 0, 0], [0.03 * s, 0.34 * s, 0.03 * s]), 0.01);
  a(G.box, MAT.iron, M([0, -0.18 * s, 0], [0, 0, 0], [0.28 * s, 0.05 * s, 0.28 * s]), 0.012);
  a(G.cone4, MAT.iron, M([0, 0.26 * s, 0], [0, Math.PI / 4, 0], [0.24 * s, 0.2 * s, 0.24 * s]), 0.012);
  a(G.sphLo, MAT.iron, M([0, 0.39 * s, 0], [0, 0, 0], 0.035 * s), 0.01);
  a(G.cone4, MAT.iron, M([0, 0.47 * s, 0], [0, 0, 0], [0.02 * s, 0.12 * s, 0.02 * s]), 0);
}

export function glowQuad(parent, pos, size, strength = 0.8) {
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(size, size), glowMat('#ffb860', strength));
  glow.position.copy(pos);
  glow.userData.billboard = true;
  glow.userData.base = strength;
  parent.add(glow);
  return glow;
}

// Iron lantern post with curled feet and a curl bracket under the lantern. Flame sits at LANTERN_Y.
export function lanternPostParts(add, seed) {
  const R = rng(seed);
  add(G.cyl6, MAT.iron, M([0, 0.06, 0], [0, 0, 0], [0.16, 0.12, 0.16]), 0.015);
  add(G.cyl6, MAT.iron, M([0, 0.22, 0], [0, 0, 0], [0.09, 0.22, 0.09]), 0.015);
  add(G.cyl6, MAT.iron, M([0, 1.18, 0], [0, 0, 0], [0.04, 1.8, 0.04]), 0.012);
  for (const y of [0.36, 1.25, 1.98]) add(G.cyl6, MAT.iron, M([0, y, 0], [0, 0, 0], [0.065, 0.05, 0.065]), 0.01);
  const yaw = R() * Math.PI;
  for (let k = 0; k < 4; k++) {
    const a = yaw + (k * Math.PI) / 2, d = V(Math.cos(a), 0, Math.sin(a));
    // feet: low curls hugging the pole
    if (k % 2 === 0) {
      const pts = [V(d.x * 0.03, 0.75, d.z * 0.03), V(d.x * 0.1, 0.6, d.z * 0.1)];
      pts.push(...spiralPts(pts[1], V(d.x, -1.2, d.z), d.clone().negate(), 0.07, 1.2, 7));
      add(tube(new THREE.CatmullRomCurve3(pts), 8, 3, (t) => 0.018 - t * 0.01), MAT.iron, null, 0.008);
    }
    // bracket: rises out from the pole and curls back down under the lantern base
    const p0 = V(d.x * 0.03, 1.7, d.z * 0.03), p1 = V(d.x * 0.16, 1.95, d.z * 0.16);
    const pts = [p0, p1, ...spiralPts(p1, V(d.x * 0.6, 1, d.z * 0.6), V(0, -1, 0).addScaledVector(d, 0.4), 0.075, 1.2, 8)];
    add(tube(new THREE.CatmullRomCurve3(pts), 10, 3, (t) => 0.02 - t * 0.011), MAT.iron, null, 0.008);
  }
  lanternParts(add, M([0, LANTERN_Y, 0], [0, yaw, 0]));
}

// Stone pillar of stacked, slightly shifted blocks. Height to the cap top is returned.
export function pillarParts(add, R, w, h) {
  add(G.box, MAT.stone, M([0, 0.15, 0], [0, R.range(-0.05, 0.05), 0], [w * 1.3, 0.3, w * 1.3]), 0.02);
  const n = 3, bh = (h - 0.5) / n;
  for (let i = 0; i < n; i++) {
    add(G.box, MAT.stone, M([R.range(-0.03, 0.03), 0.3 + bh * (i + 0.5), R.range(-0.03, 0.03)], [0, R.range(-0.08, 0.08), R.range(-0.02, 0.02)], [w * R.range(0.95, 1.03), bh * 0.98, w * R.range(0.95, 1.03)]), 0.02);
  }
  add(G.box, MAT.stone, M([0, h - 0.11, 0], [0, R.range(-0.1, 0.1), 0], [w * 1.3, 0.22, w * 1.3]), 0.02);
  return h;
}

// Open gate leaf in its own space: hinge on the y axis, leaf along +x, width w. The top rises toward the free edge.
export function gateLeafParts(add, R, w) {
  const topY = (x) => 1.85 + 0.55 * Math.pow(x / w, 1.6);
  add(G.box, MAT.iron, M([0.04, 1.15, 0], [0, 0, 0], [0.07, 2.3, 0.07]), 0.015);
  add(G.box, MAT.iron, M([w - 0.04, 1.25, 0], [0, 0, 0], [0.06, 2.5, 0.06]), 0.015);
  add(G.cone4, MAT.iron, M([w - 0.04, 2.6, 0], [0, Math.PI / 4, 0], [0.07, 0.22, 0.07]), 0.012);
  for (const y of [0.15, 0.95]) add(G.box, MAT.iron, M([w / 2, y, 0], [0, 0, 0], [w, 0.06, 0.05]), 0.012);
  const arc = [];
  for (let i = 0; i <= 6; i++) arc.push(V((i / 6) * w, topY((i / 6) * w), 0));
  add(tube(new THREE.CatmullRomCurve3(arc), 16, 5, () => 0.03), MAT.iron, null, 0.012);
  for (let x = 0.22; x < w - 0.1; x += 0.2) {
    const h = topY(x) + 0.14;
    add(G.box, MAT.iron, M([x, h / 2 + 0.07, 0], [0, 0, 0], [0.025, h - 0.14, 0.025]), 0.008);
    add(G.cone4, MAT.iron, M([x, h + 0.05, 0], [0, Math.PI / 4, 0], [0.04, 0.14, 0.04]), 0.008);
  }
  // scrolls and a skull medallion between the rails
  const scroll = (x, y, dir, bend, r) => {
    const p = V(x, y, 0);
    const pts = [p.clone().addScaledVector(dir, -0.2), p, ...spiralPts(p, dir, bend, r, 1.4, 9)];
    add(tube(new THREE.CatmullRomCurve3(pts), 12, 3, (t) => 0.022 - t * 0.01), MAT.iron, null, 0.01);
  };
  const cx = w * 0.52, cy = 1.45;
  add(new THREE.TorusGeometry(0.3, 0.025, 3, 14), MAT.iron, M([cx, cy, 0]), 0.012);
  scroll(cx - 0.3, cy - 0.25, V(-1, -0.3, 0), V(0, 1, 0), 0.14);
  scroll(cx + 0.3, cy - 0.25, V(1, -0.3, 0), V(0, 1, 0), 0.14);
  scroll(cx - 0.25, 0.95, V(-1, 0.4, 0), V(0, -1, 0), 0.12);
  scroll(cx + 0.25, 0.95, V(1, 0.4, 0), V(0, -1, 0), 0.12);
  add(G.sph, MAT.bone, M([cx, cy + 0.03, 0], [0, 0, 0], [0.15, 0.16, 0.07]), 0.012);
  add(G.box, MAT.bone, M([cx, cy - 0.11, 0], [0, 0, 0], [0.13, 0.08, 0.08]), 0.01);
  for (const s of [-1, 1]) for (const z of [-1, 1]) add(G.sphLo, MAT.ink, M([cx + s * 0.055, cy + 0.03, z * 0.05], [0, 0, 0], [0.04, 0.045, 0.03]), 0);
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
  a(G.cyl6, MAT.woodLight, M([0, 0.85, 0], [0, 0, 0], [0.025, 1.1, 0.025]), 0.01);
  a(G.box, MAT.woodLight, M([0, 1.42, 0], [0, 0, 0], [0.16, 0.035, 0.035]), 0.01);
  for (const s of [-1, 1]) a(G.box, MAT.woodLight, M([s * 0.07, 1.36, 0], [0, 0, s * 0.3], [0.025, 0.13, 0.03]), 0.008);
  a(G.sph, MAT.iron, M([0, 0.17, 0], [0, 0, 0], [0.13, 0.2, 0.025]), 0.012);
  a(G.cyl6, MAT.iron, M([0, 0.36, 0], [0, 0, 0], [0.04, 0.12, 0.04]), 0.01);
}

// The gravedigger's shed in its own space: footprint hx x hz (the collider), door and window on -z.
// Walls lean a little (shear), the roof sags and overhangs, shingles are laid one by one.
export function shedParts(add, sh, seed) {
  const R = rng(seed);
  const { hx, hz } = sh;
  const shear = new THREE.Matrix4().set(1, 0.045, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
  const w = (geo, mat, mm, o) => add(geo, mat, mm ? shear.clone().multiply(mm) : shear.clone(), o);
  const eave = 2.35, ridge = 3.95, over = 0.5;
  const slope = (ridge - eave + 0.08) / (hz + over);
  const roofY = (z) => ridge - Math.abs(z) * slope;
  const wallT = 0.09;
  // long walls (front -z, back +z): vertical planks
  for (const sz of [-1, 1]) {
    for (let x = -hx + 0.16; x < hx - 0.1; x += 0.3) {
      const h = eave + R.range(-0.08, 0.06);
      w(G.box, R() < 0.7 ? MAT.wood : MAT.woodDark, M([x, h / 2, sz * (hz - wallT / 2)], [R.range(-0.02, 0.02), 0, R.range(-0.02, 0.02)], [R.range(0.26, 0.31), h, wallT]), 0.014);
    }
  }
  // gable ends (+-x): plank tops follow the roof line
  for (const sx of [-1, 1]) {
    for (let z = -hz + 0.15; z < hz - 0.05; z += 0.3) {
      const h = roofY(z) - 0.05 + R.range(-0.05, 0.05);
      w(G.box, R() < 0.7 ? MAT.wood : MAT.woodDark, M([sx * (hx - wallT / 2), h / 2, z], [R.range(-0.02, 0.02), 0, 0], [wallT, h, R.range(0.26, 0.31)]), 0.014);
    }
  }
  // corner posts and top plates
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) w(G.box, MAT.woodDark, M([sx * (hx - 0.02), eave / 2, sz * (hz - 0.02)], [0, 0, R.range(-0.03, 0.03)], [0.18, eave + 0.1, 0.18]), 0.016);
  for (const sz of [-1, 1]) w(G.box, MAT.woodDark, M([0, eave - 0.05, sz * (hz + 0.01)], [0, 0, 0.015], [hx * 2 + 0.2, 0.14, 0.14]), 0.016);
  // a diagonal brace on the back wall
  w(G.box, MAT.woodDark, M([0.9, 1.2, hz + 0.02], [0, 0, 0.75], [0.12, 2.2, 0.06]), 0.012);

  // roof: two sagging slopes of shingles, a ridge beam and barge boards
  const L = Math.hypot(hz + over, ridge - eave);
  const ang = Math.atan2(ridge - eave, hz + over);
  for (const sz of [-1, 1]) {
    const rows = Math.ceil(L / 0.36);
    for (let r = 0; r < rows; r++) {
      const v = (r + 0.6) * (L / rows);
      for (let x = -hx - 0.45 + (r % 2) * 0.17; x < hx + 0.5; x += 0.36) {
        if (R() < 0.04) continue;
        const sag = 0.2 * Math.sin(Math.PI * (x + hx + 0.5) / (2 * hx + 1)) * Math.sin(Math.PI * Math.min(1, v / L));
        const y = ridge - Math.sin(ang) * v - sag + x * 0.04 - r * 0.012;
        const z = sz * Math.cos(ang) * v;
        const slip = R() < 0.08 ? 0.12 : 0;
        add(G.box, MAT.shingle, M([x + R.range(-0.03, 0.03), y + 0.04, z + sz * slip], [sz * ang + R.range(-0.08, 0.08), R.range(-0.12, 0.12), R.range(-0.06, 0.06)], [0.38, 0.05, 0.5]), 0.012);
      }
    }
    for (const sx of [-1, 1]) {
      const m = M([sx * (hx + 0.47), ridge - Math.sin(ang) * L / 2 - 0.04, sz * Math.cos(ang) * L / 2], [sz * ang, 0, 0], [0.07, 0.2, L + 0.1]);
      add(G.box, MAT.woodDark, m, 0.014);
    }
  }
  add(G.box, MAT.woodDark, M([0.05, ridge + 0.1, 0], [Math.PI / 4, 0, -0.04], [hx * 2 + 1.2, 0.16, 0.16]), 0.016);
  // gable-end triangles closing the space between the plank tops and the roof
  for (const sx of [-1, 1]) {
    const tri = new THREE.Shape([new THREE.Vector2(-hz, eave), new THREE.Vector2(hz, eave), new THREE.Vector2(0, ridge - 0.05)]);
    const g = new THREE.ShapeGeometry(tri);
    g.rotateY(sx * Math.PI / 2);
    g.translate(sx * (hx - wallT - 0.01), 0, 0);
    w(g, MAT.woodDark, null, 0);
  }

  // stovepipe chimney with a crooked elbow and a hat
  const cx = -hx + 0.9, cz = -0.55;
  const cy = roofY(cz);
  add(G.cyl8, MAT.iron, M([cx, cy + 0.4, cz], [0.05, 0, 0.06], [0.12, 1.0, 0.12]), 0.015);
  add(G.cyl8, MAT.iron, M([cx - 0.12, cy + 1.08, cz], [0, 0, 0.45], [0.11, 0.55, 0.11]), 0.015);
  add(G.cone6, MAT.iron, M([cx - 0.27, cy + 1.48, cz], [0, 0, 0.3], [0.24, 0.18, 0.24]), 0.015);
  // weathervane on the +x end of the ridge
  const vx = hx + 0.1, vy = ridge + 0.15;
  add(G.cyl6, MAT.iron, M([vx, vy + 0.45, 0], [0, 0, 0.06], [0.025, 0.9, 0.025]), 0.008);
  add(G.box, MAT.iron, M([vx + 0.04, vy + 0.62, 0], [0, 0.5, 0], [0.5, 0.025, 0.025]), 0.006);
  add(G.box, MAT.iron, M([vx + 0.04, vy + 0.62, 0], [0, 2.07, 0], [0.5, 0.025, 0.025]), 0.006);
  const vm = M([vx + 0.05, vy + 0.86, 0], [0, 0.9, 0]);
  add(G.box, MAT.iron, vm.clone().multiply(M([0, 0, 0], [0, 0, 0], [0.7, 0.03, 0.03])), 0.008);
  add(G.cone4, MAT.iron, vm.clone().multiply(M([0.4, 0, 0], [0, 0, -Math.PI / 2], [0.08, 0.16, 0.02])), 0.008);
  add(coffinShapeGeo(0.22, 0.4, 0.02), MAT.iron, vm.clone().multiply(M([-0.38, 0.0, -0.01], [0, 0, Math.PI / 2])), 0.008);

  // door: dark boards with a Z brace, a frame, a knob, and a little skull plaque above
  const dz = -hz - 0.03, dx = 0.55;
  for (let i = -1; i <= 1; i++) w(G.box, MAT.woodDark, M([dx + i * 0.3, 0.97, dz - 0.02], [0, 0, R.range(-0.015, 0.015)], [0.29, 1.9, 0.06]), 0.012);
  for (const y of [0.4, 1.55]) w(G.box, MAT.wood, M([dx, y, dz - 0.07], [0, 0, 0], [0.88, 0.12, 0.05]), 0.01);
  w(G.box, MAT.wood, M([dx, 0.97, dz - 0.07], [0, 0, -0.95], [0.1, 1.3, 0.04]), 0.01);
  for (const s of [-1, 1]) w(G.box, MAT.wood, M([dx + s * 0.52, 1.02, dz - 0.03], [0, 0, 0], [0.12, 2.05, 0.08]), 0.014);
  w(G.box, MAT.wood, M([dx, 2.08, dz - 0.03], [0, 0, 0.04], [1.25, 0.14, 0.1]), 0.014);
  w(G.sphLo, MAT.iron, M([dx - 0.32, 1.0, dz - 0.1], [0, 0, 0], 0.045), 0.01);
  w(G.sph, MAT.bone, M([dx, 2.3, dz - 0.04], [0, 0, 0], [0.12, 0.13, 0.06]), 0.012);
  w(G.box, MAT.bone, M([dx, 2.2, dz - 0.04], [0, 0, 0], [0.1, 0.06, 0.06]), 0.01);
  for (const s of [-1, 1]) w(G.sphLo, MAT.ink, M([dx + s * 0.045, 2.31, dz - 0.085], [0, 0, 0], [0.032, 0.036, 0.02]), 0);
  for (const s of [-1, 1]) w(G.box, MAT.bone, M([dx + s * 0.15, 2.28, dz - 0.04], [0, 0, s * 0.5], [0.16, 0.04, 0.04]), 0.008);
  add(G.box, MAT.stone, M([dx, 0.07, dz - 0.25], [0, 0.05, 0], [1.1, 0.14, 0.45]), 0.016);

  // lit windows: front (crooked) and on the +x gable end
  const win = (m, ww, wh) => {
    w(G.box, MAT.glass, m.clone().multiply(M([0, 0, 0], [0, 0, 0], [ww, wh, 0.03])), 0);
    for (const s of [-1, 1]) {
      w(G.box, MAT.wood, m.clone().multiply(M([s * (ww / 2 + 0.04), 0, -0.02], [0, 0, 0], [0.09, wh + 0.16, 0.06])), 0.012);
      w(G.box, MAT.wood, m.clone().multiply(M([0, s * (wh / 2 + 0.04), -0.02], [0, 0, 0], [ww + 0.18, 0.09, 0.06])), 0.012);
    }
    w(G.box, MAT.woodDark, m.clone().multiply(M([0, 0, -0.025], [0, 0, 0], [0.04, wh, 0.03])), 0);
    w(G.box, MAT.woodDark, m.clone().multiply(M([0, wh * 0.1, -0.025], [0, 0, 0], [ww, 0.04, 0.03])), 0);
  };
  const wf = M([-1.15, 1.6, -hz - 0.02], [0, 0, 0.09]);
  win(wf, 0.58, 0.68);
  // a shutter hanging off one hinge
  w(G.box, MAT.woodDark, wf.clone().multiply(M([-0.62, -0.08, -0.06], [0, 0.35, -0.25], [0.32, 0.72, 0.04])), 0.012);
  win(M([hx + 0.02, 2.55, 0.05], [0, -Math.PI / 2, -0.06]), 0.36, 0.44);

  // lantern on an iron hook beside the door
  const hk = V(-0.25, 2.15, -hz - 0.02);
  w(G.box, MAT.iron, M([hk.x, hk.y, hk.z - 0.22], [0, 0, 0], [0.03, 0.03, 0.45]), 0.008);
  const curl = [V(hk.x, hk.y, hk.z - 0.42), ...spiralPts(V(hk.x, hk.y, hk.z - 0.42), V(0, 0, -1), V(0, 1, 0), 0.07, 1.2, 7)];
  add(tube(new THREE.CatmullRomCurve3(curl.map((p) => p.applyMatrix4(shear))), 10, 4, (t) => 0.016 - t * 0.008), MAT.iron, null, 0.008);
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
  add(G.box, MAT.woodLight, M([0, 0.8, 0], [0, 0.03, 0.02], [0.55, 0.05, 2.1]), 0.012);
  add(G.box, MAT.wood, M([0.1, 0.85, 0.15], [0, -0.08, 0], [0.32, 0.05, 1.7]), 0.012);
  add(G.box, MAT.iron, M([-0.12, 0.9, -0.45], [0, 0.5, 0], [0.12, 0.012, 0.55]), 0.006);
  add(G.box, MAT.woodDark, M([-0.25, 0.92, -0.73], [0, 0.5, 0], [0.08, 0.05, 0.16]), 0.008);
  // a stack of boards on the ground
  for (let i = 0; i < 4; i++) add(G.box, i % 2 ? MAT.woodDark : MAT.wood, M([1.45 + (i % 2) * 0.05, 0.05 + i * 0.09, -0.2 + i * 0.04], [0, 0.04 * (i - 1.5), 0.02], [0.32, 0.08, 1.9]), 0.012);
  add(G.box, MAT.woodDark, M([1.5, 0.2, 0.85], [0.6, 0.2, 0.1], [0.3, 0.07, 1.0]), 0.012);
}
export function coffinLidParts(add, m) {
  add(coffinShapeGeo(0.62, 1.9, 0.06), MAT.woodDark, m, 0.016);
  add(G.box, MAT.bone, m.clone().multiply(M([0, 0.32, -0.01], [0, 0, 0], [0.06, 0.5, 0.02])), 0.008);
  add(G.box, MAT.bone, m.clone().multiply(M([0, 0.42, -0.01], [0, 0, 0], [0.28, 0.06, 0.02])), 0.008);
  // a black-and-white band across the foot, like the concept coffins
  for (let i = 0; i < 6; i++) add(G.box, i % 2 ? MAT.ink : MAT.bone, m.clone().multiply(M([-0.17 + i * 0.068, -0.82, -0.007], [0, 0, 0], [0.068, 0.12, 0.012])), 0);
}

// A grass tuft: a fan of curved blades, about 0.3 m tall. Used as an InstancedMesh.
export function tuftGeo(blades = 4) {
  const pos = [];
  for (let i = 0; i < blades; i++) {
    const a = (i / blades) * Math.PI * 2 + i * 0.7;
    const lean = 0.35 + (i % 3) * 0.2, h = 0.22 + ((i * 37) % 5) * 0.035, w = 0.035;
    const dx = Math.cos(a), dz = Math.sin(a), sx = -dz * w, sz = dx * w;
    const p0 = [dx * 0.03, 0, dz * 0.03], p1 = [dx * lean * h * 0.5, h * 0.55, dz * lean * h * 0.5], p2 = [dx * lean * h * 1.3, h, dz * lean * h * 1.3];
    const q = (p, k) => [[p[0] - sx * k, p[1], p[2] - sz * k], [p[0] + sx * k, p[1], p[2] + sz * k]];
    const [a0, b0] = q(p0, 1), [a1, b1] = q(p1, 0.7);
    pos.push(...a0, ...b0, ...a1, ...b0, ...b1, ...a1, ...a1, ...b1, ...p2);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  return g;
}

export function mushroomGeos() {
  const cap = new THREE.SphereGeometry(1, 7, 3, 0, Math.PI * 2, 0, Math.PI / 2);
  cap.scale(0.07, 0.05, 0.07).translate(0, 0.1, 0);
  const stem = new THREE.CylinderGeometry(0.018, 0.025, 0.11, 5).translate(0, 0.055, 0);
  return { cap, stem };
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

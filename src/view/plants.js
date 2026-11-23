import * as THREE from 'three';
import { plantMaterial, K } from '../shaders/paint-plants.js';
import { rng } from '../shared/rng.js';
import { DECOR, FENCE, ROAD_Z, ROAD_HALF, CARPENTER, MORGUE, PLOTS, PLOT_HALF, PATHS, LANTERNS } from '../shared/layout.js';

// Every plant in the yard: grass tufts, dry seed grass, cattails, toadstools and pale mushrooms, ferns, thistles,
// dandelions, wildflowers, ivy on headstones and fence pillars, brambles, crooked bushes, leaf piles and pumpkins.
// Blades and leaves are flat ribbons and cards of a few triangles, toadstools and pumpkins are tiny lathes; spots,
// veins, ribs, leaflets and petals are painted (and cut out) by paint-plants.js. Everything is merged into one static
// mesh with one material: one draw call, wind sway in the vertex shader. Placement is seeded, so every peer sees the
// same yard. Plants are visual only: no colliders.
// buildPlants(spots) -> { mesh, update(time), counts }
//   spots.tufts   [[x, z, k]] grass tuft spots from world.js (stones, fence posts, trees, the shed, lanterns)
//   spots.shrooms [[x, z, k]] mushroom spots from world.js (tree roots, the shed wall)
//   spots.pillars [Matrix4]   fence pillar transforms (ivy climbs a few of them)

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const UP = V(0, 1, 0);
const lin = (h) => new THREE.Color(h); // THREE.Color keeps linear values when set from hex
const mixC = (a, b, t) => a.clone().lerp(b, t);

// ---- colors (sRGB hex, stored linear) ----
const C = {
  grassBase: lin('#3a5230'), grassTip: lin('#a9bb5e'), grassTipY: lin('#c3bd62'), grassBaseD: lin('#2f4430'),
  dry: lin('#a88c5c'), dryTip: lin('#d8c08a'), seed: lin('#8a6a48'), seed2: lin('#c9a774'),
  reed: lin('#4f6a34'), reedTip: lin('#8fa45a'), cattail: lin('#5e3424'),
  red: lin('#c8352a'), spot: lin('#f6efe0'), stem: lin('#e9e0cc'), gill: lin('#e6d6c0'),
  pale: lin('#d7cab0'), paleTop: lin('#efe6d2'), glowCap: lin('#ff9a4a'),
  fern: lin('#5d7a34'), fernTip: lin('#9fb556'),
  thistle: lin('#53664f'), thistleVein: lin('#a7b89a'), thistleHead: lin('#9a4a92'), thistleBulb: lin('#5c7048'),
  dandLeaf: lin('#4f7a34'), dandVein: lin('#9cc26a'), yellow: lin('#f0bb24'), orange: lin('#e08a1a'), puff: lin('#f4f1e8'), puffC: lin('#8a7a52'),
  ivy: lin('#2c5226'), ivyVein: lin('#a3c27a'), vine: lin('#5a4a3a'),
  cane: lin('#5c3438'), berry: lin('#2a1630'), berryHi: lin('#8a6aa0'), bramLeaf: lin('#4c6a3a'), bramVein: lin('#93ad78'),
  twig: lin('#5a4334'), bush: lin('#6f7c3e'), bush2: lin('#a3a456'),
  pumpkin: lin('#e07a26'), pumpkinRib: lin('#9a4416'), pstem: lin('#5f6a2e'),
};
const FALL = ['#c8642a', '#a33a22', '#d99a3a', '#8a4a2a', '#e0b048'].map(lin);
const BLOOMS = [['#f4f0f6', '#f0c030'], ['#e89ab8', '#f6e08a'], ['#9a7ad0', '#f6e08a'], ['#f2d040', '#c07020'], ['#f6f2e6', '#e8a030']].map(([a, b]) => [lin(a), lin(b)]);

// ---- geometry collector: non-indexed triangles with the paint attributes ----
class Veg {
  constructor() { this.a = { position: [], normal: [], uv: [], aCol: [], aCol2: [], aP: [] }; this.tris = 0; }
  // v = { p, n, u, v, w }, o = { kind, c, c2, glow, seed }
  vert(v, o) {
    const a = this.a;
    a.position.push(v.p.x, v.p.y, v.p.z);
    a.normal.push(v.n.x, v.n.y, v.n.z);
    a.uv.push(v.u, v.v);
    a.aCol.push(o.c.r, o.c.g, o.c.b);
    const c2 = o.c2 || o.c;
    a.aCol2.push(c2.r, c2.g, c2.b);
    a.aP.push(o.kind, v.w || 0, o.glow || 0, o.seed || 0);
  }
  tri(v0, v1, v2, o) { this.vert(v0, o); this.vert(v1, o); this.vert(v2, o); this.tris++; }
  quad(a, b, c, d, o) { this.tri(a, b, c, o); this.tri(a, c, d, o); } // a b on the lower edge, d c above
  // a flat strip along pts, half widths w[i] (0 = a point), across direction side (unit). uv: x across, y along.
  // o.wind: sway in meters at the tip (grows with the square of the way along); o.upN: lean normals toward up
  ribbon(pts, w, side, o) {
    const n = pts.length;
    const t = []; let L = 0; t.push(0);
    for (let i = 1; i < n; i++) { L += pts[i].distanceTo(pts[i - 1]); t.push(L); }
    const vs = pts.map((p, i) => {
      const tan = (i < n - 1 ? pts[i + 1].clone().sub(p) : p.clone().sub(pts[i - 1])).normalize();
      const nn = side.clone().cross(tan).normalize();
      if (nn.y < 0) nn.negate();
      nn.lerp(UP, o.upN ?? 0.5).normalize();
      const f = t[i] / L, wind = (o.wind || 0) * f * f;
      const s = side.clone().multiplyScalar(w[i]);
      return {
        l: { p: p.clone().sub(s), n: nn, u: -1, v: f, w: wind }, r: { p: p.clone().add(s), n: nn, u: 1, v: f, w: wind },
        c: { p: p.clone(), n: nn, u: 0, v: f, w: wind }, pt: w[i] === 0,
      };
    });
    for (let i = 0; i < n - 1; i++) {
      const A = vs[i], B = vs[i + 1];
      if (B.pt) this.tri(A.l, A.r, B.c, o);
      else if (A.pt) this.tri(A.c, B.r, B.l, o);
      else this.quad(A.l, A.r, B.r, B.l, o);
    }
  }
  // a card from base along up (full length) and +-side (half width); uv x -1..1, y 0..1
  card(base, up, side, o, normal) {
    const n = normal || side.clone().cross(up).normalize().lerp(UP, o.upN ?? 0.4).normalize();
    const w0 = o.windBase || 0, w1 = o.wind || 0;
    const a = { p: base.clone().sub(side), n, u: -1, v: 0, w: w0 }, b = { p: base.clone().add(side), n, u: 1, v: 0, w: w0 };
    const top = base.clone().add(up);
    const c = { p: top.clone().add(side), n, u: 1, v: 1, w: w1 }, d = { p: top.clone().sub(side), n, u: -1, v: 1, w: w1 };
    this.quad(a, b, c, d, o);
  }
  // two crossed cards, for flower heads seen from any side
  cross(base, up, half, o) {
    const s = V(1, 0, 0).applyAxisAngle(UP, (o.seed || 0) * 6.28);
    const dir = up.clone().normalize();
    const s1 = s.clone().sub(dir.clone().multiplyScalar(s.dot(dir))).normalize().multiplyScalar(half);
    const s2 = dir.clone().cross(s1).normalize().multiplyScalar(half);
    this.card(base, up, s1, o); this.card(base, up, s2, o);
  }
  // solid of revolution: prof [[r, y], ...] bottom to top, seg sides, placed by matrix m; uv x around, y along
  lathe(prof, seg, m, o, windTop = 0) {
    const nm = new THREE.Matrix3().getNormalMatrix(m);
    const ring = prof.map(([r, y], i) => {
      const [r0, y0] = prof[Math.max(0, i - 1)], [r1, y1] = prof[Math.min(prof.length - 1, i + 1)];
      const dr = r1 - r0, dy = y1 - y0; // profile tangent; the outward normal is (dy, -dr)
      return Array.from({ length: seg + 1 }, (_, k) => {
        const a = (k / seg) * Math.PI * 2, ca = Math.cos(a), sa = Math.sin(a);
        const n = V(ca * dy, -dr, sa * dy).normalize().applyMatrix3(nm).normalize();
        return { p: V(ca * r, y, sa * r).applyMatrix4(m), n, u: k / seg, v: i / (prof.length - 1), w: windTop * (i / (prof.length - 1)) };
      });
    });
    for (let i = 0; i < prof.length - 1; i++) for (let k = 0; k < seg; k++) {
      const a = ring[i][k], b = ring[i][k + 1], c = ring[i + 1][k + 1], d = ring[i + 1][k];
      if (prof[i + 1][0] === 0) this.tri(a, b, c, o);
      else if (prof[i][0] === 0) this.tri(a, c, d, o);
      else this.quad(a, b, c, d, o);
    }
  }
  // a three-sided tube along pts with radii r[i] (twigs, canes, stalks)
  tube(pts, r, o, sides = 3) {
    const n = pts.length;
    let side = V(1, 0, 0);
    const rings = pts.map((p, i) => {
      const tan = (i < n - 1 ? pts[i + 1].clone().sub(p) : p.clone().sub(pts[i - 1])).normalize();
      side = side.clone().sub(tan.clone().multiplyScalar(side.dot(tan)));
      if (side.lengthSq() < 1e-6) side = V(0, 0, 1).cross(tan);
      side.normalize();
      const bi = tan.clone().cross(side);
      const f = i / (n - 1), wind = (o.wind || 0) * f * f;
      return Array.from({ length: sides + 1 }, (_, k) => {
        const a = (k / sides) * Math.PI * 2;
        const d = side.clone().multiplyScalar(Math.cos(a)).add(bi.clone().multiplyScalar(Math.sin(a)));
        return { p: p.clone().add(d.clone().multiplyScalar(r[i])), n: d, u: k / sides, v: f, w: wind };
      });
    });
    for (let i = 0; i < n - 1; i++) for (let k = 0; k < sides; k++) {
      this.quad(rings[i][k], rings[i][k + 1], rings[i + 1][k + 1], rings[i + 1][k], o);
    }
  }
  build() {
    const g = new THREE.BufferGeometry();
    for (const [name, arr] of Object.entries(this.a)) {
      const size = { position: 3, normal: 3, uv: 2, aCol: 3, aCol2: 3, aP: 4 }[name];
      g.setAttribute(name, new THREE.Float32BufferAttribute(arr, size));
    }
    g.computeBoundingSphere();
    return g;
  }
}

// ---- where plants may grow ----
const roadCenter = (x) => ROAD_Z + Math.sin(x * 0.05) * 0.45 + Math.sin(x * 0.13 + 1.0) * 0.2; // twin of ground.js
const segDist = (x, z, [ax, az, bx, bz]) => {
  const px = x - ax, pz = z - az, dx = bx - ax, dz = bz - az;
  const t = Math.max(0, Math.min(1, (px * dx + pz * dz) / (dx * dx + dz * dz)));
  return Math.hypot(px - dx * t, pz - dz * t);
};
const SH = DECOR.shed;
// tall = taller than about 0.25 m: kept away from the work area
function ok(x, z, tall = false) {
  if (Math.abs(z - roadCenter(x)) < ROAD_HALF + 0.15) return false;
  const pm = tall ? 0.6 : 0.1;
  if (PLOTS.some((p) => Math.abs(x - p.x) < PLOT_HALF.x + pm && Math.abs(z - p.z) < PLOT_HALF.z + pm)) return false;
  const pathM = tall ? 1.5 : 0.75;
  if (PATHS.some((s) => segDist(x, z, s) < pathM)) return false;
  const mm = tall ? 0.9 : 0.3; // nothing grows through the morgue's floor, nothing tall crowds its walls
  if (x > MORGUE.x0 - mm && x < MORGUE.x1 + mm && z > MORGUE.z0 - mm - 0.6 && z < MORGUE.z1 + mm) return false;
  if (Math.hypot(x - CARPENTER.x, z - CARPENTER.z) < 1.3) return false; // the carpenter's corner
  if (tall && x > -0.5 && x < 6 && z > 11.8 && z < 16) return false; // where the truck stops
  if (Math.abs(x - SH.x) < SH.hx + 0.05 && Math.abs(z - SH.z) < SH.hz + 0.05) return false;
  if (DECOR.trees.some((t) => Math.hypot(x - t.x, z - t.z) < 0.45)) return false;
  if (LANTERNS.some(([lx, lz]) => Math.hypot(x - lx, z - lz) < 0.15)) return false;
  for (const st of DECOR.stones) {
    const dx = x - st.x, dz = z - st.z, c = Math.cos(st.ry), s = Math.sin(st.ry);
    if (Math.abs(dx * c - dz * s) < st.w / 2 + 0.03 && Math.abs(dx * s + dz * c) < 0.16) return false;
  }
  return true;
}
const inYard = (x, z, m = 0) => Math.abs(x) < FENCE - m && Math.abs(z) < FENCE - m;

export function buildPlants(spots = {}) {
  const veg = new Veg();
  const counts = {}; // name -> [placed, triangles]
  let lastTris = 0;
  const count = (k) => { const c = counts[k] || (counts[k] = [0, 0]); c[0]++; c[1] += veg.tris - lastTris; lastTris = veg.tris; };
  const R = rng(5150);

  // ---- 1. grass tufts: fans of pointed blades, dark at the root, light at the tips ----
  // size 0 small (~0.12 m), 1 medium (~0.2 m), 2 large (~0.32 m, tall: not by the work area)
  function tuft(x, z, size, dry = 0) {
    const r = rng(Math.floor(x * 977 + z * 131 + 7)); // a tuft's look depends only on where it stands
    const n = [5, 5, 5][size], h0 = [0.15, 0.22, 0.42][size] * r.range(0.85, 1.15);
    const tip = mixC(mixC(C.grassTip, C.grassTipY, r()), C.dryTip, dry), baseC = mixC(r() < 0.5 ? C.grassBase : C.grassBaseD, C.dry, dry * 0.6);
    const o = { kind: K.blade, c: baseC, c2: tip, seed: r(), upN: 0.55 };
    const a0 = r() * 6.28;
    for (let i = 0; i < n; i++) {
      const a = a0 + (i / n) * 6.28 + r.range(-0.4, 0.4);
      const h = h0 * r.range(0.65, 1.15) * (i % 3 === 0 ? 1.15 : 1);
      const lean = r.range(0.25, 0.75), dx = Math.cos(a), dz = Math.sin(a);
      const w = h0 * 0.11 * r.range(0.8, 1.2);
      const pts = [V(x + dx * 0.02, 0, z + dz * 0.02), V(x + dx * (0.02 + lean * h * 0.3), h * 0.55, z + dz * (0.02 + lean * h * 0.3)),
        V(x + dx * (0.02 + lean * h * 0.9), h, z + dz * (0.02 + lean * h * 0.9))];
      // small and medium tufts: one triangle per blade; large ones bend in the middle
      if (size < 2) veg.ribbon([pts[0], pts[2]], [w, 0], V(-dz, 0, dx), { ...o, wind: h * 0.6 });
      else veg.ribbon(pts, [w, w * 0.75, 0], V(-dz, 0, dx), { ...o, wind: h * 0.6 });
    }
    count(['tuft S', 'tuft M', 'tuft L'][size]);
  }
  const tryTuft = (x, z, size, dry = 0) => { if (ok(x, z, size === 2)) tuft(x, z, size, dry); else if (size === 2 && ok(x, z)) tuft(x, z, 1, dry); };

  // ---- 2. tall dry grass with seed heads, cattail reeds ----
  function dryGrass(x, z) {
    const r = rng(Math.floor(x * 613 + z * 59 + 3));
    for (let i = 0; i < 4; i++) {
      const a = r() * 6.28, h = r.range(0.4, 0.75), lean = r.range(0.15, 0.4), dx = Math.cos(a), dz = Math.sin(a);
      const pts = [V(x, 0, z), V(x + dx * lean * h * 0.35, h * 0.55, z + dz * lean * h * 0.35), V(x + dx * lean * h, h, z + dz * lean * h)];
      veg.ribbon(pts, [0.016, 0.012, 0], V(-dz, 0, dx), { kind: K.blade, c: C.dry, c2: C.dryTip, seed: r(), wind: h, upN: 0.5 });
    }
    for (let i = 0; i < 2 + (r() < 0.3); i++) {
      const a = r() * 6.28, h = r.range(0.65, 1.0), lean = r.range(0.05, 0.2), dx = Math.cos(a), dz = Math.sin(a);
      const top = V(x + dx * lean * h, h, z + dz * lean * h);
      veg.ribbon([V(x, 0, z), V(x + dx * lean * h * 0.4, h * 0.6, z + dz * lean * h * 0.4), top], [0.006, 0.005, 0.004], V(-dz, 0, dx), { kind: K.plain, c: C.dry, seed: r(), wind: h });
      const dir = V(dx * (lean + 0.25), 1, dz * (lean + 0.25)).normalize().multiplyScalar(r.range(0.11, 0.16));
      veg.card(top, dir, V(-dz, 0, dx).multiplyScalar(0.022), { kind: K.seeds, c: C.seed, c2: C.seed2, seed: r(), windBase: h, wind: h * 1.15, upN: 0.3 });
      veg.card(top, dir, V(dx, 0, dz).multiplyScalar(0.022), { kind: K.seeds, c: C.seed, c2: C.seed2, seed: r(), windBase: h, wind: h * 1.15, upN: 0.3 });
    }
    count('seed grass');
  }
  function cattails(x, z) {
    const r = rng(Math.floor(x * 211 + z * 97 + 11));
    for (let i = 0; i < 5; i++) {
      const a = r() * 6.28, h = r.range(0.7, 1.25), lean = r.range(0.1, 0.35), dx = Math.cos(a), dz = Math.sin(a);
      const ox = x + r.range(-0.15, 0.15), oz = z + r.range(-0.15, 0.15);
      const pts = [V(ox, 0, oz), V(ox + dx * lean * h * 0.2, h * 0.5, oz + dz * lean * h * 0.2), V(ox + dx * lean * h * 0.6, h * 0.85, oz + dz * lean * h * 0.6), V(ox + dx * lean * h, h, oz + dz * lean * h)];
      veg.ribbon(pts, [0.045, 0.04, 0.025, 0], V(-dz, 0, dx), { kind: K.blade, c: C.reed, c2: C.reedTip, seed: r(), wind: h * 0.8, upN: 0.45 });
    }
    for (let i = 0; i < 2 + (r() < 0.5); i++) {
      const ox = x + r.range(-0.12, 0.12), oz = z + r.range(-0.12, 0.12), h = r.range(1.1, 1.5), lx = r.range(-0.06, 0.06), lz = r.range(-0.06, 0.06);
      veg.ribbon([V(ox, 0, oz), V(ox + lx * 0.5, h * 0.6, oz + lz * 0.5), V(ox + lx, h + 0.06, oz + lz)], [0.008, 0.007, 0.005], V(1, 0, 0).applyAxisAngle(UP, r() * 3), { kind: K.plain, c: C.reed, seed: r(), wind: h * 0.7 });
      const m = new THREE.Matrix4().makeTranslation(ox + lx, h - 0.22, oz + lz);
      veg.lathe([[0, 0], [0.03, 0.025], [0.03, 0.19], [0, 0.22]], 5, m, { kind: K.plain, c: C.cattail, seed: r() }, h * 0.7);
    }
    count('cattails');
  }

  // ---- 3. toadstools and pale mushrooms ----
  function toadstool(x, z, k, glow = 0, red = true) {
    const r = rng(Math.floor(x * 1013 + z * 377 + 5));
    const tilt = new THREE.Euler(r.range(-0.15, 0.15), r() * 6.28, r.range(-0.15, 0.15));
    k *= 1.5;
    const m = new THREE.Matrix4().compose(V(x, 0, z), new THREE.Quaternion().setFromEuler(tilt), V(k, k, k));
    const stemC = red ? C.stem : C.pale;
    if (red) {
      veg.lathe([[0.024, 0], [0.017, 0.11]], 5, m, { kind: K.plain, c: stemC, seed: r() });
      veg.lathe([[0.075, 0.1], [0.06, 0.137], [0, 0.16]], 6, m, { kind: K.cap, c: glow ? C.glowCap : C.red, c2: C.spot, glow, seed: r() });
      gills(m, 0.075, 0.1, glow, 6);
    } else {
      const h = r.range(0.13, 0.2);
      veg.lathe([[0.012, 0], [0.009, h * 0.6], [0.008, h]], 4, m, { kind: K.plain, c: stemC, seed: r() });
      veg.lathe([[0.05, h - 0.01], [0.035, h + 0.02], [0, h + 0.035]], 6, m, { kind: K.plain, c: C.paleTop, seed: r() });
      gills(m, 0.05, h - 0.01, 0, 6);
    }
    count(red ? 'toadstool' : 'pale mushroom');
  }
  function gills(m, rad, y, glow, seg) {
    const n = V(0, -1, 0).transformDirection(m);
    const o = { kind: K.gills, c: C.gill, glow };
    const c = { p: V(0, y, 0).applyMatrix4(m), n, u: 0, v: 0 };
    for (let k = 0; k < seg; k++) {
      const a0 = (k / seg) * 6.2832, a1 = ((k + 1) / seg) * 6.2832;
      const p = (a) => ({ p: V(Math.cos(a) * rad, y, Math.sin(a) * rad).applyMatrix4(m), n, u: Math.cos(a), v: Math.sin(a) });
      veg.tri(c, p(a0), p(a1), o);
    }
  }
  function shroomCluster(x, z, n, glow, red = true) {
    const r = rng(Math.floor(x * 71 + z * 53 + 1));
    for (let i = 0; i < n; i++) {
      const px = x + r.range(-0.22, 0.22), pz = z + r.range(-0.22, 0.22);
      if (ok(px, pz)) toadstool(px, pz, r.range(0.55, 1.25) * (i === 0 ? 1.25 : 1), glow, red);
    }
  }

  // ---- 4. ferns, thistles, dandelions, wildflowers ----
  function fern(x, z) {
    const r = rng(Math.floor(x * 331 + z * 17 + 9));
    const n = 6;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * 6.28 + r.range(-0.3, 0.3), L = r.range(0.4, 0.6), dx = Math.cos(a), dz = Math.sin(a);
      const out = (f) => 0.03 + L * (0.15 + f * 0.75);
      const ys = [0, L * 0.55, L * 0.62, L * 0.45];
      const pts = [0, 0.33, 0.66, 1].map((f, j) => V(x + dx * out(f) * f, ys[j], z + dz * out(f) * f));
      pts[0] = V(x + dx * 0.02, 0, z + dz * 0.02);
      const w = L * 0.24;
      veg.ribbon(pts, [w * 0.6, w, w * 0.8, w * 0.35], V(-dz, 0, dx), { kind: K.fern, c: C.fern, c2: C.fernTip, seed: r(), wind: L * 0.5, upN: 0.35 });
    }
    count('fern');
  }
  function rosette(x, z, n, len, wid, c, c2, lift, r) {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * 6.28 + r.range(-0.3, 0.3), L = len * r.range(0.8, 1.2), dx = Math.cos(a), dz = Math.sin(a);
      const pts = [V(x, 0.01, z), V(x + dx * L * 0.5, lift * L, z + dz * L * 0.5), V(x + dx * L, lift * L * 0.5 + 0.01, z + dz * L)];
      veg.ribbon(pts, [wid, wid, wid * 0.8], V(-dz, 0, dx), { kind: K.thistle, c, c2, seed: r(), wind: L * 0.2, upN: 0.3 });
    }
  }
  function thistle(x, z) {
    const r = rng(Math.floor(x * 89 + z * 409 + 13));
    rosette(x, z, 6, 0.32, 0.075, C.thistle, C.thistleVein, 0.5, r);
    for (let i = 0; i < 2 + (r() < 0.6); i++) {
      const h = r.range(0.45, 0.75), lx = r.range(-0.1, 0.1), lz = r.range(-0.1, 0.1);
      const top = V(x + lx, h, z + lz);
      veg.ribbon([V(x, 0, z), V(x + lx * 0.4, h * 0.5, z + lz * 0.4), top], [0.008, 0.007, 0.006], V(1, 0, 0).applyAxisAngle(UP, r() * 3), { kind: K.plain, c: C.thistle, seed: r(), wind: h * 0.7 });
      // a few spiky leaves up the stem
      const a = r() * 6.28, dx = Math.cos(a), dz = Math.sin(a);
      veg.card(V(x + lx * 0.4, h * 0.45, z + lz * 0.4), V(dx * 0.14, 0.05, dz * 0.14), V(-dz, 0.4, dx).normalize().multiplyScalar(0.04), { kind: K.thistle, c: C.thistle, c2: C.thistleVein, seed: r(), windBase: h * 0.3, wind: h * 0.4 });
      veg.cross(top.clone().add(V(0, -0.03, 0)), V(lx * 0.3, 0.13, lz * 0.3), 0.05, { kind: K.bloom, c: C.thistleHead, c2: C.thistleBulb, seed: r(), windBase: h * 0.7, wind: h * 0.75, upN: 0.2 });
    }
    count('thistle');
  }
  function dandelion(x, z, tall) {
    const r = rng(Math.floor(x * 557 + z * 263 + 17));
    rosette(x, z, 5, 0.17, 0.035, C.dandLeaf, C.dandVein, 0.35, r);
    for (let i = 0; i < 1 + (r() < 0.6); i++) {
      const h = tall ? r.range(0.22, 0.34) : r.range(0.1, 0.2), lx = r.range(-0.06, 0.06), lz = r.range(-0.06, 0.06);
      const top = V(x + lx, h, z + lz);
      veg.ribbon([V(x, 0, z), V(x + lx * 0.5, h * 0.5, z + lz * 0.5), top], [0.004, 0.004, 0.003], V(1, 0, 0).applyAxisAngle(UP, r() * 3), { kind: K.plain, c: C.dandLeaf, seed: r(), wind: h });
      const puff = r() < 0.45;
      const s = puff ? 0.045 : 0.03;
      veg.cross(top.clone().add(V(0, -s, 0)), V(0, s * 2, 0), s, puff
        ? { kind: K.puff, c: C.puff, c2: C.puffC, seed: r(), windBase: h, wind: h, upN: 0.3 }
        : { kind: K.flower, c: C.yellow, c2: C.orange, seed: 0.5 + r() * 0.4, windBase: h, wind: h, upN: 0.3 });
    }
    count('dandelion');
  }
  function wildflowers(x, z, maxH = 0.25) {
    const r = rng(Math.floor(x * 401 + z * 787 + 19));
    const [pc, cc] = r.pick(BLOOMS);
    for (let i = 0; i < 2 + Math.floor(r() * 3); i++) {
      const ox = x + r.range(-0.12, 0.12), oz = z + r.range(-0.12, 0.12), h = r.range(0.1, maxH);
      const top = V(ox + r.range(-0.03, 0.03), h, oz + r.range(-0.03, 0.03));
      veg.ribbon([V(ox, 0, oz), V((ox + top.x) / 2, h * 0.5, (oz + top.z) / 2), top], [0.004, 0.003, 0.002], V(1, 0, 0).applyAxisAngle(UP, r() * 3), { kind: K.blade, c: C.grassBase, c2: C.dandLeaf, seed: r(), wind: h, upN: 0.5 });
      const s = r.range(0.03, 0.045);
      veg.cross(top.clone().add(V(0, -s, 0)), V(0, s * 2, 0), s, { kind: K.flower, c: pc, c2: cc, seed: r(), windBase: h, wind: h, upN: 0.3 });
    }
    count('wildflowers');
  }

  // ---- 5. ivy: flat leaves hugging a surface, given by a matrix whose local +z is the face normal ----
  function ivyPatch(m, w, h, seedN) {
    const r = rng(seedN);
    const n = V(0, 0, 1).transformDirection(m);
    const leaves = Math.round(8 + w * h * 30);
    // a vine wandering up the face
    const vine = [];
    let vx = r.range(-w * 0.4, w * 0.4);
    for (let i = 0; i <= 4; i++) { vine.push(V(vx, (i / 4) * h, 0.005).applyMatrix4(m)); vx = Math.max(-w / 2, Math.min(w / 2, vx + r.range(-0.12, 0.12))); }
    const vd = V(1, 0, 0).transformDirection(m);
    veg.ribbon(vine, [0.006, 0.006, 0.005, 0.004, 0.003], vd, { kind: K.plain, c: C.vine, seed: r(), upN: 0 });
    for (let i = 0; i < leaves; i++) {
      // denser near the ground
      const ly = Math.pow(r(), 1.6) * h, lx = r.range(-w / 2, w / 2), s = r.range(0.06, 0.095) * (1.2 - (ly / h) * 0.4);
      const a = r.range(-1.2, 1.2);
      const up = V(Math.sin(a), Math.cos(a), 0).multiplyScalar(s * 1.8);
      const side = V(Math.cos(a), -Math.sin(a), 0).multiplyScalar(s * 0.9);
      const lm = m.clone().multiply(new THREE.Matrix4().makeTranslation(lx, ly, 0.008 + i * 0.0006));
      const base = V(0, 0, 0).applyMatrix4(lm); // the leaf grows from its stalk on the vine
      const ud = up.clone().applyMatrix3(new THREE.Matrix3().setFromMatrix4(m));
      const sd = side.clone().applyMatrix3(new THREE.Matrix3().setFromMatrix4(m));
      const c = mixC(C.ivy, lin('#467a34'), r() * 0.6);
      veg.card(base, ud, sd, { kind: K.ivy, c, c2: C.ivyVein, seed: r() }, n);
    }
    count('ivy patch');
  }

  // ---- 6. brambles, crooked bushes, leaf piles, pumpkins ----
  const spiral = (p0, dir, len, turns, r0, upw = 0.3) => {
    // a cane that runs along dir then rolls into a curl
    const pts = [];
    const side = V(-dir.z, 0, dir.x);
    const n = 10;
    for (let i = 0; i <= n; i++) {
      const f = i / n;
      if (f <= 0.5) {
        const t = f / 0.5;
        pts.push(p0.clone().add(dir.clone().multiplyScalar(len * t)).add(V(0, Math.sin(t * Math.PI * 0.8) * len * upw, 0)));
      } else {
        const t = (f - 0.5) / 0.5, a = t * turns * Math.PI * 2, rr = r0 * (1 - t * 0.75);
        const c = pts[Math.floor(n / 2)];
        pts.push(c.clone().add(dir.clone().multiplyScalar(Math.sin(a) * rr)).add(V(0, (1 - Math.cos(a)) * rr * 0.9, 0)).add(side.clone().multiplyScalar(t * 0.03)));
      }
    }
    return pts;
  };
  function bramble(x, z) {
    const r = rng(Math.floor(x * 151 + z * 733 + 23));
    for (let c = 0; c < 3; c++) {
      const a = r() * 6.28, dir = V(Math.cos(a), 0.9, Math.sin(a)).normalize();
      const pts = spiral(V(x + r.range(-0.1, 0.1), 0, z + r.range(-0.1, 0.1)), dir, r.range(0.5, 0.8), 1.2, r.range(0.08, 0.12), 0.25);
      // a flat cane across the plane of its curl: the curl reads from the side, the cane is thin end-on
      veg.ribbon(pts, pts.map((_, i) => 0.012 * (1 - (i / pts.length) * 0.7)), V(-dir.z, 0, dir.x).normalize(), { kind: K.plain, c: C.cane, seed: r(), wind: 0.3, upN: 0.2 });
      // thorns: single small triangles along the cane
      for (let i = 1; i < 5; i++) {
        const p = pts[i], t = pts[i + 1].clone().sub(p).normalize(), out = V(r() - 0.5, r() - 0.5, r() - 0.5).cross(t).normalize();
        const tip = p.clone().add(out.clone().multiplyScalar(0.03)).add(t.clone().multiplyScalar(0.012));
        const nn = out.clone().cross(t).normalize();
        const f = (i / 10);
        veg.tri({ p: p.clone().add(t.clone().multiplyScalar(-0.012)), n: nn, u: 0, v: 0, w: 0.3 * f * f }, { p: p.clone().add(t.clone().multiplyScalar(0.012)), n: nn, u: 1, v: 0, w: 0.3 * f * f }, { p: tip, n: nn, u: 0, v: 1, w: 0.3 * f * f }, { kind: K.plain, c: C.cane });
      }
      // leaves in threes and a berry cluster
      for (const i of [3, 5]) {
        const p = pts[i];
        for (let k = 0; k < 3; k++) {
          const la = a + (k - 1) * 0.9 + 1.57 * (i === 3 ? 1 : -1), d = V(Math.cos(la), 0.3, Math.sin(la)).normalize().multiplyScalar(0.11);
          veg.card(p, d, V(-d.z, 0, d.x).normalize().multiplyScalar(0.035), { kind: K.thistle, c: C.bramLeaf, c2: C.bramVein, seed: r(), windBase: 0.1, wind: 0.15, upN: 0.4 });
        }
      }
      if (r() < 0.6) veg.cross(pts[4].clone().add(V(0, -0.08, 0)), V(0, 0.08, 0), 0.04, { kind: K.berries, c: C.berry, c2: C.berryHi, seed: r(), wind: 0.1, upN: 0.2 });
    }
    count('bramble');
  }
  function bush(x, z) {
    const r = rng(Math.floor(x * 919 + z * 13 + 29));
    const top = V(x + r.range(-0.12, 0.12), r.range(0.55, 0.75), z + r.range(-0.12, 0.12));
    veg.tube([V(x, 0, z), V(x + r.range(-0.05, 0.05), top.y * 0.5, z + r.range(-0.05, 0.05)), top], [0.08, 0.06, 0.045], { kind: K.plain, c: C.twig, seed: r() }, 4);
    for (let b = 0; b < 5; b++) {
      const a = (b / 5) * 6.28 + r.range(-0.3, 0.3), dir = V(Math.cos(a), r.range(0.9, 1.6), Math.sin(a)).normalize();
      const pts = spiral(top.clone(), dir, r.range(0.75, 1.05), 1.1, r.range(0.13, 0.2), 0.15);
      veg.ribbon(pts, pts.map((_, i) => 0.04 * (1 - (i / pts.length) * 0.8)), V(-dir.z, 0, dir.x).normalize(), { kind: K.plain, c: C.twig, seed: r(), wind: 0.2, upN: 0.2 });
    }
    // round clumps of small leaves around the crown
    for (let i = 0; i < 12; i++) {
      const a = r() * 6.28, rad = r.range(0.2, 0.7), y = top.y + r.range(0.05, 0.8);
      const p = V(x + Math.cos(a) * rad, y, z + Math.sin(a) * rad), s = r.range(0.2, 0.32);
      veg.cross(p.clone().add(V(0, -s, 0)), V(0, s * 2, 0), s, { kind: K.foliage, c: C.bush, c2: C.bush2, seed: r(), windBase: 0.15, wind: 0.25, upN: 0.5 });
    }
    count('bush');
  }
  function leafPile(x, z, n, rad) {
    const r = rng(Math.floor(x * 37 + z * 1001 + 31));
    for (let i = 0; i < n; i++) {
      const a = r() * 6.28, d = Math.sqrt(r()) * rad, px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d;
      const y = 0.012 + Math.max(0, 1 - d / rad) * rad * 0.35 * r(), s = r.range(0.05, 0.08), la = r() * 6.28;
      const tilt = V(r.range(-0.4, 0.4), 1, r.range(-0.4, 0.4)).normalize();
      const up = V(Math.cos(la), 0, Math.sin(la)), side = tilt.clone().cross(up).normalize();
      up.copy(side.clone().cross(tilt)).normalize();
      veg.card(V(px, y, pz).sub(up.clone().multiplyScalar(s * 0.9)), up.multiplyScalar(s * 1.8), side.multiplyScalar(s * 0.9), { kind: K.leaf, c: r.pick(FALL), c2: lin('#f2d08a'), seed: r() }, tilt);
    }
    count('leaf pile');
  }
  function pumpkin(x, z, k) {
    const r = rng(Math.floor(x * 7 + z * 3 + 37));
    const m = new THREE.Matrix4().compose(V(x, 0, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(r.range(-0.1, 0.1), r() * 6, r.range(-0.1, 0.1))), V(k, k * r.range(0.75, 0.9), k));
    const prof = [[0, 0], [0.12, 0.01], [0.2, 0.06], [0.23, 0.14], [0.2, 0.23], [0.11, 0.285], [0.03, 0.27], [0, 0.26]];
    veg.lathe(prof, 18, m, { kind: K.pumpkin, c: C.pumpkin, c2: C.pumpkinRib, seed: r() });
    const s0 = V(0, 0.26, 0).applyMatrix4(m), lean = V(r.range(-0.04, 0.04), 0.09 * k, r.range(-0.04, 0.04));
    veg.tube([s0, s0.clone().add(lean.clone().multiplyScalar(0.5)), s0.clone().add(lean).add(V(0.02, 0, 0))], [0.028 * k, 0.022 * k, 0.018 * k], { kind: K.plain, c: C.pstem, seed: r() }, 4);
    count('pumpkin');
  }

  // ======== placement ========
  // tufts world.js asks for (stones, fence posts, trees, the shed, lanterns): large where tall is allowed
  for (const [x, z, k] of spots.tufts || []) {
    if (k === 1.1) continue; // fence bars: the fence band below is denser
    tryTuft(x, z, k >= 1.1 ? 2 : k >= 1 ? 1 : 0);
    if (R() < 0.35) tryTuft(x + R.range(-0.25, 0.25), z + R.range(-0.25, 0.25), k >= 1.1 ? 1 : 0);
  }
  // headstone bases: tufts both sides, flowers, the odd seed grass behind
  DECOR.stones.forEach((st, i) => {
    const s = i % 2 ? 1 : -1, c = Math.cos(st.ry), sn = Math.sin(st.ry);
    tryTuft(st.x + s * (st.w * 0.55) * c, st.z - s * (st.w * 0.55) * sn + R.range(-0.15, 0.15), 2);
    const fx = st.x + R.range(-0.3, 0.3), fz = st.z + (R() < 0.5 ? -1 : 1) * R.range(0.25, 0.4);
    if (i % 3 === 0 && ok(fx, fz)) wildflowers(fx, fz);
    if (i % 4 === 1 && ok(fx, fz)) dandelion(fx, fz, true);
    if (i % 5 === 2 && ok(st.x + 0.2, st.z - 0.35, true)) dryGrass(st.x + 0.2, st.z - 0.35);
  });
  // ivy on some old headstones (front and back faces, a strip up from the ground)
  const sm = new THREE.Matrix4(), e = new THREE.Euler(), q = new THREE.Quaternion();
  DECOR.stones.forEach((st, i) => {
    if (i % 3 !== 1) return;
    sm.compose(V(st.x, 0, st.z), q.setFromEuler(e.set(st.rx || 0, st.ry || 0, st.rz || 0)), V(1, 1, 1));
    const face = (sign) => sm.clone().multiply(new THREE.Matrix4().makeRotationY(sign > 0 ? 0 : Math.PI)).multiply(new THREE.Matrix4().makeTranslation(R.range(-0.1, 0.1) * st.w, 0, 0.12));
    ivyPatch(face(1), st.w * 0.7, st.h * R.range(0.35, 0.6), 700 + i);
    if (i % 2) ivyPatch(face(-1), st.w * 0.6, st.h * 0.35, 800 + i);
  });
  // ivy on a few fence pillars (two faces each)
  (spots.pillars || []).forEach((pm, i) => {
    if (i % 4 !== 2) return;
    for (const rot of [0, Math.PI / 2 + (i % 8 === 2 ? Math.PI : 0)]) {
      const m = pm.clone().multiply(new THREE.Matrix4().makeRotationY(rot)).multiply(new THREE.Matrix4().makeTranslation(0, 0.3, 0.205));
      ivyPatch(m, 0.36, R.range(0.6, 1.3), 900 + i * 2 + (rot ? 1 : 0));
    }
  });
  // mushrooms world.js asks for (tree roots, the shed wall): toadstools with a pale one now and then
  (spots.shrooms || []).forEach(([x, z, k], i) => {
    if (!ok(x, z)) return;
    const red = i % 5 !== 3;
    toadstool(x, z, (red ? 0.9 : 1) * Math.min(1.3, k), red && i % 7 === 0 ? 1 : 0, red);
  });
  // toadstool clusters at the bases of some headstones (a few glow at night) and pale mushrooms in the shade
  DECOR.stones.forEach((st, i) => {
    if (i % 4 !== 3) return;
    const s = i % 8 === 3 ? -1 : 1;
    shroomCluster(st.x + s * st.w * 0.5, st.z + R.range(0.2, 0.4) * s, 3 + (i % 3), i % 12 === 3 ? 1 : 0, true);
  });
  DECOR.stones.forEach((st, i) => { if (i % 6 === 4) shroomCluster(st.x - st.w * 0.4, st.z - 0.35, 3, 0, false); });

  // fence: tall seed grass, thistles and ferns along the inside; dry grass, reeds and brambles just outside
  for (const [along, fixed] of [['x', -FENCE], ['x', FENCE], ['z', -FENCE], ['z', FENCE]]) {
    const pt = (u, off) => (along === 'x' ? [u, fixed + off] : [fixed + off, u]);
    const inward = -Math.sign(fixed);
    for (let u = -FENCE + 1; u < FENCE - 1; u += R.range(1.1, 1.7)) {
      // a hedge of large tufts hugging the fence line, then a taller plant a little further in
      for (let k = 0; k < 2; k++) {
        const [gx, gz] = pt(u + k * 0.6 + R.range(-0.2, 0.2), inward * R.range(0.1, 0.45));
        tryTuft(gx, gz, 2);
      }
      const [x, z] = pt(u, inward * R.range(0.35, 0.9));
      if (!ok(x, z, true)) { if (ok(x, z)) tuft(x, z, 1); continue; }
      const roll = R();
      if (roll < 0.25) tuft(x, z, 1);
      else if (roll < 0.6) dryGrass(x, z);
      else if (roll < 0.72) fern(x, z);
      else if (roll < 0.82) thistle(x, z);
      else if (roll < 0.9) { tuft(x, z, 2); tuft(x + 0.2, z + 0.15, 1); }
      else wildflowers(x, z, 0.35);
      // outside the fence
      const [ox, oz] = pt(u + R.range(-0.4, 0.4), -inward * R.range(0.3, 2.5));
      if (!ok(ox, oz, true)) continue;
      const o2 = R();
      if (o2 < 0.2) dryGrass(ox, oz);
      else if (o2 < 0.45) tuft(ox, oz, 2);
      else if (o2 < 0.5) bramble(ox, oz);
    }
  }
  // the road: low tufts along both edges, cattails by the puddles near the gates and outside the fence
  for (let x = -FENCE - 8; x < FENCE + 8; x += R.range(0.5, 1.1)) {
    for (const s of [-1, 1]) {
      const z = roadCenter(x) + s * (ROAD_HALF + R.range(0.2, 0.7));
      if (R() < 0.75 && ok(x, z)) tuft(x, z, R() < 0.5 ? 0 : 1);
    }
  }
  for (const [x, s] of [[-24.5, 1], [-21.8, -1], [-9.5, 1], [10.5, 1], [22.5, -1], [24.8, 1], [-31.5, 1], [-34, -1], [31, -1], [33.5, 1], [36.5, 1], [-38, 1]]) {
    const z = roadCenter(x) + s * (ROAD_HALF + 0.4);
    if (ok(x, z, true)) cattails(x, z);
    if (ok(x + 0.5, z + s * 0.3, true)) cattails(x + 0.5, z + s * 0.35);
  }
  // trees: ferns and thistles between the roots, the odd bramble
  DECOR.trees.forEach((t, i) => {
    const a = i * 2.4;
    const fx = t.x + Math.cos(a) * 1.0, fz = t.z + Math.sin(a) * 1.0;
    if (ok(fx, fz, true)) fern(fx, fz);
    const tx = t.x + Math.cos(a + 2.2) * 1.3, tz = t.z + Math.sin(a + 2.2) * 1.3;
    if (i % 2 === 0 && ok(tx, tz, true)) thistle(tx, tz);
    if (i % 3 === 1 && ok(t.x + Math.cos(a - 2) * 1.4, t.z + Math.sin(a - 2) * 1.4, true)) bramble(t.x + Math.cos(a - 2) * 1.4, t.z + Math.sin(a - 2) * 1.4);
    if (inYard(t.x, t.z) && ok(t.x + 1.1, t.z - 0.7)) leafPile(t.x + 1.1, t.z - 0.7, 22, 0.5);
  });
  // crooked bushes in the corners and by the shed
  for (const [x, z] of [[-26, -26], [26, -25.5], [25.8, 25.8], [-25.5, 26], [SH.x - SH.hx - 0.7, SH.z + 1.2], [-26.3, -8]]) if (ok(x, z, true)) bush(x, z);
  // by the shed: pumpkins, a leaf pile, ferns and seed grass against the walls
  pumpkin(SH.x + SH.hx + 0.45, SH.z + 0.9, 1.15);
  pumpkin(SH.x + SH.hx + 0.6, SH.z + 0.35, 0.8);
  pumpkin(SH.x + SH.hx + 0.25, SH.z + 1.35, 0.6);
  leafPile(SH.x - SH.hx - 0.7, SH.z - 0.9, 30, 0.6);
  for (const [x, z] of [[SH.x - SH.hx - 0.35, SH.z - 0.8], [SH.x + 0.8, SH.z + SH.hz + 0.35], [SH.x - SH.hx - 0.4, SH.z + 0.3]]) if (ok(x, z, true)) (R() < 0.5 ? fern : dryGrass)(x, z);
  // thistles, dandelions and flowers in the quiet parts of the lawn
  for (let i = 0; i < 45; i++) {
    const x = R.range(-26, 26), z = R.range(-26, 26), roll = R();
    if (roll < 0.15) { if (ok(x, z, true) && Math.abs(z) > 6) thistle(x, z); } else if (roll < 0.55) { if (ok(x, z)) dandelion(x, z, false); } else if (ok(x, z)) wildflowers(x, z, 0.2);
  }
  // a thin scatter of tufts over the whole lawn (one triangle per blade, so they are cheap)
  for (let i = 0; i < 150; i++) {
    const x = R.range(-27.5, 27.5), z = R.range(-27.5, 27.5);
    if (ok(x, z)) tuft(x, z, R() < 0.55 ? 0 : 1, R() < 0.15 ? 0.5 : 0);
  }
  const mat = plantMaterial();
  const mesh = new THREE.Mesh(veg.build(), mat);
  mesh.name = 'plants';
  mesh.frustumCulled = false;
  counts.triangles = veg.tris;
  return { mesh, counts, update(time) { mat.uniforms.uTime.value = time; } };
}

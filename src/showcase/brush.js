import * as THREE from 'three';

// Paints shapes as brush-dab splats into a SplatCloud. Shapes are sampled on their surface; each sample becomes
// a flat Gaussian dab lying on the surface, stretched along a stroke direction, with a little color variation
// so flat areas read as painted gouache rather than plastic.
//
// Splats need no topology, so the sculpting shapes are free-form rather than primitives:
//   loft   a body drawn by its silhouette: stations of half-width / half-depth / offset / squareness up the Y axis,
//          with optional pleats, an open arc (cloaks) and a torn hem
//   tube   a tapered, flattened hose along a bent path (arms, scarves, beaks, hat tips)
//   sheet  a flat or bent cloth cut-out from a 2D outline (lapels, collars, coat tails, blades)
//   surf   any parametric surface f(u, v)
// plus the simple ellipsoid / capsule / frustum / box / torus for small details.
//
// Common options for every shape:
//   color    '#hex' or (l, n, u, v) => '#hex'   l = point in the shape's own space, n = its normal there
//   size     dab radius in meters (default 0.02); small features need small dabs
//   density  multiplier on the number of dabs (default 1)
//   c, rot   position and [x, y, z] Euler rotation of the shape in the part's rest space
//   keep     (l, n, u, v) => boolean, drops samples (holes, open ends)
//   ink      width in meters of the dark line painted along open cloth edges (0 turns it off)
//   alpha, emissive (0..1 unlit), hint ([x, y, z] axis the strokes wrap around, default up), flat (no size jitter)
export class Brush {
  constructor(cloud, rand) {
    this.cloud = cloud;
    this.rand = rand;
    this.partIndex = 0;
    this.colors = new Map();
  }
  part(i) { this.partIndex = i; return this; }

  _col(hex) {
    let c = this.colors.get(hex);
    if (!c) this.colors.set(hex, (c = new THREE.Color(hex)));
    return c;
  }

  // emit one dab; l/n are in the shape's space, m maps the shape into the part's rest space
  // `edge` is the distance in meters to the nearest open cloth edge (Infinity on closed shapes)
  _dab(l, n, m, o, u = 0, v = 0, tan = null, edge = Infinity) {
    if (o.keep && !o.keep(l, n, u, v)) return;
    const R = this.rand, size = (o.size || SIZE) * DAB;
    let hex = typeof o.color === 'function' ? o.color(l, n, u, v) : o.color;
    if (!hex) return;
    if (edge < (o.ink ?? 0.009)) hex = INK;
    const base = this._col(hex);
    const p = _p.copy(l).applyMatrix4(m);
    const nn = _n.copy(n).transformDirection(m);
    const t = _t;
    if (tan && tan.lengthSq() > 1e-12) t.copy(tan).transformDirection(m);
    else t.crossVectors(nn, o.hint ? _h.fromArray(o.hint).transformDirection(m) : _h.set(0, 1, 0));
    if (t.lengthSq() < 1e-4) t.set(1, 0, 0);
    t.normalize().applyAxisAngle(nn, (R() - 0.5) * 0.9);
    const k = o.flat ? 1 : 0.8 + R() * 0.45;
    const shade = 1 + (R() - 0.5) * 0.14 + (noise3(p.x * 7, p.y * 7, p.z * 7) - 0.5) * 0.2;
    _c.copy(base).multiplyScalar(o.emissive ? 1 : shade);
    // details keep round, tight dabs; surfaces get longer strokes
    const sx = o.flat ? size : size * 1.35 * k, sy = o.flat ? size * 0.8 : size * 0.8 * k;
    this.cloud.add(this.partIndex, p, nn, t, [sx, sy, size * 0.3], _c, o.alpha ?? 0.95, o.emissive || 0);
  }

  _count(area, o) { return Math.max(6, Math.round(((o.density || 1) * area) / (((o.size || SIZE) * DAB) ** 2 * 0.9))); }
  _mat(c, rot) { return new THREE.Matrix4().compose(new THREE.Vector3(...(c || [0, 0, 0])), new THREE.Quaternion().setFromEuler(new THREE.Euler(...(rot || [0, 0, 0]))), ONE); }

  // ---------- free-form sculpting ----------
  // Any parametric surface. o: { f: (u, v, out) => out (Vector3 in the shape's space, u and v in 0..1),
  // grid: [nu, nv] cells used to spread dabs evenly by area, along: 'u' | 'v' stroke direction,
  // edge: (u, v, l) => meters to the nearest open edge }
  surf(o) {
    const m = this._mat(o.c, o.rot), R = this.rand, f = o.f, [gu, gv] = o.grid || [36, 24];
    const P = [], cdf = new Float64Array(gu * gv);
    for (let j = 0; j <= gv; j++) for (let i = 0; i <= gu; i++) P.push(f(i / gu, j / gv, new THREE.Vector3()));
    let area = 0;
    for (let j = 0; j < gv; j++) for (let i = 0; i < gu; i++) {
      const a = P[j * (gu + 1) + i], b = P[j * (gu + 1) + i + 1], c = P[(j + 1) * (gu + 1) + i], d = P[(j + 1) * (gu + 1) + i + 1];
      area += _a.subVectors(b, a).cross(_b.subVectors(d, a)).length() * 0.5 + _a.subVectors(d, a).cross(_b.subVectors(c, a)).length() * 0.5;
      cdf[j * gu + i] = area;
    }
    const e = 1e-3;
    for (let k = this._count(area, o); k > 0; k--) {
      const r = R() * area;
      let lo = 0, hi = cdf.length - 1;
      while (lo < hi) { const mid = (lo + hi) >> 1; if (cdf[mid] < r) lo = mid + 1; else hi = mid; }
      const u = ((lo % gu) + R()) / gu, v = (((lo / gu) | 0) + R()) / gv;
      f(u, v, _l);
      f(Math.min(1, u + e), v, _du).sub(f(Math.max(0, u - e), v, _b));
      f(u, Math.min(1, v + e), _dv).sub(f(u, Math.max(0, v - e), _b));
      _ln.crossVectors(_du, _dv);
      if (_ln.lengthSq() < 1e-18) _ln.set(0, 1, 0); else _ln.normalize();
      this._dab(_l, _ln, m, o, u, v, o.along === 'v' ? _dv : _du, o.edge ? o.edge(u, v, _l) : Infinity);
    }
    return this;
  }

  // A body drawn by its silhouette. o.st: stations from the bottom up, each [y, halfWidth, halfDepth = halfWidth,
  // xOffset = 0, zOffset = 0, squareness = o.n ?? 2] (squareness 2 is round, 4 boxy, 1.2 a diamond).
  //   smooth  false joins stations with straight lines for crisp kinks (default true)
  //   arc     [from, to] angles in radians to leave the shape open (0 = +X, PI / 2 = front)
  //   pleat   (angle, v) => fraction added to the radius: folds, flares
  //   hem     { teeth, depth, seed } tears the bottom edge into irregular points
  //   top, bottom   close the ends with flat lids
  loft(o) {
    const st = o.st.map((s) => [s[0], s[1], s[2] ?? s[1], s[3] || 0, s[4] || 0, s[5] ?? o.n ?? 2]), last = st.length - 1;
    const smooth = o.smooth !== false, [a0, a1] = o.arc || [0, TAU], open = !!o.arc, s = new Float64Array(6);
    const at = (v) => {
      const x = Math.min(0.99999, Math.max(0, v)) * last, i = Math.floor(x), t = x - i;
      const p0 = st[Math.max(0, i - 1)], p1 = st[i], p2 = st[i + 1], p3 = st[Math.min(last, i + 2)];
      for (let k = 0; k < 6; k++) s[k] = smooth ? catmull(p0[k], p1[k], p2[k], p3[k], t) : p1[k] + (p2[k] - p1[k]) * t;
      return s;
    };
    const ring = (th, q, k, out) => {
      const cs = Math.cos(th), sn = Math.sin(th), e = 2 / Math.max(0.5, q[5]);
      return out.set(q[3] + Math.sign(cs) * Math.abs(cs) ** e * Math.max(0, q[1]) * k, q[0], q[4] + Math.sign(sn) * Math.abs(sn) ** e * Math.max(0, q[2]) * k);
    };
    const hem = o.hem, y0 = st[0][0];
    const cut = hem ? (u) => {
      const x = u * hem.teeth, i = Math.floor(x), h = 0.35 + 0.65 * hash1(i * 12.9898 + (hem.seed || 0));
      return hem.depth * h * Math.abs(2 * (x - i) - 1) ** 0.85;
    } : null;
    this.surf({
      ...o, grid: o.grid || [40, Math.max(12, last * 8)],
      f: (u, v, out) => { const th = a0 + (a1 - a0) * u, q = at(v); return ring(th, q, 1 + (o.pleat ? o.pleat(th, v) : 0), out); },
      keep: (l, n, u, v) => (!cut || l.y - y0 > cut(u)) && (!o.keep || o.keep(l, n, u, v)),
      edge: (u, v, l) => {
        let d = Infinity;
        if (cut) d = l.y - y0 - cut(u);
        if (open) d = Math.min(d, Math.min(u, 1 - u) * (a1 - a0) * Math.max(at(v)[1], s[2]));
        return d;
      },
    });
    for (const [on, i] of [[o.top, last], [o.bottom, 0]]) {
      if (!on) continue;
      const q = Float64Array.from(st[i]);
      this.surf({ ...o, grid: [28, 5], keep: o.keep, f: (u, v, out) => ring(TAU * u, q, v, out), along: 'u' });
    }
    return this;
  }

  // A tapered, flattened hose along a path. o: { pts: [[x, y, z], ...], r: number or one entry per point, each a
  // radius or [across, thick], up: [x, y, z] the direction `thick` is measured along (default +Z), n: squareness,
  // smooth (default true), cap: false leaves the ends open }
  tube(o) {
    const pts = o.pts.map((p) => new THREE.Vector3(...p)), last = pts.length - 1, smooth = o.smooth !== false;
    const rad = pts.map((_, i) => { const r = Array.isArray(o.r) ? o.r[Math.min(i, o.r.length - 1)] : o.r; return Array.isArray(r) ? r : [r, r]; });
    const N = 48, frames = [], up = new THREE.Vector3(...(o.up || [0, 0, 1])), e = 2 / (o.n || 2);
    const pos = (v, out) => {
      const x = Math.min(0.99999, Math.max(0, v)) * last, i = Math.floor(x), t = x - i;
      const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(last, i + 2)];
      if (!smooth) return out.lerpVectors(p1, p2, t);
      return out.set(catmull(p0.x, p1.x, p2.x, p3.x, t), catmull(p0.y, p1.y, p2.y, p3.y, t), catmull(p0.z, p1.z, p2.z, p3.z, t));
    };
    const size = (v) => {
      const x = Math.min(0.99999, Math.max(0, v)) * last, i = Math.floor(x), t = x - i;
      return [rad[i][0] + (rad[i + 1][0] - rad[i][0]) * t, rad[i][1] + (rad[i + 1][1] - rad[i][1]) * t];
    };
    // parallel-transported frames keep the cross-section from twisting along the bend
    let nrm = null;
    for (let i = 0; i <= N; i++) {
      const v = i / N, p = pos(v, new THREE.Vector3());
      const t = pos(Math.min(1, v + 1e-3), new THREE.Vector3()).sub(pos(Math.max(0, v - 1e-3), _a)).normalize();
      nrm = (nrm ? nrm.clone() : up.clone()).addScaledVector(t, -(nrm || up).dot(t));
      if (nrm.lengthSq() < 1e-8) nrm.set(t.y, t.z, t.x).addScaledVector(t, -(t.y * t.x + t.z * t.y + t.x * t.z));
      nrm.normalize();
      frames.push({ p, t, n: nrm, b: new THREE.Vector3().crossVectors(t, nrm) });
    }
    const frame = (v) => {
      const x = Math.min(0.99999, Math.max(0, v)) * N, i = Math.floor(x), k = x - i, a = frames[i], b = frames[i + 1];
      _fp.lerpVectors(a.p, b.p, k); _fn.lerpVectors(a.n, b.n, k).normalize(); _fb.lerpVectors(a.b, b.b, k).normalize(); _ft.lerpVectors(a.t, b.t, k).normalize();
    };
    const ring = (u, w, d, out) => {
      const cs = Math.cos(u * TAU), sn = Math.sin(u * TAU);
      return out.copy(_fp).addScaledVector(_fb, Math.sign(cs) * Math.abs(cs) ** e * w).addScaledVector(_fn, Math.sign(sn) * Math.abs(sn) ** e * d);
    };
    this.surf({ ...o, grid: o.grid || [20, Math.max(16, last * 10)], f: (u, v, out) => { frame(v); const [w, d] = size(v); return ring(u, w, d, out); } });
    if (o.cap !== false) for (const [v, dir] of [[0, -1], [1, 1]]) {
      const [w, d] = size(v);
      if (Math.min(w, d) < 0.006) continue;
      const bulge = Math.min(w, d) * (o.cap === 'flat' ? 0 : 0.8) * dir;
      this.surf({ ...o, grid: [18, 5], f: (u, q, out) => { frame(v); const k = Math.cos(q * Math.PI / 2); return ring(u, w * k, d * k, out).addScaledVector(_ft, Math.sin(q * Math.PI / 2) * bulge); } });
    }
    return this;
  }

  // A cloth cut-out. o: { pts: [[x, y], ...] outline in the sheet's own plane, bend: (x, y) => z }.
  // The outline gets an ink line; both faces are visible.
  sheet(o) {
    const m = this._mat(o.c, o.rot), R = this.rand, pts = o.pts, n = pts.length, bend = o.bend || (() => 0);
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity, area = 0;
    for (let i = 0; i < n; i++) {
      const [x, y] = pts[i], [nx, ny] = pts[(i + 1) % n];
      x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
      area += x * ny - nx * y;
    }
    const e = 1e-3;
    for (let k = this._count(Math.abs(area) / 2, o), guard = k * 40; k > 0 && guard > 0; guard--) {
      const x = x0 + R() * (x1 - x0), y = y0 + R() * (y1 - y0);
      let inside = false, edge = Infinity;
      for (let i = 0, j = n - 1; i < n; j = i++) {
        const [ax, ay] = pts[i], [bx, by] = pts[j];
        if ((ay > y) !== (by > y) && x < ((bx - ax) * (y - ay)) / (by - ay) + ax) inside = !inside;
        const dx = bx - ax, dy = by - ay, t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy || 1)));
        edge = Math.min(edge, Math.hypot(x - ax - dx * t, y - ay - dy * t));
      }
      if (!inside) continue;
      k--;
      _l.set(x, y, bend(x, y));
      _du.set(2 * e, 0, bend(x + e, y) - bend(x - e, y));
      _dv.set(0, 2 * e, bend(x, y + e) - bend(x, y - e));
      this._dab(_l, _ln.crossVectors(_du, _dv).normalize(), m, o, x, y, o.along === 'u' ? _du : _dv, edge);
    }
    return this;
  }

  // o: { c, r: [rx, ry, rz] }
  ellipsoid(o) {
    const [a, b, c] = o.r, m = this._mat(o.c, o.rot), e = 1.6075;
    const area = 4 * Math.PI * (((a * b) ** e + (a * c) ** e + (b * c) ** e) / 3) ** (1 / e);
    const n = this._count(area, o), off = this.rand() * 10;
    for (let i = 0; i < n; i++) {
      const y = 1 - (2 * (i + 0.5)) / n, r = Math.sqrt(1 - y * y), th = (i + off) * 2.39996323;
      const x = Math.cos(th) * r, z = Math.sin(th) * r;
      this._dab(_l.set(x * a, y * b, z * c), _ln.set(x / a, y / b, z / c).normalize(), m, o);
    }
    return this;
  }

  // tapered capsule from a to b. o: { a, b, ra, rb }  l.y runs 0..length along the axis
  capsule(o) {
    const A = new THREE.Vector3(...o.a), B = new THREE.Vector3(...o.b), ra = o.ra, rb = o.rb ?? o.ra;
    const axis = B.clone().sub(A), L = axis.length();
    const q = new THREE.Quaternion().setFromUnitVectors(UP, axis.clone().normalize());
    const m = new THREE.Matrix4().compose(A, q, ONE), R = this.rand;
    const slope = (ra - rb) / L;
    for (let i = this._count(Math.PI * (ra + rb) * L, o); i > 0; i--) {
      const t = R(), th = R() * Math.PI * 2, r = ra + (rb - ra) * t;
      this._dab(_l.set(Math.cos(th) * r, t * L, Math.sin(th) * r), _ln.set(Math.cos(th), slope, Math.sin(th)).normalize(), m, o);
    }
    for (const [r, y, s] of [[ra, 0, -1], [rb, L, 1]]) {
      for (let i = this._count(2 * Math.PI * r * r, o); i > 0; i--) {
        const u = R() * 2 - 1, th = R() * Math.PI * 2, w = Math.sqrt(1 - u * u);
        _ln.set(Math.cos(th) * w, Math.abs(u) * s, Math.sin(th) * w);
        this._dab(_l.copy(_ln).multiplyScalar(r).setY(_ln.y * r + y), _ln, m, o);
      }
    }
    return this;
  }

  // cone frustum along local Y, centered on c. o: { c, r0 (bottom), r1 (top), h, top: bool, bottom: bool }
  frustum(o) {
    const m = this._mat(o.c, o.rot), R = this.rand, { r0, r1, h } = o;
    const slope = (r0 - r1) / h;
    for (let i = this._count(Math.PI * (r0 + r1) * Math.hypot(h, r0 - r1), o); i > 0; i--) {
      const t = R(), th = R() * Math.PI * 2, r = r0 + (r1 - r0) * t;
      this._dab(_l.set(Math.cos(th) * r, (t - 0.5) * h, Math.sin(th) * r), _ln.set(Math.cos(th), slope, Math.sin(th)).normalize(), m, o);
    }
    for (const [on, r, y, s] of [[o.top !== false, r1, h / 2, 1], [o.bottom, r0, -h / 2, -1]]) {
      if (!on || r <= 0) continue;
      for (let i = this._count(Math.PI * r * r, o); i > 0; i--) {
        const d = Math.sqrt(R()) * r, th = R() * Math.PI * 2;
        this._dab(_l.set(Math.cos(th) * d, y, Math.sin(th) * d), _ln.set(0, s, 0), m, o);
      }
    }
    return this;
  }

  // o: { c, h: [hx, hy, hz] half sizes }
  box(o) {
    const m = this._mat(o.c, o.rot), R = this.rand, [hx, hy, hz] = o.h;
    const faces = [[0, hy * hz], [1, hx * hz], [2, hx * hy]];
    for (const [ax, a] of faces) {
      for (const s of [-1, 1]) {
        for (let i = this._count(4 * a, o); i > 0; i--) {
          const u = R() * 2 - 1, v = R() * 2 - 1;
          if (ax === 0) { _l.set(s * hx, u * hy, v * hz); _ln.set(s, 0, 0); }
          else if (ax === 1) { _l.set(u * hx, s * hy, v * hz); _ln.set(0, s, 0); }
          else { _l.set(u * hx, v * hy, s * hz); _ln.set(0, 0, s); }
          this._dab(_l, _ln, m, o);
        }
      }
    }
    return this;
  }

  // ring around local Y. o: { c, R (ring radius), r (tube radius), squash (tube height scale) }
  torus(o) {
    const m = this._mat(o.c, o.rot), R = this.rand, sq = o.squash ?? 1;
    for (let i = this._count(4 * Math.PI * Math.PI * o.R * o.r, o); i > 0; i--) {
      const u = R() * Math.PI * 2, v = R() * Math.PI * 2, w = o.R + o.r * Math.cos(v);
      this._dab(_l.set(w * Math.cos(u), o.r * Math.sin(v) * sq, w * Math.sin(u)), _ln.set(Math.cos(v) * Math.cos(u), Math.sin(v) / sq, Math.cos(v) * Math.sin(u)).normalize(), m, o);
    }
    return this;
  }
}

// cheap smooth value noise for gouache blotches
function hash3(x, y, z) { const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453; return s - Math.floor(s); }
function noise3(x, y, z) {
  const ix = Math.floor(x), iy = Math.floor(y), iz = Math.floor(z);
  const fx = x - ix, fy = y - iy, fz = z - iz;
  const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy), uz = fz * fz * (3 - 2 * fz);
  const l = (a, b, t) => a + (b - a) * t;
  return l(l(l(hash3(ix, iy, iz), hash3(ix + 1, iy, iz), ux), l(hash3(ix, iy + 1, iz), hash3(ix + 1, iy + 1, iz), ux), uy),
    l(l(hash3(ix, iy, iz + 1), hash3(ix + 1, iy, iz + 1), ux), l(hash3(ix, iy + 1, iz + 1), hash3(ix + 1, iy + 1, iz + 1), ux), uy), uz);
}

function hash1(x) { const s = Math.sin(x) * 43758.5453; return s - Math.floor(s); }
function catmull(p0, p1, p2, p3, t) { return 0.5 * (2 * p1 + (p2 - p0) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (3 * p1 - p0 - 3 * p2 + p3) * t * t * t); }

const DAB = 0.78; // global dab scale: smaller dabs, more of them, crisper features
const SIZE = 0.02, INK = '#17111f', TAU = Math.PI * 2;
const ONE = new THREE.Vector3(1, 1, 1), UP = new THREE.Vector3(0, 1, 0);
const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _du = new THREE.Vector3(), _dv = new THREE.Vector3();
const _fp = new THREE.Vector3(), _fn = new THREE.Vector3(), _fb = new THREE.Vector3(), _ft = new THREE.Vector3();
const _p = new THREE.Vector3(), _n = new THREE.Vector3(), _t = new THREE.Vector3(), _h = new THREE.Vector3();
const _l = new THREE.Vector3(), _ln = new THREE.Vector3(), _c = new THREE.Color();

import * as THREE from 'three';

// Paints primitives as brush-dab splats into a SplatCloud. Shapes are sampled on their surface; each sample
// becomes a flat Gaussian dab lying on the surface, stretched along a stroke direction that wraps around the
// shape, with a little color variation so flat areas read as painted gouache rather than plastic.
//
// Common options for every shape:
//   color    '#hex' or (l, n) => '#hex'   l = point in the shape's own space, n = its normal there
//   size     dab radius in meters (default 0.026); small features need small dabs
//   density  multiplier on the number of dabs (default 1)
//   rot      [x, y, z] Euler rotation of the shape, c / a / b positions are in the part's rest space
//   keep     (l, n) => boolean, drops samples (ragged hems, open ends)
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
  _dab(l, n, m, o) {
    if (o.keep && !o.keep(l, n)) return;
    const R = this.rand, size = (o.size || 0.026) * DAB;
    const hex = typeof o.color === 'function' ? o.color(l, n) : o.color;
    if (!hex) return;
    const base = this._col(hex);
    const p = _p.copy(l).applyMatrix4(m);
    const nn = _n.copy(n).transformDirection(m);
    const hint = o.hint ? _h.fromArray(o.hint).transformDirection(m) : _h.set(0, 1, 0);
    const t = _t.crossVectors(nn, hint);
    if (t.lengthSq() < 1e-4) t.set(1, 0, 0);
    t.normalize().applyAxisAngle(nn, (R() - 0.5) * 0.9);
    const k = o.flat ? 1 : 0.8 + R() * 0.45;
    const shade = 1 + (R() - 0.5) * 0.14 + (noise3(p.x * 7, p.y * 7, p.z * 7) - 0.5) * 0.2;
    _c.copy(base).multiplyScalar(o.emissive ? 1 : shade);
    // details keep round, tight dabs; surfaces get longer strokes
    const sx = o.flat ? size : size * 1.35 * k, sy = o.flat ? size * 0.8 : size * 0.8 * k;
    this.cloud.add(this.partIndex, p, nn, t, [sx, sy, size * 0.3], _c, o.alpha ?? 0.95, o.emissive || 0);
  }

  _count(area, o) { return Math.max(6, Math.round(((o.density || 1) * area) / (((o.size || 0.026) * DAB) ** 2 * 0.9))); }
  _mat(c, rot) { return new THREE.Matrix4().compose(new THREE.Vector3(...(c || [0, 0, 0])), new THREE.Quaternion().setFromEuler(new THREE.Euler(...(rot || [0, 0, 0]))), ONE); }

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

const DAB = 0.78; // global dab scale: smaller dabs, more of them, crisper features
const ONE = new THREE.Vector3(1, 1, 1), UP = new THREE.Vector3(0, 1, 0);
const _p = new THREE.Vector3(), _n = new THREE.Vector3(), _t = new THREE.Vector3(), _h = new THREE.Vector3();
const _l = new THREE.Vector3(), _ln = new THREE.Vector3(), _c = new THREE.Color();

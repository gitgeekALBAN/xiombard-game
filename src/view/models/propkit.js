import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { outlineMat } from '../../shaders/toon.js';
import { outlineGeo } from './common.js';

// Helpers for the props models (truck, coffins, headstones, graves): every model is baked into one
// mesh per material plus one outline hull, so detailed props stay cheap in draw calls.

const _q = new THREE.Quaternion(), _e = new THREE.Euler(), _p = new THREE.Vector3(), _s = new THREE.Vector3();
export function mat4(pos = [0, 0, 0], rot = [0, 0, 0], scale = [1, 1, 1]) {
  const s = Array.isArray(scale) ? scale : [scale, scale, scale];
  return new THREE.Matrix4().compose(_p.set(...pos), _q.setFromEuler(_e.set(...rot)), _s.set(...s));
}

// Non-indexed, position + normal only, so anything can be merged with anything.
function clean(geo, flat) {
  const g = geo.index ? geo.toNonIndexed() : geo.clone();
  for (const k of Object.keys(g.attributes)) if (k !== 'position' && k !== 'normal') g.deleteAttribute(k);
  if (flat || !g.attributes.normal) g.computeVertexNormals();
  return g;
}

export class Kit {
  constructor() { this.parts = new Map(); this.hull = []; }
  // outline: include in the outline hull; flat: faceted normals; matrix overrides pos/rot/scale
  add(geo, mat, { pos, rot, scale, matrix, outline = true, flat = false } = {}) {
    const g = clean(geo, flat);
    const m = matrix || mat4(pos, rot, scale);
    g.applyMatrix4(m);
    if (m.determinant() < 0) { // mirrored: restore the winding so faces stay front-facing
      for (const a of [g.attributes.position, g.attributes.normal]) for (let i = 0; i < a.count; i += 3) {
        for (let c = 0; c < 3; c++) { const t = a.getComponent(i + 1, c); a.setComponent(i + 1, c, a.getComponent(i + 2, c)); a.setComponent(i + 2, c, t); }
      }
    }
    if (!this.parts.has(mat)) this.parts.set(mat, []);
    this.parts.get(mat).push(g);
    if (outline) this.hull.push(g);
    return this;
  }
  // -> { meshes: [{ geo, mat }], hull: geometry | null } so the result can be instanced several times
  bake() {
    const meshes = [...this.parts].map(([mat, list]) => ({ geo: mergeGeometries(list), mat }));
    let hull = null;
    if (this.hull.length) hull = outlineGeo(mergeGeometries(this.hull.map((g) => { const c = g.clone(); c.deleteAttribute('normal'); return c; })));
    return { meshes, hull };
  }
  build(parent, thick = 0.02) { return instance(this.bake(), parent, thick); }
}

export function instance({ meshes, hull }, parent, thick = 0.02) {
  for (const { geo, mat } of meshes) parent.add(new THREE.Mesh(geo, mat));
  if (hull && thick) parent.add(new THREE.Mesh(hull, outlineMat(thick)));
  return parent;
}

// Flat ribbon along a 2D polyline in the XY plane, facing +Z. width may be a function of t (0..1).
export function ribbon(pts, width) {
  const pos = [], n = pts.length;
  const wf = typeof width === 'function' ? width : () => width;
  const side = [];
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1];
    const l = Math.hypot(dx, dy) || 1;
    const w = wf(i / (n - 1)) / 2;
    side.push([pts[i][0] - dy / l * w, pts[i][1] + dx / l * w, pts[i][0] + dy / l * w, pts[i][1] - dx / l * w]);
  }
  for (let i = 0; i < n - 1; i++) {
    const [ax, ay, bx, by] = side[i], [cx, cy, dx, dy] = side[i + 1];
    pos.push(bx, by, 0, cx, cy, 0, ax, ay, 0, bx, by, 0, dx, dy, 0, cx, cy, 0);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  // keep it front-facing toward +Z whichever way the curve turns
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i += 3) {
    const cross = (p.getX(i + 1) - p.getX(i)) * (p.getY(i + 2) - p.getY(i)) - (p.getY(i + 1) - p.getY(i)) * (p.getX(i + 2) - p.getX(i));
    if (cross < 0) for (let c = 0; c < 3; c++) { const t = p.getComponent(i + 1, c); p.setComponent(i + 1, c, p.getComponent(i + 2, c)); p.setComponent(i + 2, c, t); }
  }
  g.computeVertexNormals();
  return g;
}

// Curl: a spiral that unwinds into a tail, the painted flourish used all over the props.
export function curlPts(r, turns = 1.6, tail = 1.2, dir = 1) {
  const pts = [], N = Math.ceil(turns * 18);
  for (let i = 0; i <= N; i++) {
    const t = i / N, a = t * turns * Math.PI * 2, rr = r * (0.12 + 0.88 * t);
    pts.push([Math.cos(a) * rr * dir, Math.sin(a) * rr]);
  }
  const [lx, ly] = pts[pts.length - 1];
  for (let i = 1; i <= 10; i++) { const t = i / 10; pts.push([lx + dir * r * tail * 0.5 * Math.sin(t * Math.PI * 1.25), ly - r * tail * t * 1.1]); }
  return pts;
}

// Offset a convex polygon (list of [x, y]) by d; positive grows it.
export function offsetPoly(pts, d) {
  let area = 0;
  for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; area += a[0] * b[1] - b[0] * a[1]; }
  const s = area > 0 ? 1 : -1, n = pts.length, lines = [];
  for (let i = 0; i < n; i++) {
    const a = pts[i], b = pts[(i + 1) % n], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy);
    const nx = s * dy / l, ny = -s * dx / l;
    lines.push([a[0] + nx * d, a[1] + ny * d, dx, dy]);
  }
  return lines.map((L1, i) => {
    const L0 = lines[(i + n - 1) % n];
    const det = L0[2] * L1[3] - L0[3] * L1[2];
    const t = ((L1[0] - L0[0]) * L1[3] - (L1[1] - L0[1]) * L1[2]) / det;
    return [L0[0] + L0[2] * t, L0[1] + L0[3] * t];
  });
}

// Prism from a 2D polygon in the XZ plane (pts as [x, z]) between y0 and y1, optional hole polygon.
export function prism(pts, y0, y1, hole) {
  const shape = new THREE.Shape(pts.map(([x, z]) => new THREE.Vector2(x, -z)));
  if (hole) {
    // ExtrudeGeometry only fixes a hole's winding when it flips the outer contour, so make it opposite here
    let h = hole.map(([x, z]) => new THREE.Vector2(x, -z));
    if (THREE.ShapeUtils.isClockWise(h) === THREE.ShapeUtils.isClockWise(shape.getPoints())) h = h.reverse();
    shape.holes.push(new THREE.Path(h));
  }
  const g = new THREE.ExtrudeGeometry(shape, { depth: y1 - y0, bevelEnabled: false });
  g.rotateX(-Math.PI / 2);
  g.translate(0, y0, 0);
  return g;
}

// Smooth 3D value noise for lumpy earth and stone.
function h3(x, y, z) { const h = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453; return h - Math.floor(h); }
export function noise3(x, y, z) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const f = (t) => t * t * (3 - 2 * t);
  const u = f(x - xi), v = f(y - yi), w = f(z - zi);
  const L = (a, b, t) => a + (b - a) * t;
  return L(L(L(h3(xi, yi, zi), h3(xi + 1, yi, zi), u), L(h3(xi, yi + 1, zi), h3(xi + 1, yi + 1, zi), u), v),
    L(L(h3(xi, yi, zi + 1), h3(xi + 1, yi, zi + 1), u), L(h3(xi, yi + 1, zi + 1), h3(xi + 1, yi + 1, zi + 1), u), v), w);
}

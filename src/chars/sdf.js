// Signed distance functions in plain JavaScript: the shapes every character is sculpted from.
// Each factory returns d(x, y, z) -> distance in meters (negative inside). They are only evaluated while a
// character's mesh is being built (see mesher.js), never per frame.
export const smin = (a, b, k) => { const h = Math.max(k - Math.abs(a - b), 0) / k; return Math.min(a, b) - h * h * k * 0.25; };
export const smax = (a, b, k) => -smin(-a, -b, k);
export const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
export const mix = (a, b, t) => a + (b - a) * t;
export const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

export const sphere = (cx, cy, cz, r) => (x, y, z) => Math.hypot(x - cx, y - cy, z - cz) - r;
// iq's bound for an ellipsoid: exact on the surface, a good estimate near it
export function ellipsoid(cx, cy, cz, rx, ry, rz) {
  const m = Math.min(rx, ry, rz);
  return (x, y, z) => {
    const px = x - cx, py = y - cy, pz = z - cz, k0 = Math.hypot(px / rx, py / ry, pz / rz), k1 = Math.hypot(px / (rx * rx), py / (ry * ry), pz / (rz * rz));
    return k1 > 1e-9 ? (k0 * (k0 - 1)) / k1 : -m;
  };
}
// a capsule whose two ends have different radii
export function roundCone(ax, ay, az, bx, by, bz, r1, r2) {
  const bax = bx - ax, bay = by - ay, baz = bz - az, l2 = bax * bax + bay * bay + baz * baz, rr = r1 - r2, a2 = l2 - rr * rr, il2 = 1 / l2;
  return (x, y, z) => {
    const pax = x - ax, pay = y - ay, paz = z - az, yy = pax * bax + pay * bay + paz * baz, zz = yy - l2;
    const xx = pax * l2 - bax * yy, xy = pay * l2 - bay * yy, xz = paz * l2 - baz * yy;
    const x2 = xx * xx + xy * xy + xz * xz, y2 = yy * yy * l2, z2 = zz * zz * l2, k = Math.sign(rr) * rr * rr * x2;
    if (Math.sign(zz) * a2 * z2 > k) return Math.sqrt(x2 + z2) * il2 - r2;
    if (Math.sign(yy) * a2 * y2 < k) return Math.sqrt(x2 + y2) * il2 - r1;
    return (Math.sqrt(x2 * a2 * il2) + yy * rr) * il2 - r1;
  };
}
export const capsule = (ax, ay, az, bx, by, bz, r) => roundCone(ax, ay, az, bx, by, bz, r, r);
// a ring lying in the xz plane
export const torus = (cx, cy, cz, R, r) => (x, y, z) => Math.hypot(Math.hypot(x - cx, z - cz) - R, y - cy) - r;
export function roundBox(cx, cy, cz, hx, hy, hz, r = 0) {
  return (x, y, z) => {
    const dx = Math.abs(x - cx) - hx + r, dy = Math.abs(y - cy) - hy + r, dz = Math.abs(z - cz) - hz + r;
    return Math.hypot(Math.max(dx, 0), Math.max(dy, 0), Math.max(dz, 0)) + Math.min(Math.max(dx, dy, dz), 0) - r;
  };
}
// an upright cylinder with rounded rims, centered at (cx, cy, cz)
export function cylinder(cx, cy, cz, r, hh, round = 0) {
  return (x, y, z) => {
    const dx = Math.hypot(x - cx, z - cz) - r + round, dy = Math.abs(y - cy) - hh + round;
    return Math.min(Math.max(dx, dy), 0) + Math.hypot(Math.max(dx, 0), Math.max(dy, 0)) - round;
  };
}
// evaluate d in a moved and turned frame: the shape is rotated by euler angles (x, y, z order) about (cx, cy, cz)
export function turned(d, cx, cy, cz, rx, ry, rz) {
  const cxr = Math.cos(rx), sxr = Math.sin(rx), cyr = Math.cos(ry), syr = Math.sin(ry), czr = Math.cos(rz), szr = Math.sin(rz);
  // rotation matrix R = Rx * Ry * Rz; a point goes into the shape's frame through its transpose
  const m00 = cyr * czr, m01 = -cyr * szr, m02 = syr;
  const m10 = sxr * syr * czr + cxr * szr, m11 = -sxr * syr * szr + cxr * czr, m12 = -sxr * cyr;
  const m20 = -cxr * syr * czr + sxr * szr, m21 = cxr * syr * szr + sxr * czr, m22 = cxr * cyr;
  return (x, y, z) => {
    const px = x - cx, py = y - cy, pz = z - cz;
    return d(m00 * px + m10 * py + m20 * pz + cx, m01 * px + m11 * py + m21 * pz + cy, m02 * px + m12 * py + m22 * pz + cz);
  };
}
// mirror a shape across the yz plane (a left arm becomes a right arm)
export const mirrorX = (d) => (x, y, z) => d(-x, y, z);
// both sides at once
export const bothX = (d) => (x, y, z) => d(Math.abs(x), y, z);
// squash along z (bodies are a little flatter than they are wide)
export const squashZ = (d, k) => (x, y, z) => d(x, y, z / k) * k;
export const union = (...ds) => (x, y, z) => { let m = Infinity; for (let i = 0; i < ds.length; i++) { const v = ds[i](x, y, z); if (v < m) m = v; } return m; };
export const blend = (k, ...ds) => (x, y, z) => { let m = ds[0](x, y, z); for (let i = 1; i < ds.length; i++) m = smin(m, ds[i](x, y, z), k); return m; };

// cheap value noise for lumps and frayed edges
const h3 = (x, y, z) => { const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453; return s - Math.floor(s); };
export function noise3(x, y, z) {
  const ix = Math.floor(x), iy = Math.floor(y), iz = Math.floor(z);
  let fx = x - ix, fy = y - iy, fz = z - iz;
  fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy); fz = fz * fz * (3 - 2 * fz);
  const l = (a, b, t) => a + (b - a) * t;
  return l(l(l(h3(ix, iy, iz), h3(ix + 1, iy, iz), fx), l(h3(ix, iy + 1, iz), h3(ix + 1, iy + 1, iz), fx), fy),
    l(l(h3(ix, iy, iz + 1), h3(ix + 1, iy, iz + 1), fx), l(h3(ix, iy + 1, iz + 1), h3(ix + 1, iy + 1, iz + 1), fx), fy), fz);
}

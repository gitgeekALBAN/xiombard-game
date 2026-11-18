// Plain primitives for the hard, simple things a character wears or carries (a barrel, a rolling pin). The
// sculptor in mesher.js is for soft shapes that melt into each other; a solid of revolution needs a couple of
// hundred triangles, and its planks, hoops and rivets are painted by the shader instead of modeled.
// A primitive is { pos, nrm, idx } in rest space and goes into a piece as `mesh` (see meshPieces).

// Solid of revolution around the y axis. profile: [[radius, y], ...] from bottom to top; seg: sides.
// opts: smooth (one normal per ring: a curved wall) or not (one per band: hard edges), zs (squash along z),
// lift(ring index, angle) -> extra height for a vertex (a splintered rim), flip (faces look inward: an inside wall)
export function lathe(profile, seg, opts = {}) {
  const { smooth = false, zs = 1, lift, flip = false } = opts, pos = [], nrm = [], idx = [], TAU = Math.PI * 2;
  const bandN = (a, b) => { const dr = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dr, dy) || 1; return [dy / l, -dr / l]; }; // outward in (r, y)
  const ring = (r, y, n, k) => {
    const base = pos.length / 3;
    for (let i = 0; i <= seg; i++) {
      const a = (i / seg) * TAU, s = Math.sin(a), c = Math.cos(a), f = flip ? -1 : 1;
      pos.push(r * s, y + (lift ? lift(k, a) : 0), r * c * zs);
      const nx = n[0] * s * f, ny = n[1] * f, nz = (n[0] * c * f) / zs, l = Math.hypot(nx, ny, nz) || 1;
      nrm.push(nx / l, ny / l, nz / l);
    }
    return base;
  };
  const quads = (a, b) => { for (let i = 0; i < seg; i++) { if (flip) idx.push(a + i, b + i, a + i + 1, a + i + 1, b + i, b + i + 1); else idx.push(a + i, a + i + 1, b + i, a + i + 1, b + i + 1, b + i); } };
  if (smooth) {
    const rings = profile.map((p, k) => {
      const n0 = k > 0 ? bandN(profile[k - 1], p) : null, n1 = k < profile.length - 1 ? bandN(p, profile[k + 1]) : null;
      const n = n0 && n1 ? [(n0[0] + n1[0]) / 2, (n0[1] + n1[1]) / 2] : n0 || n1;
      return ring(p[0], p[1], n, k);
    });
    for (let k = 0; k < rings.length - 1; k++) quads(rings[k], rings[k + 1]);
  } else for (let k = 0; k < profile.length - 1; k++) { const n = bandN(profile[k], profile[k + 1]); quads(ring(profile[k][0], profile[k][1], n, k), ring(profile[k + 1][0], profile[k + 1][1], n, k + 1)); }
  return { pos, nrm, idx };
}
export function merge(...ms) {
  const out = { pos: [], nrm: [], idx: [] };
  for (const m of ms) { const base = out.pos.length / 3; out.pos.push(...m.pos); out.nrm.push(...m.nrm); for (const i of m.idx) out.idx.push(i + base); }
  return out;
}
// move and turn a primitive: f maps a rest-space vector [x, y, z] to its new direction (a pure rotation), then it is shifted
export function place(m, f, ox = 0, oy = 0, oz = 0) {
  const out = { pos: [], nrm: [], idx: m.idx.slice() };
  for (let i = 0; i < m.pos.length; i += 3) {
    const p = f(m.pos[i], m.pos[i + 1], m.pos[i + 2]), n = f(m.nrm[i], m.nrm[i + 1], m.nrm[i + 2]);
    out.pos.push(p[0] + ox, p[1] + oy, p[2] + oz); out.nrm.push(n[0], n[1], n[2]);
  }
  return out;
}

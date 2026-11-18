// Plain primitives for the hard, simple things a character wears or carries (a barrel, a rolling pin). The
// sculptor in mesher.js is for soft shapes that melt into each other; a solid of revolution needs a couple of
// hundred triangles, and its planks, hoops and rivets are painted by the shader instead of modeled.
// A primitive is { pos, nrm, idx } in rest space and goes into a piece as `mesh` (see meshPieces).

// Solid of revolution around the y axis. profile: [[radius, y], ...] from bottom to top; seg: sides.
// opts: smooth (one normal per ring: a curved wall) or not (one per band: hard edges), closed (with smooth: the
// profile is a loop, counter-clockwise in (radius, y), which makes a ring-shaped tube), zs (squash along z),
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
    const L = profile.length, closed = !!opts.closed; // closed: the profile is a loop (a tube bent into a ring)
    const rings = profile.map((p, k) => {
      const n0 = k > 0 || closed ? bandN(profile[(k + L - 1) % L], p) : null, n1 = k < L - 1 || closed ? bandN(p, profile[(k + 1) % L]) : null;
      const n = n0 && n1 ? [(n0[0] + n1[0]) / 2, (n0[1] + n1[1]) / 2] : n0 || n1;
      return ring(p[0], p[1], n, k);
    });
    for (let k = 0; k < (closed ? L : L - 1); k++) quads(rings[k], rings[(k + 1) % L]);
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

// A strip of cloth with a little thickness. rows: from the top down, each a list of [x, y, z] points across the
// strip (left to right as seen from the front, where +z looks at you). The edges are rounded for the ink hull.
export function ribbon(rows, thick) {
  const nr = rows.length, nc = rows[0].length, pos = [], nrm = [], idx = [], F = (i, j) => i * nc + j, B = (i, j) => nr * nc + i * nc + j;
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], norm = (v) => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const N = [], Lat = [];
  for (let i = 0; i < nr; i++) for (let j = 0; j < nc; j++) {
    const across = norm(sub(rows[i][Math.min(j + 1, nc - 1)], rows[i][Math.max(j - 1, 0)])), down = norm(sub(rows[Math.min(i + 1, nr - 1)][j], rows[Math.max(i - 1, 0)][j]));
    N.push(norm(cross(down, across)));
    const sj = j === 0 ? -1 : j === nc - 1 ? 1 : 0, si = i === nr - 1 ? 1 : 0; // which way is "off the edge" here
    Lat.push([across[0] * sj + down[0] * si, across[1] * sj + down[1] * si, across[2] * sj + down[2] * si]);
  }
  for (const side of [1, -1]) for (let i = 0; i < nr; i++) for (let j = 0; j < nc; j++) {
    const p = rows[i][j], n = N[i * nc + j], l = Lat[i * nc + j], o = side > 0 ? 0 : thick;
    pos.push(p[0] - n[0] * o, p[1] - n[1] * o, p[2] - n[2] * o);
    nrm.push(...norm([n[0] * side + l[0] * 0.9, n[1] * side + l[1] * 0.9, n[2] * side + l[2] * 0.9]));
  }
  for (let i = 0; i < nr - 1; i++) for (let j = 0; j < nc - 1; j++) {
    idx.push(F(i, j), F(i + 1, j), F(i + 1, j + 1), F(i, j), F(i + 1, j + 1), F(i, j + 1));
    idx.push(B(i, j), B(i + 1, j + 1), B(i + 1, j), B(i, j), B(i, j + 1), B(i + 1, j + 1));
  }
  const rim = []; // around the edge, counter-clockwise seen from the front: down the left, along the bottom, up the right, back along the top
  for (let i = 0; i < nr - 1; i++) rim.push([i, 0]);
  for (let j = 0; j < nc - 1; j++) rim.push([nr - 1, j]);
  for (let i = nr - 1; i > 0; i--) rim.push([i, nc - 1]);
  for (let j = nc - 1; j > 0; j--) rim.push([0, j]);
  for (let e = 0; e < rim.length; e++) { const a = rim[e], b = rim[(e + 1) % rim.length]; idx.push(F(...a), B(...a), F(...b), F(...b), B(...a), B(...b)); }
  return { pos, nrm, idx };
}

// A solid of revolution found from its formula. d(r, y) < 0 inside; yMid is any height on the axis that is inside.
// Rings are spaced closer near the two poles, so the ends come out round with few of them.
export function revolve(d, yMid, rings, seg, opts = {}) {
  const pole = (dir) => { let a = yMid, b = yMid + dir * 4; for (let i = 0; i < 32; i++) { const m = (a + b) / 2; if (d(0.0005, m) < 0) a = m; else b = m; } return a; };
  const y0 = pole(-1), y1 = pole(1), profile = [];
  for (let i = 0; i <= rings; i++) {
    const y = y0 + (y1 - y0) * (0.5 - 0.5 * Math.cos((Math.PI * i) / rings));
    let a = 0, b = 3;
    if (i > 0 && i < rings) for (let n = 0; n < 28; n++) { const m = (a + b) / 2; if (d(m, y) < 0) a = m; else b = m; }
    profile.push([Math.max(a, 0.001), y]);
  }
  return lathe(profile, seg, { smooth: true, ...opts });
}
// an ellipsoid centered on the origin
export const ball = (rx, ry, rz, seg = 10, rings = 6) => lathe(Array.from({ length: rings + 1 }, (_, i) => { const a = -Math.PI / 2 + (Math.PI * i) / rings; return [Math.max(rx * Math.cos(a), 0.001), ry * Math.sin(a)]; }), seg, { smooth: true, zs: rz / rx });
// lay a primitive built along +y onto the segment from a toward b: y = 0 lands on a, and +y points at b
export function along(m, a, b) {
  const dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2], l = Math.hypot(dx, dy, dz) || 1, ux = dx / l, uy = dy / l, uz = dz / l;
  // rotate +y onto u about the axis y x u = (uz, 0, -ux)
  const s = Math.hypot(ux, uz), kx = s > 1e-6 ? uz / s : 1, kz = s > 1e-6 ? -ux / s : 0, c = uy;
  const rot = (x, y, z) => { const dot = kx * x + kz * z, cx = -kz * y, cy = kz * x - kx * z, cz = kx * y; return [x * c + cx * s + kx * dot * (1 - c), y * c + cy * s, z * c + cz * s + kz * dot * (1 - c)]; };
  return place(m, rot, a[0], a[1], a[2]);
}
// keep only the triangles whose three corners all pass the test (a cap of hair that leaves the face free)
export function clip(m, keep) {
  const idx = [];
  for (let t = 0; t < m.idx.length; t += 3) {
    const ok = [0, 1, 2].every((k) => { const i = m.idx[t + k] * 3; return keep(m.pos[i], m.pos[i + 1], m.pos[i + 2]); });
    if (ok) idx.push(m.idx[t], m.idx[t + 1], m.idx[t + 2]);
  }
  return { pos: m.pos, nrm: m.nrm, idx };
}

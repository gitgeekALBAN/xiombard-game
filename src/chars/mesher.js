// Turns distance functions into a low-poly mesh once, at load time: naive surface nets (one vertex per surface cell,
// placed at the average of the edge crossings), smooth normals from the distance field itself, baked ambient
// occlusion, and two bone weights per vertex so joints bend softly. A character is a list of pieces:
//   { d, box: [x0, y0, z0, x1, y1, z1], cell, mat, color: [r, g, b] (linear), bone: i | bones: [{ part, d }], soft }
// or, for hard simple shapes, a ready primitive instead of a formula: { mesh: { pos, nrm, idx }, mat, color, bone }
// Everything is in the character's rest space; the result is plain typed arrays (no three.js here).
export function surfaceNets(d, box, cell) {
  // the grid overshoots the box by more than a cell on every side: faces are only made between interior cells,
  // so a surface that touches the edge of the grid would come out with holes
  const x0 = box[0] - cell * 1.5, y0 = box[1] - cell * 1.5, z0 = box[2] - cell * 1.5, x1 = box[3], y1 = box[4], z1 = box[5];
  const nx = Math.ceil((x1 - x0) / cell) + 3, ny = Math.ceil((y1 - y0) / cell) + 3, nz = Math.ceil((z1 - z0) / cell) + 3;
  const vals = new Float32Array(nx * ny * nz), sx = 1, sy = nx, sz = nx * ny;
  for (let k = 0, o = 0; k < nz; k++) for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++, o++) vals[o] = d(x0 + i * cell, y0 + j * cell, z0 + k * cell);
  const cx = nx - 1, cy = ny - 1, cz = nz - 1, vert = new Int32Array(cx * cy * cz).fill(-1), pos = [], idx = [];
  const off = [0, sx, sy, sx + sy, sz, sx + sz, sy + sz, sx + sy + sz];
  const edges = [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7]];
  const cxyz = [[0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0], [0, 0, 1], [1, 0, 1], [0, 1, 1], [1, 1, 1]];
  for (let k = 0; k < cz; k++) for (let j = 0; j < cy; j++) for (let i = 0; i < cx; i++) {
    const o = i + j * sy + k * sz;
    let mask = 0;
    for (let c = 0; c < 8; c++) if (vals[o + off[c]] < 0) mask |= 1 << c;
    if (mask === 0 || mask === 255) continue;
    let px = 0, py = 0, pz = 0, n = 0;
    for (const [a, b] of edges) {
      const va = vals[o + off[a]], vb = vals[o + off[b]];
      if ((va < 0) === (vb < 0)) continue;
      const t = va / (va - vb);
      px += cxyz[a][0] + (cxyz[b][0] - cxyz[a][0]) * t; py += cxyz[a][1] + (cxyz[b][1] - cxyz[a][1]) * t; pz += cxyz[a][2] + (cxyz[b][2] - cxyz[a][2]) * t;
      n++;
    }
    vert[i + j * cx + k * cx * cy] = pos.length / 3;
    pos.push(x0 + (i + px / n) * cell, y0 + (j + py / n) * cell, z0 + (k + pz / n) * cell);
  }
  const V = (i, j, k) => vert[i + j * cx + k * cx * cy];
  const quad = (a, b, c, e, flip) => { if (a < 0 || b < 0 || c < 0 || e < 0) return; if (flip) idx.push(a, e, c, a, c, b); else idx.push(a, b, c, a, c, e); };
  for (let k = 1; k < cz; k++) for (let j = 1; j < cy; j++) for (let i = 1; i < cx; i++) {
    const o = i + j * sy + k * sz, in0 = vals[o] < 0;
    if (in0 !== (vals[o + sx] < 0)) quad(V(i, j - 1, k - 1), V(i, j, k - 1), V(i, j, k), V(i, j - 1, k), !in0);
    if (in0 !== (vals[o + sy] < 0)) quad(V(i - 1, j, k - 1), V(i - 1, j, k), V(i, j, k), V(i, j, k - 1), !in0);
    if (in0 !== (vals[o + sz] < 0)) quad(V(i - 1, j - 1, k), V(i, j - 1, k), V(i, j, k), V(i - 1, j, k), !in0);
  }
  return { pos, idx };
}

// pieces -> one indexed mesh. Attributes: position, normal, color (rgb), fx (material id, baked occlusion),
// bone (two part indices), weight (share of the first)
export function meshPieces(pieces) {
  const P = [], N = [], C = [], FX = [], B = [], W = [], I = [];
  // what crowds a point: every sculpted piece, and every primitive that brought a formula of its own shape (`occ`)
  const all = (x, y, z) => { let m = Infinity; for (const p of pieces) { const f = p.d || p.occ; if (!f) continue; const v = f(x, y, z); if (v < m) m = v; } return m; };
  for (const p of pieces) {
    const prim = p.mesh, { pos, idx } = prim ? prim : surfaceNets(p.d, p.box, p.cell), base = P.length / 3, e = (p.cell || 0.02) * 0.5, d = p.d;
    const start = I.length;
    for (let i = 0; i < pos.length; i += 3) {
      let x = pos[i], y = pos[i + 1], z = pos[i + 2], nx = 0, ny = 1, nz = 0;
      if (prim) { nx = prim.nrm[i]; ny = prim.nrm[i + 1]; nz = prim.nrm[i + 2]; } // a primitive knows its own surface
      else
      // Surface nets put a vertex somewhere inside its cell, which leaves stair steps on thin or slanted shapes.
      // Two steps down the gradient snap it onto the true surface, so even a coarse mesh has a clean silhouette.
      for (let it = 0; it < 3; it++) {
        nx = d(x + e, y, z) - d(x - e, y, z); ny = d(x, y + e, z) - d(x, y - e, z); nz = d(x, y, z + e) - d(x, y, z - e);
        const l = Math.hypot(nx, ny, nz) || 1;
        nx /= l; ny /= l; nz /= l;
        if (it === 2) break;
        const dv = Math.max(-p.cell, Math.min(p.cell, d(x, y, z)));
        x -= nx * dv; y -= ny * dv; z -= nz * dv;
      }
      // occlusion: how much of the whole character crowds the space just above this point
      let occ = 0;
      for (const [h, w] of [[0.03, 0.6], [0.075, 0.4]]) occ += w * Math.max(0, (h - all(x + nx * h, y + ny * h, z + nz * h)) / h);
      let b0 = p.bone || 0, b1 = b0, w = 1;
      if (p.bones) { // the two nearest bones share the vertex; `soft` is the width of the blend
        let d0 = Infinity, d1 = Infinity;
        for (const bn of p.bones) { const v = bn.d(x, y, z); if (v < d0) { d1 = d0; b1 = b0; d0 = v; b0 = bn.part; } else if (v < d1) { d1 = v; b1 = bn.part; } }
        w = d1 === Infinity ? 1 : Math.min(1, 0.5 + (d1 - d0) / (2 * (p.soft || 0.05)));
      }
      const col = typeof p.color === 'function' ? p.color(x, y, z) : p.color;
      P.push(x, y, z); N.push(nx, ny, nz); C.push(col[0], col[1], col[2]); FX.push(p.mat, 1 - Math.min(1, occ)); B.push(b0, b1); W.push(w);
    }
    for (let i = 0; i < idx.length; i++) I.push(idx[i] + base);
    p.range = [start, I.length]; // which triangles came from this piece
  }
  // surface nets can wind either way depending on the field's sign convention: check one triangle against its normal
  const first = pieces.find((p) => !p.mesh && p.range && p.range[1] > p.range[0]);
  if (first) {
    let s = 0;
    for (let t = first.range[0]; t < Math.min(first.range[1], first.range[0] + 600); t += 3) {
      const a = I[t] * 3, b = I[t + 1] * 3, c = I[t + 2] * 3;
      const ux = P[b] - P[a], uy = P[b + 1] - P[a + 1], uz = P[b + 2] - P[a + 2], vx = P[c] - P[a], vy = P[c + 1] - P[a + 1], vz = P[c + 2] - P[a + 2];
      s += (uy * vz - uz * vy) * N[a] + (uz * vx - ux * vz) * N[a + 1] + (ux * vy - uy * vx) * N[a + 2];
    }
    if (s < 0) for (const p of pieces) if (!p.mesh) for (let t = p.range[0]; t < p.range[1]; t += 3) { const q = I[t + 1]; I[t + 1] = I[t + 2]; I[t + 2] = q; }
  }
  return { position: new Float32Array(P), normal: new Float32Array(N), color: new Float32Array(C), fx: new Float32Array(FX), bone: new Float32Array(B), weight: new Float32Array(W),
    index: P.length / 3 > 65535 ? new Uint32Array(I) : new Uint16Array(I) };
}

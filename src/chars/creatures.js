import { smin, sphere, ellipsoid, roundCone, capsule, turned, mirrorX, noise3, sstep } from './sdf.js';
import { lathe, merge, place, ribbon, ball } from './prims.js';
import { MAT, lin } from './human.js';

// Body plans that are not the crew's bean: the knuckle-dragger and the zombie dogs. Same contract as
// humanPieces(): a list of pieces for the mesher in rest space, parts 0-5 as the rig defines them.
const pad = (b, m) => [b[0] - m, b[1] - m, b[2] - m, b[3] + m, b[4] + m, b[5] + m];
const mixc = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const lumpy = (d, amp, f) => (x, y, z) => d(x, y, z) - amp * noise3(x * f, y * f, z * f);
// a tube bent into a ring around the y axis, centered on the origin: a collar, one wrap of a scarf
const tube = (R, r, seg) => lathe(Array.from({ length: 7 }, (_, i) => [R + r * Math.cos((i / 7) * Math.PI * 2), r * Math.sin((i / 7) * Math.PI * 2)]), seg, { smooth: true, closed: true });

// ---------- the knuckle-dragger: a hunched boulder with a face sunk between its shoulders and fists like anvils
export function brutePieces(k, q = 1) {
  const [yB, rB, yN] = k.bean, [yH, rH] = k.head, [sx, sy, sz] = k.shoulder, [hx, hy, hz] = k.hand, [ar, fr] = k.arm, c = (v) => v / q, out = [];
  const col = Object.fromEntries(Object.entries(k.colors).map(([n, h]) => [n, lin(h)])), dirt = lin('#4a3a2c');
  const hulk = ellipsoid(0, yB, -0.02, rB * 1.04, (yN - yB + rB) * 0.56 + 0.12, rB * 0.86), hump = sphere(0, yN - 0.02, -0.1, rB * 0.62);
  const shoulders = (x, y, z) => Math.hypot(Math.abs(x) - sx * 0.9, y - sy, z + 0.02) - 0.17;
  const body = (x, y, z) => smin(smin(hulk(x, y, z), hump(x, y, z), 0.12), shoulders(x, y, z), 0.1);
  const fz = k.faceAt[2], face = ellipsoid(0, yH, fz - 0.03, rH * 1.02, rH * 1.05, rH * 0.8);
  const trunk = (x, y, z) => smin(body(x, y, z), face(x, y, z), 0.05);
  out.push({ d: trunk, box: pad([-rB * 1.25, yB - rB * 1.1, -rB, rB * 1.25, yN + rB * 0.75, Math.max(rB, fz + rH)], 0.04), cell: c(0.045), mat: MAT.skin, color: col.skin, bones: [{ part: 0, d: body }, { part: 1, d: (x, y, z) => face(x, y, z) + 0.03 }], soft: 0.04 });

  // arms as thick as legs of an ordinary zombie, widening into the fist; knuckles and a thumb; earth caked on below
  const armL = roundCone(sx, sy, sz, hx, hy + fr * 0.6, hz, ar * 1.25, ar), fist = ellipsoid(hx, hy + fr * 0.15, hz + 0.02, fr * 0.95, fr * 0.9, fr * 1.08);
  const knuckles = (x, y, z) => Math.min(sphere(hx - fr * 0.55, hy - fr * 0.05, hz + fr * 0.8, fr * 0.36)(x, y, z), sphere(hx, hy - fr * 0.12, hz + fr * 0.95, fr * 0.38)(x, y, z), sphere(hx + fr * 0.55, hy - fr * 0.05, hz + fr * 0.8, fr * 0.36)(x, y, z));
  const thumb = sphere(hx - fr * 0.85, hy + fr * 0.35, hz + fr * 0.35, fr * 0.36);
  const limbL = (x, y, z) => smin(smin(armL(x, y, z), fist(x, y, z), 0.06), Math.min(knuckles(x, y, z), thumb(x, y, z)), 0.035);
  const skinAll = (x, y, z) => smin(trunk(x, y, z), Math.min(limbL(x, y, z), limbL(-x, y, z)), 0.07);
  for (const s of [1, -1]) {
    const reach = roundCone(s * sx, sy, sz, s * hx, hy, hz, ar * 1.25 + 0.07, fr * 1.5), limb = s > 0 ? limbL : mirrorX(limbL);
    out.push({ d: (x, y, z) => Math.max(skinAll(x, y, z), reach(x, y, z)), box: pad([Math.min(s * sx, s * hx), hy - fr, Math.min(sz, hz), Math.max(s * sx, s * hx), sy, Math.max(sz, hz)], fr * 1.55), cell: c(0.03), mat: MAT.skin,
      color: (x, y, z) => mixc(col.skin, dirt, 0.75 * sstep(hy + fr * 1.1, hy - fr * 0.6, y) * (0.5 + 0.5 * noise3(x * 30, y * 30, z * 30))),
      bones: [{ part: s > 0 ? 2 : 3, d: (x, y, z) => limb(x, y, z) + Math.max(0, -body(x, y, z)) * 5 }, { part: 0, d: (x, y, z) => body(x, y, z) + 0.03 }], soft: 0.05 });
  }
  // what is left of a scarf: a tube wound once under the chin and a ragged end lying on the chest (primitives;
  // the stitches are paint)
  const sy0 = yH - rH * 0.8, sz0 = fz * 0.6, tilt = 0.55, ct = Math.cos(tilt), st = Math.sin(tilt);
  const ring = place(tube(rH * 1.45, 0.05, 16), (x, y, z) => [x, y * ct - z * st, y * st + z * ct], 0, sy0, sz0);
  const chest = (x, y, last) => { // the front of the trunk at (x, y)
    if (trunk(x, y, 0) > 0.03) return last;
    let lo = 0, hi = rB + 0.4;
    for (let n = 0; n < 16; n++) { const m = (lo + hi) / 2; if (trunk(x, y, m) < 0.045) lo = m; else hi = m; }
    return lo;
  };
  const zc = [rB, rB, rB, rB];
  const rag = ribbon(Array.from({ length: 6 }, (_, i) => Array.from({ length: 4 }, (_, j) => {
    const x = rH * 0.3 + (0.1 * j) / 3, y = yH - rH * 1.25 - (rH * 1.15 * i) / 5 + (i === 5 ? 0.06 * noise3(j * 1.9 + 2, 0.5, 0.5) : 0);
    return [x, y, (zc[j] = chest(x, y, zc[j]))];
  })), 0.03);
  out.push({ mesh: merge(ring, rag), mat: MAT.scarf, color: col.scarf, bone: 0 });
  // stumpy legs in small boots
  const [lx, ly, lr, top] = k.leg;
  const leg = capsule(lx, ly + 0.05, 0, lx, 0.06, 0, lr), shaft = roundCone(lx, top, 0, lx, lr * 1.1, 0, lr * 1.3, lr * 1.38), foot = ellipsoid(lx, lr * 1.05, lr * 1.2, lr * 1.6, lr * 1.15, lr * 2.4);
  const boot = (x, y, z) => Math.max(smin(shaft(x, y, z), foot(x, y, z), 0.02), -y, y - top);
  for (const s of [1, -1]) {
    const f = (d) => (s > 0 ? d : mirrorX(d)), x0 = s * lx - lr * 2.2, x1 = s * lx + lr * 2.2;
    out.push({ d: f(leg), box: [x0, top * 0.6, -lr * 2, x1, ly + 0.06 + lr * 1.5, lr * 2], cell: c(0.026), mat: MAT.leg, color: col.leg, bone: s > 0 ? 4 : 5 });
    out.push({ d: f(boot), box: [x0, -0.02, -lr * 2.2, x1, top + 0.02, lr * 4], cell: c(0.024), mat: MAT.boot, color: col.boot, bone: s > 0 ? 4 : 5 });
  }
  return out;
}

// ---------- zombie dogs. Parts: 0 body, 1 head, 2 front-left leg, 3 front-right, 4 back-left, 5 back-right.
// g: len (half body length), r, h (body height), head [radius, snout length, snout radius], leg [x, z, radius],
// ear [0 flap / 1 long wavy / 2 pompom, length, width], tail [length, radius, lift], pom [head, ankles, tail tip]
export const dogHeadAt = (g) => [0, g.h + g.r * 0.55 + g.head[0] * 0.55, g.len + g.head[0] * 0.45];
export function dogPieces(k, q = 1) {
  const g = k.dog, L = g.len, r = g.r, h = g.h, [hr, sl, sr] = g.head, [lx, lz, lr] = g.leg, [et, el, ew] = g.ear, [tl, tr, lift] = g.tail, [pomH, pomA, pomT] = g.pom;
  const col = Object.fromEntries(Object.entries(k.colors).map(([n, hex]) => [n, lin(hex)])), c = (v) => v / q, out = [], [, hy, hz] = dogHeadAt(g);
  // fur: a sausage body, a neck, a round head, a long snout and a tail in one piece
  const body = roundCone(0, h, -L + r, 0, h + r * 0.06, L - r * 0.9, r * 0.9, r), neck = roundCone(0, h + r * 0.3, L - r * 0.7, 0, hy - hr * 0.3, hz - hr * 0.4, r * 0.72, hr * 0.7);
  const skull = ellipsoid(0, hy, hz, hr, hr * 0.96, hr * 1.05), sx0 = hy - hr * 0.25, sz0 = hz + hr * 0.7;
  const snout = roundCone(0, sx0, sz0, 0, sx0 - sl * 0.12, sz0 + sl, sr * 1.3, sr), jaw = roundCone(0, sx0 - sr * 0.9, sz0 - 0.01, 0, sx0 - sr * 0.95 - sl * 0.1, sz0 + sl * 0.7, sr * 0.7, sr * 0.55);
  const ta = [0, h + r * 0.5, -L + r * 0.3], tn = Math.hypot(lift, lift - 1.2), tb = [0, ta[1] + (tl * lift) / tn, ta[2] + (tl * (lift - 1.2)) / tn];
  const tail = roundCone(...ta, ...tb, tr * 1.4, tr);
  const headD = (x, y, z) => smin(smin(skull(x, y, z), snout(x, y, z), 0.035), jaw(x, y, z), 0.02);
  const bodyD = (x, y, z) => smin(smin(body(x, y, z), neck(x, y, z), 0.05), tail(x, y, z), 0.03);
  const fur = (x, y, z) => smin(bodyD(x, y, z), headD(x, y, z), 0.04);
  const zTip = sz0 + sl + sr, top = Math.max(hy + hr, tb[1] + tr);
  out.push({ d: et === 2 ? lumpy(fur, 0.012, 38) : fur, box: pad([-Math.max(r, hr), h - r, Math.min(-L, tb[2] - tr), Math.max(r, hr), top, zTip], 0.035), cell: c(0.026), mat: MAT.fur, color: col.skin,
    bones: [{ part: 0, d: bodyD }, { part: 1, d: (x, y, z) => headD(x, y, z) + 0.02 }], soft: 0.04 });
  out.push({ mesh: place(ball(sr * 0.66, sr * 0.66, sr * 0.66, 8, 5), (x, y, z) => [x, y, z], 0, sx0 - sl * 0.12 + sr * 0.45, sz0 + sl + sr * 0.55), mat: MAT.nose, color: col.nose, bone: 1 });
  // the tongue lolls out of one side
  out.push({ mesh: place(ball(0.022, 0.05, 0.014, 6, 4), (x, y, z) => [x, y, z], sr * 0.5, sx0 - sr * 1.5 - 0.02, sz0 + sl * 0.62), mat: MAT.tongue, color: col.hair, bone: 1 });

  // ears: a dachshund's flaps, a spaniel's long wavy curtains, a poodle's pompoms
  let ear;
  if (et < 0.5) ear = turned(ellipsoid(hr * 0.98, hy - el * 0.3, hz - hr * 0.15, 0.026, el * 0.62, ew), hr * 0.9, hy + hr * 0.3, hz - hr * 0.15, 0.25, 0, -0.18);
  else if (et < 1.5) { const e0 = ellipsoid(hr * 1.02, hy - el * 0.42, hz - hr * 0.05, 0.04, el * 0.62, ew); ear = (x, y, z) => e0(x, y, z) + 0.009 * Math.sin(y * 62 + z * 30); }
  else ear = lumpy(sphere(hr * 1.0, hy - hr * 0.3, hz - hr * 0.1, el), 0.02, 40);
  const earB = pad([hr * 0.6, hy - el * 1.1, hz - hr * 0.15 - ew - el * 0.3, hr * 1.3 + (et > 1.5 ? el : 0), hy + hr * 0.7, hz - hr * 0.15 + ew + el * 0.3], 0.04);
  for (const s of [1, -1]) out.push({ d: s > 0 ? ear : mirrorX(ear), box: s > 0 ? earB : [-earB[3], earB[1], earB[2], -earB[0], earB[4], earB[5]], cell: c(0.018), mat: et > 1.5 ? MAT.fluff : MAT.hair, color: col.hat, bone: 1 });
  if (pomH > 0) { // the poodle's hairdo: a cauliflower on top, a ball on the tail
    const hair = lumpy((x, y, z) => smin(sphere(0, hy + hr * 0.85, hz - hr * 0.1, pomH)(x, y, z), Math.hypot(Math.abs(x) - pomH * 0.55, y - hy - hr * 0.55, z - hz - hr * 0.25) - pomH * 0.7, 0.03), 0.022, 36);
    out.push({ d: hair, box: pad([-pomH * 1.3, hy + hr * 0.2, hz - hr * 0.1 - pomH, pomH * 1.3, hy + hr * 0.85 + pomH, hz + hr * 0.4 + pomH * 0.7], 0.04), cell: c(0.02), mat: MAT.fluff, color: col.hat, bone: 1 });
    out.push({ d: lumpy(sphere(tb[0], tb[1], tb[2], pomT), 0.018, 40), box: pad([-pomT, tb[1] - pomT, tb[2] - pomT, pomT, tb[1] + pomT, tb[2] + pomT], 0.04), cell: c(0.018), mat: MAT.fluff, color: col.hat, bone: 0 });
  }
  // legs are plain tubes (primitives); paws in dark socks and the poodle's ankle fluff are soft, so they are sculpted
  const pawD = (zs) => ellipsoid(lx, lr * 0.95, zs * lz + lr * 0.55, lr * 1.4, lr * 1.0, lr * 1.9);
  const legTube = lathe([[0.001, lr * 0.1], [lr * 0.72, lr * 0.4], [lr, lr * 1.1], [lr, h]], 8, { smooth: true });
  [[1, 1, 2], [-1, 1, 3], [1, -1, 4], [-1, -1, 5]].forEach(([s, zs, part]) => {
    const f = (d) => (s > 0 ? d : mirrorX(d)), bx = [s * lx - lr * 2.4, -0.02, zs * lz - lr * 2.4, s * lx + lr * 2.4, h + lr, zs * lz + lr * 3.2];
    out.push({ mesh: place(legTube, (x, y, z) => [x, y, z], s * lx, 0, zs * lz), mat: MAT.fur, color: col.leg, bone: part });
    out.push({ d: f((x, y, z) => Math.max(pawD(zs)(x, y, z), -y)), box: [bx[0], -0.02, bx[2], bx[3], lr * 2.6, bx[5]], cell: c(0.014), mat: MAT.boot, color: col.boot, bone: part });
    if (pomA > 0) out.push({ d: f(lumpy(sphere(lx, lr * 2 + pomA, zs * lz, pomA), 0.016, 42)), box: pad([s * lx - pomA, lr * 2, zs * lz - pomA, s * lx + pomA, lr * 2 + pomA * 2, zs * lz + pomA], 0.03), cell: c(0.016), mat: MAT.fluff, color: col.hat, bone: part });
  });
  // a scrap of knitted scarf for a collar: a tube around the neck, tipped forward, and one ragged end hanging in front
  const ny = (h + r * 0.3 + hy - hr * 0.3) / 2 + r * 0.1, nz = (L - r * 0.7 + hz - hr * 0.4) / 2 + 0.01, nr = (r * 0.72 + hr * 0.7) / 2 + 0.024;
  const ct = Math.cos(0.75), st = Math.sin(0.75);
  const collar = place(tube(nr, 0.038, 14), (x, y, z) => [x, y * ct - z * st, y * st + z * ct], 0, ny, nz);
  const end = ribbon(Array.from({ length: 4 }, (_, i) => Array.from({ length: 3 }, (_, j) => [
    nr * 0.3 + 0.03 * j, ny - nr * 0.62 - 0.045 * i + (i === 3 ? 0.035 * noise3(j * 2.3 + 1, 0.5, 0.5) : 0), nz + nr * 0.86 + 0.012 * i])), 0.024);
  out.push({ mesh: merge(collar, end), mat: MAT.scarf, color: col.scarf, bone: 0 });
  return out;
}

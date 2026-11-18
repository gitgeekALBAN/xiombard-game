import { smin, sphere, ellipsoid, roundCone, capsule, turned, mirrorX, squashZ, noise3 } from './sdf.js';
import { lathe, merge, place, ribbon } from './prims.js';

// A two-legged character as a list of pieces for the mesher, sculpted from the numbers of its look (see
// shared/crew.js for what each array means). Rest pose: feet on y = 0, facing +Z, +X is the character's left.
// Parts: 0 body, 1 head, 2 armL, 3 armR, 4 legL, 5 legR. Material ids are read by the character shader:
export const MAT = { skin: 1, scarf: 2, knit: 3, cuff: 4, mitten: 5, leg: 6, boot: 7, nose: 8, hair: 9, felt: 10, fluff: 11, fur: 12, wood: 13, tongue: 14, cloth: 15, iron: 16, fringe: 17 };

export const lin = (hex) => hex.slice(1).match(/../g).map((h) => { const c = parseInt(h, 16) / 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; });
const box2 = (x, y, hx, hy) => { const dx = Math.abs(x) - hx, dy = Math.abs(y) - hy; return Math.hypot(Math.max(dx, 0), Math.max(dy, 0)) + Math.min(Math.max(dx, dy), 0); };
const pad = (b, m) => [b[0] - m, b[1] - m, b[2] - m, b[3] + m, b[4] + m, b[5] + m];
const MIN_LIMB = 0.03;  // thinner limbs than this fall between the mesher's cells

const moved = (d, ox, oy, oz) => (x, y, z) => d(x - ox, y - oy, z - oz);
const shift = (b, ox, oy, oz) => [b[0] + ox, b[1] + oy, b[2] + oz, b[3] + ox, b[4] + oy, b[5] + oz];

// q: mesh detail, 1 = normal. Cells grow as q shrinks (phones).
// Optional extras in the look, used by the odder zombies:
//   ball        the belly is a ball and the head sits on a thin neck
//   coat        { color, hem }: the body is a long garment with sleeves, cut off flat at hem
//   headAt      [x, y, z]: the head is not on the shoulders but carried there (the neck gets a stitched cap)
//   face2       [x, y, z, r]: a second head peeking out of the body
//   shawl, bun  a cloth over the shoulders, a knot of hair
//   barrel      { y0, y1, staves }: a barrel around the belly (a primitive; staves, hoops and rivets are painted)
//   prop 'pin'  a rolling pin in the right mitten
export function humanPieces(k, q = 1) {
  const [yB, rB, yN, rN] = k.bean, [yH, rH, zs] = k.head, col = Object.fromEntries(Object.entries(k.colors).map(([n, h]) => [n, lin(h)]));
  const [sx, sy, sz] = k.shoulder, [hx, hy, hz] = k.hand, ar = Math.max(k.arm[0], MIN_LIMB), mr = k.arm[1], out = [], c = (v) => v / q;
  const loose = k.headAt, coat = k.coat, ho = loose ? [loose[0], loose[1] - yH, loose[2]] : [0, 0, 0]; // where the head went
  let belly, head;
  if (k.ball) {
    belly = ellipsoid(0, yB, 0, rB, rB * 0.94, rB * zs);
    const neck = capsule(0, yB + rB * 0.8, 0, 0, yH, 0, rN), skull = sphere(0, yH, 0, rH);
    head = (x, y, z) => smin(neck(x, y, z), skull(x, y, z), 0.03);
  } else {
    belly = squashZ(roundCone(0, yB, 0, 0, yN, 0, rB, rN), zs);
    head = squashZ(roundCone(0, yN, 0, 0, yH, 0, rN, rH), zs);
  }
  if (coat) { const b0 = belly; belly = (x, y, z) => Math.max(b0(x, y, z), coat.hem - y); }
  if (loose) head = ellipsoid(loose[0], loose[1], loose[2], rH, rH * 0.96, rH * zs);
  const trunk = loose ? belly : (x, y, z) => smin(belly(x, y, z), head(x, y, z), k.ball ? 0.03 : 0.06);
  const garb = coat ? lin(coat.color) : null; // what the body and sleeves are made of
  const armL = roundCone(sx, sy, sz, hx, hy, hz, ar, ar * 0.88), armR = mirrorX(armL);
  const skin = (x, y, z) => smin(trunk(x, y, z), Math.min(armL(x, y, z), armR(x, y, z)), 0.045);

  // ---- skin: the trunk is one coarse piece; each arm is a finer piece that carries its own soft shoulder
  const bodyBox = pad([-rB, Math.min(yB - rB, coat ? coat.hem : 9), -rB * zs, rB, Math.max(yN + rN, loose || coat ? 0 : yH + rH), rB * zs], 0.03);
  const headBox = pad([ho[0] - rH, Math.min(yN, yH + ho[1] - rH) - (loose ? 0 : rN), ho[2] - rH, ho[0] + rH, yH + ho[1] + rH, ho[2] + rH], 0.03);
  if (!coat && !loose) out.push({ d: trunk, box: bodyBox, cell: c(0.04), mat: MAT.skin, color: col.skin, bones: [{ part: 0, d: belly }, { part: 1, d: head }], soft: 0.05 });
  else { // the body and the head are separate pieces: a coat with a head in its collar, or a head carried in a mitten
    out.push({ d: belly, box: bodyBox, cell: c(0.04), mat: coat ? MAT.cloth : MAT.skin, color: garb || col.skin, bone: 0 });
    out.push({ d: head, box: headBox, cell: c(0.03), mat: MAT.skin, color: col.skin, bone: 1 });
    if (loose) out.push({ d: ellipsoid(0, yN + rN * 0.55, 0, rN * 0.92, 0.035, rN * 0.92 * zs), box: pad([-rN, yN + rN * 0.4, -rN, rN, yN + rN * 0.8, rN], 0.04), cell: c(0.018), mat: MAT.cloth, color: lin(k.capColor || '#8a5a44'), bone: 0 });
  }
  if (k.face2) { const [fx, fy, fz, fr] = k.face2; out.push({ d: ellipsoid(fx, fy, fz, fr, fr * 0.95, fr * 0.9), box: pad([fx - fr, fy - fr, fz - fr, fx + fr, fy + fr, fz + fr], 0.03), cell: c(0.026), mat: MAT.skin, color: col.skin, bone: 0 }); }
  for (const s of [1, -1]) {
    const arm = s > 0 ? armL : armR, reach = roundCone(s * sx, sy, sz, s * hx, hy, hz, ar + 0.04, ar + 0.02);
    out.push({ d: (x, y, z) => Math.max(skin(x, y, z), reach(x, y, z)), box: pad([Math.min(s * sx, s * hx), Math.min(sy, hy), Math.min(sz, hz), Math.max(s * sx, s * hx), Math.max(sy, hy), Math.max(sz, hz)], ar + 0.07),
      cell: c(0.02), mat: coat ? MAT.cloth : MAT.skin, color: garb || col.skin, // whatever lies under the body's surface belongs to the body, or a raised arm would swing its hidden end out through the belly
      bones: [{ part: s > 0 ? 2 : 3, d: (x, y, z) => arm(x, y, z) + Math.max(0, -trunk(x, y, z)) * 5 }, { part: 0, d: (x, y, z) => trunk(x, y, z) + 0.02 }], soft: 0.035 });
  }

  // ---- mittens: a rounded paw, a thumb and a knitted cuff
  {
    const L = Math.hypot(hx - sx, hy - sy, hz - sz), dx = (hx - sx) / L, dy = (hy - sy) / L, dz = (hz - sz) / L;
    const paw = roundCone(hx + dx * mr * 0.1, hy + dy * mr * 0.1, hz + dz * mr * 0.1, hx + dx * mr * 1.05, hy + dy * mr * 1.05, hz + dz * mr * 1.05, mr * 0.8, mr);
    const thumb = sphere(hx + dx * mr * 0.35 - 0.25 * mr, hy + dy * mr * 0.35 + 0.25 * mr, hz + dz * mr * 0.35 + 0.85 * mr, mr * 0.42);
    const mitt = (x, y, z) => smin(paw(x, y, (z - hz) / 0.72 + hz) * 0.72, thumb(x, y, z), 0.02);
    const cuff = capsule(hx - dx * mr * 0.35, hy - dy * mr * 0.35, hz - dz * mr * 0.35, hx + dx * mr * 0.05, hy + dy * mr * 0.05, hz + dz * mr * 0.05, Math.max(mr * 0.62, ar + 0.012));
    const b = pad([hx, hy, hz, hx + dx * mr, hy + dy * mr, hz + dz * mr].map((v, i, a) => (i < 3 ? Math.min(v, a[i + 3]) : Math.max(v, a[i - 3]))), mr * 1.25);
    for (const s of [1, -1]) {
      const bb = s > 0 ? b : [-b[3], b[1], b[2], -b[0], b[4], b[5]], f = (d) => (s > 0 ? d : mirrorX(d));
      out.push({ d: f(mitt), box: bb, cell: c(0.02), mat: MAT.mitten, color: col.mitten, bone: s > 0 ? 2 : 3 });
      out.push({ d: f(cuff), box: bb, cell: c(0.02), mat: MAT.cuff, color: col.cuff || col.mitten.map((v) => v * 0.72), bone: s > 0 ? 2 : 3 });
    }
  }

  // ---- legs and boots
  {
    const [lx, ly, lr0, top] = k.leg, lr = Math.max(lr0, MIN_LIMB);
    const leg = capsule(lx, ly + 0.04, 0, lx, 0.06, 0, lr), shaft = roundCone(lx, top, 0, lx, lr * 1.2, 0, lr * 1.42, lr * 1.5), foot = ellipsoid(lx, lr * 1.15, lr * 1.5, lr * 1.75, lr * 1.25, lr * 2.9);
    const boot = (x, y, z) => Math.max(smin(shaft(x, y, z), foot(x, y, z), 0.02), -y, y - top);
    for (const s of [1, -1]) {
      const f = (d) => (s > 0 ? d : mirrorX(d)), x0 = s * lx - lr * 2.2, x1 = s * lx + lr * 2.2;
      out.push({ d: f(leg), box: [x0, top * 0.6, -lr * 2, x1, ly + 0.04 + lr * 1.5, lr * 2], cell: c(0.022), mat: MAT.leg, color: col.leg, bone: s > 0 ? 4 : 5 });
      out.push({ d: f(boot), box: [x0, -0.02, -lr * 2.4, x1, top + 0.02, lr * 4.8], cell: c(0.022), mat: MAT.boot, color: col.boot, bone: s > 0 ? 4 : 5 });
    }
  }

  // ---- scarf: primitives. Two wraps are tubes bent into rings; each tail is a ribbon laid on the belly. The
  // stitches and the fringe are paint (materials `scarf` and `fringe`); a torn scarf simply ends in a ragged edge.
  if (k.scarf) {
    const [ys, R, t, len] = k.scarf, torn = !!k.torn, TAU = Math.PI * 2;
    const tube = (R0, y0, r, amp, ph) => lathe(Array.from({ length: 7 }, (_, i) => [R0 + r * Math.cos((i / 7) * TAU), y0 + r * Math.sin((i / 7) * TAU)]), 16,
      { smooth: true, closed: true, zs, lift: (ring, a) => -amp * Math.sin(a * 2 + ph) });
    out.push({ mesh: merge(tube(R, ys, t, 0.012, 0.6), tube(R * 1.06, ys - t * 1.05, t * 0.9, -0.014, 2.2)), mat: MAT.scarf, color: col.scarf, bone: 0 });
    // where the belly's front surface is at (x, y); below the belly the cloth just hangs
    const front = (x, y, last) => {
      if (belly(x, y, 0) > 0.03) return last;
      let lo = 0, hi = rB * zs + 0.15;
      for (let n = 0; n < 16; n++) { const m = (lo + hi) / 2; if (belly(x, y, m) < 0.038) lo = m; else hi = m; }
      return lo;
    };
    const strip = (x0, w, yTop, yEnd, nRows, nCols, ragged, seed) => {
      const zc = new Array(nCols).fill(rB * zs);
      return ribbon(Array.from({ length: nRows }, (_, i) => Array.from({ length: nCols }, (_, j) => {
        const x = x0 - w + (2 * w * j) / (nCols - 1), jag = ragged && i === nRows - 1 ? 0.07 * noise3(j * 1.9 + seed, 0.5, 0.5) : 0;
        const y = yTop + ((yEnd - yTop) * i) / (nRows - 1) + jag;
        return [x, y, (zc[j] = front(x, y, zc[j]))];
      })), 0.028);
    };
    const tails = [[k.tail[0], len, 1]];
    if (k.tail[1] < 5) tails.push([k.tail[1], len * 0.82, 7]);
    for (const [x0, ln, seed] of tails) {
      const w = k.tail[2], top = ys - t * 0.4, end = ys - ln;
      if (torn) out.push({ mesh: strip(x0, w, top, end + 0.05, 7, 5, true, seed), mat: MAT.scarf, color: col.scarf, bone: 0 });
      else {
        out.push({ mesh: strip(x0, w, top, end + 0.055, 6, 3, false, seed), mat: MAT.scarf, color: col.scarf, bone: 0 });
        out.push({ mesh: strip(x0, w, end + 0.055, end, 2, 3, false, seed), mat: MAT.fringe, color: col.scarf, bone: 0 });
      }
    }
  }

  // ---- hat, worn a touch crooked. All primitives: a knitted dome or a felt crown with a crease, an optional
  // brim, and a band; only the pompom is sculpted (it is soft). Ribs, stitches and the patch are paint.
  if (k.hat) {
    const [hb, brim, cr, ch] = k.hat, [dome, bh, bp, pom] = k.hat2, parts = [], knit = dome > 0.5;
    const cz = Math.cos(0.07), sz = Math.sin(0.07), tiltF = (x, y, z) => [x * cz - y * sz, x * sz + y * cz, z], set = (m) => place(m, tiltF, ho[0], hb + ho[1], ho[2]);
    if (knit) parts.push(lathe([[cr, -0.012], ...Array.from({ length: 6 }, (_, i) => [Math.max(cr * Math.cos((i / 5) * Math.PI / 2), 0.001), ch * Math.sin((i / 5) * Math.PI / 2)])], 14, { smooth: true }));
    else { // a felt crown: slightly tapered, rounded shoulder, a crease pressed into the top from front to back
      const prof = [[cr * 0.99, -0.008], [cr * 0.97, ch * 0.5], [cr * 0.91, ch * 0.86], [cr * 0.76, ch], [cr * 0.42, ch - 0.01], [0.001, ch - 0.016]];
      parts.push(lathe(prof, 14, { smooth: true, lift: (ring, a) => (ring > 2 ? -0.035 * Math.exp(-(((prof[ring][0] * Math.sin(a)) / (cr * 0.36)) ** 2)) : 0) }));
    }
    if (brim > 0) { // one loop around the brim's cross-section; the sides curl up a little
      const prof = [[cr * 0.85, -0.012], [brim, -0.012], [brim + 0.007, -0.002], [brim, 0.008], [cr * 0.85, 0.008]];
      parts.push(lathe(prof, 16, { smooth: true, lift: (ring, a) => { const r = prof[ring][0], x = r * Math.sin(a), z = r * Math.cos(a); return 0.32 * x * x - 0.12 * z * z; } }));
    }
    out.push({ mesh: set(merge(...parts)), mat: knit ? MAT.knit : MAT.felt, color: col.hat, bone: 1 });
    const bandR = (knit ? cr * Math.sqrt(Math.max(1 - (bh * 0.5 / ch) ** 2, 0)) : cr * 0.97) + bp, y0 = 0.012, y1 = 0.012 + bh, rr = Math.min(bh * 0.3, 0.014);
    const frayed = k.torn ? (ring, a) => (ring < 2 ? 0.016 * noise3(a * 3.1 + 4, 0.5, 0.5) - 0.008 : 0) : undefined; // a moth-eaten lower edge
    out.push({ mesh: set(lathe([[bandR - 0.02, y0], [bandR, y0 + rr], [bandR, y1 - rr], [bandR - 0.02, y1]], 14, { smooth: true, lift: frayed })), mat: knit ? MAT.cuff : MAT.felt, color: col.band, bone: 1 });
    if (pom > 0) { const py = hb + ch + pom * 0.55, s = sphere(0, py, 0, pom), tilt = (d) => turned(d, 0, hb, 0, 0, 0, 0.07); out.push({ d: moved(tilt((x, y, z) => s(x, y, z) - 0.012 * noise3(x * 45, y * 45, z * 45)), ...ho), box: shift(pad([-pom, py - pom, -pom, pom, py + pom, pom], 0.035), ...ho), cell: c(0.02), mat: MAT.fluff, color: col.pom || col.hat, bone: 1 }); }
  }

  if (!k.face) { // the living have a little button of a nose
    const n = ellipsoid(0, yH - rH * 0.1, rH * zs * 0.98, rH * 0.17, rH * 0.15, rH * 0.24);
    out.push({ d: moved(n, ...ho), box: shift(pad([-rH * 0.2, yH - rH * 0.3, rH * zs * 0.7, rH * 0.2, yH + rH * 0.1, rH * zs * 1.25], 0.02), ...ho), cell: c(0.015), mat: MAT.nose, color: col.nose, bone: 1 });
  }
  if (k.hair) {
    const e = ellipsoid(0, yH - rH * 0.25, -0.012, rH + 0.034, rH * 1.35, (rH + 0.03) * zs);
    out.push({ d: moved((x, y, z) => Math.max(e(x, y, z), z - rH * 0.34), ...ho), box: shift(pad([-rH, yH - rH * 1.6, -rH * zs, rH, yH + rH * 1.1, rH * 0.4], 0.05), ...ho), cell: c(0.026), mat: MAT.hair, color: col.hair, bone: 1 });
    if (k.bun) { const b = sphere(0, yH + rH * 0.25, -rH * 1.05, rH * 0.42); out.push({ d: b, box: pad([-rH * 0.45, yH - rH * 0.2, -rH * 1.5, rH * 0.45, yH + rH * 0.7, -rH * 0.6], 0.03), cell: c(0.018), mat: MAT.hair, color: col.hair, bone: 1 }); }
  }

  // ---- the odd ones' extras
  if (k.shawl) { // a cloth over the shoulders with a scalloped edge, knotted in front
    const top = yN - 0.03, low = yN - 0.2;
    const cloth = (x, y, z) => Math.max(Math.abs(belly(x, y, z) - 0.034) - 0.022, y - top, low + 0.03 * Math.cos(Math.atan2(x, z) * 7) - y);
    const knot = sphere(0, top - 0.07, rN * zs + 0.075, 0.042);
    out.push({ d: (x, y, z) => Math.min(cloth(x, y, z), knot(x, y, z)), box: pad([-rB, low - 0.04, -rB * zs, rB, top, rB * zs + 0.06], 0.06), cell: c(0.02), mat: MAT.cloth, color: lin(k.shawl), bone: 0 });
  }
  // Hard, simple things are primitives: a few rings of a solid of revolution. Their planks, hoops and rivets are
  // paint (see the wood and iron materials in material.js), not geometry.
  if (k.barrel) { // what is left of a coffin, worn like a barrel: a bulging wall, a splintered rim, a short way in
    const { y0, y1, staves = 10 } = k.barrel, R = rB + 0.07, H = y1 - y0, seg = staves * 2;
    const jag = Array.from({ length: staves }, (_, i) => 0.14 * noise3(i * 1.7 + 3, 0.5, 0.5) - 0.04);
    const rim = (ring, a) => jag[Math.floor(((a / (Math.PI * 2)) * staves + 0.5) % staves)]; // each stave broke off at its own height
    const wall = lathe([0, 0.25, 0.5, 0.75, 1].map((t) => [R * (0.93 + 0.07 * Math.sin(Math.PI * t)), y0 + H * t]), seg, { smooth: true, zs, lift: (ring, a) => (ring === 4 ? rim(ring, a) : 0) });
    const top = lathe([[R * 0.93 - 0.04, y1], [R * 0.93, y1]], seg, { zs, lift: rim });
    const inside = lathe([[R * 0.93 - 0.04, y1 - 0.16], [R * 0.93 - 0.04, y1]], seg, { zs, flip: true, lift: (ring, a) => (ring === 1 ? rim(ring, a) : 0) });
    const floor = lathe([[0.001, y1 - 0.16], [R * 0.93 - 0.04, y1 - 0.16]], seg, { zs }), bottom = lathe([[0.001, y0], [R * 0.93, y0]], seg, { zs, flip: true });
    out.push({ mesh: merge(wall, top, inside, floor, bottom), mat: MAT.wood, color: lin(k.barrel.color || '#8a6238'), bone: 0 });
  }
  if (k.prop === 'pin') { // a rolling pin lying across the right mitten
    const pin = lathe([[0.001, -0.25], [0.015, -0.245], [0.017, -0.17], [0.04, -0.16], [0.044, 0], [0.04, 0.16], [0.017, 0.17], [0.015, 0.245], [0.001, 0.25]], 10, { smooth: true });
    out.push({ mesh: place(pin, (x, y, z) => [y, -x, z], -hx + 0.14, hy - 0.01, hz + mr * 1.2), mat: MAT.wood, color: lin('#b08a5a'), bone: 3 });
  }
  return out;
}

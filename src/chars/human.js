import { smin, sphere, ellipsoid, roundCone, capsule, turned, mirrorX, squashZ, noise3 } from './sdf.js';
import { lathe, merge, place, ribbon, revolve, ball, along } from './prims.js';

// A two-legged character as a list of pieces for the mesher, sculpted from the numbers of its look (see
// shared/crew.js for what each array means). Rest pose: feet on y = 0, facing +Z, +X is the character's left.
// Parts: 0 body, 1 head, 2 armL, 3 armR, 4 legL, 5 legR. Material ids are read by the character shader:
export const MAT = { skin: 1, scarf: 2, knit: 3, cuff: 4, mitten: 5, leg: 6, boot: 7, nose: 8, hair: 9, felt: 10, fluff: 11, fur: 12, wood: 13, tongue: 14, cloth: 15, iron: 16, fringe: 17 };

export const lin = (hex) => hex.slice(1).match(/../g).map((h) => { const c = parseInt(h, 16) / 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; });
const box2 = (x, y, hx, hy) => { const dx = Math.abs(x) - hx, dy = Math.abs(y) - hy; return Math.hypot(Math.max(dx, 0), Math.max(dy, 0)) + Math.min(Math.max(dx, dy), 0); };
const pad = (b, m) => [b[0] - m, b[1] - m, b[2] - m, b[3] + m, b[4] + m, b[5] + m];

const moved = (d, ox, oy, oz) => (x, y, z) => d(x - ox, y - oy, z - oz);
const shift = (b, ox, oy, oz) => [b[0] + ox, b[1] + oy, b[2] + oz, b[3] + ox, b[4] + oy, b[5] + oz];

// q: mesh detail, 1 = normal. Cells grow as q shrinks (phones).
// Optional extras in the look, used by the odder zombies:
//   ball        the belly is a ball and the head sits on a thin neck
//   coat        { color, hem }: the body is a long garment with sleeves, cut off flat at hem
//   headAt      [x, y, z]: the head is not on the shoulders but carried there (the neck gets a stitched cap)
//   face2       [x, y, z, r]: a second head peeking out of the body
//   shawl, bun  a cloth over the shoulders (paint), a knot of hair (a ball)
//   barrel      { y0, y1, staves }: a barrel around the belly (a primitive; staves, hoops and rivets are painted)
//   prop 'pin'  a rolling pin held in the right mitten like a club
export function humanPieces(k, q = 1) {
  const [yB, rB, yN, rN] = k.bean, [yH, rH, zs] = k.head, col = Object.fromEntries(Object.entries(k.colors).map(([n, h]) => [n, lin(h)]));
  const [sx, sy, sz] = k.shoulder, [hx, hy, hz] = k.hand, ar = k.arm[0], mr = k.arm[1], out = [], c = (v) => v / q;
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

  // ---- skin. The body and the head are solids of revolution and the arms are tubes: all primitives, so they are
  // smooth with a few hundred triangles. The formulas above are still used for bone weights and baked shading.
  const turn = (d, yMid, rings = 12) => revolve((r, y) => d(r, y, 0), yMid, rings, 18, { zs });
  if (!coat && !loose) out.push({ mesh: turn(trunk, yB, 14), occ: trunk, mat: MAT.skin, color: col.skin, bones: [{ part: 0, d: belly }, { part: 1, d: head }], soft: 0.05 });
  else { // the body and the head are separate pieces: a coat with a head in its collar, or a head carried in a mitten
    out.push({ mesh: turn(belly, yB), occ: belly, mat: coat ? MAT.cloth : MAT.skin, color: garb || col.skin, bone: 0 });
    out.push({ mesh: loose ? place(ball(rH, rH * 0.96, rH * zs, 12, 8), (x, y, z) => [x, y, z], ...loose) : turn(head, (yN + yH) / 2, 9), occ: head, mat: MAT.skin, color: col.skin, bone: 1 });
    // (the stitched patch over the empty neck is paint: see `uWrap` in material.js)
  }
  if (k.face2) { const [fx, fy, fz, fr] = k.face2; out.push({ mesh: place(ball(fr, fr * 0.95, fr * 0.9, 12, 8), (x, y, z) => [x, y, z], fx, fy, fz), mat: MAT.skin, color: col.skin, bone: 0 }); }
  // an arm is two tubes and a ball for the elbow: the upper arm follows its own bone (6 left, 7 right), which the
  // drawing code lays from the shoulder to wherever the forearm begins; the forearm, the elbow and the mitten are part 2 / 3
  const armLen = Math.hypot(hx - sx, hy - sy, hz - sz), half = armLen / 2;
  const upper = lathe([[0.001, -ar * 0.6], [ar * 0.75, -ar * 0.3], [ar, 0], [ar * 0.94, half]], 8, { smooth: true });
  const lower = lathe([[ar * 0.94, 0], [ar * 0.88, half]], 8, { smooth: true }), joint = ball(ar * 1.02, ar * 1.02, ar * 1.02, 8, 5);
  for (const s of [1, -1]) {
    const arm = s > 0 ? armL : armR, sh = [s * sx, sy, sz], ha = [s * hx, hy, hz], el = [(sh[0] + ha[0]) / 2, (sh[1] + ha[1]) / 2, (sh[2] + ha[2]) / 2];
    const paint = { mat: coat ? MAT.cloth : MAT.skin, color: garb || col.skin };
    out.push({ mesh: along(upper, sh, el), occ: arm, ...paint, bone: s > 0 ? 6 : 7 });
    out.push({ mesh: merge(along(lower, el, ha), place(joint, (x, y, z) => [x, y, z], ...el)), ...paint, bone: s > 0 ? 2 : 3 });
  }

  // ---- mittens: a rounded paw with a thumb (soft: sculpted) and a knitted cuff (a tube)
  {
    const L = Math.hypot(hx - sx, hy - sy, hz - sz), dx = (hx - sx) / L, dy = (hy - sy) / L, dz = (hz - sz) / L;
    const paw = roundCone(hx + dx * mr * 0.1, hy + dy * mr * 0.1, hz + dz * mr * 0.1, hx + dx * mr * 1.05, hy + dy * mr * 1.05, hz + dz * mr * 1.05, mr * 0.8, mr);
    const thumb = sphere(hx + dx * mr * 0.35 - 0.25 * mr, hy + dy * mr * 0.35 + 0.25 * mr, hz + dz * mr * 0.35 + 0.85 * mr, mr * 0.42);
    const mitt = (x, y, z) => smin(paw(x, y, (z - hz) / 0.72 + hz) * 0.72, thumb(x, y, z), 0.02);
    const rc = Math.max(mr * 0.66, ar + 0.014), cl = mr * 0.5, cuff = lathe([[rc * 0.78, 0], [rc, cl * 0.25], [rc, cl * 0.75], [rc * 0.78, cl]], 8, { smooth: true }); // a short ribbed tube
    const b = pad([hx, hy, hz, hx + dx * mr, hy + dy * mr, hz + dz * mr].map((v, i, a) => (i < 3 ? Math.min(v, a[i + 3]) : Math.max(v, a[i - 3]))), mr * 1.25);
    for (const s of [1, -1]) {
      const bb = s > 0 ? b : [-b[3], b[1], b[2], -b[0], b[4], b[5]], f = (d) => (s > 0 ? d : mirrorX(d));
      out.push({ d: f(mitt), box: bb, cell: c(0.02), mat: MAT.mitten, color: col.mitten, bone: s > 0 ? 2 : 3 });
      out.push({ mesh: along(cuff, [s * (hx - dx * mr * 0.42), hy - dy * mr * 0.42, hz - dz * mr * 0.42], [s * hx, hy, hz]), mat: MAT.cuff, color: col.cuff || col.mitten.map((v) => v * 0.72), bone: s > 0 ? 2 : 3 });
    }
  }

  // ---- legs (plain tubes) and boots (soft: sculpted)
  {
    const [lx, ly, lr, top] = k.leg;
    const leg = lathe([[0.001, 0.045], [lr, 0.06], [lr, ly + 0.04], [0.001, ly + 0.06]], 8, { smooth: true }), shaft = roundCone(lx, top, 0, lx, lr * 1.2, 0, lr * 1.42, lr * 1.5), foot = ellipsoid(lx, lr * 1.15, lr * 1.5, lr * 1.75, lr * 1.25, lr * 2.9);
    const boot = (x, y, z) => Math.max(smin(shaft(x, y, z), foot(x, y, z), 0.02), -y, y - top);
    for (const s of [1, -1]) {
      const f = (d) => (s > 0 ? d : mirrorX(d)), x0 = s * lx - lr * 2.2, x1 = s * lx + lr * 2.2;
      out.push({ mesh: place(leg, (x, y, z) => [x, y, z], s * lx, 0, 0), mat: MAT.leg, color: col.leg, bone: s > 0 ? 4 : 5 });
      out.push({ d: f(boot), box: [x0, -0.02, -lr * 2.4, x1, top + 0.02, lr * 4.8], cell: c(0.022), mat: MAT.boot, color: col.boot, bone: s > 0 ? 4 : 5 });
    }
  }

  // ---- scarf: primitives. Two wraps are tubes bent into rings; each tail is a ribbon laid on the belly. The
  // stitches and the fringe are paint (materials `scarf` and `fringe`); a torn scarf simply ends in a ragged edge.
  if (k.scarf) {
    const [ys, R, t, len] = k.scarf, torn = !!k.torn, TAU = Math.PI * 2;
    const tube = (R0, y0, r, amp, ph) => lathe(Array.from({ length: 7 }, (_, i) => [R0 + r * Math.cos((i / 7) * TAU), y0 + r * Math.sin((i / 7) * TAU)]), 16,
      { smooth: true, closed: true, zs, lift: (ring, a) => -amp * Math.sin(a * 2 + ph) });
    out.push({ mesh: merge(tube(R, ys, t, 0.012, 0.6), tube(R * 1.06, ys - t * 1.05, t * 0.9, -0.014, 2.2)), occ: (x, y, z) => Math.hypot(Math.hypot(x, z / zs) - R * 1.03, y - ys + t * 0.5) - t * 1.5,
      mat: MAT.scarf, color: col.scarf, bone: 0 });
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
    const shade = ellipsoid(ho[0], hb + ho[1], ho[2], Math.max(cr, brim), knit ? ch : 0.03, Math.max(cr, brim)); // the hat darkens the brow under it
    out.push({ mesh: set(merge(...parts)), occ: (x, y, z) => Math.max(shade(x, y, z), hb + ho[1] - 0.02 - y), mat: knit ? MAT.knit : MAT.felt, color: col.hat, bone: 1 });
    const bandR = (knit ? cr * Math.sqrt(Math.max(1 - (bh * 0.5 / ch) ** 2, 0)) : cr * 0.97) + bp, y0 = 0.012, y1 = 0.012 + bh, rr = Math.min(bh * 0.3, 0.014);
    const frayed = k.torn ? (ring, a) => (ring < 2 ? 0.016 * noise3(a * 3.1 + 4, 0.5, 0.5) - 0.008 : 0) : undefined; // a moth-eaten lower edge
    if (knit) out.push({ mesh: set(lathe([[bandR - 0.02, y0], [bandR, y0 + rr], [bandR, y1 - rr], [bandR - 0.02, y1]], 14, { smooth: true, lift: frayed })), mat: knit ? MAT.cuff : MAT.felt, color: col.band, bone: 1 }); // a felt hat's ribbon is paint (`uBand`)
    if (pom > 0) out.push({ mesh: set(place(ball(pom, pom, pom, 10, 6), (x, y, z) => [x, y, z], 0, ch + pom * 0.55, 0)), mat: MAT.fluff, color: col.pom || col.hat, bone: 1 }); // the fluff is paint
  }

  if (!k.face) { // the living have a little button of a nose
    out.push({ mesh: place(ball(rH * 0.17, rH * 0.15, rH * 0.24, 8, 5), (x, y, z) => [x, y, z], ho[0], yH - rH * 0.1 + ho[1], rH * zs * 0.98 + ho[2]), mat: MAT.nose, color: col.nose, bone: 1 });
  }
  // Hair and a shawl are paint on the head and the shoulders (`uHair`, `uWrap` in material.js): they lie flat on
  // the body, so modeling them would only add triangles. A bun sticks out, so it is a small ball.
  if (k.hair && k.bun) out.push({ mesh: place(ball(rH * 0.42, rH * 0.42, rH * 0.42, 8, 5), (x, y, z) => [x, y, z], 0, yH + rH * 0.25, -rH * 1.05), mat: MAT.hair, color: col.hair, bone: 1 });

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
  if (k.prop === 'pin') { // a rolling pin gripped by one handle like a club: a straight extension of the right arm
    const pin = lathe([[0.001, -0.04], [0.015, -0.035], [0.017, 0.04], [0.04, 0.05], [0.044, 0.21], [0.04, 0.37], [0.017, 0.38], [0.015, 0.455], [0.001, 0.46]], 10, { smooth: true });
    const L = Math.hypot(hx - sx, hy - sy, hz - sz), d = [(sx - hx) / L, (hy - sy) / L, (hz - sz) / L], grip = [-hx + d[0] * mr * 0.5, hy + d[1] * mr * 0.5, hz + d[2] * mr * 0.5];
    out.push({ mesh: along(pin, grip, [grip[0] + d[0], grip[1] + d[1], grip[2] + d[2]]), mat: MAT.wood, color: lin('#b08a5a'), bone: 3 });
  }
  return out;
}

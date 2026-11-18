import { smin, sphere, ellipsoid, roundCone, capsule, cylinder, turned, mirrorX, squashZ, noise3 } from './sdf.js';

// A two-legged character as a list of pieces for the mesher, sculpted from the numbers of its look (see
// shared/crew.js for what each array means). Rest pose: feet on y = 0, facing +Z, +X is the character's left.
// Parts: 0 body, 1 head, 2 armL, 3 armR, 4 legL, 5 legR. Material ids are read by the character shader:
export const MAT = { skin: 1, scarf: 2, knit: 3, cuff: 4, mitten: 5, leg: 6, boot: 7, nose: 8, hair: 9, felt: 10, fluff: 11, fur: 12, wood: 13, tongue: 14, cloth: 15, iron: 16 };

export const lin = (hex) => hex.slice(1).match(/../g).map((h) => { const c = parseInt(h, 16) / 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; });
const box2 = (x, y, hx, hy) => { const dx = Math.abs(x) - hx, dy = Math.abs(y) - hy; return Math.hypot(Math.max(dx, 0), Math.max(dy, 0)) + Math.min(Math.max(dx, dy), 0); };
const pad = (b, m) => [b[0] - m, b[1] - m, b[2] - m, b[3] + m, b[4] + m, b[5] + m];
const MIN_LIMB = 0.03;  // thinner limbs than this fall between the mesher's cells

// q: mesh detail, 1 = normal. Cells grow as q shrinks (phones).
export function humanPieces(k, q = 1) {
  const [yB, rB, yN, rN] = k.bean, [yH, rH, zs] = k.head, col = Object.fromEntries(Object.entries(k.colors).map(([n, h]) => [n, lin(h)]));
  const [sx, sy, sz] = k.shoulder, [hx, hy, hz] = k.hand, ar = Math.max(k.arm[0], MIN_LIMB), mr = k.arm[1], out = [], c = (v) => v / q;
  const belly = squashZ(roundCone(0, yB, 0, 0, yN, 0, rB, rN), zs), head = squashZ(roundCone(0, yN, 0, 0, yH, 0, rN, rH), zs);
  const trunk = (x, y, z) => smin(belly(x, y, z), head(x, y, z), 0.06);
  const armL = roundCone(sx, sy, sz, hx, hy, hz, ar, ar * 0.88), armR = mirrorX(armL);
  const skin = (x, y, z) => smin(trunk(x, y, z), Math.min(armL(x, y, z), armR(x, y, z)), 0.045);

  // ---- skin: the trunk is one coarse piece; each arm is a finer piece that carries its own soft shoulder
  out.push({ d: trunk, box: pad([-rB, yB - rB, -rB * zs, rB, yH + rH, rB * zs], 0.03), cell: c(0.04), mat: MAT.skin, color: col.skin, bones: [{ part: 0, d: belly }, { part: 1, d: head }], soft: 0.05 });
  for (const s of [1, -1]) {
    const arm = s > 0 ? armL : armR, reach = roundCone(s * sx, sy, sz, s * hx, hy, hz, ar + 0.04, ar + 0.02);
    out.push({ d: (x, y, z) => Math.max(skin(x, y, z), reach(x, y, z)), box: pad([Math.min(s * sx, s * hx), Math.min(sy, hy), Math.min(sz, hz), Math.max(s * sx, s * hx), Math.max(sy, hy), Math.max(sz, hz)], ar + 0.07),
      cell: c(0.02), mat: MAT.skin, color: col.skin, // whatever lies under the body's surface belongs to the body, or a raised arm would swing its hidden end out through the belly
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

  // ---- scarf: two loose wraps and one or two tails lying on the belly; torn ones are ragged and have lost a bite
  if (k.scarf) {
    const [ys, R, t, len] = k.scarf, torn = !!k.torn;
    const wraps = (x, y, z) => {
      const qz = z / zs, rr = Math.hypot(x, qz), ang = Math.atan2(x, qz), qy = y - ys;
      const r1 = Math.hypot(rr - R, qy + 0.012 * Math.sin(ang * 2 + 0.6)) - t, r2 = Math.hypot(rr - R * 1.06, qy + t * 1.05 - 0.014 * Math.sin(ang * 2 + 2.2)) - t * 0.9;
      let d = (smin(r1, r2, 0.012) + 0.0035 * Math.sin(ang * 11 + qy * 45)) * zs;
      if (torn) d = Math.max(d, -(Math.hypot(x + R * 0.7, qy - t * 0.6, z - R * 0.7) - t * 0.9)); // a bite out of the upper wrap
      return d;
    };
    out.push({ d: wraps, box: pad([-R, ys - t * 2.2, -R * zs, R, ys + t, R * zs], t + 0.03), cell: c(0.026), mat: MAT.scarf, color: col.scarf, bone: 0 });
    const tail = (x0, ln, seed) => (x, y, z) => {
      const rx = x - x0, ry = y - (ys - ln * 0.5), w = k.tail[2];
      let dr = box2(rx, ry, w, ln * 0.5);
      if (torn) dr = Math.max(dr, (ys - ln + 0.05 + 0.07 * noise3(x * 38 + seed, 1.5, 0.5)) - y); // a ragged, shorter end
      else if (ry < -ln * 0.5 + 0.06) dr = Math.max(dr, (Math.abs(((rx / 0.046) % 1 + 1) % 1 - 0.5) - 0.3) * 0.046); // fringe
      return Math.max(Math.abs(belly(x, y, z) - 0.026) - 0.016, dr, -z);
    };
    const tails = [[k.tail[0], len, 1]];
    if (k.tail[1] < 5) tails.push([k.tail[1], len * 0.82, 7]);
    for (const [x0, ln, seed] of tails) out.push({ d: tail(x0, ln, seed), box: [x0 - k.tail[2] - 0.02, ys - ln - 0.02, 0, x0 + k.tail[2] + 0.02, ys + 0.02, rB * zs + 0.07], cell: c(0.013), mat: MAT.scarf, color: col.scarf, bone: 0 });
  }

  // ---- hat, worn a touch crooked: a knitted dome or a felt cylinder, an optional brim, a band and a pompom
  if (k.hat) {
    const [hb, brim, cr, ch] = k.hat, [dome, bh, bp, pom] = k.hat2, tilt = (d) => turned(d, 0, hb, 0, 0, 0, 0.07);
    let crown;
    if (dome > 0.5) { const e = ellipsoid(0, hb, 0, cr, ch, cr); crown = (x, y, z) => Math.max(e(x, y, z), hb - y); }
    else {
      const pinch = ellipsoid(0, hb + ch + 0.035, 0, cr * 0.42, 0.075, cr * 1.3);
      crown = (x, y, z) => { const kk = 1 - 0.14 * Math.min(1, Math.max(0, (y - hb) / ch)), dx = Math.hypot(x, z) / kk - cr + 0.035, dy = Math.abs(y - hb - ch * 0.5) - ch * 0.5 + 0.035;
        return Math.max((Math.min(Math.max(dx, dy), 0) + Math.hypot(Math.max(dx, 0), Math.max(dy, 0)) - 0.035) * kk, -pinch(x, y, z)); };
    }
    let hat = crown;
    if (brim > 0) { const disc = (x, y, z) => { const yy = y - hb - 0.32 * x * x + 0.12 * z * z, dx = Math.hypot(x, z) - brim + 0.014, dy = Math.abs(yy) - 0.006; return Math.min(Math.max(dx, dy), 0) + Math.hypot(Math.max(dx, 0), Math.max(dy, 0)) - 0.016; }; const c0 = crown; hat = (x, y, z) => smin(c0(x, y, z), disc(x, y, z), 0.025); }
    if (k.torn) { const h0 = hat, bite = sphere(cr * 0.75, hb + ch * 0.35, cr * 0.6, ch * 0.3); hat = (x, y, z) => Math.max(h0(x, y, z), -bite(x, y, z)); } // moth-eaten
    const w = Math.max(cr, brim) + 0.03;
    out.push({ d: tilt(hat), box: [-w, hb - 0.05, -w, w, hb + ch + 0.06, w], cell: c(brim > 0 ? 0.02 : 0.024), mat: dome > 0.5 ? MAT.knit : MAT.felt, color: col.hat, bone: 1 });
    const bandR = (dome > 0.5 ? cr * Math.sqrt(Math.max(1 - (bh * 0.5 / ch) ** 2, 0)) : cr * 0.97) + bp;
    out.push({ d: tilt(cylinder(0, hb + bh * 0.5 + 0.012, 0, bandR, bh * 0.5, Math.min(bh * 0.45, bp + 0.008))), box: [-bandR - 0.03, hb - 0.03, -bandR - 0.03, bandR + 0.03, hb + bh + 0.05, bandR + 0.03],
      cell: c(0.024), mat: dome > 0.5 ? MAT.cuff : MAT.felt, color: col.band, bone: 1 });
    if (pom > 0) { const py = hb + ch + pom * 0.55, s = sphere(0, py, 0, pom); out.push({ d: tilt((x, y, z) => s(x, y, z) - 0.012 * noise3(x * 45, y * 45, z * 45)), box: pad([-pom, py - pom, -pom, pom, py + pom, pom], 0.035), cell: c(0.02), mat: MAT.fluff, color: col.pom || col.hat, bone: 1 }); }
  }

  if (!k.face) { // the living have a little button of a nose
    const n = ellipsoid(0, yH - rH * 0.1, rH * zs * 0.98, rH * 0.17, rH * 0.15, rH * 0.24);
    out.push({ d: n, box: pad([-rH * 0.2, yH - rH * 0.3, rH * zs * 0.7, rH * 0.2, yH + rH * 0.1, rH * zs * 1.25], 0.02), cell: c(0.015), mat: MAT.nose, color: col.nose, bone: 1 });
  }
  if (k.hair) {
    const e = ellipsoid(0, yH - rH * 0.25, -0.012, rH + 0.034, rH * 1.35, (rH + 0.03) * zs);
    out.push({ d: (x, y, z) => Math.max(e(x, y, z), z - rH * 0.34), box: pad([-rH, yH - rH * 1.6, -rH * zs, rH, yH + rH * 1.1, rH * 0.4], 0.05), cell: c(0.026), mat: MAT.hair, color: col.hair, bone: 1 });
  }
  return out;
}

// Five simplified puppets for the bot team, each made of six rigid parts (body, head, two arms, two legs)
// joined by five joints (neck, shoulders, hips). Rest pose: feet on y = 0, facing +Z, +X is the puppet's left.
// `rig` gives the physics and animation skeleton; `paint` sculpts the look out of brush-dab splats, part by part:
// bodies are drawn by their silhouette (loft), cloth is cut from sheets with torn hems, limbs are bent tubes.
// Shapes follow the team's concept sheets; they are original designs, not copies of existing characters.

const INK = '#17111f', COAL = '#2a2136', NIGHT = '#272033', BONE = '#d8d2dc', GOLD = '#c9913a', AMBER = '#ffc46b';
const TAU = Math.PI * 2, FRONT = Math.PI / 2;
const frac = (x) => x - Math.floor(x);
const tri = (x) => Math.abs(2 * frac(x) - 1); // 0..1 triangle wave: sharp folds
// stripes around a loft or tube (u), along it (v), or by height
const stripeU = (a, b, n, off = 0) => (l, nn, u) => (Math.floor(u * n + off) % 2 ? a : b);
const stripeV = (a, b, n) => (l, nn, u, v) => (Math.floor(v * n) % 2 ? a : b);
// chalk pinstripes: a second pass of thin vertical strokes just outside a loft or tube (grow = [index, ...] of the radii to pad)
function pinstripes(b, shape, o, n, color) {
  const pad = (r) => (Array.isArray(r) ? r.map(pad) : r + 0.004);
  const grown = shape === 'loft' ? { st: o.st.map((q) => [q[0], q[1] + 0.004, (q[2] ?? q[1]) + 0.004, q[3] || 0, q[4] || 0, q[5]]) } : { r: pad(o.r) };
  b[shape]({ ...o, ...grown, color, size: 0.0065, along: 'v', ink: 0, top: false, bottom: false, cap: false, keep: (l, nn, u, v) => frac(u * n + 0.5) < 0.1 && (!o.keep || o.keep(l, nn, u, v)) });
}
// sharp cloth folds that open up toward the hem (v = 0 is the hem of a loft)
const folds = (n, depth, phase = 0, pow = 1.5) => (th, v) => depth * (1 - v) ** pow * (tri((th / TAU) * n + phase) - 0.5);
// run a painter for the left (s = 1) and right (s = -1) side
const sides = (fn) => { fn(1); fn(-1); };
// a thin painted line (mouths, stitches, brows)
function line(b, pts, r, color, size = 0.007) {
  for (let i = 0; i < pts.length - 1; i++) b.capsule({ a: pts[i], b: pts[i + 1], ra: r, color, size, density: 1.4, flat: true });
}
const dot = (b, x, y, z, rx, ry, color = INK) => b.ellipsoid({ c: [x, y, z], r: [rx, ry, 0.012], color, size: 0.008, density: 1.5, flat: true });
const glint = (b, x, y, z, r = 0.008) => b.ellipsoid({ c: [x, y, z], r: [r, r, r * 0.6], color: '#fff8e8', size: 0.005, density: 2, emissive: 1, flat: true });

// a hanging mitten below the wrist point w: narrow wrist, broad knuckles, a thumb that points forward and inward
function mitten(b, s, [x, y, z], k, color) {
  b.tube({
    pts: [[x, y, z], [x + s * 0.012 * k, y - 0.06 * k, z + 0.005], [x + s * 0.016 * k, y - 0.13 * k, z + 0.012], [x + s * 0.008 * k, y - 0.178 * k, z + 0.02]],
    r: [[0.05 * k, 0.042 * k], [0.084 * k, 0.06 * k], [0.088 * k, 0.062 * k], [0.052 * k, 0.04 * k]], color, size: 0.015,
  });
  b.tube({
    pts: [[x - s * 0.045 * k, y - 0.045 * k, z + 0.03 * k], [x - s * 0.085 * k, y - 0.08 * k, z + 0.06 * k], [x - s * 0.088 * k, y - 0.125 * k, z + 0.072 * k]],
    r: [0.031 * k, 0.031 * k, 0.022 * k], color, size: 0.011,
  });
}
// a chunky boot standing on y = 0 with its toe toward +Z. o: { k scale, top shaft height, color, toe, cuff }
function boot(b, x, o) {
  const k = o.k || 1, toe = o.toe || o.color;
  b.loft({ st: [[0.05, 0.078 * k, 0.088 * k, x, -0.02 * k], [0.13, 0.074 * k, 0.082 * k, x, -0.024 * k], [o.top, 0.088 * k, 0.094 * k, x, -0.024 * k]], n: 2.7, color: o.color, size: 0.015, top: true });
  b.tube({
    pts: [[x, 0.066 * k, -0.095 * k], [x, 0.064 * k, 0.03 * k], [x, 0.076 * k, 0.135 * k], [x, 0.066 * k, 0.2 * k]],
    r: [[0.076 * k, 0.064 * k], [0.084 * k, 0.064 * k], [0.106 * k, 0.076 * k], [0.086 * k, 0.062 * k]], up: [0, 1, 0], n: 2.5, size: 0.015,
    color: (l) => (l.y < 0.022 * k ? INK : l.z > 0.105 * k ? toe : o.color),
  });
  if (o.cuff) b.loft({ st: [[o.top - 0.065, 0.104 * k, 0.11 * k, x, -0.024 * k], [o.top + 0.012, 0.098 * k, 0.104 * k, x, -0.024 * k]], n: 2.7, color: o.cuff, size: 0.014 });
}
// a hat: curled brim, crown drawn by stations from the brim up, a band. o: { c, rot, brim: [rx, rz], curl, crown, n, color, band }
function hat(b, o) {
  const [rx, rz] = o.brim, r0 = 0.45, curl = o.curl ?? 0.04;
  b.surf({
    c: o.c, rot: o.rot, color: o.color, size: 0.016, grid: [40, 6], along: 'u',
    f: (u, v, out) => {
      const th = u * TAU, r = r0 + (1 - r0) * v, cs = Math.cos(th), sn = Math.sin(th);
      // the sides curl up, the front and back droop a little, with a crooked wobble
      return out.set(cs * rx * r, v * v * (curl * cs * cs - curl * 0.5 * sn * sn + (o.wobble ?? 0.012) * Math.sin(th * 3 + 1)), sn * rz * r);
    },
    edge: (u, v) => (1 - v) * (1 - r0) * Math.min(rx, rz),
  });
  b.loft({ c: o.c, rot: o.rot, st: o.crown, n: o.n ?? 2.5, smooth: false, top: true, color: o.color, size: 0.017 });
  const [c0, c1] = o.crown;
  const k = Math.min(1, 0.062 / (c1[0] - c0[0])), mix = (i) => c0[i] + ((c1[i] ?? 0) - (c0[i] ?? 0)) * k || 0;
  b.loft({ c: o.c, rot: o.rot, st: [[c0[0] + 0.004, c0[1] + 0.007, (c0[2] ?? c0[1]) + 0.007, c0[3] || 0, c0[4] || 0], [mix(0), mix(1) + 0.007, mix(2) + 0.007, mix(3), mix(4)]], n: o.n ?? 2.5, color: o.band, size: 0.012 });
}
// a square buckle frame standing in the XY plane
const buckle = (b, c, r, rot) => b.sheet({ c, rot, pts: [[-r, -r * 0.8], [r, -r * 0.8], [r, r * 0.8], [-r, r * 0.8]], keep: (l) => Math.max(Math.abs(l.x), Math.abs(l.y) * 1.25) > r * 0.5, color: GOLD, size: 0.007, ink: 0, density: 1.6 });
// a striped scarf wound around the neck: a ring of radius [rx, rz] at height y
function scarfRing(b, y, rx, rz, r, color, tilt = 0.03) {
  const pts = [];
  for (let i = -1; i <= 9; i++) { const a = (i / 8) * TAU + 0.4; pts.push([Math.cos(a) * rx, y + Math.sin(a) * tilt, Math.sin(a) * rz]); }
  b.tube({ pts, r, up: [0, 1, 0], color, size: 0.013, cap: false, grid: [14, 64] });
}
// a flat scarf tail along a path, with a fringe at the end
function scarfTail(b, pts, w, color, fringe) {
  b.tube({ pts, r: [[w, 0.014]], color, size: 0.012, n: 3, cap: 'flat' });
  const [e, p] = [pts[pts.length - 1], pts[pts.length - 2]], d = [e[0] - p[0], e[1] - p[1], e[2] - p[2]], L = Math.hypot(...d);
  for (let i = -2; i <= 2; i++) {
    const x = (i / 2) * w * 0.85, k = 0.05 + ((i * 7 + 13) % 5) * 0.006;
    b.capsule({ a: [e[0] + x, e[1], e[2]], b: [e[0] + x + (d[0] / L) * k, e[1] + (d[1] / L) * k, e[2] + (d[2] / L) * k], ra: 0.006, color: fringe, size: 0.006, density: 1.4, flat: true });
  }
}

export const PUPPETS = [
  {
    name: 'Mortimer', role: 'foreman', color: GOLD,
    rig: {
      body: { c: [0, 0.66, 0], r: [0.33, 0.36, 0.29] }, head: { c: [0, 1.25, 0], r: 0.19 }, neck: [0, 1.06, 0],
      shoulder: [0.27, 0.93, 0], hand: [0.44, 0.47, 0.03], armR: 0.07, hip: [0.13, 0.3, 0], legR: 0.09,
    },
    paint(b, P) {
      const body = '#44325a', cape = '#241c30', plum = '#3d2c52', scarf = stripeV(GOLD, plum, 15);
      b.part(P.body);
      // a pear: narrow sloping shoulders, the belly sags low
      b.loft({ st: [[0.265, 0.17, 0.16], [0.32, 0.31, 0.27], [0.45, 0.375, 0.32, 0, 0.012], [0.6, 0.36, 0.31, 0, 0.012], [0.76, 0.28, 0.25], [0.9, 0.19, 0.18], [1.03, 0.11, 0.11]], bottom: true, color: body });
      // shoulder cape: flares out past the body into torn points
      b.loft({ st: [[0.71, 0.5, 0.4], [0.9, 0.34, 0.285], [1.05, 0.13, 0.12]], smooth: false, n: 2.5, hem: { teeth: 9, depth: 0.17, seed: 1 }, pleat: folds(9, 0.12, 0.5), color: cape, size: 0.017 });
      scarfRing(b, 1.08, 0.165, 0.15, [0.05, 0.062], scarf);
      scarfTail(b, [[0.07, 1.05, 0.17], [0.115, 0.93, 0.25], [0.125, 0.79, 0.315], [0.13, 0.65, 0.335]], 0.058, stripeV(GOLD, plum, 9), GOLD);
      b.part(P.head);
      b.ellipsoid({ c: [0, 1.25, 0], r: [0.205, 0.185, 0.19], color: BONE });
      sides((s) => {
        dot(b, s * 0.07, 1.27, 0.178, 0.02, 0.026);
        glint(b, s * 0.064, 1.279, 0.19);
        line(b, [[s * 0.028, 1.325, 0.18], [s * 0.1, 1.305, 0.163]], 0.007, INK); // worried brows
        b.tube({ pts: [[0, 1.207, 0.192], [s * 0.05, 1.192, 0.186], [s * 0.092, 1.206, 0.166], [s * 0.108, 1.234, 0.15]], r: [0.017, 0.016, 0.01, 0.004], color: INK, size: 0.008 }); // handlebar mustache
      });
      line(b, [[-0.022, 1.168, 0.186], [0, 1.175, 0.19], [0.022, 1.168, 0.186]], 0.006, INK);
      hat(b, {
        c: [0, 1.39, 0], rot: [0.05, 0, 0.09], brim: [0.3, 0.27], curl: 0.045, color: COAL, band: GOLD, n: 2.4,
        crown: [[0, 0.152, 0.142], [0.075, 0.14, 0.13], [0.2, 0.122, 0.116, 0.012], [0.3, 0.15, 0.14, 0.045], [0.4, 0.192, 0.176, 0.028]],
      });
      line(b, [[0.07, 1.58, 0.128], [0.03, 1.64, 0.125], [0.085, 1.69, 0.14]], 0.005, INK); // a crease in the crown
      sides((s) => {
        b.part(s > 0 ? P.armL : P.armR);
        b.tube({ pts: [[s * 0.27, 0.95, 0], [s * 0.375, 0.8, 0.01], [s * 0.428, 0.62, 0.02]], r: [0.06, 0.068, 0.062], color: BONE, size: 0.017 });
        mitten(b, s, [s * 0.432, 0.615, 0.02], 1.15, COAL);
        b.part(s > 0 ? P.legL : P.legR);
        b.tube({ pts: [[s * 0.13, 0.32, 0], [s * 0.13, 0.19, 0]], r: 0.048, color: BONE, size: 0.015, cap: false });
        boot(b, s * 0.13, { k: 1.12, top: 0.215, color: COAL });
      });
    },
  },
  {
    name: 'Peg', role: 'jointed puppet', color: '#d9912f',
    rig: {
      body: { c: [0, 0.8, 0], r: [0.2, 0.3, 0.17] }, head: { c: [0, 1.3, 0], r: 0.2 }, neck: [0, 1.09, 0],
      shoulder: [0.255, 0.98, 0], hand: [0.37, 0.5, 0.02], armR: 0.075, hip: [0.12, 0.5, 0], legR: 0.09,
    },
    paint(b, P) {
      const wood = '#8d8696', dark = '#7b7486', orange = '#d9912f', joint = '#e0a030', band = '#33273f', lilac = '#5c4a78';
      const grain = (l, n, u) => (Math.sin(u * 70 + Math.sin(l.y * 9) * 2) > 0.72 ? dark : wood);
      b.part(P.body);
      // a turned wooden skittle: hips, a pinched waist, a chest, a neck peg
      b.loft({ st: [[0.47, 0.1, 0.09], [0.53, 0.2, 0.165], [0.64, 0.235, 0.19], [0.78, 0.168, 0.148], [0.9, 0.208, 0.172], [1.0, 0.19, 0.16], [1.065, 0.09, 0.085]], top: true, bottom: true, n: 2.2, color: grain });
      b.loft({ st: [[1.055, 0.047], [1.13, 0.04]], color: dark, size: 0.012 });
      line(b, [[-0.05, 0.885, 0.166], [0.05, 0.945, 0.16]], 0.011, '#4a3a66', 0.008);
      line(b, [[0.05, 0.885, 0.166], [-0.05, 0.945, 0.16]], 0.011, '#4a3a66', 0.008);
      scarfRing(b, 1.1, 0.165, 0.15, [0.055, 0.062], stripeV(lilac, band, 15));
      scarfTail(b, [[0.1, 1.07, 0.14], [0.135, 0.98, 0.185], [0.14, 0.87, 0.19], [0.15, 0.78, 0.175]], 0.05, stripeV(lilac, band, 8), lilac);
      scarfTail(b, [[0.12, 1.09, 0.1], [0.24, 1.07, 0.06], [0.34, 1.11, 0.0], [0.44, 1.08, -0.05]], 0.05, stripeV(lilac, band, 8), lilac); // caught by the wind
      b.part(P.head);
      b.ellipsoid({ c: [0, 1.3, 0], r: [0.212, 0.2, 0.2], color: '#a19baa' });
      sides((s) => {
        b.ellipsoid({ c: [s * 0.125, 1.245, 0.155], r: [0.04, 0.03, 0.015], color: '#cf8f8c', size: 0.012, alpha: 0.7 });
        dot(b, s * 0.075, 1.308, 0.19, 0.034, 0.03, '#3c3352');
        b.ellipsoid({ c: [s * 0.075, 1.326, 0.197], r: [0.042, 0.02, 0.012], rot: [0, 0, s * -0.25], color: '#7d7590', size: 0.008, density: 1.5, flat: true }); // heavy eyelids
        line(b, [[s * 0.03, 1.365, 0.19], [s * 0.11, 1.345, 0.168]], 0.006, '#5e566c');
      });
      line(b, [[-0.03, 1.218, 0.2], [0, 1.232, 0.206], [0.03, 1.218, 0.2]], 0.006, INK);
      hat(b, { c: [0, 1.478, 0], rot: [0, 0, 0.13], brim: [0.275, 0.25], curl: 0.03, color: NIGHT, band: lilac, crown: [[0, 0.16, 0.15], [0.1, 0.15, 0.14], [0.225, 0.178, 0.166]] });
      buckle(b, [0.004, 1.512, 0.162], 0.034);
      line(b, [[0.262, 1.505, 0.02], [0.266, 1.452, 0.02]], 0.005, INK); // a little lantern hangs off the brim
      b.frustum({ c: [0.266, 1.445, 0.02], r0: 0.032, r1: 0.008, h: 0.025, color: COAL, size: 0.008 });
      b.ellipsoid({ c: [0.266, 1.405, 0.02], r: [0.026, 0.034, 0.026], color: AMBER, emissive: 1, size: 0.01, density: 2 });
      b.frustum({ c: [0.266, 1.368, 0.02], r0: 0.02, r1: 0.03, h: 0.014, color: COAL, size: 0.008, bottom: true });
      sides((s) => {
        b.part(s > 0 ? P.armL : P.armR);
        b.ellipsoid({ c: [s * 0.25, 0.98, 0], r: [0.038, 0.038, 0.038], color: joint, size: 0.011 });
        // skittle arms: thin at the shoulder, wide at the cuff
        b.tube({ pts: [[s * 0.265, 0.96, 0], [s * 0.33, 0.79, 0], [s * 0.366, 0.66, 0.008]], r: [0.045, 0.07, 0.086], color: grain, size: 0.016, cap: 'flat' });
        b.tube({ pts: [[s * 0.36, 0.672, 0.008], [s * 0.38, 0.59, 0.012]], r: 0.1, n: 2.6, color: band, size: 0.014, cap: 'flat' });
        mitten(b, s, [s * 0.382, 0.6, 0.012], 1.2, orange);
        b.part(s > 0 ? P.legL : P.legR);
        b.ellipsoid({ c: [s * 0.12, 0.5, 0], r: [0.038, 0.038, 0.038], color: joint, size: 0.011 });
        b.tube({ pts: [[s * 0.12, 0.48, 0], [s * 0.12, 0.28, 0]], r: [0.058, 0.086], color: grain, size: 0.016, cap: false });
        boot(b, s * 0.12, { k: 1.15, top: 0.3, color: COAL, toe: orange });
      });
    },
  },
  {
    name: 'Mr. Sack', role: 'the client', color: '#8d76ad',
    rig: {
      body: { c: [0, 0.98, 0], r: [0.21, 0.3, 0.15] }, head: { c: [0, 1.56, 0], r: 0.2 }, neck: [0, 1.34, 0],
      shoulder: [0.235, 1.22, 0], hand: [0.3, 0.66, 0.01], armR: 0.05, hip: [0.09, 0.7, 0], legR: 0.07,
    },
    paint(b, P) {
      const suit = '#2c2439', chalk = '#8a76ad', skin = '#9a94a0', shade = '#6f687a', shirt = '#e8e2ee', tie = '#7a4fa8';
      b.part(P.body);
      // a tall undertaker's jacket: square shoulders, a nipped waist, the front cut into two points
      const jacket = {
        st: [[0.58, 0.225, 0.145], [0.76, 0.2, 0.135], [0.96, 0.168, 0.12], [1.17, 0.232, 0.132], [1.255, 0.236, 0.126], [1.305, 0.1, 0.09], [1.345, 0.05, 0.05]],
        smooth: false, n: 3.4, size: 0.017,
        keep: (l) => !(l.z > 0 && l.y < 0.58 + 0.2 * Math.max(0, 1 - Math.abs(l.x) / 0.11)) && !(l.z < 0 && l.y < 0.58 + 0.26 * Math.max(0, 1 - Math.abs(l.x) / 0.03)),
      };
      b.loft({ ...jacket, color: suit });
      pinstripes(b, 'loft', jacket, 26, chalk);
      b.sheet({ c: [0, 0, 0.127], pts: [[-0.075, 1.31], [0.075, 1.31], [0, 1.02]], color: shirt, size: 0.012, ink: 0 });
      sides((s) => {
        b.sheet({ c: [0, 0, 0.133], pts: [[s * 0.015, 1.32], [s * 0.135, 1.3], [s * 0.105, 1.19], [s * 0.012, 0.99]], bend: (x) => -Math.abs(x) * 0.12, color: '#3b3050', size: 0.011 }); // lapel
        b.sheet({ c: [0, 0, 0.143], pts: [[0, 1.3], [s * 0.085, 1.345], [s * 0.08, 1.255]], color: tie, size: 0.009 }); // bow tie
        b.sheet({ c: [0, 0, 0.12], rot: [-0.3, 0, 0], pts: [[s * 0.012, 1.345], [s * 0.1, 1.36], [s * 0.05, 1.29]], color: shirt, size: 0.009 }); // collar point
      });
      b.ellipsoid({ c: [0, 1.3, 0.146], r: [0.017, 0.02, 0.012], color: '#5d3a85', size: 0.007, density: 1.5, flat: true });
      for (const y of [1.13, 1.04]) dot(b, 0, y, 0.133, 0.011, 0.011, shade);
      line(b, [[-0.16, 0.8, 0.139], [-0.1, 0.87, 0.14]], 0.005, '#8d76ad'); // a mended tear
      for (const t of [0.3, 0.7]) line(b, [[-0.16 + t * 0.06 - 0.014, 0.8 + t * 0.07 + 0.012, 0.142], [-0.16 + t * 0.06 + 0.014, 0.8 + t * 0.07 - 0.012, 0.142]], 0.004, '#8d76ad');
      b.tube({ pts: [[0, 1.3, 0], [0, 1.41, 0]], r: 0.042, color: shade, size: 0.012, cap: false });
      b.part(P.head);
      // a big lopsided head, wider at the top
      b.loft({ st: [[1.37, 0.07, 0.07], [1.42, 0.165, 0.155], [1.52, 0.212, 0.195, 0.008], [1.64, 0.225, 0.205, 0.016], [1.725, 0.165, 0.155, 0.022], [1.765, 0.06, 0.06, 0.024]], top: true, bottom: true, color: skin });
      sides((s) => {
        b.ellipsoid({ c: [s * 0.088 + 0.014, 1.61, 0.176], r: [0.06, 0.055, 0.02], color: shade, size: 0.011, density: 1.3 });
        line(b, [[s * 0.088 - 0.016, 1.64, 0.2], [s * 0.088 + 0.044, 1.58, 0.2]], 0.007, COAL);
        line(b, [[s * 0.088 + 0.044, 1.64, 0.2], [s * 0.088 - 0.016, 1.58, 0.2]], 0.007, COAL);
      });
      const smile = [[-0.12, 1.5, 0.153], [-0.065, 1.468, 0.182], [0.005, 1.457, 0.192], [0.075, 1.468, 0.182], [0.13, 1.5, 0.153]];
      line(b, smile, 0.006, COAL);
      for (const [x, y, z] of smile) line(b, [[x, y + 0.022, z + 0.004], [x, y - 0.022, z + 0.004]], 0.005, COAL);
      line(b, [[-0.05, 1.742, 0.1], [0.04, 1.757, 0.07]], 0.006, '#5e5868'); // a stitched scalp
      for (const t of [0.3, 0.7]) line(b, [[-0.05 + t * 0.09, 1.77, 0.1 - t * 0.03], [-0.05 + t * 0.09, 1.73, 0.115 - t * 0.03]], 0.005, '#5e5868');
      sides((s) => {
        b.part(s > 0 ? P.armL : P.armR);
        const sleeve = { pts: [[s * 0.235, 1.215, 0], [s * 0.278, 0.98, 0], [s * 0.296, 0.78, 0.01]], r: [0.056, 0.048, 0.043], n: 2.8, size: 0.014 };
        b.tube({ ...sleeve, color: suit, cap: 'flat' });
        pinstripes(b, 'tube', sleeve, 7, chalk);
        b.tube({ pts: [[s * 0.296, 0.79, 0.01], [s * 0.3, 0.748, 0.01]], r: 0.048, color: shirt, size: 0.01, cap: 'flat' });
        mitten(b, s, [s * 0.3, 0.755, 0.01], 0.72, '#8a8491');
        b.part(s > 0 ? P.legL : P.legR);
        const trouser = { pts: [[s * 0.09, 0.7, 0], [s * 0.086, 0.4, 0], [s * 0.086, 0.07, 0]], r: [0.088, 0.07, 0.058], n: 2.8, size: 0.015 };
        b.tube({ ...trouser, color: suit, cap: false });
        pinstripes(b, 'tube', trouser, 9, chalk);
        // long pointed shoes
        b.tube({ pts: [[s * 0.086, 0.036, -0.06], [s * 0.086, 0.04, 0.06], [s * 0.086, 0.03, 0.2], [s * 0.086, 0.012, 0.31]], r: [[0.056, 0.035], [0.06, 0.04], [0.046, 0.03], [0.012, 0.01]], up: [0, 1, 0], color: INK, size: 0.012 });
      });
    },
  },
  {
    name: 'Hood', role: 'night hauler', color: '#7a52a8',
    rig: {
      body: { c: [0, 0.56, 0], r: [0.3, 0.31, 0.27] }, head: { c: [0, 0.98, 0], r: 0.22 }, neck: [0, 0.8, 0],
      shoulder: [0.27, 0.72, 0], hand: [0.43, 0.42, 0.06], armR: 0.05, hip: [0.11, 0.27, 0], legR: 0.07,
    },
    paint(b, P) {
      const plum = '#5a3878', deep = '#46295e', face = '#6a4490', cloak = '#2a2337', lining = '#3a3049', leather = '#5c4632';
      b.part(P.body);
      // a plum of a body, heaviest just above the belt
      b.loft({ st: [[0.215, 0.14, 0.13], [0.27, 0.26, 0.24], [0.42, 0.318, 0.288, 0, 0.015], [0.6, 0.3, 0.27, 0, 0.01], [0.74, 0.23, 0.21], [0.85, 0.13, 0.12]], bottom: true, color: (l) => (l.y < 0.34 ? deep : plum) });
      // the long cloak: open at the front, flaring back into torn tails
      b.loft({
        st: [[0.09, 0.5, 0.45, 0, -0.12], [0.4, 0.41, 0.37, 0, -0.07], [0.72, 0.27, 0.25, 0, -0.02]], smooth: false, n: 2.3,
        arc: [FRONT + 1.2, FRONT + TAU - 1.2], hem: { teeth: 6, depth: 0.26, seed: 4 }, pleat: folds(7, 0.16, 0.2, 1.2), color: cloak, size: 0.018, along: 'v',
      });
      // the shoulder mantle
      b.loft({ st: [[0.6, 0.41, 0.36, 0, -0.02], [0.73, 0.31, 0.28, 0, -0.01], [0.85, 0.15, 0.14]], smooth: false, n: 2.4, hem: { teeth: 7, depth: 0.14, seed: 2 }, pleat: folds(7, 0.1, 0.3), color: lining, size: 0.016 });
      b.loft({ st: [[0.44, 0.324, 0.294, 0, 0.015], [0.49, 0.32, 0.29, 0, 0.014]], color: leather, size: 0.012 });
      b.ellipsoid({ c: [0, 0.465, 0.315], r: [0.044, 0.048, 0.02], color: BONE, size: 0.009, density: 1.4 }); // skull buckle
      sides((s) => dot(b, s * 0.016, 0.473, 0.336, 0.009, 0.011));
      b.tube({ pts: [[-0.25, 0.5, 0.2], [-0.1, 0.64, 0.27], [0.07, 0.8, 0.2]], r: [[0.022, 0.009]], color: leather, size: 0.01, cap: false }); // satchel strap
      b.loft({ c: [-0.29, 0.47, 0.13], rot: [0, -0.9, 0.1], st: [[-0.075, 0.07, 0.04], [0.06, 0.078, 0.046]], n: 5, top: true, bottom: true, color: '#6b573f', size: 0.012 });
      b.sheet({ c: [-0.318, 0.5, 0.166], rot: [0, -0.9, 0.1], pts: [[-0.08, 0.035], [0.08, 0.035], [0.07, -0.03], [0, -0.065], [-0.07, -0.03]], color: leather, size: 0.009 });
      b.part(P.head);
      b.ellipsoid({ c: [0, 0.96, 0.03], r: [0.185, 0.175, 0.17], color: face });
      // the hood: a pointed arch around the face, the tip folded back and off to one side
      const arch = (y) => 0.175 * Math.max(0, 1 - Math.max(0, (y - 0.82) / 0.29) ** 1.7);
      b.tube({
        pts: [[0, 0.79, -0.01], [0, 0.97, -0.02], [0.012, 1.13, -0.07], [0.05, 1.25, -0.2], [0.1, 1.2, -0.37]],
        r: [[0.25, 0.235], [0.268, 0.252], [0.19, 0.19], [0.085, 0.08], [0.004, 0.004]], n: 2.3, cap: false, color: cloak, size: 0.017, grid: [28, 48],
        keep: (l) => !(l.z > 0.04 && l.y > 0.8 && Math.abs(l.x) < arch(l.y)),
      });
      const rim = [];
      for (let i = 0; i <= 12; i++) { const y = 0.81 + 0.3 * Math.sin((i / 12) * Math.PI), s = i < 6 ? -1 : 1, x = i === 6 ? 0 : s * arch(y); rim.push([x, y, 0.215 - 0.05 * ((y - 0.81) / 0.3) ** 2 - Math.abs(x) * 0.25]); }
      b.tube({ pts: rim, r: 0.02, color: lining, size: 0.01, cap: false, grid: [10, 60] });
      sides((s) => {
        dot(b, s * 0.066, 0.975, 0.2, 0.015, 0.03);
        line(b, [[s * 0.025, 1.016, 0.203], [s * 0.105, 1.042, 0.18]], 0.008, INK); // a scowl
      });
      line(b, [[-0.028, 0.905, 0.203], [0, 0.915, 0.208], [0.028, 0.905, 0.203]], 0.006, INK);
      sides((s) => {
        b.part(s > 0 ? P.armL : P.armR);
        b.tube({ pts: [[s * 0.27, 0.72, 0], [s * 0.385, 0.62, 0.03], [s * 0.425, 0.5, 0.06]], r: [0.046, 0.04, 0.036], color: deep, size: 0.014 });
        mitten(b, s, [s * 0.428, 0.51, 0.06], 0.72, deep);
        if (s > 0) { // the lantern travels with the left arm
          line(b, [[0.435, 0.39, 0.075], [0.44, 0.345, 0.08]], 0.005, INK);
          b.frustum({ c: [0.44, 0.335, 0.08], r0: 0.055, r1: 0.014, h: 0.035, color: COAL, size: 0.01 });
          b.loft({ st: [[0.23, 0.04], [0.32, 0.046]], c: [0.44, 0, 0.08], n: 3, color: AMBER, emissive: 1, size: 0.011, density: 2 });
          b.frustum({ c: [0.44, 0.225, 0.08], r0: 0.04, r1: 0.05, h: 0.018, color: COAL, size: 0.01, bottom: true });
        }
        b.part(s > 0 ? P.legL : P.legR);
        b.tube({ pts: [[s * 0.11, 0.27, 0], [s * 0.11, 0.12, 0]], r: 0.04, color: COAL, size: 0.014, cap: false });
        boot(b, s * 0.11, { k: 0.88, top: 0.17, color: '#231b2e' });
      });
    },
  },
  {
    name: 'Doc Beak', role: 'plague doctor', color: '#8d7fb3',
    rig: {
      body: { c: [0, 0.68, 0], r: [0.27, 0.34, 0.24] }, head: { c: [0, 1.2, 0], r: 0.19 }, neck: [0, 1.03, 0],
      shoulder: [0.26, 0.95, 0], hand: [0.4, 0.5, 0.04], armR: 0.08, hip: [0.12, 0.34, 0], legR: 0.1,
    },
    paint(b, P) {
      const coat = '#2e2839', trim = '#3d2e52', collar = '#4a3a64', mask = '#cfcad6', hair = '#2a2433';
      b.part(P.body);
      // an A-line coat: stiff folds that open toward a torn hem, slit down the front
      b.loft({
        st: [[0.29, 0.39, 0.345], [0.62, 0.268, 0.232], [0.9, 0.212, 0.186], [1.01, 0.12, 0.11]], smooth: false, n: 2.8,
        arc: [FRONT + 0.07, FRONT + TAU - 0.07], hem: { teeth: 9, depth: 0.08, seed: 5 }, pleat: folds(8, 0.13, 0.5, 2), color: coat, size: 0.018, along: 'v',
      });
      b.ellipsoid({ c: [0, 0.36, 0], r: [0.3, 0.04, 0.26], color: '#15101c', size: 0.03 });
      b.loft({ st: [[0.6, 0.276, 0.24], [0.636, 0.27, 0.234]], n: 2.8, color: '#b08a55', size: 0.01 }); // rope belt
      buckle(b, [0, 0.618, 0.245], 0.04);
      b.loft({ c: [0.17, 0.5, 0.262], rot: [0, 0.45, 0], st: [[-0.06, 0.046, 0.03], [0.06, 0.05, 0.034]], n: 4, top: true, bottom: true, color: '#c9822f', size: 0.011 }); // pouch
      line(b, [[0.15, 0.6, 0.262], [0.17, 0.565, 0.272]], 0.006, '#b08a55');
      // capelet and a pointed collar on top
      b.loft({ st: [[0.78, 0.43, 0.35], [0.9, 0.33, 0.28], [1.03, 0.15, 0.14]], smooth: false, n: 2.5, hem: { teeth: 8, depth: 0.1, seed: 7 }, pleat: folds(8, 0.09, 0), color: trim, size: 0.017 });
      b.loft({ st: [[0.92, 0.27, 0.235], [1.05, 0.14, 0.13]], smooth: false, n: 2.5, hem: { teeth: 4, depth: 0.1, seed: 9 }, color: collar, size: 0.015 });
      b.part(P.head);
      // ragged hair-hood hanging from under the hat
      b.loft({
        st: [[0.97, 0.245, 0.225, 0, -0.03], [1.16, 0.236, 0.226, 0, -0.03], [1.34, 0.2, 0.19, 0, -0.02]], smooth: false, n: 2.3,
        arc: [FRONT + 0.9, FRONT + TAU - 0.9], hem: { teeth: 10, depth: 0.16, seed: 11 }, pleat: folds(10, 0.08, 0.3, 1), color: hair, size: 0.015, along: 'v',
      });
      b.ellipsoid({ c: [0, 1.2, 0.01], r: [0.188, 0.182, 0.18], color: mask });
      sides((s) => {
        b.ellipsoid({ c: [s * 0.082, 1.22, 0.168], r: [0.06, 0.07, 0.02], color: '#15101c', size: 0.01, density: 1.5, flat: true });
        glint(b, s * 0.064, 1.243, 0.19, 0.011);
      });
      // a short hooked beak
      b.tube({ pts: [[0, 1.175, 0.17], [0, 1.172, 0.265], [0, 1.14, 0.335], [0, 1.09, 0.36]], r: [[0.05, 0.046], [0.04, 0.037], [0.025, 0.023], [0.004, 0.004]], color: '#3d2c52', size: 0.011 });
      b.ellipsoid({ c: [0.09, 1.13, 0.168], r: [0.013, 0.024, 0.01], color: '#d98a2f', size: 0.006, density: 2, flat: true }); // a tear
      line(b, [[-0.02, 1.075, 0.174], [0, 1.082, 0.178], [0.02, 1.075, 0.174]], 0.005, INK);
      hat(b, { c: [0, 1.345, 0], rot: [0.04, 0, -0.05], brim: [0.4, 0.37], curl: 0.035, wobble: 0.02, color: NIGHT, band: '#8d7fb3', n: 2.6, crown: [[0, 0.2, 0.186], [0.1, 0.19, 0.176], [0.2, 0.172, 0.162]] });
      buckle(b, [0.002, 1.385, 0.2], 0.036, [0.04, 0, -0.05]);
      sides((s) => {
        b.part(s > 0 ? P.armL : P.armR);
        // bell sleeves with a turned cuff
        b.tube({ pts: [[s * 0.26, 0.95, 0], [s * 0.335, 0.8, 0.01], [s * 0.388, 0.65, 0.03]], r: [0.07, 0.092, 0.118], n: 2.5, color: coat, size: 0.016, cap: 'flat' });
        b.tube({ pts: [[s * 0.382, 0.672, 0.03], [s * 0.398, 0.59, 0.035]], r: 0.128, n: 2.6, color: trim, size: 0.014, cap: 'flat' });
        mitten(b, s, [s * 0.4, 0.61, 0.035], 1.15, mask);
        if (s < 0) { // the shovel travels with the right arm
          b.tube({ pts: [[-0.43, 0.19, 0.15], [-0.4, 1.24, 0.06]], r: 0.018, color: '#7a5236', size: 0.011 });
          b.sheet({
            c: [-0.396, 1.22, 0.06], rot: [0.08, 0, -0.03], pts: [[-0.035, 0], [0.035, 0], [0.1, 0.05], [0.105, 0.16], [0.06, 0.27], [0, 0.33], [-0.06, 0.27], [-0.105, 0.16], [-0.1, 0.05]],
            bend: (x) => x * x * 2.2, color: (l) => (l.x > 0.01 && l.y > 0.14 && l.y < 0.26 ? '#a8652f' : '#8d8f9c'), size: 0.013,
          });
        }
        b.part(s > 0 ? P.legL : P.legR);
        b.tube({ pts: [[s * 0.12, 0.36, 0], [s * 0.12, 0.2, 0]], r: 0.06, color: '#1f1a28', size: 0.015, cap: false });
        boot(b, s * 0.12, { k: 1.3, top: 0.22, color: '#b9b4c2', cuff: trim });
        b.box({ c: [s * 0.12, 0.165, 0.12], h: [0.036, 0.024, 0.01], rot: [-0.5, 0, 0], color: GOLD, size: 0.009 });
      });
    },
  },
];

import { rng } from './rng.js';

// Level layout shared by the host simulation (colliders) and every client (visuals).
export const WORLD_HALF = 80;
export const FENCE = 28;
export const ROAD_Z = 15;
export const ROAD_HALF = 2.2;
export const TRUCK_STOP_X = 1;
export const TRUCK_START_X = 60;
export const PILE = { x: -12, z: 9 };
export const SPAWN = { x: 0, z: 8.5 };

export const PLOT_HALF = { x: 0.65, z: 1.3 };
export const PLOT_MAX_DEPTH = 1.25;
export const PLOT_MIN_DEPTH = 0.75; // a coffin can be buried once the hole is at least this deep
export const PLOTS = [];
for (const z of [3.2, -2.4]) for (const x of [-8, -4.5, -1, 2.5, 6]) PLOTS.push({ x, z });

export const LANTERNS = [
  [-10.5, 0.4], [9, 0.4], [4.5, 11.5], [-7, 11.5], [-14.5, 10.5], [0, -7],
];

// Coffin and truck dimensions (shared by physics and visuals).
// inner width must exceed the widest belly corpses.js generates (0.74 m) or bodies cannot lie inside
export const COFFIN = { hx: 0.5, hy: 0.25, hz: 1.12, wall: 0.05 };
export const TRUCK = {
  // boxes in truck-local space (truck faces -X; the open bed is at +X)
  boxes: [
    { c: [-2.5, 0.85, 0], h: [0.5, 0.55, 0.9] }, // hood
    { c: [-1.3, 1.45, 0], h: [0.7, 0.95, 1.0] }, // cab
    { c: [1.2, 0.7, 0], h: [1.8, 0.2, 1.0] }, // bed floor (top at 0.9)
    { c: [1.2, 1.02, 0.95], h: [1.8, 0.12, 0.05] }, // low bed wall (bodies must slide over it)
    { c: [1.2, 1.02, -0.95], h: [1.8, 0.12, 0.05] }, // low bed wall
  ],
  bed: { x0: -0.6, x1: 3.0, top: 0.9 },
  half: [3.1, 1.2, 1.15],
};

// Static ground made of boxes, leaving rectangular holes where the grave plots are.
export function groundBoxes() {
  const H = WORLD_HALF, out = [];
  const rows = [...new Set(PLOTS.map((p) => p.z))].sort((a, b) => a - b);
  const zEdges = [-H];
  for (const z of rows) zEdges.push(z - PLOT_HALF.z, z + PLOT_HALF.z);
  zEdges.push(H);
  const box = (x0, x1, z0, z1) => out.push({ c: [(x0 + x1) / 2, -2, (z0 + z1) / 2], h: [(x1 - x0) / 2, 2, (z1 - z0) / 2] });
  for (let i = 0; i < zEdges.length - 1; i++) {
    const z0 = zEdges[i], z1 = zEdges[i + 1];
    if (z1 - z0 < 1e-6) continue;
    const row = rows.find((z) => Math.abs(z - (z0 + z1) / 2) < 1e-6 && Math.abs(z1 - z0 - 2 * PLOT_HALF.z) < 1e-6);
    if (row === undefined) { box(-H, H, z0, z1); continue; }
    const xs = PLOTS.filter((p) => p.z === row).map((p) => p.x).sort((a, b) => a - b);
    let x = -H;
    for (const px of xs) { box(x, px - PLOT_HALF.x, z0, z1); x = px + PLOT_HALF.x; }
    box(x, H, z0, z1);
  }
  return out;
}

// Decorations, generated from a fixed seed so every peer builds the same yard.
export const DECOR = (() => {
  const r = rng(1337);
  const stones = [];
  for (const z of [-9, -12.5, -16, -19.5]) {
    for (let x = -20; x <= 20; x += 3.3) {
      if (r() < 0.22) continue;
      stones.push({
        x: x + r.range(-0.6, 0.6), z: z + r.range(-0.5, 0.5), kind: r.pick(['round', 'round', 'cross', 'obelisk', 'slab']),
        h: r.range(0.8, 1.45), w: r.range(0.55, 0.8), rx: r.range(-0.18, 0.12), rz: r.range(-0.2, 0.2), ry: r.range(-0.2, 0.2), seed: Math.floor(r() * 1e6),
      });
    }
  }
  for (const [x, z] of [[-17, 1], [-19, -3], [15, 2], [17.5, -2], [13, -5]]) {
    stones.push({ x, z, kind: r.pick(['round', 'cross', 'slab']), h: r.range(0.8, 1.3), w: 0.65, rx: r.range(-0.15, 0.1), rz: r.range(-0.2, 0.2), ry: 0, seed: Math.floor(r() * 1e6) });
  }
  const trees = [[-22, -14], [21, -19], [-24, 4], [23, 5], [16, -11], [-11, -24], [24, 22], [-23, 22], [8, -25], [-3, 24]]
    .map(([x, z]) => ({ x, z, seed: Math.floor(r() * 1e6), h: r.range(5, 8) }));
  const shed = { x: -17, z: 12, hx: 2.2, hy: 1.6, hz: 1.7 };
  return { stones, trees, shed };
})();

// Every static collider box: ground, fence walls, shed, tree trunks, old headstones.
export function staticBoxes() {
  const out = groundBoxes();
  const F = FENCE, t = 0.15, hy = 1.0;
  const gate0 = ROAD_Z - ROAD_HALF - 0.3, gate1 = ROAD_Z + ROAD_HALF + 0.3;
  out.push({ c: [0, hy, -F], h: [F, hy, t] }, { c: [0, hy, F], h: [F, hy, t] });
  for (const x of [-F, F]) {
    out.push({ c: [x, hy, (-F + gate0) / 2], h: [t, hy, (gate0 + F) / 2] });
    out.push({ c: [x, hy, (gate1 + F) / 2], h: [t, hy, (F - gate1) / 2] });
  }
  const s = DECOR.shed;
  out.push({ c: [s.x, s.hy, s.z], h: [s.hx, s.hy, s.hz] });
  for (const tr of DECOR.trees) out.push({ c: [tr.x, 2, tr.z], h: [0.35, 2, 0.35] });
  for (const st of DECOR.stones) out.push({ c: [st.x, st.h / 2, st.z], h: [st.w / 2, st.h / 2, 0.12], ry: st.ry });
  for (const [x, z] of LANTERNS) out.push({ c: [x, 1, z], h: [0.08, 1, 0.08] });
  return out;
}

export function plotAt(x, z, margin = 0) {
  return PLOTS.findIndex((p) => Math.abs(x - p.x) < PLOT_HALF.x + margin && Math.abs(z - p.z) < PLOT_HALF.z + margin);
}

// Worn footpaths (segment endpoints [ax, az, bx, bz]) between where the work happens: truck bed, coffin pile, the
// plot rows. The ground shader paints them and the plants keep off them.
const BED_X = TRUCK_STOP_X + 3.2;
export const PATHS = [
  [BED_X, ROAD_Z - 2.4, PILE.x + 1.5, PILE.z + 0.6], // truck -> coffin pile
  [PILE.x + 1, PILE.z - 0.8, -6.5, 5.2], // pile -> plots
  [BED_X - 2, ROAD_Z - 2.5, 0.5, 5.4], // truck -> plots
  [-10.5, 0.4, 8.5, 0.4], // walkway between the two rows
  [0, 4.8, 0, -6.5], // to the back lantern and the old stones
];

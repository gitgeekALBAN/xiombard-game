import { rng } from './rng.js';

// Level layout shared by the host simulation (colliders) and every client (visuals).
export const WORLD_HALF = 80;
export const FENCE = 28;
export const ROAD_Z = 15;
export const ROAD_HALF = 2.2;
export const TRUCK_STOP_X = 1;
export const TRUCK_START_X = 60;
export const PILE = { x: -10.6, z: 7.9 }; // fresh coffins: the morgue's stock table (MORGUE.stock)
export const SPAWN = { x: 0.8, z: 9.4 }; // inside the morgue
export const CARPENTER = { x: -15.4, z: 7.4 }; // the carpenter's corner by the shed (decor)

export const PLOT_HALF = { x: 0.65, z: 1.3 };
export const PLOT_MAX_DEPTH = 1.25;
export const PLOT_MIN_DEPTH = 0.75; // a coffin can be buried once the hole is at least this deep
export const PLOTS = [];
for (const z of [3.2, -2.4]) for (const x of [-8, -4.5, -1, 2.5, 6]) PLOTS.push({ x, z });

export const LANTERNS = [
  [-10.5, 0.4], [9, 0.4], [7.6, 12.9], [-7, 12.95], [-14.5, 10.5], [0, -7],
];

// Coffin and truck dimensions (shared by physics and visuals).
// inner width must exceed the widest belly corpses.js generates (0.74 m) or bodies cannot lie inside
export const COFFIN = { hx: 0.5, hy: 0.25, hz: 1.12, wall: 0.05 };
export const TRUCK = {
  // boxes in truck-local space (truck faces -X; the hearse's coach is at +X, open only at the back)
  boxes: [
    { c: [-2.5, 0.85, 0], h: [0.5, 0.55, 0.9] }, // hood
    { c: [-1.3, 1.45, 0], h: [0.7, 0.95, 1.0] }, // cab
    { c: [1.2, 0.7, 0], h: [1.8, 0.2, 1.0] }, // bed floor (top at 0.9)
    { c: [1.2, 1.02, 0.95], h: [1.8, 0.12, 0.05] }, // low bed wall
    { c: [1.2, 1.02, -0.95], h: [1.8, 0.12, 0.05] }, // low bed wall
    { c: [1.19, 1.81, 0.93], h: [1.81, 0.61, 0.04] }, // coach side
    { c: [1.19, 1.81, -0.93], h: [1.81, 0.61, 0.04] }, // coach side
    { c: [1.2, 2.49, 0], h: [1.93, 0.08, 1.03] }, // coach roof
  ],
  bed: { x0: -0.6, x1: 3.0, top: 0.9, roof: 2.41 },
  half: [3.1, 1.2, 1.15],
};

// The morgue: a long one-storey office between the road and the graves. The hearse parks along its north wall and
// passes bodies in through the loading hatch; the south door leads out to the graveyard. Inside, a body goes from
// station to station, east to west along the north wall and back along the west wall:
//   intake (under the hatch) -> registry desk (E writes the name tag) -> dressing table (E: pick an outfit)
//   -> the stock table, where coffins come in from the stockroom -> lid (F) and nails (F) -> out the south door.
// The east end is the clerk's office: nails and boards are kept there.
const STATION = { hx: 1.1, hz: 0.42, top: 0.85 }; // a table a body lies on lengthwise (along x)
export const MORGUE = {
  x0: -13, x1: 13, z0: 6.0, z1: 12.4, h: 3.0, t: 0.12,
  door: [-0.9, 2.3], // south door (x range), wide enough to carry a coffin through
  hatch: [1.0, 3.6], hatchSill: 0.9, hatchTop: 2.0, // loading hatch in the north wall
  table: { x: 2.3, z: 11.35, ...STATION },  // 1 intake table under the hatch
  desk: { x: -3.4, z: 11.35, ...STATION },  // 2 registry desk: a body on it gets its name tag written (E)
  dress: { x: -8.8, z: 11.35, ...STATION }, // 3 dressing table: a body on it is dressed in the outfit you pick (E)
  stock: { x: -10.6, z: 7.9, hx: 0.66, hz: 1.3, top: 0.5 }, // 4 a fresh coffin slides in here from the stockroom
  stockDoor: [7.0, 8.8], // the stockroom door in the west wall (z range), behind the stock table
  rack: { x: -12.86, z0: 9.7, dz: 0.52, y: 1.5 }, // the outfits on show by the dressing table (west wall)
  crate: { x: 11.2, z: 7.0, hx: 0.45, hy: 0.35, hz: 0.35 }, // nails and boards, in the office
  office: [ // clerk's desk and filing cabinets in the east end: furniture you bump into
    { c: [8.6, 0.4, 11.5], h: [0.85, 0.4, 0.4], kind: 'desk' },
    { c: [12.5, 0.75, 9.6], h: [0.3, 0.75, 0.45], kind: 'cabinet' },
    { c: [12.5, 0.75, 10.6], h: [0.3, 0.75, 0.45], kind: 'cabinet' },
    { c: [6.4, 0.25, 6.5], h: [0.9, 0.25, 0.25], kind: 'bench' },
  ],
  lamps: [[-8.8, 9.4], [-3.4, 9.4], [2.3, 9.4], [8.6, 9.4]],
};
// stations a player works at (registry, dressing) and how near counts as "at it"
export const atStation = (st, x, z, m = 0.95) => Math.abs(x - st.x) < st.hx + m && Math.abs(z - st.z) < st.hz + m;
// Outfits written on the delivery notes. Bodies arrive in a plain shroud.
export const OUTFITS = [
  { id: 'tux', label: 'Black tuxedo' },
  { id: 'sailor', label: 'Sailor suit' },
  { id: 'clown', label: 'Clown outfit' },
  { id: 'gown', label: 'Purple gown' },
  { id: 'pajamas', label: 'Striped pajamas' },
];
export const outfitLabel = (id) => (OUTFITS.find((o) => o.id === id) || { label: 'Plain shroud' }).label;
// The blessing at the chapel: each note names one of these charms. They are made up for this graveyard on purpose:
// no real religion's symbols, ever. The view draws them (models/charms.js), the note prints the name.
export const RITES = [
  { id: 'moth', label: 'Hush Moth' },
  { id: 'snail', label: 'Slow Snail' },
  { id: 'key', label: 'Bone Key' },
  { id: 'teacup', label: 'Teacup Moon' },
];
export const riteLabel = (id) => (RITES.find((r) => r.id === id) || { label: 'none' }).label;
// Candles at the headstone: the note asks for a color and how many.
export const CANDLES = [
  { id: 'bone', label: 'Bone white', color: '#efe6d0' },
  { id: 'plum', label: 'Plum', color: '#8a4f9e' },
  { id: 'ember', label: 'Ember', color: '#e0703a' },
];
export const MAX_CANDLES = 4;
// a delivery note: a stiff card, half sizes in meters (physics box and the drawn sheet)
export const NOTE = { hx: 0.15, hy: 0.006, hz: 0.105 };
export const candleLabel = (c) => (c ? `${c.n} ${(CANDLES.find((k) => k.id === c.c) || CANDLES[0]).label.toLowerCase()}` : 'none');
export const NAIL_COST = 4; // nails to hammer one coffin lid shut

export const insideMorgue = (x, z, m = 0) => x > MORGUE.x0 + m && x < MORGUE.x1 - m && z > MORGUE.z0 + m && z < MORGUE.z1 - m;

// Morgue colliders: walls with door, hatch and sill, plus the station tables, the supply crate and the office furniture.
export function morgueBoxes(withFurniture = true) {
  const M = MORGUE, t = M.t, out = [];
  const wallX = (z, x0, x1, y0 = 0, y1 = M.h) => out.push({ c: [(x0 + x1) / 2, (y0 + y1) / 2, z], h: [(x1 - x0) / 2, (y1 - y0) / 2, t], wall: 1 });
  const wallZ = (x, z0, z1) => out.push({ c: [x, M.h / 2, (z0 + z1) / 2], h: [t, M.h / 2, (z1 - z0) / 2], wall: 1 });
  wallX(M.z1, M.x0, M.hatch[0]); wallX(M.z1, M.hatch[1], M.x1);
  wallX(M.z1, M.hatch[0], M.hatch[1], 0, M.hatchSill); wallX(M.z1, M.hatch[0], M.hatch[1], M.hatchTop, M.h);
  wallX(M.z0, M.x0, M.door[0]); wallX(M.z0, M.door[1], M.x1); wallX(M.z0, M.door[0], M.door[1], 2.2, M.h);
  wallZ(M.x0, M.z0, M.z1); wallZ(M.x1, M.z0, M.z1);
  if (withFurniture) {
    for (const tb of [M.table, M.desk, M.dress, M.stock]) out.push({ c: [tb.x, tb.top / 2, tb.z], h: [tb.hx, tb.top / 2, tb.hz] });
    const c = M.crate;
    out.push({ c: [c.x, c.hy, c.z], h: [c.hx, c.hy, c.hz] });
    for (const o of M.office) out.push({ c: o.c, h: o.h });
  }
  return out;
}

// The fence is split into sections that zombies wear down at night and players repair by day.
// Each side runs from -FENCE to FENCE in 7 m sections; the road gates on the east and west sides stay open.
export const FENCE_LEN = 7;
export const FENCE_HP = 100;
export const FENCE_SECTIONS = (() => {
  const out = [], g0 = ROAD_Z - ROAD_HALF - 0.3, g1 = ROAD_Z + ROAD_HALF + 0.3;
  for (const [axis, at] of [['z', -FENCE], ['z', FENCE], ['x', -FENCE], ['x', FENCE]]) {
    for (let a = -FENCE; a < FENCE - 0.01; a += FENCE_LEN) {
      let pieces = [[a, a + FENCE_LEN]];
      if (axis === 'x') pieces = pieces.flatMap(([p0, p1]) => (p1 <= g0 || p0 >= g1 ? [[p0, p1]] : [[p0, g0], [g1, p1]].filter(([u, v]) => v - u > 0.2)));
      if (pieces.length) out.push({ axis, at, a0: a, a1: a + FENCE_LEN, pieces });
    }
  }
  return out;
})();
// which section a point on the fence line belongs to
export const fenceSectionAt = (x, z) => FENCE_SECTIONS.findIndex((f) => {
  const [along, across] = f.axis === 'z' ? [x, z] : [z, x];
  return Math.abs(across - f.at) < 0.6 && along >= f.a0 - 0.01 && along < f.a1 + 0.01;
});
// bear traps around the graves, where the restless dead are headed
export const TRAPS = [[-10, -5.6], [-6.2, -5.6], [-2.6, -5.6], [0.9, -5.6], [4.3, -5.6], [8, -5.6], [-12, 0.4], [10.6, 0.4]];
export const TRAP_DUR = 3; // snaps before a trap breaks

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

// Every static collider box that never changes: ground, shed, tree trunks, old headstones, lantern posts, the morgue.
// The fence is not here: its sections come and go, see FENCE_SECTIONS and the sim's fence state.
export function staticBoxes() {
  const out = groundBoxes();
  const s = DECOR.shed;
  out.push({ c: [s.x, s.hy, s.z], h: [s.hx, s.hy, s.hz] });
  for (const tr of DECOR.trees) out.push({ c: [tr.x, 2, tr.z], h: [0.35, 2, 0.35] });
  for (const st of DECOR.stones) out.push({ c: [st.x, st.h / 2, st.z], h: [st.w / 2, st.h / 2, 0.12], ry: st.ry });
  for (const [x, z] of LANTERNS) out.push({ c: [x, 1, z], h: [0.08, 1, 0.08] });
  out.push(...morgueBoxes());
  return out;
}

export function plotAt(x, z, margin = 0) {
  return PLOTS.findIndex((p) => Math.abs(x - p.x) < PLOT_HALF.x + margin && Math.abs(z - p.z) < PLOT_HALF.z + margin);
}

// Worn footpaths (segment endpoints [ax, az, bx, bz]) between where the work happens: the morgue door, the plot
// rows, the shed. The ground shader paints them and the plants keep off them.
const DOOR_X = (MORGUE.door[0] + MORGUE.door[1]) / 2;
export const PATHS = [
  [DOOR_X, MORGUE.z0, DOOR_X - 0.2, 4.9], // morgue door -> plots
  [DOOR_X - 0.2, 5.2, -6.5, 5.2], // along the near row, west
  [DOOR_X - 0.2, 5.2, 7.5, 5.2], // along the near row, east
  [-10.5, 0.4, 8.5, 0.4], // walkway between the two rows
  [0, 4.8, 0, -6.5], // to the back lantern and the old stones
];

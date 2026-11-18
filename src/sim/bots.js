// Host-only AI teammates. Bots are ordinary diggers in the Sim (sim.addPlayer), driven by writing their input
// every tick exactly like a human's (sim.setInput), so guests see them like any other player.
// createBots(sim) returns:
//   add(name)   — spawn a bot digger, returns its entity id
//   remove(id)  — take a bot out of the game
//   ids         — array of live bot ids
//   update(dt)  — call once per frame BEFORE sim.update(dt); decides and writes each bot's input
//
// How they think: every ~0.3 s a bot without a job scores the jobs on offer by its role (one digger, the rest
// haulers; a lone bot does everything), the distance and what teammates already claimed, and takes the best one:
//   fill    — hold dig at a grave holding a coffin with a body
//   deliver — drag a coffin to a dug grave (full ones first; empty ones too when corpses are waiting, then bodies
//             are dropped straight into the grave), or park a full coffin beside the grave that opens next
//   load    — carry a loose corpse to an empty coffin (one waiting in a grave is best) and let go over it
//   dig     — keep one to three graves open ahead of the coffins and corpses on their way
//   flip    — right a tipped coffin (also inside a grave, where it blocks the burial)
// Every frame it steers along a small visibility-graph path around the truck, open graves, plots, coffins, posts
// and the shed, with a turn-rate limit. The sim is only ever read; bots act through the same input a human sends,
// so they slip, drop and fumble like one. Stalls trigger a back-off and sidestep, a snagged coffin gets a toss and
// a regrab, a bot in a hole hops out, and a job that keeps failing is dropped and its target ignored for a while.
// Personality: per-bot pace, turn speed and hesitation, plus flops when bored, after a burial or wearing a coffin.
// The optional second argument is for tests: createBots(sim, { log: (msg) => ..., inspect: {} }).
import { PLOTS, PLOT_HALF, PLOT_MAX_DEPTH, PLOT_MIN_DEPTH, COFFIN, TRUCK, ROAD_Z, PILE, DECOR, LANTERNS, plotAt } from '../shared/layout.js';
import { P } from '../shared/skeleton.js';
import { rng } from '../shared/rng.js';

const PLAN_DT = 0.3;                 // seconds between decisions (jittered per bot)
const YARD = 26;                     // stay well inside the fence (at 28)
const READY = PLOT_MIN_DEPTH + 0.05; // deep enough to take a coffin (graveAssist also accepts shallower holes: avoid those)
const ASSIST_DEPTH = 0.4;            // graveAssist's own threshold in game.js
const ZONE_X = PLOT_HALF.x + 1.2, ZONE_Z = PLOT_HALF.z + 1.5; // graveAssist reach in game.js
const DIG_OFF_X = PLOT_HALF.x + 0.6, DIG_OFF_Z = PLOT_HALF.z + 0.6;
const BASE = { fill: 100, deliver: 82, load: 72, dig: 64, stage: 50, flip: 45 };
const ROLE_W = {
  solo: { fill: 1, deliver: 1, load: 1, dig: 1, flip: 1 },
  digger: { fill: 1.25, deliver: 0.95, load: 0.78, dig: 1.35, flip: 0.9 },
  hauler: { fill: 0.95, deliver: 1.05, load: 1.15, dig: 0.7, flip: 1.05 },
};
const COST_PER_M = 1.2;
const TRUCK_X0 = Math.min(...TRUCK.boxes.map((b) => b.c[0] - b.h[0])), TRUCK_X1 = Math.max(...TRUCK.boxes.map((b) => b.c[0] + b.h[0]));
const TRUCK_HZ = Math.max(...TRUCK.boxes.map((b) => Math.abs(b.c[2]) + b.h[2]));

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const angDiff = (a, b) => Math.atan2(Math.sin(a - b), Math.cos(a - b));
const hyp = Math.hypot;
// a risen body knocked down for good lies still and can be boxed; one with fight left in it gets up again in seconds
const cargo = (e) => !e.z || (e.z.mode === 'down' && e.z.hp <= 0);
const ZDOG = 2, ZDRAGGER = 1; // ZTYPE in shared/zombies.js
const inYard = (q) => Math.abs(q.x) < YARD && Math.abs(q.z) < YARD;
const stray = (q) => q.z > 17.5 || q.z < -7.5 || Math.abs(q.x) > 19; // a coffin that wandered off the work area
function hashName(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

// ---------- static obstacles (axis-aligned rects in the ground plane) ----------
function staticObstacles() {
  const out = [];
  const s = DECOR.shed;
  out.push({ x0: s.x - s.hx, x1: s.x + s.hx, z0: s.z - s.hz, z1: s.z + s.hz, kind: 'solid' });
  for (const t of DECOR.trees) out.push({ x0: t.x - 0.35, x1: t.x + 0.35, z0: t.z - 0.35, z1: t.z + 0.35, kind: 'solid' });
  for (const st of DECOR.stones) {
    const c = Math.abs(Math.cos(st.ry)), sn = Math.abs(Math.sin(st.ry)), hw = st.w / 2, hd = 0.12;
    const ex = hw * c + hd * sn, ez = hw * sn + hd * c;
    out.push({ x0: st.x - ex, x1: st.x + ex, z0: st.z - ez, z1: st.z + ez, kind: 'solid' });
  }
  for (const [x, z] of LANTERNS) out.push({ x0: x - 0.08, x1: x + 0.08, z0: z - 0.08, z1: z + 0.08, kind: 'solid' });
  return out;
}

const inside = (e, x, z) => x > e.x0 && x < e.x1 && z > e.z0 && z < e.z1;
function pushOut(e, x, z) {
  const dl = x - e.x0, dr = e.x1 - x, db = z - e.z0, df = e.z1 - z, m = Math.min(dl, dr, db, df);
  if (m === dl) return [e.x0 - 0.05, z];
  if (m === dr) return [e.x1 + 0.05, z];
  if (m === db) return [x, e.z0 - 0.05];
  return [x, e.z1 + 0.05];
}
// Liang–Barsky: does the segment a→b pass through the interior of rect e?
function segHits(ax, az, bx, bz, e) {
  const dx = bx - ax, dz = bz - az;
  let t0 = 0, t1 = 1;
  const ps = [-dx, dx, -dz, dz], qs = [ax - e.x0, e.x1 - ax, az - e.z0, e.z1 - az];
  for (let i = 0; i < 4; i++) {
    const p = ps[i], q = qs[i];
    if (Math.abs(p) < 1e-9) { if (q <= 0) return false; continue; }
    const t = q / p;
    if (p < 0) { if (t > t0) t0 = t; } else if (t < t1) t1 = t;
    if (t0 >= t1) return false;
  }
  return t1 - t0 > 1e-3;
}

export function createBots(sim, opts = {}) {
  const bots = new Map();
  const claims = new Map(); // key -> bot id ('e<id>' entity, 'L<id>' coffin being loaded, 'p<i>' plot worked, 'd<i>' plot to deliver to)
  const STATIC = staticObstacles();
  const log = opts.log || null;
  // tests may ask for a read-only view of every bot's state
  if (opts.inspect) opts.inspect.list = () => [...bots.values()].map((b) => ({ id: b.id, name: b.name, role: b.role, task: b.task && b.task.kind,
    stage: b.task && b.task.stage, desc: b.task && b.task.kind !== 'idle' ? desc(b.task) : '', stats: b.stats, path: b.path, wpi: b.wpi, mode: b.mode }));
  let T = 0, W = null, Wt = -1, lastScore = sim.score, nAdded = 0;
  const say = (b, msg) => { if (log) log(`${T.toFixed(1).padStart(6)} ${b.name.padEnd(9)} ${msg}`); };

  // ---------- claims & blacklist ----------
  const isFree = (b, key) => { const o = claims.get(key); return o === undefined || o === b.id || !bots.has(o); };
  const claim = (b, key) => { claims.set(key, b.id); b.claims.add(key); };
  const releaseAll = (b) => { for (const k of b.claims) if (claims.get(k) === b.id) claims.delete(k); b.claims.clear(); };
  const banned = (b, key) => (b.black.get(key) || 0) > T;

  // ---------- world snapshot (at most once per frame) ----------
  function world() {
    if (W && Wt === T) return W;
    const corpses = [], coffins = [], diggers = [], walkers = [], downZ = [];
    for (const e of sim.ents) {
      if (e.z) { if (e.z.mode !== 'down') walkers.push(e); else if (e.z.hp > 0) downZ.push(e); } // on its feet, or getting up again soon
      if (e.kind === 'corpse') { if (cargo(e)) corpses.push(e); } // a body on its feet is a zombie, not cargo
      else if (e.kind === 'coffin') coffins.push(e);
      else if (e.kind === 'digger') diggers.push(e);
    }
    const held = new Map();
    for (const d of diggers) if (d.grab) held.set(d.grab.ent, (held.get(d.grab.ent) || 0) + 1);
    const up = new Map(), contents = new Map(), boxedIn = new Map(), inPlot = new Map(), plotCoffin = new Map();
    for (const c of coffins) {
      const u = sim.coffinUp(c), k = sim.coffinContents(c);
      up.set(c, u); contents.set(c, k);
      if (k && u > 0.5) boxedIn.set(k, c);
    }
    for (const pl of sim.plots) { const c = sim.coffinInPlot(pl); if (c) { plotCoffin.set(pl, c); inPlot.set(c, pl); } }
    const holeBody = new Set(); // plots with a loose corpse lying down in the hole (a coffin dropped on it would tip)
    for (const k of corpses) {
      if (boxedIn.has(k)) continue;
      for (const i of [P.pelvis, P.chest]) { const q = k.bodies[i].position; if (q.y < -0.1) { const pi = plotAt(q.x, q.z, 0.05); if (pi >= 0) holeBody.add(pi); } }
    }
    const obst = STATIC.slice();
    const tr = sim.truck, tx = tr.body.position.x;
    let danger = null;
    if (Math.abs(tx) < 40) {
      obst.push({ x0: tx + TRUCK_X0, x1: tx + TRUCK_X1, z0: ROAD_Z - TRUCK_HZ, z1: ROAD_Z + TRUCK_HZ, kind: 'solid' });
      if (tr.state === 'arrive' || tr.state === 'leave') { // it drives toward -X: keep clear of its path
        danger = { x0: tx + TRUCK_X0 - 9, x1: tx + TRUCK_X1 + 0.8, z0: ROAD_Z - TRUCK_HZ - 0.9, z1: ROAD_Z + TRUCK_HZ + 0.9, kind: 'danger' };
        obst.push(danger);
      }
    }
    for (const pl of sim.plots) {
      if (pl.depth > 0.06) obst.push({ x0: pl.x - PLOT_HALF.x, x1: pl.x + PLOT_HALF.x, z0: pl.z - PLOT_HALF.z, z1: pl.z + PLOT_HALF.z, kind: 'hole', plot: pl.i });
    }
    W = { corpses, coffins, diggers, walkers, downZ, held, up, contents, boxedIn, inPlot, plotCoffin, holeBody, obst, danger };
    Wt = T;
    return W;
  }
  const heldByOthers = (w, p, ent) => (w.held.get(ent) || 0) - (p.grab && p.grab.ent === ent ? 1 : 0);

  // ---------- path planning: visibility graph over inflated rect corners ----------
  function findPath(sx, sz, gx, gz, o) {
    const w = world(), rs = [];
    const bx0 = Math.min(sx, gx) - 7, bx1 = Math.max(sx, gx) + 7, bz0 = Math.min(sz, gz) - 7, bz1 = Math.max(sz, gz) + 7;
    // Each obstacle gets a comfortable margin, shrunk to bare body clearance when we (or the goal) are already
    // inside the comfortable one, and dropped when we stand inside even that (climbing out, squeezed).
    const add = (r, m, mm) => {
      let e = { x0: r.x0 - m, x1: r.x1 + m, z0: r.z0 - m, z1: r.z1 + m };
      if (e.x1 < bx0 || e.x0 > bx1 || e.z1 < bz0 || e.z0 > bz1) return;
      if (inside(e, sx, sz) || inside(e, gx, gz)) {
        e = { x0: r.x0 - mm, x1: r.x1 + mm, z0: r.z0 - mm, z1: r.z1 + mm };
        if (inside(e, sx, sz)) return;
      }
      rs.push(e);
    };
    for (const r of w.obst) {
      if (r.kind === 'hole') {
        if (r.plot === o.ignorePlot) continue;
        add(r, o.drag && r.plot !== o.targetPlot ? 1.0 : 0.45, 0.25);
      } else add(r, r.kind === 'danger' ? 0.6 : o.drag ? 0.95 : 0.5, 0.33);
    }
    if (o.drag) { // keep dragged coffins off flat plots too: one left lying there blocks the grave when it reopens
      for (const pl of sim.plots) {
        if (pl.depth > 0.06 || pl.i === o.targetPlot) continue;
        add({ x0: pl.x - PLOT_HALF.x, x1: pl.x + PLOT_HALF.x, z0: pl.z - PLOT_HALF.z, z1: pl.z + PLOT_HALF.z }, 0.6, 0.2);
      }
    }
    // walk around coffins (bumping them tips them over); a dragged coffin needs more room
    for (const c of w.coffins) {
      if (c === o.drag || c === o.except || w.inPlot.has(c) || c.body.position.y > 1.5) continue;
      add(coffinBox(c), o.drag ? 0.65 : 0.42, 0.3);
    }
    // a goal inside an obstacle (a corpse on the truck bed) becomes the nearest point outside it
    for (let k = 0; k < 3; k++) {
      let moved = false;
      for (const e of rs) if (inside(e, gx, gz)) { [gx, gz] = pushOut(e, gx, gz); moved = true; }
      if (!moved) break;
    }
    gx = clamp(gx, -YARD, YARD); gz = clamp(gz, -YARD, YARD);
    const clear = (ax, az, bx, bz) => { for (const e of rs) if (segHits(ax, az, bx, bz, e)) return false; return true; };
    if (clear(sx, sz, gx, gz)) return { pts: [{ x: gx, z: gz }], gx, gz };
    const nodes = [{ x: sx, z: sz }, { x: gx, z: gz }];
    for (const e of rs) {
      for (const [x, z] of [[e.x0 - 0.06, e.z0 - 0.06], [e.x1 + 0.06, e.z0 - 0.06], [e.x0 - 0.06, e.z1 + 0.06], [e.x1 + 0.06, e.z1 + 0.06]]) {
        if (Math.abs(x) > YARD + 1 || Math.abs(z) > YARD + 1) continue;
        if (rs.some((f) => inside(f, x, z))) continue;
        nodes.push({ x, z });
      }
    }
    const n = nodes.length, g = new Float64Array(n).fill(Infinity), prev = new Int32Array(n).fill(-1), done = new Uint8Array(n);
    const d = (i, j) => hyp(nodes[i].x - nodes[j].x, nodes[i].z - nodes[j].z);
    g[0] = 0;
    for (;;) {
      let bi = -1, bf = Infinity;
      for (let i = 0; i < n; i++) if (!done[i] && g[i] < Infinity) { const f = g[i] + d(i, 1); if (f < bf) { bf = f; bi = i; } }
      if (bi < 0 || bi === 1) break;
      done[bi] = 1;
      for (let j = 0; j < n; j++) {
        if (done[j]) continue;
        const nd = g[bi] + d(bi, j);
        if (nd < g[j] && clear(nodes[bi].x, nodes[bi].z, nodes[j].x, nodes[j].z)) { g[j] = nd; prev[j] = bi; }
      }
    }
    if (prev[1] < 0) return { pts: [{ x: gx, z: gz }], gx, gz }; // boxed in: head straight, the stall logic copes
    const pts = [];
    for (let i = 1; i > 0; i = prev[i]) pts.push({ x: nodes[i].x, z: nodes[i].z });
    pts.reverse();
    return { pts, gx, gz };
  }

  // ---------- low-level control ----------
  function toggle(b, key) {
    if (T < b.actT) return false;
    b.inp[key]++;
    b.actT = T + 0.3;
    return true;
  }
  function turn(b, want, rate, dt) {
    const e = angDiff(want, b.yaw), step = rate * dt;
    b.yaw += Math.abs(e) <= step ? e : Math.sign(e) * step;
    b.yaw = angDiff(b.yaw, 0);
  }
  function face(b, p, x, z, dt) {
    const pos = p.body.position;
    if (hyp(x - pos.x, z - pos.z) > 0.05) turn(b, Math.atan2(x - pos.x, z - pos.z), turnRate(b, p), dt);
  }
  const turnRate = (b, p) => (p.grab ? (p.grab.coffin ? Math.min(1.6, b.persona.turn * 0.45) : 1.5) : b.persona.turn);

  // Head for (gx, gz) along a planned path. o: { arrive, slow, run, drag, targetPlot, ignorePlot }
  function go(b, p, gx, gz, o, dt) {
    const pos = p.body.position;
    if (!b.path || T > b.pathT + 0.9 || hyp(gx - b.pgx, gz - b.pgz) > 0.5) {
      const r = findPath(pos.x, pos.z, gx, gz, o);
      b.path = r.pts; b.wpi = 0; b.pathT = T; b.pgx = gx; b.pgz = gz; b.goalX = r.gx; b.goalZ = r.gz;
    }
    let wp = b.path[b.wpi];
    while (b.wpi < b.path.length - 1 && hyp(wp.x - pos.x, wp.z - pos.z) < 0.45) wp = b.path[++b.wpi];
    let remain = hyp(wp.x - pos.x, wp.z - pos.z);
    for (let i = b.wpi; i < b.path.length - 1; i++) remain += hyp(b.path[i + 1].x - b.path[i].x, b.path[i + 1].z - b.path[i].z);
    const arrive = o.arrive ?? 0.4;
    if (remain < arrive) { b.wantMove = false; return remain; }
    steer(b, p, dt, wp.x, wp.z, remain, o);
    return remain;
  }
  function steer(b, p, dt, tx, tz, remain, o) {
    const pos = p.body.position, inp = b.inp;
    const want = Math.atan2(tx - pos.x, tz - pos.z);
    turn(b, want, turnRate(b, p), dt);
    const err = Math.abs(angDiff(want, b.yaw));
    // dragging a coffin: finish turning on the spot first, walking while turning shoves it sideways
    let mz = (o.drag ? clamp((0.6 - err) / 0.35, 0, 1) : clamp((1.45 - err) / 1.1, 0, 1)) * b.persona.speed;
    const slow = o.slow ?? 1.2;
    if (remain < slow) mz *= Math.max(0.3, remain / slow);
    inp.mz = mz;
    inp.run = !!o.run && !p.grab && err < 0.3 && remain > 5;
    // step around teammates instead of shoving through them
    const fx = Math.sin(b.yaw), fz = Math.cos(b.yaw), rx = -fz, rz = fx;
    for (const d of world().diggers) {
      if (d.id === b.id || d.rag) continue;
      const q = d.body.position, ox = q.x - pos.x, oz = q.z - pos.z, dd = hyp(ox, oz);
      if (dd > 1.3 || dd < 1e-3 || ox * fx + oz * fz < -0.2) continue;
      const lat = ox * rx + oz * rz;
      inp.mx += (lat >= 0 ? -1 : 1) * (1.3 - dd) * 0.9;
    }
    inp.mx = clamp(inp.mx, -1, 1);
    b.wantMove = mz > 0.3;
  }

  // Walk up to an entity and grab it once the hand is close enough (same findGrab check a human's click runs).
  function approachGrab(b, p, ent, pt, t, dt, o = {}) {
    const pos = p.body.position;
    const d = hyp(pt.x - pos.x, pt.z - pos.z);
    if (d < 2.6 && !sim.holders(ent)) {
      const g = sim.findGrab(p);
      if (g && g.ent !== ent && t.kind === 'load' && g.ent.kind === 'corpse' && T - t.st0 > 1.5 && swapCorpse(b, p, t, g.ent)) ent = g.ent; // any loose body in reach will do
      if (g && g.ent === ent) {
        // a torso grip lasts longest; take a limb only after fumbling for a moment
        const part = g.body.partIndex, torso = part === P.chest || part === P.pelvis;
        const limb = part === P.farmL || part === P.farmR || part === P.shinL || part === P.shinR;
        t.pickT = (t.pickT || 0) + dt;
        if (torso || t.pickT > (limb ? 2.2 : 1.0)) {
          if (toggle(b, 'g')) { b.pauseT = T + 0.1 + b.r() * b.persona.hesitate * 0.6; t.pickT = 0; }
          return;
        }
      }
    }
    let gx = pt.x, gz = pt.z;
    if (t.alt) { gx += Math.cos(t.altA) * 0.9; gz += Math.sin(t.altA) * 0.9; }
    const remain = go(b, p, gx, gz, { arrive: t.alt ? 0.3 : 0.55, slow: 1.4, run: true, ...o }, dt);
    if (remain < 0.6 || d < 1.1) {
      face(b, p, pt.x, pt.z, dt);
      if (d > 0.9 && remain < 0.6) { b.inp.mz = 0.3; b.wantMove = false; }
    }
    if (d < 2.2) {
      t.nearT = (t.nearT || 0) + dt;
      if (t.nearT > 3) { // no luck from this side: try another
        t.nearT = 0; t.alt = (t.alt || 0) + 1;
        t.altA = Math.atan2(pos.z - pt.z, pos.x - pt.x) + (t.alt % 2 ? 1.4 : -1.4);
        b.path = null;
      }
    }
  }

  // Take the body that is actually in reach instead of the one we were aiming for (they are all the same to a gravedigger).
  function swapCorpse(b, p, t, k) {
    const w = world();
    if (w.boxedIn.has(k) || heldByOthers(w, p, k) || !isFree(b, 'e' + k.id) || corpseOnMovingTruck(k)) return false;
    claims.delete('e' + t.corpse.id); b.claims.delete('e' + t.corpse.id);
    claim(b, 'e' + k.id);
    t.keys = ['e' + k.id, 'L' + t.coffin.id];
    t.corpse = k; t.hole = holePlotOf(k.bodies[P.pelvis].position);
    return true;
  }
  function swapCoffin(b, p, t, c) {
    const w = world();
    if (w.inPlot.has(c) || w.up.get(c) < 0.72 || heldByOthers(w, p, c) || !isFree(b, 'e' + c.id) || !isFree(b, 'L' + c.id) || !w.contents.get(c) !== !!t.empty) return false;
    claims.delete('e' + t.coffin.id); b.claims.delete('e' + t.coffin.id);
    claim(b, 'e' + c.id);
    t.keys = t.keys.map((k) => (k === 'e' + t.coffin.id ? 'e' + c.id : k));
    t.coffin = c; t.cspot = null;
    return true;
  }
  // Which plot graveAssist would drop this coffin into right now (mirrors game.js, first match wins).
  function assistPlot(c) {
    const q = c.body.position;
    if (sim.coffinUp(c) < 0.6 || q.y < 0) return null;
    return sim.plots.find((pl) => !pl.buried && pl.depth >= ASSIST_DEPTH && Math.abs(q.x - pl.x) < ZONE_X && Math.abs(q.z - pl.z) < ZONE_Z) || null;
  }
  // world-space horizontal axes of a coffin (its length is local z)
  function coffinAxes(c) {
    const { x, y, z, w } = c.body.quaternion;
    let lx = 2 * (x * z + w * y), lz = 1 - 2 * (x * x + y * y), n = hyp(lx, lz) || 1;
    lx /= n; lz /= n;
    return { lx, lz, sx: lz, sz: -lx };
  }
  function coffinBox(c, m = 0) {
    const a = coffinAxes(c), q = c.body.position;
    const ex = Math.abs(a.lx) * COFFIN.hz + Math.abs(a.sx) * COFFIN.hx + m, ez = Math.abs(a.lz) * COFFIN.hz + Math.abs(a.sz) * COFFIN.hx + m;
    return { x0: q.x - ex, x1: q.x + ex, z0: q.z - ez, z1: q.z + ez };
  }
  const overlapsPlot = (bx, pl, m) => bx.x1 > pl.x - PLOT_HALF.x - m && bx.x0 < pl.x + PLOT_HALF.x + m && bx.z1 > pl.z - PLOT_HALF.z - m && bx.z0 < pl.z + PLOT_HALF.z + m;
  // Where to stand to grab a coffin: at an end or a side that is free, near us and (when dragging) toward the destination,
  // so the coffin trails behind instead of being shoved ahead.
  function coffinSpot(b, p, c, t, dest) {
    const w = world(), q = c.body.position, pos = p.body.position, a = coffinAxes(c);
    const L = COFFIN.hz + 0.55, S = COFFIN.hx + 0.55;
    const cand = [[a.lx * L, a.lz * L], [-a.lx * L, -a.lz * L], [a.sx * S, a.sz * S], [-a.sx * S, -a.sz * S]];
    let best = null, bs = Infinity;
    cand.forEach(([dx, dz], i) => {
      const x = q.x + dx, z = q.z + dz;
      let s = hyp(x - pos.x, z - pos.z) + (dest ? 0.5 * hyp(x - dest.x, z - dest.z) : 0) + (i === t.badSpot ? 20 : 0);
      for (const o of w.coffins) if (o !== c && hyp(o.body.position.x - x, o.body.position.z - z) < 1.5) s += 6;
      for (const r of w.obst) if (inside({ x0: r.x0 - 0.3, x1: r.x1 + 0.3, z0: r.z0 - 0.3, z1: r.z1 + 0.3 }, x, z)) s += 30;
      for (const d of w.diggers) if (d.id !== b.id && hyp(d.body.position.x - x, d.body.position.z - z) < 0.7) s += 3;
      if (Math.abs(x) > YARD || Math.abs(z) > YARD) s += 100;
      if (s < bs) { bs = s; best = { x, z, i }; }
    });
    return best;
  }
  function approachCoffin(b, p, c, t, dt, dest) {
    const q = c.body.position, pos = p.body.position;
    if (hyp(q.x - pos.x, q.z - pos.z) < 2.8 && !sim.holders(c)) {
      const g = sim.findGrab(p);
      if (g && g.ent !== c && g.ent.kind === 'coffin' && t.kind === 'deliver' && T - t.st0 > 1 && swapCoffin(b, p, t, g.ent)) c = g.ent; // its twin is in reach
      if (g && g.ent === c) { if (toggle(b, 'g')) b.pauseT = T + 0.1 + b.r() * b.persona.hesitate * 0.5; return; }
    }
    const cq = c.body.position;
    if (!t.cspot || T > t.cspotT) { t.cspot = coffinSpot(b, p, c, t, dest); t.cspotT = T + 1.5; }
    const r = go(b, p, t.cspot.x, t.cspot.z, { arrive: 0.2, slow: 1.2, run: true, except: c }, dt);
    if (r < 0.5) {
      face(b, p, cq.x, cq.z, dt);
      b.inp.mz = 0.25; b.wantMove = false;
      t.nearT = (t.nearT || 0) + dt;
      if (t.nearT > 2.5) { t.nearT = 0; t.badSpot = t.cspot.i; t.cspot = null; b.path = null; }
    }
  }
  function settled(c, k) {
    for (const bd of k.bodies) {
      const l = c.body.pointToLocalFrame(bd.position);
      if (Math.abs(l.x) > COFFIN.hx + 0.02 || Math.abs(l.z) > COFFIN.hz + 0.02 || l.y > COFFIN.hy + 0.1) return false;
    }
    return true;
  }
  const plotOk = (w, pl) => pl && !pl.buried && pl.depth >= READY && !w.plotCoffin.has(pl) && !w.holeBody.has(pl.i);
  // let go of whatever we hold, unless that would drop a coffin into a hole that is not ready for it
  function dropSafely(b, p, dt) {
    if (!p.grab) return;
    if (p.grab.coffin) {
      const c = p.grab.ent, bx = coffinBox(c);
      const pl = assistPlot(c) || sim.plots.find((o) => !o.buried && overlapsPlot(bx, o, 0.2));
      if (pl && !plotOk(world(), pl) && (b.dropT = (b.dropT || 0) + dt) < 6) { // walk on, away from that plot
        const pos = p.body.position;
        steer(b, p, dt, pos.x + (pos.x - pl.x) * 3, pos.z + (pos.z - pl.z) * 3, 5, {});
        return;
      }
    }
    b.dropT = 0;
    toggle(b, 'g');
  }

  function digSpots(pl) {
    return [[pl.x + DIG_OFF_X, pl.z], [pl.x - DIG_OFF_X, pl.z], [pl.x, pl.z + DIG_OFF_Z], [pl.x, pl.z - DIG_OFF_Z]];
  }
  function pickSpot(b, p, pl, t, far = 0, sides = false) {
    const pos = p.body.position, w = world();
    let best = null, bs = Infinity;
    digSpots(pl).forEach(([x0, z0], i) => {
      const x = pl.x + (x0 - pl.x) * (1 + far), z = pl.z + (z0 - pl.z) * (1 + far * 0.6);
      let s = hyp(x - pos.x, z - pos.z) + (i === t.badSpot ? 50 : 0) + (sides && i > 1 ? 12 : 0) + (i === (t.alt || 0) % 4 && t.alt ? -3 : 0);
      for (const r of w.obst) if (r.plot !== pl.i && inside({ x0: r.x0 - 0.35, x1: r.x1 + 0.35, z0: r.z0 - 0.35, z1: r.z1 + 0.35 }, x, z)) s += 30;
      for (const d of w.diggers) if (d.id !== b.id && hyp(d.body.position.x - x, d.body.position.z - z) < 0.8) s += 8;
      if (Math.abs(x) > YARD || Math.abs(z) > YARD) s += 100;
      if (s < bs) { bs = s; best = { x, z, i }; }
    });
    return best;
  }

  // ---------- jobs ----------
  function corpseOnMovingTruck(k) {
    const tr = sim.truck;
    if (tr.state === 'wait') return false;
    const q = k.bodies[P.pelvis].position, tb = tr.body.position;
    return q.y > 0.6 && Math.abs(q.z - tb.z) < 1.3 && q.x > tb.x + TRUCK_X0 - 0.3 && q.x < tb.x + TRUCK_X1 + 0.3;
  }
  function holePlotOf(q) {
    if (q.y > -0.3) return -1;
    return plotAt(q.x, q.z, 0.05);
  }
  function coffinsForLoad(b, p, w) {
    const out = [];
    for (const c of w.coffins) {
      if (w.up.get(c) < 0.72 || w.contents.get(c) || heldByOthers(w, p, c) || !isFree(b, 'L' + c.id) || !isFree(b, 'e' + c.id)) continue;
      if (!inYard(c.body.position) || banned(b, 'L' + c.id)) continue;
      const pl = w.inPlot.get(c);
      if (pl && pl.buried) continue;
      out.push({ c, dump: !!pl, plot: pl || null });
    }
    return out;
  }
  function plotForDeliver(b, c, w, empty = false) {
    const q = c.body.position;
    let best = null, bs = Infinity;
    for (const pl of sim.plots) {
      if (pl.buried || w.plotCoffin.has(pl) || w.holeBody.has(pl.i) || !isFree(b, 'd' + pl.i) || banned(b, 'd' + pl.i)) continue;
      const digging = claims.has('p' + pl.i) && claims.get('p' + pl.i) !== b.id && bots.has(claims.get('p' + pl.i));
      if (pl.depth < READY && (empty || !digging)) continue;
      const s = hyp(pl.x - q.x, pl.z - q.z) + (pl.depth < READY ? 6 : 0);
      if (s < bs) { bs = s; best = pl; }
    }
    return best;
  }
  // Where to park a full coffin until a grave opens: beside the plot that opens next, outside every drop zone.
  function stagingSpot(b, c, w) {
    // graves being dug or waiting get their coffin delivered directly; park by the ones that open later (oldest burial first)
    const rank = (pl) => (pl.buried ? 100 + pl.buriedAt / 1000 : 1);
    const cands = sim.plots.filter((pl) => !w.plotCoffin.has(pl) && pl.depth <= 0.06 && !claims.has('d' + pl.i) && !claims.has('p' + pl.i))
      .sort((a, z) => rank(a) - rank(z));
    for (const pl of cands.slice(0, c && hyp(c.body.position.x - PILE.x, c.body.position.z - PILE.z) < 3.6 ? 2 : 10)) { // from the pile: only for the next two graves
      if (!isFree(b, 's' + pl.i)) continue;
      const z = pl.z > 0 ? pl.z + ZONE_Z + 1.3 : pl.z - ZONE_Z - 1.3;
      for (const dx of [0, 1.2, -1.2]) { // clear of posts and stones, or the coffin hooks on them
        const x = pl.x + dx;
        if (w.obst.some((r) => r.kind === 'solid' && rectDist(r, x, z) < 1.8)) continue;
        if (w.coffins.some((o) => o !== c && hyp(o.body.position.x - x, o.body.position.z - z) < 1.6)) continue;
        return { plot: pl, x, z };
      }
    }
    return null;
  }
  const rectDist = (r, x, z) => hyp(Math.max(0, r.x0 - x, x - r.x1), Math.max(0, r.z0 - z, z - r.z1));
  // somewhere a coffin can be left: off every plot, clear of posts and stones, off the road
  function safeToLeave(c) {
    const bx = coffinBox(c), q = c.body.position;
    if (sim.plots.some((o) => overlapsPlot(bx, o, 0.5))) return false;
    if (Math.abs(q.z - ROAD_Z) < 3) return false;
    return !world().obst.some((r) => r.kind === 'solid' && rectDist(r, q.x, q.z) < 1.5);
  }
  function plotCovered(pl, w) {
    const near = (q, m) => Math.abs(q.x - pl.x) < PLOT_HALF.x + m && Math.abs(q.z - pl.z) < PLOT_HALF.z + m && q.y > -0.3 && q.y < 2;
    for (const k of w.corpses) if (near(k.bodies[P.pelvis].position, 0.2) || near(k.bodies[P.chest].position, 0.2)) return true;
    for (const c of w.coffins) if (!w.inPlot.has(c) && c.body.position.y > -0.3 && overlapsPlot(coffinBox(c), pl, 0.25)) return true;
    for (const d of w.diggers) if (!d.rag && near(d.body.position, -0.1)) return true;
    return false;
  }

  function choose(b, p, w) {
    const me = p.body.position, rw = ROLE_W[b.role];
    const dist = (q) => hyp(q.x - me.x, q.z - me.z);
    let best = null, bestS = -Infinity;
    const consider = (s, t) => { if (s > bestS) { bestS = s; best = t; } };

    for (const pl of sim.plots) { // fill a grave that has a coffin with a body in it
      if (pl.buried || !w.plotCoffin.has(pl) || !isFree(b, 'p' + pl.i) || banned(b, 'p' + pl.i)) continue;
      if (sim.plotStatus(pl).act !== 'fill') continue;
      consider(BASE.fill * rw.fill - COST_PER_M * dist(pl), { kind: 'fill', plot: pl, keys: ['p' + pl.i] });
    }
    // bookkeeping for the supply chain: loose corpses need coffins, coffins need graves
    let loose = 0, full = 0, ready = 0, digging = 0, graveBoxes = 0, emptyRuns = 0;
    for (const k of w.corpses) if (!w.boxedIn.has(k) && inYard(k.bodies[P.pelvis].position)) loose++;
    for (const c of w.coffins) {
      const pl = w.inPlot.get(c);
      if (pl) { if (!w.contents.get(c) && w.up.get(c) > 0.72) graveBoxes++; } else if (w.contents.get(c) && w.up.get(c) > 0.5) full++;
    }
    for (const pl of sim.plots) if (plotOk(w, pl)) ready++;
    for (const o of bots.values()) {
      if (!o.task) continue;
      if (o.task.kind === 'dig') digging++;
      else if (o.task.kind === 'deliver' && o.task.empty) emptyRuns++;
    }

    for (const c of w.coffins) { // deliver a coffin to a dug grave: full ones first, empty ones for the corpses still to come
      if (w.inPlot.has(c) || w.up.get(c) < 0.6 || heldByOthers(w, p, c)) continue;
      if (!isFree(b, 'e' + c.id) || !isFree(b, 'L' + c.id) || banned(b, 'e' + c.id) || !inYard(c.body.position)) continue;
      const empty = !w.contents.get(c);
      if (empty && (w.up.get(c) < 0.72 || loose <= graveBoxes + emptyRuns || ready <= full)) continue;
      const pl = plotForDeliver(b, c, w, empty);
      if (!pl) continue;
      const q = c.body.position, rdy = plotOk(w, pl);
      // dragging is slow, so the coffin nearest the grave matters most; a grave that is ready now comes first
      consider((BASE.deliver + (rdy ? 22 : 0)) * rw.deliver - COST_PER_M * dist(q) - 1.4 * hyp(pl.x - q.x, pl.z - q.z) - (empty ? 8 : 0),
        { kind: 'deliver', coffin: c, plot: pl, empty, keys: ['e' + c.id, 'd' + pl.i] });
    }
    for (const c of w.coffins) { // park a full coffin that clutters the pile (every grave taken), any coffin sitting on a plot, or a stray
      if (w.inPlot.has(c) || w.up.get(c) < 0.6 || heldByOthers(w, p, c) || !isFree(b, 'e' + c.id) || !isFree(b, 'L' + c.id) || banned(b, 'e' + c.id)) continue;
      const q = c.body.position, full = !!w.contents.get(c);
      const bx = coffinBox(c), covers = sim.plots.some((pl) => !pl.buried && overlapsPlot(bx, pl, 0.25)) || (stray(q) && inYard(q));
      if (!covers && (!full || hyp(q.x - PILE.x, q.z - PILE.z) > 3.6)) continue;
      if (full && plotForDeliver(b, c, w)) continue;
      const st = stagingSpot(b, c, w);
      if (st) consider((BASE.stage + (covers ? 15 : 0)) * rw.deliver - COST_PER_M * dist(q), { kind: 'deliver', coffin: c, plot: st.plot, staging: st, empty: !full, keys: ['e' + c.id, 's' + st.plot.i] });
    }
    const boxes = coffinsForLoad(b, p, w);
    if (boxes.length) { // load a loose corpse into a coffin (one waiting in a grave is best)
      const tr = sim.truck, late = tr.state === 'wait' && sim.time - tr.t > 55;
      for (const k of w.corpses) {
        if (w.boxedIn.has(k) || heldByOthers(w, p, k) || !isFree(b, 'e' + k.id) || banned(b, 'e' + k.id)) continue;
        const q = k.bodies[P.chest].position;
        if (!inYard(q) || corpseOnMovingTruck(k)) continue;
        const hole = holePlotOf(k.bodies[P.pelvis].position);
        let bc = null, bd = Infinity;
        if (hole >= 0 && w.plotCoffin.has(sim.plots[hole])) { // it missed the coffin in that grave: hop in and fix it
          bc = boxes.find((x) => x.c === w.plotCoffin.get(sim.plots[hole]));
          if (!bc) continue;
          bd = 0;
        } else {
          for (const x of boxes) {
            const cq = x.c.body.position, dd = hyp(cq.x - q.x, cq.z - q.z) - (x.dump ? 8 : 0);
            if (dd < bd) { bd = dd; bc = x; }
          }
        }
        const onBed = q.y > 0.6 && Math.abs(q.z - ROAD_Z) < 1.3;
        consider(BASE.load * rw.load - COST_PER_M * dist(q) - 0.35 * Math.max(0, bd) - (hole >= 0 ? 12 : 0) + (onBed && late ? 10 : 0) + (bc.dump ? 4 : 0),
          { kind: 'load', corpse: k, coffin: bc.c, dump: bc.dump, hole, keys: ['e' + k.id, 'L' + bc.c.id] });
      }
    }
    { // dig: keep enough graves open for the coffins and corpses on their way
      const want = clamp(full + loose, 1, 3);
      for (const pl of sim.plots) {
        if (pl.buried || w.plotCoffin.has(pl) || pl.depth >= PLOT_MAX_DEPTH - 1e-3 || !isFree(b, 'p' + pl.i) || banned(b, 'p' + pl.i)) continue;
        const started = pl.depth > 0.05;
        if (!started && ready + digging + graveBoxes >= want) continue;
        if (plotCovered(pl, w)) continue;
        const s = BASE.dig * rw.dig - COST_PER_M * dist(pl) - 0.25 * hyp(pl.x - PILE.x, pl.z - PILE.z) + (started ? 8 : 0);
        consider(s, { kind: 'dig', plot: pl, keys: ['p' + pl.i] });
      }
    }
    for (const c of w.coffins) { // a coffin tipped inside a grave blocks it: hop in and right it
      const pl = w.inPlot.get(c);
      if (!pl || pl.buried || w.up.get(c) >= 0.72 || heldByOthers(w, p, c) || !isFree(b, 'e' + c.id) || banned(b, 'e' + c.id)) continue;
      consider((BASE.flip + 30) * rw.flip - COST_PER_M * dist(c.body.position), { kind: 'flip', coffin: c, inPlot: pl.i, keys: ['e' + c.id] });
    }
    { // flip a tipped coffin when coffins run short
      let usable = 0;
      for (const c of w.coffins) if (w.up.get(c) > 0.72 && !w.contents.get(c) && !w.inPlot.has(c)) usable++;
      if (usable < 2 || w.coffins.length >= 6) {
        for (const c of w.coffins) {
          if (w.up.get(c) >= 0.72 || w.inPlot.has(c) || heldByOthers(w, p, c) || !isFree(b, 'e' + c.id) || banned(b, 'e' + c.id)) continue;
          const q = c.body.position;
          if (Math.abs(q.x) > 23 || Math.abs(q.z) > 23 || assistPlot(c)) continue; // flipping by the fence can toss it over
          consider(BASE.flip * rw.flip - COST_PER_M * dist(c.body.position), { kind: 'flip', coffin: c, keys: ['e' + c.id] });
        }
      }
    }
    return best;
  }

  function startTask(b, t) {
    releaseAll(b);
    for (const k of t.keys || []) claim(b, k);
    t.t0 = T; t.st0 = T; t.stage = t.stage || 'go'; t.tries = 0;
    b.task = t; b.path = null; b.hist.length = 0; b.stallN = 0;
    if (t.kind !== 'idle') say(b, `-> ${desc(t)}`);
  }
  function endTask(b, why, ok, ban = 12) {
    const t = b.task;
    if (!t) return;
    if (t.kind !== 'idle') say(b, `${ok ? 'done' : 'gave up'} ${t.kind} (${why})`);
    if (!ok && ban) for (const k of t.keys || []) b.black.set(k, T + ban);
    releaseAll(b);
    b.task = null; b.path = null;
    b.pauseT = T + b.r() * b.persona.hesitate * (ok ? 1.5 : 1);
    b.stats[ok ? 'done' : 'fail']++;
  }
  function stage(b, s) { b.task.stage = s; b.task.st0 = T; b.hist.length = 0; b.stallN = 0; b.path = null; }
  const desc = (t) => (t.foe ? `fight ${t.foe.name || (t.foe.z ? t.foe.z.def.name : 'zombie')}#${t.foe.id}` : t.kind) + (t.staging ? ' (park)' : '') + (t.empty ? ' (empty)' : '') + (t.corpse ? ` ${t.corpse.name}` : '') + (t.coffin ? ` coffin#${t.coffin.id}` : '') + (t.plot ? ` plot${t.plot.i}` : '') + (t.dump ? ' (into grave)' : '') + (t.inPlot !== undefined ? ' (in grave)' : '') + (t.hole >= 0 ? ' (from hole)' : '');
  const alive = (e) => e && sim.ents.includes(e);

  // Is the current job still worth doing? (also detects success)
  function validate(b, p, w) {
    const t = b.task, age = T - t.st0;
    switch (t.kind) {
      case 'idle': return true;
      case 'fight': {
        const e = t.foe;
        if (!alive(e) || !e.z) return endTask(b, 'gone', true, 0), false;
        if (e.z.mode === 'down') {
          if (e.z.hp <= 0) return endTask(b, 'down for good', true, 0), false;
          t.downT = (t.downT || 0) + PLAN_DT;
          if (t.downT > 5) return endTask(b, 'stays down', true, 0), false;
          return true;
        }
        t.downT = 0;
        const q = e.z.body.position;
        if (!inYard(q) || hyp(q.x - p.body.position.x, q.z - p.body.position.z) > 32) return endTask(b, 'out of reach', false, 6), false;
        if (age > 14) return endTask(b, 'cannot catch it', false, 8), false;
        return true;
      }
      case 'load': {
        const k = t.corpse;
        if (!alive(k)) return endTask(b, 'gone', false, 0), false;
        if (!cargo(k)) return endTask(b, 'it got up', false, 0), false;
        if (w.boxedIn.has(k) && !(p.grab && p.grab.ent === k)) return endTask(b, 'boxed', t.stage === 'verify'), false;
        if (heldByOthers(w, p, k)) return endTask(b, 'taken', false, 4), false;
        if (corpseOnMovingTruck(k) && !(p.grab && p.grab.ent === k)) return endTask(b, 'truck left', false, 0), false;
        if (age > 28 || T - t.t0 > 75) return endTask(b, 'too slow', false), false;
        return true;
      }
      case 'deliver': {
        const c = t.coffin;
        if (!alive(c)) return endTask(b, 'gone', t.stage === 'verify', 0), false;
        if (heldByOthers(w, p, c)) return endTask(b, 'taken', false, 4), false;
        if (w.inPlot.get(c) && t.stage !== 'verify') return endTask(b, 'in a grave', true), false;
        if (age > 45 || T - t.t0 > 100) return endTask(b, 'too slow', false), false;
        return true;
      }
      case 'dig': {
        const pl = t.plot;
        if (pl.buried) return endTask(b, 'buried', true), false;
        if (pl.depth >= PLOT_MAX_DEPTH - 1e-3 && sim.plotStatus(pl).act !== 'fill') return endTask(b, 'dug', true), false;
        if (w.plotCoffin.has(pl) && sim.plotStatus(pl).act !== 'fill') return endTask(b, 'blocked', false, 20), false;
        if (age > 30) return endTask(b, 'too slow', false), false;
        return true;
      }
      case 'fill': {
        const pl = t.plot;
        if (pl.buried) return endTask(b, 'buried', true), false;
        if (sim.plotStatus(pl).act !== 'fill') { t.bad = (t.bad || 0) + PLAN_DT; if (t.bad > 1.5) return endTask(b, 'nothing to fill', false, 3), false; } else t.bad = 0;
        if (age > 25) return endTask(b, 'too slow', false), false;
        return true;
      }
      case 'flip': {
        const c = t.coffin;
        if (!alive(c)) return endTask(b, 'gone', false, 0), false;
        if (heldByOthers(w, p, c)) return endTask(b, 'taken', false, 4), false;
        if (w.up.get(c) > 0.8 && !(p.grab && p.grab.ent === c)) return endTask(b, 'upright', true), false;
        if (t.tries > 5 || T - t.t0 > 40) return endTask(b, 'too stubborn', false, 25), false;
        return true;
      }
    }
    return false;
  }

  // ---------- night: the shovel ----------
  // Where a foe is: the walker capsule while it stands, its belly while it lies (a downed body never has e.z.body in the world).
  const foePos = (e) => (e.z && e.z.mode !== 'down' ? e.z.body.position : e.kind === 'corpse' ? e.bodies[P.pelvis].position : e.rag.bodies[0].position);
  function zombieNear(w, q, r) {
    for (const e of w.walkers) { const z = e.z.body.position; if (hyp(z.x - q.x, z.z - q.z) < r) return true; }
    return false;
  }
  // How badly this zombie needs a shovel from me (higher is more urgent; -Infinity: leave it). Priorities:
  // after me > scratching at a grave > a dog > chasing a teammate or heading for a grave > just close by.
  // Teammates already on it make it less attractive, so several zombies get spread over the crew.
  function threatScore(b, p, w, e) {
    const z = e.z, q = z.body.position, me = p.body.position;
    if (!inYard(q)) return -Infinity;
    const d = hyp(q.x - me.x, q.z - me.z), tg = z.target;
    let s;
    if (tg && tg.p === p && d < 14) s = 300;
    else if (tg && tg.plot) {
      const dp = hyp(tg.plot.x - q.x, tg.plot.z - q.z);
      if (z.digT > 0.2 || dp < 2) s = 220 + z.digT * 15; // the longer it scratches, the closer the tenant is to coming back out
      else if (dp < 10 || d < 9) s = 125;
      else return -Infinity;
    } else if (z.def.type === ZDOG && d < 14) s = 175;
    else if (tg && tg.p && d < 13 && hyp(tg.p.body.position.x - q.x, tg.p.body.position.z - q.z) < 8) s = 150;
    else if (d < 8) s = 110;
    else return -Infinity;
    if (z.def.type === ZDOG) s += 25;
    s -= 4 * d;
    if (!(tg && tg.p === p)) {
      let n = 0;
      for (const o of bots.values()) if (o !== b && o.task && o.task.kind === 'fight' && o.task.foe === e) n++;
      if (n >= (z.def.type === ZDRAGGER ? 2 : 1) + (z.digT > 2 ? 1 : 0)) return -Infinity;
      s -= 75 * n;
    }
    if (p.grab) s -= p.grab.coffin ? 35 : 20; // busy hands: only worth it when it matters
    if (banned(b, 'z' + e.id)) s -= 150;
    return s;
  }
  function pickThreat(b, p, w) {
    let best = null, bs = 30;
    for (const e of w.walkers) { const s = threatScore(b, p, w, e); if (s > bs) { bs = s; best = e; } }
    return best && { e: best, s: bs };
  }
  function doFight(b, p, t, dt) {
    const e = t.foe, z = e.z;
    if (!z) return;
    const pos = p.body.position, q = foePos(e), d = hyp(q.x - pos.x, q.z - pos.z);
    if (p.grab) { // hands free first: a coffin is set down properly unless the thing is right here
      if (p.grab.coffin && d > 5) dropSafely(b, p, dt); else toggle(b, 'g');
      return;
    }
    const want = Math.atan2(q.x - pos.x, q.z - pos.z), fr = b.persona.turn * 1.7;
    if (z.mode === 'down') { // it will get up again: wait beside it, shovel ready
      if (d > 2.4) go(b, p, q.x, q.z, { arrive: 1.6, slow: 1, run: d > 5 }, dt);
      else { turn(b, want, fr, dt); b.inp.mz = d < 1.2 ? -0.4 : 0; }
      return;
    }
    const type = z.def.type;
    const stand = (type === ZDRAGGER ? 1.85 : type === ZDOG ? 1.2 : 1.5) + t.jit;
    if (d > 3.5) { // run over there along a path; the goal only follows the zombie in steps (each move replans)
      if (t.gx === undefined || hyp(q.x - t.gx, q.z - t.gz) > 1.2) { t.gx = q.x; t.gz = q.z; }
      go(b, p, t.gx, t.gz, { arrive: 1.0, slow: 0.5, run: true }, dt);
    } else {
      turn(b, want, fr, dt);
      const err = Math.abs(angDiff(want, b.yaw));
      if (d > stand) { b.inp.mz = clamp((d - stand) * 1.5, 0.4, 1) * b.persona.speed * (err < 1 ? 1 : 0.3); b.inp.run = d > 2.6 && err < 0.4; b.wantMove = d > stand + 0.4; }
      else if (t.careful && d < stand - 0.4) b.inp.mz = -0.5; // the cautious ones step back
    }
    // swing when the blow will land on it: whackable now, or about to be (where it will be when the shovel comes down)
    if (sim.time - p.swingT < 0.6 || d > 3.2) { t.swingAt = 0; return; }
    const v = z.body.velocity, px = q.x + v.x * 0.16 - pos.x, pz = q.z + v.z * 0.16 - pos.z, pd = hyp(px, pz);
    const facing = pd < 0.6 || (px * Math.sin(b.yaw) + pz * Math.cos(b.yaw)) / pd > 0.45;
    const now = sim.whackable(p).length > 0;
    let go2 = now || (pd < 2.05 && facing && z.mode !== 'rise');
    if (!go2 && t.whiff && d < 2.9 && facing) { go2 = true; t.whiff = false; } // too eager: swings at the air
    if (!go2) { t.swingAt = 0; return; }
    if (!t.swingAt) { // reaction time, and now and then a fumble with the shovel (that is when they get you)
      t.swingAt = T + 0.04 + b.r() * (0.08 + b.persona.hesitate * 0.3);
      if (b.r() < 0.12 + b.persona.hesitate * 0.15) t.swingAt += 0.25 + b.r() * 0.45;
    }
    if (T < t.swingAt) return;
    if (!now && sim.findGrab(p)) return; // the click would grab whatever is lying here instead of swinging
    if (toggle(b, 'g')) { t.swingAt = 0; t.swings++; b.stats.swings++; t.st0 = T; }
  }

  function plan(b, p) {
    const w = world();
    if (w.walkers.length) { // something is up and about: does it need a shovel more than the job needs me?
      const th = pickThreat(b, p, w), cur = b.task && b.task.kind === 'fight' ? b.task : null;
      if (th && (!cur || (th.e !== cur.foe && th.s > (cur.foe.z && cur.foe.z.mode !== 'down' ? threatScore(b, p, w, cur.foe) : 60) + 40))) {
        startTask(b, { kind: 'fight', foe: th.e, keys: ['z' + th.e.id], jit: (b.r() - 0.5) * 0.4, careful: b.r() < 0.5, whiff: b.r() < 0.2 + b.persona.hesitate * 0.3, swings: 0 });
        b.pauseT = Math.min(b.pauseT, T + 0.1);
        b.stats.fights++;
      }
    }
    if (b.task && b.task.kind !== 'idle') validate(b, p, w);
    if (b.task && b.task.kind !== 'idle') return;
    const t = choose(b, p, w);
    if (t) startTask(b, t);
    else if (!b.task) startTask(b, { kind: 'idle' });
  }

  // ---------- per-job behaviour ----------
  function doLoad(b, p, t, dt) {
    const w = world(), k = t.corpse, pos = p.body.position;
    const mine = p.grab && p.grab.ent === k;
    if (p.grab && !mine) return dropSafely(b, p, dt);
    if (t.stage === 'verify') {
      b.wantMove = false;
      if (T - t.st0 > (t.dump ? 1.8 : 0.6)) {
        if (w.boxedIn.has(k) || w.contents.get(t.coffin) === k) return endTask(b, 'in the coffin', true);
        t.tries++; stage(b, 'go');
        t.hole = holePlotOf(k.bodies[P.pelvis].position); // missed: maybe it is lying in the grave now
      }
      return;
    }
    if (!mine) {
      if (t.stage === 'carry') { t.tries++; stage(b, 'go'); say(b, `dropped ${k.name}`); }
      if (t.tries > 6) return endTask(b, 'too slippery', false, 8);
      const pt = k.bodies[P.chest].position;
      return approachGrab(b, p, k, pt, t, dt, { ignorePlot: t.hole >= 0 ? t.hole : undefined });
    }
    if (t.stage !== 'carry') { stage(b, 'carry'); b.stats.grabs++; }
    // keep the target coffin valid, or pick another
    let c = t.coffin;
    const cpl = alive(c) ? w.inPlot.get(c) : null;
    const okC = alive(c) && w.up.get(c) > 0.72 && !w.contents.get(c) && !heldByOthers(w, p, c) && (!cpl || !cpl.buried) && !!cpl === !!t.dump;
    if (!okC) {
      const boxes = coffinsForLoad(b, p, w);
      let bd = Infinity, bc = null;
      for (const x of boxes) { const d = hyp(x.c.body.position.x - pos.x, x.c.body.position.z - pos.z) - (x.dump ? 8 : 0); if (d < bd) { bd = d; bc = x; } }
      if (!bc) { if (toggle(b, 'g')) endTask(b, 'no free coffin', false, 0); return; } // put them down and help elsewhere
      for (const key of [...b.claims]) if (key.startsWith('L')) { claims.delete(key); b.claims.delete(key); }
      claim(b, 'L' + bc.c.id); t.keys = ['e' + k.id, 'L' + bc.c.id];
      t.coffin = c = bc.c; t.dump = bc.dump; t.spot = null; b.path = null;
    }
    const hand = p.hand.position;
    if (t.dump) {
      const plot = w.inPlot.get(c);
      // standing in the grave on top of the coffin (fixing a miss): just let go, the coffin assist lays them in
      if ((pos.y < -0.3 && plotAt(pos.x, pos.z, 0.1) === plot.i) ||
        (Math.abs(hand.x - plot.x) < PLOT_HALF.x - 0.15 && Math.abs(hand.z - plot.z) < PLOT_HALF.z - 0.25)) {
        if (toggle(b, 'g')) stage(b, 'verify');
        return;
      }
      if (!t.spot) t.spot = pickSpot(b, p, plot, t, 0, true);
      const r = go(b, p, t.spot.x, t.spot.z, { arrive: 0.25, slow: 1.5 }, dt);
      if (r < 0.6) {
        face(b, p, plot.x, plot.z, dt); b.inp.mz = 0.2; b.wantMove = false;
        t.parkT = (t.parkT || 0) + dt;
        if (t.parkT > 2.5) { t.parkT = 0; t.badSpot = t.spot.i; t.spot = null; }
      }
      return;
    }
    const loc = c.body.pointToLocalFrame(hand);
    if (Math.abs(loc.x) < COFFIN.hx + 0.45 && Math.abs(loc.z) < COFFIN.hz + 0.45 && loc.y > -0.4 && loc.y < 1.9) {
      if (toggle(b, 'g')) stage(b, 'verify');
      return;
    }
    const cq = c.body.position;
    const r = go(b, p, cq.x, cq.z, { arrive: 0.5, slow: 2.0, except: c }, dt);
    if (r < 1.2) { face(b, p, cq.x, cq.z, dt); if (r < 0.6) { b.inp.mz = 0.3; b.wantMove = false; } }
  }

  function doDeliver(b, p, t, dt) {
    const w = world(), c = t.coffin, pos = p.body.position;
    const mine = p.grab && p.grab.ent === c;
    if (p.grab && !mine) return dropSafely(b, p, dt);
    if (t.stage === 'verify') {
      b.wantMove = false;
      if (T - t.st0 > 1.5) {
        if (w.inPlot.get(c)) return endTask(b, 'in the grave', true);
        t.tries++;
        if (t.tries > 3) return endTask(b, 'missed the grave', false);
        stage(b, 'go');
      }
      return;
    }
    if (!t.empty && !w.contents.get(c) && !mine) { t.noBodyT = (t.noBodyT || 0) + dt; if (t.noBodyT > 1) return endTask(b, 'coffin is empty', false, 3); } else t.noBodyT = 0;
    let pl = t.plot;
    if (!t.staging && (pl.buried || (w.plotCoffin.get(pl) && w.plotCoffin.get(pl) !== c) || (t.empty && !plotOk(w, pl)))) {
      const np = plotForDeliver(b, c, w, t.empty);
      if (!np) { if (!mine) return endTask(b, 'no grave', false, 3); }
      else { releaseAll(b); claim(b, 'e' + c.id); claim(b, 'd' + np.i); t.keys = ['e' + c.id, 'd' + np.i]; t.plot = pl = np; t.spot = null; b.path = null; }
    }
    if (!mine) {
      if (t.stage === 'drag') { if (!t.tossed) t.tries++; t.tossed = false; stage(b, 'go'); if (t.tries > 5) return endTask(b, 'keeps slipping', false); }
      return approachCoffin(b, p, c, t, dt, t.staging || pl);
    }
    if (t.stage !== 'drag') { stage(b, 'drag'); t.emptyT = 0; t.strT = 0; t.wigN = 0; t.wig = null; b.stats.grabs++; }
    if (!t.empty && !w.contents.get(c)) { // the passenger fell out: put the coffin down, someone reloads it
      t.emptyT += dt;
      if (t.emptyT > 0.6) { dropSafely(b, p, dt); if (!p.grab) endTask(b, 'body fell out', false, 0); }
      return;
    }
    t.emptyT = 0;
    // A passenger that dozed off is pinned in place by the physics engine and pins the coffin with it.
    // Heave-ho: toss the coffin a little (the jolt wakes them up) and grab it again.
    const k0 = w.contents.get(c);
    if (k0 && T > (t.tossT || 0) && k0.bodies.some((bd) => bd.sleepState === 2)) {
      if (toggle(b, 'th')) { t.tossT = T + 3; t.tossed = true; say(b, 'heave-ho (waking the passenger)'); }
      return;
    }
    // jammed (stuck on something, or shoving it instead of pulling): swing it around, else let go and grab elsewhere
    // (p.input is what we sent last frame: pushing forward, barely moving, the coffin lagging behind the hand)
    if (p.input.mz > 0.5 && (p.speed || 0) < 0.45 && (p.grab.stretch || 0) > 0.9) t.strT += dt;
    else t.strT = Math.max(0, t.strT - dt * 0.5);
    if (!t.wig && t.strT > 1.2) {
      t.strT = 0; t.wigN++;
      if (t.wigN > 3) { t.wigN = 0; t.badSpot = t.cspot ? t.cspot.i : -1; t.cspot = null; toggle(b, 'g'); say(b, 'coffin jammed, regrabbing'); return; }
      // snagged (on a post, a body, a seam): first toss it free and grab again, then try swinging it sideways
      if (t.wigN % 2) { if (toggle(b, 'th')) { t.tossed = true; say(b, 'heave-ho (snagged)'); } return; }
      t.wig = { until: T + 0.8, yaw: b.yaw + (t.wigN % 4 ? -1 : 1) * (0.8 + b.r() * 0.5) };
    }
    if (t.wig) {
      if (T > t.wig.until) { t.wig = null; b.path = null; }
      else { steer(b, p, dt, pos.x + Math.sin(t.wig.yaw) * 3, pos.z + Math.cos(t.wig.yaw) * 3, 5, {}); b.wantMove = false; return; }
    }
    if (t.staging) {
      const np = plotForDeliver(b, c, w, t.empty);
      if (np && isFree(b, 'd' + np.i)) { // a grave opened up: take it straight there
        releaseAll(b); claim(b, 'e' + c.id); claim(b, 'd' + np.i); t.keys = ['e' + c.id, 'd' + np.i];
        t.staging = null; t.plot = pl = np; t.spot = null; b.path = null;
      } else {
        const st = t.staging, q = c.body.position;
        // parking is optional: a coffin that will not budge stays where it is
        if (!t.mv || hyp(q.x - t.mv.x, q.z - t.mv.z) > 1) t.mv = { x: q.x, z: q.z, t: T };
        else if (T - t.mv.t > 6) { if (toggle(b, 'g')) endTask(b, 'will not budge', false, 60); return; }
        const r = go(b, p, st.x, st.z, { arrive: 0.4, slow: 1.0, drag: c }, dt);
        if ((hyp(q.x - st.x, q.z - st.z) < 1.6 || r < 0.5) && !assistPlot(c) && safeToLeave(c)) {
          if (toggle(b, 'g')) endTask(b, 'parked', true);
        } else if (r < 0.5) { st.z += st.z > 0 ? 0.5 : -0.5; st.x += (b.r() - 0.5) * 1.2; } // not a good place yet: shuffle on
        return;
      }
    }
    const into = assistPlot(c);
    if (into && plotOk(w, into) && (into === pl || isFree(b, 'd' + into.i)) && sim.coffinUp(c) > 0.7 && c.body.position.y > 0.02) {
      // let a passenger with limbs over the rim settle first, or they catch the grave edge and tip the coffin
      const k = w.contents.get(c);
      t.settleT = (t.settleT || 0) + dt;
      if (k && t.settleT < 1.5 && !settled(c, k)) { b.inp.mz = 0; b.wantMove = false; return; }
      if (toggle(b, 'g')) { t.dropPlot = into; t.settleT = 0; stage(b, 'verify'); }
      return;
    }
    t.settleT = 0;
    const ready = plotOk(w, pl);
    if (!t.spot || T > (t.spotT || 0)) { t.spot = pickSpot(b, p, pl, t, ready ? 0.1 : 1.6); t.spotT = T + 2.5; }
    const r = go(b, p, t.spot.x, t.spot.z, { arrive: ready ? 0.3 : 0.6, slow: 1.0, drag: c, targetPlot: pl.i }, dt);
    if (r < 0.7) {
      t.parkT = (t.parkT || 0) + dt;
      if (ready && t.parkT > 2.5) { t.parkT = 0; t.alt = (t.alt || 0) + 1; t.badSpot = t.spot.i; t.spot = null; } // coffin not in the zone from here
    } else t.parkT = 0;
  }

  function doWork(b, p, t, dt) { // dig or fill
    if (p.grab) return dropSafely(b, p, dt);
    const pl = t.plot;
    if (!t.spot) t.spot = pickSpot(b, p, pl, t);
    const pos = p.body.position;
    const r = go(b, p, t.spot.x, t.spot.z, { arrive: 0.25, slow: 1.2, run: true }, dt);
    if (r < 0.5) {
      face(b, p, pl.x, pl.z, dt);
      b.inp.mz = 0; b.inp.mx = 0; b.wantMove = false;
      if (sim.nearestPlot(p) === pl && p.grounded) { b.inp.dig = true; t.waitT = 0; }
      else {
        t.waitT = (t.waitT || 0) + dt;
        if (t.waitT > 2) { t.waitT = 0; t.badSpot = t.spot.i; t.spot = null; b.path = null; }
      }
    } else if (hyp(pos.x - pl.x, pos.z - pl.z) < 2.5 && sim.nearestPlot(p) === pl && p.grounded && r < 0.9) {
      b.inp.dig = true; b.inp.mz = 0; b.wantMove = false;
    }
  }

  function doFlip(b, p, t, dt) {
    const c = t.coffin, mine = p.grab && p.grab.ent === c;
    if (p.grab && !mine) return dropSafely(b, p, dt);
    if (t.stage === 'settle') {
      b.wantMove = false;
      if (T - t.st0 > 1.3) { t.tries++; stage(b, 'go'); t.badSpot = t.cspot ? t.cspot.i : -1; t.cspot = null; }
      return;
    }
    if (!mine) {
      if (t.inPlot === undefined) return approachCoffin(b, p, c, t, dt, null);
      return approachGrab(b, p, c, c.body.position, t, dt, { ignorePlot: t.inPlot }); // jump down into the grave
    }
    if (t.stage !== 'lift') stage(b, 'lift');
    const a = T - t.st0;
    b.wantMove = false;
    if (t.inPlot !== undefined) { // in a grave: turn to the wall and scramble out with it, it rolls over on the way
      const q = c.body.position, pos = p.body.position;
      turn(b, Math.atan2(pos.x - q.x, pos.z - q.z), 7, dt);
      if (a > 0.25) { b.inp.mz = 1; b.inp.jump = true; }
      if (a > 0.95 && toggle(b, 'g')) stage(b, 'settle');
      return;
    }
    if (a < 0.33) b.inp.jump = true;
    else if (a > 0.5 && toggle(b, 'g')) stage(b, 'settle');
  }

  function doIdle(b, p, t, dt) {
    if (p.grab) return dropSafely(b, p, dt);
    const tr = sim.truck, idx = [...bots.keys()].indexOf(b.id);
    if (!t.spot || T > t.next) {
      const waitTruck = tr.state === 'arrive' || (tr.state === 'away' && sim.time - tr.t > 9);
      const bx = waitTruck ? 2.5 + idx * 1.4 - 2 : -6 + idx * 2.6, bz = waitTruck ? 11.6 : 6.3;
      t.spot = { x: bx + (b.r() - 0.5) * 2, z: bz + (b.r() - 0.5) * 1.2 };
      t.next = T + 3 + b.r() * 4;
      t.look = b.r() * Math.PI * 2;
      t.n = (t.n || 0) + 1;
      if (t.n > 2 && b.r() < b.persona.flop * 0.25) flop(b, p, 1.2 + b.r() * 1.5, 'bored', true);
    }
    const r = go(b, p, t.spot.x, t.spot.z, { arrive: 0.4, slow: 1.2 }, dt);
    if (r < 0.4) { turn(b, t.look, 1.2, dt); b.wantMove = false; }
  }

  function flop(b, p, dur, why, show = false) {
    if (p.grab || p.rag || (show && zombieNear(world(), p.body.position, 8)) || !toggle(b, 'fl')) return;
    b.flopUntil = T + dur;
    say(b, `flop (${why})`);
    b.stats.flops++;
  }

  // In a hole: walk to the nearest long wall and hop out.
  function climb(b, p, dt) {
    const pos = p.body.position;
    const i = plotAt(pos.x, pos.z, 0.1);
    if (i < 0) return false;
    const pl = PLOTS[i];
    if (!b.climbT) { b.climbT = T; say(b, 'fell into a grave, climbing out'); b.stats.holes++; }
    let dir = pos.x >= pl.x ? 1 : -1;
    if (b.goalX !== undefined && Math.abs(b.goalX - pl.x) > 1.5) dir = Math.sign(b.goalX - pl.x);
    const k = Math.floor((T - b.climbT) / 2.5) % 4; // no luck at this wall: try the others in turn
    if (T - b.climbT > 10 && !p.grab && b.r() < dt * 0.5) { flop(b, p, 0.8, 'wriggling free'); b.climbT = T - 5; }
    let tx, tz;
    if (k < 2) { const d = k ? -dir : dir; tx = pl.x + d * (PLOT_HALF.x + 1.2); tz = clamp(pos.z, pl.z - PLOT_HALF.z + 0.35, pl.z + PLOT_HALF.z - 0.35); }
    else { const d = (k === 2) === (pos.z >= pl.z) ? 1 : -1; tz = pl.z + d * (PLOT_HALF.z + 1.2); tx = clamp(pos.x, pl.x - 0.2, pl.x + 0.2); }
    steer(b, p, dt, tx, tz, 5, {});
    b.inp.mz = Math.max(b.inp.mz, 0.6);
    if (Math.abs(angDiff(Math.atan2(tx - pos.x, tz - pos.z), b.yaw)) < 0.5) b.inp.jump = true;
    b.wantMove = false;
    return true;
  }

  function stallCheck(b, p) {
    if (T < b.stallNext) return;
    b.stallNext = T + 0.5;
    const q = p.body.position;
    b.hist.push({ x: q.x, z: q.z, m: b.wantMove });
    if (b.hist.length > 6) b.hist.shift();
    if (b.stallN && hyp(q.x - b.stallX, q.z - b.stallZ) > 2) b.stallN = 0;
    if (b.hist.length < 6 || !b.hist.every((h) => h.m)) return;
    const h0 = b.hist[0];
    if (hyp(q.x - h0.x, q.z - h0.z) > 0.3) return;
    b.stallN++; b.stats.stalls++;
    b.stallX = q.x; b.stallZ = q.z;
    b.hist.length = 0;
    say(b, `stalled #${b.stallN}${b.task ? ' on ' + b.task.kind : ''}`);
    if (b.stallN >= 3 && b.task && b.task.kind !== 'idle') { b.stallN = 0; b.stats.stuck++; endTask(b, 'stuck', false); return; }
    b.unstuck = { t0: T, side: b.r() < 0.5 ? -1 : 1 };
  }

  function celebrate() {
    const pl = sim.plots.reduce((a, c) => (c.buried && (!a || c.buriedAt > a.buriedAt) ? c : a), null);
    for (const b of bots.values()) {
      const p = sim.byId(b.id);
      if (!p || p.rag || p.grab || !pl) continue;
      const d = hyp(p.body.position.x - pl.x, p.body.position.z - pl.z);
      if (d > 8) continue;
      const roll = b.r();
      if (roll < b.persona.flop * 0.6) b.celebrate = { at: T + 0.2 + b.r() * 0.5, kind: 'flop' };
      else if (roll < 0.75) b.celebrate = { at: T + b.r() * 0.4, kind: 'hop' };
    }
  }

  // ---------- one bot, one frame ----------
  function tick(b, dt) {
    const p = sim.byId(b.id);
    if (!p) { releaseAll(b); bots.delete(b.id); return; }
    const inp = b.inp;
    inp.mx = 0; inp.mz = 0; inp.run = false; inp.jump = false; inp.dig = false;
    b.wantMove = false;
    if (p.rag) {
      b.yaw = p.yaw;
      const lying = sim.time - p.ragT;
      const w = world(), q = p.rag.bodies[0].position, threat = zombieNear(w, q, 12);
      if (threat) b.flopUntil = 0; // no lounging about with company around
      if (sim.holders(p)) b.getUpAt = 0; // a friend is carrying me: enjoy the ride
      else if (T > (b.flopUntil || 0) && (sim.phase === 'night' || threat ? lying > 0.62 && p.rag.bodies[0].velocity.length() < 3.5 : lying > 0.7 && lying < 6.5)) {
        // knocked over at night: back on your feet before it comes round for seconds
        if (!b.getUpAt) b.getUpAt = threat ? T + 0.05 + b.r() * (0.15 + b.persona.hesitate * 0.4) : sim.phase === 'night' ? T + 0.1 + b.r() * 0.6 : T + 0.4 + b.r() * 1.2;
        if (T > b.getUpAt) { toggle(b, 'fl'); b.getUpAt = 0; }
      }
      b.hist.length = 0; b.path = null;
      sim.setInput(b.id, { ...inp, yaw: b.yaw });
      return;
    }
    b.flopUntil = 0;
    if (b.climbT && (p.body.position.y > -0.05 || plotAt(p.body.position.x, p.body.position.z, 0.05) < 0)) { say(b, `out of the grave after ${(T - b.climbT).toFixed(1)}s`); b.climbT = 0; }
    const w = world();
    if (b.celebrate && T > b.celebrate.at) {
      if (b.celebrate.kind === 'flop') flop(b, p, 1 + b.r() * 1.5, 'R.I.P.!', true);
      else if (p.grounded) inp.jump = true;
      if (b.celebrate.kind === 'flop' || T > b.celebrate.at + 0.15) b.celebrate = null;
    }
    if (T >= b.nextPlan) { b.nextPlan = T + PLAN_DT * (0.8 + 0.4 * b.r()); plan(b, p); }
    const pos = p.body.position;
    // wearing a coffin as a hat (it landed on my head): go limp so it slides off
    const hat = w.coffins.some((c) => { const q = c.body.position; return q.y > pos.y + 1.2 && q.y < pos.y + 2.6 && hyp(q.x - pos.x, q.z - pos.z) < 0.8 && !w.held.get(c); });
    b.hatT = hat ? (b.hatT || 0) + dt : 0;
    if (b.hatT > 0.8 && !p.grab) { flop(b, p, 1.2, 'coffin on my head'); b.hatT = 0; }
    const tk = b.task ? (b.task.staging ? 'park' : b.task.kind) : 'none';
    b.stats.time[tk] = (b.stats.time[tk] || 0) + dt;
    b.mode = '';
    if (w.danger && inside({ x0: w.danger.x0 - 0.4, x1: w.danger.x1 + 0.4, z0: w.danger.z0 - 0.4, z1: w.danger.z1 + 0.4 }, pos.x, pos.z)) {
      b.mode = 'danger';
      steer(b, p, dt, pos.x, pos.z > ROAD_Z + 0.5 ? w.danger.z1 + 1.5 : w.danger.z0 - 1.5, 5, {}); // truck coming: get off the road
      inp.run = !p.grab; inp.mz = Math.max(inp.mz, 0.5);
    } else if (b.unstuck) {
      const a = T - b.unstuck.t0;
      b.mode = 'unstuck';
      if (a < 0.45) inp.mz = -1;
      else if (a < 1.1) { inp.mx = b.unstuck.side; inp.mz = 0.3; if (a < 0.6) inp.jump = true; }
      else { b.unstuck = null; b.path = null; }
    } else if (T < b.pauseT) {
      b.mode = 'pause';
      // a short pause: look around, scratch head
    } else {
      const t = b.task;
      let holeTarget = t && ((t.kind === 'load' && t.hole >= 0 && t.stage !== 'verify' && (!(p.grab && p.grab.ent === t.corpse) || t.dump)) ||
        (t.kind === 'flip' && t.inPlot !== undefined && t.stage !== 'settle') ||
        (t.kind === 'fight' && hyp(foePos(t.foe).x - pos.x, foePos(t.foe).z - pos.z) < 2.4)); // whack it from down here
      const sunk = pos.y < -0.12 && plotAt(pos.x, pos.z, 0.05) >= 0; // even a shallow hole needs a hop to get out
      b.holeT = sunk ? (b.holeT || 0) + dt : 0;
      if (holeTarget && b.holeT > 5) { endTask(b, "can't reach them down here", false, 15); holeTarget = false; }
      if (!(sunk && !holeTarget && climb(b, p, dt)) && t) {
        if (t.kind === 'load') doLoad(b, p, t, dt);
        else if (t.kind === 'deliver') doDeliver(b, p, t, dt);
        else if (t.kind === 'dig' || t.kind === 'fill') doWork(b, p, t, dt);
        else if (t.kind === 'flip') doFlip(b, p, t, dt);
        else if (t.kind === 'fight') doFight(b, p, t, dt);
        else doIdle(b, p, t, dt);
      }
    }
    stallCheck(b, p);
    sim.setInput(b.id, { ...inp, yaw: b.yaw });
  }

  function assignRoles() {
    const ids = [...bots.keys()], n = ids.length;
    ids.forEach((id, i) => { bots.get(id).role = n === 1 ? 'solo' : i === 0 || (n >= 5 && i === 3) ? 'digger' : 'hauler'; });
  }

  return {
    add(name) {
      const p = sim.addPlayer(name);
      const r = rng(hashName(p.name) ^ (++nAdded * 7919));
      const persona = {
        speed: 0.86 + r() * 0.14,  // some amble, some hurry
        turn: 2.6 + r() * 1.6,     // rad/s
        hesitate: 0.2 + r() * 0.6, // pause after finishing something
        flop: 0.15 + r() * 0.45,   // how theatrical they are
      };
      bots.set(p.id, {
        id: p.id, name: p.name, persona, r, role: 'solo', task: null, claims: new Set(), black: new Map(),
        inp: { mx: 0, mz: 0, yaw: p.yaw, run: false, jump: false, dig: false, g: 0, th: 0, fl: 0 }, yaw: p.yaw,
        nextPlan: T + r() * PLAN_DT, actT: 0, pauseT: T + 0.3 + r() * 1.2, path: null, pathT: 0, pgx: 0, pgz: 0, wpi: 0,
        hist: [], stallNext: 0, stallN: 0, unstuck: null, wantMove: false,
        stats: { time: {}, grabs: 0, done: 0, fail: 0, stalls: 0, stuck: 0, flops: 0, holes: 0, fights: 0, swings: 0 },
      });
      sim.setInput(p.id, { ...bots.get(p.id).inp });
      assignRoles();
      return p.id;
    },
    remove(id) {
      const b = bots.get(id);
      if (!b) return;
      releaseAll(b);
      bots.delete(id);
      sim.removePlayer(id);
      assignRoles();
    },
    get ids() { return [...bots.keys()]; },
    update(dt) {
      dt = Math.min(dt, 0.1);
      T += dt;
      if (sim.score > lastScore) { lastScore = sim.score; celebrate(); }
      for (const b of [...bots.values()]) tick(b, dt);
    },
  };
}

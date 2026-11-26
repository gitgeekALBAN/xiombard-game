import * as THREE from 'three';
import { Batch, MAT, G, M } from './models/environment.js';
import { rng } from '../shared/rng.js';
import { GATES, GATE_HALF } from '../shared/layout.js';
import { TUNING } from '../shared/tuning.js';

// The two road gates (see GATES in layout.js and updateGates in game.js): two plank leaves each, hung on the stone
// pillars of the gateway. Open by day (swung out onto the verge), shut at night. How they look follows their HP:
//   intact (67-100): every plank in place
//   cracked (34-66): planks torn off, others snapped short
//   skewed (1-33): what is left hangs crooked off its hinges
//   broken (0): the leaves lie flat in the road
// Every repair nails a fresh pale board across a leaf (up to two per leaf are shown).
// Each look of a leaf is one merged painted mesh (plus its hull) built at load; only one is shown at a time.

const W = GATE_HALF - 0.04, H = 2.15, PLANKS = 7;

function leafLook(state, seed) {
  const b = new Batch(), add = b.sub(new THREE.Matrix4()), R = rng(seed);
  const pw = W / PLANKS;
  const gone = new Set();
  if (state >= 1) { gone.add(1 + Math.floor(R() * 2)); gone.add(4 + Math.floor(R() * 2)); }
  if (state >= 2) gone.add(3);
  for (let i = 0; i < PLANKS; i++) {
    let h = H - (i % 2) * 0.08 + R.range(-0.05, 0.05);
    const snapped = state >= 1 && R() < 0.4;
    if (gone.has(i)) { if (state === 1) continue; h *= R.range(0.25, 0.4); } // torn off, a stump left
    else if (snapped) h *= R.range(0.55, 0.8);
    const tilt = state === 2 ? R.range(-0.16, 0.16) : R.range(-0.02, 0.02);
    add(G.box, MAT.board, M([0, h / 2 + 0.1, (i + 0.5) * pw], [tilt, 0, 0], [0.07, h, pw - 0.03]), 0.012);
  }
  // two rails and a brace on the inner face; when skewed the top rail hangs loose
  for (const [y, k] of [[0.45, 0], [1.7, 1]]) {
    const loose = state === 2 && k === 1;
    add(G.box, MAT.boardDark, M([0.065, y - (loose ? 0.15 : 0), W / 2 - (loose ? 0.2 : 0)], [loose ? 0.22 : 0, 0, 0], [0.05, 0.15, loose ? W * 0.75 : W]), 0.012);
  }
  if (state < 2) {
    const len = Math.hypot(1.25, W - 0.25), a = Math.atan2(1.25, W - 0.25);
    add(G.box, MAT.boardDark, M([0.07, 1.075, W / 2], [-a, 0, 0], [0.05, 0.14, len]), 0.012);
  }
  for (const y of [0.45, 1.7]) add(G.box, MAT.iron, M([0.08, y, 0.12], [0, 0, 0], [0.04, 0.1, 0.3]), 0);
  const g = new THREE.Group();
  b.build(g);
  return g;
}

function patchBoard(k) {
  const b = new Batch(), add = b.sub(new THREE.Matrix4());
  const y = 0.8 + k * 0.6, a = (k % 2 ? 1 : -1) * 0.18;
  add(G.box, MAT.boardLight, M([-0.06, y, W / 2], [a, 0, 0], [0.045, 0.17, W * 0.92]), 0.012);
  for (const z of [0.25, W - 0.25]) add(G.box, MAT.iron, M([-0.09, y - (z - W / 2) * Math.sin(a), z], [0, 0, 0], [0.02, 0.04, 0.04]), 0); // a nail head at each end
  const g = new THREE.Group();
  b.build(g);
  g.visible = false;
  return g;
}

export function buildGates(scene) {
  const gates = GATES.map((gt, gi) => {
    const sx = Math.sign(gt.x);
    const leaves = [0, 1].map((li) => {
      const hinge = new THREE.Group();
      hinge.position.set(gt.x, 0, gt.z + (li ? GATE_HALF : -GATE_HALF));
      const holder = new THREE.Group(); // tips over when the gate is broken
      hinge.add(holder);
      const looks = [0, 1, 2].map((st) => { const l = leafLook(st, 300 + gi * 17 + li * 5 + st); holder.add(l); l.visible = st === 0; return l; });
      const patches = [0, 1].map((k) => { const p = patchBoard(k + li); holder.add(p); return p; });
      hinge.name = `gate-${gi}`;
      scene.add(hinge);
      // leaf 0 runs from its hinge toward +z, leaf 1 toward -z; open means swung out of the yard (toward +sx)
      const shut = li ? Math.PI : 0, open = li ? Math.PI - sx * 1.75 : sx * 1.75;
      return { hinge, holder, looks, patches, shut, open, ang: open };
    });
    return { sx, leaves, key: '' };
  });

  return {
    // st.gates: per gate [hp, open, patches, repair progress]
    set(st) {
      if (!st.gates) return;
      st.gates.forEach(([hp, open, patches], i) => {
        const g = gates[i];
        if (!g) return;
        g.target = open;
        const look = hp <= 0 ? 3 : hp <= 33 ? 2 : hp <= 66 ? 1 : 0;
        const key = `${look}|${Math.min(4, patches)}`;
        if (key === g.key) return;
        g.key = key;
        g.leaves.forEach((l, li) => {
          l.looks.forEach((m, k) => { m.visible = k === Math.min(2, look); });
          // the newest boards: the 1st repair on the near leaf, the 2nd on the far one, and so on
          l.patches.forEach((p, k) => { p.visible = look < 3 && Math.min(4, patches) > k * 2 + li; });
          if (look === 3) { l.holder.rotation.set(0, 0, -g.sx * (1.42 + li * 0.08)); l.holder.position.y = 0.06; }
          else { l.holder.rotation.set(0, 0, look === 2 ? g.sx * 0.06 * (li ? -1 : 1) : 0); l.holder.position.y = look === 2 ? -0.04 : 0; }
        });
      });
    },
    update(dt) {
      for (const g of gates) for (const l of g.leaves) {
        const want = g.target ? l.open : l.shut;
        l.ang += (want - l.ang) * Math.min(1, dt * 2.2);
        l.hinge.rotation.y = l.ang;
      }
    },
    // where an HP bar goes (world space, over the middle of the gate)
    barPos: (i) => [GATES[i].x, H + 0.75, GATES[i].z],
    maxHp: TUNING.gateHp,
  };
}

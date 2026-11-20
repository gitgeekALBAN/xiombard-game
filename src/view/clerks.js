import * as THREE from 'three';
import { lookRig, humanRig, crewPose, CREW_SCALE, NCREW } from '../shared/crew.js';
import { buildCrew } from './crew.js';

// The clerks behind the hand-in windows: made like the crew (same bean bodies, painted faces, knitted and felt
// clothes), just dressed for the job. They are scenery, not players: built once, posed here every frame.
//   police — a stocky one in a navy peaked cap (a short felt crown with a gold band and a brim), a navy scarf, and a
//            gold badge stitched on the chest
//   lost   — a round one in a brown felt hat and a mustard scarf, patched all over with odds and ends people lost
const LOOKS = {
  police: {
    bean: [0.43, 0.25, 0.7, 0.17], head: [0.8, 0.175, 0.88], shoulder: [0.2, 0.62, 0], hand: [0.42, 0.45, 0.02], arm: [0.036, 0.055],
    leg: [0.08, 0.19, 0.036, 0.09], hat: [0.905, 0.22, 0.175, 0.085], hat2: [0, 0.03, 0.004, 0], scarf: [0.64, 0.205, 0.048, 0.32], tail: [-0.08, 9, 0.042],
    patches: [[0.35, 0.56, 0.035, 0.045, '#f0c060']],
    colors: { skin: '#e6dfd4', scarf: '#26305a', hat: '#26305a', band: '#f0c060', mitten: '#26305a', leg: '#2a2f4a', boot: '#1e2236', nose: '#b0a8a0' },
  },
  lost: {
    bean: [0.42, 0.265, 0.7, 0.18], head: [0.8, 0.19, 0.9], shoulder: [0.2, 0.62, 0], hand: [0.4, 0.46, 0.02], arm: [0.036, 0.055],
    leg: [0.08, 0.16, 0.032, 0.085], hat: [0.9, 0.24, 0.17, 0.16], hat2: [0, 0.045, 0.006, 0], scarf: [0.645, 0.215, 0.048, 0.33], tail: [0.1, 9, 0.05], hair: true,
    patches: [[0.5, 0.48, 0.05, 0.045, '#c63a2f'], [-0.55, 0.38, 0.045, 0.055, '#2f8f8a'], [2.6, 0.5, 0.06, 0.05, '#8e44ad']],
    colors: { skin: '#e9e2ea', scarf: '#d9a92e', hat: '#5a3a2a', band: '#8a5a3a', mitten: '#6a4a3a', leg: '#7a6a5a', boot: '#3a2a22', nose: '#b9aeb8', hair: '#8a8490' },
  },
};

// A clerk standing behind a counter at (x, z), facing +z (into the hall), head about at headY.
// update(dt, time, up) poses them (up: 0 sunk out of sight behind the counter .. 1 standing at the window);
// setMood(m) sets the face: 0 waiting, 1 pleased, 2 cross.
export function buildClerk(kind, scene, x, z, headY) {
  const look = LOOKS[kind];
  const rig = humanRig({ look, rig: lookRig(look) }, CREW_SCALE, kind === 'police' ? 101 : 102);
  const crew = buildCrew(rig);
  const root = new THREE.Group();
  for (const g of crew.groups) root.add(g);
  root.add(crew.mesh);
  root.name = `clerk-${kind}`;
  scene.add(root);
  const feetY = headY - look.head[0] * CREW_SCALE, m = new THREE.Matrix4(), out = new Float32Array(NCREW * 7);
  const s = { speed: 0, phase: 0, t: 0, carry: null, hold: null, dig: false, air: false, swing: 0 };
  let mood = 0;
  crew.setMood(1);
  return {
    // 0 waiting (busy with their papers: the focused face), 1 pleased (the calm smile, a little bob), 2 cross (angry)
    setMood(v) { mood = v; crew.setMood(v === 1 ? 0 : v === 2 ? 3 : 1); },
    update(dt, time, up) {
      root.visible = up > 0.05;
      if (!root.visible) return;
      s.t = time;
      const bob = mood === 1 ? Math.abs(Math.sin(time * 7)) * 0.05 : 0;
      m.makeTranslation(x, feetY - (1 - up) * 0.9 + bob, z);
      crewPose(rig, m, s, out);
      crew.groups.forEach((g, i) => { g.position.fromArray(out, i * 7); g.quaternion.fromArray(out, i * 7 + 3); });
      crew.update(false);
    },
  };
}

import * as THREE from 'three';
import { groundMaterial } from '../shaders/ground.js';
import { toon, glowMat, LANTERN_Y } from '../shaders/toon.js';
import { buildHeadstone, buildTree, part, geo } from './models.js';
import { buildBackdrop } from './backdrop.js';
import { groundBoxes, DECOR, LANTERNS, FENCE, ROAD_Z, ROAD_HALF, PILE } from '../shared/layout.js';

// The static graveyard: ground, old headstones, trees, shed, fence, lanterns, and the backdrop beyond the fence.
// Positions and sizes come from shared/layout.js because the host's colliders use the same numbers.
// buildWorld(scene) returns { groundMat, update(time, dt, camera) }.
// Any mesh with userData.billboard = true is turned to face the camera every frame by the view.
export function buildWorld(scene) {
  const s = scene;
  const groundMat = groundMaterial();
  for (const b of groundBoxes()) {
    const m = new THREE.Mesh(geo.BOX, groundMat);
    m.position.set(...b.c);
    m.scale.set(b.h[0] * 2, b.h[1] * 2, b.h[2] * 2);
    s.add(m);
  }

  for (const st of DECOR.stones) {
    const g = buildHeadstone(st.kind, st.w, st.h, st.seed);
    g.position.set(st.x, 0, st.z);
    g.rotation.set(st.rx, st.ry, st.rz);
    s.add(g);
  }
  for (const t of DECOR.trees) {
    const g = buildTree(t.seed, t.h);
    g.position.set(t.x, 0, t.z);
    s.add(g);
  }
  // crooked shed
  const sh = DECOR.shed;
  const shed = new THREE.Group();
  shed.position.set(sh.x, 0, sh.z);
  shed.rotation.y = 0.12;
  shed.add(part(geo.BOX, toon('#3b3044', { color2: '#2f2638', stripes: 2.5, axis: 1 }), { pos: [0, sh.hy, 0], scale: [sh.hx * 2, sh.hy * 2, sh.hz * 2], rot: [0, 0, 0.04], outline: 0.03 }));
  shed.add(part(geo.BOX, toon('#1f1a28'), { pos: [0.3, sh.hy * 2 + 0.3, 0], scale: [sh.hx * 2.4, 0.15, sh.hz * 2.5], rot: [0.05, 0, -0.2], outline: 0.03 }));
  shed.add(part(geo.BOX, toon('#16121c'), { pos: [0.4, 0.9, -sh.hz - 0.01], scale: [0.9, 1.8, 0.04], outline: 0 }));
  shed.add(part(geo.BOX, toon('#f0c060', { emissive: 0.9 }), { pos: [-1.1, 1.9, -sh.hz - 0.02], scale: [0.45, 0.4, 0.03], outline: 0 }));
  s.add(shed);
  // coffin pile marker (stacked planks)
  for (let i = 0; i < 3; i++) s.add(part(geo.BOX, toon('#4a3a32'), { pos: [PILE.x + 2.2, 0.08 + i * 0.12, PILE.z - 1.6 + i * 0.05], rot: [0, 0.2 * i, 0], scale: [1.6, 0.1, 0.25] }));

  // wrought-iron fence with a gap where the road passes
  const spikes = [], gate0 = ROAD_Z - ROAD_HALF - 0.3, gate1 = ROAD_Z + ROAD_HALF + 0.3;
  for (let a = -FENCE; a <= FENCE; a += 0.55) {
    spikes.push([a, -FENCE], [a, FENCE]);
    if (a < gate0 || a > gate1) spikes.push([-FENCE, a], [FENCE, a]);
  }
  const iron = toon('#15111c');
  const bars = new THREE.InstancedMesh(geo.BOX, iron, spikes.length);
  const tips = new THREE.InstancedMesh(new THREE.ConeGeometry(0.07, 0.25, 4), iron, spikes.length);
  const m = new THREE.Matrix4();
  spikes.forEach(([x, z], i) => {
    const h = 1.5 + Math.sin(x * 3.1 + z * 1.7) * 0.15;
    bars.setMatrixAt(i, m.compose(new THREE.Vector3(x, h / 2, z), new THREE.Quaternion(), new THREE.Vector3(0.05, h, 0.05)));
    tips.setMatrixAt(i, m.compose(new THREE.Vector3(x, h + 0.1, z), new THREE.Quaternion(), new THREE.Vector3(1, 1, 1)));
  });
  s.add(bars, tips);
  for (const y of [0.35, 1.2]) {
    for (const z of [-FENCE, FENCE]) s.add(part(geo.BOX, iron, { pos: [0, y, z], scale: [FENCE * 2, 0.05, 0.05], outline: 0 }));
    for (const x of [-FENCE, FENCE]) {
      s.add(part(geo.BOX, iron, { pos: [x, y, (-FENCE + gate0) / 2], scale: [0.05, 0.05, gate0 + FENCE], outline: 0 }));
      s.add(part(geo.BOX, iron, { pos: [x, y, (gate1 + FENCE) / 2], scale: [0.05, 0.05, FENCE - gate1], outline: 0 }));
    }
  }
  // lanterns (the flame height must stay at LANTERN_Y: the lighting shader puts the light there)
  for (const [x, z] of LANTERNS) {
    s.add(part(geo.BOX, iron, { pos: [x, 1.1, z], scale: [0.1, 2.2, 0.1], outline: 0.01 }));
    s.add(part(geo.BOX, toon('#ffc870', { emissive: 1 }), { pos: [x, LANTERN_Y, z], scale: [0.26, 0.32, 0.26], outline: 0.015 }));
    s.add(part(new THREE.ConeGeometry(0.24, 0.2, 4), iron, { pos: [x, LANTERN_Y + 0.25, z], rot: [0, Math.PI / 4, 0], outline: 0 }));
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.6), glowMat('#ffb860', 0.8));
    glow.position.set(x, LANTERN_Y, z);
    glow.userData.billboard = true;
    s.add(glow);
  }

  const backdrop = buildBackdrop(s);
  return {
    groundMat,
    update(time, dt, camera) { backdrop.update(time, dt, camera); },
  };
}

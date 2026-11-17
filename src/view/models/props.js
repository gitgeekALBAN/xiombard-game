import * as THREE from 'three';
import { toon } from '../../shaders/toon.js';
import { COFFIN } from '../../shared/layout.js';
import { rng } from '../../shared/rng.js';
import { SPH, CYL, BOX, part } from './common.js';

// Classic tapered six-sided coffin, open on top so you can see who is inside.
export function buildCoffin(seed) {
  const R = rng(seed);
  const { hx, hy, hz, wall } = COFFIN;
  const outline = [[-0.6 * hx, -hz], [0.6 * hx, -hz], [hx, 0.45 * hz], [0.7 * hx, hz], [-0.7 * hx, hz], [-hx, 0.45 * hz]];
  const shape = new THREE.Shape(outline.map(([x, z]) => new THREE.Vector2(x, -z)));
  const inner = new THREE.Path(outline.map(([x, z]) => new THREE.Vector2(x * (1 - wall * 2.4), -z * (1 - wall * 1.2))).reverse());
  shape.holes.push(inner);
  const wallGeo = new THREE.ExtrudeGeometry(shape, { depth: hy * 2, bevelEnabled: false });
  wallGeo.rotateX(-Math.PI / 2);
  wallGeo.translate(0, -hy, 0);
  const wood = R.pick(['#4a2f42', '#3d2a3a', '#5a3a3a', '#3a3047']);
  const g = new THREE.Group();
  g.add(part(wallGeo, toon(wood, { color2: '#2a1d2a', stripes: 8, axis: 0 }), { outline: 0.02 }));
  const floorShape = new THREE.Shape(outline.map(([x, z]) => new THREE.Vector2(x, -z)));
  const floorGeo = new THREE.ExtrudeGeometry(floorShape, { depth: 0.06, bevelEnabled: false });
  floorGeo.rotateX(-Math.PI / 2);
  floorGeo.translate(0, -hy, 0);
  g.add(part(floorGeo, toon(wood), { outline: 0.02 }));
  g.add(part(BOX, toon('#8b1d3a', { color2: '#6e1530', stripes: 18, axis: 2 }), { pos: [0, -hy + 0.08, 0], scale: [hx * 1.5, 0.02, hz * 1.8], outline: 0 }));
  g.add(part(SPH, toon('#efe6f0'), { pos: [0, -hy + 0.13, hz * 0.72], scale: [0.2, 0.06, 0.12], outline: 0.01 }));
  // a little cross on the side
  for (const sx of [-1, 1]) {
    g.add(part(BOX, toon('#c9b98f'), { pos: [sx * (hx + 0.005), 0, -0.1], scale: [0.02, 0.22, 0.05], outline: 0 }));
    g.add(part(BOX, toon('#c9b98f'), { pos: [sx * (hx + 0.005), 0.04, -0.1], scale: [0.02, 0.05, 0.16], outline: 0 }));
  }
  return [g];
}

// Small procedural headstone. kind: round | cross | obelisk | slab
export function buildHeadstone(kind, w, h, seed) {
  const R = rng(seed);
  const stone = toon(R.pick(['#9a97ad', '#8b8a9e', '#a7a2b0', '#8f96a3']), { color2: '#7e7b92', stripes: 3 });
  const g = new THREE.Group();
  if (kind === 'cross') {
    g.add(part(BOX, stone, { pos: [0, h / 2, 0], scale: [0.16, h, 0.14] }));
    g.add(part(BOX, stone, { pos: [0, h * 0.7, 0], scale: [w * 0.75, 0.16, 0.14] }));
  } else if (kind === 'obelisk') {
    g.add(part(BOX, stone, { pos: [0, h * 0.45, 0], scale: [w * 0.45, h * 0.9, w * 0.45] }));
    g.add(part(new THREE.ConeGeometry(w * 0.33, h * 0.3, 4), stone, { pos: [0, h * 1.03, 0], rot: [0, Math.PI / 4, 0] }));
  } else {
    const body = kind === 'slab' ? h : h - w / 2;
    g.add(part(BOX, stone, { pos: [0, body / 2, 0], scale: [w, body, 0.2] }));
    if (kind === 'round') g.add(part(CYL, stone, { pos: [0, body, 0], rot: [Math.PI / 2, 0, 0], scale: [w / 2, 0.2, w / 2] }));
    // engraved lines
    for (let i = 0; i < 3; i++) g.add(part(BOX, toon('#5c5970'), { pos: [0, body * (0.7 - i * 0.15), 0.101], scale: [w * (0.6 - i * 0.12), 0.03, 0.005], outline: 0 }));
  }
  g.add(part(BOX, toon('#3a3346'), { pos: [0, 0.03, 0], scale: [w * 1.15, 0.08, 0.35], outline: 0 }));
  return g;
}

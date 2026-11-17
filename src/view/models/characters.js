import * as THREE from 'three';
import { toon } from '../../shaders/toon.js';
import { NPARTS, P } from '../../shared/skeleton.js';
import { rng } from '../../shared/rng.js';
import { SPH, SPH_LO, CYL, BOX, capsule, part } from './common.js';

const DARK = '#1b1424';

function eyes(head, R, corpse, z) {
  for (const sx of [-1, 1]) {
    const x = sx * 0.1;
    if (corpse) {
      for (const a of [0.8, -0.8]) head.add(part(BOX, toon(DARK), { pos: [x, 0.04, z], rot: [0, 0, a], scale: [0.13, 0.026, 0.03], outline: 0 }));
    } else {
      head.add(part(SPH, toon(DARK), { pos: [x, 0.04, z - 0.02], scale: [0.085, 0.1, 0.05], outline: 0 }));
      head.add(part(SPH_LO, toon('#fff8e8', { emissive: 0.8 }), { pos: [x + 0.012, 0.055, z + 0.02], scale: 0.022, outline: 0 }));
    }
  }
}

// Characters: one THREE.Group per skeleton part, each centered on the part (see shared/skeleton.js).
export function buildCharacter(kind, seed, color) {
  const R = rng(seed * 31 + 7);
  const corpse = kind === 'corpse';
  const g = Array.from({ length: NPARTS }, () => new THREE.Group());
  const skin = corpse ? R.pick(['#b7c9ad', '#a9bcc6', '#c6bfd8', '#c2d1b2', '#d0c6b0']) : '#f1ebe0';
  const cloth = corpse ? R.pick(['#5d6f8c', '#7b5d8c', '#8c6a5d', '#5d8c7b', '#8c8a5d']) : '#262033';
  const clothMat = corpse ? toon(cloth, { color2: '#e8e2d4', stripes: 9 }) : toon(cloth);
  const pants = corpse ? clothMat : toon('#1d1824', { color2: '#8d8798', stripes: 16 });
  const skinMat = toon(skin);
  const fat = corpse ? R.range(0.9, 1.3) : 1;

  // pelvis + chest
  g[P.pelvis].add(part(SPH, pants, { scale: [0.2 * fat, 0.15, 0.16 * fat] }));
  g[P.chest].add(part(SPH, clothMat, { pos: [0, -0.02, 0], scale: [0.24 * fat, 0.27, 0.17 * fat] }));
  if (!corpse) {
    // striped scarf and coat tails
    g[P.chest].add(part(new THREE.TorusGeometry(0.13, 0.055, 8, 18), toon(color, { color2: '#f3eadb', stripes: 14, axis: 1 }), { pos: [0, 0.2, 0], rot: [Math.PI / 2, 0, 0] }));
    g[P.chest].add(part(BOX, toon(color, { color2: '#f3eadb', stripes: 14 }), { pos: [0.08, 0.02, 0.17], rot: [0.1, 0, 0.15], scale: [0.07, 0.3, 0.03] }));
    g[P.pelvis].add(part(SPH, toon(cloth), { pos: [0, -0.08, -0.06], scale: [0.21, 0.2, 0.12] }));
  } else {
    for (let i = 0; i < 3; i++) g[P.chest].add(part(SPH_LO, toon('#e8e2d4'), { pos: [0, 0.12 - i * 0.1, 0.165 * fat], scale: 0.022, outline: 0 }));
  }

  // head
  const head = g[P.head];
  const hr = corpse ? 0.29 : 0.27;
  head.add(part(SPH, skinMat, { scale: [hr, hr * (corpse ? 1 : 1.12), hr * 0.95] }));
  eyes(head, R, corpse, hr * 0.86);
  if (corpse) {
    head.add(part(BOX, toon(DARK), { pos: [0, -0.11, hr * 0.9], scale: [0.16, 0.014, 0.02], outline: 0 }));
    for (const x of [-0.05, 0, 0.05]) head.add(part(BOX, toon(DARK), { pos: [x, -0.11, hr * 0.9], scale: [0.012, 0.05, 0.02], outline: 0 }));
    const hair = R();
    const hairMat = toon(R.pick(['#2a2233', '#6b5a7a', '#c9c2b0', '#4a3a2a']));
    if (hair < 0.4) for (let i = 0; i < 3; i++) head.add(part(new THREE.ConeGeometry(0.05, 0.22, 6), hairMat, { pos: [(i - 1) * 0.06, hr + 0.05, 0], rot: [0, 0, (i - 1) * 0.5] }));
    else if (hair < 0.7) head.add(part(SPH, hairMat, { pos: [0, hr * 0.45, -0.04], scale: [hr * 1.02, hr * 0.6, hr * 0.98] }));
    // a stitched scar
    head.add(part(BOX, toon('#5e3a4a'), { pos: [0.12, 0.17, hr * 0.62], rot: [0, 0.4, 0.6], scale: [0.12, 0.01, 0.01], outline: 0 }));
  } else {
    head.add(part(new THREE.ConeGeometry(0.04, 0.2, 8), skinMat, { pos: [0, -0.02, hr * 0.98], rot: [Math.PI / 2, 0, 0], outline: 0.01 }));
    head.add(part(new THREE.TorusGeometry(0.07, 0.012, 6, 12, Math.PI), toon(DARK), { pos: [0, -0.12, hr * 0.84], rot: [0, 0, Math.PI], outline: 0 }));
    // crooked top hat
    const hat = new THREE.Group();
    hat.position.set(0.02, hr * 1.02, -0.01);
    hat.rotation.set(-0.12, 0, 0.16);
    hat.add(part(CYL, toon('#17121f'), { scale: [0.3, 0.03, 0.3], outline: 0.01 }));
    hat.add(part(CYL, toon('#17121f'), { pos: [0, 0.23, 0], rot: [0, 0, 0.06], scale: [0.17, 0.44, 0.17], outline: 0.012 }));
    hat.add(part(CYL, toon(color), { pos: [0, 0.07, 0], scale: [0.178, 0.07, 0.178], outline: 0 }));
    head.add(hat);
  }

  // arms
  for (const [u, f] of [[P.uarmL, P.farmL], [P.uarmR, P.farmR]]) {
    g[u].add(part(capsule(0.065, 0.24), clothMat));
    g[f].add(part(capsule(0.058, 0.2), corpse ? skinMat : clothMat, { pos: [0, 0.02, 0] }));
    g[f].add(part(SPH, skinMat, { pos: [0, -0.19, 0.01], scale: [0.07, 0.08, 0.06] }));
  }
  // legs
  for (const [t, s] of [[P.thighL, P.shinL], [P.thighR, P.shinR]]) {
    g[t].add(part(capsule(0.075, 0.26), pants));
    g[s].add(part(capsule(0.065, 0.26), corpse ? skinMat : pants, { pos: [0, 0.02, 0] }));
    g[s].add(part(SPH, toon(corpse ? skin : '#120e18'), { pos: [0, -0.19, 0.06], rot: [0.15, 0, 0], scale: [0.075, 0.06, corpse ? 0.12 : 0.17] }));
  }

  if (!corpse) {
    // shovel, shown while digging
    const shovel = new THREE.Group();
    shovel.position.set(0, -0.2, 0.05);
    shovel.rotation.set(-1.1, 0, 0);
    shovel.add(part(CYL, toon('#7a5236'), { pos: [0, 0.1, 0], scale: [0.025, 1.1, 0.025], outline: 0.008 }));
    shovel.add(part(BOX, toon('#9aa0ad'), { pos: [0, -0.5, 0], scale: [0.22, 0.28, 0.025], outline: 0.01 }));
    shovel.visible = false;
    g[P.farmR].add(shovel);
    g[P.farmR].userData.shovel = shovel;
  }
  return g;
}

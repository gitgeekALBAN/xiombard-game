import * as THREE from 'three';
import { toon } from '../../shaders/toon.js';
import { part, SPH, SPH_LO, CYL, BOX, capsule } from './common.js';
import { ODDITIES } from '../../shared/layout.js';

// Odd deliveries (ODDITIES in shared/layout.js), built from primitives: a burlap bag of gold with coins peeking out, a
// taped white brick of "powder", and a crocodile (alive: green, on its feet; dead: belly up, legs in the air).
// Local frame: the long side is +x (a crocodile's snout), up is +y, centered on the physics box.
const CONE = new THREE.ConeGeometry(1, 1, 8);
const M = {
  burlap: toon('#b08a55', { mottle: 0.8 }), coin: toon('#f0c23a', { rim: 1.4 }), string: toon('#5a3a2a'),
  brick: toon('#f2efe6', { mottle: 0.25 }), tape: toon('#6f6a75'), sticker: toon('#d8433a'),
  croc: toon('#4f8a3a', { mottle: 0.7 }), crocDead: toon('#7d8f68', { mottle: 0.7 }), belly: toon('#d9d6a0', { mottle: 0.4 }),
  eye: toon('#f4f0e2'), ink: toon('#1e1a26'), tooth: toon('#fbf8ee'),
};

function goldBag(g) {
  g.add(part(SPH, M.burlap, { pos: [0, -0.03, 0], scale: [0.22, 0.22, 0.21], outline: 0.012 }));
  g.add(part(CYL, M.string, { pos: [0, 0.18, 0], scale: [0.07, 0.05, 0.07], outline: 0.008 }));
  g.add(part(SPH_LO, M.burlap, { pos: [0, 0.23, 0], scale: [0.1, 0.05, 0.1], outline: 0.008 })); // the gathered neck
  for (const [x, z, r] of [[0.05, 0.02, 0.3], [-0.04, -0.03, -0.4], [0.0, 0.05, 0.1]]) g.add(part(CYL, M.coin, { pos: [x, 0.27, z], rot: [r, 0, 0.5], scale: [0.04, 0.008, 0.04], outline: 0.006 }));
}
function powderBrick(g) {
  g.add(part(BOX, M.brick, { scale: [0.5, 0.26, 0.34], outline: 0.012 }));
  for (const x of [-0.12, 0.12]) g.add(part(BOX, M.tape, { pos: [x, 0, 0], scale: [0.06, 0.27, 0.35], outline: 0 }));
  g.add(part(BOX, M.sticker, { pos: [0.0, 0.131, 0.0], scale: [0.12, 0.004, 0.09], outline: 0 }));
}
function crocodile(g, dead) {
  const skin = dead ? M.crocDead : M.croc, c = new THREE.Group();
  c.add(part(capsule(0.15, 0.85), skin, { rot: [0, 0, Math.PI / 2], outline: 0.014 }));                 // the body
  c.add(part(SPH_LO, M.belly, { pos: [0, -0.06, 0], scale: [0.5, 0.09, 0.14], outline: 0 }));            // pale belly
  c.add(part(BOX, skin, { pos: [0.62, 0.0, 0], scale: [0.32, 0.17, 0.22], outline: 0.012 }));            // head
  c.add(part(BOX, skin, { pos: [0.86, -0.02, 0], scale: [0.3, 0.11, 0.17], outline: 0.012 }));           // snout
  for (const s of [-1, 1]) {
    c.add(part(SPH_LO, M.eye, { pos: [0.6, 0.12, s * 0.07], scale: 0.045, outline: 0.006 }));
    if (dead) for (const r of [0.8, -0.8]) c.add(part(BOX, M.ink, { pos: [0.6, 0.165, s * 0.07], rot: [0, r, 0], scale: [0.06, 0.006, 0.012], outline: 0 })); // X eyes
    else c.add(part(SPH_LO, M.ink, { pos: [0.62, 0.15, s * 0.07], scale: [0.012, 0.022, 0.012], outline: 0 })); // slit pupils
    for (let i = 0; i < 4; i++) c.add(part(CONE, M.tooth, { pos: [0.74 + i * 0.07, -0.08, s * 0.08], rot: [Math.PI, 0, 0], scale: [0.014, 0.04, 0.014], outline: 0 }));
    for (const x of [-0.3, 0.32]) c.add(part(SPH_LO, skin, { pos: [x, -0.12, s * 0.17], scale: [0.07, 0.05, 0.08], outline: 0.008 })); // stubby legs
  }
  c.add(part(CONE, skin, { pos: [-0.78, -0.02, 0], rot: [0, 0, Math.PI / 2], scale: [0.12, 0.6, 0.1], outline: 0.012 })); // the tail
  for (let i = 0; i < 5; i++) c.add(part(CONE, skin, { pos: [-0.36 + i * 0.18, 0.15, 0], scale: [0.03, 0.06, 0.03], outline: 0 })); // ridge
  if (dead) c.rotation.x = Math.PI; // belly up, legs in the air
  g.add(c);
}

export function buildOddity(look) {
  const g = new THREE.Group(), id = (ODDITIES[look] || ODDITIES[0]).id;
  if (id === 'gold') goldBag(g);
  else if (id === 'powder') powderBrick(g);
  else crocodile(g, id === 'crocDead');
  return [g];
}

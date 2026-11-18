import * as THREE from 'three';
import { meshPieces } from './mesher.js';
import { humanPieces, lin } from './human.js';
import { brutePieces, dogPieces, dogHeadAt } from './creatures.js';
import { characterMaterials } from './material.js';

// One character = one low-poly mesh sculpted from formulas at load time (see mesher.js), drawn twice: paint and
// ink hull. `def.look` is the same data the simulation builds the rig and ragdoll from (shared/crew.js,
// zombies.js, corpses.js), so what you see is what collides.
export const QUALITY = { value: 0.74 }; // mesh detail: 1 is finer, 0.6 is for weak phones

const piecesFor = (look, q) => (look.dog ? dogPieces(look, q) : look.brute ? brutePieces(look, q) : humanPieces(look, q));

const cache = new Map();
export function characterGeometry(look, q = QUALITY.value) {
  const key = look;
  let g = cache.get(key);
  if (g && g.userData.q === q) return g;
  const m = meshPieces(piecesFor(look, q));
  g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(m.position, 3));
  g.setAttribute('normal', new THREE.BufferAttribute(m.normal, 3));
  g.setAttribute('color', new THREE.BufferAttribute(m.color, 3));
  g.setAttribute('fx', new THREE.BufferAttribute(m.fx, 2));
  g.setAttribute('bone', new THREE.BufferAttribute(m.bone, 2));
  g.setAttribute('weight', new THREE.BufferAttribute(m.weight, 1));
  g.setIndex(new THREE.BufferAttribute(m.index, 1));
  g.userData.q = q;
  if (cache.size > 80) cache.delete(cache.keys().next().value); // bodies come and go; keep the cache small
  cache.set(key, g);
  return g;
}

// A character ready to draw. parts: six rest -> world matrices (scale included), refreshed by the caller each frame.
export class Character {
  constructor(def, opts = {}) {
    const k = def.look, { paint, hull, uniforms } = characterMaterials(opts);
    this.uniforms = uniforms;
    this.parts = uniforms.uPart.value;
    uniforms.uFace.value = k.face || 0;
    if (k.dog) { const [x, y, z] = dogHeadAt(k.dog); uniforms.uHeadC.value.set(x, y + k.dog.head[0] * 0.1, z, k.dog.head[0] * 0.92); }
    else if (k.faceAt) uniforms.uHeadC.value.set(...k.faceAt);
    else if (k.headAt) uniforms.uHeadC.value.set(k.headAt[0], k.headAt[1], k.headAt[2] + k.head[1] * k.head[2] * 0.25, k.head[1]);
    else uniforms.uHeadC.value.set(0, k.head[0], k.head[1] * k.head[2] * 0.25, k.head[1]);
    if (k.face2) uniforms.uHeadC2.value.set(k.face2[0], k.face2[1], k.face2[2] + k.face2[3] * 0.2, k.face2[3]);
    uniforms.uBellyR.value = k.bean ? k.bean[1] : 0.2;
    uniforms.uGrime.value = k.grime || 0;
    (k.patches || []).slice(0, 4).forEach((p, i) => { uniforms.uPatch.value[i].set(p[0], p[1], p[2], p[3]); uniforms.uPatchCol.value[i].setRGB(...lin(p[4])); });
    const geo = characterGeometry(k, opts.q || QUALITY.value);
    this.group = new THREE.Group();
    for (const m of [paint, hull]) { const mesh = new THREE.Mesh(geo, m); mesh.frustumCulled = false; this.group.add(mesh); }
    this.triangles = geo.index.count / 3;
  }
}

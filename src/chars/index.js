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

const _s = new THREE.Vector3(), _a = new THREE.Vector3(), _b = new THREE.Vector3(), _c = new THREE.Vector3(), _q = new THREE.Quaternion(), _t = new THREE.Matrix4();

// A character ready to draw. Call setFrames() every frame with where its six parts are.
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
    if (k.hat && k.hatPatch) { const h = k.hatPatch, dy = k.headAt ? k.headAt[1] - k.head[0] : 0; uniforms.uHatPatch.value.set(h[0], h[1] + dy, h[2], h[3]); uniforms.uHatPatchCol.value.setRGB(...lin(h[4])); uniforms.uHatR.value = k.hat[2]; }
    // garments that are paint, not geometry
    const dy = k.headAt ? k.headAt[1] - k.head[0] : 0;
    if (k.shawl) { uniforms.uWrap.value.set(k.bean[2] - 0.2, k.bean[2] - 0.03, 7, 1); uniforms.uWrapCol.value.setRGB(...lin(k.shawl)); }
    else if (k.headAt) { uniforms.uWrap.value.set(k.bean[2] + k.bean[3] * 0.25, 99, 0, 0); uniforms.uWrapCol.value.setRGB(...lin(k.capColor || '#8a5a44')); }
    if (k.hair) { uniforms.uHair.value.set(k.head[0] + dy, k.head[1], k.head[1] * 0.3, 1); uniforms.uHairCol.value.setRGB(...lin(k.colors.hair || '#77707c')); }
    if (k.hat && k.hat2[0] < 0.5) { uniforms.uBand.value.set(k.hat[0] + dy + 0.012, k.hat[0] + dy + 0.012 + k.hat2[1]); uniforms.uBandCol.value.setRGB(...lin(k.colors.band)); }
    if (k.barrel) uniforms.uBarrel.value.set(k.barrel.y0, k.barrel.y1, k.barrel.staves || 10, k.head[2]);
    (k.patches || []).slice(0, 4).forEach((p, i) => { uniforms.uPatch.value[i].set(p[0], p[1], p[2], p[3]); uniforms.uPatchCol.value[i].setRGB(...lin(p[4])); });
    const geo = characterGeometry(k, opts.q || QUALITY.value);
    this.group = new THREE.Group();
    for (const m of [paint, hull]) { const mesh = new THREE.Mesh(geo, m); mesh.frustumCulled = false; this.group.add(mesh); }
    this.triangles = geo.index.count / 3;
  }

  // Fill the bone matrices from the six part frames (world position and rotation of each part's rest center).
  // The two upper arms are not parts: each is laid from the shoulder (which rides on the body) to the elbow
  // (where the forearm begins), so the arm bends wherever the pose put the forearm.
  setFrames(rig, pos, quat) {
    const S = rig.S, parts = this.parts;
    _s.set(S, S, S);
    for (let i = 0; i < 6; i++) { const r = rig.rest[i]; parts[i].compose(pos[i], quat[i], _s).multiply(_t.makeTranslation(-r.x / S, -r.y / S, -r.z / S)); }
    for (let i = 2; i < 4; i++) {
      if (!rig.elbow) { parts[i + 4].copy(parts[0]); continue; }
      const sh = rig.pivot[i], el = rig.elbowAt[i];
      _a.copy(sh).divideScalar(S).applyMatrix4(parts[0]); // the shoulder, in the world
      _b.copy(el).divideScalar(S).applyMatrix4(parts[i]).sub(_a).normalize(); // the way to the elbow
      _q.setFromUnitVectors(_c.copy(el).sub(sh).normalize().applyQuaternion(quat[0]), _b).multiply(quat[0]);
      parts[i + 4].compose(_a, _q, _s).multiply(_t.makeTranslation(-sh.x / S, -sh.y / S, -sh.z / S));
    }
  }
}

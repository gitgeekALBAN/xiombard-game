import * as THREE from 'three';
import { Character } from '../chars/index.js';
import { CP, NCREW } from '../shared/crew.js';
import { keyLight } from '../shaders/toon.js';
import { buildShovel } from './models/shovel.js';

// One character in the game (a digger of the crew, a zombie, a dog, or a body waiting to be buried): six empty
// groups that follow the snapshot transforms (camera, labels and the shovel hang off them) and one low-poly mesh
// sculpted from the character's formulas, skinned to those six frames (see src/chars/).
// rig comes from crewRig(), zombieRig() or corpseRig(); opts.shovel puts a shovel in the right mitten,
// opts.q sets the mesh detail (bodies are many and come and go, so they are built a little coarser).
const _t = new THREE.Matrix4();

export function buildCrew(rig, opts = {}) {
  const S = rig.S, k = rig.def.look;
  const groups = Array.from({ length: NCREW }, () => new THREE.Group());
  const ch = new Character(rig.def, { q: opts.q }), u = ch.uniforms;
  u.uThick.value = 0.011;

  if (opts.shovel) { // the shovel rides in the right mitten, upright while the arms chop (see crewPose)
    const shovel = buildShovel();
    const hand = rig.hand.clone().setX(-rig.hand.x).sub(rig.rest[CP.armR]);
    shovel.scale.setScalar(0.85);
    shovel.position.set(hand.x, hand.y - 0.2, hand.z + 0.04);
    shovel.rotation.set(0.4, 0, -0.55, 'ZXY');
    groups[CP.armR].add(shovel);
    groups[CP.armR].userData.shovel = shovel;
  }

  const scale = new THREE.Vector3(S, S, S), rest = rig.rest.map((r) => r.clone().divideScalar(S));
  // call once per frame after the groups moved; noHead leaves out the head and hat (your own digger in first person)
  function update(noHead) {
    for (let i = 0; i < NCREW; i++) {
      const g = groups[i];
      ch.parts[i].compose(g.position, g.quaternion, scale).multiply(_t.makeTranslation(-rest[i].x, -rest[i].y, -rest[i].z));
    }
    // the key light (moon, low sun or high sun) is the toon shader's, so everyone sits in the same scene
    const key = keyLight();
    u.uLightDir.value.copy(key.dir);
    u.uLightCol.value.copy(key.lit).multiplyScalar(0.82); // a touch dimmer: these bodies are almost white all over
    u.uShadeCol.value.copy(key.shade);
    u.uRimCol.value.copy(key.shade).multiplyScalar(0.5);
    u.uNoHead.value = noHead ? 1 : 0;
  }
  // a body that got up at night wears a zombie's face, goes green and earthy until it lies down again
  const face = k.face || 0, grime = k.grime || 0;
  function setRisen(on) {
    u.uFace.value = on ? 1 : face;
    u.uTint.value.set(0.33, 0.47, 0.27, on ? 0.75 : 0);
    u.uGrime.value = on ? 0.7 : grime;
  }
  return { groups, mesh: ch.group, rig, update, setRisen };
}

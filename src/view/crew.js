import * as THREE from 'three';
import { Character } from '../chars/index.js';
import { CP, NCREW, shovelHoldDir } from '../shared/crew.js';
import { keyLight } from '../shaders/toon.js';
import { buildShovel } from './models/shovel.js';
import { buildCharmStack } from './models/charms.js';

// One character in the game (a digger of the crew, a zombie, a dog, or a body waiting to be buried): six empty
// groups that follow the snapshot transforms (camera, labels and the shovel hang off them) and one low-poly mesh
// sculpted from the character's formulas, skinned to those six frames (see src/chars/).
// rig comes from crewRig(), zombieRig() or corpseRig(); opts.shovel puts a shovel in the right mitten,
// opts.q sets the mesh detail (bodies are many and come and go, so they are built a little coarser).
export function buildCrew(rig, opts = {}) {
  const S = rig.S, k = rig.def.look;
  const groups = Array.from({ length: NCREW }, () => new THREE.Group());
  const ch = new Character(rig.def, { q: opts.q }), u = ch.uniforms;
  u.uThick.value = 0.011;

  if (opts.shovel) {
    // The shovel is a straight extension of the right forearm (crewPose carries it like a weapon), gripped in the
    // mitten. It is rolled about its own axis so that the blade lies face up when carried at the ready.
    const shovel = buildShovel(), Y = new THREE.Vector3(0, 1, 0);
    const armDir = new THREE.Vector3().fromArray(rig.shapes[CP.armR].dir), hold = shovelHoldDir(rig);
    const mount = new THREE.Quaternion().setFromUnitVectors(Y, armDir), carried = new THREE.Quaternion().setFromUnitVectors(armDir, hold);
    const face = new THREE.Vector3(0, 0, 1).applyQuaternion(mount).applyQuaternion(carried), want = Y.clone().addScaledVector(hold, -Y.dot(hold)).normalize();
    mount.multiply(new THREE.Quaternion().setFromAxisAngle(Y, Math.atan2(hold.dot(new THREE.Vector3().crossVectors(face, want)), face.dot(want))));
    const hand = rig.hand.clone().setX(-rig.hand.x).sub(rig.rest[CP.armR]);
    shovel.position.copy(hand).addScaledVector(armDir, k.arm[1] * S * 0.55); // inside the mitten, not at the wrist
    shovel.quaternion.copy(mount);
    groups[CP.armR].add(shovel);
    groups[CP.armR].userData.shovel = shovel;
    // the chapel's charms, a stack of discs in the same mitten, shown instead of the shovel while held (see setState and
    // frame in view.js: it is kept upright and facing where the digger faces)
    const charm = buildCharmStack();
    charm.position.copy(hand);
    charm.quaternion.setFromUnitVectors(Y, new THREE.Vector3(0, 0, 1));
    charm.visible = false;
    groups[CP.armR].add(charm);
    groups[CP.armR].userData.charm = charm;
  }

  const pos = groups.map((g) => g.position), quat = groups.map((g) => g.quaternion);
  // call once per frame after the groups moved; noHead leaves out the head and hat
  function update(noHead) {
    ch.setFrames(rig, pos, quat);
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
  // a digger's mood shows on the face (0 calm, 1 focused, 2 straining, 3 angry; see crewMood in chars/material.js)
  const setMood = (m) => { u.uMood.value = m; };
  return { groups, mesh: ch.group, rig, update, setRisen, setMood };
}

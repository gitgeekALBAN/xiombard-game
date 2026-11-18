import * as THREE from 'three';
import { SdfCharacter } from '../sdf/shader.js';
import { CP, NCREW, crewRig } from '../shared/crew.js';
import { MOON_DIR, INK } from '../shaders/toon.js';
import { buildShovel } from './models/characters.js';
import { isTouchDevice } from '../touch.js';

// One digger of the crew in the game: six empty groups that follow the snapshot transforms (camera, labels and
// the shovel hang off them) and one raymarched SDF character drawn from those six frames.
const RIM_DIR = new THREE.Vector3(0.6, 0.3, 0.75).normalize(); // opposite the moon, so the shadow side keeps an edge
const _lo = new THREE.Vector3(), _hi = new THREE.Vector3(), _c = new THREE.Vector3(), _h = new THREE.Vector3();
const _t = new THREE.Matrix4();

export function buildCrew(look, camera) {
  const rig = crewRig(look), S = rig.S;
  const groups = Array.from({ length: NCREW }, () => new THREE.Group());
  const sdf = new SdfCharacter(rig.def, camera, { scale: S, fog: true, lanterns: true, lite: isTouchDevice() });
  const u = sdf.material.uniforms;
  // the same cold moon and purple shadows as the toon shader, so the crew sits in the scene
  u.uLightDir.value.copy(MOON_DIR);
  u.uLightCol.value.setRGB(0.7, 0.74, 0.93); // dimmer than the toon key: these bodies are almost white all over
  u.uShadeCol.value.setRGB(0.3, 0.27, 0.52);
  u.uRimDir.value.copy(RIM_DIR);
  u.uRimCol.value.setRGB(0.16, 0.2, 0.36);
  u.uInk.value.set(INK);
  u.uLine.value = 0.013;
  u.uGrain.value = 0.05;
  sdf.mesh.renderOrder = -1; // before the other see-through things (shadows, glows): it writes depth
  sdf.mesh.frustumCulled = false; // the box is moved by hand every frame

  // the shovel rides in the right mitten, upright while the arms chop (see crewPose)
  const shovel = buildShovel();
  const hand = rig.hand.clone().setX(-rig.hand.x).sub(rig.rest[CP.armR]);
  shovel.scale.setScalar(0.85);
  shovel.position.set(hand.x, hand.y - 0.2, hand.z + 0.04);
  shovel.rotation.set(0.4, 0, -0.55, 'ZXY');
  groups[CP.armR].add(shovel);
  groups[CP.armR].userData.shovel = shovel;

  const parts = Array.from({ length: NCREW }, () => new THREE.Matrix4());
  const scale = new THREE.Vector3(S, S, S), rest = rig.rest.map((r) => r.clone().divideScalar(S));
  // call once per frame after the groups moved: pix = world size of one pixel at distance 1
  function update(pix, noHead) {
    _lo.setScalar(Infinity); _hi.setScalar(-Infinity);
    for (let i = 0; i < NCREW; i++) {
      const g = groups[i], r = rig.radius[i];
      parts[i].compose(g.position, g.quaternion, scale).multiply(_t.makeTranslation(-rest[i].x, -rest[i].y, -rest[i].z));
      _lo.min(_c.copy(g.position).subScalar(r));
      _hi.max(_c.copy(g.position).addScalar(r));
    }
    sdf.update(parts, 0, _c.addVectors(_lo, _hi).multiplyScalar(0.5), _h.subVectors(_hi, _lo).multiplyScalar(0.5));
    u.uPix.value = pix;
    u.uNoHead.value = noHead ? 1 : 0;
  }
  return { groups, mesh: sdf.mesh, rig, update };
}

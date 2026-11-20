import * as THREE from 'three';
import { toon } from '../shaders/toon.js';
import { buildShovel } from './models/shovel.js';
import { part, geo } from './models/common.js';
import { buildCharmStick } from './models/charms.js';
import { RITES } from '../shared/layout.js';

// The shovel as you see it in first person: fixed to the camera at the lower right, like a weapon in any
// first-person game, with a mitten on the grip. It is only for your own eyes (everyone else sees the shovel in
// your digger's hand), so it runs its own little animations from what the simulation says you are doing:
// a bob with your steps, a jab forward and down while you dig, an overhead swing when you whack.
const SWING = 0.45; // seconds, as in the simulation
const REST = new THREE.Vector3(0.25, -0.27, -0.5), _p = new THREE.Vector3(), _q = new THREE.Quaternion(), _e = new THREE.Euler();
const ease = (x) => x * x * (3 - 2 * x);

export function createViewmodel(camera) {
  const root = new THREE.Group(), tool = new THREE.Group();
  const shovel = buildShovel();
  shovel.scale.setScalar(0.62);
  let mitten = null;
  tool.add(shovel);
  root.add(tool);
  root.visible = false;
  camera.add(root);
  // at rest the shovel points forward, up and a little inward, with the face of the blade turned up toward the eye
  const y = new THREE.Vector3(-0.3, 0.4, -0.86).normalize(), z = new THREE.Vector3(0, 1, 0.25).addScaledVector(y, -new THREE.Vector3(0, 1, 0.25).dot(y)).normalize();
  const rest = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(new THREE.Vector3().crossVectors(y, z), y, z));
  let phase = 0, swingT = 9, wasSwing = false, digK = 0, time = 0;
  // a chapel charm held up in the lower middle of the view instead of the shovel; it sways while the blessing is hummed
  const charm = buildCharmStick();
  charm.scale.setScalar(0.7);
  charm.visible = false;
  camera.add(charm);
  let charmT = 0;

  return {
    debugSwing: null,
    // ch: the charm in hand (index into RITES, -1 none); chant: humming the blessing
    updateCharm(dt, { fp, ch, chant }) {
      charm.visible = fp && ch >= 0;
      if (!charm.visible) return;
      charmT += dt;
      charm.userData.setCharm(RITES[ch].id);
      const w = chant ? Math.sin(charmT * 6) : 0;
      charm.position.set(0.08 + 0.09 * w, -0.5 + (chant ? 0.06 : 0) + Math.sin(charmT * 1.6) * 0.006, -0.62);
      charm.rotation.set(-0.12, 0, -0.35 * w);
    },
    // the mitten takes the color of your digger's mittens
    setColor(hex) {
      if (mitten) tool.remove(mitten);
      mitten = part(geo.SPH_LO, toon(hex, { mottle: 0.3 }), { pos: [0, 0.02, 0.012], scale: [0.05, 0.062, 0.05], outline: 0.008 });
      tool.add(mitten);
    },
    // show: draw it at all; speed: how fast you are moving (m/s); dig, swing: what the simulation says you are doing
    update(dt, { show, speed, dig, swing }) {
      root.visible = show;
      if (!show) { wasSwing = swing; return; }
      time += dt;
      if (swing && !wasSwing) swingT = 0; // a new swing starts
      wasSwing = swing;
      swingT += dt;
      phase += dt * Math.min(speed, 7) * 2.6;
      digK += ((dig ? 1 : 0) - digK) * Math.min(1, dt * 10);
      const k = Math.min(speed / 4, 1.4);
      _p.copy(REST);
      _p.x += Math.sin(phase) * 0.012 * k;
      _p.y += Math.abs(Math.cos(phase)) * 0.018 * k + Math.sin(time * 1.6) * 0.004;
      let pitch = 0, yaw = 0, roll = Math.sin(phase) * 0.04 * k;
      if (digK > 0.01) { // jab forward and down
        const push = 0.5 + 0.5 * Math.sin(time * 14);
        _p.z -= (0.05 + 0.2 * push) * digK; _p.y -= (0.03 + 0.1 * push) * digK; _p.x -= 0.07 * digK;
        pitch -= (0.55 + 0.35 * push) * digK;
      }
      const a = this.debugSwing ?? swingT / SWING; // debugSwing: freeze the swing at a given moment (screenshots)
      if (a < 1) { // up and back over the shoulder, then down across the view; the blow lands a third of the way in
        const up = ease(Math.min(a / 0.26, 1)), down = a > 0.26 ? ease(Math.min((a - 0.26) / 0.2, 1)) : 0, back = a > 0.6 ? ease((a - 0.6) / 0.4) : 0, hit = down * (1 - back);
        pitch += 1.0 * up * (1 - down) - 1.25 * hit;
        yaw += 0.35 * up * (1 - down) + 0.5 * hit;
        _p.y += 0.16 * up * (1 - down) - 0.1 * hit; _p.z -= 0.16 * hit; _p.x -= 0.1 * hit;
      }
      tool.position.copy(_p);
      tool.quaternion.copy(_q.setFromEuler(_e.set(pitch, yaw, roll, 'YXZ'))).multiply(rest);
    },
  };
}

import * as THREE from 'three';
import { glowMat } from '../../shaders/toon.js';
import { propPaint, rigHullMat, PAINT } from '../../shaders/paint-props.js';
import { PAL } from '../palette.js';
import { BOX } from './common.js';
import { PaintKit, mat4 } from './propkit.js';

const ROD6 = new THREE.CylinderGeometry(1, 1, 1, 6);
const STALK = new THREE.CylinderGeometry(1, 1, 1, 4);
const LAMP = new THREE.CylinderGeometry(1, 1, 1, 10);
const SKULL = new THREE.SphereGeometry(1, 7, 5);
const SPIKE = new THREE.ConeGeometry(0.035, 0.16, 5);

// Wobbly little vintage hearse. Faces -X, the closed coach with the bodies at +X, wheels touch y = 0.
// The bed floor, low bed walls, coach walls and roof, cab back and footprint follow TRUCK.boxes in shared/layout.js;
// everything else (fenders, lamps, roof curve and railing, ornament) is decoration close to that volume.
// Concept: a cab like the old pickup's in front of a coach-built compartment with three curtained oval windows a
// side, a rounded roof with a little railing and finials, and two rear doors that swing open at the hatch.
// Side profile (XY) extruded along Z with soft beveled edges.
function profile(pts, depth, bevel = 0.05, seg = 4) {
  const s = new THREE.Shape();
  s.moveTo(...pts[0]);
  for (const p of pts.slice(1)) p.length === 4 ? s.quadraticCurveTo(...p) : s.lineTo(...p);
  const g = new THREE.ExtrudeGeometry(s, { depth: depth - bevel * 2, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 1, curveSegments: seg });
  g.translate(0, 0, -(depth - bevel * 2) / 2);
  return g;
}

// Thick band following a centerline polyline in XY (fenders).
function band(center, thick, depth) {
  const n = center.length, out = [], inn = [];
  for (let i = 0; i < n; i++) {
    const a = center[Math.max(0, i - 1)], b = center[Math.min(n - 1, i + 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy);
    out.push(new THREE.Vector2(center[i][0] - dy / l * thick, center[i][1] + dx / l * thick));
    inn.push(new THREE.Vector2(center[i][0] + dy / l * thick, center[i][1] - dx / l * thick));
  }
  const g = new THREE.ExtrudeGeometry(new THREE.Shape([...out, ...inn.reverse()]), { depth, bevelEnabled: false });
  g.translate(0, 0, -depth / 2);
  return g;
}

function fenderLine(cx, front) {
  const pts = [], r = 0.66;
  for (let i = 0; i <= 8; i++) { const a = (6 + i * 21) * Math.PI / 180; pts.push([cx + Math.cos(a) * r, 0.5 + Math.sin(a) * r]); }
  // front fenders swoop down to the bumper and back into the running board; rear ones tuck in
  if (front) { pts.unshift([cx + 0.75, 0.43], [cx + 0.7, 0.47]); pts.push([cx - 0.72, 0.4], [cx - 0.82, 0.32]); }
  else { pts.unshift([cx + 0.78, 0.5]); pts.push([cx - 0.72, 0.47], [cx - 0.85, 0.43]); }
  return pts;
}

// Wheel in its own frame (axle along z), a hair off-center and tilted so it wobbles as it turns. The tire is the
// only solid with an outline; the face is one disc on which the rim, eight crooked spokes and the bone hubcap
// with its bolts are painted.
const TIRE = new THREE.TorusGeometry(0.39, 0.11, 5, 12);
const DISC = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 12).rotateX(Math.PI / 2);
const WOB = new THREE.Matrix4().makeRotationX(0.07).setPosition(0.012, 0.01, 0);
function wheel(k, at, rig) {
  const place = new THREE.Matrix4().makeTranslation(...at).multiply(WOB);
  k.add(TIRE, { id: PAINT.PLAIN, color: '#17121f', k: [0.15, 1, 0] }, { matrix: place, pspace: new THREE.Matrix4(), rig });
  k.add(DISC, { id: PAINT.WHEEL, color: PAL.coal }, { matrix: place, pspace: new THREE.Matrix4(), rig, outline: false });
}

// The truck is one painted mesh plus one ink hull (and the two headlight glows). The wheels and the rear doors are
// in that mesh too: the vertex shader turns them (aRig), reading the angles that the view writes into
// userData.wheels[i].rotation.z and userData.gate.rotation.z (0 shut .. -1.45 open), so those stay plain Object3Ds.
export function buildTruck() {
  const k = new PaintKit(), g = new THREE.Group();
  const S = [1, -1];
  const body = { id: PAINT.TRUCK_BODY, color: PAL.plum };
  const plain = (color, mottle = 0.3, rim = 1, em = 0) => ({ id: PAINT.PLAIN, color, k: [mottle, rim, em] });
  const dark = plain(PAL.coal), bone = plain(PAL.bone, 0.25), pewter = plain('#a59cb8', 0.35, 1.3);

  // cab: rounded roof that overhangs a little and leans back, as if the truck were in a hurry; windows, the door
  // and its handle, and the curls are painted on it
  k.add(profile([[-1.96, 0.52], [-0.66, 0.52], [-0.66, 2.16], [-0.64, 2.38, -0.86, 2.4], [-1.4, 2.5, -2.0, 2.4], [-2.12, 2.36, -1.98, 2.2], [-1.98, 0.52]], 1.98, 0.06, 4), body);
  // hood: narrow and rounded on top, louvers painted on its sides
  k.add(profile([[-2.82, 0.56], [-2.0, 0.56], [-2.0, 1.22], [-2.0, 1.32, -2.2, 1.32], [-2.72, 1.28], [-2.84, 1.27, -2.84, 1.15]], 1.36, 0.12, 4), body);
  // chassis rail and bumpers
  k.add(BOX, dark, { pos: [0, 0.42, 0], scale: [6.0, 0.18, 1.2] });
  k.add(ROD6, pewter, { pos: [-3.13, 0.38, 0], rot: [Math.PI / 2, 0, 0], scale: [0.075, 2.2, 0.075] });
  for (const z of S) k.add(BOX, dark, { pos: [-3.04, 0.42, z * 0.55], scale: [0.14, 0.1, 0.08] });
  k.add(BOX, dark, { pos: [3.05, 0.45, 0], scale: [0.14, 0.12, 2.0] });

  // bed: plank floor and the two low walls exactly on their colliders, a striped rail on top; tail lamps painted
  k.add(BOX, { id: PAINT.TRUCK_FLOOR, color: PAL.wood }, { pos: [1.2, 0.7, 0], scale: [3.6, 0.4, 1.8] });
  for (const z of S) {
    k.add(BOX, body, { pos: [1.2, 0.82, z * 0.95], scale: [3.6, 0.64, 0.1] });
    k.add(BOX, { id: PAINT.TRUCK_RAIL, color: PAL.stripeLight, k: [0, 0, 0] }, { pos: [1.2, 1.17, z * 0.95], scale: [3.64, 0.07, 0.15] });
  }
  k.add(BOX, body, { pos: [2.97, 0.7, 0], scale: [0.08, 0.4, 1.9] });

  // the coach on the bed: two long sides (carved panels and curtained oval windows are paint), corner pillars,
  // a rounded roof with bone trim, and a little railing with finials on top
  const coachWood = { id: PAINT.COACH, color: '#5a3a64' }, pillar = plain('#2c1d33', 0.3);
  for (const z of S) k.add(BOX, coachWood, { pos: [1.19, 1.81, z * 0.93], scale: [3.62, 1.22, 0.08] });
  for (const x of [-0.64, 3.0]) for (const z of S) k.add(BOX, pillar, { pos: [x, 1.81, z * 0.95], scale: [0.1, 1.28, 0.1] });
  const roofGeo = profile([[-1.04, 2.37], [1.04, 2.37], [1.04, 2.46], [0.78, 2.63, 0, 2.66], [-0.78, 2.63, -1.04, 2.46]], 3.86, 0.04, 6);
  k.add(roofGeo, plain('#3a2444', 0.35), { pos: [1.2, 0, 0], rot: [0, Math.PI / 2, 0] });
  for (const z of S) k.add(BOX, bone, { pos: [1.2, 2.37, z * 1.03], scale: [3.84, 0.06, 0.05], outline: false });
  for (const x of [-0.72, 3.12]) k.add(BOX, bone, { pos: [x, 2.37, 0], scale: [0.05, 0.06, 2.06], outline: false });
  const railY = 2.86;
  for (const x of [-0.45, 1.2, 2.85]) for (const z of S) {
    k.add(ROD6, pewter, { pos: [x, (2.6 + railY) / 2, z * 0.8], scale: [0.026, railY - 2.6, 0.026], outline: false });
    k.add(SPIKE, bone, { pos: [x, railY + 0.08, z * 0.8], scale: [1.1, 1, 1.1] });
  }
  for (const z of S) k.add(ROD6, pewter, { pos: [1.2, railY - 0.04, z * 0.8], rot: [0, 0, Math.PI / 2], scale: [0.022, 3.3, 0.022], outline: false });
  for (const x of [-0.45, 2.85]) k.add(ROD6, pewter, { pos: [x, railY - 0.04, 0], rot: [Math.PI / 2, 0, 0], scale: [0.022, 1.6, 0.022], outline: false });

  // radiator: tall pewter shell with the grille painted on; skull ornament on the cap
  const rad = new THREE.Shape();
  rad.moveTo(-0.5, 0.4); rad.lineTo(0.5, 0.4); rad.lineTo(0.5, 1.3); rad.quadraticCurveTo(0.5, 1.55, 0, 1.6); rad.quadraticCurveTo(-0.5, 1.55, -0.5, 1.3);
  const radGeo = new THREE.ExtrudeGeometry(rad, { depth: 0.08, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 1, curveSegments: 4 });
  k.add(radGeo, { id: PAINT.RADIATOR, color: '#a59cb8' }, { pos: [-2.94, 0, 0], rot: [0, -Math.PI / 2, 0] });
  k.add(ROD6, pewter, { pos: [-2.99, 1.62, 0], scale: [0.06, 0.06, 0.06], outline: false });
  const skullM = mat4([-3.0, 1.78, 0], [0, 0, 0], [0.12, 0.115, 0.105]);
  k.add(SKULL, { id: PAINT.SKULL, color: PAL.bone }, { matrix: skullM, pspace: new THREE.Matrix4() });
  k.add(BOX, bone, { pos: [-3.06, 1.68, 0], scale: [0.08, 0.06, 0.12] });

  // big round headlamps on stalks either side of the radiator: the glass and bezel are painted on the housing
  for (const z of S) {
    const rot = [0, 0, Math.PI / 2], scale = [0.23, 0.18, 0.23];
    k.add(LAMP, { id: PAINT.LAMP, color: PAL.coal }, { pos: [-2.96, 1.12, z * 0.78], rot, scale, pspace: mat4([0, 0, 0], rot, scale) });
    k.add(STALK, dark, { pos: [-2.9, 0.92, z * 0.78], scale: [0.03, 0.3, 0.03], outline: false });
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 1.7), glowMat('#ffc46b', 0.8));
    glow.position.set(-3.3, 1.12, z * 0.78);
    glow.userData.billboard = true;
    g.add(glow);
  }

  // fenders, running boards, little spikes, side mirrors
  for (const z of S) {
    k.add(band(fenderLine(-2.2, true), 0.045, 0.42), body, { pos: [0, 0, z * 1.0] });
    k.add(band(fenderLine(2.0, false), 0.045, 0.42), body, { pos: [0, 0, z * 1.0] });
    k.add(BOX, dark, { pos: [-0.08, 0.4, z * 1.03], scale: [2.85, 0.07, 0.34] });
    k.add(SPIKE, bone, { pos: [-2.2, 1.24, z * 1.0], rot: [0, 0, 0.15], scale: [1, 1, 1] });
    k.add(SPIKE, bone, { pos: [2.6, 1.0, z * 1.0], rot: [0, 0, -0.5], scale: [1, 0.875, 1] });
    k.add(STALK, dark, { pos: [-2.05, 1.62, z * 1.1], rot: [z * 0.6, 0, 0], scale: [0.02, 0.24, 0.02], outline: false });
    k.add(ROD6, pewter, { pos: [-2.06, 1.74, z * 1.2], rot: [0, 0, Math.PI / 2], scale: [0.09, 0.03, 0.09] });
  }

  // wheels: the view spins them through userData.wheels[i].rotation.z
  const wheels = [], pivots = [new THREE.Vector3()];
  [[-2.2, 1.0], [-2.2, -1.0], [2.0, 1.0], [2.0, -1.0]].forEach(([x, z], i) => {
    wheel(k, [x, 0.5, z], i + 1);
    const w = new THREE.Object3D();
    w.position.set(x, 0.5, z);
    g.add(w);
    wheels.push(w);
    pivots.push(w.position.clone());
  });

  // two rear doors, hinged at the coach's back corners (rig 5 on the +z side, 6 on the -z side); their window,
  // checker band, panel, tombstone and handle are paint in truck space. The view swings them through gate.rotation.z.
  const gate = new THREE.Object3D();
  g.add(gate);
  for (const z of S) {
    k.add(BOX, { id: PAINT.DOOR, color: '#5a3a64' }, { pos: [3.05, 1.67, z * 0.475], scale: [0.07, 1.5, 0.93], rig: z > 0 ? 5 : 6 });
    pivots.push(new THREE.Vector3(3.05, 1.67, z * 0.95));
  }

  const paint = propPaint({ rig: true });
  paint.uniforms.uPivot.value = pivots;
  const hullMat = rigHullMat(paint, 0.03);
  const { geo, hull } = k.bake();
  const mesh = new THREE.Mesh(geo, paint), ink = new THREE.Mesh(hull, hullMat);
  const pose = () => { paint.uniforms.uSpin.value = wheels[0].rotation.z; paint.uniforms.uGate.value = gate.rotation.z; paint.uniformsNeedUpdate = true; hullMat.uniformsNeedUpdate = true; };
  mesh.onBeforeRender = pose;
  ink.onBeforeRender = pose;
  g.add(mesh, ink);
  g.userData = { wheels, gate };
  return [g];
}

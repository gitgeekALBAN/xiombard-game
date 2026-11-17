import * as THREE from 'three';
import { toon, glowMat } from '../../shaders/toon.js';
import { PAL } from '../palette.js';
import { rng } from '../../shared/rng.js';
import { SPH_LO, BOX, capsule } from './common.js';
import { Kit, instance, ribbon, curlPts } from './propkit.js';

const BALL = new THREE.SphereGeometry(1, 8, 6);
const ROD = new THREE.CylinderGeometry(1, 1, 1, 8);

// Wobbly little vintage hearse pickup. Faces -X, open bed at +X, wheels touch y = 0.
// The bed floor, low bed walls, cab back and footprint follow TRUCK.boxes in shared/layout.js;
// everything else (fenders, lamps, roof curve, ornament) is decoration close to that volume.
const M = () => ({
  body: toon(PAL.plum, { mottle: 0.45, gradColor: PAL.plumDark, gradY: [0.35, 1.1] }),
  dark: toon(PAL.coal, { mottle: 0.3 }),
  bone: toon(PAL.bone, { mottle: 0.25 }),
  pewter: toon('#a59cb8', { mottle: 0.35, rim: 1.3 }),
  floor: toon(PAL.wood, { color2: PAL.plumDark, stripes: 3.2, stripeDuty: 0.18, axis: 2, mottle: 0.5 }),
  rail: toon(PAL.stripeLight, { color2: PAL.stripeDark, stripes: 2.6, axis: 1 }),
  railZ: toon(PAL.stripeLight, { color2: PAL.stripeDark, stripes: 2.6, axis: 2 }),
  paint: toon('#b89ad0', { rim: 0.3 }),
  glass: toon('#1f2240', { emissive: 0.2, rim: 1.6 }),
  lamp: toon(PAL.amberHot, { emissive: 1 }),
  tail: toon('#ff5a3c', { emissive: 0.9 }),
  tire: toon('#17121f'),
  spoke: toon(PAL.plumLight, { mottle: 0.3 }),
});

// Side profile (XY) extruded along Z with soft beveled edges.
function profile(pts, depth, bevel = 0.05, seg = 6) {
  const s = new THREE.Shape();
  s.moveTo(...pts[0]);
  for (const p of pts.slice(1)) p.length === 4 ? s.quadraticCurveTo(...p) : s.lineTo(...p);
  const g = new THREE.ExtrudeGeometry(s, { depth: depth - bevel * 2, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 2, curveSegments: seg });
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
  const g = new THREE.ExtrudeGeometry(new THREE.Shape([...out, ...inn.reverse()]), { depth: depth - 0.04, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.015, bevelSegments: 1 });
  g.translate(0, 0, -(depth - 0.04) / 2);
  return g;
}

function fenderLine(cx, front) {
  const pts = [], r = 0.66;
  for (let i = 0; i <= 14; i++) { const a = (6 + i * 12) * Math.PI / 180; pts.push([cx + Math.cos(a) * r, 0.5 + Math.sin(a) * r]); }
  // front fenders swoop down to the bumper and back into the running board; rear ones tuck in
  if (front) { pts.unshift([cx + 0.75, 0.43], [cx + 0.7, 0.47]); pts.push([cx - 0.72, 0.4], [cx - 0.82, 0.32]); }
  else { pts.unshift([cx + 0.78, 0.5]); pts.push([cx - 0.72, 0.47], [cx - 0.85, 0.43]); }
  return pts;
}

let wheelBake = null;
function wheel(m) {
  if (!wheelBake) {
    const R = rng(77), k = new Kit();
    // a hair off-center and tilted, so it wobbles as it turns
    const wob = new THREE.Matrix4().makeRotationX(0.07).setPosition(0.012, 0.01, 0);
    const add = (geo, mat, o = {}) => k.add(geo, mat, { matrix: wob.clone().multiply(new THREE.Matrix4().compose(new THREE.Vector3(...(o.pos || [0, 0, 0])), new THREE.Quaternion().setFromEuler(new THREE.Euler(...(o.rot || [0, 0, 0]))), new THREE.Vector3(...(o.scale || [1, 1, 1])))), outline: o.outline ?? true });
    add(new THREE.TorusGeometry(0.39, 0.11, 6, 16), m.tire);
    add(new THREE.TorusGeometry(0.29, 0.035, 4, 14), m.spoke, { outline: false });
    add(ROD, m.spoke, { rot: [Math.PI / 2, 0, 0], scale: [0.1, 0.3, 0.1], outline: false });
    add(ROD, m.bone, { pos: [0, 0, 0.16], rot: [Math.PI / 2, 0, 0], scale: [0.065, 0.03, 0.065], outline: false });
    add(ROD, m.bone, { pos: [0, 0, -0.16], rot: [Math.PI / 2, 0, 0], scale: [0.065, 0.03, 0.065], outline: false });
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + R.range(-0.12, 0.12);
      add(BOX, m.spoke, { pos: [Math.cos(a) * 0.19, Math.sin(a) * 0.19, 0], rot: [0, 0, a + R.range(-0.08, 0.08)], scale: [0.21, 0.035, 0.045], outline: false });
    }
    wheelBake = k.bake();
  }
  return instance(wheelBake, new THREE.Group(), 0.022);
}

export function buildTruck() {
  const m = M(), k = new Kit(), g = new THREE.Group();
  const S = [1, -1];

  // cab: rounded roof that overhangs a little and leans back, as if the truck were in a hurry
  k.add(profile([[-1.96, 0.52], [-0.66, 0.52], [-0.66, 2.16], [-0.64, 2.38, -0.86, 2.4], [-1.4, 2.5, -2.0, 2.4], [-2.12, 2.36, -1.98, 2.2], [-1.98, 0.52]], 1.98, 0.06), m.body);
  // hood: narrow and rounded on top, with a radiator shell in front
  const hood = profile([[-2.82, 0.56], [-2.0, 0.56], [-2.0, 1.22], [-2.0, 1.32, -2.2, 1.32], [-2.72, 1.28], [-2.84, 1.27, -2.84, 1.15]], 1.36, 0.12, 6);
  k.add(hood, m.body);
  // chassis rail and bumpers
  k.add(BOX, m.dark, { pos: [0, 0.42, 0], scale: [6.0, 0.18, 1.2] });
  k.add(capsule(0.075, 2.05), m.pewter, { pos: [-3.13, 0.38, 0], rot: [Math.PI / 2, 0, 0] });
  for (const z of S) k.add(BOX, m.dark, { pos: [-3.04, 0.42, z * 0.55], scale: [0.14, 0.1, 0.08] });
  k.add(BOX, m.dark, { pos: [3.05, 0.45, 0], scale: [0.14, 0.12, 2.0] });

  // bed: plank floor and the two low walls exactly on their colliders, striped rails on top
  k.add(BOX, m.floor, { pos: [1.2, 0.7, 0], scale: [3.6, 0.4, 1.8] });
  for (const z of S) {
    k.add(BOX, m.body, { pos: [1.2, 0.82, z * 0.95], scale: [3.6, 0.64, 0.1] });
    k.add(BOX, m.rail, { pos: [1.2, 1.17, z * 0.95], scale: [3.64, 0.07, 0.15] });
  }
  k.add(BOX, m.body, { pos: [2.97, 0.7, 0], scale: [0.08, 0.4, 1.9] });
  for (const z of S) k.add(BALL, m.tail, { pos: [3.03, 0.72, z * 0.82], scale: [0.06, 0.09, 0.09] });

  // radiator: tall bone shell, dark core, slats; skull ornament on the cap
  const rad = new THREE.Shape();
  rad.moveTo(-0.5, 0.4); rad.lineTo(0.5, 0.4); rad.lineTo(0.5, 1.3); rad.quadraticCurveTo(0.5, 1.55, 0, 1.6); rad.quadraticCurveTo(-0.5, 1.55, -0.5, 1.3);
  const radGeo = new THREE.ExtrudeGeometry(rad, { depth: 0.08, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 1, curveSegments: 8 });
  k.add(radGeo, m.pewter, { pos: [-2.94, 0, 0], rot: [0, -Math.PI / 2, 0] });
  k.add(BOX, m.dark, { pos: [-3.06, 0.95, 0], scale: [0.04, 0.9, 0.78], outline: false });
  for (let i = -3; i <= 3; i++) k.add(BOX, m.pewter, { pos: [-3.075, 0.95, i * 0.105], scale: [0.03, 0.86, 0.035], outline: false });
  k.add(ROD, m.pewter, { pos: [-2.99, 1.62, 0], scale: [0.06, 0.06, 0.06] });
  k.add(SPH_LO, m.bone, { pos: [-3.0, 1.78, 0], scale: [0.12, 0.115, 0.105] });
  k.add(BOX, m.bone, { pos: [-3.06, 1.68, 0], scale: [0.08, 0.06, 0.12] });
  for (const z of S) k.add(BALL, m.dark, { pos: [-3.1, 1.785, z * 0.045], scale: [0.03, 0.035, 0.03], outline: false });
  k.add(BALL, m.dark, { pos: [-3.115, 1.73, 0], scale: [0.015, 0.02, 0.015], outline: false });

  // big round headlamps on stalks either side of the radiator
  for (const z of S) {
    k.add(ROD, m.dark, { pos: [-2.96, 1.12, z * 0.78], rot: [0, 0, Math.PI / 2], scale: [0.23, 0.18, 0.23] });
    k.add(BALL, m.lamp, { pos: [-3.05, 1.12, z * 0.78], scale: [0.07, 0.21, 0.21], outline: false });
    k.add(new THREE.TorusGeometry(0.22, 0.035, 4, 14), m.pewter, { pos: [-3.09, 1.12, z * 0.78], rot: [0, Math.PI / 2, 0], outline: false });
    k.add(ROD, m.dark, { pos: [-2.9, 0.92, z * 0.78], scale: [0.03, 0.3, 0.03], outline: false });
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 1.7), glowMat('#ffc46b', 0.8));
    glow.position.set(-3.3, 1.12, z * 0.78);
    glow.userData.billboard = true;
    g.add(glow);
  }

  // fenders, running boards, little spikes
  for (const z of S) {
    k.add(band(fenderLine(-2.2, true), 0.045, 0.42), m.body, { pos: [0, 0, z * 1.0] });
    k.add(band(fenderLine(2.0, false), 0.045, 0.42), m.body, { pos: [0, 0, z * 1.0] });
    k.add(BOX, m.dark, { pos: [-0.08, 0.4, z * 1.03], scale: [2.85, 0.07, 0.34] });
    k.add(new THREE.ConeGeometry(0.035, 0.16, 5), m.bone, { pos: [-2.2, 1.24, z * 1.0], rot: [0, 0, 0.15] });
    k.add(new THREE.ConeGeometry(0.035, 0.14, 5), m.bone, { pos: [2.6, 1.0, z * 1.0], rot: [0, 0, -0.5] });
  }

  // glass: windshield, side windows, back window
  const pane = (w, h, r) => {
    const s = new THREE.Shape();
    s.moveTo(-w / 2 + r, -h / 2); s.lineTo(w / 2 - r, -h / 2); s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
    s.lineTo(w / 2, h / 2 - r); s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2); s.lineTo(-w / 2 + r, h / 2);
    s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r); s.lineTo(-w / 2, -h / 2 + r); s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
    return new THREE.ShapeGeometry(s, 4);
  };
  k.add(pane(1.5, 0.7, 0.12), m.glass, { pos: [-2.045, 1.82, 0], rot: [0, -Math.PI / 2, 0], outline: false });
  k.add(pane(1.0, 0.62, 0.14), m.glass, { pos: [-0.595, 1.88, 0], rot: [0, Math.PI / 2, 0], outline: false });
  for (const z of S) {
    k.add(pane(1.02, 0.66, 0.16), m.glass, { pos: [-1.32, 1.86, z * 1.002], rot: [0, z > 0 ? 0 : Math.PI, 0], outline: false });
    // door seam and handle, side mirror
    k.add(BOX, m.dark, { pos: [-0.72, 1.05, z * 1.0], scale: [0.025, 0.95, 0.012], outline: false });
    k.add(BOX, m.bone, { pos: [-0.86, 1.32, z * 1.015], scale: [0.14, 0.035, 0.03], outline: false });
    k.add(ROD, m.dark, { pos: [-2.05, 1.62, z * 1.1], rot: [z * 0.6, 0, 0], scale: [0.02, 0.24, 0.02], outline: false });
    k.add(ROD, m.pewter, { pos: [-2.06, 1.74, z * 1.2], rot: [0, 0, Math.PI / 2], scale: [0.09, 0.03, 0.09] });
    // hood louvers
    for (let i = 0; i < 4; i++) k.add(BOX, m.dark, { pos: [-2.38 - i * 0.12, 1.0, z * 0.685], scale: [0.04, 0.28, 0.02], outline: false });
  }

  // painted curls on the doors, bed sides and hood
  const curl = ribbon(curlPts(0.17, 1.7, 1.3), (t) => 0.012 + 0.03 * Math.sin(Math.PI * Math.min(1, t * 1.2)));
  const small = ribbon(curlPts(0.09, 1.5, 1.1), (t) => 0.008 + 0.02 * Math.sin(Math.PI * Math.min(1, t * 1.2)));
  for (const z of S) {
    const ry = z > 0 ? 0 : Math.PI;
    k.add(curl, m.paint, { pos: [-1.3, 0.98, z * 1.003], rot: [0, ry, 0], outline: false });
    k.add(small, m.paint, { pos: [-1.0, 0.72, z * 1.003], rot: [0, ry, z * 2.2], outline: false });
    k.add(curl, m.paint, { pos: [0.45, 0.82, z * 1.003], rot: [0, ry, 0.4], scale: 0.85, outline: false });
    k.add(small, m.paint, { pos: [0.95, 0.68, z * 1.003], rot: [0, ry, -0.8], outline: false });
    k.add(small, m.paint, { pos: [-2.45, 0.78, z * 0.685], rot: [0, ry, 0.3], scale: 1.2, outline: false });
  }
  k.build(g, 0.03);

  // wheels: the view spins them with rotation.z
  const wheels = [];
  for (const [x, z] of [[-2.2, 1.0], [-2.2, -1.0], [2.0, 1.0], [2.0, -1.0]]) {
    const w = wheel(m);
    w.position.set(x, 0.5, z);
    g.add(w);
    wheels.push(w);
  }

  // tailgate, hinged at the bottom of the bed's rear edge
  const gate = new THREE.Group();
  gate.position.set(3.0, 0.9, 0);
  const gk = new Kit();
  gk.add(BOX, m.body, { pos: [-0.04, 0.12, 0], scale: [0.08, 0.24, 1.9] });
  gk.add(BOX, m.railZ, { pos: [-0.04, 0.27, 0], scale: [0.11, 0.06, 1.94] });
  gk.add(ribbon(curlPts(0.07, 1.4, 1.0), 0.016), m.paint, { pos: [0.002, 0.12, 0.4], rot: [0, Math.PI / 2, -1.2], outline: false });
  gk.add(ribbon(curlPts(0.07, 1.4, 1.0, -1), 0.016), m.paint, { pos: [0.002, 0.12, -0.4], rot: [0, Math.PI / 2, 1.2], outline: false });
  gk.add(BALL, m.bone, { pos: [0.01, 0.13, 0], scale: [0.03, 0.07, 0.06] });
  gk.build(gate, 0.025);
  g.add(gate);
  g.userData = { wheels, gate };
  return [g];
}

import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { groundMaterial } from '../shaders/ground.js';
import { LANTERN_Y, lampsOn } from '../shaders/toon.js';
import { glowSprites, paintMat, paintAttrs } from '../shaders/paint-env.js';
import { buildHeadstoneField, geo } from './models.js';
import {
  Batch, MAT, G, M, treeParts, crowParts, buildCrowHead, lanternPostParts, lanternParts, pillarParts,
  gateLeafParts, shedParts, carpenterParts, coffinLidParts, signLabels,
} from './models/environment.js';
import { buildPlants } from './plants.js';
import { buildBackdrop } from './backdrop.js';
import { rng } from '../shared/rng.js';
import { groundBoxes, DECOR, LANTERNS, FENCE, ROAD_Z, ROAD_HALF, PILE } from '../shared/layout.js';

// The static graveyard: ground, old headstones, trees, shed, fence, gates, lanterns, and the backdrop beyond the fence.
// Positions and sizes come from shared/layout.js because the host's colliders use the same numbers.
// buildWorld(scene) returns { groundMat, update(time, dt, camera), setDay(k) }.
// Any mesh with userData.billboard = true is turned to face the camera every frame by the view.
// Static set pieces go into one Batch: one painted mesh plus its ink hulls (see models/environment.js).

export function buildWorld(scene) {
  const s = scene;
  const groundMat = groundMaterial();
  // the ground boxes (world-space shaded) baked into one mesh
  const ground = new THREE.Mesh(mergeGeometries(groundBoxes().map((b) => geo.BOX.clone().scale(b.h[0] * 2, b.h[1] * 2, b.h[2] * 2).translate(...b.c))), groundMat);
  ground.name = 'ground';
  s.add(ground);

  // the old headstones: one painted mesh and one ink hull for the whole yard
  const stones = buildHeadstoneField(DECOR.stones);
  stones.name = 'headstones';
  s.add(stones);

  const R = rng(4242);
  const batch = new Batch();
  const add = batch.add.bind(batch);
  const glow = glowSprites('#ffb860', 32);
  const glows = []; // [{ i, base }]
  const glowQuad = (pos, size, strength = 0.8) => glows.push({ i: glow.add(pos, size, strength), base: strength });
  // grass tuft and mushroom spots for the plants (view/plants.js); k = size hint (>= 1.2: may grow tall)
  const crows = [], tufts = [], shrooms = [], pillars = [];
  const tuft = (x, z, k = 1) => tufts.push([x, z, k]);
  const crow = (pos, yaw) => {
    crowParts(batch.sub(M([pos.x, pos.y, pos.z], [0, yaw, 0])));
    const head = buildCrowHead();
    head.position.copy(new THREE.Vector3(0, 0.3, 0.12).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw).add(pos));
    head.userData.yaw0 = yaw;
    head.rotation.y = yaw;
    s.add(head);
    crows.push({ head, next: R() * 3, target: yaw });
  };

  // trees: hollows look toward the middle of the yard
  const perches = [];
  for (const t of DECOR.trees) {
    const { perch } = treeParts(batch.sub(M([t.x, 0, t.z])), t.seed, t.h, Math.atan2(-t.z, -t.x));
    perches.push({ pos: perch.pos.clone().add(new THREE.Vector3(t.x, 0, t.z)), yaw: perch.yaw });
    for (let i = 0; i < 5; i++) { const a = R() * 6.3, r = R.range(0.6, 1.5); tuft(t.x + Math.cos(a) * r, t.z + Math.sin(a) * r, 1.2); }
    if (Math.abs(t.x) < FENCE && Math.abs(t.z) < FENCE && R() < 0.7) {
      const a = R() * 6.3;
      for (let i = 0; i < 4; i++) shrooms.push([t.x + Math.cos(a) * 0.75 + R.range(-0.25, 0.25), t.z + Math.sin(a) * 0.75 + R.range(-0.25, 0.25), R.range(0.6, 1.5)]);
    }
  }
  crow(perches[4].pos.clone().add(new THREE.Vector3(0, 0.08, 0)), perches[4].yaw + 1.2);

  // crooked shed, carpenter's corner by the coffin pile, a lid leaning on the shed
  const sh = DECOR.shed;
  const shed = shedParts(batch.sub(M([sh.x, 0, sh.z])), sh, 77);
  const shedPos = (v) => v.clone().add(new THREE.Vector3(sh.x, 0, sh.z));
  glowQuad(shedPos(shed.lantern), 1.5, 0.7); glowQuad(shedPos(shed.window), 1.6, 0.35); glowQuad(shedPos(shed.window2), 1.1, 0.3);
  crow(new THREE.Vector3(sh.x + 0.9, 4.05, sh.z), 2.6);
  for (let i = 0; i < 12; i++) {
    const side = i % 4, u = R.range(-1, 1);
    const x = side < 2 ? sh.x + u * sh.hx : sh.x + (side === 2 ? -1 : 1) * (sh.hx + 0.1);
    const z = side < 2 ? sh.z + (side ? 1 : -1) * (sh.hz + 0.1) : sh.z + u * sh.hz;
    tuft(x, z, 1.3);
  }
  for (let i = 0; i < 5; i++) shrooms.push([sh.x - sh.hx - 0.15 + R.range(-0.1, 0.1), sh.z - sh.hz + 0.3 + i * 0.12, R.range(0.6, 1.3)]);
  carpenterParts(batch.sub(M([PILE.x - 3.4, 0, PILE.z - 1.6], [0, 0.08, 0])));
  coffinLidParts(add, M([PILE.x - 3.35, 0.91, sh.z - sh.hz - 0.36], [0.3, 0.12, 0.04]));

  // wrought-iron fence: spear bars swag between stone posts; gateways where the road crosses
  const gate0 = ROAD_Z - ROAD_HALF - 0.3, gate1 = ROAD_Z + ROAD_HALF + 0.3;
  const BAR_H = 1.7;
  const spear = mergeGeometries([
    new THREE.CylinderGeometry(0.032, 0.032, BAR_H, 4, 1, true).rotateY(Math.PI / 4).translate(0, BAR_H / 2, 0),
    new THREE.ConeGeometry(0.065, 0.26, 4, 1, true).rotateY(Math.PI / 4).translate(0, BAR_H + 0.1, 0),
  ].map((g) => { g.deleteAttribute('uv'); return g.toNonIndexed(); }));
  const bars = [];
  const posts = [];
  // sides: [axis along which the side runs, fixed coordinate]
  for (const [along, fixed] of [['x', -FENCE], ['x', FENCE], ['z', -FENCE], ['z', FENCE]]) {
    const pt = (u, off = 0) => (along === 'x' ? [u, fixed + off] : [fixed + off, u]);
    const inward = -Math.sign(fixed);
    let stops = [];
    for (let u = -FENCE; u <= FENCE + 0.01; u += FENCE / 4) stops.push(u);
    const gated = along === 'z';
    if (gated) stops = stops.filter((u) => u < gate0 - 2.5 || u > gate1 + 2.5).concat([gate0 - 0.35, gate1 + 0.35]).sort((a, b) => a - b);
    for (const u of stops) {
      const isPillar = gated && (Math.abs(u - (gate0 - 0.35)) < 0.01 || Math.abs(u - (gate1 + 0.35)) < 0.01);
      if (!isPillar && (along === 'x' || Math.abs(u) < FENCE - 0.1)) posts.push(pt(u));
    }
    for (let i = 0; i < stops.length - 1; i++) {
      const a = stops[i], b = stops[i + 1];
      if (gated && a < gate1 && b > gate0) continue; // the gateway itself
      const n = Math.max(2, Math.round((b - a - 0.5) / 0.5));
      for (let k = 0; k <= n; k++) {
        const u = a + 0.3 + ((b - a - 0.6) * k) / n, f = (u - a) / (b - a);
        const h = 1.4 + 0.35 * Math.pow(Math.abs(f - 0.5) * 2, 2) + R.range(-0.05, 0.05);
        let tiltIn = R.range(-0.035, 0.035), tiltAlong = R.range(-0.03, 0.03);
        if (R() < 0.05) tiltIn += R.range(0.18, 0.32) * (R() < 0.5 ? -1 : 1);
        if (R() < 0.04) tiltAlong += R.range(0.15, 0.25) * (R() < 0.5 ? -1 : 1);
        const [x, z] = pt(u);
        // tilting "in" turns about the side's own direction
        const rot = along === 'x' ? [tiltIn * inward, 0, tiltAlong] : [tiltAlong, 0, -tiltIn * inward];
        bars.push(M([x, 0, z], rot, [1, h / BAR_H, 1]));
        if (R() < 0.35 && !(gated && Math.abs(u - ROAD_Z) < 4)) { const [tx, tz] = pt(u + R.range(-0.2, 0.2), inward * R.range(0.1, 0.3)); tuft(tx, tz, 1.1); }
      }
      for (const y of [0.22, 1.28]) {
        const [x, z] = pt((a + b) / 2);
        // rails are as dark as the ink, so like the bars they go without a hull
        add(G.box, MAT.iron, M([x, y + R.range(-0.02, 0.02), z], [0, along === 'x' ? 0 : Math.PI / 2, R.range(-0.008, 0.008)], [b - a, 0.05, 0.04]), 0);
      }
    }
  }
  for (const [x, z] of posts) {
    const pr = rng(Math.floor(x * 31 + z * 7 + 999));
    const pm = M([x, 0, z], [pr.range(-0.04, 0.04), pr.range(-0.2, 0.2), pr.range(-0.04, 0.04)]);
    const sub = batch.sub(pm);
    pillars.push(pm);
    const h = pillarParts(sub, pr, 0.4, 1.95);
    sub(G.ball, MAT.stone, M([0, h + 0.13, 0], [0, 0, 0], 0.15), 0.015);
    tuft(x + pr.range(-0.4, 0.4), z + pr.range(-0.4, 0.4), 1.3);
  }
  // bars are nearly ink-dark already, so they go without a hull (saves a draw call and 5k triangles)
  const barMesh = new THREE.InstancedMesh(paintAttrs(spear, MAT.iron), paintMat(), bars.length);
  bars.forEach((m, i) => barMesh.setMatrixAt(i, m));
  barMesh.frustumCulled = false;
  s.add(barMesh);

  // gateways: leaning stone pillars with lanterns, iron leaves swung open outward (the truck enters at +X)
  for (const sx of [1, -1]) {
    const gx = sx * FENCE;
    for (const [hz, sz] of [[gate0 - 0.35, -1], [gate1 + 0.35, 1]]) {
      const pr = rng(Math.floor(hz * 13 + sx * 5 + 50));
      const pm = M([gx, 0, hz], [sz * 0.05, pr.range(-0.1, 0.1), pr.range(-0.03, 0.03)]);
      const sub = batch.sub(pm);
      const h = pillarParts(sub, pr, 0.58, 2.7);
      // a stone skull-ish ball under the lantern, then the lantern on a short neck
      sub(G.tube6, MAT.iron, M([0, h + 0.2, 0], [0, 0, 0], [0.07, 0.25, 0.07]), 0.012);
      sub(G.box, MAT.stone, M([0, h + 0.07, 0], [0, 0.3, 0], [0.5, 0.14, 0.5]), 0.015);
      lanternParts(sub, M([0, h + 0.62, 0], [0, 0.4, 0]), 1.6);
      glowQuad(new THREE.Vector3(0, h + 0.62, 0).applyMatrix4(pm), 2.6, 0.8);
      for (let i = 0; i < 3; i++) tuft(gx + pr.range(-0.6, 0.6), hz + sz * pr.range(0.35, 0.7), 1.3);
      // leaf hinged at the pillar's road-side edge, swung ~155 degrees open (lies near the fence outside)
      const open = sx === 1 ? 1.75 + (sz + 1) * 0.08 : sz === 1 ? 1.9 : 2.45;
      const dx = sx * Math.sin(open), dz = -sz * Math.cos(open);
      const yaw = Math.atan2(-dz, dx);
      const droop = sx === -1 && sz === 1 ? -0.06 : 0;
      gateLeafParts(batch.sub(M([gx + sx * 0.12, 0.04, hz - sz * 0.32], [0, yaw, droop])), pr, 2.35);
    }
  }
  crow(new THREE.Vector3(FENCE, 2.25, FENCE / 4), -Math.PI / 2 - 0.4);

  // lantern posts (the flame height must stay at LANTERN_Y: the lighting shader puts the light there)
  LANTERNS.forEach(([x, z], i) => {
    const lr = rng(900 + i);
    lanternPostParts(batch.sub(M([x, 0, z], [lr.range(-0.025, 0.025), 0, lr.range(-0.025, 0.025)])), 900 + i);
    glowQuad(new THREE.Vector3(x, LANTERN_Y, z), 2.6, 0.8);
    for (let k = 0; k < 3; k++) { const a = lr() * 6.3; tuft(x + Math.cos(a) * 0.3, z + Math.sin(a) * 0.3, 0.9); }
  });

  // crooked signpost inside the +X gateway
  const sign = M([FENCE - 3.4, 0, gate0 - 1.6], [0.04, -Math.PI / 2 + 0.25, -0.06]);
  const ss = batch.sub(sign);
  ss(G.box, MAT.wood, M([0, 1.2, 0], [0, 0, 0], [0.12, 2.4, 0.12]), 0.014);
  ss(G.cone4, MAT.wood, M([0, 2.47, 0], [0, Math.PI / 4, 0], [0.11, 0.14, 0.11]), 0.012);
  const labels = ['GRAVES', 'SHED', 'NO REFUNDS'];
  const text = [];
  labels.forEach((_, i) => {
    const dir = i === 1 ? -1 : 1;
    const shape = new THREE.Shape([[-0.3, -0.13], [0.72, -0.13], [0.86, 0], [0.72, 0.13], [-0.3, 0.13]].map(([x, y]) => new THREE.Vector2(x * dir, y)));
    const g = new THREE.ExtrudeGeometry(shape, { depth: 0.05, bevelEnabled: false });
    const bm = sign.clone().multiply(M([0, 2.05 - i * 0.38, 0.07], [0, (i - 1) * 0.35, (i - 1) * 0.07 * dir]));
    add(g, i === 2 ? MAT.woodDark : MAT.woodLight, bm, 0.014);
    const p = new THREE.PlaneGeometry(0.98, 0.245);
    const uv = p.attributes.uv;
    for (let k = 0; k < uv.count; k++) uv.setY(k, 1 - (i + 1 - uv.getY(k)) / labels.length);
    p.applyMatrix4(bm.clone().multiply(M([0.27 * dir, 0, 0.056])));
    text.push(p);
  });
  const textMesh = new THREE.Mesh(mergeGeometries(text), new THREE.MeshBasicMaterial({ map: signLabels(labels), transparent: true, alphaTest: 0.25, color: '#8d84a6', depthWrite: false }));
  s.add(textMesh);

  // vegetation: grass, reeds, toadstools, ferns, ivy, brambles... one merged mesh with one material
  const plants = buildPlants({ tufts, shrooms, pillars });
  s.add(plants.mesh);

  const statics = new THREE.Group();
  statics.name = 'environment';
  batch.build(statics);
  s.add(statics);
  glow.mesh.name = 'glows';
  glow.mesh.visible = false;
  s.add(glow.mesh);

  const backdrop = buildBackdrop(s);
  let lamps = 1; // lantern and window glow sprites: 1 at night, out by day
  return {
    groundMat,
    setDay(k) {
      lamps = lampsOn(k);
      glow.mesh.visible = lamps > 0;
      backdrop.setDay(k);
    },
    update(time, dt, camera) {
      plants.update(time);
      if (glow.mesh.visible) glows.forEach((g, i) => {
        const f = 0.88 + 0.08 * Math.sin(time * 11 + i * 1.7) * Math.sin(time * 6.3 + i * 2.9) + 0.04 * Math.sin(time * 2.1 + i);
        glow.set(g.i, g.base * f * lamps, 0.96 + f * 0.05);
      });
      // crows jerk their heads to a new direction every few seconds
      for (const c of crows) {
        if (time > c.next) { c.target = c.head.userData.yaw0 + (Math.random() - 0.5) * 2.4; c.next = time + 0.6 + Math.random() * 3; }
        c.head.rotation.y += (c.target - c.head.rotation.y) * Math.min(1, dt * 18);
      }
      backdrop.update(time, dt, camera);
    },
  };
}

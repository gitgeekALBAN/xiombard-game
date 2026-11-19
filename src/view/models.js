import * as THREE from 'three';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { toon, outlineMat, glowMat } from '../shaders/toon.js';
import { NPARTS, P } from '../shared/skeleton.js';
import { COFFIN, TRUCK } from '../shared/layout.js';
import { rng } from '../shared/rng.js';

// All models are built from primitives in code — no model or texture files.
const SPH = new THREE.SphereGeometry(1, 20, 14);
const SPH_LO = new THREE.SphereGeometry(1, 10, 8);
const CYL = new THREE.CylinderGeometry(1, 1, 1, 18);
const BOX = new THREE.BoxGeometry(1, 1, 1);
const capCache = new Map();
const capsule = (r, len) => {
  const k = `${r}:${len}`;
  if (!capCache.has(k)) capCache.set(k, new THREE.CapsuleGeometry(r, len, 4, 10));
  return capCache.get(k);
};

const outlineGeoCache = new WeakMap();
function outlineGeo(g) {
  let o = outlineGeoCache.get(g);
  if (!o) {
    const c = g.clone();
    for (const k of Object.keys(c.attributes)) if (k !== 'position') c.deleteAttribute(k);
    o = mergeVertices(c, 1e-3);
    o.computeVertexNormals();
    outlineGeoCache.set(g, o);
  }
  return o;
}

export function part(geo, mat, { pos, rot, scale, outline = 0.02 } = {}) {
  const m = new THREE.Mesh(geo, mat);
  if (pos) m.position.set(...pos);
  if (rot) m.rotation.set(...rot);
  if (scale) m.scale.set(...(Array.isArray(scale) ? scale : [scale, scale, scale]));
  if (outline) {
    const s = m.scale;
    const o = new THREE.Mesh(outlineGeo(geo), outlineMat(outline / Math.max(0.05, Math.min(s.x, s.y, s.z))));
    m.add(o);
  }
  return m;
}

const DARK = '#1b1424';

function eyes(head, R, corpse, z) {
  for (const sx of [-1, 1]) {
    const x = sx * 0.1;
    if (corpse) {
      for (const a of [0.8, -0.8]) head.add(part(BOX, toon(DARK), { pos: [x, 0.04, z], rot: [0, 0, a], scale: [0.13, 0.026, 0.03], outline: 0 }));
    } else {
      head.add(part(SPH, toon(DARK), { pos: [x, 0.04, z - 0.02], scale: [0.085, 0.1, 0.05], outline: 0 }));
      head.add(part(SPH_LO, toon('#fff8e8', { emissive: 0.8 }), { pos: [x + 0.012, 0.055, z + 0.02], scale: 0.022, outline: 0 }));
    }
  }
}

// Characters: one THREE.Group per skeleton part, each centered on the part (see shared/skeleton.js).
// What a corpse wears: materials for torso, legs and sleeves plus a few trims. Bodies arrive in a plain shroud.
function outfitStyle(outfit, R) {
  const plain = (c) => toon(c);
  switch (outfit) {
    case 'tux': return { top: plain('#1e1a26'), legs: plain('#1e1a26'), sleeve: plain('#1e1a26'), trim: 'tux' };
    case 'sailor': { const st = toon('#f2eee2', { color2: '#2c3e70', stripes: 11 }); return { top: st, legs: plain('#2c3e70'), sleeve: st, trim: 'sailor' }; }
    case 'clown': { const st = toon('#f0c23a', { color2: '#d8433a', stripes: 7, axis: 1 }); return { top: st, legs: toon('#d8433a', { color2: '#f0c23a', stripes: 6 }), sleeve: st, trim: 'clown' }; }
    case 'gown': return { top: plain('#6b3a7a'), legs: plain('#6b3a7a'), sleeve: plain('#7d4a8c'), trim: 'gown' };
    case 'pajamas': { const st = toon(R.pick(['#5d6f8c', '#7b5d8c', '#5d8c7b']), { color2: '#e8e2d4', stripes: 9 }); return { top: st, legs: st, sleeve: st, trim: 'pajamas' }; }
    default: { const sh = toon('#d6d0c2', { color2: '#c9c2b2', stripes: 4 }); return { top: sh, legs: sh, sleeve: sh, trim: 'shroud' }; }
  }
}

export function buildCharacter(kind, seed, color, opts = {}) {
  const R = rng(seed * 31 + 7);
  const corpse = kind === 'corpse';
  const g = Array.from({ length: NPARTS }, () => new THREE.Group());
  const skin = corpse ? R.pick(['#b7c9ad', '#a9bcc6', '#c6bfd8', '#c2d1b2', '#d0c6b0']) : '#f1ebe0';
  const cloth = '#262033';
  const style = corpse ? outfitStyle(opts.outfit, rng(seed * 3 + 1)) : null;
  const clothMat = corpse ? style.top : toon(cloth);
  const pants = corpse ? style.legs : toon('#1d1824', { color2: '#8d8798', stripes: 16 });
  const skinMat = toon(skin);
  const fat = corpse ? R.range(0.9, 1.3) : 1;

  // pelvis + chest
  g[P.pelvis].add(part(SPH, pants, { scale: [0.2 * fat, 0.15, 0.16 * fat] }));
  g[P.chest].add(part(SPH, clothMat, { pos: [0, -0.02, 0], scale: [0.24 * fat, 0.27, 0.17 * fat] }));
  if (!corpse) {
    // striped scarf and coat tails
    g[P.chest].add(part(new THREE.TorusGeometry(0.13, 0.055, 8, 18), toon(color, { color2: '#f3eadb', stripes: 14, axis: 1 }), { pos: [0, 0.2, 0], rot: [Math.PI / 2, 0, 0] }));
    g[P.chest].add(part(BOX, toon(color, { color2: '#f3eadb', stripes: 14 }), { pos: [0.08, 0.02, 0.17], rot: [0.1, 0, 0.15], scale: [0.07, 0.3, 0.03] }));
    g[P.pelvis].add(part(SPH, toon(cloth), { pos: [0, -0.08, -0.06], scale: [0.21, 0.2, 0.12] }));
  } else {
    const front = 0.165 * fat, t = style.trim;
    if (t === 'tux') {
      g[P.chest].add(part(BOX, toon('#f2eee6'), { pos: [0, 0.03, front - 0.01], scale: [0.11, 0.3, 0.02], outline: 0 }));
      for (const sx of [-1, 1]) g[P.chest].add(part(new THREE.ConeGeometry(0.045, 0.09, 4), toon('#9a1d34'), { pos: [sx * 0.045, 0.17, front + 0.01], rot: [0, 0, sx * Math.PI / 2], outline: 0.006 }));
    } else if (t === 'sailor') {
      g[P.chest].add(part(BOX, toon('#2c3e70', { color2: '#f2eee2', stripes: 30 }), { pos: [0, 0.16, -0.08], rot: [0.5, 0, 0], scale: [0.36, 0.03, 0.2], outline: 0.01 }));
      g[P.chest].add(part(new THREE.ConeGeometry(0.05, 0.12, 4), toon('#c8343a'), { pos: [0, 0.1, front + 0.02], rot: [Math.PI, 0, 0], outline: 0.006 }));
    } else if (t === 'clown') {
      g[P.chest].add(part(new THREE.TorusGeometry(0.16, 0.05, 6, 16), toon('#f4efe4', { color2: '#d8d0c0', stripes: 40, axis: 1 }), { pos: [0, 0.2, 0], rot: [Math.PI / 2, 0, 0] }));
      for (let i = 0; i < 3; i++) g[P.chest].add(part(SPH_LO, toon(['#3a7fd8', '#4fc06a', '#d8433a'][i]), { pos: [0, 0.1 - i * 0.1, front], scale: 0.035, outline: 0.006 }));
    } else if (t === 'gown') {
      g[P.pelvis].add(part(new THREE.ConeGeometry(0.34, 0.6, 14, 1, true), toon('#6b3a7a', { color2: '#5a2f68', stripes: 10, axis: 1, side: THREE.DoubleSide }), { pos: [0, -0.18, 0], outline: 0.012 }));
      g[P.chest].add(part(SPH_LO, toon('#e9d9f0'), { pos: [0, 0.14, front], scale: [0.05, 0.035, 0.02], outline: 0 }));
    } else if (t === 'pajamas') {
      for (let i = 0; i < 3; i++) g[P.chest].add(part(SPH_LO, toon('#e8e2d4'), { pos: [0, 0.12 - i * 0.1, front], scale: 0.022, outline: 0 }));
    } else {
      // shroud: a rough stitched seam down the front
      g[P.chest].add(part(BOX, toon('#a8a090'), { pos: [0, 0, front], scale: [0.012, 0.36, 0.01], outline: 0 }));
    }
    if (opts.tag) {
      // the name plate you hung on them: a little wooden board on a string
      g[P.chest].add(part(BOX, toon('#8a6a48', { color2: '#76583a', stripes: 40, axis: 1 }), { pos: [0, -0.05, front + 0.03], scale: [0.2, 0.1, 0.02], outline: 0.008 }));
      g[P.chest].add(part(new THREE.TorusGeometry(0.1, 0.006, 4, 12, Math.PI), toon('#2a2230'), { pos: [0, 0.0, front + 0.02], outline: 0 }));
    }
  }

  // head
  const head = g[P.head];
  const hr = corpse ? 0.29 : 0.27;
  head.add(part(SPH, skinMat, { scale: [hr, hr * (corpse ? 1 : 1.12), hr * 0.95] }));
  eyes(head, R, corpse, hr * 0.86);
  if (corpse) {
    head.add(part(BOX, toon(DARK), { pos: [0, -0.11, hr * 0.9], scale: [0.16, 0.014, 0.02], outline: 0 }));
    for (const x of [-0.05, 0, 0.05]) head.add(part(BOX, toon(DARK), { pos: [x, -0.11, hr * 0.9], scale: [0.012, 0.05, 0.02], outline: 0 }));
    const hair = R();
    const hairMat = toon(R.pick(['#2a2233', '#6b5a7a', '#c9c2b0', '#4a3a2a']));
    if (hair < 0.4) for (let i = 0; i < 3; i++) head.add(part(new THREE.ConeGeometry(0.05, 0.22, 6), hairMat, { pos: [(i - 1) * 0.06, hr + 0.05, 0], rot: [0, 0, (i - 1) * 0.5] }));
    else if (hair < 0.7) head.add(part(SPH, hairMat, { pos: [0, hr * 0.45, -0.04], scale: [hr * 1.02, hr * 0.6, hr * 0.98] }));
    // a stitched scar
    head.add(part(BOX, toon('#5e3a4a'), { pos: [0.12, 0.17, hr * 0.62], rot: [0, 0.4, 0.6], scale: [0.12, 0.01, 0.01], outline: 0 }));
  } else {
    head.add(part(new THREE.ConeGeometry(0.04, 0.2, 8), skinMat, { pos: [0, -0.02, hr * 0.98], rot: [Math.PI / 2, 0, 0], outline: 0.01 }));
    head.add(part(new THREE.TorusGeometry(0.07, 0.012, 6, 12, Math.PI), toon(DARK), { pos: [0, -0.12, hr * 0.84], rot: [0, 0, Math.PI], outline: 0 }));
    // crooked top hat
    const hat = new THREE.Group();
    hat.position.set(0.02, hr * 1.02, -0.01);
    hat.rotation.set(-0.12, 0, 0.16);
    hat.add(part(CYL, toon('#17121f'), { scale: [0.3, 0.03, 0.3], outline: 0.01 }));
    hat.add(part(CYL, toon('#17121f'), { pos: [0, 0.23, 0], rot: [0, 0, 0.06], scale: [0.17, 0.44, 0.17], outline: 0.012 }));
    hat.add(part(CYL, toon(color), { pos: [0, 0.07, 0], scale: [0.178, 0.07, 0.178], outline: 0 }));
    head.add(hat);
  }

  // arms
  const sleeveMat = corpse ? style.sleeve : clothMat;
  for (const [u, f] of [[P.uarmL, P.farmL], [P.uarmR, P.farmR]]) {
    g[u].add(part(capsule(0.065, 0.24), sleeveMat));
    g[f].add(part(capsule(0.058, 0.2), corpse && style.trim === 'shroud' ? skinMat : sleeveMat, { pos: [0, 0.02, 0] }));
    g[f].add(part(SPH, skinMat, { pos: [0, -0.19, 0.01], scale: [0.07, 0.08, 0.06] }));
  }
  // legs
  for (const [t, s] of [[P.thighL, P.shinL], [P.thighR, P.shinR]]) {
    g[t].add(part(capsule(0.075, 0.26), pants));
    g[s].add(part(capsule(0.065, 0.26), corpse ? skinMat : pants, { pos: [0, 0.02, 0] }));
    g[s].add(part(SPH, toon(corpse ? (style.trim === 'tux' ? '#120e18' : skin) : '#120e18'), { pos: [0, -0.19, 0.06], rot: [0.15, 0, 0], scale: [0.075, 0.06, corpse ? 0.12 : 0.17] }));
  }
  if (corpse) {
    // the delivery note, tied to the big toe
    g[P.shinR].add(part(BOX, toon('#f4eedc'), { pos: [0.02, -0.2, 0.2], rot: [0.3, 0.2, 0.1], scale: [0.09, 0.05, 0.012], outline: 0.006 }));
  }

  if (!corpse) {
    // shovel, shown while digging
    const shovel = new THREE.Group();
    shovel.position.set(0, -0.2, 0.05);
    shovel.rotation.set(-1.1, 0, 0);
    shovel.add(part(CYL, toon('#7a5236'), { pos: [0, 0.1, 0], scale: [0.025, 1.1, 0.025], outline: 0.008 }));
    shovel.add(part(BOX, toon('#9aa0ad'), { pos: [0, -0.5, 0], scale: [0.22, 0.28, 0.025], outline: 0.01 }));
    shovel.visible = false;
    g[P.farmR].add(shovel);
    g[P.farmR].userData.shovel = shovel;
  }
  return g;
}

// Classic tapered six-sided coffin, open on top so you can see who is inside. lid: 0 open, 1 closed, 2 nailed.
export function buildCoffin(seed, lid = 0) {
  const R = rng(seed);
  const { hx, hy, hz, wall } = COFFIN;
  const outline = [[-0.6 * hx, -hz], [0.6 * hx, -hz], [hx, 0.45 * hz], [0.7 * hx, hz], [-0.7 * hx, hz], [-hx, 0.45 * hz]];
  const shape = new THREE.Shape(outline.map(([x, z]) => new THREE.Vector2(x, -z)));
  const inner = new THREE.Path(outline.map(([x, z]) => new THREE.Vector2(x * (1 - wall * 2.4), -z * (1 - wall * 1.2))).reverse());
  shape.holes.push(inner);
  const wallGeo = new THREE.ExtrudeGeometry(shape, { depth: hy * 2, bevelEnabled: false });
  wallGeo.rotateX(-Math.PI / 2);
  wallGeo.translate(0, -hy, 0);
  const wood = R.pick(['#4a2f42', '#3d2a3a', '#5a3a3a', '#3a3047']);
  const g = new THREE.Group();
  g.add(part(wallGeo, toon(wood, { color2: '#2a1d2a', stripes: 8, axis: 0 }), { outline: 0.02 }));
  const floorShape = new THREE.Shape(outline.map(([x, z]) => new THREE.Vector2(x, -z)));
  const floorGeo = new THREE.ExtrudeGeometry(floorShape, { depth: 0.06, bevelEnabled: false });
  floorGeo.rotateX(-Math.PI / 2);
  floorGeo.translate(0, -hy, 0);
  g.add(part(floorGeo, toon(wood), { outline: 0.02 }));
  g.add(part(BOX, toon('#8b1d3a', { color2: '#6e1530', stripes: 18, axis: 2 }), { pos: [0, -hy + 0.08, 0], scale: [hx * 1.5, 0.02, hz * 1.8], outline: 0 }));
  g.add(part(SPH, toon('#efe6f0'), { pos: [0, -hy + 0.13, hz * 0.72], scale: [0.2, 0.06, 0.12], outline: 0.01 }));
  if (lid) {
    const lidGeo = new THREE.ExtrudeGeometry(new THREE.Shape(outline.map(([x, z]) => new THREE.Vector2(x * 1.04, -z * 1.02))), { depth: 0.06, bevelEnabled: false });
    lidGeo.rotateX(-Math.PI / 2);
    lidGeo.translate(0, hy - 0.01, 0);
    g.add(part(lidGeo, toon(wood, { color2: '#2a1d2a', stripes: 8, axis: 0 }), { outline: 0.02 }));
    g.add(part(BOX, toon('#c9b98f'), { pos: [0, hy + 0.06, -0.1], scale: [0.06, 0.012, 0.5], outline: 0 }));
    g.add(part(BOX, toon('#c9b98f'), { pos: [0, hy + 0.06, 0.05], scale: [0.3, 0.012, 0.06], outline: 0 }));
    if (lid === 2) {
      for (const [x, z] of [[-0.55, -0.95], [0.55, -0.95], [-0.9, 0.45], [0.9, 0.45], [-0.62, 0.95], [0.62, 0.95], [-0.8, -0.2], [0.8, -0.2]]) {
        g.add(part(CYL, toon('#9aa0ad'), { pos: [x * hx, hy + 0.06, -z * hz], scale: [0.025, 0.012, 0.025], outline: 0 }));
      }
    }
  }
  // a little cross on the side
  for (const sx of [-1, 1]) {
    g.add(part(BOX, toon('#c9b98f'), { pos: [sx * (hx + 0.005), 0, -0.1], scale: [0.02, 0.22, 0.05], outline: 0 }));
    g.add(part(BOX, toon('#c9b98f'), { pos: [sx * (hx + 0.005), 0.04, -0.1], scale: [0.02, 0.05, 0.16], outline: 0 }));
  }
  return [g];
}

// Wobbly little hearse-truck. Faces -X, open bed at +X.
export function buildTruck() {
  const g = new THREE.Group();
  const body = toon('#4b2c5e');
  const trim = toon('#d8cdb8');
  const box = (b, mat, grow = 0) => part(BOX, mat, { pos: b.c, scale: [b.h[0] * 2 + grow, b.h[1] * 2 + grow, b.h[2] * 2 + grow], outline: 0.025 });
  const [hood, cab, bed, w1, w2] = TRUCK.boxes;
  g.add(box(hood, body));
  g.add(part(SPH, body, { pos: [-2.5, 1.38, 0], scale: [0.55, 0.18, 0.88] }));
  g.add(box(cab, body));
  g.add(part(SPH, body, { pos: [-1.3, 2.38, 0], scale: [0.78, 0.22, 1.02] }));
  g.add(box(bed, toon('#3a2340')));
  g.add(box(w1, toon('#5a3a6e', { color2: '#3a2348', stripes: 5 })));
  g.add(box(w2, toon('#5a3a6e', { color2: '#3a2348', stripes: 5 })));
  // windows
  for (const z of [-1.005, 1.005]) g.add(part(BOX, toon('#2e3f66', { emissive: 0.35 }), { pos: [-1.35, 1.85, z], scale: [0.9, 0.5, 0.02], outline: 0 }));
  g.add(part(BOX, toon('#2e3f66', { emissive: 0.35 }), { pos: [-2.005, 1.85, 0], scale: [0.02, 0.5, 1.6], outline: 0 }));
  // grille, bumper, skull ornament, headlights
  g.add(part(BOX, trim, { pos: [-3.02, 0.85, 0], scale: [0.06, 0.6, 1.4] }));
  g.add(part(BOX, trim, { pos: [-3.1, 0.4, 0], scale: [0.15, 0.15, 2.0] }));
  g.add(part(SPH, toon('#f2ecdc'), { pos: [-2.85, 1.55, 0], scale: [0.14, 0.15, 0.13] }));
  for (const z of [-0.6, 0.6]) {
    g.add(part(SPH, toon('#ffe9a8', { emissive: 1 }), { pos: [-3.02, 1.1, z], scale: [0.08, 0.16, 0.16] }));
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.4), glowMat('#ffd890', 0.7));
    glow.position.set(-3.1, 1.1, z);
    glow.userData.billboard = true;
    g.add(glow);
  }
  // wheels
  const wheels = [];
  for (const [x, z] of [[-2.2, 1.0], [-2.2, -1.0], [2.0, 1.0], [2.0, -1.0]]) {
    const w = new THREE.Group();
    w.position.set(x, 0.5, z);
    w.add(part(CYL, toon('#15111c'), { rot: [Math.PI / 2, 0, 0], scale: [0.5, 0.32, 0.5] }));
    w.add(part(CYL, toon('#e8e0d0'), { rot: [Math.PI / 2, 0, 0], scale: [0.26, 0.34, 0.26], outline: 0 }));
    w.add(part(BOX, toon('#15111c'), { scale: [0.42, 0.06, 0.36], outline: 0 }));
    g.add(w);
    wheels.push(w);
    g.add(part(SPH, body, { pos: [x, 0.95, z * 1.02], scale: [0.62, 0.3, 0.2] })); // fenders
  }
  // tailgate (opens on delivery)
  const gate = new THREE.Group();
  gate.position.set(3.0, 0.9, 0);
  gate.add(part(BOX, toon('#5a3a6e', { color2: '#3a2348', stripes: 5 }), { pos: [0, 0.12, 0], scale: [0.08, 0.24, 1.9] }));
  g.add(gate);
  g.userData = { wheels, gate };
  return [g];
}

// Small procedural headstone. kind: round | cross | obelisk | slab
export function buildHeadstone(kind, w, h, seed) {
  const R = rng(seed);
  const stone = toon(R.pick(['#9a97ad', '#8b8a9e', '#a7a2b0', '#8f96a3']), { color2: '#7e7b92', stripes: 3 });
  const g = new THREE.Group();
  if (kind === 'cross') {
    g.add(part(BOX, stone, { pos: [0, h / 2, 0], scale: [0.16, h, 0.14] }));
    g.add(part(BOX, stone, { pos: [0, h * 0.7, 0], scale: [w * 0.75, 0.16, 0.14] }));
  } else if (kind === 'obelisk') {
    g.add(part(BOX, stone, { pos: [0, h * 0.45, 0], scale: [w * 0.45, h * 0.9, w * 0.45] }));
    g.add(part(new THREE.ConeGeometry(w * 0.33, h * 0.3, 4), stone, { pos: [0, h * 1.03, 0], rot: [0, Math.PI / 4, 0] }));
  } else {
    const body = kind === 'slab' ? h : h - w / 2;
    g.add(part(BOX, stone, { pos: [0, body / 2, 0], scale: [w, body, 0.2] }));
    if (kind === 'round') g.add(part(CYL, stone, { pos: [0, body, 0], rot: [Math.PI / 2, 0, 0], scale: [w / 2, 0.2, w / 2] }));
    // engraved lines
    for (let i = 0; i < 3; i++) g.add(part(BOX, toon('#5c5970'), { pos: [0, body * (0.7 - i * 0.15), 0.101], scale: [w * (0.6 - i * 0.12), 0.03, 0.005], outline: 0 }));
  }
  g.add(part(BOX, toon('#3a3346'), { pos: [0, 0.03, 0], scale: [w * 1.15, 0.08, 0.35], outline: 0 }));
  return g;
}

// Twisted Burton-esque tree: a curling trunk with spiral branches.
export function buildTree(seed, height) {
  const R = rng(seed);
  const mat = toon('#1c1724');
  const g = new THREE.Group();
  const tube = (pts, r) => {
    const curve = new THREE.CatmullRomCurve3(pts);
    const geo = new THREE.TubeGeometry(curve, 24, r, 7, false);
    const pos = geo.attributes.position;
    // taper along the tube
    const segs = 25, radial = 8;
    for (let i = 0; i < segs; i++) {
      const t = i / (segs - 1), k = 1 - t * 0.75;
      const c = curve.getPointAt(t);
      for (let j = 0; j < radial; j++) {
        const idx = i * radial + j;
        pos.setXYZ(idx, c.x + (pos.getX(idx) - c.x) * k, c.y + (pos.getY(idx) - c.y) * k, c.z + (pos.getZ(idx) - c.z) * k);
      }
    }
    geo.computeVertexNormals();
    g.add(new THREE.Mesh(geo, mat));
    return curve;
  };
  const trunkPts = [];
  for (let i = 0; i <= 6; i++) {
    const t = i / 6;
    trunkPts.push(new THREE.Vector3(Math.sin(t * 4 + seed) * 0.5 * t, t * height, Math.cos(t * 3 + seed) * 0.4 * t));
  }
  const trunk = tube(trunkPts, 0.38);
  const nb = 4 + Math.floor(R() * 3);
  for (let b = 0; b < nb; b++) {
    const t0 = R.range(0.45, 0.95);
    const start = trunk.getPointAt(t0);
    const a = R() * Math.PI * 2, len = R.range(1.6, 3.2) * (1.2 - t0 * 0.5);
    const pts = [start];
    let dir = new THREE.Vector3(Math.cos(a), R.range(0.2, 0.8), Math.sin(a)).normalize();
    let p = start.clone();
    for (let i = 1; i <= 5; i++) {
      p = p.clone().addScaledVector(dir, len / 5);
      dir.applyAxisAngle(new THREE.Vector3(0, 1, 0), 0.3).y -= 0.1;
      pts.push(p);
    }
    // curl at the tip
    const tip = p.clone();
    for (let i = 1; i <= 4; i++) {
      const ang = i * 1.3;
      pts.push(tip.clone().add(new THREE.Vector3(Math.cos(a + ang) * 0.25 / i, -0.1 * i + 0.15, Math.sin(a + ang) * 0.25 / i)));
    }
    tube(pts, 0.14);
  }
  return g;
}

export const geo = { SPH, CYL, BOX };

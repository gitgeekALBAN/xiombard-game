import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { Batch, MAT, G, M, paintBox } from './models/environment.js';
import { spec, P, paintMat, paintAttrs, glowSprites } from '../shaders/paint-env.js';
import { lampsOn } from '../shaders/toon.js';
import { PAL } from './palette.js';
import { rng } from '../shared/rng.js';
import { MORGUE, OUTFITS, morgueBoxes, TRAPS, FENCE_SECTIONS, FENCE_HP, fenceSectionAt } from '../shared/layout.js';

// The morgue and what the night does to the yard.
// The morgue's walls, floor and furniture go into the yard's static Batch (no draw calls of their own). The roof is
// a mesh of its own so it can hide while a third-person camera follows you indoors. All lettering (the two signs
// and the name tags on the board) is drawn into one canvas at runtime and shown by one mesh.

const I = new THREE.Matrix4();

// batch: the yard's static Batch. Returns { roof, setTags(tags), setDay(k) }.
export function buildMorgue(scene, batch) {
  const Mg = MORGUE, R = rng(4711), w = batch.sub(I);
  const plaster = spec('#6a5a72', { pat: P.planks, p1: 0.3, rim: 0.8 }), floor = spec(PAL.woodLight, { pat: P.planks, p1: 0.35 });
  const cx = (Mg.x0 + Mg.x1) / 2, cz = (Mg.z0 + Mg.z1) / 2, wd = Mg.x1 - Mg.x0, dp = Mg.z1 - Mg.z0;
  // walls (the colliders' own boxes), with a slight crooked lean
  for (const b of morgueBoxes(false)) w(G.box, plaster, M(b.c, [0, 0, R.range(-0.012, 0.012)], [b.h[0] * 2, b.h[1] * 2, b.h[2] * 2]), 0.014);
  // corner posts and a beam along the top of the long walls
  for (const x of [Mg.x0, Mg.x1]) for (const z of [Mg.z0, Mg.z1]) w(G.box, MAT.woodDark, M([x, Mg.h / 2, z], [0, 0, R.range(-0.03, 0.03)], [0.22, Mg.h + 0.1, 0.22]), 0.016);
  for (const z of [Mg.z0, Mg.z1]) w(G.box, MAT.boardDark, M([cx, Mg.h - 0.06, z], [0, 0, 0.01], [wd + 0.3, 0.14, 0.3]), 0.016);
  w(G.box, floor, M([cx, 0.012, cz], [0, 0, 0], [wd, 0.024, dp]), 0);
  // door frame with a little skull over it, and a stone step
  const dc = (Mg.door[0] + Mg.door[1]) / 2, dw = Mg.door[1] - Mg.door[0];
  for (const x of Mg.door) w(G.box, MAT.board, M([x, 1.1, Mg.z0], [0, 0, 0], [0.14, 2.2, 0.3]), 0.014);
  w(G.box, MAT.board, M([dc, 2.25, Mg.z0], [0, 0, 0.03], [dw + 0.3, 0.16, 0.32]), 0.014);
  w(G.sph, MAT.skull2, M([dc, 2.45, Mg.z0 - 0.18], [0, Math.PI, 0], [0.13, 0.14, 0.07]), 0.012);
  w(G.box, MAT.stone, M([dc, 0.06, Mg.z0 - 0.45], [0, 0.03, 0], [dw, 0.12, 0.6]), 0.016);
  // hatch frame, sill and a little awning over it
  const hc = (Mg.hatch[0] + Mg.hatch[1]) / 2, hw = Mg.hatch[1] - Mg.hatch[0];
  for (const x of Mg.hatch) w(G.box, MAT.board, M([x, 1.45, Mg.z1], [0, 0, 0], [0.12, 1.2, 0.3]), 0.014);
  w(G.box, MAT.boardLight, M([hc, Mg.hatchSill, Mg.z1], [0, 0, 0], [hw + 0.2, 0.08, 0.5]), 0.014);
  w(G.box, MAT.shingle, M([hc, 2.2, Mg.z1 + 0.5], [0.45, 0, 0], [hw + 0.6, 0.06, 1.0]), 0.014);
  // warm windows
  const glass = spec(PAL.amber, { pat: P.window, p1: 0.33, p2: 0.33 });
  const win = (x, z, ry) => w(paintBox(0.66, 0.66, 0.07), glass, M([x, 1.6, z], [0, ry, R.range(-0.06, 0.06)]), 0.012);
  win(Mg.x0 - 0.02, 7.6, Math.PI / 2); win(Mg.x1 + 0.02, 11.4, -Math.PI / 2); win(-2.4, Mg.z0 - 0.02, 0); win(4.4, Mg.z0 - 0.02, 0);
  // intake table: a stone slab on iron legs
  const tb = Mg.table;
  w(G.box, spec('#9a93ad', { pat: P.stone }), M([tb.x, tb.top - 0.05, tb.z], [0, 0, 0], [tb.hx * 2, 0.1, tb.hz * 2]), 0.016);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) w(G.box, MAT.iron, M([tb.x + sx * (tb.hx - 0.1), tb.top / 2 - 0.05, tb.z + sz * (tb.hz - 0.08)], [0, 0, 0], [0.07, tb.top - 0.1, 0.07]), 0.01);
  // crate of nails and planks
  const cr = Mg.crate;
  w(G.box, MAT.board, M([cr.x, cr.hy, cr.z], [0, 0.1, 0], [cr.hx * 2, cr.hy * 2, cr.hz * 2]), 0.016);
  for (let i = 0; i < 3; i++) w(G.box, MAT.boardLight, M([cr.x - 0.05 + i * 0.04, cr.hy * 2 + 0.04 + i * 0.05, cr.z], [0, 0.3 - i * 0.25, 0], [1.1, 0.04, 0.16]), 0.01);
  for (let i = 0; i < 7; i++) w(G.cyl6, MAT.iron, M([cr.x + 0.28 - i * 0.07, cr.hy * 2 + 0.03, cr.z + 0.22], [0, 0, 1.45], [0.012, 0.13, 0.012]), 0);
  // tag board on the west wall
  const B = Mg.board;
  w(G.box, MAT.boardDark, M([B.x + 0.05, B.y, B.z0 + ((B.n - 1) * B.dz) / 2], [0, 0, 0], [0.05, 0.62, B.n * B.dz + 0.25]), 0.014);
  // outfit rack on the east wall: a rail with a little stuffed dummy per outfit
  const Rk = Mg.rack;
  w(G.cyl6, MAT.iron, M([Rk.x - 0.2, Rk.y + 0.42, Rk.z0 + ((OUTFITS.length - 1) * Rk.dz) / 2], [Math.PI / 2, 0, 0], [0.025, OUTFITS.length * Rk.dz + 0.3, 0.025]), 0.008);
  const cloth = { tux: ['#1e1a26', '#f2eee6'], sailor: ['#f2eee2', '#2c3e70'], clown: ['#f0c23a', '#d8433a'], gown: ['#6b3a7a', '#e9d9f0'], pajamas: ['#5d6f8c', '#e8e2d4'] };
  OUTFITS.forEach((o, i) => {
    const [a, b] = cloth[o.id], z = Rk.z0 + i * Rk.dz;
    w(G.sph, spec(a, { pat: o.id === 'tux' || o.id === 'gown' ? P.plain : P.stripes, p1: 7 }), M([Rk.x - 0.22, Rk.y, z], [0, 0, 0], [0.13, 0.28, 0.2]), 0.012);
    w(G.box, spec(b), M([Rk.x - 0.36, Rk.y + 0.08, z], [0, 0, 0], [0.02, 0.1, 0.1]), 0);
    w(G.box, MAT.iron, M([Rk.x - 0.22, Rk.y + 0.33, z], [0, 0, 0], [0.015, 0.16, 0.015]), 0);
    if (o.id === 'gown') w(G.cone6, spec(a), M([Rk.x - 0.22, Rk.y - 0.38, z], [0, 0, 0], [0.24, 0.44, 0.24]), 0.012);
  });
  // hanging lamp
  const [lx, lz] = Mg.lamp;
  w(G.cyl6, MAT.iron, M([lx, Mg.h - 0.3, lz], [0, 0, 0], [0.012, 0.6, 0.012]), 0);
  w(G.cone6, MAT.iron, M([lx, Mg.h - 0.62, lz], [0, 0, 0], [0.2, 0.14, 0.2]), 0.01);
  w(G.sph, MAT.glass, M([lx, Mg.h - 0.72, lz], [0, 0, 0], 0.09), 0.01);

  // roof: two crooked shingle slopes, a ridge beam, gable ends and a chimney
  const roofB = new Batch(), rw = roofB.sub(I);
  for (const sz of [-1, 1]) rw(G.box, MAT.shingle, M([cx, Mg.h + 0.62, cz + sz * dp * 0.26], [sz * 0.4, 0, 0.015], [wd + 0.8, 0.12, dp * 0.62]), 0.016);
  rw(G.box, MAT.boardDark, M([cx, Mg.h + 1.2, cz], [Math.PI / 4, 0, 0.01], [wd + 0.9, 0.16, 0.16]), 0.016);
  for (const x of [Mg.x0, Mg.x1]) rw(G.box, plaster, M([x, Mg.h + 0.5, cz], [0, 0, 0], [0.1, 1.0, dp * 0.95]), 0.014);
  rw(G.box, spec('#5a4a62', { pat: P.stone }), M([Mg.x1 - 1.6, Mg.h + 1.1, cz + 1.0], [0, 0.1, 0.06], [0.45, 1.3, 0.45]), 0.016);
  const roof = new THREE.Group();
  roof.name = 'morgue-roof';
  roofB.build(roof);
  scene.add(roof);

  // lettering: one canvas. Cells: six name tags (two per row), then the two signs.
  const CW = 512, CH = 640, canvas = document.createElement('canvas');
  canvas.width = CW; canvas.height = CH;
  const g = canvas.getContext('2d'), tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const quads = [];
  const quad = (px, py, pw, ph, wm, hm, m) => {
    const q = new THREE.PlaneGeometry(wm, hm), uv = q.attributes.uv;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, (px + uv.getX(i) * pw) / CW, 1 - (py + (1 - uv.getY(i)) * ph) / CH);
    quads.push(q.applyMatrix4(m));
  };
  const sign = (text, py, font) => {
    g.fillStyle = '#2a2236'; g.fillRect(0, py, CW, 128);
    g.strokeStyle = '#6a4a52'; g.lineWidth = 10; g.strokeRect(5, py + 5, CW - 10, 118);
    g.fillStyle = '#f0c060'; g.font = `bold ${font}px Georgia, serif`; g.textAlign = 'center'; g.fillText(text, CW / 2, py + 64 + font * 0.34, CW - 40);
  };
  sign('MORGUE', 384, 64); sign('DELIVERIES', 512, 60);
  quad(0, 384, CW, 128, 1.68, 0.42, M([dc, 2.68, Mg.z0 - 0.2], [0, Math.PI, 0.04]));
  quad(0, 512, CW, 128, 2.1, 0.42, M([hc, 2.5, Mg.z1 + 0.2], [0, 0, 0.04]));
  const cell = (i) => [(i % 2) * 256, Math.floor(i / 2) * 128];
  for (let i = 0; i < B.n; i++) quad(...cell(i), 256, 128, 0.36, 0.18, M([B.x + 0.09, B.y - (i % 2) * 0.12, B.z0 + i * B.dz], [0, Math.PI / 2, ((i % 3) - 1) * 0.08]));
  const textMat = new THREE.MeshBasicMaterial({ map: tex, alphaTest: 0.5, fog: true });
  const textMesh = new THREE.Mesh(mergeGeometries(quads), textMat);
  textMesh.name = 'morgue-text';
  scene.add(textMesh);
  const shown = Array(B.n).fill(undefined);

  const glow = glowSprites('#ffc070', 2);
  glow.add(new THREE.Vector3(lx, Mg.h - 0.72, lz), 2.2, 0.75);
  glow.mesh.visible = false;
  scene.add(glow.mesh);

  return {
    roof,
    // tags: the names on the board, null where a tag was taken
    setTags(tags) {
      let dirty = false;
      (tags || []).forEach((t, i) => {
        if (i >= B.n || shown[i] === t) return;
        shown[i] = t;
        dirty = true;
        const [x, y] = cell(i);
        g.clearRect(x, y, 256, 128);
        if (!t) return;
        g.fillStyle = '#e9dcc0'; g.fillRect(x, y, 256, 128);
        g.strokeStyle = '#6a5440'; g.lineWidth = 8; g.strokeRect(x + 4, y + 4, 248, 120);
        g.fillStyle = '#2a2236'; g.textAlign = 'center';
        const [first, ...rest] = t.split(' ');
        g.font = 'italic 34px Georgia, serif'; g.fillText(first, x + 128, y + 52, 236);
        g.font = 'bold 40px Georgia, serif'; g.fillText(rest.join(' '), x + 128, y + 100, 236);
      });
      if (dirty) tex.needsUpdate = true;
    },
    setDay(k) {
      glow.mesh.visible = lampsOn(k) > 0;
      textMat.color.setScalar(0.5 + 0.5 * k); // the paper is not a lamp: dimmer at night
    },
  };
}

// Bear traps (armed / sprung / broken) and the fence as the night left it.
// fence: { bars: { mesh, mats }, rails: { mesh, mats } } from buildWorld (instanced; mats are the intact matrices).
// Returns { set(state) } fed with the host's state every snapshot.
export function buildYardDamage(scene, fence) {
  const teeth = spec('#b8b3c4');
  // one geometry per trap state, drawn instanced: three draw calls for all the traps
  const looks = ['armed', 'sprung', 'broken'].map((kind, ki) => {
    const b = new Batch(), w = b.sub(I), R = rng(500 + ki);
    w(G.cyl6, MAT.iron, M([0, 0.03, 0], [kind === 'broken' ? 0.25 : 0, 0, 0], [0.24, 0.05, 0.24]), 0);
    for (const side of [-1, 1]) for (let i = 0; i < 7; i++) {
      if (kind === 'broken' && i % 2) continue; // half the jaw is gone
      const a = (i / 6) * Math.PI, r = 0.3, sprung = kind === 'sprung';
      const pos = sprung ? [Math.cos(a) * r, 0.05 + Math.sin(a) * r, side * 0.02] : [Math.cos(a) * r, 0.06, side * Math.sin(a) * r];
      if (kind === 'broken') { pos[0] += R.range(-0.25, 0.25); pos[2] += R.range(-0.25, 0.25); }
      w(G.box, MAT.iron, M(pos, sprung ? [0, 0, a + Math.PI / 2] : [0, -side * a, 0], [0.03, 0.03, 0.09]), 0);
      if (i % 2 === 0) w(G.cone4, teeth, M([pos[0], pos[1] + (sprung ? 0 : 0.05), pos[2] - (sprung ? 0 : side * 0.03)], sprung ? [0, 0, a + Math.PI] : [0, 0, 0], [0.02, 0.06, 0.02]), 0);
    }
    const m = new THREE.InstancedMesh(mergeGeometries(b.geos), paintMat(), TRAPS.length);
    m.count = 0;
    m.frustumCulled = false;
    m.name = 'traps-' + kind;
    scene.add(m);
    return m;
  });
  const trapAt = TRAPS.map(([x, z], i) => M([x, 0, z], [0, rng(900 + i)() * 6.3, 0]));
  let trapKey = '', fenceKey = '';

  const section = (m) => fenceSectionAt(m.elements[12], m.elements[14]);
  const bars = fence.bars.mats.map((base) => ({ base, sec: section(base) }));
  const rails = fence.rails.mats.map((base) => ({ base, sec: section(base) }));
  const tmp = new THREE.Matrix4(), tilt = new THREE.Matrix4(), none = new THREE.Matrix4().makeScale(0, 0, 0);

  return {
    set(st) {
      const tk = (st.traps || []).join(',');
      if (tk !== trapKey) {
        trapKey = tk;
        const n = [0, 0, 0];
        (st.traps || []).forEach((v, i) => { // v = snaps left * 2 + armed
          const k = v >> 1 <= 0 ? 2 : v & 1 ? 0 : 1;
          if (trapAt[i]) looks[k].setMatrixAt(n[k]++, trapAt[i]);
        });
        looks.forEach((m, k) => { m.count = n[k]; m.instanceMatrix.needsUpdate = true; });
      }
      const fk = (st.fence || []).join(',');
      if (!st.fence || fk === fenceKey) return;
      fenceKey = fk;
      // a worn section leans, the more the worse it is; a broken one lies flat, pushed in
      bars.forEach((p, i) => {
        const hp = p.sec >= 0 ? st.fence[p.sec] : FENCE_HP;
        if (hp >= FENCE_HP) tmp.copy(p.base);
        else {
          const f = FENCE_SECTIONS[p.sec], inward = -(Math.sign(f.at) || 1), jit = Math.sin(i * 12.9898) ** 2;
          const lean = inward * (hp <= 0 ? 1.42 + 0.12 * jit : (1 - hp / FENCE_HP) * 0.55 * jit);
          if (f.axis === 'z') tilt.makeRotationX(lean); else tilt.makeRotationZ(-lean);
          tmp.copy(p.base).multiply(tilt);
        }
        fence.bars.mesh.setMatrixAt(i, tmp);
      });
      rails.forEach((p, i) => fence.rails.mesh.setMatrixAt(i, p.sec >= 0 && st.fence[p.sec] <= 0 ? none : p.base));
      fence.bars.mesh.instanceMatrix.needsUpdate = true;
      fence.rails.mesh.instanceMatrix.needsUpdate = true;
    },
  };
}

// instanced rails for the fence (dark iron, no hull): returns the mesh for the given matrices
export function railMesh(mats) {
  const m = new THREE.InstancedMesh(paintAttrs(G.box.toNonIndexed(), MAT.iron), paintMat(), mats.length);
  mats.forEach((mat, i) => m.setMatrixAt(i, mat));
  m.frustumCulled = false;
  return m;
}

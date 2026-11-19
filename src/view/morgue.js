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

// batch: the yard's static Batch. Returns { roof, setDay(k) }.
export function buildMorgue(scene, batch) {
  const Mg = MORGUE, R = rng(4711), w = batch.sub(I);
  const plaster = spec('#6a5a72', { pat: P.planks, p1: 0.3, rim: 0.8 }), floor = spec(PAL.woodLight, { pat: P.planks, p1: 0.35 });
  const cx = (Mg.x0 + Mg.x1) / 2, cz = (Mg.z0 + Mg.z1) / 2, wd = Mg.x1 - Mg.x0, dp = Mg.z1 - Mg.z0;
  // walls (the colliders' own boxes), with a slight crooked lean
  for (const b of morgueBoxes(false)) w(G.box, plaster, M(b.c, [0, 0, R.range(-0.012, 0.012)], [b.h[0] * 2, b.h[1] * 2, b.h[2] * 2]), 0.014);
  // corner posts, posts along the long walls, and a beam along their tops
  for (const x of [Mg.x0, Mg.x1, -6.5, 6.5]) for (const z of [Mg.z0, Mg.z1]) w(G.box, MAT.woodDark, M([x, Mg.h / 2, z], [0, 0, R.range(-0.03, 0.03)], [0.22, Mg.h + 0.1, 0.22]), 0.016);
  for (const z of [Mg.z0, Mg.z1]) w(G.box, MAT.boardDark, M([cx, Mg.h - 0.06, z], [0, 0, 0.01], [wd + 0.3, 0.14, 0.3]), 0.016);
  w(G.box, floor, M([cx, 0.012, cz], [0, 0, 0], [wd, 0.024, dp]), 0);
  // tie beams across the hall
  for (const x of [-9.8, -6.5, -3.2, 3.2, 6.5, 9.8]) w(G.box, MAT.boardDark, M([x, Mg.h - 0.2, cz], [0, 0, 0], [0.16, 0.16, dp]), 0.012);
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
  // a window on both faces of a wall: (x, z) on the wall's center line, (nx, nz) its outward normal
  const off = Mg.t + 0.03;
  const win = (x, z, nx, nz) => {
    const tilt = R.range(-0.06, 0.06), ry = Math.atan2(nx, nz);
    for (const s of [1, -1]) w(paintBox(0.66, 0.66, 0.07), glass, M([x + nx * off * s, 1.7, z + nz * off * s], [0, ry, tilt]), 0.012);
  };
  for (const x of [-10.5, -6, 5, 9.5]) win(x, Mg.z0, 0, -1); // south wall, either side of the door
  for (const x of [-6, 6.5, 10.5]) win(x, Mg.z1, 0, 1); // north wall, between the stations
  win(Mg.x1, 7.6, 1, 0); // east end, the office

  // --- the stations, in the order a body goes through them ---
  const slab = spec('#9a93ad', { pat: P.stone }), cloth = spec('#d9cbb0', { pat: P.stripes, p1: 3 });
  const legs = (st, h, mat = MAT.iron, t = 0.07) => {
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) w(G.box, mat, M([st.x + sx * (st.hx - 0.1), h / 2, st.z + sz * (st.hz - 0.08)], [0, 0, 0], [t, h, t]), 0.01);
  };
  // 1 intake: a stone slab on iron legs under the hatch
  const tb = Mg.table;
  w(G.box, slab, M([tb.x, tb.top - 0.05, tb.z], [0, 0, 0], [tb.hx * 2, 0.1, tb.hz * 2]), 0.016);
  legs(tb, tb.top - 0.1);
  // 2 registry: a long clerk's counter with a panelled front; the ledger, an inkwell and a quill at the back edge
  const dk = Mg.desk;
  w(G.box, MAT.board, M([dk.x, dk.top - 0.04, dk.z], [0, 0, 0], [dk.hx * 2 + 0.1, 0.08, dk.hz * 2 + 0.08]), 0.016);
  w(paintBox(dk.hx * 2, dk.top - 0.08, 0.06), spec('#4a3550', { pat: P.door, p1: dk.hx, p2: (dk.top - 0.08) / 2 }), M([dk.x, (dk.top - 0.08) / 2, dk.z - dk.hz + 0.03]), 0.012);
  for (const sx of [-1, 1]) w(G.box, MAT.boardDark, M([dk.x + sx * (dk.hx - 0.05), (dk.top - 0.08) / 2, dk.z], [0, 0, 0], [0.08, dk.top - 0.08, dk.hz * 2]), 0.012);
  for (let i = 0; i < 3; i++) w(G.box, spec(i % 2 ? '#3d2e5a' : '#7a2e3a'), M([dk.x + dk.hx + 0.35, 0.05 + i * 0.09, dk.z], [0, 0.3 * i - 0.2, 0], [0.42, 0.08, 0.3]), 0.008); // old ledgers on the floor
  w(G.cyl6, MAT.iron, M([dk.x - dk.hx + 0.15, dk.top + 0.05, dk.z + dk.hz - 0.1], [0, 0, 0], [0.05, 0.1, 0.05]), 0.008); // inkwell
  w(G.cone4, MAT.bone, M([dk.x - dk.hx + 0.2, dk.top + 0.22, dk.z + dk.hz - 0.12], [0, 0, -0.35], [0.03, 0.32, 0.01]), 0); // quill
  // a pigeonhole cabinet for the tags on the wall behind the counter
  w(G.box, MAT.boardDark, M([dk.x, 1.75, Mg.z1 - 0.2], [0, 0, 0], [1.6, 0.7, 0.22]), 0.014);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) w(G.box, spec('#e9dcc0'), M([dk.x - 0.6 + i * 0.4, 1.6 + j * 0.3, Mg.z1 - 0.31], [0, 0, 0], [0.22, 0.12, 0.02]), 0);
  // 3 dressing: a table with a striped cloth, a tall mirror behind it, the outfits on show on the west wall
  const dr = Mg.dress;
  w(G.box, MAT.boardLight, M([dr.x, dr.top - 0.05, dr.z], [0, 0, 0], [dr.hx * 2, 0.1, dr.hz * 2]), 0.016);
  w(G.box, cloth, M([dr.x, dr.top - 0.18, dr.z - dr.hz - 0.01], [0, 0, 0], [dr.hx * 2, 0.28, 0.02]), 0);
  legs(dr, dr.top - 0.1, MAT.woodDark, 0.09);
  w(G.box, MAT.woodDark, M([dr.x, 1.55, Mg.z1 - 0.16], [0, 0, 0], [0.9, 1.5, 0.08]), 0.014);
  w(G.box, spec('#b9c4d6', { rim: 1.6 }), M([dr.x, 1.55, Mg.z1 - 0.21], [0, 0, 0], [0.72, 1.32, 0.02]), 0);
  const Rk = Mg.rack, rz = Rk.z0 + ((OUTFITS.length - 1) * Rk.dz) / 2;
  w(G.cyl6, MAT.iron, M([Rk.x + 0.2, Rk.y + 0.42, rz], [Math.PI / 2, 0, 0], [0.025, OUTFITS.length * Rk.dz + 0.3, 0.025]), 0.008);
  const look = { tux: ['#1e1a26', '#f2eee6'], sailor: ['#f2eee2', '#2c3e70'], clown: ['#f0c23a', '#d8433a'], gown: ['#6b3a7a', '#e9d9f0'], pajamas: ['#5d6f8c', '#e8e2d4'] };
  OUTFITS.forEach((o, i) => {
    const [a, b] = look[o.id], z = Rk.z0 + i * Rk.dz;
    w(G.sph, spec(a, { pat: o.id === 'tux' || o.id === 'gown' ? P.plain : P.stripes, p1: 7 }), M([Rk.x + 0.22, Rk.y, z], [0, 0, 0], [0.13, 0.28, 0.2]), 0.012);
    w(G.box, spec(b), M([Rk.x + 0.36, Rk.y + 0.08, z], [0, 0, 0], [0.02, 0.1, 0.1]), 0);
    w(G.box, MAT.iron, M([Rk.x + 0.22, Rk.y + 0.33, z], [0, 0, 0], [0.015, 0.16, 0.015]), 0);
    if (o.id === 'gown') w(G.cone6, spec(a), M([Rk.x + 0.22, Rk.y - 0.38, z], [0, 0, 0], [0.24, 0.44, 0.24]), 0.012);
  });
  // 4 the stock table, a low trestle in front of the stockroom door (west wall)
  const sk = Mg.stock;
  w(G.box, MAT.planks, M([sk.x, sk.top - 0.05, sk.z], [0, 0, 0], [sk.hx * 2, 0.1, sk.hz * 2]), 0.016);
  legs(sk, sk.top - 0.1, MAT.woodDark, 0.1);
  const sd = Mg.stockDoor, sdc = (sd[0] + sd[1]) / 2, sdw = sd[1] - sd[0];
  w(paintBox(sdw, 2.1, 0.07), spec('#33243a', { pat: P.door, p1: sdw / 2, p2: 1.05 }), M([Mg.x0 + 0.1, 1.05, sdc], [0, Math.PI / 2, 0]), 0.012);
  for (const z of sd) w(G.box, MAT.board, M([Mg.x0 + 0.12, 1.1, z], [0, 0, 0], [0.1, 2.2, 0.14]), 0.012);
  w(G.box, MAT.board, M([Mg.x0 + 0.12, 2.22, sdc], [0, 0, 0], [0.1, 0.14, sdw + 0.3]), 0.012);
  // the clerk's office in the east end: crate of nails and boards, a desk with a lamp, filing cabinets, a bench
  const cr = Mg.crate;
  w(G.box, MAT.board, M([cr.x, cr.hy, cr.z], [0, 0.1, 0], [cr.hx * 2, cr.hy * 2, cr.hz * 2]), 0.016);
  for (let i = 0; i < 3; i++) w(G.box, MAT.boardLight, M([cr.x - 0.05 + i * 0.04, cr.hy * 2 + 0.04 + i * 0.05, cr.z], [0, 0.3 - i * 0.25, 0], [1.1, 0.04, 0.16]), 0.01);
  for (let i = 0; i < 7; i++) w(G.cyl6, MAT.iron, M([cr.x + 0.28 - i * 0.07, cr.hy * 2 + 0.03, cr.z + 0.22], [0, 0, 1.45], [0.012, 0.13, 0.012]), 0);
  for (const o of Mg.office) {
    const [x, y, z] = o.c, [hx, hy, hz] = o.h;
    if (o.kind === 'desk') {
      w(G.box, MAT.board, M([x, hy * 2 - 0.04, z], [0, 0, 0], [hx * 2, 0.08, hz * 2]), 0.014);
      for (const sx of [-1, 1]) w(G.box, MAT.boardDark, M([x + sx * (hx - 0.2), hy - 0.04, z], [0, 0, 0], [0.4, hy * 2 - 0.08, hz * 2 - 0.04]), 0.012);
      w(G.box, spec('#e9dcc0'), M([x - 0.2, hy * 2 + 0.01, z - 0.05], [0, 0.3, 0], [0.32, 0.01, 0.24]), 0);
      w(G.cyl6, MAT.iron, M([x + 0.55, hy * 2 + 0.12, z + 0.15], [0, 0, 0], [0.04, 0.24, 0.04]), 0);
      w(G.cone6, MAT.iron, M([x + 0.55, hy * 2 + 0.3, z + 0.15], [0, 0, 0.4], [0.14, 0.12, 0.14]), 0.008);
    } else if (o.kind === 'cabinet') {
      w(G.box, MAT.woodDark, M(o.c, [0, 0, R.range(-0.02, 0.02)], [hx * 2, hy * 2, hz * 2]), 0.014);
      for (let i = 0; i < 3; i++) w(G.box, MAT.boardLight, M([x - hx - 0.01, 0.3 + i * 0.45, z], [0, 0, 0], [0.02, 0.34, hz * 2 - 0.12]), 0);
    } else {
      w(G.box, MAT.board, M([x, hy * 2 - 0.04, z], [0, 0, 0], [hx * 2, 0.08, hz * 2]), 0.012);
      for (const sx of [-1, 1]) w(G.box, MAT.boardDark, M([x + sx * (hx - 0.12), hy - 0.04, z], [0, 0, 0], [0.08, hy * 2 - 0.08, hz * 2]), 0.01);
    }
  }
  // hanging lamps along the hall
  for (const [lx, lz] of Mg.lamps) {
    w(G.cyl6, MAT.iron, M([lx, Mg.h - 0.3, lz], [0, 0, 0], [0.012, 0.6, 0.012]), 0);
    w(G.cone6, MAT.iron, M([lx, Mg.h - 0.62, lz], [0, 0, 0], [0.2, 0.14, 0.2]), 0.01);
    w(G.sph, MAT.glass, M([lx, Mg.h - 0.72, lz], [0, 0, 0], 0.09), 0.01);
  }

  // roof: two crooked shingle slopes, a ridge beam, gable ends and two chimneys
  const roofB = new Batch(), rw = roofB.sub(I);
  for (const sz of [-1, 1]) rw(G.box, MAT.shingle, M([cx, Mg.h + 0.62, cz + sz * dp * 0.26], [sz * 0.4, 0, 0.006], [wd + 0.8, 0.12, dp * 0.62]), 0.016);
  rw(G.box, MAT.boardDark, M([cx, Mg.h + 1.2, cz], [Math.PI / 4, 0, 0.004], [wd + 0.9, 0.16, 0.16]), 0.016);
  for (const x of [Mg.x0, Mg.x1]) rw(G.box, plaster, M([x, Mg.h + 0.5, cz], [0, 0, 0], [0.1, 1.0, dp * 0.95]), 0.014);
  for (const x of [Mg.x1 - 2.4, Mg.x0 + 3.2]) rw(G.box, spec('#5a4a62', { pat: P.stone }), M([x, Mg.h + 1.1, cz + 1.0], [0, 0.1, 0.06], [0.45, 1.3, 0.45]), 0.016);
  const roof = new THREE.Group();
  roof.name = 'morgue-roof';
  roofB.build(roof);
  scene.add(roof);

  // lettering: one canvas, one sign per 128-pixel row: the two outside, then one over each station inside
  const SIGNS = [['MORGUE', 64], ['DELIVERIES', 60], ['INTAKE', 60], ['REGISTRY', 58], ['DRESSING', 58], ['STOCKROOM', 54], ['OFFICE', 60]];
  const CW = 512, CH = 128 * SIGNS.length, canvas = document.createElement('canvas');
  canvas.width = CW; canvas.height = CH;
  const g = canvas.getContext('2d'), tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const quads = [];
  const quad = (px, py, pw, ph, wm, hm, m) => {
    const q = new THREE.PlaneGeometry(wm, hm), uv = q.attributes.uv;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, (px + uv.getX(i) * pw) / CW, 1 - (py + (1 - uv.getY(i)) * ph) / CH);
    quads.push(q.applyMatrix4(m));
  };
  SIGNS.forEach(([text, font], i) => {
    const py = i * 128;
    g.fillStyle = '#2a2236'; g.fillRect(0, py, CW, 128);
    g.strokeStyle = '#6a4a52'; g.lineWidth = 10; g.strokeRect(5, py + 5, CW - 10, 118);
    g.fillStyle = '#f0c060'; g.font = `bold ${font}px Georgia, serif`; g.textAlign = 'center'; g.fillText(text, CW / 2, py + 64 + font * 0.34, CW - 40);
  });
  const signAt = (i, wm, m) => quad(0, i * 128, CW, 128, wm, wm / 4, m);
  signAt(0, 1.68, M([dc, 2.68, Mg.z0 - 0.2], [0, Math.PI, 0.04]));
  signAt(1, 2.1, M([hc, 2.5, Mg.z1 + 0.2], [0, 0, 0.04]));
  // inside: on the north wall over the stations (facing into the hall), the stockroom's over its door
  const north = (x, tilt) => M([x, 2.45, Mg.z1 - 0.2], [0, Math.PI, tilt]);
  signAt(2, 1.2, north(Mg.table.x, 0.03));
  signAt(3, 1.2, north(Mg.desk.x, -0.04));
  signAt(4, 1.2, north(Mg.dress.x + 1.25, 0.05));
  signAt(5, 1.3, M([Mg.x0 + 0.2, 2.55, sdc], [0, Math.PI / 2, -0.03]));
  signAt(6, 1.1, north(Mg.office[0].c[0], -0.02));
  const textMat = new THREE.MeshBasicMaterial({ map: tex, alphaTest: 0.5, fog: true });
  const textMesh = new THREE.Mesh(mergeGeometries(quads), textMat);
  textMesh.name = 'morgue-text';
  scene.add(textMesh);

  const glow = glowSprites('#ffc070', Mg.lamps.length);
  for (const [lx, lz] of Mg.lamps) glow.add(new THREE.Vector3(lx, Mg.h - 0.72, lz), 2.2, 0.75);
  glow.mesh.visible = false;
  scene.add(glow.mesh);

  return {
    roof,
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

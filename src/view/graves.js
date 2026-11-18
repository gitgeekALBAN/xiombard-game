import * as THREE from 'three';
import { toon, outlineMat } from '../shaders/toon.js';
import { paintMat, paintAttrs, spec, P } from '../shaders/paint-env.js';
import { PAL } from './palette.js';
import { geo, buildHeadstone } from './models.js';
import { outlineGeo } from './models/common.js';
import { mat4, noise3 } from './models/propkit.js';
import { PLOTS, PLOT_HALF, PLOT_MAX_DEPTH } from '../shared/layout.js';

// Grave plot visuals: the moving floor of each hole, the dirt mound beside it, the fill layer,
// and the fresh headstone with a name plate once someone is buried.
// createGraves(scene, groundMat) returns:
//   setPlot(i, depth, fill, buried, seed, name, time) — apply the host's plot state
//   update(time)                                      — per-frame animation
//   floorTop(i)                                       — world y of the hole's floor (camera and blob shadows use it)

const dirt = toon(PAL.dirtLight, { mottle: 1, gradColor: PAL.dirtDark, gradY: [0.0, 0.45], rim: 0.6 });
const looseDirt = toon(PAL.dirtLight, { mottle: 1, rim: 0.5 });

// Lumpy earth: a dome pushed around by noise, its rim pressed onto the ground. Only the upper half of a sphere:
// the rest would lie flat under the ground. footN > 2 squares the footprint off (a superellipse) so a heap can
// cover a rectangular hole. Clods are a few low balls (the dug mounds paint theirs instead).
function earth(seed, { sx, sy, sz, footN = 2, lump = 0.18, freq = 2.2, clods = 0, peak = 2, seg = [16, 6] }) {
  const g = new THREE.SphereGeometry(1, seg[0], seg[1], 0, Math.PI * 2, 0, Math.PI / 2);
  const p = g.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const a = Math.atan2(v.z, v.x), rho = Math.hypot(v.x, v.z);
    const k = footN === 2 ? 1 : Math.pow(Math.pow(Math.abs(Math.cos(a)), footN) + Math.pow(Math.abs(Math.sin(a)), footN), -1 / footN);
    const n = noise3(v.x * freq + seed, v.y * freq, v.z * freq) - 0.5 + (noise3(v.x * freq * 2.7, v.y * freq * 2.7 + seed, v.z * freq * 2.7) - 0.5) * 0.5;
    const y = Math.max(0, v.y);
    const r = 1 + n * lump * (0.4 + y);
    // peak shapes the profile: low values give a shovelled cone, high values a rounded heap
    p.setXYZ(i, Math.cos(a) * rho * k * r * sx, v.y < 0 ? -0.03 : (1 - Math.pow(rho, peak)) * (1 + n * lump * 1.5) * sy, Math.sin(a) * rho * k * r * sz);
  }
  g.computeVertexNormals();
  if (!clods) return g;
  const parts = [g.toNonIndexed()];
  const R = (i) => noise3(seed * 1.7 + i * 3.1, i * 0.37, 0.5);
  for (let i = 0; i < clods; i++) {
    const a = R(i) * 12.6, d = 1.02 + R(i + 9) * 0.25, s = 0.05 + R(i + 4) * 0.06;
    const c = new THREE.SphereGeometry(1, 5, 3).toNonIndexed();
    c.applyMatrix4(mat4([Math.cos(a) * sx * d, s * 0.3, Math.sin(a) * sz * d], [a, a * 2, 0], [s * 1.3, s * 0.8, s]));
    parts.push(c);
  }
  const out = new THREE.BufferGeometry();
  const pos = [], nor = [];
  for (const q of parts) { pos.push(...q.attributes.position.array); nor.push(...q.attributes.normal.array); }
  out.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  out.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  return out;
}

// Loose soil filling the hole: a slab whose top is bumpy, so it reads as shovelled earth.
// Only the top is ever seen (the sides lie against the walls of the hole), so it is a bumpy sheet.
function fillGeo() {
  const g = new THREE.PlaneGeometry(PLOT_HALF.x * 2, PLOT_HALF.z * 2, 4, 8).rotateX(-Math.PI / 2);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), z = p.getZ(i);
    const edge = Math.min(PLOT_HALF.x - Math.abs(x), PLOT_HALF.z - Math.abs(z)) > 0.01 ? 1 : 0.3;
    p.setY(i, (noise3(x * 4, 0, z * 4) - 0.5) * 0.12 * edge);
  }
  g.computeVertexNormals();
  return g;
}

// Name plate: lettering cut into the stone, drawn on a canvas (dark cut, pale lower lip).
function plate(name, face, seed) {
  const W = 512, H = Math.round(512 * face.h / face.w);
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const x = c.getContext('2d');
  const cut = (txt, y, font, maxW) => {
    x.font = font;
    x.fillStyle = 'rgba(225, 215, 240, 0.45)';
    x.fillText(txt, W / 2 + 2, y + 3, maxW);
    x.fillStyle = '#231d33';
    x.fillText(txt, W / 2, y, maxW);
  };
  x.textAlign = 'center';
  x.textBaseline = 'middle';
  const u = Math.min(W, H) / 512;
  // a little carved skull and crossbones up top
  const sk = (dx, dy, col) => {
    x.fillStyle = col; x.strokeStyle = col; x.lineCap = 'round'; x.lineWidth = 16 * u;
    const cx = W / 2 + dx, cy = H * 0.15 + dy;
    for (const s of [-1, 1]) { x.beginPath(); x.moveTo(cx - 62 * u * s, cy - 40 * u); x.lineTo(cx + 62 * u * s, cy + 46 * u); x.stroke(); }
    x.beginPath(); x.ellipse(cx, cy - 4 * u, 44 * u, 40 * u, 0, 0, Math.PI * 2); x.fill();
    x.fillRect(cx - 26 * u, cy + 20 * u, 52 * u, 26 * u);
  };
  sk(3, 4, 'rgba(225, 215, 240, 0.45)');
  sk(0, 0, '#231d33');
  x.globalCompositeOperation = 'destination-out';
  for (const s of [-1, 1]) { x.beginPath(); x.arc(W / 2 + s * 18 * u, H * 0.15 - 2 * u, 12 * u, 0, Math.PI * 2); x.fill(); }
  for (let i = -1; i <= 1; i++) x.fillRect(W / 2 + i * 15 * u - 2 * u, H * 0.15 + 26 * u, 4 * u, 22 * u);
  x.globalCompositeOperation = 'source-over';
  cut('R.I.P.', H * 0.36, `bold ${Math.round(Math.min(H * 0.13, W * 0.12))}px Georgia, "Times New Roman", serif`, W * 0.7);
  cut(name, H * 0.57, `italic bold ${Math.round(Math.min(H * 0.19, W * 0.17))}px Georgia, "Times New Roman", serif`, W * 0.94);
  // a little carved flourish under the name
  x.strokeStyle = '#231d33';
  x.lineWidth = H * 0.025;
  x.lineCap = 'round';
  const y = H * 0.74, r = H * 0.04, s = seed % 2 ? 1 : -1;
  x.beginPath(); x.moveTo(W * 0.3, y); x.bezierCurveTo(W * 0.4, y - r * 2, W * 0.45, y + r * 2, W / 2, y); x.bezierCurveTo(W * 0.55, y - r * 2, W * 0.6, y + r * 2, W * 0.7, y); x.stroke();
  for (const sx of [-1, 1]) { x.beginPath(); x.arc(W / 2 + sx * W * 0.24, y - s * r * 0.2, r * 0.8, 0, Math.PI * 1.6); x.stroke(); }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(face.w, face.h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, fog: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }));
  m.position.set(0, face.y, face.z + 0.003);
  return m;
}

export function createGraves(scene, groundMat) {
  // the dug mounds: one instanced dome for all plots (clods painted), with its instanced ink hull
  const pile = paintAttrs(earth(3, { sx: 1, sy: 1, sz: 1, lump: 0.35, freq: 3.4, peak: 1.6 }).toNonIndexed(), spec(PAL.dirtLight, { pat: P.dirt, rim: 0.6 }));
  const mounds = new THREE.InstancedMesh(pile, paintMat(), PLOTS.length);
  const moundHull = new THREE.InstancedMesh(outlineGeo(pile), outlineMat(0.02), PLOTS.length);
  for (const im of [mounds, moundHull]) { im.frustumCulled = false; im.name = 'mounds'; scene.add(im); }
  const _m = new THREE.Matrix4(), _p = new THREE.Vector3(), _q = new THREE.Quaternion(), _s = new THREE.Vector3(), Y = new THREE.Vector3(0, 1, 0);
  const fill = fillGeo();
  const heaps = [0, 1, 2].map((i) => earth(11 + i * 5, { sx: 0.84, sy: 0.2, sz: 1.46, footN: 3.6, lump: 0.3, freq: 3.2, clods: 4, peak: 2.6, seg: [14, 5] }));

  const plots = PLOTS.map((p, i) => {
    const floor = new THREE.Mesh(geo.BOX, groundMat);
    floor.scale.set(PLOT_HALF.x * 2, 2, PLOT_HALF.z * 2);
    floor.position.set(p.x, -1, p.z);
    // the pile of dug earth sits beside the hole, on the side away from the path
    const mound = { x: p.x + PLOT_HALF.x + 0.72, z: p.z + (i % 2 ? 0.25 : -0.25), yaw: (i % 3 - 1) * 0.35 + Math.PI * (i % 2) };
    mounds.setMatrixAt(i, _m.makeScale(0, 0, 0)); moundHull.setMatrixAt(i, _m);
    const fillM = new THREE.Mesh(fill, looseDirt);
    fillM.position.set(p.x, -2, p.z);
    fillM.visible = false;
    scene.add(floor, fillM);
    return { floor, mound, fill: fillM, stone: null, seed: -1, x: p.x, z: p.z };
  });

  function freshGrave(seed, name) {
    const heap = heaps[seed % 3];
    const kind = seed % 3 === 1 ? 'slab' : 'round';
    const stone = buildHeadstone(kind, 0.78, 1.12, seed, { blank: true, extra: [{ geo: heap, mat: dirt, matrix: mat4([0, 0, PLOT_HALF.z - 0.15], [0, 0, 0]) }] });
    // the heap is baked into the stone's meshes (fewer draw calls); the stone stands at the head end of the plot
    stone.position.z = -PLOT_HALF.z + 0.15;
    const f = stone.userData.face;
    if (f) stone.add(plate(name, f, seed));
    const g = new THREE.Group();
    g.add(stone);
    return g;
  }

  return {
    setPlot(i, d, f, buried, seed, name, time) {
      const v = plots[i];
      v.floor.position.y = -d - 1;
      const m = Math.min(1, d / PLOT_MAX_DEPTH) * (1 - f);
      const mo = v.mound;
      if (m > 0.02) _m.compose(_p.set(mo.x, 0, mo.z), _q.setFromAxisAngle(Y, mo.yaw), _s.set(0.35 + 0.3 * m, 0.03 + 0.62 * m, 0.55 + 0.4 * m));
      else _m.makeScale(0, 0, 0);
      mounds.setMatrixAt(i, _m); moundHull.setMatrixAt(i, _m);
      mounds.instanceMatrix.needsUpdate = true; moundHull.instanceMatrix.needsUpdate = true;
      v.fill.visible = f > 0.01 && !(v.stone && v.stone.userData.settled);
      v.fill.position.y = -d + (d + 0.02) * f;
      if (buried && v.seed !== seed) {
        if (v.stone) scene.remove(v.stone);
        v.stone = freshGrave(seed, name);
        v.stone.position.set(v.x, 0, v.z);
        v.stone.userData.born = time;
        scene.add(v.stone);
        v.seed = seed;
      } else if (!buried && v.stone) {
        scene.remove(v.stone);
        v.stone = null;
        v.seed = -1;
        v.floor.visible = true;
      }
    },
    update(time) {
      for (const p of plots) if (p.stone) {
        const k = Math.min(1, (time - p.stone.userData.born) / 0.5);
        p.stone.position.y = -1.2 * (1 - k) * (1 - k);
        // once the heap is up it covers the hole, so the floor and fill need not be drawn
        const settled = k >= 1;
        p.stone.userData.settled = settled;
        p.floor.visible = !settled;
        if (settled) p.fill.visible = false;
      }
    },
    floorTop(i) { return plots[i].floor.position.y + 1; },
  };
}

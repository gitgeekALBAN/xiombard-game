import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { outlineMat, lightingGLSL } from '../../shaders/toon.js';
import { noise } from '../../shaders/noise.glsl.js';
import { NPARTS, P } from '../../shared/skeleton.js';
import { rng } from '../../shared/rng.js';
import { PAL } from '../palette.js';
import { outlineGeo } from './common.js';

// Characters are stop-motion puppets: every piece of one skeleton part is merged into a single mesh whose colors,
// stripes and glow live in vertex attributes, so a whole character costs one draw call per part plus one outline.

// ---------- material: toon lighting, colors and stripes per vertex ----------
const vert = /* glsl */ `
attribute vec3 aCol; attribute vec3 aCol2; attribute vec2 aS; attribute vec2 aFx;
varying vec3 vN; varying vec3 vW; varying vec3 vO; varying vec3 vC; varying vec3 vC2; varying vec2 vS; varying vec2 vFx;
#include <common>
#include <fog_pars_vertex>
void main() {
  vO = position; vC = aCol; vC2 = aCol2; vS = aS; vFx = aFx;
  vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz;
  vN = normalize(mat3(modelMatrix) * normal);
  vec4 mvPosition = viewMatrix * w;
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}`;
const frag = /* glsl */ `
varying vec3 vN; varying vec3 vW; varying vec3 vO; varying vec3 vC; varying vec3 vC2; varying vec2 vS; varying vec2 vFx;
#include <common>
#include <fog_pars_fragment>
${noise}
${lightingGLSL}
void main() {
  vec3 N = normalize(vN);
  vec3 base = vC;
  if (vS.y > 0.0) {
    float aa = fwidth(vS.x);
    float s = smoothstep(-aa, aa, abs(fract(vS.x) - 0.5) - (0.5 - vS.y * 0.5));
    s = mix(s, vS.y, smoothstep(0.35, 0.7, aa));
    base = mix(vC, vC2, s);
  }
  if (vFx.y > 0.0) {
    float n = vnoise(vO.xz * 9.0 + vO.y * 5.3) * 0.6 + vnoise(vO.xy * 23.0 + vO.z * 13.0) * 0.4;
    base *= 1.0 + vFx.y * (n - 0.5) * 1.2;
  }
  vec3 col = mix(toonShadeRim(base, N, vW, 0.9), base, vFx.x);
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
  #include <fog_fragment>
}`;
let MAT = null;
const charMat = () => MAT || (MAT = new THREE.ShaderMaterial({
  uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog]), vertexShader: vert, fragmentShader: frag, fog: true,
}));

// ---------- geometry helpers ----------
const TAU = Math.PI * 2;
const lathe = (pts, seg = 12, p0 = 0, pl = TAU) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(Math.max(r, 0), y)), seg, p0, pl);
// egg profile: a > 0 widens the top, a < 0 the bottom
function eggPts(w, h, a = 0, n = 12) {
  const pts = [];
  for (let i = 0; i <= n; i++) { const t = -Math.PI / 2 + (Math.PI * i) / n, s = Math.sin(t); pts.push([w * Math.cos(t) * (1 + a * s), h * s]); }
  return pts;
}
// tapered capsule: bottom ball (r0 at y0) to top ball (r1 at y1); balls sit on the joints so bends never open a gap
function limbPts(r0, y0, r1, y1, n = 2) {
  const pts = [];
  for (let i = 0; i <= n; i++) { const t = -Math.PI / 2 + (Math.PI / 2) * (i / n); pts.push([r0 * Math.cos(t), y0 + r0 * Math.sin(t)]); }
  for (let i = 0; i <= n; i++) { const t = (Math.PI / 2) * (i / n); pts.push([r1 * Math.cos(t), y1 + r1 * Math.sin(t)]); }
  return pts;
}
// thin closed shell (coat tails, cuffs) from an outer profile listed top to bottom: the lathe faces a surface
// outward when its profile runs upward, so go down the inside and back up the outside
function shellPts(outer, t) {
  const inner = outer.map(([r, y]) => [r - t, y]);
  return [...inner, ...outer.slice().reverse(), inner[0]];
}
// move vertices, then rebuild normals that stay smooth across lathe/sphere seams
const _v = new THREE.Vector3();
function deform(geo, fn) {
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) { _v.fromBufferAttribute(p, i); fn(_v, i); p.setXYZ(i, _v.x, _v.y, _v.z); }
  geo.computeVertexNormals();
  const n = geo.attributes.normal, acc = new Map(), key = (i) => `${Math.round(p.getX(i) * 1e4)},${Math.round(p.getY(i) * 1e4)},${Math.round(p.getZ(i) * 1e4)}`;
  for (let i = 0; i < p.count; i++) { const k = key(i), a = acc.get(k) || [0, 0, 0]; a[0] += n.getX(i); a[1] += n.getY(i); a[2] += n.getZ(i); acc.set(k, a); }
  for (let i = 0; i < p.count; i++) { const a = acc.get(key(i)), l = Math.hypot(a[0], a[1], a[2]) || 1; n.setXYZ(i, a[0] / l, a[1] / l, a[2] / l); }
  return geo;
}
// a flat spiral curl starting at the origin and winding up in the xy plane (hair curls, moustaches)
function curlGeo(r0, turns, tube, sx = 1, seg = 16) {
  const pts = [];
  for (let i = 0; i <= 14; i++) {
    const t = i / 14, a = t * turns * TAU, r = r0 * (1 - 0.72 * t);
    pts.push(new THREE.Vector3(sx * (r0 - r * Math.cos(a)), r * Math.sin(a), 0));
  }
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), seg, tube, 3, false);
}

const SPH_M = new THREE.SphereGeometry(1, 12, 8);
const SPH_S = new THREE.SphereGeometry(1, 8, 6);
const SPH_T = new THREE.SphereGeometry(1, 6, 4);
const CONE = new THREE.ConeGeometry(1, 1, 7);
const BOXG = new THREE.BoxGeometry(1, 1, 1);
const CAP = new THREE.CapsuleGeometry(1, 2, 1, 5); // radius 1, straight part 2 → scale to taste

// ---------- part kits: collect pieces in part-local space, merge at the end ----------
const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _p = new THREE.Vector3(), _s = new THREE.Vector3();
function mat4(pos = [0, 0, 0], rot = [0, 0, 0], scale = 1) {
  const s = Array.isArray(scale) ? scale : [scale, scale, scale];
  return new THREE.Matrix4().compose(_p.set(...pos), _q.setFromEuler(_e.set(rot[0], rot[1], rot[2])), _s.set(...s));
}
const colCache = new Map();
const lin = (hex) => { if (!colCache.has(hex)) colCache.set(hex, new THREE.Color(hex)); return colCache.get(hex); };

// o: pos rot scale parent(Matrix4) | c c2 duty s=[mode, k] (stripe coordinate: u/v = uv * k, x/y/z = part-local meters * k,
//    py = piece-local y * k) | em (glow 0..1) | mot (mottle) | shade(q) → color multiplier | ol=false: no outline
function put(kit, geo, o = {}) {
  const m = mat4(o.pos, o.rot, o.scale);
  if (o.parent) m.premultiply(o.parent);
  const src = geo.index ? geo : (geo.setIndex([...Array(geo.attributes.position.count).keys()]), geo);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', src.attributes.position.clone());
  g.setAttribute('normal', src.attributes.normal.clone());
  g.setIndex(src.index.clone());
  const pre = src.attributes.position, uv = src.attributes.uv;
  g.applyMatrix4(m);
  const n = pre.count, pos = g.attributes.position;
  const aCol = new Float32Array(n * 3), aCol2 = new Float32Array(n * 3), aS = new Float32Array(n * 2), aFx = new Float32Array(n * 2);
  const c = lin(o.c || '#ff00ff'), c2 = lin(o.c2 || o.c || '#ff00ff'), [mode, k] = o.s || [];
  const duty = o.s ? o.duty ?? 0.5 : 0;
  for (let i = 0; i < n; i++) {
    let sh = 1;
    if (o.shade) { _v.fromBufferAttribute(pos, i); sh = o.shade(_v); }
    aCol[i * 3] = c.r * sh; aCol[i * 3 + 1] = c.g * sh; aCol[i * 3 + 2] = c.b * sh;
    aCol2[i * 3] = c2.r * sh; aCol2[i * 3 + 1] = c2.g * sh; aCol2[i * 3 + 2] = c2.b * sh;
    let s = 0;
    if (mode === 'u') s = uv.getX(i) * k;
    else if (mode === 'v') s = uv.getY(i) * k;
    else if (mode === 'x') s = pos.getX(i) * k;
    else if (mode === 'y') s = pos.getY(i) * k;
    else if (mode === 'z') s = pos.getZ(i) * k;
    else if (mode === 'py') s = pre.getY(i) * k;
    aS[i * 2] = s + (o.s0 || 0); aS[i * 2 + 1] = duty;
    aFx[i * 2] = o.em || 0; aFx[i * 2 + 1] = o.mot ?? 0.18;
  }
  g.setAttribute('aCol', new THREE.BufferAttribute(aCol, 3));
  g.setAttribute('aCol2', new THREE.BufferAttribute(aCol2, 3));
  g.setAttribute('aS', new THREE.BufferAttribute(aS, 2));
  g.setAttribute('aFx', new THREE.BufferAttribute(aFx, 2));
  // tiny details get no outline: it would cost as much as the piece and read as a smudge
  if (!src.boundingSphere) src.computeBoundingSphere();
  const big = src.boundingSphere.radius * m.getMaxScaleOnAxis() > 0.045;
  kit.push({ g, src, m, ol: o.ol ?? big });
}
function finish(kit, grp, olw = 0.011) {
  if (!kit.length) return;
  grp.add(new THREE.Mesh(mergeGeometries(kit.map((k) => k.g)), charMat()));
  const ol = kit.filter((k) => k.ol).map((k) => outlineGeo(k.src).clone().applyMatrix4(k.m));
  if (ol.length) grp.add(new THREE.Mesh(mergeGeometries(ol), outlineMat(olw)));
}

// garment: { c, c2, d (stripe pairs per meter), dir 'v' (along the limb) | 'h' (around it), duty, mot }
function cloth(gm, r) {
  const o = { c: gm.c, mot: gm.mot ?? 0.3 };
  if (gm.c2 && gm.d) {
    o.c2 = gm.c2; o.duty = gm.duty ?? 0.5;
    o.s = gm.dir === 'h' ? ['y', gm.d] : ['u', Math.max(3, Math.round(TAU * r * gm.d))];
  }
  return o;
}
const shade = (y0, y1, k) => (v) => 1 - k * THREE.MathUtils.clamp((y0 - v.y) / (y0 - y1), 0, 1);

// ---------- head: an egg with an optional narrow jaw and forward chin, plus a helper to stick things on its face ----------
function makeHead(kit, o) {
  const { w, h, a, zs = 0.94, jaw = 0, chin = 0 } = o;
  const def = (v) => { const t = Math.max(0, -v.y / h); v.x *= 1 - jaw * t * t; v.z = v.z * (1 - 0.1 * t) + chin * t * t; return v; };
  const geo = deform(lathe(eggPts(w, h, a, 11), 16), (v) => { v.z *= zs; def(v); });
  put(kit, geo, { c: o.skin, mot: o.mot ?? 0.2, shade: o.shade });
  // point on the face surface at (x, y), sunk by `inset`, and a rotation that faces outward
  const face = (x, y, inset = 0) => {
    const s = y / h, t = Math.asin(THREE.MathUtils.clamp(s, -1, 1)), r = w * Math.cos(t) * (1 + a * s);
    const z = Math.sqrt(Math.max(r * r - x * x, 0)) * zs - inset;
    const p = def(new THREE.Vector3(x, y, z));
    return { pos: [p.x, p.y, p.z], rot: [-Math.asin(THREE.MathUtils.clamp(s, -1, 1)) * 0.75, Math.asin(THREE.MathUtils.clamp(x / Math.max(r, 1e-3), -1, 1)), 0] };
  };
  const radiusAt = (y) => { const s = y / h, t = Math.asin(THREE.MathUtils.clamp(s, -1, 1)); return w * Math.cos(t) * (1 + a * s); };
  return { face, radiusAt, def };
}

// ---------- limbs ----------
function arm(kU, kF, o) {
  const r = o.r || 1, sl = o.sleeve;
  put(kU, lathe(limbPts(0.044 * r, -0.17, 0.06 * r, 0.15), 8), cloth(sl, 0.056 * r));
  const fore = o.bare ? { c: o.skin, mot: 0.2 } : cloth(sl, 0.05 * r);
  const cuffY = o.cuffY ?? -0.07;
  put(kF, lathe(limbPts(0.04 * r, cuffY, 0.047 * r, 0.155), 8), fore);
  if (o.cuff) {
    // ragged flared cuff: every other tooth of the hem hangs lower
    const prof = shellPts([[0.048 * r, cuffY + 0.04], [0.064 * r, cuffY - 0.05]], 0.012);
    const geo = deform(lathe(prof, 10), (v) => {
      if (v.y < cuffY - 0.02) { const i = Math.round(((Math.atan2(v.x, v.z) + TAU) % TAU) / (TAU / 10)); if (i % 2) v.y -= 0.035; }
    });
    put(kF, geo, { ...cloth(o.cuffC || sl, 0.06 * r), shade: shade(cuffY, cuffY - 0.09, 0.3) });
  }
  if (o.wrist) put(kF, lathe(limbPts(0.036 * r, cuffY - 0.035, 0.04 * r, cuffY - 0.01), 8), { c: o.wrist, mot: 0.1, ol: false });
  // hand: palm faces the body (x), fingers hang down
  const hx = o.side * -0.004, sk = { c: o.skin, mot: 0.15 };
  put(kF, lathe(limbPts(0.02 * r, -0.15, 0.024 * r, cuffY), 8), { ...sk, ol: false });
  if (o.chubby) {
    put(kF, SPH_M, { ...sk, pos: [hx, -0.19, 0.005], scale: [0.032, 0.055, 0.05] });
    put(kF, SPH_S, { ...sk, pos: [hx - o.side * 0.005, -0.18, 0.05], rot: [0.6, 0, 0], scale: [0.02, 0.035, 0.02], ol: false });
  } else {
    put(kF, SPH_S, { ...sk, pos: [hx, -0.185, 0], scale: [0.022, 0.045, 0.04] });
    for (let i = 0; i < 4; i++) {
      const z = -0.027 + i * 0.018, len = 0.022 + (i === 1 || i === 2 ? 0.006 : 0);
      put(kF, CAP, { ...sk, pos: [hx - o.side * 0.006, -0.235 - len * 0.5, z], rot: [(z) * 2.2, 0, o.side * 0.25], scale: [0.0095, len, 0.0095], ol: false });
    }
    put(kF, CAP, { ...sk, pos: [hx - o.side * 0.01, -0.19, 0.045], rot: [0.75, 0, o.side * 0.3], scale: [0.01, 0.02, 0.01], ol: false });
  }
}

// foot: a squashed sphere, pointed and curled for the digger, round and stubby for corpses
function footGeo(len, wid, hgt, point, curl) {
  return deform(new THREE.SphereGeometry(1, 9, 6), (v) => {
    v.set(v.x * wid, v.y * hgt, v.z * len);
    const k = Math.max(0, v.z / len);
    v.x *= 1 - point * k * k;
    v.y += curl * k * k * k;
    v.y = Math.max(v.y, -hgt * 0.72);
  });
}
function leg(kT, kS, o) {
  const r = o.r || 1, pt = o.pants;
  put(kT, lathe(limbPts(0.055 * r, -0.2, 0.068 * r, 0.2), 8), cloth(pt, 0.06 * r));
  const cuffY = o.cuffY ?? -0.06;
  put(kS, lathe(limbPts(0.05 * r, cuffY, 0.056 * r, 0.2), 8), cloth(pt, 0.053 * r));
  if (o.ragged) {
    const prof = shellPts([[0.052 * r, cuffY + 0.03], [0.064 * r, cuffY - 0.05]], 0.012);
    const geo = deform(lathe(prof, 10), (v) => {
      if (v.y < cuffY - 0.02) { const i = Math.round(((Math.atan2(v.x, v.z) + TAU) % TAU) / (TAU / 10)); if (i % 2) v.y -= 0.03; }
    });
    put(kS, geo, cloth(pt, 0.06 * r));
  }
  const f = o.foot;
  if (f === 'boot') {
    put(kS, lathe(limbPts(0.05, -0.17, 0.058, -0.03), 10), { c: o.footC, mot: 0.35 });
    put(kS, lathe(shellPts([[0.062, -0.07], [0.068, 0.0]], 0.014), 10), { c: o.footC, mot: 0.35, shade: () => 1.25, ol: false }); // folded top
    put(kS, footGeo(0.13, 0.052, 0.05, 0.62, 0.05), { c: o.footC, mot: 0.35, pos: [0, -0.205, 0.055] });
    put(kS, BOXG, { c: '#14101a', pos: [0, -0.237, 0.04], scale: [0.09, 0.012, 0.2], ol: false }); // sole
  } else if (f === 'shoe') {
    put(kS, lathe(limbPts(0.04 * r, -0.19, 0.042 * r, -0.08), 8), { c: o.sock || o.skin, mot: 0.2, ol: false });
    put(kS, footGeo(0.11, 0.055 * r, 0.05, 0.2, 0.01), { c: o.footC, mot: 0.25, pos: [0, -0.205, 0.04] });
  } else if (f === 'slipper') {
    put(kS, lathe(limbPts(0.04 * r, -0.19, 0.042 * r, -0.08), 8), { c: o.skin, ol: false });
    put(kS, footGeo(0.115, 0.062 * r, 0.055, 0.1, 0.0), { c: o.footC, mot: 0.6, pos: [0, -0.2, 0.04] });
    put(kS, SPH_S, { c: o.footC2 || '#efe6d2', pos: [0, -0.17, 0.12], scale: 0.03, mot: 0.6 }); // pompom
  } else { // bare
    put(kS, lathe(limbPts(0.04 * r, -0.19, 0.042 * r, -0.08), 8), { c: o.skin, mot: 0.2, ol: false });
    put(kS, footGeo(0.11, 0.05 * r, 0.04, 0.0, 0.0), { c: o.skin, mot: 0.2, pos: [0, -0.21, 0.04] });
    for (let i = 0; i < 4; i++) put(kS, SPH_T, { c: o.skin, pos: [-0.03 + i * 0.019, -0.22, 0.135 - Math.abs(i - 1) * 0.008], scale: 0.014, ol: false });
  }
}

const INKC = '#1c1424', CREAM = '#efe6d2';

// ---------- the gravedigger ----------
function digger(k, color) {
  const COAT = '#33273f', VEST = '#1a1420', SKIN = '#ece6da', HAT = '#2a2034', BOOT = '#3d2b4d';
  const TROUS = { c: '#1b1622', c2: '#d7d0c3', d: 17, duty: 0.42, mot: 0.25 };
  const COATG = { c: COAT, mot: 0.35 };

  // head
  const H = k[P.head];
  const hd = makeHead(H, { w: 0.27, h: 0.3, a: 0.12, jaw: 0.3, chin: 0.075, skin: SKIN, mot: 0.22 });
  for (const sx of [-1, 1]) {
    const e = hd.face(sx * 0.1, 0.03, 0.03);
    put(H, SPH_M, { c: '#150f1d', mot: 0, pos: e.pos, rot: e.rot, scale: [0.088, 0.1, 0.05], ol: false });
    const pu = hd.face(sx * 0.093 + 0.012, 0.045, -0.012);
    put(H, SPH_T, { c: '#fffbea', em: 1, mot: 0, pos: pu.pos, scale: 0.019, ol: false });
    put(H, SPH_S, { c: SKIN, pos: [sx * 0.27, -0.03, -0.01], rot: [0, 0, -sx * 0.15], scale: [0.034, 0.065, 0.045], ol: false }); // ear
    // hair tuft and a curl peeking out under the hat
    put(H, SPH_S, { c: INKC, mot: 0, pos: [sx * 0.235, 0.13, -0.07], rot: [0, 0, sx * 0.5], scale: [0.05, 0.08, 0.1], ol: false });
    put(H, curlGeo(0.045, 1.4, 0.009, sx), { c: INKC, mot: 0, pos: [sx * 0.255, 0.1, -0.02], rot: [0, -sx * 0.4, sx * 0.2] });
  }
  const no = hd.face(0, -0.04, 0.01);
  put(H, CONE, { c: SKIN, pos: [no.pos[0], no.pos[1], no.pos[2] + 0.04], rot: [Math.PI / 2 - 0.35, 0, 0], scale: [0.036, 0.13, 0.032], ol: true });
  // hair mass under the hat brim at the back, so the head does not read as a bare egg from behind
  put(H, SPH_M, { c: INKC, mot: 0.1, pos: [0, 0.12, -0.11], rot: [0.5, 0, 0], scale: [0.25, 0.13, 0.17], ol: false });
  for (let i = 0; i < 5; i++) put(H, CONE, { c: INKC, mot: 0, pos: [(i - 2) * 0.08, 0.04 - Math.abs(i - 2) * 0.02, -0.2 + Math.abs(i - 2) * 0.04], rot: [-0.5 - 0.3, 0, (i - 2) * 0.4 + Math.PI], scale: [0.04, 0.11, 0.03], ol: false });
  // lopsided smile
  const sm = hd.face(0.01, -0.15, 0.004);
  put(H, deform(new THREE.BoxGeometry(0.15, 0.014, 0.02, 8, 1, 1), (v) => { v.y += 3.2 * v.x * v.x + 0.08 * v.x; v.z -= 2.2 * v.x * v.x; }), { c: INKC, mot: 0, pos: sm.pos, rot: sm.rot, ol: false });
  for (const sx of [-1, 1]) { const d = hd.face(sx * 0.085 + 0.01, -0.128 + sx * 0.006, 0.004); put(H, BOXG, { c: INKC, mot: 0, pos: d.pos, rot: [d.rot[0], d.rot[1], sx * 0.9], scale: [0.03, 0.01, 0.02], ol: false }); }
  // crooked top hat: crown bends sideways and pinches at the waist
  const HC = 0.42;
  const hatDef = (v) => { const t = Math.max(0, v.y / HC), pinch = 1 - 0.07 * Math.sin(Math.PI * t); v.x = v.x * pinch + 0.1 * t * t; v.z = v.z * pinch - 0.03 * t * t; };
  const hatM = mat4([0.02, 0.2, -0.02], [-0.16, 0, 0.17]);
  put(H, deform(lathe([[0, -0.02], [0.17, -0.02], [0.176, 0.1], [0.19, HC - 0.04], [0.195, HC - 0.01], [0.17, HC + 0.005], [0, HC]], 16), hatDef), { c: HAT, mot: 0.45, parent: hatM });
  put(H, deform(lathe([[0.178, 0.02], [0.186, 0.02], [0.19, 0.12], [0.18, 0.12]], 16), hatDef), { c: color, mot: 0.25, parent: hatM, ol: false });
  put(H, deform(lathe([[0.16, -0.01], [0.33, -0.012], [0.345, 0.006], [0.33, 0.016], [0.16, 0.02], [0.16, -0.01]], 16), (v) => { v.y += 0.075 * (v.x / 0.34) ** 2 - 0.015 * (v.z / 0.34); }), { c: HAT, mot: 0.45, parent: hatM });

  // chest: tailcoat with waistcoat and shirt, scarf in the player's color
  const C = k[P.chest];
  put(C, deform(lathe([[0, -0.25], [0.13, -0.245], [0.15, -0.15], [0.162, -0.03], [0.19, 0.09], [0.235, 0.165], [0.215, 0.21], [0.12, 0.245], [0, 0.255]], 16), (v) => { v.z *= 0.62; }), COATG);
  put(C, SPH_S, { c: VEST, mot: 0.2, pos: [0, -0.02, 0.07], scale: [0.105, 0.2, 0.05], ol: false });
  put(C, SPH_S, { c: CREAM, mot: 0.15, pos: [0, 0.13, 0.08], scale: [0.06, 0.1, 0.04], ol: false });
  for (let i = 0; i < 3; i++) put(C, SPH_T, { c: PAL.brass, pos: [0, 0.04 - i * 0.07, 0.122], scale: 0.013, ol: false });
  for (const sx of [-1, 1]) put(C, SPH_T, { c: PAL.brass, pos: [sx * 0.05, -0.19, -0.1], scale: 0.013, ol: false });
  const SC = { c: color, c2: CREAM, duty: 0.45, mot: 0.3 };
  put(C, new THREE.TorusGeometry(0.13, 0.058, 6, 16), { ...SC, s: ['u', 11], pos: [0, 0.235, 0], rot: [Math.PI / 2 + 0.22, 0, 0], scale: [1, 0.85, 1] });
  put(C, SPH_S, { ...SC, s: ['y', 30], pos: [0.075, 0.18, 0.13], scale: [0.06, 0.055, 0.045] }); // knot
  const tail = (pos, rot, len) => {
    const m = mat4(pos, rot);
    put(C, new THREE.BoxGeometry(0.105, len, 0.028, 1, 6, 1), { ...SC, s: ['py', 14], s0: 0.25, pos: [0, -len / 2, 0], parent: m });
    for (let i = 0; i < 4; i++) put(C, BOXG, { c: CREAM, pos: [-0.039 + i * 0.026, -len - 0.025, 0], scale: [0.011, 0.05, 0.012], parent: m, ol: false });
  };
  tail([0.085, 0.18, 0.15], [0.08, 0, 0.1], 0.42);
  tail([-0.05, 0.22, -0.135], [-0.12, 0.15, -0.14], 0.5);

  // pelvis: striped trousers and ragged coat tails
  const Pv = k[P.pelvis];
  put(Pv, deform(lathe(eggPts(0.165, 0.14, -0.1, 6), 14), (v) => { v.z *= 0.78; }), cloth(TROUS, 0.165));
  // two tail flaps split at the back, hem cut into uneven teeth
  for (const [p0, pl] of [[Math.PI * 0.4, Math.PI * 0.57], [Math.PI * 1.03, Math.PI * 0.57]]) {
    const n = 8, flap = deform(lathe(shellPts([[0.165, 0.11], [0.195, -0.05], [0.225, -0.22], [0.24, -0.32]], 0.014), n, p0, pl), (v) => {
      if (v.y < -0.29) { const col = Math.round(((Math.atan2(v.x, v.z) + TAU) % TAU - p0) / (pl / n)); v.y -= col % 2 ? 0.085 : (col % 3 === 0 ? 0.025 : 0); }
      v.z *= 0.85;
    });
    put(Pv, flap, { ...COATG, shade: shade(0.0, -0.4, 0.15) });
  }

  // limbs
  arm(k[P.uarmL], k[P.farmL], { side: 1, sleeve: COATG, cuff: true, skin: SKIN, wrist: CREAM });
  arm(k[P.uarmR], k[P.farmR], { side: -1, sleeve: COATG, cuff: true, skin: SKIN, wrist: CREAM });
  leg(k[P.thighL], k[P.shinL], { pants: TROUS, foot: 'boot', footC: BOOT, r: 0.92 });
  leg(k[P.thighR], k[P.shinR], { pants: TROUS, foot: 'boot', footC: BOOT, r: 0.92 });
}

export function buildShovel() {
  const s = new THREE.Group(), kit = [];
  const WOOD = '#8a5f3e', IRON = '#a3a6b4';
  put(kit, new THREE.CylinderGeometry(0.019, 0.022, 1.0, 7), { c: WOOD, mot: 0.5, pos: [0, 0.12, 0] });
  // D-grip
  put(kit, new THREE.TorusGeometry(0.055, 0.014, 5, 10, Math.PI), { c: WOOD, mot: 0.5, pos: [0, 0.66, 0] });
  put(kit, new THREE.CylinderGeometry(0.013, 0.013, 0.12, 6), { c: WOOD, mot: 0.5, pos: [0, 0.66, 0], rot: [0, 0, Math.PI / 2] });
  for (const sx of [-1, 1]) put(kit, new THREE.CylinderGeometry(0.012, 0.016, 0.06, 6), { c: WOOD, pos: [sx * 0.05, 0.63, 0], rot: [0, 0, sx * 0.4], ol: false });
  // socket and a pointed, slightly dished blade
  put(kit, new THREE.CylinderGeometry(0.024, 0.04, 0.12, 8), { c: IRON, mot: 0.3, pos: [0, -0.4, 0] });
  const sh = new THREE.Shape();
  sh.moveTo(-0.11, 0); sh.lineTo(0.11, 0); sh.quadraticCurveTo(0.125, -0.18, 0.06, -0.28); sh.quadraticCurveTo(0.02, -0.33, 0, -0.35);
  sh.quadraticCurveTo(-0.02, -0.33, -0.06, -0.28); sh.quadraticCurveTo(-0.125, -0.18, -0.11, 0);
  const blade = deform(new THREE.ExtrudeGeometry(sh, { depth: 0.014, bevelEnabled: false, curveSegments: 5 }), (v) => { v.z += 1.4 * v.x * v.x - 0.007; });
  put(kit, blade, { c: IRON, mot: 0.45, pos: [0, -0.44, 0], shade: (v) => 1.15 - 0.4 * THREE.MathUtils.clamp((-0.6 - v.y) / 0.3, 0, 1) });
  finish(kit, s, 0.009);
  s.position.set(0, -0.2, 0.05);
  s.rotation.set(1.25, 0, 0); // blade down into the ground in the digging pose (see animRots)
  s.visible = false;
  return s;
}

// ---------- corpses: a seeded wardrobe of floppy rag dolls ----------
function corpse(k, R) {
  const skin = R.pick([...PAL.skin, '#b8c9cc', '#d3bccb', '#bfc79f']);
  const skinDark = '#' + lin(skin).clone().multiplyScalar(0.55).getHexString(THREE.LinearSRGBColorSpace);
  const fat = R() < 0.35 ? R.range(1.12, 1.35) : R.range(0.82, 1.1);
  const lr = 0.85 + (fat - 0.82) * 0.6; // limb thickness
  const outfit = R.pick(['pajamas', 'suit', 'stripesuit', 'waistcoat', 'pajamas', 'suit']);
  const ink = INKC;
  let top, pants, sleeve, shirt = null, neck = R.pick(['bow', 'tie', 'none', 'bow']), foot, footC, footC2, ragged = R() < 0.5;
  if (outfit === 'pajamas') {
    const [a, b] = R.pick([['#c7b2df', '#4a3a66'], ['#bfe0cf', '#3f5a63'], ['#e9c2cf', '#6a3550'], ['#efe6d2', '#5a4a72'], ['#e8d9a6', '#6a5040']]);
    const dir = R() < 0.6 ? 'v' : 'h';
    top = pants = sleeve = { c: a, c2: b, d: dir === 'v' ? 14 : 11, dir, duty: 0.4, mot: 0.3 };
    neck = 'none';
    foot = R.pick(['bare', 'slipper', 'slipper']); footC = R.pick(['#8b5a7a', '#5a7a8b', '#a0705a', '#6a5a8f']); footC2 = a;
  } else if (outfit === 'stripesuit') {
    top = pants = sleeve = { c: '#1d1726', c2: '#e6dfd2', d: 15, dir: 'v', duty: 0.45, mot: 0.3 };
    shirt = CREAM; foot = 'shoe'; footC = '#16111c';
  } else if (outfit === 'waistcoat') {
    top = { c: R.pick(['#6a3d5e', '#4e5a3a', '#7a6430', '#3d4a6a']), mot: 0.35 };
    sleeve = { c: R.pick([CREAM, '#d9d2e6', '#e6dcc4']), mot: 0.25 };
    pants = R() < 0.5 ? { c: '#3a3344', c2: '#56506a', d: 10, dir: 'v', duty: 0.3, mot: 0.35 } : { c: R.pick(['#4a3a3a', '#3a3a4a', '#5a4a3a']), mot: 0.4 };
    shirt = sleeve.c; foot = R.pick(['shoe', 'bare']); footC = '#2a1e1e';
  } else {
    const c = R.pick(['#1f1a2a', '#2e2440', '#3a2a3a', '#26303f', '#45325a']);
    top = pants = sleeve = { c, mot: 0.4 };
    shirt = CREAM; foot = R.pick(['shoe', 'shoe', 'bare']); footC = '#141018';
    ragged = R() < 0.6;
  }

  // head
  const H = k[P.head];
  const shape = R.pick(['round', 'long', 'pear', 'egg']);
  const hp = { round: { w: 0.27, h: 0.27, a: 0 }, long: { w: 0.22, h: 0.33, a: 0.08, jaw: 0.15, chin: 0.03 }, pear: { w: 0.26, h: 0.28, a: -0.22 }, egg: { w: 0.25, h: 0.3, a: 0.15, jaw: 0.2, chin: 0.04 } }[shape];
  const hd = makeHead(H, { ...hp, skin, mot: 0.3 });
  const hw = hp.w, hh = hp.h;
  put(H, lathe(limbPts(0.06 * lr, -0.3, 0.07 * lr, -0.15), 8), { c: skin, ol: false }); // neck
  for (const sx of [-1, 1]) put(H, SPH_S, { c: skin, pos: [sx * hd.radiusAt(-0.02) * 0.97, -0.02, -0.01], rot: [0, 0, -sx * 0.2], scale: R() < 0.3 ? [0.035, 0.08, 0.06] : [0.028, 0.055, 0.042], ol: false });
  // eyes
  const eyeKind = R.pick(['x', 'x', 'x', 'mixed', 'closed', 'buggy']);
  const ex = hw * 0.38, ey = hh * 0.12;
  for (const sx of [-1, 1]) {
    const e = hd.face(sx * ex, ey, 0.028), kind = eyeKind === 'mixed' ? (sx < 0 ? 'x' : 'buggy') : eyeKind;
    if (kind === 'buggy') {
      const big = sx > 0 ? 0.075 : 0.06;
      put(H, SPH_M, { c: '#f2ecdc', mot: 0.05, pos: e.pos, rot: e.rot, scale: [big, big * 1.05, 0.05] });
      const pu = hd.face(sx * ex + R.range(-0.02, 0.02), ey + R.range(-0.02, 0.02), -0.02);
      put(H, SPH_T, { c: ink, mot: 0, pos: pu.pos, scale: 0.018, ol: false });
      continue;
    }
    put(H, SPH_M, { c: '#2a1e34', mot: 0.1, pos: e.pos, rot: e.rot, scale: [0.07, 0.072, 0.045] });
    const f = hd.face(sx * ex, ey, -0.014);
    if (kind === 'x') for (const a of [0.78, -0.78]) put(H, BOXG, { c: '#e9e2d0', mot: 0, pos: f.pos, rot: [f.rot[0], f.rot[1], a], scale: [0.085, 0.014, 0.012], ol: false });
    else put(H, deform(new THREE.TorusGeometry(0.035, 0.008, 4, 10, Math.PI), (v) => { v.z -= 3 * v.x * v.x; }), { c: '#e9e2d0', mot: 0, pos: [f.pos[0], f.pos[1] - 0.012, f.pos[2]], rot: [f.rot[0], f.rot[1], Math.PI], ol: false });
  }
  // nose
  const nose = R.pick(['knob', 'long', 'bulb', 'knob']), np = hd.face(0, -hh * 0.12, 0.01);
  if (nose === 'long') put(H, CONE, { c: skin, pos: np.pos, rot: [Math.PI / 2 - 0.4, 0, 0], scale: [0.03, 0.12, 0.026] });
  else put(H, SPH_S, { c: skin, pos: np.pos, scale: nose === 'bulb' ? [0.045, 0.04, 0.045] : [0.025, 0.03, 0.03], ol: nose === 'bulb' });
  // mouth
  const mouth = R.pick(['stitch', 'stitch', 'frown', 'o', 'teeth', 'tongue']), my = -hh * 0.47, mp = hd.face(0, my, 0.006);
  const mw = hw * (0.45 + R() * 0.25);
  if (mouth === 'stitch' || mouth === 'tongue') {
    const bend = (v) => { v.z -= 2.2 * v.x * v.x; };
    put(H, deform(new THREE.BoxGeometry(mw, 0.012, 0.014, 6, 1, 1), bend), { c: ink, mot: 0, pos: mp.pos, rot: mp.rot, ol: false });
    for (let i = 0; i < 5; i++) { const x = (i / 4 - 0.5) * mw * 0.85, p = hd.face(x, my, 0.004); put(H, BOXG, { c: ink, mot: 0, pos: p.pos, rot: p.rot, scale: [0.009, 0.045, 0.012], ol: false }); }
    if (mouth === 'tongue') put(H, CAP, { c: '#c8607a', mot: 0.1, pos: [mp.pos[0] + 0.03, mp.pos[1] - 0.04, mp.pos[2] + 0.005], rot: [0.4, 0, 0.15], scale: [0.025, 0.02, 0.014], ol: false });
  } else if (mouth === 'frown') {
    put(H, deform(new THREE.TorusGeometry(mw * 0.45, 0.01, 4, 12, Math.PI * 0.8), (v) => { v.z -= 2.4 * v.x * v.x; }), { c: ink, mot: 0, pos: [mp.pos[0], mp.pos[1] - 0.03, mp.pos[2]], rot: [mp.rot[0], 0, Math.PI * 0.1], ol: false });
  } else if (mouth === 'o') {
    put(H, SPH_S, { c: '#2a1424', mot: 0, pos: mp.pos, rot: mp.rot, scale: [0.04, 0.05, 0.03] });
  } else {
    put(H, SPH_M, { c: '#2a1424', mot: 0, pos: mp.pos, rot: mp.rot, scale: [mw * 0.5, 0.03, 0.025] });
    for (let i = 0; i < 4; i++) { const x = (i / 3 - 0.5) * mw * 0.6, p = hd.face(x, my + 0.008, -0.012); put(H, BOXG, { c: '#ece4cf', mot: 0, pos: p.pos, rot: p.rot, scale: [0.022, 0.024, 0.01], ol: false }); }
  }
  // cheeks, moustache, scar
  if (R() < 0.45) for (const sx of [-1, 1]) { const p = hd.face(sx * hw * 0.55, -hh * 0.3, 0.015); put(H, SPH_S, { c: '#d98aa0', mot: 0.2, pos: p.pos, rot: p.rot, scale: [0.04, 0.03, 0.02], ol: false }); }
  if (R() < 0.3 && mouth !== 'o') for (const sx of [-1, 1]) {
    const p = hd.face(sx * 0.005, -hh * 0.3, -0.008);
    put(H, curlGeo(0.05, 1.15, 0.012, sx), { c: R.pick([ink, '#d8d2c6', '#7a4a30']), mot: 0, pos: p.pos, rot: [0.1, sx * 0.3, -sx * 0.35] });
  }
  if (R() < 0.45) {
    const sx = R() < 0.5 ? -1 : 1, p = hd.face(sx * hw * 0.42, hh * 0.55, 0.002);
    put(H, BOXG, { c: '#5e3a4a', mot: 0, pos: p.pos, rot: [p.rot[0], p.rot[1], sx * 0.7], scale: [0.13, 0.011, 0.012], ol: false });
    for (let i = -1; i <= 1; i++) { const q = hd.face(sx * hw * 0.42 + i * 0.035 * Math.cos(0.7), hh * 0.55 + sx * i * 0.035 * Math.sin(0.7), 0.0); put(H, BOXG, { c: '#5e3a4a', mot: 0, pos: q.pos, rot: [q.rot[0], q.rot[1], sx * 0.7 + Math.PI / 2], scale: [0.04, 0.008, 0.012], ol: false }); }
  }
  // hair
  const hair = R.pick(['spiky', 'mop', 'slick', 'curl', 'combover', 'tufts']);
  const hc = R.pick([ink, ink, '#4a3a5a', '#d8d2c6', '#8a5a3a', '#5a4040']), HR = { c: hc, mot: 0.15 };
  if (hair === 'spiky') {
    for (let i = 0; i < 7; i++) { const a = (i / 6 - 0.5) * 1.6; put(H, CONE, { ...HR, pos: [Math.sin(a) * hw * 0.6, hh * 0.86 + Math.cos(a) * 0.04, R.range(-0.08, 0.04)], rot: [R.range(-0.3, 0.1), 0, -a * 0.9], scale: [0.04, R.range(0.13, 0.2), 0.04] }); }
  } else if (hair === 'mop') {
    for (let i = 0; i < 9; i++) { const a = (i / 9) * TAU; put(H, SPH_S, { ...HR, pos: [Math.cos(a) * hw * 0.6, hh * 0.8 + R.range(-0.03, 0.05), Math.sin(a) * hw * 0.55 - 0.03], scale: R.range(0.07, 0.1) }); }
    put(H, SPH_S, { ...HR, pos: [0, hh * 0.92, -0.02], scale: [hw * 0.7, 0.08, hw * 0.7] });
    for (const sx of [-1, 1]) put(H, curlGeo(0.05, 1.3, 0.011, sx), { ...HR, pos: [sx * hw * 0.85, hh * 0.55, 0.0], rot: [0, -sx * 0.5, sx * 0.4] });
  } else if (hair === 'slick') {
    put(H, deform(new THREE.SphereGeometry(1, 16, 6, 0, TAU, 0, Math.PI * 0.34), (v) => { v.set(v.x * hd.radiusAt(0) * 1.05, v.y * hh * 1.06, v.z * hd.radiusAt(0) * 1.0); }), { ...HR, mot: 0.1, pos: [0, 0.0, -0.02], rot: [-0.45, 0, 0] });
    put(H, SPH_S, { ...HR, pos: [0.06, hh * 0.92, hw * 0.45], rot: [0.5, 0, -0.5], scale: [0.11, 0.06, 0.07] }); // front swoop
  } else if (hair === 'curl') {
    put(H, curlGeo(0.05, 1.5, 0.01, 1), { ...HR, pos: [0, hh * 0.97, 0], rot: [0, 0.3, Math.PI / 2] });
  } else if (hair === 'combover') {
    for (let i = 0; i < 4; i++) put(H, deform(new THREE.TorusGeometry(hd.radiusAt(hh * 0.7) * 1.02 + 0.01, 0.012, 4, 12, Math.PI * 0.9), () => {}), { ...HR, pos: [0, hh * 0.35, -0.06 + i * 0.045], rot: [0, 0, 0.15 + i * 0.04], scale: [1, 1.15, 1], ol: false });
  } else {
    for (const sx of [-1, 1]) put(H, SPH_S, { ...HR, pos: [sx * hd.radiusAt(0.08) * 0.92, 0.08, -0.04], rot: [0, 0, sx * 0.4], scale: [0.06, 0.1, 0.13] });
  }

  // torso
  const C = k[P.chest], zs = 0.62 + (fat - 0.82) * 0.55, wf = Math.min(fat, 1.22);
  const prof = [[0, -0.25], [0.15 * wf, -0.245], [0.175 * wf, -0.13], [0.18 * wf, 0.0], [0.2 * Math.min(wf, 1.1), 0.1], [0.23, 0.17], [0.21, 0.215], [0.12, 0.245], [0, 0.255]];
  put(C, deform(lathe(prof, 16), (v) => { v.z *= v.z > 0 ? zs * (1 + (fat - 0.82) * 0.5 * Math.max(0, Math.cos((v.y + 0.08) * 6))) : zs * 0.9; }), cloth(top, 0.2));
  const front = (y) => 0.18 * wf * zs * (1 + (fat - 0.82) * 0.5 * Math.max(0, Math.cos((y + 0.08) * 6)));
  if (shirt) {
    put(C, SPH_M, { c: shirt, mot: 0.15, pos: [0, 0.12, 0.085], scale: [0.065, 0.11, 0.045] });
    if (outfit !== 'waistcoat') for (const sx of [-1, 1]) put(C, BOXG, { c: top.c, c2: top.c2, s: top.c2 ? ['x', 15] : undefined, duty: 0.45, mot: 0.3, pos: [sx * 0.07, 0.07, front(0.07) + 0.006], rot: [-0.12, 0, sx * 0.4], scale: [0.05, 0.22, 0.014], ol: false });
    else put(C, CAP, { c: PAL.brass, pos: [0.06, -0.03, front(-0.03) + 0.008], rot: [0, 0, 1.2], scale: [0.006, 0.05, 0.006], ol: false }); // watch chain
    for (const sx of [-1, 1]) put(C, CONE, { c: shirt, pos: [sx * 0.045, 0.205, 0.075], rot: [0.4, 0, sx * 2.2], scale: [0.035, 0.07, 0.015] }); // collar points
  } else for (let i = 0; i < 3; i++) put(C, SPH_T, { c: CREAM, pos: [0, 0.12 - i * 0.1, front(0.12 - i * 0.1) + 0.004], scale: 0.017, ol: false });
  if (neck === 'bow' && shirt) {
    const bc = R.pick([ink, ink, '#7a2a4a', '#3a2a6a']);
    for (const sx of [-1, 1]) put(C, CONE, { c: bc, mot: 0.2, pos: [sx * 0.045, 0.19, 0.12], rot: [0, 0, sx * Math.PI / 2], scale: [0.04, 0.07, 0.025] });
    put(C, SPH_S, { c: bc, pos: [0, 0.19, 0.125], scale: 0.022 });
  } else if (neck === 'tie' && shirt) {
    const tc = R.pick(['#5a2a3a', '#2a3a5a', '#4a4a2a', ink]);
    put(C, BOXG, { c: tc, mot: 0.2, pos: [0, 0.07, front(0.07) + 0.025], rot: [-0.25, 0, 0.05], scale: [0.04, 0.22, 0.012] });
  }
  if (outfit === 'waistcoat') for (let i = 0; i < 4; i++) put(C, SPH_T, { c: CREAM, pos: [0, 0.05 - i * 0.065, front(0.05 - i * 0.065) + 0.003], scale: 0.013, ol: false });
  if (outfit === 'suit' && R() < 0.5) put(C, SPH_S, { c: R.pick(['#c8443a', '#e0d070', '#c070c0']), mot: 0.3, pos: [0.12, 0.12, front(0.12) * 0.85 + 0.01], scale: 0.03 }); // buttonhole flower
  // pelvis
  const Pv = k[P.pelvis];
  put(Pv, deform(lathe(eggPts(0.165 * wf, 0.14, -0.12 * fat, 8), 16), (v) => { v.z *= 0.78 * Math.min(fat, 1.15); }), cloth(pants, 0.17));
  // patch
  if (R() < 0.6) {
    const pc = R.pick(['#8a6a4a', '#6a8a7a', '#9a6a8a', '#c9b98f']), where = R.pick([P.thighL, P.thighR, P.chest, P.uarmR]);
    const pk = k[where], z = where === P.chest ? front(-0.05) - 0.005 : 0.055 * lr;
    put(pk, BOXG, { c: pc, mot: 0.4, pos: [where === P.chest ? -0.08 : 0, where === P.chest ? -0.05 : -0.05, z], rot: [0, 0, R.range(-0.4, 0.4)], scale: [0.07, 0.07, 0.012] });
  }

  const skinDarkC = skinDark;
  const am = { sleeve, skin, r: lr, cuff: outfit !== 'pajamas' && ragged, wrist: shirt && outfit !== 'waistcoat' ? shirt : null, chubby: fat > 1.12, bare: outfit === 'waistcoat' && R() < 0.5, cuffY: -0.07 };
  if (am.bare) am.cuffY = 0.02;
  arm(k[P.uarmL], k[P.farmL], { ...am, side: 1 });
  arm(k[P.uarmR], k[P.farmR], { ...am, side: -1 });
  const lm = { pants, skin, r: lr, foot, footC, footC2, ragged, cuffY: foot === 'bare' ? -0.03 : -0.08, sock: R.pick([skinDarkC, '#3a3344', skin]) };
  leg(k[P.thighL], k[P.shinL], lm);
  leg(k[P.thighR], k[P.shinR], lm);
}

// Characters: one THREE.Group per skeleton part, each centered on the part (see shared/skeleton.js).
export function buildCharacter(kind, seed, color) {
  const g = Array.from({ length: NPARTS }, () => new THREE.Group());
  const kits = g.map(() => []);
  if (kind === 'corpse') corpse(kits, rng(seed * 31 + 7));
  else digger(kits, color || PAL.red);
  kits.forEach((kit, i) => finish(kit, g[i], i === P.head ? 0.012 : 0.011));
  if (kind !== 'corpse') {
    const shovel = buildShovel();
    g[P.farmR].add(shovel);
    g[P.farmR].userData.shovel = shovel;
  }
  return g;
}

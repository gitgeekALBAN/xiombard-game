import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { outlineMat, lightingGLSL, DAY, shareLight } from '../../shaders/toon.js';
import { noise } from '../../shaders/noise.glsl.js';
import { outlineGeo } from './common.js';

// The shovel the diggers carry: a small kit of pieces merged into one mesh whose colors, stripes and glow live in
// vertex attributes, plus one outline. (Every character is drawn by the SDF shader; this is the last hand-built prop
// that rides on one.)

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
const charMat = () => {
  if (MAT) return MAT;
  MAT = new THREE.ShaderMaterial({ uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog]), vertexShader: vert, fragmentShader: frag, fog: true });
  shareLight(MAT); // shared day/night uniform (see toon.js)
  return MAT;
};

// ---------- geometry helpers ----------
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

// A short spade, made to be held like a weapon: the origin is where the mitten grips it, the blade points along +y
// and its face looks along +z. About 0.85 m from the D-grip to the tip.
export function buildShovel() {
  const s = new THREE.Group(), kit = [];
  const WOOD = '#8a5f3e', IRON = '#a3a6b4';
  put(kit, new THREE.CylinderGeometry(0.02, 0.022, 0.52, 7), { c: WOOD, mot: 0.5, pos: [0, 0.18, 0] });
  // D-grip behind the hand
  put(kit, new THREE.TorusGeometry(0.05, 0.014, 5, 10, Math.PI), { c: WOOD, mot: 0.5, pos: [0, -0.08, 0], rot: [0, 0, Math.PI] });
  put(kit, new THREE.CylinderGeometry(0.013, 0.013, 0.11, 6), { c: WOOD, mot: 0.5, pos: [0, -0.08, 0], rot: [0, 0, Math.PI / 2] });
  // socket and a pointed, slightly dished blade
  put(kit, new THREE.CylinderGeometry(0.04, 0.024, 0.12, 8), { c: IRON, mot: 0.3, pos: [0, 0.44, 0] });
  const sh = new THREE.Shape();
  sh.moveTo(-0.11, 0); sh.lineTo(0.11, 0); sh.quadraticCurveTo(0.125, 0.16, 0.06, 0.25); sh.quadraticCurveTo(0.02, 0.3, 0, 0.32);
  sh.quadraticCurveTo(-0.02, 0.3, -0.06, 0.25); sh.quadraticCurveTo(-0.125, 0.16, -0.11, 0);
  const blade = deform(new THREE.ExtrudeGeometry(sh, { depth: 0.014, bevelEnabled: false, curveSegments: 5 }), (v) => { v.z += 1.4 * v.x * v.x - 0.007; });
  put(kit, blade, { c: IRON, mot: 0.45, pos: [0, 0.46, 0], shade: (v) => 1.15 - 0.4 * THREE.MathUtils.clamp((v.y - 0.56) / 0.25, 0, 1) });
  finish(kit, s, 0.009);
  return s;
}

// ---------- corpses: a seeded wardrobe of floppy rag dolls ----------

import * as THREE from 'three';
import { LANTERNS } from '../shared/layout.js';
import { noise } from './noise.glsl.js';

// Shared cartoon lighting: a cold moon key light in three bands with purple shadows,
// a rim that follows the surface color, and warm lantern light that respects normals.
export const MOON_DIR = new THREE.Vector3(-0.35, 0.55, -0.75).normalize();
export const LANTERN_Y = 2.35; // height of the lantern flame above the ground
export const INK = '#120d1a'; // outline color
const L = (v) => `vec3(${v.x.toFixed(4)}, ${v.y.toFixed(4)}, ${v.z.toFixed(4)})`;

// GLSL shared by every lit material (models, ground, backdrop).
// toonShade(base, N, worldPos)            — default rim
// toonShadeRim(base, N, worldPos, rim)    — rim strength 0..2
// lanternLight(worldPos, N)               — warm light only, for custom shaders
export const lightingGLSL = /* glsl */ `
const vec3 MOON = ${L(MOON_DIR)};
const int NL = ${LANTERNS.length};
const vec3 LANTERN[NL] = vec3[](${LANTERNS.map(([x, z]) => `vec3(${x.toFixed(2)}, ${LANTERN_Y.toFixed(2)}, ${z.toFixed(2)})`).join(', ')});
vec3 lanternLight(vec3 w, vec3 N) {
  float g = 0.0;
  for (int i = 0; i < NL; i++) {
    vec3 d = LANTERN[i] - w;
    float r2 = dot(d, d);
    float att = 1.0 / (1.0 + r2 * 0.16) * smoothstep(13.0, 4.0, sqrt(r2));
    float wrap = clamp(dot(N, d * inversesqrt(r2 + 1e-4)) * 0.6 + 0.4, 0.0, 1.0);
    g += att * wrap;
  }
  // two soft steps so lantern pools read as painted shapes, not a smooth gradient
  float q = smoothstep(0.05, 0.11, g) * 0.35 + smoothstep(0.22, 0.34, g) * 0.4 + g * 0.6;
  return vec3(1.0, 0.6, 0.26) * q * 1.7;
}
vec3 toonShadeRim(vec3 base, vec3 N, vec3 w, float rimK) {
  float d = dot(N, MOON);
  float lit = smoothstep(0.36, 0.44, d);
  float mid = smoothstep(-0.16, -0.08, d);
  // shadows go purple instead of just darker
  vec3 light = mix(vec3(0.3, 0.26, 0.5), vec3(0.58, 0.56, 0.86), mid);
  light = mix(light, vec3(0.92, 0.96, 1.12), lit);
  vec3 V = normalize(cameraPosition - w);
  float rim = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 3.0) * (0.35 + 0.65 * mid);
  vec3 rimCol = (base * 1.1 + 0.035) * vec3(0.62, 0.74, 1.25);
  return base * (light + lanternLight(w, N)) + rim * rimK * rimCol;
}
vec3 toonShade(vec3 base, vec3 N, vec3 w) { return toonShadeRim(base, N, w, 1.0); }
`;

const vert = /* glsl */ `
varying vec3 vN; varying vec3 vW; varying vec3 vO;
#include <common>
#include <fog_pars_vertex>
void main() {
  mat4 mm = modelMatrix;
  #ifdef USE_INSTANCING
  mm = modelMatrix * instanceMatrix;
  #endif
  // vO: position in the mesh's own space, in meters (scale applied), so patterns keep a real-world size
  vO = position * vec3(length(mm[0].xyz), length(mm[1].xyz), length(mm[2].xyz));
  vec4 w = mm * vec4(position, 1.0); vW = w.xyz;
  // inverse-transpose for non-uniform scale: n / scale^2 per axis, then rotate
  vec3 s2 = vec3(dot(mm[0].xyz, mm[0].xyz), dot(mm[1].xyz, mm[1].xyz), dot(mm[2].xyz, mm[2].xyz));
  vN = normalize(mat3(mm) * (normal / s2));
  vec4 mvPosition = viewMatrix * w;
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}`;

const frag = /* glsl */ `
uniform vec3 uColor; uniform vec3 uColor2; uniform vec3 uGradColor; uniform vec2 uGradY;
uniform float uStripes; uniform float uStripeDuty; uniform int uAxis;
uniform float uEmissive; uniform float uMottle; uniform float uRim;
varying vec3 vN; varying vec3 vW; varying vec3 vO;
#include <common>
#include <fog_pars_fragment>
${noise}
${lightingGLSL}
void main() {
  vec3 N = normalize(vN);
  if (!gl_FrontFacing) N = -N;
  vec3 base = uColor;
  if (uStripes > 0.0) {
    float c = (uAxis == 0 ? vO.y : (uAxis == 1 ? vO.x : vO.z)) * uStripes;
    float aa = max(fwidth(c), 1e-4); // fwidth is 0 on faces perpendicular to the stripe axis
    float s = smoothstep(-aa, aa, abs(fract(c) - 0.5) - (0.5 - uStripeDuty * 0.5));
    s = mix(s, uStripeDuty, smoothstep(0.35, 0.7, aa)); // too dense to resolve: fade to the average
    base = mix(uColor, uColor2, s);
  }
  if (uGradY.y > uGradY.x) base = mix(uGradColor, base, smoothstep(uGradY.x, uGradY.y, vO.y));
  if (uMottle > 0.0) {
    float n = vnoise(vO.xz * 7.0 + vO.y * 4.3) * 0.65 + vnoise(vO.xy * 19.0 + vO.z * 11.0) * 0.35;
    base *= 1.0 + uMottle * (n - 0.5) * 1.2;
  }
  vec3 col = mix(toonShadeRim(base, N, vW, uRim), base, uEmissive);
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
  #include <fog_fragment>
}`;

const cache = new Map();
// toon('#hex', opts) — cached per (color, opts), so share freely.
//   color2 + stripes : stripe pairs PER METER along axis (0 = y, 1 = x, 2 = z), measured in the mesh's own scaled space
//   stripeDuty       : share of color2 in each stripe pair, 0..1 (default 0.5)
//   gradColor + gradY: [y0, y1] in mesh-local meters; below y0 the surface is gradColor, above y1 the base color
//   mottle           : 0..1 painterly value noise that breaks up flat color
//   rim              : rim light strength (default 1, 0 turns it off)
//   emissive         : 0..1 mix toward the unlit color (windows, flames)
//   side             : THREE.FrontSide (default) / DoubleSide / BackSide
export function toon(color, opts = {}) {
  const key = JSON.stringify([color, opts]);
  if (cache.has(key)) return cache.get(key);
  const m = new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, {
      uColor: { value: new THREE.Color(color) },
      uColor2: { value: new THREE.Color(opts.color2 || color) },
      uGradColor: { value: new THREE.Color(opts.gradColor || color) },
      uGradY: { value: new THREE.Vector2(...(opts.gradColor ? opts.gradY || [0, 1] : [0, 0])) },
      uStripes: { value: opts.stripes || 0 },
      uStripeDuty: { value: opts.stripeDuty ?? 0.5 },
      uAxis: { value: opts.axis || 0 },
      uEmissive: { value: opts.emissive || 0 },
      uMottle: { value: opts.mottle || 0 },
      uRim: { value: opts.rim ?? 1 },
    }]),
    vertexShader: vert, fragmentShader: frag, fog: true, side: opts.side || THREE.FrontSide,
  });
  cache.set(key, m);
  return m;
}

// Inverted-hull outline. The hull is pushed out in view space, so `thick` is a real width in
// meters whatever the mesh scale is, and it grows a little with distance so far things keep a line.
const outlineVert = /* glsl */ `
uniform float uThick;
#include <common>
#include <fog_pars_vertex>
void main() {
  mat4 mv = modelViewMatrix;
  #ifdef USE_INSTANCING
  mv = modelViewMatrix * instanceMatrix;
  #endif
  vec3 s2 = vec3(dot(mv[0].xyz, mv[0].xyz), dot(mv[1].xyz, mv[1].xyz), dot(mv[2].xyz, mv[2].xyz));
  vec3 n = normalize(mat3(mv) * (normal / s2));
  vec4 mvPosition = mv * vec4(position, 1.0);
  mvPosition.xyz += n * uThick * clamp(-mvPosition.z * 0.22, 0.75, 2.6);
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}`;
const outlineFrag = /* glsl */ `
uniform vec3 uInk;
#include <common>
#include <fog_pars_fragment>
void main() {
  gl_FragColor = vec4(uInk, 1.0);
  #include <colorspace_fragment>
  #include <fog_fragment>
}`;
const outlineCache = new Map();
export function outlineMat(thick = 0.02) {
  if (outlineCache.has(thick)) return outlineCache.get(thick);
  const m = new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { uThick: { value: thick }, uInk: { value: new THREE.Color(INK) } }]),
    vertexShader: outlineVert, fragmentShader: outlineFrag, side: THREE.BackSide, fog: true,
  });
  outlineCache.set(thick, m);
  return m;
}

// Soft additive glow quad for lanterns / headlights. Set mesh.userData.billboard = true to face the camera.
export function glowMat(color, strength = 1) {
  return new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color(color) }, uStrength: { value: strength } },
    vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: /* glsl */ `uniform vec3 uColor; uniform float uStrength; varying vec2 vUv;
      void main(){ float d = length(vUv - 0.5) * 2.0; float a = pow(max(0.0, 1.0 - d), 2.2) * uStrength; gl_FragColor = vec4(uColor * a, a); }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
}

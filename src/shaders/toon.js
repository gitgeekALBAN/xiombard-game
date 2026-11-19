import * as THREE from 'three';
import { LIGHTS } from '../shared/layout.js';

// Shared cartoon lighting: a cold moon key light, three flat bands, a blue rim and warm lantern pools.
export const MOON_DIR = new THREE.Vector3(-0.35, 0.55, -0.75).normalize();
const L = (v) => `vec3(${v.x.toFixed(4)}, ${v.y.toFixed(4)}, ${v.z.toFixed(4)})`;

export const lightingGLSL = /* glsl */ `
const vec3 MOON = ${L(MOON_DIR)};
const int NL = ${LIGHTS.length};
const vec2 LANTERN[NL] = vec2[](${LIGHTS.map(([x, z]) => `vec2(${x.toFixed(2)}, ${z.toFixed(2)})`).join(', ')});
vec3 lanternGlow(vec3 w) {
  float g = 0.0;
  for (int i = 0; i < NL; i++) { vec2 d = w.xz - LANTERN[i]; g += exp(-dot(d, d) / 9.0) * smoothstep(3.5, 0.0, abs(w.y - 1.0)); }
  return vec3(1.0, 0.62, 0.28) * g * 0.55;
}
vec3 toonShade(vec3 base, vec3 N, vec3 w) {
  float d = dot(N, MOON);
  float l = d > 0.42 ? 1.0 : (d > -0.12 ? 0.68 : 0.46);
  vec3 V = normalize(cameraPosition - w);
  float rim = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 3.0);
  return base * (l * vec3(0.86, 0.9, 1.08) + lanternGlow(w)) + rim * 0.25 * vec3(0.5, 0.62, 1.0);
}
`;

const vert = /* glsl */ `
varying vec3 vN; varying vec3 vW; varying vec3 vO;
#include <common>
#include <fog_pars_vertex>
void main() {
  vec4 p = vec4(position, 1.0); vec3 n = normal;
  #ifdef USE_INSTANCING
  p = instanceMatrix * p; n = mat3(instanceMatrix) * n;
  #endif
  vO = position;
  vec4 w = modelMatrix * p; vW = w.xyz;
  vN = normalize(mat3(modelMatrix) * n);
  vec4 mvPosition = viewMatrix * w;
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}`;

const frag = /* glsl */ `
uniform vec3 uColor; uniform vec3 uColor2; uniform float uStripes; uniform int uAxis; uniform float uEmissive;
varying vec3 vN; varying vec3 vW; varying vec3 vO;
#include <common>
#include <fog_pars_fragment>
${lightingGLSL}
void main() {
  vec3 N = normalize(vN);
  if (!gl_FrontFacing) N = -N;
  vec3 base = uColor;
  if (uStripes > 0.0) {
    float c = uAxis == 0 ? vO.y : (uAxis == 1 ? vO.x : vO.z);
    base = mix(uColor, uColor2, step(0.5, fract(c * uStripes)));
  }
  vec3 col = mix(toonShade(base, N, vW), base, uEmissive);
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
  #include <fog_fragment>
}`;

const cache = new Map();
// toon('#hex') or toon('#a', {color2:'#b', stripes: 12, axis: 0|1|2, emissive: 0..1})
export function toon(color, opts = {}) {
  const key = JSON.stringify([color, opts]);
  if (cache.has(key)) return cache.get(key);
  const m = new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, {
      uColor: { value: new THREE.Color(color) },
      uColor2: { value: new THREE.Color(opts.color2 || color) },
      uStripes: { value: opts.stripes || 0 },
      uAxis: { value: opts.axis || 0 },
      uEmissive: { value: opts.emissive || 0 },
    }]),
    vertexShader: vert, fragmentShader: frag, fog: true, side: opts.side || THREE.FrontSide,
  });
  cache.set(key, m);
  return m;
}

const outlineVert = /* glsl */ `
uniform float uThick;
#include <common>
#include <fog_pars_vertex>
void main() {
  vec4 p = vec4(position + normal * uThick, 1.0);
  #ifdef USE_INSTANCING
  p = instanceMatrix * p;
  #endif
  vec4 mvPosition = modelViewMatrix * p;
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}`;
const outlineFrag = /* glsl */ `
#include <common>
#include <fog_pars_fragment>
void main() {
  gl_FragColor = vec4(0.055, 0.035, 0.075, 1.0);
  #include <fog_fragment>
}`;
const outlineCache = new Map();
export function outlineMat(thick = 0.02) {
  if (outlineCache.has(thick)) return outlineCache.get(thick);
  const m = new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { uThick: { value: thick } }]),
    vertexShader: outlineVert, fragmentShader: outlineFrag, side: THREE.BackSide, fog: true,
  });
  outlineCache.set(thick, m);
  return m;
}

// Soft additive glow quad for lanterns / headlights.
export function glowMat(color, strength = 1) {
  return new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color(color) }, uStrength: { value: strength } },
    vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: /* glsl */ `uniform vec3 uColor; uniform float uStrength; varying vec2 vUv;
      void main(){ float d = length(vUv - 0.5) * 2.0; float a = pow(max(0.0, 1.0 - d), 2.2) * uStrength; gl_FragColor = vec4(uColor * a, a); }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
}

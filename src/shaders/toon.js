import * as THREE from 'three';
import { LANTERNS, MORGUE } from '../shared/layout.js';
import { noise } from './noise.glsl.js';

// Shared cartoon lighting: a key light in three bands with tinted shadows, a rim that follows the surface color,
// and warm lantern light that respects normals.
// Day/night: one shared uniform, DAY.value = k (0 = deep night, 0.5 = dusk/dawn, 1 = full day). Every material that
// uses lightingGLSL must reference this same object as its `uDay` uniform (assign it AFTER UniformsUtils.merge,
// which clones values). The key light swings from the cold moon to a low orange sun at dusk to a warm high sun.
// The moon hangs in the north-west, over the morgue as seen from the plots: it back-lights the yard (rims, long
// shadows toward the camera, dark silhouettes), which is how a night reads; a moon behind the camera is flat.
export const MOON_DIR = new THREE.Vector3(-0.48, 0.5, 0.72).normalize();
// The sun stands in the south-east: 45 degrees to the side of a camera that looks at the morgue from the plots, so
// the morgue's front and everything in the yard is lit three-quarter and shadows fall away to the left.
export const SUN_AZ = new THREE.Vector3(0.72, 0, -0.69).normalize();
export const LANTERN_Y = 2.35; // height of the lantern flame above the ground
export const INK = '#120d1a'; // outline color
export const DAY = { value: 0 };
// The sun's shadow map (view/sun.js fills it every frame by day): every material that uses lightingGLSL shares
// these uniform objects — call shareLight(material) after creating it.
export const SUN = { uSunMap: { value: null }, uSunMat: { value: new THREE.Matrix4() }, uSunOn: { value: 0 }, uSunTexel: { value: 1 / 2048 }, uSunTime: { value: 0 }, uLightDbg: { value: 0 } };
export function shareLight(m) {
  m.uniforms.uDay = DAY;
  Object.assign(m.uniforms, SUN);
  return m;
}
const L = (v) => `vec3(${v.x.toFixed(4)}, ${v.y.toFixed(4)}, ${v.z.toFixed(4)})`;

// ---- JS twins of the day curves below (keep in sync with dayGLSL) ----
const sstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const clamp01 = (x) => Math.min(1, Math.max(0, x));
// three keys: night (k = 0), dusk (k = 0.5), day (k = 1)
export function day3(n, d, y, k = DAY.value) {
  k = clamp01(k);
  return k < 0.5 ? n + (d - n) * sstep(0, 0.5, k) : d + (y - d) * sstep(0.5, 1, k);
}
const _c3 = [new THREE.Color(), new THREE.Color(), new THREE.Color()];
// dayColor(['#night', '#dusk', '#day'], k, out): blend of three sRGB hex colors in linear space
export function dayColor(hex, k, out) {
  const [a, b, c] = hex.map((h, i) => _c3[i].set(h));
  return out.setRGB(day3(a.r, b.r, c.r, k), day3(a.g, b.g, c.g, k), day3(a.b, b.b, c.b, k));
}
export const lampsOn = (k = DAY.value) => 1 - sstep(0.45, 0.8, clamp01(k));
export function sunDir(k = DAY.value, out = new THREE.Vector3()) {
  const e = -0.08 + 0.64 * sstep(0.25, 1, clamp01(k));
  return out.set(SUN_AZ.x * Math.cos(e), Math.sin(e), SUN_AZ.z * Math.cos(e));
}
// The lighting rig (docs/lighting-guide.md): every light has a job. Linear multipliers of the surface color,
// each at [night, dusk, day].
export const RIG = {
  key: [[0.38, 0.52, 0.84], [1.25, 0.62, 0.26], [1.05, 0.86, 0.52]], // moon / low sun / sun: casts the shadows
  spill: [[0.05, 0.09, 0.2], [0.55, 0.18, 0.08], [0.3, 0.14, 0.05]], // softer, more saturated wrap past the terminator
  sky: [[0.13, 0.16, 0.36], [0.3, 0.24, 0.48], [0.34, 0.46, 0.74]], // the dome: on faces that look up
  bounce: [[0.08, 0.08, 0.2], [0.34, 0.22, 0.22], [0.4, 0.44, 0.22]], // off the lit ground: on faces that look down
  kick: [[0.05, 0.08, 0.18], [0.16, 0.12, 0.34], [0.1, 0.16, 0.3]], // sky light from opposite the key
  indoor: [[0.12, 0.11, 0.24], [0.3, 0.22, 0.3], [0.62, 0.52, 0.44]], // under the roof, instead of sky and bounce
};
const g3 = (b) => `day3(vec3(${b[0].join(', ')}), vec3(${b[1].join(', ')}), vec3(${b[2].join(', ')}))`;
const KEY = { dir: new THREE.Vector3(), lit: new THREE.Color(), shade: new THREE.Color() };
const _s = new THREE.Vector3();
// The key light for the current DAY.value: direction to the light, and what a face in full light and a face in
// shade get from the whole rig (linear, as in the GLSL). Returns the same object every call.
export function keyLight() {
  const k = clamp01(DAY.value);
  sunDir(k, _s);
  _s.y = Math.max(_s.y, 0.16);
  _s.normalize();
  // both ends are above the horizon, so the blend never passes through zero
  KEY.dir.copy(MOON_DIR).lerp(_s, sstep(0.2, 0.55, k)).normalize();
  const b = (x, i) => day3(x[0][i], x[1][i], x[2][i], k);
  const side = [0, 1, 2].map((i) => (b(RIG.sky, i) + b(RIG.bounce, i)) / 2); // a wall's share of sky and bounce
  KEY.lit.setRGB(...side.map((v, i) => v + b(RIG.key, i)));
  KEY.shade.setRGB(...side.map((v, i) => v + b(RIG.kick, i) * 0.5));
  return KEY;
}
// Day curves in GLSL; guarded so the ground and lighting libraries can both include it.
export const dayGLSL = /* glsl */ `
#ifndef XIOM_DAY
#define XIOM_DAY
uniform float uDay;
const vec3 MOON = ${L(MOON_DIR)};
const vec3 SUN_AZ = ${L(SUN_AZ)};
float dayK() { return clamp(uDay, 0.0, 1.0); }
float day3(float n, float d, float y) { float k = dayK(); return k < 0.5 ? mix(n, d, smoothstep(0.0, 0.5, k)) : mix(d, y, smoothstep(0.5, 1.0, k)); }
vec3 day3(vec3 n, vec3 d, vec3 y) { float k = dayK(); return k < 0.5 ? mix(n, d, smoothstep(0.0, 0.5, k)) : mix(d, y, smoothstep(0.5, 1.0, k)); }
// how much surfaces wear their daytime colors (dusk is mostly a change of light, not of paint)
float dayPaint() { return smoothstep(0.35, 0.9, dayK()); }
// 1 at dusk/dawn, 0 at full night and full day
float duskAmt() { return 1.0 - abs(dayK() * 2.0 - 1.0); }
float lampsOn() { return 1.0 - smoothstep(0.45, 0.8, dayK()); }
vec3 sunDir() {
  float e = -0.08 + 0.64 * smoothstep(0.25, 1.0, dayK());
  return vec3(SUN_AZ.x * cos(e), sin(e), SUN_AZ.z * cos(e));
}
vec3 keyDir() {
  vec3 s = sunDir();
  s.y = max(s.y, 0.16);
  return normalize(mix(MOON, normalize(s), smoothstep(0.2, 0.55, dayK())));
}
#endif
`;

// GLSL shared by every lit material (models, ground, backdrop).
// toonShade(base, N, worldPos)            — default rim
// toonShadeRim(base, N, worldPos, rim)    — rim strength 0..2
// rigNatural / rigPractical / nightEye    — the parts of the rig, for shaders with their own bands (characters)
export const lightingGLSL = /* glsl */ `
${dayGLSL}
// sun shadow: 1 in the sun, 0 in a cast shadow (always 1 at night and outside the shadow map)
uniform sampler2D uSunMap; uniform mat4 uSunMat; uniform float uSunOn; uniform float uSunTexel;
float sunShadow(vec3 w, vec3 N) {
  if (uSunOn <= 0.0) return 1.0;
  vec3 s = (uSunMat * vec4(w + N * 0.05, 1.0)).xyz * 0.5 + 0.5;
  if (s.x < 0.0 || s.y < 0.0 || s.x > 1.0 || s.y > 1.0 || s.z > 1.0) return 1.0;
  float z = s.z - 0.0012, t = uSunTexel, sh = 0.0;
  sh += step(z, texture2D(uSunMap, s.xy + vec2(-0.5, -0.5) * t).r);
  sh += step(z, texture2D(uSunMap, s.xy + vec2(0.5, -0.5) * t).r);
  sh += step(z, texture2D(uSunMap, s.xy + vec2(-0.5, 0.5) * t).r);
  sh += step(z, texture2D(uSunMap, s.xy + vec2(0.5, 0.5) * t).r);
  vec2 e = smoothstep(vec2(0.0), vec2(0.06), s.xy) * smoothstep(vec2(1.0), vec2(0.94), s.xy); // fade out at the edge
  return mix(1.0, sh * 0.25, uSunOn * e.x * e.y);
}
// small value noise of its own, so every material that includes the lighting has it under the same name
float lgHash(vec2 p) { vec3 q = fract(vec3(p.xyx) * 0.1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
float lgNoise(vec2 p) {
  vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(lgHash(i), lgHash(i + vec2(1.0, 0.0)), f.x), mix(lgHash(i + vec2(0.0, 1.0)), lgHash(i + vec2(1.0, 1.0)), f.x), f.y);
}
// Cloud shadows drifting over the land: a cookie on the key light, so the ground is never one value from fence to
// fence. The middle of the yard keeps most of its light (a light island around the plots and the door).
uniform float uSunTime;
float cloudCookie(vec3 w) {
  vec2 p = w.xz * 0.05 + uSunTime * vec2(0.011, 0.006);
  float n = lgNoise(p) * 0.62 + lgNoise(p * 2.3 + 7.1) * 0.38;
  float c = smoothstep(0.4, 0.56, n);
  float open = smoothstep(9.0, 24.0, length(w.xz - vec2(-1.0, 2.0)));
  return 1.0 - c * day3(0.62, 0.45, 0.42) * mix(0.45, 1.0, open);
}
// Sky and bounce light do not reach the foot of the morgue's walls: a soft dark seam where wall meets ground.
float contactAO(vec3 w) {
  vec2 q = abs(w.xz - vec2(${((MORGUE.x0 + MORGUE.x1) / 2).toFixed(2)}, ${((MORGUE.z0 + MORGUE.z1) / 2).toFixed(2)})) - vec2(${((MORGUE.x1 - MORGUE.x0) / 2).toFixed(2)}, ${((MORGUE.z1 - MORGUE.z0) / 2).toFixed(2)});
  float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0); // signed distance to the walls' rectangle
  return 1.0 - 0.4 * smoothstep(1.5, 0.0, abs(d)) * smoothstep(1.3, 0.0, w.y);
}
// A lantern is two lights (a practical's "throw pattern"): a hot pool under it and a wide, dim, redder spill.
const int NL = ${LANTERNS.length};
const vec3 LANTERN[NL] = vec3[](${LANTERNS.map(([x, z]) => `vec3(${x.toFixed(2)}, ${LANTERN_Y.toFixed(2)}, ${z.toFixed(2)})`).join(', ')});
vec3 lanternLight(vec3 w, vec3 N) {
  float on = lampsOn();
  if (on <= 0.0) return vec3(0.0);
  float g = 0.0, s = 0.0;
  for (int i = 0; i < NL; i++) {
    vec3 d = LANTERN[i] - w;
    float r2 = dot(d, d), r = sqrt(r2);
    float wrap = clamp(dot(N, d / (r + 1e-3)) * 0.6 + 0.4, 0.0, 1.0);
    g += wrap / (1.0 + r2 * 0.16) * smoothstep(11.0, 3.0, r);
    s += wrap * smoothstep(15.0, 4.0, r);
  }
  // two soft steps so lantern pools read as painted shapes, not a smooth gradient
  float q = smoothstep(0.05, 0.11, g) * 0.3 + smoothstep(0.22, 0.34, g) * 0.4 + g * 0.7;
  return (vec3(1.0, 0.6, 0.25) * q * 2.4 + vec3(1.0, 0.34, 0.1) * min(s, 1.5) * 0.11) * on;
}
// Lit windows and the open door throw their light out onto the wall and the ground in front of them.
const int NW = ${MORGUE.wins.length + 1};
const vec3 WINP[NW] = vec3[](${[...MORGUE.wins.map(([x, z, nx, nz]) => [x + nx * 0.45, 1.7, z + nz * 0.45]), [(MORGUE.door[0] + MORGUE.door[1]) / 2, 1.2, MORGUE.z0 - 0.7]].map((p) => `vec3(${p.map((v) => v.toFixed(2)).join(', ')})`).join(', ')});
const vec3 WINN[NW] = vec3[](${[...MORGUE.wins.map(([, , nx, nz]) => [nx, nz, 1]), [0, -1, 2.2]].map((p) => `vec3(${p.map((v) => v.toFixed(1)).join(', ')})`).join(', ')});
vec3 windowLight(vec3 w, vec3 N) {
  float on = lampsOn();
  if (on <= 0.0 || w.x < ${(MORGUE.x0 - 7).toFixed(1)} || w.x > ${(MORGUE.x1 + 7).toFixed(1)} || w.z < ${(MORGUE.z0 - 8).toFixed(1)} || w.z > ${(MORGUE.z1 + 7).toFixed(1)}) return vec3(0.0);
  float g = 0.0;
  for (int i = 0; i < NW; i++) {
    vec3 d = WINP[i] - w;
    float r2 = dot(d, d), r = sqrt(r2);
    float front = smoothstep(-0.1, 0.3, dot(w.xz - WINP[i].xz, WINN[i].xy) + 0.45); // only outside the wall
    float wrap = clamp(dot(N, d / (r + 1e-3)) * 0.6 + 0.4, 0.0, 1.0);
    g += WINN[i].z * wrap * front / (1.0 + r2 * 0.3) * smoothstep(6.5, 1.5, r);
  }
  return vec3(1.0, 0.64, 0.3) * (smoothstep(0.06, 0.12, g) * 0.25 + g) * 1.5 * on;
}
// Under the morgue's roof the sun and the moon barely reach: 1 inside the hall (a soft edge just inside the walls),
// 0 outside, so the walls' outer faces keep their light.
float roofed(vec3 w) {
  vec2 a = smoothstep(vec2(${(MORGUE.x0 + 0.15).toFixed(2)}, ${(MORGUE.z0 + 0.15).toFixed(2)}), vec2(${(MORGUE.x0 + 0.6).toFixed(2)}, ${(MORGUE.z0 + 0.6).toFixed(2)}), w.xz)
         * smoothstep(vec2(${(MORGUE.x1 - 0.15).toFixed(2)}, ${(MORGUE.z1 - 0.15).toFixed(2)}), vec2(${(MORGUE.x1 - 0.6).toFixed(2)}, ${(MORGUE.z1 - 0.6).toFixed(2)}), w.xz);
  return a.x * a.y * step(w.y, ${(MORGUE.h - 0.05).toFixed(2)});
}
// The hall's hanging lamps: warm pools on the floor, the tables and whoever stands under them. Always lit (dimmer by
// day, when the windows and the door let some daylight in).
const int NI = ${MORGUE.lamps.length};
const vec3 INDOOR[NI] = vec3[](${MORGUE.lamps.map(([x, z]) => `vec3(${x.toFixed(2)}, ${(MORGUE.h - 0.72).toFixed(2)}, ${z.toFixed(2)})`).join(', ')});
vec3 indoorLight(vec3 w, vec3 N) {
  float g = 0.0;
  for (int i = 0; i < NI; i++) {
    vec3 d = INDOOR[i] - w;
    float r2 = dot(d, d);
    float att = 1.0 / (1.0 + r2 * 0.35) * smoothstep(5.5, 1.2, sqrt(r2));
    float wrap = clamp(dot(N, d * inversesqrt(r2 + 1e-4)) * 0.6 + 0.4, 0.0, 1.0);
    g += att * wrap;
  }
  float q = smoothstep(0.08, 0.16, g) * 0.35 + smoothstep(0.3, 0.45, g) * 0.35 + g * 0.55; // painted steps, as outside
  return vec3(1.0, 0.62, 0.3) * q * day3(1.9, 1.7, 1.3);
}

// ---- the rig (docs/lighting-guide.md) ----
uniform float uLightDbg; // ?light=key|fill|practical: 1, 2, 3 show that part alone on grey
vec3 rigKey() { return ${g3(RIG.key)}; }
// Natural light on a face. lit and mid are the caller's own key bands (0..1, before shadows): lit where the face
// takes the key, mid on the wider band that still takes its spill. sh comes back as the key's shadow (0 in shadow).
//  key    the sun or the moon, through the cloud cookie and the shadow map
//  spill  a softer, more saturated wrap past the terminator and along shadow edges
//  sky    the dome on faces that look up, bounce off the ground on faces that look down, a kick from behind
vec3 rigNatural(vec3 N, vec3 w, float lit, float mid, out float sh) {
  sh = sunShadow(w, N);
  float ck = cloudCookie(w);
  vec3 kd = keyDir();
  vec3 fill = mix(${g3(RIG.bounce)} * mix(1.0, 0.55, smoothstep(0.0, 3.0, w.y)), ${g3(RIG.sky)}, smoothstep(0.15, 0.85, N.y * 0.5 + 0.5));
  fill += ${g3(RIG.kick)} * clamp(dot(N, normalize(vec3(-kd.x, 0.45, -kd.z))), 0.0, 1.0);
  fill *= contactAO(w);
  vec3 key = rigKey() * (lit * sh * ck)
           + ${g3(RIG.spill)} * ((mid * (1.0 - lit) * (0.35 + 0.65 * sh) + lit * 4.0 * sh * (1.0 - sh)) * ck);
  float rf = roofed(w);
  // under the roof: the hall's own soft light, and the sun where it comes in through the door and the hatch
  if (rf > 0.0) { fill = mix(fill, ${g3(RIG.indoor)}, rf); key *= 1.0 - 0.1 * rf; }
  if (uLightDbg > 0.5) return uLightDbg < 1.5 ? key : uLightDbg < 2.5 ? fill : vec3(0.0);
  return fill + key;
}
// Lamp light: lanterns, lit windows and the door outside; the hanging lamps inside.
vec3 rigPractical(vec3 N, vec3 w) {
  if (uLightDbg > 0.5 && uLightDbg < 2.5) return vec3(0.0);
  float rf = roofed(w);
  vec3 p = (lanternLight(w, N) + windowLight(w, N)) * (1.0 - rf);
  if (rf > 0.0) p += indoorLight(w, N) * rf;
  return p;
}
// By moonlight the eye loses color: chroma drops, reds go dark, blue-greens stay light (the Purkinje shift). Only
// the natural light is seen this way; lamp light keeps full color, which is what makes lamp-lit things pop.
vec3 nightEye(vec3 base) {
  if (uLightDbg > 0.5) return vec3(0.55);
  float n = 1.0 - smoothstep(0.1, 0.55, dayK());
  return mix(base, dot(base, vec3(0.12, 0.6, 0.28)) * vec3(0.84, 0.97, 1.14), 0.5 * n);
}
// What a lamp shows of a surface that wears night colors (the ground): its own warm, light self, not the blue the
// moon makes of it. Without this a lantern's pool on dark blue grass is nearly invisible.
vec3 lampBase(vec3 base) {
  float n = 1.0 - dayPaint();
  return mix(base, max(base.r, max(base.g, base.b)) * vec3(1.5, 1.2, 0.8), 0.7 * n);
}
// base: the surface color under natural light; lamp: its color under lamp light (the same, or lampBase(base))
vec3 toonShade2(vec3 base, vec3 lamp, vec3 N, vec3 w, float rimK) {
  float d = dot(N, keyDir());
  float lit = smoothstep(0.36, 0.44, d);
  float mid = smoothstep(-0.16, -0.08, d);
  float sh;
  vec3 nat = rigNatural(N, w, lit, mid, sh);
  vec3 V = normalize(cameraPosition - w);
  float rim = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 3.0) * (0.35 + 0.65 * mid * (0.4 + 0.6 * sh)) * (1.0 - 0.7 * roofed(w));
  vec3 rimCol = (base * 1.1 + 0.035) * day3(vec3(0.62, 0.74, 1.25), vec3(1.1, 0.62, 0.6), vec3(0.62, 0.6, 0.55));
  if (uLightDbg > 0.5) { rim = 0.0; lamp = vec3(0.55); }
  return nightEye(base) * nat + lamp * rigPractical(N, w) + rim * rimK * rimCol;
}
vec3 toonShadeRim(vec3 base, vec3 N, vec3 w, float rimK) { return toonShade2(base, base, N, w, rimK); }
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
uniform float uEmissive; uniform float uMottle; uniform float uRim; uniform float uLamp;
uniform vec3 uDayColor; uniform float uDayMix;
varying vec3 vN; varying vec3 vW; varying vec3 vO;
#include <common>
#include <fog_pars_fragment>
${noise}
${lightingGLSL}
void main() {
  vec3 N = normalize(vN);
  if (!gl_FrontFacing) N = -N;
  vec3 base = uColor;
  if (uDayMix > 0.0) base = mix(base, uDayColor, uDayMix * dayPaint());
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
  float em = uEmissive;
  if (uLamp > 0.0) { float on = lampsOn(); em *= on; base *= mix(0.4, 1.0, on); } // lamps go out by day
  vec3 col = mix(toonShadeRim(base, N, vW, uRim), base, em);
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
//   lamp             : true for lantern glass and flames: the emissive glow goes out by day
//   dayColor         : base color the surface drifts to by day (grass greens up); default none
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
      uLamp: { value: opts.lamp ? 1 : 0 },
      uDayColor: { value: new THREE.Color(opts.dayColor || color) },
      uDayMix: { value: opts.dayColor ? 1 : 0 },
    }]),
    vertexShader: vert, fragmentShader: frag, fog: true, side: opts.side || THREE.FrontSide,
  });
  shareLight(m);
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

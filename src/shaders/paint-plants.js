import * as THREE from 'three';
import { DAY, lightingGLSL } from './toon.js';
import { noise } from './noise.glsl.js';

// One painted material for every plant in the yard (grass, reeds, toadstools, ferns, ivy, leaves, pumpkins...).
// The plants are flat ribbons, cards and tiny lathes; the small detail is painted here from each piece's own
// coordinates, and cards are cut into leaves, fronds and flowers with discard (alpha test, never blending).
// Vertex attributes (see view/plants.js):
//   aCol   base color (linear)
//   aCol2  second color (linear): blade tips, toadstool spots, flower centers, leaf veins
//   aP     x = kind (see K), y = wind weight in meters (how far this vertex may sway), z = night glow, w = seed 0..1
//   uv     cards and ribbons: x = across (-1..1), y = along (0 at the base, 1 at the tip)
//          lathes: x = around (0..1), y = along the profile (0 at the bottom, 1 at the top)
// Lighting, lantern pools, fog and day/night come from the shared lightingGLSL and DAY uniform.
export const K = {
  blade: 0, // grass, reed and cattail leaves: dark base to light tip, a midrib
  seeds: 1, // seed-head card: a spike of grains cut out of the card
  plain: 2, // stems, twigs, cattail heads: mottled base color, darker toward the root
  cap: 3, // toadstool cap (lathe): spots in aCol2
  gills: 4, // the underside of a cap (disc, uv = polar): radial gills
  fern: 5, // fern frond card: leaflets cut out
  thistle: 6, // spiky thistle leaf card
  bloom: 7, // thistle head card: green bulb, purple bristles
  flower: 8, // round flower card: petals in aCol, center in aCol2
  puff: 9, // dandelion clock: white seeds around a dark center
  ivy: 10, // ivy leaf card: five pointed lobes, pale veins
  leaf: 11, // fallen leaf card: lobed, veins
  pumpkin: 12, // pumpkin (lathe): ribs
  foliage: 13, // bush leaf clump card: many small leaves cut out
  berries: 14, // bramble berry cluster card
};

const vert = /* glsl */ `
attribute vec3 aCol; attribute vec3 aCol2; attribute vec4 aP;
uniform float uTime;
varying vec3 vN; varying vec3 vW; varying vec3 vCol; varying vec3 vCol2; varying vec2 vUv;
flat varying vec4 vP;
#include <common>
#include <fog_pars_vertex>
void main() {
  vCol = aCol; vCol2 = aCol2; vP = aP; vUv = uv;
  vec4 w = modelMatrix * vec4(position, 1.0);
  // wind: two slow waves rolling across the yard plus a quick flutter, stronger toward the tips
  float gust = 0.55 + 0.45 * sin(uTime * 0.45 + w.x * 0.07 - w.z * 0.05);
  float ph = uTime * 1.6 + w.x * 0.35 + w.z * 0.22 + aP.w * 6.28;
  vec2 sway = vec2(sin(ph), cos(ph * 0.83 + 1.3) * 0.6) * gust + vec2(sin(uTime * 4.7 + aP.w * 40.0), 0.0) * 0.15;
  w.xz += sway * aP.y * 0.12;
  w.y -= dot(sway, sway) * aP.y * 0.02;
  vW = w.xyz;
  vN = normalize(mat3(modelMatrix) * normal);
  vec4 mvPosition = viewMatrix * w;
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}`;

const lin = (h) => { const c = new THREE.Color(h); return `vec3(${c.r.toFixed(4)}, ${c.g.toFixed(4)}, ${c.b.toFixed(4)})`; };

const frag = /* glsl */ `
varying vec3 vN; varying vec3 vW; varying vec3 vCol; varying vec3 vCol2; varying vec2 vUv;
flat varying vec4 vP;
#include <common>
#include <fog_pars_fragment>
${noise}
${lightingGLSL}
const vec3 INK = ${lin('#1b1420')};
float aaStep(float e, float x) { float aa = max(fwidth(x), 1e-4); return smoothstep(e - aa, e + aa, x); }
float line(float d, float w) { float aa = max(fwidth(d), 1e-4); return 1.0 - smoothstep(w - aa, w + aa, abs(d)); }
// radius of a leaf with n pointed lobes at angle a (0 = straight up the card)
float lobes(float a, float n, float sharp) { return pow(abs(cos(a * n * 0.5)), sharp); }

void main() {
  vec3 N = normalize(vN);
  if (!gl_FrontFacing) N = -N;
  int kind = int(vP.x + 0.5);
  vec2 uv = vUv;
  vec3 base = vCol;
  float rimK = 0.35, glow = 0.0;
  float seed = vP.w;

  if (kind == 0) {
    // blade: dark root, light tip, a faint midrib
    base = mix(vCol, vCol2, smoothstep(0.05, 0.95, uv.y));
    base *= 0.55 + 0.45 * smoothstep(0.0, 0.3, uv.y);
    base *= 1.0 - 0.18 * line(uv.x, 0.12) * (1.0 - uv.y);
  } else if (kind == 1) {
    // a spike of grains alternating left and right, the stalk running through
    float y = uv.y;
    float env = pow(sin(3.1416 * clamp(y, 0.0, 1.0)), 0.6);
    float g = fract(y * 7.0 + (uv.x > 0.0 ? 0.5 : 0.0));
    float grain = sin(g * 3.1416) * env * 0.95;
    if (abs(uv.x) > grain && abs(uv.x) > 0.1) discard;
    base = mix(vCol, vCol2, smoothstep(0.1, 0.9, g)) * (0.8 + 0.3 * y);
    base = mix(base, base * 0.6, smoothstep(0.6, 1.0, abs(uv.x) / max(grain, 0.1)));
  } else if (kind == 2) {
    base *= 0.85 + 0.3 * vnoise(vec2(uv.x * 9.0, uv.y * 14.0) + seed * 50.0);
    base *= 0.7 + 0.3 * smoothstep(0.0, 0.25, uv.y);
  } else if (kind == 3) {
    // toadstool cap: big pale spots, a darker rim
    vec2 c = vec2(uv.x * 7.0, uv.y * 3.2);
    vec2 ci = floor(c), cf = fract(c) - 0.5;
    float h = hash12(ci + seed * 17.0);
    vec2 o = (vec2(hash12(ci + 3.1), hash12(ci + 7.7)) - 0.5) * 0.45;
    float r = mix(0.18, 0.34, h) * (uv.y > 0.85 ? 0.6 : 1.0);
    float spot = h > 0.25 ? 1.0 - aaStep(r, length((cf - o) * vec2(1.0, 1.3))) : 0.0;
    base *= 0.75 + 0.35 * smoothstep(0.0, 0.6, uv.y);
    base = mix(base, vCol2, spot);
    rimK = 0.6;
    glow = vP.z;
  } else if (kind == 4) {
    // gills: thin dark lines fanning out from the stem
    float a = atan(uv.y, uv.x);
    float r = length(uv);
    base *= 1.0 - 0.35 * line(fract(a * 6.0) - 0.5, 0.18) * smoothstep(0.25, 0.4, r);
    base *= 0.75 + 0.25 * r;
    glow = vP.z * 0.6;
  } else if (kind == 5) {
    // fern frond: alternating leaflets angled toward the tip, each with little lobes
    float y = uv.y, ax = abs(uv.x);
    float side = uv.x > 0.0 ? 0.0 : 0.5;
    float len = (1.0 - y) * smoothstep(0.0, 0.25, y + 0.08) * 1.05;
    // slant the leaflets: shift y by how far out we are
    float yy = y - ax * 0.12;
    float k = fract(yy * 14.0 + side);
    float wid = 0.5 * (1.0 - ax / max(len, 1e-3)) * (0.75 + 0.25 * sin(ax * 40.0));
    bool rachis = ax < 0.05 * (1.0 - y);
    if (!rachis && (ax > len || abs(k - 0.5) > wid)) discard;
    base = mix(vCol, vCol2, 0.3 + 0.7 * ax / max(len, 0.2)) * (0.7 + 0.4 * y);
    if (rachis) base = vCol * 0.7;
  } else if (kind == 6) {
    // thistle leaf: lance shape with saw-tooth spikes, pale midrib and side veins
    float y = uv.y;
    float saw = fract(y * 5.0 + 0.3);
    float env = pow(sin(3.1416 * y), 0.8) * (0.45 + 0.55 * pow(saw, 1.5));
    if (abs(uv.x) > env) discard;
    float vein = line(uv.x, 0.06) + line(fract(y * 5.0 + abs(uv.x) * 0.5) - 0.5, 0.05) * 0.5;
    base = mix(vCol, vCol2, min(1.0, vein) * 0.8);
    base *= 0.8 + 0.3 * vnoise(uv * vec2(6.0, 18.0));
  } else if (kind == 7) {
    // thistle head: green bulb at the bottom, purple bristles fanning out on top
    vec2 c = vec2(uv.x, uv.y - 0.35);
    float bulb = length(c * vec2(1.0, 1.2));
    float a = atan(uv.x, uv.y - 0.4);
    float fan = uv.y > 0.45 ? smoothstep(0.0, 1.0, 1.0 - abs(a) / 1.1) : 0.0;
    float br = line(fract(a * 5.0) - 0.5, 0.25) * step(length(vec2(uv.x, uv.y - 0.4)), 0.62);
    if (bulb > 0.42 && (fan * br) < 0.5) discard;
    if (bulb <= 0.42) {
      base = vCol2 * (0.75 + 0.35 * vnoise(uv * 14.0));
      base = mix(base, INK, line(fract((uv.x + uv.y) * 6.0) - 0.5, 0.06) * 0.35);
    } else base = vCol * (0.8 + 0.4 * (uv.y - 0.4));
    glow = 0.0;
  } else if (kind == 8) {
    // round flower seen from any side: petals around a center
    vec2 c = vec2(uv.x, uv.y * 2.0 - 1.0);
    float r = length(c), a = atan(c.y, c.x);
    float n = 5.0 + floor(seed * 4.0) * 2.0;
    float pr = 0.55 + 0.45 * lobes(a + seed * 6.0, n, 0.6);
    if (r > pr) discard;
    base = mix(vCol, vCol2, 1.0 - aaStep(0.3, r));
    base *= 0.85 + 0.25 * r;
    rimK = 0.6;
  } else if (kind == 9) {
    // dandelion clock: a ragged white ball of seed lines around a dark center
    vec2 c = vec2(uv.x, uv.y * 2.0 - 1.0);
    float r = length(c), a = atan(c.y, c.x);
    float rag = 0.85 + 0.15 * hash12(vec2(floor(a * 7.0), seed * 9.0));
    if (r > rag) discard;
    float ray = line(fract(a * 3.8) - 0.5, 0.12);
    base = vCol * (0.8 + 0.25 * ray + 0.1 * smoothstep(0.5, 0.9, r));
    base = mix(vCol2, base, aaStep(0.14, r));
    rimK = 0.9;
  } else if (kind == 10 || kind == 11) {
    // ivy and fallen leaves: lobed outline measured from the leaf's heart near the stalk
    vec2 c = vec2(uv.x, uv.y * 2.0 - 0.75);
    float r = length(c), a = atan(c.x, c.y);
    float n = kind == 10 ? 5.0 : 5.0 + floor(seed * 2.0) * 2.0;
    float pr = kind == 10 ? 0.62 + 0.55 * lobes(a, n * 0.6, 2.0) : 0.55 + 0.7 * lobes(a, n * 0.55, 1.5) * (1.0 - 0.3 * abs(a) / 3.14);
    pr *= 1.0 - 0.15 * fract(a * 4.0) * float(kind == 11);
    bool stalk = abs(uv.x) < 0.05 && uv.y < 0.4;
    if (r > pr && !stalk) discard;
    float vein = line(fract((a + 3.1416) / 6.2832 * n + 0.5) - 0.5, 0.04) * smoothstep(0.05, 0.12, r) * (1.0 - smoothstep(0.6, 1.0, r / pr));
    base = mix(vCol, vCol2, vein * 0.8);
    base *= 0.82 + 0.3 * vnoise(c * 4.0 + seed * 20.0);
    if (kind == 10) base *= 0.85 + 0.3 * smoothstep(0.2, 0.9, r / pr);
    rimK = 0.5;
  } else if (kind == 12) {
    // pumpkin: deep ribs, lighter between them, darker toward the stalk and the ground
    float a = fract(uv.x * 9.0);
    float rib = abs(a - 0.5) * 2.0;
    base *= 0.6 + 0.5 * smoothstep(0.0, 0.8, 1.0 - rib);
    base = mix(base, vCol2, line(rib - 1.0, 0.1) * 0.6);
    base *= 0.7 + 0.3 * smoothstep(0.0, 0.3, uv.y) * smoothstep(1.0, 0.75, uv.y);
    base *= 0.92 + 0.15 * vnoise(vec2(uv.x * 30.0, uv.y * 8.0));
    rimK = 0.8;
  } else if (kind == 13) {
    // a clump of small leaves cut out of a round card
    vec2 c = vec2(uv.x, uv.y * 2.0 - 1.0);
    vec2 cc = c * 3.2 + seed * 7.0;
    vec2 ci = floor(cc), cf = fract(cc) - 0.5;
    float h = hash12(ci);
    float ang = h * 6.28;
    vec2 q = mat2(cos(ang), -sin(ang), sin(ang), cos(ang)) * cf;
    float leaf = length(q * vec2(1.0, 2.0));
    if (leaf > 0.48 || length(c) > 1.0 - 0.25 * h) discard;
    base = mix(vCol, vCol2, h) * (0.75 + 0.4 * (1.0 - leaf));
  } else if (kind == 14) {
    // bramble berries: a cluster of dark round drupes with a light glint
    vec2 c = vec2(uv.x, uv.y * 2.0 - 1.0);
    vec2 cc = c * 2.2 + 0.5;
    vec2 ci = floor(cc), cf = fract(cc) - 0.5;
    float d = length(cf);
    if (d > 0.42 || length(c) > 1.0 || hash12(ci + seed * 3.0) < 0.2) discard;
    base = mix(vCol, vCol2, 1.0 - aaStep(0.1, length(cf - vec2(-0.12, 0.14))));
    rimK = 1.0;
  }

  // night: the paint goes cool and grey, as the lawn does
  float dp = dayPaint();
  float lum = dot(base, vec3(0.3, 0.55, 0.15));
  vec3 night = mix(vec3(lum), base, 0.6) * vec3(0.7, 0.82, 1.0);
  base = mix(night, base, dp);
  vec3 col = toonShadeRim(base, N, vW, rimK);
  // a few toadstools glow at night
  if (glow > 0.0) col = mix(col, vCol * 1.4 + vec3(0.25, 0.12, 0.02), glow * (1.0 - dp) * 0.6);
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
  #include <fog_fragment>
}`;

// plantMaterial(): the single plant material; set uniforms.uTime.value once per frame for the wind.
export function plantMaterial() {
  const m = new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { uTime: { value: 0 } }]),
    vertexShader: vert, fragmentShader: frag, fog: true, side: THREE.DoubleSide,
  });
  m.uniforms.uDay = DAY;
  return m;
}

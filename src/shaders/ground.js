import * as THREE from 'three';
import { noise } from './noise.glsl.js';
import { lightingGLSL, dayGLSL, DAY } from './toon.js';
import { PLOTS, PLOT_HALF, ROAD_Z, ROAD_HALF, PATHS } from '../shared/layout.js';

const f = (v) => v.toFixed(2);
const srgb = (hex) => { const c = new THREE.Color(hex); return `vec3(${c.r.toFixed(4)}, ${c.g.toFixed(4)}, ${c.b.toFixed(4)})`; };

// Lawn, road and path colors as a GLSL library: the yard shader and the backdrop hills share it, so the grass
// runs on past the fence without a seam. Colors are linear. `px` is the pixel footprint in meters (from fwidth):
// every fine detail fades to its average as it shrinks below a pixel, instead of aliasing into shimmer, and the
// close-range details (clover, flowers, leaves, pebbles, prints) are skipped once they are too small to see.
// Gouache look: flat color areas, short blade-shaped strokes gathered in fan-shaped clumps, earth that grass
// strokes overlap at its ragged edge. dayPaint() mixes night (0) and day (1) colors: `dn(night, day)`.
const dn = (n, d) => `mix(${srgb(n)}, ${srgb(d)}, dp)`;
export const groundGLSL = /* glsl */ `
${dayGLSL}
${noise}
float fbm3(vec2 p) { return vnoise(p) * 0.57 + vnoise(p * 2.03 + 17.1) * 0.29 + vnoise(p * 4.1 + 31.7) * 0.14; }
vec2 rot2(vec2 p, float a) { float c = cos(a), s = sin(a); return vec2(c * p.x - s * p.y, s * p.x + c * p.y); }
// fade for a pattern of frequency k (cycles per meter) given the pixel footprint
float aaFade(float k, float px) { return 1.0 - smoothstep(0.18, 0.55, k * px); }
float segDist(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a, ba = b - a;
  return length(pa - ba * clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0));
}
// nearest footpath segment so far as (distance, along, across, index)
vec4 segNear(vec4 best, vec2 p, vec2 a, vec2 b, float idx) {
  vec2 pa = p - a, ba = b - a;
  float len = length(ba);
  vec2 t = ba / len;
  float u = dot(pa, t);
  float v = t.x * pa.y - t.y * pa.x;
  float d = length(vec2(u - clamp(u, 0.0, len), v));
  return d < best.x ? vec4(d, u, v, idx) : best;
}
float roadCenter(float x) { return ${f(ROAD_Z)} + sin(x * 0.05) * 0.45 + sin(x * 0.13 + 1.0) * 0.2; }
// light direction on the ground plane (moon by night, sun by day), for lit tops and cast rims of lumps
vec2 groundLight() { return normalize(mix(normalize(MOON.xz), SUN_AZ.xz, dayPaint())); }

// One layer of fan-shaped grass clumps on a jittered grid (cell size cs, blade half-width bw at the base). Each clump
// fans seven tapered, slightly bent blades out of a base point; the 2x2 nearest cells are tested.
// Returns (cover, tone): tone runs from 0 at a clump's base to 1 at the blade tips.
vec2 tuftLayer(vec2 p, float cs, float lean, float seed, float bw, float px) {
  vec2 c0 = floor(p / cs - 0.5);
  float cov = 0.0, ton = 0.0, top = -1.0;
  for (int j = 0; j < 4; j++) {
    vec2 cell = c0 + vec2(float(j & 1), float(j >> 1));
    vec3 h = hash32(cell + seed);
    float a = lean + (h.z - 0.5) * 2.0;
    vec2 dir = vec2(sin(a), cos(a));
    float L = cs * (0.75 + 0.35 * h.x);
    vec2 d = p - (cell + 0.5 + (h.xy - 0.5) * 0.6) * cs + dir * (L * 0.5);
    float y = dot(d, dir);
    if (y <= 0.0 || y >= L) continue;
    float s = (dir.y * d.x - dir.x * d.y) / y * 1.9; // slope across the fan, +-1 at its sides
    if (abs(s) >= 1.0) continue;
    float sl = (s * 0.5 + 0.5) * 7.0;
    float bi = floor(sl);
    float bh = hash12(cell * 1.37 + bi * 0.71 + seed);
    float bl = L * (0.4 + 0.6 * bh);
    float t = y / bl;
    if (t >= 1.0) continue;
    float slot = y * (2.0 / 7.0 / 1.9);
    float off = (fract(sl) - 0.5) * slot + (bh - 0.5) * 0.5 * slot * t;
    float hw = bw * (1.0 - t * t * 0.3) * (1.0 - t);
    float c = smoothstep(hw + px * 0.75, hw - px * 0.75, abs(off));
    if (c <= 0.0) continue;
    // a per-clump depth keeps the overlap order the same whichever cell is tested first
    float pr = fract(h.x * 7.13 + h.y * 3.71);
    float nc = c + cov * (1.0 - c);
    if (pr > top) { ton = (t * c + ton * cov * (1.0 - c)) / nc; top = pr; }
    else ton = (ton * cov + t * c * (1.0 - cov)) / nc;
    cov = nc;
  }
  return vec2(cov, ton);
}

// a round lump in a jittered cell (cell size cs, radius up to rr cells): (body, lit side 0..1, cast rim)
vec3 lumps(vec2 p, float cs, float prob, float rr, float seed, float px) {
  vec2 g = p / cs;
  vec2 cell = floor(g);
  vec3 h = hash32(cell + seed);
  if (h.z > prob) return vec3(0.0, 0.5, 0.0);
  float r = rr * (0.45 + 0.55 * h.x);
  vec2 d = (g - cell - 0.5 - (h.xy - 0.5) * (1.0 - 2.4 * r)) / r;
  float rl = 1.0 + 0.13 * sin(d.x * 2.7 + h.y * 6.3) * cos(d.y * 2.3 + h.x * 6.3); // lumpy outline
  float l = length(d) / rl;
  float aa = px / (cs * r) + 0.04;
  vec2 L = groundLight();
  float body = smoothstep(1.0 + aa, 1.0 - aa, l);
  float lit = smoothstep(-0.7, 0.8, dot(d, L) + 0.25 * (1.0 - l));
  float rim = smoothstep(1.0 + aa, 1.0 - aa, length(d + L * 0.32) / rl) * (1.0 - body);
  return vec3(body, lit, rim);
}

// painted lawn; where bare > 0 the earth color shows between the strokes and only blade tips reach over it
vec3 lawnOn(vec2 p, float px, vec3 earth, float bare) {
  float dp = dayPaint();
  float n1 = fbm3(p * 0.045);
  float n2 = vnoise(p * 0.16 + 5.3);
  float n3 = vnoise(p * 0.11 - 7.3);
  float lit = smoothstep(0.3, 0.72, n1);       // big lighter and darker patches
  float yel = smoothstep(0.55, 0.8, n2);       // yellower green
  float dry = smoothstep(0.74, 0.88, n3);      // dry straw over bare earth
  vec3 gap = mix(${dn('#13201f', '#3a5822')}, ${dn('#1a2b2b', '#50742e')}, lit);
  vec3 bBase = mix(${dn('#1c2e2e', '#46692a')}, ${dn('#243a38', '#5c8234')}, lit);
  vec3 bTip = mix(${dn('#48666a', '#86a846')}, ${dn('#62827f', '#a4c25a')}, lit);
  bBase = mix(bBase, ${dn('#26322e', '#6a7630')}, yel * 0.55);
  bTip = mix(bTip, ${dn('#6e8078', '#c0bc62')}, yel * 0.55);
  gap = mix(gap, ${dn('#262226', '#8c7250')}, dry * 0.85);
  bBase = mix(bBase, ${dn('#35362f', '#94824c')}, dry);
  bTip = mix(bTip, ${dn('#7e8278', '#d4c080')}, dry);
  float bareG = smoothstep(0.3, 0.6, bare);
  vec3 col = mix(gap, earth, bareG);
  float lean = vnoise(p * 0.04 + 3.0) * 7.0; // clumps lean along slow swirls
  // big clumps, then clover, then small clumps on top
  float fA = aaFade(16.0, px);
  vec2 tA = vec2(0.36, 0.45);
  if (fA > 0.0) tA = mix(tA, tuftLayer(p, 0.45, lean, 0.0, 0.032, px), fA);
  tA.x *= smoothstep(0.62, 0.42, bare - 0.45 * tA.y) * (1.0 - dry * 0.3);
  col = mix(col, mix(bBase * 0.9, bTip, smoothstep(0.05, 1.0, tA.y)), tA.x);
  if (px < 0.022) {
    float cp = smoothstep(0.66, 0.74, vnoise(p * 0.55 + 3.1)) * (1.0 - bareG) * (1.0 - dry) * aaFade(25.0, px);
    if (cp > 0.0) {
      vec2 g = p / 0.11, cell = floor(g);
      vec3 h = hash32(cell + 41.0);
      vec2 d = rot2((g - cell - 0.5 - (h.xy - 0.5) * 0.25) * 0.11, h.z * 40.0);
      float rr = 0.015 + 0.006 * h.x;
      float m = min(length(d - vec2(0.0, rr)), min(length(d - vec2(-0.866, -0.5) * rr), length(d - vec2(0.866, -0.5) * rr)));
      float leaf = smoothstep(rr + px, rr - px, m) * step(h.z, 0.6);
      vec3 cc = mix(${dn('#3e605c', '#7cb24e')}, ${dn('#1a3230', '#3a6e2a')}, smoothstep(0.35, 1.0, m / rr));
      col = mix(col, cc, leaf * cp);
    }
  }
  float fB = aaFade(31.0, px);
  vec2 tB = vec2(0.36, 0.45);
  if (fB > 0.0) tB = mix(tB, tuftLayer(p, 0.23, lean + 0.5, 17.0, 0.016, px), fB);
  tB.x *= smoothstep(0.62, 0.42, bare - 0.45 * tB.y) * (1.0 - dry * 0.3);
  col = mix(col, mix(bBase, bTip * 1.08, smoothstep(0.05, 1.0, tB.y)), tB.x * 0.9);
  // a few white and pink flower dots
  if (px < 0.018) {
    vec2 g = p / 0.4, cell = floor(g);
    vec3 h = hash32(cell + 63.0);
    if (h.z < 0.08 * (1.0 - bareG)) {
      vec2 d = (g - cell - 0.5 - (h.xy - 0.5) * 0.6) * 0.4;
      float r = 0.013 * (0.85 + 0.25 * cos(5.0 * atan(d.y, d.x) + h.x * 9.0));
      float l = length(d);
      float fl = smoothstep(r + px, r - px, l) * aaFade(30.0, px);
      vec3 pc = h.x > 0.55 ? ${dn('#8a7c96', '#f0a8c0')} : ${dn('#a8acc0', '#f4f0e4')};
      col = mix(col, mix(${dn('#a09a70', '#f0c840')}, pc, smoothstep(0.003, 0.005, l)), fl);
    }
  }
  // a few orange fallen leaves
  if (px < 0.039) {
    vec2 g = p / 0.9, cell = floor(g);
    vec3 h = hash32(cell + 87.0);
    if (h.z < 0.1) {
      vec2 d = rot2((g - cell - 0.5 - (h.xy - 0.5) * 0.7) * 0.9, h.x * 6.28);
      float a = d.x / 0.07;
      float w = 0.028 * (1.0 - a * a) * (1.0 + 0.15 * sin(a * 9.0));
      float lf = smoothstep(w + px, w - px, abs(d.y)) * step(abs(a), 1.0) * aaFade(14.0, px);
      vec3 lc = mix(${dn('#3e2c34', '#c4501e')}, ${dn('#5c4038', '#e8902c')}, h.y);
      lc *= 1.0 - 0.35 * smoothstep(px + 0.002, 0.0, abs(d.y)); // midrib
      col = mix(col, lc, lf);
    }
  }
  // drifts of low mist (by night)
  col = mix(col, ${srgb('#4a4466')}, smoothstep(0.55, 0.8, vnoise(p * 0.025 + 21.0)) * 0.13 * (1.0 - dp));
  return col;
}
vec3 lawn(vec2 p, float px) { return lawnOn(p, px, vec3(0.0), 0.0); }

// trodden footpath earth with pebbles and boot prints; sg = nearest path segment (distance, along, across, index)
vec3 pathEarth(vec2 p, vec4 sg, float wn, float px) {
  float dp = dayPaint();
  vec3 col = mix(${dn('#2c2226', '#74563c')}, ${dn('#3c3032', '#957352')}, smoothstep(0.3, 0.8, wn));
  col = mix(col, ${dn('#463a3a', '#a88a66')}, smoothstep(0.45, 0.0, sg.x) * 0.35); // pale trodden middle
  if (px < 0.05) {
    float st = 0.34;
    float k = floor(sg.y / st);
    float h = hash12(vec2(k, sg.w * 7.0 + 1.0));
    if (h < 0.42) {
      float side = mod(k, 2.0) < 1.0 ? -1.0 : 1.0;
      vec2 q = vec2(sg.y - (k + 0.5) * st, sg.z - side * 0.12 - (h - 0.2) * 0.15);
      q.x *= h < 0.15 ? -1.0 : 1.0; // someone walked the other way
      q = rot2(q, (h - 0.2) * 0.6);
      float sh = min(length((q - vec2(0.045, 0.0)) / vec2(0.085, 0.045)), length((q - vec2(-0.1, 0.0)) / vec2(0.042, 0.04)));
      float aa = px * 22.0 + 0.04;
      float inside = smoothstep(1.0 + aa, 1.0 - aa, sh);
      float lip = smoothstep(1.4, 1.0, sh) * (1.0 - inside);
      float tread = (0.5 + 0.5 * sin(q.x * 170.0)) * aaFade(27.0, px);
      float f = aaFade(11.0, px);
      col *= 1.0 + lip * 0.18 * f;
      col *= 1.0 - inside * (0.38 + 0.14 * tread) * f;
    }
  }
  if (px < 0.055) {
    vec3 pb = lumps(p, 0.24, 0.17, 0.26, 3.0, px);
    float f = aaFade(10.0, px);
    vec3 stone = mix(${dn('#34323e', '#6a6058')}, ${dn('#7c7a90', '#c4baa8')}, pb.y);
    col *= 1.0 - pb.z * 0.5 * f;
    col = mix(col, stone, pb.x * f);
  }
  return col;
}

// dark dug-over soil around the plots: clods and small stones
vec3 soilTop(vec2 p, float px) {
  float dp = dayPaint();
  vec3 col = mix(${dn('#140f12', '#2a1c14')}, ${dn('#221a1c', '#42301f')}, vnoise(p * 1.7));
  if (px < 0.11) {
    float f1 = aaFade(5.0, px);
    vec3 c1 = lumps(p, 0.26, 0.6, 0.33, 11.0, px);
    col *= 1.0 - c1.z * 0.5 * f1;
    col = mix(col, mix(${dn('#1c1518', '#33231a')}, ${dn('#3a3034', '#6a4c34')}, c1.y), c1.x * f1);
    float f2 = aaFade(9.0, px);
    vec3 c2 = lumps(p + 0.07, 0.13, 0.5, 0.3, 23.0, px);
    col *= 1.0 - c2.z * 0.4 * f2;
    col = mix(col, mix(${dn('#1a1416', '#2e2018')}, ${dn('#342a2e', '#5c4230')}, c2.y), c2.x * f2);
    vec3 c3 = lumps(p, 0.17, 0.13, 0.2, 37.0, px);
    float f3 = aaFade(12.0, px);
    col *= 1.0 - c3.z * 0.5 * f3;
    col = mix(col, mix(${dn('#3a3848', '#6a6458')}, ${dn('#8a88a0', '#c8c0b0')}, c3.y), c3.x * f3);
  }
  return col;
}

// rutted dirt road along z = ROAD_Z; returns color, w = coverage; bare = how much grass gives way to it
// (the grassy hump between the ruts keeps its strokes, puddles push them away entirely)
vec4 road(vec2 p, float px, out float bare) {
  float dp = dayPaint();
  float dz = p.y - roadCenter(p.x);
  float e1 = vnoise(p * vec2(0.7, 1.5)), e2 = vnoise(p * 3.0);
  float cover = smoothstep(${f(ROAD_HALF + 0.35)}, ${f(ROAD_HALF - 0.35)}, abs(dz) + (e1 - 0.5) * 0.9 + (e2 - 0.5) * 0.3);
  vec3 col = mix(${dn('#2a2024', '#6a4a30')}, ${dn('#3c3032', '#8c6842')}, smoothstep(0.2, 0.8, vnoise(p * vec2(0.15, 0.5))));
  float streak = vnoise(vec2(p.x * 0.6, dz * 9.0));
  col *= 1.0 + (streak - 0.5) * 0.25 * aaFade(9.0, px);
  // two ruts with tread marks and raised, lit lips
  float rd = abs(abs(dz) - 0.95 + (e2 - 0.5) * 0.1);
  float rut = smoothstep(0.27, 0.15, rd);
  col = mix(col, ${dn('#1c1418', '#4a3020')}, rut * 0.8);
  float tr = fract(p.x * 4.0 + rd * 3.0);
  col *= 1.0 + rut * (smoothstep(0.3, 0.45, tr) - smoothstep(0.7, 0.85, tr) - 0.4) * 0.4 * aaFade(8.0, px);
  col = mix(col, ${dn('#4a3c3c', '#a88058')}, smoothstep(0.09, 0.0, abs(rd - 0.33)) * 0.55 * aaFade(5.0, px));
  // clods
  if (px < 0.11) {
    vec3 c = lumps(p, 0.3, 0.35, 0.3, 51.0, px);
    float fc = aaFade(5.0, px) * (1.0 - rut * 0.6);
    col *= 1.0 - c.z * 0.45 * fc;
    col = mix(col, mix(${dn('#221a1e', '#4e3422')}, ${dn('#4a3c3e', '#9a7450')}, c.y), c.x * fc);
  }
  // standing puddles in the ruts that mirror the sky, with a pale rim
  float pn = vnoise(p * vec2(0.3, 1.2) + 4.0) * 0.7 + e1 * 0.3;
  float pw = max(px * 1.5, 0.01);
  float wet = rut * smoothstep(0.58 - pw, 0.58 + pw, pn);
  float edge = rut * smoothstep(0.54, 0.575, pn) * (1.0 - smoothstep(0.585, 0.62, pn));
  vec3 sky = mix(${dn('#4a4272', '#7c9ec4')}, ${dn('#7e74a8', '#aac6de')}, smoothstep(0.3, 0.8, streak));
  col = mix(col, ${dn('#a8a0cc', '#e2eaee')}, edge * 0.55);
  col = mix(col, sky, wet);
  // the hump between the ruts keeps a ragged strip of grass
  float hump = smoothstep(0.55, 0.2, abs(dz)) * smoothstep(0.35, 0.6, vnoise(p * vec2(0.6, 2.0) + 2.0));
  bare = cover * (1.0 - hump * 0.85) + wet;
  return vec4(col, cover);
}

// lawn + worn paths + road + dug soil (trample, 0..1) for any point of the ground plane
vec3 groundTopEx(vec2 p, float px, float trample) {
  vec3 earth = vec3(0.0);
  float bare = 0.0;
  vec4 sg = vec4(1e9, 0.0, 0.0, 0.0);
  ${PATHS.map(([ax, az, bx, bz], i) => `sg = segNear(sg, p, vec2(${f(ax)}, ${f(az)}), vec2(${f(bx)}, ${f(bz)}), ${i}.0);`).join('\n  ')}
  if (sg.x < 0.95) {
    float wn = vnoise(p * 1.3) * 0.6 + vnoise(p * 4.0) * 0.4;
    float wear = smoothstep(0.3, 0.75, smoothstep(0.95, 0.15, sg.x) * (0.45 + wn * 0.85));
    if (wear > 0.0) { earth = pathEarth(p, sg, wn, px); bare = wear; }
  }
  if (abs(p.y - ${f(ROAD_Z)}) < ${f(ROAD_HALF + 2.5)}) {
    float rb;
    vec4 r = road(p, px, rb);
    earth = bare > 0.0 ? mix(earth, r.rgb, r.w) : r.rgb;
    bare = max(bare, rb);
  }
  if (trample > 0.0) {
    vec3 s = soilTop(p, px);
    earth = bare > 0.0 ? mix(earth, s, trample) : s;
    bare = max(bare, trample);
  }
  return lawnOn(p, px, earth, bare);
}
vec3 groundTop(vec2 p, float px) { return groundTopEx(p, px, 0.0); }
`;

// World-space ground shader: painterly lawn, rutted road, worn paths, trampled earth and dashed outlines around
// open plots, and layered soil (strata, stones, roots) below y = 0 on the walls and floor of the holes.
export function groundMaterial() {
  const PH = [PLOT_HALF.x, PLOT_HALF.z];
  const m = new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { uPlotState: { value: new Float32Array(PLOTS.length) } }]),
    vertexShader: /* glsl */ `
      varying vec3 vW; varying vec3 vN;
      #include <common>
      #include <fog_pars_vertex>
      void main() {
        vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz;
        vN = normalize(mat3(modelMatrix) * normal);
        vec4 mvPosition = viewMatrix * w;
        gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }`,
    fragmentShader: /* glsl */ `
      uniform float uPlotState[${PLOTS.length}];
      varying vec3 vW; varying vec3 vN;
      #include <common>
      #include <fog_pars_fragment>
      ${groundGLSL}
      ${lightingGLSL}
      const vec2 PLOT[${PLOTS.length}] = vec2[](${PLOTS.map((p) => `vec2(${f(p.x)}, ${f(p.z)})`).join(', ')});
      const vec2 PH = vec2(${f(PH[0])}, ${f(PH[1])});

      // soil strata seen on the walls (uv = along-wall, y) and floor of a hole
      vec3 soil(vec2 uv, float y, float px, bool floorFace) {
        float w = y + (vnoise(vec2(uv.x * 0.9, 0.0)) - 0.5) * 0.22 + (vnoise(vec2(uv.x * 4.0, 3.0)) - 0.5) * 0.05;
        float e = max(px * 1.5, 0.01);
        vec3 col = ${srgb('#2b1f27')};
        col = mix(col, ${srgb('#4a3138')}, smoothstep(-1.02 - e, -1.02 + e, w));
        col = mix(col, ${srgb('#8a7790')}, smoothstep(-0.9 - e, -0.9 + e, w) * 0.85); // lavender clay
        col = mix(col, ${srgb('#6a4436')}, smoothstep(-0.78 - e, -0.78 + e, w)); // rusty brown
        col = mix(col, ${srgb('#b39566')}, smoothstep(-0.5 - e, -0.5 + e, w)); // ochre band
        col = mix(col, ${srgb('#d9c7a2')}, smoothstep(-0.44 - e, -0.44 + e, w) * 0.8); // cream
        col = mix(col, ${srgb('#4d3346')}, smoothstep(-0.38 - e, -0.38 + e, w)); // purple loam
        col = mix(col, ${srgb('#2e2228')}, smoothstep(-0.14 - e, -0.14 + e, w)); // dark topsoil
        // dabbed texture inside the bands
        col *= 0.88 + 0.24 * vnoise(uv * vec2(3.0, 7.0) + y * 2.0);
        if (floorFace) col = mix(${srgb('#33242a')}, ${srgb('#4a3533')}, vnoise(uv * 2.5)) * (0.9 + 0.2 * vnoise(uv * 9.0));
        // embedded stones: one per cell at most, with a lit top and a dark rim
        vec2 sp = vec2(uv.x, floorFace ? uv.y : y) * 4.0;
        vec2 cell = floor(sp);
        vec2 c = cell + 0.25 + 0.5 * vec2(hash12(cell), hash12(cell + 7.1));
        float r = 0.14 + 0.16 * hash12(cell + 3.3);
        vec2 d = (sp - c) / vec2(1.25, 0.85);
        float sd = length(d) - r;
        float stone = step(floorFace ? 0.86 : 0.62, hash12(cell + 1.9)) * (floorFace ? 1.0 : step(y, -0.18));
        float ein = 4.0 * px * 1.5 + 0.02;
        vec3 stoneCol = mix(${srgb('#5a5470')}, ${srgb('#9d96b0')}, smoothstep(-0.1, 0.25, d.y / r * 0.4 + 0.1));
        col = mix(col, ${srgb('#1a1220')}, stone * smoothstep(0.06 + ein, 0.06 - ein, sd) * 0.8);
        col = mix(col, stoneCol, stone * smoothstep(ein, -ein, sd));
        // pale roots hanging through the top half
        if (!floorFace) for (int i = 0; i < 3; i++) {
          float fi = float(i);
          float ry = -0.1 - 0.13 * fi + 0.07 * sin(uv.x * 4.7 + fi * 2.1) + 0.03 * sin(uv.x * 13.0 + fi * 5.0);
          float on = smoothstep(0.45, 0.55, vnoise(vec2(uv.x * 1.4 + fi * 9.0, fi)));
          float rw = 0.012 + 0.008 * sin(uv.x * 9.0 + fi);
          col = mix(col, ${srgb('#9c7f68')}, on * smoothstep(rw + e, rw - e, abs(y - ry)) * 0.85);
        }
        // the hole gets darker toward the bottom
        return col * (0.5 + 0.5 * smoothstep(-1.5, -0.05, y));
      }

      void main() {
        vec3 N = normalize(vN);
        vec2 p = vW.xz;
        vec2 dp = fwidth(p);
        // close to the max footprint: with the min footprint, detail aliases along the view direction at grazing
        // angles and reads as streaks radiating from the camera
        float px = mix(min(dp.x, dp.y), max(max(dp.x, dp.y), fwidth(vW.y)), 0.85);
        vec3 col;
        if (vW.y < -0.02) {
          bool floorFace = N.y > 0.5;
          vec2 uv = floorFace ? p : vec2(abs(N.x) > 0.5 ? p.y : p.x, 0.0);
          col = soil(uv, vW.y, px, floorFace);
        } else {
          float tn = vnoise(p * 2.2) * 0.5 + vnoise(p * 0.8) * 0.5;
          float trample = 0.0, line = 0.0;
          for (int i = 0; i < ${PLOTS.length}; i++) {
            vec2 d = abs(p - PLOT[i]) - PH;
            float out_ = max(d.x, d.y);
            // trampled, dug-over earth around every plot
            trample = max(trample, smoothstep(0.75, 0.05, out_ + (tn - 0.5) * 0.7));
            // dashed outline while the plot is still to be dug
            if (uPlotState[i] < 0.5) {
              float edge = abs(out_ - 0.1);
              float ew = max(px, 0.006);
              float dk = (d.x > d.y ? p.y : p.x) * 2.5;
              float daa = fwidth(dk);
              float dash = smoothstep(-daa, daa, abs(fract(dk) - 0.5) - 0.2);
              dash = mix(dash, 0.6, smoothstep(0.3, 0.6, daa));
              line = max(line, smoothstep(0.03 + ew, 0.03 - ew, edge) * dash);
            }
          }
          col = groundTopEx(p, px, smoothstep(0.1, 0.85, trample));
          col = mix(col, ${srgb('#8c7464')}, line * 0.75);
        }
        gl_FragColor = vec4(toonShade(col, N, vW), 1.0);
        #include <colorspace_fragment>
        #include <fog_fragment>
      }`,
    fog: true,
  });
  m.uniforms.uDay = DAY; // shared day/night uniform (see toon.js)
  return m;
}

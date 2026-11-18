import * as THREE from 'three';
import { noise } from './noise.glsl.js';
import { lightingGLSL, dayGLSL, DAY } from './toon.js';
import { PLOTS, PLOT_HALF, ROAD_Z, ROAD_HALF, PILE, TRUCK_STOP_X } from '../shared/layout.js';

const f = (v) => v.toFixed(2);
const srgb = (hex) => { const c = new THREE.Color(hex); return `vec3(${c.r.toFixed(4)}, ${c.g.toFixed(4)}, ${c.b.toFixed(4)})`; };

// Worn footpaths (segment endpoints) between where the work happens: truck bed, coffin pile, the plot rows.
const BED_X = TRUCK_STOP_X + 3.2;
const PATHS = [
  [BED_X, ROAD_Z - 2.4, PILE.x + 1.5, PILE.z + 0.6], // truck -> coffin pile
  [PILE.x + 1, PILE.z - 0.8, -6.5, 5.2], // pile -> plots
  [BED_X - 2, ROAD_Z - 2.5, 0.5, 5.4], // truck -> plots
  [-10.5, 0.4, 8.5, 0.4], // walkway between the two rows
  [0, 4.8, 0, -6.5], // to the back lantern and the old stones
];

// Lawn, road and path colors as a GLSL library: the yard shader and the backdrop hills share it, so the grass
// runs on past the fence without a seam. Colors are linear. `px` is the pixel footprint in meters (from fwidth):
// every fine detail fades to its average as it shrinks below a pixel, instead of aliasing into shimmer.
// By day (dayPaint() -> 1) the lawn greens up and earth and road warm and lighten.
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
float roadCenter(float x) { return ${f(ROAD_Z)} + sin(x * 0.05) * 0.45 + sin(x * 0.13 + 1.0) * 0.2; }

// painterly night lawn: big soft color patches, brush-stroke grass marks, mist-colored drifts
vec3 lawn(vec2 p, float px) {
  float n1 = fbm3(p * 0.045);
  float n2 = fbm3(p * 0.13 + 5.3);
  float n3 = vnoise(p * 0.085 - 11.7) * 0.7 + vnoise(p * 0.3) * 0.3;
  float dp = dayPaint();
  vec3 col = mix(mix(${srgb('#232a2e')}, ${srgb('#4a5f3c')}, dp), mix(${srgb('#36433f')}, ${srgb('#6b8152')}, dp), smoothstep(0.32, 0.68, n1));
  col = mix(col, mix(${srgb('#4a5440')}, ${srgb('#9c9f6a')}, dp), smoothstep(0.55, 0.78, n2) * 0.55); // mossy lighter patches
  col = mix(col, mix(${srgb('#382c40')}, ${srgb('#6e5a72')}, dp), smoothstep(0.56, 0.74, n3) * mix(0.65, 0.45, dp)); // purple heather
  // brush strokes: elongated noise whose direction swirls slowly across the lawn
  float a = vnoise(p * 0.04 + 3.0) * 7.0;
  vec2 q = rot2(p, a);
  // short dabs, not long swoops: long ones read as rippling water
  float k1 = 9.0, k2 = 26.0;
  float s1 = smoothstep(0.55, 0.85, vnoise(q * vec2(5.0, k1)));
  float s2 = smoothstep(0.55, 0.9, vnoise(rot2(p, a + 0.9) * vec2(14.0, k2) + 7.0));
  float m = (s1 - 0.2) * 0.24 * aaFade(k1, px) - (s2 - 0.17) * 0.2 * aaFade(k2, px);
  col *= 1.0 + m;
  // pale grass tips catching the moon, only up close
  float tip = smoothstep(0.82, 0.95, vnoise(rot2(p, a + 0.3) * vec2(14.0, 34.0)));
  col += mix(${srgb('#7d8670')}, ${srgb('#d6dc8a')}, dp) * tip * 0.14 * aaFade(34.0, px);
  // drifts of low mist (by night)
  col = mix(col, ${srgb('#4a4466')}, smoothstep(0.55, 0.8, vnoise(p * 0.025 + 21.0)) * 0.15 * (1.0 - dp));
  return col;
}

// soft-edged dirt, mottled like dabbed paint
vec3 dirt(vec2 p, float px) {
  vec3 col = mix(${srgb('#35262a')}, ${srgb('#4f3a33')}, smoothstep(0.3, 0.7, fbm3(p * 0.6)));
  col = mix(col, ${srgb('#5e4740')}, smoothstep(0.6, 0.8, vnoise(p * 3.1)) * 0.5 * aaFade(3.1, px));
  float pebble = smoothstep(0.86, 0.93, vnoise(p * 11.0)) * aaFade(11.0, px);
  col += ${srgb('#6a5f74')} * pebble * 0.35;
  return col * mix(vec3(1.0), vec3(1.9, 1.6, 1.25), dayPaint()); // sunny earth is warm brown, not plum
}

// rutted dirt road along z = ROAD_Z; returns color, w = coverage
vec4 road(vec2 p, vec3 under, float px) {
  float dz = p.y - roadCenter(p.x);
  float edgeN = (vnoise(p * vec2(0.7, 1.5)) - 0.5) * 0.9 + (vnoise(p * 3.0) - 0.5) * 0.3;
  float cover = smoothstep(${f(ROAD_HALF + 0.35)}, ${f(ROAD_HALF - 0.35)}, abs(dz) + edgeN);
  vec3 col = mix(${srgb('#362b2f')}, ${srgb('#4a3d3c')}, smoothstep(0.25, 0.75, fbm3(p * vec2(0.15, 0.5))));
  // wheel streaks run along the road
  col *= 1.0 + (vnoise(vec2(p.x * 0.6, dz * 9.0)) - 0.5) * 0.3 * aaFade(9.0, px);
  col *= 1.0 + (smoothstep(0.55, 0.8, vnoise(p * 2.6)) - 0.15) * 0.3 * aaFade(2.6, px); // clods
  // two ruts with standing puddles that mirror the sky
  float rd = abs(abs(dz) - 0.95);
  float rut = smoothstep(0.42, 0.12, rd + (vnoise(p * 0.9) - 0.5) * 0.12);
  col = mix(col, ${srgb('#2a2026')}, rut * 0.75);
  float puddle = rut * smoothstep(0.66, 0.74, fbm3(p * vec2(0.22, 0.9) + 4.0));
  col *= mix(vec3(1.0), vec3(1.8, 1.55, 1.3), dayPaint());
  col = mix(col, mix(${srgb('#4c4868')}, ${srgb('#a9c2d8')}, dayPaint()), puddle * 0.7); // puddles mirror the sky
  // the hump between the ruts keeps a ragged strip of grass
  float hump = smoothstep(0.55, 0.15, abs(dz)) * smoothstep(0.4, 0.65, vnoise(p * vec2(0.6, 2.0) + 2.0));
  col = mix(col, under * 0.85, hump * 0.75);
  return vec4(col, cover);
}

// lawn + worn paths + road for any point of the ground plane
vec3 groundTop(vec2 p, float px) {
  vec3 grass = lawn(p, px);
  vec3 col = grass;
  float wear = 0.0;
  ${PATHS.map(([ax, az, bx, bz]) => `wear = max(wear, smoothstep(0.95, 0.15, segDist(p, vec2(${f(ax)}, ${f(az)}), vec2(${f(bx)}, ${f(bz)}))));`).join('\n  ')}
  if (wear > 0.0) {
    float wn = vnoise(p * 1.3) * 0.6 + vnoise(p * 4.0) * 0.4;
    wear = smoothstep(0.35, 0.8, wear * (0.45 + wn * 0.85));
    col = mix(col, mix(dirt(p, px), grass, 0.3), wear * 0.75);
  }
  if (abs(p.y - ${f(ROAD_Z)}) > ${f(ROAD_HALF + 2.5)}) return col;
  vec4 r = road(p, grass, px);
  return mix(col, r.rgb, r.w);
}
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
          col = groundTop(p, px);
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
          if (trample > 0.0) col = mix(col, dirt(p * 1.3, px) * 0.85, smoothstep(0.15, 0.9, trample) * 0.8);
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

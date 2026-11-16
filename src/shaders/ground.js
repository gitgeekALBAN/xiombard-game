import * as THREE from 'three';
import { noise } from './noise.glsl.js';
import { lightingGLSL } from './toon.js';
import { PLOTS, PLOT_HALF, ROAD_Z, ROAD_HALF } from '../shared/layout.js';

// World-space ground shader: patchy grey-green grass, curly swirls, a rutted dirt road,
// dashed outlines around open grave plots, and layered soil below y = 0 (grave walls).
export function groundMaterial() {
  return new THREE.ShaderMaterial({
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
      ${noise}
      ${lightingGLSL}
      const vec2 PLOT[${PLOTS.length}] = vec2[](${PLOTS.map((p) => `vec2(${p.x.toFixed(2)}, ${p.z.toFixed(2)})`).join(', ')});
      void main() {
        vec3 N = normalize(vN);
        vec2 p = vW.xz;
        vec3 col;
        if (vW.y < -0.02) {
          float layer = floor(vW.y * 6.0 + vnoise(p * 3.0) * 1.5);
          col = mix(vec3(0.3, 0.2, 0.17), vec3(0.22, 0.14, 0.13), mod(layer, 2.0));
          col *= 0.75 + 0.25 * smoothstep(-1.4, 0.0, vW.y);
          col += step(0.93, vnoise(p * 9.0 + vW.y * 7.0)) * vec3(0.12, 0.1, 0.1);
        } else {
          float n = fbm(p * 0.18);
          col = mix(vec3(0.16, 0.19, 0.21), vec3(0.21, 0.25, 0.23), smoothstep(0.35, 0.65, n));
          // curly swirls in the grass
          vec2 cell = floor(p / 6.0); vec2 lp = p - (cell + 0.5) * 6.0;
          float ang = atan(lp.y, lp.x); float r = length(lp);
          float spiral = abs(fract((r * 1.6 - ang / 6.2832) ) - 0.5);
          col = mix(col, col * 1.18, smoothstep(0.08, 0.0, spiral) * smoothstep(2.6, 1.2, r) * step(0.55, hash12(cell)));
          // grass tufts
          col *= 0.9 + 0.12 * step(0.5, vnoise(p * 7.0));
          // dirt road
          float road = smoothstep(${ROAD_HALF.toFixed(2)} + 0.4, ${ROAD_HALF.toFixed(2)} - 0.2, abs(p.y - ${ROAD_Z.toFixed(2)} + sin(p.x * 0.15) * 0.4));
          vec3 roadCol = vec3(0.33, 0.27, 0.27) * (0.9 + 0.15 * vnoise(p * 2.0));
          float rut = smoothstep(0.18, 0.05, abs(abs(p.y - ${ROAD_Z.toFixed(2)}) - 1.0));
          roadCol *= 1.0 - rut * 0.25;
          col = mix(col, roadCol, road);
          // open plot outlines
          for (int i = 0; i < ${PLOTS.length}; i++) {
            vec2 d = abs(p - PLOT[i]) - vec2(${(PLOT_HALF.x + 0.12).toFixed(2)}, ${(PLOT_HALF.z + 0.12).toFixed(2)});
            float edge = abs(max(d.x, d.y));
            float dash = step(0.5, fract((p.x + p.y) * 2.5));
            float show = uPlotState[i] < 0.5 ? 1.0 : 0.0;
            col = mix(col, vec3(0.45, 0.33, 0.25), smoothstep(0.05, 0.0, edge) * dash * show);
            // trampled soil around graves
            col = mix(col, vec3(0.27, 0.22, 0.21), smoothstep(0.7, 0.0, max(d.x, d.y)) * 0.5);
          }
        }
        col = pow(col, vec3(2.2));
        gl_FragColor = vec4(toonShade(col, N, vW), 1.0);
        #include <colorspace_fragment>
        #include <fog_fragment>
      }`,
    fog: true,
  });
}

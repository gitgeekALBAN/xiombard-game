import * as THREE from 'three';
import { noise } from './noise.glsl.js';
import { MOON_DIR } from './toon.js';

// Gloomy storybook sky: purple gradient, a huge cratered moon, flat swirly clouds and stars.
export function createSky() {
  const material = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uMoon: { value: MOON_DIR.clone() } },
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main() {
        vDir = position;
        vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        gl_Position = p.xyww;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uTime; uniform vec3 uMoon;
      varying vec3 vDir;
      ${noise}
      void main() {
        vec3 d = normalize(vDir);
        float h = d.y;
        vec3 col = mix(vec3(0.2, 0.17, 0.3), vec3(0.035, 0.03, 0.08), smoothstep(-0.02, 0.55, h));
        col = mix(col, vec3(0.16, 0.14, 0.24), smoothstep(0.02, -0.2, h));

        // stars
        vec2 sp = vec2(atan(d.z, d.x) * 60.0, asin(clamp(d.y, -1.0, 1.0)) * 60.0);
        vec2 cell = floor(sp); vec2 f = fract(sp) - 0.5;
        float star = step(0.94, hash12(cell)) * smoothstep(0.12, 0.0, length(f)) * smoothstep(0.05, 0.3, h);
        col += vec3(0.9, 0.9, 1.0) * star * (0.6 + 0.4 * sin(uTime * 2.0 + hash12(cell + 3.0) * 30.0));

        // moon
        float m = dot(d, uMoon);
        float disc = smoothstep(0.9955, 0.9962, m);
        vec2 mp = vec2(dot(d, normalize(cross(uMoon, vec3(0, 1, 0)))), d.y - uMoon.y) * 40.0;
        float crater = smoothstep(0.55, 0.62, vnoise(mp * 1.3)) * 0.18 + fbm(mp) * 0.12;
        vec3 moonCol = vec3(0.98, 0.95, 0.8) - crater;
        col += vec3(0.55, 0.55, 0.75) * pow(max(m, 0.0), 120.0) * 0.5 + vec3(0.35, 0.3, 0.55) * pow(max(m, 0.0), 12.0) * 0.18;
        col = mix(col, moonCol, disc);

        // flat, curly storybook clouds
        vec2 cp = d.xz / (d.y + 0.25) * 1.4 + vec2(uTime * 0.01, 0.0);
        float a = fbm(cp * 0.9);
        vec2 sw = vec2(sin(a * 6.0 + cp.y), cos(a * 6.0 + cp.x));
        float c = fbm(cp + sw * 0.5);
        float band = smoothstep(0.52, 0.56, c) * smoothstep(-0.05, 0.25, h) * smoothstep(0.95, 0.4, h);
        float lit = pow(max(m, 0.0), 6.0);
        vec3 cloudCol = mix(vec3(0.12, 0.1, 0.19), vec3(0.42, 0.38, 0.55), lit);
        float edge = smoothstep(0.56, 0.6, c) - smoothstep(0.6, 0.64, c);
        col = mix(col, cloudCol, band * 0.92);
        col += edge * band * lit * vec3(0.5, 0.48, 0.6);

        gl_FragColor = vec4(pow(col, vec3(2.2)), 1.0);
        #include <colorspace_fragment>
      }`,
    side: THREE.BackSide, depthWrite: false, fog: false,
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(500, 48, 24), material);
  mesh.frustumCulled = false;
  mesh.renderOrder = -1;
  return mesh;
}

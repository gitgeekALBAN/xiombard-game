import * as THREE from 'three';
import { noise } from './noise.glsl.js';

// Procedural sky dome: gradient + stars + drifting nebula clouds.
export function createSky() {
  const material = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: { uTime: { value: 0 } },
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main() {
        vDir = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      varying vec3 vDir;
      ${noise}
      void main() {
        vec3 d = normalize(vDir);
        float h = clamp(d.y, -0.2, 1.0);
        vec3 col = mix(vec3(0.10, 0.05, 0.18), vec3(0.01, 0.02, 0.06), smoothstep(-0.05, 0.6, h));
        // horizon glow
        col += vec3(0.9, 0.35, 0.6) * pow(1.0 - abs(h), 12.0) * 0.35;
        // stars
        vec2 sp = vec2(atan(d.z, d.x), asin(d.y)) * 180.0;
        float s = hash12(floor(sp));
        float twinkle = 0.6 + 0.4 * sin(uTime * 2.0 + s * 50.0);
        col += vec3(step(0.997, s) * twinkle) * smoothstep(0.0, 0.3, h);
        // nebula
        vec2 np = d.xz / (d.y + 0.35) * 1.5 + uTime * 0.01;
        float n = fbm(np) * fbm(np * 1.7 + 3.0);
        col += vec3(0.2, 0.6, 0.9) * smoothstep(0.15, 0.5, n) * 0.35 * smoothstep(0.0, 0.4, h);
        gl_FragColor = vec4(col, 1.0);
      }`,
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(500, 48, 24), material);
  mesh.frustumCulled = false;
  return mesh;
}

import * as THREE from 'three';
import { noise } from './noise.glsl.js';

// Height function shared by GPU (displacement) and CPU (player ground-follow).
// Keep these two implementations in sync.
function hash12(x, y) {
  let p3x = (x * 0.1031) % 1, p3y = (y * 0.1031) % 1, p3z = (x * 0.1031) % 1;
  if (p3x < 0) p3x += 1; if (p3y < 0) p3y += 1; if (p3z < 0) p3z += 1;
  const d = p3x * (p3y + 33.33) + p3y * (p3z + 33.33) + p3z * (p3x + 33.33);
  p3x += d; p3y += d; p3z += d;
  const v = ((p3x + p3y) * p3z) % 1;
  return v < 0 ? v + 1 : v;
}
function vnoise(x, y) {
  const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
  const a = hash12(ix, iy), b = hash12(ix + 1, iy), c = hash12(ix, iy + 1), d = hash12(ix + 1, iy + 1);
  return (a + (b - a) * ux) + ((c + (d - c) * ux) - (a + (b - a) * ux)) * uy;
}
function fbm(x, y) {
  let v = 0, a = 0.5;
  for (let i = 0; i < 5; i++) { v += a * vnoise(x, y); x = x * 2.03 + 17.1; y = y * 2.03 + 17.1; a *= 0.5; }
  return v;
}
export function heightAt(x, z) {
  return (fbm(x * 0.02, z * 0.02) - 0.5) * 22.0;
}

export function createTerrain() {
  const geo = new THREE.PlaneGeometry(400, 400, 256, 256);
  geo.rotateX(-Math.PI / 2);
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uFogColor: { value: new THREE.Color(0x0a0716) },
    },
    vertexShader: /* glsl */ `
      ${noise}
      varying vec3 vWorld;
      varying float vH;
      void main() {
        vec3 p = position;
        p.y = (fbm(p.xz * 0.02) - 0.5) * 22.0;
        vH = p.y;
        vec4 w = modelMatrix * vec4(p, 1.0);
        vWorld = w.xyz;
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform vec3 uFogColor;
      varying vec3 vWorld;
      varying float vH;
      ${noise}
      void main() {
        // normal from screen-space derivatives (no normal attribute needed)
        vec3 n = normalize(cross(dFdx(vWorld), dFdy(vWorld)));
        float light = clamp(dot(n, normalize(vec3(0.4, 0.8, 0.2))), 0.0, 1.0);
        vec3 low = vec3(0.05, 0.03, 0.10), high = vec3(0.25, 0.18, 0.40);
        vec3 col = mix(low, high, smoothstep(-8.0, 10.0, vH)) * (0.35 + 0.65 * light);
        // glowing grid lines that pulse outward
        vec2 g = abs(fract(vWorld.xz / 6.0) - 0.5);
        float line = smoothstep(0.48, 0.5, max(g.x, g.y));
        float pulse = 0.5 + 0.5 * sin(length(vWorld.xz) * 0.15 - uTime * 2.0);
        col += vec3(0.3, 0.9, 1.0) * line * (0.15 + 0.5 * pulse);
        // fog
        float fog = smoothstep(40.0, 190.0, length(vWorld.xz - cameraPosition.xz));
        gl_FragColor = vec4(mix(col, uFogColor, fog), 1.0);
      }`,
  });
  return new THREE.Mesh(geo, material);
}

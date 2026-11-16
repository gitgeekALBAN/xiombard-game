import * as THREE from 'three';

// One shared shader material for all collectible crystals: fresnel rim + inner bands.
export function createCrystalMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    uniforms: { uTime: { value: 0 } },
    vertexShader: /* glsl */ `
      varying vec3 vN;
      varying vec3 vView;
      varying vec3 vLocal;
      void main() {
        vLocal = position;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal);
        vView = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      varying vec3 vN;
      varying vec3 vView;
      varying vec3 vLocal;
      void main() {
        float fres = pow(1.0 - abs(dot(normalize(vN), vView)), 2.5);
        float bands = 0.5 + 0.5 * sin(vLocal.y * 12.0 - uTime * 4.0);
        vec3 col = mix(vec3(0.1, 0.5, 1.0), vec3(1.0, 0.3, 0.9), bands) * 0.6 + vec3(0.6, 1.0, 1.0) * fres;
        gl_FragColor = vec4(col, 0.55 + fres * 0.45);
      }`,
  });
}

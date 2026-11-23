import * as THREE from 'three';
import { MORGUE } from '../shared/layout.js';
import { sunDir, MOON_DIR, LIGHTING_C } from '../shaders/toon.js';

// Light shafts in the hall's dusty air: where the key comes in through a pane, the door or the hatch, a soft beam
// runs from the opening down to its patch on the floor (docs/lighting-guide.md: atmosphere makes light visible).
// One additive mesh for the sun's beams (south and east openings) and one for the moon's (north openings); no
// volumetrics, just the four sides of each beam, brightest at the opening and fading toward the floor.
const PANE = 0.27; // half size of a window's glass

const mat = (color) => new THREE.ShaderMaterial({
  uniforms: { uColor: { value: new THREE.Color(color) }, uStrength: { value: 0 }, uTime: { value: 0 } },
  vertexShader: /* glsl */ `varying vec2 vUv; varying vec3 vW;
    void main() { vUv = uv; vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
  fragmentShader: /* glsl */ `uniform vec3 uColor; uniform float uStrength, uTime; varying vec2 vUv; varying vec3 vW;
    float h(vec2 p) { vec3 q = fract(vec3(p.xyx) * 0.1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
    float n(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
      return mix(mix(h(i), h(i + vec2(1.0, 0.0)), f.x), mix(h(i + vec2(0.0, 1.0)), h(i + vec2(1.0, 1.0)), f.x), f.y); }
    void main() {
      float side = smoothstep(0.0, 0.3, vUv.x) * smoothstep(1.0, 0.7, vUv.x); // soft toward the beam's corners
      float along = mix(1.0, 0.3, vUv.y) * smoothstep(1.0, 0.92, vUv.y);       // strongest at the opening
      float dust = 0.7 + 0.6 * n(vW.xz * 2.2 + vec2(vW.y * 1.7 - uTime * 0.05, uTime * 0.03)); // slow drifting dust
      float a = side * along * dust * uStrength;
      gl_FragColor = vec4(uColor * a, a);
    }`,
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
});

// openings: [{ c: [x, y, z] center on the wall's inner face, u: [ux, uz] along the wall, hw, hh }], L: toward the light
function beams(openings, L) {
  const pos = [], uv = [], idx = [];
  for (const o of openings) {
    const top = [[-1, 1], [1, 1], [1, -1], [-1, -1]].map(([a, b]) => new THREE.Vector3(o.c[0] + o.u[0] * o.hw * a, o.c[1] + o.hh * b, o.c[2] + o.u[1] * o.hw * a));
    const foot = top.map((p) => p.clone().addScaledVector(L, -(p.y - 0.03) / L.y)); // down the light to the floor
    for (let i = 0; i < 4; i++) {
      const j = (i + 1) % 4, b = pos.length / 3;
      for (const [p, u, v] of [[top[i], 0, 0], [top[j], 1, 0], [foot[j], 1, 1], [foot[i], 0, 1]]) { pos.push(p.x, p.y, p.z); uv.push(u, v); }
      idx.push(b, b + 1, b + 2, b, b + 2, b + 3);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  return g;
}

// Returns { setDay(k), update(time) }.
export function buildShafts(scene) {
  const Mg = MORGUE, t = Mg.t / 2 + 0.02;
  const pane = ([x, z, nx, nz]) => ({ c: [x - nx * t, 1.7, z - nz * t], u: [-nz, nx], hw: PANE, hh: PANE });
  const sun = sunDir(1), moon = MOON_DIR;
  const from = (L) => {
    const o = Mg.wins.filter(([, , nx, nz]) => nx * L.x + nz * L.z > 0.05).map(pane);
    // the door (south wall) for the sun, the hatch (north wall) for the moon: real holes, bigger beams
    if (L.z < 0) o.push({ c: [(Mg.door[0] + Mg.door[1]) / 2, 1.05, Mg.z0 + t], u: [1, 0], hw: (Mg.door[1] - Mg.door[0]) / 2 - 0.05, hh: 1.0 });
    else o.push({ c: [(Mg.hatch[0] + Mg.hatch[1]) / 2, (Mg.hatchSill + Mg.hatchTop) / 2, Mg.z1 - t], u: [1, 0], hw: (Mg.hatch[1] - Mg.hatch[0]) / 2 - 0.05, hh: (Mg.hatchTop - Mg.hatchSill) / 2 - 0.05 });
    return o;
  };
  const day = new THREE.Mesh(beams(from(sun), sun), mat('#ffd28a'));
  const night = new THREE.Mesh(beams(from(moon), moon), mat('#8fb6ff'));
  for (const m of [day, night]) { m.name = 'light-shafts'; m.frustumCulled = false; m.renderOrder = 3; scene.add(m); }
  const ss = (a, b, x) => { const k = Math.min(1, Math.max(0, (x - a) / (b - a))); return k * k * (3 - 2 * k); };
  return {
    setDay(k) {
      day.material.uniforms.uStrength.value = 0.3 * ss(0.7, 1, k) * (LIGHTING_C ? 0 : 1);
      night.material.uniforms.uStrength.value = 0.16 * (1 - ss(0.05, 0.4, k));
      day.visible = day.material.uniforms.uStrength.value > 0.001;
      night.visible = night.material.uniforms.uStrength.value > 0.001;
    },
    update(time) { day.material.uniforms.uTime.value = night.material.uniforms.uTime.value = time; },
  };
}

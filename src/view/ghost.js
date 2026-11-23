import * as THREE from 'three';

// The ghost that leaves a grave when it is filled in: happy (a smile, a brisk spiral up into the sky) when everything
// on the note was done right, sad (a frown, bluish, drifting off sideways with a sigh) when something was missed.
// A sheet ghost: one lathe (round head, flaring hem), its hem waving in the vertex shader, the face painted in the
// fragment shader from the sheet's own coordinates. Pooled; compiled ahead in warmup.js.
const vert = /* glsl */ `
uniform float uT;
varying vec3 vP; varying vec3 vN; varying float vFog;
void main() {
  vec3 p = position;
  float hem = 1.0 - smoothstep(0.0, 0.45, p.y); // the lower part flutters
  float a = atan(p.z, p.x);
  p.xz *= 1.0 + hem * 0.12 * sin(a * 5.0 + uT * 7.0);
  p.y += hem * 0.05 * sin(a * 7.0 - uT * 6.0);
  vP = position; vN = normalize(normalMatrix * normal);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vFog = -mv.z;
  gl_Position = projectionMatrix * mv;
}`;
const frag = /* glsl */ `
uniform float uHappy, uAlpha;
uniform vec3 fogColor; uniform float fogDensity;
varying vec3 vP; varying vec3 vN; varying float vFog;
float ell(vec2 p, vec2 c, vec2 r) { return length((p - c) / r) - 1.0; }
void main() {
  vec3 base = mix(vec3(0.62, 0.72, 0.95), vec3(0.97, 0.96, 0.92), uHappy); // the sad one is a little blue
  float rim = pow(1.0 - abs(vN.z), 2.0);
  vec3 col = base * (0.85 + 0.25 * rim);
  // the face, on the front (+z) of the head
  float ink = 0.0;
  if (vP.z > 0.0) {
    vec2 f = vP.xy;
    float eyeH = mix(0.034, 0.05, uHappy);
    ink = max(ink, step(ell(f, vec2(-0.085, 0.47), vec2(0.03, eyeH)), 0.0));
    ink = max(ink, step(ell(f, vec2(0.085, 0.47), vec2(0.03, eyeH)), 0.0));
    // the mouth: a smile curves up at the ends, a frown down
    float x = f.x / 0.11, bend = mix(-1.0, 1.0, uHappy);
    float my = 0.37 + bend * 0.035 * x * x - bend * 0.012;
    ink = max(ink, step(abs(x), 1.0) * (1.0 - smoothstep(0.008, 0.016, abs(f.y - my))));
    // sad: a tear
    ink = max(ink, (1.0 - uHappy) * step(ell(f, vec2(0.1, 0.415), vec2(0.012, 0.02)), 0.0) * 0.6);
  }
  col = mix(col, vec3(0.1, 0.08, 0.14), ink);
  float fog = 1.0 - exp(-fogDensity * fogDensity * vFog * vFog);
  gl_FragColor = vec4(mix(col, fogColor, fog * 0.6), uAlpha * (0.88 - 0.25 * rim));
  #include <colorspace_fragment>
}`;

// the profile: a round head on top, the sheet flaring out to a hem at y = 0
const pts = [];
for (let i = 0; i <= 10; i++) { const a = (i / 10) * Math.PI * 0.5; pts.push(new THREE.Vector2(Math.sin(a) * 0.2 + 0.0001, 0.42 + Math.cos(a) * 0.2)); }
pts.reverse();
pts.push(new THREE.Vector2(0.22, 0.3), new THREE.Vector2(0.27, 0.12), new THREE.Vector2(0.31, 0.0));
const GEO = new THREE.LatheGeometry(pts.map((p) => p).sort((a, b) => b.y - a.y), 24);

export function ghostMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { uT: { value: 0 }, uHappy: { value: 1 }, uAlpha: { value: 1 } }]),
    vertexShader: vert, fragmentShader: frag, transparent: true, depthWrite: false, fog: true, side: THREE.DoubleSide,
  });
}

export function createGhosts(scene) {
  const pool = [];
  const get = () => {
    let g = pool.find((x) => !x.visible);
    if (!g) {
      g = new THREE.Mesh(GEO, ghostMaterial());
      g.renderOrder = 4;
      g.visible = false;
      scene.add(g);
      pool.push(g);
    }
    return g;
  };
  return {
    // pos: where the grave is; happy: everything on the note was done
    spawn(pos, happy) {
      const g = get();
      g.userData = { t: 0, happy, x: pos[0], y: pos[1], z: pos[2], spin: Math.random() * 6.28, side: Math.random() < 0.5 ? -1 : 1 };
      g.material.uniforms.uHappy.value = happy ? 1 : 0;
      g.visible = true;
    },
    update(dt, camera) {
      for (const g of pool) {
        if (!g.visible) continue;
        const u = g.userData, T = happy(u) ? 4.2 : 5.5;
        u.t += dt;
        const k = u.t / T;
        if (k >= 1) { g.visible = false; continue; }
        g.material.uniforms.uT.value = u.t;
        // fade in, hold, fade out
        g.material.uniforms.uAlpha.value = Math.min(1, u.t / 0.4) * (1 - Math.max(0, (k - 0.7) / 0.3));
        if (u.happy) { // a brisk spiral up and away, with a little bob
          const r = 0.4 + k * 1.2, a = u.spin + u.t * 3.2;
          g.position.set(u.x + Math.cos(a) * r, u.y + 0.2 + k * k * 6 + Math.sin(u.t * 9) * 0.05, u.z + Math.sin(a) * r);
          g.scale.setScalar(SIZE * (1 + 0.08 * Math.sin(u.t * 6)));
        } else { // slow, drooping, sideways, sinking a bit before it goes
          g.position.set(u.x + u.side * k * 3, u.y + 0.3 + k * 2.2 - Math.sin(k * Math.PI) * 0.3, u.z + k * 0.8);
          g.scale.set(SIZE, SIZE * (0.92 + 0.05 * Math.sin(u.t * 2)), SIZE);
        }
        // face the camera (the face is on +z), leaning into the motion
        g.rotation.set(u.happy ? 0 : 0.18, Math.atan2(camera.position.x - g.position.x, camera.position.z - g.position.z), u.happy ? 0.15 * Math.sin(u.t * 5) : u.side * 0.25);
      }
    },
  };
}
const happy = (u) => u.happy;
const SIZE = 1.7; // about the height of a digger's head and shoulders

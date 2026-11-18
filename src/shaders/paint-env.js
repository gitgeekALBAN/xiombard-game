import * as THREE from 'three';
import { DAY, lightingGLSL } from './toon.js';
import { noise } from './noise.glsl.js';

// One painted material for the whole yard. Small relief (plank seams, shingles, mortar, bark grooves, window frames,
// skull eyes, scarf stripes, clods of earth) is painted here instead of modeled, so the set pieces stay plain
// primitives. Every vertex carries what to paint, so the whole static yard is one draw call plus its ink hulls:
//   aCol  base color (linear)
//   aPat  x = pattern (see P), y/z = pattern parameters, w = rim strength
//   aObj  paint coordinates in meters, in the piece's own space (so patterns stick and lean with the piece)
//   uv    tube coordinates for bark and scarves: x = around (0..1), y = meters along
// Lighting, lantern pools, fog and day/night are the same as toon() (shared lightingGLSL and DAY uniform).
export const P = {
  plain: 0, // y = mottle, z = emissive (lamp glow, goes out by day)
  bark: 1, // y = grooves around the tube
  planks: 2, // vertical boards: y = board width
  grain: 3, // a single board: y = grain axis (0 y, 1 x, 2 z)
  shingles: 4,
  stone: 5, // y = block height (0 = no courses), z = y of the first course
  stripes: 6, // y = stripe pairs around the tube
  lantern: 7, // glass box with an iron frame: y = half width, z = half height
  window: 8, // lit window with frame and mullions: y = half width, z = half height
  door: 9, // plank door with a Z brace: y = half width, z = half height
  skull: 10, // bone ball with ink eye sockets (unit sphere coords): y = 1 for both faces
  eyes: 11, // crow head: bone eyes on the sides (unit sphere coords)
  lid: 12, // coffin lid: bone cross and a striped band (lid space: x across, y along)
  dirt: 13, // heaped earth with clods
};

const vert = /* glsl */ `
attribute vec3 aCol; attribute vec4 aPat; attribute vec3 aObj;
varying vec3 vN; varying vec3 vW; varying vec3 vO; varying vec3 vCol; varying vec2 vUv;
flat varying vec4 vPat;
#include <common>
#include <fog_pars_vertex>
void main() {
  mat4 mm = modelMatrix;
  #ifdef USE_INSTANCING
  mm = modelMatrix * instanceMatrix;
  #endif
  vO = aObj; vCol = aCol; vPat = aPat; vUv = uv;
  vec4 w = mm * vec4(position, 1.0); vW = w.xyz;
  vec3 s2 = vec3(dot(mm[0].xyz, mm[0].xyz), dot(mm[1].xyz, mm[1].xyz), dot(mm[2].xyz, mm[2].xyz));
  vN = normalize(mat3(mm) * (normal / s2));
  vec4 mvPosition = viewMatrix * w;
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}`;

const lin = (h) => { const c = new THREE.Color(h); return `vec3(${c.r.toFixed(4)}, ${c.g.toFixed(4)}, ${c.b.toFixed(4)})`; };

const frag = /* glsl */ `
varying vec3 vN; varying vec3 vW; varying vec3 vO; varying vec3 vCol; varying vec2 vUv;
flat varying vec4 vPat;
#include <common>
#include <fog_pars_fragment>
${noise}
${lightingGLSL}
const vec3 INK = ${lin('#120d1a')};
const vec3 IRON = ${lin('#1d1726')};
const vec3 BONE = ${lin('#ece4d6')};
const vec3 WOOD = ${lin('#4a3340')};
const vec3 WOOD_DARK = ${lin('#33243a')};
const vec3 WOOD_LIGHT = ${lin('#6a4a52')};
const vec3 AMBER = ${lin('#ffc46b')};
const vec3 MOSS = ${lin('#4e6150')};
// soft 0..1 line of half width w around 0 in coordinate d, antialiased
float line(float d, float w) { float aa = max(fwidth(d), 1e-4); return 1.0 - smoothstep(w - aa, w + aa, abs(d)); }
float mottle(vec3 o) { return vnoise(o.xz * 7.0 + o.y * 4.3) * 0.65 + vnoise(o.xy * 19.0 + o.z * 11.0) * 0.35; }
// the horizontal coordinate across a vertical face (x on faces looking along z, z on faces looking along x)
float across(vec3 o, vec3 n) { return abs(n.x) > abs(n.z) ? o.z : o.x; }

void main() {
  vec3 N = normalize(vN);
  if (!gl_FrontFacing) N = -N;
  int pat = int(vPat.x + 0.5);
  vec3 o = vO;
  vec3 base = vCol;
  float rim = vPat.w, em = 0.0, lamp = 0.0, mot = 0.0;

  if (pat == 0) {
    mot = vPat.y; em = vPat.z; lamp = step(0.001, em);
  } else if (pat == 1) {
    // bark: dark root collar, daytime warm grey, twisting grooves and the odd knot
    base = mix(base, ${lin('#54424a')}, dayPaint());
    base = mix(${lin('#18121f')}, base, smoothstep(-0.1, 1.4, vW.y));
    float u = vUv.x * vPat.y + vUv.y * 0.22 + (vnoise(vec2(vUv.x * 9.0, vUv.y * 1.3)) - 0.5) * 0.7;
    float g = abs(fract(u) - 0.5);
    float aa = max(fwidth(u), 1e-4);
    base *= 1.0 - 0.45 * (1.0 - smoothstep(0.06 - aa, 0.06 + aa, g)) * smoothstep(0.6, 0.25, aa);
    base *= 1.0 + 0.18 * smoothstep(0.3, 0.45, g) * smoothstep(0.6, 0.25, aa);
    vec2 kc = vec2(vUv.x * 5.0, vUv.y * 0.9);
    vec2 ki = floor(kc);
    if (hash12(ki + 3.7) > 0.7) {
      vec2 kf = fract(kc) - 0.5;
      float k = length(kf * vec2(1.0, 1.8));
      base = mix(base, INK, line(k - 0.18, 0.03) + (1.0 - smoothstep(0.08, 0.11, k)) * 0.8);
    }
    mot = 0.55;
  } else if (pat == 2) {
    // vertical boards: seams, a tone per board, grain and nail heads
    float c = across(o, N) / vPat.y;
    float id = floor(c);
    float h = hash12(vec2(id, 7.1));
    base = h < 0.3 ? WOOD_DARK : base * (0.9 + 0.2 * hash12(vec2(id, 1.3)));
    float f = fract(c);
    float grain = vnoise(vec2((f + id) * 14.0, o.y * 1.6 + id * 3.0));
    base *= 0.9 + 0.2 * smoothstep(0.35, 0.75, grain);
    if (abs(N.y) < 0.6) {
      base = mix(base, INK, line(min(f, 1.0 - f) * vPat.y, 0.012));
      // nails near the top and bottom of each board
      for (int i = 0; i < 2; i++) {
        float ny = i == 0 ? 0.3 : 2.05 + hash12(vec2(id, 2.0)) * 0.06;
        vec2 d = vec2((f - 0.5) * vPat.y, o.y - ny);
        base = mix(base, INK, 1.0 - smoothstep(0.012, 0.02, length(d)));
      }
    }
    mot = 0.45;
  } else if (pat == 3) {
    int ax = int(vPat.y + 0.5);
    vec2 q = ax == 0 ? vec2(across(o, N), o.y) : ax == 1 ? vec2(o.y + o.z, o.x) : vec2(o.x + o.y, o.z);
    float grain = vnoise(vec2(q.x * 40.0, q.y * 2.5));
    base *= 0.88 + 0.24 * smoothstep(0.3, 0.8, grain);
    mot = 0.4;
  } else if (pat == 4) {
    // shingles: staggered rows down the slope, scalloped edges, a tone per shingle, a few missing
    if (N.y < 0.2) { base = ${lin('#2a1c33')}; }
    else {
      float row = floor(o.y / 0.34);
      float fy = fract(o.y / 0.34);
      float cx = o.x / 0.36 + mod(row, 2.0) * 0.5;
      float id = floor(cx);
      float fx = fract(cx);
      float h = hash12(vec2(id, row));
      base = mix(base, ${lin('#3a2546')}, step(0.55, h));
      base *= 0.9 + 0.22 * hash12(vec2(row, id + 4.0));
      // scalloped lower edge: the shadow under each shingle's rounded tab
      float edge = 0.8 + 0.12 * (1.0 - pow(2.0 * fx - 1.0, 2.0));
      float under = smoothstep(edge - 0.03, edge + 0.01, fy);
      base = mix(base, base * 0.42, under);
      base = mix(base, INK, line(min(fx, 1.0 - fx) * 0.36, 0.008) * (1.0 - under));
      if (h > 0.965) base = ${lin('#1e1427')}; // a shingle gone
      base *= 1.0 + (vnoise(o.xy * vec2(9.0, 26.0)) - 0.5) * 0.25;
    }
    mot = 0.4;
  } else if (pat == 5) {
    // stone: dark foot, mottle, painted courses with offset joints, moss low down
    base = mix(${lin('#6f6a86')}, base, smoothstep(0.0, 0.7, vW.y));
    if (vPat.y > 0.0 && abs(N.y) < 0.6) {
      float cy = (o.y - vPat.z) / vPat.y;
      float row = floor(cy);
      float jx = across(o, N) / 0.42 + hash12(vec2(row, 5.0));
      base *= 0.92 + 0.16 * hash12(vec2(row, floor(jx)));
      float seam = line(min(fract(cy), 1.0 - fract(cy)) * vPat.y, 0.012) * step(0.0, cy);
      float joint = line(min(fract(jx), 1.0 - fract(jx)) * 0.42, 0.01) * step(0.0, cy) * step(0.5, hash12(vec2(row, floor(jx + 0.5))));
      base = mix(base, base * 0.38, max(seam, joint));
    }
    float m = vnoise(o.xz * 6.0 + o.y * 3.0) * 0.6 + vnoise(o.xy * 17.0) * 0.4;
    float moss = smoothstep(0.62, 0.72, m + (0.5 - vW.y) * 0.5 + max(N.y, 0.0) * 0.25);
    base = mix(base, MOSS, moss * 0.75);
    mot = 0.6;
  } else if (pat == 6) {
    float s = step(0.5, fract(vUv.x * vPat.y));
    base = mix(BONE, INK, s);
    rim = 0.8;
  } else if (pat == 7) {
    // lantern glass: amber panes in an iron frame (corner posts, top and bottom bands, a cross bar)
    float hw = vPat.y, hh = vPat.z;
    float a = abs(across(o, N));
    float frame = max(step(hw - 0.03, a), step(hh - 0.035, abs(o.y)));
    frame = max(frame, line(o.y, 0.012));
    if (abs(N.y) > 0.6) frame = 1.0;
    base = mix(AMBER, IRON, frame);
    em = 0.88 * (1.0 - frame); lamp = 1.0; rim = mix(1.0, 1.5, frame);
  } else if (pat == 8) {
    // lit window: wooden frame, dark mullions, amber glass with a little warm wobble
    float hw = vPat.y, hh = vPat.z;
    float frame = max(step(hw - 0.07, abs(o.x)), step(hh - 0.07, abs(o.y)));
    if (abs(N.z) < 0.6) frame = 1.0;
    float mull = max(line(o.x, 0.02), line(o.y - hh * 0.2, 0.02));
    vec3 glass = AMBER * (0.85 + 0.25 * vnoise(o.xy * 6.0));
    base = mix(mix(glass, WOOD_DARK, mull), WOOD, frame);
    base = mix(base, INK, line(max(abs(o.x) - hw + 0.07, abs(o.y) - hh + 0.07), 0.008));
    em = 0.88 * (1.0 - max(frame, mull)); lamp = 1.0; rim = 0.8;
    if (frame > 0.5) mot = 0.5;
  } else if (pat == 9) {
    // plank door: three dark boards, two light rails with a Z brace, an iron knob, nails
    float hw = vPat.y, hh = vPat.z;
    float c = (o.x + hw) / (2.0 * hw) * 3.0;
    float id = floor(c);
    base = WOOD_DARK * (0.9 + 0.2 * hash12(vec2(id, 3.0)));
    base *= 0.9 + 0.2 * smoothstep(0.35, 0.75, vnoise(vec2(o.x * 30.0, o.y * 1.8)));
    if (abs(N.z) > 0.6) {
      base = mix(base, INK, line((abs(c - 1.5) - 0.5) * 0.3, 0.01));
      float y0 = -hh + 0.38, y1 = hh - 0.38;
      float rail = max(line(o.y - y0, 0.06), line(o.y - y1, 0.06));
      vec2 a = vec2(-hw + 0.08, y0), b = vec2(hw - 0.08, y1);
      vec2 pa = o.xy - a, ba = b - a;
      float t = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
      float brace = line(length(pa - ba * t), 0.05);
      float wood = max(rail, brace);
      vec3 w = WOOD * (0.92 + 0.16 * vnoise(vec2(o.x * 3.0, o.y * 30.0)));
      base = mix(base, w, wood);
      // the dark edge lines around the rails and the brace
      base = mix(base, INK, max(max(line(abs(o.y - y0) - 0.06, 0.008), line(abs(o.y - y1) - 0.06, 0.008)), line(length(pa - ba * t) - 0.05, 0.008) * (1.0 - rail)));
      for (int i = 0; i < 3; i++) {
        float nx = -hw + 0.15 + float(i) * 0.3;
        base = mix(base, INK, (1.0 - smoothstep(0.012, 0.02, length(vec2(o.x - nx, abs(o.y - y0) - 0.025)))));
        base = mix(base, INK, (1.0 - smoothstep(0.012, 0.02, length(vec2(o.x - nx, abs(o.y - y1) - 0.025)))));
      }
      float k = length(o.xy - vec2(-0.32, 0.03));
      base = mix(base, IRON, 1.0 - smoothstep(0.035, 0.045, k));
      base = mix(base, BONE * 0.6, (1.0 - smoothstep(0.008, 0.016, length(o.xy - vec2(-0.335, 0.045)))));
    }
    mot = 0.35;
  } else if (pat == 10) {
    // skull: ink eye sockets and a nose on the front (and the back when y = 1)
    vec3 q = o;
    if (vPat.y > 0.5) q.z = abs(q.z);
    float front = smoothstep(0.1, 0.3, q.z);
    float eye = 1.0 - smoothstep(0.24, 0.3, length(vec2(abs(q.x) - 0.36, (q.y - 0.02) * 0.9)));
    vec2 nq = vec2(abs(q.x), q.y + 0.38);
    float nose = step(nq.y, 0.2 - nq.x * 1.6) * step(0.0, nq.y);
    base = mix(base, INK, max(eye, nose) * front);
  } else if (pat == 11) {
    float side = step(0.55, abs(o.x));
    float e = length(vec2(o.z - 0.45, o.y - 0.25));
    base = mix(base, BONE, (1.0 - smoothstep(0.22, 0.27, e)) * side);
    base = mix(base, INK, (1.0 - smoothstep(0.08, 0.11, length(vec2(o.z - 0.52, o.y - 0.25)))) * side);
  } else if (pat == 12) {
    // coffin lid: wood grain along it, a bone cross near the head, a bone/ink band across the foot
    base *= 0.9 + 0.2 * smoothstep(0.3, 0.8, vnoise(vec2(o.x * 30.0, o.y * 2.0)));
    if (o.z > 0.0 || abs(N.z) > 0.6) {
      float cross = max(step(abs(o.x), 0.03) * step(abs(o.y - 0.32), 0.25), step(abs(o.x), 0.14) * step(abs(o.y - 0.42), 0.03));
      base = mix(base, BONE, cross);
      float band = step(abs(o.y + 0.82), 0.06) * step(abs(o.x), 0.204);
      base = mix(base, mix(BONE, INK, step(0.5, fract((o.x + 0.204) / 0.136))), band);
    }
    mot = 0.5;
  } else if (pat == 13) {
    // heaped earth: dark foot, mottle and painted clods
    base = mix(${lin("#35262a")}, base, smoothstep(0.0, 0.7, o.y));
    vec2 cc = o.xz * 5.0 + o.y * 2.0;
    vec2 ci = floor(cc), cf = fract(cc) - 0.5;
    vec2 off = vec2(hash12(ci), hash12(ci + 9.1)) - 0.5;
    float d = length(cf - off * 0.5);
    float r = 0.12 + 0.12 * hash12(ci + 3.3);
    float clod = 1.0 - smoothstep(r - 0.04, r, d);
    float lit = smoothstep(r * 0.2, -r * 0.6, dot(cf - off * 0.5, vec2(0.6, -0.8)));
    base = mix(base, base * mix(0.55, 1.35, lit), clod * step(0.45, hash12(ci + 1.7)));
    mot = 1.0;
  }

  if (mot > 0.0) base *= 1.0 + mot * (mottle(o) - 0.5) * 1.2;
  // lamps go out by day: the glowing part loses its glow and darkens, as in toon()
  if (lamp > 0.0 && em > 0.0) { float on = lampsOn(); em *= on; base *= mix(0.4, 1.0, on); }
  vec3 col = mix(toonShadeRim(base, N, vW, rim), base, em);
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
  #include <fog_fragment>
}`;

let mat = null;
// The one painted material (shared by every yard piece). Pass instancing meshes the same material: three.js
// compiles an instanced variant on its own.
export function paintMat() {
  if (mat) return mat;
  mat = new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, {}]),
    vertexShader: vert, fragmentShader: frag, fog: true,
  });
  mat.uniforms.uDay = DAY;
  return mat;
}

// A paint spec: { pat, col, p1, p2, rim }. spec('#hex', { ... }) builds one.
export function spec(col, { pat = P.plain, p1 = 0, p2 = 0, rim = 1 } = {}) {
  return { pat, col: new THREE.Color(col), p1, p2, rim };
}

// Fill the paint attributes of a non-indexed geometry: constant color and pattern, aObj (if missing) from `obj`
// (a matrix from the geometry's own space to the paint space, default identity), uv zeros if missing.
export function paintAttrs(g, s, obj) {
  const n = g.attributes.position.count;
  if (!g.attributes.uv) g.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(n * 2), 2));
  if (!g.attributes.aObj) {
    const a = g.attributes.position.clone();
    if (obj) a.applyMatrix4(obj);
    g.setAttribute('aObj', a);
  }
  const col = new Float32Array(n * 3), pat = new Float32Array(n * 4);
  for (let i = 0; i < n; i++) {
    col[i * 3] = s.col.r; col[i * 3 + 1] = s.col.g; col[i * 3 + 2] = s.col.b;
    pat[i * 4] = s.pat; pat[i * 4 + 1] = s.p1; pat[i * 4 + 2] = s.p2; pat[i * 4 + 3] = s.rim;
  }
  g.setAttribute('aCol', new THREE.Float32BufferAttribute(col, 3));
  g.setAttribute('aPat', new THREE.Float32BufferAttribute(pat, 4));
  return g;
}

// Lantern and window glows: every glow sprite of the yard in one instanced, camera-facing, additive draw.
// add(pos, size, strength) -> index; set(i, strength, scale) each frame.
export function glowSprites(color, max) {
  const geo = new THREE.InstancedBufferGeometry().copy(new THREE.PlaneGeometry(1, 1));
  const aGlow = new THREE.InstancedBufferAttribute(new Float32Array(max * 4), 4); // xyz center, w size
  const aK = new THREE.InstancedBufferAttribute(new Float32Array(max * 2), 2); // strength, scale
  aGlow.setUsage(THREE.StaticDrawUsage); aK.setUsage(THREE.DynamicDrawUsage);
  geo.setAttribute('aGlow', aGlow); geo.setAttribute('aK', aK);
  geo.instanceCount = 0;
  const m = new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color(color) } },
    vertexShader: /* glsl */ `attribute vec4 aGlow; attribute vec2 aK; varying vec2 vUv; varying float vS;
      void main() {
        vUv = uv; vS = aK.x;
        vec4 c = modelViewMatrix * vec4(aGlow.xyz, 1.0);
        c.xy += position.xy * aGlow.w * aK.y;
        gl_Position = projectionMatrix * c;
      }`,
    fragmentShader: /* glsl */ `uniform vec3 uColor; varying vec2 vUv; varying float vS;
      void main(){ float d = length(vUv - 0.5) * 2.0; float a = pow(max(0.0, 1.0 - d), 2.2) * vS; gl_FragColor = vec4(uColor * a, a); }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const mesh = new THREE.Mesh(geo, m);
  mesh.frustumCulled = false;
  let n = 0;
  return {
    mesh,
    get count() { return n; },
    add(pos, size, strength) {
      aGlow.setXYZW(n, pos.x, pos.y, pos.z, size);
      aK.setXY(n, strength, 1);
      geo.instanceCount = ++n;
      aGlow.needsUpdate = true; aK.needsUpdate = true;
      return n - 1;
    },
    set(i, strength, scale) { aK.setXY(i, strength, scale); aK.needsUpdate = true; },
  };
}

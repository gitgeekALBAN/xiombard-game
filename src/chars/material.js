import * as THREE from 'three';
import { lightingGLSL, DAY, INK } from '../shaders/toon.js';

// The paint for every character. The mesh is low-poly and carries only a flat color, a material id and baked
// occlusion per vertex; everything that reads as texture is computed here from the vertex's REST position, so it
// sticks to the character however it is posed: gouache mottling and speckles, knitted stitches, felt, fur strokes,
// stitched-on patches, dirt, and the face. Six rigid parts drive the mesh; each vertex blends two of them.
const skin = /* glsl */ `
attribute vec3 color; attribute vec2 fx; attribute vec2 bone; attribute float weight;
uniform mat4 uPart[6];   // rest -> world for body, head, and the four limbs
uniform float uNoHead;   // 1 = drop everything that follows the head (your own digger in first person)
vec3 skinned(out vec3 n) {
  int a = int(bone.x + 0.5), b = int(bone.y + 0.5);
  vec4 p = vec4(position, 1.0);
  n = normalize(mix(mat3(uPart[b]) * normal, mat3(uPart[a]) * normal, weight));
  return mix((uPart[b] * p).xyz, (uPart[a] * p).xyz, weight);
}
bool hidden() { return uNoHead > 0.5 && bone.x > 0.5 && bone.x < 1.5; }
`;
const vert = /* glsl */ `
${skin}
varying vec3 vRest, vN, vW, vCol; varying vec2 vFx; varying float vFog;
void main() {
  vec3 n; vec3 w = skinned(n);
  vRest = position; vN = n; vW = w; vCol = color; vFx = fx;
  vec4 mv = viewMatrix * vec4(w, 1.0);
  vFog = -mv.z;
  gl_Position = hidden() ? vec4(0.0, 0.0, 2.0, 1.0) : projectionMatrix * mv;
}`;
const frag = /* glsl */ `
uniform vec3 uLightDir, uLightCol, uShadeCol, uRimCol, uInk;
uniform float uFace;     // 0 happy crew, 1 zombie, 2 zombie dog, 3 at rest
uniform vec4 uTint;      // skin goes toward rgb by a (a body that got up)
uniform vec4 uHeadC;     // face center in rest space (xyz) and head radius
uniform float uBellyR;   // for laying patches around the belly
uniform vec4 uPatch[4];  // stitched-on patches: angle around the body, height, half width, half height (0 = none)
uniform vec3 uPatchCol[4];
uniform float uGrime;    // 0 clean .. 1 fresh out of the ground
uniform float uGrain;
#ifdef USE_FOG
uniform vec3 fogColor; uniform float fogDensity;
#endif
varying vec3 vRest, vN, vW, vCol; varying vec2 vFx; varying float vFog;
${lightingGLSL}
float hash1(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float vnoise(vec3 x) {
  vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash1(i), hash1(i + vec3(1, 0, 0)), f.x), mix(hash1(i + vec3(0, 1, 0)), hash1(i + vec3(1, 1, 0)), f.x), f.y),
             mix(mix(hash1(i + vec3(0, 0, 1)), hash1(i + vec3(1, 0, 1)), f.x), mix(hash1(i + vec3(0, 1, 1)), hash1(i + vec3(1, 1, 1)), f.x), f.y), f.z);
}
float fbm(vec3 p) { return 0.5 * vnoise(p) + 0.3 * vnoise(p * 2.1 + 3.7) + 0.2 * vnoise(p * 4.3 + 9.1); }
float seg(vec2 p, vec2 a, vec2 b) { vec2 pa = p - a, ba = b - a; return length(pa - ba * clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0)); }
float stroke(float d, float w) { return smoothstep(w, w * 0.45, d); }
float cross2(vec2 q, float r, float w) { return max(abs(q.x), abs(q.y)) < r ? stroke(min(abs(q.x - q.y), abs(q.x + q.y)) * 0.707, w) : 0.0; }

// rows of V-shaped stitches: u runs around or across the cloth, v along it; returns a paint multiplier
float knit(float u, float v, float su, float sv) {
  float k = fract(v * sv + abs(fract(u * su) - 0.5) * 1.3);
  return 0.84 + 0.16 * smoothstep(0.0, 0.45, k) - 0.05 * smoothstep(0.4, 0.5, abs(fract(u * su) - 0.5));
}

// The face is painted onto the front of the head. Returns ink (x), eye white (y), shade (z), blush (w).
vec4 face(vec3 p) {
  float s = uHeadC.w; vec2 f = p.xy - uHeadC.xy;
  float lw = 0.032 * s, ink = 0.0, white = 0.0, shade = 0.0, blush = 0.0;
  if (uFace > 1.5 && uFace < 2.5) { // a dog is seen from the side: one staring eye on its left, a cross on its right
    if (abs(p.x - uHeadC.x) < 0.3 * s) return vec4(0.0);
    vec2 g = vec2(p.z - uHeadC.z, p.y - uHeadC.y) - vec2(0.2, 0.3) * s; float r = 0.27 * s, d = length(g);
    shade = 0.3 * smoothstep(r * 1.8, r * 0.8, d);
    if (p.x > uHeadC.x) { white = smoothstep(r, r - lw, d); ink = max(stroke(abs(d - r), lw * 1.3), smoothstep(0.1 * s, 0.07 * s, length(g - vec2(0.05, -0.03) * s))); }
    else ink = cross2(g, 0.2 * s, lw * 1.4);
    return vec4(ink, white, shade, 0.0);
  }
  if (p.z < uHeadC.z) return vec4(0.0);
  if (uFace < 0.5) { // closed happy eyes, a lopsided smile, rosy cheeks
    for (int i = 0; i < 2; i++) {
      vec2 q = f - vec2(i == 0 ? -0.4 : 0.4, 0.36) * s;
      if (q.y < -0.12 * s) ink = max(ink, stroke(abs(length(q) - 0.2 * s), lw));
    }
    vec2 q = f - vec2(0.1, -0.02) * s; float a = atan(q.x, -q.y);
    if (a > -0.6 && a < 0.9) ink = max(ink, stroke(abs(length(q) - 0.4 * s), lw));
    blush = 0.42 * max(smoothstep(0.17 * s, 0.06 * s, length(f - vec2(-0.6, -0.02) * s)), smoothstep(0.17 * s, 0.06 * s, length(f - vec2(0.6, -0.02) * s)));
  } else if (uFace > 2.5) { // at rest: both eyes crossed out, a small flat mouth
    ink = max(cross2(f - vec2(-0.4, 0.36) * s, 0.15 * s, lw), cross2(f - vec2(0.4, 0.36) * s, 0.15 * s, lw));
    ink = max(ink, stroke(seg(f, vec2(-0.16, -0.3) * s, vec2(0.2, -0.27) * s), lw));
  } else { // undead: one big staring eye, one crossed out, dark hollows, a stitched mouth
    vec2 e1 = vec2(-0.42, 0.3) * s, e2 = vec2(0.44, 0.34) * s;
    float r = 0.3 * s, d1 = length(f - e1);
    shade = 0.34 * max(smoothstep(r * 1.9, r * 0.9, d1), smoothstep(r * 1.7, r * 0.6, length(f - e2)));
    white = smoothstep(r, r - lw * 0.6, d1);
    ink = max(stroke(abs(d1 - r), lw * 1.1), smoothstep(0.085 * s, 0.06 * s, length(f - e1 - vec2(0.04, -0.03) * s)));
    ink = max(ink, cross2(f - e2, 0.2 * s, lw * 1.2));
    {
      vec2 a = vec2(-0.36, -0.4) * s, b = vec2(0.34, -0.34) * s;
      ink = max(ink, stroke(seg(f, a, b), lw));
      float t = clamp(dot(f - a, b - a) / dot(b - a, b - a), 0.0, 1.0), tk = abs(fract(t * 5.0 + 0.5) - 0.5) / 5.0 * length(b - a);
      if (seg(f, a, b) < 0.07 * s) ink = max(ink, stroke(tk, lw * 0.9));
    }
  }
  return vec4(ink, white, shade, blush);
}

void main() {
  int id = int(vFx.x + 0.5);
  vec3 p = vRest, col = vCol, N = normalize(vN);
  float ink = 0.0, around = atan(p.x, p.z);
  col *= 0.9 + 0.2 * fbm(p * 7.0); // gouache: uneven pigment everywhere

  if (id == 1) { // skin
    col = mix(col, uTint.rgb, uTint.a);
    float dash = vnoise(vec3(around * 4.0, p.y * 60.0, 3.0)) * smoothstep(0.45, 0.75, vnoise(vec3(around * 2.3, p.y * 7.0, 7.0)));
    col *= 1.0 - 0.045 * smoothstep(0.45, 0.8, dash);
    col *= 1.0 - 0.14 * smoothstep(0.8, 0.88, vnoise(p * 75.0)); // speckles
    if (uGrime > 0.0) { // blotchy and mouldy
      col = mix(col, col * vec3(0.72, 0.8, 0.66), uGrime * smoothstep(0.5, 0.7, fbm(p * 3.2 + 11.0)));
      col *= 1.0 - 0.22 * uGrime * smoothstep(0.74, 0.8, vnoise(p * 34.0 + 5.0));
    }
    for (int i = 0; i < 4; i++) {
      if (uPatch[i].z <= 0.0) continue;
      float da = around - uPatch[i].x; da = atan(sin(da), cos(da));
      vec2 q = vec2(da * uBellyR, p.y - uPatch[i].y), h = uPatch[i].zw;
      vec2 dd = abs(q) - h + 0.012;
      float d = length(max(dd, 0.0)) + min(max(dd.x, dd.y), 0.0) - 0.012;
      if (d < 0.0) col = uPatchCol[i] * (0.86 + 0.14 * sin(q.x * 420.0) * sin(q.y * 420.0)) * (0.9 + 0.2 * fbm(p * 9.0));
      ink = max(ink, stroke(abs(d), 0.0035));
      // stitches straddle the edge
      float along = abs(dd.x) < abs(dd.y) ? q.y : q.x;
      if (abs(d) < 0.011) ink = max(ink, 0.9 * stroke(abs(fract(along / 0.022) - 0.5) * 0.022, 0.0028));
    }
    vec4 fc = face(p);
    col = mix(col, vec3(0.86, 0.5, 0.55), fc.w) * (1.0 - fc.z);
    col = mix(col, vec3(0.93, 0.92, 0.84), fc.y);
    ink = max(ink, fc.x);
  } else if (id == 2) col *= knit(around * 0.16 + p.x * 0.3, p.y, 46.0, 62.0);                     // scarf: chunky stitches
  else if (id == 3) col *= knit(around * 0.16, p.y, 60.0, 74.0);                                    // knitted hat
  else if (id == 4) col *= 0.82 + 0.18 * smoothstep(-0.3, 0.3, sin(around * 38.0 + p.x * 30.0));    // ribbed cuff or band
  else if (id == 5) col *= knit(p.x + p.z, p.y, 70.0, 84.0);                                        // mitten
  else if (id == 7) col *= mix(0.62, 1.0, smoothstep(0.012, 0.028, p.y)) * (1.0 + 0.25 * smoothstep(0.6, 0.9, N.y)); // boot: dark sole, worn top
  else if (id == 9) col *= 0.82 + 0.18 * vnoise(vec3(around * 26.0, p.y * 6.0, 1.0));               // hair: strands
  else if (id == 10) col *= 0.92 + 0.12 * vnoise(p * 90.0);                                         // felt
  else if (id == 11) col *= 0.82 + 0.26 * vnoise(p * 60.0);                                         // pompom fluff
  else if (id == 12) { // fur: strokes along the body, mouldy blotches, and the face
    col *= 0.84 + 0.2 * vnoise(vec3(p.x * 46.0, p.y * 46.0, p.z * 9.0));
    col = mix(col, col * vec3(0.7, 0.8, 0.62), uGrime * smoothstep(0.48, 0.66, fbm(p * 4.0 + 7.0)));
    vec4 fc = face(p);
    col = mix(col * (1.0 - fc.z), vec3(0.93, 0.92, 0.84), fc.y);
    ink = max(ink, fc.x);
  }
  else if (id == 13) col *= 0.8 + 0.25 * vnoise(vec3(p.x * 8.0, p.y * 70.0, p.z * 8.0));            // wood grain
  else if (id == 15) col *= 0.9 + 0.1 * sin(p.x * 300.0) * sin(p.y * 300.0);                        // woven cloth

  if (uGrime > 0.0 && id != 1) { // earth on everything that came out of the ground, thicker toward the feet and hands
    float low = smoothstep(0.42, 0.0, p.y) * 0.7 + 0.25;
    col = mix(col, vec3(0.2, 0.15, 0.1), uGrime * low * smoothstep(0.45, 0.75, fbm(p * 9.0 + 2.0)));
  }

  // soft storybook light: a wide wrapped gradient with a hint of painted steps, tinted shadows, baked occlusion
  float lit = smoothstep(-0.35, 0.75, dot(N, uLightDir));
  lit = floor(lit * 3.0 + 0.5) / 3.0 * 0.3 + lit * 0.7;
  vec3 light = mix(uShadeCol, uLightCol, lit) * mix(0.5, 1.0, vFx.y);
  vec3 V = normalize(cameraPosition - vW);
  float edge = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 3.0);
  light += uRimCol * edge * (1.0 - 0.6 * lit);
  light += lanternLight(vW, N) * mix(0.6, 1.0, vFx.y);
  col *= light;
  col *= 1.0 - 0.22 * edge; // paint pools darker toward the outline
  col = mix(col, uInk, ink);
  col *= 1.0 + (hash1(vec3(gl_FragCoord.xy, 1.0)) - 0.5) * uGrain; // paper grain
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
  #ifdef USE_FOG
  gl_FragColor.rgb = mix(gl_FragColor.rgb, fogColor, 1.0 - exp(-fogDensity * fogDensity * vFog * vFog));
  #endif
}`;

// Ink outline: the same skinned mesh pushed out along its normals and drawn inside out. The line breathes a
// little along the form, like a brush line.
const hullVert = /* glsl */ `
${skin}
uniform float uThick;
varying float vFog;
void main() {
  vec3 n; vec3 w = skinned(n);
  vec4 mv = viewMatrix * vec4(w, 1.0);
  float wob = 0.8 + 0.25 * sin(position.x * 31.0 + position.y * 23.0) + 0.15 * sin(position.y * 57.0 + position.z * 41.0);
  mv.xyz += normalize(mat3(viewMatrix) * n) * uThick * wob * clamp(-mv.z * 0.17, 0.8, 2.2);
  vFog = -mv.z;
  gl_Position = hidden() ? vec4(0.0, 0.0, 2.0, 1.0) : projectionMatrix * mv;
}`;
const hullFrag = /* glsl */ `
uniform vec3 uInk;
#ifdef USE_FOG
uniform vec3 fogColor; uniform float fogDensity;
#endif
varying float vFog;
void main() {
  gl_FragColor = vec4(uInk, 1.0);
  #include <colorspace_fragment>
  #ifdef USE_FOG
  gl_FragColor.rgb = mix(gl_FragColor.rgb, fogColor, 1.0 - exp(-fogDensity * fogDensity * vFog * vFog));
  #endif
}`;

// Two materials sharing one set of uniforms: the paint and the ink hull.
export function characterMaterials(opts = {}) {
  const uniforms = {
    ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog), uDay: DAY,
    uPart: { value: Array.from({ length: 6 }, () => new THREE.Matrix4()) }, uNoHead: { value: 0 },
    uLightDir: { value: new THREE.Vector3(-0.4, 0.7, 0.5).normalize() }, uLightCol: { value: new THREE.Color(1, 1, 1) }, uShadeCol: { value: new THREE.Color(0.5, 0.45, 0.66) },
    uRimCol: { value: new THREE.Color(0, 0, 0) }, uInk: { value: new THREE.Color(INK) },
    uFace: { value: 0 }, uTint: { value: new THREE.Vector4(0, 0, 0, 0) }, uHeadC: { value: new THREE.Vector4(0, 1, 0, 0.15) }, uBellyR: { value: 0.25 },
    uPatch: { value: Array.from({ length: 4 }, () => new THREE.Vector4(0, 0, 0, 0)) }, uPatchCol: { value: Array.from({ length: 4 }, () => new THREE.Color()) },
    uGrime: { value: 0 }, uGrain: { value: 0.05 }, uThick: { value: 0.0075 },
  };
  const fog = opts.fog !== false;
  const paint = new THREE.ShaderMaterial({ uniforms, vertexShader: vert, fragmentShader: frag, fog });
  const hull = new THREE.ShaderMaterial({ uniforms, vertexShader: hullVert, fragmentShader: hullFrag, fog, side: THREE.BackSide });
  return { paint, hull, uniforms };
}

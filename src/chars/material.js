import * as THREE from 'three';
import { lightingGLSL, DAY, INK, SUN } from '../shaders/toon.js';

// The paint for every character. The mesh is low-poly and carries only a flat color, a material id and baked
// occlusion per vertex; everything that reads as texture is computed here from the vertex's REST position, so it
// sticks to the character however it is posed: gouache mottling and speckles, knitted stitches, felt, fur strokes,
// stitched-on patches, dirt, and the face. Six rigid parts drive the mesh; each vertex blends two of them.
const skin = /* glsl */ `
attribute vec3 color; attribute vec2 fx; attribute vec2 bone; attribute float weight;
uniform mat4 uPart[8];   // rest -> world for body, head and the four limbs, then the two upper arms (6 left, 7 right)
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
uniform float uRig;      // 1 = lit by the game's shared rig (uLightCol is then only a tint); 0 = by uLightCol / uShadeCol
uniform float uFace;     // 0 happy crew, 1 zombie, 2 zombie dog, 3 at rest
uniform float uMood;     // a crew face's mood: 0 calm, 1 focused, 2 straining, 3 angry (see crewMood)
uniform float uFaceT;    // seconds, shared by all characters: animates the moods
uniform vec4 uTint;      // skin goes toward rgb by a (a body that got up)
uniform vec4 uHeadC;     // face center in rest space (xyz) and head radius
uniform vec4 uHeadC2;    // a second face (two zombies in one coat); radius 0 = none
uniform float uBellyR;   // for laying patches around the belly
uniform vec4 uPatch[4];  // stitched-on patches: angle around the body, height, half width, half height (0 = none)
uniform vec3 uPatchCol[4];
uniform vec4 uHatPatch;  // a patch sewn on the hat: angle around the head, height, half width, half height (0 = none)
uniform vec3 uHatPatchCol; uniform float uHatR;
uniform vec4 uWrap;      // cloth painted on the body: from y, to y, scallops around the lower edge, 1 = a knot in front (to <= from: none)
uniform vec3 uWrapCol;
uniform vec4 uHair;      // hair painted on the head: head center y, head radius, how far forward it reaches, 1 = on
uniform vec3 uHairCol;
uniform vec2 uBand;      // a ribbon painted around a felt hat: from y, to y
uniform vec3 uBandCol;
uniform vec4 uBarrel;    // a worn barrel: bottom y, top y, staves around, head depth squash (staves 0 = none)
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

// a square of cloth sewn on with visible stitches, laid around an upright axis at radius R
void sewn(inout vec3 col, inout float ink, vec3 p, float around, float R, vec4 pa, vec3 pc) {
  float da = around - pa.x; da = atan(sin(da), cos(da));
  vec2 q = vec2(da * R, p.y - pa.y), dd = abs(q) - pa.zw + 0.012;
  float d = length(max(dd, 0.0)) + min(max(dd.x, dd.y), 0.0) - 0.012;
  if (d < 0.0) col = pc * (0.86 + 0.14 * sin(q.x * 420.0) * sin(q.y * 420.0)) * (0.9 + 0.2 * fbm(p * 9.0));
  ink = max(ink, stroke(abs(d), 0.0035));
  float along = abs(dd.x) < abs(dd.y) ? q.y : q.x; // stitches straddle the edge
  if (abs(d) < 0.011) ink = max(ink, 0.9 * stroke(abs(fract(along / 0.022) - 0.5) * 0.022, 0.0028));
}

// A crew face changes with what the digger is doing (uMood, from the host): 0 calm, 1 focused (working, carrying: one
// eye squinted, brows knitted, the tip of the tongue out), 2 straining (a heavy load alone: flushed, eyes popping, teeth
// gritted, sweat flying), 3 angry (swinging the shovel at someone). uFaceT animates the tongue, sweat and pupils.
float gTongue, gSweat; // filled by faceAt next to its result: pink tongue, light blue sweat
float ellipse(vec2 q, vec2 r) { return length(q / r) - 1.0; }
vec4 crewMood(vec2 f, float s, float lw) {
  float ink = 0.0, white = 0.0, blush = 0.0, t = uFaceT;
  vec2 cheekL = vec2(-0.6, -0.02) * s, cheekR = vec2(0.6, -0.02) * s;
  float cheeks = max(smoothstep(0.17 * s, 0.06 * s, length(f - cheekL)), smoothstep(0.17 * s, 0.06 * s, length(f - cheekR)));
  if (uMood < 1.5) { // focused
    ink = max(ink, stroke(seg(f, vec2(-0.56, 0.34) * s, vec2(-0.26, 0.26) * s), lw));        // the squinted eye: a > shape
    ink = max(ink, stroke(seg(f, vec2(-0.56, 0.18) * s, vec2(-0.26, 0.26) * s), lw));
    ink = max(ink, smoothstep(0.075 * s, 0.05 * s, length(f - vec2(0.42, 0.26) * s)));        // the other: a small dot
    ink = max(ink, stroke(seg(f, vec2(-0.62, 0.48) * s, vec2(-0.24, 0.41) * s), lw));          // knitted brows
    ink = max(ink, stroke(seg(f, vec2(0.62, 0.52) * s, vec2(0.26, 0.44) * s), lw));
    ink = max(ink, stroke(seg(f, vec2(-0.12, -0.2) * s, vec2(0.28, -0.14) * s), lw));         // a tight little mouth
    vec2 tq = f - vec2(0.3 + 0.025 * sin(t * 5.0), -0.24) * s;                               // the tongue, wiggling
    float td = ellipse(tq, vec2(0.11, 0.09) * s);
    gTongue = smoothstep(0.08, -0.05, td);
    ink = max(ink, stroke(abs(td) * 0.1 * s, lw * 0.9) * step(tq.y, 0.03 * s));
    blush = 0.42 * cheeks;
  } else if (uMood < 2.5) { // straining
    for (int i = 0; i < 2; i++) {
      vec2 c = vec2(i == 0 ? -0.42 : 0.42, 0.25) * s, q = f - c;
      float r = 0.2 * s, d = length(q);
      white = max(white, smoothstep(r, r - lw, d));
      ink = max(ink, stroke(abs(d - r), lw));
      vec2 jig = vec2(sin(t * 37.0 + float(i)), cos(t * 31.0)) * 0.025 * s;                   // tiny pupils, trembling
      ink = max(ink, smoothstep(0.065 * s, 0.045 * s, length(q - jig)));
    }
    vec2 m = f - vec2(0.03, -0.34) * s, mh = vec2(0.36, 0.13) * s, dd = abs(m) - mh + 0.06 * s;
    float box = length(max(dd, 0.0)) + min(max(dd.x, dd.y), 0.0) - 0.06 * s;                 // a gritted-teeth grimace
    white = max(white, smoothstep(0.0, -lw, box));
    ink = max(ink, stroke(abs(box), lw));
    if (box < 0.0) ink = max(ink, max(stroke(abs(m.y), lw * 0.6), stroke(abs(fract(m.x / (0.13 * s) + 0.5) - 0.5) * 0.13 * s, lw * 0.6)));
    blush = 0.7 * smoothstep(1.15 * s, 0.45 * s, length(f - vec2(0.0, 0.05) * s)) + 0.25 * cheeks; // flushed red
    for (int i = 0; i < 3; i++) {                                                             // sweat drops running off
      float k = fract(t * 0.8 + float(i) * 0.37), side = i == 1 ? 1.0 : -1.0;
      vec2 c = vec2(side * (0.62 + 0.18 * k), 0.7 - 0.6 * k - float(i) * 0.05) * s, q = f - c;
      float d = length(vec2(q.x, max(q.y, 0.0) * 0.5 + min(q.y, 0.0))) - 0.075 * s;          // a teardrop, pointed up
      gSweat = max(gSweat, smoothstep(0.012 * s, -0.012 * s, d) * (1.0 - k * 0.5));
      ink = max(ink, stroke(abs(d), lw * 0.7) * (1.0 - k * 0.5));
    }
  } else { // angry
    ink = max(ink, stroke(seg(f, vec2(-0.64, 0.47) * s, vec2(-0.18, 0.33) * s), lw * 1.5));    // V brows
    ink = max(ink, stroke(seg(f, vec2(0.64, 0.47) * s, vec2(0.18, 0.33) * s), lw * 1.5));
    for (int i = 0; i < 2; i++) {                                                             // narrow fierce eyes
      vec2 q = f - vec2(i == 0 ? -0.4 : 0.4, 0.21) * s;
      ink = max(ink, smoothstep(0.012, -0.012, ellipse(q, vec2(0.13, 0.05) * s)));
    }
    vec2 m = f - vec2(0.05, -0.34) * s;
    float mo = ellipse(m, vec2(0.2 + 0.02 * sin(t * 18.0), 0.16) * s);                        // shouting
    gTongue = smoothstep(0.03, -0.03, ellipse(m - vec2(0.0, -0.08) * s, vec2(0.13, 0.065) * s)) * step(mo, -0.12);
    ink = max(ink, smoothstep(0.02, -0.02, mo) * (1.0 - gTongue));                           // the open mouth, tongue inside
    vec2 a = f - vec2(0.72, 0.18) * s;                                                        // the little anger mark, on the temple
    for (int i = 0; i < 4; i++) {
      vec2 dir = vec2(i < 2 ? 1.0 : -1.0, mod(float(i), 2.0) < 0.5 ? 1.0 : -1.0);
      vec2 c = dir * 0.1 * s; // four arcs curving in toward the middle, like a popping vein
      ink = max(ink, stroke(abs(length(a - c) - 0.075 * s), lw * 0.8) * step(dot(a - c, dir), -0.02 * s));
    }
    blush = 0.3 * cheeks;
  }
  return vec4(ink, white, 0.0, blush);
}

// The crew's little button nose, painted like the rest of the face: a slightly darker oval, an ink curve along its
// underside and a soft highlight on top. Added to whatever face r is (any mood).
vec4 withNose(vec4 r, vec2 f, float s, float lw) {
  vec2 q = f - vec2(0.0, -0.05) * s;
  float nd = ellipse(q, vec2(0.13, 0.11) * s);
  float inside = smoothstep(0.06, -0.06, nd);
  float under = stroke(abs(nd) * 0.12 * s, lw * 0.85) * smoothstep(0.02 * s, -0.04 * s, q.y);   // the ink only underneath
  float shine = smoothstep(0.045 * s, 0.02 * s, length(q - vec2(-0.04, 0.035) * s));
  return vec4(max(r.x, under), max(r.y * (1.0 - inside), shine * 0.7), max(r.z, 0.18 * inside), r.w * (1.0 - inside));
}

// The face is painted onto the front of the head. Returns ink (x), eye white (y), shade (z), blush (w).
vec4 faceAt(vec3 p, vec4 uHeadC) {
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
  if (uFace < 0.5 && uMood > 0.5) return withNose(crewMood(f, s, lw), f, s, lw); // working, straining or fighting (see crewMood)
  if (uFace < 0.5) { // calm: closed happy eyes, a lopsided smile, rosy cheeks
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
  return uFace < 0.5 ? withNose(vec4(ink, white, shade, blush), f, s, lw) : vec4(ink, white, shade, blush);
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
    for (int i = 0; i < 4; i++) if (uPatch[i].z > 0.0) sewn(col, ink, p, around, uBellyR, uPatch[i], uPatchCol[i]);
    gTongue = 0.0; gSweat = 0.0;
    vec4 fc = faceAt(p, uHeadC);
    if (uHeadC2.w > 0.0) fc = max(fc, faceAt(p, uHeadC2));
    col = mix(col, vec3(0.86, 0.5, 0.55), fc.w) * (1.0 - fc.z);
    col = mix(col, vec3(0.93, 0.92, 0.84), fc.y);
    col = mix(col, vec3(0.9, 0.36, 0.45), gTongue);
    col = mix(col, vec3(0.6, 0.82, 0.96), gSweat);
    ink = max(ink, fc.x);
  } else if (id == 2) col *= knit(around * 0.16 + p.x * 0.3, p.y, 46.0, 62.0);                     // scarf: chunky stitches
  else if (id == 3) col *= knit(around * 0.16, p.y, 60.0, 74.0);                                    // knitted hat
  else if (id == 17) { // the fringe at the end of a scarf: loose strands with dark gaps between them
    col *= knit(around * 0.16 + p.x * 0.3, p.y, 46.0, 62.0) * (0.9 + 0.2 * hash1(vec3(floor(p.x / 0.017), 1.0, 2.0)));
    ink = max(ink, 0.9 * smoothstep(0.3, 0.44, abs(fract(p.x / 0.017) - 0.5)));
  }
  else if (id == 4) col *= 0.82 + 0.18 * smoothstep(-0.3, 0.3, sin(around * 38.0 + p.x * 30.0));    // ribbed cuff or band
  else if (id == 5) col *= knit(p.x + p.z, p.y, 70.0, 84.0);                                        // mitten
  else if (id == 7) col *= mix(0.62, 1.0, smoothstep(0.012, 0.028, p.y)) * (1.0 + 0.25 * smoothstep(0.6, 0.9, N.y)); // boot: dark sole, worn top
  else if (id == 9) col *= 0.82 + 0.18 * vnoise(vec3(around * 26.0, p.y * 6.0, 1.0));               // hair: strands
  else if (id == 10) col *= 0.92 + 0.12 * vnoise(p * 90.0);                                         // felt
  else if (id == 11) col *= 0.82 + 0.26 * vnoise(p * 60.0);                                         // pompom fluff
  else if (id == 12) { // fur: strokes along the body, mouldy blotches, and the face
    col *= 0.84 + 0.2 * vnoise(vec3(p.x * 46.0, p.y * 46.0, p.z * 9.0));
    col = mix(col, col * vec3(0.7, 0.8, 0.62), uGrime * smoothstep(0.48, 0.66, fbm(p * 4.0 + 7.0)));
    vec4 fc = faceAt(p, uHeadC);
    col = mix(col * (1.0 - fc.z), vec3(0.93, 0.92, 0.84), fc.y);
    ink = max(ink, fc.x);
  }
  else if (id == 13) { // wood
    if (uBarrel.z > 0.0 && p.y > uBarrel.x - 0.01) {
      // a barrel is all paint: every stave its own shade with grain running up it, dark seams between staves,
      // two iron hoops with a highlight and a rivet on each stave
      float a = atan(p.x, p.z / uBarrel.w) / 6.2831853 * uBarrel.z + 0.5, stave = floor(a), fa = fract(a) - 0.5;
      float h = (p.y - uBarrel.x) / (uBarrel.y - uBarrel.x);
      col *= 0.82 + 0.3 * hash1(vec3(stave, 3.0, 7.0));
      col *= 0.86 + 0.2 * vnoise(vec3(stave * 7.0 + fa * 5.0, p.y * 55.0, 1.0)) - 0.1 * smoothstep(0.75, 1.0, vnoise(vec3(stave * 3.0, p.y * 9.0, fa * 6.0)));
      ink = max(ink, 0.85 * smoothstep(0.455, 0.49, abs(fa)));          // the seam between two staves
      col *= 1.0 - 0.25 * smoothstep(0.3, 0.46, abs(fa));               // each stave rounds off toward its edges
      for (int i = 0; i < 2; i++) {
        float hy = (i == 0 ? 0.2 : 0.7), d = abs(h - hy) * (uBarrel.y - uBarrel.x), w = 0.028;
        if (d < w) {
          col = vec3(0.105, 0.1, 0.13) * (0.8 + 0.5 * vnoise(p * 40.0)) + vec3(0.16, 0.16, 0.2) * smoothstep(0.4, 0.0, abs(d / w - 0.35));
          float rv = length(vec2(fa * 0.2, (h - hy) * (uBarrel.y - uBarrel.x)));
          col = mix(col, vec3(0.34, 0.33, 0.4), smoothstep(0.011, 0.007, rv));   // rivet head
          ink = max(ink, 0.8 * smoothstep(0.011, 0.013, rv) * smoothstep(0.016, 0.013, rv));
        }
        ink = max(ink, 0.9 * smoothstep(0.006, 0.002, abs(d - w)));     // the hoop's edge
      }
    } else col *= 0.8 + 0.25 * vnoise(vec3(p.x * 8.0, p.y * 70.0, p.z * 8.0)); // plain turned wood
  }
  else if (id == 15) col *= 0.9 + 0.1 * sin(p.x * 300.0) * sin(p.y * 300.0);                        // woven cloth
  else if (id == 16) col *= 0.85 + 0.5 * pow(max(dot(N, normalize(uLightDir + vec3(0.0, 0.4, 0.0))), 0.0), 6.0);    // iron: a dull glint

  if (uBand.y > uBand.x && id == 10 && p.y > uBand.x && p.y < uBand.y) { // the ribbon on a felt hat
    col = uBandCol * (0.88 + 0.12 * sin(p.y * 500.0)) * (0.9 + 0.2 * fbm(p * 7.0));
    ink = max(ink, 0.8 * stroke(min(p.y - uBand.x, uBand.y - p.y), 0.004));
  }
  if (uHair.w > 0.5 && id == 1) { // hair lies on the back and sides of the head, with a ragged edge toward the face
    vec3 h = p - vec3(uHeadC.x, uHair.x, uHeadC.z - uHeadC.w * 0.225);
    float edge = uHair.z + 0.018 * sin(p.y * 46.0) + 0.012 * sin(p.y * 113.0 + 1.0), d = h.z - edge;
    if (length(h) < uHair.y * 1.45 && h.y > -uHair.y * 1.25) {
      if (d < 0.0) col = uHairCol * (0.8 + 0.25 * vnoise(vec3(around * 30.0, p.y * 5.0, 1.0))) * (0.9 + 0.2 * fbm(p * 7.0));
      ink = max(ink, 0.85 * stroke(abs(d), 0.0045));
    }
  }
  if (uWrap.y > uWrap.x && (id == 1 || id == 15) && length(p.xz) < uBellyR * 1.3) { // a shawl, or the patch over an empty neck
    float low = uWrap.x + (uWrap.z > 0.0 ? 0.032 * cos(around * uWrap.z) : 0.0);
    if (p.y > low && p.y < uWrap.y) col = uWrapCol * (0.88 + 0.12 * sin(p.x * 300.0) * sin(p.y * 300.0)) * (0.9 + 0.2 * fbm(p * 7.0));
    if (p.y < uWrap.y) ink = max(ink, 0.85 * stroke(abs(p.y - low), 0.0045));
    if (uWrap.w > 0.5 && p.z > 0.0) { // the knot
      float k = length(vec2(p.x, p.y - uWrap.y + 0.075)) - 0.042;
      if (k < 0.0) col = uWrapCol * 0.82 * (0.9 + 0.2 * fbm(p * 9.0));
      ink = max(ink, 0.85 * stroke(abs(k), 0.004));
    }
    if (uWrap.z <= 0.0 && p.y > low + 0.012) ink = max(ink, 0.8 * cross2(p.xz, 0.035, 0.005)); // a cross of thread on the patch
  }
  if (uHatPatch.z > 0.0 && (id == 3 || id == 10)) sewn(col, ink, p, atan(p.x - uHeadC.x, p.z - uHeadC.z + uHeadC.w * 0.225), uHatR, uHatPatch, uHatPatchCol);
  if (uGrime > 0.0 && id != 1) { // earth on everything that came out of the ground, thicker toward the feet and hands
    float low = smoothstep(0.42, 0.0, p.y) * 0.7 + 0.25;
    col = mix(col, vec3(0.2, 0.15, 0.1), uGrime * low * smoothstep(0.45, 0.75, fbm(p * 9.0 + 2.0)));
  }

  // soft storybook light: a wide wrapped gradient with a hint of painted steps, tinted shadows, baked occlusion
  float lit = smoothstep(-0.35, 0.75, dot(N, uLightDir));
  lit = floor(lit * 3.0 + 0.5) / 3.0 * 0.3 + lit * 0.7;
  vec3 V = normalize(cameraPosition - vW);
  float edge = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 3.0);
  if (uRig > 0.5) {
    // in the game: the shared rig (docs/lighting-guide.md) with these soft bands; the key also rims the edges that
    // face it, so a figure against the moon or the low sun gets a bright outline
    float sh, occ = mix(0.5, 1.0, vFx.y);
    vec3 nat = rigNatural(N, vW, lit, lit, sh) * uLightCol * occ;
    nat += rigKey() * edge * smoothstep(-0.45, 0.25, dot(N, uLightDir)) * (0.25 + 0.75 * sh) * 0.7 * (1.0 - roofed(vW));
    nat += uRimCol * edge * (1.0 - 0.6 * lit);
    col = nightEye(col) * nat + col * rigPractical(N, vW) * mix(0.6, 1.0, vFx.y);
  } else {
    // the cast page: one key and one shade color
    vec3 light = mix(uShadeCol, uLightCol, lit) * mix(0.5, 1.0, vFx.y);
    light += uRimCol * edge * (1.0 - 0.6 * lit);
    light += lanternLight(vW, N) * mix(0.6, 1.0, vFx.y);
    col *= light;
  }
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

// the clock every face's mood animation runs on (the view sets it each frame)
export const FACE_T = { value: 0 };

// Two materials sharing one set of uniforms: the paint and the ink hull.
export function characterMaterials(opts = {}) {
  const uniforms = {
    ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog), uDay: DAY, ...SUN,
    uPart: { value: Array.from({ length: 8 }, () => new THREE.Matrix4()) }, uNoHead: { value: 0 },
    uLightDir: { value: new THREE.Vector3(-0.4, 0.7, 0.5).normalize() }, uLightCol: { value: new THREE.Color(1, 1, 1) }, uShadeCol: { value: new THREE.Color(0.5, 0.45, 0.66) },
    uRimCol: { value: new THREE.Color(0, 0, 0) }, uInk: { value: new THREE.Color(INK) }, uRig: { value: 0 },
    uFace: { value: 0 }, uMood: { value: 0 }, uFaceT: FACE_T, uTint: { value: new THREE.Vector4(0, 0, 0, 0) }, uHeadC: { value: new THREE.Vector4(0, 1, 0, 0.15) }, uHeadC2: { value: new THREE.Vector4(0, 0, 0, 0) }, uBellyR: { value: 0.25 },
    uPatch: { value: Array.from({ length: 4 }, () => new THREE.Vector4(0, 0, 0, 0)) }, uPatchCol: { value: Array.from({ length: 4 }, () => new THREE.Color()) },
    uHatPatch: { value: new THREE.Vector4(0, 0, 0, 0) }, uHatPatchCol: { value: new THREE.Color() }, uHatR: { value: 0.15 },
    uWrap: { value: new THREE.Vector4(0, 0, 0, 0) }, uWrapCol: { value: new THREE.Color() }, uHair: { value: new THREE.Vector4(0, 0, 0, 0) }, uHairCol: { value: new THREE.Color() },
    uBand: { value: new THREE.Vector2(0, 0) }, uBandCol: { value: new THREE.Color() },
    uBarrel: { value: new THREE.Vector4(0, 0, 0, 1) }, uGrime: { value: 0 }, uGrain: { value: 0.05 }, uThick: { value: 0.0075 },
  };
  const fog = opts.fog !== false;
  const paint = new THREE.ShaderMaterial({ uniforms, vertexShader: vert, fragmentShader: frag, fog });
  const hull = new THREE.ShaderMaterial({ uniforms, vertexShader: hullVert, fragmentShader: hullFrag, fog, side: THREE.BackSide });
  // the sun's shadow pass (view/sun.js) draws the posed character with this: same skinning, no paint
  paint.userData.depthMat = new THREE.ShaderMaterial({ uniforms, vertexShader: vert, fragmentShader: 'void main() { gl_FragColor = vec4(1.0); }' });
  return { paint, hull, uniforms };
}

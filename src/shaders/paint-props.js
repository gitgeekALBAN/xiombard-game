import * as THREE from 'three';
import { lightingGLSL, DAY, INK } from './toon.js';
import { noise } from './noise.glsl.js';
import { PAL } from '../view/palette.js';
import { COFFIN } from '../shared/layout.js';

// One paint for the props (coffins, headstones, the truck). The meshes are plain solids that carry only the
// silhouette; everything smaller than that (plank seams, wood grain, striped trim, nails and rivets, iron bands,
// pleated lining, bevels, carved motifs, inscriptions, cracks, moss, windows, the grille, spokes, hubcaps,
// curls) is painted here from a per-vertex paint space, so one object is one draw call plus its ink hull.
// Per vertex: color (base color, linear), aK = (paint id, three params), aQ = four more params,
// aP = position in the paint space of the part (meters), aRig = which moving part it rides on (truck only).
// Lighting is the shared toon lighting (lightingGLSL) with the shared day/night uniform, like toon().

export const PAINT = {
  PLAIN: 1, // aK = (1, mottle, rim, emissive)
  COFFIN_WOOD: 10, COFFIN_LINING: 11, COFFIN_RAIL: 12,
  STONE: 20,
  TRUCK_BODY: 30, TRUCK_FLOOR: 31, TRUCK_RAIL: 32, RADIATOR: 33, LAMP: 34, SKULL: 35, WHEEL: 36, GATE: 37,
};

const V = (hex) => { const c = new THREE.Color(hex); return `vec3(${c.r.toFixed(4)}, ${c.g.toFixed(4)}, ${c.b.toFixed(4)})`; };
const f = (x) => x.toFixed(4);

// coffin outline (same numbers as buildCoffin): corners for the iron posts, handle plates on the long sides
const { hx, hz } = COFFIN;
const CO = [[-0.6 * hx, -hz], [0.6 * hx, -hz], [hx, 0.42 * hz], [0.72 * hx, hz], [-0.72 * hx, hz], [-hx, 0.42 * hz]];
const HANDLES = [];
for (const [a, b] of [[CO[1], CO[2]], [CO[5], CO[0]]]) for (const t of [0.3, 0.72]) HANDLES.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);

const vert = /* glsl */ `
attribute vec3 color; attribute vec4 aK; attribute vec4 aQ; attribute vec3 aP;
varying vec3 vN; varying vec3 vW; varying vec3 vCol; varying vec4 vK; varying vec4 vQ; varying vec3 vP; varying vec3 vON;
#ifdef RIG
attribute float aRig;
uniform vec3 uPivot[6]; uniform float uSpin; uniform float uGate;
#endif
#include <common>
#include <fog_pars_vertex>
mat3 rotZ(float a) { float c = cos(a), s = sin(a); return mat3(c, s, 0.0, -s, c, 0.0, 0.0, 0.0, 1.0); }
void main() {
  vec3 pos = position, nor = normal;
  #ifdef RIG
  int r = int(aRig + 0.5);
  if (r > 0) { mat3 R = rotZ(r == 5 ? uGate : uSpin); pos = uPivot[r] + R * (pos - uPivot[r]); nor = R * nor; }
  #endif
  vec4 w = modelMatrix * vec4(pos, 1.0); vW = w.xyz;
  vN = normalize(mat3(modelMatrix) * nor);
  vON = normal; vCol = color; vK = aK; vQ = aQ; vP = aP;
  vec4 mvPosition = viewMatrix * w;
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}`;

const frag = /* glsl */ `
varying vec3 vN; varying vec3 vW; varying vec3 vCol; varying vec4 vK; varying vec4 vQ; varying vec3 vP; varying vec3 vON;
#include <common>
#include <fog_pars_fragment>
${noise}
${lightingGLSL}
const vec3 INKC = ${V(INK)};
float h1(float x) { return fract(sin(x * 127.1 + 1.7) * 43758.5453); }
float h2(vec2 x) { return fract(sin(dot(x, vec2(127.1, 311.7))) * 43758.5453); }
float sdBox(vec2 p, vec2 b) { vec2 d = abs(p) - b; return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0); }
float sdRound(vec2 p, vec2 b, float r) { return sdBox(p, b - r) - r; }
float sdSeg(vec2 p, vec2 a, vec2 b) { vec2 pa = p - a, ba = b - a; return length(pa - ba * clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0)); }
mat2 rot2(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }
// anti-aliased fill of a signed distance (negative inside), aa from the screen derivative
float fill(float d) { float aa = max(fwidth(d), 1e-4) * 0.75; return smoothstep(aa, -aa, d); }
float line(float d, float w) { return fill(abs(d) - w); }

// The painted curl (curlPts in propkit.js): a spiral of 'turns' turns out to radius r, then a tail that swings down.
// Returns a signed distance to the brush stroke, whose width swells from w0 to w0 + w1 and thins again.
float curlSD(vec2 q, float r, float turns, float tail, float w0, float w1) {
  float A = turns * 6.2831853, best = 1e3;
  float th = atan(q.y, q.x); if (th < 0.0) th += 6.2831853;
  float rho = length(q);
  for (int k = 0; k < 3; k++) {
    float a = th + 6.2831853 * float(k);
    if (a > A) break;
    float t = a / A, rr = r * (0.12 + 0.88 * t);
    float w = w0 + w1 * sin(3.14159 * min(1.0, t * 0.78 * 1.2));
    best = min(best, abs(rho - rr) - w * 0.5);
  }
  vec2 e = vec2(cos(A), sin(A)) * r, prev = e;
  for (int i = 1; i <= 4; i++) {
    float t = float(i) / 4.0;
    vec2 c = e + vec2(r * tail * 0.5 * sin(t * 3.14159 * 1.25), -r * tail * t * 1.1);
    float w = w0 + w1 * sin(3.14159 * min(1.0, (0.78 + 0.22 * t) * 1.2));
    best = min(best, sdSeg(q, prev, c) - w * 0.5 * (1.0 - 0.6 * t));
    prev = c;
  }
  return best;
}

// ---------------- headstones ----------------
// Outline of the stone's face in its own unsheared space (x across, y up), negative inside.
// kind 0 round, 1 slab, 2 cross, 3 obelisk; Q = (w, h, plinth height, extra: slab chamfer / cross pedestal height)
float stoneOutline(int kind, vec2 p, vec4 Q) {
  float w = Q.x, h = Q.y, ph = Q.z, y0 = ph - 0.02;
  if (kind == 0) {
    float hw = w * 0.5, r = hw - 0.06, yc = h - r - 0.025;
    float body = sdBox(p - vec2(0.0, (y0 + yc) * 0.5), vec2(hw, (yc - y0) * 0.5));
    return min(body, length(p - vec2(0.0, yc + 0.012)) - r - 0.025);
  }
  if (kind == 1) {
    float hw = w * 0.5, top = h, c = Q.w;
    vec2 q = vec2(abs(p.x), p.y);
    float d = sdBox(p - vec2(0.0, (y0 + top) * 0.5), vec2(hw, (top - y0) * 0.5));
    return max(d, (q.x + q.y - (hw + top - c - 0.01)) * 0.7071);
  }
  if (kind == 2) {
    float b = 0.022, y1 = ph + Q.w - 0.03, top = h, bw = clamp(w * 0.12, 0.065, 0.095), aw = w * 0.5, ay = y1 + (top - b - y1) * 0.66;
    float v = sdBox(p - vec2(0.0, (y1 + top) * 0.5), vec2(bw + b, (top - y1) * 0.5));
    float a = sdBox(p - vec2(0.0, ay), vec2(aw, bw * 1.2 + b));
    return min(v, a);
  }
  return 1.0;
}

// Carved (into the stone) and raised (out of it) motifs, as distances around the motif's center, scale s.
// Returns (carved distance, raised distance).
vec2 motifSD(int kind, vec2 q, float s) {
  float carve = 1e3, raised = 1e3;
  q /= s;
  if (kind == 0) { // skull and crossbones
    raised = min(length(q / vec2(0.07, 0.072)) - 1.0, 1e3) * 0.07;
    raised = min(raised, sdRound(q - vec2(0.0, -0.066), vec2(0.0375, 0.02), 0.008));
    carve = min(length(vec2(abs(q.x) - 0.028, q.y + 0.002 / s)) - 0.019, length(q - vec2(0.0, -0.035)) - 0.008);
    carve = min(carve, sdBox(vec2(abs(q.x) - 0.012, q.y + 0.074), vec2(0.004, 0.012)));
    vec2 a = vec2(abs(q.x), q.y + 0.02);
    float bones = sdSeg(a, vec2(-0.13, -0.11), vec2(0.13, 0.11)) - 0.01;
    bones = min(bones, length(a - vec2(0.135, 0.115)) - 0.017);
    bones = min(bones, length(a - vec2(0.135, -0.115)) - 0.017);
    // the bones pass behind the skull
    carve = min(carve, max(bones, -(raised - 0.006)));
  } else if (kind == 1) { // two curls and a dot
    for (int i = 0; i < 2; i++) {
      float sx = i == 0 ? -1.0 : 1.0;
      vec2 c = q - vec2(sx * 0.075, 0.0);
      c.x *= -sx;
      carve = min(carve, curlSD(c, 0.05, 1.5, 1.1, 0.006, 0.012));
    }
    carve = min(carve, length(q - vec2(0.0, -0.06)) - 0.014);
  } else if (kind == 2) { // cross
    carve = min(sdBox(q, vec2(0.015, 0.1)), sdBox(q - vec2(0.0, 0.035), vec2(0.065, 0.015)));
  } else if (kind == 3) { // heart
    vec2 h = vec2(abs(q.x), q.y + 0.07) / 0.14;
    float d;
    if (h.y + h.x > 1.0) d = sqrt(dot(h - vec2(0.25, 0.75), h - vec2(0.25, 0.75))) - sqrt(2.0) / 4.0;
    else d = sqrt(min(dot(h - vec2(0.0, 1.0), h - vec2(0.0, 1.0)), dot(h - 0.5 * max(h.x + h.y, 0.0), h - 0.5 * max(h.x + h.y, 0.0)))) * sign(h.x - h.y);
    carve = d * 0.14;
  } else if (kind == 4) { // crescent moon and two stars
    carve = max(length(q) - 0.07, -(length(q - vec2(0.035, 0.0)) - 0.055));
    carve = min(carve, min(length(q - vec2(0.06, 0.05)) - 0.009, length(q - vec2(0.09, -0.02)) - 0.009));
  } else if (kind == 5) { // a plain round carved dot
    carve = length(q) - 0.035;
  }
  return vec2(carve, raised) * s;
}

// rows of carved lettering: short strokes in cells, every row a little shorter than the one above
float letters(vec2 p, vec2 at, float width, float n, float seed) {
  float d = 1e3;
  float row = floor((at.y - p.y) / 0.055 + 0.5);
  if (row < 0.0 || row >= n) return d;
  float y = at.y - row * 0.055, ww = width * (1.0 - row * 0.18) * (0.8 + 0.2 * h1(seed + row * 3.1));
  if (abs(p.x - at.x) > ww * 0.5) return d;
  float cw = 0.026, cell = floor((p.x - at.x + ww * 0.5) / cw);
  float g = h1(seed * 1.3 + row * 17.0 + cell * 5.7);
  vec2 c = vec2(p.x - (at.x - ww * 0.5 + (cell + 0.5) * cw), p.y - y);
  if (g < 0.12) return d; // a gap between words
  d = sdSeg(c, vec2(-0.006, -0.009), vec2(-0.006 + 0.012 * step(0.5, g), 0.009)) - 0.0028;
  d = min(d, sdSeg(c, vec2(0.006, -0.009), vec2(0.006 - 0.012 * step(0.7, fract(g * 7.0)), 0.009)) - 0.0028);
  if (fract(g * 13.0) < 0.5) d = min(d, sdSeg(c, vec2(-0.007, 0.0), vec2(0.007, 0.0)) - 0.0025);
  return d;
}

// a zigzag crack running in from an edge of the face
float crackSD(vec2 p, vec2 o, float dir, float len, float seed) {
  float x = (p.x - o.x) * dir;
  if (x < -0.01 || x > len + 0.01) return 1e3;
  float t = clamp(x / len, 0.0, 1.0), k = t * 4.0, i = floor(k), fk = k - i;
  float a = (h1(seed + i) - 0.55) * 0.11 * min(i, 1.0), b = (h1(seed + i + 1.0) - 0.55) * 0.11;
  float yy = 0.0;
  for (int j = 1; j < 4; j++) if (float(j) <= i) yy += (h1(seed + float(j)) - 0.55) * 0.11;
  float y = o.y + yy + mix(0.0, b, fk);
  return abs(p.y - y) - (0.008 * (1.0 - t) + 0.0015);
}

void stonePaint(inout vec3 col, inout float ink, vec3 p, vec3 on) {
  int kind = int(vK.y + 0.5), motif = int(vK.z + 0.5);
  float flags = vK.w, seed = fract(vQ.x * 13.7 + vQ.y * 7.3 + vQ.z * 31.1) * 100.0;
  bool blank = mod(flags, 2.0) > 0.5, cracked = mod(floor(flags / 2.0), 2.0) > 0.5;
  float nl = floor(flags / 8.0);
  float w = vQ.x, h = vQ.y, ph = vQ.z, y0 = ph - 0.02;
  // weathering: lichen and moss creep up from the ground and settle on the top edges
  float m = fbm(p.xy * 9.0 + p.z * 3.0 + seed);
  float moss = smoothstep(0.55, 0.75, m) * (smoothstep(0.35, 0.05, p.y) + smoothstep(h - 0.25, h, p.y) * 0.8 + 0.25);
  col = mix(col, vec3(0.06, 0.085, 0.045), clamp(moss, 0.0, 1.0) * 0.6);
  col *= 0.94 + 0.12 * vnoise(p.xy * 60.0 + seed);   // grit
  if (vnoise(p.xy * 110.0 + p.z * 40.0 + seed) > 0.86) col *= 0.82; // pits
  bool front = on.z > 0.6 && p.y > ph + 0.005;
  if (!front) {
    return;
  }
  vec2 q = p.xy;
  // painted bevel: the rim of the face catches light along its top, falls into shade along its bottom
  float so = stoneOutline(kind, q, vQ);
  if (so < 0.002) {
    float e = 0.004;
    vec2 gr = normalize(vec2(stoneOutline(kind, q + vec2(e, 0.0), vQ) - so, stoneOutline(kind, q + vec2(0.0, e), vQ) - so) + 1e-6);
    float band = smoothstep(-0.03, -0.022, so);
    col *= 1.0 + band * (0.28 * gr.y - 0.1 * gr.x - 0.05);
    ink = max(ink, 0.55 * line(so + 0.03, 0.0018) * (0.6 + 0.4 * vnoise(q * 40.0)));
  }
  float carve = 1e3, rais = 1e3;
  if (kind == 0) {
    float hw = w * 0.5 - 0.025, r = hw - 0.035, yc = h - 0.025 - r;
    if (!blank) {
      vec2 md = motifSD(motif, q - vec2(0.0, yc + r * 0.25), min(1.0, w * 1.4));
      carve = min(carve, md.x); rais = min(rais, md.y);
      carve = min(carve, letters(q, vec2(0.0, yc - 0.1), hw * 1.1, nl, seed));
    }
    if (cracked) carve = min(carve, crackSD(q, vec2(mod(seed, 2.0) < 1.0 ? -hw - 0.03 : hw + 0.03, y0 + 0.15 + (yc - y0 - 0.15) * h1(seed + 9.0)), mod(seed, 2.0) < 1.0 ? 1.0 : -1.0, 0.22, seed));
  } else if (kind == 1) {
    float hw = w * 0.5 - 0.025, top = h - 0.025, fw = hw - 0.06, fy0 = y0 + 0.08, fy1 = top - 0.07;
    // raised frame around the inscription panel
    float fr = abs(sdBox(q - vec2(0.0, (fy0 + fy1) * 0.5), vec2(fw, (fy1 - fy0) * 0.5))) - 0.0125;
    rais = min(rais, fr);
    if (!blank) {
      vec2 md = motifSD(motif, q - vec2(0.0, fy1 - 0.15), 0.9);
      carve = min(carve, md.x); rais = min(rais, md.y);
      carve = min(carve, letters(q, vec2(0.0, fy1 - 0.33), fw * 1.2, nl, seed));
    }
    if (cracked) carve = min(carve, crackSD(q, vec2(-hw - 0.03, y0 + 0.1 + (top - y0 - 0.3) * h1(seed + 9.0)), 1.0, 0.18, seed));
  } else if (kind == 2) {
    float pH = vQ.w, y1 = ph + pH - 0.03, top = h - 0.022, bw = clamp(w * 0.12, 0.065, 0.095), ay = y1 + (top - y1) * 0.66;
    if (q.y < y1 + 0.02) carve = min(carve, letters(q, vec2(0.0, ph + pH * 0.6), w * 0.3, 1.0, seed));
    else {
      vec2 md = motifSD(motif, q - vec2(0.0, ay), 0.6);
      carve = min(carve, md.x); rais = min(rais, md.y);
      if (cracked) carve = min(carve, crackSD(q, vec2(bw, y1 + 0.1 + (ay - y1 - 0.25) * h1(seed + 9.0)), -1.0, 0.1, seed));
    }
  } else {
    float pH = 0.24, y1 = ph + pH - 0.02, sb = min(0.24, w * 0.4), st = sb * 0.62, tipH = sb * 0.85, H = h - y1 - tipH;
    if (q.y < y1) carve = min(carve, letters(q, vec2(0.0, ph + pH * 0.62), min(0.42, w * 0.62) * 0.6, 2.0, seed));
    else {
      vec2 md = motifSD(motif, q - vec2(0.0, y1 + H * 0.68), 0.75);
      carve = min(carve, md.x); rais = min(rais, md.y);
      if (cracked) carve = min(carve, crackSD(q, vec2(-sb * 0.5, y1 + H * (0.15 + 0.25 * h1(seed + 9.0))), 1.0, 0.1, seed));
    }
  }
  // raised relief: a lighter face with an ink edge, sitting in a soft shadow on the stone
  if (rais < 0.03) {
    float rin = fill(rais);
    col *= 1.0 - 0.22 * (fill(rais - 0.007) - rin);
    col *= 1.0 + 0.18 * rin * (0.7 + 0.6 * smoothstep(-0.02, 0.0, -rais));
    ink = max(ink, 0.6 * line(rais, 0.0016));
  }
  // carved grooves: dark, with a pale chipped lip around them
  if (carve < 0.01) {
    float cin = fill(carve);
    col *= 1.0 + 0.22 * (fill(carve - 0.0035) - cin);
    col = mix(col, ${V('#353048')} * (0.9 + 0.2 * vnoise(q * 80.0)), cin * 0.92);
  }
}

// ---------------- coffins ----------------
const vec2 CO[6] = vec2[](${CO.map(([x, z]) => `vec2(${f(x)}, ${f(z)})`).join(', ')});
const vec2 HANDLE[4] = vec2[](${HANDLES.map(([x, z]) => `vec2(${f(x)}, ${f(z)})`).join(', ')});
void coffinWood(inout vec3 col, inout float ink, vec3 p, vec3 on) {
  float seed = vK.z;
  float along = abs(on.x) > abs(on.z) ? p.z : p.x;
  // planks: a seam every 1/7 m, a little crooked; each plank its own tone, grain running along it, a knot now and then
  float py = (p.y + ${f(COFFIN.hy)}) * 7.0 + 0.04 * sin(along * 9.0 + floor((p.y + 0.3) * 7.0) * 2.0);
  float plank = floor(py), fy = fract(py);
  col *= 0.86 + 0.24 * h1(plank * 3.7 + seed + floor(along * 1.5) * 0.0);
  col *= 0.86 + 0.24 * vnoise(vec2(along * 5.0 + plank * 13.0, fy * 9.0 + seed)) * vnoise(vec2(along * 1.3, fy * 30.0 + plank));
  float knot = length((vec2(fract(along * 1.7 + plank * 0.37) - 0.5, fy - 0.5)) * vec2(1.0, 0.35));
  col *= 1.0 - 0.3 * smoothstep(0.07, 0.03, knot) * step(0.6, h1(plank + seed * 3.0));
  col = mix(col, ${V(PAL.plumDark)}, line(abs(fy - 0.5) - 0.5, 0.06) * 0.85);
  ink = max(ink, 0.35 * line(fy - 0.0, 0.025));
  // distance to the nearest corner post along the wall
  float dc = 1e3;
  for (int i = 0; i < 6; i++) dc = min(dc, length(p.xz - CO[i]));
  // nails at each plank's ends, beside the posts
  float nail = length(vec2(dc - 0.065, (fy - 0.5) / 7.0));
  col = mix(col, ${V('#6a6478')}, fill(nail - 0.0075));
  ink = max(ink, 0.7 * line(nail - 0.0075, 0.0016));
  // iron: one band or two, with rivets; corner posts; plates where the handles hang
  vec3 iron = ${V('#3c3848')} * (0.85 + 0.3 * vnoise(p.xz * 30.0 + p.y * 9.0));
  float band = 1e3;
  if (vK.y < 0.5) band = abs(p.y + 0.03) - 0.028;
  else band = min(abs(p.y + 0.11), abs(p.y - 0.07)) - 0.028;
  float post = dc - 0.028;
  float ir = min(band, post);
  for (int i = 0; i < 4; i++) {
    vec2 d = vec2(length(p.xz - HANDLE[i]), p.y - 0.035);
    ir = min(ir, sdBox(d, vec2(0.026, 0.026)));
    float bolt = length(d - vec2(0.0, 0.0)) - 0.007;
    col = mix(col, ${V('#7a7488')}, fill(bolt) * fill(sdBox(d, vec2(0.026))));
  }
  if (ir < 0.01) {
    float k = fill(ir);
    col = mix(col, iron * (1.0 + 0.35 * smoothstep(-0.02, 0.0, -abs(ir + 0.014))), k);
    ink = max(ink, 0.85 * line(ir, 0.0018));
    // rivets along the bands
    float rivet = length(vec2((fract(along * 9.0) - 0.5) / 9.0, vK.y < 0.5 ? p.y + 0.03 : (abs(p.y + 0.11) < abs(p.y - 0.07) ? p.y + 0.11 : p.y - 0.07))) - 0.0065;
    col = mix(col, ${V('#8a849a')}, fill(rivet) * fill(band) * step(0.04, dc));
    ink = max(ink, 0.6 * line(rivet, 0.0013) * fill(band) * step(0.04, dc));
  }
}
void coffinLining(inout vec3 col, inout float ink, inout float em, vec3 p, vec3 on) {
  // pleated satin: folds run the length of the coffin (across it on the end walls), every other fold darker
  float c = (abs(on.z) > 0.6 ? p.x : p.z) * 11.0;
  float aa = max(fwidth(c), 1e-4);
  float fc = fract(c);
  float s = smoothstep(-aa, aa, abs(fc - 0.5) - 0.3);
  col = mix(col, ${V('#5e1028')}, s);
  col *= 0.78 + 0.34 * pow(sin(fc * 3.14159), 0.7);
  ink = max(ink, 0.3 * smoothstep(0.06, 0.0, min(fc, 1.0 - fc)) * smoothstep(0.5, 0.2, aa));
  // tufted buttons on the floor
  if (on.y > 0.6) {
    vec2 g = vec2(p.x * 6.0, p.z * 5.0);
    float b = length((fract(g + vec2(0.5 * mod(floor(g.y), 2.0), 0.0)) - 0.5) / vec2(6.0, 5.0)) - 0.009;
    col = mix(col, col * 0.55, fill(b));
  }
  em = 0.35;
}

// ---------------- the truck ----------------
float roundRect(vec2 p, vec2 c, vec2 size, float r) { return sdRound(p - c, size * 0.5, r); }
void glass(inout vec3 col, inout float ink, inout float em, inout float rim, vec2 q, float d) {
  float k = fill(d);
  if (k <= 0.0) return;
  vec3 g = ${V('#1f2240')} * (0.85 + 0.3 * smoothstep(-0.3, 0.3, q.y));
  float streak = line(dot(q, vec2(0.7, 0.7)) - 0.2 * floor(dot(q, vec2(0.7, 0.7)) / 0.2 + 0.5) , 0.018) * 0.35;
  g = mix(g, vec3(0.42, 0.45, 0.62), streak);
  col = mix(col, g, k);
  em = mix(em, 0.2, k);
  rim = mix(rim, 1.6, k);
  ink = max(ink, 0.9 * line(d, 0.006));
}
// a curl stroke placed on a side: center c, in-plane rotation a, scale s, big (1) or small (0)
float curlAt(vec2 u, vec2 c, float a, float s, float big) {
  vec2 q = rot2(-a) * (u - c) / s;
  float d = big > 0.5 ? curlSD(q, 0.17, 1.7, 1.3, 0.012, 0.03) : curlSD(q, 0.09, 1.5, 1.1, 0.008, 0.02);
  return d * s;
}
void truckBody(inout vec3 col, inout float ink, inout float em, inout float rim, vec3 p, vec3 on) {
  float side = abs(on.z) > 0.6 ? sign(p.z) : 0.0;
  float curl = 1e3;
  if (side != 0.0) {
    vec2 u = vec2(p.x, p.y);
    vec2 m = vec2(side * p.x, p.y);
    // windows, door seam and handle on the cab
    if (p.x > -2.0 && p.x < -0.6 && p.y > 0.5) {
      glass(col, ink, em, rim, u - vec2(-1.32, 1.86), roundRect(u, vec2(-1.32, 1.86), vec2(1.02, 0.66), 0.16));
      ink = max(ink, 0.9 * line(sdBox(u - vec2(-0.72, 1.05), vec2(0.0, 0.48)), 0.006));
      ink = max(ink, 0.7 * line(sdBox(u - vec2(-1.32, 1.05), vec2(0.6, 0.48)) , 0.0035) * step(p.x, -0.72));
      float hd = roundRect(u, vec2(-0.86, 1.32), vec2(0.14, 0.035), 0.015);
      col = mix(col, ${V(PAL.bone)}, fill(hd)); ink = max(ink, 0.8 * line(hd, 0.003));
    }
    // louvers on the hood's sides
    if (p.x < -2.0 && abs(p.z) < 0.8) for (int i = 0; i < 4; i++) {
      float d = roundRect(u, vec2(-2.38 - float(i) * 0.12, 1.0), vec2(0.04, 0.28), 0.018);
      col = mix(col, ${V(PAL.coal)}, fill(d)); ink = max(ink, 0.6 * line(d, 0.003));
    }
    // painted curls on the doors, bed sides and hood (mirrored on the far side)
    curl = min(curl, curlAt(m, vec2(side * -1.3, 0.98), 0.0, 1.0, 1.0));
    curl = min(curl, curlAt(m, vec2(side * -1.0, 0.72), side * 2.2, 1.0, 0.0));
    curl = min(curl, curlAt(m, vec2(side * 0.45, 0.82), 0.4, 0.85, 1.0));
    curl = min(curl, curlAt(m, vec2(side * 0.95, 0.68), -0.8, 1.0, 0.0));
    if (abs(p.z) < 0.8) curl = min(curl, curlAt(m, vec2(side * -2.45, 0.78), 0.3, 1.2, 0.0));
    // a pinstripe along the bed walls, under the rail
    if (p.x > -0.6) ink = max(ink, 0.5 * line(p.y - 1.08, 0.004));
  } else if (on.x < -0.6 && p.x < -1.9 && p.y > 1.35) {
    vec2 u = vec2(-p.z, p.y);
    glass(col, ink, em, rim, u - vec2(0.0, 1.82), roundRect(u, vec2(0.0, 1.82), vec2(1.5, 0.7), 0.12));
  } else if (on.x > 0.6 && p.x < -0.5 && p.y > 1.4) {
    vec2 u = vec2(p.z, p.y);
    glass(col, ink, em, rim, u - vec2(0.0, 1.88), roundRect(u, vec2(0.0, 1.88), vec2(1.0, 0.62), 0.14));
  } else if (on.x > 0.6 && p.x > 2.9) {
    // tail lamps on the rear panel
    for (int i = 0; i < 2; i++) {
      float d = length((vec2(p.z, p.y) - vec2(i == 0 ? 0.82 : -0.82, 0.72)) / vec2(1.0, 1.25)) - 0.08;
      col = mix(col, ${V('#ff5a3c')} * (1.0 + 0.6 * fill(d + 0.04)), fill(d)); em = mix(em, 0.9, fill(d));
      ink = max(ink, 0.9 * line(d, 0.006));
    }
  }
  if (curl < 0.01) col = mix(col, ${V('#b89ad0')}, fill(curl) * 0.95);
}
void truckFloor(inout vec3 col, inout float ink, vec3 p) {
  // bed planks run the length of the bed: seams across z, plank ends with two nails, grain along x
  float c = p.z * 3.2 + 0.5, pl = floor(c), fz = fract(c);
  col *= 0.86 + 0.24 * h1(pl * 5.3);
  col *= 0.88 + 0.22 * vnoise(vec2(p.x * 1.5 + pl * 9.0, fz * 26.0)) * vnoise(vec2(p.x * 0.4 + pl, fz * 60.0));
  col = mix(col, ${V(PAL.plumDark)}, line(abs(fz - 0.5) - 0.5, 0.09));
  ink = max(ink, 0.4 * line(fz, 0.03));
  float e = min(abs(p.x - (-0.55)), abs(p.x - 2.95));
  vec2 nq = vec2(e - 0.05, (abs(fz - 0.5) - 0.3) / 3.2);
  float nail = length(nq) - 0.009;
  col = mix(col, ${V('#7a7088')}, fill(nail)); ink = max(ink, 0.6 * line(nail, 0.0015));
}
void radiator(inout vec3 col, inout float ink, vec3 p, vec3 on) {
  if (on.x > -0.6) return;
  // the grille: a dark core with seven bright slats, drawn on the shell's front
  float core = sdRound(vec2(p.z, p.y - 0.95), vec2(0.39, 0.45), 0.04);
  if (core < 0.01) {
    float k = fill(core);
    float sl = abs(fract(p.z / 0.105 + 0.5) - 0.5) * 0.105 - 0.0175;
    vec3 g = mix(${V(PAL.coal)}, col * (0.9 + 0.4 * smoothstep(0.4, -0.4, p.y - 0.95)), fill(sl) * step(abs(p.z), 0.34));
    col = mix(col, g, k);
    ink = max(ink, max(0.9 * line(core, 0.004), 0.5 * line(sl, 0.0015) * k * step(abs(p.z), 0.34)));
  }
}
void lamp(inout vec3 col, inout float ink, inout float em, vec3 p) {
  // local space of the housing: the glass faces -x, radius 0.23
  if (p.x > -0.08) return;
  float r = length(p.yz);
  float glassD = r - 0.19;
  col = mix(col, ${V('#a59cb8')} * (1.0 + 0.3 * smoothstep(0.0, 0.1, p.y)), fill(r - 0.235));
  col = mix(col, ${V(PAL.amberHot)} * (1.0 + 0.4 * fill(length(p.yz - vec2(0.06, 0.04)) - 0.05)), fill(glassD));
  em = mix(em, 1.0, fill(glassD));
  ink = max(ink, max(0.9 * line(glassD, 0.006), 0.6 * line(r - 0.235, 0.004)));
}
void skull(inout vec3 col, inout float ink, vec3 p) {
  // local unit sphere, face toward -x
  if (p.x > -0.3) return;
  vec2 q = vec2(p.z, p.y);
  float eyes = length(vec2(abs(q.x) - 0.42, q.y - 0.05) / vec2(1.0, 1.15)) - 0.28;
  float nose = length(q - vec2(0.0, -0.4)) - 0.13;
  float d = min(eyes, nose);
  col = mix(col, ${V(PAL.coal)}, fill(d));
}
void wheel(inout vec3 col, inout float ink, vec3 p, vec3 on) {
  // the wheel's face (local: axle along z): rim ring, eight crooked spokes, a bone hubcap with bolts
  float r = length(p.xy);
  if (abs(on.z) < 0.6) return;
  vec3 spoke = ${V(PAL.plumLight)}, dark = ${V(PAL.coal)};
  float ring = abs(r - 0.27) - 0.03;
  float sp = 1e3;
  for (int i = 0; i < 8; i++) {
    float ai = float(i) / 8.0 * 6.2831853 + (h1(float(i) * 3.3) - 0.5) * 0.24;
    vec2 d = rot2(-ai) * p.xy;
    sp = min(sp, sdBox(d - vec2(0.17, 0.0), vec2(0.1, 0.016 + 0.006 * d.x)));
  }
  float hub = r - 0.075;
  float paintSp = min(ring, sp);
  col = mix(dark * (0.8 + 0.3 * vnoise(p.xy * 20.0)), spoke * (0.9 + 0.25 * smoothstep(0.0, 0.3, p.y)), fill(paintSp));
  ink = max(ink, 0.8 * line(paintSp, 0.004));
  col = mix(col, ${V(PAL.bone)} * (1.0 + 0.25 * fill(length(p.xy - vec2(-0.02, 0.025)) - 0.03)), fill(hub));
  ink = max(ink, 0.9 * line(hub, 0.005));
  for (int i = 0; i < 5; i++) {
    float bi = float(i) / 5.0 * 6.2831853;
    float b = length(p.xy - vec2(cos(bi), sin(bi)) * 0.05) - 0.009;
    col = mix(col, ${V('#a59cb8')}, fill(b));
  }
}

void main() {
  vec3 N = normalize(vN);
  if (!gl_FrontFacing) N = -N;
  int id = int(vK.x + 0.5);
  vec3 p = vP, on = normalize(vON);
  vec3 col = vCol;
  float ink = 0.0, em = 0.0, rim = 1.0, mottle = 0.4;
  if (id == ${PAINT.PLAIN}) { mottle = vK.y; rim = vK.z; em = vK.w; }
  else if (id == ${PAINT.COFFIN_WOOD}) { mottle = 0.4; coffinWood(col, ink, p, on); }
  else if (id == ${PAINT.COFFIN_LINING}) { mottle = 0.2; rim = 0.4; coffinLining(col, ink, em, p, on); }
  else if (id == ${PAINT.COFFIN_RAIL}) {
    // striped top rail: the stripe count is carried in aP.x, so the blocks follow the coffin's outline
    float u = vQ.x, odd = mod(floor(u), 2.0);
    float fu = fract(u), aa = max(fwidth(u), 1e-4);
    float edge = smoothstep(-aa, aa, abs(fu - 0.5) - 0.5 + aa * 1.5);
    col = odd > 0.5 ? vK.yzw : col;
    ink = max(ink, 0.25 * edge);
    mottle = 0.2;
  }
  else if (id == ${PAINT.STONE}) {
    col = mix(${V('#38463c')}, col, smoothstep(0.04, 0.4, p.y));
    mottle = 0.6; stonePaint(col, ink, p, on);
  }
  else if (id == ${PAINT.TRUCK_BODY} || id == ${PAINT.GATE}) {
    col = mix(${V(PAL.plumDark)}, col, smoothstep(0.35, 1.1, p.y));
    mottle = 0.45;
    if (id == ${PAINT.TRUCK_BODY}) truckBody(col, ink, em, rim, p, on);
    else if (on.x > 0.6) {
      // the tailgate (local, hinge at the origin): two small curls and a bone knob
      vec2 u = vec2(-p.z, p.y);
      float c = min(curlSD(rot2(1.2) * (u - vec2(-0.4, 0.12)), 0.07, 1.4, 1.0, 0.016, 0.0), curlSD(rot2(-1.2) * (vec2(-u.x, u.y) - vec2(-0.4, 0.12)), 0.07, 1.4, 1.0, 0.016, 0.0));
      col = mix(col, ${V('#b89ad0')}, fill(c) * 0.95);
      float kn = length((u - vec2(0.0, 0.13)) / vec2(0.06, 0.07)) - 1.0;
      col = mix(col, ${V(PAL.bone)}, fill(kn * 0.06)); ink = max(ink, 0.8 * line(kn * 0.06, 0.004));
    }
  }
  else if (id == ${PAINT.TRUCK_FLOOR}) { mottle = 0.5; truckFloor(col, ink, p); }
  else if (id == ${PAINT.TRUCK_RAIL}) {
    float c = (vK.y > 0.5 ? p.z : p.x) * 2.6, aa = max(fwidth(c), 1e-4);
    col = mix(col, ${V(PAL.stripeDark)}, smoothstep(-aa, aa, abs(fract(c) - 0.5) - 0.25));
    mottle = 0.25;
  }
  else if (id == ${PAINT.RADIATOR}) { mottle = 0.35; rim = 1.3; radiator(col, ink, p, on); }
  else if (id == ${PAINT.LAMP}) { mottle = 0.3; lamp(col, ink, em, p); }
  else if (id == ${PAINT.SKULL}) { mottle = 0.25; skull(col, ink, p); }
  else if (id == ${PAINT.WHEEL}) { mottle = 0.3; wheel(col, ink, p, on); }
  if (mottle > 0.0) {
    float n = vnoise(p.xz * 7.0 + p.y * 4.3) * 0.65 + vnoise(p.xy * 19.0 + p.z * 11.0) * 0.35;
    col *= 1.0 + mottle * (n - 0.5) * 1.2;
  }
  vec3 c = mix(toonShadeRim(col, N, vW, rim), col, em);
  c = mix(c, INKC, clamp(ink, 0.0, 1.0));
  gl_FragColor = vec4(c, 1.0);
  #include <colorspace_fragment>
  #include <fog_fragment>
}`;

let shared = null;
// propPaint() is shared by every coffin and headstone; propPaint({ rig: true }) makes a fresh one for a truck,
// whose uniforms uSpin (wheels) and uGate (tailgate) and pivots uPivot[1..5] belong to that truck.
export function propPaint({ rig = false } = {}) {
  if (!rig && shared) return shared;
  const m = new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, rig ? {
      uPivot: { value: Array.from({ length: 6 }, () => new THREE.Vector3()) }, uSpin: { value: 0 }, uGate: { value: 0 },
    } : {}]),
    vertexShader: vert, fragmentShader: frag, fog: true, defines: rig ? { RIG: 1 } : {},
  });
  m.uniforms.uDay = DAY;
  if (!rig) shared = m;
  return m;
}

// Ink hull for a rigged mesh: the same push as outlineMat in toon.js, plus the moving parts. Shares the rig uniforms.
const hullVert = /* glsl */ `
uniform float uThick;
attribute float aRig;
uniform vec3 uPivot[6]; uniform float uSpin; uniform float uGate;
#include <common>
#include <fog_pars_vertex>
mat3 rotZ(float a) { float c = cos(a), s = sin(a); return mat3(c, s, 0.0, -s, c, 0.0, 0.0, 0.0, 1.0); }
void main() {
  vec3 pos = position, nor = normal;
  int r = int(aRig + 0.5);
  if (r > 0) { mat3 R = rotZ(r == 5 ? uGate : uSpin); pos = uPivot[r] + R * (pos - uPivot[r]); nor = R * nor; }
  mat4 mv = modelViewMatrix;
  vec3 s2 = vec3(dot(mv[0].xyz, mv[0].xyz), dot(mv[1].xyz, mv[1].xyz), dot(mv[2].xyz, mv[2].xyz));
  vec3 n = normalize(mat3(mv) * (nor / s2));
  vec4 mvPosition = mv * vec4(pos, 1.0);
  mvPosition.xyz += n * uThick * clamp(-mvPosition.z * 0.22, 0.75, 2.6);
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}`;
const hullFrag = /* glsl */ `
uniform vec3 uInk;
#include <common>
#include <fog_pars_fragment>
void main() {
  gl_FragColor = vec4(uInk, 1.0);
  #include <colorspace_fragment>
  #include <fog_fragment>
}`;
export function rigHullMat(paint, thick) {
  const m = new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { uThick: { value: thick }, uInk: { value: new THREE.Color(INK) } }]),
    vertexShader: hullVert, fragmentShader: hullFrag, side: THREE.BackSide, fog: true,
  });
  for (const k of ['uPivot', 'uSpin', 'uGate']) m.uniforms[k] = paint.uniforms[k];
  return m;
}

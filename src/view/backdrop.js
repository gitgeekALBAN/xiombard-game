import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { lightingGLSL, dayGLSL, MOON_DIR, DAY, dayColor } from '../shaders/toon.js';
import { groundGLSL } from '../shaders/ground.js';
import { noise } from '../shaders/noise.glsl.js';
import { rng } from '../shared/rng.js';
import { ROAD_Z, FENCE } from '../shared/layout.js';

// Everything beyond the fence, painted in layers like an animation background:
//   L0  rolling hills right behind the fence (real terrain, same lawn shader as the yard, toon lit) with a dead-tree
//       line, leaning crosses and the crooked chapel on its hill under the moon
//   L1..L3  ring-shaped ridges further out, each lighter and hazier, carrying flat cut-out silhouettes
//       (windmill, a crooked village with lit windows, spiky far woods)
// plus slow mist bands between the layers. Players never get there, so nothing here needs colliders.
// The ground slab ends at +-80 m: the terrain covers everything beyond ~31 m from the yard centre (it sits at y = 0
// along the road, drawn with a polygon offset so it wins over the slab) and the ridges close the horizon all round.
// buildBackdrop(scene) returns { update(time, dt, camera), setDay(k) }.
// Day/night: the shaders read the shared uDay uniform (toon.js); flat layer colors are given as
// [night, dusk, day] sRGB triples and blended on the CPU in setDay.

const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const hash = (x, y) => { const h = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return h - Math.floor(h); };
function vn(x, y) {
  const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
  const a = hash(ix, iy), b = hash(ix + 1, iy), c = hash(ix, iy + 1), d = hash(ix + 1, iy + 1);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}
function fbm(x, y) { let v = 0, a = 0.5; for (let i = 0; i < 4; i++) { v += a * vn(x, y); x = x * 2.03 + 17.1; y = y * 2.03 + 17.1; a *= 0.5; } return v / 0.9375; }
// JS twin of roadCenter() in ground.js: the road valley must follow the painted road
const roadCenter = (x) => ROAD_Z + Math.sin(x * 0.05) * 0.45 + Math.sin(x * 0.13 + 1.0) * 0.2;

// The hero hill sits straight under the moon as seen from the spawn point.
const MOON_H = new THREE.Vector2(MOON_DIR.x, MOON_DIR.z).normalize();
const CHAPEL = { x: MOON_H.x * 118, z: 8.5 + MOON_H.y * 118 };
const TERRAIN_R = 178;

// Height of the near hills. Below the slab (negative) inside the fence, exactly 0 along the road out to |x| = 80
// (the truck drives there), low for the first few meters outside the fence so the fence reads against it.
export function terrainH(x, z) {
  const q = Math.pow(x ** 8 + z ** 8, 1 / 8);
  const r = Math.hypot(x, z);
  let h = Math.pow(smooth(FENCE + 4, FENCE + 30, q), 1.3) * (1.5 + 12 * fbm(x * 0.017 + 3, z * 0.017 - 2));
  h += smooth(80, TERRAIN_R - 10, r) * (5 + 13 * fbm(x * 0.009 + 9, z * 0.009));
  const dc = Math.hypot(x - CHAPEL.x, z - CHAPEL.z);
  // lumpy hero hill with a shoulder, flat on top for the chapel
  const lump = 0.75 + 0.5 * fbm(x * 0.06, z * 0.06);
  h += 25 * Math.pow(smooth(40 * lump, 8, dc), 1.4) + 6 * smooth(75, 25, Math.hypot(x - CHAPEL.x - 22, z - CHAPEL.z + 6));
  // the road runs out through a valley and climbs over the far rim on both sides
  const dz = Math.abs(z - roadCenter(x));
  const roadH = Math.pow(smooth(80, 165, Math.abs(x)), 1.3) * 9;
  h = roadH + (h - roadH) * smooth(5.5, 18, dz) * (h > roadH ? 1 : 0);
  return q < FENCE + 3.5 ? Math.min(h, -0.4 + (q - FENCE - 2.5) * 0.4) : h;
}

// ---------------- shared shader bits ----------------
// Fog comes from the scene; each layer caps it so distant silhouettes fade toward the haze without vanishing.
const fogFrag = /* glsl */ `
  #ifdef USE_FOG
    #ifdef FOG_EXP2
      float fogF = 1.0 - exp(-fogDensity * fogDensity * vFogDepth * vFogDepth);
    #else
      float fogF = smoothstep(fogNear, fogFar, vFogDepth);
    #endif
    // the cap eases in with distance from the yard so the hills meet the ground slab without a seam
    gl_FragColor.rgb = mix(gl_FragColor.rgb, fogColor, min(fogF, mix(1.0, uFogMax, smoothstep(31.0, 42.0, length(vW.xz)))));
  #endif`;
const baseVert = /* glsl */ `
  varying vec3 vW; varying vec3 vN;
  #ifdef USE_COLOR
  varying vec3 vCol;
  #endif
  #ifdef PHASE
  attribute float aPhase; varying float vPhase;
  #endif
  #ifdef STRIPE
  attribute float aStripe; varying float vStripe;
  #endif
  #include <common>
  #include <fog_pars_vertex>
  void main() {
    vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz;
    vN = normalize(mat3(modelMatrix) * normal);
    #ifdef USE_COLOR
    vCol = color;
    #endif
    #ifdef PHASE
    vPhase = aPhase;
    #endif
    #ifdef STRIPE
    vStripe = aStripe;
    #endif
    vec4 mvPosition = viewMatrix * w;
    gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }`;
const lin = (hex) => new THREE.Color(hex);
// color uniforms that follow the day: [uniform value, [night, dusk, day]]
const dayColors = [];
const dc = (hex) => { const c = lin(hex[0]); dayColors.push([c, hex]); return c; };
function mat(frag, uniforms, extra = {}) {
  const m = new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, uniforms]),
    vertexShader: baseVert, fragmentShader: frag, fog: true, ...extra,
  });
  m.uniforms.uDay = DAY; // shared day/night uniform (see toon.js)
  // merge clones values: re-link the day-following colors so setDay can update them in place
  for (const [k, u] of Object.entries(uniforms)) if (u.value && u.value.isColor && dayColors.some(([c]) => c === u.value)) m.uniforms[k].value = u.value;
  if (uniforms.uTime) m.uniforms.uTime = uniforms.uTime; // the shared clock, also cloned by merge
  return m;
}

// Near hills: the yard's lawn and road run on over them, hazing toward lavender with distance, mist in the dips.
const terrainFrag = /* glsl */ `
  uniform float uFogMax; uniform float uTime; uniform vec3 uHaze; uniform vec3 uMist;
  varying vec3 vW; varying vec3 vN;
  #include <common>
  #include <fog_pars_fragment>
  ${groundGLSL}
  ${lightingGLSL}
  void main() {
    vec3 N = normalize(vN);
    vec2 p = vW.xz;
    vec2 dp = fwidth(p);
    float px = mix(min(dp.x, dp.y), max(max(dp.x, dp.y), fwidth(vW.y)), 0.85); // see ground.js: avoids radial streaks
    float r = length(p);
    vec3 col = groundTop(p, px);
    // steep flanks lose their grass to bare earth streaks, like dry-brushed paint
    float steep = smoothstep(0.88, 0.7, N.y) * smoothstep(0.4, 0.6, vnoise(p * vec2(0.12, 0.5)));
    col = mix(col, mix(vec3(0.045, 0.03, 0.04), vec3(0.2, 0.12, 0.07), dayPaint()), steep * 0.6);
    col = mix(col, uHaze, smoothstep(40.0, 175.0, r) * mix(0.35, 0.25, dayPaint()));
    vec3 lit = toonShade(col, N, vW);
    float mn = vnoise(p * 0.035 + vec2(uTime * 0.03, uTime * 0.011));
    float mist = smoothstep(2.5, -0.5, vW.y - mn * 3.0) * smoothstep(40.0, 70.0, r);
    lit = mix(lit, uMist, mist * 0.35 * (1.0 - 0.7 * dayPaint())); // only wisps by day
    gl_FragColor = vec4(lit, 1.0);
    #include <colorspace_fragment>
    ${fogFrag}
  }`;

// Flat painted silhouettes of the far layers: one color per layer, a little lighter where the moon catches,
// with mist pooling at the foot. uMistY: [height where the mist is full, height where it is gone].
const silFrag = /* glsl */ `
  uniform float uFogMax; uniform float uTime; uniform vec3 uColor; uniform vec3 uHaze; uniform vec2 uMistY;
  varying vec3 vW; varying vec3 vN;
  #include <common>
  #include <fog_pars_fragment>
  ${noise}
  ${lightingGLSL}
  void main() {
    vec3 N = normalize(vN);
    if (!gl_FrontFacing) N = -N;
    vec3 col = uColor * (0.82 + 0.4 * smoothstep(0.0, 0.6, dot(N, keyDir())));
    float a = atan(vW.z, vW.x);
    col *= 0.9 + 0.2 * vnoise(vec2(a * 60.0, vW.y * 0.15));
    float m = smoothstep(uMistY.y, uMistY.x, vW.y + (vnoise(vec2(a * 18.0 + uTime * 0.02, 1.0)) - 0.5) * (uMistY.y - uMistY.x) * 0.6);
    col = mix(col, uHaze, m * 0.75);
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
    ${fogFrag}
  }`;

// Moonlit 3D set piece (the chapel): vertex colors, toon light, black-and-white stripes where aStripe = 1.
const propFrag = /* glsl */ `
  uniform float uFogMax; uniform vec3 uHaze;
  varying vec3 vW; varying vec3 vN; varying vec3 vCol; varying float vStripe;
  #include <common>
  #include <fog_pars_fragment>
  ${noise}
  ${lightingGLSL}
  void main() {
    vec3 N = normalize(vN);
    vec3 base = vCol * (0.88 + 0.24 * vnoise(vW.xy * 1.3 + vW.z));
    if (vStripe > 0.5) {
      float c = (vW.y + abs(vW.x - vW.z) * 0.35) * 1.2;
      float aa = fwidth(c);
      float s = smoothstep(-aa, aa, abs(fract(c) - 0.5) - 0.25);
      base = mix(vec3(0.75, 0.7, 0.62), vec3(0.012, 0.008, 0.02), mix(s, 0.5, smoothstep(0.3, 0.6, aa)));
    }
    base = mix(base, uHaze, 0.25);
    gl_FragColor = vec4(toonShadeRim(base, N, vW, 1.4), 1.0);
    #include <colorspace_fragment>
    ${fogFrag}
  }`;

// Lit windows: bright enough (above 1 before output) for bloom; each flickers on its own phase.
// By day the lamps are out and the panes go dark.
const windowFrag = /* glsl */ `
  uniform float uFogMax; uniform float uTime;
  varying vec3 vW; varying vec3 vN; varying float vPhase;
  #include <common>
  #include <fog_pars_fragment>
  ${dayGLSL}
  void main() {
    float t = uTime * (0.7 + fract(vPhase * 7.3)) + vPhase * 40.0;
    float fl = 0.86 + 0.08 * sin(t * 2.3) + 0.06 * sin(t * 5.7 + 1.3);
    fl *= 1.0 - 0.45 * smoothstep(0.92, 0.99, sin(t * 0.37));
    vec3 col = mix(vec3(1.0, 0.55, 0.2), vec3(1.0, 0.8, 0.45), fract(vPhase * 3.1)) * 2.6 * fl;
    // each window goes out at its own moment through the dusk
    float on = clamp(lampsOn() * 1.6 - fract(vPhase * 5.7) * 0.6, 0.0, 1.0);
    col = mix(vec3(0.035, 0.03, 0.05), col, on);
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
    ${fogFrag}
  }`;

// Translucent band of mist on a cylinder around the yard, drifting slowly.
const mistFrag = /* glsl */ `
  uniform float uFogMax; uniform float uTime; uniform vec3 uColor; uniform vec2 uY; uniform float uAlpha;
  varying vec3 vW; varying vec3 vN;
  #include <common>
  #include <fog_pars_fragment>
  ${noise}
  void main() {
    float a = atan(vW.z, vW.x);
    vec2 q = vec2(a * 22.0 + uTime * 0.015, vW.y * 0.09);
    float n = vnoise(q + vec2(vnoise(q * 0.7 - uTime * 0.01) * 1.5, 0.0)) * 0.65 + vnoise(q * 2.3) * 0.35;
    float h = (vW.y - uY.x) / (uY.y - uY.x);
    float alpha = smoothstep(0.0, 0.25, h) * smoothstep(1.0, 0.35, h) * smoothstep(0.3, 0.7, n) * uAlpha;
    gl_FragColor = vec4(uColor, alpha);
    #include <colorspace_fragment>
    ${fogFrag}
  }`;

// ---------------- 2D silhouette helpers (local xy plane, +z faces the viewer) ----------------
class Flat {
  constructor() { this.v = []; }
  tri(a, b, c) { this.v.push(a[0], a[1], b[0], b[1], c[0], c[1]); }
  quad(a, b, c, d) { this.tri(a, b, c); this.tri(a, c, d); }
  poly(pts) {
    const tris = THREE.ShapeUtils.triangulateShape(pts.map((p) => new THREE.Vector2(p[0], p[1])), []);
    for (const [a, b, c] of tris) this.tri(pts[a], pts[b], pts[c]);
  }
  // tapered ribbon along a polyline
  strip(pts, w0, w1) {
    const n = pts.length, L = [], R = [];
    for (let i = 0; i < n; i++) {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
      let dx = b[0] - a[0], dy = b[1] - a[1];
      const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
      const w = (w0 + (w1 - w0) * (i / (n - 1))) / 2;
      L.push([pts[i][0] - dy * w, pts[i][1] + dx * w]); R.push([pts[i][0] + dy * w, pts[i][1] - dx * w]);
    }
    for (let i = 0; i < n - 1; i++) this.quad(L[i], R[i], R[i + 1], L[i + 1]);
  }
  rect(x0, y0, x1, y1, lean = 0) { this.quad([x0, y0], [x1, y0], [x1 + lean, y1], [x0 + lean, y1]); }
  geometry(z = 0) {
    const n = this.v.length / 2, pos = new Float32Array(n * 3), nor = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { pos[i * 3] = this.v[i * 2]; pos[i * 3 + 1] = this.v[i * 2 + 1]; pos[i * 3 + 2] = z; nor[i * 3 + 2] = 1; }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
    return g;
  }
}

// curly dead tree: leaning trunk, branches that end in spirals
function deadTree(f, r, h, detail = 1) {
  const lean = r.range(-0.18, 0.18) * h, wob = r.range(0, 6);
  const trunk = [];
  for (let i = 0; i <= 7; i++) {
    const t = i / 7;
    trunk.push([lean * t * t + Math.sin(t * 3 + wob) * 0.07 * h, -2 + t * (h + 2)]);
  }
  f.strip(trunk, h * 0.15, h * 0.03);
  f.poly([[-h * 0.15, -2], [h * 0.15, -2], [h * 0.13, 0], [h * 0.03, h * 0.12], [-h * 0.03, h * 0.12], [-h * 0.12, 0]]); // flared roots
  const nb = 3 + Math.floor(r() * 3) + (detail > 0.7 ? 1 : 0);
  const steps = detail > 0.7 ? 13 : 8;
  for (let b = 0; b < nb; b++) {
    const side = b % 2 ? 1 : -1;
    const ts = r.range(0.42, 0.95);
    const k = Math.min(7, Math.round(ts * 7));
    let [x, y] = trunk[k];
    const a0 = side * r.range(0.35, 1.0), L = h * r.range(0.32, 0.55) * (1.15 - ts * 0.45), curl = side * r.range(3.5, 6.5);
    const pts = [[x, y]];
    for (let i = 1; i <= steps; i++) {
      const s = i / steps, a = a0 + curl * Math.pow(s, 2.4), step = (L / steps) * (1.25 - 0.7 * s);
      x += Math.sin(a) * step; y += Math.cos(a) * step;
      pts.push([x, y]);
      if (i === Math.floor(steps * 0.4) && r() < 0.6 * detail) {
        // twig hooking the other way
        let tx = x, ty = y; const tp = [[tx, ty]];
        for (let j = 1; j <= 5; j++) { const ta = a - side * (0.6 + j * 0.45); tx += Math.sin(ta) * L * 0.07; ty += Math.cos(ta) * L * 0.07; tp.push([tx, ty]); }
        f.strip(tp, h * 0.02, h * 0.005);
      }
    }
    f.strip(pts, h * 0.055 * (1.1 - ts * 0.5), h * 0.008);
  }
}
function cross(f, r, h) {
  const w = h * 0.11, lean = r.range(-0.25, 0.25) * h * 0.3;
  f.rect(-w / 2, -1.5, w / 2, h, lean);
  const ay = h * 0.68, al = lean * (ay + 1.5) / (h + 1.5);
  f.rect(-h * 0.3 + al, ay - w / 2, h * 0.3 + al, ay + w / 2);
}
function headstone(f, r, h) {
  const w = h * r.range(0.45, 0.65), pts = [[-w / 2, -1.2], [w / 2, -1.2]];
  const tilt = r.range(-0.15, 0.15) * h;
  for (let i = 0; i <= 8; i++) { const a = (i / 8) * Math.PI; pts.push([Math.cos(a) * w / 2 + tilt, h - w / 2 + Math.sin(a) * w / 2]); }
  f.poly(pts);
}
// crooked house with a witch-hat roof, optional tower; lit windows go to `win` (local rects)
function house(f, r, w, h, win, tower) {
  const sk = r.range(-0.08, 0.08) * h;
  f.quad([-w / 2, -4], [w / 2, -4], [w / 2 + sk, h], [-w / 2 + sk, h]);
  const rh = w * r.range(0.6, 1.1), bend = r.range(-0.25, 0.25) * w, ov = w * 0.12;
  const roof = [[-w / 2 - ov + sk, h - 0.3], [w / 2 + ov + sk, h - 0.3]];
  for (let i = 1; i <= 5; i++) { const t = i / 5; roof.push([w / 2 * (1 - t) + sk + bend * t * t, h + rh * Math.pow(t, 0.75)]); }
  for (let i = 4; i >= 1; i--) { const t = i / 5; roof.push([-w / 2 * (1 - t) + sk + bend * t * t - w * 0.05 * t, h + rh * Math.pow(t, 0.75) * 0.97]); }
  f.poly(roof);
  if (r() < 0.7) f.rect(w * 0.18 + sk, h + rh * 0.2, w * 0.3 + sk, h + rh * 0.75, r.range(-0.3, 0.3));
  const nw = 1 + Math.floor(r() * 2.5);
  for (let i = 0; i < nw; i++) {
    const wx = (r() - 0.5) * w * 0.55 + sk * 0.5, wy = h * r.range(0.35, 0.7), ws = Math.min(w, h) * 0.16;
    if (r() < 0.85) win.push([wx - ws / 2, wy - ws * 0.7, wx + ws / 2, wy + ws * 0.7]);
  }
  if (tower) {
    const tx = -w * 0.35 + sk, tw = w * 0.32, th = h * 1.9;
    f.rect(tx - tw / 2, h * 0.5, tx + tw / 2, th, r.range(-0.4, 0.4));
    const pts = [[tx - tw * 0.75, th], [tx + tw * 0.75, th]];
    for (let i = 1; i <= 4; i++) { const t = i / 4; pts.push([tx + tw * 0.75 * (1 - t) + tw * 1.2 * t * t, th + tw * 2.6 * t]); }
    for (let i = 3; i >= 1; i--) { const t = i / 4; pts.push([tx - tw * 0.75 * (1 - t) + tw * 1.2 * t * t, th + tw * 2.6 * t]); }
    f.poly(pts);
    win.push([tx - tw * 0.18, th - tw * 0.9, tx + tw * 0.18, th - tw * 0.35]);
  }
}

// place a local flat piece in the world, standing at (x, y, z) and facing the yard
const _o = new THREE.Object3D();
function placeMatrix(x, y, z, lean = 0, s = 1, face = [0, 4]) {
  _o.position.set(x, y, z);
  _o.rotation.set(0, 0, 0);
  _o.scale.setScalar(s);
  _o.lookAt(face[0], y, face[1]);
  _o.rotateZ(lean);
  _o.updateMatrix();
  return _o.matrix.clone();
}
function windowsGeo(rects, m, r) {
  const f = new Flat();
  for (const [x0, y0, x1, y1] of rects) f.rect(x0, y0, x1, y1);
  const g = f.geometry(0.06).applyMatrix4(m);
  const n = g.attributes.position.count, ph = new Float32Array(n);
  for (let i = 0; i < n; i += 6) ph.fill(r(), i, i + 6);
  g.setAttribute('aPhase', new THREE.BufferAttribute(ph, 1));
  return g;
}

// ---------------- ridges ----------------
// ring of hills at radius R: a crest row and two rows sloping down toward the yard, well below the horizon
function ridgeGeo(R, H, seg = 200) {
  const rows = [[0, 1, 0], [10, 0.6, -2], [22, 0, -60]];
  const pos = [];
  for (let i = 0; i <= seg; i++) for (const [dr, k, dy] of rows) {
    const a = (i / seg) * Math.PI * 2, h = H(a);
    pos.push(Math.cos(a) * (R - dr), h * k + dy, Math.sin(a) * (R - dr));
  }
  const idx = [];
  for (let i = 0; i < seg; i++) for (let j = 0; j < rows.length - 1; j++) {
    const a = i * 3 + j, b = a + 3;
    idx.push(a, a + 1, b, b, a + 1, b + 1);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g.toNonIndexed();
}
const ringNoise = (a, k, seed) => fbm(Math.cos(a) * k + seed, Math.sin(a) * k - seed);
const azOf = (x, z) => Math.atan2(z, x);
const angDist = (a, b) => Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)));

export function buildBackdrop(scene) {
  const r = rng(4242);
  const uTime = { value: 0 };
  const group = new THREE.Group();
  group.name = 'backdrop';

  // ---------- L0: terrain ----------
  {
    const NA = 168, radii = [];
    for (let i = 0; i <= 40; i++) radii.push(FENCE - 4 + (TERRAIN_R - FENCE + 4) * Math.pow(i / 40, 1.55));
    const pos = [];
    for (const rad of radii) for (let j = 0; j < NA; j++) {
      const a = (j / NA) * Math.PI * 2, x = Math.cos(a) * rad, z = Math.sin(a) * rad;
      pos.push(x, terrainH(x, z), z);
    }
    const idx = [];
    for (let i = 0; i < radii.length - 1; i++) for (let j = 0; j < NA; j++) {
      const a = i * NA + j, b = i * NA + ((j + 1) % NA), c = a + NA, d = b + NA;
      idx.push(a, b, c, b, d, c); // counter-clockwise seen from above
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    const m = mat(terrainFrag, { uFogMax: { value: 0.42 }, uTime, uHaze: { value: dc(['#2e2840', '#5a3a58', '#a9b89a']) }, uMist: { value: dc(['#544c78', '#9a6a86', '#efe6dc']) } },
      { polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -2 });
    group.add(new THREE.Mesh(g, m));
  }

  // ---------- L0 silhouettes: dead-tree lines, leaning crosses and headstones on the near hills ----------
  const nearParts = [];
  const blocked = (x, z) => (Math.abs(z - ROAD_Z) < 13 && Math.abs(x) > FENCE - 2) || Math.hypot(x - CHAPEL.x, z - CHAPEL.z) < 30;
  const addNear = (build, x, z, s, lean = 0) => {
    const f = new Flat(); build(f);
    nearParts.push(f.geometry().applyMatrix4(placeMatrix(x, terrainH(x, z) - 0.3, z, lean, s)));
  };
  // tree lines: arcs of trees along the near ridges
  const lines = [[-2.3, -1.15, 62, 9], [-0.75, -0.15, 58, 6], [0.55, 1.3, 66, 6], [1.9, 2.75, 60, 6], [-2.95, -2.5, 70, 3]];
  for (const [a0, a1, rad, n] of lines) for (let i = 0; i < n; i++) {
    const a = a0 + (a1 - a0) * (i + r.range(0.1, 0.9)) / n, rr = rad + r.range(-8, 10);
    const x = Math.cos(a) * rr, z = Math.sin(a) * rr;
    if (blocked(x, z)) continue;
    const tr = rng(Math.floor(r() * 1e6));
    addNear((f) => deadTree(f, tr, r.range(5.5, 9.5), 1), x, z, 1, r.range(-0.08, 0.08));
  }
  // a big gnarled tree beside the chapel
  {
    const tr = rng(77);
    const x = CHAPEL.x + 13, z = CHAPEL.z + 7;
    addNear((f) => deadTree(f, tr, 14, 1), x, z, 1, -0.1);
  }
  // overflow graveyard on the slopes, crosses leaning every which way
  for (let i = 0; i < 46; i++) {
    const a = r() * Math.PI * 2, rr = r.range(36, 64);
    const x = Math.cos(a) * rr, z = Math.sin(a) * rr;
    if (blocked(x, z)) continue;
    const pr = rng(Math.floor(r() * 1e6));
    addNear((f) => (r() < 0.55 ? cross(f, pr, r.range(1.3, 2.2)) : headstone(f, pr, r.range(0.9, 1.5))), x, z, 1, r.range(-0.3, 0.3));
  }
  // a crooked little fence and crosses around the chapel
  for (let i = 0; i < 9; i++) {
    const a = r() * Math.PI * 2, rr = r.range(9, 17);
    const x = CHAPEL.x + Math.cos(a) * rr, z = CHAPEL.z + Math.sin(a) * rr;
    if (z > CHAPEL.z + 12 && Math.abs(x - CHAPEL.x) < 5) continue;
    const pr = rng(i + 900);
    addNear((f) => cross(f, pr, r.range(1.8, 2.6)), x, z, 1, r.range(-0.35, 0.35));
  }
  const nearMat = mat(silFrag, { uFogMax: { value: 0.42 }, uTime, uColor: { value: dc(['#1a1424', '#2a1c34', '#4a3f42']) }, uHaze: { value: dc(['#3d3656', '#6a4a6a', '#b8bca4']) }, uMistY: { value: new THREE.Vector2(0, 3) } });
  group.add(new THREE.Mesh(mergeGeometries(nearParts), nearMat));

  // ---------- chapel (3D, moonlit) ----------
  const winGeos = [];
  {
    const cg = new THREE.Group();
    const wall = '#4a3f5c', roofC = '#221b2c', trim = '#2c2438';
    const add = (geo, color, pos, rot = [0, 0, 0], scale = [1, 1, 1], stripe = 0, parent = cg) => {
      const m = new THREE.Mesh(geo, null);
      m.position.set(...pos); m.rotation.set(...rot); m.scale.set(...scale);
      m.userData = { color, stripe };
      parent.add(m);
      return m;
    };
    const box = new THREE.BoxGeometry(1, 1, 1);
    // nave
    add(box, wall, [0.6, 3, -1], [0, 0, 0.035], [7, 6.4, 11]);
    const roofShape = new THREE.Shape([new THREE.Vector2(-4.5, 0), new THREE.Vector2(4.6, 0), new THREE.Vector2(0.9, 5.8), new THREE.Vector2(0.2, 5.4)]);
    const roofGeo = new THREE.ExtrudeGeometry(roofShape, { depth: 12.4, bevelEnabled: false });
    add(roofGeo, roofC, [0.75, 6.1, -7.2], [0, 0, 0.06]);
    // side porch with its own little roof
    add(box, wall, [4.6, 1.6, 1.5], [0, 0, -0.04], [2.4, 3.2, 3.2]);
    add(new THREE.ConeGeometry(2.4, 2.2, 4), roofC, [4.7, 4.1, 1.5], [0, Math.PI / 4, -0.12]);
    // tower at the front left, leaning, with a bent striped spire
    add(box, trim, [-2.6, 5, 4.6], [0.03, 0, 0.06], [3.2, 10, 3.2]);
    const top = new THREE.Group(); top.position.set(-2.95, 10, 4.75); top.rotation.set(0.04, 0.2, 0.08); cg.add(top);
    add(box, wall, [0, 1.3, 0], [0, 0, 0], [3.7, 2.6, 3.7], 0, top);
    add(new THREE.ConeGeometry(2.9, 1.2, 4), roofC, [0, 3.1, 0], [0, Math.PI / 4, 0], [1, 1, 1], 0, top);
    let seg = top, y0 = 3.5;
    const spire = [[2.0, 3.8, 0.12], [1.35, 3.6, 0.22], [0.75, 3.4, 0.36], [0.3, 2.2, 0.5]];
    for (const [rad, h, bend] of spire) {
      const s = new THREE.Group(); s.position.set(0, y0, 0); s.rotation.set(0, 0, -bend); seg.add(s);
      add(new THREE.CylinderGeometry(rad * 0.62, rad, h, 4, 1), roofC, [0, h / 2, 0], [0, Math.PI / 4, 0], [1, 1, 1], 1, s);
      seg = s; y0 = h;
    }
    // weathervane: a curl on a pole
    add(box, '#14101a', [0, y0 + 0.9, 0], [0, 0, 0], [0.12, 2.0, 0.12], 0, seg);
    add(new THREE.TorusGeometry(0.45, 0.07, 4, 10, Math.PI * 1.6), '#14101a', [0.4, y0 + 1.7, 0], [0, 0, 0.5], [1, 1, 1], 0, seg);
    // chimney
    add(box, trim, [2.4, 9.6, -4], [0, 0, -0.1], [0.9, 3, 0.9]);
    // lit windows (local rects baked later), door glow
    const W = [];
    const archWin = (cx, cy, w, h, place) => W.push({ cx, cy, w, h, place });
    for (const z of [-5, -1.5, 2]) archWin(z, 3.2, 1.0, 2.0, 'side');
    archWin(1.6, 3.6, 1.4, 2.4, 'front');
    archWin(-2.6, 1.3, 1.5, 2.4, 'door');
    archWin(0, 1.4, 1.2, 1.4, 'belfry');
    cg.position.set(CHAPEL.x, terrainH(CHAPEL.x, CHAPEL.z) - 0.4, CHAPEL.z);
    cg.lookAt(0, cg.position.y, 8.5);
    cg.rotateY(-0.45); // three-quarter view from the spawn point shows a lit side
    cg.updateMatrixWorld(true);
    const parts = [];
    cg.traverse((o) => {
      if (!o.isMesh) return;
      let g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();
      g.deleteAttribute('uv');
      g.applyMatrix4(o.matrixWorld);
      const n = g.attributes.position.count, c = lin(o.userData.color);
      const col = new Float32Array(n * 3), st = new Float32Array(n).fill(o.userData.stripe);
      for (let i = 0; i < n; i++) c.toArray(col, i * 3);
      g.setAttribute('color', new THREE.BufferAttribute(col, 3));
      g.setAttribute('aStripe', new THREE.BufferAttribute(st, 1));
      parts.push(g);
    });
    const pm = mat(propFrag, { uFogMax: { value: 0.5 }, uHaze: { value: dc(['#4a4266', '#7a5070', '#c0c4b0']) } }, { vertexColors: true, defines: { STRIPE: 1 } });
    group.add(new THREE.Mesh(mergeGeometries(parts), pm));
    // windows: arched quads just proud of the walls
    const wr = rng(31);
    // lanterns zig-zagging up the path to the chapel door
    const toYard = Math.atan2(8.5 - CHAPEL.z, -CHAPEL.x);
    for (let i = 0; i < 6; i++) {
      const a = toYard + (i % 2 ? 0.45 : -0.35) + i * 0.05, rr = 34 - i * 5;
      const x = CHAPEL.x + Math.cos(a) * rr, z = CHAPEL.z + Math.sin(a) * rr;
      const f = new Flat(); f.rect(-0.35, 1.4, 0.35, 2.1);
      const g = f.geometry().applyMatrix4(placeMatrix(x, terrainH(x, z), z));
      g.setAttribute('aPhase', new THREE.BufferAttribute(new Float32Array(6).fill(wr()), 1));
      winGeos.push(g);
    }
    for (const { cx, cy, w, h, place } of W) {
      const f = new Flat();
      const pts = [[-w / 2, -h / 2], [w / 2, -h / 2]];
      for (let i = 0; i <= 6; i++) { const a = (i / 6) * Math.PI; pts.push([Math.cos(a) * w / 2, h / 2 - w / 2 + Math.sin(a) * w / 2]); }
      f.poly(pts);
      const g = f.geometry();
      const m4 = new THREE.Matrix4();
      if (place === 'side') m4.compose(new THREE.Vector3(4.15, cy, cx), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI / 2, 0.035)), new THREE.Vector3(1, 1, 1));
      else if (place === 'front') m4.makeTranslation(cx, cy, 4.55);
      else if (place === 'door') m4.makeTranslation(cx, cy, 6.25);
      else m4.makeTranslation(0, 1.4, 1.9);
      const base = place === 'belfry' ? top.matrixWorld : cg.matrixWorld;
      g.applyMatrix4(new THREE.Matrix4().multiplyMatrices(base, m4));
      const ph = new Float32Array(g.attributes.position.count).fill(wr());
      g.setAttribute('aPhase', new THREE.BufferAttribute(ph, 1));
      winGeos.push(g);
    }
  }

  // ---------- far ridges ----------
  const windmill = { hub: null };
  const layers = [
    // colors: [night, dusk, day]
    { R: 236, H: (a) => 13 + 20 * ringNoise(a, 2.2, 1) + 10 * ringNoise(a, 6, 4) ** 2, color: ['#211b2e', '#3a2640', '#5e7c52'], haze: ['#3a3452', '#7a5070', '#b4c09e'], fog: 0.32, mist: [4, 16] },
    { R: 336, H: (a) => 26 + 34 * ringNoise(a, 1.8, 7) + 8 * ringNoise(a, 7, 2), color: ['#382f50', '#5a3a5c', '#86a07e'], haze: ['#4d4570', '#8a5a78', '#c4cbb4'], fog: 0.5, mist: [10, 30] },
    { R: 470, H: (a) => 48 + 50 * ringNoise(a, 1.5, 13) + 10 * ringNoise(a, 5, 3), color: ['#564c80', '#7a5078', '#a6b8bc'], haze: ['#665e92', '#9a6680', '#d2d6cc'], fog: 0.62, mist: [20, 50] },
  ];
  const VILLAGE_A = azOf(1, -0.32), MILL_A = azOf(-1, 0.3), TOWN2_A = azOf(-0.25, 1);
  layers.forEach((L, li) => {
    // flatten a shelf where the set pieces stand
    const H0 = L.H;
    L.H = (a) => {
      let h = H0(a);
      if (li === 1) h = h + (40 - h) * smooth(0.28, 0.12, angDist(a, VILLAGE_A));
      if (li === 0) h = h + (30 - h) * smooth(0.14, 0.05, angDist(a, MILL_A));
      if (li === 1) h = h + (34 - h) * smooth(0.2, 0.08, angDist(a, TOWN2_A));
      return h;
    };
    const geos = [ridgeGeo(L.R, L.H)];
    const at = (a, dr = 3) => [Math.cos(a) * (L.R - dr), L.H(a) - 0.6 - dr * 0.1, Math.sin(a) * (L.R - dr)];
    const put = (f, a, s = 1, lean = 0, dr = 3) => { const [x, y, z] = at(a, dr); const m = placeMatrix(x, y, z, lean, s); geos.push(f.geometry().applyMatrix4(m)); return m; };
    if (li === 0) {
      // trees along the crest
      for (let i = 0; i < 16; i++) {
        const a = r() * Math.PI * 2;
        if (angDist(a, MILL_A) < 0.15) continue;
        const f = new Flat(); deadTree(f, rng(Math.floor(r() * 1e6)), r.range(9, 15), 0.5);
        put(f, a, 1, r.range(-0.1, 0.1));
      }
      // windmill on its knoll, west along the road
      const f = new Flat();
      f.poly([[-4, -3], [4, -3], [2.4, 16], [-1.8, 16.3]]);
      f.poly([[-3.2, 15.5], [3.6, 15.5], [0.6, 20.5]]);
      f.rect(-0.9, -3, 0.9, 3.2);
      const m = put(f, MILL_A, 1, 0.04);
      winGeos.push(windowsGeo([[-0.5, 8, 0.6, 9.6], [0.2, 12.5, 1.0, 13.6]], m, r));
      windmill.hub = new THREE.Vector3(0.4, 15.2, 1.2).applyMatrix4(m);
      windmill.m = m;
    } else if (li === 1) {
      // the village: a huddle of crooked houses, one with a tower
      for (const [a0, n] of [[VILLAGE_A, 9], [TOWN2_A, 5]]) for (let i = 0; i < n; i++) {
        const a = a0 + (i - n / 2) * 0.028 + r.range(-0.008, 0.008);
        const f = new Flat(), win = [];
        house(f, r, r.range(6, 11), r.range(6, 11), win, i === Math.floor(n / 2) || (n > 6 && i === 1));
        const m = put(f, a, 1, r.range(-0.06, 0.06), 3 + (i % 3) * 3);
        winGeos.push(windowsGeo(win, m, r));
      }
      for (let i = 0; i < 18; i++) {
        const a = r() * Math.PI * 2;
        if (angDist(a, VILLAGE_A) < 0.3 || angDist(a, TOWN2_A) < 0.2) continue;
        const f = new Flat(); deadTree(f, rng(Math.floor(r() * 1e6)), r.range(14, 22), 0.4);
        put(f, a, 1, r.range(-0.1, 0.1));
      }
    } else {
      // spiky far woods
      for (let i = 0; i < 70; i++) {
        const a = r() * Math.PI * 2, h = r.range(12, 26), w = h * r.range(0.18, 0.3);
        const [x, y, z] = at(a, 2);
        const t = new Flat(); t.poly([[-w, -6], [w, -6], [r.range(-0.15, 0.15) * h, h]]);
        geos.push(t.geometry().applyMatrix4(placeMatrix(x, y, z, r.range(-0.1, 0.1))));
      }
    }
    const m = mat(silFrag, { uFogMax: { value: L.fog }, uTime, uColor: { value: dc(L.color) }, uHaze: { value: dc(L.haze) }, uMistY: { value: new THREE.Vector2(...L.mist) } }, { side: THREE.DoubleSide });
    L.mat = m;
    group.add(new THREE.Mesh(mergeGeometries(geos), m));
  });

  // windmill sails (one animated mesh)
  let sails = null;
  {
    const f = new Flat();
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + 0.3, c = Math.cos(a), s = Math.sin(a);
      const P = (u, v) => [c * u - s * v, s * u + c * v];
      f.quad(P(0, -0.25), P(10, -0.25), P(10, 0.25), P(0, 0.25));
      f.quad(P(2.5, 0.25), P(10, 0.25), P(10, 2.0), P(2.5, 1.6));
    }
    sails = new THREE.Mesh(f.geometry(), layers[0].mat);
    sails.position.copy(windmill.hub);
    sails.quaternion.setFromRotationMatrix(windmill.m);
    group.add(sails);
  }

  // windows of every layer in one draw call
  {
    const g = mergeGeometries(winGeos);
    const m = mat(windowFrag, { uFogMax: { value: 0.3 }, uTime }, { defines: { PHASE: 1 }, side: THREE.DoubleSide });
    group.add(new THREE.Mesh(g, m));
  }

  // mist bands between the layers
  const mists = [];
  for (const [R, y0, y1, alpha, color] of [[200, -6, 22, 0.3, ['#5e5684', '#a07090', '#f4ece2']], [300, 0, 45, 0.3, ['#6a6290', '#b07a94', '#f6efe6']]]) {
    const g = new THREE.CylinderGeometry(R, R, y1 - y0, 120, 1, true).translate(0, (y0 + y1) / 2, 0);
    const m = mat(mistFrag, { uFogMax: { value: 0.6 }, uTime, uColor: { value: dc(color) }, uY: { value: new THREE.Vector2(y0, y1) }, uAlpha: { value: alpha } },
      { transparent: true, depthWrite: false, side: THREE.BackSide });
    const mesh = new THREE.Mesh(g, m);
    mesh.renderOrder = 2;
    mesh.userData.alpha = alpha;
    mists.push(mesh);
    group.add(mesh);
  }

  for (const o of group.children) o.matrixAutoUpdate = o === sails;
  group.traverse((o) => o.updateMatrix());
  scene.add(group);

  return {
    update(time, dt) {
      uTime.value = time;
      if (sails) { sails.rotateZ(dt * 0.25); sails.updateMatrix(); }
    },
    setDay(k) {
      for (const [c, hex] of dayColors) dayColor(hex, k, c);
      // thinner mist by day
      for (const m of mists) m.material.uniforms.uAlpha.value = m.userData.alpha * (1 - 0.45 * Math.min(1, Math.max(0, k)));
    },
  };
}

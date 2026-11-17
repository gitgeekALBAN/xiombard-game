import * as THREE from 'three';

// A whole character as one signed distance function, drawn by raymarching inside a box.
// There is no mesh and no texture: the body is two round cones, the limbs are capsules, the hat and scarf are a
// few more formulas, and every part is blended into its neighbours with a smooth minimum, so joints stay soft
// like clay however the six rigid parts move. The painted look comes from the same math:
//   ink lines     where a ray grazes the surface without hitting it, and where two materials meet
//   gouache       3D noise mottles the paint, stretched noise leaves short brush dashes
//   soft shading  wrapped light, a tinted shadow side, ambient occlusion and one soft shadow ray from the SDF
// The fragment writes its own depth, so characters sort correctly against ordinary meshes.
const vert = /* glsl */ `
varying vec3 vWorld;
void main() {
  vec4 w = modelMatrix * vec4(position, 1.0);
  vWorld = w.xyz;
  gl_Position = projectionMatrix * viewMatrix * w;
}`;

const frag = /* glsl */ `
uniform mat4 uInv[6];   // world -> rest space of body, head, armL, armR, legL, legR
uniform mat4 uProj;
uniform vec3 uBoxC, uBoxH;
uniform vec4 uBean;     // belly y, belly radius, neck y, neck radius
uniform vec3 uHead;     // head y, head radius, depth squash
uniform vec3 uShoulder, uHand;
uniform vec2 uArm;      // arm radius, mitten radius
uniform vec4 uLeg;      // hip x, hip y, leg radius, boot top
uniform vec4 uHat;      // base y, brim radius, crown radius, crown height
uniform vec4 uHat2;     // 0 cylinder / 1 dome, band height, band padding, pompom radius
uniform vec4 uScarf;    // y, ring radius, tube radius, tail length
uniform vec3 uTail;     // x of tail one, x of tail two (9 = none), half width
uniform float uHair;
uniform vec3 uCol[9];   // skin, scarf, hat, band, mitten, leg, boot, nose, hair
uniform vec3 uLightDir, uLightCol, uShadeCol, uRimDir, uRimCol, uInk;
uniform float uLine, uGrain, uPix;
varying vec3 vWorld;

float hash1(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float noise(vec3 x) {
  vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash1(i), hash1(i + vec3(1, 0, 0)), f.x), mix(hash1(i + vec3(0, 1, 0)), hash1(i + vec3(1, 1, 0)), f.x), f.y),
             mix(mix(hash1(i + vec3(0, 0, 1)), hash1(i + vec3(1, 0, 1)), f.x), mix(hash1(i + vec3(0, 1, 1)), hash1(i + vec3(1, 1, 1)), f.x), f.y), f.z);
}
float fbm(vec3 p) { return 0.5 * noise(p) + 0.3 * noise(p * 2.1 + 3.7) + 0.2 * noise(p * 4.3 + 9.1); }

float smin(float a, float b, float k) { float h = max(k - abs(a - b), 0.0) / k; return min(a, b) - h * h * k * 0.25; }
float sdRoundCone(vec3 p, vec3 a, vec3 b, float r1, float r2) {
  vec3 ba = b - a; float l2 = dot(ba, ba), rr = r1 - r2, a2 = l2 - rr * rr, il2 = 1.0 / l2;
  vec3 pa = p - a; float y = dot(pa, ba), z = y - l2;
  vec3 xv = pa * l2 - ba * y; float x2 = dot(xv, xv), y2 = y * y * l2, z2 = z * z * l2;
  float k = sign(rr) * rr * rr * x2;
  if (sign(z) * a2 * z2 > k) return sqrt(x2 + z2) * il2 - r2;
  if (sign(y) * a2 * y2 < k) return sqrt(x2 + y2) * il2 - r1;
  return (sqrt(x2 * a2 * il2) + y * rr) * il2 - r1;
}
float sdEll(vec3 p, vec3 r) { float k0 = length(p / r), k1 = length(p / (r * r)); return k0 * (k0 - 1.0) / k1; }
float sdCyl(vec3 p, float r, float h, float rd) { vec2 d = vec2(length(p.xz) - r + rd, abs(p.y) - h + rd); return min(max(d.x, d.y), 0.0) + length(max(d, 0.0)) - rd; }
float sdBox2(vec2 p, vec2 b) { vec2 d = abs(p) - b; return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0); }

// keep the nearest material and the distance to the runner-up (ink is drawn where the two are close)
void take(inout vec3 res, float d, float id) { if (d < res.x) { res.z = res.x; res.x = d; res.y = id; } else if (d < res.z) res.z = d; }

float arm(vec3 p) { return sdRoundCone(p, uShoulder, uHand, uArm.x, uArm.x * 0.88); }
float mitten(vec3 p) {
  vec3 dir = normalize(uHand - uShoulder), q = p - uHand;
  q.z /= 0.72;
  float d = sdRoundCone(q, dir * uArm.y * 0.1, dir * uArm.y * 1.05, uArm.y * 0.8, uArm.y) * 0.72;
  vec3 th = uHand + dir * uArm.y * 0.35 + vec3(-0.25 * uArm.y, 0.25 * uArm.y, 0.85 * uArm.y);
  return smin(d, length(p - th) - uArm.y * 0.42, 0.02);
}
float leg(vec3 p) { return sdRoundCone(p, vec3(uLeg.x, uLeg.y + 0.04, 0.0), vec3(uLeg.x, 0.06, 0.0), uLeg.z, uLeg.z); }
float boot(vec3 p) {
  float r = uLeg.z;
  float shaft = sdRoundCone(p, vec3(uLeg.x, uLeg.w, 0.0), vec3(uLeg.x, r * 1.2, 0.0), r * 1.42, r * 1.5);
  float foot = sdEll(p - vec3(uLeg.x, r * 1.15, r * 1.5), vec3(r * 1.75, r * 1.25, r * 2.9));
  return max(max(smin(shaft, foot, 0.02), -p.y), p.y - uLeg.w);
}
float tail(vec3 p, float belly, float x, float len) {
  vec2 rq = vec2(p.x - x, p.y - (uScarf.x - len * 0.5));
  float dr = sdBox2(rq, vec2(uTail.z, len * 0.5));
  if (rq.y < -len * 0.5 + 0.055) dr = max(dr, (abs(fract(rq.x / 0.024) - 0.5) - 0.3) * 0.024); // fringe
  return max(max(abs(belly - 0.022) - 0.012, dr), -p.z); // a strip of cloth lying on the belly
}

vec3 map(vec3 pw) {
  vec3 p0 = (uInv[0] * vec4(pw, 1.0)).xyz, p1 = (uInv[1] * vec4(pw, 1.0)).xyz;
  vec3 p2 = (uInv[2] * vec4(pw, 1.0)).xyz, p3 = (uInv[3] * vec4(pw, 1.0)).xyz;
  vec3 p4 = (uInv[4] * vec4(pw, 1.0)).xyz, p5 = (uInv[5] * vec4(pw, 1.0)).xyz;
  p3.x = -p3.x; p5.x = -p5.x;
  float zs = uHead.z, yN = uBean.z;
  vec3 res = vec3(1e9, 0.0, 1e9);

  // skin: belly, head and arms melt into one clay shape
  float belly = sdRoundCone(vec3(p0.xy, p0.z / zs), vec3(0.0, uBean.x, 0.0), vec3(0.0, yN, 0.0), uBean.y, uBean.w) * zs;
  float head = sdRoundCone(vec3(p1.xy, p1.z / zs), vec3(0.0, yN, 0.0), vec3(0.0, uHead.x, 0.0), uBean.w, uHead.y) * zs;
  float skin = smin(belly, head, 0.06);
  skin = smin(skin, min(arm(p2), arm(p3)), 0.045);
  take(res, skin, 1.0);

  // scarf: two loose wraps around the neck and one or two tails
  vec3 qs = vec3(p0.x, p0.y - uScarf.x, p0.z / zs);
  float ang = atan(qs.x, qs.z), rr = length(qs.xz);
  float ring = length(vec2(rr - uScarf.y, qs.y + 0.012 * sin(ang * 2.0 + 0.6))) - uScarf.z;
  ring = smin(ring, length(vec2(rr - uScarf.y * 1.06, qs.y + uScarf.z * 1.05 - 0.014 * sin(ang * 2.0 + 2.2))) - uScarf.z * 0.9, 0.012);
  ring = (ring + 0.0035 * sin(ang * 11.0 + qs.y * 45.0)) * zs;
  float scarf = min(ring, tail(p0, belly, uTail.x, uScarf.w));
  if (uTail.y < 5.0) scarf = min(scarf, tail(p0, belly, uTail.y, uScarf.w * 0.82));
  take(res, scarf, 2.0);

  // hat, worn a touch crooked
  vec3 ph = p1 - vec3(0.0, uHat.x, 0.0);
  ph.xy = mat2(0.9976, 0.0698, -0.0698, 0.9976) * ph.xy;
  float cr = uHat.z, ch = uHat.w, crown;
  if (uHat2.x > 0.5) crown = max(sdEll(ph, vec3(cr, ch, cr)), -ph.y);
  else {
    float k = 1.0 - 0.14 * clamp(ph.y / ch, 0.0, 1.0);
    crown = sdCyl(vec3(ph.x / k, ph.y - ch * 0.5, ph.z / k), cr, ch * 0.5, 0.035) * k;
    crown = max(crown, -sdEll(ph - vec3(0.0, ch + 0.035, 0.0), vec3(cr * 0.42, 0.075, cr * 1.3))); // the pinch on top
  }
  float hat = crown;
  if (uHat.y > 0.0) {
    vec3 pb = ph; pb.y -= 0.32 * pb.x * pb.x - 0.12 * pb.z * pb.z;
    hat = smin(hat, sdCyl(pb, uHat.y, 0.013, 0.012), 0.025);
  }
  if (uHat2.w > 0.0) hat = min(hat, length(ph - vec3(0.0, ch + uHat2.w * 0.55, 0.0)) - uHat2.w);
  take(res, hat, 3.0);
  float bandR = (uHat2.x > 0.5 ? cr * sqrt(max(1.0 - pow(uHat2.y * 0.5 / ch, 2.0), 0.0)) : cr * 0.97) + uHat2.z;
  take(res, sdCyl(ph - vec3(0.0, uHat2.y * 0.5 + 0.012, 0.0), bandR, uHat2.y * 0.5, min(uHat2.y * 0.45, uHat2.z + 0.008)), 4.0);

  take(res, min(mitten(p2), mitten(p3)), 5.0);
  take(res, min(leg(p4), leg(p5)), 6.0);
  take(res, min(boot(p4), boot(p5)), 7.0);
  take(res, sdEll(p1 - vec3(0.0, uHead.x - uHead.y * 0.1, uHead.y * zs * 0.98), uHead.y * vec3(0.17, 0.15, 0.24)), 8.0);
  if (uHair > 0.5) {
    float hair = sdEll(p1 - vec3(0.0, uHead.x - uHead.y * 0.25, -0.012), vec3(uHead.y + 0.034, uHead.y * 1.35, (uHead.y + 0.03) * zs));
    take(res, max(hair, p1.z - uHead.y * 0.34), 9.0);
  }
  return res;
}

vec3 normalAt(vec3 p) {
  vec2 e = vec2(0.0012, -0.0012);
  return normalize(e.xyy * map(p + e.xyy).x + e.yyx * map(p + e.yyx).x + e.yxy * map(p + e.yxy).x + e.xxx * map(p + e.xxx).x);
}
float occlusion(vec3 p, vec3 n) {
  float o = 0.0, s = 1.0;
  for (int i = 1; i <= 4; i++) { float h = 0.03 * float(i); o += (h - map(p + n * h).x) * s; s *= 0.6; }
  return clamp(1.0 - 4.5 * o, 0.0, 1.0);
}
float shadow(vec3 p, vec3 l) {
  float res = 1.0, t = 0.03;
  for (int i = 0; i < 14; i++) { float d = map(p + l * t).x; res = min(res, 9.0 * d / t); t += clamp(d, 0.02, 0.12); if (res < 0.02 || t > 0.9) break; }
  return clamp(res, 0.0, 1.0);
}

// the face is painted straight onto the head: closed happy eyes, a lopsided smile, rosy cheeks
vec4 face(vec3 p1) {
  float s = uHead.y; vec2 f = p1.xy - vec2(0.0, uHead.x);
  if (p1.z < 0.0) return vec4(0.0);
  float lw = 0.03 * s, ink = 0.0;
  for (int i = 0; i < 2; i++) {
    vec2 c = vec2(i == 0 ? -0.4 : 0.4, 0.36) * s, q = f - c;
    float d = abs(length(q) - 0.2 * s) - lw;
    if (q.y < -0.12 * s) ink = max(ink, smoothstep(lw * 0.5, -lw * 0.2, d));
  }
  vec2 q = f - vec2(0.1, -0.02) * s;
  float a = atan(q.x, -q.y), d = abs(length(q) - 0.4 * s) - lw;
  if (a > -0.6 && a < 0.9) ink = max(ink, smoothstep(lw * 0.5, -lw * 0.2, d));
  float blush = max(smoothstep(0.17 * s, 0.06 * s, length(f - vec2(-0.6, -0.02) * s)), smoothstep(0.17 * s, 0.06 * s, length(f - vec2(0.6, -0.02) * s)));
  return vec4(blush * 0.42, ink, 0.0, 0.0);
}

void main() {
  vec3 ro = cameraPosition, rd = normalize(vWorld - cameraPosition);
  vec3 inv = 1.0 / rd, t0 = (uBoxC - uBoxH - ro) * inv, t1 = (uBoxC + uBoxH - ro) * inv;
  vec3 tmin = min(t0, t1), tmax = max(t0, t1);
  float t = max(max(tmin.x, tmin.y), max(tmin.z, 0.0)), tF = min(tmax.x, min(tmax.y, tmax.z));
  if (t > tF) discard;

  vec3 res = vec3(0.0);
  float prev = 1e9, near = 1e9, nearT = t, graze = 1e9; bool hit = false;
  for (int i = 0; i < 80; i++) {
    res = map(ro + rd * t);
    float d = res.x, w = max(uLine, 1.6 * uPix * t);
    if (d < 0.0012 * t) { hit = true; break; }
    if (d / w < near) { near = d / w; nearT = t; }
    if (d > prev && prev / w < graze) graze = prev / w; // slid past something on the way: an occluding contour
    prev = d;
    t += d * 0.85;
    if (t > tF) break;
  }

  vec3 col; float alpha = 1.0, depthT = t;
  if (!hit) {
    alpha = smoothstep(1.0, 0.45, near);
    if (alpha < 0.01) discard;
    col = uInk; depthT = nearT;
  } else {
    vec3 p = ro + rd * t, n = normalAt(p);
    int id = int(res.y + 0.5);
    vec3 p0 = (uInv[0] * vec4(p, 1.0)).xyz, p1 = (uInv[1] * vec4(p, 1.0)).xyz;
    col = uCol[id - 1];
    float w = max(uLine, 1.6 * uPix * t), line = max(smoothstep(1.0, 0.45, graze), smoothstep(w * 0.8, w * 0.3, res.z - res.x));

    // gouache: blotchy pigment, a few short brush dashes that follow the form
    vec3 pl = id == 1 || id == 2 ? p0 : p1;
    col *= 0.93 + 0.14 * fbm(pl * 7.0);
    if (id == 1) {
      float a = atan(pl.x, pl.z);
      float dash = noise(vec3(a * 4.0, pl.y * 60.0, 3.0)) * smoothstep(0.45, 0.75, noise(vec3(a * 2.3, pl.y * 7.0, 7.0)));
      col *= 1.0 - 0.11 * smoothstep(0.5, 0.72, dash);
      vec4 fc = face(p1);
      col = mix(col, vec3(0.86, 0.5, 0.55), fc.x);
      line = max(line, fc.y);
    } else if (id == 2) col *= 0.93 + 0.07 * sin(pl.y * 150.0 + 6.0 * noise(pl * 30.0));          // woven
    else if (id == 3 && uHat2.x > 0.5) col *= 0.88 + 0.12 * sin(atan(p1.x, p1.z) * 30.0);       // knitted ribs
    else if (id == 4 && uHat2.z > 0.012) col *= 0.86 + 0.14 * sin(atan(p1.x, p1.z) * 44.0);

    float ndl = dot(n, uLightDir), ao = occlusion(p, n), sh = shadow(p + n * 0.01, uLightDir);
    float lit = smoothstep(-0.3, 0.8, ndl) * mix(0.3, 1.0, sh);
    lit = floor(lit * 3.0 + 0.5) / 3.0 * 0.35 + lit * 0.65; // a hint of painted steps inside a soft gradient
    vec3 light = mix(uShadeCol, uLightCol, lit) * mix(0.62, 1.0, ao);
    light += uRimCol * pow(clamp(dot(n, uRimDir) * 0.6 + 0.4, 0.0, 1.0), 3.0) * (1.0 - 0.6 * lit);
    col *= light;
    col *= mix(1.0, 0.8, pow(1.0 - abs(dot(n, rd)), 3.0)); // paint pools darker toward the outline
    col = mix(col, uInk, line);
  }
  col *= 1.0 + (hash1(vec3(gl_FragCoord.xy, 1.0)) - 0.5) * uGrain; // paper grain

  vec4 clip = uProj * viewMatrix * vec4(ro + rd * depthT, 1.0);
  gl_FragDepth = clamp(clip.z / clip.w * 0.5 + 0.5, 0.0, 1.0);
  gl_FragColor = vec4(col, alpha);
  #include <colorspace_fragment>
}`;

const BOX = new THREE.BoxGeometry(2, 2, 2);
const HALF = new THREE.Vector3(1.3, 1.5, 1.3);

// One raymarched character. `def.look` holds the shape and colors, `parts` six rest -> world matrices to follow.
export class SdfCharacter {
  constructor(def, camera) {
    const k = def.look, col = (h) => new THREE.Color(h);
    this.inv = Array.from({ length: 6 }, () => new THREE.Matrix4());
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uInv: { value: this.inv }, uProj: { value: camera.projectionMatrix }, uBoxC: { value: new THREE.Vector3() }, uBoxH: { value: HALF },
        uBean: { value: new THREE.Vector4(...k.bean) }, uHead: { value: new THREE.Vector3(...k.head) },
        uShoulder: { value: new THREE.Vector3(...k.shoulder) }, uHand: { value: new THREE.Vector3(...k.hand) }, uArm: { value: new THREE.Vector2(...k.arm) },
        uLeg: { value: new THREE.Vector4(...k.leg) }, uHat: { value: new THREE.Vector4(...k.hat) }, uHat2: { value: new THREE.Vector4(...k.hat2) },
        uScarf: { value: new THREE.Vector4(...k.scarf) }, uTail: { value: new THREE.Vector3(...k.tail) }, uHair: { value: k.hair ? 1 : 0 },
        uCol: { value: ['skin', 'scarf', 'hat', 'band', 'mitten', 'leg', 'boot', 'nose', 'hair'].map((n) => col(k.colors[n] || '#000')) },
        uLightDir: { value: new THREE.Vector3() }, uLightCol: { value: new THREE.Color() }, uShadeCol: { value: new THREE.Color() },
        uRimDir: { value: new THREE.Vector3() }, uRimCol: { value: new THREE.Color() }, uInk: { value: new THREE.Color() },
        uLine: { value: 0.011 }, uGrain: { value: 0.09 }, uPix: { value: 0.001 },
      },
      vertexShader: vert, fragmentShader: frag, side: THREE.BackSide, transparent: true,
    });
    this.mesh = new THREE.Mesh(BOX, this.material);
    this.mesh.scale.copy(HALF);
    this.mesh.renderOrder = 5;
  }

  // parts: Matrix4 list holding this character's six rest -> world matrices from index `base`; center: where the body is now
  update(parts, base, center) {
    for (let i = 0; i < 6; i++) this.inv[i].copy(parts[base + i]).invert();
    this.mesh.position.copy(center);
    this.material.uniforms.uBoxC.value.copy(center);
  }
}

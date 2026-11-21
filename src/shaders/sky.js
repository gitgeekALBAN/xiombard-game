import * as THREE from 'three';
import { noise, noiseExtra } from './noise.glsl.js';
import { MOON_DIR, DAY, dayGLSL } from './toon.js';

// Storybook sky: a painted gradient with a glow band at the horizon, a huge pale moon with a halo, twinkling stars,
// long dry-brush streaks high up and three rows of cumulus clouds painted on a cylinder around the viewer like a
// stage backdrop: flat bottoms, puffs piled on top, a ragged brushed edge, a spiral here and there.
// Colors are chosen in display (sRGB) space and decoded exactly, so at the horizon the sky lands on precisely
// the scene fog color (`horizon`, a THREE.Color) and far ground melts into it without a seam.
// The moon writes alpha < 1: the post pipeline reads (1 - alpha) as extra bloom, so the moon glows without
// pushing its painted surface into clipped white. Every opaque material writes alpha 1.
// Day/night follows the shared uDay uniform (toon.js): the stars and moon fade, a painted sun rises along sunDir()
// (low and orange at dusk, warm white by day), the gradient goes from indigo through magenta to lavender-blue over
// cream, and the same clouds change tone: violet with a silver lining toward the moon at night, dark with glowing
// orange undersides at dusk, cream with lavender shade by day. uHorizon must be kept equal to the fog color
// (View.setDay does).
export const MOON_RADIUS = 0.15; // radians, about 8.6 degrees
export const SUN_RADIUS = 0.075;

export function createSky(horizon = new THREE.Color('#2a2344')) {
  const hz = horizon.getRGB({ r: 0, g: 0, b: 0 }, THREE.SRGBColorSpace);
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uMoon: { value: MOON_DIR.clone() },
      uHorizon: { value: new THREE.Vector3(hz.r, hz.g, hz.b) },
      uDay: DAY,
    },
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main() {
        vDir = position;
        vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        gl_Position = p.xyww;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uTime; uniform vec3 uMoon; uniform vec3 uHorizon;
      varying vec3 vDir;
      ${noise}
      ${noiseExtra}
      ${dayGLSL}
      const float MR = ${MOON_RADIUS.toFixed(4)};
      const float SR = ${SUN_RADIUS.toFixed(4)};

      const float TAU = 6.2831853;
      vec2 rot2(vec2 p, float a) { float c = cos(a), s = sin(a); return vec2(c * p.x - s * p.y, s * p.x + c * p.y); }
      float wrapA(float a) { return a - TAU * floor(a / TAU + 0.5); }

      // Storybook clouds are painted on a cylinder around the viewer, like a backdrop: p = (azimuth, elevation) in
      // radians. One row holds n cells per turn; a cell has a cloud or not. A cloud is a handful of round puffs
      // standing on a flat base line, big in the middle and small at the ends; some are long flat streaks, some
      // tower. Returns the distance into the nearest puff (positive inside) and, for that puff: the vector from
      // its center (lv), its radius (lr), whether it carries a spiral and which way round (rnd), the height above the cloud's base (yb)
      // and the cloud's height (ch).
      float cloudRow(vec2 p, float n, float y0, float sz, float cov, float seed, out vec2 lv, out float lr, out float rnd, out float yb, out float ch) {
        float cw = TAU / n, x = p.x / cw;
        float best = -1.0;
        lv = vec2(0.0, 1.0); lr = 1.0; rnd = 0.0; yb = -1.0; ch = sz;
        for (int o = 0; o < 2; o++) {
          float cell = floor(x) + (o == 0 ? 0.0 : (fract(x) < 0.5 ? -1.0 : 1.0));
          float id = mod(cell, n);
          vec2 h = hash22(vec2(id, seed));
          if (h.x > cov) continue;
          vec2 h2 = hash22(vec2(id + 17.0, seed + 3.0));
          float H = sz * mix(0.7, 1.15, h2.y), W = H * mix(2.3, 3.3, h.y);
          if (h2.x < 0.22) { W *= 1.35; H *= 0.36; } // a long flat streak
          float base = y0 + (hash12(vec2(id, seed + 9.0)) - 0.5) * sz * 1.3;
          vec2 q = vec2((x - cell - 0.5 - (h.y - 0.5) * 0.2) * cw, p.y - base);
          if (abs(q.x) > W * 0.5 + H || q.y < -0.01 || q.y > H * 1.5) continue;
          bool flat_ = h2.x < 0.22, tall = h2.x > 0.74;
          // five puffs along the base, big in the middle; two more piled on top (three on a towering cloud)
          for (int i = 0; i < 8; i++) {
            if (i > 4 && flat_) break;
            if (i == 7 && !tall) break;
            vec2 hh = hash22(vec2(id * 9.0 + float(i), seed + 1.7));
            float r; vec2 c;
            if (i < 5) {
              float fi = (float(i) + 0.5) / 5.0;
              r = H * 0.5 * pow(sin(3.14159 * fi), 0.8) * (0.72 + 0.28 * hh.x);
              c = vec2((fi - 0.5) * W + (hh.y - 0.5) * W * 0.06, r * 0.5);
            } else if (i < 7) {
              r = H * (0.36 + 0.14 * hh.x);
              c = vec2((i == 5 ? -0.14 : 0.13) * W + (hh.y - 0.5) * W * 0.14, H * (0.5 + 0.12 * hh.x));
            } else {
              r = H * 0.34;
              c = vec2((hh.y - 0.5) * W * 0.16, H * 1.02);
            }
            vec2 v = q - c;
            float sd = r - length(v);
            if (sd > best) { best = sd; lv = v; lr = r; rnd = i == 5 && h.y > 0.45 ? (h2.y > 0.5 ? 1.0 : -1.0) : 0.0; yb = q.y; ch = H; }
          }
        }
        return best;
      }

      // tones of a cloud by the hour (display space): the lit cap of a puff, its shaded side, the flat underside
      // and the pale line on the edge that faces the moon or the low sun
      vec3 cLit, cShade, cUnder, cRim; float rimAmt;
      // paints one row over col; returns how much it covers
      float paintRow(inout vec3 col, vec2 p, vec2 toL, float px, vec2 grain, vec3 hazeCol, float haze, float n, float y0, float sz, float cov, float seed) {
        vec2 lv; float lr, rnd, yb, ch;
        float sd = cloudRow(p, n, y0, sz, cov, seed, lv, lr, rnd, yb, ch);
        if (sd < -sz * 0.2) return 0.0;
        float g = (grain.x - 0.5) * sz * 0.055; // dry brush: the edge breaks up along the stroke
        float a = smoothstep(-px, px, min(sd + g, yb + g * 0.25));
        if (a <= 0.0) return 0.0;
        // every puff has a lit cap on the side of the light; the rest of it is in shade
        float cap = lr * 0.74 - length(lv - toL * lr * 0.3 - vec2(0.0, lr * 0.1));
        vec3 c = mix(cShade, cLit, smoothstep(-px, px, cap + g * 0.8));
        // the flat underside is the darkest tone by day and catches the low sun at dusk
        float under = 1.0 - smoothstep(ch * 0.18, ch * 0.34, yb + g * 1.5 + (grain.y - 0.5) * ch * 0.22);
        c = mix(c, cUnder, under * 0.9);
        // a painted spiral in the big puffs of some clouds
        if (rnd != 0.0) {
          float rr = length(lv) / lr, an = atan(lv.y, lv.x) * rnd;
          float sp = abs(fract(rr * 2.4 - an / TAU) - 0.5);
          c = mix(c, mix(cShade, cRim, rimAmt * 0.6), smoothstep(0.11, 0.05, sp) * smoothstep(0.92, 0.75, rr) * smoothstep(0.05, 0.2, rr) * 0.7);
        }
        // the edge toward the light is a pale line (the moon's silver lining, the dusk's gold)
        float edge = 1.0 - smoothstep(0.0, px * 2.5 + sz * 0.05, sd + g);
        c = mix(c, cRim, edge * smoothstep(-0.1, 0.5, dot(normalize(lv + 1e-5), toL)) * step(ch * 0.1, yb) * rimAmt);
        col = mix(col, mix(c, hazeCol, haze), a);
        return a;
      }

      void main() {
        vec3 d = normalize(vDir);
        float h = d.y, hh = max(h, 0.0);
        float m = dot(d, uMoon);
        float ang = acos(clamp(m, -1.0, 1.0));
        float side = pow(max(dot(normalize(d.xz + 1e-5), normalize(uMoon.xz)), 0.0), 2.0);
        float k = dayK(), dusk = duskAmt();
        vec3 sun = sunDir();
        float sunSide = pow(max(dot(normalize(d.xz + 1e-5), normalize(sun.xz)), 0.0), 2.0);
        float keySide = mix(side, sunSide, smoothstep(0.2, 0.55, k));
        float moonVis = 1.0 - smoothstep(0.35, 0.85, k);

        // ---- gradient (display space) ----
        vec3 zen = day3(vec3(0.04, 0.05, 0.19), vec3(0.2, 0.14, 0.4), vec3(0.3, 0.74, 0.84));
        vec3 mid = day3(vec3(0.21, 0.12, 0.4), vec3(0.66, 0.34, 0.48), vec3(0.74, 0.9, 0.93));
        vec3 glow = uHorizon * day3(1.28, 1.12, 1.03) + day3(vec3(0.03, 0.02, 0.02), vec3(0.04, 0.02, 0.0), vec3(0.01, 0.0, -0.01));
        glow *= 1.0 + 0.3 * side * (1.0 - smoothstep(0.2, 0.55, k));
        // the low sun sets the horizon on fire on its own side, a rose band on the far side
        glow = mix(glow, vec3(1.0, 0.62, 0.36), sunSide * dusk * 0.85);
        glow = mix(glow, glow * vec3(1.06, 1.0, 0.92), sunSide * smoothstep(0.5, 1.0, k));
        vec3 col = mix(mid, zen, smoothstep(0.1, 0.85, hh));
        col = mix(col, glow, exp(-hh * day3(9.0, 4.5, 4.0)));
        // painted wash: big soft value variation so the sky is not a flat ramp
        vec2 wp = d.xz / (hh + 0.5);
        col *= day3(0.88, 0.9, 0.95) + day3(0.26, 0.2, 0.1) * fbm3(wp * 1.1 + 4.0);

        // ---- stars (stereographic cells stay round and do not pinch at the zenith) ----
        vec2 sp = d.xz / (1.0 + hh) * 95.0;
        vec2 cell = floor(sp), jit = hash22(cell);
        float sh = hash12(cell + 7.7);
        float sd = length(fract(sp) - 0.2 - jit * 0.6);
        float size = mix(0.05, 0.13, sh * sh);
        float star = step(0.9, hash12(cell + 1.3)) * smoothstep(size, size * 0.3, sd);
        star *= 0.55 + 0.45 * sin(uTime * (1.2 + sh * 3.0) + sh * 40.0);
        star *= smoothstep(0.04, 0.3, h) * smoothstep(MR + 0.05, MR + 0.45, ang) * (1.0 - smoothstep(0.12, 0.4, k));

        // ---- moon halo ----
        float off = max(ang - MR, 0.0);
        vec3 haloCol = vec3(0.62, 0.56, 0.82);
        col += haloCol * (exp(-off / 0.045) * 0.42 + exp(-off / 0.2) * 0.2 + exp(-off / 0.6) * 0.06) * (1.0 - smoothstep(0.15, 0.5, k));

        // ---- moon disc: soft painted maria, a few ringed craters, lavender limb ----
        vec3 mu = normalize(cross(uMoon, vec3(0.0, 1.0, 0.0)));
        vec3 mv = cross(mu, uMoon);
        vec2 q = vec2(dot(d, mu), dot(d, mv)) / sin(MR);
        float r = length(q);
        float aa = fwidth(r) * 1.5;
        float disc = (1.0 - smoothstep(1.0 - aa, 1.0, r)) * step(0.0, m) * moonVis;
        float alphaBloom = 0.0;
        if (disc > 0.0) {
          float z = sqrt(max(1.0 - r * r, 0.0));
          vec2 sq = q / (0.55 + 0.45 * z); // slight spherical wrap
          float n = fbm3(sq * 1.4 + 2.3);
          float n2 = vnoise(sq * 4.5 + 9.0);
          float mare = smoothstep(0.46, 0.6, n) * 0.75 + smoothstep(0.6, 0.72, n) * 0.25;
          vec3 mc = mix(vec3(0.95, 0.93, 0.9), vec3(0.7, 0.66, 0.8), mare);
          mc = mix(mc, mc * vec3(0.9, 0.88, 0.97), smoothstep(0.55, 0.7, n2) * 0.7);
          // a few soft craters: shaded bowl on the side away from the light, bright lip toward it
          vec2 cq = sq * 2.6, cc = floor(cq);
          vec2 cj = hash22(cc + 5.0);
          float cr = mix(0.1, 0.22, cj.x);
          vec2 cv = (fract(cq) - 0.3 - cj * 0.4) / cr;
          float cdist = length(cv);
          float has = step(0.62, hash12(cc + 2.0));
          float bowl = smoothstep(1.0, 0.6, cdist);
          mc *= 1.0 - has * bowl * (0.05 + 0.08 * clamp(cv.y * 0.8 + 0.3, 0.0, 1.0));
          mc += has * smoothstep(0.7, 1.0, cdist) * smoothstep(1.3, 1.0, cdist) * clamp(-cv.y, 0.0, 1.0) * 0.05;
          mc *= mix(0.78, 1.0, pow(z, 0.45));
          mc = mix(mc, mc * vec3(0.9, 0.88, 1.06), 1.0 - z);
          // a daytime moon is a pale ghost of itself
          mc = mix(mc, mix(col, vec3(0.97, 0.97, 1.0), 0.55), smoothstep(0.5, 0.85, k));
          col = mix(col, mc, disc);
          alphaBloom = disc * 0.3 * moonVis;
        }
        alphaBloom += exp(-off / 0.04) * 0.5 * step(0.0, m) * (1.0 - disc) * moonVis * moonVis;

        // ---- sun: a flat painted disc with a soft warm halo, orange and swollen at dusk ----
        float sunVis = smoothstep(0.22, 0.45, k);
        float sAng = acos(clamp(dot(d, sun), -1.0, 1.0));
        float sr = SR * (1.0 + 0.25 * dusk);
        float sOff = max(sAng - sr, 0.0);
        vec3 sunHalo = mix(vec3(1.0, 0.9, 0.72), vec3(1.0, 0.5, 0.25), dusk);
        col += sunHalo * (exp(-sOff / 0.03) * 0.35 + exp(-sOff / 0.18) * 0.18 + exp(-sOff / 0.6) * 0.08) * sunVis;
        float sAa = fwidth(sAng) * 1.5;
        float sDisc = (1.0 - smoothstep(sr - sAa, sr, sAng)) * sunVis;
        if (sDisc > 0.0) {
          float sq = sAng / sr;
          vec3 sc = mix(vec3(1.0, 0.99, 0.94), vec3(1.0, 0.94, 0.78), smoothstep(0.4, 1.0, sq));
          sc = mix(sc, mix(vec3(1.0, 0.78, 0.5), vec3(1.0, 0.5, 0.3), smoothstep(0.2, 1.0, sq)), dusk);
          sc *= 0.96 + 0.06 * vnoise(vec2(dot(d, normalize(cross(sun, vec3(0.0, 1.0, 0.0)))), d.y) * 60.0); // brushed
          col = mix(col, sc, sDisc);
        }
        alphaBloom += sDisc * 0.2 + exp(-sOff / 0.05) * 0.25 * sunVis * (1.0 - sDisc);

        // ---- clouds: high brushed streaks, then three rows of storybook clouds, far to near ----
        float az = atan(d.x, d.z), el = asin(clamp(h, -1.0, 1.0));
        float px = fwidth(el) * 1.2 + 1e-5; // a pixel in radians (elevation has no seam, azimuth does)
        float sunW = smoothstep(0.2, 0.55, k); // lit by the moon at night, by the sun from dusk on
        vec2 lightAE = mix(vec2(atan(uMoon.x, uMoon.z), asin(uMoon.y)), vec2(atan(sun.x, sun.z), asin(clamp(sun.y, -1.0, 1.0))), sunW);
        vec2 toL = normalize(vec2(wrapA(lightAE.x - az), lightAE.y - el) + 1e-5);
        vec2 grain = vec2(vnoise(vec2(az * 230.0, el * 270.0)), vnoise(vec2(az * 45.0, el * 60.0) + 7.0));
        cLit = day3(vec3(0.3, 0.27, 0.47), vec3(0.52, 0.31, 0.45), vec3(0.955, 0.94, 0.9));
        cShade = day3(vec3(0.2, 0.175, 0.35), vec3(0.34, 0.2, 0.37), vec3(0.81, 0.83, 0.94));
        cUnder = day3(vec3(0.155, 0.135, 0.29), vec3(1.0, 0.57, 0.32), vec3(0.71, 0.74, 0.91));
        cRim = day3(vec3(0.74, 0.71, 0.92), vec3(1.0, 0.82, 0.58), vec3(0.97, 0.96, 0.93));
        rimAmt = day3(1.0, 0.85, 0.0);
        float covered = 0.0;
        // long thin streaks high up, laid on with a dry brush
        vec2 sp2 = rot2(d.xz / (hh + 0.35), 0.5);
        float streak = smoothstep(0.52, 0.74, vnoise(sp2 * vec2(0.45, 2.6) + 3.0)) * smoothstep(0.2, 0.75, vnoise(sp2 * vec2(3.0, 26.0)));
        streak *= smoothstep(0.24, 0.55, h) * day3(0.12, 0.2, 0.26);
        col = mix(col, mix(cLit, cRim, 0.3), streak);
        covered = streak * 0.6;
        float t = uTime;
        covered = max(covered, paintRow(col, vec2(az + t * 0.0016, el), toL, px, grain, glow, 0.4, 16.0, 0.065, 0.068, 0.62, 1.0));
        covered = max(covered, paintRow(col, vec2(az + t * 0.0026, el), toL, px, grain, glow, 0.16, 11.0, 0.17, 0.115, 0.62, 2.0));
        covered = max(covered, paintRow(col, vec2(az + t * 0.004, el), toL, px, grain, glow, 0.0, 7.0, 0.36, 0.2, 0.6, 3.0));
        star *= 1.0 - covered;
        alphaBloom *= 1.0 - covered * 0.85;
        col += vec3(0.85, 0.85, 1.0) * star;

        // ---- horizon: land exactly on the fog color, then stay near it below ----
        col = mix(col, uHorizon, exp(-hh * 55.0));
        if (h < 0.0) col = uHorizon * mix(1.0, 0.72, smoothstep(0.0, -0.35, h));

        gl_FragColor = vec4(srgbToLinear(col), 1.0 - alphaBloom);
        #include <colorspace_fragment>
      }`,
    side: THREE.BackSide, depthWrite: false, fog: false,
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(500, 48, 24), material);
  mesh.userData.noShadow = true;
  mesh.frustumCulled = false;
  mesh.renderOrder = -1;
  return mesh;
}

import * as THREE from 'three';
import { noise, noiseExtra } from './noise.glsl.js';
import { MOON_DIR, DAY, dayGLSL } from './toon.js';

// Gloomy storybook sky: a deep indigo gradient with a glow band at the horizon, a huge pale moon with a halo,
// flat curly clouds whose edges catch the moonlight, and twinkling stars.
// Colors are chosen in display (sRGB) space and decoded exactly, so at the horizon the sky lands on precisely
// the scene fog color (`horizon`, a THREE.Color) and far ground melts into it without a seam.
// The moon writes alpha < 1: the post pipeline reads (1 - alpha) as extra bloom, so the moon glows without
// pushing its painted surface into clipped white. Every opaque material writes alpha 1.
// Day/night follows the shared uDay uniform (toon.js): the stars and moon fade, a painted sun rises along sunDir()
// (low and orange at dusk, warm white by day), the gradient turns pale blue into peach, and the same lobed clouds
// turn into puffy cream ones lit from the sun. uHorizon must be kept equal to the fog color (View.setDay does).
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

      // Storybook clouds are unions of round lobes, not noise fluff. Lobes sit on a jittered grid; a slow,
      // stretched noise decides which cells belong to a cloud bank and how big their lobe is. Returns the
      // signed distance (positive inside) and, for the winning lobe, its center offset and radius.
      float bankAt(vec2 c) { return vnoise(c * vec2(0.16, 0.34) + 11.0) * 0.75 + vnoise(c * 0.6 + 3.0) * 0.25; }
      vec4 lobes(vec2 p, float scale, float thr, out float rad) {
        p *= scale;
        vec2 g = floor(p);
        vec4 best = vec4(-9.0, 0.0, 0.0, 0.0);
        rad = 1.0;
        for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {
          vec2 c = g + vec2(i, j);
          vec2 ctr = c + 0.15 + 0.7 * hash22(c + scale);
          float b = smoothstep(thr, thr + 0.22, bankAt(ctr / scale));
          float r = b > 0.35 ? mix(0.6, 1.0, hash12(c + 4.0 + scale)) * (0.75 + 0.25 * b) : -9.0; // overlapping lobes form one bank
          vec2 v = p - ctr;
          float sd = r - length(v);
          if (sd > best.x) { best = vec4(sd, v, hash12(c + 9.0)); rad = max(r, 1e-3); }
        }
        best.x /= scale;
        rad /= scale;
        return best;
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
        vec3 zen = day3(vec3(0.028, 0.024, 0.07), vec3(0.13, 0.11, 0.3), vec3(0.4, 0.62, 0.86));
        vec3 mid = day3(vec3(0.085, 0.064, 0.16), vec3(0.48, 0.3, 0.5), vec3(0.64, 0.79, 0.92));
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

        // ---- flat curly clouds ----
        vec2 base = d.xz / (hh + 0.3) * 1.6;
        vec2 cp = base + vec2(uTime * 0.01, uTime * 0.003);
        // the clouds are lit by the moon at night and by the sun from dusk on
        float sunW = smoothstep(0.2, 0.55, k);
        vec2 moonP = uMoon.xz / (uMoon.y + 0.3) * 1.6;
        vec2 sunP = sun.xz / (max(sun.y, 0.0) + 0.3) * 1.6;
        vec2 toL = normalize(mix(normalize(moonP - base + 1e-4), normalize(sunP - base + 1e-4), sunW) + 1e-4);
        float near = max(exp(-off / 0.35) * (1.0 - sunW), exp(-sOff / 0.35) * sunW * day3(1.0, 1.0, 0.35)); // moonlit (sunlit) zone
        // fewer clouds right on the moon so it stays readable (clouds thin out over the sun instead, see below),
        // a denser bank low in the sky; by day only a few
        float thr = 0.5 - 0.08 * smoothstep(0.45, 0.12, h) + 0.25 * exp(-off / 0.1) * moonVis + day3(0.0, 0.02, 0.16);
        float rBig, rSmall;
        // the big flat night banks become smaller puffy cumulus by day; the switch hides inside a short gap at
        // k = 0.62 where the clouds thin out to nothing, so no cloud ever pops
        float cs = k < 0.62 ? 1.0 : 1.9;
        float cGap = smoothstep(0.07, 0.0, abs(k - 0.62));
        vec4 big = lobes(cp, cs, thr, rBig);
        vec4 small = lobes(cp + 0.37, 2.3 * cs, thr + 0.04, rSmall);
        bool useBig = big.x >= small.x;
        float csd = max(big.x, small.x);
        vec2 nrm = useBig ? big.yz : small.yz;
        nrm = normalize(nrm + 1e-5);
        // high up the planar projection blows lobes up into huge arcs, so clouds keep to the lower sky
        float cover = smoothstep(day3(0.02, 0.03, 0.1), day3(0.14, 0.16, 0.22), h) * smoothstep(0.62, 0.3, h);
        // by day the bright clouds show the blocky derivative at lobe-cell seams, so the edge width is capped
        float aw = min(fwidth(csd) * 1.2, mix(1e3, 0.03, smoothstep(0.3, 0.7, k))) + 1e-4;
        float shape = smoothstep(-aw, aw, csd) * cover;
        // each lobe is shaded like a flat paper disc tilted to the moon: a bright crescent on the moon side
        float ndl = dot(nrm, toL);
        float rim = 1.0 - clamp(csd / (useBig ? rBig : rSmall) * 2.2, 0.0, 1.0); // 1 at the lobe edge
        vec3 body = mix(day3(vec3(0.085, 0.065, 0.15), vec3(0.34, 0.2, 0.36), vec3(0.76, 0.78, 0.9)),
                        day3(vec3(0.15, 0.115, 0.25), vec3(0.62, 0.34, 0.42), vec3(0.88, 0.88, 0.95)), keySide * day3(0.5, 0.5, 0.25) + near * 0.6);
        body *= day3(0.85, 0.85, 0.9) + day3(0.3, 0.3, 0.2) * smoothstep(-0.6, 0.6, nrm.y); // a little darker underneath
        vec3 litCol = mix(day3(vec3(0.24, 0.2, 0.37), vec3(0.85, 0.5, 0.42), vec3(1.0, 0.97, 0.92)),
                          day3(vec3(0.62, 0.58, 0.82), vec3(1.0, 0.7, 0.45), vec3(1.0, 0.98, 0.9)), near);
        body = mix(body, litCol, smoothstep(0.15, 0.55, ndl) * smoothstep(0.45, 0.95, rim));
        // curls: some big lobes carry a painted spiral stroke
        if (useBig && big.w > 0.84) {
          float rr = length(big.yz) / rBig;
          float an = atan(big.y, big.z) * (big.w > 0.86 ? 1.0 : -1.0);
          float sp = abs(fract(rr * 2.6 - an / 6.2832) - 0.5);
          float sw = fwidth(rr * 2.6) + 0.06;
          body = mix(body, litCol * 0.8 + body * 0.2, smoothstep(sw, sw * 0.4, sp) * smoothstep(0.85, 0.6, rr) * smoothstep(0.08, 0.2, rr) * 0.45);
        }
        // outline: silver lining beside the moon, an ink line elsewhere (matches the outlined models)
        float line = smoothstep(-aw, aw, csd) - smoothstep(aw, aw * 3.0 + 0.004, csd);
        body = mix(body, day3(vec3(0.05, 0.035, 0.09), vec3(0.2, 0.1, 0.2), vec3(0.52, 0.52, 0.72)), line * (1.0 - near) * day3(0.4, 0.4, 0.6));
        body += day3(vec3(0.6, 0.55, 0.8), vec3(0.6, 0.4, 0.25), vec3(0.1, 0.08, 0.05)) * line * near * (0.5 + 0.5 * max(ndl, 0.0));
        float ca = shape * 0.95 * (1.0 - cGap);
        ca *= 1.0 - sunVis * smoothstep(sr + 0.08, sr, sAng) * 0.8; // the sun shines through thin cloud
        col = mix(col, body, ca);
        star *= 1.0 - shape;
        alphaBloom *= 1.0 - ca * 0.85;
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
  mesh.frustumCulled = false;
  mesh.renderOrder = -1;
  return mesh;
}

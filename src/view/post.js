import * as THREE from 'three';
import { FullScreenQuad } from 'three/examples/jsm/postprocessing/Pass.js';
import { day3 } from '../shaders/toon.js';

// Small post pipeline: scene -> multisampled target, a dual-filter bloom chain at half resolution or lower,
// and ONE final full-screen pass that adds bloom, grades, vignettes, adds grain and encodes to sRGB.
//
// Color pipeline (why the fog still matches): materials write linear color and then run colorspace_fragment
// and fog_fragment. Rendering into a (non-XR) render target makes colorspace_fragment a no-op, and three.js
// also hands the fog uniform over in linear space for render targets (getUnlitUniformColorSpace), so the fog mix
// happens in linear space against the linear fog color and this final pass encodes to sRGB exactly. Rendering
// straight to the canvas (quality 'off') mixes after the encode against the sRGB-converted fog color instead.
// Both land on the same color at full fog and at no fog; only the in-between blend curve differs (linear mixing
// reads as slightly lighter fog at mid distance). The sky is decoded exactly, so the horizon matches in both paths.
//
// Bloom key: (a) anything brighter than 1.0 (HDR glow sprites over lanterns and headlights), (b) bright *warm*
// colors at a much lower threshold (lantern glass, lit windows: amber emissives sit around 0.55-0.65 luminance,
// while moonlit bone-white faces sit near 0.85 but are not warm, so they stay crisp), and (c) 1 - alpha, which
// only the sky writes, to glow the moon.
//
// Day/night (setDay): by day the bloom is weaker and its warm key threshold rises (sunlit bone and peach sky are
// warm too and must not glow like lanterns), the indigo lift fades and the vignette turns from plum to warm sepia.
//
// Quality:  'high' — 4x MSAA half-float scene target, bloom 1/2 .. 1/32 (9 small passes), grain.
//           'low'  — 4x MSAA scene target, bloom 1/4 .. 1/16 (5 tiny passes), no grain.
//           'off'  — plain renderer.render to the canvas (canvas MSAA only if the renderer was created with it).
// Draw calls on top of the scene: high 10, low 6, off 0.

const vert = /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

const luma = /* glsl */ `float luma(vec3 c) { return dot(c, vec3(0.2126, 0.7152, 0.0722)); }`;

const prefilterFrag = /* glsl */ `
uniform sampler2D tScene; uniform vec2 uTexel; uniform float uThr; uniform float uWarmThr;
varying vec2 vUv;
${luma}
vec3 key(vec4 s) {
  vec3 c = s.rgb;
  float l = luma(c);
  float warm = clamp((c.r - c.b) / max(c.r, 1e-3), 0.0, 1.0) * step(0.25 * c.r, c.g);
  float t = mix(uThr, uWarmThr, smoothstep(0.5, 0.8, warm));
  float w = max(l - t, 0.0) / max(l, 1e-3);
  w = w * w / (w + 0.15) + clamp(1.0 - s.a, 0.0, 1.0) * 1.2;
  // Karis-style weight keeps single bright pixels from flickering
  return c * w / (1.0 + l * 0.5);
}
void main() {
  vec2 o = uTexel;
  vec3 c = key(texture2D(tScene, vUv + vec2(-o.x, -o.y))) + key(texture2D(tScene, vUv + vec2(o.x, -o.y)))
         + key(texture2D(tScene, vUv + vec2(-o.x, o.y))) + key(texture2D(tScene, vUv + vec2(o.x, o.y)));
  gl_FragColor = vec4(c * 0.25, 1.0);
}`;

// dual-filter (Kawase) down and up samplers
const downFrag = /* glsl */ `
uniform sampler2D tSrc; uniform vec2 uTexel;
varying vec2 vUv;
void main() {
  vec2 o = uTexel;
  vec3 c = texture2D(tSrc, vUv).rgb * 4.0;
  c += texture2D(tSrc, vUv - o).rgb + texture2D(tSrc, vUv + o).rgb;
  c += texture2D(tSrc, vUv + vec2(o.x, -o.y)).rgb + texture2D(tSrc, vUv + vec2(-o.x, o.y)).rgb;
  gl_FragColor = vec4(c / 8.0, 1.0);
}`;
const upFrag = /* glsl */ `
uniform sampler2D tSrc; uniform sampler2D tSame; uniform vec2 uTexel; uniform float uScatter;
varying vec2 vUv;
void main() {
  vec2 o = uTexel;
  vec3 c = texture2D(tSrc, vUv + vec2(-o.x * 2.0, 0.0)).rgb + texture2D(tSrc, vUv + vec2(o.x * 2.0, 0.0)).rgb
         + texture2D(tSrc, vUv + vec2(0.0, -o.y * 2.0)).rgb + texture2D(tSrc, vUv + vec2(0.0, o.y * 2.0)).rgb;
  c += (texture2D(tSrc, vUv + vec2(-o.x, o.y)).rgb + texture2D(tSrc, vUv + vec2(o.x, o.y)).rgb
      + texture2D(tSrc, vUv + vec2(-o.x, -o.y)).rgb + texture2D(tSrc, vUv + vec2(o.x, -o.y)).rgb) * 2.0;
  gl_FragColor = vec4(texture2D(tSame, vUv).rgb + c / 12.0 * uScatter, 1.0);
}`;

const finalFrag = /* glsl */ `
uniform sampler2D tScene; uniform sampler2D tBloom;
uniform float uBloom; uniform float uGrain; uniform float uTime; uniform float uAspect; uniform float uFlat;
uniform float uLift; uniform vec3 uVigCol; uniform float uVig; uniform float uSat;
varying vec2 vUv;
${luma}
vec3 toSRGB(vec3 c) { return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c)); }
float hash(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
void main() {
  vec3 c = texture2D(tScene, vUv).rgb;
  if (uFlat > 0.5) { gl_FragColor = vec4(toSRGB(clamp(c, 0.0, 1.0)), 1.0); return; }
  vec3 b = texture2D(tBloom, vUv).rgb;
  c += b * uBloom;
  // soft shoulder: HDR glow rolls off into warm white instead of clipping flat
  vec3 k = vec3(0.78);
  c = mix(c, k + (1.0 - k) * (1.0 - exp(-(c - k) / (1.0 - k))), step(k, c));
  vec3 g = toSRGB(clamp(c, 0.0, 1.0));
  // grade in display space: indigo lift in the darks, a little extra saturation, a gentle S-curve
  float l = luma(g);
  g = mix(vec3(l), g, uSat);
  g = mix(g, g * g * (3.0 - 2.0 * g), 0.18);
  g += vec3(0.022, 0.012, 0.05) * uLift * (1.0 - smoothstep(0.0, 0.35, l));
  // vignette toward deep plum, a touch stronger at the bottom so the HUD reads
  vec2 v = (vUv - 0.5) * vec2(uAspect, 1.0);
  float vig = smoothstep(0.35, 1.05, length(v * vec2(0.82, 1.0) + vec2(0.0, 0.04)));
  g = mix(g, g * uVigCol, vig * uVig);
  // fine grain, also dithers away banding in the dark gradients
  float n = hash(gl_FragCoord.xy + fract(uTime * 7.13) * 431.0) - 0.5;
  g += n * (uGrain + 1.0 / 255.0) * (1.0 - l * 0.5);
  gl_FragColor = vec4(clamp(g, 0.0, 1.0), 1.0);
}`;

const mat = (frag, uniforms) => new THREE.ShaderMaterial({ uniforms, vertexShader: vert, fragmentShader: frag, depthTest: false, depthWrite: false });

export class Post {
  constructor(renderer, quality = 'high') {
    this.renderer = renderer;
    this.float = renderer.extensions.has('EXT_color_buffer_float');
    this.size = new THREE.Vector2();
    this.flat = false; // debug: composer path without bloom/grade, for comparing against a direct render
    this.strength = 0.85;
    this.thr = this.float ? 1.0 : 0.9;
    this.quad = new FullScreenQuad();
    this.prefilter = mat(prefilterFrag, { tScene: { value: null }, uTexel: { value: new THREE.Vector2() }, uThr: { value: this.thr }, uWarmThr: { value: 0.4 } });
    this.down = mat(downFrag, { tSrc: { value: null }, uTexel: { value: new THREE.Vector2() } });
    this.up = mat(upFrag, { tSrc: { value: null }, tSame: { value: null }, uTexel: { value: new THREE.Vector2() }, uScatter: { value: 0.9 } });
    this.final = mat(finalFrag, {
      tScene: { value: null }, tBloom: { value: null }, uBloom: { value: this.strength }, uGrain: { value: 0 },
      uTime: { value: 0 }, uAspect: { value: 1 }, uFlat: { value: 0 },
      uLift: { value: 1 }, uVigCol: { value: new THREE.Vector3(0.32, 0.26, 0.42) }, uVig: { value: 0.75 }, uSat: { value: 1.18 },
    });
    this.sceneRT = null;
    this.down_ = [];
    this.up_ = [];
    this.setQuality(quality);
  }

  // k: 0 night .. 0.5 dusk .. 1 day (see toon.js DAY)
  setDay(k) {
    this.strength = day3(0.85, 0.75, 0.4, k);
    this.prefilter.uniforms.uThr.value = this.thr * day3(1, 1, 1.5, k);
    this.prefilter.uniforms.uWarmThr.value = day3(0.4, 0.45, 1.1, k);
    const f = this.final.uniforms;
    f.uLift.value = day3(1, 0.8, 0.15, k);
    f.uVigCol.value.set(day3(0.32, 0.4, 0.62, k), day3(0.26, 0.26, 0.5, k), day3(0.42, 0.42, 0.44, k));
    f.uVig.value = day3(0.85, 0.7, 0.5, k);
    f.uSat.value = day3(1.0, 1.1, 1.14, k); // the night keeps its low chroma (only lamp light is saturated)
  }

  setQuality(q) {
    this.quality = q;
    this.dispose();
    this.size.set(0, 0); // forces targets to be (re)built on the next render
  }

  dispose() {
    this.sceneRT?.dispose();
    for (const t of [...this.down_, ...this.up_]) t.dispose();
    this.sceneRT = null;
    this.down_ = [];
    this.up_ = [];
  }

  build(w, h) {
    this.dispose();
    const high = this.quality === 'high';
    // half float keeps HDR glow above 1.0 for the bloom key; the 8-bit fallback stores sRGB so dark gradients do not band
    const opts = this.float ? { type: THREE.HalfFloatType } : { type: THREE.UnsignedByteType, colorSpace: THREE.SRGBColorSpace };
    this.sceneRT = new THREE.WebGLRenderTarget(w, h, { ...opts, samples: 4 });
    const first = high ? 2 : 4, levels = high ? 5 : 3;
    for (let i = 0; i < levels; i++) {
      const s = first << i;
      const mk = () => new THREE.WebGLRenderTarget(Math.max(1, Math.round(w / s)), Math.max(1, Math.round(h / s)), { ...opts, depthBuffer: false });
      this.down_.push(mk());
      if (i < levels - 1) this.up_.push(mk());
    }
    this.final.uniforms.uGrain.value = high ? 0.035 : 0;
    this.final.uniforms.uAspect.value = w / h;
  }

  // For warmUp (warmup.js): the target the scene is drawn into, and each pass with the target it draws into, so their
  // programs can be compiled ahead against the same output (render targets are linear, the canvas is sRGB).
  prepare() {
    const r = this.renderer;
    if (this.quality === 'off') return { sceneTarget: null, passes: [] };
    const v = r.getDrawingBufferSize(new THREE.Vector2());
    if (!v.equals(this.size)) { this.size.copy(v); this.build(v.x, v.y); }
    return { sceneTarget: this.sceneRT, passes: [[this.prefilter, this.down_[0]], [this.down, this.down_[1]], [this.up, this.up_[0]], [this.final, null]] };
  }

  pass(material, target) {
    this.quad.material = material;
    this.renderer.setRenderTarget(target);
    this.quad.render(this.renderer);
  }

  render(scene, camera, time) {
    const r = this.renderer;
    if (this.quality === 'off') { r.setRenderTarget(null); r.render(scene, camera); return; }
    const v = r.getDrawingBufferSize(new THREE.Vector2());
    if (!v.equals(this.size)) { this.size.copy(v); this.build(v.x, v.y); }

    r.setRenderTarget(this.sceneRT);
    r.render(scene, camera);

    const fu = this.final.uniforms;
    fu.tScene.value = this.sceneRT.texture;
    fu.uTime.value = time;
    fu.uFlat.value = this.flat ? 1 : 0;
    if (!this.flat) {
      const d = this.down_, u = this.up_;
      this.prefilter.uniforms.tScene.value = this.sceneRT.texture;
      this.prefilter.uniforms.uTexel.value.set(1 / v.x, 1 / v.y);
      this.pass(this.prefilter, d[0]);
      for (let i = 1; i < d.length; i++) {
        this.down.uniforms.tSrc.value = d[i - 1].texture;
        this.down.uniforms.uTexel.value.set(0.5 / d[i - 1].width, 0.5 / d[i - 1].height);
        this.pass(this.down, d[i]);
      }
      let src = d[d.length - 1];
      for (let i = u.length - 1; i >= 0; i--) {
        this.up.uniforms.tSrc.value = src.texture;
        this.up.uniforms.tSame.value = d[i].texture;
        this.up.uniforms.uTexel.value.set(0.5 / src.width, 0.5 / src.height);
        this.pass(this.up, u[i]);
        src = u[i];
      }
      fu.tBloom.value = src.texture;
      fu.uBloom.value = this.strength / d.length;
    }
    this.pass(this.final, null);
  }
}

import * as THREE from 'three';
import { MOON_DIR } from '../shaders/toon.js';

// Gaussian splats generated in code. Every splat is a flat oriented Gaussian "brush dab" that belongs to one
// rigid part; the part's matrix moves all of its splats, so a puppet made of a few rigid parts animates and
// ragdolls with no skinning. Rendering follows 3D Gaussian Splatting: each 3D covariance is projected to a
// screen-space ellipse, splats are sorted back to front on the CPU and blended with premultiplied alpha.
// Splat data lives in float textures; the only per-frame upload is the sorted index list.
const TEX_W = 512;
const K = 2.0; // quad half-size in standard deviations

const vert = /* glsl */ `
uniform sampler2D tA; uniform sampler2D tB; uniform sampler2D tC; uniform sampler2D tD;
uniform mat4 uPart[NPARTS];
uniform vec2 uViewport; uniform float uSize;
uniform vec3 uLampPos[2]; uniform vec3 uLampCol; uniform float uInk;
attribute float splatIndex;
varying vec2 vP; varying vec4 vCol;
const vec3 MOON = vec3(${MOON_DIR.x.toFixed(4)}, ${MOON_DIR.y.toFixed(4)}, ${MOON_DIR.z.toFixed(4)});
mat3 quatMat(vec4 q) {
  float x = q.x, y = q.y, z = q.z, w = q.w;
  return mat3(1.0 - 2.0 * (y * y + z * z), 2.0 * (x * y + w * z), 2.0 * (x * z - w * y),
              2.0 * (x * y - w * z), 1.0 - 2.0 * (x * x + z * z), 2.0 * (y * z + w * x),
              2.0 * (x * z + w * y), 2.0 * (y * z - w * x), 1.0 - 2.0 * (x * x + y * y));
}
void main() {
  int i = int(splatIndex + 0.5);
  ivec2 uv = ivec2(i % ${TEX_W}, i / ${TEX_W});
  vec4 a = texelFetch(tA, uv, 0), q = texelFetch(tB, uv, 0), c = texelFetch(tC, uv, 0), d = texelFetch(tD, uv, 0);
  mat4 pm = uPart[int(a.w + 0.5)];
  vec4 world = pm * vec4(a.xyz, 1.0);
  vec4 view = viewMatrix * world;
  if (view.z > -0.1) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; }

  // 3D covariance in view space, then its 2D projection (EWA splatting)
  mat3 R = mat3(pm) * quatMat(q);
  vec3 s = c.xyz * uSize;
  mat3 M = mat3(viewMatrix) * mat3(R[0] * s.x, R[1] * s.y, R[2] * s.z);
  mat3 cov = M * transpose(M);
  float fx = projectionMatrix[0][0] * uViewport.x * 0.5, fy = projectionMatrix[1][1] * uViewport.y * 0.5;
  float iz = 1.0 / -view.z;
  mat3 J = mat3(fx * iz, 0.0, 0.0, 0.0, fy * iz, 0.0, fx * view.x * iz * iz, fy * view.y * iz * iz, 0.0);
  mat3 c2 = J * cov * transpose(J);
  float ca = c2[0][0] + 0.3, cb = c2[0][1], cd = c2[1][1] + 0.3;
  float mid = 0.5 * (ca + cd), rad = sqrt(max(mid * mid - (ca * cd - cb * cb), 1e-6));
  float l1 = mid + rad, l2 = max(mid - rad, 0.1);
  vec2 v1 = abs(cb) < 1e-5 ? (ca >= cd ? vec2(1.0, 0.0) : vec2(0.0, 1.0)) : normalize(vec2(cb, l1 - ca));
  vec2 v2 = vec2(-v1.y, v1.x);
  vec2 off = (position.x * v1 * min(sqrt(l1), 400.0) + position.y * v2 * min(sqrt(l2), 400.0)) * ${K.toFixed(1)};
  vec4 clip = projectionMatrix * view;
  gl_Position = vec4(clip.xy + off / uViewport * 2.0 * clip.w, clip.zw);
  vP = position.xy * ${K.toFixed(1)};

  // painterly lighting per dab: cold moon key with purple shadows, warm footlights, ink toward the silhouette
  vec3 N = normalize(R[2]);
  vec3 V = normalize(cameraPosition - world.xyz);
  if (dot(N, V) < 0.0) N = -N; // cloth is one layer of dabs seen from both sides
  float m = dot(N, MOON);
  vec3 light = mix(vec3(0.4, 0.35, 0.62), vec3(0.72, 0.7, 1.0), smoothstep(-0.3, 0.05, m));
  light = mix(light, vec3(1.1, 1.12, 1.28), smoothstep(0.2, 0.55, m));
  for (int k = 0; k < 2; k++) {
    vec3 L = uLampPos[k] - world.xyz;
    float r2 = dot(L, L);
    light += uLampCol * (clamp(dot(N, L * inversesqrt(r2)) * 0.6 + 0.4, 0.0, 1.0) / (1.0 + r2 * 0.35));
  }
  float edge = 1.0 - abs(dot(N, V));
  vec3 col = d.rgb * light * mix(1.0, 0.22, smoothstep(0.5, 0.92, edge) * uInk);
  vCol = vec4(mix(col, d.rgb, d.a), c.w);
}`;

const frag = /* glsl */ `
uniform float uSharp;
varying vec2 vP; varying vec4 vCol;
void main() {
  float g = exp(-0.5 * dot(vP, vP)) - ${Math.exp(-0.5 * K * K).toFixed(4)}; // falls to zero at the quad's edge
  // uSharp flattens the top of the Gaussian: a dab is an opaque disc with a narrow soft rim, like gouache
  float al = vCol.a * clamp(g * uSharp, 0.0, 1.0);
  if (al < 0.004) discard;
  gl_FragColor = vec4(vCol.rgb * al, al);
  #include <colorspace_fragment>
}`;

export class SplatCloud {
  constructor(nParts) {
    this.nParts = nParts;
    this.n = 0;
    this.data = [[], [], [], []]; // center+part | quaternion | scale+alpha | color+emissive
    this.parts = Array.from({ length: nParts }, () => new THREE.Matrix4());
  }

  // pos, normal, tangent: THREE.Vector3 in the part's rest space. scale: [along tangent, across, along normal] in meters.
  // color: THREE.Color (linear). emissive 0..1 skips lighting.
  add(part, pos, normal, tangent, scale, color, alpha = 0.95, emissive = 0) {
    const z = _z.copy(normal).normalize();
    const x = _x.copy(tangent).addScaledVector(z, -tangent.dot(z));
    if (x.lengthSq() < 1e-8) x.set(z.y, z.z, z.x).addScaledVector(z, -(z.y * z.x + z.z * z.y + z.x * z.z));
    x.normalize();
    const y = _y.crossVectors(z, x);
    _q.setFromRotationMatrix(_m.makeBasis(x, y, z));
    this.data[0].push(pos.x, pos.y, pos.z, part);
    this.data[1].push(_q.x, _q.y, _q.z, _q.w);
    this.data[2].push(scale[0], scale[1], scale[2], alpha);
    this.data[3].push(color.r, color.g, color.b, emissive);
    this.n++;
  }

  build() {
    const n = this.n, h = Math.ceil(n / TEX_W);
    const tex = this.data.map((arr) => {
      const buf = new Float32Array(TEX_W * h * 4);
      buf.set(arr);
      const t = new THREE.DataTexture(buf, TEX_W, h, THREE.RGBAFormat, THREE.FloatType);
      t.needsUpdate = true;
      return t;
    });
    this.centers = new Float32Array(this.data[0]);
    this.data = null;
    this.order = new Float32Array(n);
    this.depth = new Float32Array(n);
    this.counts = new Uint32Array(65537);
    const geo = new THREE.InstancedBufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, 1, 0]), 3));
    geo.setIndex([0, 1, 2, 0, 2, 3]);
    this.attr = new THREE.InstancedBufferAttribute(this.order, 1);
    this.attr.setUsage(THREE.DynamicDrawUsage);
    geo.setAttribute('splatIndex', this.attr);
    geo.instanceCount = n;
    this.material = new THREE.ShaderMaterial({
      defines: { NPARTS: this.nParts },
      uniforms: {
        tA: { value: tex[0] }, tB: { value: tex[1] }, tC: { value: tex[2] }, tD: { value: tex[3] },
        uPart: { value: this.parts }, uViewport: { value: new THREE.Vector2(1, 1) },
        uSize: { value: 0.85 }, uSharp: { value: 6 }, uInk: { value: 1 },
        uLampPos: { value: [new THREE.Vector3(), new THREE.Vector3()] }, uLampCol: { value: new THREE.Color(1.0, 0.62, 0.3) },
      },
      vertexShader: vert, fragmentShader: frag,
      transparent: true, depthWrite: false, premultipliedAlpha: true,
      blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor,
      blendSrcAlpha: THREE.OneFactor, blendDstAlpha: THREE.OneMinusSrcAlphaFactor,
    });
    this.mesh = new THREE.Mesh(geo, this.material);
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = 10;
    return this.mesh;
  }

  // Back-to-front counting sort on quantized view depth. Call once per frame after the part matrices are set.
  sort(camera) {
    const n = this.n, c = this.centers, depth = this.depth, rows = this._rows || (this._rows = new Float32Array(this.nParts * 4));
    for (let p = 0; p < this.nParts; p++) {
      const e = _m.multiplyMatrices(camera.matrixWorldInverse, this.parts[p]).elements;
      rows[p * 4] = e[2]; rows[p * 4 + 1] = e[6]; rows[p * 4 + 2] = e[10]; rows[p * 4 + 3] = e[14];
    }
    let lo = Infinity, hi = -Infinity;
    for (let i = 0, o = 0; i < n; i++, o += 4) {
      const r = c[o + 3] * 4;
      const z = rows[r] * c[o] + rows[r + 1] * c[o + 1] + rows[r + 2] * c[o + 2] + rows[r + 3];
      depth[i] = z;
      if (z < lo) lo = z;
      if (z > hi) hi = z;
    }
    const counts = this.counts, k = 65535 / Math.max(hi - lo, 1e-6);
    counts.fill(0);
    for (let i = 0; i < n; i++) counts[((depth[i] - lo) * k) | 0]++;
    for (let b = 0, sum = 0; b < 65536; b++) { const t = counts[b]; counts[b] = sum; sum += t; }
    const order = this.order;
    for (let i = 0; i < n; i++) order[counts[((depth[i] - lo) * k) | 0]++] = i; // most negative z (farthest) first
    this.attr.needsUpdate = true;
  }
}

const _x = new THREE.Vector3(), _y = new THREE.Vector3(), _z = new THREE.Vector3();
const _q = new THREE.Quaternion(), _m = new THREE.Matrix4();

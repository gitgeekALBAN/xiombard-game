import * as THREE from 'three';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { outlineMat } from '../../shaders/toon.js';

// Shared building blocks for every procedural model. All models are built from primitives in code.
export const SPH = new THREE.SphereGeometry(1, 20, 14);
export const SPH_LO = new THREE.SphereGeometry(1, 10, 8);
export const CYL = new THREE.CylinderGeometry(1, 1, 1, 18);
export const BOX = new THREE.BoxGeometry(1, 1, 1);
const capCache = new Map();
export const capsule = (r, len) => {
  const k = `${r}:${len}`;
  if (!capCache.has(k)) capCache.set(k, new THREE.CapsuleGeometry(r, len, 4, 10));
  return capCache.get(k);
};

// Outline hulls need smooth (merged) normals, or hard edges split open.
const outlineGeoCache = new WeakMap();
export function outlineGeo(g) {
  let o = outlineGeoCache.get(g);
  if (!o) {
    const c = g.clone();
    for (const k of Object.keys(c.attributes)) if (k !== 'position') c.deleteAttribute(k);
    o = mergeVertices(c, 1e-3);
    o.computeVertexNormals();
    outlineGeoCache.set(g, o);
  }
  return o;
}

// One mesh, optionally with an inverted-hull outline child.
// outline = line width in meters (0 = none). It is applied in view space, so mesh scale does not distort it.
export function part(geo, mat, { pos, rot, scale, outline = 0.02 } = {}) {
  const m = new THREE.Mesh(geo, mat);
  if (pos) m.position.set(...pos);
  if (rot) m.rotation.set(...rot);
  if (scale) m.scale.set(...(Array.isArray(scale) ? scale : [scale, scale, scale]));
  if (outline) m.add(new THREE.Mesh(outlineGeo(geo), outlineMat(outline)));
  return m;
}

export const geo = { SPH, SPH_LO, CYL, BOX };

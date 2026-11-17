import * as THREE from 'three';
import { toon } from '../../shaders/toon.js';
import { rng } from '../../shared/rng.js';

// Twisted storybook tree: a curling trunk with spiral branches.
export function buildTree(seed, height) {
  const R = rng(seed);
  const mat = toon('#1c1724');
  const g = new THREE.Group();
  const tube = (pts, r) => {
    const curve = new THREE.CatmullRomCurve3(pts);
    const geo = new THREE.TubeGeometry(curve, 24, r, 7, false);
    const pos = geo.attributes.position;
    // taper along the tube
    const segs = 25, radial = 8;
    for (let i = 0; i < segs; i++) {
      const t = i / (segs - 1), k = 1 - t * 0.75;
      const c = curve.getPointAt(t);
      for (let j = 0; j < radial; j++) {
        const idx = i * radial + j;
        pos.setXYZ(idx, c.x + (pos.getX(idx) - c.x) * k, c.y + (pos.getY(idx) - c.y) * k, c.z + (pos.getZ(idx) - c.z) * k);
      }
    }
    geo.computeVertexNormals();
    g.add(new THREE.Mesh(geo, mat));
    return curve;
  };
  const trunkPts = [];
  for (let i = 0; i <= 6; i++) {
    const t = i / 6;
    trunkPts.push(new THREE.Vector3(Math.sin(t * 4 + seed) * 0.5 * t, t * height, Math.cos(t * 3 + seed) * 0.4 * t));
  }
  const trunk = tube(trunkPts, 0.38);
  const nb = 4 + Math.floor(R() * 3);
  for (let b = 0; b < nb; b++) {
    const t0 = R.range(0.45, 0.95);
    const start = trunk.getPointAt(t0);
    const a = R() * Math.PI * 2, len = R.range(1.6, 3.2) * (1.2 - t0 * 0.5);
    const pts = [start];
    let dir = new THREE.Vector3(Math.cos(a), R.range(0.2, 0.8), Math.sin(a)).normalize();
    let p = start.clone();
    for (let i = 1; i <= 5; i++) {
      p = p.clone().addScaledVector(dir, len / 5);
      dir.applyAxisAngle(new THREE.Vector3(0, 1, 0), 0.3).y -= 0.1;
      pts.push(p);
    }
    // curl at the tip
    const tip = p.clone();
    for (let i = 1; i <= 4; i++) {
      const ang = i * 1.3;
      pts.push(tip.clone().add(new THREE.Vector3(Math.cos(a + ang) * 0.25 / i, -0.1 * i + 0.15, Math.sin(a + ang) * 0.25 / i)));
    }
    tube(pts, 0.14);
  }
  return g;
}

import * as THREE from 'three';
import { toon } from '../shaders/toon.js';
import { part, geo, buildHeadstone } from './models.js';
import { PLOTS, PLOT_HALF, PLOT_MAX_DEPTH } from '../shared/layout.js';

// Grave plot visuals: the moving floor of each hole, the dirt mound beside it, the fill layer,
// and the fresh headstone with a name plate once someone is buried.
// createGraves(scene, groundMat) returns:
//   setPlot(i, depth, fill, buried, seed, name, time) — apply the host's plot state
//   update(time)                                      — per-frame animation
//   floorTop(i)                                       — world y of the hole's floor (camera and blob shadows use it)
export function createGraves(scene, groundMat) {
  const plots = PLOTS.map((p) => {
    const floor = new THREE.Mesh(geo.BOX, groundMat);
    floor.scale.set(PLOT_HALF.x * 2, 2, PLOT_HALF.z * 2);
    floor.position.set(p.x, -1, p.z);
    const mound = part(geo.SPH, toon('#3f2c27', { color2: '#352420', stripes: 7 }), { pos: [p.x + PLOT_HALF.x + 0.75, 0, p.z], scale: [0.7, 0.01, 1.2], outline: 0 });
    const fill = new THREE.Mesh(geo.BOX, toon('#3f2c27'));
    fill.scale.set(PLOT_HALF.x * 2, 0.04, PLOT_HALF.z * 2);
    fill.position.set(p.x, -2, p.z);
    fill.visible = false;
    scene.add(floor, mound, fill);
    return { floor, mound, fill, stone: null, seed: -1, x: p.x, z: p.z };
  });

  function freshGrave(seed, name) {
    const g = new THREE.Group();
    const stone = buildHeadstone(['round', 'cross', 'slab'][seed % 3], 0.75, 1.1, seed);
    stone.position.z = -PLOT_HALF.z + 0.15;
    stone.rotation.z = ((seed % 7) - 3) * 0.03;
    g.add(stone);
    // name plate drawn in code onto a canvas
    const c = document.createElement('canvas');
    c.width = 256; c.height = 128;
    const x = c.getContext('2d');
    x.fillStyle = '#2a2638';
    x.textAlign = 'center';
    x.font = 'bold 34px Georgia, serif';
    x.fillText('R.I.P.', 128, 44);
    x.font = 'italic 24px Georgia, serif';
    x.fillText(name, 128, 88, 240);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    const plate = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.35), new THREE.MeshBasicMaterial({ map: tex, transparent: true, fog: true }));
    plate.position.set(0, 0.62, 0.105);
    stone.add(plate);
    g.add(part(geo.SPH, toon('#3f2c27', { color2: '#352420', stripes: 7 }), { pos: [0, 0, 0.1], scale: [0.6, 0.18, 1.2], outline: 0.03 }));
    return g;
  }

  return {
    setPlot(i, d, f, buried, seed, name, time) {
      const v = plots[i];
      v.floor.position.y = -d - 1;
      const m = Math.min(1, d / PLOT_MAX_DEPTH) * (1 - f);
      v.mound.scale.set(0.45 + 0.3 * m, 0.02 + 0.55 * m, 0.8 + 0.45 * m);
      v.mound.visible = m > 0.02;
      v.fill.visible = f > 0.01;
      v.fill.position.y = -d + (d + 0.02) * f;
      if (buried && v.seed !== seed) {
        if (v.stone) scene.remove(v.stone);
        v.stone = freshGrave(seed, name);
        v.stone.position.set(v.x, 0, v.z);
        v.stone.userData.born = time;
        scene.add(v.stone);
        v.seed = seed;
      } else if (!buried && v.stone) {
        scene.remove(v.stone);
        v.stone = null;
        v.seed = -1;
      }
    },
    update(time) {
      for (const p of plots) if (p.stone) {
        const k = Math.min(1, (time - p.stone.userData.born) / 0.5);
        p.stone.position.y = -1.2 * (1 - k) * (1 - k);
      }
    },
    floorTop(i) { return plots[i].floor.position.y + 1; },
  };
}

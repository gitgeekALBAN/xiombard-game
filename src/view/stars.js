import * as THREE from 'three';

// Cartoon stars circling over the head of anything knocked silly (a zombie hit with something thrown, a crocodile
// whacked out cold): five little yellow stars on a tilted ring, spinning. One star texture drawn into a canvas; same
// material settings as the signs (map, alpha test, fog), so no new shader. Pooled rings, one per stunned head.
const starTex = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d');
  g.beginPath();
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 12 : 29; g.lineTo(32 + Math.cos(a) * r, 33 + Math.sin(a) * r); }
  g.closePath();
  g.fillStyle = '#ffd84a'; g.fill();
  g.lineWidth = 4; g.strokeStyle = '#231d33'; g.stroke();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  return t;
})();
export const starMaterial = new THREE.MeshBasicMaterial({ map: starTex, alphaTest: 0.5, fog: true, side: THREE.DoubleSide });
const QUAD = new THREE.PlaneGeometry(0.16, 0.16);

export function createStars(scene) {
  const rings = [];
  const ring = () => {
    const g = new THREE.Group();
    for (let i = 0; i < 5; i++) g.add(new THREE.Mesh(QUAD, starMaterial));
    g.visible = false;
    scene.add(g);
    rings.push(g);
    return g;
  };
  return {
    // heads: world positions of everything that is stunned right now
    update(time, heads, camera) {
      let n = 0;
      for (const h of heads) {
        const g = rings[n] || ring();
        n++;
        g.visible = true;
        g.position.set(h.x, h.y + 0.32, h.z);
        g.children.forEach((s, i) => {
          const a = time * 3 + (i / 5) * Math.PI * 2;
          s.position.set(Math.cos(a) * 0.28, Math.sin(a * 2) * 0.03 + Math.sin(a) * 0.06, Math.sin(a) * 0.28);
          s.quaternion.copy(camera.quaternion); // each star faces the camera
          s.scale.setScalar(0.8 + 0.25 * Math.sin(time * 6 + i));
        });
      }
      for (let i = n; i < rings.length; i++) rings[i].visible = false;
    },
  };
}

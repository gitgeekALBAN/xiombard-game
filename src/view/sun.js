import * as THREE from 'three';
import { SUN, keyLight } from '../shaders/toon.js';

// The key light's cast shadows (the sun by day, the moon by night): one depth pass from the key into a square map
// around the camera's focus, read by every painted material (sunShadow in toon.js). The map's center snaps to whole
// texels so shadow edges do not shimmer as the camera moves. It also carries the clock of the cloud cookie.
//
// What does not cast: the sky, the ground, the backdrop, the plants (objects or materials with userData.noShadow),
// anything transparent, sprites and points, and the inverted ink hulls (back faces only), which would only double
// the work. The depth material is plain (no wind, no painted cut-outs): silhouettes are what matter.
const SIZE = 2048, R = 34;

export class Sun {
  constructor() {
    this.rt = new THREE.WebGLRenderTarget(SIZE, SIZE, { depthBuffer: true });
    this.rt.depthTexture = new THREE.DepthTexture(SIZE, SIZE, THREE.UnsignedIntType);
    this.rt.texture.generateMipmaps = false;
    this.cam = new THREE.OrthographicCamera(-R, R, R, -R, 1, 220);
    this.mat = new THREE.MeshDepthMaterial({ side: THREE.DoubleSide });
    this.hidden = [];
    this.frame = 0;
    SUN.uSunMap.value = this.rt.depthTexture;
    SUN.uSunTexel.value = 1 / SIZE;
    this._v = new THREE.Vector3();
    this._q = new THREE.Quaternion();
  }

  // focus: the point the camera looks at (world). every: render the map only every n-th frame (low quality).
  // always: objects that cast even while hidden from the camera (the morgue roof, hidden for a camera indoors)
  update(renderer, scene, focus, every = 1, always = [], time = 0) {
    SUN.uSunOn.value = 1;
    SUN.uSunTime.value = time;
    if (this.frame++ % every) return;
    const dir = keyLight().dir, cam = this.cam, v = this._v;
    cam.position.copy(dir).multiplyScalar(110);
    cam.lookAt(0, 0, 0);
    cam.updateMatrixWorld();
    // the focus in the sun's frame, snapped to the texel grid, back to world
    const inv = this._q.copy(cam.quaternion).invert();
    v.copy(focus).applyQuaternion(inv);
    const tx = (2 * R) / SIZE;
    v.x = Math.round(v.x / tx) * tx; v.y = Math.round(v.y / tx) * tx;
    v.applyQuaternion(cam.quaternion);
    cam.position.copy(dir).multiplyScalar(110).add(v);
    cam.updateMatrixWorld();
    cam.updateProjectionMatrix();
    SUN.uSunMat.value.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse);

    // casters draw with a depth material (their own if they move vertices in the shader, like the characters)
    const hidden = this.hidden, swapped = this.swapped || (this.swapped = []);
    hidden.length = 0; swapped.length = 0;
    const shown = always.filter((o) => !o.visible);
    for (const o of shown) o.visible = true;
    scene.traverseVisible((o) => {
      if (o.isCamera) { hidden.push(o); return; } // the first-person shovel hangs off the camera
      const m = o.material;
      if (!m) { if (o.userData.noShadow) hidden.push(o); return; }
      if (o.userData.noShadow || o.isSprite || o.isPoints || o.isLine || Array.isArray(m)
        || m.transparent || m.side === THREE.BackSide || m.userData.noShadow) { hidden.push(o); return; }
      swapped.push(o, m);
    });
    for (const o of hidden) o.visible = false;
    for (let i = 0; i < swapped.length; i += 2) swapped[i].material = swapped[i + 1].userData.depthMat || this.mat;
    const prevTarget = renderer.getRenderTarget();
    renderer.setRenderTarget(this.rt);
    renderer.clear(true, true, false);
    renderer.render(scene, cam);
    renderer.setRenderTarget(prevTarget);
    for (let i = 0; i < swapped.length; i += 2) swapped[i].material = swapped[i + 1];
    for (const o of hidden) o.visible = true;
    for (const o of shown) o.visible = false;
  }
}

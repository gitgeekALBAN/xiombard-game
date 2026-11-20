import * as THREE from 'three';
import { CREW, crewRig } from '../shared/crew.js';
import { ZOMBIES, zombieRig } from '../shared/zombies.js';
import { corpseRig } from '../shared/corpses.js';
import { characterGeometry } from '../chars/index.js';
import { buildCrew } from './crew.js';
import { buildCoffin, buildTruck } from './models.js';
import { buildNote } from './models/note.js';
import { buildCharmStack } from './models/charms.js';
import { ghostMaterial } from './ghost.js';
import { buildOddity } from './models/oddities.js';
import { ODDITIES } from '../shared/layout.js';

// Everything the game draws gets made before the first frame, behind a progress bar, instead of live in the middle of
// play. Two kinds of work, run side by side:
//  - shaders: three.js compiles a program the first time something is drawn with it, and on Windows (Direct3D under
//    the browser's WebGL) a big painted shader takes seconds, freezing the page. Here every program the yard, the
//    characters, the props and the post passes need is started at once and polled with KHR_parallel_shader_compile,
//    so the driver compiles them in parallel while the page stays alive. Programs are keyed by where they are drawn
//    (the post render target is linear, the canvas is sRGB), so each is compiled against its real target.
//  - meshes: every digger and every kind of night visitor is sculpted from its formulas once (chars/mesher.js); a new
//    zombie type showing up at night used to cost a frame of 100+ ms.
// Bodies are not here: their looks come from the seeds the host deals out, and they are cheap (coarse mesh).
// onProgress({ done, total, stage }) is called every frame (done/total is the share, weighted). Resolves when all is ready.
export async function warmUp(view, onProgress = () => {}) {
  const r = view.renderer, cam = view.camera, scene = view.scene;
  const nextFrame = () => new Promise((res) => (document.hidden ? setTimeout(res, 0) : requestAnimationFrame(() => res())));

  // one of everything that is not in the scene yet but will be: built here only so its materials get compiled
  const cast = new THREE.Group();
  const add = (crew) => { for (const g of crew.groups) cast.add(g); cast.add(crew.mesh); };
  add(buildCrew(crewRig(0), { shovel: true }));
  add(buildCrew(zombieRig(0)));
  add(buildCrew(corpseRig(1), { q: 0.64 }));
  for (const lid of [0, 1, 2]) cast.add(...buildCoffin(1, lid)); // models come as lists of part groups
  cast.add(...buildTruck());
  cast.add(view.graves.sample());
  cast.add(...buildNote({ name: 'Warm Up', note: ['tux', 'moth', 'bone', 2] }));
  cast.add(buildCharmStack()); // the charm on its stick (its stick is the only plain colored basic material)
  cast.add(new THREE.Mesh(new THREE.SphereGeometry(0.2), ghostMaterial())); // a grave's ghost
  ODDITIES.forEach((_, i) => cast.add(...buildOddity(i))); // the odd deliveries
  cast.add(new THREE.Mesh(view.shadowGeo, view.shadowMat));

  // start compiling: the scene and the cast into the scene's target, each post pass into its own
  const { sceneTarget, passes } = view.post.prepare();
  const before = r.getRenderTarget();
  r.setRenderTarget(sceneTarget);
  const mats = new Set([...r.compile(scene, cam), ...r.compile(cast, cam, scene)]);
  const quad = new THREE.PlaneGeometry(2, 2), empty = new THREE.Scene();
  for (const [m, target] of passes) {
    r.setRenderTarget(target);
    for (const x of r.compile(new THREE.Mesh(quad, m), cam, empty)) mats.add(x);
  }
  r.setRenderTarget(before);
  // each program weighs by the size of its fragment shader: the big painted ones take seconds, a post pass a blink
  const weight = new Map();
  for (const m of mats) {
    const p = r.properties.get(m).currentProgram;
    if (p) weight.set(p, Math.max(weight.get(p) || 0, 1 + (m.fragmentShader ? m.fragmentShader.length / 3000 : 0)));
  }
  const programs = [...weight.keys()];

  // sculpt the characters while the driver compiles
  const looks = [...CREW.map((_, i) => crewRig(i).def.look), ...ZOMBIES.map((_, i) => zombieRig(i).def.look)];
  const parallel = r.extensions.has('KHR_parallel_shader_compile');
  const total = looks.length + programs.reduce((s, p) => s + weight.get(p), 0);
  let meshed = 0, linked = 0;
  const pending = new Set(programs), t0 = performance.now();
  // the bar: finished work, plus a share of what is still compiling that grows with time (a compile reports no
  // progress of its own; this keeps the bar honest-ish and moving while the last heavy shaders finish)
  const report = (stage) => {
    let creep = 0;
    if (parallel) for (const p of pending) creep += weight.get(p) * 0.9 * (1 - Math.exp(-(performance.now() - t0) / 5000));
    onProgress({ done: meshed + linked + creep, total, stage });
  };
  report(looks.length ? 'Sculpting the crew and the night visitors' : 'Mixing the paints');
  while (meshed < looks.length || pending.size) {
    if (meshed < looks.length) characterGeometry(looks[meshed++]);
    // a program that is ready gets its uniforms read now (three's "first use"), so the first real frame finds it done;
    // without the parallel extension each of these waits for its compile, so take one per frame to keep the bar moving
    for (const p of pending) {
      if (parallel ? !p.isReady() : false) continue;
      p.getUniforms();
      pending.delete(p);
      linked += weight.get(p);
      if (!parallel) break;
    }
    report(meshed < looks.length ? 'Sculpting the crew and the night visitors' : 'Mixing the paints');
    await nextFrame();
  }
  onProgress({ done: total, total, stage: 'Ready' });
}

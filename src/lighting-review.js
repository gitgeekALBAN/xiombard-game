// Deterministic renderer review: the actual game View and initial props, without networking.
import { View } from './view/view.js';
import { Sim } from './sim/game.js';

const q = new URLSearchParams(location.search);
const cameras = {
  yard: { p: [4.565, 1.652, -4.686], t: [-4.021, 0.854, 7.587], fov: 76.82 },
  morgue: { p: [-1.441, 1.813, 6.980], t: [-8.900, 0.505, 13.511], fov: 72.543 },
};
const name = q.get('camera') in cameras ? q.get('camera') : 'yard';
const triple = (key, fallback) => {
  const values = q.get(key)?.split(',').map(Number);
  return values?.length === 3 && values.every(Number.isFinite) ? values : fallback;
};
const view = new View(document.body);
view.renderer.setPixelRatio(1);
// Fixed-size capture is independent of the browser panel's current width.
if (q.has('capture')) {
  const captureSize = () => { view.renderer.setSize(948, 593); view.camera.aspect = 948 / 593; view.camera.updateProjectionMatrix(); };
  captureSize();
  addEventListener('resize', captureSize);
}
view.debugCam = { p: triple('p', cameras[name].p), t: triple('t', cameras[name].t), fov: Number(q.get('fov')) || cameras[name].fov };
view.setDay(q.has('day') ? Number(q.get('day')) : 1);
view.time = 12;
// Keep the initial game props (including the stockroom coffin) in the comparison.
// Only the opt-in actor check advances the simulation. The visible initial coffin uses seed 1.
const sim = new Sim();
if (q.has('actors')) {
  const a = sim.addPlayer('Review A'), b = sim.addPlayer('Review B');
  a.body.position.set(-4.2, 0.05, 9.4);
  b.body.position.set(-8.1, 0.05, 8.5);
  for (let i = 0; i < 120; i++) sim.update(1 / 60);
}
for (const entity of sim.ents) sim.writeXf(entity);
view.setEntities(sim.describe(), sim.version);
view.setTransforms(sim.transforms(), sim.version, true);
view.setState(sim.state());
if (q.has('clean')) document.body.dataset.clean = '';
// Freeze clocks for repeatable sky, foliage, cloud cookie, grain and props.
const status = document.querySelector('#status');
const samples = [];
const intervals = [], gpuSamples = [];
const gl = view.renderer.getContext();
// GPU profiling is opt-in: timer queries can stall background WebGL views on some drivers.
const timer = q.has('profile') ? gl.getExtension('EXT_disjoint_timer_query_webgl2') : null;
let pending = null, previousTime = null;
let count = 0;
const median = (values) => { const sorted = [...values].sort((a,b) => a-b); return sorted.length ? +sorted[Math.floor(sorted.length/2)].toFixed(2) : null; };
function render(timestamp) {
  if (previousTime !== null && count > 20) { intervals.push(timestamp - previousTime); if (intervals.length > 120) intervals.shift(); }
  previousTime = timestamp;
  if (pending && gl.getQueryParameter(pending, gl.QUERY_RESULT_AVAILABLE)) {
    if (!gl.getParameter(timer.GPU_DISJOINT_EXT)) gpuSamples.push(gl.getQueryParameter(pending, gl.QUERY_RESULT) / 1e6);
    gl.deleteQuery(pending); pending = null;
    if (gpuSamples.length > 40) gpuSamples.shift();
  }
  const query = timer && !pending && count > 20 && count % 10 === 0 ? gl.createQuery() : null;
  if (query) gl.beginQuery(timer.TIME_ELAPSED_EXT, query);
  const start = performance.now();
  if (q.has('actors')) {
    sim.update(1 / 60);
    if (sim.version !== view.version) view.setEntities(sim.describe(), sim.version);
    view.setTransforms(sim.transforms(), sim.version, true);
    view.setState(sim.state());
  }
  view.frame(0, { yaw: 0, pitch: 0 });
  if (query) { gl.endQuery(timer.TIME_ELAPSED_EXT); pending = query; }
  if (count++ > 20) samples.push(performance.now() - start);
  if (samples.length > 120) samples.shift();
  status.textContent = JSON.stringify({camera:name, ...view.debugCam, day:q.get('day') ?? 1, lighting:q.get('lighting') ?? 'C', size:[view.renderer.domElement.width,view.renderer.domElement.height], calls:view.renderer.info.render.calls, triangles:view.renderer.info.render.triangles, cpuMedianMs:median(samples), gpuMedianMs:median(gpuSamples), frameMedianMs:median(intervals), shaderErrors:view.renderer.info.programs.filter(p => p.diagnostics?.runnable === false).length});
  requestAnimationFrame(render);
}
requestAnimationFrame(render);

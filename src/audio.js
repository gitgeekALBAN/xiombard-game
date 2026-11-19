// Tiny procedural sound effects (WebAudio oscillators and noise) — no audio files.
let ctx = null;
const MUTED = new URLSearchParams(location.search).has('mute'); // ?mute: silent (scripted tests, screenshots)
export function unlockAudio() {
  if (MUTED) return;
  if (!ctx) ctx =new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
}

function env(gain, t0, a, d, peak) {
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(peak, t0 + a);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
}
function tone(type, f0, f1, dur, vol, delay = 0) {
  const t = ctx.currentTime + delay, o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f0, t);
  o.frequency.exponentialRampToValueAtTime(f1, t + dur);
  env(g, t, 0.01, dur, vol);
  o.connect(g).connect(ctx.destination);
  o.start(t);
  o.stop(t + dur + 0.05);
}
function noise(dur, freq, vol, delay = 0) {
  const t = ctx.currentTime + delay;
  const buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * dur), ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
  src.buffer = buf;
  f.type = 'lowpass';
  f.frequency.value = freq;
  env(g, t, 0.005, dur, vol);
  src.connect(f).connect(g).connect(ctx.destination);
  src.start(t);
}

const SOUNDS = {
  dig: (v) => { noise(0.18, 900, 0.5 * v); tone('sine', 140, 70, 0.12, 0.3 * v); },
  grab: (v) => tone('sine', 300, 420, 0.08, 0.15 * v),
  throw: (v) => tone('triangle', 500, 180, 0.25, 0.2 * v),
  slip: (v) => { tone('sine', 900, 200, 0.45, 0.25 * v); },
  flop: (v) => { noise(0.12, 400, 0.4 * v); tone('sine', 200, 60, 0.2, 0.3 * v); },
  thud: (v) => { noise(0.15, 300, 0.5 * v); tone('sine', 90, 40, 0.2, 0.4 * v); },
  honk: (v) => { tone('square', 330, 320, 0.22, 0.12 * v); tone('square', 262, 255, 0.3, 0.12 * v, 0.25); },
  // the night shift
  swish: (v) => noise(0.16, 2600, 0.22 * v),
  bonk: (v) => { tone('sine', 520, 140, 0.16, 0.45 * v); noise(0.07, 1400, 0.4 * v); tone('triangle', 900, 300, 0.07, 0.2 * v); },
  groan: (v) => { tone('sawtooth', 110, 72, 0.7, 0.13 * v); tone('sine', 92, 60, 0.8, 0.2 * v, 0.05); },
  bark: (v) => { tone('square', 520, 300, 0.09, 0.14 * v); tone('square', 600, 320, 0.1, 0.14 * v, 0.14); },
  poof: (v) => { noise(0.4, 700, 0.3 * v); tone('sine', 300, 700, 0.3, 0.1 * v); },
  night: (v) => { [196, 185, 147].forEach((f, i) => tone('sine', f, f * 0.98, 1.3, 0.2 * v, i * 0.5)); },
  rooster: (v) => { [[660, 880, 0.14], [880, 990, 0.14], [990, 1180, 0.5], [1180, 700, 0.35]].reduce((t, [a, b, d]) => { tone('square', a, b, d, 0.09 * v, t); return t + d; }, 0); },
  bury: (v) => { [523, 466, 392, 311].forEach((f, i) => tone('triangle', f, f, 0.5, 0.18 * v, i * 0.16)); },
};

export function sfx(name, pos, listener) {
  if (!ctx || ctx.state !== 'running' || !SOUNDS[name]) return;
  let v = 1;
  if (pos && listener) {
    const d = Math.hypot(pos[0] - listener.x, pos[1] - listener.y, pos[2] - listener.z);
    v = Math.max(0, 1 - d / 35);
  }
  if (v > 0.02) SOUNDS[name](v);
}

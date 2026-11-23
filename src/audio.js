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

// The blessing at the chapel: a hummed "mmm" in a little made-up tune, a low voice through a soft vowel filter, with a
// slow wobble. Wordless on purpose (no real prayer).
function hum(vol, len = 3.1) {
  const t0 = ctx.currentTime, out = ctx.createGain(), f = ctx.createBiquadFilter();
  f.type = 'bandpass'; f.frequency.value = 520; f.Q.value = 1.4;
  out.gain.setValueAtTime(0.0001, t0);
  out.gain.exponentialRampToValueAtTime(vol, t0 + 0.25);
  out.gain.setValueAtTime(vol, t0 + len - 0.5);
  out.gain.exponentialRampToValueAtTime(0.0001, t0 + len);
  f.connect(out).connect(ctx.destination);
  const tune = [147, 165, 147, 131, 147, 175, 165, 147]; // D E D C D F E D, a note every ~0.39 s
  for (const [mult, type, g] of [[1, 'sawtooth', 0.35], [1.005, 'triangle', 0.5], [0.5, 'sine', 0.6]]) {
    const o = ctx.createOscillator(), og = ctx.createGain(), lfo = ctx.createOscillator(), lg = ctx.createGain();
    o.type = type; og.gain.value = g;
    tune.forEach((n, i) => o.frequency.setTargetAtTime(n * mult, t0 + (i * len) / tune.length, 0.05));
    lfo.frequency.value = 5.2; lg.gain.value = 2.2 * mult; lfo.connect(lg).connect(o.frequency); // vibrato
    o.connect(og).connect(f);
    o.start(t0); lfo.start(t0); o.stop(t0 + len + 0.1); lfo.stop(t0 + len + 0.1);
  }
  f.frequency.setValueAtTime(420, t0);
  f.frequency.linearRampToValueAtTime(620, t0 + len * 0.5); // the mouth opening and closing a little
  f.frequency.linearRampToValueAtTime(400, t0 + len);
}

const SOUNDS = {
  hum: (v) => hum(0.32 * v),
  // a hand-in window's shutter rolling up or down: a rattling slide
  shutter: (v) => { noise(0.55, 1400, 0.18 * v); for (let i = 0; i < 7; i++) tone('square', 220 + i * 18, 200 + i * 18, 0.03, 0.04 * v, i * 0.07); },
  // the big red NO DELIVERY button: a low factory buzzer
  buzzer: (v) => { tone('sawtooth', 78, 74, 0.9, 0.22 * v); tone('square', 58, 56, 0.9, 0.12 * v); noise(0.9, 220, 0.06 * v); },
  // a grave's ghost: happy, a rising sparkly arpeggio; sad, a long wavering "wooo" sliding down
  ghostHappy: (v) => { [523, 659, 784, 1046, 1318].forEach((f, i) => tone('sine', f, f * 1.02, 0.35, 0.12 * v, i * 0.09)); },
  ghostSad: (v) => { tone('sine', 520, 260, 1.6, 0.16 * v); tone('triangle', 515, 255, 1.6, 0.06 * v, 0.05); },
  bell: (v) => { [1046, 1568, 2093].forEach((f, i) => tone('sine', f, f * 0.995, 1.2 - i * 0.3, (0.12 - i * 0.03) * v, i * 0.01)); },
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

// the master volume from the settings (0..1)
let VOLUME = 1;
export function setVolume(v) { VOLUME = Math.max(0, Math.min(1, v)); }

export function sfx(name, pos, listener) {
  if (!ctx || ctx.state !== 'running' || !SOUNDS[name] || VOLUME <= 0) return;
  let v = VOLUME;
  if (pos && listener) {
    const d = Math.hypot(pos[0] - listener.x, pos[1] - listener.y, pos[2] - listener.z);
    v = Math.max(0, 1 - d / 35);
  }
  if (v > 0.02) SOUNDS[name](v);
}

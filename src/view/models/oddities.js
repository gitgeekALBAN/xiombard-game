import * as THREE from 'three';
import { toon } from '../../shaders/toon.js';
import { part, SPH, SPH_LO, CYL, BOX, capsule } from './common.js';
import { ODDITIES } from '../../shared/layout.js';

// Odd deliveries (ODDITIES in shared/layout.js), built from primitives: a burlap bag of gold with coins peeking out, a
// taped white brick of "powder", and a crocodile (alive: green, on its feet; dead: belly up, legs in the air).
// Local frame: the long side is +x (a crocodile's snout), up is +y, centered on the physics box.
const CONE = new THREE.ConeGeometry(1, 1, 8);
const M = {
  burlap: toon('#b08a55', { mottle: 0.8 }), coin: toon('#f0c23a', { rim: 1.4 }), string: toon('#5a3a2a'),
  brick: toon('#f2efe6', { mottle: 0.25 }), tape: toon('#6f6a75'), sticker: toon('#d8433a'),
};

function goldBag(g) {
  g.add(part(SPH, M.burlap, { pos: [0, -0.03, 0], scale: [0.22, 0.22, 0.21], outline: 0.012 }));
  g.add(part(CYL, M.string, { pos: [0, 0.18, 0], scale: [0.07, 0.05, 0.07], outline: 0.008 }));
  g.add(part(SPH_LO, M.burlap, { pos: [0, 0.23, 0], scale: [0.1, 0.05, 0.1], outline: 0.008 })); // the gathered neck
  for (const [x, z, r] of [[0.05, 0.02, 0.3], [-0.04, -0.03, -0.4], [0.0, 0.05, 0.1]]) g.add(part(CYL, M.coin, { pos: [x, 0.27, z], rot: [r, 0, 0.5], scale: [0.04, 0.008, 0.04], outline: 0.006 }));
}
function powderBrick(g) {
  g.add(part(BOX, M.brick, { scale: [0.5, 0.26, 0.34], outline: 0.012 }));
  for (const x of [-0.12, 0.12]) g.add(part(BOX, M.tape, { pos: [x, 0, 0], scale: [0.06, 0.27, 0.35], outline: 0 }));
  g.add(part(BOX, M.sticker, { pos: [0.0, 0.131, 0.0], scale: [0.12, 0.004, 0.09], outline: 0 }));
}
// The crocodile, built from the NanoGPT model sheet (kept outside the repo): a dark swamp-green body in darker blotches
// with a pale belly in plates, two rows of rounded scutes, a long flat snout with little square teeth along the jaw and
// two nostrils, eye bumps on top, stubby three-toed legs, a thick tail with a ridge. The eyes are flat paint on the eye
// bumps, so the face changes like the crew's: awake (narrow, mean), out cold (spirals, tongue lolling out), dead (X).
const CROC = { back: toon('#365c31', { mottle: 1 }), dead: toon('#62785a', { mottle: 1 }), blotch: toon('#25401f', { mottle: 0.5 }),
  belly: toon('#ddd5a2', { mottle: 0.3, color2: '#bfb583', stripes: 13, stripeDuty: 0.18, axis: 1 }),
  scute: toon('#365a30', { mottle: 0.6 }), tongue: toon('#e07a8a'), tooth: toon('#fbf8ee'), nostril: toon('#1e1a26') };
// eye paintings: one canvas per state, a disc of eye with its lid, drawn on the front of each eye bump
const eyeTex = (state) => {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d');
  g.fillStyle = '#f4f0e2'; g.beginPath(); g.arc(32, 32, 30, 0, Math.PI * 2); g.fill();
  g.lineWidth = 4; g.strokeStyle = '#1e1a26'; g.fillStyle = '#1e1a26'; g.lineCap = 'round';
  if (state === 'awake') { // a heavy green lid over half the eye, a slit pupil looking sideways: mean and sly
    g.beginPath(); g.ellipse(36, 38, 5, 12, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#41693a'; g.beginPath(); g.moveTo(0, 0); g.lineTo(64, 0); g.lineTo(64, 22); g.lineTo(0, 34); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(2, 34); g.lineTo(62, 22); g.stroke();
  } else if (state === 'cold') { // a spiral
    g.beginPath(); for (let a = 0; a < Math.PI * 6; a += 0.2) { const r = 2 + a * 1.35; const x = 32 + Math.cos(a) * r, y = 32 + Math.sin(a) * r; a ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
  } else { g.lineWidth = 6; g.beginPath(); g.moveTo(16, 16); g.lineTo(48, 48); g.moveTo(48, 16); g.lineTo(16, 48); g.stroke(); } // X
  g.lineWidth = 4; g.beginPath(); g.arc(32, 32, 29, 0, Math.PI * 2); g.stroke();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  return new THREE.MeshBasicMaterial({ map: t, alphaTest: 0.5, fog: true });
};
const EYES = { awake: eyeTex('awake'), cold: eyeTex('cold'), dead: eyeTex('dead') };
const EYE = new THREE.CircleGeometry(0.042, 16);
const DOT = new THREE.SphereGeometry(1, 6, 4); // tiny details (scutes, blotches, toes, nostrils): a few dozen triangles each
const lowCaps = new Map();
const lowCap = (r, len, seg = 6) => { const k = `${r}:${len}:${seg}`; if (!lowCaps.has(k)) lowCaps.set(k, new THREE.CapsuleGeometry(r, len, 2, seg)); return lowCaps.get(k); }; // small limbs need few sides
function crocodile(g, dead) {
  const skin = dead ? CROC.dead : CROC.back, c = new THREE.Group();
  c.add(part(capsule(0.15, 0.5), skin, { pos: [-0.05, 0.0, 0], rot: [0, 0, Math.PI / 2], scale: [0.95, 1, 1.25], outline: 0.014 }));      // the body
  c.add(part(lowCap(0.13, 0.48, 8), CROC.belly, { pos: [-0.05, -0.05, 0], rot: [0, 0, Math.PI / 2], scale: [0.75, 1, 1.18], outline: 0 })); // the belly
  c.add(part(lowCap(0.11, 0.1, 8), skin, { pos: [0.36, 0.02, 0], rot: [0, 0, Math.PI / 2], scale: [1, 1, 1.25], outline: 0.012 }));         // the head
  c.add(part(lowCap(0.065, 0.32, 8), skin, { pos: [0.63, -0.015, 0], rot: [0, 0, Math.PI / 2], scale: [1, 1, 1.35], outline: 0.012 }));     // the snout
  c.add(part(lowCap(0.05, 0.3), CROC.belly, { pos: [0.6, -0.055, 0], rot: [0, 0, Math.PI / 2], scale: [1, 1, 1.45], outline: 0 }));       // the jaw, pale underneath
  for (const s of [-1, 1]) {
    c.add(part(SPH_LO, skin, { pos: [0.4, 0.105, s * 0.075], scale: 0.055, outline: 0.01 }));                                                    // an eye bump
    const eye = new THREE.Mesh(EYE, EYES[dead ? 'dead' : 'awake']); // painted on the bump, looking forward and out
    const dir = new THREE.Vector3(0.72, 0.42, s * 0.55).normalize(), ctr = new THREE.Vector3(0.4, 0.105, s * 0.075);
    eye.position.copy(ctr).addScaledVector(dir, 0.058);
    eye.lookAt(eye.position.clone().add(dir));
    eye.userData.eye = true;
    c.add(eye);
    c.add(part(DOT, CROC.nostril, { pos: [0.85, 0.035, s * 0.03], scale: [0.014, 0.01, 0.014], outline: 0 }));                          // nostrils
    for (let i = 0; i < 4; i++) c.add(part(BOX, CROC.tooth, { pos: [0.5 + i * 0.09, -0.04, s * 0.083], scale: [0.026, 0.03, 0.012], outline: 0 })); // square teeth
    for (const [x, ang] of [[0.24, 0.5], [-0.32, -0.5]]) { // stubby legs splayed out, three toes each
      const leg = new THREE.Group();
      leg.position.set(x, -0.08, s * 0.16); leg.rotation.set(s * 0.7, 0, ang * 0.3);
      leg.add(part(lowCap(0.045, 0.07), skin, { pos: [0, -0.04, 0], outline: 0.008 }));
      for (let k = -1; k <= 1; k++) leg.add(part(DOT, skin, { pos: [0.035 + Math.abs(k) * -0.01, -0.1, k * 0.028], scale: [0.026, 0.016, 0.018], outline: 0 }));
      c.add(leg);
    }
  }
  c.add(part(CONE, skin, { pos: [-0.62, -0.01, 0], rot: [0, 0, Math.PI / 2], scale: [0.13, 0.66, 0.11], outline: 0.012 }));                // the tail
  for (let i = 0; i < 7; i++) for (const s of [-1, 1]) { // two rows of rounded scutes down the back
    if (i > 4 && s > 0) continue;
    const x = 0.22 - i * 0.12;
    c.add(part(DOT, CROC.scute, { pos: [x, 0.13 - Math.max(0, i - 4) * 0.025, i > 4 ? 0 : s * 0.045], scale: [0.045, 0.028, 0.032], outline: 0 }));
  }
  // darker blotches over the back and the head, flat dabs sitting on the skin
  for (const [x, z, r] of [[0.12, 0.06, 0.05], [-0.1, -0.08, 0.06], [-0.3, 0.07, 0.045], [-0.45, -0.04, 0.04], [0.3, -0.06, 0.035], [0.62, 0.05, 0.03], [-0.62, 0.02, 0.035]]) {
    const top = x > 0.5 ? 0.04 : x < -0.5 ? 0.08 : 0.14;
    c.add(part(DOT, CROC.blotch, { pos: [x, top, z], scale: [r * 1.4, 0.012, r], outline: 0 }));
  }
  // out cold: a tongue lolling out of the side of the mouth (shown only then)
  const tongue = part(lowCap(0.025, 0.08), CROC.tongue, { pos: [0.56, -0.07, 0.11], rot: [0.9, 0, 0.3], outline: 0.006 });
  tongue.visible = false;
  c.add(tongue);
  if (dead) { c.rotation.x = Math.PI; tongue.visible = true; } // belly up, legs in the air, tongue out
  g.add(c);
  // the live one's face follows its state: 'awake' or 'cold' (stunned); see setState in view.js
  g.userData.setFace = (state) => {
    if (dead || g.userData.face === state) return;
    g.userData.face = state;
    c.traverse((o) => { if (o.userData.eye) o.material = EYES[state === 'cold' ? 'cold' : 'awake']; });
    tongue.visible = state === 'cold';
  };
}

export function buildOddity(look) {
  const g = new THREE.Group(), id = (ODDITIES[look] || ODDITIES[0]).id;
  if (id === 'gold') goldBag(g);
  else if (id === 'powder') powderBrick(g);
  else crocodile(g, id === 'crocDead');
  return [g];
}

import * as THREE from 'three';
import { NOTE, outfitLabel, riteLabel, CANDLES } from '../../shared/layout.js';
import { drawCharm } from './charms.js';

// A delivery note: a stiff card with the body's name, the outfit, the charm for the blessing and the candles, written
// into a canvas at runtime. Same material settings as the morgue's signs (map + alpha test + fog), so it shares
// their shader. d is the entity descriptor: d.name, d.note = [suit, rite, candle color, candle count].
const W = 320, H = 224;
export function noteTexture(name, [suit, rite, cc, cn]) {
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d');
  // old card: warm paper, a darker edge, a torn-off corner
  g.fillStyle = '#e9dcbc'; g.fillRect(0, 0, W, H);
  g.strokeStyle = '#a58f6a'; g.lineWidth = 8; g.strokeRect(4, 4, W - 8, H - 8);
  g.fillStyle = '#231d33'; g.textAlign = 'left';
  g.font = 'bold 18px Georgia, serif'; g.fillText('DELIVERY NOTE', 18, 34);
  g.font = 'italic bold 30px Georgia, serif'; g.fillText(name, 18, 72, W - 36);
  g.font = '19px Georgia, serif';
  g.fillText(`Dress: ${outfitLabel(suit)}`, 18, 106, W - 36);
  g.fillText(`Bless: ${riteLabel(rite)}`, 18, 138, 190);
  const col = (CANDLES.find((k) => k.id === cc) || CANDLES[0]);
  g.fillText(`Candles: ${cn}`, 18, 172);
  // the candles as little drawings in their color
  for (let i = 0; i < cn; i++) {
    const x = 120 + i * 18;
    g.fillStyle = col.color; g.fillRect(x, 156, 10, 26);
    g.strokeStyle = '#231d33'; g.lineWidth = 2; g.strokeRect(x, 156, 10, 26);
    g.fillStyle = '#e0a030'; g.beginPath(); g.ellipse(x + 5, 150, 3.5, 6, 0, 0, Math.PI * 2); g.fill();
  }
  // the charm, big, on the right
  g.strokeStyle = '#7a5f4a'; g.lineWidth = 3; g.strokeRect(222, 112, 84, 84);
  drawCharm(g, rite, 264, 154, 70);
  g.font = 'italic 14px Georgia, serif'; g.fillStyle = '#5a4a60'; g.fillText('handle with care', 18, H - 16);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

// the sheet sits on top of the (thicker) physics box, so a note on the floor shows above the planks and the grass
const geo = new THREE.BoxGeometry(NOTE.hx * 2, NOTE.sheet * 2, NOTE.hz * 2).translate(0, NOTE.hy - NOTE.sheet, 0);
// the card is written on the box's top face; the mesh is turned half round so it reads from the holder's side
export function buildNote(d) {
  const mat = new THREE.MeshBasicMaterial({ map: noteTexture(d.name, d.note), alphaTest: 0.5, fog: true, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
  const g = new THREE.Group(), m = new THREE.Mesh(geo, mat);
  m.rotation.y = Math.PI; // so the text reads upright for the one holding it (see holdTarget in game.js)
  g.add(m);
  return [g];
}

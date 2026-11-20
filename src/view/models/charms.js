// The graveyard's own charms for the blessing (see RITES in shared/layout.js), drawn with canvas 2D paths: on the
// delivery notes, on the plaques the crew hold up at the chapel, and in the chapel's charm rack. They are invented for
// this game on purpose: a moth, a snail, a key and a moon in a teacup. No real religion's symbols.
// drawCharm(g, id, cx, cy, s, ink): s is the size of the charm's box in pixels.
export function drawCharm(g, id, cx, cy, s, ink = '#231d33') {
  g.save();
  g.translate(cx, cy);
  g.scale(s / 100, s / 100);
  g.strokeStyle = ink; g.fillStyle = ink; g.lineWidth = 6; g.lineCap = 'round'; g.lineJoin = 'round';
  const path = (f) => { g.beginPath(); f(); };
  if (id === 'moth') {
    // body, four wings with eye spots, two curled feelers
    path(() => g.ellipse(0, 4, 7, 26, 0, 0, Math.PI * 2)); g.fill();
    for (const sx of [-1, 1]) {
      path(() => { g.moveTo(0, -8); g.bezierCurveTo(sx * 48, -46, sx * 52, 4, sx * 4, 2); }); g.stroke();
      path(() => { g.moveTo(0, 8); g.bezierCurveTo(sx * 40, 10, sx * 34, 44, sx * 3, 22); }); g.stroke();
      path(() => g.arc(sx * 26, -16, 6, 0, Math.PI * 2)); g.fill();
      path(() => { g.moveTo(sx * 3, -20); g.quadraticCurveTo(sx * 10, -40, sx * 20, -38); g.arc(sx * 20, -42, 4, Math.PI / 2, Math.PI * 2.4 * sx); }); g.stroke();
    }
  } else if (id === 'snail') {
    // a spiral shell on a long soft foot with two eye stalks
    path(() => { for (let a = 0; a < Math.PI * 5; a += 0.15) { const r = 3 + a * 2.7; const x = -6 + Math.cos(a) * r, y = -6 + Math.sin(a) * r; a === 0 ? g.moveTo(x, y) : g.lineTo(x, y); } }); g.stroke();
    path(() => { g.moveTo(-44, 32); g.quadraticCurveTo(10, 40, 44, 30); g.quadraticCurveTo(48, 14, 34, 12); }); g.stroke();
    path(() => { g.moveTo(36, 14); g.lineTo(42, -12); g.moveTo(32, 14); g.lineTo(28, -10); }); g.stroke();
    for (const [x, y] of [[42, -14], [28, -12]]) { path(() => g.arc(x, y, 5, 0, Math.PI * 2)); g.fill(); }
  } else if (id === 'key') {
    // a skull-bow key: round bow with two eye holes, a long shank, three crooked teeth
    path(() => g.arc(0, -26, 22, 0, Math.PI * 2)); g.stroke();
    for (const sx of [-1, 1]) { path(() => g.arc(sx * 8, -28, 5, 0, Math.PI * 2)); g.fill(); }
    path(() => { g.moveTo(-6, -14); g.lineTo(0, -10); g.lineTo(6, -14); }); g.stroke();
    path(() => { g.moveTo(0, -4); g.lineTo(0, 44); g.moveTo(0, 20); g.lineTo(14, 22); g.moveTo(0, 30); g.lineTo(18, 30); g.moveTo(0, 40); g.lineTo(12, 44); }); g.stroke();
  } else if (id === 'teacup') {
    // a crescent moon sitting in a teacup, steam curls above
    path(() => { g.moveTo(-34, 6); g.lineTo(34, 6); g.quadraticCurveTo(30, 40, 0, 40); g.quadraticCurveTo(-30, 40, -34, 6); }); g.stroke();
    path(() => g.arc(40, 18, 10, -Math.PI / 2, Math.PI / 2)); g.stroke();
    path(() => { g.moveTo(-26, 46); g.lineTo(26, 46); }); g.stroke();
    path(() => { g.arc(-4, -14, 18, Math.PI * 0.45, Math.PI * 1.75); g.arc(4, -18, 13, Math.PI * 1.65, Math.PI * 0.55, true); g.closePath(); }); g.fill();
    for (const x of [16, 28]) { path(() => { g.moveTo(x, -6); g.quadraticCurveTo(x + 8, -16, x, -26); g.quadraticCurveTo(x - 8, -36, x + 2, -44); }); g.stroke(); }
  }
  g.restore();
}

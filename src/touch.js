// On-screen controls for phones and tablets: a floating stick on the left half,
// drag-to-look on the right half, and action buttons in the bottom-right corner.
export const touch = { active: false, mx: 0, mz: 0, run: false, jump: false, dig: false };

const STICK_R = 52;
const LOOK_SENS = 0.0055;

export function isTouchDevice() {
  return matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

// actions: { grab(), throw(), flop() } — one-shot callbacks; look: { yaw, pitch } mutated in place.
export function initTouch(root, look, actions) {
  touch.active = true;
  document.body.classList.add('touch');
  const stickZone = root.querySelector('#stick-zone'), lookZone = root.querySelector('#look-zone');
  const base = root.querySelector('#stick-base'), knob = root.querySelector('#stick-knob');
  const capture = (el, id) => { try { el.setPointerCapture(id); } catch { /* synthetic pointers cannot be captured */ } };

  let stickId = null, sx = 0, sy = 0;
  const stickMove = (e) => {
    let dx = e.clientX - sx, dy = e.clientY - sy;
    const len = Math.hypot(dx, dy);
    if (len > STICK_R) { dx *= STICK_R / len; dy *= STICK_R / len; }
    knob.style.transform = `translate(${dx}px, ${dy}px)`;
    touch.mx = dx / STICK_R;
    touch.mz = -dy / STICK_R;
    touch.run = len > STICK_R * 1.6; // push well past the rim to run
  };
  const stickEnd = (e) => {
    if (e.pointerId !== stickId) return;
    stickId = null;
    touch.mx = touch.mz = 0;
    touch.run = false;
    base.classList.remove('on');
  };
  stickZone.addEventListener('pointerdown', (e) => {
    if (stickId !== null) return;
    stickId = e.pointerId;
    capture(stickZone, e.pointerId);
    sx = e.clientX; sy = e.clientY;
    base.style.left = `${sx}px`; base.style.top = `${sy}px`;
    base.classList.add('on');
    stickMove(e);
  });
  stickZone.addEventListener('pointermove', (e) => { if (e.pointerId === stickId) stickMove(e); });
  stickZone.addEventListener('pointerup', stickEnd);
  stickZone.addEventListener('pointercancel', stickEnd);

  let lookId = null, lx = 0, ly = 0;
  lookZone.addEventListener('pointerdown', (e) => {
    if (lookId !== null) return;
    lookId = e.pointerId;
    capture(lookZone, e.pointerId);
    lx = e.clientX; ly = e.clientY;
  });
  lookZone.addEventListener('pointermove', (e) => {
    if (e.pointerId !== lookId) return;
    look.yaw -= (e.clientX - lx) * LOOK_SENS;
    look.pitch = Math.max(look.min ?? -0.35, Math.min(look.max ?? 1.2, look.pitch + (e.clientY - ly) * LOOK_SENS));
    lx = e.clientX; ly = e.clientY;
  });
  const lookEnd = (e) => { if (e.pointerId === lookId) lookId = null; };
  lookZone.addEventListener('pointerup', lookEnd);
  lookZone.addEventListener('pointercancel', lookEnd);

  const button = (id, down, up) => {
    const el = root.querySelector(id);
    el.addEventListener('pointerdown', (e) => { e.preventDefault(); capture(el, e.pointerId); el.classList.add('on'); down(); });
    const end = () => { el.classList.remove('on'); up?.(); };
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
  };
  button('#t-grab', actions.grab);
  button('#t-throw', actions.throw);
  button('#t-flop', actions.flop);
  button('#t-jump', () => { touch.jump = true; }, () => { touch.jump = false; });
  button('#t-dig', () => { touch.dig = true; }, () => { touch.dig = false; });
  root.addEventListener('contextmenu', (e) => e.preventDefault());
}

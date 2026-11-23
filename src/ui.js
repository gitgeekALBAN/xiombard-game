// The game's own interface: the task list (top left), the controls list (bottom left), the reward card, and the
// Esc menu with the settings. One look throughout (see the `.gq` panel styles in index.html): dark ink panels with a
// thin gold frame and corner marks, the serif of the menu, cream text, gold accents.
//
// The Esc menu is a small panel at the right edge, not a full screen: the game stays visible and keeps running behind
// it. Its rows appear one after another in quick steps (no sliding or popping). Esc closes it again at once, and the
// settings apply as they change, so there is nothing to confirm. Playing alone, the game eases to a halt while the
// menu is open (no darkening); with friends in the room it cannot pause, so it says so.

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// ---------- settings ----------
const KEY = 'gq-settings';
export const DEFAULTS = { volume: 80, sens: 1, invertY: false, quality: '', camera: 'first', fps: false, help: false, pause: true };
export function loadSettings() {
  try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch { return { ...DEFAULTS }; }
}
function saveSettings(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* private mode: they last this visit */ } }

// The controls, one per line (keyboard and mouse; the touch buttons say what they do themselves).
const CONTROLS = [
  ['W A S D', 'move'], ['Shift', 'run'], ['Space', 'jump'], ['Mouse', 'look around'],
  ['E', 'pick up, put down, use a station'], ['Click', 'swing the shovel'], ['F (hold)', 'work: dig, lid, nails, fill, repair'],
  ['Q', 'throw / cancel'], ['N', 'read the delivery note'], ['1-5', 'pick in a choice'], ['R', 'go limp'],
  ['V', 'first / third person'], ['U', 'stuck? wriggle free'], ['Esc', 'menu and settings'],
];

// ctx: what the menu changes in the game. { setFirstPerson(on), isFirstPerson(), setQuality(q), quality(),
// setVolume(v), setSens(k), setInvertY(b), togglePerf(on), solo(), leave(), onClose() }
export function createUI(ctx) {
  const S = loadSettings();
  let open = false, page = 'main';

  // --- apply everything once at start ---
  const apply = () => {
    ctx.setVolume(S.volume / 100);
    ctx.setSens(S.sens);
    ctx.setInvertY(S.invertY);
    if (S.quality) ctx.setQuality(S.quality);
    ctx.setFirstPerson(S.camera !== 'third');
    ctx.togglePerf(S.fps);
    $('controls').classList.toggle('open', !!S.help);
  };
  const set = (k, v) => { S[k] = v; saveSettings(S); apply(); };

  // --- the controls list, bottom left ---
  $('controls').innerHTML = `<div class="gq-title">Controls <kbd>H</kbd></div><ul>${CONTROLS.map(([k, t]) => `<li><kbd>${esc(k)}</kbd><span>${esc(t)}</span></li>`).join('')}</ul>`;

  // --- the Esc menu ---
  const el = $('pause');
  const row = (html, cls = '') => `<div class="gq-row ${cls}">${html}</div>`;
  const slider = (key, label, min, max, step, fmt = (v) => v) =>
    row(`<label>${label}</label><input type="range" data-k="${key}" min="${min}" max="${max}" step="${step}" value="${S[key]}"><output>${fmt(S[key])}</output>`, 'slider');
  const toggle = (key, label, on = 'On', off = 'Off') => row(`<label>${label}</label><button class="gq-toggle${S[key] ? ' on' : ''}" data-t="${key}">${S[key] ? on : off}</button>`);
  const choice = (key, label, opts) => row(`<label>${label}</label><span class="gq-choice">${opts.map(([v, t]) => `<button data-c="${key}" data-v="${v}" class="${S[key] === v ? 'on' : ''}">${t}</button>`).join('')}</span>`);
  const render = () => {
    const solo = ctx.solo();
    let html = '';
    if (page === 'main') {
      html += `<div class="gq-title">Paused${solo ? '' : ' <small>· the game goes on (co-op)</small>'}</div>`;
      html += row('<button class="gq-item" data-go="resume">Resume <kbd>Esc</kbd></button>');
      html += row('<button class="gq-item" data-go="settings">Settings</button>');
      html += row('<button class="gq-item" data-go="controls">How to play</button>');
      html += row('<button class="gq-item" data-go="leave">Leave the graveyard</button>');
    } else if (page === 'settings') {
      if (!S.quality) S.quality = ctx.quality();
      html += `<div class="gq-title"><button class="gq-back" data-go="main">‹</button> Settings</div>`;
      html += '<div class="gq-head">Sound</div>' + slider('volume', 'Volume', 0, 100, 5);
      html += '<div class="gq-head">Controls</div>' + slider('sens', 'Mouse speed', 0.3, 2.5, 0.1, (v) => `${(+v).toFixed(1)}×`) + toggle('invertY', 'Invert look');
      html += '<div class="gq-head">Picture</div>' + choice('quality', 'Quality', [['high', 'High'], ['low', 'Low'], ['off', 'Fast']])
        + choice('camera', 'Camera', [['first', 'First'], ['third', 'Third']]) + toggle('fps', 'FPS meter');
      html += '<div class="gq-head">Interface</div>' + toggle('help', 'Controls list', 'Shown', 'Hidden') + toggle('pause', 'Pause when alone', 'Yes', 'No');
      html += row('<small>Changes apply at once · Esc closes</small>', 'note');
    } else {
      html += `<div class="gq-title"><button class="gq-back" data-go="main">‹</button> How to play</div>`;
      const steps = ['Take the body in at the hatch (E)', 'Read its delivery note (N)', 'Registry desk: write the name tag', 'Dressing table: pick the outfit on the note',
        'Chapel: bless with the charm on the note', 'Lay them in a coffin, close the lid (F), nail it if you can spare nails', 'Carry it to a dug grave and fill it (F)',
        'Light the candles the note asks for', 'Meet the daily quota for supplies; every one over it pays a bonus', 'At night: whack the visitors, repair the fence by day'];
      html += steps.map((t, i) => row(`<span class="gq-num">${i + 1}</span><span>${esc(t)}</span>`, 'step')).join('');
    }
    el.innerHTML = html;
    // rows show up one after another in quick steps, no sliding
    el.querySelectorAll('.gq-title, .gq-row, .gq-head').forEach((r, i) => { r.style.animationDelay = `${i * 28}ms`; });
    el.querySelectorAll('[data-go]').forEach((b) => b.addEventListener('click', () => go(b.dataset.go)));
    el.querySelectorAll('input[type=range]').forEach((inp) => inp.addEventListener('input', () => {
      const v = +inp.value;
      inp.nextElementSibling.textContent = inp.dataset.k === 'sens' ? `${v.toFixed(1)}×` : v;
      set(inp.dataset.k, v);
    }));
    el.querySelectorAll('[data-t]').forEach((b) => b.addEventListener('click', () => { set(b.dataset.t, !S[b.dataset.t]); render(); }));
    el.querySelectorAll('[data-c]').forEach((b) => b.addEventListener('click', () => { set(b.dataset.c, b.dataset.v); render(); }));
  };
  const go = (where) => {
    if (where === 'resume') { close(); return; }
    if (where === 'leave') { ctx.leave(); return; }
    page = where;
    render();
  };
  function show() { open = true; page = 'main'; render(); el.classList.add('show'); document.body.classList.add('menu-open'); }
  function close() { if (!open) return; open = false; el.classList.remove('show'); document.body.classList.remove('menu-open'); ctx.onClose(); }
  // keep clicks on the panel off the game (the canvas would grab the pointer, the touch layer would start a stick)
  for (const ev of ['pointerdown', 'mousedown', 'touchstart']) el.addEventListener(ev, (e) => e.stopPropagation());

  // --- the reward card: slides nothing, just appears for a few seconds ---
  let rewardT = 0;
  const showReward = (r) => {
    const c = $('reward');
    c.innerHTML = `<div class="gq-title">${esc(r.kind === 'quota' ? 'Quota met!' : 'Bonus!')}</div><p>${esc(r.text)}</p><div class="gain">${esc(r.gain)}</div>`;
    c.className = `gq show ${r.kind}`;
    clearTimeout(rewardT);
    rewardT = setTimeout(() => c.classList.remove('show'), 4200);
  };

  // --- the task list, top left ---
  let lastTasks = '';
  const renderTasks = (st, myId) => {
    const [today, quota] = st.quota || [0, 0];
    const day = st.phase ? st.phase[2] : 1, night = st.phase && st.phase[0];
    const me = st.players.find((p) => p.id === myId);
    const key = JSON.stringify([today, quota, day, night, st.buried, st.score, st.nails, st.boards, st.cash, me && me.inf, st.players.map((p) => [p.id, p.name, p.color])]);
    if (key === lastTasks) return;
    lastTasks = key;
    const pct = quota ? Math.min(1, today / quota) : 0, over = Math.max(0, today - quota);
    const bar = (k, cls = '') => `<div class="gq-bar ${cls}"><i style="width:${(k * 100).toFixed(0)}%"></i></div>`;
    $('tasks').innerHTML = `<div class="gq-title">${night ? 'Night' : 'Day'} ${day} · Tasks</div>`
      + `<div class="task"><div class="line"><span>Daily quota</span><b>${today} / ${quota}</b></div>${bar(pct, today >= quota ? 'done' : '')}`
      + `<small>${today >= quota ? (over ? `+${over} over quota: bonus paid` : 'met! each extra pays a bonus') : 'lay them to rest before dawn'}</small></div>`
      + `<div class="task"><div class="line"><span>Laid to rest</span><b>${st.buried ?? 0}</b></div><div class="line"><span>Peace points</span><b>${st.score ?? 0}</b></div></div>`
      + '<div class="gq-head">Supplies</div>'
      + `<div class="task res"><span>Nails <b>${st.nails ?? 0}</b></span><span>Boards <b>${st.boards ?? 0}</b></span><span>Cash <b>$${st.cash ?? 0}</b></span></div>`
      + `<div class="gq-head">Crew</div><ul class="crew">${st.players.map((p) => `<li style="--c:${p.color}">${esc(p.name)}${p.id === myId ? ' <em>you</em>' : ''}</li>`).join('')}</ul>`
      + `<div class="health ${me && me.inf ? 'sick' : ''}">${me && me.inf ? '☣ infected' : '♥ healthy'}</div>`;
  };

  apply();
  return {
    get open() { return open; },
    show, close,
    toggle() { if (open) close(); else show(); },
    renderTasks,
    showReward,
    toggleHelp() { set('help', !S.help); if (open && page === 'settings') render(); },
    settings: S,
  };
}

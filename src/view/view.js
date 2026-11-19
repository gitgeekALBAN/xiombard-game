import * as THREE from 'three';
import { createSky } from '../shaders/sky.js';
import { groundMaterial } from '../shaders/ground.js';
import { toon, glowMat } from '../shaders/toon.js';
import { buildCharacter, buildCoffin, buildTruck, buildHeadstone, buildTree, part, geo } from './models.js';
import {
  groundBoxes, DECOR, PLOTS, PLOT_HALF, PLOT_MAX_DEPTH, LANTERNS, FENCE, ROAD_Z, ROAD_HALF,
  MORGUE, OUTFITS, morgueBoxes, insideMorgue,
} from '../shared/layout.js';
import { P } from '../shared/skeleton.js';
import { sfx } from '../audio.js';

export class View {
  constructor(container) {
    const r = (this.renderer = new THREE.WebGLRenderer({ antialias: true }));
    r.setPixelRatio(Math.min(devicePixelRatio, 2));
    r.setSize(innerWidth, innerHeight);
    r.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(r.domElement);
    this.scene = new THREE.Scene();
    // fog is mixed after the sRGB conversion, so its color is given in output space to match the sky horizon
    this.scene.fog = new THREE.FogExp2(new THREE.Color().setRGB(0.19, 0.16, 0.28, THREE.LinearSRGBColorSpace), 0.028);
    this.camera = new THREE.PerspectiveCamera(62, innerWidth / innerHeight, 0.1, 1200);
    this.camera.position.set(8, 6, 18);
    this.camera.lookAt(0, 0, 3);
    this.sky = createSky();
    this.scene.add(this.sky);
    this.buildWorld();
    this.ents = new Map();
    this.order = [];
    this.version = -1;
    this.state = null;
    this.myId = 0;
    this.camTarget = new THREE.Vector3(0, 1.5, 6);
    this.time = 0;
    this.labels = document.getElementById('labels');
    addEventListener('resize', () => {
      this.camera.aspect = innerWidth / innerHeight;
      this.camera.updateProjectionMatrix();
      r.setSize(innerWidth, innerHeight);
    });
  }

  buildWorld() {
    const s = this.scene;
    this.groundMat = groundMaterial();
    for (const b of groundBoxes()) {
      const m = new THREE.Mesh(geo.BOX, this.groundMat);
      m.position.set(...b.c);
      m.scale.set(b.h[0] * 2, b.h[1] * 2, b.h[2] * 2);
      s.add(m);
    }
    // grave plots: moving floor, dirt mound, fill layer, headstone slot
    this.plots = PLOTS.map((p) => {
      const floor = new THREE.Mesh(geo.BOX, this.groundMat);
      floor.scale.set(PLOT_HALF.x * 2, 2, PLOT_HALF.z * 2);
      floor.position.set(p.x, -1, p.z);
      const mound = part(geo.SPH, toon('#3f2c27', { color2: '#352420', stripes: 7 }), { pos: [p.x + PLOT_HALF.x + 0.75, 0, p.z], scale: [0.7, 0.01, 1.2], outline: 0 });
      const fill = new THREE.Mesh(geo.BOX, toon('#3f2c27'));
      fill.scale.set(PLOT_HALF.x * 2, 0.04, PLOT_HALF.z * 2);
      fill.position.set(p.x, -2, p.z);
      fill.visible = false;
      s.add(floor, mound, fill);
      return { floor, mound, fill, stone: null, seed: -1, x: p.x, z: p.z };
    });

    for (const st of DECOR.stones) {
      const g = buildHeadstone(st.kind, st.w, st.h, st.seed);
      g.position.set(st.x, 0, st.z);
      g.rotation.set(st.rx, st.ry, st.rz);
      s.add(g);
    }
    for (const t of DECOR.trees) {
      const g = buildTree(t.seed, t.h);
      g.position.set(t.x, 0, t.z);
      s.add(g);
    }
    // crooked shed
    const sh = DECOR.shed;
    const shed = new THREE.Group();
    shed.position.set(sh.x, 0, sh.z);
    shed.rotation.y = 0.12;
    shed.add(part(geo.BOX, toon('#3b3044', { color2: '#2f2638', stripes: 5, axis: 1 }), { pos: [0, sh.hy, 0], scale: [sh.hx * 2, sh.hy * 2, sh.hz * 2], rot: [0, 0, 0.04], outline: 0.03 }));
    shed.add(part(geo.BOX, toon('#1f1a28'), { pos: [0.3, sh.hy * 2 + 0.3, 0], scale: [sh.hx * 2.4, 0.15, sh.hz * 2.5], rot: [0.05, 0, -0.2], outline: 0.03 }));
    shed.add(part(geo.BOX, toon('#16121c'), { pos: [0.4, 0.9, -sh.hz - 0.01], scale: [0.9, 1.8, 0.04], outline: 0 }));
    shed.add(part(geo.BOX, toon('#f0c060', { emissive: 0.9 }), { pos: [-1.1, 1.9, -sh.hz - 0.02], scale: [0.45, 0.4, 0.03], outline: 0 }));
    s.add(shed);
    this.buildMorgue();

    // wrought-iron fence
    const spikes = [], gate0 = ROAD_Z - ROAD_HALF - 0.3, gate1 = ROAD_Z + ROAD_HALF + 0.3;
    for (let a = -FENCE; a <= FENCE; a += 0.55) {
      spikes.push([a, -FENCE], [a, FENCE]);
      if (a < gate0 || a > gate1) spikes.push([-FENCE, a], [FENCE, a]);
    }
    const iron = toon('#15111c');
    const bars = new THREE.InstancedMesh(geo.BOX, iron, spikes.length);
    const tips = new THREE.InstancedMesh(new THREE.ConeGeometry(0.07, 0.25, 4), iron, spikes.length);
    const m = new THREE.Matrix4();
    spikes.forEach(([x, z], i) => {
      const h = 1.5 + Math.sin(x * 3.1 + z * 1.7) * 0.15;
      bars.setMatrixAt(i, m.compose(new THREE.Vector3(x, h / 2, z), new THREE.Quaternion(), new THREE.Vector3(0.05, h, 0.05)));
      tips.setMatrixAt(i, m.compose(new THREE.Vector3(x, h + 0.1, z), new THREE.Quaternion(), new THREE.Vector3(1, 1, 1)));
    });
    s.add(bars, tips);
    for (const y of [0.35, 1.2]) {
      for (const z of [-FENCE, FENCE]) s.add(part(geo.BOX, iron, { pos: [0, y, z], scale: [FENCE * 2, 0.05, 0.05], outline: 0 }));
      for (const x of [-FENCE, FENCE]) {
        s.add(part(geo.BOX, iron, { pos: [x, y, (-FENCE + gate0) / 2], scale: [0.05, 0.05, gate0 + FENCE], outline: 0 }));
        s.add(part(geo.BOX, iron, { pos: [x, y, (gate1 + FENCE) / 2], scale: [0.05, 0.05, FENCE - gate1], outline: 0 }));
      }
    }
    // lanterns
    this.billboards = [];
    for (const [x, z] of LANTERNS) {
      s.add(part(geo.BOX, iron, { pos: [x, 1.1, z], scale: [0.1, 2.2, 0.1], outline: 0.01 }));
      s.add(part(geo.BOX, toon('#ffc870', { emissive: 1 }), { pos: [x, 2.35, z], scale: [0.26, 0.32, 0.26], outline: 0.015 }));
      s.add(part(new THREE.ConeGeometry(0.24, 0.2, 4), iron, { pos: [x, 2.6, z], rot: [0, Math.PI / 4, 0], outline: 0 }));
      const glow = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.6), glowMat('#ffb860', 0.8));
      glow.position.set(x, 2.35, z);
      s.add(glow);
      this.billboards.push(glow);
    }
    // blob shadows pool
    this.shadowGeo = new THREE.CircleGeometry(1, 20).rotateX(-Math.PI / 2);
    this.shadowMat = new THREE.MeshBasicMaterial({ color: '#0b0812', transparent: true, opacity: 0.45, depthWrite: false, fog: true });
  }

  // A crooked one-storey morgue. The roof hides while your digger is inside so the camera can see in.
  buildMorgue() {
    const s = this.scene, M = MORGUE;
    const wall = toon('#4a4258', { color2: '#3f384c', stripes: 3.2, axis: 1 });
    const boxes = morgueBoxes();
    const furniture = 2; // the last two boxes are the table and the crate, drawn separately below
    for (const b of boxes.slice(0, -furniture)) s.add(part(geo.BOX, wall, { pos: b.c, scale: [b.h[0] * 2, b.h[1] * 2, b.h[2] * 2], outline: 0.02 }));
    // floor planks
    const cx = (M.x0 + M.x1) / 2, cz = (M.z0 + M.z1) / 2, w = M.x1 - M.x0, d = M.z1 - M.z0;
    s.add(part(geo.BOX, toon('#5a4636', { color2: '#4c3a2c', stripes: 3.3, axis: 1 }), { pos: [cx, 0.01, cz], scale: [w, 0.02, d], outline: 0 }));
    // roof: two crooked slopes, hidden while you are inside
    this.roof = new THREE.Group();
    const roofMat = toon('#241d2e', { color2: '#1c1624', stripes: 6, axis: 1 });
    for (const sz of [-1, 1]) this.roof.add(part(geo.BOX, roofMat, { pos: [cx, M.h + 0.55, cz + sz * d * 0.26], rot: [sz * 0.36, 0, 0.02], scale: [w + 0.8, 0.12, d * 0.6], outline: 0.03 }));
    this.roof.add(part(geo.BOX, toon('#3a3046'), { pos: [M.x1 - 1.6, M.h + 1.1, cz + 0.4], rot: [0, 0, 0.08], scale: [0.4, 1.1, 0.4], outline: 0.02 })); // chimney
    s.add(this.roof);
    // signs, painted in code
    const sign = (text, x, y, z, ry, wpx = 512) => {
      const c = document.createElement('canvas'); c.width = wpx; c.height = 128;
      const g2 = c.getContext('2d');
      g2.fillStyle = '#2a2236'; g2.fillRect(0, 0, wpx, 128);
      g2.fillStyle = '#f0c060'; g2.font = 'bold 64px Georgia, serif'; g2.textAlign = 'center'; g2.fillText(text, wpx / 2, 86);
      const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(wpx / 128 * 0.42, 0.42), new THREE.MeshBasicMaterial({ map: tex, fog: true }));
      m.position.set(x, y, z); m.rotation.y = ry; m.rotation.z = 0.04; s.add(m);
    };
    sign('MORGUE', (M.door[0] + M.door[1]) / 2, 2.45, M.z0 - M.t - 0.01, Math.PI);
    sign('DELIVERIES', (M.hatch[0] + M.hatch[1]) / 2, 2.35, M.z1 + M.t + 0.01, 0, 640);
    // intake table
    const tb = M.table;
    s.add(part(geo.BOX, toon('#8c8a9a', { color2: '#7a788a', stripes: 12, axis: 1 }), { pos: [tb.x, tb.top - 0.04, tb.z], scale: [tb.hx * 2, 0.08, tb.hz * 2], outline: 0.02 }));
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) s.add(part(geo.BOX, toon('#2a2230'), { pos: [tb.x + sx * (tb.hx - 0.08), tb.top / 2 - 0.04, tb.z + sz * (tb.hz - 0.08)], scale: [0.06, tb.top - 0.08, 0.06], outline: 0 }));
    // supply crate with nails and planks
    const cr = M.crate;
    s.add(part(geo.BOX, toon('#6a4c34', { color2: '#5a3f2a', stripes: 9 }), { pos: [cr.x, cr.hy, cr.z], scale: [cr.hx * 2, cr.hy * 2, cr.hz * 2], outline: 0.02 }));
    for (let i = 0; i < 3; i++) s.add(part(geo.BOX, toon('#8a6a48'), { pos: [cr.x - 0.05 + i * 0.04, cr.hy * 2 + 0.04 + i * 0.05, cr.z], rot: [0, 0.3 - i * 0.25, 0], scale: [1.1, 0.04, 0.16] }));
    for (let i = 0; i < 6; i++) s.add(part(geo.CYL, toon('#9aa0ad'), { pos: [cr.x + 0.25 - i * 0.07, cr.hy * 2 + 0.03, cr.z + 0.22], rot: [0, 0, 1.4], scale: [0.012, 0.12, 0.012], outline: 0 }));
    // tag board on the west wall: tag texts come from the host state
    const B = M.board;
    s.add(part(geo.BOX, toon('#3a2e26'), { pos: [B.x + 0.04, B.y, B.z0 + (B.n - 1) * B.dz / 2], scale: [0.04, 0.6, B.n * B.dz + 0.2], outline: 0.015 }));
    this.tagSlots = [];
    for (let i = 0; i < B.n; i++) {
      const c = document.createElement('canvas'); c.width = 256; c.height = 128;
      const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(0.36, 0.18), new THREE.MeshBasicMaterial({ map: tex, fog: true }));
      m.position.set(B.x + 0.07, B.y - (i % 2) * 0.12, B.z0 + i * B.dz);
      m.rotation.set(0, Math.PI / 2, (i % 3 - 1) * 0.08);
      s.add(m);
      this.tagSlots.push({ canvas: c, tex, mesh: m, text: undefined });
    }
    // outfit rack on the east wall: a rail with a little dummy torso per outfit
    const R = M.rack;
    s.add(part(geo.CYL, toon('#2a2230'), { pos: [R.x - 0.18, R.y + 0.4, R.z0 + (OUTFITS.length - 1) * R.dz / 2], rot: [Math.PI / 2, 0, 0], scale: [0.025, OUTFITS.length * R.dz + 0.3, 0.025], outline: 0 }));
    const look = {
      tux: ['#1e1a26', '#f2eee6'], sailor: ['#f2eee2', '#2c3e70'], clown: ['#f0c23a', '#d8433a'], gown: ['#6b3a7a', '#e9d9f0'], pajamas: ['#5d6f8c', '#e8e2d4'],
    };
    OUTFITS.forEach((o, i) => {
      const [a, b2] = look[o.id];
      const z = R.z0 + i * R.dz;
      s.add(part(geo.SPH, toon(a, { color2: b2, stripes: o.id === 'tux' || o.id === 'gown' ? 0 : 10, axis: o.id === 'clown' ? 1 : 0 }), { pos: [R.x - 0.2, R.y, z], scale: [0.12, 0.26, 0.2], outline: 0.012 }));
      s.add(part(geo.BOX, toon('#2a2230'), { pos: [R.x - 0.2, R.y + 0.3, z], scale: [0.02, 0.2, 0.02], outline: 0 }));
      if (o.id === 'gown') s.add(part(new THREE.ConeGeometry(0.22, 0.4, 10), toon(a), { pos: [R.x - 0.2, R.y - 0.36, z], outline: 0.012 }));
    });
    // hanging lamp
    s.add(part(geo.CYL, toon('#15111c'), { pos: [M.lamp[0], M.h - 0.3, M.lamp[1]], scale: [0.01, 0.6, 0.01], outline: 0 }));
    s.add(part(geo.SPH, toon('#ffd890', { emissive: 1 }), { pos: [M.lamp[0], M.h - 0.65, M.lamp[1]], scale: 0.1, outline: 0.01 }));
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.8), glowMat('#ffc070', 0.6));
    glow.position.set(M.lamp[0], M.h - 0.65, M.lamp[1]);
    s.add(glow);
    this.lampGlow = glow;
  }

  updateTags(tags) {
    (tags || []).forEach((t, i) => {
      const slot = this.tagSlots[i];
      if (!slot || slot.text === t) return;
      slot.text = t;
      slot.mesh.visible = !!t;
      if (!t) return;
      const x = slot.canvas.getContext('2d');
      x.fillStyle = '#e9dcc0'; x.fillRect(0, 0, 256, 128);
      x.strokeStyle = '#6a5440'; x.lineWidth = 8; x.strokeRect(4, 4, 248, 120);
      x.fillStyle = '#2a2236'; x.textAlign = 'center';
      const [first, ...rest] = t.split(' ');
      x.font = 'italic 34px Georgia, serif'; x.fillText(first, 128, 52, 236);
      x.font = 'bold 40px Georgia, serif'; x.fillText(rest.join(' '), 128, 100, 236);
      slot.tex.needsUpdate = true;
    });
  }

  // ---------- entities ----------
  setEntities(list, version) {
    const keep = new Set(list.map((d) => d.id));
    for (const [id, e] of this.ents) if (!keep.has(id)) { this.scene.remove(e.root); this.ents.delete(id); }
    this.order = list.map((d) => {
      let e = this.ents.get(d.id);
      const look = `${d.outfit}|${d.tag}|${d.lid}`;
      let keep = null;
      if (e && e.look !== look) { // changed clothes, got a tag, lid closed: rebuild in place
        keep = e.groups.map((g) => [g.position.clone(), g.quaternion.clone()]);
        this.scene.remove(e.root);
        e = null;
      }
      if (!e) {
        const groups = d.kind === 'coffin' ? buildCoffin(d.seed, d.lid) : d.kind === 'truck' ? buildTruck() : buildCharacter(d.kind, d.seed, d.color, d);
        const root = new THREE.Group();
        for (const g of groups) root.add(g);
        let shadow = null;
        if (d.kind !== 'truck') {
          shadow = new THREE.Mesh(this.shadowGeo, this.shadowMat);
          shadow.renderOrder = 1;
          root.add(shadow);
        }
        this.scene.add(root);
        e = { ...d, look, root, groups, shadow, fresh: !keep, tpos: groups.map(() => new THREE.Vector3()), tq: groups.map(() => new THREE.Quaternion()) };
        if (keep) keep.forEach(([p, q], i) => { if (groups[i]) { groups[i].position.copy(p); groups[i].quaternion.copy(q); e.tpos[i].copy(p); e.tq[i].copy(q); } });
        this.ents.set(d.id, e);
      }
      return e;
    });
    this.version = version;
  }

  setTransforms(buf, version, instant) {
    if (version !== this.version) return;
    let o = 0;
    for (const e of this.order) {
      for (let i = 0; i < e.groups.length; i++, o += 7) {
        e.tpos[i].set(buf[o], buf[o + 1], buf[o + 2]);
        e.tq[i].set(buf[o + 3], buf[o + 4], buf[o + 5], buf[o + 6]);
        if (instant || e.fresh) { e.groups[i].position.copy(e.tpos[i]); e.groups[i].quaternion.copy(e.tq[i]); }
      }
      e.fresh = false;
    }
  }

  setState(st) {
    this.state = st;
    for (const ev of st.ev || []) {
      if (ev.type === 'sfx') sfx(ev.name, ev.pos, this.camera.position);
      else if (ev.type === 'toast') this.toast(ev.text, ev.pos, ev.big);
    }
    st.plots.forEach(([d, f, b, seed, name], i) => {
      const v = this.plots[i];
      v.floor.position.y = -d - 1;
      const m = Math.min(1, d / PLOT_MAX_DEPTH) * (1 - f);
      v.mound.scale.set(0.45 + 0.3 * m, 0.02 + 0.55 * m, 0.8 + 0.45 * m);
      v.mound.visible = m > 0.02;
      v.fill.visible = f > 0.01;
      v.fill.position.y = -d + (d + 0.02) * f;
      this.groundMat.uniforms.uPlotState.value[i] = b;
      v.unrest = st.plots[i][5] || 0;
      if (b && v.seed !== seed) {
        if (v.stone) this.scene.remove(v.stone);
        v.stone = this.freshGrave(seed, name);
        v.stone.position.set(v.x, 0, v.z);
        this.scene.add(v.stone);
        v.seed = seed;
        v.stone.userData.born = this.time;
      } else if (!b && v.stone) {
        this.scene.remove(v.stone);
        v.stone = null;
        v.seed = -1;
      }
    });
    this.updateTags(st.tags);
    const pl = new Map(st.players.map((p) => [p.id, p]));
    for (const e of this.order) {
      if (e.kind === 'digger') {
        const p = pl.get(e.id);
        const sh = e.groups[P.farmR].userData.shovel;
        if (sh && p) sh.visible = p.dig;
      } else if (e.kind === 'truck') {
        const u = e.groups[0].userData;
        for (const w of u.wheels) w.rotation.z = st.truck[0];
        u.gate.userData.open = st.truck[1];
      }
    }
  }

  freshGrave(seed, name) {
    const g = new THREE.Group();
    const stone = buildHeadstone(['round', 'cross', 'slab'][seed % 3], 0.75, 1.1, seed);
    stone.position.z = -PLOT_HALF.z + 0.15;
    stone.rotation.z = ((seed % 7) - 3) * 0.03;
    g.add(stone);
    // name plate drawn in code onto a canvas
    const c = document.createElement('canvas');
    c.width = 256; c.height = 128;
    const x = c.getContext('2d');
    x.fillStyle = '#2a2638';
    x.textAlign = 'center';
    x.font = 'bold 34px Georgia, serif';
    x.fillText('R.I.P.', 128, 44);
    x.font = 'italic 24px Georgia, serif';
    x.fillText(name, 128, 88, 240);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    const plate = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.35), new THREE.MeshBasicMaterial({ map: tex, transparent: true, fog: true }));
    plate.position.set(0, 0.62, 0.105);
    stone.add(plate);
    g.add(part(geo.SPH, toon('#3f2c27', { color2: '#352420', stripes: 7 }), { pos: [0, 0, 0.1], scale: [0.6, 0.18, 1.2], outline: 0.03 }));
    return g;
  }

  // ---------- per-frame ----------
  frame(dt, look) {
    this.time += dt;
    this.sky.material.uniforms.uTime.value = this.time;
    const a = 1 - Math.exp(-dt * 16);
    for (const e of this.order) {
      for (let i = 0; i < e.groups.length; i++) {
        e.groups[i].position.lerp(e.tpos[i], a);
        e.groups[i].quaternion.slerp(e.tq[i], a);
      }
      if (e.shadow) {
        const c = e.groups[e.kind === 'coffin' ? 0 : P.pelvis].position;
        const gy = this.groundHeight(c.x, c.z);
        const hgt = Math.max(0, c.y - gy);
        e.shadow.position.set(c.x, gy + 0.015, c.z);
        const s = (e.kind === 'coffin' ? 0.75 : 0.45) * (1 + hgt * 0.15);
        e.shadow.scale.set(s, 1, e.kind === 'coffin' ? s * 1.6 : s);
        e.shadow.visible = hgt < 4;
      }
      if (e.kind === 'truck') {
        const gate = e.groups[0].userData.gate;
        gate.rotation.z += ((gate.userData.open ? -1.45 : 0) - gate.rotation.z) * a * 0.4;
      }
    }
    for (const p of this.plots) if (p.stone) {
      const k = Math.min(1, (this.time - p.stone.userData.born) / 0.5);
      p.stone.position.y = -1.2 * (1 - k) * (1 - k);
    }

    // third-person camera around my digger
    const me = this.ents.get(this.myId);
    if (me) {
      const chest = me.groups[P.chest].position;
      this.camTarget.lerp(new THREE.Vector3(chest.x, chest.y + 0.55, chest.z), 1 - Math.exp(-dt * 12));
      const cp = Math.cos(look.pitch), dir = new THREE.Vector3(Math.sin(look.yaw) * cp, -Math.sin(look.pitch), Math.cos(look.yaw) * cp);
      // pull the camera in if the truck is between it and the player
      const truck = this.order.find((e) => e.kind === 'truck');
      const indoors = insideMorgue(chest.x, chest.z);
      this.roof.visible = !indoors;
      let dist = 4.6;
      const pos = new THREE.Vector3();
      for (let d = 0.8; d <= 4.6; d += 0.2) {
        pos.copy(this.camTarget).addScaledVector(dir, -d);
        if (truck) {
          const t = truck.groups[0].position;
          if (Math.abs(pos.x - t.x) < 3.3 && Math.abs(pos.z - t.z) < 1.35 && pos.y < 2.7) { dist = Math.max(0.8, d - 0.3); break; }
        }
        // indoors the camera stays inside the walls (and under where the roof would be)
        if (indoors && (!insideMorgue(pos.x, pos.z, 0.25) || pos.y > MORGUE.h + 1.2)) { dist = Math.max(0.8, d - 0.2); break; }
        // outdoors it must not end up inside the building either
        if (!indoors && insideMorgue(pos.x, pos.z, -0.2) && pos.y < MORGUE.h + 1) { dist = Math.max(0.8, d - 0.2); break; }
      }
      pos.copy(this.camTarget).addScaledVector(dir, -dist);
      pos.y = Math.max(pos.y, this.groundHeight(pos.x, pos.z) + 0.35);
      this.camera.position.copy(pos);
      this.camera.lookAt(this.camTarget);
    } else {
      const t = this.time * 0.05;
      this.camera.position.set(Math.sin(t) * 16, 6.5, 6 + Math.cos(t) * 16);
      this.camera.lookAt(0, 0.5, 4);
    }
    for (const b of this.billboards) b.quaternion.copy(this.camera.quaternion);
    if (this.lampGlow) this.lampGlow.quaternion.copy(this.camera.quaternion);
    for (const e of this.order) if (e.kind === 'truck') e.root.traverse((o) => { if (o.userData.billboard) o.quaternion.copy(this.camera.quaternion); });
    this.sky.position.copy(this.camera.position);
    this.renderer.render(this.scene, this.camera);
    this.updateLabels();
  }

  groundHeight(x, z) {
    for (let i = 0; i < PLOTS.length; i++) {
      const p = PLOTS[i];
      if (Math.abs(x - p.x) < PLOT_HALF.x && Math.abs(z - p.z) < PLOT_HALF.z) return this.plots[i].floor.position.y + 1;
    }
    return 0;
  }

  updateLabels() {
    if (!this.state || !this.labels) return;
    const seen = new Set();
    for (const p of this.state.players) {
      if (p.id === this.myId) continue;
      const e = this.ents.get(p.id);
      if (!e) continue;
      seen.add(p.id);
      let el = this.labels.querySelector(`[data-id="${p.id}"]`);
      if (!el) {
        el = document.createElement('div');
        el.className = 'nametag';
        el.dataset.id = p.id;
        this.labels.appendChild(el);
      }
      el.textContent = p.name;
      el.style.borderColor = p.color;
      const v = e.groups[P.head].position.clone().add(new THREE.Vector3(0, 0.75, 0)).project(this.camera);
      el.style.display = v.z < 1 ? '' : 'none';
      el.style.transform = `translate(-50%, -50%) translate(${(v.x * 0.5 + 0.5) * innerWidth}px, ${(-v.y * 0.5 + 0.5) * innerHeight}px)`;
    }
    for (const el of [...this.labels.querySelectorAll('.nametag')]) if (!seen.has(+el.dataset.id)) el.remove();
  }

  toast(text, pos, big) {
    const el = document.createElement('div');
    el.className = 'toast' + (big ? ' big' : '');
    el.textContent = text;
    this.labels.appendChild(el);
    const p = new THREE.Vector3(...pos), born = performance.now();
    const tick = () => {
      const k = (performance.now() - born) / 1800;
      if (k >= 1) { el.remove(); return; }
      const v = p.clone().add(new THREE.Vector3(0, k * 0.8, 0)).project(this.camera);
      el.style.opacity = String(Math.min(1, (1 - k) * 2.5));
      el.style.display = v.z < 1 ? '' : 'none';
      el.style.transform = `translate(-50%, -50%) translate(${(v.x * 0.5 + 0.5) * innerWidth}px, ${(-v.y * 0.5 + 0.5) * innerHeight}px)`;
      requestAnimationFrame(tick);
    };
    tick();
  }
}

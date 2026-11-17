import * as THREE from 'three';
import { createSky } from '../shaders/sky.js';
import { buildCharacter, buildCoffin, buildTruck } from './models.js';
import { buildWorld } from './world.js';
import { createGraves } from './graves.js';
import { PLOTS, PLOT_HALF } from '../shared/layout.js';
import { P } from '../shared/skeleton.js';
import { sfx } from '../audio.js';

const _q = new THREE.Quaternion();

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
    this.world = buildWorld(this.scene);
    this.groundMat = this.world.groundMat;
    this.graves = createGraves(this.scene, this.groundMat);
    // anything flagged userData.billboard faces the camera every frame
    this.billboards = [];
    this.scene.traverse((o) => { if (o.userData.billboard) this.billboards.push(o); });
    // blob shadows pool
    this.shadowGeo = new THREE.CircleGeometry(1, 20).rotateX(-Math.PI / 2);
    this.shadowMat = new THREE.MeshBasicMaterial({ color: '#0b0812', transparent: true, opacity: 0.45, depthWrite: false, fog: true });
    // Debug: set view.debugCam = { p: [x, y, z], t: [x, y, z] } to override the camera (screenshots, tuning).
    this.debugCam = null;
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

  // ---------- entities ----------
  setEntities(list, version) {
    const keep = new Set(list.map((d) => d.id));
    for (const [id, e] of this.ents) if (!keep.has(id)) {
      this.scene.remove(e.root);
      this.ents.delete(id);
      this.billboards = this.billboards.filter((b) => !e.billboards.includes(b));
    }
    this.order = list.map((d) => {
      let e = this.ents.get(d.id);
      if (!e) {
        const groups = d.kind === 'coffin' ? buildCoffin(d.seed) : d.kind === 'truck' ? buildTruck() : buildCharacter(d.kind, d.seed, d.color);
        const root = new THREE.Group();
        for (const g of groups) root.add(g);
        let shadow = null;
        if (d.kind !== 'truck') {
          shadow = new THREE.Mesh(this.shadowGeo, this.shadowMat);
          shadow.renderOrder = 1;
          root.add(shadow);
        }
        this.scene.add(root);
        const billboards = [];
        root.traverse((o) => { if (o.userData.billboard) billboards.push(o); });
        this.billboards.push(...billboards);
        e = { ...d, root, groups, shadow, billboards, fresh: true, tpos: groups.map(() => new THREE.Vector3()), tq: groups.map(() => new THREE.Quaternion()) };
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
      this.graves.setPlot(i, d, f, b, seed, name, this.time);
      this.groundMat.uniforms.uPlotState.value[i] = b;
    });
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
    this.graves.update(this.time);

    // third-person camera around my digger
    const me = this.ents.get(this.myId);
    if (me) {
      const chest = me.groups[P.chest].position;
      this.camTarget.lerp(new THREE.Vector3(chest.x, chest.y + 0.55, chest.z), 1 - Math.exp(-dt * 12));
      const cp = Math.cos(look.pitch), dir = new THREE.Vector3(Math.sin(look.yaw) * cp, -Math.sin(look.pitch), Math.cos(look.yaw) * cp);
      // pull the camera in if the truck is between it and the player
      const truck = this.order.find((e) => e.kind === 'truck');
      let dist = 4.6;
      const pos = new THREE.Vector3();
      for (let d = 0.8; d <= 4.6; d += 0.2) {
        pos.copy(this.camTarget).addScaledVector(dir, -d);
        if (truck) {
          const t = truck.groups[0].position;
          if (Math.abs(pos.x - t.x) < 3.3 && Math.abs(pos.z - t.z) < 1.35 && pos.y < 2.7) { dist = Math.max(0.8, d - 0.3); break; }
        }
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
    if (this.debugCam) {
      this.camera.position.set(...this.debugCam.p);
      this.camera.lookAt(...this.debugCam.t);
    }
    this.world.update(this.time, dt, this.camera);
    // billboards may sit inside rotated parents (the truck), so set their world orientation
    for (const b of this.billboards) {
      b.quaternion.copy(this.camera.quaternion);
      if (b.parent) b.quaternion.premultiply(b.parent.getWorldQuaternion(_q).invert());
    }
    this.sky.position.copy(this.camera.position);
    this.renderer.render(this.scene, this.camera);
    this.updateLabels();
  }

  groundHeight(x, z) {
    for (let i = 0; i < PLOTS.length; i++) {
      const p = PLOTS[i];
      if (Math.abs(x - p.x) < PLOT_HALF.x && Math.abs(z - p.z) < PLOT_HALF.z) return this.graves.floorTop(i);
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

import * as THREE from 'three';
import { createSky } from '../shaders/sky.js';
import { buildCoffin, buildTruck } from './models.js';
import { buildWorld } from './world.js';
import { createGraves } from './graves.js';
import { PLOTS, PLOT_HALF } from '../shared/layout.js';
import { CP, crewRig } from '../shared/crew.js';
import { zombieRig } from '../shared/zombies.js';
import { corpseRig } from '../shared/corpses.js';
import { buildCrew } from './crew.js';
import { sfx } from '../audio.js';
import { isTouchDevice } from '../touch.js';
import { Post } from './post.js';
import { DAY, day3, dayColor } from '../shaders/toon.js';

// Fog and sky horizon share this color (sRGB): a dark saturated violet, so distance reads as depth, not milk.
// FogExp2 at 0.0145 gives about 16% fog at 30 m, 50% at 57 m and 95% at 120 m.
const FOG_COLOR = '#2a2344';
const FOG_DENSITY = 0.0145;
// Day/night keys [night, dusk, day] for setDay; the night entries are the look above.
const FOG_DAY = [FOG_COLOR, '#7a4a66', '#eed6c2'], FOG_DENSITY_DAY = [FOG_DENSITY, 0.0125, 0.0062];
const SHADOW_DAY = ['#07040d', '#1a0c22', '#2a1f3c'];

const _q = new THREE.Quaternion(), _rgb = { r: 0, g: 0, b: 0 };

export class View {
  constructor(container) {
    // post quality: ?post=high|low|off overrides; phones get the light pipeline
    const q = new URLSearchParams(location.search).get('post');
    const quality = ['high', 'low', 'off'].includes(q) ? q : isTouchDevice() ? 'low' : 'high';
    // with post on, MSAA lives in the scene render target, so the canvas itself needs none
    const r = (this.renderer = new THREE.WebGLRenderer({ antialias: quality === 'off' }));
    r.setPixelRatio(Math.min(devicePixelRatio, 2));
    r.setSize(innerWidth, innerHeight);
    r.outputColorSpace = THREE.SRGBColorSpace;
    // several render calls per frame: reset the stats once per frame so info reports the whole frame
    r.info.autoReset = false;
    container.appendChild(r.domElement);
    this.post = new Post(r, quality);
    this.scene = new THREE.Scene();
    // The fog color is an ordinary sRGB color: three.js converts the uniform to whatever space the fog is mixed in
    // (sRGB on the canvas, linear in the post render target), and the sky decodes the same value exactly at the
    // horizon, so the horizon line disappears in both paths. See post.js for the full note.
    const fogColor = new THREE.Color(FOG_COLOR);
    this.scene.fog = new THREE.FogExp2(fogColor, FOG_DENSITY);
    this.camera = new THREE.PerspectiveCamera(62, innerWidth / innerHeight, 0.1, 1200);
    this.camera.position.set(8, 6, 18);
    this.camera.lookAt(0, 0, 3);
    this.sky = createSky(fogColor);
    this.scene.add(this.sky);
    this.world = buildWorld(this.scene);
    this.groundMat = this.world.groundMat;
    this.graves = createGraves(this.scene, this.groundMat);
    // anything flagged userData.billboard faces the camera every frame
    this.billboards = [];
    this.scene.traverse((o) => { if (o.userData.billboard) this.billboards.push(o); });
    // blob shadows pool
    // soft blob shadows: dark core plus a wide penumbra; scale.y (unused by the flat quad) carries the fade,
    // and fog thins the shadow instead of tinting it, so far shadows do not turn into violet discs
    this.shadowGeo = new THREE.PlaneGeometry(2, 2).rotateX(-Math.PI / 2);
    this.shadowMat = new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { uColor: { value: new THREE.Color('#07040d') }, uOpacity: { value: 0.62 } }]),
      vertexShader: /* glsl */ `
        varying vec2 vUv; varying float vFade;
        #include <common>
        #include <fog_pars_vertex>
        void main() {
          vUv = uv * 2.0 - 1.0;
          vFade = length(modelMatrix[1].xyz);
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          #include <fog_vertex>
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor; uniform float uOpacity;
        varying vec2 vUv; varying float vFade;
        #include <common>
        #include <fog_pars_fragment>
        void main() {
          float r = length(vUv);
          float a = (pow(1.0 - smoothstep(0.0, 1.0, r), 1.7) * 0.65 + (1.0 - smoothstep(0.1, 0.55, r)) * 0.35) * uOpacity * vFade;
          #ifdef USE_FOG
            #ifdef FOG_EXP2
              a *= exp(-fogDensity * fogDensity * vFogDepth * vFogDepth);
            #else
              a *= 1.0 - smoothstep(fogNear, fogFar, vFogDepth);
            #endif
          #endif
          gl_FragColor = vec4(uColor, a);
          #include <colorspace_fragment>
        }`,
      transparent: true, depthWrite: false, fog: true,
      polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1,
    });
    // puffs: lumpy little clouds that swell and fade where a zombie crumbles (0), a shovel lands (1) or the ground breaks (2)
    this.puffs = Array.from({ length: 10 }, () => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.ShaderMaterial({
        uniforms: { uColor: { value: new THREE.Color() }, uT: { value: 0 } },
        vertexShader: 'varying vec2 vUv; void main(){ vUv = uv * 2.0 - 1.0; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
        fragmentShader: /* glsl */ `uniform vec3 uColor; uniform float uT; varying vec2 vUv;
          void main(){ float r = length(vUv), a = atan(vUv.y, vUv.x), edge = 0.8 + 0.13 * sin(a * 7.0 + uT * 4.0) + 0.05 * sin(a * 13.0);
            float al = smoothstep(edge, edge - 0.22, r) * smoothstep(uT * 1.25 - 0.45, uT * 1.25, r + 0.45 * (1.0 - uT)) * (1.0 - uT * uT) * 0.85;
            if (al < 0.01) discard; gl_FragColor = vec4(uColor, al);
            #include <colorspace_fragment>
          }`,
        transparent: true, depthWrite: false,
      }));
      m.visible = false; m.renderOrder = 3; m.userData.billboard = true;
      this.scene.add(m);
      this.billboards.push(m);
      return m;
    });
    // Debug: set view.debugCam = { p: [x, y, z], t: [x, y, z] } to override the camera (screenshots, tuning).
    this.debugCam = null;
    this.ents = new Map();
    this.order = [];
    this.version = -1;
    this.state = null;
    this.myId = 0;
    // first-person camera for the local digger (toggled from main.js); falls back to third person while ragdolled
    this.firstPerson = true;
    this.eye = new THREE.Vector3();
    this.eyeFresh = true;
    this.camTarget = new THREE.Vector3(0, 1.5, 6);
    this.time = 0;
    this.labels = document.getElementById('labels');
    addEventListener('resize', () => {
      this.camera.aspect = innerWidth / innerHeight;
      this.camera.updateProjectionMatrix();
      r.setSize(innerWidth, innerHeight);
    });
    // ?day=0..1 previews the day/night look (0 = night, the default)
    const dq = new URLSearchParams(location.search).get('day');
    if (dq !== null) this.setDay(Number(dq));
  }

  // ---------- day/night (visual only) ----------
  // k: 0 deep night (the default look) .. 0.5 dusk/dawn .. 1 full day. Sets the shared uDay uniform (toon.js) and
  // everything that is not a plain uniform read: fog + sky horizon (kept equal), glows, backdrop, post, blob shadows.
  setDay(k) {
    k = Math.min(1, Math.max(0, Number(k) || 0));
    DAY.value = k;
    const fog = this.scene.fog;
    dayColor(FOG_DAY, k, fog.color);
    fog.density = day3(...FOG_DENSITY_DAY, k);
    const hz = fog.color.getRGB(_rgb, THREE.SRGBColorSpace);
    this.sky.material.uniforms.uHorizon.value.set(hz.r, hz.g, hz.b);
    this.world.setDay(k);
    this.post.setDay(k);
    dayColor(SHADOW_DAY, k, this.shadowMat.uniforms.uColor.value);
    this.shadowMat.uniforms.uOpacity.value = day3(0.62, 0.56, 0.5, k);
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
        // every character is six frames plus one low-poly mesh sculpted from its formulas; coffins and the truck are hand-built meshes
        const crew = d.kind === 'digger' ? buildCrew(crewRig(d.look), { shovel: true }) : d.kind === 'zombie' ? buildCrew(zombieRig(d.look))
          : d.kind === 'corpse' ? buildCrew(corpseRig(d.seed), { q: 0.64 }) : null;
        const groups = crew ? crew.groups : d.kind === 'coffin' ? buildCoffin(d.seed) : buildTruck();
        const root = new THREE.Group();
        for (const g of groups) root.add(g);
        if (crew) root.add(crew.mesh);
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
        e = { ...d, root, groups, crew, shadow, billboards, fresh: true, tpos: groups.map(() => new THREE.Vector3()), tq: groups.map(() => new THREE.Quaternion()) };
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
      else if (ev.type === 'puff') this.puff(ev.pos, ev.kind);
    }
    st.plots.forEach(([d, f, b, seed, name], i) => {
      this.graves.setPlot(i, d, f, b, seed, name, this.time);
      this.groundMat.uniforms.uPlotState.value[i] = b;
    });
    const pl = new Map(st.players.map((p) => [p.id, p])), risen = new Set(st.risen || []);
    for (const e of this.order) {
      if (e.kind === 'corpse') { const up = risen.has(e.id); if (up !== e.up) { e.up = up; e.crew.setRisen(up); } }
      if (e.kind === 'digger') {
        const p = pl.get(e.id);
        const sh = e.groups[CP.armR].userData.shovel;
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
    this.renderer.info.reset();
    this.sky.material.uniforms.uTime.value = this.time;
    const a = 1 - Math.exp(-dt * 16);
    const me = this.ents.get(this.myId);
    const meState = me && this.state ? this.state.players.find((p) => p.id === this.myId) : null;
    // first person while on your feet; a ragdolled digger falls back to the third-person view so you see the flop
    const fp = !!(me && this.firstPerson && !meState?.rag);
    const fov = fp ? 74 : 62;
    if (this.camera.fov !== fov) { this.camera.fov = fov; this.camera.updateProjectionMatrix(); }
    for (const e of this.order) {
      for (let i = 0; i < e.groups.length; i++) {
        e.groups[i].position.lerp(e.tpos[i], a);
        e.groups[i].quaternion.slerp(e.tq[i], a);
      }
      // your own head and hat would fill the screen in first person, so that body is drawn without them
      if (e.crew) e.crew.update(e === me && fp && !this.debugCam);
      if (e.shadow) {
        const c = e.groups[0].position; // coffin, pelvis or belly
        const gy = this.groundHeight(c.x, c.z);
        const hgt = Math.max(0, c.y - gy);
        e.shadow.position.set(c.x, gy + 0.015, c.z);
        const s = (e.kind === 'coffin' ? 0.95 : e.crew ? e.crew.rig.belly * 2.1 : 0.6) * (1 + hgt * 0.25);
        e.shadow.scale.set(s, Math.max(0.001, 1 / (1 + hgt * 0.8)), e.kind === 'coffin' ? s * 1.55 : s);
        e.shadow.visible = hgt < 4;
      }
      if (e.kind === 'truck') {
        const gate = e.groups[0].userData.gate;
        gate.rotation.z += ((gate.userData.open ? -1.45 : 0) - gate.rotation.z) * a * 0.4;
      }
    }
    this.graves.update(this.time);
    for (const m of this.puffs) {
      if (!m.visible) continue;
      const t = (m.material.uniforms.uT.value += dt / 0.6);
      m.scale.setScalar(m.userData.size * (0.35 + 0.65 * (1 - (1 - t) * (1 - t))));
      if (t >= 1) m.visible = false;
    }

    if (fp) {
      // eye in the head, nudged forward so the near plane clears the face; smoothed so ragdoll jitter and the
      // walk cycle give a gentle bob instead of a shake
      const head = me.groups[CP.head].position;
      const fx = Math.sin(look.yaw), fz = Math.cos(look.yaw);
      this.eye.set(head.x + fx * 0.14, head.y + 0.06, head.z + fz * 0.14);
      if (this.eyeFresh) { this.camTarget.copy(this.eye); this.eyeFresh = false; }
      this.camTarget.lerp(this.eye, 1 - Math.exp(-dt * 22));
      const cp = Math.cos(look.pitch), dir = new THREE.Vector3(fx * cp, -Math.sin(look.pitch), fz * cp);
      this.camera.position.copy(this.camTarget);
      this.camera.lookAt(this.camTarget.x + dir.x, this.camTarget.y + dir.y, this.camTarget.z + dir.z);
    } else if (me) {
      // third-person camera around my digger
      if (!this.eyeFresh) { this.eyeFresh = true; this.camTarget.copy(me.groups[CP.body].position); }
      const chest = me.groups[CP.body].position;
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
    this.post.render(this.scene, this.camera, this.time);
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
      const v = e.groups[CP.head].position.clone().add(new THREE.Vector3(0, e.crew.rig.hatTop + 0.3, 0)).project(this.camera);
      el.style.display = v.z < 1 ? '' : 'none';
      el.style.transform = `translate(-50%, -50%) translate(${(v.x * 0.5 + 0.5) * innerWidth}px, ${(-v.y * 0.5 + 0.5) * innerHeight}px)`;
    }
    for (const el of [...this.labels.querySelectorAll('.nametag')]) if (!seen.has(+el.dataset.id)) el.remove();
  }

  puff(pos, kind) {
    const m = this.puffs.find((p) => !p.visible) || this.puffs[0];
    m.material.uniforms.uColor.value.set(['#b9d68a', '#fff3c8', '#7a5f4a'][kind] || '#ffffff');
    m.material.uniforms.uT.value = 0;
    m.userData.size = [2.2, 1.5, 1.6][kind] || 1.5;
    m.position.set(pos[0], pos[1], pos[2]);
    m.visible = true;
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

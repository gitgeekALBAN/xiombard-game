import * as CANNON from 'cannon-es';
import * as THREE from 'three';
import { PARTS, NPARTS, P, fk, restRots, limpRots } from '../shared/skeleton.js';
import { CREW, NCREW, crewRig, crewPose } from '../shared/crew.js';
import {
  PLOTS, PLOT_HALF, PLOT_MAX_DEPTH, PLOT_MIN_DEPTH, COFFIN, TRUCK, TRUCK_STOP_X, TRUCK_START_X,
  ROAD_Z, PILE, SPAWN, staticBoxes, plotAt,
} from '../shared/layout.js';
import { rng, corpseName } from '../shared/rng.js';

// Host-authoritative simulation. Only the host runs this; clients render its snapshots.
const G_GROUND = 1, G_PLAYER = 2, G_PROP = 4, G_TRUCK = 8;
// Each player gets its own collision bit (bits 4..9) so whatever they carry can pass through them
// instead of wedging against their legs.
const PLAYER_BITS = 0x3f0;
const ALL = G_GROUND | G_PROP | G_TRUCK | PLAYER_BITS;
const STEP = 1 / 60;
const CORPSE_MASS = 30, DIGGER_RAG_MASS = 45;
const MAX_CORPSES = 9;
const TRUCK_SPAWN_X = TRUCK_START_X - 25; // where a load appears on the road: inside the |x| < 45 cleanup bounds
// Coffins are held low by one end: one digger drags it, two diggers carry it level.
const COFFIN_HOLD_Y = 0.55;
// Grip strength in newtons. cannon-es clamps constraint *impulse per step*, so these are multiplied by STEP.
// Strong enough to feel snappy, weak enough that nothing gets launched. Coffins are held low, so they are dragged, not lifted.
const CORPSE_GRIP_N = 1400, COFFIN_GRIP_N = 1100;
const CORPSE_HOLD_Y = 1.3;

const v3 = (a) => new CANNON.Vec3(a[0], a[1], a[2]);
const PARTS_OF = { digger: NCREW, corpse: NPARTS, coffin: 1, truck: 1 };

export class Sim {
  constructor() {
    const w = (this.world = new CANNON.World({ gravity: new CANNON.Vec3(0, -9.82, 0) }));
    w.broadphase = new CANNON.SAPBroadphase(w);
    w.allowSleep = true;
    w.solver.iterations = 14;
    this.mGround = new CANNON.Material('ground');
    this.mPlayer = new CANNON.Material('player');
    this.mProp = new CANNON.Material('prop');
    const cm = (a, b, friction, restitution) => w.addContactMaterial(new CANNON.ContactMaterial(a, b, { friction, restitution }));
    cm(this.mPlayer, this.mGround, 0, 0);
    cm(this.mPlayer, this.mProp, 0, 0);
    cm(this.mPlayer, this.mPlayer, 0, 0);
    cm(this.mProp, this.mGround, 0.55, 0.05);
    cm(this.mProp, this.mProp, 0.45, 0.02);

    this.ents = [];
    this.restores = [];
    this.nextId = 1;
    this.version = 0;
    this.events = [];
    this.time = 0;
    this.acc = 0;
    this.score = 0;
    this.seedCounter = 1;
    this.rand = rng(Date.now() & 0xffff);
    this._ray = new CANNON.RaycastResult();
    this._pose = { speed: 0, phase: 0, t: 0, carry: null, dig: false, air: false };
    this._root = new THREE.Matrix4();

    for (const b of staticBoxes()) {
      const body = new CANNON.Body({ mass: 0, material: this.mGround, collisionFilterGroup: G_GROUND, collisionFilterMask: ALL });
      body.addShape(new CANNON.Box(v3(b.h)));
      body.position.set(...b.c);
      if (b.ry) body.quaternion.setFromEuler(0, b.ry, 0);
      w.addBody(body);
    }

    this.plots = PLOTS.map((p, i) => {
      const floor = new CANNON.Body({ mass: 0, material: this.mGround, collisionFilterGroup: G_GROUND, collisionFilterMask: ALL });
      floor.addShape(new CANNON.Box(new CANNON.Vec3(PLOT_HALF.x, 1, PLOT_HALF.z)));
      floor.position.set(p.x, -1, p.z);
      w.addBody(floor);
      return { i, x: p.x, z: p.z, depth: 0, fill: 0, buried: false, buriedAt: 0, name: '', seed: 0, floor, digSfx: 0 };
    });

    this.truck = this.spawnTruck();
    for (let i = 0; i < 3; i++) this.spawnCoffin(PILE.x, 0.1, PILE.z + (i - 1) * 1.35, Math.PI / 2); // side by side, not overlapping
    this.spawnLoad(3);
  }

  // ---------- entities ----------
  addEnt(e) {
    e.id = this.nextId++;
    e.xf = new Float32Array(PARTS_OF[e.kind] * 7);
    this.ents.push(e);
    this.version++;
    return e;
  }
  removeEnt(e) {
    const bodies = this.bodiesOf(e);
    this.releaseGrabsOn(new Set(bodies));
    for (const c of e.constraints || []) this.world.removeConstraint(c);
    for (const b of bodies) this.world.removeBody(b);
    if (e.kind === 'digger') {
      if (e.body) this.world.removeBody(e.body);
      this.world.removeBody(e.hand);
    }
    this.ents.splice(this.ents.indexOf(e), 1);
    this.version++;
  }
  bodiesOf(e) {
    if (e.kind === 'digger') return e.rag ? e.rag.bodies : [];
    if (e.kind === 'corpse') return e.bodies;
    if (e.kind === 'coffin') return [e.body];
    return [];
  }
  byId(id) { return this.ents.find((e) => e.id === id); }
  describe() {
    return this.ents.map((e) => ({ id: e.id, kind: e.kind, seed: e.seed || 0, color: e.color || '', name: e.name || '', look: e.look ?? -1 }));
  }
  emit(type, data) { this.events.push({ type, ...data }); }

  makeRagdoll(xf, mass) {
    const bodies = [], constraints = [];
    for (let i = 0; i < NPARTS; i++) {
      const part = PARTS[i], o = i * 7;
      const b = new CANNON.Body({
        mass: part.mass * mass, material: this.mProp, linearDamping: 0.08, angularDamping: 0.35,
        collisionFilterGroup: G_PROP, collisionFilterMask: ALL,
      });
      b.addShape(part.r ? new CANNON.Sphere(part.r) : new CANNON.Box(new CANNON.Vec3(part.size[0] / 2, part.size[1] / 2, part.size[2] / 2)));
      b.position.set(xf[o], xf[o + 1], xf[o + 2]);
      b.quaternion.set(xf[o + 3], xf[o + 4], xf[o + 5], xf[o + 6]);
      b.sleepSpeedLimit = 0.25;
      b.sleepTimeLimit = 1.2;
      b.partIndex = i;
      b.grabR = part.r ? 0.25 : 0.12;
      this.world.addBody(b);
      bodies.push(b);
    }
    for (let i = 1; i < NPARTS; i++) {
      const part = PARTS[i], par = PARTS[part.parent];
      const axis = part.up ? new CANNON.Vec3(0, 1, 0) : new CANNON.Vec3(0, -1, 0);
      const c = new CANNON.ConeTwistConstraint(bodies[part.parent], bodies[i], {
        pivotA: new CANNON.Vec3(part.j[0] - par.c[0], part.j[1] - par.c[1], part.j[2] - par.c[2]),
        pivotB: new CANNON.Vec3(part.j[0] - part.c[0], part.j[1] - part.c[1], part.j[2] - part.c[2]),
        axisA: axis, axisB: axis.clone(), angle: part.cone, twistAngle: 0.45, collideConnected: false,
      });
      this.world.addConstraint(c);
      constraints.push(c);
    }
    return { bodies, constraints };
  }

  // A digger gone limp: six bodies hanging off the belly by five cone joints (sizes come from the crew sheet).
  makeCrewRagdoll(rig, xf, mass) {
    const bodies = [], constraints = [], up = new CANNON.Vec3(0, 1, 0);
    for (let i = 0; i < NCREW; i++) {
      const sh = rig.shapes[i], o = i * 7;
      const b = new CANNON.Body({
        mass: sh.mass * mass, material: this.mProp, linearDamping: 0.08, angularDamping: 0.4,
        collisionFilterGroup: G_PROP, collisionFilterMask: ALL,
      });
      for (const [x, y, z, r] of sh.spheres || []) b.addShape(new CANNON.Sphere(r), new CANNON.Vec3(x, y, z));
      // limb boxes run along the limb: arms rest at an angle, so the box is turned to match
      if (sh.box) b.addShape(new CANNON.Box(v3(sh.box)), new CANNON.Vec3(), sh.dir ? new CANNON.Quaternion().setFromVectors(up, v3(sh.dir)) : undefined);
      b.position.set(xf[o], xf[o + 1], xf[o + 2]);
      b.quaternion.set(xf[o + 3], xf[o + 4], xf[o + 5], xf[o + 6]);
      b.sleepSpeedLimit = 0.25;
      b.sleepTimeLimit = 1.2;
      b.partIndex = i;
      b.grabR = sh.grabR || 0.12;
      this.world.addBody(b);
      bodies.push(b);
    }
    for (let i = 1; i < NCREW; i++) {
      const j = rig.pivot[i], a = rig.rest[0], c = rig.rest[i], lim = rig.joints[i];
      const axis = new CANNON.Vec3(0, lim.up ? 1 : -1, 0);
      const con = new CANNON.ConeTwistConstraint(bodies[0], bodies[i], {
        pivotA: new CANNON.Vec3(j.x - a.x, j.y - a.y, j.z - a.z), pivotB: new CANNON.Vec3(j.x - c.x, j.y - c.y, j.z - c.z),
        axisA: axis, axisB: axis.clone(), angle: lim.cone, twistAngle: 0.4, collideConnected: false,
      });
      this.world.addConstraint(con);
      constraints.push(con);
    }
    return { bodies, constraints };
  }

  spawnCorpse(root, rots, seed) {
    const xf = fk(root, rots, new Float32Array(NPARTS * 7));
    const { bodies, constraints } = this.makeRagdoll(xf, CORPSE_MASS);
    const e = this.addEnt({ kind: 'corpse', seed, bodies, constraints, name: corpseName(seed), slip: 0.8 + rng(seed)() * 0.7 });
    for (const b of bodies) b.ent = e;
    return e;
  }

  spawnLoad(n) {
    const t = this.truck.body.position;
    for (let i = 0; i < n; i++) {
      const seed = this.seedCounter++ * 977 + Math.floor(this.rand() * 1000);
      const layer = Math.floor(i / 2), side = i % 2 ? 0.45 : -0.45;
      const m = new THREE.Matrix4().makeTranslation(t.x + 2.75, TRUCK.bed.top + 0.3 + layer * 0.6, t.z + side)
        .multiply(new THREE.Matrix4().makeRotationY(Math.PI / 2))
        .multiply(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
      this.spawnCorpse(m, limpRots(rng(seed)), seed);
    }
  }

  spawnCoffin(x, y, z, yaw = Math.PI / 2 + (this.rand() - 0.5) * 0.4) {
    const { hx, hy, hz, wall } = COFFIN;
    const b = new CANNON.Body({ mass: 25, material: this.mProp, linearDamping: 0.05, angularDamping: 0.25, collisionFilterGroup: G_PROP, collisionFilterMask: ALL });
    b.addShape(new CANNON.Box(new CANNON.Vec3(hx, 0.04, hz)), new CANNON.Vec3(0, -hy + 0.04, 0));
    b.addShape(new CANNON.Box(new CANNON.Vec3(wall, hy, hz)), new CANNON.Vec3(hx - wall, 0, 0));
    b.addShape(new CANNON.Box(new CANNON.Vec3(wall, hy, hz)), new CANNON.Vec3(-hx + wall, 0, 0));
    b.addShape(new CANNON.Box(new CANNON.Vec3(hx, hy, wall)), new CANNON.Vec3(0, 0, hz - wall));
    b.addShape(new CANNON.Box(new CANNON.Vec3(hx, hy, wall)), new CANNON.Vec3(0, 0, -hz + wall));
    b.position.set(x, y + hy, z);
    b.quaternion.setFromEuler(0, yaw, 0);
    b.sleepSpeedLimit = 0.2;
    this.world.addBody(b);
    const e = this.addEnt({ kind: 'coffin', body: b, seed: this.seedCounter++ });
    b.ent = e;
    return e;
  }

  spawnTruck() {
    // kinematic bodies fall asleep while parked and then ignore their velocity, so the truck must never sleep
    const b = new CANNON.Body({ mass: 0, type: CANNON.Body.KINEMATIC, material: this.mGround, collisionFilterGroup: G_TRUCK, collisionFilterMask: ALL, allowSleep: false });
    for (const box of TRUCK.boxes) b.addShape(new CANNON.Box(v3(box.h)), v3(box.c));
    b.position.set(TRUCK_SPAWN_X, 0, ROAD_Z);
    this.world.addBody(b);
    const e = this.addEnt({ kind: 'truck', body: b });
    // Invisible cage around the bed, solid only while the truck drives in, so the load arrives on board.
    const cage = new CANNON.Body({ mass: 0, type: CANNON.Body.KINEMATIC, material: this.mGround, collisionFilterGroup: G_TRUCK, collisionFilterMask: G_PROP, allowSleep: false });
    cage.addShape(new CANNON.Box(new CANNON.Vec3(0.05, 1.0, 1.0)), new CANNON.Vec3(TRUCK.bed.x1 + 0.05, 1.9, 0));
    cage.addShape(new CANNON.Box(new CANNON.Vec3(1.8, 0.9, 0.05)), new CANNON.Vec3(1.2, 2.04, 0.95));
    cage.addShape(new CANNON.Box(new CANNON.Vec3(1.8, 0.9, 0.05)), new CANNON.Vec3(1.2, 2.04, -0.95));
    cage.addShape(new CANNON.Box(new CANNON.Vec3(1.8, 0.05, 1.0)), new CANNON.Vec3(1.2, 2.95, 0));
    cage.position.copy(b.position);
    this.world.addBody(cage);
    return { ent: e, body: b, cage, state: 'arrive', t: 0, wheel: 0, loads: 1 };
  }

  // ---------- players ----------
  addPlayer(name) {
    // every digger is one of the crew: the first free look, so a full team never has twins
    const used = new Set(this.ents.filter((e) => e.kind === 'digger').map((e) => e.look));
    const look = Math.max(0, CREW.findIndex((_, i) => !used.has(i))), color = CREW[look].color;
    let bit = 16;
    while (this.ents.some((e) => e.kind === 'digger' && e.bit === bit)) bit <<= 1;
    const body = new CANNON.Body({ mass: 70, fixedRotation: true, material: this.mPlayer, collisionFilterGroup: bit, collisionFilterMask: ALL, allowSleep: false });
    body.addShape(new CANNON.Sphere(0.32), new CANNON.Vec3(0, 0.32, 0));
    body.addShape(new CANNON.Sphere(0.3), new CANNON.Vec3(0, 1.0, 0));
    body.addShape(new CANNON.Sphere(0.27), new CANNON.Vec3(0, 1.65, 0));
    const n = this.ents.filter((e) => e.kind === 'digger').length;
    body.position.set(SPAWN.x + (n - 1.5) * 1.2, 0.05, SPAWN.z);
    this.world.addBody(body);
    const hand = new CANNON.Body({ mass: 0, type: CANNON.Body.KINEMATIC, collisionFilterGroup: 0, collisionFilterMask: 0 });
    this.world.addBody(hand);
    const p = this.addEnt({
      kind: 'digger', name: (name || CREW[look].name).slice(0, 16), color, look, seed: n + 1, body, hand, bit,
      yaw: Math.PI, input: { mx: 0, mz: 0, yaw: Math.PI, run: false, jump: false, dig: false, g: 0, th: 0, fl: 0 },
      last: null, rag: null, ragT: 0, grab: null, phase: 0, grounded: true, turn: 0, hint: '', digging: false, jumpT: 0, slipT: 0,
    });
    return p;
  }
  removePlayer(id) { const p = this.byId(id); if (p) { this.drop(p); this.removeEnt(p); } }
  setInput(id, inp) {
    const p = this.byId(id);
    if (!p) return;
    if (!p.last) p.last = { g: inp.g, th: inp.th, fl: inp.fl };
    p.input = inp;
  }

  feet(p) { return p.rag ? p.rag.bodies[0].position : p.body.position; } // part 0 is the belly
  fwd(p) { return new CANNON.Vec3(Math.sin(p.yaw), 0, Math.cos(p.yaw)); }
  handPoint(p, hy) {
    const f = this.fwd(p), b = p.body.position, d = hy === COFFIN_HOLD_Y ? 0.95 : 0.75;
    return new CANNON.Vec3(b.x + f.x * d, b.y + hy, b.z + f.z * d);
  }

  toRagdoll(p, extra) {
    if (p.rag) return;
    this.drop(p);
    const xf = this.diggerPose(p, new Float32Array(NCREW * 7));
    p.rag = this.makeCrewRagdoll(crewRig(p.look), xf, DIGGER_RAG_MASS);
    for (const b of p.rag.bodies) {
      b.ent = p;
      b.velocity.copy(p.body.velocity);
      if (extra) b.velocity.vadd(extra, b.velocity);
    }
    // the round ones would stay balanced on their short legs, so going limp always tips the belly over
    const tip = this.rand() * Math.PI * 2;
    p.rag.bodies[0].angularVelocity.set(Math.cos(tip) * 4.5, (this.rand() - 0.5) * 2, Math.sin(tip) * 4.5);
    this.world.removeBody(p.body);
    p.ragT = this.time;
  }
  getUp(p) {
    if (!p.rag) return;
    const pel = p.rag.bodies[0].position.clone();
    this.releaseGrabsOn(new Set(p.rag.bodies));
    for (const c of p.rag.constraints) this.world.removeConstraint(c);
    for (const b of p.rag.bodies) this.world.removeBody(b);
    p.rag = null;
    const y = this.groundY(pel.x, pel.y + 0.3, pel.z);
    p.body.position.set(pel.x, y + 0.05, pel.z);
    p.body.velocity.set(0, 0, 0);
    this.world.addBody(p.body);
  }
  groundY(x, fromY, z, skip) {
    const r = this._ray;
    r.reset();
    this.world.raycastClosest(new CANNON.Vec3(x, fromY, z), new CANNON.Vec3(x, fromY - 6, z), { collisionFilterMask: G_GROUND | G_PROP | G_TRUCK, skipBackfaces: true }, r);
    return r.hasHit ? r.hitPointWorld.y : 0;
  }

  // ---------- grabbing ----------
  findGrab(p) {
    const hand = this.handPoint(p, 1.0);
    let best = null, bestD = 1.15;
    const tmp = new CANNON.Vec3(), loc = new CANNON.Vec3();
    // a body resting in an upright coffin is left alone: you grab the coffin (tip it over to get them out)
    const boxed = new Set(this.ents.filter((e) => e.kind === 'coffin' && this.coffinUp(e) > 0.5).map((e) => this.coffinContents(e)));
    for (const e of this.ents) {
      if (e === p) continue;
      if (e.kind === 'corpse' || (e.kind === 'digger' && e.rag)) {
        for (const b of this.bodiesOf(e)) {
          const d = b.position.distanceTo(hand) - b.grabR + (boxed.has(e) ? 0.8 : 0);
          if (d < bestD) { bestD = d; best = { body: b, ent: e, pivot: new CANNON.Vec3() }; }
        }
      } else if (e.kind === 'coffin') {
        const b = e.body;
        b.pointToLocalFrame(hand, loc);
        loc.x = Math.max(-COFFIN.hx, Math.min(COFFIN.hx, loc.x));
        loc.y = Math.max(-COFFIN.hy, Math.min(0, loc.y)); // grip at mid-height: pulling from the rim would tip it end over end
        loc.z = Math.max(-COFFIN.hz, Math.min(COFFIN.hz, loc.z));
        b.pointToWorldFrame(loc, tmp);
        const d = tmp.distanceTo(hand) - 0.1;
        if (d < bestD) { bestD = d; best = { body: b, ent: e, pivot: loc.clone() }; }
      }
    }
    return best;
  }
  grab(p) {
    const g = this.findGrab(p);
    if (!g) return;
    const coffin = g.ent.kind === 'coffin';
    const h = this.handPoint(p, coffin ? COFFIN_HOLD_Y : CORPSE_HOLD_Y);
    p.hand.position.copy(h);
    g.constraint = new CANNON.PointToPointConstraint(g.body, g.pivot, p.hand, new CANNON.Vec3(), (coffin ? COFFIN_GRIP_N : CORPSE_GRIP_N) * STEP);
    this.world.addConstraint(g.constraint);
    g.coffin = coffin;
    g.grip = 1;
    p.grab = g;
    // whatever you carry passes through you instead of wedging against your legs
    for (const b of this.bodiesOf(g.ent)) { b.wakeUp(); b.collisionFilterMask &= ~p.bit; }
    if (g.ent.kind === 'corpse' && !g.ent.greeted) {
      g.ent.greeted = true;
      this.emit('toast', { text: g.ent.name, pos: [h.x, h.y + 0.6, h.z] });
    }
    this.emit('sfx', { name: 'grab', pos: [h.x, h.y, h.z] });
  }
  drop(p, assist = false) {
    const g = p.grab;
    if (!g) return;
    this.world.removeConstraint(g.constraint);
    p.grab = null;
    this.restores.push({ ent: g.ent, p, t: this.time + 0.45 }); // collide with the carrier again once it has fallen clear
    if (g.contents) this.restores.push({ ent: g.contents, p, t: this.time + 0.45 });
    if (assist && g.ent.kind === 'corpse') this.coffinAssist(g.ent, p.hand.position);
    if (assist && g.ent.kind === 'coffin' && !this.holders(g.ent)) this.graveAssist(g.ent);
  }
  // A coffin let go over a dug grave is straightened and centered so it drops in (its passenger comes along).
  graveAssist(coffin) {
    const b = coffin.body, q = b.position;
    if (this.coffinUp(coffin) < 0.6) return;
    const plot = this.plots.find((pl) => !pl.buried && pl.depth >= 0.4 && Math.abs(q.x - pl.x) < PLOT_HALF.x + 1.2 && Math.abs(q.z - pl.z) < PLOT_HALF.z + 1.5);
    if (!plot || q.y < 0) return;
    const body = this.coffinContents(coffin);
    const fz = b.quaternion.vmult(new CANNON.Vec3(0, 0, 1)).z;
    const newQ = new CANNON.Quaternion().setFromEuler(0, fz >= 0 ? 0 : Math.PI, 0);
    const newP = new CANNON.Vec3(plot.x, Math.max(q.y, COFFIN.hy + 0.08), plot.z);
    const inv = b.quaternion.inverse();
    for (const cb of body ? body.bodies : []) {
      const loc = b.pointToLocalFrame(cb.position);
      const rel = inv.mult(cb.quaternion);
      newQ.vmult(loc, cb.position);
      cb.position.vadd(newP, cb.position);
      newQ.mult(rel, cb.quaternion);
      cb.velocity.setZero(); cb.angularVelocity.setZero(); cb.wakeUp();
    }
    b.position.copy(newP);
    b.quaternion.copy(newQ);
    b.velocity.setZero(); b.angularVelocity.setZero(); b.wakeUp();
  }
  // A little forgiveness: a body let go right at an open, empty coffin is laid down inside it.
  // It stays a live ragdoll, so it still spills out if the coffin tips over.
  coffinAssist(corpse, hand) {
    const loc = new CANNON.Vec3();
    for (const e of this.ents) {
      if (e.kind !== 'coffin' || this.coffinUp(e) < 0.7 || this.coffinContents(e)) continue;
      e.body.pointToLocalFrame(hand, loc);
      if (Math.abs(loc.x) > COFFIN.hx + 0.6 || Math.abs(loc.z) > COFFIN.hz + 0.6 || loc.y > 2 || loc.y < -0.5) continue;
      const c = e.body.position, q = e.body.quaternion;
      const m = new THREE.Matrix4().compose(new THREE.Vector3(c.x, c.y, c.z), new THREE.Quaternion(q.x, q.y, q.z, q.w), new THREE.Vector3(1, 1, 1))
        .multiply(new THREE.Matrix4().makeTranslation(0, -COFFIN.hy + 0.36, -COFFIN.hz + 0.2))
        .multiply(new THREE.Matrix4().makeRotationY(Math.PI))
        .multiply(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
      const rots = restRots();
      rots[P.thighL][0] = rots[P.thighR][0] = -0.4; rots[P.shinL][0] = rots[P.shinR][0] = 0.8;
      rots[P.uarmL][0] = rots[P.uarmR][0] = -0.3; rots[P.uarmL][2] = -0.2; rots[P.uarmR][2] = 0.2;
      rots[P.farmL][0] = rots[P.farmR][0] = -1.2;
      const xf = fk(m, rots, new Float32Array(NPARTS * 7));
      corpse.bodies.forEach((b, i) => {
        const o = i * 7;
        b.position.set(xf[o], xf[o + 1], xf[o + 2]);
        b.quaternion.set(xf[o + 3], xf[o + 4], xf[o + 5], xf[o + 6]);
        b.velocity.setZero(); b.angularVelocity.setZero(); b.wakeUp();
      });
      e.body.wakeUp();
      this.emit('sfx', { name: 'thud', pos: [c.x, c.y, c.z] });
      return;
    }
  }
  throwHeld(p) {
    const g = p.grab;
    if (!g) return;
    this.drop(p);
    const f = this.fwd(p);
    const k = g.coffin ? 2.5 : 6;
    for (const b of this.bodiesOf(g.ent)) {
      b.wakeUp();
      b.velocity.x += f.x * k; b.velocity.z += f.z * k; b.velocity.y += g.coffin ? 2 : 3.5;
    }
    this.emit('sfx', { name: 'throw', pos: [p.body.position.x, 1.2, p.body.position.z] });
  }
  releaseGrabsOn(bodies) {
    for (const e of this.ents) if (e.kind === 'digger' && e.grab && bodies.has(e.grab.body)) this.drop(e);
  }
  holders(ent) { return this.ents.filter((e) => e.kind === 'digger' && e.grab && e.grab.ent === ent).length; }

  // ---------- coffins & graves ----------
  coffinContents(coffin) {
    const b = coffin.body, loc = new CANNON.Vec3();
    for (const e of this.ents) {
      if (e.kind !== 'corpse') continue;
      let inside = true;
      for (const i of [P.pelvis, P.chest]) {
        b.pointToLocalFrame(e.bodies[i].position, loc);
        if (Math.abs(loc.x) > COFFIN.hx || Math.abs(loc.z) > COFFIN.hz || loc.y < -COFFIN.hy - 0.05 || loc.y > COFFIN.hy + 0.35) { inside = false; break; }
      }
      if (inside) return e;
    }
    return null;
  }
  coffinUp(coffin) { return coffin.body.quaternion.vmult(new CANNON.Vec3(0, 1, 0)).y; }
  coffinInPlot(plot) {
    for (const e of this.ents) {
      if (e.kind !== 'coffin') continue;
      const q = e.body.position;
      if (Math.abs(q.x - plot.x) < PLOT_HALF.x + 0.1 && Math.abs(q.z - plot.z) < PLOT_HALF.z + 0.1 && q.y < -0.05) return e;
    }
    return null;
  }
  nearestPlot(p) {
    const f = p.body.position;
    let best = null, bd = 1.1;
    for (const pl of this.plots) {
      const dx = Math.max(0, Math.abs(f.x - pl.x) - PLOT_HALF.x), dz = Math.max(0, Math.abs(f.z - pl.z) - PLOT_HALF.z);
      const d = Math.hypot(dx, dz);
      if (d < bd) { bd = d; best = pl; }
    }
    return best;
  }
  plotStatus(plot) {
    if (plot.buried) return { act: null, hint: `Here lies ${plot.name}. R.I.P.` };
    const c = this.coffinInPlot(plot);
    if (c) {
      if (this.coffinUp(c) < 0.5) return { act: null, hint: 'The coffin is upside down! Flip it.' };
      const body = this.coffinContents(c);
      if (!body) return { act: null, hint: 'This coffin is empty. Put a body in it.' };
      if (plot.depth < PLOT_MIN_DEPTH) return { act: null, hint: 'Too shallow. Pull the coffin out and dig deeper.' };
      return { act: 'fill', coffin: c, body, hint: 'Hold F to fill the grave' };
    }
    if (plot.depth < PLOT_MAX_DEPTH) return { act: 'dig', hint: plot.depth > 0 ? 'Hold F to keep digging' : 'Hold F to dig a grave' };
    return { act: null, hint: 'Grave ready. Drop a coffin in it.' };
  }
  setDepth(plot, d) {
    plot.depth = d;
    plot.floor.position.y = -d - 1;
    plot.floor.aabbNeedsUpdate = true;
    for (const e of this.ents) for (const b of this.bodiesOf(e)) {
      if (Math.abs(b.position.x - plot.x) < 1.5 && Math.abs(b.position.z - plot.z) < 2) b.wakeUp();
    }
  }
  workPlot(p, plot, h) {
    const st = this.plotStatus(plot);
    if (st.act === 'dig') {
      this.setDepth(plot, Math.min(PLOT_MAX_DEPTH, plot.depth + h / 3.5));
      if (this.time - plot.digSfx > 0.45) { plot.digSfx = this.time; this.emit('sfx', { name: 'dig', pos: [plot.x, 0, plot.z] }); }
    } else if (st.act === 'fill') {
      plot.fill += h / 2.5;
      if (this.time - plot.digSfx > 0.45) { plot.digSfx = this.time; this.emit('sfx', { name: 'dig', pos: [plot.x, 0, plot.z] }); }
      if (plot.fill >= 1) this.bury(plot, st.coffin, st.body);
    }
  }
  bury(plot, coffin, body) {
    plot.name = body.name;
    plot.seed = body.seed;
    this.removeEnt(body);
    this.removeEnt(coffin);
    plot.buried = true;
    plot.buriedAt = this.time;
    plot.fill = 0;
    this.setDepth(plot, 0);
    this.score++;
    this.emit('sfx', { name: 'bury', pos: [plot.x, 0, plot.z] });
    this.emit('toast', { text: `R.I.P. ${plot.name}`, pos: [plot.x, 2, plot.z], big: true });
    if (this.plots.every((pl) => pl.buried)) {
      const old = this.plots.reduce((a, b) => (a.buriedAt < b.buriedAt ? a : b));
      old.buried = false;
      this.emit('toast', { text: 'Graveyard full! An old plot was cleared.', pos: [old.x, 2, old.z] });
    }
  }

  // ---------- main loop ----------
  update(dt) {
    this.acc = Math.min(this.acc + dt, STEP * 4);
    while (this.acc >= STEP) { this.step(STEP); this.acc -= STEP; }
    for (const e of this.ents) this.writeXf(e);
  }

  step(h) {
    this.time += h;
    this.updateTruck(h);
    for (const e of this.ents) if (e.kind === 'digger') this.updatePlayer(e, h);
    for (const e of this.ents) if (e.kind === 'digger' && e.grab) this.updateHand(e, h);
    this.world.step(h);
    this.afterStep(h);
  }

  updatePlayer(p, h) {
    const inp = p.input, last = p.last || (p.last = { g: inp.g, th: inp.th, fl: inp.fl });
    if (inp.fl !== last.fl) {
      last.fl = inp.fl;
      if (!p.rag) { this.toRagdoll(p); this.emit('sfx', { name: 'flop', pos: [p.body.position.x, 1, p.body.position.z] }); }
      else if (this.time - p.ragT > 0.6) this.getUp(p);
    }
    if (p.rag) {
      last.g = inp.g; last.th = inp.th;
      // gentle auto get-up so nobody stays a pancake forever (unless a friend is carrying them)
      if (this.time - p.ragT > 7 && !this.holders(p)) this.getUp(p);
      return;
    }
    const prevYaw = p.yaw;
    p.yaw = inp.yaw;
    let dy = p.yaw - prevYaw;
    dy = Math.atan2(Math.sin(dy), Math.cos(dy));
    p.turn = Math.abs(dy) / h;

    const b = p.body;
    this._ray.reset();
    this.world.raycastClosest(new CANNON.Vec3(b.position.x, b.position.y + 0.3, b.position.z),
      new CANNON.Vec3(b.position.x, b.position.y - 0.12, b.position.z), { collisionFilterMask: G_GROUND | G_PROP | G_TRUCK, skipBackfaces: true }, this._ray);
    p.grounded = this._ray.hasHit;

    const f = this.fwd(p), r = new CANNON.Vec3(-f.z, 0, f.x);
    let mx = inp.mx, mz = inp.mz;
    const len = Math.hypot(mx, mz);
    if (len > 1) { mx /= len; mz /= len; }
    const soloCoffin = p.grab && p.grab.coffin && this.holders(p.grab.ent) < 2;
    let speed = inp.run && !soloCoffin ? 6.2 : 3.6; // no sprinting while dragging a coffin alone
    if (p.grab) {
      if (p.grab.coffin) speed *= this.holders(p.grab.ent) > 1 ? 0.85 : 0.5;
      else speed *= 0.85;
      // a load that lags behind (stuck, heavy) holds you back instead of stretching forever
      speed *= Math.max(0.15, 1 - Math.max(0, (p.grab.stretch || 0) - 0.3) * 1.2);
    }
    p.digging = !!(inp.dig && !p.grab && p.grounded);
    if (p.digging) speed = 0;
    const tx = (f.x * mz + r.x * mx) * speed, tz = (f.z * mz + r.z * mx) * speed;
    const k = Math.min(1, h * (!p.grounded ? 3 : p.grab && p.grab.coffin ? 5 : 14));
    b.velocity.x += (tx - b.velocity.x) * k;
    b.velocity.z += (tz - b.velocity.z) * k;
    if (inp.jump && p.grounded && this.time - p.jumpT > 0.35) { b.velocity.y = 5.8; p.jumpT = this.time; }
    p.speed = Math.hypot(b.velocity.x, b.velocity.z);
    p.phase += p.speed * h * 2.6;

    if (inp.g !== last.g) { last.g = inp.g; if (p.grab) this.drop(p, true); else this.grab(p); }
    if (inp.th !== last.th) { last.th = inp.th; this.throwHeld(p); }

    if (p.digging) {
      const plot = this.nearestPlot(p);
      if (plot) this.workPlot(p, plot, h);
    }
  }

  updateHand(p, h) {
    const g = p.grab;
    // The hand eases toward its spot in front of the player, so whipping the camera around
    // swings the load instead of teleporting it.
    const goal = this.handPoint(p, g.coffin ? COFFIN_HOLD_Y : CORPSE_HOLD_Y);
    const k = Math.min(1, h * 10), hp = p.hand.position;
    const target = new CANNON.Vec3(hp.x + (goal.x - hp.x) * k, hp.y + (goal.y - hp.y) * k, hp.z + (goal.z - hp.z) * k);
    p.hand.velocity.set((target.x - hp.x) / h, (target.y - hp.y) / h, (target.z - hp.z) / h);
    p.hand.position.copy(target);
    for (const b of this.bodiesOf(g.ent)) b.wakeUp();
    g.stretch = g.body.pointToWorldFrame(g.pivot).distanceTo(hp);
    if (g.stretch > 2) { // yanked out of your hands
      this.drop(p);
      this.emit('toast', { text: 'Lost my grip!', pos: [hp.x, hp.y + 0.5, hp.z] });
      this.emit('sfx', { name: 'slip', pos: [hp.x, hp.y, hp.z] });
      return;
    }
    if (g.coffin) {
      // the passenger of a held coffin must not collide with the carrier either, or walking into
      // the coffin would shove the body through its walls
      const inside = this.coffinContents(g.ent);
      if (inside !== g.contents) {
        if (g.contents) this.restores.push({ ent: g.contents, p, t: this.time + 0.45 });
        g.contents = inside;
      }
      if (inside) for (const b of inside.bodies) { b.wakeUp(); b.collisionFilterMask &= ~p.bit; } // a sleeping passenger would pin the coffin
    }
    if (g.coffin && !p.input.run) {
      // A calmly held coffin resists tipping. Sprint with it and you are on your own.
      const b = g.body, up = b.quaternion.vmult(new CANNON.Vec3(0, 1, 0)), w = b.angularVelocity;
      if (up.y > 0.2) {
        b.torque.x += -up.z * 320 - w.x * 40;
        b.torque.z += up.x * 320 - w.z * 40;
      }
    }
    if (g.ent.kind !== 'corpse') return;
    // Corpses are slippery: running, spinning and jumping make them slide out of your hands.
    const part = g.body.partIndex;
    const partSlip = part === P.chest || part === P.pelvis ? 0.6 : part === P.farmL || part === P.farmR || part === P.shinL || part === P.shinR ? 1.5 : 1;
    let drain = 0.09 + (p.input.run && p.speed > 3 ? 0.45 : 0) + Math.min(p.turn, 8) * 0.04 + (!p.grounded ? 0.4 : 0);
    if (this.rand() < h * 0.18) drain += (0.45 / h) * this.rand(); // random butterfingers
    g.grip -= drain * h * g.ent.slip * partSlip;
    if (g.grip <= 0) {
      this.drop(p);
      this.emit('toast', { text: this.rand() < 0.5 ? 'Whoops!' : 'Butterfingers!', pos: [target.x, target.y + 0.5, target.z] });
      this.emit('sfx', { name: 'slip', pos: [target.x, target.y, target.z] });
    }
  }

  afterStep(h) {
    const t = this.truck;
    const tv = t.body.velocity.x;
    for (const e of [...this.ents]) {
      if (e.kind === 'digger') {
        const pos = this.feet(e);
        if (!e.rag && Math.abs(tv) > 1.5) {
          const lx = pos.x - t.body.position.x, lz = pos.z - t.body.position.z;
          if (Math.abs(lx) < TRUCK.half[0] + 0.3 && Math.abs(lz) < TRUCK.half[2] + 0.3 && pos.y < 2.2) {
            this.toRagdoll(e, new CANNON.Vec3(tv * 1.3, 5, Math.sign(lz || 1) * 4));
            this.emit('toast', { text: 'SPLAT!', pos: [pos.x, 2, pos.z], big: true });
            this.emit('sfx', { name: 'honk', pos: [pos.x, 1, pos.z] });
          }
        }
        if (pos.y < -8 || Math.abs(pos.x) > 70 || Math.abs(pos.z) > 70) {
          if (e.rag) this.getUp(e);
          e.body.position.set(SPAWN.x, 0.5, SPAWN.z);
          e.body.velocity.set(0, 0, 0);
        }
      } else if (e.kind === 'corpse' || e.kind === 'coffin') {
        const pos = e.kind === 'corpse' ? e.bodies[P.pelvis].position : e.body.position;
        if (pos.y < -8 || Math.abs(pos.x) > 45 || Math.abs(pos.z) > 45) {
          this.emit('toast', { text: e.kind === 'corpse' ? `${e.name} got away...` : 'A coffin got away', pos: [0, 3, ROAD_Z] });
          this.removeEnt(e);
        }
      }
    }
    for (const pl of this.plots) {
      if (pl.fill > 0 && !this.coffinInPlot(pl)) pl.fill = Math.max(0, pl.fill - h);
    }
    // safety net: no prop may ever move faster than a hard throw (stops physics blow-ups)
    for (const e of this.ents) for (const b of this.bodiesOf(e)) {
      const v = b.velocity.length(), w = b.angularVelocity.length();
      if (v > 14) b.velocity.scale(14 / v, b.velocity);
      if (w > 18) b.angularVelocity.scale(18 / w, b.angularVelocity);
    }
    this.restores = this.restores.filter((r) => {
      if (this.time < r.t) return true;
      if (!(r.p.grab && (r.p.grab.ent === r.ent || r.p.grab.contents === r.ent))) for (const b of this.bodiesOf(r.ent)) b.collisionFilterMask |= r.p.bit;
      return false;
    });
    // keep a couple of empty coffins at the pile
    if (Math.floor(this.time / 2) !== Math.floor((this.time - h) / 2)) {
      const coffins = this.ents.filter((e) => e.kind === 'coffin');
      // only coffins a player can actually use count: upright, empty, inside the fence and not already in a grave
      const free = coffins.filter((c) => this.coffinUp(c) > 0.5 && Math.abs(c.body.position.x) < 27 && Math.abs(c.body.position.z) < 27
        && !this.coffinContents(c) && !PLOTS.some((_, i) => this.coffinInPlot(this.plots[i]) === c));
      if (free.length < 2 && coffins.length < 8) {
        // pick a free spot at the pile so the new coffin never spawns inside another one
        let spot = null;
        for (let i = 0; i < 5 && !spot; i++) {
          const z = PILE.z + [0, 1.35, -1.35, 2.7, -2.7][i];
          if (!coffins.some((c) => Math.hypot(c.body.position.x - PILE.x, c.body.position.z - z) < 1.6)) spot = z;
        }
        this.spawnCoffin(PILE.x, spot === null ? 2.5 : 0.6, spot === null ? PILE.z : spot, Math.PI / 2);
        this.emit('sfx', { name: 'thud', pos: [PILE.x, 0.5, PILE.z] });
      }
    }
    if (Math.floor(this.time * 5) !== Math.floor((this.time - h) * 5)) {
      for (const e of this.ents) if (e.kind === 'digger') e.hint = this.hintFor(e);
    }
  }

  corpsesInBed() {
    const tb = this.truck.body.position;
    return this.ents.filter((e) => e.kind === 'corpse').filter((e) => {
      const q = e.bodies[P.pelvis].position;
      const lx = q.x - tb.x, lz = q.z - tb.z;
      return lx > TRUCK.bed.x0 - 0.2 && lx < TRUCK.bed.x1 + 0.3 && Math.abs(lz) < 1.1 && q.y > 0.6;
    });
  }

  updateTruck(h) {
    const t = this.truck, b = t.body, x = b.position.x;
    let vx = 0;
    if (t.state === 'arrive') {
      const d = x - TRUCK_STOP_X;
      vx = -Math.min(7, d * 0.8 + 0.3);
      if (d < 0.03) { vx = 0; b.position.x = TRUCK_STOP_X; t.state = 'wait'; t.t = this.time; this.emit('sfx', { name: 'honk', pos: [x, 1.5, ROAD_Z] }); this.emit('toast', { text: 'Delivery!', pos: [x, 3.2, ROAD_Z], big: true }); }
    } else if (t.state === 'wait') {
      const empty = this.corpsesInBed().length === 0;
      if ((empty && this.time - t.t > 3) || this.time - t.t > 90) {
        t.state = 'leave'; t.t = this.time;
        this.emit('sfx', { name: 'honk', pos: [x, 1.5, ROAD_Z] });
      }
    } else if (t.state === 'leave') {
      vx = -Math.min(8, 0.5 + (this.time - t.t) * 2);
      if (x < -TRUCK_START_X) { t.state = 'away'; t.t = this.time; b.position.x = TRUCK_SPAWN_X; b.aabbNeedsUpdate = true; }
    } else if (t.state === 'away') {
      const corpses = this.ents.filter((e) => e.kind === 'corpse').length;
      if (this.time - t.t > 14 && corpses < MAX_CORPSES - 2) {
        t.loads++;
        this.spawnLoad(Math.min(5, 2 + Math.ceil(t.loads / 2)));
        t.state = 'arrive';
      }
    }
    b.velocity.set(vx, 0, 0);
    t.cage.position.copy(b.position);
    t.cage.velocity.set(vx, 0, 0);
    t.cage.collisionFilterMask = t.state === 'arrive' ? G_PROP : 0;
    t.cage.aabbNeedsUpdate = true;
    t.wheel += (vx * h) / 0.5;
  }

  hintFor(p) {
    if (p.rag) return this.holders(p) ? 'A friend is carrying you. Enjoy the ride.' : 'Press R to get up';
    if (p.grab) {
      if (p.grab.coffin) return this.holders(p.grab.ent) > 1 ? 'Teamwork! Drop it into a dug grave.' : 'Heavy! Get a friend on the other end. Click to drop.';
      return 'Put them in a coffin · Click to drop · Right-click to throw';
    }
    const plot = this.nearestPlot(p);
    if (plot) return this.plotStatus(plot).hint;
    if (this.findGrab(p)) return 'Click to grab';
    return '';
  }

  // ---------- transforms / snapshots ----------
  diggerPose(p, out) {
    const b = p.body.position;
    this._root.makeRotationY(p.yaw).setPosition(b.x, b.y + (p.grounded ? Math.abs(Math.sin(p.phase)) * 0.05 * Math.min(1, (p.speed || 0) / 3) : 0), b.z);
    this._pose.speed = p.speed || 0; this._pose.phase = p.phase; this._pose.t = this.time + p.id;
    this._pose.carry = p.grab ? (p.grab.coffin ? 'coffin' : 'corpse') : null; this._pose.dig = p.digging; this._pose.air = !p.grounded;
    return crewPose(crewRig(p.look), this._root, this._pose, out);
  }
  writeXf(e) {
    if (e.kind === 'digger' && !e.rag) { this.diggerPose(e, e.xf); return; }
    const bodies = e.kind === 'truck' ? [e.body] : this.bodiesOf(e);
    for (let i = 0; i < bodies.length; i++) {
      const b = bodies[i], o = i * 7, xf = e.xf;
      xf[o] = b.position.x; xf[o + 1] = b.position.y; xf[o + 2] = b.position.z;
      xf[o + 3] = b.quaternion.x; xf[o + 4] = b.quaternion.y; xf[o + 5] = b.quaternion.z; xf[o + 6] = b.quaternion.w;
    }
  }
  transforms() {
    let n = 0;
    for (const e of this.ents) n += e.xf.length;
    const out = new Float32Array(n);
    let o = 0;
    for (const e of this.ents) { out.set(e.xf, o); o += e.xf.length; }
    return out;
  }
  state() {
    const ev = this.events;
    this.events = [];
    return {
      score: this.score,
      plots: this.plots.map((p) => [+p.depth.toFixed(3), +p.fill.toFixed(3), p.buried ? 1 : 0, p.seed, p.name]),
      truck: [+this.truck.wheel.toFixed(3), this.truck.state === 'wait' ? 1 : 0],
      players: this.ents.filter((e) => e.kind === 'digger').map((e) => ({
        id: e.id, name: e.name, color: e.color, hint: e.hint, rag: !!e.rag, dig: e.digging,
        grip: e.grab && !e.grab.coffin ? +e.grab.grip.toFixed(2) : -1,
      })),
      ev,
    };
  }
}

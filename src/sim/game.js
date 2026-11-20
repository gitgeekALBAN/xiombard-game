import * as CANNON from 'cannon-es';
import * as THREE from 'three';
import { CREW, NCREW, crewRig, crewPose, rigPose } from '../shared/crew.js';
import { corpseRig, limpRots, REST_ROTS, COFFIN_ROTS } from '../shared/corpses.js';
import { ZOMBIES, ZTYPE, Z_WALKERS, Z_DRAGGER, Z_DOGS, Z_ODD, zombieRig, zombiePose } from '../shared/zombies.js';
import {
  PLOTS, PLOT_HALF, PLOT_MAX_DEPTH, PLOT_MIN_DEPTH, COFFIN, TRUCK, TRUCK_STOP_X, TRUCK_START_X,
  ROAD_Z, FENCE, ROAD_HALF, SPAWN, staticBoxes,
  MORGUE, OUTFITS, outfitLabel, RITES, riteLabel, CANDLES, MAX_CANDLES, candleLabel, NOTE, NAIL_COST, insideMorgue, atStation, FENCE_SECTIONS, FENCE_HP, fenceSectionAt, TRAPS, TRAP_DUR,
} from '../shared/layout.js';
import { rng, corpseName } from '../shared/rng.js';

// Host-authoritative simulation. Only the host runs this; clients render its snapshots.
const G_GROUND = 1, G_PLAYER = 2, G_PROP = 4, G_TRUCK = 8, G_ZOMBIE = 0x400;
// Each player gets its own collision bit (bits 4..9) so whatever they carry can pass through them
// instead of wedging against their legs.
const PLAYER_BITS = 0x3f0;
const ALL = G_GROUND | G_PROP | G_TRUCK | PLAYER_BITS | G_ZOMBIE;
const STEP = 1 / 60;
const CORPSE_MASS = 30, DIGGER_RAG_MASS = 45;
const MAX_CORPSES = 9;
const TRUCK_SPAWN_X = TRUCK_START_X - 25; // where a load appears on the road: inside the |x| < 45 cleanup bounds
// Whatever a digger picks up jumps into the mittens and rides there (no rubber band): the sim steers the load to a
// spot in front of the carrier every step. A body lies across the arms. A coffin is a two-digger job: alone it is
// carried across the chest, slowly, swaying, and the grip runs out; two diggers take an end each and walk in file.
const HOP = 0.25;                 // seconds the jump into the hands takes
const CORPSE_FWD = 0.62, COFFIN_FWD = 0.9, END_FWD = 0.55; // meters from the carrier to the load's center / to a coffin end
export const TRAIN = 2 * (COFFIN.hz + END_FWD); // how far apart two diggers stand with a coffin between them
// The shift has two halves. By day the truck delivers and the crew buries. At night nothing is delivered: zombies
// climb out of the ground, every body left unburied gets up too, and the crew defends the yard with shovels.
const DAY_LEN = 150, NIGHT_LEN = 80, TWILIGHT = 10; // seconds; the light fades over the last TWILIGHT of each half
const MAX_ZOMBIES = 10;     // visitors on the yard at once
const RISE_TIME = 1.6;      // seconds a zombie takes to climb out of the ground
const SWING_TIME = 0.45;    // a shovel swing; the blow lands a third of the way in
const SHOVEL_REACH = 1.9;   // meters; the dragger's fists reach further, so it has to be dodged or hit first
const RISEN = { type: ZTYPE.walker, hp: 2, speed: 1.9, reach: 1.15 }; // a delivered body that got up again

const v3 = (a) => new CANNON.Vec3(a[0], a[1], a[2]);
const PARTS_OF = { digger: NCREW, zombie: NCREW, corpse: NCREW, coffin: 1, truck: 1, note: 1 };

export class Sim {
  // opts: { dayLen, nightLen } in seconds (for tests and tuning)
  constructor(opts = {}) {
    this.dayLen = opts.dayLen || DAY_LEN;
    this.nightLen = opts.nightLen || NIGHT_LEN;
    this.phase = 'day';
    this.phaseT = 0;   // seconds into the current half
    this.dayN = 1;
    this.nightN = 0;
    this.spawns = [];  // zombies still to come tonight: { t, look }
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
    this.score = 0;   // peace points
    this.buried = 0;  // bodies laid to rest
    this.nails = 12;
    this.boards = 4;
    this.seedCounter = 1;
    this.rand = rng(Date.now() & 0xffff);
    this._ray = new CANNON.RaycastResult();
    this._pose = { speed: 0, phase: 0, t: 0, carry: null, dig: false, air: false, swing: 0, attack: 0 };
    this._root = new THREE.Matrix4();
    this._mitts = [new THREE.Vector3(), new THREE.Vector3()];

    this.obstacles = staticBoxes().filter((b) => b.c[1] + b.h[1] > 0.2); // things a zombie must not spawn inside
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
      return { i, x: p.x, z: p.z, depth: 0, fill: 0, buried: false, buriedAt: 0, name: '', seed: 0, floor, digSfx: 0, unrest: 0, nailed: false };
    });

    this.truck = this.spawnTruck();
    this.fence = FENCE_SECTIONS.map((f) => ({ ...f, hp: FENCE_HP, bodies: [], bashSfx: 0 }));
    this.fence.forEach((f) => this.buildFence(f));
    this.traps = TRAPS.map(([x, z]) => ({ x, z, dur: TRAP_DUR, armed: true, rearm: 0 }));
    this.restockCoffin(true);
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
    if (e.z && e.z.mode !== 'down') this.world.removeBody(e.z.body);
    this.ents.splice(this.ents.indexOf(e), 1);
    this.version++;
  }
  bodiesOf(e) {
    if (e.kind === 'digger' || e.kind === 'zombie') return e.rag ? e.rag.bodies : [];
    if (e.kind === 'corpse') return e.bodies;
    if (e.kind === 'coffin' || e.kind === 'note') return [e.body];
    return [];
  }
  byId(id) { return this.ents.find((e) => e.id === id); }
  describe() {
    return this.ents.map((e) => ({
      id: e.id, kind: e.kind, seed: e.seed || 0, color: e.color || '', name: e.name || '', look: e.look ?? -1,
      // what the view rebuilds a model for: a body's clothes and name tag, a coffin's lid (1 closed, 2 nailed)
      outfit: e.kind === 'corpse' ? e.outfit || 'shroud' : undefined, tag: e.kind === 'corpse' && e.tag ? 1 : 0, lid: e.kind === 'coffin' ? e.lid || 0 : 0,
      // a delivery note: what is written on it (name and seed are above)
      note: e.kind === 'note' ? [e.suit, e.rite, e.cand.c, e.cand.n] : undefined,
    }));
  }
  emit(type, data) { this.events.push({ type, ...data }); }

  // A limp character (a body, a digger gone limp, a zombie knocked down): six bodies hanging off the belly by five
  // cone joints. Sizes come from the rig, so every character has a ragdoll of its own shape.
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
      // an arm is one straight box from shoulder to mitten, but its part is the forearm: remember the way from one to the other
      const d = rig.rest[i].clone().sub(rig.bodyC[i]);
      if (d.lengthSq() > 1e-8) b.xfOff = new CANNON.Vec3(d.x, d.y, d.z);
      this.bodyFromXf(b, xf, o);
      b.sleepSpeedLimit = 0.25;
      b.sleepTimeLimit = 1.2;
      b.partIndex = i;
      b.grabR = sh.grabR || 0.12;
      this.world.addBody(b);
      bodies.push(b);
    }
    for (let i = 1; i < NCREW; i++) {
      const j = rig.pivot[i], a = rig.bodyC[0], c = rig.bodyC[i], lim = rig.joints[i];
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

  // put a ragdoll body where a part's transform says (7 floats at o); for an arm that means stepping back from the forearm
  bodyFromXf(b, xf, o) {
    b.quaternion.set(xf[o + 3], xf[o + 4], xf[o + 5], xf[o + 6]);
    b.position.set(xf[o], xf[o + 1], xf[o + 2]);
    if (b.xfOff) b.position.vsub(b.quaternion.vmult(b.xfOff), b.position);
  }

  spawnCorpse(root, rots, seed) {
    const rig = corpseRig(seed), xf = rigPose(rig, root, rots, new Float32Array(NCREW * 7));
    const { bodies, constraints } = this.makeCrewRagdoll(rig, xf, CORPSE_MASS);
    const e = this.addEnt({
      kind: 'corpse', seed, bodies, constraints, name: corpseName(seed), slip: 0.8 + rng(seed)() * 0.7,
      suit: rng(seed * 13 + 5).pick(OUTFITS).id, // what the delivery note asks for
      rite: rng(seed * 17 + 3).pick(RITES).id,    // the charm to bless them with at the chapel
      cand: { c: rng(seed * 19 + 7).pick(CANDLES).id, n: 1 + Math.floor(rng(seed * 23 + 1)() * MAX_CANDLES) }, // candles at the headstone
      outfit: 'shroud', tag: null,               // what they wear and the name tag hung on them so far
      blessed: null,                              // the charm they were blessed with (null: not yet)
    });
    for (const b of bodies) b.ent = e;
    return e;
  }

  // A body's delivery note: a sheet of card that goes where it is put (picked up, carried, laid on a table, dropped).
  // It carries a copy of what the note asks for; the body keeps the truth (the note can get lost, the body cannot).
  spawnNote(body, x, y, z, yaw = 0) {
    const b = new CANNON.Body({ mass: 0.3, material: this.mProp, linearDamping: 0.3, angularDamping: 0.6, collisionFilterGroup: G_PROP, collisionFilterMask: ALL });
    b.addShape(new CANNON.Box(new CANNON.Vec3(NOTE.hx, NOTE.hy, NOTE.hz)));
    b.position.set(x, y + NOTE.hy, z);
    b.quaternion.setFromEuler(0, yaw, 0);
    b.sleepSpeedLimit = 0.15;
    b.grabR = 0.18;
    this.world.addBody(b);
    const e = this.addEnt({ kind: 'note', body: b, of: body.id, seed: body.seed, name: body.name, suit: body.suit, rite: body.rite, cand: body.cand });
    b.ent = e;
    return e;
  }
  notesOf(body) { return this.ents.filter((e) => e.kind === 'note' && e.of === body.id); }

  spawnLoad(n) {
    const t = this.truck.body.position;
    for (let i = 0; i < n; i++) {
      const seed = this.seedCounter++ * 977 + Math.floor(this.rand() * 1000);
      const layer = Math.floor(i / 2), side = i % 2 ? 0.45 : -0.45; // stacked two by two under the coach's roof
      const m = new THREE.Matrix4().makeTranslation(t.x + 2.75, TRUCK.bed.top + 0.3 + layer * 0.45, t.z + side)
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
    const e = this.addEnt({ kind: 'coffin', body: b, seed: this.seedCounter++, lid: 0, passenger: null });
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
    // The coach's sides and roof are in TRUCK.boxes; an invisible back wall closes it for the load only (players can
    // still climb in through the open rear doors): the bodies arrive on board and leave only through the morgue's hatch.
    const cage = new CANNON.Body({ mass: 0, type: CANNON.Body.KINEMATIC, material: this.mGround, collisionFilterGroup: G_TRUCK, collisionFilterMask: G_PROP, allowSleep: false });
    const bed = TRUCK.bed, backH = (bed.roof - bed.top) / 2;
    cage.addShape(new CANNON.Box(new CANNON.Vec3(0.05, backH, 1.0)), new CANNON.Vec3(bed.x1 + 0.05, bed.top + backH, 0));
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
      last: null, rag: null, ragT: 0, grab: null, phase: 0, grounded: true, turn: 0, hint: '', digging: false, jumpT: 0, slipT: 0, swingT: -9, swingHit: true, upT: -9,
    });
    return p;
  }
  removePlayer(id) { const p = this.byId(id); if (p) { this.drop(p); this.removeEnt(p); } }
  setInput(id, inp) {
    const p = this.byId(id);
    if (!p) return;
    if (!p.last) p.last = { g: inp.g, th: inp.th, fl: inp.fl, pk: inp.pk };
    p.input = inp;
  }

  feet(p) { return p.rag ? p.rag.bodies[0].position : p.body.position; } // part 0 is the belly
  fwd(p) { return new CANNON.Vec3(Math.sin(p.yaw), 0, Math.cos(p.yaw)); }
  handPoint(p, hy, d = 0.75, yaw = p.yaw) {
    const b = p.body.position;
    return new CANNON.Vec3(b.x + Math.sin(yaw) * d, b.y + hy, b.z + Math.cos(yaw) * d);
  }

  toRagdoll(p, extra) {
    p.choose = null;
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
    p.upT = this.time;
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
    const onTruck = new Set(this.corpsesInBed()); // those come in through the hatch
    for (const e of this.ents) {
      if (e === p || onTruck.has(e)) continue;
      if (e.z && e.z.mode !== 'down') continue; // on its feet: whack it first
      if (e.kind === 'corpse' || ((e.kind === 'digger' || e.kind === 'zombie') && e.rag)) {
        if (this.holders(e)) continue; // somebody has them already
        const all = this.bodiesOf(e);
        for (const b of all) { // reach for any part: the whole body comes, belly first
          const d = b.position.distanceTo(hand) - b.grabR + (boxed.has(e) ? 0.8 : 0);
          if (d < bestD) { bestD = d; best = { body: all[0], ent: e, pivot: new CANNON.Vec3() }; }
        }
      } else if (e.kind === 'coffin') {
        if (this.holders(e) > 1) continue; // a coffin has two ends
        const b = e.body;
        b.pointToLocalFrame(hand, loc);
        loc.x = Math.max(-COFFIN.hx, Math.min(COFFIN.hx, loc.x));
        loc.y = Math.max(-COFFIN.hy, Math.min(0, loc.y)); // grip at mid-height: pulling from the rim would tip it end over end
        loc.z = Math.max(-COFFIN.hz, Math.min(COFFIN.hz, loc.z));
        b.pointToWorldFrame(loc, tmp);
        const d = tmp.distanceTo(hand) - 0.1;
        if (d < bestD) { bestD = d; best = { body: b, ent: e, pivot: loc.clone() }; }
      } else if (e.kind === 'note') {
        if (this.holders(e)) continue;
        const d = e.body.position.distanceTo(hand) - e.body.grabR + 0.1; // a little less eager than a body: it is small and often lies on one
        if (d < bestD) { bestD = d; best = { body: e.body, ent: e, pivot: new CANNON.Vec3() }; }
      }
    }
    return best;
  }
  grab(p) {
    const g = this.findGrab(p);
    if (!g) return;
    const coffin = g.ent.kind === 'coffin';
    g.coffin = coffin;
    g.grip = 1;
    g.t0 = this.time;
    g.from = g.body.position.clone();
    g.end = 0;
    g.yaw = p.yaw; // which way the load is held: it follows the carrier's turn with a lag, a coffin lazily
    g.strT = 0;
    if (coffin) {
      const mate = this.holdersOf(g.ent)[0];
      if (mate) { // the second pair of hands: an end each, whichever is nearer; nothing has to jump
        g.end = g.body.pointToLocalFrame(p.body.position).z >= 0 ? 1 : -1;
        mate.grab.end = -g.end;
        g.t0 = mate.grab.t0 = this.time - HOP;
      }
    }
    p.grab = g;
    // whatever you carry passes through you instead of wedging against your legs; a body clears the truck's bed too
    for (const b of this.bodiesOf(g.ent)) { b.wakeUp(); b.collisionFilterMask &= ~(coffin ? p.bit : p.bit | G_TRUCK); }
    const h = this.holdTarget(g.ent, this.holdersOf(g.ent)).pos;
    p.hand.position.copy(h);
    if (g.ent.kind === 'corpse' && !g.ent.greeted) {
      g.ent.greeted = true;
      this.emit('toast', { text: g.ent.name, pos: [h.x, h.y + 0.6, h.z] });
    }
    this.emit('sfx', { name: 'grab', pos: [h.x, h.y, h.z] });
  }
  drop(p, assist = false) {
    const g = p.grab;
    if (!g) return;
    p.grab = null;
    if (!g.coffin) for (const b of this.bodiesOf(g.ent)) b.collisionFilterMask |= G_TRUCK;
    this.restores.push({ ent: g.ent, p, t: this.time + 0.45 }); // collide with the carrier again once it has fallen clear
    if (g.contents) this.restores.push({ ent: g.contents, p, t: this.time + 0.45 });
    let mate = g.coffin && this.holdersOf(g.ent)[0];
    if (mate && assist && this.gravePlot(g.ent)) { this.drop(mate); mate = null; } // let go over a dug grave: both hands off, in it goes
    if (mate) mate.grab.end = 0; // the one left holding it takes it across the chest again
    if (assist && g.ent.kind === 'corpse' && !this.coffinAssist(g.ent, p.hand.position)) this.tableAssist(g.ent, p.hand.position);
    if (assist && g.ent.kind === 'coffin' && !mate) this.graveAssist(g.ent);
  }
  // ---------- carrying ----------
  holdersOf(ent) { return this.ents.filter((e) => e.kind === 'digger' && e.grab && e.grab.ent === ent); }
  // how high a digger holds things: its own shoulders decide (feet + this)
  carryY(p, coffin) {
    const sh = crewRig(p.look).pivot[3].y;
    return coffin ? Math.max(0.45, Math.min(0.9, sh - 0.4)) : sh - 0.05;
  }
  // Where a held thing should be right now: { pos, quat, firm }. hs = the diggers holding it.
  holdTarget(ent, hs) {
    const p = hs[0], g = p.grab, b = g.body, t = this.time + p.id * 1.7;
    const q = new CANNON.Quaternion(), tilt = new CANNON.Quaternion();
    if (ent.kind === 'note') { // held up in front of the face to be read, text toward the carrier
      const pos = this.handPoint(p, this.carryY(p, false) + 0.4 + Math.sin(p.phase * 2) * 0.01, 0.55, g.yaw); // just under the eyes
      q.setFromEuler(0, g.yaw, 0);
      q.mult(tilt.setFromEuler(-1.15, 0, 0), q);
      return { pos, quat: q, firm: 1 };
    }
    if (!g.coffin) { // a body lies on its back across the arms, head to the carrier's right
      const pos = this.handPoint(p, this.carryY(p, false) + Math.sin(p.phase * 2) * 0.02, CORPSE_FWD, g.yaw);
      q.setFromEuler(0, g.yaw, 0);
      q.mult(tilt.setFromEuler(-Math.PI / 2, 0, 0), q);
      q.mult(tilt.setFromEuler(0, 0, -Math.PI / 2), q);
      return { pos, quat: q, firm: 0.35 };
    }
    const fz = b.quaternion.vmult(new CANNON.Vec3(0, 0, 1)), yawNow = Math.atan2(fz.x, fz.z);
    if (hs.length > 1) { // an end each: the coffin hangs level between the two, along the line from one to the other
      const a = hs[0].grab.end > 0 ? hs[0] : hs[1], z = a === hs[0] ? hs[1] : hs[0];
      const pa = a.body.position, pz = z.body.position;
      const pos = new CANNON.Vec3((pa.x + pz.x) / 2, (pa.y + pz.y + this.carryY(a, true) + this.carryY(z, true)) / 2, (pa.z + pz.z) / 2);
      q.setFromEuler(0, Math.atan2(pa.x - pz.x, pa.z - pz.z), 0);
      return { pos, quat: q, firm: 1 };
    }
    // alone: across the chest, whichever way round is nearer, and it sways the more the faster you go
    const k = Math.min(1, (p.speed || 0) / 1.8), w = 0.35 + 0.65 * k;
    const pos = this.handPoint(p, this.carryY(p, true) + Math.sin(t * 4.2) * 0.03 * k, COFFIN_FWD, g.yaw);
    let yaw = g.yaw + Math.PI / 2;
    if (Math.cos(yaw - yawNow) < 0) yaw += Math.PI;
    q.setFromEuler(0, yaw + Math.sin(t * 1.3) * 0.2 * w, 0);
    q.mult(tilt.setFromEuler(Math.sin(t * 1.9 + 1) * 0.16 * w, 0, Math.sin(t * 3.1) * 0.1 * w), q);
    return { pos, quat: q, firm: 0.5 };
  }
  // Steer every held thing toward its spot. The first quarter second is the jump: the thing (a coffin's passenger
  // included) moves as one rigid piece; after that only the gripped part is led and the rest hangs from it.
  driveHeld(h) {
    const seen = new Set();
    for (const p of this.ents) {
      if (p.kind !== 'digger' || !p.grab || seen.has(p.grab.ent)) continue;
      const ent = p.grab.ent, hs = this.holdersOf(ent), g = hs[0].grab, b = g.body;
      seen.add(ent);
      const t = this.holdTarget(ent, hs), tau = (this.time - g.t0) / HOP, hop = tau < 1;
      const goal = t.pos.clone();
      if (hop) {
        const e = tau * tau * (3 - 2 * tau);
        g.from.lerp(t.pos, e, goal);
        goal.y += Math.sin(Math.PI * tau) * 0.3;
      }
      const v = goal.vsub(b.position);
      v.scale(hop ? 1 / h : 14, v);
      const sp = v.length(), cap = hop ? 13 : 10;
      if (sp > cap) v.scale(cap / sp, v);
      if (!hop) for (const hp of hs) v.addScaledVector(1 / hs.length, hp.body.velocity, v); // keep up with the carriers, do not trail behind
      // rotation still to go, as an angular velocity
      const qe = t.quat.mult(b.quaternion.conjugate());
      if (qe.w < 0) qe.set(-qe.x, -qe.y, -qe.z, -qe.w);
      const sn = Math.hypot(qe.x, qe.y, qe.z), ang = 2 * Math.atan2(sn, qe.w);
      const w = new CANNON.Vec3(qe.x, qe.y, qe.z);
      w.scale(sn > 1e-6 ? Math.min(ang * (hop ? 14 : 9), 9) / sn : 0, w);
      const kv = hop ? 1 : 0.5 + 0.5 * t.firm, kw = hop ? 0.7 : 0.25 + 0.45 * t.firm;
      b.velocity.lerp(v, kv, b.velocity);
      b.angularVelocity.lerp(w, kw, b.angularVelocity);
      b.wakeUp();
      for (const hp of hs) hp.hand.position.copy(t.pos);
      if (hop) { // everything that belongs to it comes along as one piece
        const rest = this.bodiesOf(ent).filter((o) => o !== b);
        if (g.coffin) { const inside = this.coffinContents(ent); if (inside) rest.push(...inside.bodies); }
        for (const o of rest) {
          const r = o.position.vsub(b.position);
          b.angularVelocity.cross(r, o.velocity);
          o.velocity.vadd(b.velocity, o.velocity);
          o.angularVelocity.copy(b.angularVelocity);
          o.wakeUp();
        }
      }
    }
  }
  // A coffin let go over a dug grave is straightened and centered so it drops in (its passenger comes along).
  gravePlot(coffin) { // the dug grave this coffin would go into if let go right now
    const q = coffin.body.position;
    if (this.coffinUp(coffin) < 0.6 || q.y < 0) return null;
    return this.plots.find((pl) => !pl.buried && pl.depth >= 0.4 && Math.abs(q.x - pl.x) < PLOT_HALF.x + 1.2 && Math.abs(q.z - pl.z) < PLOT_HALF.z + 1.5) || null;
  }
  graveAssist(coffin) {
    const b = coffin.body, q = b.position;
    const plot = this.gravePlot(coffin);
    if (!plot) return;
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
      if (e.kind !== 'coffin' || e.lid || this.coffinUp(e) < 0.7 || this.coffinContents(e)) continue;
      e.body.pointToLocalFrame(hand, loc);
      if (Math.abs(loc.x) > COFFIN.hx + 0.6 || Math.abs(loc.z) > COFFIN.hz + 0.6 || loc.y > 2 || loc.y < -0.5) continue;
      const c = e.body.position, q = e.body.quaternion, rig = corpseRig(corpse.seed);
      const m = new THREE.Matrix4().compose(new THREE.Vector3(c.x, c.y, c.z), new THREE.Quaternion(q.x, q.y, q.z, q.w), new THREE.Vector3(1, 1, 1))
        .multiply(new THREE.Matrix4().makeTranslation(0, -COFFIN.hy + 0.12 + rig.back, -rig.height / 2)) // on its back, centered
        .multiply(new THREE.Matrix4().makeRotationY(Math.PI))
        .multiply(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
      const xf = rigPose(rig, m, COFFIN_ROTS, new Float32Array(NCREW * 7));
      corpse.bodies.forEach((b, i) => {
        this.bodyFromXf(b, xf, i * 7);
        b.velocity.setZero(); b.angularVelocity.setZero(); b.wakeUp();
      });
      e.body.wakeUp();
      this.emit('sfx', { name: 'thud', pos: [c.x, c.y, c.z] });
      return true;
    }
    return false;
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
  holders(ent) { return this.holdersOf(ent).length; }

  // ---------- coffins & graves ----------
  coffinContents(coffin) {
    if (coffin.lid) return null; // a closed coffin keeps its passenger as data (see closeLid)
    const b = coffin.body, loc = new CANNON.Vec3();
    for (const e of this.ents) {
      if (e.kind !== 'corpse' || (e.z && e.z.mode !== 'down')) continue;
      b.pointToLocalFrame(e.bodies[0].position, loc); // the belly is in the box: that body is in the coffin
      if (Math.abs(loc.x) < COFFIN.hx && Math.abs(loc.z) < COFFIN.hz && loc.y > -COFFIN.hy - 0.05 && loc.y < COFFIN.hy + 0.45) return e;
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
      if (!c.lid) return this.coffinStatus(c); // close (and maybe nail) it first
      if (plot.depth < PLOT_MIN_DEPTH) return { act: null, hint: 'Too shallow. Pull the coffin out and dig deeper.' };
      return { act: 'fill', coffin: c, hint: 'Hold F to fill the grave' };
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
      if (plot.fill >= 1) this.bury(plot, st.coffin);
    }
  }
  // The laying-to-rest checklist. Each missed item makes the grave restless: zombies go for restless graves first,
  // and a coffin that is not nailed shut is dug up twice as fast.
  bury(plot, coffin) {
    const who = coffin.passenger, named = who.tag === who.name, dressed = who.outfit === who.suit, nailed = coffin.lid === 2;
    const mark = (ok) => (ok ? '✓' : '✗');
    plot.name = who.tag || 'Nobody Knows';
    plot.seed = who.seed;
    plot.unrest = (named ? 0 : 1) + (dressed ? 0 : 1) + (nailed ? 0 : 1);
    plot.nailed = nailed;
    plot.who = who;
    this.removeEnt(coffin);
    for (const n of this.ents.filter((e) => e.kind === 'note' && e.of === who.id)) this.removeEnt(n); // laid to rest: the paperwork goes with them
    plot.buried = true;
    plot.buriedAt = this.time;
    plot.fill = 0;
    this.setDepth(plot, 0);
    this.buried++;
    this.score += 1 + (named ? 1 : 0) + (dressed ? 1 : 0) + (nailed ? 1 : 0);
    this.emit('sfx', { name: 'bury', pos: [plot.x, 0, plot.z] });
    this.emit('toast', { text: `R.I.P. ${plot.name}`, pos: [plot.x, 2.3, plot.z], big: true });
    this.emit('toast', { text: `${mark(named)} name  ${mark(dressed)} outfit  ${mark(nailed)} nailed`, pos: [plot.x, 1.7, plot.z] });
    if (plot.unrest >= 2) this.emit('toast', { text: 'The ground grumbles...', pos: [plot.x, 1.1, plot.z] });
    if (this.plots.every((pl) => pl.buried)) {
      const old = this.plots.reduce((a, b) => (a.buriedAt < b.buriedAt ? a : b));
      old.buried = false;
      this.emit('toast', { text: 'Graveyard full! An old plot was cleared.', pos: [old.x, 2, old.z] });
    }
  }

  // ---------- fence, traps and repairs ----------
  buildFence(f) {
    for (const [p0, p1] of f.pieces) {
      const c = (p0 + p1) / 2, half = (p1 - p0) / 2;
      const b = new CANNON.Body({ mass: 0, material: this.mGround, collisionFilterGroup: G_GROUND, collisionFilterMask: ALL });
      b.addShape(new CANNON.Box(f.axis === 'z' ? new CANNON.Vec3(half, 1, 0.15) : new CANNON.Vec3(0.15, 1, half)));
      if (f.axis === 'z') b.position.set(c, 1, f.at); else b.position.set(f.at, 1, c);
      this.world.addBody(b);
      f.bodies.push(b);
    }
  }
  fenceMid(f) { return f.axis === 'z' ? [(f.a0 + f.a1) / 2, f.at] : [f.at, (f.a0 + f.a1) / 2]; }
  // the fence section nearest to a point by the fence line (-1: none)
  fenceNear(q) {
    return Math.abs(Math.abs(q.x) - FENCE) < Math.abs(Math.abs(q.z) - FENCE) ? fenceSectionAt(Math.sign(q.x) * FENCE, q.z) : fenceSectionAt(q.x, Math.sign(q.z) * FENCE);
  }
  damageFence(i, dmg) {
    const f = this.fence[i];
    if (!f || f.hp <= 0) return;
    f.hp = Math.max(0, f.hp - dmg);
    const [x, z] = this.fenceMid(f);
    if (this.time > f.bashSfx) { f.bashSfx = this.time + 0.7; this.emit('sfx', { name: 'thud', pos: [x, 1, z] }); }
    if (f.hp <= 0) {
      for (const b of f.bodies) this.world.removeBody(b);
      f.bodies = [];
      this.emit('toast', { text: 'The fence gave way!', pos: [x, 2.4, z], big: true });
      this.emit('sfx', { name: 'bonk', pos: [x, 1, z] });
    }
  }
  // A walker shoving the fence wears it down; an armed trap under it snaps shut. True when the trap got it.
  walkerHazards(e, h) {
    const z = e.z;
    if (z.mode !== 'walk' && z.mode !== 'attack') return false;
    const q = z.body.position;
    if (Math.abs(q.x) > FENCE - 0.9 || Math.abs(q.z) > FENCE - 0.9) {
      const i = this.fenceNear(q);
      if (i >= 0 && this.fence[i].hp > 0 && z.speed < 0.6 && z.target) this.damageFence(i, h * (z.def.type === ZTYPE.dragger ? 26 : 13));
    }
    for (const t of this.traps) {
      if (!t.armed || t.dur <= 0 || Math.hypot(q.x - t.x, q.z - t.z) >= 0.6) continue;
      t.armed = false;
      t.rearm = this.time + 4;
      t.dur--;
      const a = Math.atan2(q.x - t.x, q.z - t.z);
      this.knock(e, Math.sin(a) * 1.5, 2.5, Math.cos(a) * 1.5);
      this.emit('toast', { text: t.dur ? 'SNAP!' : 'SNAP! The trap broke.', pos: [t.x, 1.4, t.z] });
      this.emit('sfx', { name: 'bonk', pos: [t.x, 0.3, t.z] });
      return true;
    }
    return false;
  }
  // what needs fixing within reach: a used-up trap or a worn fence section
  repairTarget(p) {
    const q = p.body.position;
    for (let i = 0; i < this.traps.length; i++) {
      const t = this.traps[i];
      if (t.dur < TRAP_DUR && Math.hypot(q.x - t.x, q.z - t.z) < 1.4) {
        return this.nails >= 2 ? { act: 'repair', trap: i, hint: `Hold F to fix the trap (2 of ${this.nails} nails)` } : { act: null, hint: 'This trap needs 2 nails to fix.' };
      }
    }
    if (Math.abs(q.x) < FENCE - 2.3 && Math.abs(q.z) < FENCE - 2.3) return null;
    const i = this.fenceNear(q);
    if (i < 0 || this.fence[i].hp >= FENCE_HP) return null;
    return this.boards >= 1 && this.nails >= 2
      ? { act: 'repair', fence: i, hint: this.fence[i].hp > 0 ? 'Hold F to patch the fence (1 board, 2 nails)' : 'Hold F to rebuild the fence (1 board, 2 nails)' }
      : { act: null, hint: 'The fence needs 1 board and 2 nails.' };
  }
  repair(w) {
    if (w.trap !== undefined) {
      const t = this.traps[w.trap];
      if (this.nails < 2) return;
      this.nails -= 2;
      t.dur = TRAP_DUR;
      t.armed = true;
      this.emit('toast', { text: 'Trap fixed and set', pos: [t.x, 1.2, t.z] });
      return;
    }
    const f = this.fence[w.fence];
    if (this.boards < 1 || this.nails < 2) return;
    this.boards -= 1;
    this.nails -= 2;
    const down = f.hp <= 0;
    f.hp = FENCE_HP;
    if (down) this.buildFence(f);
    const [x, z] = this.fenceMid(f);
    this.emit('toast', { text: down ? 'Fence rebuilt' : 'Fence patched', pos: [x, 2, z] });
  }
  updateTraps() {
    for (const t of this.traps) if (!t.armed && t.dur > 0 && this.time > t.rearm) t.armed = true;
  }

  // ---------- the morgue: hatch, tags, outfits, lids, nails ----------
  coffinDist(p, c) {
    const loc = c.body.pointToLocalFrame(p.body.position);
    return Math.abs(loc.y) > 1.5 ? Infinity : Math.hypot(Math.max(0, Math.abs(loc.x) - COFFIN.hx), Math.max(0, Math.abs(loc.z) - COFFIN.hz));
  }
  coffinStatus(c) {
    if (this.coffinUp(c) < 0.5) return { act: null, hint: 'The coffin is upside down! Flip it.' };
    if (!c.lid) {
      const body = this.coffinContents(c);
      return body ? { act: 'lid', coffin: c, body, hint: 'Hold F to close the lid' } : { act: null, hint: 'Empty coffin. Lay a body in it.' };
    }
    if (c.lid === 2) return { act: null, hint: 'Nailed shut. Carry it to a dug grave.' };
    return this.nails >= NAIL_COST
      ? { act: 'nail', coffin: c, hint: `Hold F to nail it shut (${NAIL_COST} of ${this.nails} nails)` }
      : { act: null, hint: 'Out of nails. Carry it to a dug grave as it is.' };
  }
  // What F does right now: fill a grave, repair, close or nail a coffin, or dig.
  workTarget(p) {
    const plot = this.nearestPlot(p), ps = plot && this.plotStatus(plot);
    if (ps && ps.act === 'fill') return { ...ps, plot };
    const rt = this.repairTarget(p);
    if (rt && rt.act) return rt;
    const dr = this.stationBody(p, MORGUE.dress);
    if (dr && dr.outfit !== 'shroud' && !p.choose) return { act: 'redress', body: dr, hint: 'Hold F to change their clothes' };
    const near = this.ents.filter((e) => e.kind === 'coffin' && this.coffinDist(p, e) < 1.15).sort((a, b) => this.coffinDist(p, a) - this.coffinDist(p, b));
    const cs = near.map((c) => this.coffinStatus(c)).find((st) => st.act);
    return cs || (ps ? { ...ps, plot } : near.length ? this.coffinStatus(near[0]) : rt);
  }
  doWork(p, h) {
    const w = this.workTarget(p);
    p.tool = w && w.act;
    if (!w || !w.act) { p.work = 0; return; }
    const key = w.act + (w.coffin ? w.coffin.id : w.plot ? w.plot.i : w.trap !== undefined ? 't' + w.trap : w.fence !== undefined ? 'f' + w.fence : w.body ? 'b' + w.body.id : '');
    if (p.workKey !== key) { p.workKey = key; p.work = 0; }
    if (w.act === 'dig' || w.act === 'fill') { this.workPlot(p, w.plot, h); return; }
    p.work += h;
    if ((w.act === 'nail' || w.act === 'repair') && Math.floor(p.work / 0.27) !== Math.floor((p.work - h) / 0.27)) { // hammer blows
      const q = w.coffin ? w.coffin.body.position : p.body.position;
      this.emit('sfx', { name: 'bonk', pos: [q.x, q.y, q.z] });
    }
    if (p.work < (w.act === 'redress' ? 0.5 : w.act === 'lid' ? 1 : w.act === 'repair' ? 2 : 1.6)) return;
    p.work = 0;
    if (w.act === 'redress') this.openWardrobe(p, w.body);
    else if (w.act === 'lid') this.closeLid(w.coffin, w.body);
    else if (w.act === 'repair') this.repair(w);
    else this.nailLid(w.coffin);
  }
  // The lid goes on: from here the passenger is data on the coffin, not a ragdoll, and the coffin weighs for both.
  closeLid(c, body) {
    c.passenger = { name: body.name, seed: body.seed, suit: body.suit, outfit: body.outfit, tag: body.tag, rite: body.rite, cand: body.cand, blessed: body.blessed, id: body.id };
    this.removeEnt(body);
    c.lid = 1;
    const b = c.body;
    b.addShape(new CANNON.Box(new CANNON.Vec3(COFFIN.hx, 0.03, COFFIN.hz)), new CANNON.Vec3(0, COFFIN.hy, 0));
    b.mass = 25 + CORPSE_MASS;
    b.updateMassProperties();
    b.aabbNeedsUpdate = true;
    b.wakeUp();
    this.version++;
    this.emit('sfx', { name: 'thud', pos: [b.position.x, b.position.y, b.position.z] });
    this.emit('toast', { text: `Goodnight, ${body.tag || 'whoever you are'}`, pos: [b.position.x, b.position.y + 1, b.position.z] });
  }
  nailLid(c) {
    if (this.nails < NAIL_COST || c.lid !== 1) return;
    this.nails -= NAIL_COST;
    c.lid = 2;
    this.version++;
    const q = c.body.position;
    this.emit('toast', { text: `Nailed shut! ${this.nails} nails left`, pos: [q.x, q.y + 1, q.z] });
  }
  atHatch(p) {
    const q = p.body.position, tb = MORGUE.table;
    return Math.abs(q.x - tb.x) < tb.hx + 0.6 && q.z > tb.z - 1.6 && q.z < MORGUE.z1 && insideMorgue(q.x, q.z);
  }

  // ---------- the morgue's stations ----------
  // Bodies lying on a station's table (nobody holding them).
  bodiesOn(st) {
    return this.ents.filter((e) => {
      if (e.kind !== 'corpse' || e.z || this.holders(e)) return false;
      const q = e.bodies[0].position;
      return Math.abs(q.x - st.x) < st.hx + 0.25 && Math.abs(q.z - st.z) < st.hz + 0.4 && q.y > st.top - 0.15 && q.y < st.top + 1.2;
    });
  }
  // The body on a station the digger stands at, or null.
  stationBody(p, st) {
    const q = p.body.position;
    if (p.rag || !insideMorgue(q.x, q.z) || !atStation(st, q.x, q.z)) return null;
    return this.bodiesOn(st)[0] || null;
  }
  nearStation(p, st) { const q = p.body.position; return !p.rag && insideMorgue(q.x, q.z) && atStation(st, q.x, q.z); }
  // Lay a body on its back along a table (the intake table, the registry desk, the dressing table).
  layOn(body, st, stacked = 0) {
    const rig = corpseRig(body.seed);
    const m = new THREE.Matrix4().makeTranslation(st.x + rig.height / 2, st.top + rig.back + 0.08 + stacked * 0.45, st.z)
      .multiply(new THREE.Matrix4().makeRotationY(Math.PI / 2))
      .multiply(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
    const xf = rigPose(rig, m, limpRots(rng(body.seed)), new Float32Array(NCREW * 7));
    body.bodies.forEach((b, i) => {
      this.bodyFromXf(b, xf, i * 7);
      b.velocity.setZero(); b.angularVelocity.setZero(); b.wakeUp();
    });
  }
  // A body let go over a free station table is laid out straight on it (like coffinAssist for coffins).
  tableAssist(body, hand) {
    for (const st of [MORGUE.desk, MORGUE.dress, MORGUE.table]) {
      if (Math.abs(hand.x - st.x) > st.hx + 0.6 || Math.abs(hand.z - st.z) > st.hz + 0.9 || hand.y > st.top + 1.8) continue;
      if (this.bodiesOn(st).some((e) => e !== body)) continue;
      this.layOn(body, st);
      this.emit('sfx', { name: 'thud', pos: [st.x, st.top, st.z] });
      return true;
    }
    return false;
  }
  // Pull the next body off the hearse through the hatch onto the intake table.
  acceptBody() {
    const body = this.corpsesInBed()[0];
    if (!body) return false;
    const tb = MORGUE.table;
    this.layOn(body, tb, this.bodiesOn(tb).filter((e) => e !== body).length);
    body.greeted = true;
    for (const n of this.notesOf(body)) this.removeEnt(n); // one note per body
    this.spawnNote(body, tb.x + tb.hx - 0.22, tb.top + 0.01, tb.z - tb.hz + 0.16, 0.12); // its note, at the front corner of the table
    this.truck.t = this.time; // the driver waits again for the next one (see the 'wait' state in the truck update)
    this.emit('sfx', { name: 'thud', pos: [tb.x, tb.top, tb.z] });
    this.emit('toast', { text: `Note: ${body.name}, ${outfitLabel(body.suit).toLowerCase()}`, pos: [tb.x, tb.top + 1.1, tb.z] });
    return true;
  }
  // The registry desk: write the name tag of the body lying on it.
  register(body) {
    body.tag = body.name;
    this.version++;
    const q = body.bodies[0].position;
    this.emit('sfx', { name: 'grab', pos: [q.x, q.y, q.z] });
    this.emit('toast', { text: `Registered: ${body.name}`, pos: [q.x, q.y + 0.8, q.z] });
  }
  // The dressing table: E opens the outfit choice for the body on it; the pick comes in through the input (pk/pv).
  openWardrobe(p, body) {
    p.choose = body.id;
    const q = body.bodies[0].position;
    this.emit('sfx', { name: 'grab', pos: [q.x, q.y, q.z] });
  }
  pickOutfit(p, i) {
    const body = p.choose && this.byId(p.choose);
    p.choose = null;
    if (!body || !OUTFITS[i]) return;
    body.outfit = OUTFITS[i].id;
    this.version++;
    const q = body.bodies[0].position, pos = [q.x, q.y + 0.8, q.z];
    this.emit('toast', { text: `Dressed in the ${outfitLabel(body.outfit).toLowerCase()}`, pos });
    this.emit('sfx', { name: 'grab', pos });
  }
  // the outfit choice stays open only while you stand at the dressing table with that body on it
  checkWardrobe(p) {
    if (!p.choose) return;
    const body = this.byId(p.choose);
    if (!body || p.rag || p.grab || !this.nearStation(p, MORGUE.dress) || !this.bodiesOn(MORGUE.dress).includes(body)) p.choose = null;
  }
  // The coffin waiting on the stock table, if any.
  stockCoffin() {
    const S = MORGUE.stock;
    return this.ents.find((e) => {
      if (e.kind !== 'coffin') return false;
      const q = e.body.position;
      return Math.abs(q.x - S.x) < S.hx + 0.4 && Math.abs(q.z - S.z) < S.hz + 0.4 && q.y > S.top - 0.1 && q.y < S.top + 1.2;
    });
  }
  // A fresh coffin comes in from the stockroom whenever the stock table is clear.
  restockCoffin(quiet = false) {
    const S = MORGUE.stock;
    if (this.stockCoffin() || this.ents.filter((e) => e.kind === 'coffin').length >= 8) return;
    const onTable = (q) => Math.abs(q.x - S.x) < S.hx + 0.3 && Math.abs(q.z - S.z) < S.hz + 0.3 && q.y > S.top - 0.3;
    if (this.ents.some((e) => (e.kind === 'digger' && onTable(this.feet(e))) || (e.kind === 'corpse' && onTable(e.bodies[0].position)))) return;
    this.spawnCoffin(S.x, S.top + 0.02, S.z, 0);
    if (quiet) return;
    this.emit('sfx', { name: 'thud', pos: [S.x, S.top + 0.3, S.z] });
    this.emit('toast', { text: 'A coffin from the stockroom', pos: [S.x, S.top + 1.2, S.z] });
  }
  // E in the morgue: take a body in at the hatch, write the name tag at the registry desk, choose an outfit at the
  // dressing table. False when none of that applies, so the usual grab / shovel swing happens.
  // The next body comes through the hatch only onto a clear intake table: with one lying there, E picks it up.
  // With the outfit choice open, E picks the body up too (the choice closes), so nobody is stuck dressing them.
  morgueKey(p) {
    if (this.truck.state === 'wait' && this.atHatch(p) && !this.bodiesOn(MORGUE.table).length && this.acceptBody()) return true;
    const reg = this.stationBody(p, MORGUE.desk);
    if (reg && reg.tag !== reg.name) { this.register(reg); return true; }
    const dr = this.stationBody(p, MORGUE.dress);
    if (dr && dr.outfit === 'shroud' && !p.choose) { this.openWardrobe(p, dr); return true; }
    return false;
  }
  morgueHint(p) {
    if (p.choose) return 'Pick an outfit: keys 1-5 · Q to cancel';
    if (this.truck.state === 'wait' && this.atHatch(p) && this.corpsesInBed().length) {
      const on = this.bodiesOn(MORGUE.table)[0];
      return on ? `E: pick up ${on.name} · the next one comes in when the table is clear` : 'E: take the body in through the hatch';
    }
    if (this.nearStation(p, MORGUE.desk)) {
      const reg = this.stationBody(p, MORGUE.desk);
      if (!reg) return 'Registry desk: lay a body on it to write its name tag';
      return reg.tag !== reg.name ? `E: write the name tag for ${reg.name}` : 'Registered! Carry them to the dressing table';
    }
    if (this.nearStation(p, MORGUE.dress)) {
      const dr = this.stationBody(p, MORGUE.dress);
      if (!dr) return 'Dressing table: lay a body on it to dress them';
      return dr.outfit === 'shroud' ? `E: choose an outfit for ${dr.name}` : 'Dressed! Hold F to change · carry them to the coffin';
    }
    return '';
  }
  // The delivery note of the body this player is dealing with, for the HUD card.
  cardFor(p) {
    const card = (o, more) => ({ name: o.name, suit: outfitLabel(o.suit), tag: o.tag, outfit: outfitLabel(o.outfit), tagOk: o.tag === o.name, suitOk: o.outfit === o.suit,
      rite: riteLabel(o.rite), blessed: o.blessed ? riteLabel(o.blessed) : '', riteOk: !!o.blessed && o.blessed === o.rite, cand: candleLabel(o.cand), ...more });
    if (p.grab && p.grab.ent.kind === 'corpse' && !p.grab.ent.z) return card(p.grab.ent, { stage: 'held' });
    if (p.grab && p.grab.ent.kind === 'note') { // reading a note: what it asks for, and how its body is doing if it is still around
      const n = p.grab.ent, b = this.byId(n.of);
      return card(b && b.kind === 'corpse' ? b : { ...n, outfit: 'shroud' }, { stage: 'note' });
    }
    const f = this.feet(p);
    let best = null, bd = 2.2;
    for (const e of this.ents) {
      if (e.kind === 'corpse' && !e.z) {
        const d = e.bodies[0].position.distanceTo(f);
        if (d < bd) { bd = d; best = card(e, { stage: this.ents.some((c) => c.kind === 'coffin' && this.coffinContents(c) === e) ? 'coffin' : 'loose' }); }
      } else if (e.kind === 'coffin' && e.passenger) {
        const d = e.body.position.distanceTo(f);
        if (d < bd) { bd = d; best = card(e.passenger, { stage: e.lid === 2 ? 'nailed' : 'closed' }); }
      }
    }
    return best;
  }

  // ---------- day and night ----------
  light() {
    const ss = (a, b, x) => { const k = Math.min(1, Math.max(0, (x - a) / (b - a))); return k * k * (3 - 2 * k); };
    return this.phase === 'day' ? 1 - ss(this.dayLen - TWILIGHT, this.dayLen, this.phaseT) : ss(this.nightLen - TWILIGHT, this.nightLen, this.phaseT);
  }
  updatePhase(h) {
    this.phaseT += h;
    if (this.phase === 'day' && this.phaseT >= this.dayLen) this.startNight();
    else if (this.phase === 'night' && this.phaseT >= this.nightLen) this.startDay();
    if (this.phase !== 'night') return;
    while (this.spawns.length && this.spawns[0].t <= this.time && this.ents.filter((e) => e.kind === 'zombie').length < MAX_ZOMBIES) {
      const [x, z] = this.zombieSpot();
      this.spawnZombie(this.spawns.shift().look, x, z);
    }
    for (const e of this.ents) if (e.kind === 'corpse' && e.riseAt && e.riseAt <= this.time && !e.z) { e.riseAt = 0; this.riseCorpse(e); }
  }
  startNight() {
    this.phase = 'night';
    this.phaseT = 0;
    this.nightN++;
    this.emit('toast', { text: 'Night falls. They are coming!', pos: [0, 3.5, 4], big: true });
    this.emit('sfx', { name: 'night' });
    const t = this.truck;
    if (t.state === 'wait') { t.state = 'leave'; t.t = this.time; } // the driver does not work nights
    // every body left above ground gets up, one after another
    for (const e of this.ents) if (e.kind === 'corpse' && !e.z) e.riseAt = this.time + 2 + this.rand() * 7;
    // tonight's visitors: the first night shows one of everything, later nights bring more
    const pick = (a) => a[Math.floor(this.rand() * a.length)];
    const odd = Object.values(Z_ODD);
    const looks = [pick(Z_WALKERS), Z_DOGS[0], Z_ODD.longshanks, Z_DRAGGER, Z_DOGS[1], Z_ODD.granny, Z_ODD.bloat, Z_DOGS[2], Z_ODD.stack, Z_ODD.headless, Z_ODD.barrel];
    for (let i = 0; i < Math.min(8, (this.dayN - 1) * 2); i++) { const r = this.rand(); looks.push(r < 0.35 ? pick(Z_WALKERS) : r < 0.55 ? pick(Z_DOGS) : r < 0.9 ? pick(odd) : Z_DRAGGER); }
    const gap = (this.nightLen * 0.6) / looks.length;
    this.spawns = looks.map((look, i) => ({ look, t: this.time + 3 + i * gap }));
  }
  startDay() {
    this.phase = 'day';
    this.phaseT = 0;
    this.dayN++;
    this.spawns = [];
    this.emit('toast', { text: `Morning! Day ${this.dayN}`, pos: [0, 3.5, 4], big: true });
    this.emit('sfx', { name: 'rooster' });
    { // what the night broke
      const down = this.fence.filter((f) => f.hp <= 0).length, worn = this.fence.filter((f) => f.hp > 0 && f.hp < FENCE_HP).length;
      const traps = this.traps.filter((t) => t.dur <= 0).length;
      const list = [down && `${down} fence section${down > 1 ? 's' : ''} down`, worn && `${worn} worn`, traps && `${traps} trap${traps > 1 ? 's' : ''} broken`].filter(Boolean);
      if (list.length) this.emit('toast', { text: `Last night: ${list.join(', ')}. Time for repairs.`, pos: [0, 2.8, 4] });
    }
    for (const e of [...this.ents]) {
      e.riseAt = 0;
      if (!e.z) continue;
      if (e.kind === 'zombie') this.poof(e); // visitors crumble in the sun
      else this.layDown(e);                  // risen bodies drop where they stand, still unburied
    }
  }
  // Where the next visitor comes up: mostly outside the fence (away from the open road gates), so the fence has to
  // hold them; the rest climb out in the old part of the yard, away from diggers, graves and anything solid.
  zombieSpot() {
    const diggers = this.ents.filter((e) => e.kind === 'digger');
    if (this.rand() < 0.65) {
      for (let i = 0; i < 20; i++) {
        const side = Math.floor(this.rand() * 4), along = (this.rand() * 2 - 1) * 24, out = FENCE + 2.5 + this.rand() * 3;
        const [x, z] = side === 0 ? [along, -out] : side === 1 ? [along, out] : side === 2 ? [-out, along] : [out, along];
        if (!(side >= 2 && Math.abs(along - ROAD_Z) < ROAD_HALF + 2)) return [x, z];
      }
    }
    for (let i = 0; i < 40; i++) {
      const x = (this.rand() * 2 - 1) * 22, z = -22 + this.rand() * 27;
      if (diggers.some((d) => Math.hypot(this.feet(d).x - x, this.feet(d).z - z) < 7)) continue;
      if (PLOTS.some((p) => Math.abs(x - p.x) < PLOT_HALF.x + 1 && Math.abs(z - p.z) < PLOT_HALF.z + 1)) continue;
      if (this.obstacles.some((b) => Math.abs(x - b.c[0]) < b.h[0] + 0.7 && Math.abs(z - b.c[2]) < b.h[2] + 0.7)) continue;
      return [x, z];
    }
    return [0, -15];
  }

  // ---------- zombies ----------
  // Anything on its feet at night has a walker in `e.z`: a simple capsule that is steered around, plus a pose.
  // Visitors are entities of kind 'zombie' (six parts, drawn by the crew shader). A delivered body that gets up stays
  // a 'corpse' entity: its ragdoll bodies turn into ghosts that follow the pose, and turn back into a ragdoll when hit.
  makeWalker(x, y, z, def) {
    const dog = def.type === ZTYPE.dog;
    const body = new CANNON.Body({ mass: dog ? 25 : 60, fixedRotation: true, material: this.mPlayer, collisionFilterGroup: G_ZOMBIE, collisionFilterMask: ALL, allowSleep: false });
    body.addShape(new CANNON.Sphere(dog ? 0.26 : 0.3), new CANNON.Vec3(0, dog ? 0.26 : 0.3, 0));
    if (!dog) body.addShape(new CANNON.Sphere(0.28), new CANNON.Vec3(0, 0.95, 0));
    body.position.set(x, y, z);
    this.world.addBody(body);
    return { body, def, yaw: this.rand() * Math.PI * 2, phase: 0, speed: 0, hp: def.hp, mode: 'rise', t: this.time, think: 0, target: null, cool: 0, hit: false, digT: 0, slow: 0, hop: 0 };
  }
  spawnZombie(look, x, z) {
    const e = this.addEnt({ kind: 'zombie', look, seed: this.seedCounter++, rag: null });
    e.z = this.makeWalker(x, 0.05, z, ZOMBIES[look]);
    this.emit('sfx', { name: ZOMBIES[look].type === ZTYPE.dog ? 'bark' : 'groan', pos: [x, 0.5, z] });
    this.emit('puff', { pos: [x, 0.25, z], kind: 2 }); // dirt flies where it breaks the ground
    return e;
  }
  ghost(e, on) {
    for (const b of e.bodies) {
      b.type = on ? CANNON.Body.KINEMATIC : CANNON.Body.DYNAMIC;
      b.collisionFilterGroup = on ? 0 : G_PROP;
      b.collisionFilterMask = on ? 0 : ALL;
      b.velocity.setZero(); b.angularVelocity.setZero();
      b.wakeUp();
    }
  }
  riseCorpse(e) {
    if (e.z || e.rested === this.nightN) return;
    this.releaseGrabsOn(new Set(e.bodies));
    const q = e.bodies[0].position;
    this.ghost(e, true);
    e.z = this.makeWalker(q.x, Math.max(q.y - 0.12, -PLOT_MAX_DEPTH - 0.1), q.z, RISEN);
    this.emit('sfx', { name: 'groan', pos: [q.x, 0.5, q.z] });
    this.emit('toast', { text: `${e.name} is up!`, pos: [q.x, 1.8, q.z] });
  }
  walkerRoot(e) {
    const z = e.z, b = z.body.position;
    // visitors climb out of the ground; a body that was lying there just stands up
    const k = z.mode === 'rise' && e.kind === 'zombie' ? 1 - Math.min(1, (this.time - z.t) / RISE_TIME) : 0;
    const depth = k * k * (z.def.type === ZTYPE.dog ? 0.9 : 2.1);
    return this._root.makeRotationY(z.yaw).setPosition(b.x, b.y - depth, b.z);
  }
  attackOf(z) {
    if (z.mode !== 'attack') return 0;
    return Math.min(1, (this.time - z.t) / (z.def.atk || (z.def.type === ZTYPE.dog ? 0.4 : z.def.type === ZTYPE.dragger ? 0.95 : 0.75)));
  }
  zombieXf(e, out) {
    const z = e.z, s = this._pose;
    s.speed = z.speed; s.phase = z.phase; s.t = this.time + e.id; s.attack = this.attackOf(z);
    return zombiePose(zombieRig(e.look), this.walkerRoot(e), s, out);
  }
  // a risen body walks like any zombie; the pose is written straight into its ghost bodies
  poseRisen(e) {
    const z = e.z, s = this._pose;
    s.speed = z.speed; s.phase = z.phase; s.t = this.time + e.id; s.attack = this.attackOf(z);
    const xf = zombiePose(corpseRig(e.seed), this.walkerRoot(e), s, e.xf);
    e.bodies.forEach((b, i) => this.bodyFromXf(b, xf, i * 7));
  }
  pickTarget(e) {
    const z = e.z, q = z.body.position, dog = z.def.type === ZTYPE.dog;
    let near = null, nd = Infinity;
    for (const d of this.ents) {
      if (d.kind !== 'digger' || d.rag) continue;
      const dist = Math.hypot(d.body.position.x - q.x, d.body.position.z - q.z);
      if (dist < nd) { nd = dist; near = d; }
    }
    if (near && (dog || nd < 9)) return { p: near }; // dogs chase anyone, the rest only bother with someone close
    let plot = null, pd = Infinity;
    for (const pl of this.plots) {
      if (!pl.buried) continue;
      const dist = Math.hypot(pl.x - q.x, pl.z - q.z) - (pl.unrest || 0) * 8; // restless graves call louder
      if (dist < pd) { pd = dist; plot = pl; }
    }
    if (plot && !dog) return { plot }; // otherwise: dig up the crew's work
    return near ? { p: near } : null;
  }
  updateWalker(e, h) {
    const z = e.z, b = z.body, def = z.def, dog = def.type === ZTYPE.dog;
    if (z.mode === 'down') {
      const lying = this.time - z.t, held = this.holders(e);
      if (z.hp > 0 ? lying > (held ? 6 : 3.2) : lying > 2 && !held) { if (z.hp > 0) this.standWalker(e); else if (e.kind === 'zombie') this.poof(e); else this.layDown(e); }
      return;
    }
    if (e.kind === 'corpse') this.poseRisen(e);
    if (z.mode === 'rise') {
      b.velocity.x = b.velocity.z = 0;
      if (this.time - z.t > (e.kind === 'zombie' ? RISE_TIME : 1)) z.mode = 'walk';
      return;
    }
    if (this.time > z.think) { z.think = this.time + 0.4 + this.rand() * 0.3; z.target = this.pickTarget(e); }
    const tg = z.target, q = b.position;
    let tx = 0, tz = -4, stop = 0.5;
    if (tg && tg.p) {
      if (tg.p.rag || !this.ents.includes(tg.p)) { z.target = null; z.think = 0; }
      else { tx = tg.p.body.position.x; tz = tg.p.body.position.z; stop = def.reach * 0.75; }
    } else if (tg && tg.plot) {
      if (!tg.plot.buried) { z.target = null; z.think = 0; }
      else { tx = tg.plot.x; tz = tg.plot.z; stop = 1.5; }
    }
    const dx = tx - q.x, dz = tz - q.z, dist = Math.hypot(dx, dz);
    let dy = Math.atan2(dx, dz) - z.yaw;
    dy = Math.atan2(Math.sin(dy), Math.cos(dy));
    const turn = (dog ? 7 : 3.5) * h;
    z.yaw += Math.max(-turn, Math.min(turn, dy));

    if (z.mode === 'attack') {
      const a = this.attackOf(z);
      if (!z.hit && a >= 0.6) {
        z.hit = true;
        const p = tg && tg.p;
        if (p && !p.rag && dist < def.reach + 0.6) {
          const [k, up] = def.push || (dog ? [2.5, 2] : def.type === ZTYPE.dragger ? [8, 5.5] : [3.8, 3.2]), n = Math.max(dist, 0.01);
          this.toRagdoll(p, new CANNON.Vec3((dx / n) * k, up, (dz / n) * k));
          this.emit('sfx', { name: dog ? 'bark' : 'bonk', pos: [tx, 1, tz] });
          this.emit('toast', { text: dog ? 'Chomp!' : k > 6 ? 'WHAM!' : 'Oof!', pos: [tx, 1.9, tz] });
        }
      }
      if (a >= 1) { z.mode = 'walk'; z.cool = this.time + (def.cool || (dog ? 3 : 2)); }
    // nobody gets hit again the moment they are back on their feet
    } else if (tg && tg.p && dist < def.reach && this.time > z.cool && Math.abs(dy) < 0.6 && this.time - tg.p.upT > 1.5) {
      z.mode = 'attack'; z.t = this.time; z.hit = false;
    }
    if (tg && tg.plot && dist < stop + 0.2) { // scratching at a grave until its tenant comes back out
      z.digT += h;
      if (Math.floor(z.digT / 0.6) !== Math.floor((z.digT - h) / 0.6)) this.emit('sfx', { name: 'dig', pos: [tx, 0, tz] });
      if (z.digT > (tg.plot.nailed ? 12 : 6)) { z.digT = 0; this.unbury(tg.plot); z.target = null; z.think = 0; } // nails hold twice as long
    } else z.digT = Math.max(0, z.digT - h);
    if (this.walkerHazards(e, h)) return; // shoving the fence wears it down; a trap under its feet knocks it over

    let sp = dist > stop ? def.speed : 0;
    if (z.mode === 'attack') sp = dog ? def.speed * 0.7 : 0;
    sp *= Math.max(0, Math.cos(dy));
    const k = Math.min(1, h * 8);
    b.velocity.x += (Math.sin(z.yaw) * sp - b.velocity.x) * k;
    b.velocity.z += (Math.cos(z.yaw) * sp - b.velocity.z) * k;
    z.speed = Math.hypot(b.velocity.x, b.velocity.z);
    z.phase += z.speed * h * (dog ? 5 : 3.2);
    // stuck against something, or down a hole: hop
    z.slow = sp > 0.5 && z.speed < 0.3 ? z.slow + h : 0;
    if ((z.slow > 0.7 || q.y < -0.3) && this.time > z.hop) { z.hop = this.time + 1; z.slow = 0; b.velocity.y = 5.8; b.velocity.x += Math.cos(z.yaw) * 1.5; b.velocity.z -= Math.sin(z.yaw) * 1.5; }
  }
  // knocked off its feet: back to a ragdoll, flying
  knock(e, vx, vy, vz) {
    const z = e.z;
    if (!z || z.mode === 'down') return false;
    if (z.def.split && e.kind === 'zombie') { // two in one coat: the blow knocks them apart, each still good for one more
      const q = z.body.position, x = q.x, y = q.y, zz = q.z;
      this.emit('puff', { pos: [x, y + 0.8, zz], kind: 0 });
      this.removeEnt(e);
      z.def.split.forEach((look, i) => {
        const s = i ? 1 : -1, n = this.spawnZombie(look, x + s * 0.3, zz);
        n.z.mode = 'walk'; n.z.body.position.y = y; n.z.yaw = z.yaw;
        this.knock(n, vx * 0.6 + s * vz * 0.4, vy, vz * 0.6 - s * vx * 0.4);
      });
      return true;
    }
    z.hp--;
    const fly = z.def.fly || 1;
    if (e.kind === 'zombie') {
      const xf = this.zombieXf(e, new Float32Array(NCREW * 7));
      e.rag = this.makeCrewRagdoll(zombieRig(e.look), xf, z.def.mass || (z.def.type === ZTYPE.dog ? 14 : 38));
      for (const b of e.rag.bodies) b.ent = e;
    } else this.ghost(e, false);
    const bodies = this.bodiesOf(e);
    for (const b of bodies) b.velocity.set(vx * fly, vy * fly, vz * fly);
    bodies[0].angularVelocity.set((this.rand() - 0.5) * 9, (this.rand() - 0.5) * 5, (this.rand() - 0.5) * 9);
    this.world.removeBody(z.body);
    z.mode = 'down'; z.t = this.time; z.speed = 0;
    return true;
  }
  standWalker(e) {
    const z = e.z, bodies = this.bodiesOf(e), q = bodies[0].position;
    this.releaseGrabsOn(new Set(bodies));
    z.body.position.set(q.x, Math.max(q.y - 0.12, -PLOT_MAX_DEPTH - 0.1), q.z);
    z.body.velocity.setZero();
    if (e.kind === 'zombie') {
      for (const c of e.rag.constraints) this.world.removeConstraint(c);
      for (const b of bodies) this.world.removeBody(b);
      e.rag = null;
    } else this.ghost(e, true);
    this.world.addBody(z.body);
    z.mode = 'walk'; z.think = 0; z.cool = this.time + 0.8;
  }
  // a risen body goes back to being an ordinary one (it will not get up again tonight)
  layDown(e) {
    const z = e.z;
    if (z.mode !== 'down') { this.ghost(e, false); this.world.removeBody(z.body); }
    e.z = null;
    e.rested = this.nightN;
  }
  poof(e) {
    const q = e.rag ? e.rag.bodies[0].position : e.z.body.position;
    this.emit('sfx', { name: 'poof', pos: [q.x, 0.5, q.z] });
    this.emit('puff', { pos: [q.x, 0.7, q.z], kind: 0 });
    this.removeEnt(e);
  }
  unbury(plot) {
    plot.buried = false;
    this.score = Math.max(0, this.score - 1);
    const m = new THREE.Matrix4().makeTranslation(plot.x, 0.35, plot.z - 0.9).multiply(new THREE.Matrix4().makeRotationX(Math.PI / 2));
    const e = this.spawnCorpse(m, REST_ROTS, plot.seed);
    if (plot.who) { e.outfit = plot.who.outfit; e.tag = plot.who.tag; e.blessed = plot.who.blessed || null; plot.who = null; } // dug up as they were buried
    this.buried = Math.max(0, this.buried - 1);
    plot.unrest = 0;
    plot.nailed = false;
    e.greeted = true;
    this.emit('toast', { text: `${plot.name} is back!`, pos: [plot.x, 2, plot.z], big: true });
    this.riseCorpse(e);
  }

  // ---------- the shovel ----------
  swinging(p) { return this.time - p.swingT < SWING_TIME; }
  // zombies on their feet within a shovel's reach in front of the digger
  whackable(p) {
    const f = this.fwd(p), b = p.body.position, out = [];
    for (const e of this.ents) {
      if (!e.z || e.z.mode === 'down') continue;
      if (e.kind === 'zombie' && e.z.mode === 'rise' && this.time - e.z.t < RISE_TIME * 0.6) continue; // still mostly underground
      const q = e.z.body.position, dx = q.x - b.x, dz = q.z - b.z, d = Math.hypot(dx, dz);
      if (d < SHOVEL_REACH && Math.abs(q.y - b.y) < 1.6 && (d < 0.6 || (dx * f.x + dz * f.z) / d > 0.3)) out.push(e);
    }
    return out;
  }
  // a zombie closing in from the front: the click should be a swing, not a grab at whatever lies nearby
  threatened(p) {
    const f = this.fwd(p), b = p.body.position;
    return this.ents.some((e) => {
      if (!e.z || e.z.mode !== 'walk' && e.z.mode !== 'attack') return false;
      const q = e.z.body.position, dx = q.x - b.x, dz = q.z - b.z, d = Math.hypot(dx, dz);
      return d < 4.5 && (dx * f.x + dz * f.z) / (d + 1e-6) > 0.5;
    });
  }
  whack(p) {
    if (this.time - p.swingT < SWING_TIME + 0.12) return;
    p.swingT = this.time;
    p.swingHit = false;
    this.emit('sfx', { name: 'swish', pos: [p.body.position.x, 1.2, p.body.position.z] });
  }
  landWhack(p) {
    p.swingHit = true;
    const f = this.fwd(p), hit = this.whackable(p);
    for (const e of hit) {
      const q = e.z.body.position;
      this.knock(e, f.x * 6.5 + (this.rand() - 0.5) * 2, 4.2 + this.rand(), f.z * 6.5 + (this.rand() - 0.5) * 2);
      this.emit('toast', { text: this.rand() < 0.5 ? 'BONK!' : 'THWACK!', pos: [q.x, 1.8, q.z] });
      this.emit('puff', { pos: [q.x, q.y + 1.0, q.z], kind: 1 });
    }
    if (hit.length) this.emit('sfx', { name: 'bonk', pos: [p.body.position.x, 1.2, p.body.position.z] });
  }

  // ---------- main loop ----------
  update(dt) {
    this.acc = Math.min(this.acc + dt, STEP * 4);
    while (this.acc >= STEP) { this.step(STEP); this.acc -= STEP; }
    for (const e of this.ents) this.writeXf(e);
  }

  step(h) {
    this.time += h;
    this.updatePhase(h);
    this.updateTruck(h);
    this.updateTraps();
    for (const e of [...this.ents]) if (e.z) this.updateWalker(e, h);
    for (const e of this.ents) if (e.kind === 'digger') this.updatePlayer(e, h);
    for (const e of this.ents) if (e.kind === 'digger' && e.grab) this.updateHand(e, h);
    this.driveHeld(h);
    this.world.step(h);
    this.afterStep(h);
  }

  updatePlayer(p, h) {
    const inp = p.input, last = p.last || (p.last = { g: inp.g, th: inp.th, fl: inp.fl, pk: inp.pk });
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
    const mate = p.grab && p.grab.coffin ? this.holdersOf(p.grab.ent).find((o) => o !== p) : null;
    const soloCoffin = p.grab && p.grab.coffin && !mate;
    let speed = inp.run && !soloCoffin ? 6.2 : 3.6; // no sprinting with a coffin on your own
    if (p.grab) {
      if (p.grab.coffin) speed *= mate ? 0.85 : 0.5;
      else speed *= 0.85;
      // a load that lags behind (stuck, heavy) holds you back instead of stretching forever
      speed *= Math.max(0.15, 1 - Math.max(0, (p.grab.stretch || 0) - 0.3) * 1.2);
    }
    p.digging = !!(inp.dig && !p.grab && p.grounded);
    if (p.digging) speed = 0;
    let tx = (f.x * mz + r.x * mx) * speed, tz = (f.z * mz + r.z * mx) * speed;
    if (soloCoffin) { // too heavy for one: the carrier staggers from side to side
      const t = this.time + p.id * 1.7, sway = (Math.sin(t * 2.3) * 0.75 + Math.sin(t * 3.7) * 0.4) * Math.min(1, Math.hypot(mx, mz));
      tx += r.x * sway; tz += r.z * sway;
    }
    if (mate) { // the coffin between two carriers keeps them a coffin apart: the one behind is towed, the one ahead held back
      const o = mate.body.position, dx = o.x - b.position.x, dz = o.z - b.position.z, d = Math.hypot(dx, dz) || 1;
      const pull = Math.max(-3, Math.min(3, (d - TRAIN) * 4));
      tx += (dx / d) * pull; tz += (dz / d) * pull;
    }
    const k = Math.min(1, h * (!p.grounded ? 3 : p.grab && p.grab.coffin ? 5 : 14));
    b.velocity.x += (tx - b.velocity.x) * k;
    b.velocity.z += (tz - b.velocity.z) * k;
    if (inp.jump && p.grounded && this.time - p.jumpT > 0.35) { b.velocity.y = 5.8; p.jumpT = this.time; }
    p.speed = Math.hypot(b.velocity.x, b.velocity.z);
    p.phase += p.speed * h * 2.6;

    // one button: let go of what you hold, whack a zombie in reach, do the morgue thing in front of you (use the tag
    // or outfit in hand, take a body in at the hatch, take a tag or an outfit), grab what is there, or swing at the air
    if (inp.g !== last.g) {
      last.g = inp.g;
      if (p.grab) this.drop(p, true);
      else if (this.whackable(p).length || this.threatened(p)) this.whack(p);
      else if (!this.morgueKey(p)) { if (this.findGrab(p)) this.grab(p); else this.whack(p); }
    }
    if (!p.swingHit && this.time - p.swingT >= SWING_TIME * 0.35) this.landWhack(p);
    if (inp.th !== last.th) { last.th = inp.th; if (p.choose) p.choose = null; else this.throwHeld(p); }
    // a pick from the outfit choice: pk counts the picks, pv is the outfit (index into OUTFITS)
    if (inp.pk !== last.pk) { last.pk = inp.pk; if (p.choose) this.pickOutfit(p, inp.pv); }

    if (p.digging) this.doWork(p, h); // dig, fill, close a lid, nail it, repair
    else { p.tool = null; p.work = 0; }
  }

  updateHand(p, h) {
    const g = p.grab, hs = this.holdersOf(g.ent), hop = this.time - g.t0 < HOP;
    for (const b of this.bodiesOf(g.ent)) b.wakeUp();
    const lose = (text, sfx = 'slip') => {
      const q = g.body.position;
      this.drop(p);
      this.emit('toast', { text, pos: [q.x, q.y + 0.6, q.z] });
      this.emit('sfx', { name: sfx, pos: [q.x, q.y, q.z] });
    };
    // how far the load is from where it should be: something is in the way, or the other carrier went elsewhere
    if (hs.length > 1) {
      const o = hs.find((e) => e !== p).body.position, q = p.body.position;
      g.stretch = Math.max(0, Math.hypot(o.x - q.x, o.z - q.z) - TRAIN);
    } else g.stretch = hop ? 0 : g.body.position.distanceTo(this.holdTarget(g.ent, hs).pos);
    g.strT = g.stretch > 1.1 ? g.strT + h : 0;
    if (g.strT > 0.35 || g.stretch > 2.4) return lose('Lost my grip!'); // it stayed behind (snagged, or the other carrier left)
    // whipping the camera around swings the load after you instead of teleporting it
    const dy = Math.atan2(Math.sin(p.yaw - g.yaw), Math.cos(p.yaw - g.yaw));
    g.yaw += dy * Math.min(1, h * (g.coffin ? 5 : 10));
    if (g.coffin) {
      // the passenger of a held coffin must not collide with the carrier either, or walking into
      // the coffin would shove the body through its walls
      const inside = this.coffinContents(g.ent);
      if (inside !== g.contents) {
        if (g.contents) this.restores.push({ ent: g.contents, p, t: this.time + 0.45 });
        g.contents = inside;
      }
      if (inside) for (const b of inside.bodies) { b.wakeUp(); b.collisionFilterMask &= ~p.bit; } // a sleeping passenger would pin the coffin
      if (hs.length > 1) { g.grip = Math.min(1, g.grip + 0.5 * h); return; } // two carriers: no trouble at all
      // Alone the arms give out: walking wears the grip down (a full coffin faster), turning and hopping more;
      // stand still to get it back.
      const moving = (p.speed || 0) > 0.5 || !p.grounded;
      const drain = moving ? (inside || g.ent.passenger ? 0.11 : 0.08) + Math.min(p.turn, 8) * 0.03 + (!p.grounded ? 0.6 : 0) : -0.3;
      g.grip = Math.min(1, g.grip - drain * h);
      if (g.grip <= 0) {
        const b = g.body, ax = b.quaternion.vmult(new CANNON.Vec3(0, 0, 1));
        lose('Too heavy!', 'thud');
        if (this.rand() < 0.4) ax.scale(this.rand() < 0.5 ? 3 : -3, ax), b.angularVelocity.vadd(ax, b.angularVelocity); // now and then it rolls over
      }
      return;
    }
    if (g.ent.kind !== 'corpse') return;
    // A body in the arms stays put at a walk. Running, spinning and jumping make it slide out.
    let drain = (p.input.run && p.speed > 3 ? 0.45 : 0) + Math.max(0, Math.min(p.turn, 8) - 2) * 0.04 + (!p.grounded ? 0.4 : 0);
    if (drain > 0 && this.rand() < h * 0.18) drain += (0.45 / h) * this.rand(); // random butterfingers
    g.grip = Math.min(1, g.grip - (drain > 0 ? drain * g.ent.slip : -0.25) * h);
    if (g.grip <= 0) lose(this.rand() < 0.5 ? 'Whoops!' : 'Butterfingers!');
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
      } else if (e.kind === 'zombie') {
        const pos = e.rag ? e.rag.bodies[0].position : e.z.body.position;
        if (pos.y < -8 || Math.abs(pos.x) > 45 || Math.abs(pos.z) > 45) this.removeEnt(e);
      } else if (e.kind === 'corpse' || e.kind === 'coffin') {
        const pos = e.kind === 'corpse' ? e.bodies[0].position : e.body.position;
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
    // a fresh coffin comes in from the stockroom whenever the stock table is clear
    if (Math.floor(this.time / 2) !== Math.floor((this.time - h) / 2)) this.restockCoffin();
    if (Math.floor(this.time * 5) !== Math.floor((this.time - h) * 5)) {
      for (const e of this.ents) if (e.kind === 'digger') { this.checkWardrobe(e); e.hint = this.hintFor(e); e.card = e.rag ? null : this.cardFor(e); }
    }
  }

  corpsesInBed() {
    const tb = this.truck.body.position;
    return this.ents.filter((e) => e.kind === 'corpse' && !e.z).filter((e) => {
      const q = e.bodies[0].position;
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
      if (d < 0.03) { vx = 0; b.position.x = TRUCK_STOP_X; t.state = 'wait'; t.t = this.time; this.emit('sfx', { name: 'honk', pos: [x, 1.5, ROAD_Z] }); 
        this.nails += 6; // each delivery brings a few nails and boards
        this.boards += 2;
        this.emit('toast', { text: 'Hearse at the hatch!', pos: [x, 3.2, ROAD_Z], big: true });
        this.emit('toast', { text: '+6 nails, +2 boards', pos: [MORGUE.crate.x, 1.6, MORGUE.crate.z] });
      }
    } else if (t.state === 'wait') {
      const empty = this.corpsesInBed().length === 0;
      if ((empty && this.time - t.t > 3) || this.time - t.t > 120) {
        t.state = 'leave'; t.t = this.time;
        this.emit('sfx', { name: 'honk', pos: [x, 1.5, ROAD_Z] });
      }
    } else if (t.state === 'leave') {
      vx = -Math.min(8, 0.5 + (this.time - t.t) * 2);
      if (x < -TRUCK_START_X) { t.state = 'away'; t.t = this.time; b.position.x = TRUCK_SPAWN_X; b.aabbNeedsUpdate = true; }
    } else if (t.state === 'away') {
      const corpses = this.ents.filter((e) => e.kind === 'corpse').length;
      if (this.time - t.t > 14 && corpses < MAX_CORPSES - 2 && this.phase === 'day' && this.phaseT < this.dayLen - 35) {
        t.loads++;
        this.spawnLoad(Math.min(5, 2 + Math.ceil(t.loads / 2)));
        t.state = 'arrive';
      }
    }
    b.velocity.set(vx, 0, 0);
    t.cage.position.copy(b.position);
    t.cage.velocity.set(vx, 0, 0);
    t.cage.collisionFilterMask = t.state === 'away' ? 0 : G_PROP; // bodies leave only through the hatch
    t.cage.aabbNeedsUpdate = true;
    t.wheel += (vx * h) / 0.5;
  }

  hintFor(p) {
    if (p.rag) return this.holders(p) ? 'A friend is carrying you. Enjoy the ride.' : 'Press R to get up';
    if (p.grab) {
      if (p.grab.coffin) return this.holders(p.grab.ent) > 1 ? 'Teamwork! Walk in file and drop it into a dug grave.' : 'Heavy! Stand still to rest, or get a friend on the other end.';
      return 'Lay them in a coffin · Click to drop · Right-click to throw';
    }
    if (this.whackable(p).length) return 'Click to whack!';
    const m = this.morgueHint(p);
    if (m) return m;
    const w = this.workTarget(p);
    if (w && w.hint) return w.hint;
    if (this.findGrab(p)) return 'Click to grab';
    if (this.truck.state === 'wait' && this.corpsesInBed().length && !insideMorgue(p.body.position.x, p.body.position.z)) return 'The hearse is here: take the bodies in through the hatch inside the morgue';
    return '';
  }

  // ---------- transforms / snapshots ----------
  diggerPose(p, out) {
    const b = p.body.position;
    this._root.makeRotationY(p.yaw).setPosition(b.x, b.y, b.z); // the bounce of the walk is part of the pose
    this._pose.speed = p.speed || 0; this._pose.phase = p.phase; this._pose.t = this.time + p.id;
    this._pose.carry = p.grab ? (p.grab.coffin ? (this.holders(p.grab.ent) > 1 ? 'coffin2' : 'coffin') : 'corpse') : null;
    this._pose.hold = p.grab ? this.mittenSpots(p) : null;
    this._pose.dig = p.digging; this._pose.air = !p.grounded;
    this._pose.swing = this.swinging(p) ? (this.time - p.swingT) / SWING_TIME : 0;
    return crewPose(crewRig(p.look), this._root, this._pose, out);
  }
  // where the two mittens go on what the digger holds (world space): under a body, on a coffin's side or end
  mittenSpots(p) {
    const g = p.grab, b = g.body, out = this._mitts;
    if (!g.coffin) {
      const f = this.fwd(p), c = b.position;
      for (let i = 0; i < 2; i++) { const s = i ? 0.22 : -0.22; out[i].set(c.x - f.z * s - f.x * 0.1, c.y - 0.14, c.z + f.x * s - f.z * 0.1); }
      return out;
    }
    const loc = new CANNON.Vec3(), w = new CANNON.Vec3();
    for (let i = 0; i < 2; i++) {
      const s = i ? 1 : -1;
      if (g.end) loc.set(s * 0.3, 0.05, g.end * COFFIN.hz);
      else loc.set(Math.sign(b.pointToLocalFrame(p.body.position).x || 1) * COFFIN.hx, 0.05, s * 0.42);
      b.pointToWorldFrame(loc, w);
      out[i].set(w.x, w.y, w.z);
    }
    return out;
  }
  writeXf(e) {
    if (e.kind === 'digger' && !e.rag) { this.diggerPose(e, e.xf); return; }
    if (e.kind === 'zombie' && !e.rag) { this.zombieXf(e, e.xf); return; }
    const bodies = e.kind === 'truck' ? [e.body] : this.bodiesOf(e);
    for (let i = 0; i < bodies.length; i++) {
      const b = bodies[i], o = i * 7, xf = e.xf;
      xf[o] = b.position.x; xf[o + 1] = b.position.y; xf[o + 2] = b.position.z;
      if (b.xfOff) { const d = b.quaternion.vmult(b.xfOff); xf[o] += d.x; xf[o + 1] += d.y; xf[o + 2] += d.z; } // an arm reports its forearm
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
      score: this.score, buried: this.buried, nails: this.nails, boards: this.boards,
      fence: this.fence.map((f) => Math.round(f.hp)),              // per section, 0 = down
      traps: this.traps.map((t) => t.dur * 2 + (t.armed ? 1 : 0)), // snaps left * 2 + armed
      plots: this.plots.map((p) => [+p.depth.toFixed(3), +p.fill.toFixed(3), p.buried ? 1 : 0, p.seed, p.name, p.unrest || 0]),
      truck: [+this.truck.wheel.toFixed(3), this.truck.state === 'wait' ? 1 : 0],
      // night flag, seconds left in this half, day number, light (1 day .. 0 night), zombies on their feet
      phase: [this.phase === 'night' ? 1 : 0, Math.ceil((this.phase === 'day' ? this.dayLen : this.nightLen) - this.phaseT), this.dayN, +this.light().toFixed(3),
        this.ents.filter((e) => e.z).length],
      risen: this.ents.filter((e) => e.kind === 'corpse' && e.z).map((e) => e.id), // bodies that got up: drawn as zombies
      bed: this.corpsesInBed().map((e) => e.id), // bodies riding in the hearse: not drawn (the doors stay shut), counted on the hatch sign
      players: this.ents.filter((e) => e.kind === 'digger').map((e) => ({
        id: e.id, name: e.name, color: e.color, hint: e.hint, rag: !!e.rag, dig: e.digging && (e.tool === 'dig' || e.tool === 'fill'),
        choose: e.choose ? 1 : 0, card: e.card || null, // choose: the outfit choice is open
        sw: this.swinging(e) ? 1 : 0, busy: e.grab ? 1 : 0,
        grip: e.grab && !(e.grab.coffin && this.holders(e.grab.ent) > 1) ? +Math.max(0, e.grab.grip).toFixed(2) : -1, // two on a coffin: nothing to lose
      })),
      ev,
    };
  }
}

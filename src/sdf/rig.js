import * as THREE from 'three';
import * as CANNON from 'cannon-es';

// Runtime for one six-part puppet: procedural animation (idle, walk in place), a tidy five-joint ragdoll,
// and a blend back onto its feet. Every part is a rigid frame (position + quaternion at the part's rest center);
// whoever draws it gets one matrix per part.
export const PART = { body: 0, head: 1, armL: 2, armR: 3, legL: 4, legR: 5 };
const G_GROUND = 1, G_LIMB = 2;
const v = (a) => new THREE.Vector3(a[0], a[1], a[2]);

export class Puppet {
  constructor(def, index, cloud, world, mat, home, yaw) {
    Object.assign(this, { def, index, cloud, world, mat, home: home.clone(), yaw });
    this.base = index * 6;
    const r = def.rig, mirror = (a) => [-a[0], a[1], a[2]];
    const mid = (a, b) => v(a).add(v(b)).multiplyScalar(0.5);
    // rest centers and joint pivots, in the puppet's rest space
    this.rest = [v(r.body.c), v(r.head.c), mid(r.shoulder, r.hand), mid(mirror(r.shoulder), mirror(r.hand)),
      new THREE.Vector3(r.hip[0], r.hip[1] / 2, 0), new THREE.Vector3(-r.hip[0], r.hip[1] / 2, 0)];
    this.pivot = [null, v(r.neck), v(r.shoulder), v(mirror(r.shoulder)), v(r.hip), v(mirror(r.hip))];
    this.pos = this.rest.map(() => new THREE.Vector3());
    this.quat = this.rest.map(() => new THREE.Quaternion());
    this.state = 'anim'; // anim | rag | rise
    this.t = 0;
    this.phase = index * 1.7;
    this.bodies = null;
    this.from = null;
  }

  // ---------- animation ----------
  // Fills `pos` / `quat` with the animated pose. walk 0..1 blends idle into a walk in place.
  pose(time, walk, turn, pos = this.pos, quat = this.quat) {
    const ph = time * 6.2 * (0.9 + (this.index % 3) * 0.08) + this.phase, s = Math.sin(ph);
    const breathe = Math.sin(time * 1.6 + this.phase);
    const root = _root.compose(this.home, _q.setFromEuler(_e.set(0, this.yaw + turn, 0)), ONE);
    const c = this.rest[0];
    // body: bob and waddle about its own center
    _e.set(0.05 * walk + breathe * 0.012, 0, s * 0.07 * walk + Math.sin(time * 0.9 + this.phase) * 0.02 * (1 - walk));
    const body = _body.copy(root).multiply(_a.makeTranslation(c.x, c.y + Math.abs(s) * 0.035 * walk + breathe * 0.006, c.z))
      .multiply(_b.makeRotationFromEuler(_e)).multiply(_a.makeTranslation(-c.x, -c.y, -c.z));
    const rot = [null,
      [-0.05 * walk + Math.sin(time * 1.1 + this.phase) * 0.05, Math.sin(time * 0.7 + this.phase * 2) * 0.22 * (1 - walk * 0.6), -s * 0.06 * walk + Math.sin(time * 0.8 + this.phase) * 0.05],
      [-s * 0.6 * walk + breathe * 0.04, 0, 0.1 + breathe * 0.03], [s * 0.6 * walk - breathe * 0.04, 0, -0.1 - breathe * 0.03],
      [s * 0.65 * walk, 0, 0], [-s * 0.65 * walk, 0, 0]];
    this._frame(body, 0, pos, quat);
    for (let i = 1; i < 6; i++) {
      const j = this.pivot[i];
      _m.copy(body).multiply(_a.makeTranslation(j.x, j.y, j.z)).multiply(_b.makeRotationFromEuler(_e.set(...rot[i]))).multiply(_a.makeTranslation(-j.x, -j.y, -j.z));
      this._frame(_m, i, pos, quat);
    }
  }
  _frame(m, i, pos, quat) {
    pos[i].copy(this.rest[i]).applyMatrix4(m);
    quat[i].setFromRotationMatrix(m);
  }

  // ---------- ragdoll: six bodies, five cone joints ----------
  flop(impulse) {
    if (this.state === 'rag') return;
    const r = this.def.rig, bit = 16 << this.index, others = (16 * 31) & ~bit;
    const mk = (i, mass, limb, add) => {
      const b = new CANNON.Body({
        mass, material: this.mat, linearDamping: 0.06, angularDamping: 0.4,
        collisionFilterGroup: limb ? G_LIMB : bit, collisionFilterMask: limb ? G_GROUND | others : G_GROUND | 16 * 31 | G_LIMB,
      });
      add(b);
      b.position.copy(this.pos[i]);
      b.quaternion.copy(this.quat[i]);
      b.sleepSpeedLimit = 0.2; b.sleepTimeLimit = 1;
      this.world.addBody(b);
      return b;
    };
    const br = Math.min(r.body.r[0], r.body.r[2]) * 0.95, tall = r.body.r[1] - br;
    const armLen = v(r.shoulder).distanceTo(v(r.hand)), legH = r.hip[1] / 2;
    this.bodies = [
      mk(0, 12, false, (b) => { for (const y of tall > 0.04 ? [-tall, tall] : [0]) b.addShape(new CANNON.Sphere(br), new CANNON.Vec3(0, y, 0)); }),
      mk(1, 4, false, (b) => b.addShape(new CANNON.Sphere(r.head.r * 0.97))),
      ...[2, 3].map((i) => mk(i, 1.5, true, (b) => b.addShape(new CANNON.Box(new CANNON.Vec3(r.armR, armLen / 2, r.armR))))),
      ...[4, 5].map((i) => mk(i, 2.2, true, (b) => b.addShape(new CANNON.Box(new CANNON.Vec3(r.legR, legH, r.legR * 1.25))))),
    ];
    this.joints = [];
    for (let i = 1; i < 6; i++) {
      const j = this.pivot[i], up = i === 1;
      const axis = new CANNON.Vec3(0, up ? 1 : -1, 0);
      const c = new CANNON.ConeTwistConstraint(this.bodies[0], this.bodies[i], {
        pivotA: new CANNON.Vec3().copy(_v.copy(j).sub(this.rest[0])), pivotB: new CANNON.Vec3().copy(_v.copy(j).sub(this.rest[i])),
        axisA: axis, axisB: axis.clone(), angle: up ? 0.5 : i < 4 ? 1.35 : 0.9, twistAngle: 0.4, collideConnected: false,
      });
      this.world.addConstraint(c);
      this.joints.push(c);
    }
    for (const b of this.bodies) { b.velocity.set(impulse.x, impulse.y, impulse.z); }
    this.bodies[0].angularVelocity.set((Math.random() - 0.5) * 5, (Math.random() - 0.5) * 3, (Math.random() - 0.5) * 5);
    this.state = 'rag';
    this.t = 0;
  }

  rise() {
    if (this.state !== 'rag') return;
    this.from = { pos: this.pos.map((p) => p.clone()), quat: this.quat.map((q) => q.clone()) };
    for (const c of this.joints) this.world.removeConstraint(c);
    for (const b of this.bodies) this.world.removeBody(b);
    this.bodies = this.joints = null;
    this.state = 'rise';
    this.t = 0;
  }

  // per frame: advance state, write part frames and push the six matrices into the cloud
  update(dt, time, walk, turn) {
    this.t += dt;
    if (this.state === 'rag') {
      for (let i = 0; i < 6; i++) { this.pos[i].copy(this.bodies[i].position); this.quat[i].copy(this.bodies[i].quaternion); }
      if (this.t > 5.5) this.rise();
    } else if (this.state === 'rise') {
      const k = Math.min(1, this.t / 0.75), e = k * k * (3 - 2 * k);
      this.pose(time, walk, turn, _tp, _tq);
      for (let i = 0; i < 6; i++) {
        this.pos[i].lerpVectors(this.from.pos[i], _tp[i], e).y += Math.sin(k * Math.PI) * 0.22; // a little hop onto the feet
        this.quat[i].slerpQuaternions(this.from.quat[i], _tq[i], e);
      }
      if (k >= 1) this.state = 'anim';
    } else this.pose(time, walk, turn);
    for (let i = 0; i < 6; i++) {
      const c = this.rest[i];
      this.cloud.parts[this.base + i].compose(this.pos[i], this.quat[i], ONE).multiply(_a.makeTranslation(-c.x, -c.y, -c.z));
    }
  }
  get center() { return this.pos[0]; }
}

const ONE = new THREE.Vector3(1, 1, 1);
const _root = new THREE.Matrix4(), _body = new THREE.Matrix4(), _m = new THREE.Matrix4(), _a = new THREE.Matrix4(), _b = new THREE.Matrix4();
const _q = new THREE.Quaternion(), _e = new THREE.Euler(), _v = new THREE.Vector3();
const _tp = Array.from({ length: 6 }, () => new THREE.Vector3()), _tq = Array.from({ length: 6 }, () => new THREE.Quaternion());

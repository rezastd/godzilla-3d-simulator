import * as THREE from 'three';

// Procedural Godzilla: hierarchical rig with walk cycle, breathing,
// tail physics, jaw, glowing dorsal spines and blinking eyes.
export class Godzilla {
  constructor(scene, skin) {
    this.scene = scene;
    this.root = new THREE.Group();
    scene.add(this.root);

    this.skinMat = new THREE.MeshStandardMaterial({
      map: skin.map, bumpMap: skin.bump, bumpScale: 1.6,
      roughnessMap: skin.bump, roughness: 0.9, metalness: 0.05,
      color: 0xffffff, emissive: 0xff5511, emissiveMap: skin.cracks, emissiveIntensity: 0.5
    });
    this.bellyMat = new THREE.MeshStandardMaterial({
      map: skin.map, bumpMap: skin.bump, bumpScale: 0.8,
      color: 0xb98d7a, roughness: 0.9, metalness: 0.02,
      emissive: 0xff4400, emissiveMap: skin.cracks, emissiveIntensity: 0.3
    });
    this.spineMat = new THREE.MeshStandardMaterial({
      color: 0x1f0b08, roughness: 0.35, metalness: 0.3,
      emissive: 0xff3d00, emissiveIntensity: 0.55
    });
    this.eyeMat = new THREE.MeshStandardMaterial({
      color: 0xffd34d, emissive: 0xff9500, emissiveIntensity: 2.5, roughness: 0.2
    });

    this.teethMat = new THREE.MeshStandardMaterial({
      color: 0xe8e2cf, roughness: 0.35, metalness: 0.05
    });
    this.clawMat = new THREE.MeshStandardMaterial({
      color: 0x2a2c30, roughness: 0.4, metalness: 0.4
    });

    this.body = new THREE.Group(); // bobs with walk; root stays grounded
    this.root.add(this.body);
    const S = (geo, mat, x, y, z) => {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, y, z);
      m.castShadow = true; m.receiveShadow = true;
      return m;
    };

    // torso stack
    this.hips = S(new THREE.SphereGeometry(3, 24, 18), this.skinMat, 0, 9, -0.5);
    this.hips.scale.set(1.15, 0.9, 0.95);
    this.torso = S(new THREE.SphereGeometry(3.4, 24, 18), this.skinMat, 0, 12.5, 0.2);
    this.torso.scale.set(1, 1.25, 0.95);
    this.chest = S(new THREE.SphereGeometry(3, 24, 18), this.skinMat, 0, 15.5, 0.9);
    this.chest.scale.set(1.02, 1, 0.9);
    const belly = S(new THREE.SphereGeometry(2.9, 20, 14), this.bellyMat, 0, 12.6, 1.5);
    belly.scale.set(0.85, 1.25, 0.7);
    this.body.add(this.hips, this.torso, this.chest, belly);

    // ---- head + jaw ----
    this.neck = new THREE.Group();
    this.neck.position.set(0, 17.6, 1.4);
    this.neck.rotation.x = -0.35;
    this.body.add(this.neck);
    const neckMesh = S(new THREE.CylinderGeometry(1.7, 2.3, 3.6, 14), this.skinMat, 0, 1.4, 0.3);
    this.neck.add(neckMesh);

    this.head = new THREE.Group();
    this.head.position.set(0, 3.2, 0.9);
    this.neck.add(this.head);
    const skull = S(new THREE.SphereGeometry(1.9, 22, 16), this.skinMat, 0, 0.4, 0.6);
    skull.scale.set(1, 0.95, 1.2);
    const snout = S(new THREE.SphereGeometry(1.35, 18, 12), this.skinMat, 0, 0.1, 2.4);
    snout.scale.set(1.15, 0.78, 1.25);
    // brow ridges
    const browG = new THREE.BoxGeometry(0.9, 0.35, 0.7);
    const browL = S(browG, this.skinMat, -0.85, 1.25, 1.15);
    const browR = S(browG, this.skinMat, 0.85, 1.25, 1.15);
    browL.rotation.z = 0.25; browR.rotation.z = -0.25;
    this.eyeL = S(new THREE.SphereGeometry(0.32, 12, 10), this.eyeMat, -0.85, 0.72, 1.75);
    this.eyeR = S(new THREE.SphereGeometry(0.32, 12, 10), this.eyeMat, 0.85, 0.72, 1.75);
    this.head.add(skull, snout, browL, browR, this.eyeL, this.eyeR);
    // upper teeth
    for (let i = 0; i < 7; i++) {
      const a = (i / 6 - 0.5) * 1.7;
      const tooth = S(new THREE.ConeGeometry(0.13, 0.55, 6), this.teethMat,
        Math.sin(a) * 1.25, -0.55, 2.4 + Math.cos(a) * 1.1);
      tooth.rotation.x = Math.PI;
      this.head.add(tooth);
    }
    // jaw (pivot at hinge)
    this.jaw = new THREE.Group();
    this.jaw.position.set(0, -0.55, -0.4);
    this.head.add(this.jaw);
    const jawMesh = S(new THREE.SphereGeometry(1.15, 16, 12), this.skinMat, 0, -0.25, 2.1);
    jawMesh.scale.set(1, 0.55, 1.35);
    this.jaw.add(jawMesh);
    for (let i = 0; i < 5; i++) {
      const a = (i / 4 - 0.5) * 1.3;
      const tooth = S(new THREE.ConeGeometry(0.11, 0.4, 6), this.teethMat,
        Math.sin(a) * 0.95, 0.25, 2.1 + Math.cos(a) * 0.95);
      this.jaw.add(tooth);
    }
    this.jawTip = new THREE.Object3D();
    this.jawTip.position.set(0, -0.2, 3.6);
    this.jaw.add(this.jawTip);
    // burning body light: bathes nearby ground and towers in flickering red
    this.heatLight = new THREE.PointLight(0xff5a1a, 200, 100, 1.8);
    this.heatLight.position.set(0, 11, 0);
    this.body.add(this.heatLight);
    this.mouthLight = new THREE.PointLight(0xff7a2a, 0, 70, 1.8);
    this.mouthLight.position.set(0, 0, 2.5);
    this.head.add(this.mouthLight);
    // ---- dorsal spines: neck -> back -> tail handled in tail chain ----
    this.spines = [];
    const spineGeo = new THREE.ConeGeometry(0.85, 2.4, 4);
    const backCurve = [
      [0, 19.6, -0.6, 1.1], [0, 18.6, -1.8, 1.3], [0, 17.2, -2.8, 1.45],
      [0, 15.4, -3.4, 1.5], [0, 13.4, -3.6, 1.4], [0, 11.4, -3.3, 1.25],
      [0, 9.6, -2.9, 1.05]
    ];
    for (const [x, y, z, s] of backCurve) {
      const sp = new THREE.Mesh(spineGeo, this.spineMat);
      sp.position.set(x, y, z);
      sp.scale.set(s, s * 1.15, s * 0.32);
      sp.rotation.x = -0.18;
      sp.castShadow = true;
      this.body.add(sp);
      this.spines.push(sp);
    }

    // ---- arms ----
    this.armL = this.buildArm(-1); this.armR = this.buildArm(1);

    // ---- legs ----
    this.legL = this.buildLeg(-1); this.legR = this.buildLeg(1);

    // ---- tail: chained segments ----
    this.tailSegs = [];
    let parent = this.body;
    let px = 0, py = 8.6, pz = -3.0;
    const tailR = [2.2, 2.0, 1.8, 1.55, 1.3, 1.05, 0.8, 0.55, 0.35];
    for (let i = 0; i < tailR.length; i++) {
      const pivot = new THREE.Group();
      if (i === 0) pivot.position.set(px, py, pz);
      else pivot.position.set(0, 0, -3.1);
      parent.add(pivot);
      const seg = S(new THREE.SphereGeometry(tailR[i], 16, 12), this.skinMat, 0, 0, -1.55);
      seg.scale.set(1, 0.92, 1.5);
      pivot.add(seg);
      const tsp = new THREE.Mesh(spineGeo, this.spineMat);
      tsp.position.set(0, tailR[i] * 0.85, -1.4);
      const ts = Math.max(0.35, tailR[i] * 0.5);
      tsp.scale.set(ts, ts * 1.2, ts * 0.32);
      pivot.add(tsp);
      this.tailSegs.push(pivot);
      parent = pivot;
    }
    this.tailTip = new THREE.Object3D();
    this.tailTip.position.set(0, 0, -3);
    parent.add(this.tailTip);

    // animation state
    this.walkPhase = 0; this.time = 0;
    this.roarT = 0; this.crouchT = 0; this.beamOn = false; this.charge = 0;
    this.blinkT = 2.5; this.blink = 0;
    this.lastStepSign = 1;
    this.stepEvent = null; // set by main: fn(footWorldPos, strength)
    this._v1 = new THREE.Vector3(); this._v2 = new THREE.Vector3();
  }

  buildArm(side) {
    const g = (geo, mat, x, y, z) => {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, y, z); m.castShadow = true; return m;
    };
    const shoulder = new THREE.Group();
    shoulder.position.set(side * 2.9, 14.6, 1.1);
    this.body.add(shoulder);
    const upper = g(new THREE.CylinderGeometry(0.62, 0.75, 3, 10), this.skinMat, 0, -1.4, 0);
    shoulder.add(upper);
    const elbow = new THREE.Group(); elbow.position.set(0, -2.9, 0);
    shoulder.add(elbow);
    const fore = g(new THREE.CylinderGeometry(0.45, 0.6, 2.6, 10), this.skinMat, 0, -1.2, 0);
    elbow.add(fore);
    for (let c = 0; c < 3; c++) {
      const claw = g(new THREE.ConeGeometry(0.14, 0.7, 6), this.clawMat,
        (c - 1) * 0.35, -2.7, 0.25);
      claw.rotation.x = Math.PI * 0.55;
      elbow.add(claw);
    }
    shoulder.rotation.z = side * -0.35;
    shoulder.rotation.x = 0.25;
    elbow.rotation.x = -0.7;
    return { shoulder, elbow };
  }

  buildLeg(side) {
    const g = (geo, mat, x, y, z) => {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; return m;
    };
    const hip = new THREE.Group();
    hip.position.set(side * 1.9, 8.2, -0.2);
    this.body.add(hip);
    const thigh = g(new THREE.CylinderGeometry(1.15, 1.55, 4.5, 12), this.skinMat, 0, -2, 0);
    hip.add(thigh);
    const knee = new THREE.Group(); knee.position.set(0, -4.2, 0);
    hip.add(knee);
    const shin = g(new THREE.CylinderGeometry(0.85, 1.1, 4, 12), this.skinMat, 0, -1.8, 0);
    knee.add(shin);
    const foot = g(new THREE.BoxGeometry(2.2, 1.1, 3.6), this.skinMat, 0, -3.9, 0.9);
    knee.add(foot);
    for (let c = 0; c < 3; c++) {
      const claw = g(new THREE.ConeGeometry(0.28, 1.1, 6), this.clawMat,
        (c - 1) * 0.8, -4.1, 2.9);
      claw.rotation.x = Math.PI / 2;
      knee.add(claw);
    }
    return { hip, knee, foot, side };
  }
  roar() { if (this.roarT <= 0) { this.roarT = 2.4; return true; } return false; }
  stomp() { this.crouchT = 0.55; }
  setBeam(on) { this.beamOn = on; }

  footWorld(leg, out) {
    out.set(0, -3.9, 0.9);
    return leg.knee.localToWorld(out);
  }
  mouthWorld(out) { return this.jawTip.getWorldPosition(out); }
  aimDir(out) {
    out.set(0, 0, 1).applyQuaternion(this.root.quaternion);
    out.y = 0.02;
    return out.normalize();
  }

  update(dt, speedNorm) {
    this.time += dt;
    const moving = Math.min(1, speedNorm);
    this.walkPhase += dt * (2.2 + 5.2 * moving);
    if (this.roarT > 0) this.roarT -= dt;
    if (this.crouchT > 0) this.crouchT -= dt;
    const roarK = this.roarT > 0 ? Math.min(1, this.roarT * 1.5) * Math.min(1, (2.4 - this.roarT) * 4) : 0;
    const amp = 0.12 + 0.5 * moving;

    // legs: opposite swing + knee bend
    const s = Math.sin(this.walkPhase);
    this.legL.hip.rotation.x = s * 0.62 * amp;
    this.legR.hip.rotation.x = -s * 0.62 * amp;
    this.legL.knee.rotation.x = Math.max(0, -s) * 0.9 * amp + 0.06;
    this.legR.knee.rotation.x = Math.max(0, s) * 0.9 * amp + 0.06;

    // footstep events when a foot plants
    const sign = s > 0 ? 1 : -1;
    if (moving > 0.25 && sign !== this.lastStepSign) {
      this.lastStepSign = sign;
      if (this.stepEvent) {
        const leg = sign > 0 ? this.legL : this.legR;
        this.stepEvent(this.footWorld(leg, this._v1), 0.35 + moving * 0.65);
      }
    }

    // torso: bob, sway, crouch, breathe
    const crouch = this.crouchT > 0 ? Math.sin(Math.min(1, this.crouchT / 0.55) * Math.PI) * 1.4 : 0;
    this.body.position.y = Math.abs(Math.cos(this.walkPhase)) * 0.7 * moving
      + Math.sin(this.time * 1.1) * 0.18 - crouch;
    this.body.rotation.z = Math.sin(this.walkPhase) * 0.035 * (0.3 + moving);
    this.body.rotation.x = moving * 0.06 - crouch * 0.03 + roarK * -0.06;
    const breathe = 1 + Math.sin(this.time * 2.1) * 0.008;
    this.chest.scale.set(1.02 * breathe, 1 * breathe, 0.9 * breathe);

    // arms counter-swing
    this.armL.shoulder.rotation.x = 0.25 - s * 0.4 * amp;
    this.armR.shoulder.rotation.x = 0.25 + s * 0.4 * amp;

    // tail: traveling wave, lifts with speed
    for (let i = 0; i < this.tailSegs.length; i++) {
      const seg = this.tailSegs[i];
      seg.rotation.y = Math.sin(this.time * 1.4 - i * 0.55) * 0.16;
      seg.rotation.x = 0.02 + moving * 0.035 - crouch * 0.01;
    }

    // head: roar rears up, beam aims level, else look with sway
    const targetHeadX = this.beamOn ? -0.32 : (-0.06 + roarK * -0.5 + Math.sin(this.time * 0.7) * 0.04);
    this.head.rotation.x += (targetHeadX - this.head.rotation.x) * Math.min(1, dt * 5);
    this.head.rotation.y = Math.sin(this.time * 0.45) * 0.12 * (1 - roarK);
    const targetJaw = 0.06 + Math.sin(this.time * 0.9) * 0.03 + roarK * 0.8 + (this.beamOn ? 0.55 : 0);
    this.jaw.rotation.x += (targetJaw - this.jaw.rotation.x) * Math.min(1, dt * (this.beamOn ? 8 : 4));

    // molten glow: breathing heat shimmer, charge up on beam, flash on roar
    const targetGlow = 0.55 + (this.beamOn ? 3.2 : 0) + roarK * 1.6;
    this.charge += (targetGlow - this.charge) * Math.min(1, dt * (this.beamOn ? 3 : 5));
    this.spineMat.emissiveIntensity = this.charge + Math.sin(this.time * 40) * 0.12 * (this.beamOn ? 1 : 0);
    const heatPulse = Math.sin(this.time * 3.2) * 0.1 + Math.sin(this.time * 9.7) * 0.06;
    this.skinMat.emissiveIntensity = 0.5 + heatPulse + roarK * 0.7 + (this.beamOn ? 1.1 : 0);
    this.bellyMat.emissiveIntensity = 0.3 + heatPulse * 0.6 + roarK * 0.4 + (this.beamOn ? 0.7 : 0);
    this.heatLight.intensity = 190 + Math.sin(this.time * 23) * 40 + Math.sin(this.time * 47) * 25
      + this.charge * 120;
    this.mouthLight.intensity = roarK * 220 + (this.beamOn ? 500 : 0);

    // blink
    this.blinkT -= dt;
    if (this.blinkT <= 0) { this.blinkT = 2 + Math.random() * 3; this.blink = 0.14; }
    if (this.blink > 0) this.blink -= dt;
    const eyeSY = this.blink > 0 ? 0.12 : 1;
    this.eyeL.scale.set(1, eyeSY, 1); this.eyeR.scale.set(1, eyeSY, 1);
  }
}

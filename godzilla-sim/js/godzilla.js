import * as THREE from 'three';

// Hyper-Realistic Godzilla: Anatomically proportioned kaiju rig with
// predatory theropod posture, crocodilian skull & jaw, ivory fangs,
// muscular forward-reaching clawed arms, dinosaurian taloned feet,
// dynamic articulated tail, and iconic knife-sharp obsidian dorsal plates.

export class Godzilla {
  constructor(scene, skin, spineTex = null) {
    this.scene = scene;
    this.root = new THREE.Group();
    scene.add(this.root);

    // Photorealistic PBR Materials
    this.skinMat = new THREE.MeshStandardMaterial({
      map: skin.map,
      bumpMap: skin.bump,
      bumpScale: 1.5,
      roughness: 0.58,
      metalness: 0.22,
      color: 0xffffff,
      emissive: 0xff3808,
      emissiveMap: skin.cracks,
      emissiveIntensity: 0.1 // very subtle embers at rest, surges during charge
    });

    this.bellyMat = new THREE.MeshStandardMaterial({
      map: skin.map,
      bumpMap: skin.bump,
      bumpScale: 0.9,
      roughness: 0.62,
      metalness: 0.15,
      color: 0x9b857a,
      emissive: 0xff2500,
      emissiveMap: skin.cracks,
      emissiveIntensity: 0.08
    });

    // Dark obsidian dorsal plates with radioactive molten core
    this.spineMat = new THREE.MeshStandardMaterial({
      map: spineTex,
      emissiveMap: spineTex,
      color: 0x181a20,
      roughness: 0.42,
      metalness: 0.55,
      emissive: 0xff4400,
      emissiveIntensity: 0.15 // surges to 4.2 during atomic breath
    });

    // Wet reptilian eye with slit pupil
    this.eyeMat = new THREE.MeshStandardMaterial({
      color: 0xffaa22,
      emissive: 0xff7700,
      emissiveIntensity: 1.8,
      roughness: 0.12,
      metalness: 0.2
    });

    this.teethMat = new THREE.MeshStandardMaterial({
      color: 0xeee6d6,
      roughness: 0.32,
      metalness: 0.05
    });

    this.clawMat = new THREE.MeshStandardMaterial({
      color: 0x14161a,
      roughness: 0.28,
      metalness: 0.65
    });

    this.body = new THREE.Group();
    this.body.rotation.x = 0.12; // Natural forward-leaning theropod posture
    this.root.add(this.body);

    const S = (geo, mat, x, y, z) => {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, y, z);
      m.castShadow = true;
      m.receiveShadow = true;
      return m;
    };

    // ---------- Torso & Anatomy ----------
    // Massive Pelvis / Hips
    this.hips = S(new THREE.SphereGeometry(3.4, 28, 20), this.skinMat, 0, 9.4, -0.6);
    this.hips.scale.set(1.25, 0.95, 1.15);

    // Abdomen / Midsection
    this.torso = S(new THREE.SphereGeometry(3.6, 28, 20), this.skinMat, 0, 13.0, 0.2);
    this.torso.scale.set(1.12, 1.25, 1.05);

    // Muscular Upper Chest & Pectoral Plates
    this.chest = S(new THREE.SphereGeometry(3.5, 28, 20), this.skinMat, 0, 16.2, 0.9);
    this.chest.scale.set(1.15, 1.05, 1.0);

    // Powerful Trapezius / Dorsal Ridge Hump
    const trapezius = S(new THREE.SphereGeometry(2.9, 24, 18), this.skinMat, 0, 17.2, -0.8);
    trapezius.scale.set(1.08, 0.95, 0.9);

    // Armored Belly Gastralia Scutes
    const belly = S(new THREE.SphereGeometry(3.1, 24, 18), this.bellyMat, 0, 13.0, 1.6);
    belly.scale.set(0.9, 1.25, 0.7);

    this.body.add(this.hips, this.torso, this.chest, trapezius, belly);

    // ---------- Neck & Crocodilian Head ----------
    this.neck = new THREE.Group();
    this.neck.position.set(0, 18.2, 1.2);
    this.neck.rotation.x = -0.22;
    this.body.add(this.neck);

    const neckLower = S(new THREE.CylinderGeometry(2.0, 2.7, 2.8, 20), this.skinMat, 0, 1.1, 0.1);
    const neckUpper = S(new THREE.CylinderGeometry(1.7, 2.1, 2.6, 20), this.skinMat, 0, 2.8, 0.4);
    neckUpper.rotation.x = 0.12;
    this.neck.add(neckLower, neckUpper);

    this.head = new THREE.Group();
    this.head.position.set(0, 4.2, 0.85);
    this.neck.add(this.head);

    // Sculpted Theropod / Crocodilian Cranium
    const skull = S(new THREE.SphereGeometry(2.1, 26, 18), this.skinMat, 0, 0.45, 0.5);
    skull.scale.set(1.02, 0.92, 1.25);

    // Rounded Crocodilian Snout
    const snout = S(new THREE.SphereGeometry(1.45, 22, 16), this.skinMat, 0, 0.15, 2.3);
    snout.scale.set(1.08, 0.76, 1.35);

    // Nostrils on snout tip
    const nostrilL = S(new THREE.SphereGeometry(0.18, 10, 8), this.skinMat, -0.42, 0.42, 3.8);
    const nostrilR = S(new THREE.SphereGeometry(0.18, 10, 8), this.skinMat, 0.42, 0.42, 3.8);

    // Heavy Supraorbital Brow Ridges
    const browGeo = new THREE.BoxGeometry(0.9, 0.35, 1.0);
    const browL = S(browGeo, this.skinMat, -0.88, 0.85, 1.4);
    const browR = S(browGeo, this.skinMat, 0.88, 0.85, 1.4);
    browL.rotation.z = 0.22;
    browL.rotation.y = 0.15;
    browR.rotation.z = -0.22;
    browR.rotation.y = -0.15;

    // Menacing glowing amber eyes
    this.eyeL = S(new THREE.SphereGeometry(0.32, 16, 12), this.eyeMat, -0.88, 0.62, 1.5);
    this.eyeR = S(new THREE.SphereGeometry(0.32, 16, 12), this.eyeMat, 0.88, 0.62, 1.5);

    this.head.add(skull, snout, nostrilL, nostrilR, browL, browR, this.eyeL, this.eyeR);

    // Upper predator fangs
    const toothGeo = new THREE.ConeGeometry(0.12, 0.65, 8);
    toothGeo.translate(0, -0.3, 0);
    for (let i = 0; i < 9; i++) {
      const a = (i / 8 - 0.5) * 1.8;
      const tooth = S(toothGeo, this.teethMat,
        Math.sin(a) * 1.25, -0.38, 2.2 + Math.cos(a) * 1.25);
      tooth.rotation.x = Math.PI - 0.18;
      tooth.rotation.z = a * 0.28;
      this.head.add(tooth);
    }

    // Articulated Lower Jaw
    this.jaw = new THREE.Group();
    this.jaw.position.set(0, -0.45, -0.1);
    this.head.add(this.jaw);

    const jawBase = S(new THREE.SphereGeometry(1.25, 20, 14), this.skinMat, 0, -0.18, 2.1);
    jawBase.scale.set(0.95, 0.52, 1.4);
    this.jaw.add(jawBase);

    // Tongue & Throat
    const tongue = S(new THREE.SphereGeometry(0.55, 14, 10), new THREE.MeshStandardMaterial({
      color: 0x3d1414, roughness: 0.5
    }), 0, 0.1, 1.7);
    tongue.scale.set(0.85, 0.2, 1.4);
    this.jaw.add(tongue);

    // Lower predator fangs
    for (let i = 0; i < 7; i++) {
      const a = (i / 6 - 0.5) * 1.45;
      const tooth = S(toothGeo, this.teethMat,
        Math.sin(a) * 1.05, 0.22, 2.0 + Math.cos(a) * 1.05);
      tooth.rotation.x = 0.22;
      tooth.rotation.z = -a * 0.25;
      this.jaw.add(tooth);
    }

    this.jawTip = new THREE.Object3D();
    this.jawTip.position.set(0, -0.1, 3.8);
    this.jaw.add(this.jawTip);

    // Core heat light illuminating ground beneath Godzilla
    this.heatLight = new THREE.PointLight(0xff5511, 140, 90, 1.8);
    this.heatLight.position.set(0, 11, 0);
    this.body.add(this.heatLight);

    // Throat fire light
    this.mouthLight = new THREE.PointLight(0xff7722, 0, 80, 1.7);
    this.mouthLight.position.set(0, 0, 2.4);
    this.head.add(this.mouthLight);

    // ---------- Iconic Multi-Row Serrated Maple-Leaf Dorsal Plates ----------
    const plateGeo = this.createDorsalPlateGeometry();

    this.spines = [];

    // Central Row: Massive jagged plates from nape to lower spine
    const centralPlates = [
      [0, 20.2, -0.8, 1.1, -0.22],
      [0, 19.2, -1.9, 1.45, -0.18],
      [0, 18.0, -3.0, 1.85, -0.15],
      [0, 16.2, -3.8, 2.15, -0.12],
      [0, 14.1, -4.1, 2.25, -0.08],
      [0, 12.0, -3.9, 2.05, -0.04],
      [0, 10.0, -3.5, 1.75, 0.0],
      [0, 8.4, -3.2, 1.45, 0.05]
    ];

    for (const [x, y, z, s, rx] of centralPlates) {
      const sp = new THREE.Mesh(plateGeo, this.spineMat);
      sp.position.set(x, y, z);
      sp.rotation.y = Math.PI / 2;
      sp.rotation.z = -rx;
      sp.scale.set(s * 0.75, s, s * 0.22);
      sp.castShadow = true;
      this.body.add(sp);
      this.spines.push(sp);
    }

    // Left & Right Flanking Rows: Staggered secondary fins
    const flankPlates = [
      [18.7, -1.7, 0.95],
      [17.1, -2.8, 1.25],
      [15.2, -3.4, 1.45],
      [13.4, -3.6, 1.40],
      [11.5, -3.3, 1.20],
      [9.6, -2.8, 0.95]
    ];

    for (const [y, z, s] of flankPlates) {
      // Left fin
      const spL = new THREE.Mesh(plateGeo, this.spineMat);
      spL.position.set(-1.05, y, z);
      spL.rotation.y = Math.PI / 2 + 0.22;
      spL.rotation.x = -0.18;
      spL.scale.set(s * 0.65, s * 0.82, s * 0.18);
      spL.castShadow = true;
      this.body.add(spL);
      this.spines.push(spL);

      // Right fin
      const spR = new THREE.Mesh(plateGeo, this.spineMat);
      spR.position.set(1.05, y, z);
      spR.rotation.y = Math.PI / 2 - 0.22;
      spR.rotation.x = 0.18;
      spR.scale.set(s * 0.65, s * 0.82, s * 0.18);
      spR.castShadow = true;
      this.body.add(spR);
      this.spines.push(spR);
    }

    // ---------- Muscular Predatory Arms & Forward-Reaching Claws ----------
    this.armL = this.buildArm(-1);
    this.armR = this.buildArm(1);

    // ---------- Muscular Dinosaurian Legs & Talons ----------
    this.legL = this.buildLeg(-1);
    this.legR = this.buildLeg(1);

    // ---------- 14-Segment Articulated Serpentine Tail ----------
    this.tailSegs = [];
    let parent = this.body;
    let px = 0, py = 8.6, pz = -3.2;
    const tailRadii = [2.4, 2.2, 2.0, 1.8, 1.6, 1.4, 1.2, 1.0, 0.85, 0.7, 0.55, 0.42, 0.32, 0.22];

    for (let i = 0; i < tailRadii.length; i++) {
      const pivot = new THREE.Group();
      if (i === 0) pivot.position.set(px, py, pz);
      else pivot.position.set(0, 0, -2.6);
      parent.add(pivot);

      const r = tailRadii[i];
      const seg = S(new THREE.SphereGeometry(r, 18, 14), this.skinMat, 0, 0, -1.3);
      seg.scale.set(1.0, 0.92, 1.45);
      pivot.add(seg);

      if (i < 11) {
        const tsp = new THREE.Mesh(plateGeo, this.spineMat);
        tsp.position.set(0, r * 0.88, -1.1);
        const ts = Math.max(0.4, r * 0.7);
        tsp.rotation.y = Math.PI / 2;
        tsp.rotation.z = -0.15;
        tsp.scale.set(ts * 0.7, ts, ts * 0.2);
        tsp.castShadow = true;
        pivot.add(tsp);
        this.spines.push(tsp);
      }

      this.tailSegs.push(pivot);
      parent = pivot;
    }

    this.tailTip = new THREE.Object3D();
    this.tailTip.position.set(0, 0, -2.5);
    parent.add(this.tailTip);

    // Animation & Kinematics State
    this.walkPhase = 0;
    this.time = 0;
    this.roarT = 0;
    this.crouchT = 0;
    this.beamOn = false;
    this.charge = 0;
    this.blinkT = 3.0;
    this.blink = 0;
    this.lastStepSign = 1;
    this.stepEvent = null;
    this._v1 = new THREE.Vector3();
    this._v2 = new THREE.Vector3();
  }

  createDorsalPlateGeometry() {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.lineTo(0.35, 0.35);
    s.lineTo(0.75, 0.45);
    s.lineTo(0.5, 0.95);
    s.lineTo(0.95, 1.25);
    s.lineTo(0.6, 1.75);
    s.lineTo(0.9, 2.2);
    s.lineTo(0.45, 2.6);
    s.lineTo(0.55, 3.1);
    s.lineTo(0.15, 3.45);
    s.lineTo(0.0, 3.8); // Tall central tip
    s.lineTo(-0.15, 3.45);
    s.lineTo(-0.55, 3.1);
    s.lineTo(-0.45, 2.6);
    s.lineTo(-0.9, 2.2);
    s.lineTo(-0.6, 1.75);
    s.lineTo(-0.95, 1.25);
    s.lineTo(-0.5, 0.95);
    s.lineTo(-0.75, 0.45);
    s.lineTo(-0.35, 0.35);
    s.closePath();

    const extrudeSettings = {
      steps: 1,
      depth: 0.28,
      bevelEnabled: true,
      bevelThickness: 0.14,
      bevelSize: 0.12,
      bevelSegments: 2
    };
    const geo = new THREE.ExtrudeGeometry(s, extrudeSettings);
    geo.center();
    return geo;
  }

  buildArm(side) {
    const g = (geo, mat, x, y, z) => {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, y, z);
      m.castShadow = true;
      m.receiveShadow = true;
      return m;
    };

    const shoulder = new THREE.Group();
    shoulder.position.set(side * 3.3, 15.6, 1.2);
    this.body.add(shoulder);

    // Powerful Upper Arm (Deltoid & Bicep)
    const upperArm = g(new THREE.CylinderGeometry(0.8, 1.0, 3.2, 16), this.skinMat, 0, -1.5, 0);
    shoulder.add(upperArm);

    const elbow = new THREE.Group();
    elbow.position.set(0, -3.0, 0);
    shoulder.add(elbow);

    // Muscular Forearm reaching forward aggressively
    const forearm = g(new THREE.CylinderGeometry(0.65, 0.82, 2.8, 16), this.skinMat, 0, -1.2, 0.8);
    forearm.rotation.x = 0.75;
    elbow.add(forearm);

    // Hand & 4 Spread Predator Talons reaching forward
    const clawGeo = new THREE.ConeGeometry(0.18, 0.95, 8);
    for (let c = 0; c < 4; c++) {
      const claw = g(clawGeo, this.clawMat,
        (c - 1.5) * 0.4, -2.2, 1.9 + Math.sin(c * 0.9) * 0.15);
      claw.rotation.x = Math.PI * 0.45;
      elbow.add(claw);
    }

    shoulder.rotation.z = side * -0.25;
    shoulder.rotation.x = 0.35;
    shoulder.rotation.y = side * 0.25;
    return { shoulder, elbow };
  }

  buildLeg(side) {
    const g = (geo, mat, x, y, z) => {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, y, z);
      m.castShadow = true;
      m.receiveShadow = true;
      return m;
    };

    const hip = new THREE.Group();
    hip.position.set(side * 2.3, 8.8, -0.3);
    this.body.add(hip);

    // Muscular Thigh
    const thigh = g(new THREE.CylinderGeometry(1.45, 1.95, 4.8, 18), this.skinMat, 0, -2.2, 0);
    thigh.scale.set(1.15, 1.0, 1.2);
    hip.add(thigh);

    const knee = new THREE.Group();
    knee.position.set(0, -4.6, 0);
    hip.add(knee);

    // Armored Kneecap Plate
    const kneeCap = g(new THREE.SphereGeometry(0.9, 14, 10), this.skinMat, 0, 0.2, 1.35);
    kneeCap.scale.set(0.9, 0.85, 0.65);
    knee.add(kneeCap);

    // Muscular Calf / Lower Leg
    const shin = g(new THREE.CylinderGeometry(1.1, 1.5, 4.4, 18), this.skinMat, 0, -2.0, 0);
    shin.scale.set(1.05, 1.0, 1.15);
    knee.add(shin);

    // Ankle / Metatarsal Base
    const ankle = g(new THREE.BoxGeometry(2.4, 1.4, 2.6), this.skinMat, 0, -3.8, 0.4);
    knee.add(ankle);

    // Three Realistic Theropod Front Toes with Black Curved Talons
    const toeGeo = new THREE.BoxGeometry(0.7, 0.9, 2.0);
    const talonGeo = new THREE.ConeGeometry(0.3, 1.3, 8);
    talonGeo.translate(0, 0.65, 0);

    const toeAngles = [-0.26, 0, 0.26];
    for (let c = 0; c < 3; c++) {
      const a = toeAngles[c];
      const ox = (c - 1) * 0.95;

      const toe = g(toeGeo, this.skinMat, ox, -4.1, 1.9);
      toe.rotation.y = a;
      knee.add(toe);

      const talon = g(talonGeo, this.clawMat,
        ox + Math.sin(a) * 1.5, -4.2, 2.7 + Math.cos(a) * 0.9);
      talon.rotation.x = Math.PI / 2 + 0.15;
      talon.rotation.y = a;
      knee.add(talon);
    }

    // Rear Heel Dewclaw
    const heelTalon = g(talonGeo, this.clawMat, 0, -4.0, -1.3);
    heelTalon.rotation.x = -Math.PI / 2 - 0.2;
    heelTalon.scale.set(0.75, 0.75, 0.75);
    knee.add(heelTalon);

    return { hip, knee, side };
  }

  roar() {
    if (this.roarT <= 0) {
      this.roarT = 2.4;
      return true;
    }
    return false;
  }

  stomp() {
    this.crouchT = 0.6;
  }

  setBeam(on) {
    this.beamOn = on;
  }

  footWorld(leg, out) {
    out.set(0, -4.2, 1.5);
    return leg.knee.localToWorld(out);
  }

  mouthWorld(out) {
    return this.jawTip.getWorldPosition(out);
  }

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

    const roarK = this.roarT > 0
      ? Math.min(1, this.roarT * 1.6) * Math.min(1, (2.4 - this.roarT) * 4)
      : 0;
    const amp = 0.12 + 0.5 * moving;

    // Legs: Opposite swing kinematics + natural knee bend
    const s = Math.sin(this.walkPhase);
    this.legL.hip.rotation.x = s * 0.65 * amp;
    this.legR.hip.rotation.x = -s * 0.65 * amp;
    this.legL.knee.rotation.x = Math.max(0, -s) * 0.95 * amp + 0.08;
    this.legR.knee.rotation.x = Math.max(0, s) * 0.95 * amp + 0.08;

    // Footstep plant detection
    const sign = s > 0 ? 1 : -1;
    if (moving > 0.22 && sign !== this.lastStepSign) {
      this.lastStepSign = sign;
      if (this.stepEvent) {
        const leg = sign > 0 ? this.legL : this.legR;
        this.stepEvent(this.footWorld(leg, this._v1), 0.4 + moving * 0.6);
      }
    }

    // Torso: Heavy breathing, physical sway, walking bob, and roar rearing
    const crouch = this.crouchT > 0
      ? Math.sin(Math.min(1, this.crouchT / 0.6) * Math.PI) * 1.5
      : 0;

    this.body.position.y = Math.abs(Math.cos(this.walkPhase)) * 0.75 * moving
      + Math.sin(this.time * 1.2) * 0.2 - crouch;
    this.body.rotation.z = Math.sin(this.walkPhase) * 0.04 * (0.35 + moving);
    this.body.rotation.x = 0.12 + moving * 0.065 - crouch * 0.035 + roarK * -0.09;

    // Breathing ribcage expansion
    const breathe = 1 + Math.sin(this.time * 2.2) * 0.012;
    this.chest.scale.set(1.15 * breathe, 1.05 * breathe, 1.0 * breathe);

    // Arms counter-swing with predatory claw tension
    this.armL.shoulder.rotation.x = 0.45 - s * 0.42 * amp;
    this.armR.shoulder.rotation.x = 0.45 + s * 0.42 * amp;
    this.armL.shoulder.rotation.z = -0.28 + Math.sin(this.time * 2) * 0.04;
    this.armR.shoulder.rotation.z = 0.28 - Math.sin(this.time * 2) * 0.04;

    // Tail: Dynamic serpentine traveling wave that reacts to walking momentum & drag
    for (let i = 0; i < this.tailSegs.length; i++) {
      const seg = this.tailSegs[i];
      const waveFreq = 1.6;
      const wavePhase = this.time * waveFreq - i * 0.48;
      seg.rotation.y = Math.sin(wavePhase) * (0.14 + moving * 0.08);
      seg.rotation.x = 0.025 + moving * 0.04 - crouch * 0.012 + Math.sin(this.time * 2.2 + i * 0.3) * 0.015;
    }

    // Head: Rears up menacingly on roar, locks level on beam
    const targetHeadX = this.beamOn
      ? -0.28
      : (-0.08 + roarK * -0.55 + Math.sin(this.time * 0.8) * 0.04);
    this.head.rotation.x += (targetHeadX - this.head.rotation.x) * Math.min(1, dt * 5.5);
    this.head.rotation.y = Math.sin(this.time * 0.5) * 0.12 * (1 - roarK);

    // Articulated Jaw: Snaps wide open on roar and during thermonuclear breath
    const targetJaw = 0.08 + Math.sin(this.time * 0.95) * 0.035 + roarK * 0.85 + (this.beamOn ? 0.62 : 0);
    this.jaw.rotation.x += (targetJaw - this.jaw.rotation.x) * Math.min(1, dt * (this.beamOn ? 8.5 : 4.5));

    // ---------- Thermonuclear Energy Charge & Dorsal Fin Glow ----------
    // Spines stay dark obsidian at rest (0.15), surge to blinding nuclear blaze (4.2) on beam!
    const targetGlow = 0.15 + (this.beamOn ? 4.2 : 0) + roarK * 1.8;
    this.charge += (targetGlow - this.charge) * Math.min(1, dt * (this.beamOn ? 4.0 : 5.0));

    const spineFlicker = Math.sin(this.time * 50) * 0.18 * (this.beamOn ? 1 : 0);
    this.spineMat.emissiveIntensity = this.charge + spineFlicker;

    // Glowing magma veins beneath scales
    const heatPulse = Math.sin(this.time * 3.4) * 0.06 + Math.sin(this.time * 9.5) * 0.03;
    this.skinMat.emissiveIntensity = 0.08 + heatPulse + roarK * 0.6 + (this.beamOn ? 1.4 : 0);
    this.bellyMat.emissiveIntensity = 0.06 + heatPulse * 0.5 + roarK * 0.4 + (this.beamOn ? 0.9 : 0);

    // Dynamic creature heat lights
    this.heatLight.intensity = 110 + Math.sin(this.time * 24) * 30 + this.charge * 160;
    this.mouthLight.intensity = roarK * 280 + (this.beamOn ? 700 : 0);

    // Natural reptilian eye blinking
    this.blinkT -= dt;
    if (this.blinkT <= 0) {
      this.blinkT = 2.5 + Math.random() * 3.5;
      this.blink = 0.15;
    }
    if (this.blink > 0) this.blink -= dt;
    const eyeSY = this.blink > 0 ? 0.1 : 1.0;
    this.eyeL.scale.set(1.0, eyeSY, 1.0);
    this.eyeR.scale.set(1.0, eyeSY, 1.0);
  }
}

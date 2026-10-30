import * as THREE from 'three';

// Hyper-Realistic Movie Godzilla:
// Seamless lofted muscular torso, sculpted crocodilian skull and articulated jaw,
// overlapping armored tail scutes, muscular brawler arms, tree-trunk theropod legs,
// and iconic jagged coral/maple-leaf obsidian dorsal plates.

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
      metalness: 0.2,
      color: 0xffffff,
      emissive: 0xff3808,
      emissiveMap: skin.cracks,
      emissiveIntensity: 0.08
    });

    this.bellyMat = new THREE.MeshStandardMaterial({
      map: skin.map,
      bumpMap: skin.bump,
      bumpScale: 1.0,
      roughness: 0.64,
      metalness: 0.15,
      color: 0x9b857a,
      emissive: 0xff2500,
      emissiveMap: skin.cracks,
      emissiveIntensity: 0.06
    });

    // Dark obsidian stone dorsal plates with internal radioactive core
    this.spineMat = new THREE.MeshStandardMaterial({
      map: spineTex,
      emissiveMap: spineTex,
      color: 0x181a20,
      roughness: 0.45,
      metalness: 0.55,
      emissive: 0xff4400,
      emissiveIntensity: 0.15
    });

    // Wet reptilian eye with slit pupil
    this.eyeMat = new THREE.MeshStandardMaterial({
      color: 0xffaa22,
      emissive: 0xff7700,
      emissiveIntensity: 2.2,
      roughness: 0.1,
      metalness: 0.25
    });

    this.teethMat = new THREE.MeshStandardMaterial({
      color: 0xeee6d6,
      roughness: 0.3,
      metalness: 0.05
    });

    this.clawMat = new THREE.MeshStandardMaterial({
      color: 0x14161a,
      roughness: 0.25,
      metalness: 0.7
    });

    // Forward-leaning theropod battle posture
    this.body = new THREE.Group();
    this.body.position.set(0, 0, 0);
    this.body.rotation.x = 0.14;
    this.root.add(this.body);

    const S = (geo, mat, x, y, z) => {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, y, z);
      m.castShadow = true;
      m.receiveShadow = true;
      return m;
    };

    // ---------- Seamless Muscular Lofted Torso ----------
    const torsoGeo = this.createLoftedTorsoGeometry();
    this.torsoMesh = new THREE.Mesh(torsoGeo, this.skinMat);
    this.torsoMesh.castShadow = true;
    this.torsoMesh.receiveShadow = true;
    this.body.add(this.torsoMesh);

    // Sculpted Pectoral Armor Plates
    const pecGeo = new THREE.SphereGeometry(1.6, 20, 16);
    this.pecL = S(pecGeo, this.skinMat, -1.4, 15.6, 2.2);
    this.pecL.scale.set(0.95, 0.85, 0.5);
    this.pecL.rotation.y = 0.25;

    this.pecR = S(pecGeo, this.skinMat, 1.4, 15.6, 2.2);
    this.pecR.scale.set(0.95, 0.85, 0.5);
    this.pecR.rotation.y = -0.25;

    // Armored Belly Gastralia Scutes
    const bellyGeo = new THREE.SphereGeometry(2.4, 20, 16);
    this.bellyMesh = S(bellyGeo, this.bellyMat, 0, 12.6, 2.2);
    this.bellyMesh.scale.set(0.9, 1.3, 0.5);

    this.body.add(this.pecL, this.pecR, this.bellyMesh);

    // ---------- Sculpted Crocodilian Head & Articulated Jaw ----------
    this.head = new THREE.Group();
    this.head.position.set(0, 21.6, 0.85);
    this.head.rotation.x = -0.08;
    this.body.add(this.head);

    // Sculpted Crocodilian Cranium & Snout
    const headGeo = this.createHeadGeometry();
    this.headMesh = new THREE.Mesh(headGeo, this.skinMat);
    this.headMesh.castShadow = true;
    this.headMesh.receiveShadow = true;
    this.head.add(this.headMesh);

    // Flared Nostrils
    const nostrilL = S(new THREE.SphereGeometry(0.18, 10, 8), this.skinMat, -0.45, 0.35, 3.2);
    const nostrilR = S(new THREE.SphereGeometry(0.18, 10, 8), this.skinMat, 0.45, 0.35, 3.2);

    // Heavy Supraorbital Brow Crests
    const browGeo = new THREE.BoxGeometry(1.1, 0.42, 1.1);
    const browL = S(browGeo, this.skinMat, -0.96, 0.72, 1.15);
    const browR = S(browGeo, this.skinMat, 0.96, 0.72, 1.15);
    browL.rotation.z = 0.22;
    browL.rotation.y = 0.14;
    browR.rotation.z = -0.22;
    browR.rotation.y = -0.14;

    // Deep-set glowing predator eyes nestled beneath the heavy brow
    this.eyeL = S(new THREE.SphereGeometry(0.32, 16, 12), this.eyeMat, -0.96, 0.45, 1.15);
    this.eyeR = S(new THREE.SphereGeometry(0.32, 16, 12), this.eyeMat, 0.96, 0.45, 1.15);

    this.head.add(nostrilL, nostrilR, browL, browR, this.eyeL, this.eyeR);

    // Upper predator fangs
    const toothGeo = new THREE.ConeGeometry(0.13, 0.7, 8);
    toothGeo.translate(0, -0.32, 0);
    for (let i = 0; i < 9; i++) {
      const a = (i / 8 - 0.5) * 1.8;
      const tooth = S(toothGeo, this.teethMat,
        Math.sin(a) * 1.25, -0.15, 1.8 + Math.cos(a) * 1.25);
      tooth.rotation.x = Math.PI - 0.18;
      tooth.rotation.z = a * 0.28;
      this.head.add(tooth);
    }

    // Articulated Lower Jaw (Pivots at jaw joint)
    this.jaw = new THREE.Group();
    this.jaw.position.set(0, -0.25, 0.1);
    this.head.add(this.jaw);

    const jawGeo = this.createJawGeometry();
    this.jawMesh = new THREE.Mesh(jawGeo, this.skinMat);
    this.jawMesh.castShadow = true;
    this.jawMesh.receiveShadow = true;
    this.jaw.add(this.jawMesh);

    // Tongue & Deep Throat
    const tongue = S(new THREE.SphereGeometry(0.6, 14, 10), new THREE.MeshStandardMaterial({
      color: 0x3d1414, roughness: 0.5
    }), 0, -0.05, 1.6);
    tongue.scale.set(0.85, 0.22, 1.4);
    this.jaw.add(tongue);

    // Lower predator fangs
    for (let i = 0; i < 7; i++) {
      const a = (i / 6 - 0.5) * 1.45;
      const tooth = S(toothGeo, this.teethMat,
        Math.sin(a) * 1.05, 0.18, 1.7 + Math.cos(a) * 1.05);
      tooth.rotation.x = 0.22;
      tooth.rotation.z = -a * 0.25;
      this.jaw.add(tooth);
    }

    this.jawTip = new THREE.Object3D();
    this.jawTip.position.set(0, -0.1, 3.3);
    this.jaw.add(this.jawTip);

    // Internal throat fire light
    this.mouthLight = new THREE.PointLight(0xff7722, 0, 80, 1.7);
    this.mouthLight.position.set(0, 0, 2.2);
    this.head.add(this.mouthLight);

    // Core heat light illuminating ground beneath Godzilla
    this.heatLight = new THREE.PointLight(0xff5511, 140, 90, 1.8);
    this.heatLight.position.set(0, 11, 0);
    this.body.add(this.heatLight);

    // ---------- Iconic Multi-Row Serrated Coral/Maple-Leaf Dorsal Plates ----------
    const plateGeo = this.createMovieDorsalPlateGeometry();

    this.spines = [];

    // Central Main Crest: 13 towering massive jagged plates running from neck to mid-tail
    const centralPlates = [
      [0, 21.4, 0.0, 0.95, -0.25], // Occipital crest at skull base
      [0, 20.4, -0.7, 1.25, -0.22],
      [0, 19.4, -1.8, 1.65, -0.18],
      [0, 18.2, -2.9, 2.15, -0.15],
      [0, 16.4, -3.7, 2.55, -0.12], // Peak over shoulders
      [0, 14.3, -4.0, 2.65, -0.08],
      [0, 12.1, -3.9, 2.45, -0.04],
      [0, 10.1, -3.5, 2.15, 0.0],
      [0, 8.4, -3.2, 1.75, 0.05]
    ];

    for (const [x, y, z, s, rx] of centralPlates) {
      const sp = new THREE.Mesh(plateGeo, this.spineMat);
      sp.position.set(x, y, z);
      sp.rotation.y = Math.PI / 2;
      sp.rotation.z = -rx;
      sp.scale.set(s * 0.8, s, s * 0.24);
      sp.castShadow = true;
      this.body.add(sp);
      this.spines.push(sp);
    }

    // Left & Right Flanking Rows: 12 secondary jagged plates providing 3D volume
    const flankPlates = [
      [18.9, -1.6, 1.15],
      [17.3, -2.7, 1.45],
      [15.4, -3.3, 1.75],
      [13.5, -3.5, 1.70],
      [11.6, -3.2, 1.45],
      [9.7, -2.7, 1.15]
    ];

    for (const [y, z, s] of flankPlates) {
      // Left fin
      const spL = new THREE.Mesh(plateGeo, this.spineMat);
      spL.position.set(-1.15, y, z);
      spL.rotation.y = Math.PI / 2 + 0.24;
      spL.rotation.x = -0.18;
      spL.scale.set(s * 0.7, s * 0.85, s * 0.2);
      spL.castShadow = true;
      this.body.add(spL);
      this.spines.push(spL);

      // Right fin
      const spR = new THREE.Mesh(plateGeo, this.spineMat);
      spR.position.set(1.15, y, z);
      spR.rotation.y = Math.PI / 2 - 0.24;
      spR.rotation.x = 0.18;
      spR.scale.set(s * 0.7, s * 0.85, s * 0.2);
      spR.castShadow = true;
      this.body.add(spR);
      this.spines.push(spR);
    }

    // ---------- Muscular Brawler Arms & Claws ----------
    this.armL = this.buildArm(-1);
    this.armR = this.buildArm(1);

    // ---------- Colossal Dinosaurian Pillars of Legs & Talons ----------
    this.legL = this.buildLeg(-1);
    this.legR = this.buildLeg(1);

    // ---------- 14-Segment Articulated Armored Tail ----------
    // Uses tapered cylinders with overlapping scute collars (No spherical beads)
    this.tailSegs = [];
    let parent = this.body;
    let px = 0, py = 8.6, pz = -3.2;
    const tailRadii = [2.5, 2.3, 2.1, 1.9, 1.7, 1.5, 1.3, 1.1, 0.9, 0.75, 0.6, 0.45, 0.35, 0.25];

    for (let i = 0; i < tailRadii.length; i++) {
      const pivot = new THREE.Group();
      if (i === 0) pivot.position.set(px, py, pz);
      else pivot.position.set(0, 0, -2.4);
      parent.add(pivot);

      const rTop = tailRadii[i];
      const rBot = (i + 1 < tailRadii.length) ? tailRadii[i + 1] : rTop * 0.65;
      const segLength = 2.5;

      const segGeo = new THREE.CylinderGeometry(rBot, rTop, segLength, 18, 1, false);
      segGeo.rotateX(Math.PI / 2);
      const segMesh = S(segGeo, this.skinMat, 0, 0, -segLength / 2);
      pivot.add(segMesh);

      if (i < 11) {
        const tsp = new THREE.Mesh(plateGeo, this.spineMat);
        tsp.position.set(0, rTop * 0.88, -segLength / 2);
        const ts = Math.max(0.45, rTop * 0.75);
        tsp.rotation.y = Math.PI / 2;
        tsp.rotation.z = -0.15;
        tsp.scale.set(ts * 0.75, ts, ts * 0.22);
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

  // Lofted continuous muscular torso geometry (Zero spherical seams)
  createLoftedTorsoGeometry() {
    const rings = [
      { y: 21.6, z: 0.8, rx: 1.6, rz: 1.7 },  // Base of skull collar
      { y: 20.4, z: 0.9, rx: 1.9, rz: 2.1 },  // Upper bull neck
      { y: 19.3, z: 0.9, rx: 2.3, rz: 2.5 },  // Mid bull neck
      { y: 18.2, z: 0.8, rx: 2.7, rz: 2.9 },  // Base of neck
      { y: 17.0, z: 0.6, rx: 3.2, rz: 3.4 },  // Trapezius hump & shoulder line
      { y: 15.6, z: 0.3, rx: 3.8, rz: 3.9 },  // Broadest pectoral chest
      { y: 14.2, z: 0.0, rx: 3.7, rz: 3.8 },  // Ribcage
      { y: 12.8, z: -0.1, rx: 3.5, rz: 3.6 }, // Upper abdomen
      { y: 11.5, z: -0.2, rx: 3.4, rz: 3.5 }, // Abdomen / gastralia
      { y: 10.3, z: -0.3, rx: 3.7, rz: 3.8 }, // Ilium / upper hips
      { y: 9.0,  z: -0.5, rx: 4.1, rz: 4.2 }, // Widest pelvis / hip joints
      { y: 7.8,  z: -0.7, rx: 3.8, rz: 3.9 }, // Lower pelvis
      { y: 6.8,  z: -0.9, rx: 3.0, rz: 3.3 }, // Groin & tail base
      { y: 6.0,  z: -1.0, rx: 1.8, rz: 2.2 }  // Base cap
    ];

    const radialSegments = 24;
    const numRings = rings.length;
    const numVertices = numRings * (radialSegments + 1) + 2;

    const positions = new Float32Array(numVertices * 3);
    const uvs = new Float32Array(numVertices * 2);
    const indices = [];

    let vIdx = 0;
    for (let r = 0; r < numRings; r++) {
      const ring = rings[r];
      const v = r / (numRings - 1);
      for (let s = 0; s <= radialSegments; s++) {
        const u = s / radialSegments;
        const theta = u * Math.PI * 2;
        const cos = Math.cos(theta);
        const sin = Math.sin(theta);

        const px = sin * ring.rx;
        const pz = ring.z + cos * ring.rz;
        const py = ring.y;

        positions[vIdx * 3] = px;
        positions[vIdx * 3 + 1] = py;
        positions[vIdx * 3 + 2] = pz;

        uvs[vIdx * 2] = u * 3;
        uvs[vIdx * 2 + 1] = v * 4;
        vIdx++;
      }
    }

    for (let r = 0; r < numRings - 1; r++) {
      for (let s = 0; s < radialSegments; s++) {
        const a = r * (radialSegments + 1) + s;
        const b = (r + 1) * (radialSegments + 1) + s;
        const c = (r + 1) * (radialSegments + 1) + (s + 1);
        const d = r * (radialSegments + 1) + (s + 1);

        indices.push(a, b, d);
        indices.push(b, c, d);
      }
    }

    // Watertight top collar cap
    const topCap = vIdx;
    positions[topCap * 3] = 0;
    positions[topCap * 3 + 1] = rings[0].y;
    positions[topCap * 3 + 2] = rings[0].z;
    uvs[topCap * 2] = 0.5;
    uvs[topCap * 2 + 1] = 0;
    vIdx++;
    for (let s = 0; s < radialSegments; s++) {
      indices.push(topCap, s, s + 1);
    }

    // Watertight bottom pelvis cap
    const botCap = vIdx;
    const botStart = (numRings - 1) * (radialSegments + 1);
    positions[botCap * 3] = 0;
    positions[botCap * 3 + 1] = rings[numRings - 1].y;
    positions[botCap * 3 + 2] = rings[numRings - 1].z;
    uvs[botCap * 2] = 0.5;
    uvs[botCap * 2 + 1] = 1;
    for (let s = 0; s < radialSegments; s++) {
      indices.push(botCap, botStart + s + 1, botStart + s);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }

  // Sculpted Crocodilian Cranium & Snout Geometry
  createHeadGeometry() {
    const rings = [
      { z: -1.4, y: 0.4, rx: 1.8, ry: 1.7 }, // Back of skull
      { z: -0.7, y: 0.5, rx: 1.95, ry: 1.8 }, // Cranium
      { z: 0.0,  y: 0.5, rx: 1.85, ry: 1.7 }, // Mid skull
      { z: 0.8,  y: 0.45, rx: 1.65, ry: 1.5 }, // Brow / eyes
      { z: 1.5,  y: 0.35, rx: 1.45, ry: 1.2 }, // Mid snout
      { z: 2.2,  y: 0.25, rx: 1.25, ry: 0.95 }, // Anterior snout
      { z: 2.8,  y: 0.15, rx: 0.95, ry: 0.75 }, // Snout tip
      { z: 3.1,  y: 0.08, rx: 0.3, ry: 0.3 }   // Rounded nose tip
    ];

    const radialSegments = 20;
    const numRings = rings.length;
    const numVertices = numRings * (radialSegments + 1);

    const positions = new Float32Array(numVertices * 3);
    const uvs = new Float32Array(numVertices * 2);
    const indices = [];

    let vIdx = 0;
    for (let r = 0; r < numRings; r++) {
      const ring = rings[r];
      const v = r / (numRings - 1);
      for (let s = 0; s <= radialSegments; s++) {
        const u = s / radialSegments;
        const theta = u * Math.PI * 2;
        const cos = Math.cos(theta);
        const sin = Math.sin(theta);

        const px = sin * ring.rx;
        const py = ring.y + cos * ring.ry;
        const pz = ring.z;

        positions[vIdx * 3] = px;
        positions[vIdx * 3 + 1] = py;
        positions[vIdx * 3 + 2] = pz;

        uvs[vIdx * 2] = u * 2;
        uvs[vIdx * 2 + 1] = v * 2;
        vIdx++;
      }
    }

    for (let r = 0; r < numRings - 1; r++) {
      for (let s = 0; s < radialSegments; s++) {
        const a = r * (radialSegments + 1) + s;
        const b = (r + 1) * (radialSegments + 1) + s;
        const c = (r + 1) * (radialSegments + 1) + (s + 1);
        const d = r * (radialSegments + 1) + (s + 1);

        indices.push(a, b, d);
        indices.push(b, c, d);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }

  // Sculpted Articulated Lower Jaw Geometry
  createJawGeometry() {
    const rings = [
      { z: -0.4, y: -0.3, rx: 1.6, ry: 0.65 }, // Jaw hinge & jowls
      { z: 0.4,  y: -0.35, rx: 1.45, ry: 0.65 },
      { z: 1.3,  y: -0.35, rx: 1.25, ry: 0.6 },
      { z: 2.1,  y: -0.3, rx: 1.05, ry: 0.55 },
      { z: 2.7,  y: -0.22, rx: 0.75, ry: 0.45 },
      { z: 3.0,  y: -0.15, rx: 0.25, ry: 0.25 }  // Chin tip
    ];

    const radialSegments = 18;
    const numRings = rings.length;
    const numVertices = numRings * (radialSegments + 1);

    const positions = new Float32Array(numVertices * 3);
    const uvs = new Float32Array(numVertices * 2);
    const indices = [];

    let vIdx = 0;
    for (let r = 0; r < numRings; r++) {
      const ring = rings[r];
      const v = r / (numRings - 1);
      for (let s = 0; s <= radialSegments; s++) {
        const u = s / radialSegments;
        const theta = u * Math.PI * 2;
        const cos = Math.cos(theta);
        const sin = Math.sin(theta);

        const px = sin * ring.rx;
        const py = ring.y + cos * ring.ry;
        const pz = ring.z;

        positions[vIdx * 3] = px;
        positions[vIdx * 3 + 1] = py;
        positions[vIdx * 3 + 2] = pz;

        uvs[vIdx * 2] = u * 2;
        uvs[vIdx * 2 + 1] = v * 2;
        vIdx++;
      }
    }

    for (let r = 0; r < numRings - 1; r++) {
      for (let s = 0; s < radialSegments; s++) {
        const a = r * (radialSegments + 1) + s;
        const b = (r + 1) * (radialSegments + 1) + s;
        const c = (r + 1) * (radialSegments + 1) + (s + 1);
        const d = r * (radialSegments + 1) + (s + 1);

        indices.push(a, b, d);
        indices.push(b, c, d);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }

  // Iconic jagged coral/maple-leaf dorsal plate silhouette
  createMovieDorsalPlateGeometry() {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.lineTo(0.4, 0.4);
    s.lineTo(0.9, 0.5);   // Lower front prong
    s.lineTo(0.6, 1.1);
    s.lineTo(1.2, 1.4);   // Mid front prong
    s.lineTo(0.75, 2.0);
    s.lineTo(1.1, 2.5);   // High front prong
    s.lineTo(0.5, 3.0);
    s.lineTo(0.65, 3.6);  // Sub-crest
    s.lineTo(0.2, 4.0);
    s.lineTo(0.0, 4.5);   // Central towering pinnacle!
    s.lineTo(-0.2, 4.0);
    s.lineTo(-0.65, 3.6); // Sub-crest rear
    s.lineTo(-0.5, 3.0);
    s.lineTo(-1.1, 2.5);  // High rear prong
    s.lineTo(-0.75, 2.0);
    s.lineTo(-1.2, 1.4);  // Mid rear prong
    s.lineTo(-0.6, 1.1);
    s.lineTo(-0.9, 0.5);  // Lower rear prong
    s.lineTo(-0.4, 0.4);
    s.closePath();

    const geo = new THREE.ExtrudeGeometry(s, {
      depth: 0.3,
      bevelEnabled: true,
      bevelThickness: 0.15,
      bevelSize: 0.14,
      bevelSegments: 2
    });
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
    shoulder.position.set(side * 3.4, 15.6, 1.2);
    this.body.add(shoulder);

    // Muscular Deltoid / Shoulder Mass
    const deltoid = g(new THREE.SphereGeometry(1.25, 16, 14), this.skinMat, 0, 0, 0);
    deltoid.scale.set(1.1, 1.2, 1.05);
    shoulder.add(deltoid);

    // Powerful Upper Arm (Deltoid & Bicep)
    const upperArm = g(new THREE.CylinderGeometry(0.85, 1.1, 3.2, 16), this.skinMat, 0, -1.5, 0);
    shoulder.add(upperArm);

    const elbow = new THREE.Group();
    elbow.position.set(0, -3.0, 0);
    shoulder.add(elbow);

    // Articulated Elbow Joint
    const elbowJoint = g(new THREE.SphereGeometry(0.8, 14, 12), this.skinMat, 0, 0, 0);
    elbow.add(elbowJoint);

    // Muscular Forearm reaching forward aggressively
    const forearm = g(new THREE.CylinderGeometry(0.7, 0.9, 2.8, 16), this.skinMat, 0, -1.2, 0.8);
    forearm.rotation.x = 0.75;
    elbow.add(forearm);

    // Wrist & Hand Mass
    const wrist = g(new THREE.SphereGeometry(0.75, 14, 10), this.skinMat, 0, -2.1, 1.5);
    elbow.add(wrist);

    // Hand & 4 Spread Predator Talons reaching forward
    const clawGeo = new THREE.ConeGeometry(0.2, 1.05, 8);
    for (let c = 0; c < 4; c++) {
      const claw = g(clawGeo, this.clawMat,
        (c - 1.5) * 0.42, -2.2, 1.9 + Math.sin(c * 0.9) * 0.15);
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
    hip.position.set(side * 2.5, 8.8, -0.4);
    this.body.add(hip);

    // Hip Socket Muscular Bulge
    const hipJoint = g(new THREE.SphereGeometry(2.0, 18, 14), this.skinMat, 0, 0, 0);
    hipJoint.scale.set(1.15, 1.2, 1.25);
    hip.add(hipJoint);

    // Massive Tree-Trunk Muscular Thigh
    const thigh = g(new THREE.CylinderGeometry(1.6, 2.1, 4.8, 20), this.skinMat, 0, -2.2, 0);
    thigh.scale.set(1.2, 1.0, 1.3);
    hip.add(thigh);

    const knee = new THREE.Group();
    knee.position.set(0, -4.6, 0);
    hip.add(knee);

    // Armored Kneecap Plate
    const kneeCap = g(new THREE.SphereGeometry(1.0, 16, 12), this.skinMat, 0, 0.2, 1.45);
    kneeCap.scale.set(0.9, 0.85, 0.65);
    knee.add(kneeCap);

    // Muscular Calf / Lower Leg
    const shin = g(new THREE.CylinderGeometry(1.2, 1.65, 4.4, 20), this.skinMat, 0, -2.0, 0);
    shin.scale.set(1.1, 1.0, 1.2);
    knee.add(shin);

    // Ankle / Metatarsal Base
    const ankle = g(new THREE.BoxGeometry(2.6, 1.4, 2.8), this.skinMat, 0, -3.8, 0.4);
    knee.add(ankle);

    // Three Realistic Dinosaurian Front Toes with Curved Talons
    const toeGeo = new THREE.BoxGeometry(0.75, 0.95, 2.2);
    const talonGeo = new THREE.ConeGeometry(0.35, 1.4, 8);
    talonGeo.translate(0, 0.7, 0);

    const toeAngles = [-0.28, 0, 0.28];
    for (let c = 0; c < 3; c++) {
      const a = toeAngles[c];
      const ox = (c - 1) * 1.0;

      const toe = g(toeGeo, this.skinMat, ox, -4.1, 2.0);
      toe.rotation.y = a;
      knee.add(toe);

      const talon = g(talonGeo, this.clawMat,
        ox + Math.sin(a) * 1.6, -4.2, 2.8 + Math.cos(a) * 0.95);
      talon.rotation.x = Math.PI / 2 + 0.15;
      talon.rotation.y = a;
      knee.add(talon);
    }

    // Rear Heel Dewclaw
    const heelTalon = g(talonGeo, this.clawMat, 0, -4.0, -1.4);
    heelTalon.rotation.x = -Math.PI / 2 - 0.2;
    heelTalon.scale.set(0.8, 0.8, 0.8);
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
    out.set(0, -4.2, 1.6);
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
    this.body.rotation.x = 0.14 + moving * 0.065 - crouch * 0.035 + roarK * -0.09;

    // Breathing ribcage expansion
    const breathe = 1 + Math.sin(this.time * 2.2) * 0.012;
    this.torsoMesh.scale.set(1.0 * breathe, 1.0 * breathe, 1.0 * breathe);

    // Arms counter-swing with predatory claw tension
    this.armL.shoulder.rotation.x = 0.35 - s * 0.42 * amp;
    this.armR.shoulder.rotation.x = 0.35 + s * 0.42 * amp;
    this.armL.shoulder.rotation.z = -0.25 + Math.sin(this.time * 2) * 0.04;
    this.armR.shoulder.rotation.z = 0.25 - Math.sin(this.time * 2) * 0.04;

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
    const targetGlow = 0.15 + (this.beamOn ? 4.2 : 0) + roarK * 1.8;
    this.charge += (targetGlow - this.charge) * Math.min(1, dt * (this.beamOn ? 4.0 : 5.0));

    const spineFlicker = Math.sin(this.time * 50) * 0.18 * (this.beamOn ? 1 : 0);
    this.spineMat.emissiveIntensity = this.charge + spineFlicker;

    // Glowing magma veins beneath scales
    const heatPulse = Math.sin(this.time * 3.4) * 0.06 + Math.sin(this.time * 9.5) * 0.03;
    this.skinMat.emissiveIntensity = 0.08 + heatPulse + roarK * 0.6 + (this.beamOn ? 1.4 : 0);
    this.bellyMat.emissiveIntensity = 0.06 + heatPulse * 0.5 + roarK * 0.4 + (this.beamOn ? 0.9 : 0);

    // Dynamic creature heat lights
    this.heatLight.intensity = 140 + Math.sin(this.time * 24) * 30 + this.charge * 160;
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

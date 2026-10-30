import * as THREE from 'three';

// Hyper-Realistic City: Multi-tiered reflective glass skyscrapers, detailed rooftops,
// wet asphalt street grid, traffic & emergency vehicles with flashing sirens,
// ground raycasting, and realistic structural collapse & rubble physics.

export class City {
  constructor(scene, groundTex, facadeTexs) {
    this.scene = scene;
    this.buildings = [];
    this.fires = [];
    this.size = 400;

    // Photorealistic PBR Wet Asphalt Ground
    const groundMat = new THREE.MeshStandardMaterial({
      map: groundTex,
      roughness: 0.65,
      metalness: 0.15
    });

    const ground = new THREE.Mesh(new THREE.PlaneGeometry(750, 750), groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    this.groundMesh = ground;

    // Skyscraper Facade Materials: Reflective glass curtain walls with warm/cool interior lights
    this.sideMats = facadeTexs.map(t => new THREE.MeshStandardMaterial({
      map: t,
      emissiveMap: t,
      emissive: 0xffd290,
      emissiveIntensity: 0.85,
      color: 0xb5bec8,
      roughness: 0.35,
      metalness: 0.35
    }));

    this.allSideMats = [];
    this.nightF = 1;

    // Dark gravel / concrete rooftop material
    this.topMat = new THREE.MeshStandardMaterial({
      color: 0x161920,
      roughness: 0.88,
      metalness: 0.15
    });

    // Broken concrete rubble material
    this.rubbleMat = new THREE.MeshStandardMaterial({
      color: 0x22242a,
      roughness: 0.95,
      metalness: 0.12
    });

    // Metallic rebar / structural steel material
    this.steelMat = new THREE.MeshStandardMaterial({
      color: 0x34241c,
      roughness: 0.55,
      metalness: 0.85
    });

    this.boxGeo = new THREE.BoxGeometry(1, 1, 1);

    // City Grid: 7x7 blocks, pitch 46
    const half = 3;
    for (let bx = -half; bx <= half; bx++) {
      for (let bz = -half; bz <= half; bz++) {
        if (bx === 0 && bz === 0) continue; // Godzilla spawn plaza

        const count = 1 + (Math.abs(bx * 7 + bz * 13) % 2);
        for (let k = 0; k < count; k++) {
          const px = bx * 46 + (k ? 13 : -9) + (Math.abs(bz * 3 + k) % 5);
          const pz = bz * 46 + (k ? -11 : 8) - (Math.abs(bx * 5 + k * 2) % 5);
          const w = 14 + ((Math.abs(bx * 11 + bz * 7 + k * 5)) % 10);
          const dpt = 14 + ((Math.abs(bx * 5 + bz * 13 + k * 3)) % 10);
          const dist = Math.sqrt(bx * bx + bz * bz);
          // Skyline height distribution
          const h = Math.max(18, 54 - dist * 6.5 + ((Math.abs(bx * 17 + bz * 29 + k * 7)) % 24));
          this.addBuilding(px, pz, w, h, dpt);
        }
      }
    }

    // Street Lamps with warm sodium glow
    const poleGeo = new THREE.CylinderGeometry(0.16, 0.24, 9.5, 8);
    const poleMat = new THREE.MeshStandardMaterial({
      color: 0x22262e,
      roughness: 0.5,
      metalness: 0.7
    });
    const headGeo = new THREE.SphereGeometry(0.5, 10, 8);
    this.lampMat = new THREE.MeshStandardMaterial({
      color: 0xffd690,
      emissive: 0xffa040,
      emissiveIntensity: 1.5
    });

    for (let i = -3; i <= 3; i++) {
      for (const z of [-23 * 4, 23 * 4]) this.addLamp(poleGeo, poleMat, headGeo, i * 46, z);
      for (const x of [-23 * 4, 23 * 4]) this.addLamp(poleGeo, poleMat, headGeo, x, i * 46);
    }

    // Street intersection warm ambient pools
    for (const [x, z] of [[-46, -46], [46, 46], [-46, 46], [46, -46], [0, -92], [0, 92]]) {
      const pl = new THREE.PointLight(0xffa855, 75, 110, 2.0);
      pl.position.set(x, 10, z);
      scene.add(pl);
    }

    // Traffic & Emergency Vehicles with flashing sirens
    this.cars = [];
    const carGeo = new THREE.BoxGeometry(4.4, 1.6, 2.1);
    const headlightGeo = new THREE.SphereGeometry(0.24, 8, 6);
    const sirenGeo = new THREE.BoxGeometry(0.6, 0.3, 1.4);

    for (let i = 0; i < 12; i++) {
      const isEmergency = (i % 4 === 0);
      const carGroup = new THREE.Group();

      let carMat;
      if (isEmergency) {
        carMat = new THREE.MeshStandardMaterial({
          color: 0x111317,
          roughness: 0.25,
          metalness: 0.8
        });
      } else {
        const carColors = [0x992222, 0x1f3c78, 0xcccccc, 0x1a1a1a, 0x886622, 0x226644];
        carMat = new THREE.MeshStandardMaterial({
          color: carColors[i % carColors.length],
          roughness: 0.25,
          metalness: 0.85
        });
      }

      const body = new THREE.Mesh(carGeo, carMat);
      body.castShadow = true;
      carGroup.add(body);

      // Headlights
      const headMat = new THREE.MeshBasicMaterial({ color: 0xfffae6 });
      const hl1 = new THREE.Mesh(headlightGeo, headMat);
      hl1.position.set(2.25, -0.1, 0.7);
      const hl2 = new THREE.Mesh(headlightGeo, headMat);
      hl2.position.set(2.25, -0.1, -0.7);
      carGroup.add(hl1, hl2);

      // Taillights
      const tailMat = new THREE.MeshBasicMaterial({ color: 0xff1122 });
      const tl1 = new THREE.Mesh(headlightGeo, tailMat);
      tl1.position.set(-2.25, -0.1, 0.7);
      const tl2 = new THREE.Mesh(headlightGeo, tailMat);
      tl2.position.set(-2.25, -0.1, -0.7);
      carGroup.add(tl1, tl2);

      // Flashing siren bar for emergency vehicles
      let siren = null;
      if (isEmergency) {
        const sirenMat = new THREE.MeshBasicMaterial({ color: 0xff0022 });
        siren = new THREE.Mesh(sirenGeo, sirenMat);
        siren.position.set(0, 1.0, 0);
        carGroup.add(siren);
      }

      const horiz = (i % 2 === 0);
      const lane = (i % 4 < 2 ? 23 : -23) + (i % 3) * 2.2;
      const speed = (i % 3 === 0 ? -1 : 1) * (12 + (i * 7) % 11);

      this.cars.push({
        group: carGroup,
        horiz,
        lane,
        speed,
        t: Math.random() * 320,
        siren,
        isEmergency
      });
      scene.add(carGroup);
    }

    this.ray = new THREE.Raycaster();
  }

  addBuilding(x, z, w, h, d) {
    const tpl = this.sideMats[(Math.abs(Math.round(x * 3 + z * 7))) % this.sideMats.length];
    const t = tpl.map.clone();
    t.needsUpdate = true;
    // Window proportions: realistic architectural window widths (~2.8 to 3.5 units per window)
    t.repeat.set(Math.max(1, Math.round(w / 12)), Math.max(1, Math.round(h / 14)));

    const side = new THREE.MeshStandardMaterial({
      map: t,
      emissiveMap: t,
      emissive: 0xffd290,
      emissiveIntensity: 0.85,
      color: 0xb5bec8,
      roughness: 0.35,
      metalness: 0.35
    });
    this.allSideMats.push(side);

    // Tower mesh
    const mesh = new THREE.Mesh(this.boxGeo, [side, side, this.topMat, this.topMat, side, side]);
    mesh.position.set(x, h / 2, z);
    mesh.scale.set(w, h, d);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.scene.add(mesh);

    // Rooftop Mechanical Units & Architectural Penthouses
    const roofGroup = new THREE.Group();
    roofGroup.position.set(x, h, z);
    this.scene.add(roofGroup);

    // Elevator penthouse box
    const pentH = Math.min(4.5, h * 0.1);
    const pentMesh = new THREE.Mesh(this.boxGeo, this.topMat);
    pentMesh.position.set(0, pentH / 2, 0);
    pentMesh.scale.set(w * 0.45, pentH, d * 0.45);
    pentMesh.castShadow = true;
    roofGroup.add(pentMesh);

    // HVAC chiller unit
    const hvac = new THREE.Mesh(this.boxGeo, this.topMat);
    hvac.position.set(w * 0.22, 1.2, -d * 0.2);
    hvac.scale.set(w * 0.25, 2.4, d * 0.25);
    roofGroup.add(hvac);

    // Communications Spire / Antenna
    const spireH = 8 + (Math.abs(x * 5 + z * 3) % 10);
    const spireGeo = new THREE.CylinderGeometry(0.12, 0.35, spireH, 6);
    const spire = new THREE.Mesh(spireGeo, this.steelMat);
    spire.position.set(0, pentH + spireH / 2, 0);
    roofGroup.add(spire);

    // Flashing Red Aviation Obstruction Beacon
    const beacon = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 8, 6),
      new THREE.MeshBasicMaterial({ color: 0xff2233 })
    );
    beacon.position.set(0, pentH + spireH, 0);
    roofGroup.add(beacon);

    const b = {
      mesh,
      roofGroup,
      beacon,
      x, z, w, h, d,
      side,
      hp: 100,
      maxHp: 100,
      state: 'alive',
      t: 0,
      fallAxis: new THREE.Vector3(),
      fallAngle: 0,
      rubblePieces: []
    };
    mesh.userData.building = b;
    this.buildings.push(b);
    return b;
  }

  addLamp(poleGeo, poleMat, headGeo, x, z) {
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.set(x, 4.75, z);
    this.scene.add(pole);

    const head = new THREE.Mesh(headGeo, this.lampMat);
    head.position.set(x, 9.6, z);
    this.scene.add(head);
  }

  damageAt(p, radius, dmg, hooks) {
    let hitAny = false;
    for (const b of this.buildings) {
      if (b.state !== 'alive') continue;
      const dx = b.x - p.x, dz = b.z - p.z;
      const dist = Math.sqrt(dx * dx + dz * dz) - Math.max(b.w, b.d) * 0.42;
      if (dist > radius) continue;

      b.hp -= dmg * (1 - Math.max(0, dist) / (radius * 1.25));
      hitAny = true;
      if (b.side) b.side.emissiveIntensity = 2.2;
      if (b.hp <= 0) this.collapse(b, hooks);
      else if (hooks && hooks.onHit) hooks.onHit(b);
    }
    return hitAny;
  }

  collapse(b, hooks) {
    b.state = 'falling';
    b.t = 0;
    const a = Math.random() * Math.PI * 2;
    b.fallAxis.set(Math.cos(a), 0, Math.sin(a));
    b.fallAngle = 0.55 + Math.random() * 0.35;
    if (hooks && hooks.onCollapse) hooks.onCollapse(b);
  }

  // Raycast against both alive buildings AND ground plane (y = 0)
  raycast(origin, dir, maxLen) {
    const alive = [];
    for (const b of this.buildings) {
      if (b.state === 'alive') alive.push(b.mesh);
    }
    this.ray.set(origin, dir);
    this.ray.far = maxLen;
    const hits = this.ray.intersectObjects(alive, false);

    let buildingHit = hits.length ? hits[0] : null;

    // Raycast against ground plane
    let groundHit = null;
    if (dir.y < -0.0001) {
      const t = -origin.y / dir.y;
      if (t > 0 && t <= maxLen) {
        const pt = origin.clone().addScaledVector(dir, t);
        pt.y = 0.2;
        groundHit = { distance: t, point: pt, isGround: true };
      }
    }

    if (buildingHit && groundHit) {
      return buildingHit.distance <= groundHit.distance ? buildingHit : groundHit;
    }
    return buildingHit || groundHit || null;
  }

  destructionRatio() {
    let dead = 0;
    for (const b of this.buildings) if (b.state !== 'alive') dead++;
    return this.buildings.length ? dead / this.buildings.length : 0;
  }

  setNight(f) {
    this.nightF = f;
    this.lampMat.emissiveIntensity = 0.4 + f * 1.8;
  }

  update(dt, time) {
    // Collapses & Structural Rubble
    for (const b of this.buildings) {
      if (b.state === 'falling') {
        b.t += dt;
        const k = Math.min(1, b.t / 2.2);
        const e = k * k;

        b.mesh.position.y = (b.h / 2) * (1 - e * 0.84);
        b.mesh.rotation.x = b.fallAxis.z * b.fallAngle * e;
        b.mesh.rotation.z = -b.fallAxis.x * b.fallAngle * e;

        b.roofGroup.position.y = Math.max(2.0, b.h * (1 - e * 0.82));
        b.roofGroup.rotation.x = b.mesh.rotation.x;
        b.roofGroup.rotation.z = b.mesh.rotation.z;

        if (k >= 1) {
          b.state = 'rubble';
          b.mesh.material = [
            this.rubbleMat, this.rubbleMat, this.rubbleMat,
            this.rubbleMat, this.rubbleMat, this.rubbleMat
          ];
          b.mesh.scale.set(b.w * 1.35, 2.4, b.d * 1.35);
          b.mesh.position.y = 1.2;
          b.mesh.rotation.set(0, Math.random() * 0.5, 0);

          this.scene.remove(b.roofGroup);

          // Fractured concrete chunks & rubble geometry
          for (let p = 0; p < 5; p++) {
            const piece = new THREE.Mesh(this.boxGeo, this.rubbleMat);
            const pw = b.w * (0.25 + Math.random() * 0.2);
            const ph = 1.5 + Math.random() * 2.2;
            const pd = b.d * (0.25 + Math.random() * 0.2);
            piece.scale.set(pw, ph, pd);
            piece.position.set(
              b.x + (Math.random() - 0.5) * b.w * 0.9,
              ph / 2,
              b.z + (Math.random() - 0.5) * b.d * 0.9
            );
            piece.rotation.set(
              (Math.random() - 0.5) * 0.5,
              Math.random() * 3.14,
              (Math.random() - 0.5) * 0.5
            );
            piece.castShadow = true;
            this.scene.add(piece);
            b.rubblePieces.push(piece);
          }
          b.side = null;
        }
      } else if (b.state === 'alive' && b.hp < b.maxHp) {
        b.beacon.material.color.setHex(Math.sin(time * 12 + b.x) > 0 ? 0xff6622 : 0xff1111);
        if (b.side) {
          b.side.emissiveIntensity = 0.9 + Math.abs(Math.sin(time * 8 + b.z)) * 0.9;
        }
      } else if (b.state === 'alive') {
        const beaconOn = Math.sin(time * 2.5 + b.z * 0.2) > 0.65;
        b.beacon.material.color.setHex(beaconOn ? 0xff2233 : 0x440008);
        if (b.side) {
          b.side.emissiveIntensity += ((0.2 + this.nightF * 0.85) - b.side.emissiveIntensity) * 0.1;
        }
      }
    }

    // Traffic & Emergency Vehicles
    for (const c of this.cars) {
      c.t += c.speed * dt;
      if (c.t > 270) c.t = -270;
      if (c.t < -270) c.t = 270;

      if (c.horiz) {
        c.group.position.set(c.t, 0.9, c.lane);
        c.group.rotation.y = c.speed > 0 ? 0 : Math.PI;
      } else {
        c.group.position.set(c.lane, 0.9, c.t);
        c.group.rotation.y = c.speed > 0 ? Math.PI / 2 : -Math.PI / 2;
      }

      if (c.siren) {
        const sirenState = Math.sin(time * 16 + c.lane) > 0;
        c.siren.material.color.setHex(sirenState ? 0xff0022 : 0x0044ff);
      }
    }
  }
}

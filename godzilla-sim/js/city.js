import * as THREE from 'three';

// Night city: instanced-variety towers, streets, lamps, traffic and
// full building damage / collapse / rubble simulation.
export class City {
  constructor(scene, groundTex, facadeTexs) {
    this.scene = scene;
    this.buildings = [];
    this.fires = []; // {pos, t} live fire emitters serviced by main
    this.size = 400;

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(700, 700),
      new THREE.MeshStandardMaterial({ map: groundTex, roughness: 0.55, metalness: 0.25 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    this.sideMats = facadeTexs.map(t => new THREE.MeshStandardMaterial({
      map: t, emissiveMap: t, emissive: 0xffc37a, emissiveIntensity: 1.1,
      color: 0xbfc4d0, roughness: 0.7, metalness: 0.15
    }));
    this.allSideMats = [];
    this.nightF = 1;
    this.topMat = new THREE.MeshStandardMaterial({ color: 0x11141b, roughness: 0.95 });
    this.rubbleMat = new THREE.MeshStandardMaterial({ color: 0x23211e, roughness: 1 });
    this.boxGeo = new THREE.BoxGeometry(1, 1, 1);

    const half = 3; // 7x7 blocks, pitch 46
    for (let bx = -half; bx <= half; bx++) {
      for (let bz = -half; bz <= half; bz++) {
        if (bx === 0 && bz === 0) continue; // spawn plaza
        const count = 1 + (Math.abs(bx * 7 + bz * 13) % 2);
        for (let k = 0; k < count; k++) {
          const px = bx * 46 + (k ? 13 : -9) + (Math.abs(bz * 3 + k) % 5);
          const pz = bz * 46 + (k ? -11 : 8) - (Math.abs(bx * 5 + k * 2) % 5);
          const w = 13 + ((Math.abs(bx * 11 + bz * 7 + k * 5)) % 9);
          const dpt = 13 + ((Math.abs(bx * 5 + bz * 13 + k * 3)) % 9);
          const dist = Math.sqrt(bx * bx + bz * bz);
          const h = Math.max(10, 46 - dist * 7 + ((Math.abs(bx * 17 + bz * 29 + k * 7)) % 16));
          this.addBuilding(px, pz, w, h, dpt);
        }
      }
    }

    // street lamps (emissive heads + a few real lights)
    const poleGeo = new THREE.CylinderGeometry(0.18, 0.24, 9, 6);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x2a2e36, roughness: 0.6, metalness: 0.6 });
    const headGeo = new THREE.SphereGeometry(0.55, 8, 6);
    this.lampMat = new THREE.MeshStandardMaterial({
      color: 0xffd9a0, emissive: 0xffb85e, emissiveIntensity: 3
    });
    for (let i = -3; i <= 3; i++) {
      for (const z of [-23 * 4, 23 * 4]) this.addLamp(poleGeo, poleMat, headGeo, i * 46, z);
      for (const x of [-23 * 4, 23 * 4]) this.addLamp(poleGeo, poleMat, headGeo, x, i * 46);
    }
    for (const [x, z] of [[-46, -46], [46, 46], [-46, 46], [46, -46]]) {
      const pl = new THREE.PointLight(0xffb85e, 260, 120, 1.8);
      pl.position.set(x, 10, z);
      scene.add(pl);
    }

    // traffic: looping emissive cars on the two avenues
    this.cars = [];
    const carGeo = new THREE.BoxGeometry(4.4, 1.6, 2);
    for (let i = 0; i < 10; i++) {
      const mat = new THREE.MeshStandardMaterial({
        color: [0x882222, 0x224488, 0xbbbbbb, 0x222222, 0x664411][i % 5],
        roughness: 0.35, metalness: 0.7,
        emissive: 0xffffff, emissiveIntensity: 0.12
      });
      const car = new THREE.Mesh(carGeo, mat);
      car.castShadow = true;
      const horiz = i % 2 === 0;
      const lane = (i % 4 < 2 ? 23 : -23) + (i % 3) * 2;
      const speed = (i % 3 === 0 ? -1 : 1) * (11 + (i * 7) % 9);
      this.cars.push({ mesh: car, horiz, lane, speed, t: Math.random() * 300 });
      scene.add(car);
    }

    this.ray = new THREE.Raycaster();
  }

  addBuilding(x, z, w, h, d) {
    const tpl = this.sideMats[(Math.abs(Math.round(x * 3 + z * 7))) % this.sideMats.length];
    // per-tower texture repeat so windows stay window-sized on any tower
    const t = tpl.map.clone();
    t.needsUpdate = true;
    t.repeat.set(Math.max(2, Math.round(w / 4)), Math.max(3, Math.round(h / 5.5)));
    const side = new THREE.MeshStandardMaterial({
      map: t, emissiveMap: t, emissive: 0xffc37a, emissiveIntensity: 1.1,
      color: 0xbfc4d0, roughness: 0.7, metalness: 0.15
    });
    this.allSideMats.push(side);
    const mesh = new THREE.Mesh(this.boxGeo, [side, side, this.topMat, this.topMat, side, side]);
    mesh.position.set(x, h / 2, z);
    mesh.scale.set(w, h, d);
    mesh.castShadow = true; mesh.receiveShadow = true;
    this.scene.add(mesh);
    // rooftop beacon
    const beacon = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 8, 6),
      new THREE.MeshBasicMaterial({ color: 0xff3344 })
    );
    beacon.position.set(x, h + 1, z);
    this.scene.add(beacon);
    const b = {
      mesh, beacon, x, z, w, h, d, side,
      hp: 100, maxHp: 100, state: 'alive', t: 0,
      fallAxis: new THREE.Vector3(), fallAngle: 0
    };
    mesh.userData.building = b;
    this.buildings.push(b);
    return b;
  }

  addLamp(poleGeo, poleMat, headGeo, x, z) {
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.set(x, 4.5, z);
    this.scene.add(pole);
    const head = new THREE.Mesh(headGeo, this.lampMat);
    head.position.set(x, 9.2, z);
    this.scene.add(head);
  }
  damageAt(p, radius, dmg, hooks) {
    let hitAny = false;
    for (const b of this.buildings) {
      if (b.state !== 'alive') continue;
      const dx = b.x - p.x, dz = b.z - p.z;
      const dist = Math.sqrt(dx * dx + dz * dz) - Math.max(b.w, b.d) * 0.4;
      if (dist > radius) continue;
      b.hp -= dmg * (1 - Math.max(0, dist) / (radius * 1.2));
      hitAny = true;
      if (b.side) b.side.emissiveIntensity = 1.9; // impact flash, decays in update
      if (b.hp <= 0) this.collapse(b, hooks);
      else if (hooks && hooks.onHit) hooks.onHit(b);
    }
    return hitAny;
  }

  collapse(b, hooks) {
    b.state = 'falling'; b.t = 0;
    const a = Math.random() * Math.PI * 2;
    b.fallAxis.set(Math.cos(a), 0, Math.sin(a));
    b.fallAngle = 0.5 + Math.random() * 0.35;
    if (hooks && hooks.onCollapse) hooks.onCollapse(b);
  }

  raycast(origin, dir, maxLen) {
    const alive = [];
    for (const b of this.buildings) if (b.state === 'alive') alive.push(b.mesh);
    this.ray.set(origin, dir);
    this.ray.far = maxLen;
    const hits = this.ray.intersectObjects(alive, false);
    return hits.length ? hits[0] : null;
  }

  destructionRatio() {
    let dead = 0;
    for (const b of this.buildings) if (b.state !== 'alive') dead++;
    return this.buildings.length ? dead / this.buildings.length : 0;
  }

  setNight(f) {
    this.nightF = f;
    this.lampMat.emissiveIntensity = 0.4 + f * 3;
  }

  update(dt, time) {
    // collapses
    for (const b of this.buildings) {
      if (b.state === 'falling') {
        b.t += dt;
        const k = Math.min(1, b.t / 2.2);
        const e = k * k;
        b.mesh.position.y = (b.h / 2) * (1 - e * 0.82);
        b.mesh.rotation.x = b.fallAxis.z * b.fallAngle * e;
        b.mesh.rotation.z = -b.fallAxis.x * b.fallAngle * e;
        b.beacon.position.y = Math.max(1.5, b.h * (1 - e * 0.8));
        if (k >= 1) {
          b.state = 'rubble';
          b.mesh.material = [this.rubbleMat, this.rubbleMat, this.rubbleMat,
            this.rubbleMat, this.rubbleMat, this.rubbleMat];
          b.mesh.scale.set(b.w * 1.25, 2.2, b.d * 1.25);
          b.mesh.position.y = 1.1;
          b.mesh.rotation.set(0, Math.random() * 0.4, 0);
          this.scene.remove(b.beacon);
          b.side = null;
        }
      } else if (b.state === 'alive' && b.hp < b.maxHp) {
        // damaged towers smolder: pulse beacon + hot flickering windows
        b.beacon.material.color.setHex(Math.sin(time * 9 + b.x) > 0 ? 0xff8833 : 0xff2222);
        if (b.side) b.side.emissiveIntensity = 1.0 + Math.abs(Math.sin(time * 7 + b.z)) * 0.9;
      } else if (b.state === 'alive') {
        b.beacon.material.color.setHex(Math.sin(time * 2 + b.z) > 0.6 ? 0xff3344 : 0x550000);
        if (b.side) b.side.emissiveIntensity += ((0.25 + this.nightF * 1.1) - b.side.emissiveIntensity) * 0.1;
      }
    }
    // traffic
    for (const c of this.cars) {
      c.t += c.speed * dt;
      if (c.t > 260) c.t = -260;
      if (c.t < -260) c.t = 260;
      if (c.horiz) {
        c.mesh.position.set(c.t, 0.9, c.lane);
        c.mesh.rotation.y = c.speed > 0 ? 0 : Math.PI;
      } else {
        c.mesh.position.set(c.lane, 0.9, c.t);
        c.mesh.rotation.y = c.speed > 0 ? Math.PI / 2 : -Math.PI / 2;
      }
    }
  }
}

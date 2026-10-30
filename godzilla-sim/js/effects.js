import * as THREE from 'three';

// Procedural canvas textures, particle systems, beam, rain and synth audio.

function makeCanvas(w, h, fn) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  fn(c.getContext('2d'), w, h);
  return c;
}

function canvasTexture(canvas, srgb = true) {
  const t = new THREE.CanvasTexture(canvas);
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function rnd(a, b) { return a + Math.random() * (b - a); }

// Mottled reptile skin albedo + bump. Tileable-ish at repeat scale.
export function makeSkinTextures() {
  const mapC = makeCanvas(512, 512, (g, w, h) => {
    g.fillStyle = '#71281e'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 2600; i++) {
      const x = Math.random() * w, y = Math.random() * h;
      const r = rnd(2, 9);
      const v = Math.random();
      g.fillStyle = v < 0.45 ? 'rgba(40,10,8,0.40)' : (v < 0.8 ? 'rgba(140,50,35,0.35)' : 'rgba(200,110,80,0.25)');
      g.beginPath(); g.ellipse(x, y, r, r * rnd(0.5, 1), Math.random() * 3.2, 0, 6.3); g.fill();
    }
    // scale rows: darker arcs
    g.strokeStyle = 'rgba(30,8,6,0.55)'; g.lineWidth = 2;
    for (let y = 8; y < h; y += 22) {
      for (let x = 0; x < w; x += 20) {
        const ox = x + ((y / 22) % 2) * 10;
        g.beginPath(); g.arc(ox, y, 9, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke();
      }
    }
    // scars
    g.strokeStyle = 'rgba(20,6,5,0.65)'; g.lineWidth = 1.5;
    for (let i = 0; i < 26; i++) {
      let x = Math.random() * w, y = Math.random() * h;
      g.beginPath(); g.moveTo(x, y);
      for (let s = 0; s < 5; s++) { x += rnd(-26, 26); y += rnd(-26, 26); g.lineTo(x, y); }
      g.stroke();
    }
  });
  const bumpC = makeCanvas(512, 512, (g, w, h) => {
    g.fillStyle = '#808080'; g.fillRect(0, 0, w, h);
    for (let y = 8; y < h; y += 22) {
      for (let x = 0; x < w; x += 20) {
        const ox = x + ((y / 22) % 2) * 10;
        const grad = g.createRadialGradient(ox, y, 1, ox, y, 10);
        grad.addColorStop(0, '#c8c8c8'); grad.addColorStop(1, '#3a3a3a');
        g.fillStyle = grad;
        g.beginPath(); g.arc(ox, y, 9, 0, 6.3); g.fill();
      }
    }
  });
  // molten cracks: black mask with hot orange veins, used as emissiveMap
  const cracksC = makeCanvas(512, 512, (g, w, h) => {
    g.fillStyle = '#000000'; g.fillRect(0, 0, w, h);
    g.lineCap = 'round'; g.lineJoin = 'round';
    for (let i = 0; i < 42; i++) {
      let x = Math.random() * w, y = Math.random() * h;
      const pts = [[x, y]];
      const segs = 4 + (Math.random() * 4 | 0);
      for (let s = 0; s < segs; s++) { x += rnd(-46, 46); y += rnd(-46, 46); pts.push([x, y]); }
      const trace = (style, width, blur, blurColor) => {
        g.strokeStyle = style; g.lineWidth = width;
        g.shadowBlur = blur; g.shadowColor = blurColor;
        g.beginPath(); g.moveTo(pts[0][0], pts[0][1]);
        for (let s = 1; s < pts.length; s++) g.lineTo(pts[s][0], pts[s][1]);
        g.stroke();
      };
      trace('rgba(255,70,10,0.85)', 5, 14, '#ff4400');
      trace('rgba(255,150,50,0.9)', 2.5, 8, '#ff7714');
      trace('#ffe2b0', 1.2, 0, '#000000');
    }
    g.shadowBlur = 0;
  });
  const map = canvasTexture(mapC);
  const bump = canvasTexture(bumpC, false);
  const cracks = canvasTexture(cracksC);
  map.repeat.set(3, 3); bump.repeat.set(3, 3); cracks.repeat.set(3, 3);
  return { map, bump, cracks };
}

// One city tile: concrete block surrounded by asphalt road with lane dashes.
export function makeGroundTexture() {
  const c = makeCanvas(512, 512, (g, w, h) => {
    g.fillStyle = '#14161b'; g.fillRect(0, 0, w, h); // asphalt
    for (let i = 0; i < 1500; i++) {
      g.fillStyle = Math.random() < 0.5 ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.25)';
      g.fillRect(Math.random() * w, Math.random() * h, 2, 2);
    }
    const m = 64; // road margin
    g.fillStyle = '#23262d'; g.fillRect(m, m, w - 2 * m, h - 2 * m); // block
    g.strokeStyle = 'rgba(0,0,0,0.4)'; g.lineWidth = 2;
    for (let i = 1; i < 4; i++) {
      g.beginPath(); g.moveTo(m + (w - 2 * m) * i / 4, m); g.lineTo(m + (w - 2 * m) * i / 4, h - m); g.stroke();
      g.beginPath(); g.moveTo(m, m + (h - 2 * m) * i / 4); g.lineTo(w - m, m + (h - 2 * m) * i / 4); g.stroke();
    }
    g.strokeStyle = '#c8a028'; g.lineWidth = 4; g.setLineDash([26, 20]);
    g.beginPath(); g.moveTo(0, m / 2); g.lineTo(w, m / 2); g.stroke();
    g.beginPath(); g.moveTo(0, h - m / 2); g.lineTo(w, h - m / 2); g.stroke();
    g.beginPath(); g.moveTo(m / 2, 0); g.lineTo(m / 2, h); g.stroke();
    g.beginPath(); g.moveTo(w - m / 2, 0); g.lineTo(w - m / 2, h); g.stroke();
    g.setLineDash([]);
  });
  const t = canvasTexture(c);
  t.repeat.set(9, 9);
  return t;
}

// Building facade variants with lit windows; same canvas used as map + emissive.
export function makeBuildingVariants(n = 4) {
  const out = [];
  for (let v = 0; v < n; v++) {
    const litRatio = rnd(0.35, 0.7);
    const warm = Math.random() < 0.7;
    const c = makeCanvas(128, 256, (g, w, h) => {
      const grad = g.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#2b303c'); grad.addColorStop(1, '#161a23');
      g.fillStyle = grad; g.fillRect(0, 0, w, h);
      const cols = 6, rows = 14;
      const cw = w / cols, rh = h / rows;
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const lit = Math.random() < litRatio;
          if (lit) {
            g.fillStyle = warm ? (Math.random() < 0.8 ? '#ffca7a' : '#fff3d0') : '#bfe0ff';
          } else {
            g.fillStyle = '#0a0d14';
          }
          g.fillRect(x * cw + 2, y * rh + 3, cw - 4, rh - 6);
        }
      }
    });
    out.push(canvasTexture(c));
  }
  return out;
}

export function makeGlowTexture() {
  // neutral white flare; tinted per use via material color
  const c = makeCanvas(128, 128, (g, w, h) => {
    const grad = g.createRadialGradient(64, 64, 2, 64, 64, 62);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.35, 'rgba(255,255,255,0.65)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grad; g.fillRect(0, 0, w, h);
  });
  return canvasTexture(c);
}
// Generic CPU particle pool rendered as THREE.Points.
export class Particles {
  constructor(scene, { max = 600, size = 1.2, color = 0xffffff, blending = null, opacity = 0.85, gravity = 0, drag = 0 } = {}) {
    this.max = max; this.gravity = gravity; this.drag = drag;
    this.pos = new Float32Array(max * 3);
    this.vel = new Float32Array(max * 3);
    this.life = new Float32Array(max);
    this.span = new Float32Array(max);
    for (let i = 0; i < max; i++) this.pos[i * 3 + 1] = -9999;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(this.pos, 3));
    this.mat = new THREE.PointsMaterial({
      size, color, transparent: true, opacity, depthWrite: false,
      blending: blending || THREE.NormalBlending, sizeAttenuation: true
    });
    this.points = new THREE.Points(geo, this.mat);
    this.points.frustumCulled = false;
    scene.add(this.points);
    this.cursor = 0;
  }
  emit(p, { count = 12, spread = 3, speed = 6, up = 4, life = 1.4 } = {}) {
    for (let n = 0; n < count; n++) {
      const i = this.cursor; this.cursor = (this.cursor + 1) % this.max;
      this.pos[i * 3] = p.x + rnd(-spread, spread) * 0.3;
      this.pos[i * 3 + 1] = p.y + rnd(-spread, spread) * 0.3;
      this.pos[i * 3 + 2] = p.z + rnd(-spread, spread) * 0.3;
      const a = Math.random() * Math.PI * 2;
      const s = speed * rnd(0.3, 1);
      this.vel[i * 3] = Math.cos(a) * s;
      this.vel[i * 3 + 1] = up * rnd(0.2, 1.2);
      this.vel[i * 3 + 2] = Math.sin(a) * s;
      this.life[i] = this.span[i] = life * rnd(0.5, 1.2);
    }
  }
  update(dt) {
    const damp = Math.max(0, 1 - this.drag * dt);
    for (let i = 0; i < this.max; i++) {
      if (this.life[i] <= 0) continue;
      this.life[i] -= dt;
      if (this.life[i] <= 0) { this.pos[i * 3 + 1] = -9999; continue; }
      this.vel[i * 3 + 1] -= this.gravity * dt;
      this.vel[i * 3] *= damp; this.vel[i * 3 + 1] *= damp; this.vel[i * 3 + 2] *= damp;
      this.pos[i * 3] += this.vel[i * 3] * dt;
      this.pos[i * 3 + 1] += this.vel[i * 3 + 1] * dt;
      this.pos[i * 3 + 2] += this.vel[i * 3 + 2] * dt;
      if (this.pos[i * 3 + 1] < 0.2 && this.gravity > 0) {
        this.pos[i * 3 + 1] = 0.2;
        this.vel[i * 3 + 1] = 0; this.vel[i * 3] *= 0.9; this.vel[i * 3 + 2] *= 0.9;
      }
    }
    this.points.geometry.attributes.position.needsUpdate = true;
  }
}

// Expanding shockwave rings.
export class Shockwaves {
  constructor(scene) {
    this.items = [];
    this.geo = new THREE.RingGeometry(0.9, 1, 48);
    for (let i = 0; i < 5; i++) {
      const m = new THREE.Mesh(this.geo, new THREE.MeshBasicMaterial({
        color: 0xffb37a, transparent: true, opacity: 0,
        blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide
      }));
      m.rotation.x = -Math.PI / 2; m.visible = false;
      scene.add(m);
      this.items.push({ mesh: m, t: 1e9, dur: 0.7, size: 20 });
    }
  }
  blast(p, size = 22) {
    const s = this.items.find(s => s.t >= s.dur) || this.items[0];
    s.t = 0; s.size = size;
    s.mesh.position.set(p.x, 0.4, p.z);
    s.mesh.visible = true;
  }
  update(dt) {
    for (const s of this.items) {
      if (s.t >= s.dur) { s.mesh.visible = false; continue; }
      s.t += dt;
      const k = Math.min(1, s.t / s.dur);
      const r = 2 + (s.size - 2) * (1 - Math.pow(1 - k, 2));
      s.mesh.scale.set(r, r, 1);
      s.mesh.material.opacity = 0.75 * (1 - k);
    }
  }
}
// Atomic breath beam: hot core + glow sheath + impact light + flare sprite.
export class AtomicBreath {
  constructor(scene, glowTex) {
    this.group = new THREE.Group();
    const coreGeo = new THREE.CylinderGeometry(0.9, 1.6, 1, 12, 1, true);
    coreGeo.translate(0, 0.5, 0);
    this.core = new THREE.Mesh(coreGeo, new THREE.MeshBasicMaterial({
      color: 0xfff3dc, transparent: true, opacity: 0.95,
      blending: THREE.AdditiveBlending, depthWrite: false
    }));
    const glowGeo = new THREE.CylinderGeometry(2.2, 3.4, 1, 12, 1, true);
    glowGeo.translate(0, 0.5, 0);
    this.glow = new THREE.Mesh(glowGeo, new THREE.MeshBasicMaterial({
      color: 0xff4a1a, transparent: true, opacity: 0.5,
      blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide
    }));
    this.group.add(this.core, this.glow);
    this.light = new THREE.PointLight(0xff6a2a, 0, 260, 1.6);
    scene.add(this.light);
    this.flare = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glowTex, color: 0xff9a4d, transparent: true, opacity: 0.9,
      blending: THREE.AdditiveBlending, depthWrite: false
    }));
    this.flare.scale.set(26, 26, 1);
    scene.add(this.flare);
    scene.add(this.group);
    this.group.visible = false;
    this.flare.visible = false;
    this.t = 0;
  }
  setBeam(origin, dir, len, power) {
    this.t += 0.016;
    this.group.visible = true;
    this.flare.visible = true;
    this.group.position.copy(origin);
    const up = new THREE.Vector3(0, 1, 0);
    this.group.quaternion.setFromUnitVectors(up, dir);
    const flick = 1 + Math.sin(this.t * 90) * 0.08 + Math.sin(this.t * 37) * 0.06;
    this.core.scale.set(1.4 * flick * power, len, 1.4 * flick * power);
    this.glow.scale.set(1.5 * flick * power, len, 1.5 * flick * power);
    this.glow.material.opacity = 0.35 + 0.25 * Math.abs(Math.sin(this.t * 43));
    const hit = origin.clone().addScaledVector(dir, len);
    this.light.position.copy(hit);
    this.light.intensity = 900 * power;
    this.flare.position.copy(hit);
    const fs = (20 + Math.sin(this.t * 55) * 4) * power;
    this.flare.scale.set(fs, fs, 1);
  }
  hide() {
    this.group.visible = false;
    this.flare.visible = false;
    this.light.intensity = 0;
  }
}

// Streaky rain confined to a box that follows the action.
export class Rain {
  constructor(scene, count = 900, area = 150, height = 70) {
    this.area = area; this.height = height;
    const pos = new Float32Array(count * 6);
    this.drops = [];
    for (let i = 0; i < count; i++) {
      const x = rnd(-area, area), y = rnd(0, height), z = rnd(-area, area);
      this.drops.push({ x, y, z, v: rnd(38, 60) });
      pos[i * 6] = x; pos[i * 6 + 1] = y; pos[i * 6 + 2] = z;
      pos[i * 6 + 3] = x; pos[i * 6 + 4] = y + 1.6; pos[i * 6 + 5] = z;
    }
    this.geo = new THREE.BufferGeometry();
    this.geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.lines = new THREE.LineSegments(this.geo, new THREE.LineBasicMaterial({
      color: 0x8fb4d8, transparent: true, opacity: 0.35
    }));
    this.lines.frustumCulled = false;
    scene.add(this.lines);
  }
  update(dt, cx, cz) {
    const a = this.geo.attributes.position.array;
    for (let i = 0; i < this.drops.length; i++) {
      const d = this.drops[i];
      d.y -= d.v * dt;
      if (d.y < 0) { d.y = this.height; d.x = cx + rnd(-this.area, this.area); d.z = cz + rnd(-this.area, this.area); }
      a[i * 6] = d.x; a[i * 6 + 1] = d.y; a[i * 6 + 2] = d.z;
      a[i * 6 + 3] = d.x; a[i * 6 + 4] = d.y + 1.6; a[i * 6 + 5] = d.z;
    }
    this.geo.attributes.position.needsUpdate = true;
    this.lines.position.set(0, 0, 0);
  }
}
// Fully synthesized WebAudio: roar, stomps, breath loop, rain bed. No assets.
export class AudioSys {
  constructor() {
    this.ctx = null; this.master = null;
    this.breath = null; this.rainGain = null;
  }
  ensure() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return true; }
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.5;
      this.master.connect(this.ctx.destination);
      const len = this.ctx.sampleRate * 2;
      this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const d = this.noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      this.startRainBed();
      return true;
    } catch (e) { return false; }
  }
  noiseSrc(loop = true) {
    const s = this.ctx.createBufferSource();
    s.buffer = this.noiseBuf; s.loop = loop;
    return s;
  }
  roar() {
    if (!this.ensure()) return;
    const t = this.ctx.currentTime;
    const dur = 2.2;
    // descendingFM growl
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.exponentialRampToValueAtTime(38, t + dur);
    const og = this.ctx.createGain();
    og.gain.setValueAtTime(0.0001, t);
    og.gain.exponentialRampToValueAtTime(0.5, t + 0.15);
    og.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    const lp = this.ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 900; lp.Q.value = 4;
    osc.connect(lp); lp.connect(og); og.connect(this.master);
    osc.start(t); osc.stop(t + dur + 0.1);
    // breathy noise blast
    const n = this.noiseSrc();
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.setValueAtTime(300, t);
    bp.frequency.exponentialRampToValueAtTime(1200, t + 0.4);
    bp.frequency.exponentialRampToValueAtTime(150, t + dur);
    bp.Q.value = 1.2;
    const ng = this.ctx.createGain();
    ng.gain.setValueAtTime(0.0001, t);
    ng.gain.exponentialRampToValueAtTime(0.55, t + 0.2);
    ng.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    n.connect(bp); bp.connect(ng); ng.connect(this.master);
    n.start(t); n.stop(t + dur + 0.1);
  }
  thud(strength = 1) {
    if (!this.ensure()) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(72, t);
    o.frequency.exponentialRampToValueAtTime(26, t + 0.28);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.7 * strength, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
    o.connect(g); g.connect(this.master);
    o.start(t); o.stop(t + 0.45);
    const n = this.noiseSrc();
    const lp = this.ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 220;
    const ng = this.ctx.createGain();
    ng.gain.setValueAtTime(0.35 * strength, t);
    ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
    n.connect(lp); lp.connect(ng); ng.connect(this.master);
    n.start(t); n.stop(t + 0.35);
  }
  crash() {
    if (!this.ensure()) return;
    const t = this.ctx.currentTime;
    const n = this.noiseSrc();
    const lp = this.ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(2500, t);
    lp.frequency.exponentialRampToValueAtTime(120, t + 1.4);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.6, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
    n.connect(lp); lp.connect(g); g.connect(this.master);
    n.start(t); n.stop(t + 1.7);
    this.thud(1.2);
  }
  breathStart() {
    if (!this.ensure() || this.breath) return;
    const t = this.ctx.currentTime;
    const n = this.noiseSrc();
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 420; bp.Q.value = 0.8;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.4, t + 0.4);
    const o = this.ctx.createOscillator();
    o.type = 'sawtooth'; o.frequency.value = 52;
    const og = this.ctx.createGain(); og.gain.value = 0.16;
    const lp = this.ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 300;
    n.connect(bp); bp.connect(g); g.connect(this.master);
    o.connect(lp); lp.connect(og); og.connect(this.master);
    n.start(); o.start();
    this.breath = { n, o, g };
  }
  breathStop() {
    if (!this.breath) return;
    const t = this.ctx.currentTime;
    try {
      this.breath.g.gain.cancelScheduledValues(t);
      this.breath.g.gain.setValueAtTime(this.breath.g.gain.value, t);
      this.breath.g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
      const b = this.breath;
      setTimeout(() => { try { b.n.stop(); b.o.stop(); } catch (e) {} }, 400);
    } catch (e) {}
    this.breath = null;
  }
  startRainBed() {
    const n = this.noiseSrc();
    const lp = this.ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 1400;
    const g = this.ctx.createGain(); g.gain.value = 0.045;
    n.connect(lp); lp.connect(g); g.connect(this.master);
    n.start();
    this.rainGain = g;
  }
}

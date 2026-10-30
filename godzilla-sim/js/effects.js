import * as THREE from 'three';

// Hyper-Realistic Procedural PBR Textures, Particles, Thermonuclear Beam, Weather & Audio

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
  t.anisotropy = 8;
  return t;
}

function rnd(a, b) { return a + Math.random() * (b - a); }

// Photorealistic Godzilla Skin:
// Burnt charcoal/slate prehistoric crocodile armor, osteoderms, micro-wrinkles,
// with deep, subtle magma veins that ignite into incandescent thermonuclear plasma.
export function makeSkinTextures() {
  const size = 1024;

  // 1. Albedo Map: Charred obsidian slate hide with earthy weathered undertones
  const mapC = makeCanvas(size, size, (g, w, h) => {
    // Rich dark slate charcoal base
    g.fillStyle = '#14161a';
    g.fillRect(0, 0, w, h);

    // Subtle skin tonal variation & micro-pebble grain
    for (let i = 0; i < 6000; i++) {
      const x = Math.random() * w, y = Math.random() * h;
      const r = rnd(2, 8);
      const v = Math.random();
      if (v < 0.4) g.fillStyle = 'rgba(8, 10, 13, 0.6)';
      else if (v < 0.75) g.fillStyle = 'rgba(28, 32, 38, 0.4)';
      else if (v < 0.92) g.fillStyle = 'rgba(38, 44, 52, 0.25)';
      else g.fillStyle = 'rgba(55, 45, 38, 0.18)'; // weathered dust
      g.beginPath();
      g.arc(x, y, r, 0, Math.PI * 2);
      g.fill();
    }

    // Heavy polygonal reptilian scales / osteoderms
    const step = 32;
    for (let y = 0; y < h; y += step) {
      for (let x = 0; x < w; x += step) {
        const ox = x + ((Math.floor(y / step) % 2) * (step * 0.5)) + rnd(-3, 3);
        const oy = y + rnd(-3, 3);
        const r = step * 0.42;

        // Dark scale boundary groove
        g.fillStyle = 'rgba(6, 8, 10, 0.85)';
        g.beginPath();
        g.arc(ox, oy, r + 2, 0, Math.PI * 2);
        g.fill();

        // Armored scute dome
        const grad = g.createRadialGradient(ox - 2, oy - 2, 1, ox, oy, r);
        grad.addColorStop(0, '#2b313b');
        grad.addColorStop(0.7, '#1a1e25');
        grad.addColorStop(1, '#0f1216');
        g.fillStyle = grad;
        g.beginPath();
        g.arc(ox, oy, r, 0, Math.PI * 2);
        g.fill();
      }
    }

    // Realistic leathery skin creases and battle scars
    g.strokeStyle = 'rgba(5, 7, 9, 0.7)';
    g.lineWidth = 2.0;
    for (let i = 0; i < 30; i++) {
      let x = Math.random() * w, y = Math.random() * h;
      g.beginPath();
      g.moveTo(x, y);
      for (let s = 0; s < 5; s++) {
        x += rnd(-40, 40);
        y += rnd(-40, 40);
        g.lineTo(x, y);
      }
      g.stroke();
    }
  });

  // 2. Bump / Normal Map: Sharp faceted scute ridges and deep crevices
  const bumpC = makeCanvas(size, size, (g, w, h) => {
    g.fillStyle = '#656565';
    g.fillRect(0, 0, w, h);

    const step = 32;
    for (let y = 0; y < h; y += step) {
      for (let x = 0; x < w; x += step) {
        const ox = x + ((Math.floor(y / step) % 2) * (step * 0.5));
        const oy = y;
        const grad = g.createRadialGradient(ox, oy, 1, ox, oy, step * 0.44);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.65, '#909090');
        grad.addColorStop(0.9, '#303030');
        grad.addColorStop(1, '#0a0a0a'); // Deep groove between scales
        g.fillStyle = grad;
        g.beginPath();
        g.arc(ox, oy, step * 0.44, 0, Math.PI * 2);
        g.fill();
      }
    }
  });

  // 3. Radioactive Fissure Emissive Map:
  // Fine, organic branching lightning-like nuclear cracks that sit between scales.
  // Dark by default, blazing hot when energy surges!
  const cracksC = makeCanvas(size, size, (g, w, h) => {
    g.fillStyle = '#000000';
    g.fillRect(0, 0, w, h);
    g.lineCap = 'round';
    g.lineJoin = 'round';

    for (let i = 0; i < 28; i++) {
      let x = Math.random() * w, y = Math.random() * h;
      const pts = [[x, y]];
      const segs = 4 + (Math.random() * 4 | 0);
      for (let s = 0; s < segs; s++) {
        x += rnd(-45, 45);
        y += rnd(-45, 45);
        pts.push([x, y]);
      }

      // Outer soft magma halo
      g.strokeStyle = 'rgba(255, 50, 10, 0.7)';
      g.lineWidth = 4;
      g.shadowBlur = 12;
      g.shadowColor = '#ff2200';
      g.beginPath();
      g.moveTo(pts[0][0], pts[0][1]);
      for (let s = 1; s < pts.length; s++) g.lineTo(pts[s][0], pts[s][1]);
      g.stroke();

      // Sharp intense core
      g.strokeStyle = '#ffb040';
      g.lineWidth = 1.5;
      g.shadowBlur = 0;
      g.beginPath();
      g.moveTo(pts[0][0], pts[0][1]);
      for (let s = 1; s < pts.length; s++) g.lineTo(pts[s][0], pts[s][1]);
      g.stroke();
    }
  });

  const map = canvasTexture(mapC);
  const bump = canvasTexture(bumpC, false);
  const cracks = canvasTexture(cracksC);
  map.repeat.set(3, 3);
  bump.repeat.set(3, 3);
  cracks.repeat.set(3, 3);
  return { map, bump, cracks };
}

// Photorealistic Wet Asphalt Downtown City Ground:
// Wet tarmac with asphalt aggregate, clear lane markings, pedestrian crossings,
// concrete sidewalks and curbs, and reflective puddle patches.
export function makeGroundTexture() {
  const size = 1024;
  const c = makeCanvas(size, size, (g, w, h) => {
    // Wet dark asphalt base
    g.fillStyle = '#111317';
    g.fillRect(0, 0, w, h);

    // Asphalt aggregate noise
    for (let i = 0; i < 8000; i++) {
      const v = Math.random();
      if (v < 0.4) g.fillStyle = 'rgba(255,255,255,0.03)';
      else if (v < 0.75) g.fillStyle = 'rgba(0,0,0,0.3)';
      else g.fillStyle = 'rgba(40,46,55,0.18)';
      g.fillRect(Math.random() * w, Math.random() * h, 2, 2);
    }

    const roadW = 110; // Clean road width
    const m = roadW;

    // Concrete Sidewalk Block Interior
    g.fillStyle = '#21252d';
    g.fillRect(m, m, w - 2 * m, h - 2 * m);

    // Pavement slab lines
    g.strokeStyle = 'rgba(10, 12, 16, 0.65)';
    g.lineWidth = 2;
    const slabs = 8;
    const blockW = w - 2 * m;
    for (let i = 0; i <= slabs; i++) {
      const p = m + (blockW * i / slabs);
      g.beginPath(); g.moveTo(p, m); g.lineTo(p, h - m); g.stroke();
      g.beginPath(); g.moveTo(m, p); g.lineTo(w - m, p); g.stroke();
    }

    // Concrete curb border around block
    g.strokeStyle = '#404856';
    g.lineWidth = 5;
    g.strokeRect(m, m, blockW, blockW);

    // Pedestrian crosswalk zebra stripes at intersections
    g.fillStyle = '#e2e4e8';
    const stripeW = 14, stripeL = 34;
    for (let i = 0; i < 5; i++) {
      g.fillRect(m + 16 + i * 20, m - stripeL - 5, stripeW, stripeL);
      g.fillRect(m + 16 + i * 20, h - m + 5, stripeW, stripeL);
      g.fillRect(m - stripeL - 5, m + 16 + i * 20, stripeL, stripeW);
      g.fillRect(w - m + 5, m + 16 + i * 20, stripeL, stripeW);
    }

    // Double yellow center road divider
    g.strokeStyle = '#d49b18';
    g.lineWidth = 3;
    const drawDoubleYellow = (x1, y1, x2, y2, ox, oy) => {
      g.beginPath(); g.moveTo(x1 - ox, y1 - oy); g.lineTo(x2 - ox, y2 - oy); g.stroke();
      g.beginPath(); g.moveTo(x1 + ox, y1 + oy); g.lineTo(x2 + ox, y2 + oy); g.stroke();
    };
    drawDoubleYellow(0, roadW / 2, w, roadW / 2, 0, 2.5);
    drawDoubleYellow(0, h - roadW / 2, w, h - roadW / 2, 0, 2.5);
    drawDoubleYellow(roadW / 2, 0, roadW / 2, h, 2.5, 0);
    drawDoubleYellow(w - roadW / 2, 0, w - roadW / 2, h, 2.5, 0);

    // White dashed lane lines
    g.strokeStyle = '#ffffff';
    g.lineWidth = 2.5;
    g.setLineDash([26, 22]);
    g.beginPath(); g.moveTo(0, roadW * 0.25); g.lineTo(w, roadW * 0.25); g.stroke();
    g.beginPath(); g.moveTo(0, roadW * 0.75); g.lineTo(w, roadW * 0.75); g.stroke();
    g.beginPath(); g.moveTo(0, h - roadW * 0.25); g.lineTo(w, h - roadW * 0.25); g.stroke();
    g.beginPath(); g.moveTo(0, h - roadW * 0.75); g.lineTo(w, h - roadW * 0.75); g.stroke();
    g.beginPath(); g.moveTo(roadW * 0.25, 0); g.lineTo(roadW * 0.25, h); g.stroke();
    g.beginPath(); g.moveTo(roadW * 0.75, 0); g.lineTo(roadW * 0.75, h); g.stroke();
    g.beginPath(); g.moveTo(w - roadW * 0.25, 0); g.lineTo(w - roadW * 0.25, h); g.stroke();
    g.beginPath(); g.moveTo(w - roadW * 0.75, 0); g.lineTo(w - roadW * 0.75, h); g.stroke();
    g.setLineDash([]);
  });

  const t = canvasTexture(c);
  t.repeat.set(8, 8);
  return t;
}

// Photorealistic Skyscraper Facade Variants:
// Sleek dark reflective glass curtain-walls, realistic architectural window proportions,
// authentic ratio of lit/unlit offices, interior blinds, and metallic mullion grids.
export function makeBuildingVariants(n = 5) {
  const out = [];

  const skyscraperStyles = [
    // 1. Modern Deep Navy Glass Financial Tower
    { glass: '#0c131c', frame: '#1b2330', litRate: 0.35, warmWhite: 0.7, cols: 5, rows: 12 },
    // 2. High-Tech Obsidian / Bronze Corporate Headquarters
    { glass: '#121418', frame: '#24262c', litRate: 0.42, warmWhite: 0.8, cols: 4, rows: 10 },
    // 3. Azure Reflective Steel High-Rise
    { glass: '#0f1824', frame: '#1a2838', litRate: 0.38, warmWhite: 0.4, cols: 6, rows: 14 },
    // 4. International Style Concrete & Ribbon Window Tower
    { glass: '#11151c', frame: '#2a2e36', litRate: 0.48, warmWhite: 0.6, cols: 5, rows: 11 },
    // 5. Sleek Smoked Glass Skyscraper
    { glass: '#14161a', frame: '#22252a', litRate: 0.32, warmWhite: 0.85, cols: 4, rows: 12 }
  ];

  for (let v = 0; v < n; v++) {
    const s = skyscraperStyles[v % skyscraperStyles.length];
    const c = makeCanvas(256, 512, (g, w, h) => {
      // Dark architectural glass gradient
      g.fillStyle = s.glass;
      g.fillRect(0, 0, w, h);

      const cw = w / s.cols;
      const rh = h / s.rows;

      for (let y = 0; y < s.rows; y++) {
        // Floor spandrel band (horizontal division between floors)
        g.fillStyle = s.frame;
        g.fillRect(0, y * rh, w, 5);

        for (let x = 0; x < s.cols; x++) {
          const wx = x * cw + 5;
          const wy = y * rh + 5;
          const ww = cw - 10;
          const wh = rh - 10;

          const isLit = Math.random() < s.litRate;
          if (isLit) {
            const isWarm = Math.random() < s.warmWhite;
            let col;
            if (isWarm) {
              const warmColors = ['#ffe1a0', '#ffd37f', '#ffeaaf', '#ffc766'];
              col = warmColors[(Math.random() * warmColors.length) | 0];
            } else {
              const coolColors = ['#d1e7ff', '#b3d8ff', '#e8f4ff', '#9ec8ff'];
              col = coolColors[(Math.random() * coolColors.length) | 0];
            }
            g.fillStyle = col;
            g.fillRect(wx, wy, ww, wh);

            // Realistic blinds / window partition silhouette
            if (Math.random() < 0.45) {
              g.fillStyle = 'rgba(10, 15, 20, 0.45)';
              g.fillRect(wx, wy, ww, wh * rnd(0.25, 0.65));
            }
          } else {
            // Unlit window: deep reflective dark glass with subtle room shadow
            g.fillStyle = '#06090f';
            g.fillRect(wx, wy, ww, wh);
          }
        }
      }

      // Vertical structural aluminum mullions
      g.fillStyle = s.frame;
      for (let x = 0; x <= s.cols; x++) {
        g.fillRect(x * cw - 2, 0, 4, h);
      }
    });

    out.push(canvasTexture(c));
  }
  return out;
}

export function makeGlowTexture() {
  const c = makeCanvas(256, 256, (g, w, h) => {
    const cx = w / 2, cy = h / 2;
    const grad = g.createRadialGradient(cx, cy, 2, cx, cy, cx - 4);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.18, 'rgba(255, 235, 200, 0.85)');
    grad.addColorStop(0.4, 'rgba(255, 160, 60, 0.45)');
    grad.addColorStop(0.7, 'rgba(255, 80, 20, 0.15)');
    grad.addColorStop(1, 'rgba(255, 40, 10, 0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, w, h);
  });
  return canvasTexture(c);
}

// Photorealistic Obsidian Dorsal Plate Texture:
// Burnt volcanic stone, craggy rock relief, and central crystalline radioactive energy vein.
export function makeSpineTexture() {
  const c = makeCanvas(256, 512, (g, w, h) => {
    // Dark craggy obsidian stone base
    g.fillStyle = '#14161b';
    g.fillRect(0, 0, w, h);

    // Stone grain noise
    for (let i = 0; i < 3000; i++) {
      const v = Math.random();
      g.fillStyle = v < 0.5 ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.35)';
      g.fillRect(Math.random() * w, Math.random() * h, 2, 2);
    }

    // Lateral stone striations / fluting
    g.strokeStyle = 'rgba(6, 8, 11, 0.6)';
    g.lineWidth = 2;
    for (let y = 10; y < h; y += 14) {
      g.beginPath();
      g.moveTo(0, y);
      g.lineTo(w, y + rnd(-8, 8));
      g.stroke();
    }

    // Glowing radioactive core vein down the center
    const cx = w / 2;
    const grad = g.createLinearGradient(cx - 30, 0, cx + 30, 0);
    grad.addColorStop(0, 'rgba(255, 40, 0, 0)');
    grad.addColorStop(0.3, 'rgba(255, 60, 0, 0.4)');
    grad.addColorStop(0.5, 'rgba(255, 160, 40, 0.85)');
    grad.addColorStop(0.7, 'rgba(255, 60, 0, 0.4)');
    grad.addColorStop(1, 'rgba(255, 40, 0, 0)');
    g.fillStyle = grad;
    g.fillRect(cx - 35, 0, 70, h);

    // White-hot inner core thread
    g.strokeStyle = '#fff0d0';
    g.lineWidth = 2.5;
    g.beginPath();
    g.moveTo(cx, h);
    for (let y = h - 20; y >= 0; y -= 30) {
      g.lineTo(cx + rnd(-6, 6), y);
    }
    g.stroke();
  });
  return canvasTexture(c);
}

// High-Performance Particles
export class Particles {
  constructor(scene, {
    max = 800, size = 1.8, color = 0xffffff, blending = null, opacity = 0.85,
    gravity = 0, drag = 0
  } = {}) {
    this.max = max;
    this.gravity = gravity;
    this.drag = drag;
    this.pos = new Float32Array(max * 3);
    this.vel = new Float32Array(max * 3);
    this.life = new Float32Array(max);
    this.span = new Float32Array(max);

    for (let i = 0; i < max; i++) this.pos[i * 3 + 1] = -9999;

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(this.pos, 3));
    this.mat = new THREE.PointsMaterial({
      size,
      color,
      transparent: true,
      opacity,
      depthWrite: false,
      blending: blending || THREE.NormalBlending,
      sizeAttenuation: true
    });
    this.points = new THREE.Points(geo, this.mat);
    this.points.frustumCulled = false;
    scene.add(this.points);
    this.cursor = 0;
  }

  emit(p, { count = 12, spread = 3, speed = 6, up = 4, life = 1.4 } = {}) {
    for (let n = 0; n < count; n++) {
      const i = this.cursor;
      this.cursor = (this.cursor + 1) % this.max;
      this.pos[i * 3] = p.x + rnd(-spread, spread) * 0.4;
      this.pos[i * 3 + 1] = Math.max(0.2, p.y + rnd(-spread, spread) * 0.2);
      this.pos[i * 3 + 2] = p.z + rnd(-spread, spread) * 0.4;

      const a = Math.random() * Math.PI * 2;
      const s = speed * rnd(0.3, 1.2);
      this.vel[i * 3] = Math.cos(a) * s;
      this.vel[i * 3 + 1] = up * rnd(0.3, 1.4);
      this.vel[i * 3 + 2] = Math.sin(a) * s;
      this.life[i] = this.span[i] = life * rnd(0.6, 1.3);
    }
  }

  update(dt) {
    const damp = Math.max(0, 1 - this.drag * dt);
    for (let i = 0; i < this.max; i++) {
      if (this.life[i] <= 0) continue;
      this.life[i] -= dt;
      if (this.life[i] <= 0) {
        this.pos[i * 3 + 1] = -9999;
        continue;
      }
      this.vel[i * 3 + 1] -= this.gravity * dt;
      this.vel[i * 3] *= damp;
      this.vel[i * 3 + 1] *= damp;
      this.vel[i * 3 + 2] *= damp;

      this.pos[i * 3] += this.vel[i * 3] * dt;
      this.pos[i * 3 + 1] += this.vel[i * 3 + 1] * dt;
      this.pos[i * 3 + 2] += this.vel[i * 3 + 2] * dt;

      if (this.pos[i * 3 + 1] < 0.2 && this.gravity > 0) {
        this.pos[i * 3 + 1] = 0.2;
        this.vel[i * 3 + 1] *= -0.25;
        this.vel[i * 3] *= 0.7;
        this.vel[i * 3 + 2] *= 0.7;
      }
    }
    this.points.geometry.attributes.position.needsUpdate = true;
  }
}

// Expanding Shockwave Rings
export class Shockwaves {
  constructor(scene) {
    this.items = [];
    this.geo = new THREE.RingGeometry(0.85, 1.0, 64);
    for (let i = 0; i < 8; i++) {
      const m = new THREE.Mesh(this.geo, new THREE.MeshBasicMaterial({
        color: 0xffb37a,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide
      }));
      m.rotation.x = -Math.PI / 2;
      m.visible = false;
      scene.add(m);
      this.items.push({ mesh: m, t: 1e9, dur: 0.8, size: 24 });
    }
  }

  blast(p, size = 24, color = 0xffb37a) {
    const s = this.items.find(s => s.t >= s.dur) || this.items[0];
    s.t = 0;
    s.size = size;
    s.mesh.material.color.setHex(color);
    s.mesh.position.set(p.x, 0.45, p.z);
    s.mesh.visible = true;
  }

  update(dt) {
    for (const s of this.items) {
      if (s.t >= s.dur) {
        s.mesh.visible = false;
        continue;
      }
      s.t += dt;
      const k = Math.min(1, s.t / s.dur);
      const r = 2 + (s.size - 2) * (1 - Math.pow(1 - k, 2.5));
      s.mesh.scale.set(r, r, 1);
      s.mesh.material.opacity = 0.85 * (1 - k);
    }
  }
}

// Hyper-Realistic Thermonuclear Atomic Breath
export class AtomicBreath {
  constructor(scene, glowTex) {
    this.group = new THREE.Group();

    // 1. Incandescent White-Hot Core
    const coreGeo = new THREE.CylinderGeometry(0.4, 0.75, 1, 16, 1, true);
    coreGeo.translate(0, 0.5, 0);
    this.core = new THREE.Mesh(coreGeo, new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.98,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    }));

    // 2. High-Energy Inner Plasma Sheath
    const midGeo = new THREE.CylinderGeometry(0.85, 1.45, 1, 16, 1, true);
    midGeo.translate(0, 0.5, 0);
    this.mid = new THREE.Mesh(midGeo, new THREE.MeshBasicMaterial({
      color: 0xff8833,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    }));

    // 3. Volumetric Outer Heat Halo
    const glowGeo = new THREE.CylinderGeometry(1.6, 2.6, 1, 16, 1, true);
    glowGeo.translate(0, 0.5, 0);
    this.glow = new THREE.Mesh(glowGeo, new THREE.MeshBasicMaterial({
      color: 0xff3300,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    }));

    this.group.add(this.core, this.mid, this.glow);

    // Mid-beam illumination
    this.beamLight = new THREE.PointLight(0xff7722, 0, 180, 1.8);
    scene.add(this.beamLight);

    // Impact point light
    this.light = new THREE.PointLight(0xff8833, 0, 320, 1.6);
    scene.add(this.light);

    // Impact flare
    this.flare = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glowTex,
      color: 0xffaa55,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    }));
    this.flare.scale.set(34, 34, 1);
    scene.add(this.flare);

    // Mouth blast flare
    this.mouthFlare = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glowTex,
      color: 0xff7722,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    }));
    this.mouthFlare.scale.set(16, 16, 1);
    scene.add(this.mouthFlare);

    scene.add(this.group);
    this.group.visible = false;
    this.flare.visible = false;
    this.mouthFlare.visible = false;
    this.t = 0;
  }

  setBeam(origin, dir, len, power) {
    this.t += 0.016;
    this.group.visible = true;
    this.flare.visible = true;
    this.mouthFlare.visible = true;

    this.group.position.copy(origin);
    const up = new THREE.Vector3(0, 1, 0);
    this.group.quaternion.setFromUnitVectors(up, dir);

    const flick = 1 + Math.sin(this.t * 85) * 0.08 + Math.sin(this.t * 37) * 0.05;
    this.core.scale.set(1.2 * flick * power, len, 1.2 * flick * power);
    this.mid.scale.set(1.5 * flick * power, len, 1.5 * flick * power);
    this.glow.scale.set(1.8 * flick * power, len, 1.8 * flick * power);

    this.glow.material.opacity = 0.28 + 0.2 * Math.abs(Math.sin(this.t * 40));
    this.mid.material.opacity = 0.6 + 0.2 * Math.cos(this.t * 60);

    const midPoint = origin.clone().addScaledVector(dir, len * 0.5);
    this.beamLight.position.copy(midPoint);
    this.beamLight.intensity = 400 * power;

    const hit = origin.clone().addScaledVector(dir, len);
    this.light.position.copy(hit);
    this.light.intensity = 1100 * power;

    this.flare.position.copy(hit);
    const fs = (28 + Math.sin(this.t * 60) * 5) * power;
    this.flare.scale.set(fs, fs, 1);

    this.mouthFlare.position.copy(origin);
    const ms = (14 + Math.sin(this.t * 70) * 3) * power;
    this.mouthFlare.scale.set(ms, ms, 1);
  }

  hide() {
    this.group.visible = false;
    this.flare.visible = false;
    this.mouthFlare.visible = false;
    this.light.intensity = 0;
    this.beamLight.intensity = 0;
  }
}

// Torrential Rain
export class Rain {
  constructor(scene, count = 1200, area = 160, height = 75) {
    this.area = area;
    this.height = height;
    const pos = new Float32Array(count * 6);
    this.drops = [];
    const slantX = 0.32;
    this.slantX = slantX;

    for (let i = 0; i < count; i++) {
      const x = rnd(-area, area), y = rnd(0, height), z = rnd(-area, area);
      const v = rnd(45, 75);
      this.drops.push({ x, y, z, v });
      pos[i * 6] = x;
      pos[i * 6 + 1] = y;
      pos[i * 6 + 2] = z;
      pos[i * 6 + 3] = x + slantX * 2.2;
      pos[i * 6 + 4] = y + 2.4;
      pos[i * 6 + 5] = z;
    }

    this.geo = new THREE.BufferGeometry();
    this.geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.lines = new THREE.LineSegments(this.geo, new THREE.LineBasicMaterial({
      color: 0x9bc2e8,
      transparent: true,
      opacity: 0.38
    }));
    this.lines.frustumCulled = false;
    scene.add(this.lines);
  }

  update(dt, cx, cz) {
    const a = this.geo.attributes.position.array;
    const sx = this.slantX * 2.4;
    for (let i = 0; i < this.drops.length; i++) {
      const d = this.drops[i];
      d.y -= d.v * dt;
      d.x += this.slantX * d.v * dt;

      if (d.y < 0) {
        d.y = this.height;
        d.x = cx + rnd(-this.area, this.area);
        d.z = cz + rnd(-this.area, this.area);
      }

      a[i * 6] = d.x;
      a[i * 6 + 1] = d.y;
      a[i * 6 + 2] = d.z;
      a[i * 6 + 3] = d.x + sx;
      a[i * 6 + 4] = d.y + 2.4;
      a[i * 6 + 5] = d.z;
    }
    this.geo.attributes.position.needsUpdate = true;
  }
}

// Synthesized WebAudio
export class AudioSys {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.breath = null;
    this.rainGain = null;
    this.rainTarget = 0.045;
  }

  ensure() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return true;
    }
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.55;
      this.master.connect(this.ctx.destination);

      const len = this.ctx.sampleRate * 2;
      this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const d = this.noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;

      this.startRainBed();
      return true;
    } catch (e) {
      return false;
    }
  }

  noiseSrc(loop = true) {
    const s = this.ctx.createBufferSource();
    s.buffer = this.noiseBuf;
    s.loop = loop;
    return s;
  }

  roar() {
    if (!this.ensure()) return;
    const t = this.ctx.currentTime;
    const dur = 2.4;

    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(175, t);
    osc.frequency.exponentialRampToValueAtTime(32, t + dur);

    const og = this.ctx.createGain();
    og.gain.setValueAtTime(0.0001, t);
    og.gain.exponentialRampToValueAtTime(0.65, t + 0.18);
    og.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    const lp = this.ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 1100;
    lp.Q.value = 4.5;

    osc.connect(lp);
    lp.connect(og);
    og.connect(this.master);
    osc.start(t);
    osc.stop(t + dur + 0.1);

    const n = this.noiseSrc();
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(340, t);
    bp.frequency.exponentialRampToValueAtTime(1400, t + 0.45);
    bp.frequency.exponentialRampToValueAtTime(140, t + dur);
    bp.Q.value = 1.4;

    const ng = this.ctx.createGain();
    ng.gain.setValueAtTime(0.0001, t);
    ng.gain.exponentialRampToValueAtTime(0.65, t + 0.22);
    ng.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    n.connect(bp);
    bp.connect(ng);
    ng.connect(this.master);
    n.start(t);
    n.stop(t + dur + 0.1);
  }

  thud(strength = 1) {
    if (!this.ensure()) return;
    const t = this.ctx.currentTime;

    const o = this.ctx.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(80, t);
    o.frequency.exponentialRampToValueAtTime(22, t + 0.32);

    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.85 * strength, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);

    o.connect(g);
    g.connect(this.master);
    o.start(t);
    o.stop(t + 0.5);

    const n = this.noiseSrc();
    const lp = this.ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 240;

    const ng = this.ctx.createGain();
    ng.gain.setValueAtTime(0.45 * strength, t);
    ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);

    n.connect(lp);
    lp.connect(ng);
    ng.connect(this.master);
    n.start(t);
    n.stop(t + 0.4);
  }

  crash() {
    if (!this.ensure()) return;
    const t = this.ctx.currentTime;
    const n = this.noiseSrc();
    const lp = this.ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(2800, t);
    lp.frequency.exponentialRampToValueAtTime(100, t + 1.6);

    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.7, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);

    n.connect(lp);
    lp.connect(g);
    g.connect(this.master);
    n.start(t);
    n.stop(t + 1.9);

    this.thud(1.3);
  }

  breathStart() {
    if (!this.ensure() || this.breath) return;
    const t = this.ctx.currentTime;
    const n = this.noiseSrc();
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 460;
    bp.Q.value = 0.9;

    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.45, t + 0.35);

    const o = this.ctx.createOscillator();
    o.type = 'sawtooth';
    o.frequency.value = 56;
    const og = this.ctx.createGain();
    og.gain.value = 0.2;

    const lp = this.ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 350;

    n.connect(bp);
    bp.connect(g);
    g.connect(this.master);
    o.connect(lp);
    lp.connect(og);
    og.connect(this.master);

    n.start();
    o.start();
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
      setTimeout(() => {
        try { b.n.stop(); b.o.stop(); } catch (e) {}
      }, 400);
    } catch (e) {}
    this.breath = null;
  }

  startRainBed() {
    const n = this.noiseSrc();
    const lp = this.ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 1400;

    const g = this.ctx.createGain();
    g.gain.value = this.rainTarget;
    n.connect(lp);
    lp.connect(g);
    g.connect(this.master);
    n.start();
    this.rainGain = g;
  }

  setRain(enabled) {
    if (!this.rainGain || !this.ctx) return;
    const t = this.ctx.currentTime;
    this.rainGain.gain.cancelScheduledValues(t);
    this.rainGain.gain.setValueAtTime(this.rainGain.gain.value, t);
    this.rainGain.gain.linearRampToValueAtTime(enabled ? 0.045 : 0.0001, t + 0.5);
  }
}

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { Godzilla } from './godzilla.js';
import { City } from './city.js';
import {
  makeSkinTextures, makeGroundTexture, makeBuildingVariants, makeGlowTexture, makeSpineTexture,
  Particles, Shockwaves, AtomicBreath, Rain, AudioSys
} from './effects.js';

const $ = id => document.getElementById(id);
const loadMsg = $('load-msg');
function fail(msg) {
  loadMsg.textContent = msg;
  loadMsg.style.color = '#ff7a7a';
  throw new Error(msg);
}
window.addEventListener('error', e => {
  if (!$('hud').classList.contains('hidden')) return;
  loadMsg.textContent = 'Failed to start: ' + (e.message || 'unknown error') + ' — needs internet for CDN.';
  loadMsg.style.color = '#ff7a7a';
});

// ---------- Hyper-Realistic Renderer & Scene Setup ----------
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
$('app').appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x080d1a);
scene.fog = new THREE.FogExp2(0x0c1424, 0.0028);

const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.5, 1600);
camera.position.set(-20, 26, 26);

// Cinematic Post-Processing: Selective Bloom for radioactive energy, glass reflections & streetlights
const composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(
  innerWidth, innerHeight, { type: THREE.HalfFloatType, samples: 4 }
));
composer.setPixelRatio(Math.min(devicePixelRatio, 2));
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.65, 0.45, 0.72);
composer.addPass(bloom);
composer.addPass(new OutputPass());

// ---------- Dramatic Cinematic Lighting ----------
const hemi = new THREE.HemisphereLight(0x628ac0, 0x18202c, 0.85);
scene.add(hemi);

// High-resolution directional moonlight casting soft contact shadows
const moon = new THREE.DirectionalLight(0xb0d0ff, 1.5);
moon.position.set(-130, 190, 70);
moon.castShadow = true;
moon.shadow.mapSize.set(2048, 2048);
moon.shadow.camera.left = -170;
moon.shadow.camera.right = 170;
moon.shadow.camera.top = 170;
moon.shadow.camera.bottom = -170;
moon.shadow.camera.near = 20;
moon.shadow.camera.far = 520;
moon.shadow.bias = -0.0003;
scene.add(moon);

// Atmospheric rim light catching shoulders and dorsal plates
const rim = new THREE.DirectionalLight(0x2d7eff, 0.85);
rim.position.set(90, 45, -150);
scene.add(rim);

// Front key light illuminating Godzilla's face, scales, muscles and wet sheen
const keyLight = new THREE.DirectionalLight(0xdde8ff, 1.35);
keyLight.position.set(-35, 45, 55);
scene.add(keyLight);

// Warm city ground bounce light
const cityGlow = new THREE.PointLight(0xff9e4d, 520, 320, 1.8);
cityGlow.position.set(0, 45, 0);
scene.add(cityGlow);

// ---------- World Generation ----------
const skin = makeSkinTextures();
const groundTex = makeGroundTexture();
const facades = makeBuildingVariants(5);
const glowTex = makeGlowTexture();
const spineTex = makeSpineTexture();

const city = new City(scene, groundTex, facades);
const gz = new Godzilla(scene, skin, spineTex);
gz.root.position.set(0, 0, 0);
gz.root.rotation.y = 0.6;

// Particle Systems: Dust, Smoke, Fire, Sparks, Molten Embers, and Shattering Glass
const dust = new Particles(scene, { max: 750, size: 2.4, color: 0x969085, opacity: 0.55, gravity: -1.6, drag: 1.2 });
const smoke = new Particles(scene, { max: 550, size: 4.8, color: 0x22242a, opacity: 0.52, gravity: -2.8, drag: 0.6 });
const fire = new Particles(scene, { max: 450, size: 2.6, color: 0xff8525, opacity: 0.92, blending: THREE.AdditiveBlending, gravity: -6.5, drag: 0.8 });
const sparks = new Particles(scene, { max: 550, size: 1.0, color: 0xffe2b2, opacity: 0.95, blending: THREE.AdditiveBlending, gravity: 24, drag: 0.4 });
const embers = new Particles(scene, { max: 450, size: 1.2, color: 0xff7722, opacity: 0.95, blending: THREE.AdditiveBlending, gravity: -5.5, drag: 0.6 });
const glass = new Particles(scene, { max: 600, size: 1.2, color: 0xcde8ff, opacity: 0.9, blending: THREE.AdditiveBlending, gravity: 26, drag: 0.35 });

const shock = new Shockwaves(scene);
const beam = new AtomicBreath(scene, glowTex);
const rain = new Rain(scene);
const audio = new AudioSys();

const hooks = {
  onCollapse(b) {
    const p = new THREE.Vector3(b.x, 5, b.z);
    dust.emit(p, { count: 70, spread: 12, speed: 15, up: 12, life: 2.8 });
    smoke.emit(p, { count: 35, spread: 9, speed: 7, up: 14, life: 4.2 });
    fire.emit(p, { count: 45, spread: 9, speed: 9, up: 15, life: 1.8 });
    sparks.emit(p, { count: 45, spread: 9, speed: 24, up: 20, life: 1.3 });
    glass.emit(p, { count: 65, spread: 14, speed: 18, up: 16, life: 1.6 });
    shock.blast(p, 36, 0xffa055);
    audio.crash();
    city.fires.push({ x: b.x, z: b.z, t: 0, dur: 28 + Math.random() * 22 });
    addShake(1.4);
  },
  onHit(b) {
    const hitP = new THREE.Vector3(b.x, b.h * 0.55, b.z);
    dust.emit(hitP, { count: 8, spread: 7, speed: 9, up: 9, life: 1.5 });
    glass.emit(hitP, { count: 18, spread: 8, speed: 14, up: 10, life: 1.2 });
  }
};

// ---------- State & Controls ----------
const state = {
  energy: 1,
  beamHeld: false,
  beamActive: false,
  camMode: 0,
  night: 1,
  rainOn: true,
  walking: false,
  yaw: 0.6,
  speed: 0,
  shake: 0,
  stompCD: 0,
  roarCD: 0,
  time: 0,
  destroyed: 0
};

const CAM_NAMES = ['ORBIT', 'FOLLOW', 'CINEMATIC', 'TOP'];
const keys = {};
const touchInput = { fwd: 0, right: 0 };

addEventListener('keydown', e => {
  if (e.repeat) return;
  keys[e.code] = true;
  audio.ensure();
  if (e.code === 'KeyR') doRoar();
  if (e.code === 'Space') { doStomp(); e.preventDefault(); }
  if (e.code === 'KeyC') cycleCam();
  if (e.code === 'KeyN') toggleDay();
  if (e.code === 'KeyP') toggleRain();
});

addEventListener('keyup', e => { keys[e.code] = false; });
addEventListener('pointerdown', () => audio.ensure(), { once: true });

function pressButton(id, downFn, upFn) {
  const el = $(id);
  if (!el) return;
  const down = e => { e.preventDefault(); audio.ensure(); el.classList.add('held'); downFn(); };
  const up = e => { if (e) e.preventDefault(); el.classList.remove('held'); if (upFn) upFn(); };
  el.addEventListener('pointerdown', down);
  el.addEventListener('pointerup', up);
  el.addEventListener('pointerleave', up);
  el.addEventListener('pointercancel', up);
}

pressButton('btn-roar', () => doRoar());
pressButton('btn-breath',
  () => { state.beamHeld = true; },
  () => { state.beamHeld = false; });
pressButton('btn-stomp', () => doStomp());
pressButton('btn-walk', () => {
  state.walking = !state.walking;
  $('btn-walk').textContent = state.walking ? 'HALT' : 'WALK: OFF';
});
pressButton('btn-cam', () => cycleCam());
pressButton('btn-day', () => toggleDay());

// Directional Pad (Touch / Mouse on-screen controls)
function bindDpad(id, onDown, onUp) {
  const el = $(id);
  if (!el) return;
  const down = e => { e.preventDefault(); audio.ensure(); el.classList.add('held'); onDown(); };
  const up = e => { if (e) e.preventDefault(); el.classList.remove('held'); onUp(); };
  el.addEventListener('pointerdown', down);
  el.addEventListener('pointerup', up);
  el.addEventListener('pointerleave', up);
  el.addEventListener('pointercancel', up);
}

bindDpad('dpad-up', () => { touchInput.fwd = 1; }, () => { touchInput.fwd = 0; });
bindDpad('dpad-down', () => { touchInput.fwd = -1; }, () => { touchInput.fwd = 0; });
bindDpad('dpad-left', () => { touchInput.right = -1; }, () => { touchInput.right = 0; });
bindDpad('dpad-right', () => { touchInput.right = 1; }, () => { touchInput.right = 0; });

function cycleCam() {
  state.camMode = (state.camMode + 1) % 4;
  $('cam-label').textContent = 'CAMERA: ' + CAM_NAMES[state.camMode];
  controls.enabled = (state.camMode === 0);
  toast('CAMERA: ' + CAM_NAMES[state.camMode]);
}

function toggleDay() {
  state.night = state.night > 0.5 ? 0 : 1;
  toast(state.night ? 'NIGHT FALLS' : 'DAWN BREAKS');
}

function toggleRain() {
  state.rainOn = !state.rainOn;
  rain.lines.visible = state.rainOn;
  audio.setRain(state.rainOn);
  toast(state.rainOn ? 'HEAVY RAIN' : 'CLEAR SKIES');
}

let toastTimer = 0;
function toast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  t.style.opacity = 1;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    t.style.opacity = 0;
    setTimeout(() => t.classList.add('hidden'), 450);
  }, 1800);
}

function doRoar() {
  if (state.roarCD > 0) return;
  if (gz.roar()) {
    state.roarCD = 2.8;
    audio.roar();
    addShake(1.7);
    shock.blast(gz.root.position, 28, 0xff8833);
    toast('GODZILLA ROARS');
  }
}

function doStomp() {
  if (state.stompCD > 0) return;
  state.stompCD = 0.9;
  gz.stomp();
  const foot = gz.footWorld(gz.legL, new THREE.Vector3());
  foot.y = 0;
  shock.blast(foot, 26, 0xff7722);
  dust.emit(new THREE.Vector3(foot.x, 1, foot.z), { count: 45, spread: 6, speed: 13, up: 9, life: 1.9 });
  audio.thud(1.1);
  addShake(1.0);
  city.damageAt(foot, 17, 130, hooks);
}

function addShake(s) { state.shake = Math.min(2.8, state.shake + s); }

gz.stepEvent = (pos, strength) => {
  dust.emit(new THREE.Vector3(pos.x, 0.6, pos.z), { count: 16, spread: 3.5, speed: 7.5, up: 4.5, life: 1.6 });
  audio.thud(strength * 0.75);
  addShake(strength * 0.38);
  city.damageAt(pos, 10, 48, hooks);
};

// ---------- Camera Systems ----------
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.maxPolarAngle = Math.PI * 0.495;
controls.maxDistance = 340;
controls.target.set(0, 16, 0);

const _mouth = new THREE.Vector3(), _dir = new THREE.Vector3(), _fwd = new THREE.Vector3();
const _camPos = new THREE.Vector3(), _look = new THREE.Vector3();
const _ember = new THREE.Vector3();
let dayMix = 1;

function updateCamera(dt) {
  const gp = gz.root.position;

  if (state.camMode === 0) {
    // Mode 0: Free Orbit around Godzilla
    _look.set(gp.x, gp.y + 15, gp.z);
    controls.target.lerp(_look, Math.min(1, dt * 3.5));
    controls.update();
  } else if (state.camMode === 1) {
    // Mode 1: Smooth Follow Camera tracking Godzilla from behind
    _fwd.set(Math.sin(gz.root.rotation.y), 0, Math.cos(gz.root.rotation.y));
    _camPos.set(gp.x - _fwd.x * 36, gp.y + 18, gp.z - _fwd.z * 36);
    camera.position.lerp(_camPos, Math.min(1, dt * 3.8));
    _look.set(gp.x + _fwd.x * 24, gp.y + 15, gp.z + _fwd.z * 24);
    camera.lookAt(_look);
  } else if (state.camMode === 2) {
    // Mode 2: Dramatic Cinematic Sweeping Camera
    const a = state.time * 0.14;
    _camPos.set(gp.x + Math.cos(a) * 72, 36, gp.z + Math.sin(a) * 72);
    camera.position.lerp(_camPos, Math.min(1, dt * 2.2));
    camera.lookAt(gp.x, 16, gp.z);
  } else {
    // Mode 3: Top-Down Tactical Recon Camera
    _camPos.set(gp.x + 10, 160, gp.z + 10);
    camera.position.lerp(_camPos, Math.min(1, dt * 2.8));
    camera.lookAt(gp.x, 0, gp.z);
  }

  // Camera Shake
  if (state.shake > 0.01) {
    camera.position.x += (Math.random() - 0.5) * state.shake;
    camera.position.y += (Math.random() - 0.5) * state.shake * 0.7;
    state.shake *= Math.max(0, 1 - dt * 3.2);
  }
}

function updateDayNight(dt) {
  dayMix += ((state.night ? 1 : 0) - dayMix) * Math.min(1, dt * 1.6);
  const n = dayMix;

  // Sky & Atmospheric Fog Color
  scene.background.setRGB(0.035 + (1 - n) * 0.52, 0.05 + (1 - n) * 0.62, 0.10 + (1 - n) * 0.72);
  scene.fog.color.copy(scene.background);

  hemi.intensity = 0.28 + n * 0.35 + (1 - n) * 0.65;
  moon.intensity = 0.25 + n * 1.45;
  rim.intensity = 0.25 + n * 0.6;
  cityGlow.intensity = 80 + n * 440;
  renderer.toneMappingExposure = 1.05 + n * 0.18;
  city.setNight(n);
}

// ---------- Main Game Loop ----------
const clock = new THREE.Clock();
let firstFrame = true;

function frame() {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, clock.getDelta());
  state.time += dt;

  demoDrive();
  if (state.stompCD > 0) state.stompCD -= dt;
  if (state.roarCD > 0) state.roarCD -= dt;

  // ---------- True Camera-Relative Movement ----------
  // Calculate camera's forward and right vectors projected onto the horizontal XZ plane
  const camFwd = new THREE.Vector3();
  camera.getWorldDirection(camFwd);
  camFwd.y = 0;
  if (camFwd.lengthSq() < 0.0001) camFwd.set(0, 0, -1);
  camFwd.normalize();

  const camRight = new THREE.Vector3();
  camRight.crossVectors(camFwd, new THREE.Vector3(0, 1, 0)).normalize();

  let fwdInput = 0;
  let rightInput = 0;

  // ArrowUp & KeyW: ALWAYS moves forward into the screen (away from camera)
  if (keys.KeyW || keys.ArrowUp) fwdInput += 1;
  // ArrowDown & KeyS: ALWAYS moves backward toward camera (out of the screen)
  if (keys.KeyS || keys.ArrowDown) fwdInput -= 1;
  // ArrowLeft & KeyA: ALWAYS moves left across the screen
  if (keys.KeyA || keys.ArrowLeft) rightInput -= 1;
  // ArrowRight & KeyD: ALWAYS moves right across the screen
  if (keys.KeyD || keys.ArrowRight) rightInput += 1;

  // Integrate Touch D-Pad inputs
  if (touchInput.fwd) fwdInput += touchInput.fwd;
  if (touchInput.right) rightInput += touchInput.right;

  // Auto-walk toggle
  if (state.walking && fwdInput === 0 && rightInput === 0) fwdInput = 1;

  const running = keys.ShiftLeft || keys.ShiftRight;

  const moveVec = new THREE.Vector3();
  moveVec.addScaledVector(camFwd, fwdInput);
  moveVec.addScaledVector(camRight, rightInput);
  const inputMag = Math.min(1, moveVec.length());

  if (inputMag > 0.01) {
    moveVec.normalize();
    // In our rig, Godzilla's heading is (0, 0, 1) when rotation.y = 0
    // When rotated by rotation.y, heading is (sin(rot.y), 0, cos(rot.y))
    const targetYaw = Math.atan2(moveVec.x, moveVec.z);
    let dy = targetYaw - gz.root.rotation.y;
    while (dy > Math.PI) dy -= Math.PI * 2;
    while (dy < -Math.PI) dy += Math.PI * 2;
    gz.root.rotation.y += dy * Math.min(1, dt * 7.5);

    const speed = (running ? 19 : 9.5) * inputMag;
    gz.root.position.x += Math.sin(gz.root.rotation.y) * speed * dt;
    gz.root.position.z += Math.cos(gz.root.rotation.y) * speed * dt;

    const lim = 240;
    gz.root.position.x = Math.max(-lim, Math.min(lim, gz.root.position.x));
    gz.root.position.z = Math.max(-lim, Math.min(lim, gz.root.position.z));

    // Skyscraper collision: crushing damage & sliding
    for (const b of city.buildings) {
      if (b.state !== 'alive') continue;
      const dx = gz.root.position.x - b.x, dz = gz.root.position.z - b.z;
      const r = Math.max(b.w, b.d) * 0.5 + 5.2;
      const d2 = dx * dx + dz * dz;
      if (d2 < r * r && d2 > 0.001) {
        const d = Math.sqrt(d2);
        gz.root.position.x = b.x + dx / d * r;
        gz.root.position.z = b.z + dz / d * r;
        // Monster mass impacts building
        city.damageAt(gz.root.position, 14, (running ? 60 : 30) * dt * 2, hooks);
      }
    }
    state.speed = speed / 19;
  } else {
    state.speed *= Math.max(0, 1 - dt * 6.5);
  }

  // ---------- Thermonuclear Atomic Breath ----------
  const wantBeam = (state.beamHeld || keys.KeyF) && state.energy > 0.02;
  if (wantBeam && !state.beamActive) {
    state.beamActive = true;
    audio.breathStart();
  }
  if (!wantBeam && state.beamActive) {
    state.beamActive = false;
    audio.breathStop();
    beam.hide();
  }
  gz.setBeam(state.beamActive);

  if (state.beamActive) {
    state.energy = Math.max(0, state.energy - dt * 0.28);
    gz.mouthWorld(_mouth);
    gz.aimDir(_dir);

    // Raycast hits both buildings AND ground plane
    const hit = city.raycast(_mouth, _dir, 260);
    const len = hit ? hit.distance : 260;
    beam.setBeam(_mouth, _dir, len, 0.75 + state.energy * 0.25);

    const impact = hit && hit.point ? hit.point.clone() : _mouth.clone().addScaledVector(_dir, len);
    impact.y = Math.max(0.4, impact.y);

    fire.emit(impact, { count: 8, spread: 4, speed: 11, up: 12, life: 0.85 });
    sparks.emit(impact, { count: 12, spread: 5, speed: 28, up: 16, life: 0.95 });
    smoke.emit(impact, { count: 4, spread: 4, speed: 6, up: 10, life: 2.4 });

    if (hit && !hit.isGround) {
      glass.emit(impact, { count: 14, spread: 7, speed: 16, up: 12, life: 1.2 });
      city.damageAt(impact, 14, 95 * dt * 3, hooks);
    } else if (hit && hit.isGround) {
      shock.blast(impact, 18, 0xff7722);
    }
    addShake(dt * 3.5);
  } else {
    state.energy = Math.min(1, state.energy + dt * 0.12);
  }

  // ---------- World & Particle Updates ----------
  gz.update(dt, state.speed);
  city.update(dt, state.time);

  // Radioactive molten embers rising off Godzilla's dorsal spines
  state.emberT = (state.emberT || 0) + dt;
  while (state.emberT > 0.065) {
    state.emberT -= 0.065;
    const sp = gz.spines[(Math.random() * gz.spines.length) | 0];
    if (sp) {
      sp.getWorldPosition(_ember);
      embers.emit(_ember, { count: 2, spread: 0.7, speed: 1.2, up: 5.5, life: 1.5 });
    }
  }

  dust.update(dt);
  smoke.update(dt);
  fire.update(dt);
  sparks.update(dt);
  embers.update(dt);
  glass.update(dt);
  shock.update(dt);

  if (state.rainOn) rain.update(dt, gz.root.position.x, gz.root.position.z);

  // Live fires roaring on collapsed building rubble
  for (let i = city.fires.length - 1; i >= 0; i--) {
    const f = city.fires[i];
    f.t += dt;
    if (f.t > f.dur) {
      city.fires.splice(i, 1);
      continue;
    }
    const p = new THREE.Vector3(f.x + Math.sin(f.t * 2) * 3.5, 2, f.z + Math.cos(f.t * 1.7) * 3.5);
    fire.emit(p, { count: 2, spread: 4, speed: 3, up: 9, life: 1.3 });
    if (Math.random() < dt * 2.2) {
      smoke.emit(p, { count: 1, spread: 3, speed: 2, up: 8.5, life: 3.2 });
    }
  }

  updateDayNight(dt);
  updateCamera(dt);

  // HUD stats
  const ratio = city.destructionRatio();
  $('dest-fill').style.width = (ratio * 100).toFixed(1) + '%';
  $('dest-num').textContent = Math.round(ratio * 100) + '%';
  $('en-fill').style.width = (state.energy * 100).toFixed(0) + '%';

  composer.render();

  if (firstFrame) {
    firstFrame = false;
    $('loading').classList.add('hidden');
    $('hud').classList.remove('hidden');
    toast('WASD / ARROWS TO MOVE — R TO ROAR');
  }
}

// Self-running smoke test demo
const demo = new URLSearchParams(location.search).has('demo');
function demoDrive() {
  if (!demo) return;
  if (state.time > 1) keys.KeyW = true;
  if (state.time > 3 && !state.demoRoared) { state.demoRoared = true; doRoar(); }
  if (state.time > 4 && !state.demoStomped) { state.demoStomped = true; doStomp(); }
  if (state.time > 6) state.beamHeld = true;
}

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  composer.setSize(innerWidth, innerHeight);
});

frame();

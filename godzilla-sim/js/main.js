import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { Godzilla } from './godzilla.js';
import { City } from './city.js';
import {
  makeSkinTextures, makeGroundTexture, makeBuildingVariants, makeGlowTexture,
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
  loadMsg.textContent = 'Failed to start: ' + (e.message || 'unknown error') + ' — needs internet for the three.js CDN.';
  loadMsg.style.color = '#ff7a7a';
});

// ---------- renderer / scene ----------
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
$('app').appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x070b16);
scene.fog = new THREE.FogExp2(0x0a1020, 0.0032);

const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.5, 1500);
camera.position.set(-17, 23, 21);

const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

// cinematic bloom: only hot emissives (spines, cracks, eyes, beam) glow
const composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(
  innerWidth, innerHeight, { type: THREE.HalfFloatType, samples: 4 }
));
composer.setPixelRatio(Math.min(devicePixelRatio, 2));
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.55, 0.5, 0.85);
composer.addPass(bloom);
composer.addPass(new OutputPass());

// ---------- lights ----------
const hemi = new THREE.HemisphereLight(0x3a5a8f, 0x0c0e14, 0.55);
scene.add(hemi);
const moon = new THREE.DirectionalLight(0x9fc0ff, 1.5);
moon.position.set(-120, 180, 60);
moon.castShadow = true;
moon.shadow.mapSize.set(2048, 2048);
moon.shadow.camera.left = -160; moon.shadow.camera.right = 160;
moon.shadow.camera.top = 160; moon.shadow.camera.bottom = -160;
moon.shadow.camera.far = 500;
moon.shadow.bias = -0.0006;
scene.add(moon);
const rim = new THREE.DirectionalLight(0x2e7bff, 0.7);
rim.position.set(80, 40, -140);
scene.add(rim);
const cityGlow = new THREE.PointLight(0xff9a4d, 500, 300, 1.9);
cityGlow.position.set(0, 40, 0);
scene.add(cityGlow);

// ---------- world ----------
const skin = makeSkinTextures();
const groundTex = makeGroundTexture();
const facades = makeBuildingVariants(4);
const glowTex = makeGlowTexture();

const city = new City(scene, groundTex, facades);
const gz = new Godzilla(scene, skin);
gz.root.position.set(0, 0, 0);
gz.root.rotation.y = 0.6;

const dust = new Particles(scene, { max: 700, size: 2.2, color: 0x8a8578, opacity: 0.55, gravity: -1.5, drag: 1.2 });
const smoke = new Particles(scene, { max: 500, size: 4.5, color: 0x2c2c30, opacity: 0.5, gravity: -2.5, drag: 0.6 });
const fire = new Particles(scene, { max: 400, size: 2.4, color: 0xff8a2a, opacity: 0.9, blending: THREE.AdditiveBlending, gravity: -6, drag: 0.8 });
const sparks = new Particles(scene, { max: 500, size: 0.9, color: 0xffd9a0, opacity: 0.95, blending: THREE.AdditiveBlending, gravity: 22, drag: 0.4 });
const embers = new Particles(scene, { max: 400, size: 1.1, color: 0xff8a3d, opacity: 0.95, blending: THREE.AdditiveBlending, gravity: -5, drag: 0.6 });
const shock = new Shockwaves(scene);
const beam = new AtomicBreath(scene, glowTex);
const rain = new Rain(scene);
const audio = new AudioSys();

const hooks = {
  onCollapse(b) {
    const p = new THREE.Vector3(b.x, 4, b.z);
    dust.emit(p, { count: 60, spread: 10, speed: 14, up: 10, life: 2.6 });
    smoke.emit(p, { count: 30, spread: 8, speed: 6, up: 12, life: 4 });
    fire.emit(p, { count: 40, spread: 8, speed: 8, up: 14, life: 1.6 });
    sparks.emit(p, { count: 40, spread: 8, speed: 22, up: 18, life: 1.2 });
    shock.blast(p, 34);
    audio.crash();
    city.fires.push({ x: b.x, z: b.z, t: 0, dur: 25 + Math.random() * 20 });
    addShake(1.2);
  },
  onHit(b) {
    dust.emit(new THREE.Vector3(b.x, b.h * 0.6, b.z), { count: 6, spread: 6, speed: 8, up: 8, life: 1.4 });
  }
};
// ---------- state / input ----------
const state = {
  energy: 1, beamHeld: false, beamActive: false,
  camMode: 0, night: 1, rainOn: true, walking: false,
  yaw: 0.6, speed: 0, shake: 0, stompCD: 0, roarCD: 0,
  time: 0, destroyed: 0
};
const CAM_NAMES = ['ORBIT', 'FOLLOW', 'CINEMATIC', 'TOP'];
const keys = {};
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
  const down = e => { e.preventDefault(); audio.ensure(); el.classList.add('held'); downFn(); };
  const up = e => { if (e) e.preventDefault(); el.classList.remove('held'); if (upFn) upFn(); };
  el.addEventListener('pointerdown', down);
  el.addEventListener('pointerup', up);
  el.addEventListener('pointerleave', up);
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

function cycleCam() {
  state.camMode = (state.camMode + 1) % 4;
  $('cam-label').textContent = 'CAMERA: ' + CAM_NAMES[state.camMode];
  controls.enabled = state.camMode === 0;
  toast('CAMERA: ' + CAM_NAMES[state.camMode]);
}
function toggleDay() {
  state.night = state.night > 0.5 ? 0 : 1;
  toast(state.night ? 'NIGHT FALLS' : 'DAWN BREAKS');
}
function toggleRain() {
  state.rainOn = !state.rainOn;
  rain.lines.visible = state.rainOn;
  toast(state.rainOn ? 'RAIN' : 'CLEAR SKIES');
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
    state.roarCD = 3;
    audio.roar();
    addShake(1.6);
    shock.blast(gz.root.position, 26);
    toast('GODZILLA ROARS');
  }
}
function doStomp() {
  if (state.stompCD > 0) return;
  state.stompCD = 0.9;
  gz.stomp();
  const foot = gz.footWorld(gz.legL, new THREE.Vector3());
  foot.y = 0;
  shock.blast(foot, 24);
  dust.emit(new THREE.Vector3(foot.x, 1, foot.z), { count: 40, spread: 5, speed: 12, up: 8, life: 1.8 });
  audio.thud(1);
  addShake(0.9);
  city.damageAt(foot, 16, 120, hooks);
}
function addShake(s) { state.shake = Math.min(2.5, state.shake + s); }

gz.stepEvent = (pos, strength) => {
  dust.emit(new THREE.Vector3(pos.x, 0.6, pos.z), { count: 14, spread: 3, speed: 7, up: 4, life: 1.5 });
  audio.thud(strength * 0.7);
  addShake(strength * 0.35);
  city.damageAt(pos, 9, 45, hooks);
};
// ---------- cameras ----------
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.maxPolarAngle = Math.PI * 0.495;
controls.maxDistance = 320;
controls.target.set(0, 16, 0);

const _mouth = new THREE.Vector3(), _dir = new THREE.Vector3(), _fwd = new THREE.Vector3();
const _camPos = new THREE.Vector3(), _look = new THREE.Vector3();
const _ember = new THREE.Vector3();
let dayMix = 1; // 1 = night, 0 = day

function updateCamera(dt) {
  const gp = gz.root.position;
  if (state.camMode === 0) {
    _look.set(gp.x, gp.y + 15, gp.z);
    controls.target.lerp(_look, Math.min(1, dt * 3));
    controls.update();
  } else if (state.camMode === 1) {
    _fwd.set(Math.sin(gz.root.rotation.y), 0, Math.cos(gz.root.rotation.y));
    _camPos.set(gp.x - _fwd.x * 34, gp.y + 17, gp.z - _fwd.z * 34);
    camera.position.lerp(_camPos, Math.min(1, dt * 3.5));
    _look.set(gp.x + _fwd.x * 30, gp.y + 16, gp.z + _fwd.z * 30);
    camera.lookAt(_look);
  } else if (state.camMode === 2) {
    const a = state.time * 0.12;
    _camPos.set(gp.x + Math.cos(a) * 70, 34, gp.z + Math.sin(a) * 70);
    camera.position.lerp(_camPos, Math.min(1, dt * 2));
    camera.lookAt(gp.x, 16, gp.z);
  } else {
    _camPos.set(gp.x + 20, 150, gp.z + 20);
    camera.position.lerp(_camPos, Math.min(1, dt * 2.5));
    camera.lookAt(gp.x, 0, gp.z);
  }
  if (state.shake > 0.01) {
    camera.position.x += (Math.random() - 0.5) * state.shake;
    camera.position.y += (Math.random() - 0.5) * state.shake * 0.7;
    state.shake *= Math.max(0, 1 - dt * 3.2);
  }
}

function updateDayNight(dt) {
  dayMix += ((state.night ? 1 : 0) - dayMix) * Math.min(1, dt * 1.5);
  const n = dayMix;
  scene.background.setRGB(0.03 + (1 - n) * 0.5, 0.045 + (1 - n) * 0.6, 0.09 + (1 - n) * 0.7);
  scene.fog.color.copy(scene.background);
  hemi.intensity = 0.25 + n * 0.35 + (1 - n) * 0.6;
  moon.intensity = 0.25 + n * 1.35;
  rim.intensity = 0.25 + n * 0.5;
  cityGlow.intensity = 80 + n * 420;
  renderer.toneMappingExposure = 1.0 + n * 0.15;
  city.setNight(n);
}

// ---------- main loop ----------
const clock = new THREE.Clock();
let firstFrame = true;

function frame() {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, clock.getDelta());
  state.time += dt;
  demoDrive();
  if (state.stompCD > 0) state.stompCD -= dt;
  if (state.roarCD > 0) state.roarCD -= dt;

  // --- movement: camera-relative WASD + auto-walk ---
  let ix = 0, iz = 0;
  if (keys.KeyW || keys.ArrowUp) iz += 1;
  if (keys.KeyS || keys.ArrowDown) iz -= 1;
  if (keys.KeyA || keys.ArrowLeft) ix -= 1;
  if (keys.KeyD || keys.ArrowRight) ix += 1;
  if (state.walking && iz === 0 && ix === 0) iz = 1;
  const running = keys.ShiftLeft || keys.ShiftRight;
  const mag = Math.min(1, Math.hypot(ix, iz));
  if (mag > 0.01) {
    const camYaw = Math.atan2(camera.position.x - gz.root.position.x, camera.position.z - gz.root.position.z);
    const moveYaw = camYaw + Math.atan2(ix, iz);
    let dy = moveYaw - gz.root.rotation.y;
    while (dy > Math.PI) dy -= Math.PI * 2;
    while (dy < -Math.PI) dy += Math.PI * 2;
    gz.root.rotation.y += dy * Math.min(1, dt * 6);
    const speed = (running ? 17 : 8.5) * mag;
    gz.root.position.x += Math.sin(gz.root.rotation.y) * speed * dt;
    gz.root.position.z += Math.cos(gz.root.rotation.y) * speed * dt;
    const lim = 240;
    gz.root.position.x = Math.max(-lim, Math.min(lim, gz.root.position.x));
    gz.root.position.z = Math.max(-lim, Math.min(lim, gz.root.position.z));
    // collide with standing towers: slide around them, crush with steps
    for (const b of city.buildings) {
      if (b.state !== 'alive') continue;
      const dx = gz.root.position.x - b.x, dz = gz.root.position.z - b.z;
      const r = Math.max(b.w, b.d) * 0.5 + 5;
      const d2 = dx * dx + dz * dz;
      if (d2 < r * r && d2 > 0.001) {
        const d = Math.sqrt(d2);
        gz.root.position.x = b.x + dx / d * r;
        gz.root.position.z = b.z + dz / d * r;
      }
    }
    state.speed = speed / 17;
  } else {
    state.speed *= Math.max(0, 1 - dt * 6);
  }

  // --- atomic breath ---
  const wantBeam = (state.beamHeld || keys.KeyF) && state.energy > 0.02;
  if (wantBeam && !state.beamActive) { state.beamActive = true; audio.breathStart(); }
  if (!wantBeam && state.beamActive) { state.beamActive = false; audio.breathStop(); beam.hide(); }
  gz.setBeam(state.beamActive);
  if (state.beamActive) {
    state.energy = Math.max(0, state.energy - dt * 0.28);
    gz.mouthWorld(_mouth);
    gz.aimDir(_dir);
    const hit = city.raycast(_mouth, _dir, 260);
    const len = hit ? hit.distance : 260;
    beam.setBeam(_mouth, _dir, len, 0.7 + state.energy * 0.3);
    const impact = _mouth.clone().addScaledVector(_dir, len);
    impact.y = Math.max(2, impact.y);
    fire.emit(impact, { count: 8, spread: 4, speed: 10, up: 10, life: 0.8 });
    sparks.emit(impact, { count: 10, spread: 4, speed: 26, up: 14, life: 0.9 });
    smoke.emit(impact, { count: 3, spread: 4, speed: 5, up: 9, life: 2.4 });
    city.damageAt(impact, 12, 90 * dt * 3, hooks);
    addShake(dt * 3);
  } else {
    state.energy = Math.min(1, state.energy + dt * 0.1);
  }

  // --- world updates ---
  gz.update(dt, state.speed);
  city.update(dt, state.time);
  // embers rise off the burning dorsal spines
  state.emberT = (state.emberT || 0) + dt;
  while (state.emberT > 0.07) {
    state.emberT -= 0.07;
    const sp = gz.spines[(Math.random() * gz.spines.length) | 0];
    sp.getWorldPosition(_ember);
    embers.emit(_ember, { count: 2, spread: 0.6, speed: 1, up: 5, life: 1.4 });
  }
  dust.update(dt); smoke.update(dt); fire.update(dt); sparks.update(dt); embers.update(dt);
  shock.update(dt);
  if (state.rainOn) rain.update(dt, gz.root.position.x, gz.root.position.z);

  // live fires on rubble
  for (let i = city.fires.length - 1; i >= 0; i--) {
    const f = city.fires[i];
    f.t += dt;
    if (f.t > f.dur) { city.fires.splice(i, 1); continue; }
    const p = new THREE.Vector3(f.x + Math.sin(f.t * 2) * 3, 2, f.z + Math.cos(f.t * 1.7) * 3);
    fire.emit(p, { count: 2, spread: 4, speed: 3, up: 9, life: 1.2 });
    if (Math.random() < dt * 2) smoke.emit(p, { count: 1, spread: 3, speed: 2, up: 8, life: 3 });
  }

  updateDayNight(dt);
  updateCamera(dt);

  // --- HUD ---
  const ratio = city.destructionRatio();
  $('dest-fill').style.width = (ratio * 100).toFixed(1) + '%';
  $('dest-num').textContent = Math.round(ratio * 100) + '%';
  $('en-fill').style.width = (state.energy * 100).toFixed(0) + '%';

  composer.render();
  if (firstFrame) {
    firstFrame = false;
    $('loading').classList.add('hidden');
    $('hud').classList.remove('hidden');
    toast('WASD TO MOVE — R TO ROAR');
  }
}

// Self-running demo hook for headless smoke tests (?demo in URL).
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

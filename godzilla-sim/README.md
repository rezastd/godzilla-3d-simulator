# Godzilla 3D Simulator

A hyper-realistic browser 3D simulator: stomp a rain-soaked neon city as
a burning red Godzilla, rendered with three.js (PBR skin with molten crack
emissive, bloom, ACES tone mapping, soft shadows, fog, emissive windows,
glowing dorsal spines, rising embers).

## Run it

Any static file server works. From this folder:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Then open <http://127.0.0.1:8765/index.html> in Chrome, Edge, Safari or
Firefox. Internet access is required once per load for the three.js CDN
(`unpkg.com`).

## Controls

- **WASD / arrows / on-screen D-Pad** — true camera-relative directional movement, **Shift** — run
- **Mouse drag** — orbit camera, wheel zooms
- **R / Roar button** — roar (jaw snaps open, spine flash, shockwave, synthesized FM growl)
- **F (hold) / Breath button** — thermonuclear atomic breath beam, drains energy and explodes on contact
- **Space / Stomp button** — seismic stomp, damages nearby towers with ground shockwaves
- **C / Camera button** — camera modes: Orbit / Follow / Cinematic / Top
- **N / Day-Night button** — day/night atmospheric cycle, **P** — rain toggle
- On-screen D-Pad & action buttons mirror every action for mobile & touch screens.

## Files

- `index.html` — page, HUD, import map
- `style.css` — HUD styling
- `js/main.js` — renderer, lights, cameras, input, game loop
- `js/godzilla.js` — procedural rigged Godzilla (walk, breath, tail, jaw)
- `js/city.js` — night city, traffic, collapse/rubble simulation
- `js/effects.js` — procedural textures, particles, beam, rain, synth audio

## Smoke test

Append `?demo` to the URL and the simulator plays itself (walk, roar,
sustained atomic breath) — useful for headless screenshots.

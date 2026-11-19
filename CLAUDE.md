# XIOMBARD — project context for AI agents and teammates

Read this before changing anything. It records the decisions the team has already made.

## What this is
**XIOMBARD: Night Shift** — a co-op ragdoll gravedigging game ("friendslop") with a day/night cycle.
By day a hearse parks at the morgue's hatch. The morgue is a long office with work stations, and the laying-to-rest
chain runs through them: take the body in at the hatch onto the intake table (E) and read its delivery note (name +
outfit) → lay it on the registry desk, E writes its name tag → lay it on the dressing table, E opens the outfit choice
(keys 1-5 or tap; hold F to change later) → lay it in the coffin that comes in from the stockroom onto the stock table →
close the lid (F) → optionally nail it shut (F, 4 nails) → carry it out the south door to a dug grave → fill it.
A body let go over a free station table is laid out straight on it (`tableAssist`), like a body dropped at a coffin.
Each missed item (no tag, wrong outfit, not nailed) adds 1 `unrest` to the grave and scores fewer peace points.
Corpses slip out of your arms when you run, a coffin is too heavy for one, players can go limp and carry each other.
By **night** zombies come — mostly from outside the fence. They wear fence sections down until they break, step in bear
traps, chase diggers and dig up graves (restless graves first; nailed coffins take twice as long). Unburied bodies rise.
The crew whacks them with shovels (a click with empty hands). At dawn visitors crumble; risen bodies lie down, still unburied.
By day, repair: fence 1 board + 2 nails, trap 2 nails. Nails are scarce (+6 per delivery, +2 boards), so every nail is a
choice between calmer graves and a sturdier yard. 3 AI bot teammates join by default (`?bots=0..5`). For now they are
off duty: they walk out and stand east of the morgue (`doStand` in `bots.js`). `?botwork` puts them to work on the old
chain; they have not learned the registry desk and the dressing table yet.
Art direction: cartoony, gloomy storybook (Tim Burton-ish *mood*): stripes, crooked shapes, big heads, purple night,
huge moon, curly trees. Inspired by the mood only — never copy characters or designs from existing films/games.

Built on **three.js** + **Vite**, published to **GitHub Pages**.
Live: https://gitgeekalban.github.io/xiombard-game/

## Core rule: code-generated assets only
- We do **not** buy assets from stores. Visuals come from GLSL shaders, noise, SDFs and procedural geometry.
- Prefer a shader or procedural mesh over any texture or model file.
- If a file asset is unavoidable, it must be made by the team or be CC0, and get a line in `public/CREDITS.md`.
- Anything both physics and visuals need (level layout, colliders, skeleton) lives in `src/shared/` — one source of truth. GLSL that gameplay also needs must have a JS twin.
- Text on in-game objects (e.g. headstone names) is drawn into a canvas at runtime — that counts as code-generated.

## Stack and layout
- `three`, `cannon-es` (physics), `peerjs` (WebRTC P2P) from npm — no CDN imports. `vite.config.js` uses `base: './'`.
- `src/main.js` — menu, input, host/guest session wiring, frame loop.
- `src/net.js` — PeerJS rooms: 4-letter code → peer id `xiombard-gy-<CODE>`.
- `src/sim/game.js` — **host-only** simulation: cannon-es world, ragdolls, grabbing/grip, digging, truck, scoring.
- `src/view/view.js` — renders entities from transform snapshots (same path for host and guests), plots, camera, labels.
- `src/view/models.js` — every mesh model built from primitives in code (coffins, truck, headstones, trees, the shovel).
- `src/view/morgue.js` — the morgue (walls, stations, the stockroom door and the office furniture go into the yard's static batch, the roof is its own mesh so it can hide for a third-person camera indoors, all signs are one canvas; the layout itself is `MORGUE` in `shared/layout.js`) and what the night does to the yard: bear traps (three instanced meshes) and fence sections that lean and fall.
- `src/view/plants.js` — vegetation: flat ribbons and cards placed by a seeded generator into one static mesh (one draw call). It keeps tall plants away from plots, footpaths, the morgue and the truck's stop. Concept art for sky, ground and plants is kept outside the repo; the palettes in the shaders follow it.
- `src/chars/` + `src/view/crew.js` — **every character** (diggers, zombies, dogs, the dead). Each one is described by distance formulas in JavaScript (`human.js`, `creatures.js`), turned into a low-poly mesh once at load (`mesher.js`: surface nets, baked occlusion, two bone weights per vertex) and painted by one shader from the rest position (`material.js`: gouache, knitting, stitched patches, dirt, faces, ink hull). No model or texture files. `cast.html` shows the whole cast (`npm run build:cast`).
- `src/shared/` — data both sides need: `crew.js` (the digging crew: looks, six-part rig, pose, ragdoll shapes), `corpses.js` (the dead: a look generated from the seed, same rig), `zombies.js` (night visitors: walkers, the knuckle-dragger, zombie dogs and six odd ones — Bloat, Longshanks, Stack, Granny, Headless, Barrel — all on the same six parts), `layout.js` (level, colliders, decor, the morgue, outfits, fence sections, traps), `rng.js`.
- `src/shaders/` — `toon.js` (cartoon lighting + inverted-hull outlines + lantern pools), `paint-env.js` (the static yard: one painted mesh), `paint-props.js` (coffins and their lids, headstones, truck: planks, iron, carvings, nail heads and lettering as paint), `paint-plants.js` (all vegetation: one material, fifteen painted kinds, wind in the vertex shader), `sky.js` (gradient, moon, sun, stars, brushed streaks and three rows of cumulus painted on a cylinder around the viewer), `ground.js` (lawn of brushed grass clumps, clover, footpaths with pebbles and prints, rutted road with puddles, dug earth, soil walls of graves), `noise.glsl.js`.
- `src/audio.js` — procedural WebAudio SFX, no audio files.
- `src/touch.js` — phone/tablet controls (floating stick, drag-to-look, action buttons); feeds the same `input` object as the keyboard.
- Custom shaders use `ShaderMaterial`; they write linear color and include `colorspace_fragment` + fog chunks.

## Multiplayer architecture (decided)
- **Host-authoritative P2P.** The host's browser runs `Sim`; guests only send input (30 Hz) and render snapshots (20 Hz).
- Messages: guest→host `hello`, `in` (move, yaw, held buttons, and *counters* for one-shot actions: grab/throw/flop).
  Host→guest `welcome`, `ents` (entity list, sent when `sim.version` changes), `snap` (Float32Array of part transforms + small JSON state + events).
- Every entity is "N parts × (pos, quat)": every character 6 (see `CP` in `shared/crew.js`), coffin 1, truck 1. **Never reorder `CP` or the `ZOMBIES` list** — they are the wire format. A body's look comes from its seed alone (`corpseRig(seed)`), so changing the generator changes every body for host and guests alike.
- Entity descriptors also carry `outfit`, `tag` (bodies) and `lid` (coffins: 1 closed, 2 nailed); the view rebuilds a model in place when they change. The state snapshot carries `fence` (hp per section), `traps`, `nails`, `boards`, `buried`, and per player `choose` (the outfit choice is open) and `card`. The outfit pick travels in the input as a counter `pk` plus the outfit index `pv`, like the other one-shot actions.
- Signaling: free PeerJS cloud broker. Some strict NATs need a TURN server (not set up yet). Local testing: run a PeerJS server on
  port 9000 and open `?peerhost=127.0.0.1&peerport=9000`.
- No host migration: if the host leaves, the game ends for guests.

## Physics gotchas (learned the hard way)
- cannon-es constraint `maxForce` clamps **impulse per step**, not newtons. Multiply a force in newtons by `STEP`.
- **Carrying (decided).** Whatever a digger picks up jumps into the mittens in a quarter second and rides there: no rubber band, no dragging. `driveHeld` in `game.js` steers the held part by velocity toward `holdTarget` every step. A body lies across the arms and stays put at a walk; running, spinning and jumping make it slip. A coffin is a two-digger job: alone it is carried across the chest at half speed, the carrier staggers and the grip runs out (stand still to get it back); two diggers take an end each and walk in file (`TRAIN` keeps them a coffin apart), steady and at normal speed. Bots rest when their arms give out and take the other end of a coffin a human carries alone (`help` job in `bots.js`).
- Carried things (and a held coffin's passenger) are masked out of the carrier's collision bit so they cannot wedge against the player; a carried body ignores the truck too, so it never snags on the bed walls.
  Each player owns one collision bit (`PLAYER_BITS`).
- The coffin's inner width must stay wider than the widest belly `corpses.js` can generate (0.74 m today), or bodies cannot lie in it.
- Assists are deliberate: a body dropped at an open coffin is laid inside; a coffin dropped by a dug grave is aligned and falls in.
- **Closing a lid turns the passenger into data** (`coffin.passenger`): the ragdoll is removed and the coffin weighs for both. `coffinContents()` is null for a closed coffin; burial reads the passenger. A dug-up grave gives the body back as it was buried (`plot.who`).
- Bodies cannot be grabbed off the hearse: its cage stays solid and the grab button at the hatch (`morgueKey`) puts the next one on the intake table.
- The fence is not a static collider: each of `FENCE_SECTIONS` has its own bodies in `sim.fence`, removed when the section breaks and built again on repair.
- `afterStep` clamps prop speeds as a safety net against solver blow-ups.
- Anything on its feet at night has a walker in `e.z` (a steered capsule + a pose). A risen corpse keeps its ragdoll bodies as kinematic ghosts that follow the pose, so `e.bodies[...]` stays valid everywhere; a whack turns them dynamic again.
- Test a night quickly with `?daylen=15&nightlen=90`. `?botlog` collects what the bots are doing in `window.__botlog`. `?mute` turns the sound off (scripted and headless runs).

## Workflow
- `npm install`, `npm run dev` (port 5173), `npm run build` must pass before pushing.
- `npm run build:single` packs the game into one self-contained html file (`dist-single/`): it runs from disk in any browser, so it can be sent to anyone.
- Every build carries a label at the bottom edge of the screen: `build <number of commits> · <commit> · <time>` (`build-info.js`). Commit first, then build, so the number names the commit; a `+` after the number means uncommitted changes went in.
- Debug handle on the host: `window.__xiom = { sim, view, look, bots }` — scripted tests drive `sim.step()` / `bots.update()` directly.
- Branch from `main`, open a PR, one review, merge. Push to `main` auto-deploys via `.github/workflows/deploy.yml`.
- Keep the page working at phone width; check FPS on a mid-range laptop before merging heavy shaders.

## How graphics are made (decided)
- **One rule.** Hard, simple shapes are plain primitives (boxes, solids of revolution, tubes, ribbons) with only as many triangles as the silhouette needs. Small relief is never geometry: planks, seams, hoops, rivets, stitches, knitting, fringe, cracks, engravings and dirt are painted by the fragment shader from the object's own coordinates. Only soft shapes that have to melt into each other are sculpted (mittens, boots, fur, pompoms on dogs).
- **Ink outlines** are an inverted hull, and a hull doubles every triangle it covers: keep it for real silhouettes, paint the lines inside a shape.
- **Gaussian splatting: tried and dropped.** We built a splat renderer and a set of splat puppets; it cost a second rendering path, was heavy, hard to animate, and did not look better than painted meshes. Do not bring it back without a concrete reason.
- **Raymarching whole characters per pixel: tried and replaced.** It looked good but cost every covered pixel dozens of formula evaluations; low-poly meshes painted by a shader look the same and cost almost nothing. The demo page is gone.

## Product thinking
Product, segment and value decisions follow Advanced Jobs To Be Done / Next Move Theory (Ivan Zamesin). Treat new features as value hypotheses with a named riskiest assumption and the cheapest test before building.

## Language
All code, comments, docs and in-game text are in English.

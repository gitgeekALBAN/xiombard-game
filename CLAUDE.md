# GraveQuota — project context for AI agents and teammates

Read this before changing anything. It records the decisions the team has already made.

## What this is
**GraveQuota** (formerly XIOMBARD: Night Shift) — a co-op ragdoll gravedigging game ("friendslop") with a day/night cycle.
By day a closed hearse parks at the morgue's hatch (a plate by the hatch counts the bodies still aboard; they are not
drawn). The morgue is a long office with work stations, and the laying-to-rest chain runs through them: take the body
in at the hatch onto the intake table (E, only onto a clear table) → its **delivery note** comes with it: a physical
card (`note` entity) with the name, the outfit, the charm for the blessing and the candles; pick it up to read it, carry
it, put it anywhere → lay the body on the registry desk, E writes its name tag → on the dressing table, E opens the
outfit choice (keys 1-5 or tap; hold F to change later) → on the **chapel** bier (south wall), E takes the charms, the
wheel / keys 1-4 / a tap pick one, E hums the blessing for 3 s (`RITES`: four made-up charms — never real religious
symbols) → lay it in the coffin from the stockroom on the stock table → close the lid (F) → optionally nail it shut
(F, 4 nails) → carry it out the south door to a dug grave → fill it → E at the headstone: **candles** (color 1-3, count
by wheel, E lights them; `CANDLES`).
A digger's painted face follows what they do (`moodOf` in the sim, `crewMood` in `chars/material.js`): calm walking
about; focused (a squint, the tip of the tongue out) carrying or working; straining (flushed, eyes popping, teeth
gritted, sweat flying) under a coffin or a crocodile alone; angry while swinging the shovel. `?mood=0..3` forces one.
When the candles are lit (the last step) a **ghost** leaves the grave (`view/ghost.js`): happy when name tag, outfit,
blessing, nails and the candles were all right, sad when anything was missed (relighting candles later sends no second ghost).
**Controls (decided):** only E picks things up and puts them down (stations too); the left mouse button only swings the
shovel (on a touch screen GRAB does both). Anything thrown that hits someone knocks a digger off their feet (friends
too) and stuns a zombie or a crocodile for a few seconds — stars over the head — without hurting it (`checkThrown`).
**Odd deliveries** (`ODDITIES`, entity kind `item`): now and then the hearse brings a bag of gold, a bag of suspicious
white powder, a dead crocodile or a live one instead of a body. Each belongs at one of two windows in the office end of
the morgue (`MORGUE.windows`: Lost & Found, Police!). The windows are shut: E at the counter rings the bell, the clerk
comes in 6 s, the shutter rolls up on a swirling "portal" into their office (`portalMaterial`) and the clerk beams at
the right thing (+2) or gets cross and pushes the wrong one back out. The clerks are crew-style characters dressed for
the job (`view/clerks.js`: the police in a navy peaked cap with a gold badge, Lost & Found in a felt hat, patched all
over). A card beside each window counts down (opens in / closes in) or says ring the bell / closed till dawn: the
windows do not work at night. A live crocodile must be knocked out
with the shovel first (5 s out cold: spiral eyes, tongue out, stars), or it lashes you with its tail and wriggles free.
Or drop a rich one into a dug grave and fill it: no ghost, a "???" headstone, and `cash` (shown as $ in the HUD; the
upgrades it buys come later). It can also go in a coffin like a body (`itemCoffinAssist`; a live crocodile only while
out cold): close the lid, nail it, bury it — the coffin's `passenger` is then `{ item }`. A live crocodile waddles about, lashes anyone close with its tail (they go limp) and
wriggles out of your arms now and then.
A body let go over a free station table is laid out straight on it (`tableAssist`), like a body dropped at a coffin.
Each missed item (no tag, wrong outfit, wrong or no blessing, not nailed, wrong or no candles) adds 1 `unrest` to the
grave and scores fewer peace points. A station's first E does its job; the next E picks the body up.
Corpses slip out of your arms when you run, a coffin is too heavy for one, players can go limp and carry each other.
The hearse **always** comes back by day (decided: no throttle on bodies lying about). The only way to stop it is the
big red NO DELIVERY button on the morgue's north wall (E, by day): no more loads today, and tomorrow's first load
brings the held-back ones too (the coach holds 6; the rest ride with the next). Between deliveries it waits far down
the road, out of sight (`TRUCK_PARK_X`).
By **night** zombies come — mostly from outside the fence. They wear fence sections down until they break, step in bear
traps and dig up graves with their hands (restless graves first; nailed coffins take twice as long). They fight only a
digger who comes close (3.5 m, dogs 6 m) and give up on one who gets away; a hit infects with a 20% chance (only the
bitten player sees it; what infection does next is to come, see the concept doc). When a grave is dug up the body rises, and
a fresh copy of its note lies by the grave. Unburied bodies rise at nightfall (not those still in the hearse).
The crew whacks them with shovels (a click with empty hands). A visitor beaten for good leaves a stranger's body with
its own note (`remains`): bury it properly or it gets up the next night (dogs just crumble). At dawn visitors crumble;
risen bodies lie down, still unburied.
By day, repair: fence 1 board + 2 nails, trap 2 nails. Nails are scarce (+6 per delivery, +2 boards), so every nail is a
choice between calmer graves and a sturdier yard. 3 AI bot teammates join by default (`?bots=0..5`). For now they are
off duty: they walk out and stand east of the morgue (`doStand` in `bots.js`). `?botwork` puts them to work on the old
chain; they have not learned the registry desk and the dressing table yet.
Art direction: cartoony, gloomy storybook (Tim Burton-ish *mood*): stripes, crooked shapes, big heads, purple night,
huge moon, curly trees. **Lighting follows `docs/lighting-guide.md`** (decided 2026-11-22: rules from Birn, Valve's
TF2 / Left 4 Dead, Gurney and others, turned into one rig; read it before touching light). In short: every light has a
job and a row in `RIG` (`toon.js`) at night / dusk / day — key (sun in the south-east by day, moon in the north-west
over the morgue by night), spill, sky dome, bounce, kick, hall ambient — plus a drifting cloud cookie, contact
occlusion at the morgue's walls, practicals (lanterns with a pool and a spill, lit windows and the door from
`MORGUE.wins`, the hall lamps) and `nightEye` (moonlit colors lose chroma; lamp light keeps it). Day is about 3:1
key to fill, night about 4.5:1: mostly cool shadow broken by warm pools, never evenly bright. `?light=key|fill|practical`
shows one part alone on grey. The key casts real shadows day and night: `view/sun.js` renders one depth pass from it
(2048², ±34 m around the camera's focus, texel-snapped) and every painted material reads it (`sunShadow`; a new lit
material must call `shareLight(m)`). The ground, plants, backdrop, sky, ink hulls and anything transparent do not
cast; characters cast through their own skinned depth material (`userData.depthMat`) and are lit by the same rig
(`uRig` in `chars/material.js`). Inspired by the mood only — never copy characters or designs from existing films/games.

Built on **three.js** + **Vite**, published to **GitHub Pages**.
Live: https://gitgeekalban.github.io/xiombard-game/

## Core rule: code-generated assets only
- We do **not** buy assets from stores. Visuals come from GLSL shaders, noise, SDFs and procedural geometry.
- Prefer a shader or procedural mesh over any texture or model file.
- If a file asset is unavoidable, it must be made by the team or be CC0, and get a line in `public/CREDITS.md`.
- Anything both physics and visuals need (level layout, colliders, skeleton) lives in `src/shared/` — one source of truth. GLSL that gameplay also needs must have a JS twin.
- Text on in-game objects (e.g. headstone names) is drawn into a canvas at runtime — that counts as code-generated.

## Stack and layout
- `three`, `cannon-es` (physics), `trystero` (WebRTC P2P, Nostr signaling) from npm — no CDN imports. `vite.config.js` uses `base: './'`.
- `src/main.js` — menu, input, host/guest session wiring, frame loop.
- `src/net.js` — co-op rooms over Trystero: the 4-letter code is the room.
- `src/sim/game.js` — **host-only** simulation: cannon-es world, ragdolls, grabbing/grip, digging, truck, scoring.
- `src/view/view.js` — renders entities from transform snapshots (same path for host and guests), plots, camera, labels.
- `src/view/models.js` — every mesh model built from primitives in code (coffins, truck, headstones, trees, the shovel).
  The truck is a covered hearse (`models/truck.js`): the old pickup's cab in front of a closed coach with curtained oval
  windows, a railed roof and two rear doors (rig 5 and 6 in `paint-props.js`) that swing open while it waits at the hatch.
  The coach's sides and roof are colliders in `TRUCK.boxes`; the load rides inside and leaves only through the hatch.
- New models follow one routine: screenshot the current one from fixed cameras (`view.debugCam`), turn the shots into
  concept art (front, side, rear, top and three-quarter views) with an image model, then build it in code from the sheet.
  Concept art stays outside the repo.
- `src/view/shafts.js` — light shafts in the hall: additive beams from the panes, the door and the hatch (sun by day, moon by night).
- `src/view/morgue.js` — the morgue (walls, stations, the stockroom door and the office furniture go into the yard's static batch, the roof is its own mesh so it can hide for a third-person camera indoors, all signs are one canvas; the layout itself is `MORGUE` in `shared/layout.js`) and what the night does to the yard: bear traps (three instanced meshes) and fence sections that lean and fall.
- `src/view/plants.js` — vegetation: flat ribbons and cards placed by a seeded generator into one static mesh (one draw call). It keeps tall plants away from plots, footpaths, the morgue and the truck's stop. Concept art for sky, ground and plants is kept outside the repo; the palettes in the shaders follow it.
- `src/chars/` + `src/view/crew.js` — **every character** (diggers, zombies, dogs, the dead). Each one is described by distance formulas in JavaScript (`human.js`, `creatures.js`), turned into a low-poly mesh once at load (`mesher.js`: surface nets, baked occlusion, two bone weights per vertex) and painted by one shader from the rest position (`material.js`: gouache, knitting, stitched patches, dirt, faces, ink hull). No model or texture files. `cast.html` shows the whole cast (`npm run build:cast`).
- `src/shared/` — data both sides need: `crew.js` (the digging crew: looks, six-part rig, pose, ragdoll shapes), `corpses.js` (the dead: a look generated from the seed, same rig), `zombies.js` (night visitors: walkers, the knuckle-dragger, zombie dogs and six odd ones — Bloat, Longshanks, Stack, Granny, Headless, Barrel — all on the same six parts), `layout.js` (level, colliders, decor, the morgue, outfits, fence sections, traps), `rng.js`.
- `src/shaders/` — `toon.js` (cartoon lighting + inverted-hull outlines + lantern pools), `paint-env.js` (the static yard: one painted mesh), `paint-props.js` (coffins and their lids, headstones, truck: planks, iron, carvings, nail heads and lettering as paint), `paint-plants.js` (all vegetation: one material, fifteen painted kinds, wind in the vertex shader), `sky.js` (gradient, moon, sun, stars, brushed streaks and three rows of cumulus painted on a cylinder around the viewer), `ground.js` (lawn of brushed grass clumps, clover, footpaths with pebbles and prints, rutted road with puddles, dug earth, soil walls of graves), `noise.glsl.js`.
- `src/audio.js` — procedural WebAudio SFX, no audio files.
- `src/touch.js` — phone/tablet controls (floating stick, drag-to-look, action buttons); feeds the same `input` object as the keyboard. Phones and tablets (a coarse main pointer) start with them; on a laptop with a touch screen they follow what is used: a mouse click hides them and grabs the pointer, a touch brings them back (`setTouchMode`).
- Custom shaders use `ShaderMaterial`; they write linear color and include `colorspace_fragment` + fog chunks.
- `src/view/warmup.js` — before the first frame, behind the menu's progress bar: compiles every shader program (the scene, one of everything that appears later, the post passes, each against the render target it draws into) in parallel via `KHR_parallel_shader_compile`, and sculpts every digger and zombie mesh. Nothing is drawn until it is done (`ready` in `main.js`); Host/Join pressed early wait for it. A new kind of object that appears mid-game must get a sample in its `cast`, or its shader compiles live and freezes the frame (on Windows a big painted shader takes seconds). Check with a headless run that wraps the WebGL calls: no `getProgramInfoLog` stall after the menu.

## Multiplayer architecture (decided)
- **Host-authoritative P2P.** The host's browser runs `Sim`; guests only send input (30 Hz) and render snapshots (20 Hz).
- Messages: guest→host `hello`, `in` (move, yaw, held buttons, and *counters* for one-shot actions: grab/throw/flop).
  Host→guest `welcome`, `ents` (entity list, sent when `sim.version` changes), `snap` (Float32Array of part transforms + small JSON state + events).
- Every entity is "N parts × (pos, quat)": every character 6 (see `CP` in `shared/crew.js`), coffin 1, truck 1. **Never reorder `CP` or the `ZOMBIES` list** — they are the wire format. A body's look comes from its seed alone (`corpseRig(seed)`), so changing the generator changes every body for host and guests alike.
- Entity descriptors also carry `outfit`, `tag` (bodies) and `lid` (coffins: 1 closed, 2 nailed); the view rebuilds a model in place when they change. The state snapshot carries `fence` (hp per section), `traps`, `nails`, `boards`, `buried`, and per player `choose` (the outfit choice is open) and `card`. The outfit pick travels in the input as a counter `pk` plus the outfit index `pv`, like the other one-shot actions.
- Finding each other: **Trystero** over public Nostr relays (`net.js`), the same way the team's car prototype connects: many independent relays, so one being down or blocked does not stop a game. The room is the 4-letter code (app id `gravequota-v1`). Everyone in a room links to everyone, but the game only talks host <-> guest: on a new link the host sends `hi` (with its build number), guests talk only to that peer, and a guest on a different build is told to reload. A snapshot goes as binary (`bin` action, the rest of the message as metadata), everything else as JSON (`msg`). `net.js` wraps each peer as a small connection (`send`, `on('data' | 'close')`) so `main.js` does not care how bytes travel.
- **Lobby** (like the car prototype): everyone with the menu open sits in a shared Trystero room `lobby`; a host announces its game there every 3 s (code, name, players, build) and the menu lists open games to join with one click (`joinLobby` in `net.js`). Another build shows greyed out. The 4-letter code stays as a fallback (Join by code, invite links).
- No TURN relay (decided): the car prototype connects the same way without one on the team's networks, so it is not a to-do. Only if a player can never join (and the car prototype fails for them too) would one go in `TURN_SERVERS` in `net.js`. `?relay` forces every link through a relay, to test one; `?turn=turn:host:3478&tuser=..&tpass=..` adds one from the URL. A wrong code is only known after the 30 s wait (Trystero cannot tell an empty room from an unreachable one); the guest's status line says which step it got to.
- No host migration: if the host leaves, the game ends for guests.

## Physics gotchas (learned the hard way)
- cannon-es constraint `maxForce` clamps **impulse per step**, not newtons. Multiply a force in newtons by `STEP`.
- **Carrying (decided).** Whatever a digger picks up jumps into the mittens in a quarter second and rides there: no rubber band, no dragging. `driveHeld` in `game.js` steers the held part by velocity toward `holdTarget` every step. A body lies across the arms and stays put at a walk; running, spinning and jumping make it slip. A coffin is a two-digger job: alone it is carried across the chest at half speed, the carrier staggers and the grip runs out (stand still to get it back); two diggers take an end each and walk in file (`TRAIN` keeps them a coffin apart), steady and at normal speed. Bots rest when their arms give out and take the other end of a coffin a human carries alone (`help` job in `bots.js`).
- Carried things (and a held coffin's passenger) are masked out of the carrier's collision bit so they cannot wedge against the player; a carried body ignores the truck too, so it never snags on the bed walls.
  Each player owns one collision bit (`PLAYER_BITS`).
- The coffin's inner width must stay wider than the widest belly `corpses.js` can generate (0.74 m today), or bodies cannot lie in it.
- Assists are deliberate: a body dropped at an open coffin is laid inside; a coffin dropped by a dug grave is aligned and falls in.
- **Closing a lid turns the passenger into data** (`coffin.passenger`): the ragdoll is removed and the coffin weighs for both. `coffinContents()` is null for a closed coffin; burial reads the passenger. A dug-up grave gives the body back as it was buried (`plot.who`).
- Bodies cannot be grabbed off the hearse: its cage stays solid and the grab button at the hatch (`morgueKey`) puts the next one on the intake table — only when that table is clear; with a body lying there the same button picks it up. Each station action (hatch, name tag, opening the outfit choice) takes one press; the next press picks the body up.
- The fence is not a static collider: each of `FENCE_SECTIONS` has its own bodies in `sim.fence`, removed when the section breaks and built again on repair.
- `afterStep` clamps prop speeds as a safety net against solver blow-ups.
- Anything on its feet at night has a walker in `e.z` (a steered capsule + a pose). A risen corpse keeps its ragdoll bodies as kinematic ghosts that follow the pose, so `e.bodies[...]` stays valid everywhere; a whack turns them dynamic again.
- Test a night quickly with `?daylen=15&nightlen=90`. `?botlog` collects what the bots are doing in `window.__botlog`. `?mute` turns the sound off (scripted and headless runs).

## Workflow
- `npm install`, `npm run dev` (port 5173), `npm run build` must pass before pushing.
- `npm run build:single` packs the game into one self-contained html file (`dist-single/`): it runs from disk in any browser, so it can be sent to anyone.
- Every build carries a label at the bottom edge of the screen: `build <number of commits> · <commit> · <time>` (`build-info.js`). Commit first, then build, so the number names the commit; a `+` after the number means uncommitted changes went in. The build also writes `build.json` next to `index.html`; a running game checks it every 90 s and when its tab comes back, and if a newer build is out the label turns into a red "tap to update" button that reloads past the browser cache (`checkBuild` in `main.js`).
- Debug handle on the host: `window.__xiom = { sim, view, look, bots }` — scripted tests drive `sim.step()` / `bots.update()` directly.
- Branch from `main`, open a PR, one review, merge. Push to `main` auto-deploys via `.github/workflows/deploy.yml`.
- Keep the page working at phone width; check FPS on a mid-range laptop before merging heavy shaders.

## How graphics are made (decided)
- **One rule.** Hard, simple shapes are plain primitives (boxes, solids of revolution, tubes, ribbons) with only as many triangles as the silhouette needs. Small relief is never geometry: planks, seams, hoops, rivets, stitches, knitting, fringe, cracks, engravings and dirt are painted by the fragment shader from the object's own coordinates. Only soft shapes that have to melt into each other are sculpted (mittens, boots, fur, pompoms on dogs).
- **Ink outlines** are an inverted hull, and a hull doubles every triangle it covers: keep it for real silhouettes, paint the lines inside a shape.
- **Triangle budget** (measured 2026-11-20, a lit day with 4 diggers, 4 zombies, 3 bodies, the odd deliveries): ~200k
  triangles in the scene, ~180k drawn per frame in ~230 draw calls. Per thing: a digger ~7k, a zombie ~8.5k (up to
  12.7k), a body ~3k, the hearse ~4k, the crocodile ~4.5k (was 16k: tiny details on smooth spheres with hulls — use
  low spheres/capsules and no hull for dabs, teeth, toes). Static: plants 26k, the yard 19k + hull 17k, backdrop 13k.
- **Gaussian splatting: tried and dropped.** We built a splat renderer and a set of splat puppets; it cost a second rendering path, was heavy, hard to animate, and did not look better than painted meshes. Do not bring it back without a concrete reason.
- **Raymarching whole characters per pixel: tried and replaced.** It looked good but cost every covered pixel dozens of formula evaluations; low-poly meshes painted by a shader look the same and cost almost nothing. The demo page is gone.

## Product thinking
Product, segment and value decisions follow Advanced Jobs To Be Done / Next Move Theory (Ivan Zamesin). Treat new features as value hypotheses with a named riskiest assumption and the cheapest test before building.
`docs/concept-grave-quota.md` is a concept pitch kept on file (quota, rest meter, hidden infection, trap pits). It is not decided: do not build from it unless asked.

## Language
All code, comments, docs and in-game text are in English.

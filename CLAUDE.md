# XIOMBARD — project context for AI agents and teammates

Read this before changing anything. It records the decisions the team has already made.

## What this is
**XIOMBARD: Night Shift** — a co-op ragdoll gravedigging game ("friendslop"). A truck delivers floppy corpses;
players unload them, put each one in a coffin, dig a grave, drop the coffin in and fill it. Corpses slip out of
your hands, coffins tip over, players can go limp and carry each other.
The laying-to-rest chain: the hearse parks at the morgue's hatch → someone inside takes the body in onto the
intake table → read the delivery note (name + outfit) → hang the right name tag from the board → dress them from the
rack → lay them in a coffin → close the lid (F) → optionally nail it shut (F, costs nails) → drag it to a dug grave →
fill it. Each missed item (wrong/no tag, wrong outfit, not nailed) adds 1 `unrest` to the grave and scores fewer peace points.
Nails are scarce (+6 per delivery). Boards exist for repairs.
Planned next (not built yet): a night phase where restless graves cause trouble (traps and the fence wear down);
by day players repair with boards + nails, so every nail is a choice between nailing coffins (less unrest) and repairs.
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
- `src/view/models.js` — every model built from primitives in code (diggers, corpses, coffins, truck, headstones, trees).
- `src/shared/` — data both sides need: `skeleton.js` (part list + FK + animation), `layout.js` (level, colliders, decor), `rng.js`.
- `src/shaders/` — `toon.js` (cartoon lighting + inverted-hull outlines + lantern pools), `sky.js`, `ground.js`, `noise.glsl.js`.
- `src/audio.js` — procedural WebAudio SFX, no audio files.
- Morgue layout (walls, hatch, table, tag board, outfit rack, crate, coffin spots) is `MORGUE` in `src/shared/layout.js`; outfits are `OUTFITS`.
- `src/touch.js` — phone/tablet controls (floating stick, drag-to-look, action buttons); feeds the same `input` object as the keyboard.
- Custom shaders use `ShaderMaterial`; they write linear color and include `colorspace_fragment` + fog chunks.

## Multiplayer architecture (decided)
- **Host-authoritative P2P.** The host's browser runs `Sim`; guests only send input (30 Hz) and render snapshots (20 Hz).
- Messages: guest→host `hello`, `in` (move, yaw, held buttons, and *counters* for one-shot actions: grab/throw/flop).
  Host→guest `welcome`, `ents` (entity list, sent when `sim.version` changes), `snap` (Float32Array of part transforms + small JSON state + events).
- Every entity is "N parts × (pos, quat)": digger/corpse 11 (see `PARTS`), coffin 1, truck 1. **Never reorder `PARTS`** — it is the wire format.
- Signaling: free PeerJS cloud broker. Some strict NATs need a TURN server (not set up yet). Local testing: run a PeerJS server on
  port 9000 and open `?peerhost=127.0.0.1&peerport=9000`.
- No host migration: if the host leaves, the game ends for guests.

## Physics gotchas (learned the hard way)
- cannon-es constraint `maxForce` clamps **impulse per step**, not newtons. Multiply a force in newtons by `STEP` (see `CORPSE_GRIP_N`).
- Carried things (and a held coffin's passenger) are masked out of the carrier's collision bit so they cannot wedge against the player.
  Each player owns one collision bit (`PLAYER_BITS`).
- The coffin's inner width must stay wider than the skeleton's shoulders, or bodies cannot lie in it.
- Assists are deliberate: a body dropped at an open coffin is laid inside; a coffin dropped by a dug grave is aligned and falls in.
- `afterStep` clamps prop speeds as a safety net against solver blow-ups.

## Workflow
- `npm install`, `npm run dev` (port 5173), `npm run build` must pass before pushing.
- Debug handle on the host: `window.__xiom = { sim, view, look }` — scripted tests drive `sim.step()` / `sim.input` directly.
- Branch from `main`, open a PR, one review, merge. Push to `main` auto-deploys via `.github/workflows/deploy.yml`.
- Keep the page working at phone width; check FPS on a mid-range laptop before merging heavy shaders.

## Decision: Gaussian splatting
- **Not core.** Possible later for 1–2 hero locations or distant backdrops, via Spark (`@sparkjsdev/spark`), which mixes splats with three.js meshes.
- To respect the asset rule, splats should be **generated from code** (from our noise/SDF functions), or captured by the team ourselves.
- Known limits: baked lighting (no dynamic shadows), needs a separate collision mesh, hard to animate. Budget: compressed `.spz` ≈ 6 MB per 1M splats; phones struggle above ~1–2M splats.
- Riskiest assumption: splats run fast enough on target devices and match the toon shader style. Cheapest test before any design commitment: drop one `.spz` scene into the current page and measure FPS on a mid-range laptop and a phone.

## Product thinking
Product, segment and value decisions follow Advanced Jobs To Be Done / Next Move Theory (Ivan Zamesin). Treat new features as value hypotheses with a named riskiest assumption and the cheapest test before building.

## Language
All code, comments, docs and in-game text are in English.

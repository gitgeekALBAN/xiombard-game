# XIOMBARD — project context for AI agents and teammates

Read this before changing anything. It records the decisions the team has already made.

## What this is
**XIOMBARD: Night Shift** — a co-op ragdoll gravedigging game ("friendslop") with a day/night cycle.
By day a hearse parks at the morgue's hatch. The laying-to-rest chain: take the body in from inside → read its delivery
note (name + outfit) → hang the right name tag from the board → dress them from the rack → lay them in a coffin →
close the lid (F) → optionally nail it shut (F, 4 nails) → drag it to a dug grave → fill it.
Each missed item (wrong/no tag, wrong outfit, not nailed) adds 1 `unrest` to the grave and scores fewer peace points.
By night zombies come — mostly from outside the fence. They wear fence sections down until they break, step in bear
traps, chase diggers and dig up graves (restless graves first; nailed coffins take twice as long). Unburied bodies rise.
Whack them with the shovel (click). By day, repair: fence 1 board + 2 nails, trap 2 nails. Nails are scarce
(+6 per delivery, +2 boards), so every nail is a choice between calmer graves and a sturdier yard.
3 AI bot teammates join by default (`?bots=0..5`); they run the same chain, including morgue jobs and repairs.
Art direction: painted, gloomy-storybook mood (Tim Burton-ish *mood* only — never copy existing characters or designs).

Built on **three.js** + **cannon-es** + **PeerJS**, bundled with **Vite**, published to **GitHub Pages**.
Live: https://gitgeekalban.github.io/xiombard-game/

## Core rule: code-generated assets only
- We do **not** buy assets from stores. Visuals come from GLSL shaders, noise, SDFs and procedural geometry.
- Prefer a shader or procedural mesh over any texture or model file.
- If a file asset is unavoidable, it must be made by the team or be CC0, and get a line in `public/CREDITS.md`.
- Anything both physics and visuals need (level layout, colliders, skeleton) lives in `src/shared/` — one source of truth. GLSL that gameplay also needs must have a JS twin.
- Text on in-game objects (e.g. headstone names) is drawn into a canvas at runtime — that counts as code-generated.

## Stack and layout (read this — it is unusual)
- The game base is **build 73 from claude.ai/artifact/GCkmUVmGFHny8ezmCLGH6T**. Its source was never available, so
  `src/game.js` is that compiled bundle run through prettier (three.js, cannon-es and PeerJS are inlined in it).
  Module-level names are minified (`RT` = sim, `US` = view, `uC` = bot AI, `Xd()` = static colliders, `mn` = plots…);
  class method and property names are intact (`startNight`, `pickTarget`, `whack`, `coffinContents`…).
- **Everything we add is marked `XIOMBARD`** — search for it. Our own named helpers live near the layout constants:
  `MORGUE`, `OUTFITS`, `NAIL_COST`, `morgueBoxes()`, `FENCE_SECTIONS`, `TRAPS`, plus `buildMorgueView()` /
  `buildNightView()` (view), `dressLook()` (outfits on corpses), and sim methods (`morgueKey`, `closeLid`, `repair`…).
- If the artifact author ever shares the real source, port the `XIOMBARD` blocks onto it and drop the bundle.
- The pre-artifact modular version of the game is in git history (commit `887a2a2`).
- `index.html` holds the menu/HUD markup and styles; `npm run build` must pass.
- Debug URL params: `?bots=N`, `?view=third`, `?post=off|low|high`, `?day=0..1`, `?fps`, `?daylen=`/`?nightlen=`, `?botlog`.

## Multiplayer architecture (decided)
- **Host-authoritative P2P.** The host's browser runs `Sim`; guests only send input (30 Hz) and render snapshots (20 Hz).
- Messages: guest→host `hello`, `in` (move, yaw, held buttons, and *counters* for one-shot actions: grab/throw/flop).
  Host→guest `welcome`, `ents` (entity list, sent when `sim.version` changes), `snap` (Float32Array of part transforms + small JSON state + events).
- Every entity is "N parts × (pos, quat)" (characters use the artifact's 6-part crew rig; coffin 1, truck 1).
- Entity descriptors carry `outfit`, `tag` and `lid`; the view rebuilds a model in place when they change.
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
- Debug handle on the host: `window.__xiom = { sim, view, look, bots }` — scripted tests drive `sim.step()` / `bots.update()` directly.
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

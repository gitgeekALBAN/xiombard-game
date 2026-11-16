# XIOMBARD — project context for AI agents and teammates

Read this before changing anything. It records the decisions the team has already made.

## What this is
A browser game on **three.js**, built with **Vite**, published to **GitHub Pages**.
Live: https://gitgeekalban.github.io/xiombard-game/

## Core rule: code-generated assets only
- We do **not** buy assets from stores. Visuals come from GLSL shaders, noise, SDFs and procedural geometry.
- Prefer a shader or procedural mesh over any texture or model file.
- If a file asset is unavoidable, it must be made by the team or be CC0, and get a line in `public/CREDITS.md`.
- GLSL that gameplay code also needs (e.g. terrain height for collisions) must have a JS twin with the same math. Change both together — see `heightAt()` in `src/shaders/terrain.js`.

## Stack and layout
- `three` from npm (no CDN imports), ES modules, `vite.config.js` uses `base: './'` so the build works under `/xiombard-game/`.
- `src/main.js` — renderer, loop, input, gameplay.
- `src/shaders/*.js` — one file per procedural asset, each exporting a factory (`createSky()`, `createTerrain()`, `createCrystalMaterial()`). Shared GLSL lives in `noise.glsl.js`.
- Shaders use `ShaderMaterial`; update `uTime` uniforms from the main loop.

## Workflow
- `npm install`, `npm run dev` (port 5173), `npm run build` must pass before pushing.
- Branch from `main`, open a PR, one review, merge. Push to `main` auto-deploys via `.github/workflows/deploy.yml`.
- Keep the page working at phone width; check FPS on a mid-range laptop before merging heavy shaders.

## Decision: Gaussian splatting
- **Not core.** Possible later for 1–2 hero locations or distant backdrops, via Spark (`@sparkjsdev/spark`), which mixes splats with three.js meshes.
- To respect the asset rule, splats should be **generated from code** (from our noise/SDF functions), or captured by the team ourselves.
- Known limits: baked lighting (no dynamic shadows), needs a separate collision mesh, hard to animate. Budget: compressed `.spz` ≈ 6 MB per 1M splats; phones struggle above ~1–2M splats.
- Riskiest assumption: splats run fast enough on target devices and match the neon shader style. Cheapest test before any design commitment: drop one `.spz` scene into the current page and measure FPS on a mid-range laptop and a phone.

## Product thinking
Product, segment and value decisions follow Advanced Jobs To Be Done / Next Move Theory (Ivan Zamesin). Treat new features as value hypotheses with a named riskiest assumption and the cheapest test before building.

## Language
All code, comments, docs and in-game text are in English.

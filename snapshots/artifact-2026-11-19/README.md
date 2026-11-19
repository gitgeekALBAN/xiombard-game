# Snapshot: newer XIOMBARD build from a Claude artifact (2026-11-19)

Copied as-is from https://claude.ai/artifact/GCkmUVmGFHny8ezmCLGH6T (version `1795027382-ae0d`).

**This is a compiled build, not source.** The JavaScript game logic is minified; only the GLSL shader strings
keep their comments. It is stored here so the team does not lose it — it is *not* deployed and is not wired into `src/`.

What it has that `main` does not (seen from the build): a day/night cycle, painted grass, footpaths and road shaders,
stitched cloth and painted faces, more detailed headstones/coffins/truck, a shovel swing on Click/E, and an FPS overlay (F3 or `?fps`).

Next step: whoever made it pushes the real source to a branch, and it gets reviewed and merged into `src/`.

Checked before committing: loads no external scripts or hosts, no `eval`/`new Function`, same PeerJS room prefix (`xiombard-gy-`).

To try it locally: `npx vite snapshots/artifact-2026-11-19` (or any static server pointed at this folder).

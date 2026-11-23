# Selected reference: amber sunset

The user corrected the reference on 2026-11-22: the selected image is the warm sunset with plum shadows, not the silver overcast image used in the first pass. The authoritative file is `../art/lighting/2026-11-22-implementation-c/reference-corrected-sunset.png` in this repository (SHA256 `5108D4DBBA38EF29D32B3209A16F61E5EA33DB48C5D2B2F26E72C4197B165CEC`). Do not infer the selected image from the earlier A/B/C filenames.

## Implementation

- `shaders/toon.js`: low lateral amber sun, violet sky/bounce fill, existing 2048 shadow map, broad world-space cloud shade over the foreground and eastern facade. The five existing practicals add aimed lobes toward their work surfaces. Window fill is subdued rose; furniture contact masks remain world-space.
- `shaders/sky.js`: lavender-blue upper sky, rose/peach horizon, warm cloud colours. The continuous overcast ceiling is removed.
- `shaders/paint-env.js`: pink interior panes, dark plum ceiling, readable wooden surfaces and reduced plank contrast. Interior bulbs stay on.
- `view/morgue.js`, `view/shafts.js`: compact amber glows; daytime beam meshes remain disabled to avoid luminous doorway walls.
- `view/post.js`: restrained bloom/vignette/grain and no daytime screen-space foreground mask. `view/view.js` supplies matching haze and repeatable debug-camera FOV.

No new shadow maps, textures, render passes or runtime GI. Aperture fill, cloud shade and practical throw patterns are analytic art direction, not baked lighting or geometry-aware GI. Moving objects receive them but do not occlude the diffuse aperture fill. `?lighting=legacy` restores the original lighting rig for A/B review; cloud silhouette fixes apply to both rigs. The sunset look is mapped onto the daytime key of the existing cycle; night keeps its original key, and transitions blend into sunset. The sun azimuth also affects dusk.

## Reproducing the comparison

Run `npm ci` and `npm run dev -- --host 127.0.0.1 --port 5174 --strictPort`.

- `/lighting-review.html?camera=yard&day=1&clean&mute&capture`
- `/lighting-review.html?camera=morgue&day=1&clean&mute&capture`
- Add `&lighting=legacy` for the original rig.
- `capture` fixes the actual canvas at 948 x 593; capture that rectangle at the top left. Without it the canvas follows the browser viewport.
- Remove `clean` for draw calls, triangle counts, CPU/frame timing and failed shader count. GPU timing is opt-in with `profile` because timer queries can stall background browser contexts on some drivers.
- `day=0` / `day=0.5` check night/dusk; `post=low` / `post=off` check other output paths.
- `actors` enables two local crew members and advances simulation, without networking.
- `p=x,y,z`, `t=x,y,z`, `fov=N` override the camera for additional views.

The development-only page imports the real game View, includes initial game props, sets DPR 1 and freezes scene time at 12 seconds. It is not included in the production bundle.

| Camera | Position | Target | Vertical FOV |
| --- | --- | --- | --- |
| Yard | 4.565, 1.652, -4.686 | -4.021, 0.854, 7.587 | 76.82 degrees |
| Morgue | -1.441, 1.813, 6.980 | -8.900, 0.505, 13.511 | 72.543 degrees |

Transforms were reconstructed from door/window/lamp landmarks in the original screenshots. The generated paintover alters some geometry and textures, so this is a close camera match rather than pixel-perfect registration.

## Review

Comparison assets live in this repository at `art/lighting/2026-11-22-implementation-c/`. Open `comparison.html` or run `node serve.mjs` there for port 5175. The reference is the exact user attachment; game images are raw browser captures. Earlier overcast captures are explicitly named `superseded-overcast-*`.

The corrected sunset is a first implementation, not final visual approval. Remaining differences include less detailed vegetation, more uniform wood shading, less prominent lamp halos and simpler shadow shapes than the paintover. Build and shader validation are recorded with the current captures; previous overcast performance samples are not a benchmark for this corrected rig.

Validation of the corrected sunset pass: production build and diff whitespace checks pass. Both 948 x 593 daytime views report zero shader errors. Saved `sunset-checks.json` records 82 draw calls for the yard and 65 for the morgue; one morgue sample had 2.3 ms CPU submission and 16.7 ms frame interval. GPU timing was disabled. The reverse-view/post-off browser check timed out and is not claimed as passed. The stills remain first-pass visual work, with flatter light shapes than the reference.

## Pass 2 — 2026-11-23, awaiting user visual review

The requested focused pass lowers sky/bounce and broad practical fill, raises the amber key, projects narrower cloud openings across the central paths, and tightens/strengthens existing practical lobes onto work surfaces. No new passes or shadow maps. Matched 948 x 593 cameras and the exact corrected sunset reference are unchanged. Artifacts are in this repository under `art/lighting/2026-11-22-implementation-c/v2/`; before means the previous sunset pass. Build, JavaScript syntax and whitespace checks passed. User preference is a quick implementation/capture cycle followed by their visual review.
# Clouds, 2026-11-23

User rejected the disconnected pink circular cloud caps and violet outlines. `sky.js` now joins overlapping elliptical billows with a smooth union and shades each whole cloud with a broad height gradient. Removed spirals and per-puff circular caps, reduced edge noise, height and streak intensity, and shifted sunset tops toward peach with muted lavender bases. No added textures or rendering passes. Build and runtime shader compilation passed. Same-camera before/after screenshots: `art/lighting/2026-11-22-implementation-c/clouds` in this repository. Awaiting the user's visual review.


Cloud follow-up: stretched low clouds had disconnected lobes because W and H changed independently. Lobe width now follows the whole cloud width; a shallow ellipse joins the silhouette and replaces the clipped bottom. Checked four cardinal views, build and shader compilation. Comparison: cloud-layout/comparison.html in the lighting artifact directory. Awaiting user review.

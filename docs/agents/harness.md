# Project harness

This checkout includes the game review page, the full lighting comparison archive, research memory, project instructions and the published Engineering/Productivity skill pack from [Matt Pocock](https://github.com/mattpocock/skills).

## Run the visual review

```sh
npm ci
npm run review
# In another terminal:
npm run review:boards
```

The game/review server uses port 5174. Saved comparisons use port 5175:

- `/v2/comparison.html`: selected paintover, prior sunset and stronger lighting pass.
- `/clouds/comparison.html`: removal of circular cloud caps and spirals.
- `/cloud-layout/comparison.html`: connected cloud shapes and four-direction inspection.

The renderer entry point is `/lighting-review.html`; camera, day/night, quality, fixed capture size and diagnostic options are documented in [lighting-c.md](../lighting-c.md). Review pages are development tools and are not part of the shipped game bundle. Static boards contain saved historical captures, not a live render.

All original comparison images, HTML pages, references, generation prompts and measurements are under `art/lighting/`. `2026-11-22-v1` contains initial concept variants. The correct reference is `2026-11-22-implementation-c/reference-corrected-sunset.png`; early filenames and superseded overcast results must not override it. `memory/xiombard-game-lighting.md` preserves the original research and decision history in its original language.

## Skill pack

The 27 published Engineering/Productivity skills are copied intact into `.agents/skills/` from commit `abeeaf95660ba9e8b7c753eb38f441ca707a8823` (2026-11-19). `.agents/skills/SOURCE.json` records paths and file hashes; `LICENSE` contains the upstream MIT license. Experimental and miscellaneous upstream directories are not part of this published set.

`grill-me` delegates to `grilling`, so both are included. `grill-with-docs` and all its published companion skills are included too. The local files are available to agents on their next turn; agents without automatic skill discovery can follow the instructions in `AGENTS.md`.

These are vendored instructions, not a background service. No vendor hooks or shell scripts were run, no global skill installation was changed, and installation did not start a grilling session. Use `setup-matt-pocock-skills` when configuring the pack's issue-tracker/triage workflow; installation alone does not create GitHub labels or issues.

## Session records

See [grill-me records](../reviews/grill-me/README.md). No earlier grill-me interview was found in this checkout or the lighting conversation. The existing lighting decision history is preserved separately; it is not relabelled as a completed grill-me session.

For a future interview, record the topic/date, confirmed answers, rejected alternatives, unresolved questions and the user's approval status. Keep implementation evidence and user decisions distinct.

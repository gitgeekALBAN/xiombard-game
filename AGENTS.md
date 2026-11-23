# GraveQuota agent entry point

Read `CLAUDE.md` for the game architecture, controls and development rules. For current lighting work, read `docs/lighting-c.md` and `memory/xiombard-game-lighting.md`; the latter preserves the original research and review history, including superseded experiments.

## Harness and skills

See `docs/agents/harness.md` for the complete review setup and vendored skills. Matt Pocock's published Engineering/Productivity skills are in `.agents/skills/`, including `grill-me`, `grilling` and `grill-with-docs`. Use a named skill by reading its `SKILL.md` and referenced files. If the host has no native Skill tool, resolve a skill invocation by reading `.agents/skills/<name>/SKILL.md`. Installing a skill does not invoke it or authorize external writes.

For lighting iterations, make one focused pass, run the technical checks, capture the same cameras and hand the result to the user for visual review. Do not equate a successful build with aesthetic approval. The selected reference is the warm sunset; early A/B/C filenames are not authoritative.

Keep confirmed decisions separate from proposals and rejected experiments. Save future grill session conclusions under `docs/reviews/grill-me/`, with open questions and approval status. Never manufacture a past session or its answers.

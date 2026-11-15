# GPU hand-back (EVILAEGIS, 2026-11-15)

Rendered on EVILAEGIS (RTX 5080, 16 GB) by the local Claude session "Asset generation setup", following
`HANDOFF-GPU.md` on branch `gpu/assets`. Studios: Flux Studio 7880 and Audio Studio 7890, each started detached with
`node server.js`, PIDs in `%TEMP%\flux-studio.pid` / `%TEMP%\audio-studio.pid`, stopped by PID at the end.

## 1. Card art (FLUX.2 klein, 3:2 at 1 MP, 4 steps)

| | |
|---|---|
| Prompts | 175, `build-prompts.ts` lint clean (154 card faces, 12 Ascended faces, 6 crests, cardback, title-skyline, board-backdrop) |
| Sample | tide-maren, ember-crucible--ascended, storm-jax: 62 s including the cold ComfyUI start. Passed: one flat cel-shaded style, faceted highlights, crystal skyline behind each, adult proportions, no lettering, nothing resembling a published design |
| Full batch | 172 plates in about 9 minutes (about 3 s a plate once the model was loaded); 0 failed jobs |
| Delivered | `public/art/*.webp` 640x427 (bottom 5% cropped by `gen.mjs` against signatures), 8.1 MB; `public/art/manifest.json` lists 175 ids |
| Re-rolled | 6 ids, 8 extra renders (see below) |
| Contact sheets | `tools/art/out/sheets/sheet-01.jpg` to `sheet-11.jpg` on EVILAEGIS (gitignored); sent to the owner as FYI (PLAN D13) |

Every one of the 11 sheets was looked at. Rejections and what was done:

| id | first render | action | result |
|---|---|---|---|
| under-pullplug | control panel with a digital readout and labels (lettering) | `--reroll 1` still drew a panel; scene clause in `subjects.ts` reworded to a bare wet stone wall (no panel) | clean |
| storm-airmail | flying notes covered in pseudo-text | `--reroll 1` same; subject reworded from "paper messages" to "small envelopes, each closed with a single round wax seal" | clean (two couriers instead of one; kept) |
| tide-deepstudy | open tome with lines of pseudo-text | `--reroll 1` | small tome with blank glowing crystal pages; clean |
| under-burnledger | burning papers with scribbled text | `--reroll 1` | papers show plain hatching, no letters; kept |
| ember-crucible | a boxy boiler with no arms; did not read as the same machine as its Ascended face (round cauldron) | `--reroll 1` | round barrel-bodied brass furnace with piston arms; matches |
| coil-brakk--ascended | a two-legged pig-man (humanoid torso, hands) | `--reroll 1` | a boar rearing on its hind legs, bark plates, crystal tusks; matches the base boar |

Judgement calls, left as rendered:
- storm-jax--ascended wears a dark shirt where the base face wears the teal flight suit; same face, hair, goggles and wings, so kept.
- Hero pairs checked side by side on the sheets: prism-ysolde, prism-oren, ember-kessa, tide-maren, tide-ilvane, coil-aruvi, under-sable, under-vex, storm-corvane all read as the same person. ember-crucible and coil-brakk after the re-rolls above.
- The Undervolt plates are the darkest of the set (tunnels), but every one is readable at card size on the sheet.
- `tools/art/subjects.ts` was changed only for the two ids above; `style.ts` STYLE was not touched after the first render.

## 2. Audio (Audio Studio)

Pending: `tools/audio/gen.mjs` (new; adapted from StellarDerelict) renders the 49 jobs in `tools/audio/manifest.json`,
`tools/audio/level.mjs` trims, levels and encodes `public/audio/<id>.ogg`. Measurements are filled in below when done.

## 3. Finish

Pending.

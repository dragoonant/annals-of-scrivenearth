# GPU handoff: art and audio on EVILAEGIS

For the Claude session running **on EVILAEGIS** in a clone of this repo. The cloud session that builds the game cannot
reach the studios. Owner approval (PLAN D9, 2026-11-15): about 190 card renders, music, sound effects and hero voice
lines; three-image sample first; one GPU job at a time; stop the studios when done.

Work on branch **`gpu/assets`** (create it from the latest `claude/clever-archimedes-np1a8a`), `git pull --rebase`
before every push, and never push to `main`. Read `docs/knowledge-base/local-ai-studios.md` and the "Figures, art
and the GPU" and "Audio" sections of `docs/knowledge-base/gotchas.md` first (`git submodule update --init`).

## 0. Before anything
- `npm install`. Announce GPU work. Check nothing else is using the GPU. Start Flux Studio (7880) and the Audio
  Studio (7890) with `node server.js` in their folders, detached, recording each PID; never kill node by image name.

## 1. Card art (Flux Studio, FLUX.2 klein)
1. `npx tsx tools/art/build-prompts.ts` must print "lint clean". Never edit a prompt past the lint; fix
   `tools/art/subjects.ts` instead. `tools/art/style.ts` STYLE is byte-identical for the whole set: do not touch it
   once the first batch has rendered.
2. `node tools/art/gen.mjs --dry-run`, then `node tools/art/gen.mjs --sample` (three plates). LOOK at
   `tools/art/out/sheets/sheet-01.jpg`. Check: reads as one style; flat cel shading with faceted light; the crystal
   city behind; adult proportions about seven head-heights; no lettering; nothing that resembles a character from any
   published game, film or show. If the style is off, stop and report back with the sheet rather than changing STYLE alone.
3. Full batch: `node tools/art/gen.mjs`. Review every contact sheet (16 tiles). Re-roll failures only:
   `node tools/art/gen.mjs --force --only <id> --reroll 1` (the old master is archived). Reject: any lettering or
   signature, extra limbs, a hero whose two faces do not look like the same person, a plate too dark to read at card
   size, anything drifting toward a famous existing design.
4. Commit `public/art/*.webp` and `public/art/manifest.json` only (masters stay in gitignored `art-masters/`).
   Put the contact sheets in the hand-back message, not the repo.

## 2. Audio (Audio Studio)
`tools/audio/manifest.json` lists every job: `music` (ACE-Step, `[Instrumental]` lyrics), `sfx` (Stable Audio Open,
batch 2 and keep the better take), `voice` (Qwen voice design: `model: 'qwen-design'`, `instruct`, `text`).
There is no generator script here yet: adapt the proven one from `dragoonant/StellarDerelict` (its `tools/audio`
generator, levelling and `--reroll`), keeping it idempotent with `--dry-run`, `--only`, `--limit`.
- Deliver to `public/audio/<id>.ogg` (music about 96 kbps, effects and voice about 80 kbps mono) and write
  `public/audio/manifest.json` as a JSON array of the ids present. `src/audio/audio.ts` plays a sample when its id is
  in that manifest and falls back to the synthesized voice otherwise.
- Level everything (effects within about +-15% RMS of each other; voice lines normalised; music 6 dB under effects).
  Trim leading silence. Measure crest factor and list it in the hand-back. Say "not verified by ear".
- Masters stay in gitignored `audio-masters/`.

## 3. Finish
Stop both studios by PID. Push `gpu/assets`. Hand back: counts rendered and re-rolled, which ids failed, where the
contact sheets are, audio measurements, and anything that looked off.

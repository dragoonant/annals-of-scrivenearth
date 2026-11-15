# Status (rewritten each stage)

**2026-11-15, stage 1: first playable.** All gates pass (`npm run gate`): typecheck, 201 Vitest tests, AI-vs-random
bench with replay, build, 5 Playwright tests.

## What exists
- **Rules engine** (`src/engine`, spec `docs/spec/10-rules.md`): rounds, Charge and Reserve, priority, glyph stack,
  declare/block/combat window, 12 keywords, hero ascension, Channel, full-Line replace, hidden-information view, save.
- **Cards**: 150 collectible (6 factions x 2 heroes, 14 units, 9 glyphs), one behaviour test per card and hero.
- **AI**: Apprentice / Adept / Archon, measured as a ladder (BALANCE B-2).
- **Client** (`src/client`, spec `docs/spec/50-client.md`): title, new game with deck peek, mulligan, board, inspector,
  stack, hero trackers, log, presentation director with the ascension sequence, autosave and Continue, settings,
  how to play, rotate overlay in phone portrait. Procedural crystal-sigil card art.
- **Sound**: synthesized effects riding the event log; generated samples take over when delivered. Not verified by ear.
- **GPU job files**: `HANDOFF-GPU.md`, `tools/art/` (style, lint, Flux generator), `tools/audio/manifest.json`.

## Not done yet
- Interface depth to the Xross Forge / Shadowforge level (PLAN D12): unit keyword badges and status marks, attack
  arrows and strike animation, targeting lines, combat forecast, spotlight of the opponent's plays, prompt wording
  per card (the table is empty), end-screen detail. Block, Dueler and full-Line flows have no browser test.
- Deck builder screen (the model and its tests exist in `src/deckbuilder`).
- Guided first match (PLAN D16).
- Real art and audio: waiting for the EVILAEGIS session (PLAN open question 1). `tools/art/subjects.ts` in progress.
- Premade decks are curve-built, not hand-tuned. Tidewardens look weak in AI games (BALANCE B-3), untouched.
- Rule 21 side-by-side screenshots against Xross Forge and Shadowforge.
- Knowledge-base entry.

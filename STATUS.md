# Status (rewritten each stage)

## Now, 2026-11-26
**All three sets in docs/SETS.md are written** (PLAN D26): First Light (300), The Mirror Quarter (x1, 124) and The
Starward Rise (x2, 124): **548 cards, 45 heroes, eight factions**. x1 brought Mirrorwatch with Veiled, Reprise,
Glimmer, copy and foe-glyph triggers; x2 brought the Orrery Conclave with Chart, units that Unfold and Conjunction
(spec R-K13, R-K14, R-E1 to R-E6; `tests/x1.test.ts`, `tests/x2.test.ts`). The deck builder filters by set and hides
factions with no cards. 35 premades; every hero leads at least one.

Gates: typecheck, 735 Vitest tests, the text audit (0 FAIL of 633 card faces), the mutation check (every card
caught), the art prompt lint (644 prompts), the bench and the build pass; Playwright 24 of 25 on this PC (the
machine-dependent full-Line test below).

Balance: BALANCE B-5 to B-7. Every premade wins 26-79% of AI-versus-AI games.

### Next
- **Merge to `main`**: x1 and x2 are on branch `claude/card-sets`; `main` has First Light only.
- **Art and audio for the new cards**: the 398 cards added since the original 150 show procedural sigils and the
  33 new heroes have no voice lines; their prompts (heroes and units that Unfold have a second plate) are ready in
  `tools/art/out/prompts.json`.
- **Magitek Wars** (PLAN D27) is a separate project in its own repo.

## What exists
- **Rules engine** (`src/engine`, spec `docs/spec/10-rules.md`), 548 cards, 45 heroes, three AI tiers (BALANCE B-2).
- **Decks** (`src/data/decks.ts`): 35 premades covering all 15 base faction pairs, two single-faction decks and the
  expansion factions' pairs; every hero leads at least one.
- **Client** (`src/client`): title, learn to play, new game with deck peek and one-line plans, mulligan, board,
  inspector, stack, hero trackers, log, presentation director, autosave and Continue, deck builder, end screen,
  settings, how to play.
- **Art and audio pipelines** (`tools/art`, `tools/audio`, `HANDOFF-GPU.md`); art subjects are now one file per
  faction (`tools/art/subjects/`), target prompts one file per faction (`src/client/prompts/`).

## Not done / known rough edges
- `e2e/flows.spec.ts` "(d) a full Line" fails on this Windows PC (it passes on the Linux CI runner); the seeded game
  differs between machines and the cause is not found.
- The bug-report download test fails with EPERM in `e2e-out` when run from the project folder on this PC and passes
  from a folder under AppData: the folder is the cause, not the code.
- None of the 398 new cards has been played by hand. Hero level bars for the 33 new heroes are estimates.
- The AI has no sense of a copy's, a Veiled unit's or an Unfold unit's future value; expansion decks may play
  differently in human hands.
- Tide-led and curve-built premades are the weakest group (BALANCE B-4, B-5); Ledger of Tides is the strongest.
- Card-author wishes not yet built: a filter on random selectors, filtered counts ("for each Aerial ally"), a strike
  op aimed at a Spire, a condition on a chosen target's keyword, a "this unit killed something" trigger.
- The combat forecast ignores Strike/Shatter abilities and glyphs cast in the combat window.
- Audio and art have had no human review; the right-hand stack panel is empty most of the time.

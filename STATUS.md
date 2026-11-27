# Status (rewritten each stage)

## Now, 2026-11-26
**The Mirror Quarter (set x1) is done**: 124 cards on top of First Light (PLAN D26, `docs/SETS.md`), so the pool
is 424 cards and 34 heroes in seven factions. The new faction, **Mirrorwatch**, has 40 cards and four heroes; each
older faction has 14 more cards and one more hero. New rules: Veiled (R-K13), Reprise (R-K14), Glimmer (R-E1), copy
(R-E2), foe-glyph triggers (R-E3) (`tests/x1.test.ts`). The deck builder has a set filter. Five new premades are led
by the ten x1 heroes, so there are 29 premades in all.

Gates: typecheck, 606 Vitest tests, the text audit (0 FAIL of 468 card faces), the mutation check (every card
caught), the art prompt lint (479 prompts), the bench and the build pass; Playwright 25 of 25 on the last full run
after the deck-builder count fix (the full-Line test is machine-dependent, see below).

Balance: BALANCE B-6. Every premade wins 24-76% of AI-versus-AI games; decklists changed, no card numbers.

### Next
- **The Starward Rise (set x2)**: rules are built and tested (R-E4 Chart, R-E5 Unfold, R-E6 Conjunction,
  `tests/x2.test.ts`); the Orrery Conclave and the 84 cards for the older factions are being written.
- **Art and audio for the new cards**: the 274 cards added since the original 150 show procedural sigils and the
  22 new heroes have no voice lines; their prompts are ready in `tools/art/out/prompts.json`.
- **Magitek Wars** (PLAN D27) is a separate project in its own repo.

## What exists
- **Rules engine** (`src/engine`, spec `docs/spec/10-rules.md`), 424 cards, 34 heroes, three AI tiers (BALANCE B-2).
- **Decks** (`src/data/decks.ts`): 29 premades covering all 15 base faction pairs, two single-faction decks and four
  Mirrorwatch pairs; every hero leads at least one.
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
- None of the 274 new cards has been played by hand. Hero level bars for the 22 new heroes are estimates.
- The AI has no sense of a copy's or a Veiled unit's future value; x1 decks may be stronger in human hands.
- Tide-led and curve-built premades are the weakest group (BALANCE B-4, B-5); Ledger of Tides is the strongest.
- Card-author wishes not yet built: a filter on random selectors, filtered counts ("for each Aerial ally"), a strike
  op aimed at a Spire, a condition on a chosen target's keyword, a "this unit killed something" trigger.
- The combat forecast ignores Strike/Shatter abilities and glyphs cast in the combat window.
- Audio and art have had no human review; the right-hand stack panel is empty most of the time.

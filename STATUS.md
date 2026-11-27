# Status (rewritten each stage)

## Now, 2026-11-26
**First Light, the 300-card base set, is done** (PLAN D26, `docs/SETS.md`): each of the six factions has 50 cards
(4 heroes, 28 units, 18 glyphs), 24 heroes in all. Each new card has its own behaviour test, an art subject and, if
it takes targets, a prompt line. Six new premades are led by the twelve new heroes, so there are 24 premades in all.
The five original curve-built premades are frozen as lists so the new cards did not change them.

Gates: typecheck, 461 Vitest tests, the text audit (0 FAIL of 332 card faces), the mutation check (300 of 300
cards caught), the art prompt lint (341 prompts), the bench and the build pass. Playwright: 24 of 25 pass on this PC;
the one failure is the machine-dependent full-Line test below (the two deck-builder tests that assumed 150 cards were
updated).

Balance: BALANCE B-5. Every premade wins 25-76% of AI-versus-AI games; three card numbers changed (Penn, Debt Assessor).

### Next
- **Expansions** (The Mirror Quarter, The Starward Rise): rules are specified (spec R-K13, R-K14, R-E1 to R-E6) and
  built and tested on branch `claude/x2-engine` (Mirrorwatch and Orrery Conclave factions, deck-builder set filter);
  their cards are not written. Waiting on the owner, who asked about a new project with a new art and story direction.
- **Art and audio for the new cards**: the 150 new cards and 12 new heroes show procedural sigils and have no voice
  lines; their prompts are ready in `tools/art/out/prompts.json` for the next EVILAEGIS batch.

## What exists
- **Rules engine** (`src/engine`, spec `docs/spec/10-rules.md`), 300 cards, 24 heroes, three AI tiers (BALANCE B-2).
- **Decks** (`src/data/decks.ts`): 24 premades covering all 15 faction pairs and two single-faction decks; every
  hero leads at least one.
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
- None of the 150 new cards has been played by hand. Hero level bars for the 12 new heroes are estimates.
- Tide-led and curve-built premades are the weakest group (BALANCE B-4, B-5); Ledger of Tides is the strongest.
- Card-author wishes not yet built: a filter on random selectors, filtered counts ("for each Aerial ally"), a strike
  op aimed at a Spire, a condition on a chosen target's keyword, a "this unit killed something" trigger.
- The combat forecast ignores Strike/Shatter abilities and glyphs cast in the combat window.
- Audio and art have had no human review; the right-hand stack panel is empty most of the time.

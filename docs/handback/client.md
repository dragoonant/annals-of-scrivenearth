# Client hand-back

## Built
Title, New game (deck tiles, Peek, Surprise me, difficulty, replace-save confirm), Mulligan, Board (rail/bars, Lines, battle row with
forecast, stack, action bar, 4-line feed, log drawer, Scrap viewer, menu/concede, settings with volume/mute/sound test), End screen,
How to play. Inspector (hover 300 ms / long-press), presentation director (full/quick/instant, skip on click/key, round banner,
opponent card travel, ascension sequence + deck banner), procedural crystal sigils, autosave/Continue/corrupt-save handling,
R-U1 scrap-a-unit flow (from legalActions `replace`), audio wired (`installAudioUnlock`, `playEvent(e,0)` per presented event, not in instant),
portrait phone shows a rotate overlay.

## Not built
Deck builder (disabled title stub, "Coming in the next build"). Portrait layout (overlay only, by decision). PLAY_PROMPTS table is empty
(fallback wording built from the target spec). Audio is unverified by ear.

## URL params / hooks
`?seed=N` `?speed=full|quick|instant` `?bot=random` `?auto=1` `?decks=i,j` `?skiptitle=1` `?devdecks=1` (two 40-card test decks, bypass checkDeck, dev only)
`?demo=ascend` (dev only: puts your first hero on the Line and plays its Ascension).
`window.__sv = { state, view, idle, act, seat: 0, onEvents }`; `document.body.dataset.premade` = number of legal premade decks.
Hooks: `data-card`, `data-unit`, `data-hand`, `data-spire`, `data-sid`, `data-action=pass|attack|blocks|play|channel|mulligan|cancel|noforce`, `data-screen` on `#root`;
classes `.actable`, `.armed`, `.is-target`, `.selected`. Storage: `scrivenearth-save`, `scrivenearth-settings`, `scrivenearth-decks` (read only, checkDeck-validated).

## Rough edges
- Inspector sits over the hovered card's neighbours; phone-landscape inspector is a two-column layout, only lightly checked.
- Scrap-a-unit flow and block/duel flows are covered by logic but not by e2e.
- Hand cards at 844x390 are small (inspect by long-press). Event feed hidden at 844x390 (use Log).
- Intermediate states are not shown during a multi-event action; effects play on the old board, then the new state swaps in.
- `tsc --noEmit` currently fails only in tools/art (not mine).

## Commands and results
- `npx tsc --noEmit`: no errors in src/client, tests/client-text, e2e (errors only in tools/art/*).
- `npx vitest run`: 13 files, 201 tests passed (includes tests/client-text.test.ts).
- `npx vite build && npx playwright test`: 5 passed (full game w/ text sweep, human path, rule 24 + scrollbars at 844x390/1366x768 + portrait rotate overlay, no tooltips, save/continue/corrupt).

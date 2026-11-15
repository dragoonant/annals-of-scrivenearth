# Hand-back: deck builder, guided first match, end and setup screens

## Built
- **Deck builder** (`data-screen="builder"`, title button is live): `src/client/deckbuilder.ts` + `deckbuilder.css`. All rules come from `src/deckbuilder/model.ts`
  (`whyNotAdd`, `deckStats`, `exportDeck`/`importDeck`, `loadDecks`/`saveDecks`, `autoDeck`); nothing is re-implemented.
  - Collection of the 150 collectible cards with the shared card face, sorted by cost then name; filters: six faction gems, type, cost 0-7+, keyword, text search
    (an `<input>`, stays typeable and selectable). Hover/long-press inspects (same inspector as the board). Tiles show copies in deck ("2/3"); a card that cannot
    be added is dimmed, shows `whyNotAdd` in the status line on click and on hover (never a silent no-op).
  - Deck pane: name, "n / 40" (cyan when legal), every legality problem in words, units/glyphs/heroes counts, factions used, Charge-curve bars, deck rows (click removes a copy).
  - Buttons: New deck, Save (disabled while illegal, with the reason shown; asks once before replacing a different saved deck of the same name), Delete (asks once),
    Open saved, Copy a premade, Auto-fill (two chosen factions), Import code (problems in words), Export code (selectable field), Back to title. Unsaved work is guarded by one confirm.
  - Saved decks appear on New game for both players (the catalogue is re-read every time the screen opens); a `loadDecks`/`saveDecks` problem is a visible line in the builder and on New game.
  - No page scrollbars at 1366x768 and 844x390; the two panes scroll inside themselves with thin styled scrollbars. At 844x390 the cost/keyword filters sit behind a "Cost and keyword" toggle.
- **Guided first match** (`?tutorial=1` or title "Learn to play"): `src/data/tutorial.ts` (script + `TutorialFlow`, headless), `src/client/tutorial.ts` + `tutorial.css` (coach, rings, dimming).
  Fixed setup (seed 4242, both decks in exact draw order, `noShuffle`, `skipMulligan`, `first: 0`). The opponent plays scripted actions only (no AI runner). Only the lesson's one action is
  accepted; every other game input is dimmed, and clicking it (or sending the action) answers with the coach's correction and changes nothing. The coach is a cut-facet panel placed where it
  does not cover the highlighted control (tested at both sizes), has "Skip tutorial", and the session is `ephemeral`: no autosave, never clears an existing save. Ends with the "You're ready" panel (New game / Build a deck / Title).
- **End screen**: winner, reason in words, rounds, both Spire totals, every hero of both sides with progress or "Ascended in round N" (from the log's `ascend` entries), damage to Spire / enemy units destroyed / glyphs cast from `players[seat].seen`,
  Play again / Title / **Save bug report** (JSON download: seed, setup, actions, the final save envelope, `navigator.userAgent`; `bugReport()` in `game.ts`).
- **Setup screen**: deck tiles with the two faction gems, hero names and a one-line plan (curve, glyph count, first hero's Ascension goal; `deckPlan()`), a "YOUR DECK" tag on saved decks, difficulty cards with the `DIFFICULTIES` blurbs, a sticky Start button.

## Tutorial step list (20 player steps; the opponent's replies are in `after`)
Round 1 (you hold the Initiative, 1 Charge): 1 Charge: play Signal Kite. 2 Priority: Pass (both pass, round ends).
Round 2 (2 Charge): 3 Heroes: play Jax Windlash (chip shows 0/8). 4 Priority: End round.
Round 3 (your Initiative, 3 Charge): 5 Attack: click Jax. 6 Attack: lock in. 7 Combat window: No response, strike (3 Spire damage). 8 Unspent Charge: End round (it becomes Reserve).
Round 4 (the opponent attacks with Spearhorn): 9 Block: Jax blocks Spearhorn. 10 Block: lock blocks. 11 Flash glyph: Tailwind on Jax (paid from Reserve). 12 Combat window: strike (Jax wins).
13 Swift glyph: Slag Bolt at Lampkeeper (opponent answers with Patch the Pane). 14 The stack: Let it resolve (newest first). 15 Reserve: End round.
Round 5 (your Initiative): 16 Reserve: Gale Surge (+2|+0, paid from Reserve). 17-18 Ascend: attack with Jax and Signal Kite. 19 lock in. 20 strike: 11 Spire damage in total, Jax Ascends on the Line, then the "You're ready" panel.
Decks: you Stormrail + Emberworks, the opponent Prismguard + Verdant Coil; both are legal 40-card decks (tested).

## Not built / limits
- Touch long-press inspect in the builder uses the shared handler and was not exercised on a touch device. No drag-and-drop. Deck rows have no "add copy" button (click the collection).
- The tutorial has no back button and no replay of a single step; "Skip tutorial" leaves it. Portrait phones still get the rotate overlay.
- The Peek on New game still lists the deck as before (no plan text in the peek).
- smoke.spec.ts was NOT changed (it never checked the deck-builder stub text).

## Tests
- `npx tsc --noEmit`: clean. `npx vitest run`: 14 files, 285 tests pass (5 new in `tests/tutorial.test.ts`: both decks legal, full replay against the real engine with every scripted player and opponent action legal, game not over and hero not Ascended before the last step, Ascended with 11 Spire damage at the end, wrong moves refused with a hint, topic order, wording limits).
- `npx vite build && npx playwright test`: 15 tests; 14 pass: 6 in `e2e/deckbuilder.spec.ts` (build by Auto-fill + two swap clicks, legal turns cyan, save, reload, on New game for both players, start a game with it; illegal add reason; import problems; filters/overwrite/delete/no scrollbars at both sizes; damaged-storage line; end screen + bug report download), 4 in `e2e/tutorial.spec.ts` (full click-through at instant speed, wrong click correction, coach never covers a highlight at both sizes, save untouched / Skip).
- **1 failure, not from this work:** `e2e/smoke.spec.ts` "rule 24 and no scrollbars (844x390)" reports `.board` overflowing by 1-3 px. Cause: the uncommitted `src/client/style.css` change by the other helper (`.hand-card .c-text` height 4.6rem to 5.4rem). It passed before that edit. I did not touch their file.
- The tutorial also ran to the end at `full` speed (about 50 s of animation, no errors).

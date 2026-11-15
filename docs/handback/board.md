# Board hand-back (board, presentation, director, art hook)

Files touched: `src/client/board.ts`, `cardview.ts`, `director.ts`, `text.ts`, `art.ts`, `style.css`, new `src/client/fx.ts`,
`e2e/flows.spec.ts`, `tests/client-text.test.ts` (prompt tables), new `tests/forecast.test.ts`. No other file was edited.
Every export the other client files import is unchanged; exports were only added.

## Built, per item
1. **Unit cards.** `unitEl` (cardview): cost gem, name, current power/health (health red when damaged, both green above the
   printed value, from `stats()`), cut-gem keyword icons (inline SVG, `keywordIcon` in art.ts; names are shown in the
   inspector with the same icon, no tooltips), Stasis (frost overlay + tag + desaturated art), Ward (faceted shield rim),
   Ascended hero (white-gold frame, crown of shards), Unstable (flicker + jitter), Silenced and this-round-buff markers
   (small cut marks, explained in the inspector's status lines), damage crack, and a thin progress bar on unascended heroes
   (`heroProgress`). `patchUnitEl` updates numbers in place for the director.
2. **Hand.** Fan along the bottom, one consistent size, playable cards rise and carry the actable edge, discounted cost in green
   with the printed cost struck through. Clicking an unplayable card shows `whyNotPlay` in the action bar (e2e). The
   inspector is placed by `placeInspector` (cardview): above the hand for hand cards, beside the unit for Line units (other
   side / above / below, or narrower, when needed), clamped to the viewport, never over the hovered card (e2e at 1366x768 and
   844x390). `installInspectorPlacer` (called from `renderBoard`) re-places the app's inspector box before it paints, because
   `app.ts` still does its own first placement.
3. **Targeting layer.** SVG overlay inside `.board` (`redrawOverlay`, redrawn on hover without a re-render): line from the armed
   card to the hovered legal target, legal targets pulse amber, a first-chosen target stays marked "1", scrap choice draws a
   red link; every stack item's targets are linked, the newest always, others on hover. `PLAY_PROMPTS` has an entry with the
   right number of slots for all 50 cards that take targets; `tests/client-text.test.ts` asserts it for every glyph and every
   deploy ability on either hero face, and that no entry is orphaned.
4. **Combat.** Each pair is a column in the battle row: the opponent's unit above, yours below, joined by a conduit with a
   forecast chip. `forecast(view, pairIndex)` is a pure export of board.ts, read only from `stats()`, remaining health, Plated,
   Ward, Vanguard, Corrosive, Pierce. `tests/forecast.test.ts` checks it against the real engine on 3,240 combinations
   (powers, healths, keywords, Ward on either side) plus unblocked, gone-blocker (R-B7/R-B8) and damaged cases. Unblocked
   attackers read "N to the Spire". Declared attackers and blockers slide into place (FLIP on re-render, `playFlip`). The action
   bar names who may respond in the combat window. A blocker that left the fight (`blk === ''`) is shown as "no blocker" (the
   first client showed it as unblocked).
5. **Animation.** `director.ts` + `fx.ts`: strike lunge, crack + floating damage number, Spire shake + number, heal number, buff
   pop, shards on destroy (6-8), facets assembling on summon, card flying to the stack, pulse from stack to targets on resolve,
   frost sweep on Stasis, shield shatter on Ward, card back sliding from deck to hand, round banner and the Initiative marker
   flying to the new holder, opponent spotlight (500 / 1200 / 250 ms). Events play on the old board; a working copy of the
   presented state is updated as each damage / heal / buff / summon / die / stack / charge event passes, then the real state is
   swapped in. All skippable by click or key, none drawn at instant speed, input locked while busy. `Director.speed` is now an
   accessor that also sets the effects scale. When the opening hands settle, the board is shown at once so the first round banner
   plays over it (before it played over the mulligan screen).
6. **Ascension.** Dim, conduits surge white, the hero grows from its place to the centre, cracks draw along it, white flare and
   gold burst, re-forms as the Ascended face with new name, stats and text, holds 3.0 s (2.0 s at quick speed), returns to its
   place while the Line card flips. The watchdog cannot cut it short (long holds count as progress).
7. **HUD.** Charge/Reserve cells with a conduit line, draining with a pulse when spent; Spire crystal with crack stages at
   15/10/5 (`spireStage`); the Initiative marker flies between sides at round start; "CAN ATTACK" (with `+N` for extra
   attacks); deck/hand/Scrap counts; hero tracker chips; round tag in the battle row; at 844x390 the rails sit left of the
   Lines, one feed line sits under the status line.
8. **Real art hook.** `art.ts`: fetches `./art/manifest.json` at start; listed ids render as lazy, async-decoded `<img>` (object-fit
   cover), unlisted ones keep the sigil; a listed image that fails logs `art: "<id>" is listed ... failed to load` and falls back
   to its sigil. `artStatus()` returns `{ listed, missing }` for a settings readout (settings.ts is not mine: not wired).
   The manifest may also list `cardback` and `board-backdrop`; they are applied as card backs and a faint board backdrop. The 175
   plates that landed in `public/art` during this work are in use.
9. **e2e (`e2e/flows.spec.ts`).** (a) declare two attackers by clicking, lock in, battle row and chips; (b) block by clicking
   unit then attacker, lock blocks; (c) arm a targeted card, hover shows the targeting line, click targets, "1" mark, effect in
   state; (d) full Line: arm a unit, click one of mine to scrap, replaced; plus unplayable-card reason, inspector placement at two
   sizes, art hook (listed / unlisted / broken / no manifest). Every test ends with the 'undefined' / 'NaN' / '[object' sweep and
   a no-console-error check.

## Skipped / limits
- Portrait layout is still the rotate overlay (the compact "tall" rules were kept, not tuned).
- The forecast ignores Strike/Shatter abilities and glyphs cast in the combat window; it says so only by being limited to the
  listed keywords.
- A provisional stack item (first target only) is shown between the cast animation and the real state swap.
- Hover-driven overlay redraw and FLIP need layout: not covered by unit tests, covered by the e2e above.
- Audio is untouched (`playEvent(e, 0)` per presented event, as before).
- Not wired (not my files): `artStatus()` into settings; nothing else is needed from other files.

## Results
- `npx tsc --noEmit`: clean.
- `npx vitest run`: all green (see the final line of the run in the task result for the count).
- `npx vite build && npx playwright test`: all green, including `e2e/smoke.spec.ts` and `e2e/flows.spec.ts`.
- Screenshots: `/tmp/claude-0/-home-user-annals-of-scrivenearth/ea59f08a-530e-530f-a046-1c805977cfcb/scratchpad/board/`.

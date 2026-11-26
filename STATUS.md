# Status (rewritten each stage)

## Morning summary (owner), 2026-11-15 night
**Stage 2 is on `main`.** Every gate passes in one command (`npm run gate`): typecheck, 290 Vitest tests, the
text-versus-data audit (0 FAIL of 166 card faces), the mutation check (150 of 150 cards caught), the art prompt
lint, the AI-versus-random bench with seed replay, the build, and 24 Playwright tests.

Play: https://dragoonant.github.io/annals-of-scrivenearth/ (needs the repo public and Pages on `gh-pages`, PLAN D17).
Screenshots: `docs/screens/stage2-*.jpg` (title, board in combat, inspector, phone landscape, deck builder, setup).

What changed since you said it was ugly (PLAN D20):
1. **Real art everywhere**: 175 plates from EVILAEGIS (every card, both faces of each hero, crests, card back, painted
   title skyline, board backdrop). The triangle sigils are gone wherever a plate exists.
2. **Board rebuilt**: larger units with faction-lit frames, keyword badges, status marks, hero progress bars, hand
   fan, targeting lines, a battle row with a per-pair forecast, an effects layer (strikes, shatter, summon, stasis,
   ward break), the ascension sequence, per-card prompt wording for all 50 targeted cards.
3. **Deck builder, guided first match (20 steps, ends with Jax ascending), richer end screen with a bug-report file.**
4. **Generated audio**: 7 music tracks that follow the screen and the match, 30 effects, 12 hero voice lines.
   The set on `main` is the ElevenLabs render the EVILAEGIS session made at your request (PLAN D23); looping tracks
   are now seamless. The earlier Audio Studio set is in git history.
5. **Per-card audit** (your request): three independent reviews, four engine bugs fixed, 53 weak tests rewritten.
   Summary: `docs/audit/README.md`.

### Questions, in priority order
1. **Look.** Is the board now in the right direction against Shadowforge, or what still reads as ugly? Name the
   screen and the thing (PLAN D20 picks were art, flat board, frames and type).
2. **Sound.** Nothing has been heard by anyone: NOT VERIFIED BY EAR. Please listen in Settings (sound test) and to
   the music. Brakk's roar is now a sound effect, not a voice line.
3. **Art misses** I noticed on the sample sheet: Ascended Jax wears a dark shirt (not his teal suit), Ysolde holds a
   flaming staff (a shield captain), Sluice Close shows soldiers at a gate (not a canal freezing). Re-roll these, or
   are they fine?
4. **Tidewardens** lose in AI-versus-AI games (BALANCE B-3). Play Tide once and say whether it feels weak.

## What exists
- **Rules engine** (`src/engine`, spec `docs/spec/10-rules.md`), 150 cards, 12 heroes, three AI tiers (BALANCE B-2).
- **Decks** (`src/data/decks.ts`): 18 premades covering all 15 faction pairs and two single-faction decks.
- **Client** (`src/client`): title, learn to play, new game with deck peek, mulligan, board, inspector, stack, hero
  trackers, log, presentation director, autosave and Continue, deck builder, end screen, settings, how to play.
- **Art and audio pipelines** (`tools/art`, `tools/audio`, `HANDOFF-GPU.md`); the EVILAEGIS job is finished and the
  studios are stopped. Its write-up: `docs/handback/gpu.md`.

## Not done / known rough edges
- `e2e/flows.spec.ts` "(d) a full Line" (seed 4) ends in defeat before the Line fills on EVILAEGIS (Windows),
  four runs in a row, but passes here (Linux container) five runs in a row. The seeded game differs between the two
  machines; the cause is not found yet (suspects: a timing-dependent path in the client's AI turn loop, or the
  test's own waiting). The engine replay tests are deterministic on this machine.
- The bug-report download test fails on EVILAEGIS with a Windows file-permission error (EPERM in `e2e-out`) when run
  from the project folder, but passes on the same machine and the same commit from a folder under the user's AppData,
  so the folder is the cause, not the code. (2026-11-26; the full-Line test also failed there on `main` before D25.)
- My own visual pass was short (`src/client/polish.css`): painted backdrops, frames, unit size. Not yet compared side
  by side with Shadowforge screenshots (owner rule 21 gate), and the right-hand stack panel is empty most of the time.
- The board backdrop plate is 640 px wide and is shown blurred; a larger render would look better.
- The combat forecast ignores Strike/Shatter abilities and glyphs cast in the combat window.
- Touch long-press inspect in the deck builder was not exercised. Phone landscape works but hand cards are small.
- 18 premade decks (PLAN D25): 12 hand-built, plus five curve-built and Blackwater rebuilt by hand. The two Tide-led
  decks (Floodgate, Crosscurrent) win about a quarter of AI-versus-AI games and Tithe Wall about 70% (BALANCE B-4);
  the five curve-built decks are the weakest group. Not playtested by hand.
- The audit's fixes have not had a second independent review; the mutation check is whole-card, not per clause.
- Audio and art have had no human review.

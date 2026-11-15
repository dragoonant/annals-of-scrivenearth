# Balance record

This is an original design, so numbers may change, but only with a measurement written here.
Method: `npm run sim`, every pairing in both seats, decisive games only, holdout seeds for any change.

| # | Date | Question | Measurement | Outcome |
|---|---|---|---|---|
| B-1 | 2026-11-15 | Do boards stall? | 60 AI mirror games over all 15 faction pairs: 10 ended by empty deck, the AI attacked 4.1 times a game and sat idle with options in 22.5% of rounds. Cause: the AI only took attacks that won outright, so two full Lines stared at each other. | A tempo bonus on the first attacker (0.3 + 0.08 per round, +1.0 with a full Line): empty-deck endings 6 of 60, attacks 6.2 a game, idle 4.7%, first player wins 50.0%. Versus random 58 of 60 (96.7%). No card numbers changed. Open: a full Line with a hand of units is still a dead end for a human; ask after the first playtest. |
| B-2 | 2026-11-15 | Are the three AI tiers a ladder? | Mirror decks, all 15 pairs, both seats. Apprentice (noise 4) vs Adept: 28-32, no real gap. With noise 9 and a 20% dawdle: Adept 50-10 (83%). Archon (one enemy-attack reply ply) vs Adept: 36-24 (60%). Apprentice vs random: 38-2. | Adopted. Archon costs about 0.9 s a game in the sim against 0.45 s for Adept. |
| B-3 | 2026-11-15 | Are the faction pairs level? (Adept vs Adept, 120 games, curve-built decks, not hand-tuned) | ember+under 15-1, prism+coil 14-2 at the top; tide+storm 2-14, ember+tide 3-13, prism+tide 4-12 at the bottom. Every Tide pair is at or under 50%. | Not acted on yet. Two readings: Tide's cards are weak, or the AI plays a draw-and-Stasis deck badly (it never holds a glyph for the opponent's turn on purpose). Decide after the owner has played Tide by hand; do not change card numbers on this table alone. |

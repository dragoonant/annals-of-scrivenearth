# Balance record

This is an original design, so numbers may change, but only with a measurement written here.
Method: `npm run sim`, every pairing in both seats, decisive games only, holdout seeds for any change.

| # | Date | Question | Measurement | Outcome |
|---|---|---|---|---|
| B-1 | 2026-11-15 | Do boards stall? | 60 AI mirror games over all 15 faction pairs: 10 ended by empty deck, the AI attacked 4.1 times a game and sat idle with options in 22.5% of rounds. Cause: the AI only took attacks that won outright, so two full Lines stared at each other. | A tempo bonus on the first attacker (0.3 + 0.08 per round, +1.0 with a full Line): empty-deck endings 6 of 60, attacks 6.2 a game, idle 4.7%, first player wins 50.0%. Versus random 58 of 60 (96.7%). No card numbers changed. Open: a full Line with a hand of units is still a dead end for a human; ask after the first playtest. |

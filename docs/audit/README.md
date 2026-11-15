# Per-card audit (owner request, 2026-11-15)

"Make sure you run a per card audit to test all cards and mechanics to make sure they work as stated."

## What was done
1. **Three independent read-only reviews**, two factions each, by reviewers who did not write the cards. For every card
   face: text against data, data against what the engine really does (edge cases traced in the code), and whether the
   card's test would still pass if the ability did nothing. Every suspected mismatch was proven with a test against the
   real engine. Reports: `prism-coil.md`, `ember-storm.md`, `tide-under.md`. Fix logs: the matching `*-fixes.md`.
2. **Printed-versus-data auditor** (`tools/audit.ts`, in the gate with a selftest): keywords, trigger words, numbers,
   durations and effect words, both directions, on all 166 card faces.
3. **Mutation check** (`tools/mutate.ts`, in the gate): each of the 150 collectible cards is stripped of its keywords,
   abilities, auras and effects in turn; its own tests must then fail.

## Result
| Review | Entries | OK | WARN | FAIL |
|---|---|---|---|---|
| Prismguard + Verdant Coil | 54 | 35 | 18 | 1 |
| Emberworks + Stormrail | 53 | 40 | 13 | 0 |
| Tidewardens + Undervolt | 51 | 28 | 22 | 1 |

After the fixes: auditor 0 FAIL of 166 faces; mutation 150 of 150 caught; 285 tests pass.

## Engine bugs the reviews found (all fixed, each with a regression test)
- A rally used before the round's first attack did nothing. Now it always grants one more attack (R-B1).
- A two-target glyph could not be cast with one legal target, with a wrong refusal message. Now the empty slot is
  skipped (R-G10); glyphs that make two units fight still need both.
- A conditional aura ("allies with 5+ power have Pierce") ignored power from other auras (R-S1).
- A "Strike: I get +1|+1" ability resolved before the lethal-damage check and saved the unit (R-S2).

## Rules that cards relied on but the spec never stated (now written)
Drain (R-D7), return to hand including tokens and a full hand (R-U4), repeat Stasis (R-D8), Pierce against Ward and
Plated (R-K2), a Flash that ends an attack (ruling under R-B8/R-P3).

## Limits of this audit
- The mutation check removes a whole card's behaviour, not one clause at a time. Per-clause coverage rests on the
  reviewers' weak-test lists and the rewritten tests; no per-clause mutation was run.
- The reviewers and the fixers were different helpers, but the fixes themselves have not had a second independent review.
- Nothing here is a balance judgement (see `BALANCE.md`), and no human has played the cards yet.

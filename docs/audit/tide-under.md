# Audit: Tidewardens (tide) and Undervolt (under)

Scope: every card in `src/data/cards/tide.ts` (25) and `src/data/cards/under.ts` (26 incl. the Wire Rat token), both faces of each hero.
Method: read spec 10, types, rules.ts, query.ts, helpers, AUTHORING rule 1; traced each card; proved with a throwaway vitest file
(kept at `scratch/audit-tide-under.test.ts`, run with `--silent=false`; evidence lines below are its `AUDIT <id>` output, test ids A1..R1).
No file under src/, tests/ or docs/ (other than this report) was edited.

Totals: OK 28, WARN 22, FAIL 1.

## 1. Verdict table

Test column legend in notes: "test weak" = behaviour matches but the repo test would still pass if the clause were broken.

### Tide
| id | verdict | note |
|---|---|---|
| tide-maren | WARN | Behaviour OK (both faces). Test weak: ascended +1\|+1 trigger never asserted; on the 6th cast the already-queued unascended trigger (+1\|+0 round) fires, not the ascended one (M1). |
| tide-ilvane | WARN | Behaviour OK both faces (M2, M3). Test weak: the repo test pre-sets stasisApplied=3 so the Deploy and the Ascend freeze are indistinguishable; ascended-face Deploy untested. |
| tide-sluicepage | OK | |
| tide-ripplescribe | WARN | Test weak: never checks the buff ends ("this round"); passes if the buff were permanent. Engine OK (F2: 2 -> 1 next round). |
| tide-mirroreel | OK | Filter proven both ways by repo test. |
| tide-wardtender | OK | |
| tide-eddycourier | WARN | "an allied unit" silently excludes Eddy Courier itself (engine excludes the played unit); a token ally (Wire Rat) vanishes instead of going to hand (B3); test never checks self-exclusion. |
| tide-driftseer | OK | Test proves 1 vs 2 glyphs. |
| tide-lockkeeper | WARN | Recalling a Wire Rat deletes it (B1). Test weak: its only target has 1 power, so the "2 or less" number is unproven (Mirror Eel test is the only one that proves a power filter). |
| tide-hushwateradept | WARN | "weakest enemy" is chosen even if it is already in Stasis, so the trigger is wasted (D1: second cast froze nothing new, ogre untouched, stasisApplied stayed 1). Text matches data. |
| tide-glassarchivist | OK | |
| tide-stillwaterbailiff | OK | |
| tide-pearlsentinel | OK | |
| tide-deepwateroracle | OK | |
| tide-frostmeremagistrate | OK | Works with exactly one enemy (A2), unlike Sluice Close. |
| tide-gateleviathan | WARN | Enemy tokens (Wire Rats) vanish rather than return to hand (B1); hand overflow burns (B2). Neither is in the text or in spec 10. |
| tide-slipunder | WARN | Allied token vanishes (B1). Also if it recalls your only attacker mid-combat, combat ends and priority passes to the opponent, contradicting R-P3 "caster keeps priority" (C2). |
| tide-heldbreath | OK | Attacker removed (C1b), blocker stays blocked (repo test, C3 Pierce goes to Spire per R-B7). |
| tide-tidalveil | OK | |
| tide-quickcurrent | OK | |
| tide-unwrite | OK | Proven against a Ritual on the stack (L1). |
| tide-backwash | WARN | Enemy token vanishes (B1); full enemy hand burns the card (B2). |
| tide-sluiceclose | FAIL | See section 2. Uncastable with exactly one enemy unit; error text wrong. |
| tide-deepstudy | OK | Hand overflow burns per R-G7 (O1). |
| tide-floodtide | OK | |

### Under
| id | verdict | note |
|---|---|---|
| under-sable | WARN | Behaviour OK both faces (H1 +1\|+0 this round, expires; H2 no self-buff). Test weak: unascended "+1\|+0 this round" is untested anywhere in the repo. |
| under-vex | WARN | Drain on a unit heals the nominal amount even past the target's remaining health (N1, E1); "Drain" is not defined in spec 10 and the repo test (5+4+6) bakes the overkill heal in. |
| under-wirerat | OK | Token, empty text is fine. |
| under-fuserunner | OK | |
| under-leechtick | OK | |
| under-burnoutrunner | WARN | Test weak: only proves a 2-power unit cannot block; a 3-power blocker is never shown able to block (it can: G2). Unstable proven (G3). |
| under-ratwrangler | OK | Line-full loss is covered by R-U1. |
| under-pitaccountant | WARN | Test weak: "another" (no drain on its own death) is untested; engine is correct (P2). |
| under-acidlamplighter | OK | Ward blocker survives Corrosive (G1), consistent with R-K7. |
| under-furnacehand | WARN | "an allied unit" excludes Furnace Hand itself and a lone Furnace Hand destroys nothing (J1); text should say "another". Works on a full Line with replace (J1). |
| under-backalleyenforcer | WARN | Test weak: same as Burnout Runner (would pass if the unit were unblockable). |
| under-leechwiresurgeon | WARN | Drain overkill heal (E1) / undefined "Drain". |
| under-vaultpawnbroker | OK | Fires for enemy tokens too (P3). |
| under-powdercourier | OK | Shatter works with the unit gone (K2: ogre took 3 strike + 3 shatter = 6). |
| under-syndicatebroker | OK | |
| under-leechoverseer | OK | |
| under-mainlinedynamo | WARN | Drain overkill heal (E1) / undefined "Drain". |
| under-pullplug | OK | |
| under-siphontap | WARN | Drain overkill heal: draining 2 from a 1-health unit repairs the Spire 2 (E1). Ward gives 0 (E2), Plated gives 1 (E2), at 20 Integrity damage still lands (E3). |
| under-acidbath | WARN | Test weak: expiry ("this round") is never asserted; engine OK (F1: corrosive gone next round). |
| under-burnledger | OK | |
| under-snuffedfuse | WARN | The "3 or less power" check is only made at cast time; a target pumped past 3 in response is still destroyed (K1: power 4, destroyed anyway). Text reads as if the condition were on the destroy. |
| under-bleeddry | WARN | Drain overkill heal / undefined "Drain". Spire branch fine (E4). |
| under-chainoverload | WARN | Same: each enemy unit heals the full 3 even when it has less health. |
| under-wiremarket | OK | On a nearly full Line surplus rats are lost with a `lineFull` log (I2), per R-U1. |
| under-leechharvest | OK | Counts tokens (I1: one rat destroyed gave 4 total with Pull the Plug), 0 deaths drains 0. |

## 2. FAIL and WARN details

### FAIL: tide-sluiceclose
- Text: "Put two enemy units in Stasis." (Swift, 4).
- Actual: with exactly one enemy unit on the Line the card cannot be cast at all, with one target or none. `targetChoices` returns `[]` for a glyph when the second slot has no distinct legal target, and the refusal is "This card takes no target" (wrong message). `legalActions` contains 0 play actions for it (test A1: `one target -> false This card takes no target`, `no target -> false This card takes no target`, `legal play actions 0`). The unit twin Frostmere Magistrate with one enemy plays fine and freezes it (A2). With two targets where one dies in response the glyph resolves and freezes the other (A3, correct per R-G9).
- Fix (data/engine either): in `targetChoices`, for glyphs treat a slot with no remaining distinct target as "skip" (like units do), or change the text to "Needs two enemy units: put them in Stasis". The error string should also say "Needs two different targets".

### WARN: recall and tokens (Backwash, Slip Under, Eddy Courier, Lock-Keeper, Leviathan)
- Text: "Return ... to (its owner's) hand".
- Actual: a token (`under-wirerat`, any summoned token) is deleted: B1 `backwash rat: line [] hand [] scrap []`, same for Slip Under, Lock-Keeper, Leviathan. Hand at 10: the returned card is burned to Scrap (B2: `hand 10 scrap [tide-sluicepage]`). R-G7 covers the burn; nothing in spec 10 covers the token rule (only a comment in AUTHORING.md).
- Fix: add a one-line rule to spec 10 (R-U3-style: "a recalled token ceases to exist"), or add "(a token is removed)" to the card text. Under-faction decks run Wire Rats, so Tide+Under decks will hit it.

### WARN: tide-slipunder, priority (also an engine finding, section 4)
- C2: seat 0 attacks with its only unit, then casts Slip Under on it in the combat window: afterwards `phase main, prio 1`, caster lost priority.

### WARN: tide-hushwateradept
- Text: "When you cast a glyph, put the weakest enemy in Stasis." Data picks `weakestEnemy` with no `notStasis` option. D1: after the first cast freezes the 2-power grunt, the second cast targets the same grunt again (`grunt true ogre false applied 1`). Player is misled into thinking each cast freezes a new unit.
- Fix: text "the weakest enemy (even if it is already in Stasis)", or add a Stasis-aware selector (engine change, out of scope for data).

### WARN: tide-eddycourier, under-furnacehand ("an allied unit")
- Both exclude the card itself because a Deploy target cannot be the unit being played; text should say "another allied unit". Furnace Hand alone on the Line destroys nothing (J1 `line [under-furnacehand]`). Eddy Courier alone plays and does nothing (B3).

### WARN: drain on units (under-vex Ascend, leechwiresurgeon, mainlinedynamo, siphontap, bleeddry, chainoverload)
- Text: "Drain N from an enemy unit". `drain` heals by `damage()`'s return value, which is the nominal N (units accumulate damage beyond health), so draining 2 from a unit with 1 health repairs 2 (E1: spire 10 -> 12, grunt gone). Ward negates (0 heal), Plated reduces by 1 (E2: 10 -> 10, then 10 -> 11), full Spire heals 0 but the damage still lands (E3). The repo's under-vex test relies on the overkill heal (5+4+6). "Drain" has no entry in spec 10; only a code comment defines it.
- Fix: add a Drain entry to spec 10 ("deal N damage, repair your Spire by the damage dealt, counting damage beyond the target's health; Ward and Plated apply") or cap by remaining health in the engine (would break the Vex test).

### WARN: under-snuffedfuse
- K1: enemy Ripple Scribe (1 power) targeted; three Flash glyphs raise it to 4 power; after resolution `cards(s,1)` is `[]` (destroyed). Text "Destroy an enemy unit with 3 or less power" does not say the check is at cast only.
- Fix: text "Choose an enemy unit with 3 or less power. Destroy it." (same for any filter-on-target glyph).

### WARN: weak tests only (behaviour proven correct here)
tide-ripplescribe (F2), under-acidbath (F1), under-burnoutrunner and under-backalleyenforcer (G2: a 3-power blocker is allowed), under-pitaccountant (P2), tide-lockkeeper (filter number), under-sable unascended (H1), tide-maren ascended (M1), tide-ilvane Deploy isolation (M2, M3).

## 3. Weak tests (what each fails to prove)
- `tide-ripplescribe: casting a glyph gives +1|+0 this round`: passes if the buff were permanent or dur wrong; no round-end assertion.
- `tide-lockkeeper: Deploy returns a small enemy ...`: only target has 1 power; a filter of maxPower 5 or none would pass. No "too strong target refused" check.
- `tide-eddycourier: Deploy returns an allied unit to hand`: does not prove it cannot return itself or that the target must be allied.
- `tide-tidalveil: Flash gives an allied unit Ward`: does not prove the Ward is consumed or lasts (Ward-Tender test covers consumption for printed Ward only).
- `tide-gateleviathan`, `tide-backwash`, `tide-slipunder`: use real cards only; token vanish and hand-full burn untested.
- `tide-sluiceclose`: only the two-enemy case; one-enemy case (the FAIL) untested. Same for `tide-frostmeremagistrate` (one-enemy behaviour is OK but untested).
- `under-acidbath: Flash gives an ally Corrosive this round ...`: asserts corrosive during combat only; passes if the grant were permanent.
- `under-burnoutrunner: Dread dodges small blockers; Unstable dies at Dusk` and `under-backalleyenforcer: Dread cannot be blocked ...`: the only blockers present have 2 or 0 power, so they pass if the unit were simply unblockable.
- `under-pitaccountant: drains 1 when another ally is destroyed ...`: kills a different ally; passes if the card also drained on its own death ("another").
- `under-snuffedfuse`: does not test the post-cast power change (K1).
- heroes.test.ts `tide-ilvane: deploy Stasis stops an attacker; ascends at 4 ...`: stasisApplied preset to 3 so Deploy's own freeze of the grunt is hidden by the Ascend freeze of everything; ascended-face Deploy never tested.
- heroes.test.ts `tide-maren: glyphs pump her; ascended she makes glyphs cost 1 less and draws 2`: no assertion of the ascended "+1|+1 when you cast" clause.
- heroes.test.ts: no test of unascended `under-sable` "+1|+0 this round", no test of unascended `under-vex` Siphon on its own.
- `under-leechtick`, `under-leechoverseer`: fine, but no test that Siphon does not heal from a Ward-absorbed strike (E-class edge; engine is correct by trace).

## 4. Engine behaviour contradicting or missing from docs/spec/10-rules.md
1. **R-P3 (Flash caster keeps priority) vs C2**: a Flash glyph that removes the last attacker (recall or Stasis) calls `pruneCombat` -> `endCombat`, which sets `priority = defender` and phase main. When the caster is the attacker (Slip Under on own sole attacker) it loses priority. Evidence: C2 `after: phase main prio 1 line []`. When the caster is the defender (Held Breath on the lone attacker, C1b) the result `prio 1` coincidentally agrees. Rules.ts: `play` flash branch, `pruneCombat`/`endCombat`.
2. **Token recall is not specified**: recall deletes tokens (rules.ts `case 'recall'`: `if (def(u.card).token) continue`). Spec 10 is silent (B1).
3. **"Drain" is not specified** and heals the nominal amount, overkill included (E1, N1; rules.ts `case 'drain'` sums `damage()` returns, which are not capped by remaining health). R-K6's ruling mentions "the drain op" but never defines it.
4. **Destroy/ops ordering vs R-S2 "after every effect"**: runOps runs all ops of one ability or glyph before the state check, so a destroyed unit is still on the Line (flagged `doomed`) for the remaining ops of the same glyph (Pull the Plug, Burn the Ledger). No card in these factions is wrong because of it, but spec R-S2 reads as a check after each effect.
5. **R-S2 hero-trigger timing (minor)**: a glyph cast that causes an ascension has already queued the unascended face's `glyphCast` ability (M1: Maren's 6th cast gives +1|+0 round, not the ascended +1|+1). Not stated in the rules.
6. Confirmed correct against spec: R-B7/R-B8 Stasis in combat (C1b, C3), R-K5/R-K7 in the damage door (E2, G1), R-G7 burn on recall and draw (B2, O1), R-U1 summon onto a full Line lost (I2), Siphon strikes only (N1: Vex Ascend drain does not double-heal beyond the drain).

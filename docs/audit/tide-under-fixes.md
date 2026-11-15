# Fixes for the Tidewardens / Undervolt audit

Tests named below are in tests/cards/tide.test.ts (T) or tests/cards/under.test.ts (U), by card id.

- tide-sluiceclose FAIL: text "Put two enemy units in Stasis." -> "Put up to two enemy units in Stasis." (R-G10 engine change makes one target castable). Proof: T `tide-sluiceclose: castable with one enemy ... not with none` (also duplicate target refused) and `...gone on resolution`.
- tide-frostmeremagistrate: text "two" -> "up to two". Proof: T `tide-frostmeremagistrate: freezes one enemy when only one exists, plays with none, rejects a repeated target`.
- tide-eddycourier: "an allied unit" -> "another allied unit". Proof: T `tide-eddycourier: returns another allied unit only; alone it just plays; enemies are not legal targets`.
- under-furnacehand: "an allied unit" -> "another allied unit". Proof: U `under-furnacehand: destroys another allied unit only; alone it survives; ...`.
- tide-hushwateradept: text now adds "If it is already in Stasis, nothing happens." (behaviour kept, R-D8). Proof: T `tide-hushwateradept: a second cast ... does nothing and is not counted`.
- under-snuffedfuse: "Destroy an enemy unit with 3 or less power." -> "Choose an enemy unit with 3 or less power. Destroy it." Proof: U `under-snuffedfuse: a 3-power target is accepted, a 4-power refused; the power check is made only when cast`.
- Token recall (Backwash, Slip Under, Lock-Keeper, Leviathan, Eddy Courier): left, R-U4 covers it. Proof: T `tide-slipunder`, `tide-gateleviathan`, `tide-eddycourier`; hand-full burn: T `tide-backwash`.
- tide-slipunder priority (C2): left, settled ruling R-B8/R-P3. Proof of the ruling for the Flash-on-attacker case: T `tide-heldbreath: Stasis on an attacker removes it ...`.
- Drain overkill (vex, leechwiresurgeon, mainlinedynamo, siphontap, bleeddry, chainoverload): left, defined by R-D7. Exact totals now asserted: U `under-leechwiresurgeon`, `under-siphontap` (Ward 0, Plated 1, 1-health unit 2, full Spire), `under-mainlinedynamo`, `under-bleeddry`, `under-chainoverload`, `under-vex`.
- tide-maren (weak test): added ascended +1|+1 trigger, cost reduction, expiry of the unascended round buff, the 6th-cast behaviour, opponent casts ignored. Proof: T `tide-maren: unascended ...`, `tide-maren: ascended ...`.
- tide-ilvane (weak test): Deploy far from the threshold (counter 0, unascended and ascended face), Dawn, and Ascend counting. Proof: T three `tide-ilvane` tests.
- tide-ripplescribe: expiry at round end and opponent glyph ignored. Proof: T `tide-ripplescribe: +1|+0 per own cast stacks, ends at round end ...`.
- tide-lockkeeper: 2-power accepted, 3-power refused. Proof: T `tide-lockkeeper: a 2-power enemy is returned, a 3-power one is refused`.
- tide-mirroreel: 3-power refused, no legal target still plays. Proof: T `tide-mirroreel: a 2-power enemy ...`.
- tide-tidalveil: Ward persists past round end, is spent by the next damage, enemy not targetable. Proof: T `tide-tidalveil: the granted Ward lasts ...`.
- tide-driftseer: opponent glyphs not counted. Proof: T `tide-driftseer: opponent glyphs do not count ...`.
- tide-glassarchivist, tide-pearlsentinel, tide-deepstudy, tide-floodtide, tide-unwrite, tide-heldbreath, tide-backwash, tide-gateleviathan: exact draw/deck counts, Resonant absence, burn at the hand limit, negative targets. Proof: the matching `(strict)` tests in T.
- under-sable (weak test): unascended +1|+0 stacking, expiry, another-ally-only; ascended drain 1 and Ascend rats. Proof: U `under-sable` (2 tests).
- under-vex: unascended Siphon on strikes only; ascended Ascend/Dusk exact totals. Proof: U `under-vex: unascended Siphon ...`.
- under-burnoutrunner / under-backalleyenforcer / under-mainlinedynamo (Dread): 2-power blocker refused AND 3-power blocker accepted. Proof: the three U Dread tests.
- under-pitaccountant: own death does not drain. Proof: U `under-pitaccountant: drains 1 for another ally only ...`.
- under-acidbath: Corrosive gone after round end; enemy not targetable. Proof: U `under-acidbath: Corrosive lasts only this round ...`.
- under-leechtick (Ward-absorbed strike heals 0), under-acidlamplighter (Ward blocker survives), under-vaultpawnbroker, under-powdercourier, under-syndicatebroker, under-ratwrangler, under-pullplug, under-burnledger, under-wiremarket (lineFull), under-leechharvest (zero deaths, tokens): tightened in the `(strict)` U tests of the same name.
- Resonant clauses: pearl sentinel, lock-keeper, glass archivist, rat wrangler, pit accountant keep the existing Ascended-hero tests; the no-hero baseline is now asserted for glass archivist, pearl sentinel, pit accountant, rat wrangler.

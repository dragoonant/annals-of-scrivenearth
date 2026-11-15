# Ember hand-back

Collectible cards added: 14 units, 9 glyphs (23), plus the 2 existing heroes and 2 tokens. No new tokens. 23 tests in tests/cards/ember.test.ts, all green.

Units
- ember-cinderscamp, 1, 1|1: Deploy summons a Sparkbot (summon-count feeder for Crucible)
- ember-kilnhand, 1, 1|1: Shatter 1 to Spire
- ember-ashrunner, 1, 2|1: Vanguard
- ember-slagsmith, 2, 2|2: Deploy 1 to an enemy unit
- ember-sparkforge, 2, 1|3: summons a Sparkbot whenever you cast a glyph (Crucible and Kessa bridge)
- ember-fuseguard, 2, 2|1: Shatter 2 to a random enemy unit
- ember-furnacebrute, 3, 3|3: Vanguard, Resonant +1|+1
- ember-arcwelder, 3, 2|3: Deploy 2 to an enemy unit, Resonant 1 more (Kessa damage)
- ember-furnacetender, 3, 2|3: Deploy summons a Slagling
- ember-blastminer, 4, 3|3: Shatter 2 to every enemy unit
- ember-pyrelancer, 4, 3|3: Vanguard, Assault 1 to Spire
- ember-moltenwarden, 5, 4|4: Deploy 3 to an enemy unit
- ember-crucibleherald, 6, 3|5: Deploy summons 3 Slaglings (Crucible)
- ember-foundrytitan, 7, 6|7: Pierce, Deploy 2 to every enemy unit

Glyphs
- ember-overdrive, 1 Flash: ally +2|+0 this round
- ember-pinprick, 2 Flash: 1 to enemy unit or Spire
- ember-ventburst, 3 Flash: 2 to a unit and 1 to Spire
- ember-slagbolt, 2 Swift: 3 to an enemy unit
- ember-scrapburst, 2 Swift: destroy an ally (Shatter fodder), 3 to Spire
- ember-heatlance, 3 Swift: 3 to unit or Spire
- ember-cinderhail, 4 Swift: 2 to every enemy unit
- ember-sparkcascade, 3 Ritual: 2 Sparkbots, Resonant 2 more (Crucible)
- ember-firestorm, 6 Ritual: 3 to every enemy unit, 2 to Spire

Primitives wished for: a "may" choice on Shatter (e.g. sacrifice outlets without a glyph); damage scaling by number of Unstable allies; a way to target "an Unstable ally" with glyph filters is available but unused.

Suspect strong: ember-slagbolt (3 damage for 2 at Swift, hits any unit), ember-crucibleherald (9 power of Vanguard for 6), ember-foundrytitan (one-sided sweep plus Pierce), ember-scrapburst (a 2-cost glyph that is also a 3-damage Spire burn).
Suspect weak: ember-kilnhand, ember-cinderscamp (small bodies; rely on Kessa/Crucible synergy), ember-ashrunner (2|1 is fragile).

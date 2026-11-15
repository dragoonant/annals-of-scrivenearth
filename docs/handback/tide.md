# Tide hand-back

Count: 14 units, 9 glyphs (23 collectible cards), 0 tokens. All have a behaviour test in tests/cards/tide.test.ts.

Units
- tide-sluicepage, 1, 1|1: Deploy draw 1 (cantrip body)
- tide-ripplescribe, 1, 1|2: glyphCast +1|+0 this round (Maren support)
- tide-mirroreel, 1, 1|1: Deploy Stasis on an enemy with 2 or less power (Ilvane source 1)
- tide-wardtender, 2, 1|3: Ward body
- tide-eddycourier, 2, 2|2: Deploy recall an ally (re-buy deploys)
- tide-driftseer, 2, 1|2: Dusk draw 1 if 2+ glyphs cast this round
- tide-lockkeeper, 3, 2|4: Deploy recall small enemy; Resonant +1|+1
- tide-hushwateradept, 3, 2|3: glyphCast Stasis on weakest enemy (Ilvane source 2, Maren support)
- tide-glassarchivist, 3, 2|3: Deploy draw 1, Resonant draw 2
- tide-stillwaterbailiff, 4, 3|4: Deploy Stasis (Ilvane source 3)
- tide-pearlsentinel, 4, 2|5: Ward; Resonant +1|+1
- tide-deepwateroracle, 5, 3|5: Deploy draw 2
- tide-frostmeremagistrate, 6, 4|6: Deploy Stasis on two enemies (Ilvane source 4)
- tide-gateleviathan, 7, 5|7: Deploy recall every enemy unit (finisher / tempo reset)

Glyphs
- tide-slipunder, 1 Flash: recall an ally (save from removal)
- tide-heldbreath, 2 Flash: Stasis an enemy (Ilvane source 5)
- tide-tidalveil, 2 Flash: ally gains Ward
- tide-quickcurrent, 2 Swift: draw 1 (cheap Maren glyph)
- tide-unwrite, 3 Swift: negate enemy glyph
- tide-backwash, 3 Swift: recall an enemy unit
- tide-sluiceclose, 4 Swift: Stasis two enemies (Ilvane source 6)
- tide-deepstudy, 5 Ritual: draw 3
- tide-floodtide, 6 Ritual: Stasis every enemy, draw 1 (Ilvane source 7)

Ilvane sources: 7 Stasis cards besides Ilvane (Eel, Adept, Bailiff, Magistrate, Held Breath, Sluice Close, Flood Tide). Resonant cards: Lock-Keeper, Glass Archivist, Pearl Sentinel.

Engine primitives wished for
- A deploy with two targets does nothing when fewer than two legal targets exist (Magistrate, with a single enemy). An "up to N targets" spec would fix it.
- Recalled tokens vanish, so recall of a token is a removal; fine, but no way to say "non-token only".
- No "counter a unit/Deploy" or "draw then discard" op for card selection.

Balance suspicions
- Too strong: tide-gateleviathan (mass bounce at 7 also burns hands at 10 cards), tide-floodtide (6 Charge for a full turn of Stasis plus a card; counts 1 Stasis per unit for Ilvane), tide-hushwateradept (free Stasis on every glyph).
- Too weak: tide-wardtender (Ward on 1|3 is little text), tide-sluicepage (1|1 cantrip body), tide-backwash (tempo only, no card).

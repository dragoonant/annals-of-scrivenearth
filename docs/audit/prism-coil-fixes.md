# Prism + Coil audit: fixes

Wording choice (both factions, consistent): "weakest" / "strongest" are kept (the audit tool and the keyword table need them) and now carry
"(lowest power)" / "(highest power)" so nobody reads them as health. Tests: `tests/cards/prism.test.ts`, `tests/cards/coil.test.ts`.

- F1 coil-aruvi Heart of the Canopy, Pierce aura read pre-aura power: left, fixed in the ENGINE (R-S1). Proof: `coil-aruvi: ascends on the 3rd big summon...` (Crownmaw 3+2 aura = 5 power has Pierce; a 4-power ally has none).
- W1 prism-lampkeeper "weakest ally": "repair the weakest ally by 1" -> "repair the weakest ally (lowest power) by 1". Proof: `prism-lampkeeper: Spotter ...` (0-power wall healed, damaged ogre and enemy wall untouched).
- W1 coil-lashvine "weakest enemy": -> "the weakest enemy (lowest power)". Proof: `coil-lashvine: Assault strikes the enemy with the lowest power` (power-0 wall hit over a 1-health filler; tie goes to the leftmost).
- W2 coil-canopy-rampage target picked once: "...strikes the strongest enemy." -> "...strikes the strongest enemy (highest power), picked once when this resolves." Proofs: `coil-canopy-rampage: each ally with 4+ power ...` (4 counts, 3 does not, highest power not highest health, strike count) and `...picked once...` (second striker hits the same, dead, ogre).
- W3 coil-brakk Apex rally text: "you may attack again this round" -> "you get one extra attack: you may attack again this round, banked until used" (R-B1). Proof: `coil-brakk: ascending gives one more attack...` (ascend via Lash Out before attacking, then two attacks).
- E3 coil-brakk Apex Strike vs lethal damage: engine fixed (R-S2), no card change. Proof: `coil-brakk: ascended Strike +1|+1 cannot save a unit that took lethal damage`.
- Re-check of every strike/survive card under the new R-S2 order: prism-bracewright (lethal damage is not undone by its repair, `prism-bracewright: Dueler ...`), prism-oren both faces (no growth or 2 damage on lethal damage, `prism-oren: base Spotter ...`, `prism-oren: ascended survival ...`), coil-brakk (above). No card change needed.
- E1 Pierce vs Ward/Plated: left, now stated rule R-K2. Not asserted in these files (engine suite covers it).
- Two-target glyphs (coil-duel-of-thorns, coil-lash-out): "An ally and an enemy unit ..." -> "Choose up to two targets, an ally and an enemy unit. ..." (R-G10). Proofs: `coil-duel-of-thorns: castable with up to two targets...`, `coil-lash-out: castable with just the ally...`.
- prism-oren Ascended "strongest enemy": text -> "the strongest enemy (highest power)". Proof: `prism-oren: ascended survival gives +1|+0 and 2 damage ...` (enemy line grunt, ogre, wall: only the ogre is hit, the second survival hits it again; the previously untested clause).
- Weak tests, now strengthened (each fails if the mechanic is removed, mutation 25/25 per faction):
  - prism-ysolde: Plated, repairs herself, own Ward, aura skips herself, ascended Dusk repair exactly 1, enemy untouched (`prism-ysolde: base face ...`, `prism-ysolde: ascends on 6 ...`).
  - prism-oren: Spotter both faces, Plated, ascended Survive clause, third-survival Spire repair.
  - coil-brakk: base Pierce, no Mend on the base face, Mend/Strike growth on Apex, rally. coil-aruvi: Mend both faces, non-5-power summon gets nothing, enemy summon gets nothing.
  - prism-sentinel-lens, prism-lightwall-matron, prism-lampkeeper: Spotter blocks Aerial (behaviour, not keyword list). prism-spire-keeper, prism-tier-sovereign: Plated by damage taken.
  - "this round" expiry, played through a round end: prism-hold-the-line, prism-choir-of-facets (also R-S4 survivor and the Resonant repair, enemy untouched), prism-call-out (Dueler actually forces a block, then gone), coil-overgrowth, coil-bristle.
  - coil-behemoth Pierce and strike amount; coil-bloomcaller (two candidates over 40 seeds, never itself, exactly one +1); coil-canopy-rampage (above).
  - Resonant clauses: prism-tierguard, prism-chorus-warden, prism-choir-of-facets, coil-tuskhide, coil-hothouse-bloom (reserve and max both asserted).
  - Wrong-side checks added to every wide-effect card (enemy units, enemy Spire, enemy Charge unchanged); lasting effects (tier-rally, crystal-dawn, verdant-surge, spore-herald, lightwall-oath, grafting) are shown to persist through a round end.

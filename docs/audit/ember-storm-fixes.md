# Ember and storm audit: fixes

Tests are in tests/cards/ember.test.ts and tests/cards/storm.test.ts.

## Card behaviour / wording
- W1 ember-arcwelder: data changed to one hit, `if resonant then damage 3 else damage 2`; text "Resonant: deal 1 more." -> "Resonant: deal 3 instead." Proved by "ember-arcwelder: the Resonant hit is a single 3" (Plated takes 2, Ward absorbs the whole hit) and the 2/3 test.
- W2 storm-gustcaller: text "a random ally" -> "another random ally" (data unchanged). Proved by "storm-gustcaller: Dawn gives another random ally..." (alone: nobody; with two others: never itself, both others picked across seeds).
- W3 rally (storm-reroute, storm-jetstream, storm-jax): left as is; engine now banks an early rally (R-B1), so "attack again" is true. Proved by "storm-reroute: cast before attacking...", "storm-jetstream: Resonant also lets you attack again", "storm-jax: Ascend lets you attack again...".
- storm-railmarshal: condition and text re-checked, correct (count includes the current attack, cumulative). Proved by "storm-railmarshal: Assault rallies when 2 or fewer...".
- W4 storm-skyhook: left (token vanishing and full-hand burn are general rules per the coordinator); existing hand-return test kept.

## Weak tests
- storm-signalkite: now asserts phase 'combat', a refused block, and a ground-attacker contrast.
- storm-updraft: asserts Aerial (no block phase, block refused), +1 power, and fading.
- storm-crosswind: Stasis blocker refused while the other blocker is accepted; sole blocker in Stasis gives no block phase; mid-combat Stasis leaves no damage.
- storm-railglider, storm-thunderkite, storm-tickettaker: Vanguard proved with a blocker that would kill the attacker; Aerial proved by absence of a block phase.
- ember-foundrytitan: Pierce proved by 4 excess to the Spire; ember-furnacebrute: Vanguard proved (no damage taken) plus Resonant.
- storm-jetstream: negatives added (non-Resonant gives no rally before or after attacking); Resonant banks or restores the attack.
- storm-gustcaller, ember-fuseguard: multi-target, multi-seed; both targets picked, never self / exactly 2 damage.
- ember-sparkcascade: separate boards, exactly 2 and exactly 4 (room under the Line cap).
- ember-heatlance: unit branch and Spire branch each checked. ember-scrapburst: targeting an enemy is refused.
- storm-corvane: ascended Assault test added (+2|+0 and Vanguard on attackers only, fades, Vanguard strikes first); base Assault test added.
- Also added: storm-tailwind and storm-dispatcher fade checks (dispatcher also refuses an enemy target).

No engine primitive wishes.

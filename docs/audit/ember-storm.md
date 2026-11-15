# Audit: ember and storm

Read-only audit. Proof tests are in `scratch/audit-ember-storm.test.ts` (37 tests, all pass against the real engine; run with `--disableConsoleIntercept` to see the logged numbers).
Totals (53 entries incl. 3 tokens-as-rows and 4 hero rows): 40 OK, 0 FAIL, 13 WARN. Only 4 WARNs are about card behaviour or wording (W1 to W4); the rest are weak tests.

No card was found whose behaviour flatly contradicts its text in normal play. The findings are edge-case wording gaps (WARN) and tests that cannot fail (section 3).

## 1. Every card

### Ember
| id | verdict | note |
|---|---|---|
| ember-kessa (both faces) | OK | Deploy ping, glyphCast 2 to Spire, Ascend 2 to all enemies all match; hero test covers all three. Ascend only fires if a copy is on the Line (R-H5). |
| ember-crucible (both faces) | OK | Dawn Sparkbot / Slagling, allyDied 1 to Spire (not on its own death, D9), Ascend 2 Slaglings: match. Pierce only checked through `keywords` in the hero test. |
| ember-sparkbot (token) | OK | 1|1 Unstable. |
| ember-slagling (token) | OK | 3|1 Unstable Vanguard. |
| ember-cinderscamp | OK | Sparkbot is lost on a full Line (D4), per R-U1. |
| ember-kilnhand | OK | Shatter fires also when scrapped to replace (D13). |
| ember-ashrunner | OK | |
| ember-slagsmith | OK | No legal target: playable, nothing happens. |
| ember-sparkforge | OK | Fires at cast, before the glyph resolves, even if the glyph is negated (D10, D11). |
| ember-fuseguard | OK | No enemy: nothing, no throw (D12). Test uses one possible target so "random" is unproven. |
| ember-furnacebrute | OK | |
| ember-arcwelder | WARN | "Resonant: deal 1 more" is a second 1-damage hit; Plated/Ward treat the hits separately. See W1. |
| ember-furnacetender | OK | |
| ember-blastminer | OK | |
| ember-pyrelancer | OK | Assault fires even when blocked and killed (D14). |
| ember-moltenwarden | OK | |
| ember-crucibleherald | OK | |
| ember-foundrytitan | OK | Pierce into Plated blocker gives 2 to Spire as R-K2 reads (D5). Test only checks the keyword in data. |
| ember-overdrive | OK | |
| ember-pinprick | OK | |
| ember-ventburst | OK | Flash, cannot fizzle. |
| ember-slagbolt | OK | |
| ember-scrapburst | OK | If the ally is removed in response the whole glyph fizzles, so no Spire damage (D6): per R-G9, but unstated. |
| ember-heatlance | WARN | Test only targets the Spire; unit branch of "unit or Spire" unproven (weak test, section 3). |
| ember-cinderhail | OK | |
| ember-sparkcascade | WARN | Behaviour OK; test cannot tell "2 more" from "3 more" because of the Line cap (D7 shows 5 bots either way). Weak test. |
| ember-firestorm | OK | |

### Storm
| id | verdict | note |
|---|---|---|
| storm-jax (both faces) | WARN | "Ascend: you may attack again" is wasted if Jax ascends before the owner has attacked. See W3. |
| storm-corvane (both faces) | WARN | Ascended Assault (+2|+0 and Vanguard) has no test; passes when run (C1). Base face OK (C2). |
| storm-wingmate (token) | OK | |
| storm-signalkite | WARN | Card OK; its test passes with Aerial removed (B1). |
| storm-tickettaker | OK | Vanguard not tested. |
| storm-flagbearer | OK | "attacking allies" includes itself (test arithmetic shows it). |
| storm-railglider | WARN | Test cannot prove Vanguard (outcome identical without it). |
| storm-gustcaller | WARN | "a random ally" never picks itself. See W2. |
| storm-dispatcher | OK | Cannot target itself (not on Line when chosen); no ally: plays, nothing happens (D17). |
| storm-galecourier | OK | Blocked: no bonus (D15). |
| storm-sparkrider | OK | |
| storm-squadcaller | OK | |
| storm-railmarshal | OK | Count includes the current attack and is cumulative over rally attacks (D1). Wording "declared 2 or fewer" is correct under that reading. |
| storm-thunderkite | OK | Test only checks keywords in data. |
| storm-stormcaller | OK | Aerial applies before blocks (D2). |
| storm-cyclonebarge | OK | |
| storm-tempestliner | OK | |
| storm-tailwind | OK | Health buff expiry leaves 1 hp (D3). |
| storm-updraft | WARN | Card OK; test passes with Tailwind in its place (B2). |
| storm-crosswind | WARN | Card OK (B3b, E1, E2); the test's final assertion is vacuous (B3). |
| storm-galesurge | OK | |
| storm-reroute | WARN | Wasted if cast before the first attack. See W3. |
| storm-skyhook | WARN | Tokens vanish; full enemy hand burns the card. See W4. |
| storm-jetstream | WARN | Behaviour OK; test cannot prove the Resonant condition. Also rally caveat W3. |
| storm-airmail | OK | |
| storm-skyraid | OK | Only units on the Line at resolution get the buff (D18). |

## 2. WARN details

**W1 ember-arcwelder.** Text: "Deploy: deal 2 to an enemy unit. Resonant: deal 1 more." Data: two separate damage ops (2, then 1). Result: against a Plated target both hits are reduced, so Resonant adds nothing (non-resonant dmg 1, resonant dmg 1: test A2). Against a Warded target the first hit is eaten by Ward and the second gets through: non-resonant 0, resonant 1 (A3). A single "3 damage" would do 2 to Plated and 0 to Ward. Also no state check happens between the two ops (engine runs it after the whole ability), harmless here.
Smallest fix: data, `if resonant then damage 3 else damage 2` (use the `else` branch); text unchanged.

**W2 storm-gustcaller.** Text: "Dawn: a random ally gets +1|+0 this round." `randomAlly` is documented as "a random ally other than self". Alone, Gust Caller buffs nobody (A1). Smallest fix: text "another random ally".

**W3 rally is a flag, not an extra attack (storm-reroute, storm-jetstream Resonant, storm-jax Ascend).** `rally` only sets `canAttack = true` when it is false. Reroute cast before attacking, or Jax ascending before the first attack (e.g. from a Spire-damage glyph), gives no extra attack: after one attack the second declare is refused with "You have already attacked this round" (A4, A5). The word "again" implies it is used after attacking, but nothing says so, and Reroute can be cast at Swift speed at any time. Rally cast by a player who does not hold the Initiative lets them attack once (spec R-B1 allows this; text says "again").
Smallest fix: text "After you attack, you may attack again this round" is wrong for the non-attacker case, so either change text to "You may attack once more this round (cast it after attacking)" or make `rally` a counter in the engine. Prefer the text fix.

**W4 storm-skyhook.** Text: "Return an enemy unit to its owner's hand." A token (Sparkbot, Slagling, Wingmate) vanishes, nothing goes to hand (A7); with a full 10-card hand the card is burned into the Scrap (A8). Both are per engine/R-G7 but the text promises a return. Smallest fix: text "Return an enemy unit to its owner's hand (a token is removed)".

## 3. Weak tests (tests/cards/*.test.ts unless noted)

- `storm-signalkite: Aerial, so a plain blocker cannot stop it`: `attack()` with no block list never blocks, so it passes with Aerial removed (B1, silenced kite still gives 19). Fix: assert `s.phase === 'combat'` after `attack` (B1b) or try a block and expect refusal.
- `storm-updraft`: same flaw; passes with Tailwind instead (B2). Fix: B2b.
- `storm-crosswind`: final spire assertion (18) is identical without casting it (B3); only the `stasis` flag is checked. Fix: B3b or E1.
- `storm-railglider`: simultaneous strikes give the same numbers as Vanguard; only the keyword in data distinguishes. Use a blocker that dies to the first strike (as the ember-ashrunner test does).
- `storm-thunderkite`, `storm-tickettaker`, `ember-foundrytitan`, `ember-furnacebrute`: keyword checked in `stats`, not behaviour. Vanguard/Aerial/Pierce unproven in play.
- `storm-jetstream`: no negative case; the "already true" assertion in the first half proves nothing; the Resonant branch would pass if the condition were removed (A6 supplies the missing negative).
- `storm-gustcaller`: only one possible target, so excludes-self is unproven.
- `ember-fuseguard`: one possible target, "random" unproven.
- `ember-sparkcascade`: Line cap makes 3 more and 4 more indistinguishable (D7).
- `ember-heatlance`: unit branch untested. `ember-scrapburst`: does not check that only allies are legal targets.
- `tests/heroes.test.ts storm-corvane`: only the base Assault (fired before ascension) is checked; the ascended Assault is never exercised (C1 passes). Hero test for ember-crucible checks Pierce via `keywords` only.
- Not tested anywhere: Tailwind/Overdrive "this round" fading under damage (D3 passes), Skyhook edge cases, Reroute used before attacking.

## 4. Engine vs spec 10-rules.md

No contradictions that change an ember/storm card. Notes:
- R-S2 says the state check runs "after every effect"; the engine runs it after each whole ability or glyph, not between ops. Observable only with Ward (W1: the second op hits a unit that already has 0 health).
- R-B1 / rally: spec says rally "lets a player attack again"; engine implements a boolean, so an early rally is lost (W3). Spec silent on this.
- R-B8 matches: Stasis on a blocker leaves the attacker blocked and dealing no damage (E1: spire 20); a Pierce attacker then hits the Spire for full power (E2: spire 17).
- R-H5 / Ascend: confirmed that Ascend abilities do not fire if the hero is only in hand or deck, matching the spec; the ascending strike itself does not trigger the newly gained `spireHit` (Jax gets +1|+0 only from the next strike).

# Audit: prism + coil (Prismguard, Verdant Coil)

Read-only audit. Nothing under `src/`, `tests/` or `docs/spec` was edited. Evidence is in
`scratch/audit-prism-coil.test.ts` (gitignored), run with
`npx vitest run --config scratch/vitest.audit-prism-coil.config.ts` (42 tests, all pass). Output of every
probe is written to `scratch/audit-out.txt`. The default vitest include pattern (`tests/**`) skips `scratch/`,
hence the tiny scratch config. The existing suites (`tests/cards/prism.test.ts`, `tests/cards/coil.test.ts`,
`tests/heroes.test.ts`) pass: 61/61.

Scope notes:
- 25 collectible cards per faction (2 heroes, 14 units, 9 glyphs). **Neither faction file defines any token**
  (no `token: true`), so there are no token rows. Heroes are listed once per face.
- Face-level counts: 54 rows = **35 OK, 18 WARN, 1 FAIL**. (Prism 16 OK / 11 WARN / 0 FAIL; Coil 19 OK / 7 WARN / 1 FAIL.)
- The engine changed under me: commit `c6532c7` (10:19) changed `rally` (see W3). My first reading was the pre-fix
  engine; the evidence below says which is which. Everything else I traced is unchanged in HEAD.

## 1. Every card

| id | verdict | note |
|---|---|---|
| prism-ysolde (base) | WARN | Behaviour OK. Test (heroes.test) never proves Plated; "repair every ally" is only asserted on the ogre, so a bug that skipped herself would pass. Scratch shows she is repaired. |
| prism-ysolde (Aegis of the Tiers) | WARN | Behaviour OK (herself gets Ward on Ascend, aura skips herself, Dusk repair 1 incl. herself: scratch `ysolde ascended`). Test does not check her own Ward, Plated, or the ascended Dusk repair. |
| prism-oren (base) | OK | +1\|+0 on survive verified; Plated absorbing a 1-dmg ping gives no "survive" (scratch `plated absorb gives no survival`). |
| prism-oren (Unbroken) | WARN | Behaviour OK (scratch `oren ascended`: +1 power, 2 damage to strongest enemy, Plated). **The "deal 2 to the strongest enemy" clause is not tested anywhere**: heroes.test ascends on the 3rd survival, so the ascended Survive ability never runs. |
| prism-glasswarden | OK | |
| prism-lampkeeper | WARN | "repair the weakest ally" = lowest **power** (leftmost on ties, may be itself, may be undamaged). A damaged strong ally is ignored. See W1. |
| prism-facet-initiate | OK | No ally: plays, deploy does nothing (scratch). |
| prism-tierguard | OK | |
| prism-bracewright | OK | |
| prism-pane-mender | OK | |
| prism-crystal-bulwark | OK | |
| prism-chorus-warden | OK | Aura loss can kill a damaged ally, see E4 (spec silent, text accurate). |
| prism-sentinel-lens | WARN | Spotter never tested (scratch confirms the keyword blocks Aerial). |
| prism-aegis-colossus | OK | |
| prism-vault-captain | OK | |
| prism-spire-keeper | WARN | Plated never tested (data has it; scratch confirms the keyword). |
| prism-lightwall-matron | WARN | Spotter never tested. Aura loss kills damaged allies, E4. |
| prism-tier-sovereign | WARN | Plated never tested. Deploy onto a full Line works (scrapped unit gets no Ward; scratch). |
| prism-hold-the-line | WARN | "this round" never tested (scratch: Plated gone in round 2, behaviour OK). |
| prism-mirror-ward | OK | |
| prism-choir-of-facets | WARN | "this round" never tested (scratch: buff gone, damaged unit left at 1 hp per R-S4, behaviour OK). Resonant clause and non-Resonant control are well tested. |
| prism-patch-the-pane | OK | |
| prism-call-out | WARN | Test only checks the keyword list and health, not that Dueler forces a block, nor expiry. Scratch `call-out v2`: forced pair created; Dueler and +0\|+2 gone in round 2. Behaviour OK. |
| prism-lightwall-oath | OK | |
| prism-spire-mantle | OK | Heal capped at 20 (scratch). |
| prism-tier-rally | OK | |
| prism-crystal-dawn | OK | |
| coil-aruvi (base) | OK | Buff only to 5+ power (6\|6 ogre; 2-power grunt gets nothing). Test is combined with the ascend; adequate. |
| coil-aruvi (Heart of the Canopy) | **FAIL** | "Allies with 5+ power have Pierce" ignores power that comes from auras. See F1. |
| coil-brakk (base) | WARN | "Pierce" never tested on the base face (hero test uses an unblocked attack). Behaviour OK. |
| coil-brakk (Apex) | WARN | Strike +1\|+1 resolves before the state check and can save a lethally damaged Brakk (E3). Rally: see W3 (pre-fix wasted, now fixed). Test proves rally (post-fix engine) and the +1\|+1. |
| coil-sprout-tender | OK | Charge 11 > max 10, then Reserve cap 3 (scratch). |
| coil-thornback-cub | OK | |
| coil-rootling | OK | Raises max only; current Charge is not raised (scratch: 4 after paying 1). Text says exactly that. |
| coil-spearhorn | OK | |
| coil-vinewhip | OK | No enemy: plays, no strike. Warded target eats the strike (scratch). |
| coil-sap-engine | OK | |
| coil-crownmaw | OK | |
| coil-bloomcaller | WARN | Test has only one legal candidate, so it cannot tell "random" from "strongest/first". Behaviour OK (scratch, 40 seeds: 17/23 split, never itself). |
| coil-lashvine | WARN | "weakest enemy" = lowest power, leftmost on ties (scratch: hit the full-health left grunt, not the damaged right one). W1. |
| coil-tuskhide | OK | |
| coil-spore-herald | OK | |
| coil-canopy-titan | OK | |
| coil-behemoth | WARN | Pierce never tested (test is Deploy only). Deploy strike does not overflow to the Spire (scratch), consistent with R-K2 (blocker only) but a player may expect it. |
| coil-domewyrm | OK | See E1 for Pierce against Ward/Plated blockers. |
| coil-sap-surge | OK | |
| coil-bristle | OK | |
| coil-overgrowth | WARN | "this round" never tested (scratch: Pierce and +3\|+3 gone in round 2, behaviour OK). |
| coil-duel-of-thorns | OK | One target removed by a response: no strikes at all, no crash (R-G9 "missing skipped"). |
| coil-lash-out | OK | |
| coil-grafting | OK | |
| coil-canopy-rampage | WARN | The target is picked once; later strikers hit the already-dead unit. Test cannot prove "each" or the 4+ filter. W2. |
| coil-hothouse-bloom | OK | |
| coil-verdant-surge | OK | |

## 2. FAIL and WARN detail

### F1 (FAIL) coil-aruvi, Heart of the Canopy: "Allies with 5+ power have Pierce"
Data: `auras: [{ to: 'allies', filter: { minPower: 5 }, kw: ['pierce'] }]`. `auraHits` in `query.ts` evaluates the
filter with `matches(s, u, a.filter, true)` (`noAura`), i.e. power **before any aura**. An ally whose 5th power
point comes from an aura is displayed as 5+ power but gets no Pierce. Power from lasting and round buffs does count.
Evidence (scratch, all pass, i.e. confirmed):
- `aruvi ascended: Pierce aura reads power BEFORE auras`: Crownmaw (3 base +2 aura with 2 other allies) shows
  `{"power":5,"keywords":[]}`; no Pierce.
- `aruvi ascended: Vault Captain...`: a unit showing 5 power through Vault Captain's +1 has `keywords: []`; a unit
  at 5 via a round buff has `["plated","pierce"]`.
- Inconsistent inside the same hero: the base face counts auras (`aruvi base + Crownmaw`: Crownmaw summoned with
  aura power 5 becomes 6\|4, `bigSummoned` 1), the ascended face does not.
- Realistic in the owner's own cards: Crownmaw is a Coil card; Vault Captain / Lightwall Matron (+1 power / +1\|+1)
  are legal in a prism+coil deck.
Smallest fix: text, "Allies with 5+ base power (before auras) have Pierce"; or engine, evaluate aura power filters
against stats that include auras from other sources (two-pass, no self-recursion). The engine fix matches what the
card shows.

### W1 (WARN) "weakest" means lowest power: prism-lampkeeper, coil-lashvine
- `prism-lampkeeper` ("Dusk: repair the weakest ally by 1"): scratch `lampkeeper: "weakest" = lowest POWER` with
  `[lamp 1|2, ogre 5|5 dmg 3]` leaves the ogre at dmg 3; the repair goes to the undamaged Lamp-Keeper itself.
  A player reads "weakest" as "most hurt" or "lowest health".
- `coil-lashvine` ("Assault: I strike the weakest enemy"): scratch `lashvine: weakest enemy = lowest POWER leftmost`:
  of two 2-power grunts (one damaged) it killed the left, full-health one.
Fix: text "the lowest-power ally" / "the enemy with the lowest power". (Or change Lamp-Keeper's data to a damaged
filter.) AUTHORING rule 1 does not define "weakest".

### W2 (WARN) coil-canopy-rampage: "Each ally with 4+ power strikes the strongest enemy."
`runOp('strike')` resolves `to` once, then loops the strikers. Scratch `canopy-rampage: target chosen ONCE`: two
Tuskhides vs `[ogre 5|5, grunt]` log `strikes ["coil-tuskhide->zz-ogre","coil-tuskhide->zz-ogre"]`; the ogre dies to
the first, the second strike is wasted on the corpse, the grunt is untouched. Same with Ward on the target (first
striker eats the Ward). The text can be read as "re-pick each time". Fix: text "...strikes the strongest enemy
(chosen when cast)". The test would also pass if the 4+ filter or "each" were removed (extra strikes on a dead unit
are invisible); add two 4+ allies plus a 2-power ally and count `strike` log entries.

### W3 (WARN) coil-brakk, Apex: rally and Strike timing
- Rally: **when I first read the engine**, `rally` was `if (!p.canAttack) ...`, so if Brakk ascended before its
  owner had attacked (Lash Out; scratch `brakk: ascending BEFORE attacking`, log `...ascend,pass`, no `rally`),
  "you may attack again this round" did nothing. Commit `c6532c7` (`extraAttacks`) fixed this; the scratch test now
  asserts `canAttack` is true after the attack. Residual: if Brakk ascends as a **blocker** in the opponent's round,
  its owner gains an attack in that round (scratch `brakk blocks a weak attacker`: `seat1 canAttack true`), which
  the word "again" does not suggest. R-B1 allows it.
- Strike before state check: E3.

### Weak-test-only WARNs
See section 3.

## 3. Weak tests (name: what it fails to prove)

- `heroes: prism-ysolde ...`: Plated (both faces); that she repairs herself; the ascended Dusk repair; her own Ward.
- `heroes: prism-oren ...`: the ascended Survive clause "deal 2 to the strongest enemy" (never executed);
  Spotter (both faces).
- `heroes: coil-brakk ...`: base-face Pierce; Mend on the Apex face. `coil-aruvi`: Mend on both faces; that a
  non-5-power summon gets nothing.
- `prism-sentinel-lens`, `prism-lightwall-matron`: Spotter. `prism-spire-keeper`, `prism-tier-sovereign`: Plated.
- `prism-hold-the-line`, `prism-choir-of-facets`, `prism-call-out`, `coil-overgrowth`: "this round" (no round
  rollover); `prism-call-out` also never uses the granted Dueler.
- `coil-behemoth`: Pierce.
- `coil-bloomcaller`: single candidate; cannot show random vs fixed pick.
- `coil-canopy-rampage`: only one 4+ ally, so "each" and the 4+ filter are untested.
- `prism-lampkeeper`, `coil-lashvine`: pass only because the competing candidate is a 0-power wall; they do not
  exercise the "weakest = lowest power" ambiguity.
- Keyword checks via `toContain('spotter')` / `toContain('dueler')` on `st()` (`prism-lampkeeper`,
  `prism-bracewright`, `prism-call-out`) prove the data, not the behaviour (acceptable, but weak).

## 4. Engine behaviour vs docs/spec/10-rules.md

- **E1 Pierce vs Ward/Plated (R-K2, R-K5, R-K7).** R-K2: "Strike damage beyond the blocker's remaining health hits the
  enemy Spire." `resolveCombat.hitBlocker` computes `eff = blk.ward ? 0 : power - (plated ? 1 : 0)` and
  `excess = eff - hp`. Scratch: 8-power Domewyrm into a Ward 2\|2 blocker: Spire 20 (literal R-K2: 6 through); into
  Plated 1\|3: Spire 16, i.e. 4 (literal: 5). A Pierce deck facing Prism's Ward cards gets no overflow at all.
  Decide: change the spec ("after Ward/Plated") or the engine.
- **E2 Ward consumed by damage Plated would absorb (R-K5/R-K7).** `damage()` checks `u.ward` before Plated. Scratch
  `Ward is consumed by 1 damage...`: a 1-dmg zap on a Plated+Ward unit logs `ward`, ward gone, dmg 0. R-K7 says
  "the next damage it would take"; a 1-dmg hit on Plated would take none. Matters for Ysolde (Plated + Ascend Ward)
  and Tier Sovereign + Spire Mantle.
- **E3 Strike triggers resolve before the state check (R-S2 "After every effect").** `settle()` runs the queue before
  `stateCheck`. Scratch `brakk ascended: own Strike trigger resolves BEFORE the lethal state check`: Apex Brakk 8\|8
  blocks an 8-power attacker, takes 8, its queued Strike buff makes it 9\|9 and it survives at 1 hp (the attacker
  dies to Brakk's 8). Control (`lethal damage exactly = health ... kills normally`): a Bolt that kills Brakk outright
  does kill it. Fix: state this in R-S2/R-S3, or run the state check before Strike triggers.
- **E4 Aura loss can destroy units (R-S1/R-S4 silent).** R-S4 only protects against this-round buffs ending and
  silence. Scratch `ENGINE aura loss`: Lightwall Matron destroyed -> an ally with dmg 2 on base health 2 is destroyed
  in the same check (log `dmg,die,die`). Fine as design, but add a spec line.
- **E5 Aura filters ignore aura power (R-S1).** See F1; R-S1 does not say a power filter excludes auras.
- **E6 Rally (R-B1).** Pre-fix `rally` was a no-op when `canAttack` was already true. Fixed by `c6532c7`, which also
  edited the spec; not re-audited beyond the Brakk scratch tests.
- Checked and consistent with the spec: R-G9 partial fizzle (`duel-of-thorns` with one target gone: no strikes, no
  error); R-U1 full-Line scrap for a Deploy card; R-H5 full repair on ascend; R-H4 all copies; R-K11 Mend heals
  before Dawn triggers; R-S4 on round-buff expiry; Reserve cap 3 and Charge above max via Sap Surge/Sprout Tender.

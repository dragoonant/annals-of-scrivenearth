# Under hand-back

Count: 14 units, 9 glyphs (23 collectible cards), 0 new tokens (uses under-wirerat). All have a behaviour test in tests/cards/under.test.ts.

Units
- under-fuserunner, 1, 1|1: Shatter drain 1 from enemy Spire
- under-leechtick, 1, 1|1: Siphon (Vex fuel)
- under-burnoutrunner, 1, 2|1: Dread, Unstable (dies at Dusk: Sable fuel)
- under-ratwrangler, 2, 1|2: Deploy summon Wire Rat; Resonant 2 Rats
- under-pitaccountant, 2, 1|3: allyDied drain 1; Resonant +1|+1
- under-acidlamplighter, 2, 1|2: Corrosive
- under-furnacehand, 3, 4|4: Deploy destroy an ally (sacrifice cost)
- under-backalleyenforcer, 3, 3|2: Dread
- under-leechwiresurgeon, 3, 2|3: Deploy drain 2 from an enemy unit
- under-vaultpawnbroker, 4, 3|4: enemyDied drain 1
- under-powdercourier, 4, 3|3: Shatter 3 damage to strongest enemy
- under-syndicatebroker, 5, 3|5: Deploy summon 2 Wire Rats (Wire Market Broker)
- under-leechoverseer, 6, 4|6: Siphon, Corrosive
- under-mainlinedynamo, 7, 5|6: Dread; Deploy drain 2 from every enemy unit

Glyphs
- under-pullplug, 1 Flash: destroy an ally, drain 2 from enemy Spire (sacrifice outlet)
- under-siphontap, 2 Flash: drain 2 from an enemy unit
- under-acidbath, 2 Flash: ally gains Corrosive this round
- under-burnledger, 2 Swift: destroy an ally, draw 2
- under-snuffedfuse, 3 Swift: destroy enemy with 3 or less power
- under-bleeddry, 4 Swift: drain 4 from enemy unit or Spire
- under-chainoverload, 6 Swift: drain 3 from every enemy unit
- under-wiremarket, 3 Ritual: summon 3 Wire Rats
- under-leechharvest, 4 Ritual: drain 2 per ally destroyed this round

Sable fuel: Burnout Runner, Rat Wrangler, Wire Market, Syndicate Broker, Furnace Hand, Pull the Plug, Burn the Ledger, Fuse-Runner. Vex fuel: every drain card plus Leech Tick and Overseer (Siphon). Resonant cards: Rat Wrangler, Pit Accountant.

Engine primitives wished for
- A way to condition a Deploy on its target having actually been destroyed (Furnace Hand pays only in stats, not in a reward).
- An "up to N units" target spec; a sacrifice-as-cost (destroy then pay off only if it happened).
- Siphon on non-strike damage was ruled out, so Vex-style healing relies on the drain op.

Balance suspicions
- Too strong: under-chainoverload (3 to every enemy plus up to 3x heal, a one-card board wipe), under-mainlinedynamo (7-cost Dread with a mass drain), under-pullplug (1 Charge Flash: removal-proofing plus 2 drain, and it feeds both heroes).
- Too weak: under-acidlamplighter (1|2 Corrosive is easily blocked by a 1-power unit), under-burnoutrunner (2 damage and gone), under-wiremarket (3 bodies are 1|1s).

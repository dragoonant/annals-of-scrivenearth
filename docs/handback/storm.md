# Storm hand-back

Collectible cards added: 14 units, 9 glyphs (23), plus the 2 existing heroes and the existing Wingmate token. No new tokens. 23 tests in tests/cards/storm.test.ts, all green.

Units
- storm-signalkite, 1, 1|1: Aerial
- storm-tickettaker, 1, 1|1: Vanguard, Spire strike draws a card
- storm-flagbearer, 1, 1|1: Assault, attackers +1|+0 this round (Corvane wide boards)
- storm-railglider, 2, 2|1: Aerial, Vanguard
- storm-gustcaller, 2, 1|2: Dawn, random ally +1|+0 this round
- storm-dispatcher, 2, 1|2: Deploy, ally +2|+0 and Aerial this round
- storm-galecourier, 3, 3|2: Aerial, Spire strike adds 1 Spire damage (Jax)
- storm-sparkrider, 3, 3|2: Vanguard, Assault +1|+0 on itself
- storm-squadcaller, 3, 1|2: Deploy summons a Wingmate (Corvane)
- storm-railmarshal, 4, 3|3: Assault rallies if 2 or fewer attackers declared this round
- storm-thunderkite, 4, 4|3: Aerial, Vanguard
- storm-stormcaller, 5, 4|5: Assault, attackers +1|+0 and Aerial
- storm-cyclonebarge, 6, 5|5: Aerial, Dawn Wingmate, Resonant +1|+1
- storm-tempestliner, 7, 6|6: Aerial, Vanguard, Spire strike adds 2 Spire damage (Jax finisher)

Glyphs
- storm-tailwind, 1 Flash: ally +1|+1 this round
- storm-updraft, 2 Flash: ally +1|+0 and Aerial this round
- storm-crosswind, 3 Flash: enemy unit gets Stasis
- storm-galesurge, 3 Swift: allies +2|+0 this round
- storm-reroute, 3 Swift: rally
- storm-skyhook, 3 Swift: return an enemy unit to hand (tokens vanish)
- storm-jetstream, 4 Swift: allies Aerial this round, Resonant rally
- storm-airmail, 3 Ritual: draw 2
- storm-skyraid, 5 Ritual: allies +2|+0 and Vanguard this round, draw 1

Primitives wished for: a rally that fires only once per round (the Marshal needs a seenRound condition workaround); a "declared attackers this combat" condition (count of attackers is not allowed in conditions); rally is wasted if cast before attacking (canAttack already true), so rally glyphs are Swift/Flash only.

Suspect strong: storm-stormcaller (Aerial for the whole attack at 5), storm-tempestliner (8 Spire damage per hit), storm-crosswind (Flash Stasis removes a blocker mid-combat), storm-reroute plus wide boards.
Suspect weak: storm-skyhook (3 Swift tempo, nothing on board), storm-signalkite, storm-railmarshal (the "2 or fewer attackers" rider conflicts with wide attacks).

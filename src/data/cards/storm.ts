// Stormrail: the sky couriers. Aerial, Vanguard, extra attacks, fast pressure.
import type { CardDef } from '../../engine/types';

export const storm: CardDef[] = [
  {
    id: 'storm-jax', name: 'Jax Windlash', faction: 'storm', type: 'hero', cost: 2, power: 3, health: 2,
    keywords: ['vanguard'], tribe: 'courier',
    text: 'Vanguard.',
    level: { who: 'you', stat: 'spireDamage', n: 8, text: "You've dealt 8+ damage to the enemy Spire" },
    ascended: {
      name: 'Jax, Thunderhead', power: 4, health: 3, keywords: ['vanguard', 'aerial'],
      text: 'Vanguard, Aerial. When I strike the enemy Spire, I get +1|+0. Ascend: you may attack again this round.',
      abilities: [
        { on: 'spireHit', ops: [{ op: 'buff', to: 'self', power: 1 }] },
        { on: 'ascend', ops: [{ op: 'rally' }] },
      ],
    },
  },
  {
    id: 'storm-corvane', name: 'Admiral Corvane', faction: 'storm', type: 'hero', cost: 6, power: 4, health: 5,
    keywords: ['aerial'], tribe: 'courier',
    text: 'Aerial. Assault: attacking allies get +1|+0 this round.',
    abilities: [{ on: 'assault', ops: [{ op: 'buff', to: 'attackers', power: 1, dur: 'round' }] }],
    level: { who: 'you', stat: 'attackersDeclared', n: 10, text: "You've declared 10+ attackers" },
    ascended: {
      name: 'Corvane, Lord of the Gale', power: 5, health: 6, keywords: ['aerial'],
      text: 'Aerial. Assault: attacking allies get +2|+0 and Vanguard this round. Ascend: summon 2 Wingmates.',
      abilities: [
        { on: 'assault', ops: [{ op: 'buff', to: 'attackers', power: 2, dur: 'round' }, { op: 'grant', to: 'attackers', kw: ['vanguard'], dur: 'round' }] },
        { on: 'ascend', ops: [{ op: 'summon', card: 'storm-wingmate', n: 2 }] },
      ],
    },
  },
  {
    id: 'storm-wingmate', name: 'Wingmate', faction: 'storm', type: 'unit', cost: 2, power: 2, health: 2, token: true,
    keywords: ['aerial'], tribe: 'courier', text: 'Aerial.',
  },

  // ---------- collectible units ----------
  {
    id: 'storm-signalkite', name: 'Signal Kite', faction: 'storm', type: 'unit', cost: 1, power: 1, health: 1, tribe: 'kite',
    keywords: ['aerial'], text: 'Aerial.',
  },
  {
    id: 'storm-tickettaker', name: 'Ticket Taker', faction: 'storm', type: 'unit', cost: 1, power: 1, health: 1, tribe: 'courier',
    keywords: ['vanguard'], text: 'Vanguard. When I strike the enemy Spire, draw a card.',
    abilities: [{ on: 'spireHit', ops: [{ op: 'draw', n: 1 }] }],
  },
  {
    id: 'storm-flagbearer', name: 'Flag Bearer', faction: 'storm', type: 'unit', cost: 1, power: 1, health: 1, tribe: 'courier',
    text: 'Assault: attacking allies get +1|+0 this round.',
    abilities: [{ on: 'assault', ops: [{ op: 'buff', to: 'attackers', power: 1, dur: 'round' }] }],
  },
  {
    id: 'storm-railglider', name: 'Rail Glider', faction: 'storm', type: 'unit', cost: 2, power: 2, health: 1, tribe: 'courier',
    keywords: ['aerial', 'vanguard'], text: 'Aerial, Vanguard.',
  },
  {
    id: 'storm-gustcaller', name: 'Gust Caller', faction: 'storm', type: 'unit', cost: 2, power: 1, health: 2, tribe: 'courier',
    text: 'Dawn: another random ally gets +1|+0 this round.',
    abilities: [{ on: 'dawn', ops: [{ op: 'buff', to: 'randomAlly', power: 1, dur: 'round' }] }],
  },
  {
    id: 'storm-dispatcher', name: 'Rail Dispatcher', faction: 'storm', type: 'unit', cost: 2, power: 1, health: 2, tribe: 'courier',
    text: 'Deploy: an ally gets +2|+0 and Aerial this round.',
    abilities: [{
      on: 'deploy', targets: [{ what: 'unit', side: 'ally' }],
      ops: [{ op: 'buff', to: 'target0', power: 2, dur: 'round' }, { op: 'grant', to: 'target0', kw: ['aerial'], dur: 'round' }],
    }],
  },
  {
    id: 'storm-galecourier', name: 'Gale Courier', faction: 'storm', type: 'unit', cost: 3, power: 3, health: 2, tribe: 'courier',
    keywords: ['aerial'], text: 'Aerial. When I strike the enemy Spire, deal 1 to the enemy Spire.',
    abilities: [{ on: 'spireHit', ops: [{ op: 'damage', to: 'enemySpire', n: 1 }] }],
  },
  {
    id: 'storm-sparkrider', name: 'Spark Rider', faction: 'storm', type: 'unit', cost: 3, power: 3, health: 2, tribe: 'courier',
    keywords: ['vanguard'], text: 'Vanguard. Assault: I get +1|+0 this round.',
    abilities: [{ on: 'assault', ops: [{ op: 'buff', to: 'self', power: 1, dur: 'round' }] }],
  },
  {
    id: 'storm-squadcaller', name: 'Squad Caller', faction: 'storm', type: 'unit', cost: 3, power: 1, health: 2, tribe: 'courier',
    text: 'Deploy: summon a Wingmate.',
    abilities: [{ on: 'deploy', ops: [{ op: 'summon', card: 'storm-wingmate' }] }],
  },
  {
    id: 'storm-railmarshal', name: 'Rail Marshal', faction: 'storm', type: 'unit', cost: 4, power: 3, health: 3, tribe: 'courier',
    text: 'Assault: if you have declared 2 or fewer attackers this round, you may attack again.',
    abilities: [{ on: 'assault', cond: { c: 'not', x: { c: 'seenRound', stat: 'attackersDeclared', gte: 3 } }, ops: [{ op: 'rally' }] }],
  },
  {
    id: 'storm-thunderkite', name: 'Thunder Kite', faction: 'storm', type: 'unit', cost: 4, power: 4, health: 3, tribe: 'kite',
    keywords: ['aerial', 'vanguard'], text: 'Aerial, Vanguard.',
  },
  {
    id: 'storm-stormcaller', name: 'Storm Caller', faction: 'storm', type: 'unit', cost: 5, power: 4, health: 5, tribe: 'courier',
    text: 'Assault: attacking allies get +1|+0 and Aerial this round.',
    abilities: [{ on: 'assault', ops: [{ op: 'buff', to: 'attackers', power: 1, dur: 'round' }, { op: 'grant', to: 'attackers', kw: ['aerial'], dur: 'round' }] }],
  },
  {
    id: 'storm-cyclonebarge', name: 'Cyclone Barge', faction: 'storm', type: 'unit', cost: 6, power: 5, health: 5, tribe: 'courier',
    keywords: ['aerial'], text: 'Aerial. Dawn: summon a Wingmate. Resonant: I have +1|+1.',
    abilities: [{ on: 'dawn', ops: [{ op: 'summon', card: 'storm-wingmate' }] }],
    auras: [{ to: 'self', power: 1, health: 1, cond: { c: 'resonant' } }],
  },
  {
    id: 'storm-tempestliner', name: 'Tempest Liner', faction: 'storm', type: 'unit', cost: 7, power: 6, health: 6, tribe: 'courier',
    keywords: ['aerial', 'vanguard'], text: 'Aerial, Vanguard. When I strike the enemy Spire, deal 2 to the enemy Spire.',
    abilities: [{ on: 'spireHit', ops: [{ op: 'damage', to: 'enemySpire', n: 2 }] }],
  },
  // ---------- collectible glyphs ----------
  {
    id: 'storm-tailwind', name: 'Tailwind', faction: 'storm', type: 'glyph', cost: 1, speed: 'flash',
    text: 'An ally gets +1|+1 this round.',
    targets: [{ what: 'unit', side: 'ally' }], ops: [{ op: 'buff', to: 'target0', power: 1, health: 1, dur: 'round' }],
  },
  {
    id: 'storm-updraft', name: 'Updraft', faction: 'storm', type: 'glyph', cost: 2, speed: 'flash',
    text: 'An ally gets +1|+0 and Aerial this round.',
    targets: [{ what: 'unit', side: 'ally' }], ops: [{ op: 'buff', to: 'target0', power: 1, dur: 'round' }, { op: 'grant', to: 'target0', kw: ['aerial'], dur: 'round' }],
  },
  {
    id: 'storm-crosswind', name: 'Crosswind', faction: 'storm', type: 'glyph', cost: 3, speed: 'flash',
    text: 'Put an enemy unit in Stasis.',
    targets: [{ what: 'unit', side: 'enemy' }], ops: [{ op: 'stasis', to: 'target0' }],
  },
  {
    id: 'storm-galesurge', name: 'Gale Surge', faction: 'storm', type: 'glyph', cost: 3, speed: 'swift',
    text: 'Allies get +2|+0 this round.',
    ops: [{ op: 'buff', to: 'allies', power: 2, dur: 'round' }],
  },
  {
    id: 'storm-reroute', name: 'Reroute', faction: 'storm', type: 'glyph', cost: 3, speed: 'swift',
    text: 'You may attack again this round.',
    ops: [{ op: 'rally' }],
  },
  {
    id: 'storm-skyhook', name: 'Skyhook', faction: 'storm', type: 'glyph', cost: 3, speed: 'swift',
    text: 'Return an enemy unit to its owner\'s hand.',
    targets: [{ what: 'unit', side: 'enemy' }], ops: [{ op: 'recall', to: 'target0' }],
  },
  {
    id: 'storm-jetstream', name: 'Jetstream', faction: 'storm', type: 'glyph', cost: 4, speed: 'swift',
    text: 'Allies gain Aerial this round. Resonant: you may attack again this round.',
    ops: [{ op: 'grant', to: 'allies', kw: ['aerial'], dur: 'round' }, { op: 'if', cond: { c: 'resonant' }, then: [{ op: 'rally' }] }],
  },
  {
    id: 'storm-airmail', name: 'Airmail', faction: 'storm', type: 'glyph', cost: 3, speed: 'ritual',
    text: 'Draw 2 cards.',
    ops: [{ op: 'draw', n: 2 }],
  },
  {
    id: 'storm-skyraid', name: 'Sky Raid', faction: 'storm', type: 'glyph', cost: 5, speed: 'ritual',
    text: 'Allies get +2|+0 and Vanguard this round. Draw a card.',
    ops: [{ op: 'buff', to: 'allies', power: 2, dur: 'round' }, { op: 'grant', to: 'allies', kw: ['vanguard'], dur: 'round' }, { op: 'draw', n: 1 }],
  },

  // ---------- First Light additions (docs/SETS.md): wingleader and rail-runner ----------
  {
    id: 'storm-odile', name: 'Wing-Captain Odile Varro', faction: 'storm', type: 'hero', cost: 3, power: 2, health: 3,
    keywords: ['aerial'], tribe: 'courier',
    text: 'Aerial. Dawn: other Aerial allies get +1|+0 this round.',
    abilities: [{ on: 'dawn', ops: [{ op: 'buff', to: { from: 'otherAllies', filter: { kw: 'aerial' } }, power: 1, dur: 'round' }] }],
    level: { who: 'you', stat: 'buffsGiven', n: 16, text: "You've buffed allies 16+ times" },
    ascended: {
      name: 'Odile, Crown of the Squadron', power: 3, health: 5, keywords: ['aerial'],
      text: 'Aerial. Dawn: other Aerial allies get +1|+1 this round. Ascend: Aerial allies get +2|+2.',
      abilities: [
        { on: 'dawn', ops: [{ op: 'buff', to: { from: 'otherAllies', filter: { kw: 'aerial' } }, power: 1, health: 1, dur: 'round' }] },
        { on: 'ascend', ops: [{ op: 'buff', to: { from: 'allies', filter: { kw: 'aerial' } }, power: 2, health: 2 }] },
      ],
    },
  },
  {
    id: 'storm-ness', name: 'Ness Harrow, Rail-Runner', faction: 'storm', type: 'hero', cost: 4, power: 3, health: 4,
    keywords: ['vanguard'], tribe: 'courier',
    text: 'Vanguard. Assault: if you have declared 3 or more attackers this round, attacking allies get +1|+0 this round.',
    abilities: [{ on: 'assault', cond: { c: 'seenRound', stat: 'attackersDeclared', gte: 3 }, ops: [{ op: 'buff', to: 'attackers', power: 1, dur: 'round' }] }],
    level: { who: 'you', stat: 'attackersDeclared', n: 16, text: "You've declared 16+ attackers" },
    ascended: {
      name: 'Ness, the Endless Line', power: 4, health: 5, keywords: ['vanguard'],
      text: 'Vanguard. Assault: if you have declared 3 or more attackers this round, attacking allies get +2|+0 this round. Ascend: attacking allies get +1|+0 this round, and you may attack again this round.',
      abilities: [
        { on: 'assault', cond: { c: 'seenRound', stat: 'attackersDeclared', gte: 3 }, ops: [{ op: 'buff', to: 'attackers', power: 2, dur: 'round' }] },
        { on: 'ascend', ops: [{ op: 'buff', to: 'attackers', power: 1, dur: 'round' }, { op: 'rally' }] },
      ],
    },
  },
  // units
  {
    id: 'storm-ribbonkite', name: 'Ribbon Kite', faction: 'storm', type: 'unit', cost: 1, power: 1, health: 1, tribe: 'kite',
    text: 'Deploy: an Aerial ally gets +1|+1.',
    abilities: [{ on: 'deploy', targets: [{ what: 'unit', side: 'ally', filter: { kw: 'aerial' } }], ops: [{ op: 'buff', to: 'target0', power: 1, health: 1 }] }],
  },
  {
    id: 'storm-wingcadet', name: 'Wing Cadet', faction: 'storm', type: 'unit', cost: 1, power: 1, health: 1, tribe: 'courier',
    text: 'When another Aerial ally enters your Line, it gets +1|+0.',
    abilities: [{ on: 'allySummoned', ops: [{ op: 'buff', to: { from: 'trigger', filter: { kw: 'aerial' } }, power: 1 }] }],
  },
  {
    id: 'storm-tailrunner', name: 'Tail Runner', faction: 'storm', type: 'unit', cost: 1, power: 1, health: 2, tribe: 'courier',
    text: 'Assault: if you have declared 3 or more attackers this round, I get +2|+0 this round.',
    abilities: [{ on: 'assault', cond: { c: 'seenRound', stat: 'attackersDeclared', gte: 3 }, ops: [{ op: 'buff', to: 'self', power: 2, dur: 'round' }] }],
  },
  {
    id: 'storm-skirmishkite', name: 'Skirmish Kite', faction: 'storm', type: 'unit', cost: 2, power: 2, health: 1, tribe: 'kite',
    keywords: ['aerial'], text: 'Aerial. Resonant: I have +1|+1 and Vanguard.',
    auras: [{ to: 'self', power: 1, health: 1, kw: ['vanguard'], cond: { c: 'resonant' } }],
  },
  {
    id: 'storm-signaller', name: 'Platform Signaller', faction: 'storm', type: 'unit', cost: 2, power: 1, health: 3, tribe: 'courier',
    text: 'Dusk: if you have declared 4 or more attackers this round, draw a card.',
    abilities: [{ on: 'dusk', cond: { c: 'seenRound', stat: 'attackersDeclared', gte: 4 }, ops: [{ op: 'draw', n: 1 }] }],
  },
  {
    id: 'storm-windrigger', name: 'Wind Rigger', faction: 'storm', type: 'unit', cost: 2, power: 1, health: 2, tribe: 'courier',
    text: 'Deploy: choose an ally. If it has Aerial, it gets +1|+1; otherwise it gains Aerial.',
    abilities: [{
      on: 'deploy', targets: [{ what: 'unit', side: 'ally' }],
      ops: [
        { op: 'buff', to: { from: 'target0', filter: { kw: 'aerial' } }, power: 1, health: 1 },
        { op: 'grant', to: { from: 'target0', filter: { notKw: 'aerial' } }, kw: ['aerial'] },
      ],
    }],
  },
  {
    id: 'storm-gyrekite', name: 'Gyre Kite', faction: 'storm', type: 'unit', cost: 3, power: 3, health: 2, tribe: 'kite',
    keywords: ['aerial'], text: 'Aerial. Strike: other Aerial allies get +1|+0 this round.',
    abilities: [{ on: 'strike', ops: [{ op: 'buff', to: { from: 'otherAllies', filter: { kw: 'aerial' } }, power: 1, dur: 'round' }] }],
  },
  {
    id: 'storm-veteranrunner', name: 'Veteran Runner', faction: 'storm', type: 'unit', cost: 3, power: 3, health: 2, tribe: 'courier',
    keywords: ['vanguard'], text: 'Vanguard. Strike: if you have declared 3 or more attackers this round, I get +1|+1.',
    abilities: [{ on: 'strike', cond: { c: 'seenRound', stat: 'attackersDeclared', gte: 3 }, ops: [{ op: 'buff', to: 'self', power: 1, health: 1 }] }],
  },
  {
    id: 'storm-mastlookout', name: 'Mast Lookout', faction: 'storm', type: 'unit', cost: 3, power: 2, health: 4, tribe: 'courier',
    keywords: ['spotter'], text: 'Spotter. Resonant: I have +2|+0 and Aerial.',
    auras: [{ to: 'self', power: 2, kw: ['aerial'], cond: { c: 'resonant' } }],
  },
  {
    id: 'storm-switchforeman', name: 'Switchyard Foreman', faction: 'storm', type: 'unit', cost: 4, power: 3, health: 3, tribe: 'courier',
    text: 'Deploy: if you have declared an attacker this round, you may attack again this round.',
    abilities: [{ on: 'deploy', cond: { c: 'seenRound', stat: 'attackersDeclared', gte: 1 }, ops: [{ op: 'rally' }] }],
  },
  {
    id: 'storm-glidetutor', name: 'Glide Tutor', faction: 'storm', type: 'unit', cost: 4, power: 2, health: 4, tribe: 'courier',
    text: 'Dawn: other Aerial allies with 2 or less power get +1|+1.',
    abilities: [{ on: 'dawn', ops: [{ op: 'buff', to: { from: 'otherAllies', filter: { kw: 'aerial', maxPower: 2 } }, power: 1, health: 1 }] }],
  },
  {
    id: 'storm-breakneck', name: 'Breakneck Courier', faction: 'storm', type: 'unit', cost: 5, power: 5, health: 4, tribe: 'courier',
    keywords: ['vanguard'], text: 'Vanguard. Shatter: you may attack again this round.',
    abilities: [{ on: 'shatter', ops: [{ op: 'rally' }] }],
  },
  {
    id: 'storm-aeriecarrier', name: 'Aerie Carrier', faction: 'storm', type: 'unit', cost: 6, power: 5, health: 4, tribe: 'courier',
    keywords: ['aerial'], text: 'Aerial. Deploy: Aerial allies get +1|+1.',
    abilities: [{ on: 'deploy', ops: [{ op: 'buff', to: { from: 'allies', filter: { kw: 'aerial' } }, power: 1, health: 1 }] }],
  },
  {
    id: 'storm-bellexpress', name: 'Ninth-Bell Express', faction: 'storm', type: 'unit', cost: 7, power: 6, health: 6, tribe: 'courier',
    keywords: ['vanguard'], text: 'Vanguard. Assault: if you have declared 5 or more attackers this round, deal 4 to the enemy Spire.',
    abilities: [{ on: 'assault', cond: { c: 'seenRound', stat: 'attackersDeclared', gte: 5 }, ops: [{ op: 'damage', to: 'enemySpire', n: 4 }] }],
  },
  // glyphs
  {
    id: 'storm-anchorleg', name: 'Anchor Leg', faction: 'storm', type: 'glyph', cost: 1, speed: 'flash',
    text: 'An ally gets +1|+0 this round. If you have declared 3 or more attackers this round, it gets +1|+1 more this round.',
    targets: [{ what: 'unit', side: 'ally' }],
    ops: [
      { op: 'buff', to: 'target0', power: 1, dur: 'round' },
      { op: 'if', cond: { c: 'seenRound', stat: 'attackersDeclared', gte: 3 }, then: [{ op: 'buff', to: 'target0', power: 1, health: 1, dur: 'round' }] },
    ],
  },
  {
    id: 'storm-sinkingair', name: 'Sinking Air', faction: 'storm', type: 'glyph', cost: 2, speed: 'flash',
    text: 'An enemy unit gets -2|+0 this round.',
    targets: [{ what: 'unit', side: 'enemy' }], ops: [{ op: 'buff', to: 'target0', power: -2, dur: 'round' }],
  },
  {
    id: 'storm-closeechelon', name: 'Close Echelon', faction: 'storm', type: 'glyph', cost: 3, speed: 'flash',
    text: 'Aerial allies get +1|+1 this round.',
    ops: [{ op: 'buff', to: { from: 'allies', filter: { kw: 'aerial' } }, power: 1, health: 1, dur: 'round' }],
  },
  {
    id: 'storm-parceldrop', name: 'Parcel Drop', faction: 'storm', type: 'glyph', cost: 2, speed: 'swift',
    text: 'Draw a card. If you have declared 3 or more attackers this round, draw another.',
    ops: [{ op: 'draw', n: 1 }, { op: 'if', cond: { c: 'seenRound', stat: 'attackersDeclared', gte: 3 }, then: [{ op: 'draw', n: 1 }] }],
  },
  {
    id: 'storm-loopback', name: 'Loop Back', faction: 'storm', type: 'glyph', cost: 2, speed: 'swift',
    text: 'Cast only if you have declared 4 or more attackers this round. You may attack again this round.',
    castIf: { c: 'seenRound', stat: 'attackersDeclared', gte: 4 },
    ops: [{ op: 'rally' }],
  },
  {
    id: 'storm-steepdive', name: 'Steep Dive', faction: 'storm', type: 'glyph', cost: 3, speed: 'swift',
    text: 'An Aerial ally strikes an enemy unit.',
    targets: [{ what: 'unit', side: 'ally', filter: { kw: 'aerial' } }, { what: 'unit', side: 'enemy' }], needsAllTargets: true,
    ops: [{ op: 'strike', from: 'target0', to: 'target1' }],
  },
  {
    id: 'storm-gliderdrop', name: 'Glider Drop', faction: 'storm', type: 'glyph', cost: 5, speed: 'swift',
    text: 'Summon 2 Wingmates. Resonant: Aerial allies get +1|+1 this round.',
    ops: [
      { op: 'summon', card: 'storm-wingmate', n: 2 },
      { op: 'if', cond: { c: 'resonant' }, then: [{ op: 'buff', to: { from: 'allies', filter: { kw: 'aerial' } }, power: 1, health: 1, dur: 'round' }] },
    ],
  },
  {
    id: 'storm-flightdrill', name: 'Flight Drill', faction: 'storm', type: 'glyph', cost: 4, speed: 'ritual',
    text: 'Aerial allies get +1|+1. Draw a card.',
    ops: [{ op: 'buff', to: { from: 'allies', filter: { kw: 'aerial' } }, power: 1, health: 1 }, { op: 'draw', n: 1 }],
  },
  {
    id: 'storm-doubledeparture', name: 'Double Departure', faction: 'storm', type: 'glyph', cost: 6, speed: 'ritual',
    text: 'Allies get +2|+1 this round. You may attack again this round.',
    ops: [{ op: 'buff', to: 'allies', power: 2, health: 1, dur: 'round' }, { op: 'rally' }],
  },

  // ---------- set x1: The Mirror Quarter ----------
  // Smugglers in silvered coats: Veiled couriers, Reprise tempo glyphs, dead drops that leave Glimmer cards in hand.
  {
    id: 'storm-fen', name: 'Fen Halloway, Silvercoat', faction: 'storm', type: 'hero', cost: 3, power: 2, health: 3, set: 'x1',
    keywords: ['veiled'], tribe: 'courier',
    text: 'Veiled. Assault: create a Glimmer Anchor Leg in your hand.',
    abilities: [{ on: 'assault', ops: [{ op: 'create', card: 'storm-anchorleg', glimmer: true }] }],
    level: { who: 'you', stat: 'glimmerPlayed', n: 6, text: "You've played 6+ Glimmer cards" },
    ascended: {
      name: 'Fen, Queen of the Dead Drops', power: 3, health: 5, keywords: ['veiled', 'aerial'],
      text: 'Veiled, Aerial. Assault: create 2 Glimmer Anchor Legs in your hand. Ascend: other allies gain Veiled. Draw 2 cards.',
      abilities: [
        { on: 'assault', ops: [{ op: 'create', card: 'storm-anchorleg', n: 2, glimmer: true }] },
        { on: 'ascend', ops: [{ op: 'grant', to: 'otherAllies', kw: ['veiled'] }, { op: 'draw', n: 2 }] },
      ],
    },
  },
  // units
  {
    id: 'storm-pocketcourier', name: 'Pocket Courier', faction: 'storm', type: 'unit', cost: 1, power: 1, health: 1, set: 'x1', tribe: 'courier',
    keywords: ['veiled'], text: 'Veiled. Deploy: create a Glimmer Tailwind in your hand.',
    abilities: [{ on: 'deploy', ops: [{ op: 'create', card: 'storm-tailwind', glimmer: true }] }],
  },
  {
    id: 'storm-ambushrunner', name: 'Ambush Runner', faction: 'storm', type: 'unit', cost: 2, power: 2, health: 1, set: 'x1', tribe: 'courier',
    keywords: ['veiled'], text: 'Veiled. Assault: if I am Veiled, I get +2|+0 this round.',
    abilities: [{ on: 'assault', ops: [{ op: 'buff', to: { from: 'self', filter: { kw: 'veiled' } }, power: 2, dur: 'round' }] }],
  },
  {
    id: 'storm-passforger', name: 'Pass Forger', faction: 'storm', type: 'unit', cost: 2, power: 1, health: 2, set: 'x1', tribe: 'courier',
    text: 'Deploy: copy an ally (Glimmer).',
    abilities: [{ on: 'deploy', targets: [{ what: 'unit', side: 'ally' }], ops: [{ op: 'copy', of: 'target0', glimmer: true }] }],
  },
  {
    id: 'storm-signalthief', name: 'Signal Thief', faction: 'storm', type: 'unit', cost: 3, power: 3, health: 3, set: 'x1', tribe: 'courier',
    text: 'When the opponent casts a glyph, create a Glimmer Sinking Air in your hand.',
    abilities: [{ on: 'foeGlyph', ops: [{ op: 'create', card: 'storm-sinkingair', glimmer: true }] }],
  },
  {
    id: 'storm-moonlessglider', name: 'Moonless Glider', faction: 'storm', type: 'unit', cost: 3, power: 2, health: 2, set: 'x1', tribe: 'kite',
    keywords: ['veiled', 'aerial'], text: 'Veiled, Aerial. When I strike the enemy Spire, create a Glimmer Parcel Drop in your hand.',
    abilities: [{ on: 'spireHit', ops: [{ op: 'create', card: 'storm-parceldrop', glimmer: true }] }],
  },
  {
    id: 'storm-quartermaster', name: 'Silvercoat Quartermaster', faction: 'storm', type: 'unit', cost: 4, power: 3, health: 4, set: 'x1', tribe: 'courier',
    text: 'Deploy: an ally gets +1|+1 and gains Veiled.',
    abilities: [{
      on: 'deploy', targets: [{ what: 'unit', side: 'ally' }],
      ops: [{ op: 'buff', to: 'target0', power: 1, health: 1 }, { op: 'grant', to: 'target0', kw: ['veiled'] }],
    }],
  },
  {
    id: 'storm-hushedskiff', name: 'Hushed Skiff', faction: 'storm', type: 'unit', cost: 5, power: 3, health: 4, set: 'x1', tribe: 'courier',
    keywords: ['veiled', 'aerial'], text: 'Veiled, Aerial. Dusk: if I am Veiled, I get +1|+1.',
    abilities: [{ on: 'dusk', ops: [{ op: 'buff', to: { from: 'self', filter: { kw: 'veiled' } }, power: 1, health: 1 }] }],
  },
  {
    id: 'storm-quicksilvermail', name: 'Quicksilver Mail', faction: 'storm', type: 'unit', cost: 7, power: 6, health: 5, set: 'x1', tribe: 'courier',
    keywords: ['veiled', 'aerial'], text: 'Veiled, Aerial. When I strike the enemy Spire, create a Glimmer Reroute in your hand.',
    abilities: [{ on: 'spireHit', ops: [{ op: 'create', card: 'storm-reroute', glimmer: true }] }],
  },
  // glyphs
  {
    id: 'storm-turnedcollar', name: 'Turned Collar', faction: 'storm', type: 'glyph', cost: 1, speed: 'flash', set: 'x1',
    keywords: ['reprise'], text: 'Reprise. An ally gets +1|+0 and Veiled this round.',
    targets: [{ what: 'unit', side: 'ally' }],
    ops: [{ op: 'buff', to: 'target0', power: 1, dur: 'round' }, { op: 'grant', to: 'target0', kw: ['veiled'], dur: 'round' }],
  },
  {
    id: 'storm-deaddrop', name: 'Dead Drop', faction: 'storm', type: 'glyph', cost: 1, speed: 'flash', set: 'x1',
    text: 'Create a Glimmer Tailwind and a Glimmer Updraft in your hand. Resonant: draw a card.',
    ops: [
      { op: 'create', card: 'storm-tailwind', glimmer: true },
      { op: 'create', card: 'storm-updraft', glimmer: true },
      { op: 'if', cond: { c: 'resonant' }, then: [{ op: 'draw', n: 1 }] },
    ],
  },
  {
    id: 'storm-smokelantern', name: 'Smoke Lantern', faction: 'storm', type: 'glyph', cost: 3, speed: 'swift', set: 'x1',
    keywords: ['reprise'], text: 'Reprise. Put an enemy unit with 3 or less power in Stasis.',
    targets: [{ what: 'unit', side: 'enemy', filter: { maxPower: 3 } }], ops: [{ op: 'stasis', to: 'target0' }],
  },
  {
    id: 'storm-silveredcoats', name: 'Silvered Coats', faction: 'storm', type: 'glyph', cost: 3, speed: 'swift', set: 'x1',
    text: 'Allies gain Veiled this round. Resonant: they also get +1|+0 this round.',
    ops: [
      { op: 'grant', to: 'allies', kw: ['veiled'], dur: 'round' },
      { op: 'if', cond: { c: 'resonant' }, then: [{ op: 'buff', to: 'allies', power: 1, dur: 'round' }] },
    ],
  },
  {
    id: 'storm-blackoutdelivery', name: 'Blackout Delivery', faction: 'storm', type: 'glyph', cost: 3, speed: 'ritual', set: 'x1',
    keywords: ['reprise'], text: 'Reprise. Summon a Wingmate, then your Wingmates gain Veiled.',
    ops: [
      { op: 'summon', card: 'storm-wingmate' },
      { op: 'grant', to: { from: 'allies', filter: { card: 'storm-wingmate' } }, kw: ['veiled'] },
    ],
  },

  // ---------- set x2: The Starward Rise ----------
  // Navigation by the stars: navigators who Chart for the next kite, couriers that Unfold after their first
  // deliveries, and Conjunction bonuses on tempo glyphs. Hero archetype: the navigator (cards charted).
  {
    id: 'storm-isra', name: 'Navigator Isra Vantelle', faction: 'storm', type: 'hero', cost: 3, power: 2, health: 3, set: 'x2',
    tribe: 'courier',
    text: 'Dawn: Chart a kite (3).',
    abilities: [{ on: 'dawn', ops: [{ op: 'chart', n: 3, find: { type: 'unit', tribe: 'kite' } }] }],
    level: { who: 'you', stat: 'charted', n: 5, text: "You've charted 5+ cards" },
    ascended: {
      name: 'Isra, Reader of the Night Roads', power: 3, health: 5, keywords: ['aerial'],
      text: 'Aerial. Dawn: Chart a unit (3). Ascend: Chart a unit (6), then Chart a glyph (6).',
      abilities: [
        { on: 'dawn', ops: [{ op: 'chart', n: 3, find: { type: 'unit' } }] },
        { on: 'ascend', ops: [{ op: 'chart', n: 6, find: { type: 'unit' } }, { op: 'chart', n: 6, find: { type: 'glyph' } }] },
      ],
    },
  },
  // units
  {
    id: 'storm-sextantcadet', name: 'Sextant Cadet', faction: 'storm', type: 'unit', cost: 1, power: 1, health: 1, set: 'x2', tribe: 'courier',
    text: 'Deploy: Chart a kite (3).',
    abilities: [{ on: 'deploy', ops: [{ op: 'chart', n: 3, find: { type: 'unit', tribe: 'kite' } }] }],
  },
  {
    id: 'storm-dawnrunner', name: 'Dawnrunner Kite', faction: 'storm', type: 'unit', cost: 2, power: 2, health: 1, set: 'x2', tribe: 'kite',
    keywords: ['aerial'], text: 'Aerial.',
    level: { who: 'self', stat: 'damageDealt', n: 4, text: 'It has dealt 4+ damage' },
    ascended: { name: 'Daybreak Kite', power: 3, health: 3, keywords: ['aerial', 'vanguard'], text: 'Aerial, Vanguard.' },
  },
  {
    id: 'storm-meridianrider', name: 'Meridian Rider', faction: 'storm', type: 'unit', cost: 3, power: 3, health: 2, set: 'x2', tribe: 'courier',
    keywords: ['vanguard'], text: 'Vanguard. Deploy: if Conjunction, I get +1|+2.',
    abilities: [{ on: 'deploy', ops: [{ op: 'if', cond: { c: 'conjunction' }, then: [{ op: 'buff', to: 'self', power: 1, health: 2 }] }] }],
  },
  {
    id: 'storm-wayfinder', name: 'Wayfinder Glider', faction: 'storm', type: 'unit', cost: 3, power: 2, health: 2, set: 'x2', tribe: 'kite',
    keywords: ['aerial'], text: 'Aerial.',
    level: { who: 'self', stat: 'strikes', n: 2, text: 'It has struck 2+ times' },
    ascended: {
      name: 'Wayfinder, Star-Led', power: 4, health: 4, keywords: ['aerial'],
      text: 'Aerial. Strike: Chart a glyph (3).',
      abilities: [{ on: 'strike', ops: [{ op: 'chart', n: 3, find: { type: 'glyph' } }] }],
    },
  },
  {
    id: 'storm-zenithlookout', name: 'Zenith Lookout', faction: 'storm', type: 'unit', cost: 4, power: 2, health: 4, set: 'x2', tribe: 'courier',
    keywords: ['spotter'], text: 'Spotter. Deploy: Chart a glyph (4). Resonant: also Chart a kite (4).',
    abilities: [{
      on: 'deploy',
      ops: [
        { op: 'chart', n: 4, find: { type: 'glyph' } },
        { op: 'if', cond: { c: 'resonant' }, then: [{ op: 'chart', n: 4, find: { type: 'unit', tribe: 'kite' } }] },
      ],
    }],
  },
  {
    id: 'storm-cometexpress', name: 'Comet Express', faction: 'storm', type: 'unit', cost: 5, power: 4, health: 4, set: 'x2', tribe: 'courier',
    keywords: ['vanguard'], text: 'Vanguard.',
    level: { who: 'self', stat: 'damageDealt', n: 6, text: 'It has dealt 6+ damage' },
    ascended: {
      name: 'Comet Express, Tail Ablaze', power: 6, health: 5, keywords: ['vanguard', 'aerial'],
      text: 'Vanguard, Aerial. Unfold: you may attack again this round.',
      abilities: [{ on: 'unfold', ops: [{ op: 'rally' }] }],
    },
  },
  {
    id: 'storm-nightgalleon', name: 'Night-Sky Galleon', faction: 'storm', type: 'unit', cost: 6, power: 4, health: 5, set: 'x2', tribe: 'courier',
    keywords: ['aerial'], text: 'Aerial. Deploy: Chart a unit (5). Conjunction: I have +2|+2.',
    abilities: [{ on: 'deploy', ops: [{ op: 'chart', n: 5, find: { type: 'unit' } }] }],
    auras: [{ to: 'self', power: 2, health: 2, cond: { c: 'conjunction' } }],
  },
  // glyphs
  {
    id: 'storm-coursecorrection', name: 'Course Correction', faction: 'storm', type: 'glyph', cost: 1, speed: 'flash', set: 'x2',
    text: 'An ally gets +1|+0 and Vanguard this round. Conjunction: it also gets +0|+2 this round.',
    targets: [{ what: 'unit', side: 'ally' }],
    ops: [
      { op: 'buff', to: 'target0', power: 1, dur: 'round' },
      { op: 'grant', to: 'target0', kw: ['vanguard'], dur: 'round' },
      { op: 'if', cond: { c: 'conjunction' }, then: [{ op: 'buff', to: 'target0', health: 2, dur: 'round' }] },
    ],
  },
  {
    id: 'storm-plotacourse', name: 'Plot a Course', faction: 'storm', type: 'glyph', cost: 2, speed: 'swift', set: 'x2',
    text: 'Chart a kite (4). Conjunction: also Chart a glyph (4).',
    ops: [
      { op: 'chart', n: 4, find: { type: 'unit', tribe: 'kite' } },
      { op: 'if', cond: { c: 'conjunction' }, then: [{ op: 'chart', n: 4, find: { type: 'glyph' } }] },
    ],
  },
  {
    id: 'storm-homewardbearing', name: 'Homeward Bearing', faction: 'storm', type: 'glyph', cost: 4, speed: 'swift', set: 'x2',
    text: 'Allies get +1|+0 this round. Conjunction: you may attack again this round.',
    ops: [
      { op: 'buff', to: 'allies', power: 1, dur: 'round' },
      { op: 'if', cond: { c: 'conjunction' }, then: [{ op: 'rally' }] },
    ],
  },
  {
    id: 'storm-starsurvey', name: 'Star Survey', faction: 'storm', type: 'glyph', cost: 4, speed: 'ritual', set: 'x2',
    text: 'Chart a kite (4), then Chart a unit (4), then Chart a glyph (4).',
    ops: [
      { op: 'chart', n: 4, find: { type: 'unit', tribe: 'kite' } },
      { op: 'chart', n: 4, find: { type: 'unit' } },
      { op: 'chart', n: 4, find: { type: 'glyph' } },
    ],
  },
];

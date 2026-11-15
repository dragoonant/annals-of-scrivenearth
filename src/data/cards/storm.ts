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
    text: 'Dawn: a random ally gets +1|+0 this round.',
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
];

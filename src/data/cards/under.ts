// Undervolt: the undercity syndicate. Siphon, Corrosive, Dread, Shatter effects, drain.
import type { CardDef } from '../../engine/types';

export const under: CardDef[] = [
  {
    id: 'under-sable', name: 'Sable Nyx, Blackwire', faction: 'under', type: 'hero', cost: 2, power: 2, health: 2,
    keywords: ['dread'], tribe: 'syndicate',
    text: 'Dread. When another ally is destroyed, I get +1|+0 this round.',
    abilities: [{ on: 'allyDied', ops: [{ op: 'buff', to: 'self', power: 1, dur: 'round' }] }],
    level: { who: 'you', stat: 'alliesDied', n: 4, text: '4+ of your units have been destroyed' },
    ascended: {
      name: 'Sable, Queen of Fuses', power: 4, health: 3, keywords: ['dread', 'corrosive'],
      text: 'Dread, Corrosive. When another ally is destroyed, drain 1 from the enemy Spire. Ascend: summon 2 Wire Rats.',
      abilities: [
        { on: 'allyDied', ops: [{ op: 'drain', to: 'enemySpire', n: 1 }] },
        { on: 'ascend', ops: [{ op: 'summon', card: 'under-wirerat', n: 2 }] },
      ],
    },
  },
  {
    id: 'under-vex', name: 'Doctor Vex, Leechwright', faction: 'under', type: 'hero', cost: 5, power: 4, health: 5,
    keywords: ['siphon'], tribe: 'syndicate',
    text: 'Siphon.',
    level: { who: 'you', stat: 'spireHealed', n: 8, text: "You've repaired your Spire by 8+" },
    ascended: {
      name: 'Vex, the Undying Current', power: 5, health: 6, keywords: ['siphon'],
      text: 'Siphon. Dusk: drain 2 from the enemy Spire. Ascend: drain 3 from every enemy unit.',
      abilities: [
        { on: 'dusk', ops: [{ op: 'drain', to: 'enemySpire', n: 2 }] },
        { on: 'ascend', ops: [{ op: 'drain', to: 'enemies', n: 3 }] },
      ],
    },
  },
  {
    id: 'under-wirerat', name: 'Wire Rat', faction: 'under', type: 'unit', cost: 1, power: 1, health: 1, token: true,
    tribe: 'vermin', text: '',
  },

  // ---------- units ----------
  {
    id: 'under-fuserunner', name: 'Fuse-Runner', faction: 'under', type: 'unit', cost: 1, power: 1, health: 1, tribe: 'syndicate',
    text: 'Shatter: drain 1 from the enemy Spire.',
    abilities: [{ on: 'shatter', ops: [{ op: 'drain', to: 'enemySpire', n: 1 }] }],
  },
  {
    id: 'under-leechtick', name: 'Leech Tick', faction: 'under', type: 'unit', cost: 1, power: 1, health: 1, tribe: 'vermin',
    keywords: ['siphon'],
    text: 'Siphon.',
  },
  {
    id: 'under-burnoutrunner', name: 'Burnout Runner', faction: 'under', type: 'unit', cost: 1, power: 2, health: 1, tribe: 'syndicate',
    keywords: ['dread', 'unstable'],
    text: 'Dread, Unstable.',
  },
  {
    id: 'under-ratwrangler', name: 'Rat Wrangler', faction: 'under', type: 'unit', cost: 2, power: 1, health: 2, tribe: 'syndicate',
    text: 'Deploy: summon a Wire Rat. Resonant: summon 2 Wire Rats instead.',
    abilities: [{
      on: 'deploy',
      ops: [{
        op: 'if', cond: { c: 'resonant' },
        then: [{ op: 'summon', card: 'under-wirerat', n: 2 }],
        else: [{ op: 'summon', card: 'under-wirerat', n: 1 }],
      }],
    }],
  },
  {
    id: 'under-pitaccountant', name: 'Pit Accountant', faction: 'under', type: 'unit', cost: 2, power: 1, health: 3, tribe: 'syndicate',
    text: 'When another ally is destroyed, drain 1 from the enemy Spire. Resonant: I have +1|+1.',
    abilities: [{ on: 'allyDied', ops: [{ op: 'drain', to: 'enemySpire', n: 1 }] }],
    auras: [{ to: 'self', power: 1, health: 1, cond: { c: 'resonant' } }],
  },
  {
    id: 'under-acidlamplighter', name: 'Acid Lamplighter', faction: 'under', type: 'unit', cost: 2, power: 1, health: 2, tribe: 'syndicate',
    keywords: ['corrosive'],
    text: 'Corrosive.',
  },
  {
    id: 'under-furnacehand', name: 'Furnace Hand', faction: 'under', type: 'unit', cost: 3, power: 4, health: 4, tribe: 'syndicate',
    text: 'Deploy: destroy another allied unit.',
    abilities: [{ on: 'deploy', targets: [{ what: 'unit', side: 'ally' }], ops: [{ op: 'destroy', to: 'target0' }] }],
  },
  {
    id: 'under-backalleyenforcer', name: 'Backalley Enforcer', faction: 'under', type: 'unit', cost: 3, power: 3, health: 2, tribe: 'syndicate',
    keywords: ['dread'],
    text: 'Dread.',
  },
  {
    id: 'under-leechwiresurgeon', name: 'Leechwire Surgeon', faction: 'under', type: 'unit', cost: 3, power: 2, health: 3, tribe: 'syndicate',
    text: 'Deploy: drain 2 from an enemy unit.',
    abilities: [{ on: 'deploy', targets: [{ what: 'unit', side: 'enemy' }], ops: [{ op: 'drain', to: 'target0', n: 2 }] }],
  },
  {
    id: 'under-vaultpawnbroker', name: 'Vault Pawnbroker', faction: 'under', type: 'unit', cost: 4, power: 3, health: 4, tribe: 'syndicate',
    text: 'When an enemy unit is destroyed, drain 1 from the enemy Spire.',
    abilities: [{ on: 'enemyDied', ops: [{ op: 'drain', to: 'enemySpire', n: 1 }] }],
  },
  {
    id: 'under-powdercourier', name: 'Powder Courier', faction: 'under', type: 'unit', cost: 4, power: 3, health: 3, tribe: 'syndicate',
    text: 'Shatter: deal 3 damage to the strongest enemy.',
    abilities: [{ on: 'shatter', ops: [{ op: 'damage', to: 'strongestEnemy', n: 3 }] }],
  },
  {
    id: 'under-syndicatebroker', name: 'Wire Market Broker', faction: 'under', type: 'unit', cost: 5, power: 3, health: 5, tribe: 'syndicate',
    text: 'Deploy: summon 2 Wire Rats.',
    abilities: [{ on: 'deploy', ops: [{ op: 'summon', card: 'under-wirerat', n: 2 }] }],
  },
  {
    id: 'under-leechoverseer', name: 'Leech-Coil Overseer', faction: 'under', type: 'unit', cost: 6, power: 4, health: 6, tribe: 'syndicate',
    keywords: ['siphon', 'corrosive'],
    text: 'Siphon, Corrosive.',
  },
  {
    id: 'under-mainlinedynamo', name: 'Mainline Dynamo', faction: 'under', type: 'unit', cost: 7, power: 5, health: 6, tribe: 'construct',
    keywords: ['dread'],
    text: 'Dread. Deploy: drain 2 from every enemy unit.',
    abilities: [{ on: 'deploy', ops: [{ op: 'drain', to: 'enemies', n: 2 }] }],
  },

  // ---------- glyphs ----------
  {
    id: 'under-pullplug', name: 'Pull the Plug', faction: 'under', type: 'glyph', cost: 1, speed: 'flash',
    text: 'Destroy an allied unit. Drain 2 from the enemy Spire.',
    targets: [{ what: 'unit', side: 'ally' }],
    ops: [{ op: 'destroy', to: 'target0' }, { op: 'drain', to: 'enemySpire', n: 2 }],
  },
  {
    id: 'under-siphontap', name: 'Siphon Tap', faction: 'under', type: 'glyph', cost: 2, speed: 'flash',
    text: 'Drain 2 from an enemy unit.',
    targets: [{ what: 'unit', side: 'enemy' }], ops: [{ op: 'drain', to: 'target0', n: 2 }],
  },
  {
    id: 'under-acidbath', name: 'Acid Bath', faction: 'under', type: 'glyph', cost: 2, speed: 'flash',
    text: 'An allied unit gains Corrosive this round.',
    targets: [{ what: 'unit', side: 'ally' }], ops: [{ op: 'grant', to: 'target0', kw: ['corrosive'], dur: 'round' }],
  },
  {
    id: 'under-burnledger', name: 'Burn the Ledger', faction: 'under', type: 'glyph', cost: 2, speed: 'swift',
    text: 'Destroy an allied unit. Draw 2.',
    targets: [{ what: 'unit', side: 'ally' }], ops: [{ op: 'destroy', to: 'target0' }, { op: 'draw', n: 2 }],
  },
  {
    id: 'under-snuffedfuse', name: 'Snuffed Fuse', faction: 'under', type: 'glyph', cost: 3, speed: 'swift',
    text: 'Choose an enemy unit with 3 or less power. Destroy it.',
    targets: [{ what: 'unit', side: 'enemy', filter: { maxPower: 3 } }], ops: [{ op: 'destroy', to: 'target0' }],
  },
  {
    id: 'under-bleeddry', name: 'Bleed Dry', faction: 'under', type: 'glyph', cost: 4, speed: 'swift',
    text: 'Drain 4 from an enemy unit or Spire.',
    targets: [{ what: 'unitOrSpire', side: 'enemy' }], ops: [{ op: 'drain', to: 'target0', n: 4 }],
  },
  {
    id: 'under-chainoverload', name: 'Chain Overload', faction: 'under', type: 'glyph', cost: 6, speed: 'swift',
    text: 'Drain 3 from every enemy unit.',
    ops: [{ op: 'drain', to: 'enemies', n: 3 }],
  },
  {
    id: 'under-wiremarket', name: 'Wire Market', faction: 'under', type: 'glyph', cost: 3, speed: 'ritual',
    text: 'Summon 3 Wire Rats.',
    ops: [{ op: 'summon', card: 'under-wirerat', n: 3 }],
  },
  {
    id: 'under-leechharvest', name: 'Leech Harvest', faction: 'under', type: 'glyph', cost: 4, speed: 'ritual',
    text: 'Drain 2 from the enemy Spire for each of your units destroyed this round.',
    ops: [{ op: 'drain', to: 'enemySpire', n: { count: 'alliesDiedThisRound', mul: 2 } }],
  },
];

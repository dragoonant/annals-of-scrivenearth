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

  // ---------- First Light additions (docs/SETS.md): the enforcer (Marrow) and the racketeer (Penn) ----------
  {
    id: 'under-marrow', name: 'Hask Marrow, Strongarm', faction: 'under', type: 'hero', cost: 3, power: 2, health: 3,
    keywords: ['dread'], tribe: 'syndicate',
    text: 'Dread. Assault: deal 1 damage to the weakest enemy.',
    abilities: [{ on: 'assault', ops: [{ op: 'damage', to: 'weakestEnemy', n: 1 }] }],
    level: { who: 'self', stat: 'kills', n: 3, text: "I've destroyed 3+ units" },
    ascended: {
      name: 'Marrow, Who Collects in Full', power: 4, health: 5, keywords: ['dread'],
      text: 'Dread. Assault: deal 2 damage to the weakest enemy. Ascend: destroy every damaged enemy unit.',
      abilities: [
        { on: 'assault', ops: [{ op: 'damage', to: 'weakestEnemy', n: 2 }] },
        { on: 'ascend', ops: [{ op: 'destroy', to: { from: 'enemies', filter: { damaged: true } } }] },
      ],
    },
  },
  {
    id: 'under-penn', name: 'Merrit Penn, Racketeer', faction: 'under', type: 'hero', cost: 3, power: 2, health: 4,
    tribe: 'syndicate',
    text: 'Dusk: drain 1 from the enemy Spire for each glyph you cast this round (at most 2).',
    abilities: [{ on: 'dusk', ops: [{ op: 'drain', to: 'enemySpire', n: { count: 'glyphsThisRound', mul: 1, max: 2 } }] }],
    level: { who: 'you', stat: 'glyphDamage', n: 10, text: 'Your glyphs and abilities have dealt 10+ damage' },
    ascended: {
      name: 'Penn, Owner of Every Street', power: 4, health: 6,
      text: 'Dusk: drain 1 from the enemy Spire for each glyph you cast this round (at most 4). Ascend: drain 1 from the enemy Spire for each card in your hand (at most 4).',
      abilities: [
        { on: 'dusk', ops: [{ op: 'drain', to: 'enemySpire', n: { count: 'glyphsThisRound', mul: 1, max: 4 } }] },
        { on: 'ascend', ops: [{ op: 'drain', to: 'enemySpire', n: { count: 'hand', mul: 1, max: 4 } }] },
      ],
    },
  },
  {
    id: 'under-skimclerk', name: 'Skim Clerk', faction: 'under', type: 'unit', cost: 1, power: 1, health: 1, tribe: 'syndicate',
    text: 'Dusk: if you cast 2+ glyphs this round, deal 1 damage to the enemy Spire.',
    abilities: [{ on: 'dusk', cond: { c: 'seenRound', stat: 'glyphsCast', gte: 2 }, ops: [{ op: 'damage', to: 'enemySpire', n: 1 }] }],
  },
  {
    id: 'under-blisterrat', name: 'Blister Rat', faction: 'under', type: 'unit', cost: 1, power: 1, health: 1, tribe: 'vermin',
    keywords: ['corrosive', 'unstable'],
    text: 'Corrosive, Unstable.',
  },
  {
    id: 'under-tollrat', name: 'Toll Rat', faction: 'under', type: 'unit', cost: 1, power: 1, health: 1, tribe: 'vermin',
    text: 'Strike: deal 1 damage to the enemy Spire.',
    abilities: [{ on: 'strike', ops: [{ op: 'damage', to: 'enemySpire', n: 1 }] }],
  },
  {
    id: 'under-kneecapper', name: 'Kneecapper', faction: 'under', type: 'unit', cost: 2, power: 2, health: 1, tribe: 'syndicate',
    keywords: ['dread'],
    text: 'Dread. Deploy: deal 1 damage to an enemy unit.',
    abilities: [{ on: 'deploy', targets: [{ what: 'unit', side: 'enemy' }], ops: [{ op: 'damage', to: 'target0', n: 1 }] }],
  },
  {
    id: 'under-bagman', name: 'Bagman', faction: 'under', type: 'unit', cost: 2, power: 2, health: 2, tribe: 'syndicate',
    text: 'Deploy: deal 1 damage to the enemy Spire for each glyph you cast this round.',
    abilities: [{ on: 'deploy', ops: [{ op: 'damage', to: 'enemySpire', n: { count: 'glyphsThisRound', mul: 1 } }] }],
  },
  {
    id: 'under-wireboundthug', name: 'Wirebound Thug', faction: 'under', type: 'unit', cost: 2, power: 2, health: 2, tribe: 'syndicate',
    keywords: ['dread'],
    text: 'Dread. Resonant: I have Corrosive.',
    auras: [{ to: 'self', kw: ['corrosive'], cond: { c: 'resonant' } }],
  },
  {
    id: 'under-vattailor', name: 'Vat Tailor', faction: 'under', type: 'unit', cost: 3, power: 3, health: 3, tribe: 'syndicate',
    text: 'Deploy: an allied hero gains Corrosive.',
    abilities: [{ on: 'deploy', targets: [{ what: 'unit', side: 'ally', filter: { hero: true } }], ops: [{ op: 'grant', to: 'target0', kw: ['corrosive'] }] }],
  },
  {
    id: 'under-interestcollector', name: 'Interest Collector', faction: 'under', type: 'unit', cost: 3, power: 2, health: 3, tribe: 'syndicate',
    text: 'Dusk: deal 1 damage to every damaged enemy unit.',
    abilities: [{ on: 'dusk', ops: [{ op: 'damage', to: { from: 'enemies', filter: { damaged: true } }, n: 1 }] }],
  },
  {
    id: 'under-grudgekeeper', name: 'Grudge Keeper', faction: 'under', type: 'unit', cost: 3, power: 2, health: 4, tribe: 'syndicate',
    text: 'When an enemy unit is destroyed, I get +1|+0.',
    abilities: [{ on: 'enemyDied', ops: [{ op: 'buff', to: 'self', power: 1 }] }],
  },
  {
    id: 'under-persuasionengine', name: 'Persuasion Engine', faction: 'under', type: 'unit', cost: 4, power: 3, health: 4, tribe: 'construct',
    text: 'Deploy: an allied unit with Dread and an enemy unit strike each other.',
    abilities: [{
      on: 'deploy', targets: [{ what: 'unit', side: 'ally', filter: { kw: 'dread' } }, { what: 'unit', side: 'enemy' }],
      ops: [{ op: 'duel', a: 'target0', b: 'target1' }],
    }],
  },
  {
    id: 'under-debtassessor', name: 'Debt Assessor', faction: 'under', type: 'unit', cost: 4, power: 3, health: 3, tribe: 'syndicate',
    text: 'Deploy: deal 1 damage to an enemy unit for each card in your hand (at most 3).',
    abilities: [{ on: 'deploy', targets: [{ what: 'unit', side: 'enemy' }], ops: [{ op: 'damage', to: 'target0', n: { count: 'hand', mul: 1, max: 3 } }] }],
  },
  {
    id: 'under-noticeserver', name: 'Notice Server', faction: 'under', type: 'unit', cost: 5, power: 4, health: 4, tribe: 'syndicate',
    text: 'Deploy: destroy a damaged enemy unit. Resonant: I have Dread.',
    abilities: [{ on: 'deploy', targets: [{ what: 'unit', side: 'enemy', filter: { damaged: true } }], ops: [{ op: 'destroy', to: 'target0' }] }],
    auras: [{ to: 'self', kw: ['dread'], cond: { c: 'resonant' } }],
  },
  {
    id: 'under-taplinecolossus', name: 'Tap-Line Colossus', faction: 'under', type: 'unit', cost: 6, power: 4, health: 6, tribe: 'construct',
    keywords: ['siphon'],
    text: 'Siphon. When you cast a glyph, deal 1 damage to the enemy Spire.',
    abilities: [{ on: 'glyphCast', ops: [{ op: 'damage', to: 'enemySpire', n: 1 }] }],
  },
  {
    id: 'under-blackgatejuggernaut', name: 'Blackgate Juggernaut', faction: 'under', type: 'unit', cost: 7, power: 5, health: 6, tribe: 'construct',
    keywords: ['dread'],
    text: 'Dread. Allied units with Dread have Corrosive.',
    auras: [{ to: 'allies', filter: { kw: 'dread' }, kw: ['corrosive'] }],
  },
  {
    id: 'under-skimtop', name: 'Skim off the Top', faction: 'under', type: 'glyph', cost: 1, speed: 'flash',
    text: "Drain 1 from an enemy unit or the enemy Spire. If you've cast 2+ glyphs this round, drain 2 instead.",
    targets: [{ what: 'unitOrSpire', side: 'enemy' }],
    ops: [{
      op: 'if', cond: { c: 'seenRound', stat: 'glyphsCast', gte: 2 },
      then: [{ op: 'drain', to: 'target0', n: 2 }],
      else: [{ op: 'drain', to: 'target0', n: 1 }],
    }],
  },
  {
    id: 'under-calledtoaccount', name: 'Called to Account', faction: 'under', type: 'glyph', cost: 2, speed: 'flash',
    text: 'An allied hero gains Dueler and Corrosive this round.',
    targets: [{ what: 'unit', side: 'ally', filter: { hero: true } }],
    ops: [{ op: 'grant', to: 'target0', kw: ['dueler', 'corrosive'], dur: 'round' }],
  },
  {
    id: 'under-protectionfee', name: 'Protection Fee', faction: 'under', type: 'glyph', cost: 3, speed: 'flash',
    text: 'Drain 1 from every enemy unit and from the enemy Spire.',
    ops: [{ op: 'drain', to: 'enemies', n: 1 }, { op: 'drain', to: 'enemySpire', n: 1 }],
  },
  {
    id: 'under-makeexample', name: 'Make an Example', faction: 'under', type: 'glyph', cost: 2, speed: 'swift',
    text: 'Destroy an allied unit and deal damage equal to its power to an enemy unit.',
    targets: [{ what: 'unit', side: 'ally' }, { what: 'unit', side: 'enemy' }], needsAllTargets: true,
    ops: [{ op: 'destroy', to: 'target0' }, { op: 'damage', to: 'target1', n: { count: 'target0Power' } }],
  },
  {
    id: 'under-streettax', name: 'Street Tax', faction: 'under', type: 'glyph', cost: 3, speed: 'swift',
    text: 'Drain 1 from the enemy Spire for each enemy unit, at most 4.',
    ops: [{ op: 'drain', to: 'enemySpire', n: { count: 'enemies', mul: 1, max: 4 } }],
  },
  {
    id: 'under-backalleylesson', name: 'Back-Alley Lesson', faction: 'under', type: 'glyph', cost: 4, speed: 'swift',
    text: 'Each allied unit with Dread strikes an enemy unit.',
    targets: [{ what: 'unit', side: 'enemy' }],
    ops: [{ op: 'strike', from: { from: 'allies', filter: { kw: 'dread' } }, to: 'target0' }],
  },
  {
    id: 'under-foreclosure', name: 'Foreclosure', faction: 'under', type: 'glyph', cost: 5, speed: 'swift',
    text: 'Drain 2 from every damaged enemy unit and 2 from the enemy Spire.',
    ops: [{ op: 'drain', to: { from: 'enemies', filter: { damaged: true } }, n: 2 }, { op: 'drain', to: 'enemySpire', n: 2 }],
  },
  {
    id: 'under-lightsout', name: 'Lights Out', faction: 'under', type: 'glyph', cost: 4, speed: 'ritual',
    text: 'Allied units gain Dread this round. Resonant: they also gain Corrosive this round.',
    ops: [
      { op: 'grant', to: 'allies', kw: ['dread'], dur: 'round' },
      { op: 'if', cond: { c: 'resonant' }, then: [{ op: 'grant', to: 'allies', kw: ['corrosive'], dur: 'round' }] },
    ],
  },
  {
    id: 'under-hostiletakeover', name: 'Hostile Takeover', faction: 'under', type: 'glyph', cost: 6, speed: 'ritual',
    text: 'Destroy an enemy unit. Drain 2 from the enemy Spire.',
    targets: [{ what: 'unit', side: 'enemy' }],
    ops: [{ op: 'destroy', to: 'target0' }, { op: 'drain', to: 'enemySpire', n: 2 }],
  },

  // ---------- set x1: The Mirror Quarter ----------
  // Forgers and body-snatchers: copies of destroyed enemies, Veiled assassins with Corrosive, forged enemy glyphs.
  // The forger (Lisk): copiesMade.
  {
    id: 'under-lisk', name: 'Ansel Lisk, Facesmith', faction: 'under', type: 'hero', cost: 3, power: 2, health: 3,
    tribe: 'syndicate', set: 'x1',
    text: 'Dawn: copy the weakest enemy unit (Glimmer).',
    abilities: [{ on: 'dawn', ops: [{ op: 'copy', of: 'weakestEnemy', glimmer: true }] }],
    level: { who: 'you', stat: 'copiesMade', n: 6, text: "You've copied 6+ cards" },
    ascended: {
      name: 'Lisk, Who Wears the Dead', power: 4, health: 5,
      text: 'Dawn: copy the strongest enemy unit (Glimmer). Ascend: copy the strongest enemy unit, then destroy it.',
      abilities: [
        { on: 'dawn', ops: [{ op: 'copy', of: 'strongestEnemy', glimmer: true }] },
        { on: 'ascend', ops: [{ op: 'copy', of: 'strongestEnemy' }, { op: 'destroy', to: 'strongestEnemy' }] },
      ],
    },
  },
  {
    id: 'under-coffintout', name: 'Coffin Tout', faction: 'under', type: 'unit', cost: 1, power: 1, health: 1, tribe: 'syndicate', set: 'x1',
    text: 'Shatter: copy a random enemy unit (Glimmer).',
    abilities: [{ on: 'shatter', ops: [{ op: 'copy', of: 'randomEnemy', glimmer: true }] }],
  },
  {
    id: 'under-silkgarrotte', name: 'Silk Garrotte', faction: 'under', type: 'unit', cost: 2, power: 1, health: 1, tribe: 'syndicate', set: 'x1',
    keywords: ['veiled', 'corrosive', 'dread'],
    text: 'Veiled, Corrosive, Dread.',
  },
  {
    id: 'under-wiretaplistener', name: 'Wiretap Listener', faction: 'under', type: 'unit', cost: 2, power: 2, health: 2, tribe: 'syndicate', set: 'x1',
    text: 'When the opponent casts a glyph, deal 1 damage to the enemy Spire.',
    abilities: [{ on: 'foeGlyph', ops: [{ op: 'damage', to: 'enemySpire', n: 1 }] }],
  },
  {
    id: 'under-moldtaker', name: 'Mold-Taker', faction: 'under', type: 'unit', cost: 3, power: 3, health: 3, tribe: 'syndicate', set: 'x1',
    text: 'Deploy: copy another allied unit, then destroy it.',
    abilities: [{ on: 'deploy', targets: [{ what: 'unit', side: 'ally' }], ops: [{ op: 'copy', of: 'target0' }, { op: 'destroy', to: 'target0' }] }],
  },
  {
    id: 'under-borrowedface', name: 'Borrowed Face', faction: 'under', type: 'unit', cost: 3, power: 2, health: 3, tribe: 'syndicate', set: 'x1',
    keywords: ['veiled'],
    text: 'Veiled. Deploy: copy an enemy unit (Glimmer).',
    abilities: [{ on: 'deploy', targets: [{ what: 'unit', side: 'enemy' }], ops: [{ op: 'copy', of: 'target0', glimmer: true }] }],
  },
  {
    id: 'under-resurrectionist', name: 'Midnight Resurrectionist', faction: 'under', type: 'unit', cost: 4, power: 3, health: 4, tribe: 'syndicate', set: 'x1',
    text: 'When an enemy unit is destroyed, copy it (Glimmer). Resonant: the copy is not Glimmer.',
    abilities: [{
      on: 'enemyDied',
      ops: [{
        op: 'if', cond: { c: 'resonant' },
        then: [{ op: 'copy', of: 'trigger' }],
        else: [{ op: 'copy', of: 'trigger', glimmer: true }],
      }],
    }],
  },
  {
    id: 'under-gravebagsnatcher', name: 'Gravebag Snatcher', faction: 'under', type: 'unit', cost: 5, power: 3, health: 3, tribe: 'syndicate', set: 'x1',
    text: 'Deploy: copy an enemy unit with 3 or less power, then destroy it.',
    abilities: [{
      on: 'deploy', targets: [{ what: 'unit', side: 'enemy', filter: { maxPower: 3 } }],
      ops: [{ op: 'copy', of: 'target0' }, { op: 'destroy', to: 'target0' }],
    }],
  },
  {
    id: 'under-masqueradeengine', name: 'Masquerade Engine', faction: 'under', type: 'unit', cost: 7, power: 5, health: 5, tribe: 'construct', set: 'x1',
    keywords: ['veiled', 'corrosive'],
    text: 'Veiled, Corrosive. Assault: copy every enemy unit (Glimmer).',
    abilities: [{ on: 'assault', ops: [{ op: 'copy', of: 'enemies', glimmer: true }] }],
  },
  {
    id: 'under-switchedmorgue', name: 'Switched at the Morgue', faction: 'under', type: 'glyph', cost: 1, speed: 'flash', set: 'x1',
    text: 'Destroy an allied unit. Copy the strongest enemy unit (Glimmer).',
    targets: [{ what: 'unit', side: 'ally' }],
    ops: [{ op: 'destroy', to: 'target0' }, { op: 'copy', of: 'strongestEnemy', glimmer: true }],
  },
  {
    id: 'under-velvetknife', name: 'Velvet Knife', faction: 'under', type: 'glyph', cost: 2, speed: 'flash', set: 'x1',
    text: 'An allied unit with Veiled gets +2|+0 and gains Corrosive this round.',
    targets: [{ what: 'unit', side: 'ally', filter: { kw: 'veiled' } }],
    ops: [{ op: 'buff', to: 'target0', power: 2, dur: 'round' }, { op: 'grant', to: 'target0', kw: ['corrosive'], dur: 'round' }],
  },
  {
    id: 'under-counterfeitseal', name: 'Counterfeit Seal', faction: 'under', type: 'glyph', cost: 2, speed: 'swift', set: 'x1',
    text: 'Copy an enemy glyph. Deal 1 damage to the enemy Spire.',
    targets: [{ what: 'glyph', side: 'enemy' }],
    ops: [{ op: 'copy', of: 'target0' }, { op: 'damage', to: 'enemySpire', n: 1 }],
  },
  {
    id: 'under-deadmansecho', name: "Dead Man's Echo", faction: 'under', type: 'glyph', cost: 3, speed: 'swift', set: 'x1',
    keywords: ['reprise'],
    text: 'Reprise. Destroy a damaged enemy unit.',
    targets: [{ what: 'unit', side: 'enemy', filter: { damaged: true } }],
    ops: [{ op: 'destroy', to: 'target0' }],
  },
  {
    id: 'under-grandforgery', name: 'The Grand Forgery', faction: 'under', type: 'glyph', cost: 3, speed: 'ritual', set: 'x1',
    text: 'Copy the strongest enemy unit. Resonant: also copy every enemy unit (Glimmer).',
    ops: [
      { op: 'copy', of: 'strongestEnemy' },
      { op: 'if', cond: { c: 'resonant' }, then: [{ op: 'copy', of: 'enemies', glimmer: true }] },
    ],
  },
];

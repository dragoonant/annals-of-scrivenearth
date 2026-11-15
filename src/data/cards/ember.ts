// Emberworks: the foundry district. Direct damage, Unstable constructs, Vanguard.
import type { CardDef } from '../../engine/types';

export const ember: CardDef[] = [
  {
    id: 'ember-kessa', name: 'Kessa Flint, Sparkwright', faction: 'ember', type: 'hero', cost: 2, power: 2, health: 3,
    tribe: 'artificer',
    text: 'Deploy: deal 1 to an enemy unit or the enemy Spire.',
    abilities: [{ on: 'deploy', targets: [{ what: 'unitOrSpire', side: 'enemy' }], ops: [{ op: 'damage', to: 'target0', n: 1 }] }],
    level: { who: 'you', stat: 'glyphDamage', n: 8, text: 'Your glyphs and abilities have dealt 8+ damage' },
    ascended: {
      name: 'Kessa, Stormforge', power: 3, health: 4,
      text: 'Deploy: deal 1 to an enemy unit or the enemy Spire. When you cast a glyph, deal 2 to the enemy Spire. Ascend: deal 2 to every enemy unit.',
      abilities: [
        { on: 'deploy', targets: [{ what: 'unitOrSpire', side: 'enemy' }], ops: [{ op: 'damage', to: 'target0', n: 1 }] },
        { on: 'glyphCast', ops: [{ op: 'damage', to: 'enemySpire', n: 2 }] },
        { on: 'ascend', ops: [{ op: 'damage', to: 'enemies', n: 2 }] },
      ],
    },
  },
  {
    id: 'ember-crucible', name: 'Grand Crucible Mk. IX', faction: 'ember', type: 'hero', cost: 6, power: 5, health: 6,
    tribe: 'construct',
    text: 'Dawn: summon a Sparkbot.',
    abilities: [{ on: 'dawn', ops: [{ op: 'summon', card: 'ember-sparkbot' }] }],
    level: { who: 'you', stat: 'unitsSummoned', n: 10, text: "You've summoned 10+ units" },
    ascended: {
      name: 'Crucible Ascendant', power: 7, health: 7, keywords: ['pierce'],
      text: 'Pierce. Dawn: summon a Slagling. When another ally is destroyed, deal 1 to the enemy Spire. Ascend: summon 2 Slaglings.',
      abilities: [
        { on: 'dawn', ops: [{ op: 'summon', card: 'ember-slagling' }] },
        { on: 'allyDied', ops: [{ op: 'damage', to: 'enemySpire', n: 1 }] },
        { on: 'ascend', ops: [{ op: 'summon', card: 'ember-slagling', n: 2 }] },
      ],
    },
  },
  {
    id: 'ember-sparkbot', name: 'Sparkbot', faction: 'ember', type: 'unit', cost: 1, power: 1, health: 1, token: true,
    keywords: ['unstable'], tribe: 'construct', text: 'Unstable.',
  },
  {
    id: 'ember-slagling', name: 'Slagling', faction: 'ember', type: 'unit', cost: 2, power: 3, health: 1, token: true,
    keywords: ['unstable', 'vanguard'], tribe: 'construct', text: 'Unstable, Vanguard.',
  },

  // ---------- collectible units ----------
  {
    id: 'ember-cinderscamp', name: 'Cinder Scamp', faction: 'ember', type: 'unit', cost: 1, power: 1, health: 1, tribe: 'construct',
    text: 'Deploy: summon a Sparkbot.',
    abilities: [{ on: 'deploy', ops: [{ op: 'summon', card: 'ember-sparkbot' }] }],
  },
  {
    id: 'ember-kilnhand', name: 'Kiln Hand', faction: 'ember', type: 'unit', cost: 1, power: 1, health: 1, tribe: 'smith',
    text: 'Shatter: deal 1 to the enemy Spire.',
    abilities: [{ on: 'shatter', ops: [{ op: 'damage', to: 'enemySpire', n: 1 }] }],
  },
  {
    id: 'ember-ashrunner', name: 'Ash Runner', faction: 'ember', type: 'unit', cost: 1, power: 2, health: 1, tribe: 'construct',
    keywords: ['vanguard'], text: 'Vanguard.',
  },
  {
    id: 'ember-slagsmith', name: 'Slag-Smith', faction: 'ember', type: 'unit', cost: 2, power: 2, health: 2, tribe: 'smith',
    text: 'Deploy: deal 1 to an enemy unit.',
    abilities: [{ on: 'deploy', targets: [{ what: 'unit', side: 'enemy' }], ops: [{ op: 'damage', to: 'target0', n: 1 }] }],
  },
  {
    id: 'ember-sparkforge', name: 'Spark Forge', faction: 'ember', type: 'unit', cost: 2, power: 1, health: 3, tribe: 'construct',
    text: 'When you cast a glyph, summon a Sparkbot.',
    abilities: [{ on: 'glyphCast', ops: [{ op: 'summon', card: 'ember-sparkbot' }] }],
  },
  {
    id: 'ember-fuseguard', name: 'Fuse Guard', faction: 'ember', type: 'unit', cost: 2, power: 2, health: 1, tribe: 'construct',
    text: 'Shatter: deal 2 to a random enemy unit.',
    abilities: [{ on: 'shatter', ops: [{ op: 'damage', to: 'randomEnemy', n: 2 }] }],
  },
  {
    id: 'ember-furnacebrute', name: 'Furnace Brute', faction: 'ember', type: 'unit', cost: 3, power: 3, health: 3, tribe: 'construct',
    keywords: ['vanguard'], text: 'Vanguard. Resonant: I have +1|+1.',
    auras: [{ to: 'self', power: 1, health: 1, cond: { c: 'resonant' } }],
  },
  {
    id: 'ember-arcwelder', name: 'Arc Welder', faction: 'ember', type: 'unit', cost: 3, power: 2, health: 3, tribe: 'smith',
    text: 'Deploy: deal 2 to an enemy unit. Resonant: deal 3 instead.',
    abilities: [{
      on: 'deploy', targets: [{ what: 'unit', side: 'enemy' }],
      ops: [{ op: 'if', cond: { c: 'resonant' }, then: [{ op: 'damage', to: 'target0', n: 3 }], else: [{ op: 'damage', to: 'target0', n: 2 }] }],
    }],
  },
  {
    id: 'ember-furnacetender', name: 'Furnace Tender', faction: 'ember', type: 'unit', cost: 3, power: 2, health: 3, tribe: 'smith',
    text: 'Deploy: summon a Slagling.',
    abilities: [{ on: 'deploy', ops: [{ op: 'summon', card: 'ember-slagling' }] }],
  },
  {
    id: 'ember-blastminer', name: 'Blast Miner', faction: 'ember', type: 'unit', cost: 4, power: 3, health: 3, tribe: 'smith',
    text: 'Shatter: deal 2 to every enemy unit.',
    abilities: [{ on: 'shatter', ops: [{ op: 'damage', to: 'enemies', n: 2 }] }],
  },
  {
    id: 'ember-pyrelancer', name: 'Pyre Lancer', faction: 'ember', type: 'unit', cost: 4, power: 3, health: 3, tribe: 'construct',
    keywords: ['vanguard'], text: 'Vanguard. Assault: deal 1 to the enemy Spire.',
    abilities: [{ on: 'assault', ops: [{ op: 'damage', to: 'enemySpire', n: 1 }] }],
  },
  {
    id: 'ember-moltenwarden', name: 'Molten Warden', faction: 'ember', type: 'unit', cost: 5, power: 4, health: 4, tribe: 'construct',
    text: 'Deploy: deal 3 to an enemy unit.',
    abilities: [{ on: 'deploy', targets: [{ what: 'unit', side: 'enemy' }], ops: [{ op: 'damage', to: 'target0', n: 3 }] }],
  },
  {
    id: 'ember-crucibleherald', name: 'Crucible Herald', faction: 'ember', type: 'unit', cost: 6, power: 3, health: 5, tribe: 'smith',
    text: 'Deploy: summon 3 Slaglings.',
    abilities: [{ on: 'deploy', ops: [{ op: 'summon', card: 'ember-slagling', n: 3 }] }],
  },
  {
    id: 'ember-foundrytitan', name: 'Foundry Titan', faction: 'ember', type: 'unit', cost: 7, power: 6, health: 7, tribe: 'construct',
    keywords: ['pierce'], text: 'Pierce. Deploy: deal 2 to every enemy unit.',
    abilities: [{ on: 'deploy', ops: [{ op: 'damage', to: 'enemies', n: 2 }] }],
  },
  // ---------- collectible glyphs ----------
  {
    id: 'ember-overdrive', name: 'Overdrive', faction: 'ember', type: 'glyph', cost: 1, speed: 'flash',
    text: 'An ally gets +2|+0 this round.',
    targets: [{ what: 'unit', side: 'ally' }], ops: [{ op: 'buff', to: 'target0', power: 2, dur: 'round' }],
  },
  {
    id: 'ember-pinprick', name: 'Pinprick', faction: 'ember', type: 'glyph', cost: 2, speed: 'flash',
    text: 'Deal 1 to an enemy unit or the enemy Spire.',
    targets: [{ what: 'unitOrSpire', side: 'enemy' }], ops: [{ op: 'damage', to: 'target0', n: 1 }],
  },
  {
    id: 'ember-ventburst', name: 'Vent Burst', faction: 'ember', type: 'glyph', cost: 3, speed: 'flash',
    text: 'Deal 2 to an enemy unit and 1 to the enemy Spire.',
    targets: [{ what: 'unit', side: 'enemy' }], ops: [{ op: 'damage', to: 'target0', n: 2 }, { op: 'damage', to: 'enemySpire', n: 1 }],
  },
  {
    id: 'ember-slagbolt', name: 'Slag Bolt', faction: 'ember', type: 'glyph', cost: 2, speed: 'swift',
    text: 'Deal 3 to an enemy unit.',
    targets: [{ what: 'unit', side: 'enemy' }], ops: [{ op: 'damage', to: 'target0', n: 3 }],
  },
  {
    id: 'ember-scrapburst', name: 'Scrap Burst', faction: 'ember', type: 'glyph', cost: 2, speed: 'swift',
    text: 'Destroy an ally. Deal 3 to the enemy Spire.',
    targets: [{ what: 'unit', side: 'ally' }], ops: [{ op: 'destroy', to: 'target0' }, { op: 'damage', to: 'enemySpire', n: 3 }],
  },
  {
    id: 'ember-heatlance', name: 'Heat Lance', faction: 'ember', type: 'glyph', cost: 3, speed: 'swift',
    text: 'Deal 3 to an enemy unit or the enemy Spire.',
    targets: [{ what: 'unitOrSpire', side: 'enemy' }], ops: [{ op: 'damage', to: 'target0', n: 3 }],
  },
  {
    id: 'ember-cinderhail', name: 'Cinder Hail', faction: 'ember', type: 'glyph', cost: 4, speed: 'swift',
    text: 'Deal 2 to every enemy unit.',
    ops: [{ op: 'damage', to: 'enemies', n: 2 }],
  },
  {
    id: 'ember-sparkcascade', name: 'Spark Cascade', faction: 'ember', type: 'glyph', cost: 3, speed: 'ritual',
    text: 'Summon 2 Sparkbots. Resonant: summon 2 more.',
    ops: [{ op: 'summon', card: 'ember-sparkbot', n: 2 }, { op: 'if', cond: { c: 'resonant' }, then: [{ op: 'summon', card: 'ember-sparkbot', n: 2 }] }],
  },
  {
    id: 'ember-firestorm', name: 'Foundry Firestorm', faction: 'ember', type: 'glyph', cost: 6, speed: 'ritual',
    text: 'Deal 3 to every enemy unit and 2 to the enemy Spire.',
    ops: [{ op: 'damage', to: 'enemies', n: 3 }, { op: 'damage', to: 'enemySpire', n: 2 }],
  },
];

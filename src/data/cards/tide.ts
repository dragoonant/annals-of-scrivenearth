// Tidewardens: the canal mages. Card draw, Stasis, recall, glyph synergy.
import type { CardDef } from '../../engine/types';

export const tide: CardDef[] = [
  {
    id: 'tide-maren', name: 'Maren Deepglass', faction: 'tide', type: 'hero', cost: 3, power: 2, health: 4,
    tribe: 'mage',
    text: 'When you cast a glyph, I get +1|+0 this round.',
    abilities: [{ on: 'glyphCast', ops: [{ op: 'buff', to: 'self', power: 1, dur: 'round' }] }],
    level: { who: 'you', stat: 'glyphsCast', n: 6, text: "You've cast 6+ glyphs" },
    ascended: {
      name: 'Maren, Voice of the Canals', power: 3, health: 5,
      text: 'Your glyphs cost 1 less. When you cast a glyph, I get +1|+1. Ascend: draw 2.',
      costAuras: [{ type: 'glyph', n: -1 }],
      abilities: [
        { on: 'glyphCast', ops: [{ op: 'buff', to: 'self', power: 1, health: 1 }] },
        { on: 'ascend', ops: [{ op: 'draw', n: 2 }] },
      ],
    },
  },
  {
    id: 'tide-ilvane', name: 'Ilvane, Stillwater Sage', faction: 'tide', type: 'hero', cost: 5, power: 3, health: 6,
    tribe: 'mage',
    text: 'Deploy: put an enemy unit in Stasis.',
    abilities: [{ on: 'deploy', targets: [{ what: 'unit', side: 'enemy' }], ops: [{ op: 'stasis', to: 'target0' }] }],
    level: { who: 'you', stat: 'stasisApplied', n: 4, text: "You've put enemy units in Stasis 4+ times" },
    ascended: {
      name: 'Ilvane, the Frozen Hour', power: 4, health: 7,
      text: 'Deploy: put an enemy unit in Stasis. Dawn: put the strongest enemy in Stasis. Ascend: put every enemy unit in Stasis.',
      abilities: [
        { on: 'deploy', targets: [{ what: 'unit', side: 'enemy' }], ops: [{ op: 'stasis', to: 'target0' }] },
        { on: 'dawn', ops: [{ op: 'stasis', to: 'strongestEnemy' }] },
        { on: 'ascend', ops: [{ op: 'stasis', to: 'enemies' }] },
      ],
    },
  },

  // ---------- units ----------
  {
    id: 'tide-sluicepage', name: 'Sluice Page', faction: 'tide', type: 'unit', cost: 1, power: 1, health: 1, tribe: 'mage',
    text: 'Deploy: draw 1.',
    abilities: [{ on: 'deploy', ops: [{ op: 'draw', n: 1 }] }],
  },
  {
    id: 'tide-ripplescribe', name: 'Ripple Scribe', faction: 'tide', type: 'unit', cost: 1, power: 1, health: 2, tribe: 'mage',
    text: 'When you cast a glyph, I get +1|+0 this round.',
    abilities: [{ on: 'glyphCast', ops: [{ op: 'buff', to: 'self', power: 1, dur: 'round' }] }],
  },
  {
    id: 'tide-mirroreel', name: 'Mirror Eel', faction: 'tide', type: 'unit', cost: 1, power: 1, health: 1, tribe: 'beast',
    text: 'Deploy: put an enemy unit with 2 or less power in Stasis.',
    abilities: [{ on: 'deploy', targets: [{ what: 'unit', side: 'enemy', filter: { maxPower: 2 } }], ops: [{ op: 'stasis', to: 'target0' }] }],
  },
  {
    id: 'tide-wardtender', name: 'Ward-Tender', faction: 'tide', type: 'unit', cost: 2, power: 1, health: 3, tribe: 'mage',
    keywords: ['ward'],
    text: 'Ward.',
  },
  {
    id: 'tide-eddycourier', name: 'Eddy Courier', faction: 'tide', type: 'unit', cost: 2, power: 2, health: 2, tribe: 'mage',
    text: 'Deploy: return an allied unit to your hand.',
    abilities: [{ on: 'deploy', targets: [{ what: 'unit', side: 'ally' }], ops: [{ op: 'recall', to: 'target0' }] }],
  },
  {
    id: 'tide-driftseer', name: 'Drift Seer', faction: 'tide', type: 'unit', cost: 2, power: 1, health: 2, tribe: 'mage',
    text: 'Dusk: if you cast 2 or more glyphs this round, draw 1.',
    abilities: [{ on: 'dusk', cond: { c: 'seenRound', stat: 'glyphsCast', gte: 2 }, ops: [{ op: 'draw', n: 1 }] }],
  },
  {
    id: 'tide-lockkeeper', name: 'Lock-Keeper', faction: 'tide', type: 'unit', cost: 3, power: 2, health: 4, tribe: 'mage',
    text: 'Deploy: return an enemy unit with 2 or less power to its owner\'s hand. Resonant: I have +1|+1.',
    abilities: [{ on: 'deploy', targets: [{ what: 'unit', side: 'enemy', filter: { maxPower: 2 } }], ops: [{ op: 'recall', to: 'target0' }] }],
    auras: [{ to: 'self', power: 1, health: 1, cond: { c: 'resonant' } }],
  },
  {
    id: 'tide-hushwateradept', name: 'Hushwater Adept', faction: 'tide', type: 'unit', cost: 3, power: 2, health: 3, tribe: 'mage',
    text: 'When you cast a glyph, put the weakest enemy in Stasis.',
    abilities: [{ on: 'glyphCast', ops: [{ op: 'stasis', to: 'weakestEnemy' }] }],
  },
  {
    id: 'tide-glassarchivist', name: 'Glass Archivist', faction: 'tide', type: 'unit', cost: 3, power: 2, health: 3, tribe: 'mage',
    text: 'Deploy: draw 1. Resonant: draw 2 instead.',
    abilities: [{
      on: 'deploy',
      ops: [{ op: 'if', cond: { c: 'resonant' }, then: [{ op: 'draw', n: 2 }], else: [{ op: 'draw', n: 1 }] }],
    }],
  },
  {
    id: 'tide-stillwaterbailiff', name: 'Stillwater Bailiff', faction: 'tide', type: 'unit', cost: 4, power: 3, health: 4, tribe: 'mage',
    text: 'Deploy: put an enemy unit in Stasis.',
    abilities: [{ on: 'deploy', targets: [{ what: 'unit', side: 'enemy' }], ops: [{ op: 'stasis', to: 'target0' }] }],
  },
  {
    id: 'tide-pearlsentinel', name: 'Pearl Sentinel', faction: 'tide', type: 'unit', cost: 4, power: 2, health: 5, tribe: 'construct',
    keywords: ['ward'],
    text: 'Ward. Resonant: I have +1|+1.',
    auras: [{ to: 'self', power: 1, health: 1, cond: { c: 'resonant' } }],
  },
  {
    id: 'tide-deepwateroracle', name: 'Deepwater Oracle', faction: 'tide', type: 'unit', cost: 5, power: 3, health: 5, tribe: 'mage',
    text: 'Deploy: draw 2.',
    abilities: [{ on: 'deploy', ops: [{ op: 'draw', n: 2 }] }],
  },
  {
    id: 'tide-frostmeremagistrate', name: 'Frostmere Magistrate', faction: 'tide', type: 'unit', cost: 6, power: 4, health: 6, tribe: 'mage',
    text: 'Deploy: put two enemy units in Stasis.',
    abilities: [{
      on: 'deploy',
      targets: [{ what: 'unit', side: 'enemy' }, { what: 'unit', side: 'enemy' }],
      ops: [{ op: 'stasis', to: 'target0' }, { op: 'stasis', to: 'target1' }],
    }],
  },
  {
    id: 'tide-gateleviathan', name: 'Leviathan of the Locks', faction: 'tide', type: 'unit', cost: 7, power: 5, health: 7, tribe: 'beast',
    text: 'Deploy: return all enemy units to their owners\' hands.',
    abilities: [{ on: 'deploy', ops: [{ op: 'recall', to: 'enemies' }] }],
  },

  // ---------- glyphs ----------
  {
    id: 'tide-slipunder', name: 'Slip Under', faction: 'tide', type: 'glyph', cost: 1, speed: 'flash',
    text: 'Return an allied unit to your hand.',
    targets: [{ what: 'unit', side: 'ally' }], ops: [{ op: 'recall', to: 'target0' }],
  },
  {
    id: 'tide-heldbreath', name: 'Held Breath', faction: 'tide', type: 'glyph', cost: 2, speed: 'flash',
    text: 'Put an enemy unit in Stasis.',
    targets: [{ what: 'unit', side: 'enemy' }], ops: [{ op: 'stasis', to: 'target0' }],
  },
  {
    id: 'tide-tidalveil', name: 'Tidal Veil', faction: 'tide', type: 'glyph', cost: 2, speed: 'flash',
    text: 'An allied unit gains Ward.',
    targets: [{ what: 'unit', side: 'ally' }], ops: [{ op: 'grant', to: 'target0', kw: ['ward'] }],
  },
  {
    id: 'tide-quickcurrent', name: 'Quick Current', faction: 'tide', type: 'glyph', cost: 2, speed: 'swift',
    text: 'Draw 1.',
    ops: [{ op: 'draw', n: 1 }],
  },
  {
    id: 'tide-unwrite', name: 'Unwrite', faction: 'tide', type: 'glyph', cost: 3, speed: 'swift',
    text: 'Negate an enemy glyph.',
    targets: [{ what: 'glyph', side: 'enemy' }], ops: [{ op: 'negate', to: 'target0' }],
  },
  {
    id: 'tide-backwash', name: 'Backwash', faction: 'tide', type: 'glyph', cost: 3, speed: 'swift',
    text: 'Return an enemy unit to its owner\'s hand.',
    targets: [{ what: 'unit', side: 'enemy' }], ops: [{ op: 'recall', to: 'target0' }],
  },
  {
    id: 'tide-sluiceclose', name: 'Sluice Close', faction: 'tide', type: 'glyph', cost: 4, speed: 'swift',
    text: 'Put two enemy units in Stasis.',
    targets: [{ what: 'unit', side: 'enemy' }, { what: 'unit', side: 'enemy' }],
    ops: [{ op: 'stasis', to: 'target0' }, { op: 'stasis', to: 'target1' }],
  },
  {
    id: 'tide-deepstudy', name: 'Deep Study', faction: 'tide', type: 'glyph', cost: 5, speed: 'ritual',
    text: 'Draw 3.',
    ops: [{ op: 'draw', n: 3 }],
  },
  {
    id: 'tide-floodtide', name: 'Flood Tide', faction: 'tide', type: 'glyph', cost: 6, speed: 'ritual',
    text: 'Put every enemy unit in Stasis. Draw 1.',
    ops: [{ op: 'stasis', to: 'enemies' }, { op: 'draw', n: 1 }],
  },
];

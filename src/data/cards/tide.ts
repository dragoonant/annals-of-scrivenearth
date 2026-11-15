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
];

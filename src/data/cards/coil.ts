// Verdant Coil: the rooftop biodomes. Big beasts, extra Charge, Mend, Pierce.
import type { CardDef } from '../../engine/types';

export const coil: CardDef[] = [
  {
    id: 'coil-aruvi', name: 'Aruvi, Thorn-Mother', faction: 'coil', type: 'hero', cost: 4, power: 3, health: 5,
    keywords: ['mend'], tribe: 'warden',
    text: 'Mend. When you summon another ally with 5+ power, it gets +1|+1.',
    abilities: [{ on: 'allySummoned', ops: [{ op: 'buff', to: { from: 'trigger', filter: { minPower: 5 } }, power: 1, health: 1 }] }],
    level: { who: 'you', stat: 'bigSummoned', n: 3, text: "You've summoned 3+ units with 5+ power" },
    ascended: {
      name: 'Aruvi, Heart of the Canopy', power: 4, health: 6, keywords: ['mend'],
      text: 'Mend. Allies with 5+ power have Pierce. Ascend: give every ally +2|+2.',
      auras: [{ to: 'allies', filter: { minPower: 5 }, kw: ['pierce'] }],
      abilities: [{ on: 'ascend', ops: [{ op: 'buff', to: 'allies', power: 2, health: 2 }] }],
    },
  },
  {
    id: 'coil-brakk', name: 'Brakk, Coilback Alpha', faction: 'coil', type: 'hero', cost: 6, power: 6, health: 6,
    keywords: ['pierce'], tribe: 'beast',
    text: 'Pierce.',
    level: { who: 'self', stat: 'damageDealt', n: 10, text: "I've dealt 10+ damage" },
    ascended: {
      name: 'Brakk, Apex', power: 8, health: 8, keywords: ['pierce', 'mend'],
      text: 'Pierce, Mend. Strike: I get +1|+1. Ascend: you may attack again this round.',
      abilities: [
        { on: 'strike', ops: [{ op: 'buff', to: 'self', power: 1, health: 1 }] },
        { on: 'ascend', ops: [{ op: 'rally' }] },
      ],
    },
  },
];

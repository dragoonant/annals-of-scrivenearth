// Prismguard: the wardens of the upper tiers. Plated, Ward, Spotter, wide buffs, repair.
import type { CardDef } from '../../engine/types';

export const prism: CardDef[] = [
  {
    id: 'prism-ysolde', name: 'Ysolde, Shield-Captain', faction: 'prism', type: 'hero', cost: 3, power: 2, health: 4,
    keywords: ['plated'], tribe: 'warden',
    text: 'Plated. Dusk: repair every ally by 1.',
    abilities: [{ on: 'dusk', ops: [{ op: 'heal', to: 'allies', n: 1 }] }],
    level: { who: 'you', stat: 'allySurvivals', n: 6, text: 'Your units have survived damage 6+ times' },
    ascended: {
      name: 'Ysolde, Aegis of the Tiers', power: 3, health: 5, keywords: ['plated'],
      text: 'Plated. Other allies have +1|+1. Dusk: repair every ally by 1. Ascend: give every ally Ward.',
      auras: [{ to: 'otherAllies', power: 1, health: 1 }],
      abilities: [
        { on: 'dusk', ops: [{ op: 'heal', to: 'allies', n: 1 }] },
        { on: 'ascend', ops: [{ op: 'grant', to: 'allies', kw: ['ward'] }] },
      ],
    },
  },
  {
    id: 'prism-oren', name: 'Oren Halvard, the Lightwall', faction: 'prism', type: 'hero', cost: 5, power: 3, health: 7,
    keywords: ['spotter'], tribe: 'warden',
    text: 'Spotter. When I survive damage, I get +1|+0.',
    abilities: [{ on: 'survive', ops: [{ op: 'buff', to: 'self', power: 1 }] }],
    level: { who: 'self', stat: 'survivals', n: 3, text: "I've survived damage 3+ times" },
    ascended: {
      name: 'Oren, Unbroken', power: 5, health: 8, keywords: ['spotter', 'plated'],
      text: 'Spotter, Plated. When I survive damage, I get +1|+0 and deal 2 to the strongest enemy. Ascend: repair your Spire by 4.',
      abilities: [
        { on: 'survive', ops: [{ op: 'buff', to: 'self', power: 1 }, { op: 'damage', to: 'strongestEnemy', n: 2 }] },
        { on: 'ascend', ops: [{ op: 'heal', to: 'mySpire', n: 4 }] },
      ],
    },
  },
];

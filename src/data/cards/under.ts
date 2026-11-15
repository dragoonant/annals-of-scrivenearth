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
];

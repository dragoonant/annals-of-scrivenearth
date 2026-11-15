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
];

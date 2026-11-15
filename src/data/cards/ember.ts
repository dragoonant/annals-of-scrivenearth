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
];

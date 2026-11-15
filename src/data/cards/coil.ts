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
  // ---------- units ----------
  {
    id: 'coil-sprout-tender', name: 'Sprout Tender', faction: 'coil', type: 'unit', cost: 1, power: 0, health: 2,
    tribe: 'gardener', text: 'Dawn: gain 1 Charge.',
    abilities: [{ on: 'dawn', ops: [{ op: 'charge', n: 1 }] }],
  },
  {
    id: 'coil-thornback-cub', name: 'Thornback Cub', faction: 'coil', type: 'unit', cost: 1, power: 1, health: 2,
    keywords: ['mend'], tribe: 'beast', text: 'Mend.',
  },
  {
    id: 'coil-rootling', name: 'Conduit Rootling', faction: 'coil', type: 'unit', cost: 1, power: 1, health: 1,
    tribe: 'machine', text: 'Deploy: raise your maximum Charge by 1.',
    abilities: [{ on: 'deploy', ops: [{ op: 'maxCharge', n: 1 }] }],
  },
  {
    id: 'coil-spearhorn', name: 'Spearhorn', faction: 'coil', type: 'unit', cost: 2, power: 2, health: 2,
    keywords: ['pierce'], tribe: 'beast', text: 'Pierce.',
  },
  {
    id: 'coil-vinewhip', name: 'Vinewhip Stalker', faction: 'coil', type: 'unit', cost: 2, power: 2, health: 1,
    tribe: 'beast', text: 'Deploy: I strike an enemy unit.',
    abilities: [{ on: 'deploy', targets: [{ what: 'unit', side: 'enemy' }], ops: [{ op: 'strike', from: 'self', to: 'target0' }] }],
  },
  {
    id: 'coil-sap-engine', name: 'Sap Engine', faction: 'coil', type: 'unit', cost: 2, power: 1, health: 2,
    tribe: 'machine', text: 'Deploy: gain 2 Charge.',
    abilities: [{ on: 'deploy', ops: [{ op: 'charge', n: 2 }] }],
  },
  {
    id: 'coil-crownmaw', name: 'Crownmaw', faction: 'coil', type: 'unit', cost: 3, power: 3, health: 3,
    tribe: 'beast', text: 'I have +2|+0 while you control 2 or more other allies.',
    auras: [{ to: 'self', power: 2, cond: { c: 'count', of: 'otherAllies', gte: 2 } }],
  },
  {
    id: 'coil-bloomcaller', name: 'Bloomcaller', faction: 'coil', type: 'unit', cost: 3, power: 2, health: 3,
    tribe: 'gardener', text: 'Dawn: give another random ally +1|+0.',
    abilities: [{ on: 'dawn', ops: [{ op: 'buff', to: 'randomAlly', power: 1 }] }],
  },
  {
    id: 'coil-lashvine', name: 'Lashvine Brute', faction: 'coil', type: 'unit', cost: 3, power: 2, health: 3,
    tribe: 'beast', text: 'Assault: I strike the weakest enemy.',
    abilities: [{ on: 'assault', ops: [{ op: 'strike', from: 'self', to: 'weakestEnemy' }] }],
  },
  {
    id: 'coil-tuskhide', name: 'Tuskhide Bull', faction: 'coil', type: 'unit', cost: 4, power: 5, health: 3,
    keywords: ['pierce'], tribe: 'beast', text: 'Pierce. Resonant: I have +0|+2.',
    auras: [{ to: 'self', health: 2, cond: { c: 'resonant' } }],
  },
  {
    id: 'coil-spore-herald', name: 'Spore Herald', faction: 'coil', type: 'unit', cost: 4, power: 3, health: 4,
    tribe: 'gardener', text: 'Deploy: give every other ally +1|+1.',
    abilities: [{ on: 'deploy', ops: [{ op: 'buff', to: 'otherAllies', power: 1, health: 1 }] }],
  },
  {
    id: 'coil-canopy-titan', name: 'Canopy Titan', faction: 'coil', type: 'unit', cost: 5, power: 5, health: 5,
    keywords: ['pierce', 'mend'], tribe: 'beast', text: 'Pierce, Mend.',
  },
  {
    id: 'coil-behemoth', name: 'Root-Engine Behemoth', faction: 'coil', type: 'unit', cost: 6, power: 5, health: 5,
    keywords: ['pierce'], tribe: 'machine', text: 'Pierce. Deploy: I strike an enemy unit.',
    abilities: [{ on: 'deploy', targets: [{ what: 'unit', side: 'enemy' }], ops: [{ op: 'strike', from: 'self', to: 'target0' }] }],
  },
  {
    id: 'coil-domewyrm', name: 'Domewyrm', faction: 'coil', type: 'unit', cost: 7, power: 8, health: 7,
    keywords: ['pierce', 'mend'], tribe: 'beast', text: 'Pierce, Mend.',
  },
  // ---------- glyphs ----------
  {
    id: 'coil-sap-surge', name: 'Sap Surge', faction: 'coil', type: 'glyph', cost: 1, speed: 'flash',
    text: 'Gain 2 Charge.', ops: [{ op: 'charge', n: 2 }],
  },
  {
    id: 'coil-bristle', name: 'Bristle', faction: 'coil', type: 'glyph', cost: 2, speed: 'flash',
    text: 'Give an ally +3|+0 this round.',
    targets: [{ what: 'unit', side: 'ally' }], ops: [{ op: 'buff', to: 'target0', power: 3, dur: 'round' }],
  },
  {
    id: 'coil-overgrowth', name: 'Overgrowth', faction: 'coil', type: 'glyph', cost: 3, speed: 'flash',
    text: 'Give an ally +3|+3 and Pierce this round.',
    targets: [{ what: 'unit', side: 'ally' }],
    ops: [{ op: 'buff', to: 'target0', power: 3, health: 3, dur: 'round' }, { op: 'grant', to: 'target0', kw: ['pierce'], dur: 'round' }],
  },
  {
    id: 'coil-duel-of-thorns', name: 'Duel of Thorns', faction: 'coil', type: 'glyph', cost: 2, speed: 'swift',
    text: 'An ally and an enemy unit strike each other.',
    targets: [{ what: 'unit', side: 'ally' }, { what: 'unit', side: 'enemy' }],
    ops: [{ op: 'duel', a: 'target0', b: 'target1' }],
  },
  {
    id: 'coil-lash-out', name: 'Lash Out', faction: 'coil', type: 'glyph', cost: 3, speed: 'swift',
    text: 'An ally strikes an enemy unit.',
    targets: [{ what: 'unit', side: 'ally' }, { what: 'unit', side: 'enemy' }],
    ops: [{ op: 'strike', from: 'target0', to: 'target1' }],
  },
  {
    id: 'coil-grafting', name: 'Grafting', faction: 'coil', type: 'glyph', cost: 4, speed: 'swift',
    text: 'Give an ally +2|+2 and Mend.',
    targets: [{ what: 'unit', side: 'ally' }],
    ops: [{ op: 'buff', to: 'target0', power: 2, health: 2 }, { op: 'grant', to: 'target0', kw: ['mend'] }],
  },
  {
    id: 'coil-canopy-rampage', name: 'Canopy Rampage', faction: 'coil', type: 'glyph', cost: 5, speed: 'swift',
    text: 'Each ally with 4+ power strikes the strongest enemy.',
    ops: [{ op: 'strike', from: { from: 'allies', filter: { minPower: 4 } }, to: 'strongestEnemy' }],
  },
  {
    id: 'coil-hothouse-bloom', name: 'Hothouse Bloom', faction: 'coil', type: 'glyph', cost: 2, speed: 'ritual',
    text: 'Raise your maximum Charge by 1 and gain 1 Reserve. Resonant: raise your maximum Charge by 1 more.',
    ops: [
      { op: 'maxCharge', n: 1 }, { op: 'reserve', n: 1 },
      { op: 'if', cond: { c: 'resonant' }, then: [{ op: 'maxCharge', n: 1 }] },
    ],
  },
  {
    id: 'coil-verdant-surge', name: 'Verdant Surge', faction: 'coil', type: 'glyph', cost: 6, speed: 'ritual',
    text: 'Give every ally +3|+3.',
    ops: [{ op: 'buff', to: 'allies', power: 3, health: 3 }],
  },
];

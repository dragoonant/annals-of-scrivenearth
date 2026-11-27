// Orrery Conclave (set x2, The Starward Rise): the astronomers of the highest spire.
// Chart, units that Unfold, Conjunction, late-game constructs of starlight. Every card here has set: 'x2'.
// Heroes: Vessaly (star-reader, charted), Elsbet (clockwright, her own dawns),
// Pell (conjunction astronomer, unitsPlayed), Aurelind (starlight founder, bigSummoned from summoned constructs).
import type { CardDef } from '../../engine/types';

export const orrery: CardDef[] = [
  // ---------- heroes ----------
  {
    id: 'orrery-vessaly', name: 'Vessaly Farsight', faction: 'orrery', type: 'hero', set: 'x2', cost: 3, power: 2, health: 3,
    tribe: 'astronomer',
    text: 'Dawn: Chart a glyph (3).',
    abilities: [{ on: 'dawn', ops: [{ op: 'chart', n: 3, find: { type: 'glyph' } }] }],
    level: { who: 'you', stat: 'charted', n: 5, text: "You've drawn 5+ cards by Chart" },
    ascended: {
      name: 'Vessaly, Reader of the Long Night', power: 3, health: 4,
      text: 'Dawn: Chart a unit (4), then Chart a glyph (4). Ascend: draw 2.',
      abilities: [
        { on: 'dawn', ops: [{ op: 'chart', n: 4, find: { type: 'unit' } }, { op: 'chart', n: 4, find: { type: 'glyph' } }] },
        { on: 'ascend', ops: [{ op: 'draw', n: 2 }] },
      ],
    },
  },
  {
    id: 'orrery-elsbet', name: 'Elsbet Gearmoon', faction: 'orrery', type: 'hero', set: 'x2', cost: 2, power: 1, health: 4,
    tribe: 'astronomer',
    text: 'Dawn: repair your other allies by 1.',
    abilities: [{ on: 'dawn', ops: [{ op: 'heal', to: 'otherAllies', n: 1 }] }],
    level: { who: 'self', stat: 'dawns', n: 4, text: 'Started 4 rounds on the Line' },
    ascended: {
      name: 'Elsbet, Keeper of the Great Clock', power: 2, health: 6,
      text: 'Dawn: repair your other allies by 2 and give them +1|+0. Ascend: give your other allies +2|+2.',
      abilities: [
        { on: 'dawn', ops: [{ op: 'heal', to: 'otherAllies', n: 2 }, { op: 'buff', to: 'otherAllies', power: 1 }] },
        { on: 'ascend', ops: [{ op: 'buff', to: 'otherAllies', power: 2, health: 2 }] },
      ],
    },
  },
  {
    id: 'orrery-pell', name: 'Pell Dualstar', faction: 'orrery', type: 'hero', set: 'x2', cost: 3, power: 2, health: 3,
    tribe: 'astronomer',
    text: 'When you cast a glyph, if Conjunction, deal 1 to the strongest enemy.',
    abilities: [{ on: 'glyphCast', cond: { c: 'conjunction' }, ops: [{ op: 'damage', to: 'strongestEnemy', n: 1 }] }],
    level: { who: 'you', stat: 'unitsPlayed', n: 9, text: "You've played 9+ units and heroes from hand" },
    ascended: {
      name: 'Pell, Joiner of Spheres', power: 3, health: 4,
      text: 'When you cast a glyph, if Conjunction, deal 2 to the strongest enemy. When another ally is summoned, if Conjunction, give it +1|+1. Ascend: gain 3 Charge.',
      abilities: [
        { on: 'glyphCast', cond: { c: 'conjunction' }, ops: [{ op: 'damage', to: 'strongestEnemy', n: 2 }] },
        { on: 'allySummoned', cond: { c: 'conjunction' }, ops: [{ op: 'buff', to: 'trigger', power: 1, health: 1 }] },
        { on: 'ascend', ops: [{ op: 'charge', n: 3 }] },
      ],
    },
  },
  {
    id: 'orrery-aurelind', name: 'Aurelind Brightmason', faction: 'orrery', type: 'hero', set: 'x2', cost: 4, power: 2, health: 5,
    tribe: 'astronomer',
    text: 'Deploy: Chart a unit costing 5+ (5).',
    abilities: [{ on: 'deploy', ops: [{ op: 'chart', n: 5, find: { type: 'unit', minCost: 5 } }] }],
    level: { who: 'you', stat: 'bigSummoned', n: 3, text: "You've summoned 3+ units with 5+ power" },
    ascended: {
      name: 'Aurelind, Architect of Stars', power: 3, health: 6,
      text: 'Your units cost 1 less. Ascend: summon a Starlight Colossus.',
      costAuras: [{ type: 'unit', n: -1 }],
      abilities: [{ on: 'ascend', ops: [{ op: 'summon', card: 'orrery-starlightcolossus' }] }],
    },
  },

  // ---------- tokens ----------
  {
    id: 'orrery-starlightcolossus', name: 'Starlight Colossus', faction: 'orrery', type: 'unit', set: 'x2', cost: 5, power: 5, health: 5,
    tribe: 'construct', token: true, text: '',
  },

  // ---------- units ----------
  {
    id: 'orrery-lenspolisher', name: 'Lens Polisher', faction: 'orrery', type: 'unit', set: 'x2', cost: 1, power: 1, health: 1, tribe: 'acolyte',
    text: 'Deploy: Chart a glyph (3).',
    abilities: [{ on: 'deploy', ops: [{ op: 'chart', n: 3, find: { type: 'glyph' } }] }],
  },
  {
    id: 'orrery-novicestargazer', name: 'Novice Stargazer', faction: 'orrery', type: 'unit', set: 'x2', cost: 1, power: 1, health: 2, tribe: 'acolyte',
    text: 'Deploy: if Conjunction, I get +1|+1.',
    abilities: [{ on: 'deploy', ops: [{ op: 'if', cond: { c: 'conjunction' }, then: [{ op: 'buff', to: 'self', power: 1, health: 1 }] }] }],
  },
  {
    id: 'orrery-pocketorrery', name: 'Pocket Orrery', faction: 'orrery', type: 'unit', set: 'x2', cost: 1, power: 0, health: 2, tribe: 'construct',
    text: '',
    level: { who: 'self', stat: 'dawns', n: 2, text: 'Started 2 rounds on the Line' },
    ascended: {
      name: 'Turning Orrery', power: 2, health: 3,
      text: 'Unfold: Chart a unit (4).',
      abilities: [{ on: 'unfold', ops: [{ op: 'chart', n: 4, find: { type: 'unit' } }] }],
    },
  },
  {
    id: 'orrery-chartscribe', name: 'Chart Scribe', faction: 'orrery', type: 'unit', set: 'x2', cost: 2, power: 2, health: 1, tribe: 'acolyte',
    text: 'Deploy: Chart a unit (3).',
    abilities: [{ on: 'deploy', ops: [{ op: 'chart', n: 3, find: { type: 'unit' } }] }],
  },
  {
    id: 'orrery-brasssentinel', name: 'Brass Sentinel', faction: 'orrery', type: 'unit', set: 'x2', cost: 2, power: 1, health: 3, tribe: 'construct',
    keywords: ['spotter'],
    text: 'Spotter.',
    level: { who: 'self', stat: 'survivals', n: 2, text: 'Survived damage 2 times' },
    ascended: { name: 'Gilded Sentinel', power: 3, health: 5, keywords: ['spotter', 'plated'], text: 'Spotter, Plated.' },
  },
  {
    id: 'orrery-orbitacolyte', name: 'Orbit Acolyte', faction: 'orrery', type: 'unit', set: 'x2', cost: 2, power: 2, health: 2, tribe: 'acolyte',
    text: 'Deploy: if Conjunction, draw 1.',
    abilities: [{ on: 'deploy', ops: [{ op: 'if', cond: { c: 'conjunction' }, then: [{ op: 'draw', n: 1 }] }] }],
  },
  {
    id: 'orrery-lanternacolyte', name: 'Lantern Acolyte', faction: 'orrery', type: 'unit', set: 'x2', cost: 2, power: 2, health: 2, tribe: 'acolyte',
    text: 'Deploy: another allied unit gains Ward.',
    abilities: [{ on: 'deploy', targets: [{ what: 'unit', side: 'ally' }], ops: [{ op: 'grant', to: 'target0', kw: ['ward'] }] }],
  },
  {
    id: 'orrery-armillarywarden', name: 'Armillary Warden', faction: 'orrery', type: 'unit', set: 'x2', cost: 3, power: 2, health: 4, tribe: 'construct',
    text: '',
    level: { who: 'self', stat: 'dawns', n: 2, text: 'Started 2 rounds on the Line' },
    ascended: {
      name: 'Armillary Giant', power: 5, health: 5,
      text: 'Unfold: deal 2 to the strongest enemy.',
      abilities: [{ on: 'unfold', ops: [{ op: 'damage', to: 'strongestEnemy', n: 2 }] }],
    },
  },
  {
    id: 'orrery-cometherald', name: 'Comet Herald', faction: 'orrery', type: 'unit', set: 'x2', cost: 3, power: 3, health: 3, tribe: 'astronomer',
    text: 'Deploy: if Conjunction, deal 2 to an enemy unit.',
    abilities: [{
      on: 'deploy', targets: [{ what: 'unit', side: 'enemy' }],
      ops: [{ op: 'if', cond: { c: 'conjunction' }, then: [{ op: 'damage', to: 'target0', n: 2 }] }],
    }],
  },
  {
    id: 'orrery-quadrantkeeper', name: 'Quadrant Keeper', faction: 'orrery', type: 'unit', set: 'x2', cost: 3, power: 3, health: 3, tribe: 'astronomer',
    text: 'Deploy: Chart a glyph (3). Resonant: I have +1|+1.',
    abilities: [{ on: 'deploy', ops: [{ op: 'chart', n: 3, find: { type: 'glyph' } }] }],
    auras: [{ to: 'self', power: 1, health: 1, cond: { c: 'resonant' } }],
  },
  {
    id: 'orrery-meteorlancer', name: 'Meteor Lancer', faction: 'orrery', type: 'unit', set: 'x2', cost: 3, power: 3, health: 2, tribe: 'acolyte',
    keywords: ['vanguard'],
    text: 'Vanguard.',
    level: { who: 'self', stat: 'strikes', n: 2, text: 'Struck 2 times' },
    ascended: { name: 'Falling-Star Lancer', power: 5, health: 4, keywords: ['vanguard', 'pierce'], text: 'Vanguard, Pierce.' },
  },
  {
    id: 'orrery-lodestarprior', name: 'Lodestar Prior', faction: 'orrery', type: 'unit', set: 'x2', cost: 4, power: 3, health: 4, tribe: 'astronomer',
    text: 'When you cast a glyph, if Conjunction, I get +1|+0.',
    abilities: [{ on: 'glyphCast', cond: { c: 'conjunction' }, ops: [{ op: 'buff', to: 'self', power: 1 }] }],
  },
  {
    id: 'orrery-orreryengine', name: 'Orrery Engine', faction: 'orrery', type: 'unit', set: 'x2', cost: 4, power: 2, health: 5, tribe: 'construct',
    keywords: ['plated'],
    text: 'Plated.',
    level: { who: 'self', stat: 'dawns', n: 3, text: 'Started 3 rounds on the Line' },
    ascended: {
      name: 'Great Orrery Engine', power: 6, health: 7, keywords: ['plated'],
      text: 'Plated. Unfold: deal 1 to every enemy unit.',
      abilities: [{ on: 'unfold', ops: [{ op: 'damage', to: 'enemies', n: 1 }] }],
    },
  },
  {
    id: 'orrery-gyrewarden', name: 'Gyre Warden', faction: 'orrery', type: 'unit', set: 'x2', cost: 4, power: 2, health: 5, tribe: 'construct',
    keywords: ['mend'],
    text: 'Mend. Deploy: another allied unit gains Mend.',
    abilities: [{ on: 'deploy', targets: [{ what: 'unit', side: 'ally' }], ops: [{ op: 'grant', to: 'target0', kw: ['mend'] }] }],
  },
  {
    id: 'orrery-eclipseknight', name: 'Eclipse Knight', faction: 'orrery', type: 'unit', set: 'x2', cost: 5, power: 5, health: 4, tribe: 'acolyte',
    text: 'Deploy: if Conjunction, I gain Ward and Vanguard.',
    abilities: [{ on: 'deploy', ops: [{ op: 'if', cond: { c: 'conjunction' }, then: [{ op: 'grant', to: 'self', kw: ['ward', 'vanguard'] }] }] }],
  },
  {
    id: 'orrery-dormantstartitan', name: 'Dormant Star-Titan', faction: 'orrery', type: 'unit', set: 'x2', cost: 5, power: 3, health: 6, tribe: 'construct',
    text: '',
    level: { who: 'self', stat: 'dawns', n: 2, text: 'Started 2 rounds on the Line' },
    ascended: {
      name: 'Star-Titan Awake', power: 7, health: 7,
      text: 'Unfold: give your other allies +1|+1.',
      abilities: [{ on: 'unfold', ops: [{ op: 'buff', to: 'otherAllies', power: 1, health: 1 }] }],
    },
  },
  {
    id: 'orrery-celestinebastion', name: 'Celestine Bastion', faction: 'orrery', type: 'unit', set: 'x2', cost: 5, power: 4, health: 5, tribe: 'construct',
    keywords: ['spotter'],
    text: 'Spotter. Resonant: I have +1|+1 and Plated.',
    auras: [{ to: 'self', power: 1, health: 1, kw: ['plated'], cond: { c: 'resonant' } }],
  },
  {
    id: 'orrery-meridianconstruct', name: 'Meridian Construct', faction: 'orrery', type: 'unit', set: 'x2', cost: 6, power: 5, health: 6, tribe: 'construct',
    text: 'Deploy: if Conjunction, give your other allies +1|+1.',
    abilities: [{ on: 'deploy', ops: [{ op: 'if', cond: { c: 'conjunction' }, then: [{ op: 'buff', to: 'otherAllies', power: 1, health: 1 }] }] }],
  },
  {
    id: 'orrery-sleepingconstellation', name: 'Sleeping Constellation', faction: 'orrery', type: 'unit', set: 'x2', cost: 6, power: 5, health: 6, tribe: 'construct',
    text: '',
    level: { who: 'self', stat: 'dawns', n: 2, text: 'Started 2 rounds on the Line' },
    ascended: { name: 'Constellation Unbound', power: 8, health: 8, keywords: ['aerial'], text: 'Aerial.' },
  },
  {
    id: 'orrery-starforgetitan', name: 'Starforge Titan', faction: 'orrery', type: 'unit', set: 'x2', cost: 7, power: 6, health: 7, tribe: 'construct',
    text: 'Shatter: summon a Starlight Colossus.',
    abilities: [{ on: 'shatter', ops: [{ op: 'summon', card: 'orrery-starlightcolossus' }] }],
  },
  {
    id: 'orrery-zenithseer', name: 'Zenith Seer', faction: 'orrery', type: 'unit', set: 'x2', cost: 7, power: 6, health: 6, tribe: 'astronomer',
    text: 'Deploy: Chart a unit (5) and Chart a glyph (5).',
    abilities: [{ on: 'deploy', ops: [{ op: 'chart', n: 5, find: { type: 'unit' } }, { op: 'chart', n: 5, find: { type: 'glyph' } }] }],
  },
  {
    id: 'orrery-firstnight', name: 'Orrery of the First Night', faction: 'orrery', type: 'unit', set: 'x2', cost: 8, power: 7, health: 8, tribe: 'construct',
    text: 'Dawn: deal 1 to every enemy unit and 1 to the enemy Spire. Resonant: I have Aerial.',
    abilities: [{ on: 'dawn', ops: [{ op: 'damage', to: 'enemies', n: 1 }, { op: 'damage', to: 'enemySpire', n: 1 }] }],
    auras: [{ to: 'self', kw: ['aerial'], cond: { c: 'resonant' } }],
  },

  // ---------- glyphs ----------
  {
    id: 'orrery-firstglimpse', name: 'First Glimpse', faction: 'orrery', type: 'glyph', set: 'x2', cost: 0, speed: 'flash',
    text: 'Chart a unit (2).',
    ops: [{ op: 'chart', n: 2, find: { type: 'unit' } }],
  },
  {
    id: 'orrery-trinelight', name: 'Trine Light', faction: 'orrery', type: 'glyph', set: 'x2', cost: 1, speed: 'flash',
    text: 'Give an allied unit +1|+1 this round. Conjunction: draw 1.',
    targets: [{ what: 'unit', side: 'ally' }],
    ops: [{ op: 'buff', to: 'target0', power: 1, health: 1, dur: 'round' }, { op: 'if', cond: { c: 'conjunction' }, then: [{ op: 'draw', n: 1 }] }],
  },
  {
    id: 'orrery-brassshelter', name: 'Brass Shelter', faction: 'orrery', type: 'glyph', set: 'x2', cost: 1, speed: 'flash',
    text: 'Give an allied unit +0|+3 this round. Conjunction: it gains Ward too.',
    targets: [{ what: 'unit', side: 'ally' }],
    ops: [{ op: 'buff', to: 'target0', health: 3, dur: 'round' }, { op: 'if', cond: { c: 'conjunction' }, then: [{ op: 'grant', to: 'target0', kw: ['ward'] }] }],
  },
  {
    id: 'orrery-fallingglint', name: 'Falling Glint', faction: 'orrery', type: 'glyph', set: 'x2', cost: 2, speed: 'flash',
    text: 'Deal 2 to an enemy unit. Resonant: deal 3 instead.',
    targets: [{ what: 'unit', side: 'enemy' }],
    ops: [{ op: 'if', cond: { c: 'resonant' }, then: [{ op: 'damage', to: 'target0', n: 3 }], else: [{ op: 'damage', to: 'target0', n: 2 }] }],
  },
  {
    id: 'orrery-longpatience', name: 'Long Patience', faction: 'orrery', type: 'glyph', set: 'x2', cost: 2, speed: 'flash',
    text: 'An allied unit gains Mend and +0|+2.',
    targets: [{ what: 'unit', side: 'ally' }],
    ops: [{ op: 'grant', to: 'target0', kw: ['mend'] }, { op: 'buff', to: 'target0', health: 2 }],
  },
  {
    id: 'orrery-gravitywell', name: 'Gravity Well', faction: 'orrery', type: 'glyph', set: 'x2', cost: 1, speed: 'swift',
    text: 'Give an enemy unit -2|+0 this round. Resonant: put it in Stasis too.',
    targets: [{ what: 'unit', side: 'enemy' }],
    ops: [{ op: 'buff', to: 'target0', power: -2, dur: 'round' }, { op: 'if', cond: { c: 'resonant' }, then: [{ op: 'stasis', to: 'target0' }] }],
  },
  {
    id: 'orrery-starreckoning', name: 'Star Reckoning', faction: 'orrery', type: 'glyph', set: 'x2', cost: 2, speed: 'swift',
    text: 'Chart a unit (4). Conjunction: Chart a glyph (4) too.',
    ops: [{ op: 'chart', n: 4, find: { type: 'unit' } }, { op: 'if', cond: { c: 'conjunction' }, then: [{ op: 'chart', n: 4, find: { type: 'glyph' } }] }],
  },
  {
    id: 'orrery-hourofmending', name: 'Hour of Mending', faction: 'orrery', type: 'glyph', set: 'x2', cost: 2, speed: 'swift',
    text: 'Repair your allies by 2 and give them +0|+1.',
    ops: [{ op: 'heal', to: 'allies', n: 2 }, { op: 'buff', to: 'allies', health: 1 }],
  },
  {
    id: 'orrery-cometlance', name: 'Comet Lance', faction: 'orrery', type: 'glyph', set: 'x2', cost: 3, speed: 'swift',
    text: 'Deal 3 to an enemy unit. Conjunction: deal 2 to the enemy Spire too.',
    targets: [{ what: 'unit', side: 'enemy' }],
    ops: [{ op: 'damage', to: 'target0', n: 3 }, { op: 'if', cond: { c: 'conjunction' }, then: [{ op: 'damage', to: 'enemySpire', n: 2 }] }],
  },
  {
    id: 'orrery-occultation', name: 'Occultation', faction: 'orrery', type: 'glyph', set: 'x2', cost: 4, speed: 'swift',
    text: 'Negate an enemy glyph. Chart a glyph (3).',
    targets: [{ what: 'glyph', side: 'enemy' }],
    ops: [{ op: 'negate', to: 'target0' }, { op: 'chart', n: 3, find: { type: 'glyph' } }],
  },
  {
    id: 'orrery-rainofglassstars', name: 'Rain of Glass Stars', faction: 'orrery', type: 'glyph', set: 'x2', cost: 5, speed: 'swift',
    text: 'Deal 2 to every enemy unit.',
    ops: [{ op: 'damage', to: 'enemies', n: 2 }],
  },
  {
    id: 'orrery-seekthebrightones', name: 'Seek the Bright Ones', faction: 'orrery', type: 'glyph', set: 'x2', cost: 3, speed: 'ritual',
    text: 'Chart a hero (6). Draw 1.',
    ops: [{ op: 'chart', n: 6, find: { type: 'hero' } }, { op: 'draw', n: 1 }],
  },
  {
    id: 'orrery-slowturning', name: 'The Slow Turning', faction: 'orrery', type: 'glyph', set: 'x2', cost: 4, speed: 'ritual',
    text: 'Your allies gain Mend. Draw 1.',
    ops: [{ op: 'grant', to: 'allies', kw: ['mend'] }, { op: 'draw', n: 1 }],
  },
  {
    id: 'orrery-kindlethecolossus', name: 'Kindle the Colossus', faction: 'orrery', type: 'glyph', set: 'x2', cost: 7, speed: 'ritual',
    text: 'Summon a Starlight Colossus. Conjunction: summon two instead.',
    ops: [{
      op: 'if', cond: { c: 'conjunction' },
      then: [{ op: 'summon', card: 'orrery-starlightcolossus', n: 2 }],
      else: [{ op: 'summon', card: 'orrery-starlightcolossus' }],
    }],
  },
];

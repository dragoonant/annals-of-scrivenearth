// Mirrorwatch (set x1, The Mirror Quarter): the mirror quarter's illusionists, spies and glassmakers.
// Copies, Glimmer cards, Reprise glyphs, Veiled units. Every card here has set: 'x1'.
// Heroes: Sabeline (copy-thief, copiesMade), Ottavine (spellweaver, glimmerPlayed),
// Wystan (spymaster, spireDamage), Ondrine (reflector, glyphDamage).
import type { CardDef } from '../../engine/types';

export const mirror: CardDef[] = [
  {
    id: 'mirror-sabeline', name: 'Sabeline Twinfold', faction: 'mirror', type: 'hero', set: 'x1', cost: 3, power: 2, health: 3,
    tribe: 'spy',
    text: 'Deploy: put a Glimmer copy of an enemy unit in your hand.',
    abilities: [{ on: 'deploy', targets: [{ what: 'unit', side: 'enemy' }], ops: [{ op: 'copy', of: 'target0', glimmer: true }] }],
    level: { who: 'you', stat: 'copiesMade', n: 6, text: "You've made 6+ copies" },
    ascended: {
      name: 'Sabeline, Thief of Faces', power: 3, health: 4,
      text: 'Deploy: put a Glimmer copy of an enemy unit in your hand. Dawn: put a Glimmer copy of the strongest enemy in your hand. Ascend: put a copy of the strongest enemy in your hand.',
      abilities: [
        { on: 'deploy', targets: [{ what: 'unit', side: 'enemy' }], ops: [{ op: 'copy', of: 'target0', glimmer: true }] },
        { on: 'dawn', ops: [{ op: 'copy', of: 'strongestEnemy', glimmer: true }] },
        { on: 'ascend', ops: [{ op: 'copy', of: 'strongestEnemy' }] },
      ],
    },
  },
  {
    id: 'mirror-ottavine', name: 'Ottavine Echoglass', faction: 'mirror', type: 'hero', set: 'x1', cost: 3, power: 2, health: 3,
    tribe: 'illusionist',
    text: 'Dawn: create a Glimmer Glass Spark in your hand.',
    abilities: [{ on: 'dawn', ops: [{ op: 'create', card: 'mirror-spark', glimmer: true }] }],
    level: { who: 'you', stat: 'glimmerPlayed', n: 6, text: "You've played 6+ Glimmer cards" },
    ascended: {
      name: 'Ottavine, the Twice-Spoken', power: 3, health: 4,
      text: 'Dawn: create two Glimmer Glass Sparks in your hand. Ascend: gain 2 Charge and create two Glimmer Glass Sparks in your hand.',
      abilities: [
        { on: 'dawn', ops: [{ op: 'create', card: 'mirror-spark', n: 2, glimmer: true }] },
        { on: 'ascend', ops: [{ op: 'charge', n: 2 }, { op: 'create', card: 'mirror-spark', n: 2, glimmer: true }] },
      ],
    },
  },
  {
    id: 'mirror-wystan', name: 'Wystan Nightpane', faction: 'mirror', type: 'hero', set: 'x1', cost: 4, power: 3, health: 3,
    tribe: 'spy', keywords: ['veiled'],
    text: 'Veiled. When I strike the enemy Spire, draw 1.',
    abilities: [{ on: 'spireHit', ops: [{ op: 'draw', n: 1 }] }],
    level: { who: 'you', stat: 'spireDamage', n: 12, text: "You've dealt 12+ damage to the enemy Spire" },
    ascended: {
      name: 'Wystan, the Unseen Door', power: 4, health: 4, keywords: ['veiled'],
      text: 'Veiled. Your other allies have Veiled. When I strike the enemy Spire, draw 1. Ascend: deal 1 to the enemy Spire for each of your allies.',
      auras: [{ to: 'otherAllies', kw: ['veiled'] }],
      abilities: [
        { on: 'spireHit', ops: [{ op: 'draw', n: 1 }] },
        { on: 'ascend', ops: [{ op: 'damage', to: 'enemySpire', n: { count: 'allies', mul: 1 } }] },
      ],
    },
  },
  {
    id: 'mirror-ondrine', name: 'Ondrine Backglass', faction: 'mirror', type: 'hero', set: 'x1', cost: 3, power: 2, health: 4,
    tribe: 'glasswright',
    text: 'When the opponent casts a glyph, deal 1 to the enemy Spire.',
    abilities: [{ on: 'foeGlyph', ops: [{ op: 'damage', to: 'enemySpire', n: 1 }] }],
    level: { who: 'you', stat: 'glyphDamage', n: 10, text: 'Your glyphs and abilities have dealt 10+ damage' },
    ascended: {
      name: 'Ondrine, the Returning Light', power: 3, health: 5,
      text: 'When the opponent casts a glyph, deal 1 to every enemy unit and 1 to the enemy Spire. Ascend: deal 3 to the strongest enemy.',
      abilities: [
        { on: 'foeGlyph', ops: [{ op: 'damage', to: 'enemies', n: 1 }, { op: 'damage', to: 'enemySpire', n: 1 }] },
        { on: 'ascend', ops: [{ op: 'damage', to: 'strongestEnemy', n: 3 }] },
      ],
    },
  },

  // ---------- tokens ----------
  {
    id: 'mirror-spark', name: 'Glass Spark', faction: 'mirror', type: 'glyph', set: 'x1', cost: 1, speed: 'flash', token: true,
    text: 'Deal 1 to an enemy unit.',
    targets: [{ what: 'unit', side: 'enemy' }], ops: [{ op: 'damage', to: 'target0', n: 1 }],
  },
  {
    id: 'mirror-reflection', name: 'Reflection', faction: 'mirror', type: 'unit', set: 'x1', cost: 1, power: 1, health: 1,
    tribe: 'illusionist', token: true, text: '',
  },

  // ---------- units ----------
  {
    id: 'mirror-glintpicker', name: 'Glint Picker', faction: 'mirror', type: 'unit', set: 'x1', cost: 1, power: 1, health: 1, tribe: 'spy',
    text: 'Deploy: put a Glimmer copy of an enemy unit with 2 or less power in your hand.',
    abilities: [{ on: 'deploy', targets: [{ what: 'unit', side: 'enemy', filter: { maxPower: 2 } }], ops: [{ op: 'copy', of: 'target0', glimmer: true }] }],
  },
  {
    id: 'mirror-veilrunner', name: 'Veil Runner', faction: 'mirror', type: 'unit', set: 'x1', cost: 1, power: 1, health: 1, tribe: 'spy',
    keywords: ['veiled'],
    text: 'Veiled. When I strike the enemy Spire, I get +1|+0.',
    abilities: [{ on: 'spireHit', ops: [{ op: 'buff', to: 'self', power: 1 }] }],
  },
  {
    id: 'mirror-sparkglazier', name: 'Spark Glazier', faction: 'mirror', type: 'unit', set: 'x1', cost: 1, power: 1, health: 1, tribe: 'glasswright',
    text: 'Deploy: create a Glimmer Glass Spark in your hand.',
    abilities: [{ on: 'deploy', ops: [{ op: 'create', card: 'mirror-spark', glimmer: true }] }],
  },
  {
    id: 'mirror-panesentry', name: 'Pane Sentry', faction: 'mirror', type: 'unit', set: 'x1', cost: 2, power: 1, health: 3, tribe: 'glasswright',
    text: 'When the opponent casts a glyph, deal 1 to the weakest enemy.',
    abilities: [{ on: 'foeGlyph', ops: [{ op: 'damage', to: 'weakestEnemy', n: 1 }] }],
  },
  {
    id: 'mirror-twincourier', name: 'Twin Courier', faction: 'mirror', type: 'unit', set: 'x1', cost: 2, power: 2, health: 2, tribe: 'spy',
    text: 'Deploy: put a Glimmer copy of another allied unit in your hand.',
    abilities: [{ on: 'deploy', targets: [{ what: 'unit', side: 'ally' }], ops: [{ op: 'copy', of: 'target0', glimmer: true }] }],
  },
  {
    id: 'mirror-backstairknife', name: 'Backstair Knife', faction: 'mirror', type: 'unit', set: 'x1', cost: 2, power: 3, health: 1, tribe: 'spy',
    keywords: ['veiled'],
    text: 'Veiled. Resonant: I have +1|+1.',
    auras: [{ to: 'self', power: 1, health: 1, cond: { c: 'resonant' } }],
  },
  {
    id: 'mirror-lanternmimic', name: 'Lantern Mimic', faction: 'mirror', type: 'unit', set: 'x1', cost: 2, power: 2, health: 2, tribe: 'illusionist',
    text: "Deploy: I get +1|+1 for each glyph you've cast this round.",
    abilities: [{
      on: 'deploy',
      ops: [{ op: 'buff', to: 'self', power: { count: 'glyphsThisRound', mul: 1 }, health: { count: 'glyphsThisRound', mul: 1 } }],
    }],
  },
  {
    id: 'mirror-facethief', name: 'Face Thief', faction: 'mirror', type: 'unit', set: 'x1', cost: 3, power: 2, health: 3, tribe: 'spy',
    text: 'When an enemy unit is destroyed, put a Glimmer copy of it in your hand.',
    abilities: [{ on: 'enemyDied', ops: [{ op: 'copy', of: 'trigger', glimmer: true }] }],
  },
  {
    id: 'mirror-polishedbulwark', name: 'Polished Bulwark', faction: 'mirror', type: 'unit', set: 'x1', cost: 3, power: 2, health: 4, tribe: 'construct',
    text: 'When the opponent casts a glyph, I gain Ward.',
    abilities: [{ on: 'foeGlyph', ops: [{ op: 'grant', to: 'self', kw: ['ward'] }] }],
  },
  {
    id: 'mirror-echoscribe', name: 'Echo Scribe', faction: 'mirror', type: 'unit', set: 'x1', cost: 3, power: 2, health: 3, tribe: 'illusionist',
    text: 'When you cast a glyph, I get +1|+0 this round. Resonant: your glyphs cost 1 less.',
    abilities: [{ on: 'glyphCast', ops: [{ op: 'buff', to: 'self', power: 1, dur: 'round' }] }],
    costAuras: [{ type: 'glyph', n: -1, cond: { c: 'resonant' } }],
  },
  {
    id: 'mirror-whisperbroker', name: 'Whisper Broker', faction: 'mirror', type: 'unit', set: 'x1', cost: 3, power: 3, health: 2, tribe: 'spy',
    keywords: ['veiled', 'dread'],
    text: 'Veiled, Dread.',
  },
  {
    id: 'mirror-masquedancer', name: 'Masque Dancer', faction: 'mirror', type: 'unit', set: 'x1', cost: 4, power: 3, health: 4, tribe: 'illusionist',
    text: 'Deploy: an allied unit gains Veiled and +1|+0.',
    abilities: [{
      on: 'deploy', targets: [{ what: 'unit', side: 'ally' }],
      ops: [{ op: 'grant', to: 'target0', kw: ['veiled'] }, { op: 'buff', to: 'target0', power: 1 }],
    }],
  },
  {
    id: 'mirror-shardcantor', name: 'Shard Cantor', faction: 'mirror', type: 'unit', set: 'x1', cost: 4, power: 3, health: 4, tribe: 'glasswright',
    text: 'When the opponent casts a glyph, deal 2 to a random enemy.',
    abilities: [{ on: 'foeGlyph', ops: [{ op: 'damage', to: 'randomEnemy', n: 2 }] }],
  },
  {
    id: 'mirror-gallerycopyist', name: 'Gallery Copyist', faction: 'mirror', type: 'unit', set: 'x1', cost: 4, power: 3, health: 4, tribe: 'glasswright',
    text: 'Shatter: put a copy of the strongest enemy in your hand.',
    abilities: [{ on: 'shatter', ops: [{ op: 'copy', of: 'strongestEnemy' }] }],
  },
  {
    id: 'mirror-lookingglassgolem', name: 'Looking-Glass Golem', faction: 'mirror', type: 'unit', set: 'x1', cost: 5, power: 4, health: 5, tribe: 'construct',
    text: 'When the opponent casts a glyph, summon a Reflection.',
    abilities: [{ on: 'foeGlyph', ops: [{ op: 'summon', card: 'mirror-reflection' }] }],
  },
  {
    id: 'mirror-rooftopinformant', name: 'Rooftop Informant', faction: 'mirror', type: 'unit', set: 'x1', cost: 5, power: 4, health: 3, tribe: 'spy',
    keywords: ['veiled'],
    text: 'Veiled. Assault: deal 2 to the enemy Spire.',
    abilities: [{ on: 'assault', ops: [{ op: 'damage', to: 'enemySpire', n: 2 }] }],
  },
  {
    id: 'mirror-choirofechoes', name: 'Choir of Echoes', faction: 'mirror', type: 'unit', set: 'x1', cost: 5, power: 4, health: 5, tribe: 'illusionist',
    text: "When you cast a glyph, if you've cast 2 or more glyphs this round, draw 1.",
    abilities: [{ on: 'glyphCast', cond: { c: 'seenRound', stat: 'glyphsCast', gte: 2 }, ops: [{ op: 'draw', n: 1 }] }],
  },
  {
    id: 'mirror-curatoroffaces', name: 'Curator of Faces', faction: 'mirror', type: 'unit', set: 'x1', cost: 6, power: 5, health: 6, tribe: 'spy',
    text: 'Deploy: put a copy of an enemy unit in your hand.',
    abilities: [{ on: 'deploy', targets: [{ what: 'unit', side: 'enemy' }], ops: [{ op: 'copy', of: 'target0' }] }],
  },
  {
    id: 'mirror-silveredbastion', name: 'Silvered Bastion', faction: 'mirror', type: 'unit', set: 'x1', cost: 6, power: 5, health: 6, tribe: 'construct',
    text: 'When the opponent casts a glyph, deal 1 to every enemy unit.',
    abilities: [{ on: 'foeGlyph', ops: [{ op: 'damage', to: 'enemies', n: 1 }] }],
  },
  {
    id: 'mirror-shadowglassassassin', name: 'Shadow-Glass Assassin', faction: 'mirror', type: 'unit', set: 'x1', cost: 7, power: 6, health: 4, tribe: 'spy',
    keywords: ['veiled', 'dread'],
    text: 'Veiled, Dread. When I strike the enemy Spire, deal 2 more to it.',
    abilities: [{ on: 'spireHit', ops: [{ op: 'damage', to: 'enemySpire', n: 2 }] }],
  },
  {
    id: 'mirror-echocolossus', name: 'Echo Colossus', faction: 'mirror', type: 'unit', set: 'x1', cost: 7, power: 6, health: 7, tribe: 'construct',
    text: 'When you cast a glyph, deal 1 to the enemy Spire.',
    abilities: [{ on: 'glyphCast', ops: [{ op: 'damage', to: 'enemySpire', n: 1 }] }],
  },
  {
    id: 'mirror-glasswingdreadnought', name: 'Glasswing Dreadnought', faction: 'mirror', type: 'unit', set: 'x1', cost: 8, power: 6, health: 7, tribe: 'construct',
    keywords: ['veiled', 'aerial'],
    text: 'Veiled, Aerial. Deploy: put a Glimmer copy of the strongest enemy in your hand.',
    abilities: [{ on: 'deploy', ops: [{ op: 'copy', of: 'strongestEnemy', glimmer: true }] }],
  },

  // ---------- glyphs ----------
  {
    id: 'mirror-flickeredge', name: 'Flicker Edge', faction: 'mirror', type: 'glyph', set: 'x1', cost: 1, speed: 'flash', keywords: ['reprise'],
    text: 'Reprise. Give an allied unit +1|+1 this round.',
    targets: [{ what: 'unit', side: 'ally' }], ops: [{ op: 'buff', to: 'target0', power: 1, health: 1, dur: 'round' }],
  },
  {
    id: 'mirror-echoneedle', name: 'Echo Needle', faction: 'mirror', type: 'glyph', set: 'x1', cost: 1, speed: 'flash', keywords: ['reprise'],
    text: 'Reprise. Deal 1 to an enemy unit.',
    targets: [{ what: 'unit', side: 'enemy' }], ops: [{ op: 'damage', to: 'target0', n: 1 }],
  },
  {
    id: 'mirror-sleightofglass', name: 'Sleight of Glass', faction: 'mirror', type: 'glyph', set: 'x1', cost: 0, speed: 'flash',
    text: 'An allied unit gains Veiled.',
    targets: [{ what: 'unit', side: 'ally' }], ops: [{ op: 'grant', to: 'target0', kw: ['veiled'] }],
  },
  {
    id: 'mirror-glanceback', name: 'Glance Back', faction: 'mirror', type: 'glyph', set: 'x1', cost: 2, speed: 'flash',
    text: 'Put a Glimmer copy of an enemy unit in your hand.',
    targets: [{ what: 'unit', side: 'enemy' }], ops: [{ op: 'copy', of: 'target0', glimmer: true }],
  },
  {
    id: 'mirror-splitimage', name: 'Split Image', faction: 'mirror', type: 'glyph', set: 'x1', cost: 3, speed: 'flash',
    text: 'Summon two Reflections. Resonant: summon three instead.',
    ops: [{
      op: 'if', cond: { c: 'resonant' },
      then: [{ op: 'summon', card: 'mirror-reflection', n: 3 }],
      else: [{ op: 'summon', card: 'mirror-reflection', n: 2 }],
    }],
  },
  {
    id: 'mirror-falseglare', name: 'False Glare', faction: 'mirror', type: 'glyph', set: 'x1', cost: 1, speed: 'swift', keywords: ['reprise'],
    text: 'Reprise. Give an enemy unit -2|+0 this round.',
    targets: [{ what: 'unit', side: 'enemy' }], ops: [{ op: 'buff', to: 'target0', power: -2, dur: 'round' }],
  },
  {
    id: 'mirror-stolenverse', name: 'Stolen Verse', faction: 'mirror', type: 'glyph', set: 'x1', cost: 2, speed: 'swift',
    text: 'Put a Glimmer copy of an enemy glyph in your hand. Resonant: the copy is not Glimmer.',
    targets: [{ what: 'glyph', side: 'enemy' }],
    ops: [{
      op: 'if', cond: { c: 'resonant' },
      then: [{ op: 'copy', of: 'target0' }],
      else: [{ op: 'copy', of: 'target0', glimmer: true }],
    }],
  },
  {
    id: 'mirror-backdoorsignal', name: 'Back-Door Signal', faction: 'mirror', type: 'glyph', set: 'x1', cost: 2, speed: 'swift',
    text: 'Give your allies with Veiled +2|+0 this round.',
    ops: [{ op: 'buff', to: { from: 'allies', filter: { kw: 'veiled' } }, power: 2, dur: 'round' }],
  },
  {
    id: 'mirror-ricochetlight', name: 'Ricochet Light', faction: 'mirror', type: 'glyph', set: 'x1', cost: 3, speed: 'swift', keywords: ['reprise'],
    text: 'Reprise. Deal 2 to an enemy unit or the enemy Spire.',
    targets: [{ what: 'unitOrSpire', side: 'enemy' }], ops: [{ op: 'damage', to: 'target0', n: 2 }],
  },
  {
    id: 'mirror-reversepane', name: 'Reverse Pane', faction: 'mirror', type: 'glyph', set: 'x1', cost: 4, speed: 'swift',
    text: 'Negate an enemy glyph and put a Glimmer copy of it in your hand.',
    targets: [{ what: 'glyph', side: 'enemy' }],
    ops: [{ op: 'copy', of: 'target0', glimmer: true }, { op: 'negate', to: 'target0' }],
  },
  {
    id: 'mirror-vanityglass', name: 'Vanity Glass', faction: 'mirror', type: 'glyph', set: 'x1', cost: 4, speed: 'swift',
    text: 'Deal damage to an enemy unit equal to its power.',
    targets: [{ what: 'unit', side: 'enemy' }], ops: [{ op: 'damage', to: 'target0', n: { count: 'target0Power' } }],
  },
  {
    id: 'mirror-nightofmasks', name: 'Night of Masks', faction: 'mirror', type: 'glyph', set: 'x1', cost: 3, speed: 'ritual',
    text: 'Your allies gain Veiled. Draw 1.',
    ops: [{ op: 'grant', to: 'allies', kw: ['veiled'] }, { op: 'draw', n: 1 }],
  },
  {
    id: 'mirror-encoreofglass', name: 'Encore of Glass', faction: 'mirror', type: 'glyph', set: 'x1', cost: 5, speed: 'ritual', keywords: ['reprise'],
    text: 'Reprise. Draw 2.',
    ops: [{ op: 'draw', n: 2 }],
  },
  {
    id: 'mirror-hallofmirrors', name: 'Hall of Mirrors', faction: 'mirror', type: 'glyph', set: 'x1', cost: 7, speed: 'ritual',
    text: 'Put a copy of every enemy unit in your hand.',
    ops: [{ op: 'copy', of: 'enemies' }],
  },

  // ---------- set x2: The Starward Rise ----------
  // Twin stars: Conjunction bonuses that make copies, mirror-glass constructs that Unfold, Chart for the glyph to copy.
  // Hero: Vesperine (twin-maker, unitsPlayed): every unit she sees played after a glyph gets a Glimmer twin.
  {
    id: 'mirror-vesperine', name: 'Vesperine Twinglass', faction: 'mirror', type: 'hero', set: 'x2', cost: 3, power: 2, health: 3,
    tribe: 'glasswright',
    text: 'When another ally is summoned, if Conjunction and it has 2 or less power, put a Glimmer copy of it in your hand.',
    abilities: [{ on: 'allySummoned', cond: { c: 'conjunction' }, ops: [{ op: 'copy', of: { from: 'trigger', filter: { maxPower: 2 } }, glimmer: true }] }],
    level: { who: 'you', stat: 'unitsPlayed', n: 10, text: "You've played 10+ units" },
    ascended: {
      name: 'Vesperine, the Binary Star', power: 4, health: 5,
      text: 'When another ally is summoned, if Conjunction, put a Glimmer copy of it in your hand. Ascend: summon two Reflections and Chart a unit (6).',
      abilities: [
        { on: 'allySummoned', cond: { c: 'conjunction' }, ops: [{ op: 'copy', of: 'trigger', glimmer: true }] },
        { on: 'ascend', ops: [{ op: 'summon', card: 'mirror-reflection', n: 2 }, { op: 'chart', n: 6, find: { type: 'unit' } }] },
      ],
    },
  },
  {
    id: 'mirror-pairedwick', name: 'Paired Wick', faction: 'mirror', type: 'unit', set: 'x2', cost: 1, power: 1, health: 1, tribe: 'illusionist',
    text: 'Deploy: if Conjunction, put a Glimmer copy of me in your hand.',
    abilities: [{ on: 'deploy', ops: [{ op: 'if', cond: { c: 'conjunction' }, then: [{ op: 'copy', of: 'self', glimmer: true }] }] }],
  },
  {
    id: 'mirror-quicksilvershell', name: 'Quicksilver Shell', faction: 'mirror', type: 'unit', set: 'x2', cost: 2, power: 1, health: 3, tribe: 'construct',
    text: 'Unfolds after surviving damage twice.',
    level: { who: 'self', stat: 'survivals', n: 2, text: 'Survived damage 2 times' },
    ascended: {
      name: 'Shell of Two Moons', power: 3, health: 5,
      text: 'Unfold: summon two Reflections.',
      abilities: [{ on: 'unfold', ops: [{ op: 'summon', card: 'mirror-reflection', n: 2 }] }],
    },
  },
  {
    id: 'mirror-twinlensaugur', name: 'Twin-Lens Augur', faction: 'mirror', type: 'unit', set: 'x2', cost: 3, power: 2, health: 3, tribe: 'spy',
    text: 'Deploy: Chart a glyph (4). Conjunction: also Chart a unit (4).',
    abilities: [{
      on: 'deploy',
      ops: [
        { op: 'chart', n: 4, find: { type: 'glyph' } },
        { op: 'if', cond: { c: 'conjunction' }, then: [{ op: 'chart', n: 4, find: { type: 'unit' } }] },
      ],
    }],
  },
  {
    id: 'mirror-backlitwarden', name: 'Backlit Warden', faction: 'mirror', type: 'unit', set: 'x2', cost: 3, power: 2, health: 3, tribe: 'construct',
    text: 'When the opponent casts a glyph, deal 1 to the strongest enemy. Unfolds after dealing four damage.',
    abilities: [{ on: 'foeGlyph', ops: [{ op: 'damage', to: 'strongestEnemy', n: 1 }] }],
    level: { who: 'self', stat: 'damageDealt', n: 4, text: 'Dealt 4+ damage' },
    ascended: {
      name: 'Warden of the Double Sun', power: 4, health: 5,
      text: 'When the opponent casts a glyph, deal 2 to the strongest enemy.',
      abilities: [{ on: 'foeGlyph', ops: [{ op: 'damage', to: 'strongestEnemy', n: 2 }] }],
    },
  },
  {
    id: 'mirror-twinstaroutrider', name: 'Twin-Star Outrider', faction: 'mirror', type: 'unit', set: 'x2', cost: 4, power: 3, health: 3, tribe: 'spy',
    keywords: ['veiled'],
    text: 'Veiled. Assault: if Conjunction, put a copy of me in your hand.',
    abilities: [{ on: 'assault', cond: { c: 'conjunction' }, ops: [{ op: 'copy', of: 'self' }] }],
  },
  {
    id: 'mirror-twinsunsentinel', name: 'Twin-Sun Sentinel', faction: 'mirror', type: 'unit', set: 'x2', cost: 5, power: 3, health: 5, tribe: 'construct',
    keywords: ['plated'],
    text: 'Plated. Unfolds after starting two rounds on the Line.',
    level: { who: 'self', stat: 'dawns', n: 2, text: 'Started 2 rounds on the Line' },
    ascended: {
      name: 'Twin-Sun Colossus', power: 6, health: 7, keywords: ['plated'],
      text: 'Plated. Unfold: put a copy of me in your hand.',
      abilities: [{ on: 'unfold', ops: [{ op: 'copy', of: 'self' }] }],
    },
  },
  {
    id: 'mirror-pairedsuns', name: 'Mirror of Paired Suns', faction: 'mirror', type: 'unit', set: 'x2', cost: 6, power: 5, health: 5, tribe: 'construct',
    text: 'Deploy: put a Glimmer copy of each other ally with 3 or less power in your hand. Conjunction: the copies are not Glimmer.',
    abilities: [{
      on: 'deploy',
      ops: [{
        op: 'if', cond: { c: 'conjunction' },
        then: [{ op: 'copy', of: { from: 'otherAllies', filter: { maxPower: 3 } } }],
        else: [{ op: 'copy', of: { from: 'otherAllies', filter: { maxPower: 3 } }, glimmer: true }],
      }],
    }],
  },
  {
    id: 'mirror-pairedglint', name: 'Paired Glint', faction: 'mirror', type: 'glyph', set: 'x2', cost: 2, speed: 'flash',
    text: 'Give an allied unit +1|+1 this round. Conjunction: put a Glimmer copy of it in your hand.',
    targets: [{ what: 'unit', side: 'ally' }],
    ops: [
      { op: 'buff', to: 'target0', power: 1, health: 1, dur: 'round' },
      { op: 'if', cond: { c: 'conjunction' }, then: [{ op: 'copy', of: 'target0', glimmer: true }] },
    ],
  },
  {
    id: 'mirror-starwardglance', name: 'Starward Glance', faction: 'mirror', type: 'glyph', set: 'x2', cost: 2, speed: 'swift',
    text: 'Chart a glyph (4). Resonant: also Chart a unit (4).',
    ops: [
      { op: 'chart', n: 4, find: { type: 'glyph' } },
      { op: 'if', cond: { c: 'resonant' }, then: [{ op: 'chart', n: 4, find: { type: 'unit' } }] },
    ],
  },
  {
    id: 'mirror-binaryflare', name: 'Binary Flare', faction: 'mirror', type: 'glyph', set: 'x2', cost: 3, speed: 'swift',
    text: 'Deal 2 to an enemy unit. Conjunction: deal 2 to another enemy unit too.',
    targets: [{ what: 'unit', side: 'enemy' }, { what: 'unit', side: 'enemy' }],
    ops: [
      { op: 'damage', to: 'target0', n: 2 },
      { op: 'if', cond: { c: 'conjunction' }, then: [{ op: 'damage', to: 'target1', n: 2 }] },
    ],
  },
  {
    id: 'mirror-twinephemeris', name: 'Twin Ephemeris', faction: 'mirror', type: 'glyph', set: 'x2', cost: 3, speed: 'ritual',
    text: 'Chart a unit (5). Chart a glyph (5).',
    ops: [{ op: 'chart', n: 5, find: { type: 'unit' } }, { op: 'chart', n: 5, find: { type: 'glyph' } }],
  },
];

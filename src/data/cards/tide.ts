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
    text: 'Deploy: return another allied unit to your hand.',
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
    text: 'When you cast a glyph, put the weakest enemy in Stasis. If it is already in Stasis, nothing happens.',
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
    text: 'Deploy: put up to two enemy units in Stasis.',
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
    text: 'Put up to two enemy units in Stasis.',
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

  // ---------- First Light additions (docs/SETS.md): the archivist and the tide-turner ----------
  {
    id: 'tide-sefa', name: 'Sefa Lowlantern, Archivist', faction: 'tide', type: 'hero', cost: 4, power: 2, health: 5,
    tribe: 'mage',
    text: 'Strike: draw 1.',
    abilities: [{ on: 'strike', ops: [{ op: 'draw', n: 1 }] }],
    level: { who: 'you', stat: 'cardsDrawn', n: 14, text: "You've drawn 14+ cards" },
    ascended: {
      name: 'Sefa, the Drowned Index', power: 4, health: 7,
      text: 'Strike: draw 1. Dusk: draw 1. Ascend: deal damage to the strongest enemy equal to the cards in your hand.',
      abilities: [
        { on: 'strike', ops: [{ op: 'draw', n: 1 }] },
        { on: 'dusk', ops: [{ op: 'draw', n: 1 }] },
        { on: 'ascend', ops: [{ op: 'damage', to: 'strongestEnemy', n: { count: 'hand' } }] },
      ],
    },
  },
  {
    id: 'tide-corra', name: 'Corra Ebbwright', faction: 'tide', type: 'hero', cost: 4, power: 3, health: 4,
    tribe: 'mage',
    text: 'Deploy: return another allied unit to your hand and put an enemy unit in Stasis.',
    abilities: [{
      on: 'deploy',
      targets: [{ what: 'unit', side: 'ally' }, { what: 'unit', side: 'enemy' }],
      ops: [{ op: 'recall', to: 'target0' }, { op: 'stasis', to: 'target1' }],
    }],
    level: { who: 'you', stat: 'recalled', n: 5, text: "You've returned 5+ units to a hand" },
    ascended: {
      name: 'Corra, Turner of Tides', power: 4, health: 6,
      text: 'Your units cost 1 less. Deploy: return another allied unit to your hand and put an enemy unit in Stasis. ' +
        "Ascend: return every enemy unit with 3 or less power to its owner's hand.",
      costAuras: [{ type: 'unit', n: -1 }],
      abilities: [
        {
          on: 'deploy',
          targets: [{ what: 'unit', side: 'ally' }, { what: 'unit', side: 'enemy' }],
          ops: [{ op: 'recall', to: 'target0' }, { op: 'stasis', to: 'target1' }],
        },
        { on: 'ascend', ops: [{ op: 'recall', to: { from: 'enemies', filter: { maxPower: 3 } } }] },
      ],
    },
  },
  {
    id: 'tide-siltnewt', name: 'Silt Newt', faction: 'tide', type: 'unit', cost: 1, power: 0, health: 3, tribe: 'beast',
    text: 'Shatter: draw 1.',
    abilities: [{ on: 'shatter', ops: [{ op: 'draw', n: 1 }] }],
  },
  {
    id: 'tide-marginclerk', name: 'Margin Clerk', faction: 'tide', type: 'unit', cost: 1, power: 1, health: 1, tribe: 'mage',
    text: 'Deploy: I get +1|+1 for each card in your hand, up to +2|+2.',
    abilities: [{
      on: 'deploy',
      ops: [{ op: 'buff', to: 'self', power: { count: 'hand', mul: 1, max: 2 }, health: { count: 'hand', mul: 1, max: 2 } }],
    }],
  },
  {
    id: 'tide-lockhound', name: 'Lock Hound', faction: 'tide', type: 'unit', cost: 1, power: 2, health: 1, tribe: 'beast',
    text: "Deploy: return an enemy unit in Stasis to its owner's hand.",
    abilities: [{ on: 'deploy', targets: [{ what: 'unit', side: 'enemy', filter: { stasis: true } }], ops: [{ op: 'recall', to: 'target0' }] }],
  },
  {
    id: 'tide-undertowsprite', name: 'Undertow Sprite', faction: 'tide', type: 'unit', cost: 2, power: 2, health: 2, tribe: 'beast',
    text: 'When another ally is summoned, if you sent a unit back to a hand this round, I get +1|+1.',
    abilities: [{ on: 'allySummoned', cond: { c: 'seenRound', stat: 'recalled', gte: 1 }, ops: [{ op: 'buff', to: 'self', power: 1, health: 1 }] }],
  },
  {
    id: 'tide-tallyframe', name: 'Tallyframe', faction: 'tide', type: 'unit', cost: 2, power: 1, health: 3, tribe: 'construct',
    text: 'When I take damage and survive, draw 1.',
    abilities: [{ on: 'survive', ops: [{ op: 'draw', n: 1 }] }],
  },
  {
    id: 'tide-reedmarshheron', name: 'Reedmarsh Heron', faction: 'tide', type: 'unit', cost: 2, power: 2, health: 2, tribe: 'beast',
    keywords: ['spotter'],
    text: 'Spotter. Resonant: I have +1|+2.',
    auras: [{ to: 'self', power: 1, health: 2, cond: { c: 'resonant' } }],
  },
  {
    id: 'tide-tidemarkreader', name: 'Tidemark Reader', faction: 'tide', type: 'unit', cost: 3, power: 2, health: 3, tribe: 'mage',
    text: 'Deploy: if you sent a unit back to a hand this round, I get +2|+2.',
    abilities: [{ on: 'deploy', cond: { c: 'seenRound', stat: 'recalled', gte: 1 }, ops: [{ op: 'buff', to: 'self', power: 2, health: 2 }] }],
  },
  {
    id: 'tide-shelfwarden', name: 'Shelf Warden', faction: 'tide', type: 'unit', cost: 3, power: 1, health: 5, tribe: 'construct',
    text: 'Dawn: I get +1|+0 this round for each card in your hand, up to +3|+0.',
    abilities: [{ on: 'dawn', ops: [{ op: 'buff', to: 'self', power: { count: 'hand', mul: 1, max: 3 }, dur: 'round' }] }],
  },
  {
    id: 'tide-backflowlancer', name: 'Backflow Lancer', faction: 'tide', type: 'unit', cost: 3, power: 2, health: 3, tribe: 'mage',
    text: "Assault: return the weakest enemy to its owner's hand.",
    abilities: [{ on: 'assault', ops: [{ op: 'recall', to: 'weakestEnemy' }] }],
  },
  {
    id: 'tide-weirgolem', name: 'Weir Golem', faction: 'tide', type: 'unit', cost: 4, power: 2, health: 5, tribe: 'construct',
    text: "Strike: return the unit I fought to its owner's hand.",
    abilities: [{ on: 'strike', ops: [{ op: 'recall', to: 'opposing' }] }],
  },
  {
    id: 'tide-brineboundsage', name: 'Brinebound Sage', faction: 'tide', type: 'unit', cost: 4, power: 3, health: 4, tribe: 'mage',
    text: 'Deploy: if an enemy unit is in Stasis, draw 2.',
    abilities: [{
      on: 'deploy',
      cond: { c: 'count', of: { from: 'enemies', filter: { stasis: true } }, gte: 1 },
      ops: [{ op: 'draw', n: 2 }],
    }],
  },
  {
    id: 'tide-sluicegatebehemoth', name: 'Sluicegate Behemoth', faction: 'tide', type: 'unit', cost: 5, power: 4, health: 5, tribe: 'beast',
    text: 'Assault: put the strongest enemy in Stasis. Resonant: I have +1|+1.',
    abilities: [{ on: 'assault', ops: [{ op: 'stasis', to: 'strongestEnemy' }] }],
    auras: [{ to: 'self', power: 1, health: 1, cond: { c: 'resonant' } }],
  },
  {
    id: 'tide-floodwallcolossus', name: 'Floodwall Colossus', faction: 'tide', type: 'unit', cost: 6, power: 4, health: 6, tribe: 'construct',
    keywords: ['plated'],
    text: "Plated. Shatter: return every enemy unit to its owner's hand.",
    abilities: [{ on: 'shatter', ops: [{ op: 'recall', to: 'enemies' }] }],
  },
  {
    id: 'tide-lorewhale', name: 'Abyssal Lorewhale', faction: 'tide', type: 'unit', cost: 8, power: 6, health: 7, tribe: 'beast',
    keywords: ['aerial'],
    text: 'Aerial. Assault: draw 2.',
    abilities: [{ on: 'assault', ops: [{ op: 'draw', n: 2 }] }],
  },
  {
    id: 'tide-boundvolume', name: 'Bound Volume', faction: 'tide', type: 'glyph', cost: 1, speed: 'flash',
    text: 'An allied unit gets +0|+1 this round for each card in your hand.',
    targets: [{ what: 'unit', side: 'ally' }],
    ops: [{ op: 'buff', to: 'target0', health: { count: 'hand', mul: 1 }, dur: 'round' }],
  },
  {
    id: 'tide-pulloftheweir', name: 'Pull of the Weir', faction: 'tide', type: 'glyph', cost: 2, speed: 'flash',
    text: "Return a unit in combat with 3 or less power to its owner's hand.",
    targets: [{ what: 'unit', side: 'any', filter: { maxPower: 3 }, inCombat: true }],
    ops: [{ op: 'recall', to: 'target0' }],
  },
  {
    id: 'tide-mooringline', name: 'Mooring Line', faction: 'tide', type: 'glyph', cost: 3, speed: 'flash',
    text: 'Put an enemy unit in combat in Stasis and draw 1.',
    targets: [{ what: 'unit', side: 'enemy', inCombat: true }],
    ops: [{ op: 'stasis', to: 'target0' }, { op: 'draw', n: 1 }],
  },
  {
    id: 'tide-readthecurrent', name: 'Read the Current', faction: 'tide', type: 'glyph', cost: 2, speed: 'swift',
    text: 'Draw 1. If you sent a unit back to a hand this round, draw 1 more.',
    ops: [{ op: 'draw', n: 1 }, { op: 'if', cond: { c: 'seenRound', stat: 'recalled', gte: 1 }, then: [{ op: 'draw', n: 1 }] }],
  },
  {
    id: 'tide-rifflethestacks', name: 'Riffle the Stacks', faction: 'tide', type: 'glyph', cost: 3, speed: 'swift',
    text: 'Draw 2. Resonant: draw 3 instead.',
    ops: [{ op: 'if', cond: { c: 'resonant' }, then: [{ op: 'draw', n: 3 }], else: [{ op: 'draw', n: 2 }] }],
  },
  {
    id: 'tide-lockandrelease', name: 'Lock and Release', faction: 'tide', type: 'glyph', cost: 4, speed: 'swift',
    text: "Return an allied unit to your hand and an enemy unit to its owner's hand.",
    targets: [{ what: 'unit', side: 'ally' }, { what: 'unit', side: 'enemy' }],
    ops: [{ op: 'recall', to: 'target0' }, { op: 'recall', to: 'target1' }],
  },
  {
    id: 'tide-sluicesweep', name: 'Sluice Sweep', faction: 'tide', type: 'glyph', cost: 5, speed: 'swift',
    text: "Return up to two enemy units with 3 or less power to their owners' hands.",
    targets: [{ what: 'unit', side: 'enemy', filter: { maxPower: 3 } }, { what: 'unit', side: 'enemy', filter: { maxPower: 3 } }],
    ops: [{ op: 'recall', to: 'target0' }, { op: 'recall', to: 'target1' }],
  },
  {
    id: 'tide-homewardcurrent', name: 'Homeward Current', faction: 'tide', type: 'glyph', cost: 3, speed: 'ritual',
    text: 'Return an allied unit to your hand and draw 2.',
    targets: [{ what: 'unit', side: 'ally' }],
    ops: [{ op: 'recall', to: 'target0' }, { op: 'draw', n: 2 }],
  },
  {
    id: 'tide-turnofthelocks', name: 'Turn of the Locks', faction: 'tide', type: 'glyph', cost: 6, speed: 'ritual',
    text: "Return every unit to its owner's hand, then draw 2.",
    ops: [{ op: 'recall', to: 'all' }, { op: 'draw', n: 2 }],
  },

  // ---------- set x1: The Mirror Quarter ----------
  // Reflections on the water: Reprise glyphs, Glimmer copies of recalled and stilled units, mages that answer enemy glyphs.
  {
    id: 'tide-hesper', name: 'Hesper Twicewater', faction: 'tide', type: 'hero', cost: 4, power: 3, health: 4,
    tribe: 'mage', set: 'x1',
    text: 'Deploy: put a Glimmer copy of another allied unit in your hand.',
    abilities: [{ on: 'deploy', targets: [{ what: 'unit', side: 'ally' }], ops: [{ op: 'copy', of: 'target0', glimmer: true }] }],
    level: { who: 'you', stat: 'glimmerPlayed', n: 4, text: "You've played 4+ Glimmer cards" },
    ascended: {
      name: 'Hesper, the Doubled Tide', power: 4, health: 6,
      text: 'Deploy: put a Glimmer copy of another allied unit in your hand. Dawn: put a Glimmer copy of a random other ally in your hand. ' +
        "Ascend: return the strongest enemy to its owner's hand and put a Glimmer copy of it in your hand.",
      abilities: [
        { on: 'deploy', targets: [{ what: 'unit', side: 'ally' }], ops: [{ op: 'copy', of: 'target0', glimmer: true }] },
        { on: 'dawn', ops: [{ op: 'copy', of: 'randomAlly', glimmer: true }] },
        { on: 'ascend', ops: [{ op: 'copy', of: 'strongestEnemy', glimmer: true }, { op: 'recall', to: 'strongestEnemy' }] },
      ],
    },
  },
  {
    id: 'tide-canalglint', name: 'Canal Glint', faction: 'tide', type: 'unit', cost: 1, power: 1, health: 1, tribe: 'mage', set: 'x1',
    text: 'Deploy: put a Glimmer copy of an allied unit with 2 or less power in your hand.',
    abilities: [{ on: 'deploy', targets: [{ what: 'unit', side: 'ally', filter: { maxPower: 2 } }], ops: [{ op: 'copy', of: 'target0', glimmer: true }] }],
  },
  {
    id: 'tide-wakeecho', name: 'Wake Echo', faction: 'tide', type: 'unit', cost: 2, power: 2, health: 2, tribe: 'beast', set: 'x1',
    text: 'When the opponent casts a glyph, put a Glimmer copy of me in your hand.',
    abilities: [{ on: 'foeGlyph', ops: [{ op: 'copy', of: 'self', glimmer: true }] }],
  },
  {
    id: 'tide-glasswaterlookout', name: 'Glasswater Lookout', faction: 'tide', type: 'unit', cost: 2, power: 1, health: 2, tribe: 'construct', set: 'x1',
    keywords: ['veiled'],
    text: 'Veiled. When the opponent casts a glyph, I get +1|+1.',
    abilities: [{ on: 'foeGlyph', ops: [{ op: 'buff', to: 'self', power: 1, health: 1 }] }],
  },
  {
    id: 'tide-surfacemimic', name: 'Surface Mimic', faction: 'tide', type: 'unit', cost: 3, power: 2, health: 3, tribe: 'mage', set: 'x1',
    text: 'Deploy: put a Glimmer copy of an enemy unit in your hand. Resonant: the copy is not Glimmer.',
    abilities: [{
      on: 'deploy',
      targets: [{ what: 'unit', side: 'enemy' }],
      ops: [{ op: 'if', cond: { c: 'resonant' }, then: [{ op: 'copy', of: 'target0' }], else: [{ op: 'copy', of: 'target0', glimmer: true }] }],
    }],
  },
  {
    id: 'tide-mirrorwakecourier', name: 'Mirrorwake Courier', faction: 'tide', type: 'unit', cost: 3, power: 2, health: 3, tribe: 'mage', set: 'x1',
    text: 'Deploy: return another allied unit to your hand and put a Glimmer copy of it in your hand.',
    abilities: [{
      on: 'deploy',
      targets: [{ what: 'unit', side: 'ally' }],
      ops: [{ op: 'copy', of: 'target0', glimmer: true }, { op: 'recall', to: 'target0' }], // copy first: R-E2 copies a unit on a Line
    }],
  },
  {
    id: 'tide-stillmirrormagus', name: 'Stillmirror Magus', faction: 'tide', type: 'unit', cost: 4, power: 3, health: 4, tribe: 'mage', set: 'x1',
    text: 'When the opponent casts a glyph, put the strongest enemy in Stasis. If it is already in Stasis, nothing happens. Resonant: I have +1|+1.',
    abilities: [{ on: 'foeGlyph', ops: [{ op: 'stasis', to: 'strongestEnemy' }] }],
    auras: [{ to: 'self', power: 1, health: 1, cond: { c: 'resonant' } }],
  },
  {
    id: 'tide-pondmirrorwarden', name: 'Pondmirror Warden', faction: 'tide', type: 'unit', cost: 5, power: 3, health: 5, tribe: 'mage', set: 'x1',
    text: 'Deploy: put an enemy unit in Stasis and put a Glimmer copy of it in your hand.',
    abilities: [{
      on: 'deploy',
      targets: [{ what: 'unit', side: 'enemy' }],
      ops: [{ op: 'stasis', to: 'target0' }, { op: 'copy', of: 'target0', glimmer: true }],
    }],
  },
  {
    id: 'tide-mirrordeepleviathan', name: 'Mirrordeep Leviathan', faction: 'tide', type: 'unit', cost: 7, power: 5, health: 6, tribe: 'beast', set: 'x1',
    keywords: ['veiled'],
    text: 'Veiled. Assault: put every enemy unit in Stasis.',
    abilities: [{ on: 'assault', ops: [{ op: 'stasis', to: 'enemies' }] }],
  },
  {
    id: 'tide-twinmoorings', name: 'Twin Moorings', faction: 'tide', type: 'glyph', cost: 2, speed: 'flash', set: 'x1',
    keywords: ['reprise'],
    text: 'Reprise. Put an enemy unit in combat in Stasis.',
    targets: [{ what: 'unit', side: 'enemy', inCombat: true }],
    ops: [{ op: 'stasis', to: 'target0' }],
  },
  {
    id: 'tide-caughtreflection', name: 'Caught Reflection', faction: 'tide', type: 'glyph', cost: 2, speed: 'flash', set: 'x1',
    text: 'Put a Glimmer copy of an enemy glyph in your hand.',
    targets: [{ what: 'glyph', side: 'enemy' }],
    ops: [{ op: 'copy', of: 'target0', glimmer: true }],
  },
  {
    id: 'tide-ebbandecho', name: 'Ebb and Echo', faction: 'tide', type: 'glyph', cost: 3, speed: 'swift', set: 'x1',
    keywords: ['reprise'],
    text: "Reprise. Return an enemy unit with 3 or less power to its owner's hand.",
    targets: [{ what: 'unit', side: 'enemy', filter: { maxPower: 3 } }],
    ops: [{ op: 'recall', to: 'target0' }],
  },
  {
    id: 'tide-echoingcurrent', name: 'Echoing Current', faction: 'tide', type: 'glyph', cost: 3, speed: 'swift', set: 'x1',
    keywords: ['reprise'],
    text: "Reprise. Draw 1. If you've cast 2 or more glyphs this round, draw 1 more.",
    ops: [{ op: 'draw', n: 1 }, { op: 'if', cond: { c: 'seenRound', stat: 'glyphsCast', gte: 2 }, then: [{ op: 'draw', n: 1 }] }],
  },
  {
    id: 'tide-frozenreflections', name: 'Frozen Reflections', faction: 'tide', type: 'glyph', cost: 3, speed: 'ritual', set: 'x1',
    text: 'Draw 1. Put a Glimmer copy of each enemy unit in Stasis in your hand.',
    ops: [{ op: 'draw', n: 1 }, { op: 'copy', of: { from: 'enemies', filter: { stasis: true } }, glimmer: true }],
  },

  // ---------- set x2: The Starward Rise ----------
  // Tide tables and the moon: mages who Chart for the right glyph, Conjunction rewards for casting and playing in the
  // same round, and lock-keepers that Unfold after holding the canal.
  {
    id: 'tide-orsa', name: 'Orsa Neapwater, Tide-Reckoner', faction: 'tide', type: 'hero', cost: 4, power: 2, health: 4,
    tribe: 'mage', set: 'x2',
    text: 'Dawn: Chart a glyph (3).',
    abilities: [{ on: 'dawn', ops: [{ op: 'chart', n: 3, find: { type: 'glyph' } }] }],
    level: { who: 'you', stat: 'charted', n: 5, text: "You've drawn 5+ cards by Chart" },
    ascended: {
      name: 'Orsa, Reckoner of the Spring Tide', power: 4, health: 6,
      text: 'Dawn: Chart a glyph (4). Ascend: your other units get +1|+1 and gain Ward.',
      abilities: [
        { on: 'dawn', ops: [{ op: 'chart', n: 4, find: { type: 'glyph' } }] },
        { on: 'ascend', ops: [{ op: 'buff', to: 'otherAllies', power: 1, health: 1 }, { op: 'grant', to: 'otherAllies', kw: ['ward'] }] },
      ],
    },
  },
  {
    id: 'tide-almanacrunner', name: 'Almanac Runner', faction: 'tide', type: 'unit', cost: 1, power: 1, health: 1, tribe: 'mage', set: 'x2',
    text: 'Deploy: Chart a mage (4).',
    abilities: [{ on: 'deploy', ops: [{ op: 'chart', n: 4, find: { tribe: 'mage' } }] }],
  },
  {
    id: 'tide-neapgatekeeper', name: 'Neapgate Keeper', faction: 'tide', type: 'unit', cost: 2, power: 1, health: 3, tribe: 'construct', set: 'x2',
    text: '',
    level: { who: 'self', stat: 'dawns', n: 2, text: 'Started 2 rounds on the Line' },
    ascended: {
      name: 'Springgate Keeper', power: 3, health: 4,
      text: 'Unfold: put the strongest enemy in Stasis.',
      abilities: [{ on: 'unfold', ops: [{ op: 'stasis', to: 'strongestEnemy' }] }],
    },
  },
  {
    id: 'tide-highwatercantor', name: 'Highwater Cantor', faction: 'tide', type: 'unit', cost: 3, power: 2, health: 3, tribe: 'mage', set: 'x2',
    text: 'When you cast a glyph, if Conjunction, I get +1|+1.',
    abilities: [{ on: 'glyphCast', cond: { c: 'conjunction' }, ops: [{ op: 'buff', to: 'self', power: 1, health: 1 }] }],
  },
  {
    id: 'tide-breakwatersentry', name: 'Breakwater Sentry', faction: 'tide', type: 'unit', cost: 3, power: 1, health: 4, tribe: 'construct', set: 'x2',
    text: '',
    level: { who: 'self', stat: 'survivals', n: 2, text: 'Took damage and survived 2 times' },
    ascended: {
      name: 'Breakwater Bastion', power: 3, health: 6, keywords: ['plated'],
      text: 'Plated. Unfold: draw 1.',
      abilities: [{ on: 'unfold', ops: [{ op: 'draw', n: 1 }] }],
    },
  },
  {
    id: 'tide-lunarephemerist', name: 'Lunar Ephemerist', faction: 'tide', type: 'unit', cost: 4, power: 2, health: 4, tribe: 'mage', set: 'x2',
    text: 'Deploy: Chart a glyph (4). Resonant: I have +1|+2.',
    abilities: [{ on: 'deploy', ops: [{ op: 'chart', n: 4, find: { type: 'glyph' } }] }],
    auras: [{ to: 'self', power: 1, health: 2, cond: { c: 'resonant' } }],
  },
  {
    id: 'tide-moonboundfloodwarden', name: 'Moonbound Floodwarden', faction: 'tide', type: 'unit', cost: 5, power: 3, health: 6, tribe: 'mage', set: 'x2',
    text: 'Deploy: if Conjunction, put every enemy unit with 3 or less power in Stasis.',
    abilities: [{ on: 'deploy', cond: { c: 'conjunction' }, ops: [{ op: 'stasis', to: { from: 'enemies', filter: { maxPower: 3 } } }] }],
  },
  {
    id: 'tide-moonhaulleviathan', name: 'Moonhaul Leviathan', faction: 'tide', type: 'unit', cost: 6, power: 4, health: 6, tribe: 'beast', set: 'x2',
    keywords: ['plated'],
    text: 'Plated.',
    level: { who: 'self', stat: 'dawns', n: 1, text: 'Started 1 round on the Line' },
    ascended: {
      name: 'Perigee Leviathan', power: 7, health: 8, keywords: ['plated'],
      text: "Plated. Unfold: return the strongest enemy to its owner's hand.",
      abilities: [{ on: 'unfold', ops: [{ op: 'recall', to: 'strongestEnemy' }] }],
    },
  },
  {
    id: 'tide-tidelockbrace', name: 'Tidelock Brace', faction: 'tide', type: 'glyph', cost: 1, speed: 'flash', set: 'x2',
    text: 'An allied unit gets +0|+2 this round. Conjunction: it also gains Ward.',
    targets: [{ what: 'unit', side: 'ally' }],
    ops: [{ op: 'buff', to: 'target0', health: 2, dur: 'round' }, { op: 'if', cond: { c: 'conjunction' }, then: [{ op: 'grant', to: 'target0', kw: ['ward'] }] }],
  },
  {
    id: 'tide-moonpull', name: 'Moonpull', faction: 'tide', type: 'glyph', cost: 2, speed: 'swift', set: 'x2',
    text: "Put an enemy unit in Stasis. Conjunction: return it to its owner's hand instead.",
    targets: [{ what: 'unit', side: 'enemy' }],
    ops: [{ op: 'if', cond: { c: 'conjunction' }, then: [{ op: 'recall', to: 'target0' }], else: [{ op: 'stasis', to: 'target0' }] }],
  },
  {
    id: 'tide-tidetables', name: 'Tide Tables', faction: 'tide', type: 'glyph', cost: 3, speed: 'swift', set: 'x2',
    text: 'Chart a unit (4) and Chart a glyph (4).',
    ops: [{ op: 'chart', n: 4, find: { type: 'unit' } }, { op: 'chart', n: 4, find: { type: 'glyph' } }],
  },
  {
    id: 'tide-slackwater', name: 'Slack Water', faction: 'tide', type: 'glyph', cost: 4, speed: 'ritual', set: 'x2',
    text: 'Repair your units fully, then they get +0|+2. Resonant: draw 2.',
    ops: [{ op: 'heal', to: 'allies', n: 99 }, { op: 'buff', to: 'allies', health: 2 }, { op: 'if', cond: { c: 'resonant' }, then: [{ op: 'draw', n: 2 }] }],
  },
];

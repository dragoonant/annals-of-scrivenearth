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

  // ---------- collectible units ----------
  {
    id: 'ember-cinderscamp', name: 'Cinder Scamp', faction: 'ember', type: 'unit', cost: 1, power: 1, health: 1, tribe: 'construct',
    text: 'Deploy: summon a Sparkbot.',
    abilities: [{ on: 'deploy', ops: [{ op: 'summon', card: 'ember-sparkbot' }] }],
  },
  {
    id: 'ember-kilnhand', name: 'Kiln Hand', faction: 'ember', type: 'unit', cost: 1, power: 1, health: 1, tribe: 'smith',
    text: 'Shatter: deal 1 to the enemy Spire.',
    abilities: [{ on: 'shatter', ops: [{ op: 'damage', to: 'enemySpire', n: 1 }] }],
  },
  {
    id: 'ember-ashrunner', name: 'Ash Runner', faction: 'ember', type: 'unit', cost: 1, power: 2, health: 1, tribe: 'construct',
    keywords: ['vanguard'], text: 'Vanguard.',
  },
  {
    id: 'ember-slagsmith', name: 'Slag-Smith', faction: 'ember', type: 'unit', cost: 2, power: 2, health: 2, tribe: 'smith',
    text: 'Deploy: deal 1 to an enemy unit.',
    abilities: [{ on: 'deploy', targets: [{ what: 'unit', side: 'enemy' }], ops: [{ op: 'damage', to: 'target0', n: 1 }] }],
  },
  {
    id: 'ember-sparkforge', name: 'Spark Forge', faction: 'ember', type: 'unit', cost: 2, power: 1, health: 3, tribe: 'construct',
    text: 'When you cast a glyph, summon a Sparkbot.',
    abilities: [{ on: 'glyphCast', ops: [{ op: 'summon', card: 'ember-sparkbot' }] }],
  },
  {
    id: 'ember-fuseguard', name: 'Fuse Guard', faction: 'ember', type: 'unit', cost: 2, power: 2, health: 1, tribe: 'construct',
    text: 'Shatter: deal 2 to a random enemy unit.',
    abilities: [{ on: 'shatter', ops: [{ op: 'damage', to: 'randomEnemy', n: 2 }] }],
  },
  {
    id: 'ember-furnacebrute', name: 'Furnace Brute', faction: 'ember', type: 'unit', cost: 3, power: 3, health: 3, tribe: 'construct',
    keywords: ['vanguard'], text: 'Vanguard. Resonant: I have +1|+1.',
    auras: [{ to: 'self', power: 1, health: 1, cond: { c: 'resonant' } }],
  },
  {
    id: 'ember-arcwelder', name: 'Arc Welder', faction: 'ember', type: 'unit', cost: 3, power: 2, health: 3, tribe: 'smith',
    text: 'Deploy: deal 2 to an enemy unit. Resonant: deal 3 instead.',
    abilities: [{
      on: 'deploy', targets: [{ what: 'unit', side: 'enemy' }],
      ops: [{ op: 'if', cond: { c: 'resonant' }, then: [{ op: 'damage', to: 'target0', n: 3 }], else: [{ op: 'damage', to: 'target0', n: 2 }] }],
    }],
  },
  {
    id: 'ember-furnacetender', name: 'Furnace Tender', faction: 'ember', type: 'unit', cost: 3, power: 2, health: 3, tribe: 'smith',
    text: 'Deploy: summon a Slagling.',
    abilities: [{ on: 'deploy', ops: [{ op: 'summon', card: 'ember-slagling' }] }],
  },
  {
    id: 'ember-blastminer', name: 'Blast Miner', faction: 'ember', type: 'unit', cost: 4, power: 3, health: 3, tribe: 'smith',
    text: 'Shatter: deal 2 to every enemy unit.',
    abilities: [{ on: 'shatter', ops: [{ op: 'damage', to: 'enemies', n: 2 }] }],
  },
  {
    id: 'ember-pyrelancer', name: 'Pyre Lancer', faction: 'ember', type: 'unit', cost: 4, power: 3, health: 3, tribe: 'construct',
    keywords: ['vanguard'], text: 'Vanguard. Assault: deal 1 to the enemy Spire.',
    abilities: [{ on: 'assault', ops: [{ op: 'damage', to: 'enemySpire', n: 1 }] }],
  },
  {
    id: 'ember-moltenwarden', name: 'Molten Warden', faction: 'ember', type: 'unit', cost: 5, power: 4, health: 4, tribe: 'construct',
    text: 'Deploy: deal 3 to an enemy unit.',
    abilities: [{ on: 'deploy', targets: [{ what: 'unit', side: 'enemy' }], ops: [{ op: 'damage', to: 'target0', n: 3 }] }],
  },
  {
    id: 'ember-crucibleherald', name: 'Crucible Herald', faction: 'ember', type: 'unit', cost: 6, power: 3, health: 5, tribe: 'smith',
    text: 'Deploy: summon 3 Slaglings.',
    abilities: [{ on: 'deploy', ops: [{ op: 'summon', card: 'ember-slagling', n: 3 }] }],
  },
  {
    id: 'ember-foundrytitan', name: 'Foundry Titan', faction: 'ember', type: 'unit', cost: 7, power: 6, health: 7, tribe: 'construct',
    keywords: ['pierce'], text: 'Pierce. Deploy: deal 2 to every enemy unit.',
    abilities: [{ on: 'deploy', ops: [{ op: 'damage', to: 'enemies', n: 2 }] }],
  },
  // ---------- collectible glyphs ----------
  {
    id: 'ember-overdrive', name: 'Overdrive', faction: 'ember', type: 'glyph', cost: 1, speed: 'flash',
    text: 'An ally gets +2|+0 this round.',
    targets: [{ what: 'unit', side: 'ally' }], ops: [{ op: 'buff', to: 'target0', power: 2, dur: 'round' }],
  },
  {
    id: 'ember-pinprick', name: 'Pinprick', faction: 'ember', type: 'glyph', cost: 2, speed: 'flash',
    text: 'Deal 1 to an enemy unit or the enemy Spire.',
    targets: [{ what: 'unitOrSpire', side: 'enemy' }], ops: [{ op: 'damage', to: 'target0', n: 1 }],
  },
  {
    id: 'ember-ventburst', name: 'Vent Burst', faction: 'ember', type: 'glyph', cost: 3, speed: 'flash',
    text: 'Deal 2 to an enemy unit and 1 to the enemy Spire.',
    targets: [{ what: 'unit', side: 'enemy' }], ops: [{ op: 'damage', to: 'target0', n: 2 }, { op: 'damage', to: 'enemySpire', n: 1 }],
  },
  {
    id: 'ember-slagbolt', name: 'Slag Bolt', faction: 'ember', type: 'glyph', cost: 2, speed: 'swift',
    text: 'Deal 3 to an enemy unit.',
    targets: [{ what: 'unit', side: 'enemy' }], ops: [{ op: 'damage', to: 'target0', n: 3 }],
  },
  {
    id: 'ember-scrapburst', name: 'Scrap Burst', faction: 'ember', type: 'glyph', cost: 2, speed: 'swift',
    text: 'Destroy an ally. Deal 3 to the enemy Spire.',
    targets: [{ what: 'unit', side: 'ally' }], ops: [{ op: 'destroy', to: 'target0' }, { op: 'damage', to: 'enemySpire', n: 3 }],
  },
  {
    id: 'ember-heatlance', name: 'Heat Lance', faction: 'ember', type: 'glyph', cost: 3, speed: 'swift',
    text: 'Deal 3 to an enemy unit or the enemy Spire.',
    targets: [{ what: 'unitOrSpire', side: 'enemy' }], ops: [{ op: 'damage', to: 'target0', n: 3 }],
  },
  {
    id: 'ember-cinderhail', name: 'Cinder Hail', faction: 'ember', type: 'glyph', cost: 4, speed: 'swift',
    text: 'Deal 2 to every enemy unit.',
    ops: [{ op: 'damage', to: 'enemies', n: 2 }],
  },
  {
    id: 'ember-sparkcascade', name: 'Spark Cascade', faction: 'ember', type: 'glyph', cost: 3, speed: 'ritual',
    text: 'Summon 2 Sparkbots. Resonant: summon 2 more.',
    ops: [{ op: 'summon', card: 'ember-sparkbot', n: 2 }, { op: 'if', cond: { c: 'resonant' }, then: [{ op: 'summon', card: 'ember-sparkbot', n: 2 }] }],
  },
  {
    id: 'ember-firestorm', name: 'Foundry Firestorm', faction: 'ember', type: 'glyph', cost: 6, speed: 'ritual',
    text: 'Deal 3 to every enemy unit and 2 to the enemy Spire.',
    ops: [{ op: 'damage', to: 'enemies', n: 3 }, { op: 'damage', to: 'enemySpire', n: 2 }],
  },

  // ---------- base set, second wave (docs/SETS.md): pit-fighter and overcharger ----------
  {
    id: 'ember-torva', name: 'Torva Slagjaw, Pit Champion', faction: 'ember', type: 'hero', cost: 3, power: 2, health: 3,
    keywords: ['vanguard', 'dueler'], tribe: 'smith',
    text: 'Vanguard, Dueler. Strike: I get +0|+1.',
    abilities: [{ on: 'strike', ops: [{ op: 'buff', to: 'self', health: 1 }] }],
    level: { who: 'self', stat: 'strikes', n: 5, text: "I've struck 5+ times" },
    ascended: {
      name: 'Torva, Pit Sovereign', power: 4, health: 5, keywords: ['vanguard', 'dueler'],
      text: 'Vanguard, Dueler. Strike: deal 1 to the enemy Spire. Ascend: I strike every enemy unit.',
      abilities: [
        { on: 'strike', ops: [{ op: 'damage', to: 'enemySpire', n: 1 }] },
        { on: 'ascend', ops: [{ op: 'strike', from: 'self', to: 'enemies' }] },
      ],
    },
  },
  {
    id: 'ember-yarrow', name: 'Yarrow Brightvalve, Boiler-Chief', faction: 'ember', type: 'hero', cost: 4, power: 3, health: 4,
    tribe: 'artificer',
    text: 'Dawn: gain 1 Reserve.',
    abilities: [{ on: 'dawn', ops: [{ op: 'reserve', n: 1 }] }],
    level: { who: 'you', stat: 'chargeSpent', n: 30, text: "You've spent 30+ Charge" },
    ascended: {
      name: 'Yarrow, the Redline', power: 5, health: 6,
      text: 'Dawn: gain 1 Reserve, then gain Charge equal to your Reserve. Ascend: gain 4 Charge.',
      abilities: [
        { on: 'dawn', ops: [{ op: 'reserve', n: 1 }, { op: 'charge', n: { count: 'reserve' } }] },
        { on: 'ascend', ops: [{ op: 'charge', n: 4 }] },
      ],
    },
  },
  // units
  {
    id: 'ember-valvetapper', name: 'Valve Tapper', faction: 'ember', type: 'unit', cost: 1, power: 0, health: 2, tribe: 'artificer',
    text: 'Deploy: gain 1 Reserve.',
    abilities: [{ on: 'deploy', ops: [{ op: 'reserve', n: 1 }] }],
  },
  {
    id: 'ember-ringcrier', name: 'Ring Crier', faction: 'ember', type: 'unit', cost: 1, power: 1, health: 1, tribe: 'smith',
    text: 'Deploy: give an ally Vanguard.',
    abilities: [{ on: 'deploy', targets: [{ what: 'unit', side: 'ally' }], ops: [{ op: 'grant', to: 'target0', kw: ['vanguard'] }] }],
  },
  {
    id: 'ember-flarebot', name: 'Flarebot', faction: 'ember', type: 'unit', cost: 1, power: 2, health: 2, tribe: 'construct',
    keywords: ['unstable'], text: 'Unstable. Shatter: gain 1 Reserve.',
    abilities: [{ on: 'shatter', ops: [{ op: 'reserve', n: 1 }] }],
  },
  {
    id: 'ember-pitbrawler', name: 'Pit Brawler', faction: 'ember', type: 'unit', cost: 2, power: 3, health: 1, tribe: 'smith',
    keywords: ['dueler'], text: 'Dueler.',
  },
  {
    id: 'ember-gaugewatcher', name: 'Gauge Watcher', faction: 'ember', type: 'unit', cost: 2, power: 1, health: 3, tribe: 'artificer',
    text: 'Dawn: if you have 2+ Reserve, deal 1 to the enemy Spire.',
    abilities: [{ on: 'dawn', cond: { c: 'reserve', gte: 2 }, ops: [{ op: 'damage', to: 'enemySpire', n: 1 }] }],
  },
  {
    id: 'ember-scrapreclaimer', name: 'Scrap Reclaimer', faction: 'ember', type: 'unit', cost: 2, power: 1, health: 3, tribe: 'artificer',
    text: 'When another ally is destroyed, gain 1 Charge.',
    abilities: [{ on: 'allyDied', ops: [{ op: 'charge', n: 1 }] }],
  },
  {
    id: 'ember-pitpromoter', name: 'Pit Promoter', faction: 'ember', type: 'unit', cost: 3, power: 2, health: 3, tribe: 'smith',
    text: 'Deploy: an ally and an enemy unit strike each other.',
    abilities: [{
      on: 'deploy', targets: [{ what: 'unit', side: 'ally' }, { what: 'unit', side: 'enemy' }],
      ops: [{ op: 'duel', a: 'target0', b: 'target1' }],
    }],
  },
  {
    id: 'ember-rivethurler', name: 'Rivet Hurler', faction: 'ember', type: 'unit', cost: 3, power: 2, health: 3, tribe: 'smith',
    text: 'Deploy: deal 1 to an enemy unit for each other ally you have (at most 4).',
    abilities: [{
      on: 'deploy', targets: [{ what: 'unit', side: 'enemy' }],
      ops: [{ op: 'damage', to: 'target0', n: { count: 'otherAllies', mul: 1, max: 4 } }],
    }],
  },
  {
    id: 'ember-meltdowngolem', name: 'Meltdown Golem', faction: 'ember', type: 'unit', cost: 3, power: 4, health: 4, tribe: 'construct',
    keywords: ['unstable'], text: 'Unstable. Deploy: deal 2 to an enemy unit.',
    abilities: [{ on: 'deploy', targets: [{ what: 'unit', side: 'enemy' }], ops: [{ op: 'damage', to: 'target0', n: 2 }] }],
  },
  {
    id: 'ember-slaggladiator', name: 'Slag Gladiator', faction: 'ember', type: 'unit', cost: 4, power: 3, health: 4, tribe: 'construct',
    keywords: ['vanguard'], text: 'Vanguard. Strike: I get +1|+0. Resonant: I have Dueler.',
    abilities: [{ on: 'strike', ops: [{ op: 'buff', to: 'self', power: 1 }] }],
    auras: [{ to: 'self', kw: ['dueler'], cond: { c: 'resonant' } }],
  },
  {
    id: 'ember-steamcondenser', name: 'Steam Condenser', faction: 'ember', type: 'unit', cost: 4, power: 2, health: 5, tribe: 'artificer',
    text: 'When you cast a glyph, gain 1 Reserve.',
    abilities: [{ on: 'glyphCast', ops: [{ op: 'reserve', n: 1 }] }],
  },
  {
    id: 'ember-pitboss', name: 'Pit Boss', faction: 'ember', type: 'unit', cost: 5, power: 4, health: 4, tribe: 'smith',
    text: 'Deploy: give an ally with Vanguard +2|+1, then it strikes an enemy unit.',
    abilities: [{
      on: 'deploy', targets: [{ what: 'unit', side: 'ally', filter: { kw: 'vanguard' } }, { what: 'unit', side: 'enemy' }],
      ops: [{ op: 'buff', to: 'target0', power: 2, health: 1 }, { op: 'strike', from: 'target0', to: 'target1' }],
    }],
  },
  {
    id: 'ember-forgemarshal', name: 'Forge Marshal', faction: 'ember', type: 'unit', cost: 6, power: 5, health: 5, tribe: 'smith',
    text: 'Allies with Vanguard have +1|+1. Resonant: they also have Pierce.',
    auras: [
      { to: 'allies', filter: { kw: 'vanguard' }, power: 1, health: 1 },
      { to: 'allies', filter: { kw: 'vanguard' }, kw: ['pierce'], cond: { c: 'resonant' } },
    ],
  },
  {
    id: 'ember-boilercolossus', name: 'Boiler Colossus', faction: 'ember', type: 'unit', cost: 8, power: 7, health: 7, tribe: 'construct',
    keywords: ['pierce'], text: 'Pierce. Deploy: gain 3 Charge.',
    abilities: [{ on: 'deploy', ops: [{ op: 'charge', n: 3 }] }],
  },
  // glyphs
  {
    id: 'ember-stoketheboiler', name: 'Stoke the Boiler', faction: 'ember', type: 'glyph', cost: 1, speed: 'flash',
    text: 'Destroy an ally with Unstable. Gain 2 Charge.',
    targets: [{ what: 'unit', side: 'ally', filter: { kw: 'unstable' } }],
    ops: [{ op: 'destroy', to: 'target0' }, { op: 'charge', n: 2 }],
  },
  {
    id: 'ember-hotrivets', name: 'Hot Rivets', faction: 'ember', type: 'glyph', cost: 2, speed: 'flash',
    text: 'Give an ally with Vanguard +2|+2 this round. Resonant: it also gets Pierce this round.',
    targets: [{ what: 'unit', side: 'ally', filter: { kw: 'vanguard' } }],
    ops: [
      { op: 'buff', to: 'target0', power: 2, health: 2, dur: 'round' },
      { op: 'if', cond: { c: 'resonant' }, then: [{ op: 'grant', to: 'target0', kw: ['pierce'], dur: 'round' }] },
    ],
  },
  {
    id: 'ember-cheapshot', name: 'Cheap Shot', faction: 'ember', type: 'glyph', cost: 3, speed: 'flash',
    text: 'An ally in combat strikes an enemy unit in combat.', needsAllTargets: true,
    targets: [{ what: 'unit', side: 'ally', inCombat: true }, { what: 'unit', side: 'enemy', inCombat: true }],
    ops: [{ op: 'strike', from: 'target0', to: 'target1' }],
  },
  {
    id: 'ember-shrapneltoss', name: 'Shrapnel Toss', faction: 'ember', type: 'glyph', cost: 2, speed: 'swift',
    text: "Choose an ally with Unstable and an enemy unit. Deal damage equal to the ally's power to the enemy unit, then destroy the ally.",
    needsAllTargets: true,
    targets: [{ what: 'unit', side: 'ally', filter: { kw: 'unstable' } }, { what: 'unit', side: 'enemy' }],
    ops: [{ op: 'damage', to: 'target1', n: { count: 'target0Power' } }, { op: 'destroy', to: 'target0' }],
  },
  {
    id: 'ember-sparkgap', name: 'Spark Gap', faction: 'ember', type: 'glyph', cost: 2, speed: 'swift',
    text: 'Deal 2 to an enemy unit. Summon a Sparkbot.',
    targets: [{ what: 'unit', side: 'enemy' }],
    ops: [{ op: 'damage', to: 'target0', n: 2 }, { op: 'summon', card: 'ember-sparkbot' }],
  },
  {
    id: 'ember-clearthering', name: 'Clear the Ring', faction: 'ember', type: 'glyph', cost: 4, speed: 'swift',
    text: 'An ally with Vanguard strikes each enemy unit with 2 or less power.',
    targets: [{ what: 'unit', side: 'ally', filter: { kw: 'vanguard' } }],
    ops: [{ op: 'strike', from: 'target0', to: { from: 'enemies', filter: { maxPower: 2 } } }],
  },
  {
    id: 'ember-overpressure', name: 'Overpressure', faction: 'ember', type: 'glyph', cost: 6, speed: 'swift',
    text: 'Deal 4 to an enemy unit or the enemy Spire. Gain 3 Charge.',
    targets: [{ what: 'unitOrSpire', side: 'enemy' }],
    ops: [{ op: 'damage', to: 'target0', n: 4 }, { op: 'charge', n: 3 }],
  },
  {
    id: 'ember-titlebout', name: 'Title Bout', faction: 'ember', type: 'glyph', cost: 3, speed: 'ritual',
    text: 'Give an ally with Vanguard +1|+1. You may attack again this round.',
    targets: [{ what: 'unit', side: 'ally', filter: { kw: 'vanguard' } }],
    ops: [{ op: 'buff', to: 'target0', power: 1, health: 1 }, { op: 'rally' }],
  },
  {
    id: 'ember-moltentorrent', name: 'Molten Torrent', faction: 'ember', type: 'glyph', cost: 5, speed: 'ritual',
    text: 'Deal 2 to every enemy unit, then 3 more to an enemy unit.',
    targets: [{ what: 'unit', side: 'enemy' }],
    ops: [{ op: 'damage', to: 'enemies', n: 2 }, { op: 'damage', to: 'target0', n: 3 }],
  },

  // ---------- set x1: The Mirror Quarter ----------
  // Glass-blowers' sparks: Glimmer burn glyphs, Reprise burn glyphs, Unstable constructs that leave a Glimmer
  // copy behind. Hero: the glass-gaffer, who levels on Glimmer cards played (glimmerPlayed).
  {
    id: 'ember-oriel', name: 'Oriel Sandmere, Glassfire Gaffer', faction: 'ember', type: 'hero', cost: 3, power: 2, health: 3,
    tribe: 'artificer', set: 'x1',
    text: 'Dawn: create a Glimmer Cullet Spark in your hand.',
    abilities: [{ on: 'dawn', ops: [{ op: 'create', card: 'ember-culletspark', glimmer: true }] }],
    level: { who: 'you', stat: 'glimmerPlayed', n: 8, text: "You've played 8+ Glimmer cards" },
    ascended: {
      name: 'Oriel, Glassfire Unbound', power: 4, health: 5,
      text: 'Dawn: create 2 Glimmer Cullet Sparks in your hand. Ascend: copy each other ally (Glimmer) and gain 2 Charge.',
      abilities: [
        { on: 'dawn', ops: [{ op: 'create', card: 'ember-culletspark', n: 2, glimmer: true }] },
        { on: 'ascend', ops: [{ op: 'copy', of: 'otherAllies', glimmer: true }, { op: 'charge', n: 2 }] },
      ],
    },
  },
  // units
  {
    id: 'ember-baublebot', name: 'Bauble Bot', faction: 'ember', type: 'unit', cost: 1, power: 2, health: 1, tribe: 'construct', set: 'x1',
    keywords: ['unstable'], text: 'Unstable. Shatter: create a Glimmer Bauble Bot in your hand.',
    abilities: [{ on: 'shatter', ops: [{ op: 'create', card: 'ember-baublebot', glimmer: true }] }],
  },
  {
    id: 'ember-gafferapprentice', name: "Gaffer's Apprentice", faction: 'ember', type: 'unit', cost: 2, power: 1, health: 2, tribe: 'artificer', set: 'x1',
    text: 'Deploy: create a Glimmer Cullet Spark in your hand.',
    abilities: [{ on: 'deploy', ops: [{ op: 'create', card: 'ember-culletspark', glimmer: true }] }],
  },
  {
    id: 'ember-smokedlookout', name: 'Smoked-Glass Lookout', faction: 'ember', type: 'unit', cost: 2, power: 1, health: 3, tribe: 'artificer', set: 'x1',
    keywords: ['veiled'], text: 'Veiled. Strike: create a Glimmer Pinprick in your hand.',
    abilities: [{ on: 'strike', ops: [{ op: 'create', card: 'ember-pinprick', glimmer: true }] }],
  },
  {
    id: 'ember-reflectorkiln', name: 'Reflector Kiln', faction: 'ember', type: 'unit', cost: 3, power: 1, health: 4, tribe: 'construct', set: 'x1',
    text: 'When the opponent casts a glyph, create a Glimmer Slag Bolt in your hand.',
    abilities: [{ on: 'foeGlyph', ops: [{ op: 'create', card: 'ember-slagbolt', glimmer: true }] }],
  },
  {
    id: 'ember-lampworklancer', name: 'Lampwork Lancer', faction: 'ember', type: 'unit', cost: 3, power: 3, health: 2, tribe: 'construct', set: 'x1',
    keywords: ['vanguard'], text: 'Vanguard. Strike: create a Glimmer Cullet Spark in your hand. Resonant: I have +1|+1.',
    abilities: [{ on: 'strike', ops: [{ op: 'create', card: 'ember-culletspark', glimmer: true }] }],
    auras: [{ to: 'self', power: 1, health: 1, cond: { c: 'resonant' } }],
  },
  {
    id: 'ember-mouldkeeper', name: 'Mould Keeper', faction: 'ember', type: 'unit', cost: 4, power: 3, health: 4, tribe: 'artificer', set: 'x1',
    text: 'When another ally is destroyed, copy it (Glimmer).',
    abilities: [{ on: 'allyDied', ops: [{ op: 'copy', of: 'trigger', glimmer: true }] }],
  },
  {
    id: 'ember-lehrforeman', name: 'Lehr Foreman', faction: 'ember', type: 'unit', cost: 5, power: 3, health: 5, tribe: 'smith', set: 'x1',
    text: "Deploy: create a Glimmer Cullet Spark in your hand. Dusk: if you've played 2+ Glimmer cards this round, deal 2 to every enemy unit.",
    abilities: [
      { on: 'deploy', ops: [{ op: 'create', card: 'ember-culletspark', glimmer: true }] },
      { on: 'dusk', cond: { c: 'seenRound', stat: 'glimmerPlayed', gte: 2 }, ops: [{ op: 'damage', to: 'enemies', n: 2 }] },
    ],
  },
  {
    id: 'ember-glasscolossus', name: 'Stained-Glass Colossus', faction: 'ember', type: 'unit', cost: 8, power: 7, health: 6, tribe: 'construct', set: 'x1',
    keywords: ['unstable'], text: 'Unstable. Deploy: deal 2 to every enemy unit. Shatter: create a Glimmer Stained-Glass Colossus in your hand.',
    abilities: [
      { on: 'deploy', ops: [{ op: 'damage', to: 'enemies', n: 2 }] },
      { on: 'shatter', ops: [{ op: 'create', card: 'ember-glasscolossus', glimmer: true }] },
    ],
  },
  // glyphs
  {
    id: 'ember-culletspark', name: 'Cullet Spark', faction: 'ember', type: 'glyph', cost: 1, speed: 'flash', set: 'x1',
    keywords: ['reprise'], text: 'Reprise. Deal 1 to an enemy unit.',
    targets: [{ what: 'unit', side: 'enemy' }], ops: [{ op: 'damage', to: 'target0', n: 1 }],
  },
  {
    id: 'ember-twingather', name: 'Twin Gather', faction: 'ember', type: 'glyph', cost: 2, speed: 'flash', set: 'x1',
    text: 'An ally gets +2|+0 this round. Copy it (Glimmer).',
    targets: [{ what: 'unit', side: 'ally' }],
    ops: [{ op: 'buff', to: 'target0', power: 2, dur: 'round' }, { op: 'copy', of: 'target0', glimmer: true }],
  },
  {
    id: 'ember-blowpipeflare', name: 'Blowpipe Flare', faction: 'ember', type: 'glyph', cost: 3, speed: 'swift', set: 'x1',
    keywords: ['reprise'], text: 'Reprise. Deal 2 to an enemy unit or the enemy Spire.',
    targets: [{ what: 'unitOrSpire', side: 'enemy' }], ops: [{ op: 'damage', to: 'target0', n: 2 }],
  },
  {
    id: 'ember-paneburst', name: 'Pane Burst', faction: 'ember', type: 'glyph', cost: 3, speed: 'swift', set: 'x1',
    text: 'Deal 3 to an enemy unit. Create a Glimmer Cullet Spark in your hand. Resonant: create 2 instead.',
    targets: [{ what: 'unit', side: 'enemy' }],
    ops: [
      { op: 'damage', to: 'target0', n: 3 },
      { op: 'if', cond: { c: 'resonant' }, then: [{ op: 'create', card: 'ember-culletspark', n: 2, glimmer: true }], else: [{ op: 'create', card: 'ember-culletspark', glimmer: true }] },
    ],
  },
  {
    id: 'ember-shardshower', name: 'Shard Shower', faction: 'ember', type: 'glyph', cost: 3, speed: 'ritual', set: 'x1',
    keywords: ['reprise'], text: 'Reprise. Deal 1 to every enemy unit and 1 to the enemy Spire.',
    ops: [{ op: 'damage', to: 'enemies', n: 1 }, { op: 'damage', to: 'enemySpire', n: 1 }],
  },

  // ---------- set x2: The Starward Rise ----------
  // Meteor forging: smiths who Chart for their next burn glyph, star-iron constructs that Unfold after striking,
  // surviving or waiting, and meteor-fall glyphs with Conjunction bonuses. Hero: the prospector, who levels on
  // cards drawn by Chart (charted).
  {
    id: 'ember-imra', name: 'Imra Coldanvil, Star-Iron Prospector', faction: 'ember', type: 'hero', cost: 3, power: 2, health: 4,
    tribe: 'smith', set: 'x2',
    text: 'Strike: Chart a glyph (3).',
    abilities: [{ on: 'strike', ops: [{ op: 'chart', n: 3, find: { type: 'glyph' } }] }],
    level: { who: 'you', stat: 'charted', n: 4, text: "You've drawn 4+ cards by Chart" },
    ascended: {
      name: 'Imra, the Meteor-Wright', power: 4, health: 5,
      text: 'Your glyphs cost 1 less. Strike: Chart a glyph (3). Ascend: deal 4 to the strongest enemy unit and 2 to the enemy Spire.',
      costAuras: [{ type: 'glyph', n: -1 }],
      abilities: [
        { on: 'strike', ops: [{ op: 'chart', n: 3, find: { type: 'glyph' } }] },
        { on: 'ascend', ops: [{ op: 'damage', to: 'strongestEnemy', n: 4 }, { op: 'damage', to: 'enemySpire', n: 2 }] },
      ],
    },
  },
  // units
  {
    id: 'ember-cratersifter', name: 'Crater Sifter', faction: 'ember', type: 'unit', cost: 1, power: 1, health: 1, tribe: 'smith', set: 'x2',
    text: 'Deploy: Chart a glyph (2).',
    abilities: [{ on: 'deploy', ops: [{ op: 'chart', n: 2, find: { type: 'glyph' } }] }],
  },
  {
    id: 'ember-starhound', name: 'Star-Iron Hound', faction: 'ember', type: 'unit', cost: 2, power: 1, health: 3, tribe: 'construct', set: 'x2',
    text: 'Unfolds when it survives damage.',
    level: { who: 'self', stat: 'survivals', n: 1, text: 'Survived damage once' },
    ascended: { name: 'Quenched Star-Hound', power: 3, health: 3, keywords: ['vanguard'], text: 'Vanguard.' },
  },
  {
    id: 'ember-nightassayer', name: 'Night-Shift Assayer', faction: 'ember', type: 'unit', cost: 3, power: 2, health: 3, tribe: 'smith', set: 'x2',
    text: 'Dawn: Chart a glyph (2).',
    abilities: [{ on: 'dawn', ops: [{ op: 'chart', n: 2, find: { type: 'glyph' } }] }],
  },
  {
    id: 'ember-meteorram', name: 'Meteor-Iron Ram', faction: 'ember', type: 'unit', cost: 3, power: 3, health: 2, tribe: 'construct', set: 'x2',
    keywords: ['vanguard'], text: 'Vanguard. Unfolds after striking twice.',
    level: { who: 'self', stat: 'strikes', n: 2, text: 'Struck 2 times' },
    ascended: {
      name: 'Tempered Star-Ram', power: 5, health: 4, keywords: ['vanguard'],
      text: 'Vanguard. Unfold: deal 2 to the enemy Spire.',
      abilities: [{ on: 'unfold', ops: [{ op: 'damage', to: 'enemySpire', n: 2 }] }],
    },
  },
  {
    id: 'ember-craterforeman', name: 'Crater Foreman', faction: 'ember', type: 'unit', cost: 4, power: 3, health: 3, tribe: 'smith', set: 'x2',
    text: 'Deploy: deal 2 to an enemy unit. Conjunction: summon a Slagling.',
    abilities: [{
      on: 'deploy', targets: [{ what: 'unit', side: 'enemy' }],
      ops: [{ op: 'damage', to: 'target0', n: 2 }, { op: 'if', cond: { c: 'conjunction' }, then: [{ op: 'summon', card: 'ember-slagling' }] }],
    }],
  },
  {
    id: 'ember-fallenanvil', name: 'Fallen-Star Anvil', faction: 'ember', type: 'unit', cost: 5, power: 3, health: 6, tribe: 'construct', set: 'x2',
    text: 'Unfolds after starting two rounds on the Line.',
    level: { who: 'self', stat: 'dawns', n: 2, text: 'Started 2 rounds on the Line' },
    ascended: {
      name: 'Wakened Star-Anvil', power: 6, health: 6, keywords: ['pierce'],
      text: 'Pierce. Unfold: deal 3 to the strongest enemy unit.',
      abilities: [{ on: 'unfold', ops: [{ op: 'damage', to: 'strongestEnemy', n: 3 }] }],
    },
  },
  {
    id: 'ember-bolidefurnace', name: 'Bolide Furnace', faction: 'ember', type: 'unit', cost: 6, power: 3, health: 6, tribe: 'construct', set: 'x2',
    text: 'When you cast a glyph, deal 1 to every enemy unit. Resonant: also deal 1 to the enemy Spire.',
    abilities: [{
      on: 'glyphCast',
      ops: [{ op: 'damage', to: 'enemies', n: 1 }, { op: 'if', cond: { c: 'resonant' }, then: [{ op: 'damage', to: 'enemySpire', n: 1 }] }],
    }],
  },
  // glyphs
  {
    id: 'ember-quenchhiss', name: 'Quench Hiss', faction: 'ember', type: 'glyph', cost: 1, speed: 'flash', set: 'x2',
    text: 'Give an ally +1|+2 this round, then deal 1 to it.',
    targets: [{ what: 'unit', side: 'ally' }],
    ops: [{ op: 'buff', to: 'target0', power: 1, health: 2, dur: 'round' }, { op: 'damage', to: 'target0', n: 1 }],
  },
  {
    id: 'ember-bolideshard', name: 'Bolide Shard', faction: 'ember', type: 'glyph', cost: 3, speed: 'swift', set: 'x2',
    text: 'Deal 2 to an enemy unit. Chart a glyph (3).',
    targets: [{ what: 'unit', side: 'enemy' }],
    ops: [{ op: 'damage', to: 'target0', n: 2 }, { op: 'chart', n: 3, find: { type: 'glyph' } }],
  },
  {
    id: 'ember-tektitevolley', name: 'Tektite Volley', faction: 'ember', type: 'glyph', cost: 2, speed: 'swift', set: 'x2',
    text: "Deal 1 to an enemy unit or the enemy Spire for each glyph you've cast this round, this one included (at most 4).",
    targets: [{ what: 'unitOrSpire', side: 'enemy' }],
    ops: [{ op: 'damage', to: 'target0', n: { count: 'glyphsThisRound', mul: 1, max: 4 } }],
  },
  {
    id: 'ember-fallingiron', name: 'Night of Falling Iron', faction: 'ember', type: 'glyph', cost: 4, speed: 'ritual', set: 'x2',
    text: 'Deal 1 to every enemy unit, then 3 to the strongest enemy unit. Conjunction: deal 3 to the enemy Spire.',
    ops: [
      { op: 'damage', to: 'enemies', n: 1 },
      { op: 'damage', to: 'strongestEnemy', n: 3 },
      { op: 'if', cond: { c: 'conjunction' }, then: [{ op: 'damage', to: 'enemySpire', n: 3 }] },
    ],
  },
];

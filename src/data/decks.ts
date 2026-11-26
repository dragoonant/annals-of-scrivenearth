// Deck helpers and the premade decks.
import './cards/index';
import type { CardDef, DeckList, FactionId } from '../engine/types';
import { LIMITS } from '../engine/types';
import { allCards } from '../engine/query';
import { checkDeck } from '../engine/validate';

export const FACTION_INFO: Record<FactionId, { name: string; blurb: string; hue: number }> = {
  prism: { name: 'Prismguard', blurb: 'Wardens of the upper tiers. Plated walls, Ward, and allies that grow together.', hue: 48 },
  ember: { name: 'Emberworks', blurb: 'The foundry district. Direct damage and swarms of short-lived constructs.', hue: 14 },
  tide: { name: 'Tidewardens', blurb: 'The canal mages. Card draw, Stasis and a glyph for every moment.', hue: 205 },
  coil: { name: 'Verdant Coil', blurb: 'The rooftop biodomes. Extra Charge and enormous beasts with Pierce.', hue: 135 },
  under: { name: 'Undervolt', blurb: 'The undercity syndicate. Drain, Dread and profit from every unit lost.', hue: 285 },
  storm: { name: 'Stormrail', blurb: 'The sky couriers. Aerial strikes, Vanguard and second attacks.', hue: 180 },
};

export function collectible(): CardDef[] {
  return allCards().filter((c) => !c.token && !c.unimplemented && !c.id.startsWith('zz-'));
}

/**
 * Build a legal 40-card deck from two factions by curve: 3 copies of each of up to two heroes, then units and
 * glyphs cheapest first, alternating factions. Deterministic. Used for "Surprise me" and until decks are hand-tuned.
 */
export function autoDeck(a: FactionId, b: FactionId): string[] {
  const pool = collectible().filter((c) => c.faction === a || c.faction === b);
  const heroes = pool.filter((c) => c.type === 'hero').sort((x, y) => x.cost - y.cost || x.id.localeCompare(y.id));
  const pickHeroes = [heroes.find((h) => h.faction === a), heroes.find((h) => h.faction === b && b !== a) ?? heroes.find((h) => h.faction === a && h !== heroes.find((x) => x.faction === a))]
    .filter((h): h is CardDef => !!h);
  const deck: string[] = [];
  for (const h of pickHeroes) for (let i = 0; i < LIMITS.copies; i++) deck.push(h.id);
  const rest = pool.filter((c) => c.type !== 'hero').sort((x, y) => x.cost - y.cost || x.id.localeCompare(y.id));
  const byFaction = [rest.filter((c) => c.faction === a), rest.filter((c) => c.faction === b && b !== a)];
  let copies = LIMITS.copies;
  while (deck.length < LIMITS.deck && copies > 0) {
    let i = 0;
    let added = false;
    while (deck.length < LIMITS.deck && (i < byFaction[0].length || i < byFaction[1].length)) {
      for (const list of byFaction) {
        const c = list[i];
        if (!c || deck.length >= LIMITS.deck) continue;
        const have = deck.filter((id) => id === c.id).length;
        const want = c.cost >= 6 ? 1 : c.cost >= 4 ? 2 : 3;
        if (have < Math.min(want, LIMITS.copies) && have < LIMITS.copies - copies + 1) { deck.push(c.id); added = true; }
      }
      i += 1;
    }
    copies -= 1;
    if (!added) break;
  }
  return deck;
}

const PAIRS: [FactionId, FactionId, string][] = [
  ['prism', 'coil', 'Wall of Thorns'],
  ['ember', 'storm', 'Foundry Squall'],
  ['tide', 'under', 'Cold Current'],
  ['storm', 'prism', 'Skywatch'],
  ['coil', 'ember', 'Wildfire Garden'],
];

type HandDeck = { name: string; about: string; cards: Record<string, number> };

/**
 * Blackwater keeps its slot (sixth) but is built by hand: as autoDeck('under', 'tide') it was card for card the same
 * deck as Cold Current, because autoDeck does not depend on the order of its two factions.
 */
export const BLACKWATER: HandDeck = {
  name: 'Blackwater', about: "Freeze the enemy's blockers and leech their units dry; Vex ascends as your Spire heals.",
  cards: {
    'under-vex': 3, 'tide-ilvane': 3,
    'under-leechtick': 3, 'under-siphontap': 3, 'under-leechwiresurgeon': 3, 'under-acidlamplighter': 2, 'under-snuffedfuse': 2, 'under-vaultpawnbroker': 2, 'under-bleeddry': 1, 'under-leechoverseer': 1,
    'tide-mirroreel': 3, 'tide-wardtender': 2, 'tide-heldbreath': 3, 'tide-quickcurrent': 2, 'tide-lockkeeper': 2, 'tide-glassarchivist': 2, 'tide-stillwaterbailiff': 2, 'tide-frostmeremagistrate': 1,
  },
};

/**
 * The twelve newer premade decks, built by hand around one plan each (card id: copies). With the first six they
 * cover all 15 faction pairs plus two single-faction decks, and every hero leads at least two premades.
 * Win rates: BALANCE.md B-4.
 */
export const HAND_BUILT: HandDeck[] = [
  {
    name: 'Kiln Bastion', about: 'Plated walls soak the hits that grow Oren while the foundry fills the Line with constructs.',
    cards: {
      'prism-oren': 3, 'ember-crucible': 2,
      'prism-glasswarden': 3, 'prism-tierguard': 2, 'prism-pane-mender': 2, 'prism-crystal-bulwark': 3, 'prism-aegis-colossus': 2, 'prism-vault-captain': 2, 'prism-lightwall-matron': 1,
      'ember-cinderscamp': 3, 'ember-slagsmith': 3, 'ember-sparkforge': 2, 'ember-furnacebrute': 3, 'ember-furnacetender': 2, 'ember-arcwelder': 2, 'ember-slagbolt': 2, 'ember-cinderhail': 2, 'ember-crucibleherald': 1,
    },
  },
  {
    name: 'Stillglass', about: 'Freeze the biggest threats in Stasis while Ysolde keeps a wall of Wardens repaired.',
    cards: {
      'prism-ysolde': 3, 'tide-ilvane': 3,
      'prism-glasswarden': 3, 'prism-lampkeeper': 2, 'prism-tierguard': 3, 'prism-bracewright': 2, 'prism-crystal-bulwark': 2, 'prism-sentinel-lens': 2, 'prism-chorus-warden': 2, 'prism-spire-keeper': 1, 'prism-tier-sovereign': 1,
      'tide-mirroreel': 3, 'tide-heldbreath': 3, 'tide-lockkeeper': 2, 'tide-glassarchivist': 1, 'tide-stillwaterbailiff': 2, 'tide-pearlsentinel': 2, 'tide-sluiceclose': 1, 'tide-frostmeremagistrate': 1, 'tide-floodtide': 1,
    },
  },
  {
    name: 'Tithe Wall', about: 'Drain the enemy a little every turn behind Plated walls; every repair to your Spire brings Vex closer.',
    cards: {
      'prism-oren': 3, 'under-vex': 3,
      'prism-glasswarden': 3, 'prism-lampkeeper': 2, 'prism-tierguard': 2, 'prism-pane-mender': 2, 'prism-crystal-bulwark': 3, 'prism-sentinel-lens': 2, 'prism-chorus-warden': 2, 'prism-aegis-colossus': 2, 'prism-spire-keeper': 2, 'prism-spire-mantle': 1,
      'under-leechtick': 3, 'under-siphontap': 3, 'under-leechwiresurgeon': 3, 'under-bleeddry': 1, 'under-vaultpawnbroker': 2, 'under-leechoverseer': 1,
    },
  },
  {
    name: 'Scaldwater', about: 'A glyph every turn: cheap burn and card draw, made cheaper by an ascended Maren and sharper by Kessa.',
    cards: {
      'ember-kessa': 3, 'tide-maren': 3,
      'ember-sparkforge': 3, 'ember-arcwelder': 2, 'ember-pinprick': 3, 'ember-slagbolt': 3, 'ember-ventburst': 2, 'ember-heatlance': 3, 'ember-cinderhail': 2,
      'tide-sluicepage': 2, 'tide-ripplescribe': 3, 'tide-driftseer': 2, 'tide-quickcurrent': 3, 'tide-heldbreath': 2, 'tide-hushwateradept': 2, 'tide-glassarchivist': 1, 'tide-deepwateroracle': 1,
    },
  },
  {
    name: 'Slag Market', about: 'Spend your own units: tokens and fuses that pay out on the way to the Scrap, and Sable grows on every loss.',
    cards: {
      'under-sable': 3, 'ember-crucible': 3,
      'under-fuserunner': 3, 'under-burnoutrunner': 2, 'under-ratwrangler': 3, 'under-pitaccountant': 3, 'under-furnacehand': 2, 'under-wiremarket': 2, 'under-leechharvest': 1, 'under-syndicatebroker': 1, 'under-pullplug': 1,
      'ember-cinderscamp': 3, 'ember-kilnhand': 2, 'ember-fuseguard': 3, 'ember-scrapburst': 2, 'ember-furnacetender': 2, 'ember-sparkcascade': 2, 'ember-blastminer': 1, 'ember-crucibleherald': 1,
    },
  },
  {
    name: 'Deep Roots', about: 'Ramp your Charge early, hold the enemy in Stasis, then land beasts too big to answer.',
    cards: {
      'tide-ilvane': 3, 'coil-aruvi': 3,
      'coil-sprout-tender': 3, 'coil-rootling': 2, 'coil-sap-engine': 3, 'coil-hothouse-bloom': 2, 'coil-spearhorn': 2, 'coil-crownmaw': 2, 'coil-tuskhide': 3, 'coil-canopy-titan': 2, 'coil-behemoth': 1, 'coil-domewyrm': 1,
      'tide-mirroreel': 2, 'tide-heldbreath': 3, 'tide-lockkeeper': 2, 'tide-glassarchivist': 1, 'tide-stillwaterbailiff': 2, 'tide-sluiceclose': 2, 'tide-frostmeremagistrate': 1,
    },
  },
  {
    name: 'Crosscurrent', about: 'Fly over the Line and bounce blockers away; Jax ascends on Spire hits and attacks twice.',
    cards: {
      'storm-jax': 3, 'tide-maren': 3,
      'storm-signalkite': 2, 'storm-tickettaker': 3, 'storm-railglider': 3, 'storm-dispatcher': 2, 'storm-updraft': 2, 'storm-galecourier': 3, 'storm-sparkrider': 2, 'storm-reroute': 1, 'storm-thunderkite': 2,
      'tide-sluicepage': 3, 'tide-ripplescribe': 2, 'tide-heldbreath': 3, 'tide-quickcurrent': 2, 'tide-backwash': 2, 'tide-lockkeeper': 2,
    },
  },
  {
    name: 'Rot Canopy', about: 'Big beasts that heal as they hit and leeches that drain; an ascended Brakk attacks twice.',
    cards: {
      'coil-brakk': 3, 'under-vex': 3,
      'coil-thornback-cub': 3, 'coil-sprout-tender': 2, 'coil-sap-engine': 3, 'coil-spearhorn': 2, 'coil-vinewhip': 3, 'coil-crownmaw': 2, 'coil-tuskhide': 3, 'coil-canopy-titan': 2, 'coil-domewyrm': 1,
      'under-leechtick': 3, 'under-burnoutrunner': 2, 'under-siphontap': 2, 'under-leechwiresurgeon': 2, 'under-backalleyenforcer': 2, 'under-snuffedfuse': 1, 'under-leechoverseer': 1,
    },
  },
  {
    name: 'Thunderhide', about: 'Heavy beasts given wings: Pierce from the air, and extra attacks from Brakk and Reroute.',
    cards: {
      'coil-brakk': 2, 'storm-corvane': 3,
      'coil-rootling': 2, 'coil-sap-engine': 3, 'coil-spearhorn': 3, 'coil-crownmaw': 2, 'coil-bristle': 2, 'coil-tuskhide': 2, 'coil-canopy-titan': 1,
      'storm-signalkite': 2, 'storm-tailwind': 1, 'storm-updraft': 2, 'storm-railglider': 3, 'storm-gustcaller': 2, 'storm-galecourier': 2, 'storm-sparkrider': 2, 'storm-thunderkite': 2, 'storm-stormcaller': 2, 'storm-reroute': 1, 'storm-cyclonebarge': 1,
    },
  },
  {
    name: 'Blackout Post', about: 'Go wide and fast with Dread runners and rats, then swing everything at once for Corvane.',
    cards: {
      'under-sable': 3, 'storm-corvane': 2,
      'under-burnoutrunner': 3, 'under-fuserunner': 2, 'under-ratwrangler': 3, 'under-acidlamplighter': 2, 'under-backalleyenforcer': 3, 'under-wiremarket': 2, 'under-snuffedfuse': 2, 'under-syndicatebroker': 1,
      'storm-tickettaker': 2, 'storm-flagbearer': 3, 'storm-railglider': 3, 'storm-sparkrider': 2, 'storm-squadcaller': 2, 'storm-galesurge': 2, 'storm-stormcaller': 2, 'storm-skyraid': 1,
    },
  },
  {
    name: 'Foundry Floor', about: 'Emberworks alone: burn every blocker, push damage at the Spire, finish with Firestorm.',
    cards: {
      'ember-kessa': 3, 'ember-crucible': 3,
      'ember-cinderscamp': 3, 'ember-ashrunner': 3, 'ember-kilnhand': 2, 'ember-slagsmith': 3, 'ember-sparkforge': 2, 'ember-slagbolt': 3, 'ember-furnacebrute': 3, 'ember-arcwelder': 2,
      'ember-furnacetender': 2, 'ember-heatlance': 2, 'ember-sparkcascade': 1, 'ember-pyrelancer': 2, 'ember-cinderhail': 2, 'ember-moltenwarden': 2, 'ember-firestorm': 1, 'ember-foundrytitan': 1,
    },
  },
  {
    name: 'Floodgate', about: 'Tidewardens alone: draw deep, freeze or bounce whatever attacks, and win the long game.',
    cards: {
      'tide-maren': 3, 'tide-ilvane': 3,
      'tide-sluicepage': 3, 'tide-mirroreel': 3, 'tide-wardtender': 2, 'tide-heldbreath': 3, 'tide-quickcurrent': 1, 'tide-lockkeeper': 3, 'tide-hushwateradept': 2, 'tide-glassarchivist': 3,
      'tide-backwash': 1, 'tide-stillwaterbailiff': 3, 'tide-pearlsentinel': 3, 'tide-sluiceclose': 1, 'tide-deepwateroracle': 2, 'tide-frostmeremagistrate': 2, 'tide-floodtide': 1, 'tide-gateleviathan': 1,
    },
  },
];

/** A premade deck; `about` is the one-line plan shown on the New game screen (hand-built decks only). */
export interface PremadeDeck extends DeckList { about?: string }

const expand = (cards: Record<string, number>): string[] => Object.entries(cards).flatMap(([id, n]) => Array<string>(n).fill(id));

/**
 * Premade decks: the original six first, in their old order (so `?decks=` indices stay the same), then the twelve
 * hand-built ones. Only decks that pass checkDeck are offered (a deck is never silently patched);
 * tests/decks.test.ts fails if any is dropped.
 */
export function premadeDecks(): PremadeDeck[] {
  const curve: PremadeDeck[] = PAIRS.map(([a, b, name]) => ({ name, cards: autoDeck(a, b) }));
  const hand = [BLACKWATER, ...HAND_BUILT].map((d) => ({ name: d.name, about: d.about, cards: expand(d.cards) }));
  return [...curve, ...hand].filter((d) => checkDeck(d.cards).ok);
}

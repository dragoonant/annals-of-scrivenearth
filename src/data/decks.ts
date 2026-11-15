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
  ['under', 'tide', 'Blackwater'],
];

/** Premade decks. Only decks that pass checkDeck are offered (a deck is never silently patched). */
export function premadeDecks(): DeckList[] {
  return PAIRS.map(([a, b, name]) => ({ name, cards: autoDeck(a, b) })).filter((d) => checkDeck(d.cards).ok);
}

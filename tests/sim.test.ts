// Headless full games: invariants after every action, replay from the seed, and the AI's behaviour floor.
import { describe, expect, it } from 'vitest';
import '../src/data/cards/index';
import type { FactionId, Seat } from '../src/engine/types';
import { playGame, type Policy } from '../src/ai/arena';
import { chooseAction, randomAction } from '../src/ai/ai';
import { autoDeck, collectible, premadeDecks } from '../src/data/decks';
import { checkDeck, FACTIONS } from '../src/engine/validate';

const ai: Policy = (v, seat, rnd) => chooseAction(v, seat, 'normal', rnd);
const rand: Policy = (v, _s, rnd) => randomAction(v, rnd);
// Factions that have cards yet (an expansion's faction is empty until its set is written).
const LIVE = FACTIONS.filter((f) => collectible().some((c) => c.faction === f));
const pairs: [FactionId, FactionId][] = [];
for (let i = 0; i < LIVE.length; i++) for (let j = i + 1; j < LIVE.length; j++) pairs.push([LIVE[i], LIVE[j]]);

describe('card pool and decks', () => {
  it('First Light, the base set (docs/SETS.md): 300 collectible cards, 50 per faction with 4 heroes, 28 units, 18 glyphs', () => {
    const pool = collectible().filter((c) => (c.set ?? 'base') === 'base');
    expect(pool.length).toBe(300);
    for (const f of FACTIONS.slice(0, 6)) {
      const mine = pool.filter((c) => c.faction === f);
      expect(mine.length, f).toBe(50);
      expect(mine.filter((c) => c.type === 'hero').length, f).toBe(4);
      expect(mine.filter((c) => c.type === 'unit').length, f).toBe(28);
      expect(mine.filter((c) => c.type === 'glyph').length, f).toBe(18);
    }
  });
  it('The Mirror Quarter (set x1): 124 cards, Mirrorwatch 40 with 4 heroes, each older faction 14 with 1 hero', () => {
    const x1 = collectible().filter((c) => c.set === 'x1');
    expect(x1.length).toBe(124);
    for (const f of FACTIONS.slice(0, 7)) {
      const mine = x1.filter((c) => c.faction === f);
      expect(mine.length, f).toBe(f === 'mirror' ? 40 : 14);
      expect(mine.filter((c) => c.type === 'hero').length, f).toBe(f === 'mirror' ? 4 : 1);
    }
    expect(collectible().filter((c) => c.faction === 'mirror' && c.set !== 'x1')).toEqual([]);
  });
  it('R-G1 every faction pair builds a legal deck, and all 29 premade decks are legal', () => {
    for (const [a, b] of pairs) expect(checkDeck(autoDeck(a, b)).errors, `${a}+${b}`).toEqual([]);
    expect(premadeDecks().length).toBe(29);
  });
});

describe('sim', () => {
  it('random vs random: 30 games hold every invariant, end, and replay from the seed', () => {
    for (let g = 0; g < 30; g++) {
      const [a, b] = pairs[g % pairs.length];
      const [c, d] = pairs[(g + 7) % pairs.length];
      const r = playGame({ seed: 100 + g, decks: [autoDeck(a, b), autoDeck(c, d)] }, [rand, rand], { checkReplay: true });
      expect(r.problems, `game ${g}`).toEqual([]);
      expect(r.winner, `game ${g}`).not.toBeNull();
    }
  });
  it('AI vs AI: 12 games hold every invariant and replay; the AI rarely idles with options', () => {
    let idle = 0, rounds = 0, asc = 0;
    for (let g = 0; g < 12; g++) {
      const [a, b] = pairs[g % pairs.length];
      const [c, d] = pairs[(g + 4) % pairs.length];
      const r = playGame({ seed: 300 + g, decks: [autoDeck(a, b), autoDeck(c, d)] }, [ai, ai], { checkReplay: true });
      expect(r.problems, `game ${g}`).toEqual([]);
      idle += r.idleRounds[0] + r.idleRounds[1];
      rounds += r.roundsPlayed[0] + r.roundsPlayed[1];
      asc += r.ascensions[0] + r.ascensions[1];
    }
    expect(idle / rounds).toBeLessThan(0.12);
    expect(asc).toBeGreaterThan(6); // heroes do ascend in ordinary play (PLAN D7)
  });
  it('the AI beats the random control in at least 17 of 20 games, both seats', () => {
    let wins = 0;
    for (let g = 0; g < 20; g++) {
      const aiSeat: Seat = g % 2 === 0 ? 0 : 1;
      const [a, b] = pairs[g % pairs.length];
      const deck = autoDeck(a, b);
      const r = playGame({ seed: 500 + Math.floor(g / 2), decks: [deck, deck] }, aiSeat === 0 ? [ai, rand] : [rand, ai]);
      expect(r.problems, `game ${g}`).toEqual([]);
      if (r.winner === aiSeat) wins += 1;
    }
    expect(wins).toBeGreaterThanOrEqual(17);
  });
});

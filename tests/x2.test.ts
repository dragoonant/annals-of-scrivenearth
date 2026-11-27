// Rules that arrive with The Starward Rise (set x2): R-E4 Chart, R-E5 Unfold, R-E6 Conjunction.
import { describe, expect, it } from 'vitest';
import type { CardDef } from '../src/engine/types';
import { hasCard, registerCards } from '../src/engine/query';
import { validateCards } from '../src/engine/validate';
import { attack, board, kinds, pass, play, resolveCombat, st, unit } from './helpers';

const X2_TEST: CardDef[] = [
  { id: 'zz-chartunit', name: 'Star Chart', faction: 'prism', type: 'glyph', cost: 1, speed: 'swift', token: true, text: 'Chart a unit (3).', ops: [{ op: 'chart', n: 3, find: { type: 'unit' } }] },
  { id: 'zz-gly', name: 'Plain Glyph', faction: 'prism', type: 'glyph', cost: 1, speed: 'flash', token: true, text: 'Draw 1.', ops: [{ op: 'draw', n: 1 }] },
  { id: 'zz-big', name: 'Big', faction: 'prism', type: 'unit', cost: 6, power: 6, health: 6, token: true, text: '' },
  {
    id: 'zz-bud', name: 'Bud', faction: 'prism', type: 'unit', cost: 2, power: 1, health: 2, token: true,
    text: 'Unfolds after 2 rounds on the Line.',
    level: { who: 'self', stat: 'dawns', n: 2, text: 'Started 2 rounds on the Line' },
    ascended: { name: 'Bloom', power: 4, health: 4, text: 'Unfold: draw 1.', abilities: [{ on: 'unfold', ops: [{ op: 'draw', n: 1 }] }] },
  },
  {
    id: 'zz-brawler', name: 'Brawler', faction: 'prism', type: 'unit', cost: 2, power: 2, health: 4, token: true,
    text: 'Unfolds after striking twice.',
    level: { who: 'self', stat: 'strikes', n: 2, text: 'Struck 2 times' },
    ascended: { name: 'Champion', power: 5, health: 5, keywords: ['vanguard'], text: 'Vanguard.' },
  },
  { id: 'zz-conj', name: 'Conjunct', faction: 'prism', type: 'unit', cost: 1, power: 1, health: 1, token: true, text: 'Deploy: if Conjunction, draw 1.', abilities: [{ on: 'deploy', ops: [{ op: 'if', cond: { c: 'conjunction' }, then: [{ op: 'draw', n: 1 }] }] }] },
];
if (!hasCard('zz-chartunit')) registerCards(X2_TEST);

// The opening hand is drawn from the top before board() replaces it, so five fillers sit on top of each test deck.
const OPEN = ['zz-filler', 'zz-filler', 'zz-filler', 'zz-filler', 'zz-filler']; // four for the opening hand, one for round 1
const FOE = Array<string>(20).fill('zz-filler');

describe('R-E4 Chart', () => {
  it('draws the first matching card from the top; the others stay in order', () => {
    // top of the deck is the END of the list
    const s = board({ hand: [['zz-chartunit'], []], deck: [['zz-filler', 'zz-big', 'zz-gly', 'zz-gly', ...OPEN], FOE] });
    play(s, 'zz-chartunit');
    pass(s);
    expect(s.players[0].hand.map((h) => h.card)).toEqual(['zz-big']);
    expect(s.players[0].deck).toEqual(['zz-filler', 'zz-gly', 'zz-gly']);
    expect(s.players[0].seen.charted).toBe(1);
  });
  it('finds nothing beyond the cards it looks at, and that is logged', () => {
    const s = board({ hand: [['zz-chartunit'], []], deck: [['zz-big', 'zz-gly', 'zz-gly', 'zz-gly', ...OPEN], FOE] });
    play(s, 'zz-chartunit');
    pass(s);
    expect(s.players[0].hand).toHaveLength(0);
    expect(s.players[0].deck).toHaveLength(4);
    expect(s.log.find((e) => e.k === 'chart')).toMatchObject({ n: 3, m: 0 });
  });
});

describe('R-E5 Unfold', () => {
  it('a unit Unfolds by its own counter: repaired, second face, Unfold ability; only that unit', () => {
    const s = board({ line: [['zz-bud', 'zz-bud'], []] });
    const a = unit(s, 0, 'zz-bud', 0);
    const b = unit(s, 0, 'zz-bud', 1);
    b.seen.dawns = -5; // this one is behind
    a.dmg = 1;
    pass(s); pass(s); // round 2 starts: one dawn
    expect(a.unfolded).toBeFalsy();
    pass(s); pass(s); // round 3: two dawns
    expect(a.unfolded).toBe(true);
    expect(st(s, a)).toMatchObject({ power: 4, health: 4, hp: 4 });
    expect(b.unfolded).toBeFalsy();
    expect(kinds(s)).toContain('unfold');
    expect(s.players[0].hand.length).toBeGreaterThanOrEqual(3); // two round draws plus the Unfold draw
  });
  it('counts its own strikes; a second face can carry keywords', () => {
    const s = board({ line: [['zz-brawler'], ['zz-wall']] });
    const br = unit(s, 0, 'zz-brawler');
    br.seen.strikes = 1;
    attack(s, [br], [[unit(s, 1, 'zz-wall'), br]]);
    resolveCombat(s);
    expect(br.unfolded).toBe(true);
    expect(st(s, br).keywords).toContain('vanguard');
  });
  it('validation: a unit Unfold reads its own counters and uses unfold, not ascend', () => {
    const bad: CardDef[] = [
      { id: 'prism-badunf', name: 'B', faction: 'prism', type: 'unit', cost: 1, power: 1, health: 1, text: 'x', level: { who: 'you', stat: 'glyphsCast', n: 2, text: 'x' }, ascended: { power: 2, health: 2, text: 'y' } },
      { id: 'prism-badunf2', name: 'C', faction: 'prism', type: 'unit', cost: 1, power: 1, health: 1, text: 'x', level: { who: 'self', stat: 'strikes', n: 2, text: 'x' }, ascended: { power: 2, health: 2, text: 'Ascend: draw 1.', abilities: [{ on: 'ascend', ops: [{ op: 'draw', n: 1 }] }] } },
    ];
    const errs = validateCards(bad);
    expect(errs.some((e) => e.startsWith('prism-badunf:'))).toBe(true);
    expect(errs.some((e) => e.startsWith('prism-badunf2:'))).toBe(true);
  });
});

describe('R-E6 Conjunction', () => {
  it('holds only after you have played a unit and cast a glyph this round', () => {
    const s = board({ hand: [['zz-conj', 'zz-gly', 'zz-conj'], []] });
    play(s, 'zz-conj'); // a unit, but no glyph yet: no draw (the unit itself counts as played)
    expect(s.players[0].hand).toHaveLength(2);
    pass(s);
    play(s, 'zz-gly'); // Flash: draws 1
    expect(s.players[0].hand).toHaveLength(2);
    play(s, 'zz-conj'); // unit played and glyph cast this round: draws 1
    expect(s.players[0].hand).toHaveLength(2);
    expect(s.players[0].seenRound.unitsPlayed).toBe(2);
  });
});

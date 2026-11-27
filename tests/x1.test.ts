// Rules that arrive with The Mirror Quarter (set x1): R-K13 Veiled, R-K14 Reprise, R-E1 Glimmer, R-E2 Copy, R-E3 foe glyph.
import { describe, expect, it } from 'vitest';
import type { CardDef } from '../src/engine/types';
import { hasCard, registerCards } from '../src/engine/query';
import { validateCards } from '../src/engine/validate';
import { view } from '../src/engine/view';
import { act, attack, board, kinds, legalActions, pass, play, resolveCombat, st, unit } from './helpers';

const X1_TEST: CardDef[] = [
  { id: 'zz-echo', name: 'Echo Bolt', faction: 'prism', type: 'glyph', cost: 1, speed: 'swift', token: true, keywords: ['reprise'], text: 'Reprise. Deal 1 to an enemy unit.', targets: [{ what: 'unit', side: 'enemy' }], ops: [{ op: 'damage', to: 'target0', n: 1 }] },
  { id: 'zz-flashecho', name: 'Flash Echo', faction: 'prism', type: 'glyph', cost: 0, speed: 'flash', token: true, keywords: ['reprise'], text: 'Reprise. Draw 1.', ops: [{ op: 'draw', n: 1 }] },
  { id: 'zz-mimic', name: 'Mimic', faction: 'prism', type: 'unit', cost: 2, power: 1, health: 1, token: true, text: 'Deploy: copy an enemy unit (Glimmer).', abilities: [{ on: 'deploy', targets: [{ what: 'unit', side: 'enemy' }], ops: [{ op: 'copy', of: 'target0', glimmer: true }] }] },
  { id: 'zz-mirrorglyph', name: 'Mirror Glyph', faction: 'prism', type: 'glyph', cost: 1, speed: 'swift', token: true, text: 'Copy an enemy glyph.', targets: [{ what: 'glyph', side: 'enemy' }], ops: [{ op: 'copy', of: 'target0' }] },
  { id: 'zz-mourner', name: 'Mourner', faction: 'prism', type: 'unit', cost: 2, power: 1, health: 3, token: true, text: 'When an enemy unit is destroyed, copy it.', abilities: [{ on: 'enemyDied', ops: [{ op: 'copy', of: 'trigger' }] }] },
  { id: 'zz-watcher', name: 'Watcher', faction: 'prism', type: 'unit', cost: 2, power: 1, health: 3, token: true, text: 'When the opponent casts a glyph, I get +1|+0.', abilities: [{ on: 'foeGlyph', ops: [{ op: 'buff', to: 'self', power: 1 }] }] },
  { id: 'zz-glint', name: 'Glint', faction: 'prism', type: 'glyph', cost: 0, speed: 'flash', token: true, text: 'Create a Glimmer Bolt in your hand.', ops: [{ op: 'create', card: 'zz-bolt', glimmer: true }] },
  { id: 'zz-realrite', name: 'Real Rite', faction: 'prism', type: 'glyph', cost: 3, speed: 'ritual', text: 'Draw 1.', ops: [{ op: 'draw', n: 1 }] },
  { id: 'zz-real', name: 'Real Unit', faction: 'prism', type: 'unit', cost: 2, power: 2, health: 2, text: '' },
];
if (!hasCard('zz-echo')) registerCards(X1_TEST);

describe('R-K13 Veiled', () => {
  it('the enemy cannot choose a Veiled unit as a glyph or Deploy target; its owner can', () => {
    const s = board({ hand: [['zz-zap', 'zz-pump'], []], line: [['zz-grunt'], ['zz-veiled', 'zz-grunt']] });
    const zapTargets = legalActions(s).filter((a) => a.type === 'play' && s.players[0].hand.find((h) => h.iid === a.iid)?.card === 'zz-zap').map((a) => (a as { targets?: string[] }).targets?.[0]);
    expect(zapTargets).not.toContain(unit(s, 1, 'zz-veiled').iid);
    expect(zapTargets).toContain(unit(s, 1, 'zz-grunt').iid);
    expect(() => play(s, 'zz-zap', [unit(s, 1, 'zz-veiled').iid])).toThrow();
    const t = board({ hand: [[], ['zz-pump']], line: [[], ['zz-veiled']], first: 1 });
    play(t, 'zz-pump', [unit(t, 1, 'zz-veiled').iid]);
    expect(st(t, unit(t, 1, 'zz-veiled')).health).toBe(6);
  });
  it('effects that pick by themselves still reach it, and it loses Veiled for good when it strikes', () => {
    const s = board({ line: [['zz-veiled'], ['zz-wall']] });
    const v = unit(s, 0, 'zz-veiled');
    attack(s, [v], [[unit(s, 1, 'zz-wall'), v]]);
    resolveCombat(s);
    expect(kinds(s)).toContain('unveil');
    expect(st(s, v).keywords).not.toContain('veiled');
  });
});

describe('R-K14 Reprise and R-E1 Glimmer', () => {
  it('a Reprise glyph puts a Glimmer copy without Reprise in hand; casting the copy makes no further copy', () => {
    const s = board({ hand: [['zz-echo'], []], line: [[], ['zz-wall']] });
    play(s, 'zz-echo', [unit(s, 1, 'zz-wall').iid]);
    pass(s); // opponent lets it resolve
    const copy = s.players[0].hand.find((h) => h.card === 'zz-echo');
    expect(copy).toMatchObject({ glimmer: true, plain: true });
    pass(s); // the opponent of the stack's starter acts first; seat 0 gets priority back
    play(s, 'zz-echo', [unit(s, 1, 'zz-wall').iid]);
    pass(s);
    expect(s.players[0].hand.some((h) => h.card === 'zz-echo')).toBe(false);
    expect(unit(s, 1, 'zz-wall').dmg).toBe(2);
    expect(s.players[0].seen.glimmerPlayed).toBe(1);
  });
  it('a negated Reprise glyph makes no copy', () => {
    const s = board({ hand: [['zz-echo'], ['zz-deny']], line: [[], ['zz-wall']] });
    play(s, 'zz-echo', [unit(s, 1, 'zz-wall').iid]);
    play(s, 'zz-deny', [s.stack[0].sid]);
    pass(s);
    expect(s.players[0].hand.some((h) => h.card === 'zz-echo')).toBe(false);
  });
  it('a Flash Reprise glyph copies itself at once', () => {
    const s = board({ hand: [['zz-flashecho'], []] });
    play(s, 'zz-flashecho');
    expect(s.players[0].hand.filter((h) => h.card === 'zz-flashecho')).toHaveLength(1);
  });
  it('a Glimmer card still in hand fades at the end of the round; Glimmer shows on a hidden hand card', () => {
    const s = board({ hand: [['zz-glint'], []] });
    play(s, 'zz-glint');
    const g = s.players[0].hand.find((h) => h.card === 'zz-bolt');
    expect(g?.glimmer).toBe(true);
    expect(view(s, 1).players[0].hand.find((h) => h.iid === g!.iid)).toEqual({ iid: g!.iid, card: '?', glimmer: true });
    pass(s); pass(s); // the round ends
    expect(s.players[0].hand.some((h) => h.iid === g!.iid)).toBe(false);
    expect(s.players[0].scrap).toContain('zz-bolt');
    expect(s.log.some((e) => e.k === 'burn' && e.s === 'glimmer')).toBe(true);
  });
});

describe('R-E2 Copy and R-E3 foe glyph', () => {
  it('copies a unit card from the Line as a fresh card; a token cannot be copied', () => {
    const s = board({ hand: [['zz-mimic', 'zz-mimic'], []], line: [[], ['zz-real', 'zz-grunt']] });
    play(s, 'zz-mimic', [unit(s, 1, 'zz-real').iid]);
    expect(s.players[0].hand.find((h) => h.card === 'zz-real')).toMatchObject({ glimmer: true });
    expect(s.players[0].seen.copiesMade).toBe(1);
    pass(s);
    play(s, 'zz-mimic', [unit(s, 1, 'zz-grunt').iid]);
    expect(kinds(s)).toContain('copyToken');
    expect(s.players[0].hand.some((h) => h.card === 'zz-grunt')).toBe(false);
  });
  it('copies a glyph on the stack, and a destroyed enemy by its last known card', () => {
    const s = board({ hand: [['zz-mirrorglyph'], ['zz-realrite']], first: 1 });
    play(s, 'zz-realrite');
    play(s, 'zz-mirrorglyph', [s.stack[0].sid]);
    pass(s); // resolves newest first: the copy is made while Rite is still on the stack
    expect(s.players[0].hand.map((h) => h.card)).toContain('zz-realrite');
    const t = board({ hand: [['zz-bolt'], []], line: [['zz-mourner'], ['zz-real']] });
    play(t, 'zz-bolt', [unit(t, 1, 'zz-real').iid]);
    pass(t);
    expect(t.players[0].hand.map((h) => h.card)).toContain('zz-real');
  });
  it('foeGlyph fires for the opponent of the caster only', () => {
    const s = board({ hand: [['zz-zap'], []], line: [['zz-watcher'], ['zz-watcher']] });
    play(s, 'zz-zap', [unit(s, 1, 'zz-watcher').iid]);
    expect(st(s, unit(s, 1, 'zz-watcher')).power).toBe(2);
    expect(st(s, unit(s, 0, 'zz-watcher')).power).toBe(1);
  });
  it('validation: Reprise only on glyphs, unit keywords never on glyphs', () => {
    const bad: CardDef[] = [
      { id: 'prism-badrep', name: 'B', faction: 'prism', type: 'unit', cost: 1, power: 1, health: 1, keywords: ['reprise'], text: 'Reprise.' },
      { id: 'prism-badveil', name: 'C', faction: 'prism', type: 'glyph', cost: 1, speed: 'swift', keywords: ['veiled'], text: 'Veiled. Draw 1.', ops: [{ op: 'draw', n: 1 }] },
    ];
    const errs = validateCards(bad);
    expect(errs.some((e) => e.includes('prism-badrep'))).toBe(true);
    expect(errs.some((e) => e.includes('prism-badveil'))).toBe(true);
  });
});
void act;

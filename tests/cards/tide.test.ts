import { describe, expect, it } from 'vitest';
import { applyAction, attack, board, pass, play, st, unit } from '../helpers';

const ids = (s: ReturnType<typeof board>, seat: 0 | 1): string[] => s.players[seat].hand.map((h) => h.card);

describe('tide cards', () => {
  it('tide-sluicepage: Deploy draws a card', () => {
    const s = board({ hand: [['tide-sluicepage'], []] });
    const deck = s.players[0].deck.length;
    play(s, 'tide-sluicepage');
    expect(ids(s, 0)).toEqual(['zz-filler']);
    expect(s.players[0].deck.length).toBe(deck - 1);
  });

  it('tide-ripplescribe: casting a glyph gives +1|+0 this round', () => {
    const s = board({ hand: [['zz-pump'], []], line: [['tide-ripplescribe'], []] });
    const r = unit(s, 0, 'tide-ripplescribe');
    expect(st(s, r).power).toBe(1);
    play(s, 'zz-pump', [r.iid]);
    expect(st(s, r).power).toBe(2);
  });

  it('tide-mirroreel: Deploy puts a small enemy in Stasis and cannot target a big one', () => {
    const s = board({ hand: [['tide-mirroreel'], []], line: [[], ['zz-grunt', 'zz-ogre']] });
    const hc = s.players[0].hand[0];
    expect(applyAction(s, { type: 'play', iid: hc.iid, targets: [unit(s, 1, 'zz-ogre').iid] }).ok).toBe(false);
    play(s, 'tide-mirroreel', [unit(s, 1, 'zz-grunt').iid]);
    expect(unit(s, 1, 'zz-grunt').stasis).toBe(true);
    expect(unit(s, 1, 'zz-ogre').stasis).toBe(false);
    expect(s.players[0].seen.stasisApplied).toBe(1);
  });

  it('tide-wardtender: Ward negates the next damage it would take', () => {
    const s = board({ hand: [['tide-wardtender'], ['zz-zap']] });
    play(s, 'tide-wardtender');
    const w = unit(s, 0, 'tide-wardtender');
    expect(w.ward).toBe(true);
    play(s, 'zz-zap', [w.iid]);
    expect(w.dmg).toBe(0);
    expect(w.ward).toBe(false);
    expect(st(s, w)).toMatchObject({ power: 1, health: 3 });
  });

  it('tide-eddycourier: Deploy returns an allied unit to hand', () => {
    const s = board({ hand: [['tide-eddycourier'], []], line: [['tide-pearlsentinel'], []] });
    play(s, 'tide-eddycourier', [unit(s, 0, 'tide-pearlsentinel').iid]);
    expect(s.players[0].line.map((u) => u.card)).toEqual(['tide-eddycourier']);
    expect(ids(s, 0)).toEqual(['tide-pearlsentinel']);
  });

  it('tide-driftseer: Dusk draws only if 2+ glyphs were cast this round', () => {
    const delta = (casts: number): number => {
      const s = board({ hand: [['zz-pump', 'zz-pump', 'zz-pump'], []], line: [['tide-driftseer'], []] });
      const d = unit(s, 0, 'tide-driftseer');
      for (let i = 0; i < casts; i++) play(s, 'zz-pump', [d.iid]);
      const before = s.players[0].hand.length;
      pass(s); pass(s); // round ends: Dusk, then the new round draws 1
      return s.players[0].hand.length - before;
    };
    expect(delta(1)).toBe(1);
    expect(delta(2)).toBe(2);
  });

  it('tide-lockkeeper: Deploy returns a small enemy to hand; Resonant gives +1|+1', () => {
    const s = board({ hand: [['tide-lockkeeper'], []], line: [['tide-maren'], ['tide-sluicepage']] });
    play(s, 'tide-lockkeeper', [unit(s, 1, 'tide-sluicepage').iid]);
    expect(s.players[1].line.length).toBe(0);
    expect(ids(s, 1)).toEqual(['tide-sluicepage']);
    const k = unit(s, 0, 'tide-lockkeeper');
    expect(st(s, k)).toMatchObject({ power: 2, health: 4 });
    s.players[0].ascended = ['tide-maren'];
    expect(st(s, k)).toMatchObject({ power: 3, health: 5 });
  });

  it('tide-hushwateradept: casting a glyph puts the weakest enemy in Stasis', () => {
    const s = board({ hand: [['zz-pump'], []], line: [['tide-hushwateradept'], ['zz-ogre', 'zz-grunt']] });
    play(s, 'zz-pump', [unit(s, 0, 'tide-hushwateradept').iid]);
    expect(unit(s, 1, 'zz-grunt').stasis).toBe(true);
    expect(unit(s, 1, 'zz-ogre').stasis).toBe(false);
    expect(s.players[0].seen.stasisApplied).toBe(1);
  });

  it('tide-glassarchivist: Deploy draws 1; Resonant draws 2', () => {
    const plain = board({ hand: [['tide-glassarchivist'], []] });
    play(plain, 'tide-glassarchivist');
    expect(plain.players[0].hand.length).toBe(1);
    const res = board({ hand: [['tide-glassarchivist'], []], line: [['tide-maren'], []] });
    res.players[0].ascended = ['tide-maren'];
    play(res, 'tide-glassarchivist');
    expect(res.players[0].hand.length).toBe(2);
  });

  it('tide-stillwaterbailiff: Deploy puts an enemy unit in Stasis', () => {
    const s = board({ hand: [['tide-stillwaterbailiff'], []], line: [[], ['zz-ogre']] });
    play(s, 'tide-stillwaterbailiff', [unit(s, 1, 'zz-ogre').iid]);
    expect(unit(s, 1, 'zz-ogre').stasis).toBe(true);
    expect(s.players[0].seen.stasisApplied).toBe(1);
  });

  it('tide-pearlsentinel: enters with Ward; Resonant gives +1|+1', () => {
    const s = board({ hand: [['tide-pearlsentinel'], []], line: [['tide-maren'], []] });
    play(s, 'tide-pearlsentinel');
    const p = unit(s, 0, 'tide-pearlsentinel');
    expect(p.ward).toBe(true);
    expect(st(s, p)).toMatchObject({ power: 2, health: 5 });
    s.players[0].ascended = ['tide-maren'];
    expect(st(s, p)).toMatchObject({ power: 3, health: 6 });
  });

  it('tide-deepwateroracle: Deploy draws 2', () => {
    const s = board({ hand: [['tide-deepwateroracle'], []] });
    play(s, 'tide-deepwateroracle');
    expect(s.players[0].hand.length).toBe(2);
  });

  it('tide-frostmeremagistrate: Deploy puts two enemy units in Stasis', () => {
    const s = board({ hand: [['tide-frostmeremagistrate'], []], line: [[], ['zz-grunt', 'zz-ogre', 'zz-wall']] });
    play(s, 'tide-frostmeremagistrate', [unit(s, 1, 'zz-grunt').iid, unit(s, 1, 'zz-ogre').iid]);
    expect(s.players[1].line.map((u) => u.stasis)).toEqual([true, true, false]);
    expect(s.players[0].seen.stasisApplied).toBe(2);
  });

  it('tide-gateleviathan: Deploy returns all enemy units to their owners\' hands', () => {
    const s = board({ hand: [['tide-gateleviathan'], []], line: [[], ['tide-sluicepage', 'tide-pearlsentinel']] });
    play(s, 'tide-gateleviathan');
    expect(s.players[1].line.length).toBe(0);
    expect(ids(s, 1)).toEqual(['tide-sluicepage', 'tide-pearlsentinel']);
    expect(s.players[0].line.length).toBe(1);
  });

  it('tide-slipunder: Flash returns an allied unit to hand', () => {
    const s = board({ hand: [['tide-slipunder'], []], line: [['tide-pearlsentinel'], []] });
    play(s, 'tide-slipunder', [unit(s, 0, 'tide-pearlsentinel').iid]);
    expect(s.players[0].line.length).toBe(0);
    expect(ids(s, 0)).toEqual(['tide-pearlsentinel']);
    expect(s.players[0].charge).toBe(9);
  });

  it('tide-heldbreath: Flash puts a blocker in Stasis; its attacker stays blocked', () => {
    const s = board({ hand: [[], ['tide-heldbreath']], line: [['zz-grunt'], ['zz-ogre']], first: 1 });
    const g = unit(s, 0, 'zz-grunt');
    const o = unit(s, 1, 'zz-ogre');
    attack(s, [o], [[g, o]]);
    expect(s.phase).toBe('combat');
    play(s, 'tide-heldbreath', [g.iid]);
    expect(g.stasis).toBe(true);
    expect(s.players[1].seen.stasisApplied).toBe(1);
    pass(s); pass(s); // strikes resolve: the ogre is still blocked, so the Spire is untouched
    expect(s.players[0].spire).toBe(20);
    expect(g.dmg).toBe(0);
  });

  it('tide-tidalveil: Flash gives an allied unit Ward', () => {
    const s = board({ hand: [['tide-tidalveil'], []], line: [['zz-grunt'], []] });
    const g = unit(s, 0, 'zz-grunt');
    expect(st(s, g).keywords).not.toContain('ward');
    play(s, 'tide-tidalveil', [g.iid]);
    expect(g.ward).toBe(true);
    expect(st(s, g).keywords).toContain('ward');
  });

  it('tide-quickcurrent: Swift draws a card once it resolves', () => {
    const s = board({ hand: [['tide-quickcurrent'], []] });
    play(s, 'tide-quickcurrent');
    expect(s.players[0].hand.length).toBe(0);
    pass(s);
    expect(ids(s, 0)).toEqual(['zz-filler']);
  });

  it('tide-unwrite: negates an enemy glyph on the stack', () => {
    const s = board({ hand: [['tide-unwrite'], ['zz-bolt']], first: 1 });
    play(s, 'zz-bolt', ['spire0']);
    play(s, 'tide-unwrite', [s.stack[0].sid]);
    pass(s);
    expect(s.players[0].spire).toBe(20);
    expect(s.players[1].scrap).toContain('zz-bolt');
    expect(s.stack.length).toBe(0);
  });

  it('tide-backwash: Swift returns an enemy unit to its owner\'s hand', () => {
    const s = board({ hand: [['tide-backwash'], []], line: [[], ['tide-pearlsentinel']] });
    play(s, 'tide-backwash', [unit(s, 1, 'tide-pearlsentinel').iid]);
    pass(s);
    expect(s.players[1].line.length).toBe(0);
    expect(ids(s, 1)).toEqual(['tide-pearlsentinel']);
  });

  it('tide-sluiceclose: Swift puts two enemy units in Stasis', () => {
    const s = board({ hand: [['tide-sluiceclose'], []], line: [[], ['zz-grunt', 'zz-ogre']] });
    play(s, 'tide-sluiceclose', [unit(s, 1, 'zz-grunt').iid, unit(s, 1, 'zz-ogre').iid]);
    pass(s);
    expect(s.players[1].line.every((u) => u.stasis)).toBe(true);
    expect(s.players[0].seen.stasisApplied).toBe(2);
  });

  it('tide-deepstudy: Ritual draws 3', () => {
    const s = board({ hand: [['tide-deepstudy'], []] });
    play(s, 'tide-deepstudy');
    pass(s);
    expect(s.players[0].hand.length).toBe(3);
  });

  it('tide-floodtide: Ritual puts every enemy unit in Stasis and draws 1', () => {
    const s = board({ hand: [['tide-floodtide'], []], line: [[], ['zz-grunt', 'zz-ogre', 'zz-wall']] });
    play(s, 'tide-floodtide');
    pass(s);
    expect(s.players[1].line.every((u) => u.stasis)).toBe(true);
    expect(s.players[0].hand.length).toBe(1);
    expect(s.players[0].seen.stasisApplied).toBe(3);
  });
});

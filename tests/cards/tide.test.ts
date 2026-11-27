import { describe, expect, it } from 'vitest';
import { applyAction, attack, board, pass, play, resolveCombat, st, unit } from '../helpers';
import { costOf, isAscended } from '../../src/engine/query';

type G = ReturnType<typeof board>;
/** Try to play the first hand card with this id, without requiring success. */
const tryPlay = (s: G, card: string, targets: string[] = []) => {
  const hc = s.players[s.priority].hand.find((h) => h.card === card);
  if (!hc) throw new Error(`${card} not in hand`);
  return applyAction(s, targets.length ? { type: 'play', iid: hc.iid, targets } : { type: 'play', iid: hc.iid });
};
const endRound = (s: G): void => { pass(s); pass(s); };

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

describe('tide cards (strict)', () => {
  it('tide-maren: unascended +1|+0 stacks per cast, only this round, only for her owner', () => {
    const s = board({ hand: [['zz-pump', 'zz-pump'], ['zz-pump']], line: [['tide-maren'], ['zz-grunt']] });
    s.players[0].heroes = ['tide-maren'];
    const m = unit(s, 0, 'tide-maren');
    expect(st(s, m)).toMatchObject({ power: 2, health: 4 });
    play(s, 'zz-pump', [m.iid]);
    expect(st(s, m).power).toBe(3);
    play(s, 'zz-pump', [m.iid]);
    expect(st(s, m)).toMatchObject({ power: 4, health: 10 });
    endRound(s);
    expect(st(s, m)).toMatchObject({ power: 2, health: 4 }); // power buff and the +3 health glyph buffs are gone
    // opponent's glyph does not pump her
    const o = board({ hand: [[], ['zz-pump']], line: [['tide-maren'], ['zz-grunt']], first: 1 });
    play(o, 'zz-pump', [unit(o, 1, 'zz-grunt').iid]);
    expect(st(o, unit(o, 0, 'tide-maren')).power).toBe(2);
  });

  it('tide-maren: ascended she gets +1|+1 (lasting) per cast, glyphs cost 1 less; the 6th cast still gives the unascended +1|+0 round trigger', () => {
    const s = board({ hand: [['zz-pump', 'zz-pump'], []], line: [['tide-maren'], []] });
    s.players[0].heroes = ['tide-maren'];
    s.players[0].ascended = ['tide-maren'];
    const m = unit(s, 0, 'tide-maren');
    expect(st(s, m)).toMatchObject({ power: 3, health: 5 });
    const charge = s.players[0].charge;
    play(s, 'zz-pump', [m.iid]);
    expect(s.players[0].charge).toBe(charge); // a cost-1 glyph is free
    expect(st(s, m)).toMatchObject({ power: 4, health: 5 + 1 + 3 });
    endRound(s);
    expect(st(s, m)).toMatchObject({ power: 4, health: 6 }); // +1|+1 lasts, the +0|+3 does not
    // sixth cast: ascension happens during that cast, the already queued unascended trigger fires
    const t = board({ hand: [['zz-pump'], []], line: [['tide-maren'], []] });
    t.players[0].heroes = ['tide-maren'];
    t.players[0].seen.glyphsCast = 5;
    const tm = unit(t, 0, 'tide-maren');
    play(t, 'zz-pump', [tm.iid]);
    expect(isAscended(t, 0, 'tide-maren')).toBe(true);
    expect(st(t, tm).power).toBe(3 + 1);
    expect(t.players[0].hand.length).toBe(2); // Ascend: draw 2
  });

  it('tide-ripplescribe: +1|+0 per own cast stacks, ends at round end, opponent casts do not count', () => {
    const s = board({ hand: [['zz-pump', 'zz-pump'], ['zz-pump']], line: [['tide-ripplescribe'], ['zz-grunt']] });
    const r = unit(s, 0, 'tide-ripplescribe');
    play(s, 'zz-pump', [r.iid]);
    play(s, 'zz-pump', [r.iid]);
    expect(st(s, r).power).toBe(3);
    pass(s); // seat 1 now acts
    play(s, 'zz-pump', [unit(s, 1, 'zz-grunt').iid]);
    expect(st(s, r).power).toBe(3);
    pass(s);
    expect(s.round).toBe(2);
    expect(st(s, r).power).toBe(1);
  });

  it('tide-mirroreel: a 2-power enemy is accepted, a 3-power one is refused, no legal target still plays', () => {
    const s = board({ hand: [['tide-mirroreel'], []], line: [[], ['tide-stillwaterbailiff']] });
    expect(tryPlay(s, 'tide-mirroreel', [unit(s, 1, 'tide-stillwaterbailiff').iid]).ok).toBe(false);
    expect(unit(s, 1, 'tide-stillwaterbailiff').stasis).toBe(false);
    expect(tryPlay(s, 'tide-mirroreel').ok).toBe(true); // R-G10: a unit may always be played
    expect(unit(s, 1, 'tide-stillwaterbailiff').stasis).toBe(false);
    expect(s.players[0].seen.stasisApplied ?? 0).toBe(0);
  });

  it('tide-eddycourier: returns another allied unit only; alone it just plays; enemies are not legal targets', () => {
    const s = board({ hand: [['tide-eddycourier'], []], line: [['tide-pearlsentinel'], ['zz-grunt']] });
    expect(tryPlay(s, 'tide-eddycourier', [unit(s, 1, 'zz-grunt').iid]).ok).toBe(false);
    play(s, 'tide-eddycourier', [unit(s, 0, 'tide-pearlsentinel').iid]);
    expect(s.players[0].line.map((u) => u.card)).toEqual(['tide-eddycourier']);
    expect(ids(s, 0)).toEqual(['tide-pearlsentinel']);
    expect(s.players[1].line.length).toBe(1);
    const alone = board({ hand: [['tide-eddycourier'], []] });
    play(alone, 'tide-eddycourier');
    expect(alone.players[0].line.map((u) => u.card)).toEqual(['tide-eddycourier']);
    expect(alone.players[0].hand.length).toBe(0);
  });

  it('tide-lockkeeper: a 2-power enemy is returned, a 3-power one is refused', () => {
    const s = board({ hand: [['tide-lockkeeper'], []], line: [[], ['tide-stillwaterbailiff', 'tide-hushwateradept']] });
    expect(tryPlay(s, 'tide-lockkeeper', [unit(s, 1, 'tide-stillwaterbailiff').iid]).ok).toBe(false);
    play(s, 'tide-lockkeeper', [unit(s, 1, 'tide-hushwateradept').iid]);
    expect(s.players[1].line.map((u) => u.card)).toEqual(['tide-stillwaterbailiff']);
    expect(ids(s, 1)).toEqual(['tide-hushwateradept']);
  });

  it('tide-hushwateradept: a second cast with the weakest already frozen does nothing and is not counted; opponent casts do not trigger', () => {
    const s = board({ hand: [['zz-pump', 'zz-pump'], []], line: [['tide-hushwateradept'], ['zz-grunt', 'zz-ogre']] });
    const h = unit(s, 0, 'tide-hushwateradept');
    play(s, 'zz-pump', [h.iid]);
    expect(unit(s, 1, 'zz-grunt').stasis).toBe(true);
    play(s, 'zz-pump', [h.iid]);
    expect(unit(s, 1, 'zz-ogre').stasis).toBe(false);
    expect(s.players[0].seen.stasisApplied).toBe(1);
    const o = board({ hand: [[], ['zz-pump']], line: [['tide-hushwateradept'], ['zz-grunt']], first: 1 });
    play(o, 'zz-pump', [unit(o, 1, 'zz-grunt').iid]);
    expect(unit(o, 1, 'zz-grunt').stasis).toBe(false);
  });

  it('tide-driftseer: opponent glyphs do not count toward the 2 glyphs, and the count is per round', () => {
    const s = board({ hand: [['zz-pump'], ['zz-pump', 'zz-pump']], line: [['tide-driftseer'], ['zz-grunt']] });
    play(s, 'zz-pump', [unit(s, 0, 'tide-driftseer').iid]);
    pass(s);
    play(s, 'zz-pump', [unit(s, 1, 'zz-grunt').iid]);
    const before = s.players[0].hand.length;
    pass(s); // round ends; the new round draws 1; Dusk must not draw (only 1 of my glyphs)
    expect(s.players[0].hand.length - before).toBe(1);
  });

  it('tide-glassarchivist: Deploy draws exactly 1 without Resonant and exactly 2 (not 3) with it', () => {
    const plain = board({ hand: [['tide-glassarchivist'], []], line: [['tide-maren'], []] });
    const d0 = plain.players[0].deck.length;
    play(plain, 'tide-glassarchivist');
    expect(plain.players[0].hand.length).toBe(1);
    expect(plain.players[0].deck.length).toBe(d0 - 1);
    const res = board({ hand: [['tide-glassarchivist'], []], line: [['tide-maren'], []] });
    res.players[0].ascended = ['tide-maren'];
    play(res, 'tide-glassarchivist');
    expect(res.players[0].hand.length).toBe(2);
    expect(res.players[0].deck.length).toBe(d0 - 2);
  });

  it('tide-pearlsentinel: Resonant +1|+1 is absent without an Ascended hero', () => {
    const s = board({ hand: [['tide-pearlsentinel'], []], line: [['tide-maren'], []] });
    play(s, 'tide-pearlsentinel');
    expect(st(s, unit(s, 0, 'tide-pearlsentinel'))).toMatchObject({ power: 2, health: 5 });
  });

  it('tide-ilvane: unascended Deploy freezes only its target, far from the threshold, and does not ascend', () => {
    const s = board({ hand: [['tide-ilvane'], []], line: [[], ['zz-ogre', 'zz-grunt']] });
    s.players[0].heroes = ['tide-ilvane'];
    play(s, 'tide-ilvane', [unit(s, 1, 'zz-grunt').iid]);
    expect(unit(s, 1, 'zz-grunt').stasis).toBe(true);
    expect(unit(s, 1, 'zz-ogre').stasis).toBe(false);
    expect(s.players[0].seen.stasisApplied).toBe(1);
    expect(isAscended(s, 0, 'tide-ilvane')).toBe(false);
    expect(st(s, unit(s, 0, 'tide-ilvane'))).toMatchObject({ power: 3, health: 6 });
    endRound(s); // unascended: no Dawn effect
    expect(unit(s, 1, 'zz-ogre').stasis).toBe(false);
  });

  it('tide-ilvane: ascended face Deploy freezes only its target; Dawn freezes the strongest enemy', () => {
    const s = board({ hand: [['tide-ilvane'], []], line: [[], ['zz-ogre', 'zz-grunt']] });
    s.players[0].heroes = ['tide-ilvane'];
    s.players[0].ascended = ['tide-ilvane'];
    play(s, 'tide-ilvane', [unit(s, 1, 'zz-grunt').iid]);
    expect(unit(s, 1, 'zz-grunt').stasis).toBe(true);
    expect(unit(s, 1, 'zz-ogre').stasis).toBe(false);
    expect(st(s, unit(s, 0, 'tide-ilvane'))).toMatchObject({ power: 4, health: 7 });
    endRound(s);
    expect(unit(s, 1, 'zz-ogre').stasis).toBe(true);
    expect(unit(s, 1, 'zz-grunt').stasis).toBe(false);
  });

  it('tide-ilvane: Deploy that reaches 4 ascends and the Ascend freezes every enemy (counted only when new)', () => {
    const s = board({ hand: [['tide-ilvane'], []], line: [[], ['zz-ogre', 'zz-grunt', 'zz-wall']] });
    s.players[0].heroes = ['tide-ilvane'];
    s.players[0].seen.stasisApplied = 3;
    play(s, 'tide-ilvane', [unit(s, 1, 'zz-grunt').iid]);
    expect(isAscended(s, 0, 'tide-ilvane')).toBe(true);
    expect(s.players[1].line.every((u) => u.stasis)).toBe(true);
    expect(s.players[0].seen.stasisApplied).toBe(3 + 1 + 2); // the already frozen grunt is not counted again
  });

  it('tide-tidalveil: the granted Ward lasts past the round, is spent by the next damage, and an enemy cannot be targeted', () => {
    const s = board({ hand: [['tide-tidalveil'], ['zz-zap', 'zz-zap']], line: [['zz-grunt'], ['zz-ogre']] });
    const g = unit(s, 0, 'zz-grunt');
    expect(tryPlay(s, 'tide-tidalveil', [unit(s, 1, 'zz-ogre').iid]).ok).toBe(false);
    play(s, 'tide-tidalveil', [g.iid]);
    endRound(s);
    expect(g.ward).toBe(true);
    expect(s.priority).toBe(1);
    play(s, 'zz-zap', [g.iid]);
    expect(g.dmg).toBe(0);
    expect(g.ward).toBe(false);
    play(s, 'zz-zap', [g.iid]);
    expect(g.dmg).toBe(1);
  });

  it('tide-heldbreath: Stasis on an attacker removes it from combat and its strike never lands', () => {
    const s = board({ hand: [[], ['tide-heldbreath']], line: [['zz-ogre'], []], first: 0 });
    const o = unit(s, 0, 'zz-ogre');
    attack(s, [o]);
    expect(s.phase).toBe('combat');
    pass(s);
    play(s, 'tide-heldbreath', [o.iid]);
    expect(o.stasis).toBe(true);
    expect(s.phase).toBe('main');
    expect(s.combat).toBeFalsy();
    expect(s.players[1].spire).toBe(20);
    expect(s.priority).toBe(1); // ruling R-B8/R-P3: the attack is over, the defender has priority
  });

  it('tide-slipunder: returns an allied unit only (not an enemy); a recalled token vanishes (R-U4)', () => {
    const s = board({ hand: [['tide-slipunder'], []], line: [['under-wirerat'], ['zz-grunt']] });
    expect(tryPlay(s, 'tide-slipunder', [unit(s, 1, 'zz-grunt').iid]).ok).toBe(false);
    play(s, 'tide-slipunder', [unit(s, 0, 'under-wirerat').iid]);
    expect(s.players[0].line.length).toBe(0);
    expect(s.players[0].hand.length).toBe(0);
    expect(s.players[1].line.length).toBe(1);
  });

  it('tide-backwash: Swift, enemy only; with a full owner hand the returned card is burned (R-G7)', () => {
    const s = board({ hand: [['tide-backwash', 'tide-backwash'], Array<string>(10).fill('zz-grunt')], line: [['zz-grunt'], ['tide-sluicepage']] });
    expect(tryPlay(s, 'tide-backwash', [unit(s, 0, 'zz-grunt').iid]).ok).toBe(false);
    play(s, 'tide-backwash', [unit(s, 1, 'tide-sluicepage').iid]);
    expect(s.players[1].line.length).toBe(1); // still there until it resolves
    pass(s);
    expect(s.players[1].line.length).toBe(0);
    expect(s.players[1].hand.length).toBe(10);
    expect(s.players[1].scrap).toContain('tide-sluicepage');
  });

  it('tide-gateleviathan: returns every enemy unit (tokens vanish), leaves allies, order kept', () => {
    const s = board({ hand: [['tide-gateleviathan'], []], line: [['tide-sluicepage'], ['tide-sluicepage', 'under-wirerat', 'tide-pearlsentinel']] });
    play(s, 'tide-gateleviathan');
    expect(s.players[1].line.length).toBe(0);
    expect(ids(s, 1)).toEqual(['tide-sluicepage', 'tide-pearlsentinel']);
    expect(s.players[0].line.map((u) => u.card)).toEqual(['tide-sluicepage', 'tide-gateleviathan']);
  });

  it('tide-sluiceclose: castable with one enemy (freezes it), with two (freezes both), not with none', () => {
    const one = board({ hand: [['tide-sluiceclose'], []], line: [[], ['zz-grunt']] });
    play(one, 'tide-sluiceclose', [unit(one, 1, 'zz-grunt').iid]);
    pass(one);
    expect(unit(one, 1, 'zz-grunt').stasis).toBe(true);
    expect(one.players[0].seen.stasisApplied).toBe(1);
    const two = board({ hand: [['tide-sluiceclose'], []], line: [[], ['zz-grunt', 'zz-ogre', 'zz-wall']] });
    play(two, 'tide-sluiceclose', [unit(two, 1, 'zz-grunt').iid, unit(two, 1, 'zz-ogre').iid]);
    pass(two);
    expect(two.players[1].line.map((u) => u.stasis)).toEqual([true, true, false]);
    expect(two.players[0].seen.stasisApplied).toBe(2);
    const none = board({ hand: [['tide-sluiceclose'], []] });
    expect(tryPlay(none, 'tide-sluiceclose').ok).toBe(false);
    const same = board({ hand: [['tide-sluiceclose'], []], line: [[], ['zz-grunt', 'zz-ogre']] });
    const g = unit(same, 1, 'zz-grunt').iid;
    expect(tryPlay(same, 'tide-sluiceclose', [g, g]).ok).toBe(false);
  });

  it('tide-sluiceclose: if one of two targets is gone on resolution, the other is still frozen (R-G9)', () => {
    const s = board({ hand: [['tide-sluiceclose'], ['zz-bolt']], line: [[], ['zz-grunt', 'zz-ogre']] });
    const g = unit(s, 1, 'zz-grunt');
    const o = unit(s, 1, 'zz-ogre');
    play(s, 'tide-sluiceclose', [g.iid, o.iid]);
    play(s, 'zz-bolt', [g.iid]); // the opponent kills their own grunt in response
    pass(s);
    expect(s.players[1].line.includes(g)).toBe(false);
    expect(o.stasis).toBe(true);
    expect(s.players[0].seen.stasisApplied).toBe(1);
  });

  it('tide-frostmeremagistrate: freezes one enemy when only one exists, plays with none, rejects a repeated target', () => {
    const one = board({ hand: [['tide-frostmeremagistrate'], []], line: [[], ['zz-grunt']] });
    play(one, 'tide-frostmeremagistrate', [unit(one, 1, 'zz-grunt').iid]);
    expect(unit(one, 1, 'zz-grunt').stasis).toBe(true);
    expect(one.players[0].seen.stasisApplied).toBe(1);
    const none = board({ hand: [['tide-frostmeremagistrate'], []] });
    play(none, 'tide-frostmeremagistrate');
    expect(none.players[0].line.length).toBe(1);
    const dup = board({ hand: [['tide-frostmeremagistrate'], []], line: [[], ['zz-grunt', 'zz-ogre']] });
    const g = unit(dup, 1, 'zz-grunt').iid;
    expect(tryPlay(dup, 'tide-frostmeremagistrate', [g, g]).ok).toBe(false);
  });

  it('tide-unwrite: negates an enemy Ritual on the stack (it never resolves) but cannot target your own glyph', () => {
    const s = board({ hand: [['tide-unwrite', 'tide-unwrite'], ['tide-deepstudy']], first: 1 });
    play(s, 'tide-deepstudy');
    expect(tryPlay(s, 'tide-unwrite', ['nonexistent']).ok).toBe(false);
    play(s, 'tide-unwrite', [s.stack[0].sid]);
    pass(s);
    expect(s.players[1].hand.length).toBe(0);
    expect(s.players[1].scrap).toContain('tide-deepstudy');
  });

  it('tide-deepstudy: draws exactly 3; cards beyond the 10-card hand limit are burned', () => {
    const s = board({ hand: [['tide-deepstudy', ...Array<string>(8).fill('zz-grunt')], []] });
    play(s, 'tide-deepstudy');
    pass(s);
    expect(s.players[0].hand.length).toBe(10);
    expect(s.players[0].scrap.filter((c) => c === 'zz-filler').length).toBe(1);
    const t = board({ hand: [['tide-deepstudy'], []] });
    const d0 = t.players[0].deck.length;
    play(t, 'tide-deepstudy');
    pass(t);
    expect(t.players[0].deck.length).toBe(d0 - 3);
  });

  it('tide-floodtide: freezes each enemy unit and draws exactly 1; an empty enemy Line still draws', () => {
    const s = board({ hand: [['tide-floodtide'], []], line: [['zz-grunt'], ['zz-grunt', 'zz-ogre']] });
    play(s, 'tide-floodtide');
    pass(s);
    expect(s.players[1].line.map((u) => u.stasis)).toEqual([true, true]);
    expect(unit(s, 0, 'zz-grunt').stasis).toBe(false);
    expect(s.players[0].hand.length).toBe(1);
    expect(s.players[0].seen.stasisApplied).toBe(2);
    const e = board({ hand: [['tide-floodtide'], []] });
    play(e, 'tide-floodtide');
    pass(e);
    expect(e.players[0].hand.length).toBe(1);
  });
});

describe('tide cards (First Light additions)', () => {
  it('tide-sefa: Strike draws 1; 14 cards drawn ascends her, Ascend hits the strongest enemy for the hand size, then Dusk draws', () => {
    const s = board({ line: [['tide-sefa'], ['zz-wall']] });
    s.players[0].heroes = ['tide-sefa'];
    const h = unit(s, 0, 'tide-sefa');
    expect(st(s, h)).toMatchObject({ power: 2, health: 5 });
    attack(s, [h], [[unit(s, 1, 'zz-wall'), h]]);
    resolveCombat(s);
    expect(s.players[0].hand.length).toBe(1);
    expect(isAscended(s, 0, 'tide-sefa')).toBe(false);

    const t = board({ hand: [['zz-rite', 'zz-grunt', 'zz-grunt', 'zz-grunt'], []], line: [['tide-sefa'], ['zz-ogre', 'zz-grunt']] });
    t.players[0].heroes = ['tide-sefa'];
    t.players[0].seen.cardsDrawn = 13;
    play(t, 'zz-rite');
    pass(t); // the Ritual resolves: the 14th card drawn
    expect(isAscended(t, 0, 'tide-sefa')).toBe(true);
    expect(t.players[0].hand.length).toBe(4);
    expect(unit(t, 1, 'zz-ogre').dmg).toBe(4); // Ascend: 4 cards in hand
    expect(unit(t, 1, 'zz-grunt').dmg).toBe(0);
    expect(st(t, unit(t, 0, 'tide-sefa'))).toMatchObject({ power: 4, health: 7 });
    endRound(t); // Dusk draws 1, then the new round draws 1
    expect(t.players[0].hand.length).toBe(6);
  });

  it('tide-corra: Deploy returns an ally and freezes an enemy; the 5th return ascends her, Ascend returns small enemies, units cost 1 less', () => {
    const s = board({ hand: [['tide-corra'], []], line: [['tide-sluicepage'], ['zz-grunt']] });
    s.players[0].heroes = ['tide-corra'];
    play(s, 'tide-corra', [unit(s, 0, 'tide-sluicepage').iid, unit(s, 1, 'zz-grunt').iid]);
    expect(ids(s, 0)).toEqual(['tide-sluicepage']);
    expect(unit(s, 1, 'zz-grunt').stasis).toBe(true);
    expect(s.players[0].seen.recalled).toBe(1);
    expect(isAscended(s, 0, 'tide-corra')).toBe(false);
    expect(st(s, unit(s, 0, 'tide-corra'))).toMatchObject({ power: 3, health: 4 });
    expect(costOf(s, 0, 'tide-sluicepage')).toBe(1);

    const t = board({ hand: [['tide-corra'], []], line: [['tide-sluicepage'], ['zz-ogre', 'tide-pearlsentinel']] });
    t.players[0].heroes = ['tide-corra'];
    t.players[0].seen.recalled = 4;
    play(t, 'tide-corra', [unit(t, 0, 'tide-sluicepage').iid, unit(t, 1, 'zz-ogre').iid]);
    expect(isAscended(t, 0, 'tide-corra')).toBe(true);
    expect(t.players[1].line.map((u) => u.card)).toEqual(['zz-ogre']);
    expect(ids(t, 1)).toEqual(['tide-pearlsentinel']);
    expect(st(t, unit(t, 0, 'tide-corra'))).toMatchObject({ power: 4, health: 6 });
    expect(costOf(t, 0, 'tide-sluicepage')).toBe(0);
  });

  it('tide-siltnewt: Shatter draws 1', () => {
    const s = board({ line: [['zz-ogre'], ['tide-siltnewt']] });
    const o = unit(s, 0, 'zz-ogre');
    attack(s, [o], [[unit(s, 1, 'tide-siltnewt'), o]]);
    resolveCombat(s);
    expect(s.players[1].line.length).toBe(0);
    expect(s.players[1].hand.length).toBe(1);
  });

  it('tide-marginclerk: Deploy grows by the hand size, capped at +2|+2', () => {
    const one = board({ hand: [['tide-marginclerk', 'zz-grunt'], []] });
    play(one, 'tide-marginclerk');
    expect(st(one, unit(one, 0, 'tide-marginclerk'))).toMatchObject({ power: 2, health: 2 });
    const many = board({ hand: [['tide-marginclerk', 'zz-grunt', 'zz-grunt', 'zz-grunt'], []] });
    play(many, 'tide-marginclerk');
    expect(st(many, unit(many, 0, 'tide-marginclerk'))).toMatchObject({ power: 3, health: 3 });
  });

  it('tide-lockhound: Deploy returns an enemy unit in Stasis only', () => {
    const s = board({ hand: [['tide-lockhound'], []], line: [[], ['tide-pearlsentinel', 'tide-sluicepage']] });
    unit(s, 1, 'tide-sluicepage').stasis = true;
    expect(tryPlay(s, 'tide-lockhound', [unit(s, 1, 'tide-pearlsentinel').iid]).ok).toBe(false);
    play(s, 'tide-lockhound', [unit(s, 1, 'tide-sluicepage').iid]);
    expect(s.players[1].line.map((u) => u.card)).toEqual(['tide-pearlsentinel']);
    expect(ids(s, 1)).toEqual(['tide-sluicepage']);
    expect(s.players[0].seen.recalled).toBe(1);
  });

  it('tide-undertowsprite: grows when an ally is summoned only after a return this round', () => {
    const plain = board({ hand: [['zz-grunt'], []], line: [['tide-undertowsprite'], []] });
    play(plain, 'zz-grunt');
    expect(st(plain, unit(plain, 0, 'tide-undertowsprite'))).toMatchObject({ power: 2, health: 2 });
    const s = board({ hand: [['tide-slipunder'], []], line: [['tide-undertowsprite', 'tide-pearlsentinel'], []] });
    play(s, 'tide-slipunder', [unit(s, 0, 'tide-pearlsentinel').iid]);
    play(s, 'tide-pearlsentinel');
    expect(st(s, unit(s, 0, 'tide-undertowsprite'))).toMatchObject({ power: 3, health: 3 });
  });

  it('tide-tallyframe: draws 1 when it takes damage and survives', () => {
    const s = board({ hand: [['zz-zap'], []], line: [[], ['tide-tallyframe']] });
    play(s, 'zz-zap', [unit(s, 1, 'tide-tallyframe').iid]);
    expect(unit(s, 1, 'tide-tallyframe').dmg).toBe(1);
    expect(s.players[1].hand.length).toBe(1);
  });

  it('tide-reedmarshheron: Spotter blocks an Aerial unit; Resonant gives +1|+2', () => {
    const s = board({ line: [['zz-aerial'], ['tide-reedmarshheron', 'tide-maren']] });
    const a = unit(s, 0, 'zz-aerial');
    const h = unit(s, 1, 'tide-reedmarshheron');
    expect(st(s, h)).toMatchObject({ power: 2, health: 2 });
    attack(s, [a], [[h, a]]);
    expect(s.combat?.pairs[0].blk).toBe(h.iid);
    s.players[1].ascended = ['tide-maren'];
    expect(st(s, h)).toMatchObject({ power: 3, health: 4 });
  });

  it('tide-tidemarkreader: Deploy gives +2|+2 only after a return this round', () => {
    const plain = board({ hand: [['tide-tidemarkreader'], []] });
    play(plain, 'tide-tidemarkreader');
    expect(st(plain, unit(plain, 0, 'tide-tidemarkreader'))).toMatchObject({ power: 2, health: 3 });
    const s = board({ hand: [['tide-slipunder', 'tide-tidemarkreader'], []], line: [['tide-sluicepage'], []] });
    play(s, 'tide-slipunder', [unit(s, 0, 'tide-sluicepage').iid]);
    play(s, 'tide-tidemarkreader');
    expect(st(s, unit(s, 0, 'tide-tidemarkreader'))).toMatchObject({ power: 4, health: 5 });
  });

  it('tide-shelfwarden: Dawn gives +1|+0 per card in hand this round, up to +3|+0', () => {
    const powerAtDawn = (hand: number): number => {
      const s = board({ hand: [Array<string>(hand).fill('zz-grunt'), []], line: [['tide-shelfwarden'], []] });
      endRound(s); // the new round draws 1, then Dawn
      return st(s, unit(s, 0, 'tide-shelfwarden')).power;
    };
    expect(powerAtDawn(0)).toBe(2);
    expect(powerAtDawn(1)).toBe(3);
    expect(powerAtDawn(5)).toBe(4);
  });

  it("tide-backflowlancer: Assault returns the weakest enemy to its owner's hand", () => {
    const s = board({ line: [['tide-backflowlancer'], ['tide-pearlsentinel', 'tide-sluicepage']] });
    attack(s, [unit(s, 0, 'tide-backflowlancer')]);
    expect(s.players[1].line.map((u) => u.card)).toEqual(['tide-pearlsentinel']);
    expect(ids(s, 1)).toEqual(['tide-sluicepage']);
    expect(s.players[0].seen.recalled).toBe(1);
  });

  it("tide-weirgolem: Strike returns the unit it fought to its owner's hand", () => {
    const s = board({ line: [['tide-pearlsentinel'], ['tide-weirgolem']] });
    const p = unit(s, 0, 'tide-pearlsentinel');
    const g = unit(s, 1, 'tide-weirgolem');
    attack(s, [p], [[g, p]]);
    resolveCombat(s);
    expect(s.players[0].line.length).toBe(0);
    expect(ids(s, 0)).toEqual(['tide-pearlsentinel']);
    expect(g.dmg).toBe(2);
    expect(s.players[1].seen.recalled).toBe(1);
  });

  it('tide-brineboundsage: Deploy draws 2 only if an enemy unit is in Stasis', () => {
    const plain = board({ hand: [['tide-brineboundsage'], []], line: [[], ['zz-grunt']] });
    play(plain, 'tide-brineboundsage');
    expect(plain.players[0].hand.length).toBe(0);
    const s = board({ hand: [['tide-brineboundsage'], []], line: [[], ['zz-grunt']] });
    unit(s, 1, 'zz-grunt').stasis = true;
    play(s, 'tide-brineboundsage');
    expect(s.players[0].hand.length).toBe(2);
  });

  it('tide-sluicegatebehemoth: Assault puts the strongest enemy in Stasis; Resonant gives +1|+1', () => {
    const s = board({ line: [['tide-sluicegatebehemoth', 'tide-maren'], ['zz-grunt', 'zz-ogre']] });
    const b = unit(s, 0, 'tide-sluicegatebehemoth');
    expect(st(s, b)).toMatchObject({ power: 4, health: 5 });
    attack(s, [b]);
    expect(unit(s, 1, 'zz-ogre').stasis).toBe(true);
    expect(unit(s, 1, 'zz-grunt').stasis).toBe(false);
    s.players[0].ascended = ['tide-maren'];
    expect(st(s, b)).toMatchObject({ power: 5, health: 6 });
  });

  it('tide-floodwallcolossus: Plated takes 1 less; Shatter returns every enemy unit', () => {
    const z = board({ hand: [['zz-zap'], []], line: [[], ['tide-floodwallcolossus']] });
    play(z, 'zz-zap', [unit(z, 1, 'tide-floodwallcolossus').iid]);
    expect(unit(z, 1, 'tide-floodwallcolossus').dmg).toBe(0);
    const s = board({ line: [['zz-corrosive', 'tide-sluicepage'], ['tide-floodwallcolossus']] });
    const c = unit(s, 0, 'zz-corrosive');
    attack(s, [c], [[unit(s, 1, 'tide-floodwallcolossus'), c]]);
    resolveCombat(s);
    expect(s.players[1].line.length).toBe(0);
    expect(s.players[0].line.length).toBe(0);
    expect(ids(s, 0)).toEqual(['tide-sluicepage']);
  });

  it('tide-lorewhale: Aerial; Assault draws 2', () => {
    const s = board({ line: [['tide-lorewhale'], ['zz-ogre']] });
    const w = unit(s, 0, 'tide-lorewhale');
    expect(st(s, w).keywords).toContain('aerial');
    attack(s, [w]);
    expect(s.phase).toBe('combat'); // the ogre cannot block an Aerial unit
    expect(s.players[0].hand.length).toBe(2);
  });

  it('tide-boundvolume: Flash gives +0|+1 this round for each card in hand', () => {
    const s = board({ hand: [['tide-boundvolume', 'zz-grunt', 'zz-grunt'], []], line: [['zz-grunt'], []] });
    const g = unit(s, 0, 'zz-grunt');
    play(s, 'tide-boundvolume', [g.iid]);
    expect(st(s, g)).toMatchObject({ power: 2, health: 4 });
    endRound(s);
    expect(st(s, g)).toMatchObject({ power: 2, health: 2 });
  });

  it('tide-pulloftheweir: Flash returns a unit in combat with 3 or less power', () => {
    const s = board({ hand: [[], ['tide-pulloftheweir']], line: [['tide-tidemarkreader', 'zz-ogre'], ['tide-sluicepage', 'zz-wall']] });
    const r = unit(s, 0, 'tide-tidemarkreader');
    const o = unit(s, 0, 'zz-ogre');
    attack(s, [r, o], [[unit(s, 1, 'tide-sluicepage'), r], [unit(s, 1, 'zz-wall'), o]]);
    pass(s); // the defender now has priority in the combat window
    expect(tryPlay(s, 'tide-pulloftheweir', [o.iid]).ok).toBe(false);
    play(s, 'tide-pulloftheweir', [r.iid]);
    expect(s.players[0].line.map((u) => u.card)).toEqual(['zz-ogre']);
    expect(ids(s, 0)).toEqual(['tide-tidemarkreader']);
    expect(s.players[1].seen.recalled).toBe(1);
  });

  it('tide-mooringline: Flash puts an enemy unit in combat in Stasis and draws 1', () => {
    const s = board({ hand: [[], ['tide-mooringline']], line: [['zz-ogre', 'zz-grunt'], []] });
    const o = unit(s, 0, 'zz-ogre');
    attack(s, [o]);
    pass(s);
    expect(tryPlay(s, 'tide-mooringline', [unit(s, 0, 'zz-grunt').iid]).ok).toBe(false);
    play(s, 'tide-mooringline', [o.iid]);
    expect(o.stasis).toBe(true);
    expect(s.players[1].hand.length).toBe(1);
    expect(s.players[1].spire).toBe(20);
  });

  it('tide-readthecurrent: Swift draws 1, or 2 after a return this round', () => {
    const plain = board({ hand: [['tide-readthecurrent'], []] });
    play(plain, 'tide-readthecurrent');
    pass(plain);
    expect(plain.players[0].hand.length).toBe(1);
    const s = board({ hand: [['tide-slipunder', 'tide-readthecurrent'], []], line: [['tide-sluicepage'], []] });
    play(s, 'tide-slipunder', [unit(s, 0, 'tide-sluicepage').iid]);
    play(s, 'tide-readthecurrent');
    pass(s);
    expect(s.players[0].hand.length).toBe(3);
  });

  it('tide-rifflethestacks: Swift draws 2; Resonant draws 3', () => {
    const plain = board({ hand: [['tide-rifflethestacks'], []], line: [['tide-maren'], []] });
    play(plain, 'tide-rifflethestacks');
    pass(plain);
    expect(plain.players[0].hand.length).toBe(2);
    const res = board({ hand: [['tide-rifflethestacks'], []], line: [['tide-maren'], []] });
    res.players[0].ascended = ['tide-maren'];
    play(res, 'tide-rifflethestacks');
    pass(res);
    expect(res.players[0].hand.length).toBe(3);
  });

  it('tide-lockandrelease: Swift returns an allied unit and an enemy unit', () => {
    const s = board({ hand: [['tide-lockandrelease'], []], line: [['tide-pearlsentinel'], ['tide-sluicepage']] });
    play(s, 'tide-lockandrelease', [unit(s, 0, 'tide-pearlsentinel').iid, unit(s, 1, 'tide-sluicepage').iid]);
    pass(s);
    expect(ids(s, 0)).toEqual(['tide-pearlsentinel']);
    expect(ids(s, 1)).toEqual(['tide-sluicepage']);
    expect(s.players[0].seen.recalled).toBe(2);
  });

  it('tide-sluicesweep: Swift returns two enemy units with 3 or less power', () => {
    const s = board({ hand: [['tide-sluicesweep'], []], line: [[], ['tide-sluicepage', 'tide-pearlsentinel', 'zz-ogre']] });
    expect(tryPlay(s, 'tide-sluicesweep', [unit(s, 1, 'zz-ogre').iid]).ok).toBe(false);
    play(s, 'tide-sluicesweep', [unit(s, 1, 'tide-sluicepage').iid, unit(s, 1, 'tide-pearlsentinel').iid]);
    pass(s);
    expect(s.players[1].line.map((u) => u.card)).toEqual(['zz-ogre']);
    expect(ids(s, 1)).toEqual(['tide-sluicepage', 'tide-pearlsentinel']);
  });

  it('tide-homewardcurrent: Ritual returns an allied unit and draws 2', () => {
    const s = board({ hand: [['tide-homewardcurrent'], []], line: [['tide-pearlsentinel'], []] });
    play(s, 'tide-homewardcurrent', [unit(s, 0, 'tide-pearlsentinel').iid]);
    pass(s);
    expect(s.players[0].line.length).toBe(0);
    expect(ids(s, 0)).toEqual(['tide-pearlsentinel', 'zz-filler', 'zz-filler']);
  });

  it("tide-turnofthelocks: Ritual returns every unit to its owner's hand, then draws 2", () => {
    const s = board({ hand: [['tide-turnofthelocks'], []], line: [['tide-pearlsentinel'], ['tide-sluicepage', 'zz-ogre']] });
    play(s, 'tide-turnofthelocks');
    pass(s);
    expect(s.players[0].line.length + s.players[1].line.length).toBe(0);
    expect(ids(s, 0)).toEqual(['tide-pearlsentinel', 'zz-filler', 'zz-filler']);
    expect(ids(s, 1)).toEqual(['tide-sluicepage']);
    expect(s.players[0].seen.recalled).toBe(3);
  });
});

// ---------- set x1: The Mirror Quarter ----------
describe('tide x1 cards', () => {
  const glimmers = (s: G, seat: 0 | 1): string[] => s.players[seat].hand.filter((h) => h.glimmer).map((h) => h.card);

  it('tide-hesper: Deploy copies an ally as Glimmer; ascends on the 4th Glimmer card played, returning and copying the strongest enemy', () => {
    const s = board({ hand: [['tide-hesper'], []], line: [['tide-sluicepage'], ['tide-stillwaterbailiff', 'tide-sluicepage']] });
    s.players[0].heroes = ['tide-hesper'];
    s.players[0].seen.glimmerPlayed = 2;
    play(s, 'tide-hesper', [unit(s, 0, 'tide-sluicepage').iid]);
    expect(glimmers(s, 0)).toEqual(['tide-sluicepage']);
    expect(s.players[0].seen.copiesMade).toBe(1);
    pass(s);
    play(s, 'tide-sluicepage'); // 3rd Glimmer card: not yet
    expect(isAscended(s, 0, 'tide-hesper')).toBe(false);
    expect(s.players[1].line.map((u) => u.card)).toEqual(['tide-stillwaterbailiff', 'tide-sluicepage']);
    s.players[0].seen.glimmerPlayed = 3;
    s.players[0].hand.push({ iid: 'hx', card: 'tide-sluicepage', glimmer: true });
    pass(s);
    play(s, 'tide-sluicepage'); // the 4th
    expect(isAscended(s, 0, 'tide-hesper')).toBe(true);
    expect(s.players[1].line.map((u) => u.card)).toEqual(['tide-sluicepage']);
    expect(ids(s, 1)).toEqual(['tide-stillwaterbailiff']);
    expect(glimmers(s, 0)).toEqual(['tide-stillwaterbailiff']);
    expect(st(s, unit(s, 0, 'tide-hesper'))).toMatchObject({ power: 4, health: 6 });
  });

  it('tide-hesper ascended: Dawn puts a Glimmer copy of a random other ally in hand, which fades at the round end', () => {
    const s = board({ line: [['tide-hesper', 'tide-pearlsentinel'], []] });
    s.players[0].heroes = ['tide-hesper'];
    s.players[0].ascended = ['tide-hesper'];
    endRound(s);
    expect(glimmers(s, 0)).toEqual(['tide-pearlsentinel']);
    endRound(s);
    expect(glimmers(s, 0)).toEqual(['tide-pearlsentinel']); // the old one faded, a new one came
    expect(s.players[0].scrap).toContain('tide-pearlsentinel');
  });

  it('tide-canalglint: Deploy puts a Glimmer copy of an ally with 2 or less power in hand', () => {
    const s = board({ hand: [['tide-canalglint'], []], line: [['tide-sluicepage', 'tide-stillwaterbailiff'], []] });
    expect(tryPlay(s, 'tide-canalglint', [unit(s, 0, 'tide-stillwaterbailiff').iid]).ok).toBe(false);
    play(s, 'tide-canalglint', [unit(s, 0, 'tide-sluicepage').iid]);
    expect(s.players[0].hand).toEqual([expect.objectContaining({ card: 'tide-sluicepage', glimmer: true })]);
  });

  it('tide-wakeecho: when the opponent casts a glyph, a Glimmer copy of it goes to hand; my own glyphs do not', () => {
    const s = board({ hand: [['zz-pump'], ['zz-zap']], line: [['tide-wakeecho'], []], first: 1 });
    play(s, 'zz-zap', [unit(s, 0, 'tide-wakeecho').iid]);
    expect(glimmers(s, 0)).toEqual(['tide-wakeecho']);
    pass(s);
    play(s, 'zz-pump', [unit(s, 0, 'tide-wakeecho').iid]);
    expect(glimmers(s, 0)).toEqual(['tide-wakeecho']);
    expect(s.players[0].seen.copiesMade).toBe(1);
  });

  it('tide-glasswaterlookout: Veiled from enemy glyphs; grows +1|+1 when the opponent casts a glyph', () => {
    const s = board({ hand: [[], ['zz-zap']], line: [['tide-glasswaterlookout', 'zz-grunt'], []], first: 1 });
    const l = unit(s, 0, 'tide-glasswaterlookout');
    expect(tryPlay(s, 'zz-zap', [l.iid]).ok).toBe(false);
    play(s, 'zz-zap', [unit(s, 0, 'zz-grunt').iid]);
    expect(st(s, l)).toMatchObject({ power: 2, health: 3 });
  });

  it('tide-surfacemimic: Deploy copies an enemy unit as Glimmer; Resonant makes a lasting copy', () => {
    const s = board({ hand: [['tide-surfacemimic'], []], line: [['tide-maren'], ['tide-stillwaterbailiff']] });
    play(s, 'tide-surfacemimic', [unit(s, 1, 'tide-stillwaterbailiff').iid]);
    expect(s.players[0].hand).toEqual([expect.objectContaining({ card: 'tide-stillwaterbailiff', glimmer: true })]);
    expect(s.players[1].line.length).toBe(1);
    const r = board({ hand: [['tide-surfacemimic'], []], line: [['tide-maren'], ['tide-stillwaterbailiff']] });
    r.players[0].ascended = ['tide-maren'];
    play(r, 'tide-surfacemimic', [unit(r, 1, 'tide-stillwaterbailiff').iid]);
    expect(ids(r, 0)).toEqual(['tide-stillwaterbailiff']);
    expect(glimmers(r, 0)).toEqual([]);
  });

  it('tide-mirrorwakecourier: Deploy returns an ally to hand together with a Glimmer copy of it', () => {
    const s = board({ hand: [['tide-mirrorwakecourier'], []], line: [['tide-pearlsentinel'], []] });
    play(s, 'tide-mirrorwakecourier', [unit(s, 0, 'tide-pearlsentinel').iid]);
    expect(s.players[0].line.map((u) => u.card)).toEqual(['tide-mirrorwakecourier']);
    expect(ids(s, 0).sort()).toEqual(['tide-pearlsentinel', 'tide-pearlsentinel']);
    expect(glimmers(s, 0)).toEqual(['tide-pearlsentinel']);
    expect(s.players[0].seen.recalled).toBe(1);
  });

  it('tide-stillmirrormagus: an enemy glyph puts the strongest enemy in Stasis; Resonant gives +1|+1', () => {
    const s = board({ hand: [[], ['zz-zap']], line: [['tide-stillmirrormagus'], ['zz-grunt', 'zz-ogre']], first: 1 });
    const m = unit(s, 0, 'tide-stillmirrormagus');
    play(s, 'zz-zap', [m.iid]);
    expect(unit(s, 1, 'zz-ogre').stasis).toBe(true);
    expect(unit(s, 1, 'zz-grunt').stasis).toBe(false);
    expect(st(s, m)).toMatchObject({ power: 3, health: 4 });
    s.players[0].line.push(...board({ line: [['tide-maren'], []] }).players[0].line);
    s.players[0].ascended = ['tide-maren'];
    expect(st(s, m)).toMatchObject({ power: 4, health: 5 });
  });

  it('tide-pondmirrorwarden: Deploy puts an enemy unit in Stasis and a Glimmer copy of it in hand', () => {
    const s = board({ hand: [['tide-pondmirrorwarden'], []], line: [[], ['tide-stillwaterbailiff']] });
    const b = unit(s, 1, 'tide-stillwaterbailiff');
    play(s, 'tide-pondmirrorwarden', [b.iid]);
    expect(b.stasis).toBe(true);
    expect(glimmers(s, 0)).toEqual(['tide-stillwaterbailiff']);
  });

  it('tide-mirrordeepleviathan: Veiled from enemy glyphs; Assault puts every enemy in Stasis, so nothing blocks', () => {
    const t = board({ hand: [[], ['zz-zap']], line: [['tide-mirrordeepleviathan', 'zz-grunt'], []], first: 1 });
    expect(tryPlay(t, 'zz-zap', [unit(t, 0, 'tide-mirrordeepleviathan').iid]).ok).toBe(false);
    const s = board({ line: [['tide-mirrordeepleviathan'], ['zz-ogre', 'zz-wall']] });
    const l = unit(s, 0, 'tide-mirrordeepleviathan');
    attack(s, [l]);
    expect(unit(s, 1, 'zz-ogre').stasis).toBe(true);
    expect(unit(s, 1, 'zz-wall').stasis).toBe(true);
    resolveCombat(s);
    expect(s.players[1].spire).toBe(15);
  });

  it('tide-twinmoorings: Flash Stasis on an attacker, and its Reprise copy stops a second one', () => {
    const s = board({ hand: [[], ['tide-twinmoorings']], line: [['zz-ogre', 'zz-grunt'], []] });
    const o = unit(s, 0, 'zz-ogre');
    const g = unit(s, 0, 'zz-grunt');
    attack(s, [o, g]);
    pass(s);
    play(s, 'tide-twinmoorings', [o.iid]);
    expect(o.stasis).toBe(true);
    expect(s.players[1].hand).toEqual([expect.objectContaining({ card: 'tide-twinmoorings', glimmer: true, plain: true })]);
    play(s, 'tide-twinmoorings', [g.iid]);
    expect(g.stasis).toBe(true);
    expect(s.players[1].hand.length).toBe(0);
    resolveCombat(s);
    expect(s.players[1].spire).toBe(20);
  });

  it('tide-caughtreflection: Flash puts a Glimmer copy of an enemy glyph on the stack in hand', () => {
    const s = board({ hand: [['tide-caughtreflection'], ['tide-backwash']], line: [['tide-pearlsentinel'], []], first: 1 });
    play(s, 'tide-backwash', [unit(s, 0, 'tide-pearlsentinel').iid]);
    play(s, 'tide-caughtreflection', [s.stack[0].sid]);
    expect(glimmers(s, 0)).toEqual(['tide-backwash']);
    expect(s.players[0].seen.copiesMade).toBe(1);
  });

  it('tide-ebbandecho: Swift returns an enemy with 3 or less power, then its Reprise copy returns another', () => {
    const s = board({ hand: [['tide-ebbandecho'], []], line: [[], ['tide-sluicepage', 'tide-pearlsentinel', 'zz-ogre']] });
    expect(tryPlay(s, 'tide-ebbandecho', [unit(s, 1, 'zz-ogre').iid]).ok).toBe(false);
    play(s, 'tide-ebbandecho', [unit(s, 1, 'tide-sluicepage').iid]);
    pass(s);
    expect(ids(s, 1)).toEqual(['tide-sluicepage']);
    expect(s.players[0].hand).toEqual([expect.objectContaining({ card: 'tide-ebbandecho', glimmer: true, plain: true })]);
    pass(s);
    play(s, 'tide-ebbandecho', [unit(s, 1, 'tide-pearlsentinel').iid]);
    pass(s);
    expect(ids(s, 1)).toEqual(['tide-sluicepage', 'tide-pearlsentinel']);
    expect(ids(s, 0)).toEqual([]);
  });

  it('tide-echoingcurrent: Swift draws 1; its Reprise copy is the 2nd glyph this round and draws 2', () => {
    const s = board({ hand: [['tide-echoingcurrent'], []] });
    play(s, 'tide-echoingcurrent');
    pass(s);
    expect(ids(s, 0).sort()).toEqual(['tide-echoingcurrent', 'zz-filler']);
    pass(s);
    play(s, 'tide-echoingcurrent');
    pass(s);
    expect(ids(s, 0)).toEqual(['zz-filler', 'zz-filler', 'zz-filler']);
  });

  it('tide-frozenreflections: Ritual draws 1 and copies each enemy unit in Stasis as Glimmer', () => {
    const s = board({ hand: [['tide-frozenreflections'], []], line: [[], ['tide-stillwaterbailiff', 'tide-sluicepage', 'tide-pearlsentinel']] });
    unit(s, 1, 'tide-stillwaterbailiff').stasis = true;
    unit(s, 1, 'tide-pearlsentinel').stasis = true;
    play(s, 'tide-frozenreflections');
    pass(s);
    expect(glimmers(s, 0)).toEqual(['tide-stillwaterbailiff', 'tide-pearlsentinel']);
    expect(ids(s, 0)).toContain('zz-filler');
    expect(s.players[0].hand.length).toBe(3);
  });
});

// ---------- set x2: The Starward Rise ----------
describe('tide x2 cards', () => {
  // The opening hand and the round-1 draw come off the top before board() replaces the hand (top = end of the list).
  const OPEN = ['zz-filler', 'zz-filler', 'zz-filler', 'zz-filler', 'zz-filler'];
  const FOE = Array<string>(20).fill('zz-filler');

  it('tide-orsa: Dawn Charts a glyph (3); the 5th charted card ascends her and her other units get +1|+1 and Ward', () => {
    // round 2: the round draw takes the filler on top, then Dawn looks at grunt, bolt, filler
    const s = board({ line: [['tide-orsa', 'zz-grunt'], []], deck: [['zz-filler', 'zz-bolt', 'zz-grunt', 'zz-filler', ...OPEN], FOE] });
    s.players[0].heroes = ['tide-orsa'];
    s.players[0].seen.charted = 4;
    expect(st(s, unit(s, 0, 'tide-orsa'))).toMatchObject({ power: 2, health: 4 });
    endRound(s);
    expect(ids(s, 0)).toEqual(['zz-filler', 'zz-bolt']);
    expect(s.players[0].deck).toEqual(['zz-filler', 'zz-grunt']);
    expect(isAscended(s, 0, 'tide-orsa')).toBe(true);
    const g = unit(s, 0, 'zz-grunt');
    expect(st(s, g)).toMatchObject({ power: 3, health: 3 });
    expect(g.ward).toBe(true);
    const o = unit(s, 0, 'tide-orsa');
    expect(st(s, o)).toMatchObject({ power: 4, health: 6 });
    expect(o.ward).toBe(false); // "other units": she does not ward herself
  });

  it('tide-orsa: base Dawn looks at only 3 cards; ascended she looks at 4', () => {
    const deck = ['zz-bolt', 'zz-grunt', 'zz-grunt', 'zz-grunt', 'zz-filler', ...OPEN]; // the glyph is the 4th card under the round draw
    const s = board({ line: [['tide-orsa'], []], deck: [[...deck], FOE] });
    s.players[0].heroes = ['tide-orsa'];
    endRound(s);
    expect(ids(s, 0)).toEqual(['zz-filler']);
    expect(s.players[0].seen.charted ?? 0).toBe(0);
    const a = board({ line: [['tide-orsa'], []], deck: [[...deck], FOE] });
    a.players[0].heroes = ['tide-orsa'];
    a.players[0].ascended = ['tide-orsa'];
    endRound(a);
    expect(ids(a, 0)).toEqual(['zz-filler', 'zz-bolt']);
    expect(a.players[0].seen.charted).toBe(1);
  });

  it('tide-almanacrunner: Deploy Charts the first mage among the top 4', () => {
    const s = board({ hand: [['tide-almanacrunner'], []], deck: [['zz-filler', 'tide-sluicepage', 'zz-grunt', 'zz-bolt', ...OPEN], FOE] });
    play(s, 'tide-almanacrunner');
    expect(ids(s, 0)).toEqual(['tide-sluicepage']);
    expect(s.players[0].deck).toEqual(['zz-filler', 'zz-grunt', 'zz-bolt']);
    expect(s.players[0].seen.charted).toBe(1);
  });

  it('tide-neapgatekeeper: Unfolds after 2 rounds on the Line into a 3|4 that puts the strongest enemy in Stasis', () => {
    const s = board({ line: [['tide-neapgatekeeper'], ['zz-grunt', 'zz-ogre']] });
    const k = unit(s, 0, 'tide-neapgatekeeper');
    endRound(s);
    expect(k.unfolded).toBeFalsy();
    expect(st(s, k)).toMatchObject({ power: 1, health: 3 });
    expect(unit(s, 1, 'zz-ogre').stasis).toBe(false);
    endRound(s);
    expect(k.unfolded).toBe(true);
    expect(st(s, k)).toMatchObject({ power: 3, health: 4 });
    expect(unit(s, 1, 'zz-ogre').stasis).toBe(true);
    expect(unit(s, 1, 'zz-grunt').stasis).toBe(false);
  });

  it('tide-highwatercantor: a glyph grows it +1|+1 for good only with Conjunction', () => {
    const s = board({ hand: [['zz-pump', 'tide-sluicepage', 'zz-pump'], []], line: [['tide-highwatercantor'], []] });
    const c = unit(s, 0, 'tide-highwatercantor');
    play(s, 'zz-pump', [c.iid]); // a glyph, but no unit played yet
    expect(st(s, c)).toMatchObject({ power: 2, health: 6 });
    play(s, 'tide-sluicepage');
    pass(s);
    play(s, 'zz-pump', [c.iid]); // unit played and glyph cast: Conjunction
    expect(st(s, c)).toMatchObject({ power: 3, health: 10 });
    endRound(s);
    expect(st(s, c)).toMatchObject({ power: 3, health: 4 });
  });

  it('tide-breakwatersentry: after surviving damage twice it Unfolds, repaired, into a Plated 3|6 and draws 1', () => {
    const s = board({ hand: [[], ['zz-zap', 'zz-zap']], line: [['tide-breakwatersentry'], []], first: 1 });
    const b = unit(s, 0, 'tide-breakwatersentry');
    play(s, 'zz-zap', [b.iid]);
    expect(b.unfolded).toBeFalsy();
    expect(st(s, b)).toMatchObject({ power: 1, health: 4, hp: 3 });
    play(s, 'zz-zap', [b.iid]);
    expect(b.unfolded).toBe(true);
    expect(st(s, b)).toMatchObject({ power: 3, health: 6, hp: 6 });
    expect(st(s, b).keywords).toContain('plated');
    expect(ids(s, 0)).toEqual(['zz-filler']);
  });

  it('tide-lunarephemerist: Deploy Charts a glyph among the top 4; Resonant gives +1|+2', () => {
    const s = board({ hand: [['tide-lunarephemerist'], []], line: [['tide-maren'], []], deck: [['zz-filler', 'zz-bolt', 'zz-grunt', 'zz-grunt', 'zz-grunt', ...OPEN], FOE] });
    play(s, 'tide-lunarephemerist');
    expect(ids(s, 0)).toEqual(['zz-bolt']);
    expect(s.players[0].deck).toEqual(['zz-filler', 'zz-grunt', 'zz-grunt', 'zz-grunt']);
    const e = unit(s, 0, 'tide-lunarephemerist');
    expect(st(s, e)).toMatchObject({ power: 2, health: 4 });
    s.players[0].ascended = ['tide-maren'];
    expect(st(s, e)).toMatchObject({ power: 3, health: 6 });
  });

  it('tide-moonboundfloodwarden: Deploy with Conjunction puts every enemy unit with 3 or less power in Stasis', () => {
    const t = board({ hand: [['tide-moonboundfloodwarden'], []], line: [[], ['zz-grunt']] });
    play(t, 'tide-moonboundfloodwarden'); // no glyph cast this round
    expect(unit(t, 1, 'zz-grunt').stasis).toBe(false);
    const s = board({ hand: [['zz-pump', 'tide-moonboundfloodwarden'], []], line: [['zz-grunt'], ['zz-grunt', 'zz-vanguard', 'zz-ogre']] });
    play(s, 'zz-pump', [unit(s, 0, 'zz-grunt').iid]);
    play(s, 'tide-moonboundfloodwarden');
    expect(unit(s, 1, 'zz-grunt').stasis).toBe(true);
    expect(unit(s, 1, 'zz-vanguard').stasis).toBe(true);
    expect(unit(s, 1, 'zz-ogre').stasis).toBe(false);
    expect(unit(s, 0, 'zz-grunt').stasis).toBe(false);
  });

  it('tide-moonhaulleviathan: Plated; after 1 round on the Line it Unfolds into a Plated 7|8 and returns the strongest enemy', () => {
    const s = board({ line: [['tide-moonhaulleviathan'], ['zz-grunt', 'tide-stillwaterbailiff']] });
    const l = unit(s, 0, 'tide-moonhaulleviathan');
    expect(st(s, l)).toMatchObject({ power: 4, health: 6 });
    expect(st(s, l).keywords).toContain('plated');
    endRound(s);
    expect(l.unfolded).toBe(true);
    expect(st(s, l)).toMatchObject({ power: 7, health: 8 });
    expect(st(s, l).keywords).toContain('plated');
    expect(s.players[1].line.map((u) => u.card)).toEqual(['zz-grunt']);
    expect(ids(s, 1)).toContain('tide-stillwaterbailiff');
  });

  it('tide-tidelockbrace: Flash +0|+2 this round; with Conjunction the unit also gains Ward', () => {
    const s = board({ hand: [['tide-tidelockbrace', 'tide-sluicepage', 'tide-tidelockbrace'], []], line: [['zz-grunt'], []] });
    const g = unit(s, 0, 'zz-grunt');
    play(s, 'tide-tidelockbrace', [g.iid]);
    expect(st(s, g)).toMatchObject({ power: 2, health: 4 });
    expect(g.ward).toBe(false);
    play(s, 'tide-sluicepage');
    pass(s);
    play(s, 'tide-tidelockbrace', [g.iid]);
    expect(st(s, g)).toMatchObject({ power: 2, health: 6 });
    expect(g.ward).toBe(true);
    endRound(s);
    expect(st(s, g)).toMatchObject({ power: 2, health: 2 });
  });

  it('tide-moonpull: Swift Stasis on an enemy unit; with Conjunction it returns the unit to hand instead', () => {
    const s = board({ hand: [['tide-moonpull', 'tide-sluicepage', 'tide-moonpull'], []], line: [[], ['tide-stillwaterbailiff', 'tide-pearlsentinel']] });
    play(s, 'tide-moonpull', [unit(s, 1, 'tide-stillwaterbailiff').iid]);
    pass(s);
    expect(unit(s, 1, 'tide-stillwaterbailiff').stasis).toBe(true);
    expect(s.players[1].line.length).toBe(2);
    if (s.priority !== 0) pass(s);
    play(s, 'tide-sluicepage');
    pass(s);
    play(s, 'tide-moonpull', [unit(s, 1, 'tide-pearlsentinel').iid]);
    pass(s);
    expect(s.players[1].line.map((u) => u.card)).toEqual(['tide-stillwaterbailiff']);
    expect(ids(s, 1)).toEqual(['tide-pearlsentinel']);
  });

  it('tide-tidetables: Swift Charts a unit (4), then a glyph (4)', () => {
    const s = board({ hand: [['tide-tidetables'], []], deck: [['zz-filler', 'zz-bolt', 'zz-grunt', 'zz-zap', ...OPEN], FOE] });
    play(s, 'tide-tidetables');
    pass(s);
    expect(ids(s, 0)).toEqual(['zz-grunt', 'zz-zap']);
    expect(s.players[0].deck).toEqual(['zz-filler', 'zz-bolt']);
    expect(s.players[0].seen.charted).toBe(2);
  });

  it('tide-slackwater: Ritual repairs your units fully and gives them +0|+2; Resonant draws 2', () => {
    const s = board({ hand: [['tide-slackwater'], []], line: [['zz-wall', 'zz-grunt'], ['zz-ogre']] });
    unit(s, 0, 'zz-wall').dmg = 3;
    unit(s, 0, 'zz-grunt').dmg = 1;
    unit(s, 1, 'zz-ogre').dmg = 2;
    play(s, 'tide-slackwater');
    pass(s);
    expect(st(s, unit(s, 0, 'zz-wall'))).toMatchObject({ health: 8, hp: 8 });
    expect(st(s, unit(s, 0, 'zz-grunt'))).toMatchObject({ power: 2, health: 4, hp: 4 });
    expect(st(s, unit(s, 1, 'zz-ogre'))).toMatchObject({ health: 5, hp: 3 });
    expect(s.players[0].hand.length).toBe(0);
    const r = board({ hand: [['tide-slackwater'], []], line: [['tide-maren'], []] });
    r.players[0].ascended = ['tide-maren'];
    play(r, 'tide-slackwater');
    pass(r);
    expect(ids(r, 0)).toEqual(['zz-filler', 'zz-filler']);
  });
});

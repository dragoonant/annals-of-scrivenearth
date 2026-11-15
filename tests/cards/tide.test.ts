import { describe, expect, it } from 'vitest';
import { applyAction, attack, board, pass, play, st, unit } from '../helpers';
import { isAscended } from '../../src/engine/query';

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

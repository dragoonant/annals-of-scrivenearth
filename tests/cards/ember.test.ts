import { describe, expect, it } from 'vitest';
import { applyAction, attack, board, pass, play, resolveCombat, st, unit } from '../helpers';
import type { GameState } from '../../src/engine/types';

const names = (s: GameState, seat: 0 | 1): string[] => s.players[seat].line.map((u) => u.card);
const resonant = (s: GameState): void => { s.players[0].ascended = ['ember-kessa']; };

describe('ember cards', () => {
  it('ember-cinderscamp: Deploy summons a Sparkbot', () => {
    const s = board({ hand: [['ember-cinderscamp'], []] });
    play(s, 'ember-cinderscamp');
    expect(names(s, 0)).toEqual(['ember-cinderscamp', 'ember-sparkbot']);
  });

  it('ember-kilnhand: Shatter deals 1 to the enemy Spire', () => {
    const s = board({ line: [['ember-kilnhand'], ['zz-grunt']] });
    const k = unit(s, 0, 'ember-kilnhand');
    attack(s, [k], [[unit(s, 1, 'zz-grunt'), k]]);
    resolveCombat(s);
    expect(names(s, 0)).toEqual([]);
    expect(s.players[1].spire).toBe(19);
  });

  it('ember-ashrunner: Vanguard kills a 2-health blocker before it strikes back', () => {
    const s = board({ line: [['ember-ashrunner'], ['zz-grunt']] });
    const r = unit(s, 0, 'ember-ashrunner');
    attack(s, [r], [[unit(s, 1, 'zz-grunt'), r]]);
    resolveCombat(s);
    expect(names(s, 1)).toEqual([]);
    expect(r.dmg).toBe(0);
  });

  it('ember-slagsmith: Deploy deals 1 to an enemy unit', () => {
    const s = board({ hand: [['ember-slagsmith'], []], line: [[], ['zz-wall']] });
    const w = unit(s, 1, 'zz-wall');
    play(s, 'ember-slagsmith', [w.iid]);
    expect(w.dmg).toBe(1);
  });

  it('ember-sparkforge: casting a glyph summons a Sparkbot', () => {
    const s = board({ hand: [['zz-pump'], []], line: [['ember-sparkforge'], []] });
    play(s, 'zz-pump', [unit(s, 0, 'ember-sparkforge').iid]);
    expect(names(s, 0)).toEqual(['ember-sparkforge', 'ember-sparkbot']);
  });

  it('ember-fuseguard: Shatter deals exactly 2 to one random enemy unit (either can be picked)', () => {
    const hits = [0, 0];
    for (let seed = 1; seed <= 30; seed++) {
      const s = board({ seed, first: 1, hand: [[], ['zz-bolt']], line: [['ember-fuseguard'], ['zz-wall', 'zz-wall']] });
      play(s, 'zz-bolt', [unit(s, 0, 'ember-fuseguard').iid]);
      pass(s);
      expect(names(s, 0)).toEqual([]);
      const d = [unit(s, 1, 'zz-wall', 0).dmg, unit(s, 1, 'zz-wall', 1).dmg];
      expect(d[0] + d[1]).toBe(2); // exactly one unit takes the 2
      expect([0, 2]).toContain(d[0]);
      hits[d[0] === 2 ? 0 : 1] += 1;
    }
    expect(hits[0]).toBeGreaterThan(0);
    expect(hits[1]).toBeGreaterThan(0);
  });

  it('ember-furnacebrute: Vanguard kills a 2-health blocker first; Resonant gives +1|+1 (and not before)', () => {
    const s = board({ line: [['ember-furnacebrute', 'ember-kessa'], ['zz-grunt']] });
    const b = unit(s, 0, 'ember-furnacebrute');
    expect(st(s, b)).toMatchObject({ power: 3, health: 3 });
    attack(s, [b], [[unit(s, 1, 'zz-grunt'), b]]);
    resolveCombat(s);
    expect(names(s, 1)).toEqual([]);
    expect(b.dmg).toBe(0); // without Vanguard the grunt would have struck back for 2
    const t = board({ line: [['ember-furnacebrute', 'ember-kessa'], []] });
    const c = unit(t, 0, 'ember-furnacebrute');
    resonant(t);
    expect(st(t, c)).toMatchObject({ power: 4, health: 4 });
  });

  it('ember-arcwelder: Deploy deals 2 to an enemy unit, one hit of 3 when Resonant', () => {
    const s = board({ hand: [['ember-arcwelder'], []], line: [['ember-kessa'], ['zz-ogre']] });
    const o = unit(s, 1, 'zz-ogre');
    play(s, 'ember-arcwelder', [o.iid]);
    expect(o.dmg).toBe(2);
    const t = board({ hand: [['ember-arcwelder'], []], line: [['ember-kessa'], ['zz-ogre']] });
    resonant(t);
    const q = unit(t, 1, 'zz-ogre');
    play(t, 'ember-arcwelder', [q.iid]);
    expect(q.dmg).toBe(3);
  });

  it('ember-arcwelder: the Resonant hit is a single 3 (Plated takes 2, not 1; Ward absorbs it whole)', () => {
    const s = board({ hand: [['ember-arcwelder'], []], line: [['ember-kessa'], ['zz-plated']] });
    resonant(s);
    const p = unit(s, 1, 'zz-plated');
    play(s, 'ember-arcwelder', [p.iid]);
    expect(p.dmg).toBe(2);
    const n = board({ hand: [['ember-arcwelder'], []], line: [[], ['zz-plated']] });
    const q = unit(n, 1, 'zz-plated');
    play(n, 'ember-arcwelder', [q.iid]);
    expect(q.dmg).toBe(1);
    const w = board({ hand: [['ember-arcwelder'], []], line: [['ember-kessa'], ['zz-ward']] });
    resonant(w);
    const x = unit(w, 1, 'zz-ward');
    play(w, 'ember-arcwelder', [x.iid]);
    expect(x.dmg).toBe(0);
    expect(x.ward).toBe(false);
  });

  it('ember-furnacetender: Deploy summons a Slagling', () => {
    const s = board({ hand: [['ember-furnacetender'], []] });
    play(s, 'ember-furnacetender');
    expect(names(s, 0)).toEqual(['ember-furnacetender', 'ember-slagling']);
  });

  it('ember-blastminer: Shatter deals 2 to every enemy unit', () => {
    const s = board({ first: 1, hand: [[], ['zz-bolt']], line: [['ember-blastminer'], ['zz-grunt', 'zz-ogre']] });
    unit(s, 0, 'ember-blastminer').dmg = 2;
    play(s, 'zz-bolt', [unit(s, 0, 'ember-blastminer').iid]);
    pass(s);
    expect(names(s, 1)).toEqual(['zz-ogre']);
    expect(unit(s, 1, 'zz-ogre').dmg).toBe(2);
  });

  it('ember-pyrelancer: Assault deals 1 to the enemy Spire on top of its strike', () => {
    const s = board({ line: [['ember-pyrelancer'], []] });
    attack(s, [unit(s, 0, 'ember-pyrelancer')]);
    resolveCombat(s);
    expect(s.players[1].spire).toBe(20 - 1 - 3);
  });

  it('ember-moltenwarden: Deploy deals 3 to an enemy unit', () => {
    const s = board({ hand: [['ember-moltenwarden'], []], line: [[], ['zz-ogre']] });
    const o = unit(s, 1, 'zz-ogre');
    play(s, 'ember-moltenwarden', [o.iid]);
    expect(o.dmg).toBe(3);
  });

  it('ember-crucibleherald: Deploy summons 3 Slaglings', () => {
    const s = board({ hand: [['ember-crucibleherald'], []] });
    play(s, 'ember-crucibleherald');
    expect(names(s, 0)).toEqual(['ember-crucibleherald', 'ember-slagling', 'ember-slagling', 'ember-slagling']);
  });

  it('ember-foundrytitan: Pierce sends excess strike damage to the Spire; Deploy deals 2 to every enemy unit', () => {
    const s = board({ hand: [['ember-foundrytitan'], []], line: [[], ['zz-grunt', 'zz-wall']] });
    play(s, 'ember-foundrytitan');
    expect(names(s, 1)).toEqual(['zz-wall']);
    expect(unit(s, 1, 'zz-wall').dmg).toBe(2);
    const t = board({ line: [['ember-foundrytitan'], ['zz-grunt']] });
    const ti = unit(t, 0, 'ember-foundrytitan');
    attack(t, [ti], [[unit(t, 1, 'zz-grunt'), ti]]);
    resolveCombat(t);
    expect(names(t, 1)).toEqual([]);
    expect(t.players[1].spire).toBe(20 - (6 - 2)); // 6 power into a 2-health blocker: 4 excess
  });

  it('ember-overdrive: an ally gets +2|+0 this round, then it fades', () => {
    const s = board({ hand: [['ember-overdrive'], []], line: [['zz-grunt'], []] });
    const g = unit(s, 0, 'zz-grunt');
    play(s, 'ember-overdrive', [g.iid]);
    expect(st(s, g).power).toBe(4);
    pass(s); pass(s);
    expect(st(s, g).power).toBe(2);
  });

  it('ember-pinprick: deals 1 to an enemy unit or the enemy Spire', () => {
    const s = board({ hand: [['ember-pinprick', 'ember-pinprick'], []], line: [[], ['zz-wall']] });
    const w = unit(s, 1, 'zz-wall');
    play(s, 'ember-pinprick', [w.iid]);
    play(s, 'ember-pinprick', ['spire1']);
    expect(w.dmg).toBe(1);
    expect(s.players[1].spire).toBe(19);
  });

  it('ember-ventburst: deals 2 to an enemy unit and 1 to the enemy Spire', () => {
    const s = board({ hand: [['ember-ventburst'], []], line: [[], ['zz-wall']] });
    const w = unit(s, 1, 'zz-wall');
    play(s, 'ember-ventburst', [w.iid]);
    expect(w.dmg).toBe(2);
    expect(s.players[1].spire).toBe(19);
  });

  it('ember-slagbolt: deals 3 to an enemy unit', () => {
    const s = board({ hand: [['ember-slagbolt'], []], line: [[], ['zz-wall']] });
    const w = unit(s, 1, 'zz-wall');
    play(s, 'ember-slagbolt', [w.iid]);
    pass(s);
    expect(w.dmg).toBe(3);
  });

  it('ember-scrapburst: destroys an ally and deals 3 to the enemy Spire; only an ally can be chosen', () => {
    const s = board({ hand: [['ember-scrapburst'], []], line: [['zz-grunt'], ['zz-grunt']] });
    const hand = s.players[0].hand[0].iid;
    const bad = applyAction(s, { type: 'play', iid: hand, targets: [unit(s, 1, 'zz-grunt').iid] });
    expect(bad.ok).toBe(false);
    expect(s.players[1].spire).toBe(20);
    play(s, 'ember-scrapburst', [unit(s, 0, 'zz-grunt').iid]);
    pass(s);
    expect(names(s, 0)).toEqual([]);
    expect(names(s, 1)).toEqual(['zz-grunt']);
    expect(s.players[1].spire).toBe(17);
  });

  it('ember-heatlance: deals 3 to an enemy unit or the enemy Spire', () => {
    const s = board({ hand: [['ember-heatlance'], []], line: [[], ['zz-wall']] });
    play(s, 'ember-heatlance', ['spire1']);
    pass(s);
    expect(s.players[1].spire).toBe(17);
    expect(unit(s, 1, 'zz-wall').dmg).toBe(0);
    const t = board({ hand: [['ember-heatlance'], []], line: [[], ['zz-wall']] });
    play(t, 'ember-heatlance', [unit(t, 1, 'zz-wall').iid]);
    pass(t);
    expect(unit(t, 1, 'zz-wall').dmg).toBe(3);
    expect(t.players[1].spire).toBe(20);
  });

  it('ember-cinderhail: deals 2 to every enemy unit', () => {
    const s = board({ hand: [['ember-cinderhail'], []], line: [[], ['zz-grunt', 'zz-ogre']] });
    play(s, 'ember-cinderhail');
    pass(s);
    expect(names(s, 1)).toEqual(['zz-ogre']);
    expect(unit(s, 1, 'zz-ogre').dmg).toBe(2);
  });

  it('ember-sparkcascade: summons exactly 2 Sparkbots, exactly 4 when Resonant', () => {
    const s = board({ hand: [['ember-sparkcascade'], []], line: [['ember-kessa'], []] });
    play(s, 'ember-sparkcascade');
    pass(s);
    expect(names(s, 0).filter((c) => c === 'ember-sparkbot').length).toBe(2);
    const t = board({ hand: [['ember-sparkcascade'], []], line: [['ember-kessa'], []] });
    resonant(t);
    play(t, 'ember-sparkcascade');
    pass(t);
    expect(names(t, 0).filter((c) => c === 'ember-sparkbot').length).toBe(4); // 1 + 4 = 5, under the Line cap
  });

  it('ember-firestorm: deals 3 to every enemy unit and 2 to the enemy Spire', () => {
    const s = board({ hand: [['ember-firestorm'], []], line: [[], ['zz-grunt', 'zz-ogre']] });
    play(s, 'ember-firestorm');
    pass(s);
    expect(names(s, 1)).toEqual(['zz-ogre']);
    expect(unit(s, 1, 'zz-ogre').dmg).toBe(3);
    expect(s.players[1].spire).toBe(18);
  });
});

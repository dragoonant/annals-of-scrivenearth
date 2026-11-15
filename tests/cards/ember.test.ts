import { describe, expect, it } from 'vitest';
import { attack, board, pass, play, resolveCombat, st, unit } from '../helpers';
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

  it('ember-fuseguard: Shatter deals 2 to a random enemy unit', () => {
    const s = board({ first: 1, hand: [[], ['zz-bolt']], line: [['ember-fuseguard'], ['zz-wall']] });
    play(s, 'zz-bolt', [unit(s, 0, 'ember-fuseguard').iid]);
    pass(s);
    expect(names(s, 0)).toEqual([]);
    expect(unit(s, 1, 'zz-wall').dmg).toBe(2);
  });

  it('ember-furnacebrute: Vanguard, and Resonant gives +1|+1', () => {
    const s = board({ line: [['ember-furnacebrute', 'ember-kessa'], []] });
    const b = unit(s, 0, 'ember-furnacebrute');
    expect(st(s, b)).toMatchObject({ power: 3, health: 3 });
    expect(st(s, b).keywords).toContain('vanguard');
    resonant(s);
    expect(st(s, b)).toMatchObject({ power: 4, health: 4 });
  });

  it('ember-arcwelder: Deploy deals 2 to an enemy unit, 3 when Resonant', () => {
    const s = board({ hand: [['ember-arcwelder', 'ember-arcwelder'], []], line: [['ember-kessa'], ['zz-ogre']] });
    const o = unit(s, 1, 'zz-ogre');
    play(s, 'ember-arcwelder', [o.iid]);
    expect(o.dmg).toBe(2);
    pass(s);
    resonant(s);
    play(s, 'ember-arcwelder', [o.iid]);
    // 2 + 3 more = the 5-health Ogre is destroyed (it would survive at 4 without the Resonant bonus)
    expect(names(s, 1)).toEqual([]);
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

  it('ember-foundrytitan: Pierce, and Deploy deals 2 to every enemy unit', () => {
    const s = board({ hand: [['ember-foundrytitan'], []], line: [[], ['zz-grunt', 'zz-wall']] });
    play(s, 'ember-foundrytitan');
    expect(names(s, 1)).toEqual(['zz-wall']);
    expect(unit(s, 1, 'zz-wall').dmg).toBe(2);
    expect(st(s, unit(s, 0, 'ember-foundrytitan')).keywords).toContain('pierce');
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

  it('ember-scrapburst: destroys an ally and deals 3 to the enemy Spire', () => {
    const s = board({ hand: [['ember-scrapburst'], []], line: [['zz-grunt'], []] });
    play(s, 'ember-scrapburst', [unit(s, 0, 'zz-grunt').iid]);
    pass(s);
    expect(names(s, 0)).toEqual([]);
    expect(s.players[1].spire).toBe(17);
  });

  it('ember-heatlance: deals 3 to an enemy unit or the enemy Spire', () => {
    const s = board({ hand: [['ember-heatlance'], []] });
    play(s, 'ember-heatlance', ['spire1']);
    pass(s);
    expect(s.players[1].spire).toBe(17);
  });

  it('ember-cinderhail: deals 2 to every enemy unit', () => {
    const s = board({ hand: [['ember-cinderhail'], []], line: [[], ['zz-grunt', 'zz-ogre']] });
    play(s, 'ember-cinderhail');
    pass(s);
    expect(names(s, 1)).toEqual(['zz-ogre']);
    expect(unit(s, 1, 'zz-ogre').dmg).toBe(2);
  });

  it('ember-sparkcascade: summons 2 Sparkbots, 4 when Resonant', () => {
    const s = board({ hand: [['ember-sparkcascade', 'ember-sparkcascade'], []], line: [['ember-kessa'], []] });
    play(s, 'ember-sparkcascade');
    pass(s);
    expect(names(s, 0).filter((c) => c === 'ember-sparkbot').length).toBe(2);
    pass(s); // seat 1 had priority after the stack
    resonant(s);
    play(s, 'ember-sparkcascade');
    pass(s);
    expect(names(s, 0).filter((c) => c === 'ember-sparkbot').length).toBe(5); // line cap: 6 units
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

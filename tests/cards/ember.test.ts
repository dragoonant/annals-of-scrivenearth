import { describe, expect, it } from 'vitest';
import { act, applyAction, attack, board, kinds, pass, play, resolveCombat, st, unit } from '../helpers';
import type { GameState } from '../../src/engine/types';
import { face, isAscended } from '../../src/engine/query';

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

  // ---------- base set, second wave ----------
  it('ember-torva: Vanguard Dueler; each strike gives +0|+1', () => {
    const s = board({ line: [['ember-torva'], ['zz-grunt', 'zz-wall']] });
    s.players[0].heroes = ['ember-torva'];
    const t = unit(s, 0, 'ember-torva');
    act(s, { type: 'declare', unit: t.iid, duel: unit(s, 1, 'zz-grunt').iid }); // Dueler forces the grunt to block
    act(s, { type: 'attack' });
    if (s.phase === 'block') act(s, { type: 'blocks' });
    resolveCombat(s);
    expect(s.players[1].line.map((u) => u.card)).toEqual(['zz-wall']); // Vanguard: the grunt died before striking back
    expect(t.dmg).toBe(0);
    expect(st(s, t)).toMatchObject({ power: 2, health: 4 });
    expect(t.seen.strikes).toBe(1);
    expect(isAscended(s, 0, 'ember-torva')).toBe(false);
  });

  it('ember-torva: ascends on its 5th strike, strikes every enemy unit, and each strike then burns the Spire', () => {
    const s = board({ line: [['ember-torva'], ['zz-grunt', 'zz-wall']] });
    s.players[0].heroes = ['ember-torva'];
    const t = unit(s, 0, 'ember-torva');
    t.seen.strikes = 4;
    t.dmg = 2;
    attack(s, [t]); // unblocked: strikes the Spire for 2 (5th strike)
    resolveCombat(s);
    expect(isAscended(s, 0, 'ember-torva')).toBe(true);
    expect(face(s, 0, 'ember-torva').name).toBe('Torva, Pit Sovereign');
    expect(t.dmg).toBe(0); // R-H5 repaired
    expect(s.players[1].line.map((u) => u.card)).toEqual(['zz-wall']); // Ascend: 4 to the grunt and the wall
    expect(unit(s, 1, 'zz-wall').dmg).toBe(4);
    expect(s.players[1].spire).toBe(20 - 2 - 2); // one Spire point per Ascend strike
    expect(st(s, t)).toMatchObject({ power: 4, health: 6 }); // 4|5 plus the +0|+1 from the 5th strike
    expect(kinds(s)).toContain('ascend');
  });

  it('ember-yarrow: Dawn gains 1 Reserve; ascends at 30 Charge spent and gains 4 Charge', () => {
    const s = board({ charge: 0, line: [['ember-yarrow'], []] });
    s.players[0].heroes = ['ember-yarrow'];
    pass(s); pass(s); // round 2: 1 Charge, no Reserve banked, then Dawn
    expect(s.players[0].reserve).toBe(1);
    expect(s.players[0].charge).toBe(1);
    const t = board({ hand: [['zz-pump'], []], line: [['ember-yarrow'], []] });
    t.players[0].heroes = ['ember-yarrow'];
    t.players[0].seen.chargeSpent = 29;
    play(t, 'zz-pump', [unit(t, 0, 'ember-yarrow').iid]);
    expect(isAscended(t, 0, 'ember-yarrow')).toBe(true);
    expect(t.players[0].charge).toBe(10 - 1 + 4);
  });

  it('ember-yarrow ascended: Dawn gains 1 Reserve, then Charge equal to the Reserve', () => {
    const s = board({ charge: 0, line: [['ember-yarrow'], []] });
    s.players[0].heroes = ['ember-yarrow'];
    s.players[0].ascended = ['ember-yarrow'];
    s.players[0].reserve = 1;
    pass(s); pass(s); // round 2: 1 Charge; Reserve 1 + 1 = 2; Charge 1 + 2
    expect(s.players[0].reserve).toBe(2);
    expect(s.players[0].charge).toBe(3);
  });

  it('ember-valvetapper: Deploy gains 1 Reserve', () => {
    const s = board({ hand: [['ember-valvetapper'], []] });
    play(s, 'ember-valvetapper');
    expect(s.players[0].reserve).toBe(1);
    expect(s.players[0].charge).toBe(9);
  });

  it('ember-ringcrier: Deploy gives an ally Vanguard for good', () => {
    const s = board({ hand: [['ember-ringcrier'], []], line: [['zz-grunt'], []] });
    const g = unit(s, 0, 'zz-grunt');
    expect(st(s, g).keywords).not.toContain('vanguard');
    play(s, 'ember-ringcrier', [g.iid]);
    expect(st(s, g).keywords).toContain('vanguard');
    pass(s); pass(s);
    expect(st(s, g).keywords).toContain('vanguard');
  });

  it('ember-flarebot: Shatter gains 1 Reserve; Unstable destroys it at the end of the round', () => {
    const s = board({ first: 1, hand: [[], ['zz-bolt']], line: [['ember-flarebot'], []] });
    play(s, 'zz-bolt', [unit(s, 0, 'ember-flarebot').iid]);
    pass(s);
    expect(names(s, 0)).toEqual([]);
    expect(s.players[0].reserve).toBe(1);
    const t = board({ line: [['ember-flarebot'], []] });
    pass(t); pass(t);
    expect(names(t, 0)).toEqual([]);
  });

  it('ember-pitbrawler: Dueler forces a chosen enemy to block it', () => {
    const s = board({ line: [['ember-pitbrawler'], ['zz-wall', 'zz-grunt']] });
    const b = unit(s, 0, 'ember-pitbrawler');
    act(s, { type: 'declare', unit: b.iid, duel: unit(s, 1, 'zz-wall').iid });
    act(s, { type: 'attack' });
    if (s.phase === 'block') act(s, { type: 'blocks' }); // the grunt stays home
    resolveCombat(s);
    expect(unit(s, 1, 'zz-wall').dmg).toBe(3);
    expect(s.players[1].spire).toBe(20);
  });

  it('ember-gaugewatcher: Dawn deals 1 to the enemy Spire only with 2+ Reserve', () => {
    const s = board({ line: [['ember-gaugewatcher'], []] });
    pass(s); pass(s); // 10 unspent Charge banks as 3 Reserve
    expect(s.players[0].reserve).toBe(3);
    expect(s.players[1].spire).toBe(19);
    const t = board({ charge: 0, reserve: 1, line: [['ember-gaugewatcher'], []] });
    pass(t); pass(t);
    expect(t.players[0].reserve).toBe(1);
    expect(t.players[1].spire).toBe(20);
  });

  it('ember-scrapreclaimer: another ally being destroyed gains 1 Charge', () => {
    const s = board({ hand: [['ember-scrapburst'], []], line: [['ember-scrapreclaimer', 'zz-grunt'], []] });
    play(s, 'ember-scrapburst', [unit(s, 0, 'zz-grunt').iid]);
    pass(s);
    expect(names(s, 0)).toEqual(['ember-scrapreclaimer']);
    expect(s.players[0].charge).toBe(10 - 2 + 1);
  });

  it('ember-pitpromoter: Deploy makes an ally and an enemy unit strike each other', () => {
    const s = board({ hand: [['ember-pitpromoter'], []], line: [['zz-ogre'], ['zz-grunt']] });
    const o = unit(s, 0, 'zz-ogre');
    play(s, 'ember-pitpromoter', [o.iid, unit(s, 1, 'zz-grunt').iid]);
    expect(names(s, 1)).toEqual([]);
    expect(o.dmg).toBe(2);
    expect(o.seen.strikes).toBe(1);
  });

  it('ember-rivethurler: Deploy deals 1 per other ally, at most 4', () => {
    const s = board({ hand: [['ember-rivethurler'], []], line: [['zz-grunt', 'zz-grunt'], ['zz-wall']] });
    const w = unit(s, 1, 'zz-wall');
    play(s, 'ember-rivethurler', [w.iid]);
    expect(w.dmg).toBe(2);
    const t = board({ hand: [['ember-rivethurler'], []], line: [['zz-grunt', 'zz-grunt', 'zz-grunt', 'zz-grunt', 'zz-grunt'], ['zz-wall']] });
    const x = unit(t, 1, 'zz-wall');
    play(t, 'ember-rivethurler', [x.iid]);
    expect(x.dmg).toBe(4);
  });

  it('ember-meltdowngolem: Deploy deals 2 to an enemy unit; Unstable destroys it at the end of the round', () => {
    const s = board({ hand: [['ember-meltdowngolem'], []], line: [[], ['zz-wall']] });
    const w = unit(s, 1, 'zz-wall');
    play(s, 'ember-meltdowngolem', [w.iid]);
    expect(w.dmg).toBe(2);
    pass(s); pass(s);
    expect(names(s, 0)).toEqual([]);
  });

  it('ember-slaggladiator: Vanguard, +1|+0 per strike; Resonant gives Dueler', () => {
    const s = board({ line: [['ember-slaggladiator'], ['zz-grunt']] });
    const g = unit(s, 0, 'ember-slaggladiator');
    attack(s, [g], [[unit(s, 1, 'zz-grunt'), g]]);
    resolveCombat(s);
    expect(names(s, 1)).toEqual([]);
    expect(g.dmg).toBe(0);
    expect(st(s, g).power).toBe(4);
    expect(st(s, g).keywords).not.toContain('dueler');
    const t = board({ line: [['ember-slaggladiator', 'ember-kessa'], []] });
    resonant(t);
    expect(st(t, unit(t, 0, 'ember-slaggladiator')).keywords).toContain('dueler');
  });

  it('ember-steamcondenser: casting a glyph gains 1 Reserve', () => {
    const s = board({ hand: [['zz-pump'], []], line: [['ember-steamcondenser'], []] });
    play(s, 'zz-pump', [unit(s, 0, 'ember-steamcondenser').iid]);
    expect(s.players[0].reserve).toBe(1);
  });

  it('ember-pitboss: Deploy gives a Vanguard ally +2|+1 and it strikes an enemy unit', () => {
    const s = board({ hand: [['ember-pitboss'], []], line: [['zz-vanguard', 'zz-grunt'], ['zz-wall']] });
    const v = unit(s, 0, 'zz-vanguard');
    const bad = applyAction(s, { type: 'play', iid: s.players[0].hand[0].iid, targets: [unit(s, 0, 'zz-grunt').iid, unit(s, 1, 'zz-wall').iid] });
    expect(bad.ok).toBe(false); // only an ally with Vanguard
    play(s, 'ember-pitboss', [v.iid, unit(s, 1, 'zz-wall').iid]);
    expect(st(s, v)).toMatchObject({ power: 5, health: 4 });
    expect(unit(s, 1, 'zz-wall').dmg).toBe(5);
    expect(v.dmg).toBe(0); // one-way strike
  });

  it('ember-forgemarshal: allies with Vanguard have +1|+1; Resonant gives them Pierce', () => {
    const s = board({ line: [['ember-forgemarshal', 'zz-vanguard', 'zz-grunt', 'ember-kessa'], []] });
    const v = unit(s, 0, 'zz-vanguard');
    expect(st(s, v)).toMatchObject({ power: 4, health: 4 });
    expect(st(s, unit(s, 0, 'zz-grunt'))).toMatchObject({ power: 2, health: 2 });
    expect(st(s, v).keywords).not.toContain('pierce');
    resonant(s);
    expect(st(s, v).keywords).toContain('pierce');
    expect(st(s, unit(s, 0, 'zz-grunt')).keywords).not.toContain('pierce');
  });

  it('ember-boilercolossus: Deploy gains 3 Charge; Pierce', () => {
    const s = board({ hand: [['ember-boilercolossus'], []] });
    play(s, 'ember-boilercolossus');
    expect(s.players[0].charge).toBe(10 - 8 + 3);
    expect(st(s, unit(s, 0, 'ember-boilercolossus')).keywords).toContain('pierce');
  });

  it('ember-stoketheboiler: destroys an ally with Unstable and gains 2 Charge', () => {
    const s = board({ hand: [['ember-stoketheboiler'], []], line: [['zz-unstable', 'zz-grunt'], []] });
    const bad = applyAction(s, { type: 'play', iid: s.players[0].hand[0].iid, targets: [unit(s, 0, 'zz-grunt').iid] });
    expect(bad.ok).toBe(false);
    play(s, 'ember-stoketheboiler', [unit(s, 0, 'zz-unstable').iid]);
    expect(names(s, 0)).toEqual(['zz-grunt']);
    expect(s.players[0].charge).toBe(10 - 1 + 2);
  });

  it('ember-hotrivets: a Vanguard ally gets +2|+2 this round; Resonant adds Pierce this round', () => {
    const s = board({ hand: [['ember-hotrivets'], []], line: [['zz-vanguard', 'ember-kessa'], []] });
    const v = unit(s, 0, 'zz-vanguard');
    play(s, 'ember-hotrivets', [v.iid]);
    expect(st(s, v)).toMatchObject({ power: 5, health: 5 });
    expect(st(s, v).keywords).not.toContain('pierce');
    pass(s); pass(s);
    expect(st(s, v)).toMatchObject({ power: 3, health: 3 });
    const t = board({ hand: [['ember-hotrivets'], []], line: [['zz-vanguard', 'ember-kessa'], []] });
    resonant(t);
    const w = unit(t, 0, 'zz-vanguard');
    play(t, 'ember-hotrivets', [w.iid]);
    expect(st(t, w).keywords).toContain('pierce');
  });

  it('ember-cheapshot: an ally in combat strikes an enemy in combat before the strikes', () => {
    const s = board({ hand: [['ember-cheapshot'], []], line: [['zz-ogre'], ['zz-grunt']] });
    const o = unit(s, 0, 'zz-ogre');
    attack(s, [o], [[unit(s, 1, 'zz-grunt'), o]]);
    play(s, 'ember-cheapshot', [o.iid, unit(s, 1, 'zz-grunt').iid]);
    expect(names(s, 1)).toEqual([]); // flash: the blocker is gone at once
    resolveCombat(s);
    expect(o.dmg).toBe(0); // it never struck back
    expect(o.seen.strikes).toBe(1);
  });

  it('ember-shrapneltoss: deals an Unstable ally\'s power to an enemy unit, then destroys the ally', () => {
    const s = board({ hand: [['ember-shrapneltoss'], []], line: [['zz-unstable'], ['zz-wall']] });
    play(s, 'ember-shrapneltoss', [unit(s, 0, 'zz-unstable').iid, unit(s, 1, 'zz-wall').iid]);
    pass(s);
    expect(names(s, 0)).toEqual([]);
    expect(unit(s, 1, 'zz-wall').dmg).toBe(3);
  });

  it('ember-sparkgap: deals 2 to an enemy unit and summons a Sparkbot', () => {
    const s = board({ hand: [['ember-sparkgap'], []], line: [[], ['zz-wall']] });
    play(s, 'ember-sparkgap', [unit(s, 1, 'zz-wall').iid]);
    pass(s);
    expect(unit(s, 1, 'zz-wall').dmg).toBe(2);
    expect(names(s, 0)).toEqual(['ember-sparkbot']);
  });

  it('ember-clearthering: a Vanguard ally strikes each enemy unit with 2 or less power', () => {
    const s = board({ hand: [['ember-clearthering'], []], line: [['zz-vanguard'], ['zz-grunt', 'zz-wall', 'zz-ogre']] });
    const v = unit(s, 0, 'zz-vanguard');
    play(s, 'ember-clearthering', [v.iid]);
    pass(s);
    expect(names(s, 1)).toEqual(['zz-wall', 'zz-ogre']);
    expect(unit(s, 1, 'zz-wall').dmg).toBe(3);
    expect(unit(s, 1, 'zz-ogre').dmg).toBe(0);
    expect(v.dmg).toBe(0);
    expect(v.seen.strikes).toBe(2);
  });

  it('ember-overpressure: deals 4 to an enemy unit or the enemy Spire and gains 3 Charge', () => {
    const s = board({ hand: [['ember-overpressure'], []], line: [[], ['zz-wall']] });
    play(s, 'ember-overpressure', ['spire1']);
    pass(s);
    expect(s.players[1].spire).toBe(16);
    expect(s.players[0].charge).toBe(10 - 6 + 3);
    const t = board({ hand: [['ember-overpressure'], []], line: [[], ['zz-wall']] });
    play(t, 'ember-overpressure', [unit(t, 1, 'zz-wall').iid]);
    pass(t);
    expect(unit(t, 1, 'zz-wall').dmg).toBe(4);
  });

  it('ember-titlebout: a Vanguard ally gets +1|+1 and you may attack again this round', () => {
    const s = board({ hand: [['ember-titlebout'], []], line: [['zz-vanguard'], []] });
    const v = unit(s, 0, 'zz-vanguard');
    play(s, 'ember-titlebout', [v.iid]);
    pass(s); // resolves; seat 1 has priority
    pass(s);
    expect(st(s, v)).toMatchObject({ power: 4, health: 4 });
    attack(s, [v]);
    resolveCombat(s);
    pass(s); // defender
    expect(s.players[0].canAttack).toBe(true);
    attack(s, [v]);
    resolveCombat(s);
    expect(s.players[1].spire).toBe(20 - 4 - 4);
  });

  it('ember-moltentorrent: deals 2 to every enemy unit, then 3 more to the chosen one', () => {
    const s = board({ hand: [['ember-moltentorrent'], []], line: [[], ['zz-grunt', 'zz-wall', 'zz-ogre']] });
    play(s, 'ember-moltentorrent', [unit(s, 1, 'zz-wall').iid]);
    pass(s);
    expect(names(s, 1)).toEqual(['zz-wall', 'zz-ogre']);
    expect(unit(s, 1, 'zz-wall').dmg).toBe(5);
    expect(unit(s, 1, 'zz-ogre').dmg).toBe(2);
  });
});

// ---------- set x1: The Mirror Quarter ----------
describe('ember x1 cards', () => {
  const inHand = (s: GameState, seat: 0 | 1, card: string) => s.players[seat].hand.filter((h) => h.card === card);
  const nextRound = (s: GameState): void => { const r = s.round; let g = 0; while (s.round === r && g++ < 6) pass(s); };

  it('ember-oriel: Dawn creates a Glimmer Cullet Spark; ascends at 8 Glimmer plays, copies each other ally (Glimmer) and gains 2 Charge', () => {
    const s = board({ line: [['ember-oriel', 'ember-ashrunner', 'zz-grunt'], ['zz-wall']] });
    s.players[0].heroes = ['ember-oriel'];
    nextRound(s);
    expect(inHand(s, 0, 'ember-culletspark')).toMatchObject([{ glimmer: true }]);
    s.players[0].seen.glimmerPlayed = 7;
    expect(isAscended(s, 0, 'ember-oriel')).toBe(false);
    pass(s); // seat 1 holds the Initiative in round 2
    const w = unit(s, 1, 'zz-wall');
    play(s, 'ember-culletspark', [w.iid]); // the 8th Glimmer card
    expect(isAscended(s, 0, 'ember-oriel')).toBe(true);
    expect(face(s, 0, 'ember-oriel').name).toBe('Oriel, Glassfire Unbound');
    expect(inHand(s, 0, 'ember-ashrunner')).toMatchObject([{ glimmer: true }]);
    expect(inHand(s, 0, 'zz-grunt')).toHaveLength(0); // a token cannot be copied
    expect(kinds(s)).toContain('copyToken');
    expect(s.players[0].charge).toBe(10 + 2); // the Spark was paid from Reserve (R-C2)
    expect(st(s, unit(s, 0, 'ember-oriel'))).toMatchObject({ power: 4, health: 5 });
    expect(w.dmg).toBe(1);
    nextRound(s);
    expect(inHand(s, 0, 'ember-culletspark').filter((h) => h.glimmer)).toHaveLength(2); // the old ones faded; Dawn made 2
  });

  it('ember-baublebot: Unstable; when it is destroyed a Glimmer Bauble Bot goes to your hand and lasts the next round', () => {
    const s = board({ line: [['ember-baublebot'], []] });
    nextRound(s);
    expect(names(s, 0)).toEqual([]);
    expect(inHand(s, 0, 'ember-baublebot')).toMatchObject([{ glimmer: true }]);
    pass(s); // seat 1 acts first in round 2
    play(s, 'ember-baublebot');
    expect(names(s, 0)).toEqual(['ember-baublebot']);
    expect(s.players[0].seen.glimmerPlayed).toBe(1);
  });

  it('ember-gafferapprentice: Deploy creates a Glimmer Cullet Spark that Reprises', () => {
    const s = board({ hand: [['ember-gafferapprentice'], []], line: [[], ['zz-wall']] });
    play(s, 'ember-gafferapprentice');
    expect(inHand(s, 0, 'ember-culletspark')).toMatchObject([{ glimmer: true }]);
    pass(s);
    const w = unit(s, 1, 'zz-wall');
    play(s, 'ember-culletspark', [w.iid]);
    play(s, 'ember-culletspark', [w.iid]); // the Reprise copy
    expect(w.dmg).toBe(2);
    expect(s.players[0].seen.glimmerPlayed).toBe(2);
  });

  it('ember-smokedlookout: Veiled against enemy targets; Strike creates a Glimmer Pinprick', () => {
    const t = board({ hand: [[], ['zz-zap']], line: [['ember-smokedlookout'], []], first: 1 });
    const zap = t.players[1].hand[0].iid;
    expect(applyAction(t, { type: 'play', iid: zap, targets: [unit(t, 0, 'ember-smokedlookout').iid] }).ok).toBe(false);
    const s = board({ line: [['ember-smokedlookout'], ['zz-wall']] });
    const l = unit(s, 0, 'ember-smokedlookout');
    attack(s, [l], [[unit(s, 1, 'zz-wall'), l]]);
    resolveCombat(s);
    expect(inHand(s, 0, 'ember-pinprick')).toMatchObject([{ glimmer: true }]);
    expect(st(s, l).keywords).not.toContain('veiled');
  });

  it('ember-reflectorkiln: when the opponent casts a glyph, a Glimmer Slag Bolt goes to your hand', () => {
    const s = board({ hand: [['zz-zap'], ['zz-zap']], line: [['ember-reflectorkiln'], ['ember-reflectorkiln']] });
    play(s, 'zz-zap', [unit(s, 1, 'ember-reflectorkiln').iid]);
    expect(inHand(s, 1, 'ember-slagbolt')).toMatchObject([{ glimmer: true }]);
    expect(inHand(s, 0, 'ember-slagbolt')).toHaveLength(0); // only the opponent's glyphs
  });

  it('ember-lampworklancer: Vanguard; Strike creates a Glimmer Cullet Spark; Resonant gives +1|+1', () => {
    const s = board({ line: [['ember-lampworklancer'], ['zz-grunt']] });
    const l = unit(s, 0, 'ember-lampworklancer');
    attack(s, [l], [[unit(s, 1, 'zz-grunt'), l]]);
    resolveCombat(s);
    expect(names(s, 1)).toEqual([]);
    expect(l.dmg).toBe(0); // Vanguard: the blocker died first
    expect(inHand(s, 0, 'ember-culletspark')).toMatchObject([{ glimmer: true }]);
    const t = board({ line: [['ember-lampworklancer', 'ember-kessa'], []] });
    expect(st(t, unit(t, 0, 'ember-lampworklancer'))).toMatchObject({ power: 3, health: 2 });
    resonant(t);
    expect(st(t, unit(t, 0, 'ember-lampworklancer'))).toMatchObject({ power: 4, health: 3 });
  });

  it('ember-mouldkeeper: when another ally is destroyed, a Glimmer copy of it goes to your hand', () => {
    const s = board({ first: 1, hand: [[], ['zz-bolt']], line: [['ember-mouldkeeper', 'ember-kilnhand'], []] });
    play(s, 'zz-bolt', [unit(s, 0, 'ember-kilnhand').iid]);
    pass(s);
    expect(names(s, 0)).toEqual(['ember-mouldkeeper']);
    expect(inHand(s, 0, 'ember-kilnhand')).toMatchObject([{ glimmer: true }]);
    expect(s.players[0].seen.copiesMade).toBe(1);
  });

  it('ember-lehrforeman: Deploy creates a Glimmer Cullet Spark; Dusk deals 2 to every enemy unit after 2+ Glimmer plays this round', () => {
    const s = board({ hand: [['ember-lehrforeman'], []], line: [[], ['zz-wall', 'zz-grunt']] });
    play(s, 'ember-lehrforeman');
    pass(s);
    const w = unit(s, 1, 'zz-wall');
    play(s, 'ember-culletspark', [w.iid]);
    play(s, 'ember-culletspark', [w.iid]);
    expect(w.dmg).toBe(2);
    nextRound(s);
    expect(w.dmg).toBe(4);
    expect(names(s, 1)).toEqual(['zz-wall']);
    const t = board({ hand: [['ember-lehrforeman'], []], line: [[], ['zz-wall']] });
    play(t, 'ember-lehrforeman');
    pass(t);
    play(t, 'ember-culletspark', [unit(t, 1, 'zz-wall').iid]); // only 1 Glimmer card played
    nextRound(t);
    expect(unit(t, 1, 'zz-wall').dmg).toBe(1);
  });

  it('ember-glasscolossus: Deploy deals 2 to every enemy unit; Unstable, and a Glimmer copy of it is left in hand', () => {
    const s = board({ hand: [['ember-glasscolossus'], []], line: [[], ['zz-wall', 'zz-grunt']] });
    play(s, 'ember-glasscolossus');
    expect(names(s, 1)).toEqual(['zz-wall']);
    expect(unit(s, 1, 'zz-wall').dmg).toBe(2);
    nextRound(s);
    expect(names(s, 0)).toEqual([]);
    expect(inHand(s, 0, 'ember-glasscolossus')).toMatchObject([{ glimmer: true }]);
  });

  it('ember-culletspark: Reprise deals 1 to an enemy unit twice, the copy only once', () => {
    const s = board({ hand: [['ember-culletspark'], []], line: [[], ['zz-wall']] });
    const w = unit(s, 1, 'zz-wall');
    play(s, 'ember-culletspark', [w.iid]);
    expect(w.dmg).toBe(1);
    expect(inHand(s, 0, 'ember-culletspark')).toMatchObject([{ glimmer: true, plain: true }]);
    play(s, 'ember-culletspark', [w.iid]);
    expect(w.dmg).toBe(2);
    expect(inHand(s, 0, 'ember-culletspark')).toHaveLength(0);
  });

  it('ember-twingather: an ally gets +2|+0 this round and a Glimmer copy of it goes to your hand', () => {
    const s = board({ hand: [['ember-twingather'], []], line: [['ember-ashrunner'], []] });
    const a = unit(s, 0, 'ember-ashrunner');
    play(s, 'ember-twingather', [a.iid]);
    expect(st(s, a).power).toBe(4);
    expect(inHand(s, 0, 'ember-ashrunner')).toMatchObject([{ glimmer: true }]);
    nextRound(s);
    expect(st(s, a).power).toBe(2);
    expect(inHand(s, 0, 'ember-ashrunner')).toHaveLength(0); // the Glimmer copy faded
  });

  it('ember-blowpipeflare: Reprise deals 2 to the enemy Spire, then the copy deals 2 to a unit', () => {
    const s = board({ hand: [['ember-blowpipeflare'], []], line: [[], ['zz-wall']] });
    play(s, 'ember-blowpipeflare', ['spire1']);
    pass(s);
    expect(s.players[1].spire).toBe(18);
    expect(inHand(s, 0, 'ember-blowpipeflare')).toMatchObject([{ glimmer: true, plain: true }]);
    pass(s); // seat 1 hands priority back
    play(s, 'ember-blowpipeflare', [unit(s, 1, 'zz-wall').iid]);
    pass(s);
    expect(unit(s, 1, 'zz-wall').dmg).toBe(2);
    expect(inHand(s, 0, 'ember-blowpipeflare')).toHaveLength(0);
  });

  it('ember-paneburst: deals 3 to an enemy unit and creates a Glimmer Cullet Spark; Resonant creates 2', () => {
    const s = board({ hand: [['ember-paneburst'], []], line: [[], ['zz-wall']] });
    play(s, 'ember-paneburst', [unit(s, 1, 'zz-wall').iid]);
    pass(s);
    expect(unit(s, 1, 'zz-wall').dmg).toBe(3);
    expect(inHand(s, 0, 'ember-culletspark')).toMatchObject([{ glimmer: true }]);
    const t = board({ hand: [['ember-paneburst'], []], line: [['ember-kessa'], ['zz-wall']] });
    resonant(t);
    play(t, 'ember-paneburst', [unit(t, 1, 'zz-wall').iid]);
    pass(t);
    expect(inHand(t, 0, 'ember-culletspark')).toHaveLength(2);
  });

  it('ember-shardshower: Reprise deals 1 to every enemy unit and 1 to the enemy Spire', () => {
    const s = board({ hand: [['ember-shardshower'], []], line: [[], ['zz-wall', 'zz-grunt']] });
    play(s, 'ember-shardshower');
    pass(s);
    expect(unit(s, 1, 'zz-wall').dmg).toBe(1);
    expect(unit(s, 1, 'zz-grunt').dmg).toBe(1);
    expect(s.players[1].spire).toBe(19);
    expect(inHand(s, 0, 'ember-shardshower')).toMatchObject([{ glimmer: true, plain: true }]);
  });
});

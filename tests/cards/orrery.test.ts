// One behaviour test per Orrery Conclave card (set x2). Test names start with the card id.
// Chart decks: the opening hand and the round-1 draw come off the top before board() replaces the hand, so five
// fillers (OPEN) sit on top of every test deck. Top of the deck is the END of the list. zz-filler is a 10-cost unit,
// so a unit Chart uses zz-rite (a glyph) as its miss and a glyph Chart uses zz-grunt (a unit).
import { describe, expect, it } from 'vitest';
import { attack, board, pass, play, resolveCombat, st, unit } from '../helpers';
import { costOf, isAscended } from '../../src/engine/query';

type G = ReturnType<typeof board>;
const OPEN = ['zz-filler', 'zz-filler', 'zz-filler', 'zz-filler', 'zz-filler'];
const endRound = (s: G): void => { pass(s); pass(s); };
const hand = (s: G, seat: 0 | 1 = 0): string[] => s.players[seat].hand.map((h) => h.card);
const onLine = (s: G, seat: 0 | 1, card: string) => s.players[seat].line.filter((u) => u.card === card);
/** Put an Ascended hero on seat 0's Line so Resonant holds. */
const resonate = (s: G): void => { s.players[0].ascended = ['orrery-vessaly']; };

describe('orrery cards', () => {
  // ---------- heroes ----------
  it('orrery-vessaly: Dawn Charts a glyph (3); the 5th charted card ascends her, she draws 2 and then Charts a unit and a glyph each Dawn', () => {
    const s = board({
      line: [['orrery-vessaly'], []],
      deck: [['zz-rite', 'zz-grunt', 'zz-grunt', 'zz-grunt', 'zz-zap', 'zz-grunt', 'zz-grunt', 'zz-grunt', ...OPEN], Array<string>(20).fill('zz-filler')],
    });
    s.players[0].heroes = ['orrery-vessaly'];
    s.players[0].seen.charted = 4;
    endRound(s); // round 2: draws a grunt, then Dawn: Chart a glyph (3) finds the Zap under two grunts
    expect(hand(s).filter((c) => c === 'zz-zap')).toHaveLength(1);
    expect(s.players[0].seen.charted).toBe(5);
    expect(isAscended(s, 0, 'orrery-vessaly')).toBe(true);
    expect(hand(s)).toHaveLength(4); // round draw, the charted Zap, Ascend: draw 2
    expect(st(s, unit(s, 0, 'orrery-vessaly'))).toMatchObject({ power: 3, health: 4 });
    endRound(s); // round 3: the ascended Dawn Charts a unit (a grunt) and then a glyph (the Rite at the bottom)
    expect(hand(s).filter((c) => c === 'zz-rite')).toHaveLength(1);
  });

  it('orrery-elsbet: Dawn repairs her other allies by 1; her 4th dawn on the Line ascends her and gives them +2|+2', () => {
    const s = board({ line: [['orrery-elsbet', 'zz-ogre'], []] });
    s.players[0].heroes = ['orrery-elsbet'];
    const h = unit(s, 0, 'orrery-elsbet');
    const o = unit(s, 0, 'zz-ogre');
    o.dmg = 4;
    h.seen.dawns = 2;
    endRound(s); // 3 dawns
    expect(o.dmg).toBe(3);
    expect(isAscended(s, 0, 'orrery-elsbet')).toBe(false);
    endRound(s); // 4 dawns: ascends
    expect(isAscended(s, 0, 'orrery-elsbet')).toBe(true);
    expect(o.dmg).toBe(2);
    expect(st(s, o)).toMatchObject({ power: 7, health: 7 });
    expect(st(s, h)).toMatchObject({ power: 2, health: 6 });
    endRound(s); // ascended Dawn: repair 2 and +1|+0
    expect(o.dmg).toBe(0);
    expect(st(s, o).power).toBe(8);
  });

  it('orrery-pell: a glyph after a unit this round hits the strongest enemy; the 9th unit played ascends him for 3 Charge', () => {
    const s = board({ hand: [['zz-zap', 'zz-grunt', 'zz-zap'], []], line: [['orrery-pell'], ['zz-ogre', 'zz-wall']] });
    s.players[0].heroes = ['orrery-pell'];
    const ogre = unit(s, 1, 'zz-ogre');
    const wall = unit(s, 1, 'zz-wall');
    play(s, 'zz-zap', [wall.iid]); // no unit played yet: no Conjunction
    expect(ogre.dmg).toBe(0);
    play(s, 'zz-grunt');
    pass(s);
    play(s, 'zz-zap', [wall.iid]);
    expect(ogre.dmg).toBe(1);

    const t = board({ hand: [['zz-grunt', 'zz-zap', 'zz-grunt'], []], line: [['orrery-pell'], ['zz-ogre', 'zz-wall']] });
    t.players[0].heroes = ['orrery-pell'];
    t.players[0].seen.unitsPlayed = 8;
    play(t, 'zz-grunt');
    expect(isAscended(t, 0, 'orrery-pell')).toBe(true);
    expect(t.players[0].charge).toBe(10 - 1 + 3);
    pass(t);
    play(t, 'zz-zap', [unit(t, 1, 'zz-wall').iid]);
    expect(unit(t, 1, 'zz-ogre').dmg).toBe(2);
    play(t, 'zz-grunt'); // Conjunction holds: the new ally gets +1|+1
    expect(st(t, unit(t, 0, 'zz-grunt', 1))).toMatchObject({ power: 3, health: 3 });
  });

  it('orrery-aurelind: Deploy Charts a unit costing 5+ (5); the 3rd big unit ascends her: units cost 1 less and a Colossus arrives', () => {
    const s = board({ hand: [['orrery-aurelind'], []], deck: [['zz-ogre', 'zz-grunt', 'zz-grunt', ...OPEN], Array<string>(20).fill('zz-filler')] });
    s.players[0].heroes = ['orrery-aurelind'];
    s.players[0].seen.bigSummoned = 2;
    play(s, 'orrery-aurelind');
    expect(hand(s)).toEqual(['zz-ogre']);
    expect(costOf(s, 0, 'zz-grunt')).toBe(1);
    pass(s);
    play(s, 'zz-ogre');
    expect(isAscended(s, 0, 'orrery-aurelind')).toBe(true);
    expect(onLine(s, 0, 'orrery-starlightcolossus')).toHaveLength(1);
    expect(costOf(s, 0, 'zz-grunt')).toBe(0);
    expect(costOf(s, 0, 'zz-zap')).toBe(1);
  });

  // ---------- units ----------
  it('orrery-lenspolisher: Deploy Charts a glyph (3)', () => {
    const s = board({ hand: [['orrery-lenspolisher'], []], deck: [['zz-zap', 'zz-grunt', 'zz-grunt', ...OPEN], Array<string>(20).fill('zz-filler')] });
    play(s, 'orrery-lenspolisher');
    expect(hand(s)).toEqual(['zz-zap']);
    expect(s.players[0].seen.charted).toBe(1);
  });

  it('orrery-novicestargazer: Deploy after a glyph this round makes it 2|3', () => {
    const s = board({ hand: [['orrery-novicestargazer', 'zz-zap', 'orrery-novicestargazer'], []], line: [[], ['zz-wall']] });
    play(s, 'orrery-novicestargazer');
    expect(st(s, unit(s, 0, 'orrery-novicestargazer'))).toMatchObject({ power: 1, health: 2 });
    pass(s);
    play(s, 'zz-zap', [unit(s, 1, 'zz-wall').iid]);
    play(s, 'orrery-novicestargazer');
    expect(st(s, unit(s, 0, 'orrery-novicestargazer', 1))).toMatchObject({ power: 2, health: 3 });
  });

  it('orrery-pocketorrery: after 2 rounds on the Line it Unfolds into a 2|3 and Charts a unit (4)', () => {
    const s = board({ line: [['orrery-pocketorrery'], []], deck: [['zz-grunt', 'zz-rite', 'zz-rite', 'zz-rite', 'zz-rite', ...OPEN], Array<string>(20).fill('zz-filler')] });
    const p = unit(s, 0, 'orrery-pocketorrery');
    endRound(s);
    expect(p.unfolded).toBeFalsy();
    endRound(s);
    expect(p.unfolded).toBe(true);
    expect(st(s, p)).toMatchObject({ power: 2, health: 3 });
    expect(hand(s)).toEqual(['zz-rite', 'zz-rite', 'zz-grunt']);
  });

  it('orrery-chartscribe: Deploy Charts a unit (3)', () => {
    const s = board({ hand: [['orrery-chartscribe'], []], deck: [['zz-grunt', 'zz-rite', 'zz-rite', ...OPEN], Array<string>(20).fill('zz-filler')] });
    play(s, 'orrery-chartscribe');
    expect(hand(s)).toEqual(['zz-grunt']);
  });

  it('orrery-brasssentinel: Spotter; surviving damage twice Unfolds it into a repaired 3|5 with Plated', () => {
    const s = board({ hand: [[], ['zz-zap', 'zz-zap', 'zz-zap']], line: [['orrery-brasssentinel'], []], first: 1 });
    const b = unit(s, 0, 'orrery-brasssentinel');
    expect(st(s, b).keywords).toContain('spotter');
    play(s, 'zz-zap', [b.iid]);
    expect(b.unfolded).toBeFalsy();
    play(s, 'zz-zap', [b.iid]);
    expect(b.unfolded).toBe(true);
    expect(b.dmg).toBe(0);
    expect(st(s, b)).toMatchObject({ power: 3, health: 5 });
    play(s, 'zz-zap', [b.iid]); // Plated takes the 1 off
    expect(b.dmg).toBe(0);
  });

  it('orrery-orbitacolyte: Deploy draws 1 only with Conjunction', () => {
    const s = board({ hand: [['orrery-orbitacolyte', 'zz-zap', 'orrery-orbitacolyte'], []], line: [[], ['zz-wall']] });
    play(s, 'orrery-orbitacolyte');
    expect(s.players[0].hand).toHaveLength(2);
    pass(s);
    play(s, 'zz-zap', [unit(s, 1, 'zz-wall').iid]);
    play(s, 'orrery-orbitacolyte');
    expect(s.players[0].hand).toHaveLength(1);
  });

  it('orrery-lanternacolyte: Deploy gives another ally Ward, which stops the next damage', () => {
    const s = board({ hand: [['orrery-lanternacolyte'], ['zz-zap']], line: [['zz-grunt'], []] });
    const g = unit(s, 0, 'zz-grunt');
    play(s, 'orrery-lanternacolyte', [g.iid]);
    expect(g.ward).toBe(true);
    play(s, 'zz-zap', [g.iid]);
    expect(g.dmg).toBe(0);
  });

  it('orrery-armillarywarden: after 2 rounds on the Line it Unfolds into a 5|5 and deals 2 to the strongest enemy', () => {
    const s = board({ line: [['orrery-armillarywarden'], ['zz-grunt', 'zz-ogre']] });
    const w = unit(s, 0, 'orrery-armillarywarden');
    w.seen.dawns = 1;
    endRound(s);
    expect(w.unfolded).toBe(true);
    expect(st(s, w)).toMatchObject({ power: 5, health: 5 });
    expect(unit(s, 1, 'zz-ogre').dmg).toBe(2);
    expect(unit(s, 1, 'zz-grunt').dmg).toBe(0);
  });

  it('orrery-cometherald: Deploy deals 2 to an enemy unit only with Conjunction', () => {
    const s = board({ hand: [['orrery-cometherald', 'zz-zap', 'orrery-cometherald'], []], line: [[], ['zz-wall']] });
    const wall = unit(s, 1, 'zz-wall');
    play(s, 'orrery-cometherald', [wall.iid]);
    expect(wall.dmg).toBe(0);
    pass(s);
    play(s, 'zz-zap', [wall.iid]);
    play(s, 'orrery-cometherald', [wall.iid]);
    expect(wall.dmg).toBe(3);
  });

  it('orrery-quadrantkeeper: Deploy Charts a glyph (3); Resonant gives +1|+1', () => {
    const s = board({ hand: [['orrery-quadrantkeeper'], []], line: [['orrery-vessaly'], []], deck: [['zz-zap', 'zz-grunt', 'zz-grunt', ...OPEN], Array<string>(20).fill('zz-filler')] });
    play(s, 'orrery-quadrantkeeper');
    expect(hand(s)).toEqual(['zz-zap']);
    const k = unit(s, 0, 'orrery-quadrantkeeper');
    expect(st(s, k)).toMatchObject({ power: 3, health: 3 });
    resonate(s);
    expect(st(s, k)).toMatchObject({ power: 4, health: 4 });
  });

  it('orrery-meteorlancer: Vanguard; its 2nd strike Unfolds it into a 5|4 with Pierce', () => {
    const s = board({ line: [['orrery-meteorlancer'], ['zz-wall']] });
    const m = unit(s, 0, 'orrery-meteorlancer');
    expect(st(s, m).keywords).toContain('vanguard');
    m.seen.strikes = 1;
    attack(s, [m], [[unit(s, 1, 'zz-wall'), m]]);
    resolveCombat(s);
    expect(m.unfolded).toBe(true);
    expect(st(s, m).power).toBe(5);
    expect(st(s, m).keywords).toContain('pierce');
  });

  it('orrery-lodestarprior: a glyph cast after a unit this round gives it +1|+0', () => {
    const s = board({ hand: [['zz-zap', 'zz-grunt', 'zz-zap'], []], line: [['orrery-lodestarprior'], ['zz-wall']] });
    const p = unit(s, 0, 'orrery-lodestarprior');
    const wall = unit(s, 1, 'zz-wall');
    play(s, 'zz-zap', [wall.iid]);
    expect(st(s, p).power).toBe(3);
    play(s, 'zz-grunt');
    pass(s);
    play(s, 'zz-zap', [wall.iid]);
    expect(st(s, p)).toMatchObject({ power: 4, health: 4 });
  });

  it('orrery-orreryengine: Plated; after 3 rounds on the Line it Unfolds into a 6|7 and deals 1 to every enemy unit', () => {
    const s = board({ hand: [[], ['zz-zap']], line: [['orrery-orreryengine'], ['zz-grunt', 'zz-wall']], first: 1 });
    const e = unit(s, 0, 'orrery-orreryengine');
    play(s, 'zz-zap', [e.iid]);
    expect(e.dmg).toBe(0);
    e.seen.dawns = 2;
    endRound(s);
    expect(e.unfolded).toBe(true);
    expect(st(s, e)).toMatchObject({ power: 6, health: 7 });
    expect(unit(s, 1, 'zz-grunt').dmg).toBe(1);
    expect(unit(s, 1, 'zz-wall').dmg).toBe(1);
  });

  it('orrery-gyrewarden: Mend; Deploy gives another ally Mend, which repairs it at Dawn', () => {
    const s = board({ hand: [['orrery-gyrewarden'], []], line: [['zz-ogre'], []] });
    const o = unit(s, 0, 'zz-ogre');
    o.dmg = 3;
    play(s, 'orrery-gyrewarden', [o.iid]);
    expect(st(s, o).keywords).toContain('mend');
    const g = unit(s, 0, 'orrery-gyrewarden');
    g.dmg = 2;
    endRound(s);
    expect(o.dmg).toBe(0);
    expect(g.dmg).toBe(0);
  });

  it('orrery-eclipseknight: Deploy with Conjunction gives it Ward and Vanguard', () => {
    const s = board({ hand: [['orrery-eclipseknight', 'zz-zap', 'orrery-eclipseknight'], []], line: [[], ['zz-wall']], charge: 11 });
    play(s, 'orrery-eclipseknight');
    const a = unit(s, 0, 'orrery-eclipseknight');
    expect(st(s, a).keywords).not.toContain('vanguard');
    pass(s);
    play(s, 'zz-zap', [unit(s, 1, 'zz-wall').iid]);
    play(s, 'orrery-eclipseknight');
    const b = unit(s, 0, 'orrery-eclipseknight', 1);
    expect(st(s, b).keywords).toContain('vanguard');
    expect(b.ward).toBe(true);
    expect(a.ward).toBe(false);
  });

  it('orrery-dormantstartitan: after 2 rounds on the Line it Unfolds into a 7|7 and gives its other allies +1|+1', () => {
    const s = board({ line: [['orrery-dormantstartitan', 'zz-grunt'], []] });
    const t = unit(s, 0, 'orrery-dormantstartitan');
    t.seen.dawns = 1;
    endRound(s);
    expect(t.unfolded).toBe(true);
    expect(st(s, t)).toMatchObject({ power: 7, health: 7 });
    expect(st(s, unit(s, 0, 'zz-grunt'))).toMatchObject({ power: 3, health: 3 });
  });

  it('orrery-celestinebastion: Spotter; Resonant gives +1|+1 and Plated', () => {
    const s = board({ line: [['orrery-celestinebastion', 'orrery-vessaly'], []] });
    const b = unit(s, 0, 'orrery-celestinebastion');
    expect(st(s, b).keywords).toContain('spotter');
    expect(st(s, b).keywords).not.toContain('plated');
    resonate(s);
    expect(st(s, b)).toMatchObject({ power: 5, health: 6 });
    expect(st(s, b).keywords).toContain('plated');
  });

  it('orrery-meridianconstruct: Deploy with Conjunction gives its other allies +1|+1', () => {
    const s = board({ hand: [['zz-zap', 'orrery-meridianconstruct'], []], line: [['zz-grunt'], ['zz-wall']] });
    play(s, 'zz-zap', [unit(s, 1, 'zz-wall').iid]);
    play(s, 'orrery-meridianconstruct');
    expect(st(s, unit(s, 0, 'zz-grunt'))).toMatchObject({ power: 3, health: 3 });
    expect(st(s, unit(s, 0, 'orrery-meridianconstruct'))).toMatchObject({ power: 5, health: 6 });
  });

  it('orrery-sleepingconstellation: after 2 rounds on the Line it Unfolds into an 8|8 with Aerial', () => {
    const s = board({ line: [['orrery-sleepingconstellation'], []] });
    const c = unit(s, 0, 'orrery-sleepingconstellation');
    expect(st(s, c).keywords).not.toContain('aerial');
    c.seen.dawns = 1;
    endRound(s);
    expect(c.unfolded).toBe(true);
    expect(st(s, c)).toMatchObject({ power: 8, health: 8 });
    expect(st(s, c).keywords).toContain('aerial');
  });

  it('orrery-starforgetitan: Shatter summons a Starlight Colossus', () => {
    const s = board({ hand: [[], ['zz-zap']], line: [['orrery-starforgetitan'], []], first: 1 });
    const t = unit(s, 0, 'orrery-starforgetitan');
    t.dmg = 6;
    play(s, 'zz-zap', [t.iid]);
    expect(onLine(s, 0, 'orrery-starforgetitan')).toHaveLength(0);
    expect(onLine(s, 0, 'orrery-starlightcolossus')).toHaveLength(1);
    expect(s.players[0].seen.bigSummoned).toBe(1);
  });

  it('orrery-zenithseer: Deploy Charts a unit (5) and Charts a glyph (5)', () => {
    const s = board({ hand: [['orrery-zenithseer'], []], deck: [['zz-rite', 'zz-grunt', 'zz-zap', 'zz-wall', 'zz-rite', ...OPEN], Array<string>(20).fill('zz-filler')] });
    play(s, 'orrery-zenithseer');
    expect(hand(s)).toEqual(['zz-wall', 'zz-rite']);
    expect(s.players[0].deck).toEqual(['zz-rite', 'zz-grunt', 'zz-zap']);
    expect(s.players[0].seen.charted).toBe(2);
  });

  it('orrery-firstnight: Dawn deals 1 to every enemy unit and the enemy Spire; Resonant gives Aerial', () => {
    const s = board({ line: [['orrery-firstnight', 'orrery-vessaly'], ['zz-grunt', 'zz-wall']] });
    const f = unit(s, 0, 'orrery-firstnight');
    expect(st(s, f).keywords).not.toContain('aerial');
    resonate(s);
    expect(st(s, f).keywords).toContain('aerial');
    endRound(s);
    expect(unit(s, 1, 'zz-grunt').dmg).toBe(1);
    expect(unit(s, 1, 'zz-wall').dmg).toBe(1);
    expect(s.players[1].spire).toBe(19);
  });

  // ---------- glyphs ----------
  it('orrery-firstglimpse: Charts a unit (2) for 0 Charge; a unit deeper than 2 is not found', () => {
    const s = board({ hand: [['orrery-firstglimpse'], []], deck: [['zz-grunt', 'zz-rite', ...OPEN], Array<string>(20).fill('zz-filler')] });
    play(s, 'orrery-firstglimpse');
    expect(hand(s)).toEqual(['zz-grunt']);
    expect(s.players[0].charge).toBe(10);
    const t = board({ hand: [['orrery-firstglimpse'], []], deck: [['zz-grunt', 'zz-rite', 'zz-rite', ...OPEN], Array<string>(20).fill('zz-filler')] });
    play(t, 'orrery-firstglimpse');
    expect(hand(t)).toHaveLength(0);
  });

  it('orrery-trinelight: +1|+1 this round; with Conjunction it also draws 1', () => {
    const s = board({ hand: [['orrery-trinelight', 'zz-grunt', 'orrery-trinelight'], []], line: [['zz-wall'], []] });
    const w = unit(s, 0, 'zz-wall');
    play(s, 'orrery-trinelight', [w.iid]);
    expect(st(s, w)).toMatchObject({ power: 1, health: 7 });
    expect(s.players[0].hand).toHaveLength(2);
    play(s, 'zz-grunt');
    pass(s);
    play(s, 'orrery-trinelight', [w.iid]);
    expect(s.players[0].hand).toHaveLength(1);
    expect(st(s, w)).toMatchObject({ power: 2, health: 8 });
  });

  it('orrery-brassshelter: +0|+3 this round; with Conjunction it also gives Ward', () => {
    const s = board({ hand: [['orrery-brassshelter', 'zz-grunt', 'orrery-brassshelter'], []], line: [['zz-ogre'], []] });
    const o = unit(s, 0, 'zz-ogre');
    play(s, 'orrery-brassshelter', [o.iid]);
    expect(st(s, o).health).toBe(8);
    expect(o.ward).toBe(false);
    play(s, 'zz-grunt');
    pass(s);
    play(s, 'orrery-brassshelter', [o.iid]);
    expect(st(s, o).health).toBe(11);
    expect(o.ward).toBe(true);
  });

  it('orrery-fallingglint: deals 2 to an enemy unit, 3 with Resonant', () => {
    const s = board({ hand: [['orrery-fallingglint', 'orrery-fallingglint'], []], line: [['orrery-vessaly'], ['zz-wall']] });
    const w = unit(s, 1, 'zz-wall');
    play(s, 'orrery-fallingglint', [w.iid]);
    expect(w.dmg).toBe(2);
    resonate(s);
    play(s, 'orrery-fallingglint', [w.iid]);
    expect(w.dmg).toBe(5);
  });

  it('orrery-longpatience: an ally gains Mend and +0|+2, and is repaired at Dawn', () => {
    const s = board({ hand: [['orrery-longpatience'], []], line: [['zz-grunt'], []] });
    const g = unit(s, 0, 'zz-grunt');
    g.dmg = 1;
    play(s, 'orrery-longpatience', [g.iid]);
    expect(st(s, g)).toMatchObject({ power: 2, health: 4 });
    expect(st(s, g).keywords).toContain('mend');
    endRound(s);
    expect(g.dmg).toBe(0);
  });

  it('orrery-gravitywell: an enemy gets -2|+0 this round; with Resonant it is also put in Stasis', () => {
    const s = board({ hand: [['orrery-gravitywell'], []], line: [['orrery-vessaly'], ['zz-ogre']] });
    const o = unit(s, 1, 'zz-ogre');
    play(s, 'orrery-gravitywell', [o.iid]);
    pass(s);
    expect(st(s, o).power).toBe(3);
    expect(o.stasis).toBe(false);
    const t = board({ hand: [['orrery-gravitywell'], []], line: [['orrery-vessaly'], ['zz-ogre']] });
    resonate(t);
    const p = unit(t, 1, 'zz-ogre');
    play(t, 'orrery-gravitywell', [p.iid]);
    pass(t);
    expect(st(t, p).power).toBe(3);
    expect(p.stasis).toBe(true);
  });

  it('orrery-starreckoning: Charts a unit (4); with Conjunction it also Charts a glyph (4)', () => {
    const deck = (): [string[], string[]] => [['zz-zap', 'zz-wall', 'zz-grunt', ...OPEN], Array<string>(20).fill('zz-filler')];
    const s = board({ hand: [['orrery-starreckoning'], []], deck: deck() });
    play(s, 'orrery-starreckoning');
    pass(s);
    expect(hand(s)).toEqual(['zz-grunt']);
    const t = board({ hand: [['zz-ogre', 'orrery-starreckoning'], []], deck: deck() });
    play(t, 'zz-ogre');
    pass(t);
    play(t, 'orrery-starreckoning');
    pass(t);
    expect(hand(t)).toEqual(['zz-grunt', 'zz-zap']);
  });

  it('orrery-hourofmending: repairs your allies by 2 and gives them +0|+1', () => {
    const s = board({ hand: [['orrery-hourofmending'], []], line: [['zz-ogre', 'zz-grunt'], []] });
    const o = unit(s, 0, 'zz-ogre');
    o.dmg = 3;
    play(s, 'orrery-hourofmending');
    pass(s);
    expect(o.dmg).toBe(1);
    expect(st(s, o).health).toBe(6);
    expect(st(s, unit(s, 0, 'zz-grunt')).health).toBe(3);
  });

  it('orrery-cometlance: deals 3 to an enemy unit; with Conjunction also 2 to the enemy Spire', () => {
    const s = board({ hand: [['orrery-cometlance'], []], line: [[], ['zz-ogre']] });
    play(s, 'orrery-cometlance', [unit(s, 1, 'zz-ogre').iid]);
    pass(s);
    expect(unit(s, 1, 'zz-ogre').dmg).toBe(3);
    expect(s.players[1].spire).toBe(20);
    const t = board({ hand: [['zz-grunt', 'orrery-cometlance'], []], line: [[], ['zz-ogre']] });
    play(t, 'zz-grunt');
    pass(t);
    play(t, 'orrery-cometlance', [unit(t, 1, 'zz-ogre').iid]);
    pass(t);
    expect(unit(t, 1, 'zz-ogre').dmg).toBe(3);
    expect(t.players[1].spire).toBe(18);
  });

  it('orrery-occultation: negates an enemy glyph and Charts a glyph (3)', () => {
    const s = board({ hand: [['orrery-occultation'], ['zz-bolt']], first: 1, deck: [['zz-zap', 'zz-grunt', 'zz-grunt', ...OPEN], Array<string>(20).fill('zz-filler')] });
    play(s, 'zz-bolt', ['spire0']);
    play(s, 'orrery-occultation', [s.stack[0].sid]);
    pass(s);
    expect(s.players[0].spire).toBe(20);
    expect(hand(s)).toEqual(['zz-zap']);
  });

  it('orrery-rainofglassstars: deals 2 to every enemy unit', () => {
    const s = board({ hand: [['orrery-rainofglassstars'], []], line: [['zz-grunt'], ['zz-ogre', 'zz-grunt']] });
    play(s, 'orrery-rainofglassstars');
    pass(s);
    expect(unit(s, 1, 'zz-ogre').dmg).toBe(2);
    expect(onLine(s, 1, 'zz-grunt')).toHaveLength(0);
    expect(unit(s, 0, 'zz-grunt').dmg).toBe(0);
  });

  it('orrery-seekthebrightones: Charts a hero (6), then draws 1', () => {
    const s = board({ hand: [['orrery-seekthebrightones'], []], deck: [['zz-grunt', 'orrery-elsbet', 'zz-grunt', 'zz-zap', 'zz-rite', 'zz-wall', ...OPEN], Array<string>(20).fill('zz-filler')] });
    play(s, 'orrery-seekthebrightones');
    pass(s);
    expect(hand(s)).toEqual(['orrery-elsbet', 'zz-wall']);
    expect(s.players[0].seen.charted).toBe(1);
  });

  it('orrery-slowturning: your allies gain Mend and you draw 1', () => {
    const s = board({ hand: [['orrery-slowturning'], []], line: [['zz-ogre'], ['zz-grunt']] });
    const o = unit(s, 0, 'zz-ogre');
    o.dmg = 3;
    play(s, 'orrery-slowturning');
    pass(s);
    expect(st(s, o).keywords).toContain('mend');
    expect(st(s, unit(s, 1, 'zz-grunt')).keywords).not.toContain('mend');
    expect(s.players[0].hand).toHaveLength(1);
    endRound(s);
    expect(o.dmg).toBe(0);
  });

  it('orrery-kindlethecolossus: summons a Starlight Colossus; with Conjunction two', () => {
    const s = board({ hand: [['orrery-kindlethecolossus'], []] });
    play(s, 'orrery-kindlethecolossus');
    pass(s);
    expect(onLine(s, 0, 'orrery-starlightcolossus')).toHaveLength(1);
    expect(st(s, unit(s, 0, 'orrery-starlightcolossus'))).toMatchObject({ power: 5, health: 5 });
    const t = board({ hand: [['zz-grunt', 'orrery-kindlethecolossus'], []] });
    play(t, 'zz-grunt');
    pass(t);
    play(t, 'orrery-kindlethecolossus');
    pass(t);
    expect(onLine(t, 0, 'orrery-starlightcolossus')).toHaveLength(2);
    expect(t.players[0].seen.bigSummoned).toBe(2);
  });
});

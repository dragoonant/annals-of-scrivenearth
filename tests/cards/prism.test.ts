// Behaviour tests for every Prismguard collectible card (heroes: both faces). Each one fails if the mechanic is removed,
// hits the wrong side or uses the wrong number.
import { describe, expect, it } from 'vitest';
import { act, applyAction, attack, board, pass, play, resolveCombat, st, unit } from '../helpers';
import type { GameState } from '../../src/engine/types';

/** The seat with priority casts zz-bolt (2 damage, Swift) on a unit and the other seat lets it resolve. */
function bolt(s: GameState, iid: string): void {
  if (!s.players[s.priority].hand.some((h) => h.card === 'zz-bolt')) pass(s);
  play(s, 'zz-bolt', [iid]);
  pass(s);
}
const resonant = (s: GameState): void => {
  s.players[0].ascended = ['prism-oren'];
};
/** Play through to the start of the next round. */
function nextRound(s: GameState): void {
  const r = s.round;
  let guard = 0;
  while (s.round === r && guard++ < 10) pass(s);
  expect(s.round).toBe(r + 1);
}
const BOLTS: [string[], string[]] = [['zz-bolt', 'zz-bolt', 'zz-bolt'], ['zz-bolt', 'zz-bolt', 'zz-bolt']];

describe('prism heroes', () => {
  it('prism-ysolde: base face is Plated and Dusk repairs every ally by 1, herself included', () => {
    const s = board({ hand: BOLTS, line: [['prism-ysolde', 'zz-ogre', 'zz-grunt'], ['zz-ogre']] });
    const y = unit(s, 0, 'prism-ysolde'), o = unit(s, 0, 'zz-ogre'), g = unit(s, 0, 'zz-grunt'), e = unit(s, 1, 'zz-ogre');
    y.dmg = 2; o.dmg = 3; g.dmg = 1; e.dmg = 3;
    expect(st(s, y)).toMatchObject({ power: 2, health: 4 });
    expect(st(s, o)).toMatchObject({ power: 5, health: 5 }); // no aura on the base face
    pass(s); pass(s);
    expect([y.dmg, o.dmg, g.dmg]).toEqual([1, 2, 0]);
    expect(e.dmg).toBe(3); // the enemy is not repaired
    bolt(s, y.iid);
    expect(y.dmg).toBe(2); // 1 + (2 - 1 Plated)
  });

  it('prism-ysolde: ascends on 6 ally survivals; herself Ward, other allies Ward and +1|+1, Plated, Dusk repair', () => {
    const s = board({ hand: BOLTS, line: [['prism-ysolde', 'zz-grunt'], ['zz-grunt']] });
    s.players[0].heroes = ['prism-ysolde'];
    s.players[0].seen.allySurvivals = 6;
    pass(s); pass(s);
    expect(s.players[0].ascended).toContain('prism-ysolde');
    const y = unit(s, 0, 'prism-ysolde'), g = unit(s, 0, 'zz-grunt');
    expect(y.ward).toBe(true);
    expect(g.ward).toBe(true);
    expect(unit(s, 1, 'zz-grunt').ward).toBe(false);
    expect(st(s, g)).toMatchObject({ power: 3, health: 3 });
    expect(st(s, y)).toMatchObject({ power: 3, health: 5 }); // the aura skips herself
    expect(unit(s, 1, 'zz-grunt').dmg).toBe(0);
    expect(st(s, unit(s, 1, 'zz-grunt'))).toMatchObject({ power: 2, health: 2 });
    y.ward = false;
    bolt(s, y.iid);
    expect(y.dmg).toBe(1); // Plated
    g.dmg = 2;
    nextRound(s);
    expect(y.dmg).toBe(0);
    expect(g.dmg).toBe(1); // Dusk repair by exactly 1
  });

  it('prism-oren: base Spotter blocks Aerial; surviving gives +1|+0 and nothing else; lethal damage gives nothing', () => {
    const s = board({ hand: BOLTS, line: [['zz-aerial'], ['prism-oren']] });
    attack(s, [unit(s, 0, 'zz-aerial')], [[unit(s, 1, 'prism-oren'), unit(s, 0, 'zz-aerial')]]);
    resolveCombat(s);
    expect(s.players[1].spire).toBe(20); // blocked: Oren has Spotter

    const t = board({ hand: BOLTS, line: [['prism-oren'], ['zz-ogre']] });
    const o = unit(t, 0, 'prism-oren');
    bolt(t, o.iid);
    expect(st(t, o)).toMatchObject({ power: 4, health: 7 });
    expect(unit(t, 1, 'zz-ogre').dmg).toBe(0); // base face deals no 2 damage
    o.dmg = 6;
    bolt(t, o.iid); // lethal: no survival
    expect(t.players[0].line.length).toBe(0);
    expect(unit(t, 1, 'zz-ogre').dmg).toBe(0);
  });

  it('prism-oren: ascended survival gives +1|+0 and 2 damage to the enemy with the highest power; Plated and Spotter', () => {
    const s = board({ hand: BOLTS, line: [['prism-oren'], ['zz-grunt', 'zz-ogre', 'zz-wall']] });
    s.players[0].ascended = ['prism-oren'];
    const o = unit(s, 0, 'prism-oren');
    expect(st(s, o).keywords).toEqual(expect.arrayContaining(['spotter', 'plated']));
    bolt(s, o.iid);
    expect(o.dmg).toBe(1); // Plated
    expect(st(s, o).power).toBe(6);
    expect(unit(s, 1, 'zz-ogre').dmg).toBe(2);
    expect(unit(s, 1, 'zz-grunt').dmg).toBe(0);
    expect(unit(s, 1, 'zz-wall').dmg).toBe(0);
    bolt(s, o.iid);
    expect(st(s, o).power).toBe(7);
    expect(unit(s, 1, 'zz-ogre').dmg).toBe(4);
    // lethal damage does not trigger it
    o.dmg = 7;
    bolt(s, o.iid);
    expect(s.players[0].line.length).toBe(0);
    expect(unit(s, 1, 'zz-ogre').dmg).toBe(4);
  });

  it('prism-oren: the third survival ascends and repairs the Spire by 4', () => {
    const s = board({ hand: BOLTS, line: [['prism-oren'], []] });
    s.players[0].heroes = ['prism-oren'];
    s.players[0].spire = 10;
    const o = unit(s, 0, 'prism-oren');
    bolt(s, o.iid); bolt(s, o.iid);
    expect(s.players[0].ascended).not.toContain('prism-oren');
    expect(s.players[0].spire).toBe(10);
    bolt(s, o.iid);
    expect(s.players[0].ascended).toContain('prism-oren');
    expect(s.players[0].spire).toBe(14);
  });
});

describe('prism units', () => {
  it('prism-glasswarden: Plated takes 1 less damage', () => {
    const s = board({ hand: [['zz-bolt', 'zz-bolt'], []], line: [['prism-glasswarden', 'zz-wall'], []] });
    const u = unit(s, 0, 'prism-glasswarden');
    bolt(s, u.iid);
    expect(u.dmg).toBe(1);
    bolt(s, unit(s, 0, 'zz-wall').iid);
    expect(unit(s, 0, 'zz-wall').dmg).toBe(2); // control: unplated
  });

  it('prism-lampkeeper: Spotter blocks Aerial; Dusk repairs the ally with the lowest power by 1, nobody else', () => {
    const s = board({ line: [['zz-aerial'], ['prism-lampkeeper']] });
    attack(s, [unit(s, 0, 'zz-aerial')], [[unit(s, 1, 'prism-lampkeeper'), unit(s, 0, 'zz-aerial')]]);
    resolveCombat(s);
    expect(s.players[1].spire).toBe(20);

    const t = board({ line: [['zz-ogre', 'zz-wall', 'prism-lampkeeper', 'zz-grunt'], ['zz-wall']] });
    const o = unit(t, 0, 'zz-ogre'), w = unit(t, 0, 'zz-wall'), g = unit(t, 0, 'zz-grunt');
    o.dmg = 3; w.dmg = 3; g.dmg = 1;
    unit(t, 1, 'zz-wall').dmg = 3;
    pass(t); pass(t);
    expect(w.dmg).toBe(2); // the wall has power 0: the lowest
    expect(o.dmg).toBe(3);
    expect(g.dmg).toBe(1);
    expect(unit(t, 1, 'zz-wall').dmg).toBe(3);
    // power 1 (itself) is the lowest once the wall is gone; a damaged strong ally is still ignored
    const u = board({ line: [['prism-lampkeeper', 'zz-ogre'], []] });
    unit(u, 0, 'zz-ogre').dmg = 3;
    unit(u, 0, 'prism-lampkeeper').dmg = 1;
    pass(u); pass(u);
    expect(unit(u, 0, 'prism-lampkeeper').dmg).toBe(0);
    expect(unit(u, 0, 'zz-ogre').dmg).toBe(3);
  });

  it('prism-facet-initiate: Deploy gives the chosen ally +0|+1 and nobody else', () => {
    const s = board({ hand: [['prism-facet-initiate'], []], line: [['zz-wall', 'zz-grunt'], ['zz-grunt']] });
    play(s, 'prism-facet-initiate', [unit(s, 0, 'zz-wall').iid]);
    expect(st(s, unit(s, 0, 'zz-wall'))).toMatchObject({ power: 0, health: 7 });
    expect(st(s, unit(s, 0, 'zz-grunt'))).toMatchObject({ power: 2, health: 2 });
    expect(st(s, unit(s, 1, 'zz-grunt'))).toMatchObject({ power: 2, health: 2 });
    expect(st(s, unit(s, 0, 'prism-facet-initiate'))).toMatchObject({ power: 1, health: 2 });
    const t = board({ hand: [['prism-facet-initiate'], []] });
    play(t, 'prism-facet-initiate'); // no ally: still plays
    expect(t.players[0].line.length).toBe(1);
  });

  it('prism-tierguard: Ward negates the first damage only; Resonant gives +1|+1', () => {
    const s = board({ hand: BOLTS, line: [['prism-tierguard', 'prism-oren'], []] });
    const u = unit(s, 0, 'prism-tierguard');
    expect(u.ward).toBe(true);
    bolt(s, u.iid);
    expect(u.dmg).toBe(0);
    expect(u.ward).toBe(false);
    expect(st(s, u)).toMatchObject({ power: 2, health: 2 });
    resonant(s);
    expect(st(s, u)).toMatchObject({ power: 3, health: 3 });
    bolt(s, u.iid);
    expect(u.dmg).toBe(2); // Ward is not renewed
  });

  it('prism-bracewright: Dueler forces a block; surviving damage repairs it by 1; lethal damage is not undone', () => {
    const s = board({ hand: BOLTS, line: [['prism-bracewright'], ['zz-wall', 'zz-filler']] });
    const u = unit(s, 0, 'prism-bracewright');
    act(s, { type: 'declare', unit: u.iid, duel: unit(s, 1, 'zz-filler').iid });
    act(s, { type: 'attack' });
    if (s.phase === 'block') act(s, { type: 'blocks' });
    resolveCombat(s);
    expect(s.players[1].line.map((x) => x.card)).toEqual(['zz-wall']); // the filler was forced to block and died
    expect(s.players[1].spire).toBe(20);
    expect(u.dmg).toBe(0); // took 1, repaired 1

    const t = board({ hand: BOLTS, line: [['prism-bracewright'], []] });
    const b = unit(t, 0, 'prism-bracewright');
    bolt(t, b.iid);
    expect(b.dmg).toBe(1); // 2 damage, 1 repaired
    bolt(t, b.iid); // 1 + 2 = 3 >= 3: destroyed, the survive repair does not save it
    expect(t.players[0].line.length).toBe(0);
  });

  it('prism-pane-mender: Deploy repairs the chosen ally by 4 and nobody else', () => {
    const s = board({ hand: [['prism-pane-mender'], []], line: [['zz-wall', 'zz-ogre'], []] });
    const w = unit(s, 0, 'zz-wall'), o = unit(s, 0, 'zz-ogre');
    w.dmg = 5; o.dmg = 3;
    play(s, 'prism-pane-mender', [w.iid]);
    expect(w.dmg).toBe(1);
    expect(o.dmg).toBe(3);
    const t = board({ hand: [['prism-pane-mender'], []], line: [['zz-wall'], []] });
    unit(t, 0, 'zz-wall').dmg = 3;
    play(t, 'prism-pane-mender', [unit(t, 0, 'zz-wall').iid]);
    expect(unit(t, 0, 'zz-wall').dmg).toBe(0); // never below 0
  });

  it('prism-crystal-bulwark: Plated takes 1 less damage', () => {
    const s = board({ hand: [['zz-bolt', 'zz-bolt'], []], line: [['prism-crystal-bulwark', 'zz-ogre'], []] });
    const u = unit(s, 0, 'prism-crystal-bulwark');
    bolt(s, u.iid);
    expect(u.dmg).toBe(1);
    bolt(s, unit(s, 0, 'zz-ogre').iid);
    expect(unit(s, 0, 'zz-ogre').dmg).toBe(2);
  });

  it('prism-chorus-warden: other allies get +0|+1 (not the enemy, not itself); Resonant gives itself +1|+1', () => {
    const s = board({ line: [['prism-chorus-warden', 'zz-grunt', 'prism-oren'], ['zz-grunt']] });
    expect(st(s, unit(s, 0, 'zz-grunt'))).toMatchObject({ power: 2, health: 3 });
    expect(st(s, unit(s, 1, 'zz-grunt'))).toMatchObject({ power: 2, health: 2 });
    expect(st(s, unit(s, 0, 'prism-chorus-warden'))).toMatchObject({ power: 2, health: 3 });
    resonant(s);
    expect(st(s, unit(s, 0, 'prism-chorus-warden'))).toMatchObject({ power: 3, health: 4 });
    expect(st(s, unit(s, 0, 'zz-grunt'))).toMatchObject({ power: 2, health: 3 });
  });

  it('prism-sentinel-lens: Spotter blocks Aerial; Deploy gives the chosen ally Ward and nobody else', () => {
    const s = board({ hand: [['prism-sentinel-lens', 'zz-bolt'], []], line: [['zz-grunt', 'zz-wall'], []] });
    const g = unit(s, 0, 'zz-grunt');
    expect(g.ward).toBe(false);
    play(s, 'prism-sentinel-lens', [g.iid]);
    expect(g.ward).toBe(true);
    expect(unit(s, 0, 'zz-wall').ward).toBe(false);
    expect(unit(s, 0, 'prism-sentinel-lens').ward).toBe(false);
    pass(s);
    bolt(s, g.iid);
    expect(g.dmg).toBe(0);
    expect(g.ward).toBe(false);

    const t = board({ line: [['zz-aerial'], ['prism-sentinel-lens']] });
    attack(t, [unit(t, 0, 'zz-aerial')], [[unit(t, 1, 'prism-sentinel-lens'), unit(t, 0, 'zz-aerial')]]);
    resolveCombat(t);
    expect(t.players[1].spire).toBe(20);
  });

  it('prism-aegis-colossus: Dueler forces a block, and Plated reduces what it takes', () => {
    const s = board({ line: [['prism-aegis-colossus'], ['zz-wall', 'zz-grunt']] });
    const a = unit(s, 0, 'prism-aegis-colossus');
    const g = unit(s, 1, 'zz-grunt');
    act(s, { type: 'declare', unit: a.iid, duel: g.iid });
    act(s, { type: 'attack' });
    if (s.phase === 'block') act(s, { type: 'blocks' });
    resolveCombat(s);
    expect(s.players[1].line.map((u) => u.card)).toEqual(['zz-wall']);
    expect(a.dmg).toBe(1); // grunt power 2, Plated -1
    expect(s.players[1].spire).toBe(20);
  });

  it('prism-vault-captain: other allies have +1|+0 (not enemies), and it is Plated', () => {
    const s = board({ hand: [['zz-bolt'], []], line: [['prism-vault-captain', 'zz-grunt'], ['zz-grunt']] });
    expect(st(s, unit(s, 0, 'zz-grunt'))).toMatchObject({ power: 3, health: 2 });
    expect(st(s, unit(s, 1, 'zz-grunt'))).toMatchObject({ power: 2, health: 2 });
    const c = unit(s, 0, 'prism-vault-captain');
    expect(st(s, c)).toMatchObject({ power: 2, health: 4 });
    bolt(s, c.iid);
    expect(c.dmg).toBe(1);
  });

  it('prism-spire-keeper: Plated; Dusk repairs your Spire by 2 and not the enemy Spire', () => {
    const s = board({ hand: [['zz-bolt'], []], line: [['prism-spire-keeper'], []] });
    s.players[0].spire = 10;
    s.players[1].spire = 10;
    const u = unit(s, 0, 'prism-spire-keeper');
    bolt(s, u.iid);
    expect(u.dmg).toBe(1);
    pass(s); pass(s);
    expect(s.players[0].spire).toBe(12);
    expect(s.players[1].spire).toBe(10);
  });

  it('prism-lightwall-matron: Spotter; other allies have +1|+1, enemies and itself do not', () => {
    const s = board({ line: [['prism-lightwall-matron', 'zz-grunt'], ['zz-grunt']] });
    expect(st(s, unit(s, 0, 'zz-grunt'))).toMatchObject({ power: 3, health: 3 });
    expect(st(s, unit(s, 1, 'zz-grunt'))).toMatchObject({ power: 2, health: 2 });
    expect(st(s, unit(s, 0, 'prism-lightwall-matron'))).toMatchObject({ power: 3, health: 6 });
    const t = board({ line: [['zz-aerial'], ['prism-lightwall-matron']] });
    attack(t, [unit(t, 0, 'zz-aerial')], [[unit(t, 1, 'prism-lightwall-matron'), unit(t, 0, 'zz-aerial')]]);
    resolveCombat(t);
    expect(t.players[1].spire).toBe(20);
  });

  it('prism-tier-sovereign: Plated; Deploy gives every other ally Ward, not itself and not the enemy', () => {
    const s = board({ hand: [['prism-tier-sovereign', 'zz-bolt'], []], line: [['zz-grunt', 'zz-wall'], ['zz-grunt']] });
    play(s, 'prism-tier-sovereign');
    expect(unit(s, 0, 'zz-grunt').ward).toBe(true);
    expect(unit(s, 0, 'zz-wall').ward).toBe(true);
    expect(unit(s, 0, 'prism-tier-sovereign').ward).toBe(false);
    expect(unit(s, 1, 'zz-grunt').ward).toBe(false);
    bolt(s, unit(s, 0, 'prism-tier-sovereign').iid);
    expect(unit(s, 0, 'prism-tier-sovereign').dmg).toBe(1);
  });
});

describe('prism glyphs', () => {
  it('prism-hold-the-line: the chosen ally is Plated this round only', () => {
    const s = board({ hand: [['prism-hold-the-line', 'zz-bolt'], ['zz-bolt']], line: [['zz-wall', 'zz-grunt'], []] });
    const w = unit(s, 0, 'zz-wall'), g = unit(s, 0, 'zz-grunt');
    play(s, 'prism-hold-the-line', [w.iid]);
    expect(st(s, w).keywords).toContain('plated');
    expect(st(s, g).keywords).not.toContain('plated');
    bolt(s, w.iid);
    expect(w.dmg).toBe(1);
    nextRound(s);
    expect(st(s, w).keywords).not.toContain('plated');
    bolt(s, w.iid);
    expect(w.dmg).toBe(3);
  });

  it('prism-mirror-ward: gives the chosen ally Ward until it is used, and nobody else', () => {
    const s = board({ hand: [['prism-mirror-ward', 'zz-bolt'], ['zz-bolt']], line: [['zz-wall', 'zz-grunt'], []] });
    const g = unit(s, 0, 'zz-grunt');
    play(s, 'prism-mirror-ward', [g.iid]);
    expect(g.ward).toBe(true);
    expect(unit(s, 0, 'zz-wall').ward).toBe(false);
    nextRound(s);
    expect(g.ward).toBe(true); // not a this-round effect
    bolt(s, g.iid);
    expect(g.dmg).toBe(0);
    expect(g.ward).toBe(false);
  });

  it('prism-choir-of-facets: +1|+1 to every ally this round only; Resonant also repairs every ally by 2', () => {
    const s = board({ hand: [['prism-choir-of-facets'], []], line: [['zz-ogre', 'zz-grunt'], ['zz-ogre']] });
    const o = unit(s, 0, 'zz-ogre'), g = unit(s, 0, 'zz-grunt');
    o.dmg = 3;
    play(s, 'prism-choir-of-facets');
    g.dmg = 2; // lethal on the 2 health it has without the buff
    expect(st(s, o)).toMatchObject({ power: 6, health: 6 });
    expect(st(s, g)).toMatchObject({ power: 3, health: 3 });
    expect(st(s, unit(s, 1, 'zz-ogre'))).toMatchObject({ power: 5, health: 5 });
    expect([o.dmg, g.dmg]).toEqual([3, 2]); // no repair without Resonant
    nextRound(s);
    expect(st(s, o)).toMatchObject({ power: 5, health: 5 });
    expect(s.players[0].line.length).toBe(2); // R-S4: the damaged grunt is kept at 1 health
    expect(st(s, g)).toMatchObject({ power: 2, health: 2, hp: 1 });

    const r = board({ hand: [['prism-choir-of-facets'], []], line: [['zz-ogre', 'zz-grunt', 'prism-oren'], ['zz-ogre']] });
    resonant(r);
    const o2 = unit(r, 0, 'zz-ogre'), g2 = unit(r, 0, 'zz-grunt');
    o2.dmg = 3; g2.dmg = 1; unit(r, 1, 'zz-ogre').dmg = 3;
    play(r, 'prism-choir-of-facets');
    expect([o2.dmg, g2.dmg]).toEqual([1, 0]);
    expect(unit(r, 1, 'zz-ogre').dmg).toBe(3);
  });

  it('prism-patch-the-pane: repairs the chosen ally by 4 and nobody else', () => {
    const s = board({ hand: [['prism-patch-the-pane'], []], line: [['zz-wall', 'zz-ogre'], []] });
    const w = unit(s, 0, 'zz-wall'), o = unit(s, 0, 'zz-ogre');
    w.dmg = 5; o.dmg = 3;
    play(s, 'prism-patch-the-pane', [w.iid]);
    pass(s);
    expect(w.dmg).toBe(1);
    expect(o.dmg).toBe(3);
    const t = board({ hand: [['prism-patch-the-pane'], []], line: [['zz-wall'], []] });
    unit(t, 0, 'zz-wall').dmg = 2;
    play(t, 'prism-patch-the-pane', [unit(t, 0, 'zz-wall').iid]);
    pass(t);
    expect(unit(t, 0, 'zz-wall').dmg).toBe(0);
  });

  it('prism-call-out: the ally gets Dueler (forces a block) and +0|+2 this round only', () => {
    const s = board({ hand: [['prism-call-out'], []], line: [['zz-grunt', 'zz-ogre'], ['zz-wall', 'zz-ogre']] });
    const g = unit(s, 0, 'zz-grunt');
    expect(applyAction(s, { type: 'declare', unit: g.iid, duel: unit(s, 1, 'zz-wall').iid }).ok).toBe(false);
    play(s, 'prism-call-out', [g.iid]);
    pass(s);
    pass(s); // seat 1 yields, seat 0 holds priority again
    expect(st(s, g)).toMatchObject({ power: 2, health: 4 });
    expect(st(s, unit(s, 0, 'zz-ogre')).keywords).not.toContain('dueler');
    expect(st(s, unit(s, 0, 'zz-ogre')).health).toBe(5);
    act(s, { type: 'declare', unit: g.iid, duel: unit(s, 1, 'zz-wall').iid });
    act(s, { type: 'attack' });
    if (s.phase === 'block') act(s, { type: 'blocks' });
    resolveCombat(s);
    expect(unit(s, 1, 'zz-wall').dmg).toBe(2); // forced to block the grunt
    expect(s.players[1].spire).toBe(20);
    nextRound(s);
    expect(st(s, g).keywords).not.toContain('dueler');
    expect(st(s, g)).toMatchObject({ power: 2, health: 2 });
  });

  it('prism-lightwall-oath: the chosen ally gets a lasting +0|+2 and Plated', () => {
    const s = board({ hand: [['prism-lightwall-oath', 'zz-bolt', 'zz-bolt'], []], line: [['zz-grunt', 'zz-wall'], []] });
    const g = unit(s, 0, 'zz-grunt');
    play(s, 'prism-lightwall-oath', [g.iid]);
    pass(s);
    expect(st(s, g)).toMatchObject({ power: 2, health: 4 });
    expect(st(s, unit(s, 0, 'zz-wall'))).toMatchObject({ power: 0, health: 6 });
    pass(s); // seat 1 yields, so seat 0 holds priority again
    bolt(s, g.iid);
    expect(g.dmg).toBe(1);
    expect(st(s, unit(s, 0, 'zz-wall')).keywords).not.toContain('plated');
    nextRound(s);
    expect(st(s, g)).toMatchObject({ health: 4 });
    expect(st(s, g).keywords).toContain('plated');
  });

  it('prism-spire-mantle: repairs your Spire by 5 (capped at 20) and gives every ally Ward, not the enemy', () => {
    const s = board({ hand: [['prism-spire-mantle'], []], line: [['zz-grunt', 'zz-wall'], ['zz-grunt']] });
    s.players[0].spire = 10;
    s.players[1].spire = 10;
    play(s, 'prism-spire-mantle');
    pass(s);
    expect(s.players[0].spire).toBe(15);
    expect(s.players[1].spire).toBe(10);
    expect(s.players[0].line.every((u) => u.ward)).toBe(true);
    expect(unit(s, 1, 'zz-grunt').ward).toBe(false);
    const t = board({ hand: [['prism-spire-mantle'], []], line: [['zz-grunt'], []] });
    t.players[0].spire = 18;
    play(t, 'prism-spire-mantle');
    pass(t);
    expect(t.players[0].spire).toBe(20);
  });

  it('prism-tier-rally: every ally gets a lasting +1|+1, the enemy does not', () => {
    const s = board({ hand: [['prism-tier-rally'], []], line: [['zz-grunt', 'zz-wall'], ['zz-grunt']] });
    play(s, 'prism-tier-rally');
    pass(s);
    expect(st(s, unit(s, 0, 'zz-grunt'))).toMatchObject({ power: 3, health: 3 });
    expect(st(s, unit(s, 0, 'zz-wall'))).toMatchObject({ power: 1, health: 7 });
    expect(st(s, unit(s, 1, 'zz-grunt'))).toMatchObject({ power: 2, health: 2 });
    nextRound(s);
    expect(st(s, unit(s, 0, 'zz-grunt'))).toMatchObject({ power: 3, health: 3 });
  });

  it('prism-crystal-dawn: +2|+2 (lasting), full repair of every ally and Spire by 3, not the enemy', () => {
    const s = board({ hand: [['prism-crystal-dawn'], []], line: [['zz-ogre', 'zz-grunt'], ['zz-ogre']] });
    const o = unit(s, 0, 'zz-ogre'), g = unit(s, 0, 'zz-grunt');
    o.dmg = 4; g.dmg = 1; unit(s, 1, 'zz-ogre').dmg = 4;
    s.players[0].spire = 10;
    s.players[1].spire = 10;
    play(s, 'prism-crystal-dawn');
    pass(s);
    expect(st(s, o)).toMatchObject({ power: 7, health: 7 });
    expect(st(s, g)).toMatchObject({ power: 4, health: 4 });
    expect([o.dmg, g.dmg]).toEqual([0, 0]);
    expect(unit(s, 1, 'zz-ogre').dmg).toBe(4);
    expect(st(s, unit(s, 1, 'zz-ogre')).power).toBe(5);
    expect(s.players[0].spire).toBe(13);
    expect(s.players[1].spire).toBe(10);
    nextRound(s);
    expect(st(s, o)).toMatchObject({ power: 7, health: 7 });
  });
});

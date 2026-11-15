// One behaviour test per Prismguard collectible card.
import { describe, expect, it } from 'vitest';
import { act, attack, board, pass, play, resolveCombat, st, unit } from '../helpers';
import type { GameState } from '../../src/engine/types';

/** Seat 0 casts zz-bolt (2 damage, Swift) on one of its own units and the opponent lets it resolve. */
function bolt(s: GameState, iid: string): void {
  play(s, 'zz-bolt', [iid]);
  pass(s);
}
const resonant = (s: GameState): void => {
  s.players[0].ascended = ['prism-oren'];
};

describe('prism cards', () => {
  it('prism-glasswarden: Plated takes 1 less damage', () => {
    const s = board({ hand: [['zz-bolt'], []], line: [['prism-glasswarden'], []] });
    const u = unit(s, 0, 'prism-glasswarden');
    bolt(s, u.iid);
    expect(u.dmg).toBe(1);
  });

  it('prism-lampkeeper: Dusk repairs the weakest ally by 1', () => {
    const s = board({ line: [['prism-lampkeeper', 'zz-wall'], []] });
    const w = unit(s, 0, 'zz-wall');
    w.dmg = 3;
    pass(s); pass(s);
    expect(w.dmg).toBe(2);
    expect(st(s, unit(s, 0, 'prism-lampkeeper')).keywords).toContain('spotter');
  });

  it('prism-facet-initiate: Deploy gives an ally +0|+1', () => {
    const s = board({ hand: [['prism-facet-initiate'], []], line: [['zz-wall'], []] });
    play(s, 'prism-facet-initiate', [unit(s, 0, 'zz-wall').iid]);
    expect(st(s, unit(s, 0, 'zz-wall')).health).toBe(7);
  });

  it('prism-tierguard: Ward negates the first damage; Resonant gives +1|+1', () => {
    const s = board({ hand: [['zz-bolt', 'zz-bolt'], []], line: [['prism-tierguard', 'prism-oren'], []] });
    const u = unit(s, 0, 'prism-tierguard');
    expect(u.ward).toBe(true);
    bolt(s, u.iid);
    expect(u.dmg).toBe(0);
    expect(u.ward).toBe(false);
    expect(st(s, u)).toMatchObject({ power: 2, health: 2 });
    resonant(s);
    expect(st(s, u)).toMatchObject({ power: 3, health: 3 });
  });

  it('prism-bracewright: repairs itself by 1 when it survives damage', () => {
    const s = board({ hand: [['zz-bolt'], []], line: [['prism-bracewright'], []] });
    const u = unit(s, 0, 'prism-bracewright');
    bolt(s, u.iid);
    expect(u.dmg).toBe(1);
    expect(st(s, u).keywords).toContain('dueler');
  });

  it('prism-pane-mender: Deploy repairs an ally by 4', () => {
    const s = board({ hand: [['prism-pane-mender'], []], line: [['zz-wall'], []] });
    const w = unit(s, 0, 'zz-wall');
    w.dmg = 5;
    play(s, 'prism-pane-mender', [w.iid]);
    expect(w.dmg).toBe(1);
  });

  it('prism-crystal-bulwark: Plated takes 1 less damage', () => {
    const s = board({ hand: [['zz-bolt'], []], line: [['prism-crystal-bulwark'], []] });
    const u = unit(s, 0, 'prism-crystal-bulwark');
    bolt(s, u.iid);
    expect(u.dmg).toBe(1);
  });

  it('prism-chorus-warden: other allies get +0|+1; Resonant gives itself +1|+1', () => {
    const s = board({ line: [['prism-chorus-warden', 'zz-grunt', 'prism-oren'], []] });
    expect(st(s, unit(s, 0, 'zz-grunt'))).toMatchObject({ power: 2, health: 3 });
    expect(st(s, unit(s, 0, 'prism-chorus-warden'))).toMatchObject({ power: 2, health: 3 });
    resonant(s);
    expect(st(s, unit(s, 0, 'prism-chorus-warden'))).toMatchObject({ power: 3, health: 4 });
  });

  it('prism-sentinel-lens: Deploy gives an ally Ward', () => {
    const s = board({ hand: [['prism-sentinel-lens', 'zz-bolt'], []], line: [['zz-grunt'], []] });
    const g = unit(s, 0, 'zz-grunt');
    expect(g.ward).toBe(false);
    play(s, 'prism-sentinel-lens', [g.iid]);
    expect(g.ward).toBe(true);
    pass(s);
    bolt(s, g.iid);
    expect(g.dmg).toBe(0);
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
    expect(a.dmg).toBe(1);
  });

  it('prism-vault-captain: other allies have +1|+0 and it is Plated', () => {
    const s = board({ hand: [['zz-bolt'], []], line: [['prism-vault-captain', 'zz-grunt'], []] });
    expect(st(s, unit(s, 0, 'zz-grunt'))).toMatchObject({ power: 3, health: 2 });
    const c = unit(s, 0, 'prism-vault-captain');
    expect(st(s, c).power).toBe(2);
    bolt(s, c.iid);
    expect(c.dmg).toBe(1);
  });

  it('prism-spire-keeper: Dusk repairs your Spire by 2', () => {
    const s = board({ line: [['prism-spire-keeper'], []] });
    s.players[0].spire = 10;
    pass(s); pass(s);
    expect(s.players[0].spire).toBe(12);
  });

  it('prism-lightwall-matron: other allies have +1|+1', () => {
    const s = board({ line: [['prism-lightwall-matron', 'zz-grunt'], []] });
    expect(st(s, unit(s, 0, 'zz-grunt'))).toMatchObject({ power: 3, health: 3 });
    expect(st(s, unit(s, 0, 'prism-lightwall-matron'))).toMatchObject({ power: 3, health: 6 });
  });

  it('prism-tier-sovereign: Deploy gives every other ally Ward', () => {
    const s = board({ hand: [['prism-tier-sovereign'], []], line: [['zz-grunt', 'zz-wall'], []] });
    play(s, 'prism-tier-sovereign');
    expect(unit(s, 0, 'zz-grunt').ward).toBe(true);
    expect(unit(s, 0, 'zz-wall').ward).toBe(true);
    expect(unit(s, 0, 'prism-tier-sovereign').ward).toBe(false);
  });

  it('prism-hold-the-line: the ally is Plated this round', () => {
    const s = board({ hand: [['prism-hold-the-line', 'zz-bolt'], []], line: [['zz-grunt'], []] });
    const g = unit(s, 0, 'zz-grunt');
    play(s, 'prism-hold-the-line', [g.iid]);
    expect(st(s, g).keywords).toContain('plated');
    bolt(s, g.iid);
    expect(g.dmg).toBe(1);
  });

  it('prism-mirror-ward: gives an ally Ward', () => {
    const s = board({ hand: [['prism-mirror-ward', 'zz-bolt'], []], line: [['zz-grunt'], []] });
    const g = unit(s, 0, 'zz-grunt');
    play(s, 'prism-mirror-ward', [g.iid]);
    expect(g.ward).toBe(true);
    bolt(s, g.iid);
    expect(g.dmg).toBe(0);
  });

  it('prism-choir-of-facets: +1|+1 this round; Resonant also repairs every ally by 2', () => {
    const s = board({ hand: [['prism-choir-of-facets'], []], line: [['zz-ogre'], []] });
    const o = unit(s, 0, 'zz-ogre');
    o.dmg = 3;
    play(s, 'prism-choir-of-facets');
    expect(st(s, o)).toMatchObject({ power: 6, health: 6 });
    expect(o.dmg).toBe(3);
    const r = board({ hand: [['prism-choir-of-facets'], []], line: [['zz-ogre', 'prism-oren'], []] });
    resonant(r);
    const o2 = unit(r, 0, 'zz-ogre');
    o2.dmg = 3;
    play(r, 'prism-choir-of-facets');
    expect(o2.dmg).toBe(1);
  });

  it('prism-patch-the-pane: repairs an ally by 4', () => {
    const s = board({ hand: [['prism-patch-the-pane'], []], line: [['zz-wall'], []] });
    const w = unit(s, 0, 'zz-wall');
    w.dmg = 5;
    play(s, 'prism-patch-the-pane', [w.iid]);
    pass(s);
    expect(w.dmg).toBe(1);
  });

  it('prism-call-out: gives Dueler and +0|+2 this round', () => {
    const s = board({ hand: [['prism-call-out'], []], line: [['zz-grunt'], ['zz-ogre']] });
    const g = unit(s, 0, 'zz-grunt');
    play(s, 'prism-call-out', [g.iid]);
    pass(s);
    expect(st(s, g).keywords).toContain('dueler');
    expect(st(s, g).health).toBe(4);
  });

  it('prism-lightwall-oath: gives +0|+2 and Plated', () => {
    const s = board({ hand: [['prism-lightwall-oath', 'zz-bolt'], []], line: [['zz-grunt'], []] });
    const g = unit(s, 0, 'zz-grunt');
    play(s, 'prism-lightwall-oath', [g.iid]);
    pass(s);
    expect(st(s, g)).toMatchObject({ power: 2, health: 4 });
    pass(s); // seat 1 yields, so seat 0 holds priority again
    bolt(s, g.iid);
    expect(g.dmg).toBe(1);
  });

  it('prism-spire-mantle: repairs your Spire by 5 and gives every ally Ward', () => {
    const s = board({ hand: [['prism-spire-mantle'], []], line: [['zz-grunt', 'zz-wall'], []] });
    s.players[0].spire = 10;
    play(s, 'prism-spire-mantle');
    pass(s);
    expect(s.players[0].spire).toBe(15);
    expect(s.players[0].line.every((u) => u.ward)).toBe(true);
  });

  it('prism-tier-rally: every ally gets +1|+1', () => {
    const s = board({ hand: [['prism-tier-rally'], []], line: [['zz-grunt', 'zz-wall'], []] });
    play(s, 'prism-tier-rally');
    pass(s);
    expect(st(s, unit(s, 0, 'zz-grunt'))).toMatchObject({ power: 3, health: 3 });
    expect(st(s, unit(s, 0, 'zz-wall'))).toMatchObject({ power: 1, health: 7 });
  });

  it('prism-crystal-dawn: +2|+2, repairs every ally fully and your Spire by 3', () => {
    const s = board({ hand: [['prism-crystal-dawn'], []], line: [['zz-ogre'], []] });
    const o = unit(s, 0, 'zz-ogre');
    o.dmg = 4;
    s.players[0].spire = 10;
    play(s, 'prism-crystal-dawn');
    pass(s);
    expect(st(s, o)).toMatchObject({ power: 7, health: 7 });
    expect(o.dmg).toBe(0);
    expect(s.players[0].spire).toBe(13);
  });
});

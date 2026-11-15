// One behaviour test per Verdant Coil collectible card.
import { describe, expect, it } from 'vitest';
import { attack, board, pass, play, resolveCombat, st, unit } from '../helpers';

describe('coil cards', () => {
  it('coil-sprout-tender: Dawn gains 1 Charge', () => {
    const s = board({ line: [['coil-sprout-tender'], []] });
    pass(s); pass(s);
    expect(s.round).toBe(2);
    expect(s.players[0].charge).toBe(s.players[0].maxCharge + 1);
  });

  it('coil-thornback-cub: Mend repairs it at the start of the round', () => {
    const s = board({ line: [['coil-thornback-cub'], []] });
    const c = unit(s, 0, 'coil-thornback-cub');
    c.dmg = 1;
    pass(s); pass(s);
    expect(c.dmg).toBe(0);
  });

  it('coil-rootling: Deploy raises your maximum Charge by 1', () => {
    const s = board({ hand: [['coil-rootling'], []] });
    s.players[0].maxCharge = 5;
    s.players[0].charge = 5;
    play(s, 'coil-rootling');
    expect(s.players[0].maxCharge).toBe(6);
  });

  it('coil-spearhorn: Pierce sends excess damage to the Spire', () => {
    const s = board({ line: [['coil-spearhorn'], ['zz-filler']] });
    attack(s, [unit(s, 0, 'coil-spearhorn')], [[unit(s, 1, 'zz-filler'), unit(s, 0, 'coil-spearhorn')]]);
    resolveCombat(s);
    expect(s.players[1].spire).toBe(19);
  });

  it('coil-vinewhip: Deploy strikes an enemy and takes no damage back', () => {
    const s = board({ hand: [['coil-vinewhip'], []], line: [[], ['zz-grunt']] });
    play(s, 'coil-vinewhip', [unit(s, 1, 'zz-grunt').iid]);
    expect(s.players[1].line.length).toBe(0);
    expect(unit(s, 0, 'coil-vinewhip').dmg).toBe(0);
  });

  it('coil-sap-engine: Deploy gains 2 Charge', () => {
    const s = board({ hand: [['coil-sap-engine'], []] });
    s.players[0].charge = 5;
    play(s, 'coil-sap-engine');
    expect(s.players[0].charge).toBe(5);
  });

  it('coil-crownmaw: +2|+0 with 2 other allies, and it counts as a big summon', () => {
    const s = board({ hand: [['coil-crownmaw'], []], line: [['zz-grunt', 'zz-grunt'], []] });
    play(s, 'coil-crownmaw');
    expect(st(s, unit(s, 0, 'coil-crownmaw')).power).toBe(5);
    expect(s.players[0].seen.bigSummoned).toBe(1);
    const t = board({ line: [['coil-crownmaw', 'zz-grunt'], []] });
    expect(st(t, unit(t, 0, 'coil-crownmaw')).power).toBe(3);
  });

  it('coil-bloomcaller: Dawn gives another random ally +1|+0', () => {
    const s = board({ line: [['coil-bloomcaller', 'zz-grunt'], []] });
    pass(s); pass(s);
    expect(st(s, unit(s, 0, 'zz-grunt')).power).toBe(3);
    expect(st(s, unit(s, 0, 'coil-bloomcaller')).power).toBe(2);
  });

  it('coil-lashvine: Assault strikes the weakest enemy', () => {
    const s = board({ line: [['coil-lashvine'], ['zz-grunt', 'zz-wall']] });
    attack(s, [unit(s, 0, 'coil-lashvine')]);
    expect(unit(s, 1, 'zz-wall').dmg).toBe(2);
  });

  it('coil-tuskhide: Pierce; Resonant gives +0|+2', () => {
    const s = board({ line: [['coil-tuskhide', 'coil-aruvi'], ['zz-grunt']] });
    attack(s, [unit(s, 0, 'coil-tuskhide')], [[unit(s, 1, 'zz-grunt'), unit(s, 0, 'coil-tuskhide')]]);
    resolveCombat(s);
    expect(s.players[1].spire).toBe(17);
    s.players[0].ascended = ['coil-aruvi'];
    expect(st(s, unit(s, 0, 'coil-tuskhide')).health).toBe(5);
  });

  it('coil-spore-herald: Deploy gives every other ally +1|+1', () => {
    const s = board({ hand: [['coil-spore-herald'], []], line: [['zz-grunt'], []] });
    play(s, 'coil-spore-herald');
    expect(st(s, unit(s, 0, 'zz-grunt'))).toMatchObject({ power: 3, health: 3 });
    expect(st(s, unit(s, 0, 'coil-spore-herald'))).toMatchObject({ power: 3, health: 4 });
  });

  it('coil-canopy-titan: Mend repairs it; Pierce hits the Spire past a blocker', () => {
    const s = board({ line: [['coil-canopy-titan'], ['zz-grunt']] });
    const t = unit(s, 0, 'coil-canopy-titan');
    attack(s, [t], [[unit(s, 1, 'zz-grunt'), t]]);
    resolveCombat(s);
    expect(s.players[1].spire).toBe(17);
    expect(t.dmg).toBe(2);
    pass(s); pass(s);
    expect(t.dmg).toBe(0);
  });

  it('coil-behemoth: Deploy strikes an enemy for 5 and takes no damage back', () => {
    const s = board({ hand: [['coil-behemoth'], []], line: [[], ['zz-ogre']] });
    play(s, 'coil-behemoth', [unit(s, 1, 'zz-ogre').iid]);
    expect(s.players[1].line.length).toBe(0);
    expect(unit(s, 0, 'coil-behemoth').dmg).toBe(0);
  });

  it('coil-domewyrm: 8 power Pierce hits the Spire past a blocker', () => {
    const s = board({ line: [['coil-domewyrm'], ['zz-grunt']] });
    const d = unit(s, 0, 'coil-domewyrm');
    attack(s, [d], [[unit(s, 1, 'zz-grunt'), d]]);
    resolveCombat(s);
    expect(s.players[1].spire).toBe(14);
    d.dmg = 3;
    pass(s); pass(s);
    expect(d.dmg).toBe(0);
  });

  it('coil-sap-surge: gain 2 Charge', () => {
    const s = board({ hand: [['coil-sap-surge'], []] });
    s.players[0].charge = 5;
    play(s, 'coil-sap-surge');
    expect(s.players[0].charge).toBe(6);
  });

  it('coil-bristle: +3|+0 this round', () => {
    const s = board({ hand: [['coil-bristle'], []], line: [['zz-grunt'], []] });
    play(s, 'coil-bristle', [unit(s, 0, 'zz-grunt').iid]);
    expect(st(s, unit(s, 0, 'zz-grunt'))).toMatchObject({ power: 5, health: 2 });
    pass(s); pass(s);
    expect(st(s, unit(s, 0, 'zz-grunt')).power).toBe(2);
  });

  it('coil-overgrowth: +3|+3 and Pierce this round', () => {
    const s = board({ hand: [['coil-overgrowth'], []], line: [['zz-grunt'], ['zz-filler']] });
    const g = unit(s, 0, 'zz-grunt');
    play(s, 'coil-overgrowth', [g.iid]);
    expect(st(s, g)).toMatchObject({ power: 5, health: 5 });
    expect(st(s, g).keywords).toContain('pierce');
    attack(s, [g], [[unit(s, 1, 'zz-filler'), g]]);
    resolveCombat(s);
    expect(s.players[1].spire).toBe(16);
  });

  it('coil-duel-of-thorns: an ally and an enemy strike each other', () => {
    const s = board({ hand: [['coil-duel-of-thorns'], []], line: [['zz-ogre'], ['zz-grunt']] });
    play(s, 'coil-duel-of-thorns', [unit(s, 0, 'zz-ogre').iid, unit(s, 1, 'zz-grunt').iid]);
    pass(s);
    expect(s.players[1].line.length).toBe(0);
    expect(unit(s, 0, 'zz-ogre').dmg).toBe(2);
  });

  it('coil-lash-out: an ally strikes an enemy and takes nothing back', () => {
    const s = board({ hand: [['coil-lash-out'], []], line: [['zz-ogre'], ['zz-grunt']] });
    play(s, 'coil-lash-out', [unit(s, 0, 'zz-ogre').iid, unit(s, 1, 'zz-grunt').iid]);
    pass(s);
    expect(s.players[1].line.length).toBe(0);
    expect(unit(s, 0, 'zz-ogre').dmg).toBe(0);
  });

  it('coil-grafting: +2|+2 and Mend', () => {
    const s = board({ hand: [['coil-grafting'], []], line: [['zz-grunt'], []] });
    const g = unit(s, 0, 'zz-grunt');
    play(s, 'coil-grafting', [g.iid]);
    pass(s);
    expect(st(s, g)).toMatchObject({ power: 4, health: 4 });
    expect(st(s, g).keywords).toContain('mend');
    g.dmg = 2;
    pass(s); pass(s);
    expect(g.dmg).toBe(0);
  });

  it('coil-canopy-rampage: each ally with 4+ power strikes the strongest enemy', () => {
    const s = board({ hand: [['coil-canopy-rampage'], []], line: [['zz-ogre', 'zz-grunt'], ['zz-grunt', 'zz-ogre']] });
    play(s, 'coil-canopy-rampage');
    pass(s);
    expect(s.players[1].line.map((u) => u.card)).toEqual(['zz-grunt']);
    expect(unit(s, 1, 'zz-grunt').dmg).toBe(0);
    expect(unit(s, 0, 'zz-ogre').dmg).toBe(0);
  });

  it('coil-hothouse-bloom: raises max Charge and Reserve; Resonant raises max Charge by 1 more', () => {
    const s = board({ hand: [['coil-hothouse-bloom'], []] });
    s.players[0].maxCharge = 5;
    s.players[0].charge = 5;
    play(s, 'coil-hothouse-bloom');
    pass(s);
    expect(s.players[0].maxCharge).toBe(6);
    expect(s.players[0].reserve).toBe(1);
    const r = board({ hand: [['coil-hothouse-bloom'], []], line: [['coil-aruvi'], []] });
    r.players[0].ascended = ['coil-aruvi'];
    r.players[0].maxCharge = 5;
    r.players[0].charge = 5;
    play(r, 'coil-hothouse-bloom');
    pass(r);
    expect(r.players[0].maxCharge).toBe(7);
  });

  it('coil-verdant-surge: every ally gets +3|+3', () => {
    const s = board({ hand: [['coil-verdant-surge'], []], line: [['zz-ogre', 'zz-grunt'], []] });
    play(s, 'coil-verdant-surge');
    pass(s);
    expect(st(s, unit(s, 0, 'zz-ogre'))).toMatchObject({ power: 8, health: 8 });
    expect(st(s, unit(s, 0, 'zz-grunt'))).toMatchObject({ power: 5, health: 5 });
  });
});

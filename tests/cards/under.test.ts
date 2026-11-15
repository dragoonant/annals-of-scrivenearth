import { describe, expect, it } from 'vitest';
import { applyAction, attack, board, pass, play, resolveCombat, st, unit } from '../helpers';

const cards = (s: ReturnType<typeof board>, seat: 0 | 1): string[] => s.players[seat].line.map((u) => u.card);

describe('under cards', () => {
  it('under-fuserunner: Shatter drains 1 from the enemy Spire', () => {
    const s = board({ hand: [[], ['zz-zap']], line: [['under-fuserunner'], []], first: 1 });
    s.players[0].spire = 15;
    play(s, 'zz-zap', [unit(s, 0, 'under-fuserunner').iid]);
    expect(cards(s, 0)).toEqual([]);
    expect(s.players[1].spire).toBe(19);
    expect(s.players[0].spire).toBe(16);
  });

  it('under-leechtick: Siphon repairs the Spire by its strike damage', () => {
    const s = board({ line: [['under-leechtick'], []] });
    s.players[0].spire = 10;
    attack(s, [unit(s, 0, 'under-leechtick')]);
    resolveCombat(s);
    expect(s.players[1].spire).toBe(19);
    expect(s.players[0].spire).toBe(11);
  });

  it('under-burnoutrunner: Dread dodges small blockers; Unstable dies at Dusk', () => {
    const s = board({ line: [['under-burnoutrunner'], ['zz-grunt']] });
    attack(s, [unit(s, 0, 'under-burnoutrunner')]);
    expect(s.phase).toBe('combat'); // the grunt (2 power) cannot block a Dread unit
    resolveCombat(s);
    expect(s.players[1].spire).toBe(18);
    pass(s); pass(s);
    expect(cards(s, 0)).toEqual([]);
    expect(s.players[0].seen.alliesDied).toBe(1);
  });

  it('under-ratwrangler: Deploy summons a Wire Rat; Resonant summons 2', () => {
    const plain = board({ hand: [['under-ratwrangler'], []] });
    play(plain, 'under-ratwrangler');
    expect(cards(plain, 0)).toEqual(['under-ratwrangler', 'under-wirerat']);
    const res = board({ hand: [['under-ratwrangler'], []], line: [['under-vex'], []] });
    res.players[0].ascended = ['under-vex'];
    play(res, 'under-ratwrangler');
    expect(cards(res, 0)).toEqual(['under-vex', 'under-ratwrangler', 'under-wirerat', 'under-wirerat']);
  });

  it('under-pitaccountant: drains 1 when another ally is destroyed; Resonant gives +1|+1', () => {
    const s = board({ hand: [[], ['zz-zap']], line: [['under-pitaccountant', 'zz-grunt', 'under-vex'], []], first: 1 });
    s.players[0].spire = 15;
    unit(s, 0, 'zz-grunt').dmg = 1;
    expect(st(s, unit(s, 0, 'under-pitaccountant'))).toMatchObject({ power: 1, health: 3 });
    play(s, 'zz-zap', [unit(s, 0, 'zz-grunt').iid]);
    expect(s.players[1].spire).toBe(19);
    expect(s.players[0].spire).toBe(16);
    s.players[0].ascended = ['under-vex'];
    expect(st(s, unit(s, 0, 'under-pitaccountant'))).toMatchObject({ power: 2, health: 4 });
  });

  it('under-acidlamplighter: Corrosive destroys a much bigger blocker', () => {
    const s = board({ line: [['under-acidlamplighter'], ['zz-ogre']] });
    const l = unit(s, 0, 'under-acidlamplighter');
    const o = unit(s, 1, 'zz-ogre');
    attack(s, [l], [[o, l]]);
    resolveCombat(s);
    expect(cards(s, 1)).toEqual([]);
  });

  it('under-furnacehand: Deploy destroys an allied unit', () => {
    const s = board({ hand: [['under-furnacehand'], []], line: [['zz-grunt'], []] });
    play(s, 'under-furnacehand', [unit(s, 0, 'zz-grunt').iid]);
    expect(cards(s, 0)).toEqual(['under-furnacehand']);
    expect(s.players[0].seen.alliesDied).toBe(1);
    expect(st(s, unit(s, 0, 'under-furnacehand'))).toMatchObject({ power: 4, health: 4 });
  });

  it('under-backalleyenforcer: Dread cannot be blocked by units with 2 or less power', () => {
    const s = board({ line: [['under-backalleyenforcer'], ['zz-grunt', 'zz-wall']] });
    attack(s, [unit(s, 0, 'under-backalleyenforcer')]);
    expect(s.phase).toBe('combat');
    resolveCombat(s);
    expect(s.players[1].spire).toBe(17);
  });

  it('under-leechwiresurgeon: Deploy drains 2 from an enemy unit and repairs the Spire', () => {
    const s = board({ hand: [['under-leechwiresurgeon'], []], line: [[], ['zz-grunt', 'zz-ogre']] });
    s.players[0].spire = 10;
    play(s, 'under-leechwiresurgeon', [unit(s, 1, 'zz-ogre').iid]);
    expect(unit(s, 1, 'zz-ogre').dmg).toBe(2);
    expect(s.players[0].spire).toBe(12);
    expect(s.players[0].seen.spireHealed).toBe(2);
  });

  it('under-vaultpawnbroker: an enemy unit dying drains 1 from the enemy Spire', () => {
    const s = board({ hand: [['zz-zap'], []], line: [['under-vaultpawnbroker'], ['zz-grunt']] });
    s.players[0].spire = 14;
    unit(s, 1, 'zz-grunt').dmg = 1;
    play(s, 'zz-zap', [unit(s, 1, 'zz-grunt').iid]);
    expect(cards(s, 1)).toEqual([]);
    expect(s.players[1].spire).toBe(19);
    expect(s.players[0].spire).toBe(15);
  });

  it('under-powdercourier: Shatter deals 3 damage to the strongest enemy', () => {
    const s = board({ hand: [[], ['zz-zap']], line: [['under-powdercourier'], ['zz-grunt', 'zz-ogre']], first: 1 });
    unit(s, 0, 'under-powdercourier').dmg = 2;
    play(s, 'zz-zap', [unit(s, 0, 'under-powdercourier').iid]);
    expect(cards(s, 0)).toEqual([]);
    expect(unit(s, 1, 'zz-ogre').dmg).toBe(3);
    expect(unit(s, 1, 'zz-grunt').dmg).toBe(0);
  });

  it('under-syndicatebroker: Deploy summons 2 Wire Rats', () => {
    const s = board({ hand: [['under-syndicatebroker'], []] });
    play(s, 'under-syndicatebroker');
    expect(cards(s, 0)).toEqual(['under-syndicatebroker', 'under-wirerat', 'under-wirerat']);
  });

  it('under-leechoverseer: Siphon repairs the Spire by damage to a blocker, and Corrosive destroys it', () => {
    const s = board({ line: [['under-leechoverseer'], ['zz-ogre']] });
    s.players[0].spire = 10;
    const v = unit(s, 0, 'under-leechoverseer');
    const o = unit(s, 1, 'zz-ogre');
    attack(s, [v], [[o, v]]);
    resolveCombat(s);
    expect(cards(s, 1)).toEqual([]);
    expect(s.players[0].spire).toBe(14);
    expect(unit(s, 0, 'under-leechoverseer').dmg).toBe(5);
  });

  it('under-mainlinedynamo: Deploy drains 2 from every enemy unit', () => {
    const s = board({ hand: [['under-mainlinedynamo'], []], line: [[], ['zz-grunt', 'zz-ogre']] });
    s.players[0].spire = 10;
    play(s, 'under-mainlinedynamo');
    expect(cards(s, 1)).toEqual(['zz-ogre']);
    expect(unit(s, 1, 'zz-ogre').dmg).toBe(2);
    expect(s.players[0].spire).toBe(14);
    expect(st(s, unit(s, 0, 'under-mainlinedynamo')).keywords).toContain('dread');
  });

  it('under-pullplug: Flash destroys an ally and drains 2 from the enemy Spire', () => {
    const s = board({ hand: [['under-pullplug'], []], line: [['zz-grunt'], []] });
    s.players[0].spire = 10;
    play(s, 'under-pullplug', [unit(s, 0, 'zz-grunt').iid]);
    expect(cards(s, 0)).toEqual([]);
    expect(s.players[1].spire).toBe(18);
    expect(s.players[0].spire).toBe(12);
  });

  it('under-siphontap: Flash drains 2 from an enemy unit', () => {
    const s = board({ hand: [['under-siphontap'], []], line: [[], ['zz-ogre']] });
    s.players[0].spire = 10;
    play(s, 'under-siphontap', [unit(s, 1, 'zz-ogre').iid]);
    expect(unit(s, 1, 'zz-ogre').dmg).toBe(2);
    expect(s.players[0].spire).toBe(12);
  });

  it('under-acidbath: Flash gives an ally Corrosive this round so it destroys its blocker', () => {
    const s = board({ hand: [['under-acidbath'], []], line: [['zz-grunt'], ['zz-ogre']] });
    const g = unit(s, 0, 'zz-grunt');
    const o = unit(s, 1, 'zz-ogre');
    attack(s, [g], [[o, g]]);
    play(s, 'under-acidbath', [g.iid]);
    expect(st(s, g).keywords).toContain('corrosive');
    resolveCombat(s);
    expect(cards(s, 1)).toEqual([]);
  });

  it('under-burnledger: Swift destroys an ally and draws 2', () => {
    const s = board({ hand: [['under-burnledger'], []], line: [['zz-grunt'], []] });
    play(s, 'under-burnledger', [unit(s, 0, 'zz-grunt').iid]);
    pass(s);
    expect(cards(s, 0)).toEqual([]);
    expect(s.players[0].hand.length).toBe(2);
  });

  it('under-snuffedfuse: Swift destroys an enemy with 3 or less power only', () => {
    const s = board({ hand: [['under-snuffedfuse'], []], line: [[], ['zz-grunt', 'zz-ogre']] });
    const hc = s.players[0].hand[0];
    expect(applyAction(s, { type: 'play', iid: hc.iid, targets: [unit(s, 1, 'zz-ogre').iid] }).ok).toBe(false);
    play(s, 'under-snuffedfuse', [unit(s, 1, 'zz-grunt').iid]);
    pass(s);
    expect(cards(s, 1)).toEqual(['zz-ogre']);
  });

  it('under-bleeddry: Swift drains 4 from an enemy unit or from the Spire', () => {
    const u = board({ hand: [['under-bleeddry'], []], line: [[], ['zz-ogre']] });
    u.players[0].spire = 10;
    play(u, 'under-bleeddry', [unit(u, 1, 'zz-ogre').iid]);
    pass(u);
    expect(unit(u, 1, 'zz-ogre').dmg).toBe(4);
    expect(u.players[0].spire).toBe(14);
    const sp = board({ hand: [['under-bleeddry'], []] });
    sp.players[0].spire = 10;
    play(sp, 'under-bleeddry', ['spire1']);
    pass(sp);
    expect(sp.players[1].spire).toBe(16);
    expect(sp.players[0].spire).toBe(14);
  });

  it('under-chainoverload: Swift drains 3 from every enemy unit', () => {
    const s = board({ hand: [['under-chainoverload'], []], line: [[], ['zz-grunt', 'zz-ogre']] });
    s.players[0].spire = 10;
    play(s, 'under-chainoverload');
    pass(s);
    expect(cards(s, 1)).toEqual(['zz-ogre']);
    expect(unit(s, 1, 'zz-ogre').dmg).toBe(3);
    expect(s.players[0].spire).toBe(16);
  });

  it('under-wiremarket: Ritual summons 3 Wire Rats', () => {
    const s = board({ hand: [['under-wiremarket'], []] });
    play(s, 'under-wiremarket');
    pass(s);
    expect(cards(s, 0)).toEqual(['under-wirerat', 'under-wirerat', 'under-wirerat']);
  });

  it('under-leechharvest: Ritual drains 2 per ally destroyed this round', () => {
    const s = board({ hand: [['under-pullplug', 'under-pullplug', 'under-leechharvest'], []], line: [['zz-grunt', 'zz-grunt'], []] });
    s.players[0].spire = 10;
    play(s, 'under-pullplug', [unit(s, 0, 'zz-grunt', 0).iid]);
    play(s, 'under-pullplug', [unit(s, 0, 'zz-grunt', 0).iid]);
    expect(s.players[1].spire).toBe(16);
    play(s, 'under-leechharvest');
    pass(s);
    expect(s.players[1].spire).toBe(12);
    expect(s.players[0].spire).toBe(18);
  });
});

import { describe, expect, it } from 'vitest';
import { act, attack, board, pass, play, resolveCombat, st, unit } from '../helpers';
import type { GameState } from '../../src/engine/types';

const names = (s: GameState, seat: 0 | 1): string[] => s.players[seat].line.map((u) => u.card);
const resonant = (s: GameState): void => { s.players[0].ascended = ['storm-jax']; };

describe('storm cards', () => {
  it('storm-signalkite: Aerial, so a plain blocker cannot stop it', () => {
    const s = board({ line: [['storm-signalkite'], ['zz-grunt']] });
    attack(s, [unit(s, 0, 'storm-signalkite')], []);
    resolveCombat(s);
    expect(s.players[1].spire).toBe(19);
  });

  it('storm-tickettaker: Vanguard; Spire strike draws a card', () => {
    const s = board({ line: [['storm-tickettaker'], []] });
    const before = s.players[0].hand.length;
    attack(s, [unit(s, 0, 'storm-tickettaker')]);
    resolveCombat(s);
    expect(s.players[0].hand.length).toBe(before + 1);
  });

  it('storm-flagbearer: Assault gives attacking allies +1|+0 this round', () => {
    const s = board({ line: [['storm-flagbearer', 'zz-grunt'], []] });
    attack(s, [unit(s, 0, 'storm-flagbearer'), unit(s, 0, 'zz-grunt')]);
    resolveCombat(s);
    expect(s.players[1].spire).toBe(20 - 2 - 3);
  });

  it('storm-railglider: Aerial and Vanguard', () => {
    const s = board({ line: [['storm-railglider'], ['zz-aerial']] });
    const g = unit(s, 0, 'storm-railglider');
    attack(s, [g], [[unit(s, 1, 'zz-aerial'), g]]);
    resolveCombat(s);
    // Vanguard strikes first for 2 into a 3-health blocker; the blocker survives and kills the glider.
    expect(unit(s, 1, 'zz-aerial').dmg).toBe(2);
    expect(st(s, g).keywords).toEqual(expect.arrayContaining(['aerial', 'vanguard']));
  });

  it('storm-gustcaller: Dawn gives a random ally +1|+0 this round', () => {
    const s = board({ line: [['storm-gustcaller', 'zz-wall'], []] });
    pass(s); pass(s);
    // Only one possible random ally (the wall)
    expect(st(s, unit(s, 0, 'zz-wall')).power).toBe(1);
  });

  it('storm-dispatcher: Deploy gives an ally +2|+0 and Aerial this round', () => {
    const s = board({ hand: [['storm-dispatcher'], []], line: [['zz-grunt'], ['zz-grunt']] });
    const g = unit(s, 0, 'zz-grunt');
    play(s, 'storm-dispatcher', [g.iid]);
    expect(st(s, g).power).toBe(4);
    expect(st(s, g).keywords).toContain('aerial');
  });

  it('storm-galecourier: Aerial; Spire strike adds 1 more Spire damage', () => {
    const s = board({ line: [['storm-galecourier'], []] });
    attack(s, [unit(s, 0, 'storm-galecourier')]);
    resolveCombat(s);
    expect(s.players[1].spire).toBe(20 - 3 - 1);
  });

  it('storm-sparkrider: Assault gives me +1|+0 this round', () => {
    const s = board({ line: [['storm-sparkrider'], []] });
    attack(s, [unit(s, 0, 'storm-sparkrider')]);
    resolveCombat(s);
    expect(s.players[1].spire).toBe(16);
  });

  it('storm-squadcaller: Deploy summons a Wingmate', () => {
    const s = board({ hand: [['storm-squadcaller'], []] });
    play(s, 'storm-squadcaller');
    expect(names(s, 0)).toEqual(['storm-squadcaller', 'storm-wingmate']);
  });

  it('storm-railmarshal: Assault rallies when few attackers were declared, not when many', () => {
    const s = board({ line: [['storm-railmarshal'], []] });
    attack(s, [unit(s, 0, 'storm-railmarshal')]);
    resolveCombat(s);
    expect(s.players[0].canAttack).toBe(true);
    const t = board({ line: [['storm-railmarshal', 'zz-grunt', 'zz-grunt'], []] });
    attack(t, [unit(t, 0, 'storm-railmarshal'), unit(t, 0, 'zz-grunt', 0), unit(t, 0, 'zz-grunt', 1)]);
    resolveCombat(t);
    expect(t.players[0].canAttack).toBe(false);
  });

  it('storm-thunderkite: Aerial, Vanguard 4|3', () => {
    const s = board({ line: [['storm-thunderkite'], ['zz-grunt']] });
    attack(s, [unit(s, 0, 'storm-thunderkite')]);
    resolveCombat(s);
    expect(s.players[1].spire).toBe(16);
    expect(st(s, unit(s, 0, 'storm-thunderkite')).keywords).toEqual(expect.arrayContaining(['aerial', 'vanguard']));
  });

  it('storm-stormcaller: Assault gives attacking allies +1|+0 and Aerial this round', () => {
    const s = board({ line: [['storm-stormcaller', 'zz-grunt'], ['zz-grunt']] });
    const g = unit(s, 0, 'zz-grunt');
    attack(s, [g]); // grunt alone: Stormcaller is not attacking
    resolveCombat(s);
    expect(s.players[1].spire).toBe(18); // not buffed
    const t = board({ line: [['storm-stormcaller', 'zz-grunt'], ['zz-grunt']] });
    attack(t, [unit(t, 0, 'storm-stormcaller'), unit(t, 0, 'zz-grunt')]);
    expect(st(t, unit(t, 0, 'zz-grunt'))).toMatchObject({ power: 3 });
    expect(st(t, unit(t, 0, 'zz-grunt')).keywords).toContain('aerial');
    resolveCombat(t);
    expect(t.players[1].spire).toBe(20 - 5 - 3);
  });

  it('storm-cyclonebarge: Dawn summons a Wingmate; Resonant gives +1|+1', () => {
    const s = board({ line: [['storm-cyclonebarge', 'storm-jax'], []] });
    const b = unit(s, 0, 'storm-cyclonebarge');
    expect(st(s, b)).toMatchObject({ power: 5, health: 5 });
    pass(s); pass(s);
    expect(names(s, 0)).toEqual(['storm-cyclonebarge', 'storm-jax', 'storm-wingmate']);
    resonant(s);
    expect(st(s, b)).toMatchObject({ power: 6, health: 6 });
  });

  it('storm-tempestliner: Aerial, Vanguard; Spire strike adds 2 Spire damage', () => {
    const s = board({ line: [['storm-tempestliner'], []] });
    attack(s, [unit(s, 0, 'storm-tempestliner')]);
    resolveCombat(s);
    expect(s.players[1].spire).toBe(20 - 6 - 2);
  });

  it('storm-tailwind: an ally gets +1|+1 this round', () => {
    const s = board({ hand: [['storm-tailwind'], []], line: [['zz-grunt'], []] });
    const g = unit(s, 0, 'zz-grunt');
    play(s, 'storm-tailwind', [g.iid]);
    expect(st(s, g)).toMatchObject({ power: 3, health: 3 });
  });

  it('storm-updraft: an ally gets +1|+0 and Aerial this round', () => {
    const s = board({ hand: [['storm-updraft'], []], line: [['zz-grunt'], ['zz-grunt']] });
    const g = unit(s, 0, 'zz-grunt');
    play(s, 'storm-updraft', [g.iid]);
    expect(st(s, g).power).toBe(3);
    attack(s, [g]);
    resolveCombat(s);
    expect(s.players[1].spire).toBe(17); // the Grunt could not block an Aerial attacker
  });

  it('storm-crosswind: puts an enemy unit in Stasis so it cannot block', () => {
    const s = board({ hand: [['storm-crosswind'], []], line: [['zz-grunt'], ['zz-grunt']] });
    const e = unit(s, 1, 'zz-grunt');
    play(s, 'storm-crosswind', [e.iid]);
    expect(e.stasis).toBe(true);
    attack(s, [unit(s, 0, 'zz-grunt')]);
    resolveCombat(s);
    expect(s.players[1].spire).toBe(18);
  });

  it('storm-galesurge: allies get +2|+0 this round', () => {
    const s = board({ hand: [['storm-galesurge'], []], line: [['zz-grunt', 'zz-wall'], []] });
    play(s, 'storm-galesurge');
    pass(s);
    expect(st(s, unit(s, 0, 'zz-grunt')).power).toBe(4);
    expect(st(s, unit(s, 0, 'zz-wall')).power).toBe(2);
  });

  it('storm-reroute: after attacking, you may attack again', () => {
    const s = board({ hand: [['storm-reroute'], []], line: [['zz-grunt'], []] });
    const g = unit(s, 0, 'zz-grunt');
    attack(s, [g]);
    resolveCombat(s);
    expect(s.players[0].canAttack).toBe(false);
    pass(s); // defender passes priority back
    play(s, 'storm-reroute');
    pass(s);
    expect(s.players[0].canAttack).toBe(true);
    pass(s); // the opponent holds priority after the glyph resolves
    act(s, { type: 'declare', unit: g.iid });
  });

  it('storm-skyhook: returns an enemy unit to its owner\'s hand', () => {
    const s = board({ hand: [['storm-skyhook'], []], line: [[], ['ember-ashrunner']] });
    play(s, 'storm-skyhook', [unit(s, 1, 'ember-ashrunner').iid]);
    pass(s);
    expect(names(s, 1)).toEqual([]);
    expect(s.players[1].hand.map((h) => h.card)).toEqual(['ember-ashrunner']);
  });

  it('storm-jetstream: allies gain Aerial this round; Resonant also rallies', () => {
    const s = board({ hand: [['storm-jetstream'], []], line: [['zz-grunt'], []] });
    play(s, 'storm-jetstream');
    pass(s);
    expect(st(s, unit(s, 0, 'zz-grunt')).keywords).toContain('aerial');
    expect(s.players[0].canAttack).toBe(true); // already true before attacking; rally adds nothing
    const t = board({ hand: [['storm-jetstream'], []], line: [['storm-jax', 'zz-grunt'], []] });
    t.players[0].ascended = ['storm-jax'];
    attack(t, [unit(t, 0, 'zz-grunt')]);
    resolveCombat(t);
    expect(t.players[0].canAttack).toBe(false);
    pass(t);
    play(t, 'storm-jetstream');
    pass(t);
    expect(t.players[0].canAttack).toBe(true);
  });

  it('storm-airmail: Ritual draws 2 cards', () => {
    const s = board({ hand: [['storm-airmail'], []] });
    play(s, 'storm-airmail');
    pass(s);
    expect(s.players[0].hand.length).toBe(2);
  });

  it('storm-skyraid: Ritual gives allies +2|+0 and Vanguard this round and draws a card', () => {
    const s = board({ hand: [['storm-skyraid'], []], line: [['zz-grunt'], []] });
    play(s, 'storm-skyraid');
    pass(s);
    const g = unit(s, 0, 'zz-grunt');
    expect(st(s, g).power).toBe(4);
    expect(st(s, g).keywords).toContain('vanguard');
    expect(s.players[0].hand.length).toBe(1);
  });
});

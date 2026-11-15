// The combat forecast is read only from stats() and the rules text; here it is checked against what the real engine
// does when the same pair resolves, across powers, healths, Plated, Ward, Vanguard, Pierce and Corrosive.
import { describe, expect, it } from 'vitest';
import { act, board, place, resolveCombat } from './helpers';
import type { Keyword, Unit } from '../src/engine/types';
import { findUnit } from '../src/engine/query';
import { forecast } from '../src/client/board';

interface Spec { power: number; hp: number; kw?: Keyword; ward?: boolean }

function setup(a: Spec, b: Spec) {
  const s = board({ line: [[], []], first: 0 });
  const mk = (seat: 0 | 1, sp: Spec): Unit => {
    const u = place(s, seat, 'zz-grunt'); // 2/2
    u.mods.push({ power: sp.power - 2, health: sp.hp - 2, dur: 'perm', kw: sp.kw ? [sp.kw] : undefined });
    u.ward = !!sp.ward;
    return u;
  };
  const att = mk(0, a);
  const blk = mk(1, b);
  act(s, { type: 'declare', unit: att.iid });
  act(s, { type: 'attack' });
  return { s, att, blk };
}

describe('forecast', () => {
  it('an unblocked attacker shows its power to the Spire and the engine agrees', () => {
    for (const power of [0, 1, 4]) {
      const { s, att } = setup({ power, hp: 3 }, { power: 1, hp: 1 });
      const f = forecast(s, 0)!;
      expect(f.kind).toBe('open');
      expect(f.spire).toBe(power);
      expect(f.text).toBe(`${power} to the Spire`);
      act(s, { type: 'blocks' });
      const before = s.players[1].spire;
      resolveCombat(s);
      expect(before - s.players[1].spire).toBe(power);
      expect(findUnit(s, att.iid)).toBeDefined();
    }
  });

  it('returns null for a pair that does not exist', () => {
    const { s } = setup({ power: 1, hp: 1 }, { power: 1, hp: 1 });
    expect(forecast(s, 3)).toBeNull();
    expect(forecast(board(), 0)).toBeNull();
  });

  it('matches the engine for every combination of powers, healths and keywords', () => {
    const attKw: (Keyword | undefined)[] = [undefined, 'vanguard', 'pierce', 'corrosive', 'plated'];
    const blkKw: (Keyword | undefined)[] = [undefined, 'plated', 'corrosive'];
    const wards: ('none' | 'att' | 'blk')[] = ['none', 'att', 'blk'];
    let n = 0;
    for (const ap of [0, 1, 3, 5]) for (const ah of [1, 3]) for (const bp of [0, 2, 4]) for (const bh of [1, 2, 4])
      for (const ak of attKw) for (const bk of blkKw) for (const w of wards) {
        const a: Spec = { power: ap, hp: ah, kw: ak, ward: w === 'att' };
        const b: Spec = { power: bp, hp: bh, kw: bk, ward: w === 'blk' };
        const { s, att, blk } = setup(a, b);
        act(s, { type: 'block', unit: blk.iid, att: att.iid });
        const f = forecast(s, 0)!;
        const label = JSON.stringify({ a, b });
        expect(f.kind, label).toBe('blocked');
        expect(f.aPower, label).toBe(ap);
        expect(f.bPower, label).toBe(bp);
        act(s, { type: 'blocks' });
        const spire = s.players[1].spire;
        resolveCombat(s);
        expect(findUnit(s, att.iid) === undefined, `attacker destroyed ${label}`).toBe(f.attDestroyed);
        expect(findUnit(s, blk.iid) === undefined, `blocker destroyed ${label}`).toBe(f.blkDestroyed);
        expect(spire - s.players[1].spire, `spire ${label}`).toBe(f.spire);
        n += 1;
      }
    expect(n).toBe(4 * 2 * 3 * 3 * 5 * 3 * 3);
  });

  it('a blocker that is gone lets only Pierce through (R-B7)', () => {
    for (const kw of [undefined, 'pierce'] as (Keyword | undefined)[]) {
      const { s, att, blk } = setup({ power: 3, hp: 3, kw }, { power: 1, hp: 1 });
      act(s, { type: 'block', unit: blk.iid, att: att.iid });
      act(s, { type: 'blocks' });
      s.combat!.pairs[0].blk = ''; // as if put in Stasis during the combat window (R-B8)
      const f = forecast(s, 0)!;
      expect(f.kind).toBe('gone');
      const before = s.players[1].spire;
      resolveCombat(s);
      expect(before - s.players[1].spire).toBe(f.spire);
      expect(f.spire).toBe(kw === 'pierce' ? 3 : 0);
    }
  });

  it('reads current health, not printed health', () => {
    const { s, att, blk } = setup({ power: 2, hp: 3 }, { power: 1, hp: 4 });
    blk.dmg = 2; // two health left: the strike of 2 now destroys it
    act(s, { type: 'block', unit: blk.iid, att: att.iid });
    const f = forecast(s, 0)!;
    expect(f.bHp).toBe(2);
    expect(f.blkDestroyed).toBe(true);
    expect(f.attDestroyed).toBe(false);
    expect(f.text).toBe('2 vs 1 · attacker survives · blocker is destroyed');
  });
});

// One behaviour test per Mirrorwatch card (set x1). Test names start with the card id.
// Copies need real (non-token) cards to copy: the tide cards below are plain base-set units and a Swift glyph.
import { describe, expect, it } from 'vitest';
import { act, applyAction, attack, board, pass, play, resolveCombat, st, unit } from '../helpers';
import { costOf, isAscended } from '../../src/engine/query';

type G = ReturnType<typeof board>;
const endRound = (s: G): void => { pass(s); pass(s); };
const inHand = (s: G, seat: 0 | 1, card: string) => s.players[seat].hand.filter((h) => h.card === card);
const tryPlay = (s: G, card: string, targets: string[] = []) => {
  const hc = s.players[s.priority].hand.find((h) => h.card === card);
  if (!hc) throw new Error(`${card} not in hand`);
  return applyAction(s, targets.length ? { type: 'play', iid: hc.iid, targets } : { type: 'play', iid: hc.iid });
};
const SMALL = 'tide-sluicepage'; // 1|1
const MID = 'tide-deepwateroracle'; // 3|5
const BIG = 'tide-gateleviathan'; // 5|7
const SWIFT = 'tide-quickcurrent'; // Swift: draw 1

describe('mirror cards', () => {
  // ---------- heroes ----------
  it('mirror-sabeline: Deploy steals a Glimmer copy; ascends on the 6th copy, takes a lasting copy of the strongest, then a Glimmer one each Dawn', () => {
    const s = board({ hand: [['mirror-sabeline'], []], line: [[], [SMALL, BIG]] });
    s.players[0].heroes = ['mirror-sabeline'];
    s.players[0].seen.copiesMade = 5;
    play(s, 'mirror-sabeline', [unit(s, 1, SMALL).iid]);
    expect(inHand(s, 0, SMALL)).toMatchObject([{ glimmer: true }]);
    expect(isAscended(s, 0, 'mirror-sabeline')).toBe(true);
    const lasting = inHand(s, 0, BIG);
    expect(lasting).toHaveLength(1);
    expect(lasting[0].glimmer).toBeUndefined();
    expect(st(s, unit(s, 0, 'mirror-sabeline'))).toMatchObject({ power: 3, health: 4 });
    endRound(s); // the Glimmer copy fades; Dawn brings a Glimmer copy of the Leviathan
    expect(inHand(s, 0, SMALL)).toHaveLength(0);
    expect(inHand(s, 0, BIG).filter((h) => h.glimmer)).toHaveLength(1);
  });

  it('mirror-ottavine: Dawn makes a Glimmer Spark; the 6th Glimmer card played ascends her for 2 Charge and two more Sparks', () => {
    const s = board({ line: [['mirror-ottavine'], ['zz-wall']] });
    s.players[0].heroes = ['mirror-ottavine'];
    s.players[0].seen.glimmerPlayed = 5;
    endRound(s);
    expect(inHand(s, 0, 'mirror-spark')).toMatchObject([{ glimmer: true }]);
    pass(s); // seat 1 holds the Initiative in round 2
    const charge = s.players[0].charge;
    s.players[0].reserve = 0;
    play(s, 'mirror-spark', [unit(s, 1, 'zz-wall').iid]);
    expect(unit(s, 1, 'zz-wall').dmg).toBe(1);
    expect(isAscended(s, 0, 'mirror-ottavine')).toBe(true);
    expect(s.players[0].charge).toBe(charge - 1 + 2);
    expect(inHand(s, 0, 'mirror-spark').filter((h) => h.glimmer)).toHaveLength(2);
  });

  it('mirror-wystan: Veiled; draws on a Spire hit; ascends at 12 Spire damage, veils his allies and hits the Spire per ally', () => {
    const t = board({ hand: [[], ['zz-zap']], line: [['mirror-wystan'], []], first: 1 });
    expect(tryPlay(t, 'zz-zap', [unit(t, 0, 'mirror-wystan').iid]).ok).toBe(false);
    const s = board({ line: [['mirror-wystan', 'zz-grunt'], []] });
    s.players[0].heroes = ['mirror-wystan'];
    s.players[0].seen.spireDamage = 9;
    attack(s, [unit(s, 0, 'mirror-wystan')]);
    resolveCombat(s);
    expect(s.players[0].hand).toHaveLength(1);
    expect(isAscended(s, 0, 'mirror-wystan')).toBe(true);
    expect(s.players[1].spire).toBe(20 - 3 - 2);
    expect(st(s, unit(s, 0, 'zz-grunt')).keywords).toContain('veiled');
  });

  it('mirror-ondrine: an enemy glyph pings the enemy Spire; at 10 glyph damage she ascends, hits the strongest for 3, then punishes every glyph wider', () => {
    const s = board({ hand: [[], ['zz-zap', 'zz-zap']], line: [['mirror-ondrine'], ['zz-ogre', 'zz-grunt']], first: 1 });
    s.players[0].heroes = ['mirror-ondrine'];
    s.players[0].seen.glyphDamage = 9;
    play(s, 'zz-zap', [unit(s, 0, 'mirror-ondrine').iid]);
    expect(s.players[1].spire).toBe(19);
    expect(isAscended(s, 0, 'mirror-ondrine')).toBe(true);
    expect(unit(s, 1, 'zz-ogre').dmg).toBe(3);
    play(s, 'zz-zap', [unit(s, 0, 'mirror-ondrine').iid]);
    expect(s.players[1].spire).toBe(18);
    expect(unit(s, 1, 'zz-ogre').dmg).toBe(4);
    expect(unit(s, 1, 'zz-grunt').dmg).toBe(1);
  });

  // ---------- units ----------
  it('mirror-glintpicker: Deploy copies a small enemy as Glimmer; a 3-power enemy is not a legal choice', () => {
    const s = board({ hand: [['mirror-glintpicker', 'mirror-glintpicker'], []], line: [[], [SMALL, MID]] });
    expect(tryPlay(s, 'mirror-glintpicker', [unit(s, 1, MID).iid]).ok).toBe(false);
    play(s, 'mirror-glintpicker', [unit(s, 1, SMALL).iid]);
    expect(inHand(s, 0, SMALL)).toMatchObject([{ glimmer: true }]);
    expect(s.players[0].seen.copiesMade).toBe(1);
  });

  it('mirror-veilrunner: Veiled; grows by +1|+0 each time it strikes the enemy Spire', () => {
    const s = board({ line: [['mirror-veilrunner'], []] });
    const r = unit(s, 0, 'mirror-veilrunner');
    expect(st(s, r).keywords).toContain('veiled');
    attack(s, [r]);
    resolveCombat(s);
    expect(s.players[1].spire).toBe(19);
    expect(st(s, r).power).toBe(2);
  });

  it('mirror-sparkglazier: Deploy creates a Glimmer Glass Spark that deals 1', () => {
    const s = board({ hand: [['mirror-sparkglazier'], []], line: [[], ['zz-wall']] });
    play(s, 'mirror-sparkglazier');
    expect(inHand(s, 0, 'mirror-spark')).toMatchObject([{ glimmer: true }]);
    pass(s);
    play(s, 'mirror-spark', [unit(s, 1, 'zz-wall').iid]);
    expect(unit(s, 1, 'zz-wall').dmg).toBe(1);
    expect(s.players[0].seen.glimmerPlayed).toBe(1);
  });

  it('mirror-panesentry: an enemy glyph makes it deal 1 to the weakest enemy', () => {
    const s = board({ hand: [[], ['zz-zap']], line: [['mirror-panesentry'], ['zz-grunt', 'zz-wall']], first: 1 });
    play(s, 'zz-zap', [unit(s, 0, 'mirror-panesentry').iid]);
    expect(unit(s, 1, 'zz-wall').dmg).toBe(1);
    expect(unit(s, 1, 'zz-grunt').dmg).toBe(0);
  });

  it('mirror-twincourier: Deploy puts a Glimmer copy of another ally in hand', () => {
    const s = board({ hand: [['mirror-twincourier'], []], line: [[MID], []] });
    play(s, 'mirror-twincourier', [unit(s, 0, MID).iid]);
    expect(inHand(s, 0, MID)).toMatchObject([{ glimmer: true }]);
  });

  it('mirror-backstairknife: Veiled; Resonant gives +1|+1', () => {
    const s = board({ line: [['mirror-backstairknife', 'mirror-wystan'], []] });
    const k = unit(s, 0, 'mirror-backstairknife');
    expect(st(s, k)).toMatchObject({ power: 3, health: 1 });
    expect(st(s, k).keywords).toContain('veiled');
    s.players[0].ascended = ['mirror-wystan'];
    expect(st(s, k)).toMatchObject({ power: 4, health: 2 });
  });

  it('mirror-lanternmimic: Deploy grows +1|+1 per glyph cast this round', () => {
    const s = board({ hand: [['zz-zap', 'zz-zap', 'mirror-lanternmimic'], []], line: [[], ['zz-wall']] });
    play(s, 'zz-zap', [unit(s, 1, 'zz-wall').iid]);
    play(s, 'zz-zap', [unit(s, 1, 'zz-wall').iid]);
    play(s, 'mirror-lanternmimic');
    expect(st(s, unit(s, 0, 'mirror-lanternmimic'))).toMatchObject({ power: 4, health: 4 });
  });

  it('mirror-facethief: a destroyed enemy comes back to your hand as a Glimmer copy', () => {
    const s = board({ hand: [['zz-bolt'], []], line: [['mirror-facethief'], [SMALL]] });
    play(s, 'zz-bolt', [unit(s, 1, SMALL).iid]);
    pass(s);
    expect(s.players[1].line).toHaveLength(0);
    expect(inHand(s, 0, SMALL)).toMatchObject([{ glimmer: true }]);
  });

  it('mirror-polishedbulwark: an enemy glyph gives it Ward before the glyph lands', () => {
    const s = board({ hand: [[], ['zz-zap']], line: [['mirror-polishedbulwark'], []], first: 1 });
    const b = unit(s, 0, 'mirror-polishedbulwark');
    play(s, 'zz-zap', [b.iid]);
    expect(b.dmg).toBe(0);
    expect(s.log.some((e) => e.k === 'ward' && e.tunit === b.iid)).toBe(true);
  });

  it('mirror-echoscribe: +1|+0 this round per glyph; Resonant makes your glyphs cost 1 less', () => {
    const s = board({ hand: [['zz-zap'], []], line: [['mirror-echoscribe', 'mirror-wystan'], ['zz-wall']] });
    const e = unit(s, 0, 'mirror-echoscribe');
    expect(costOf(s, 0, 'zz-zap')).toBe(1);
    play(s, 'zz-zap', [unit(s, 1, 'zz-wall').iid]);
    expect(st(s, e).power).toBe(3);
    s.players[0].ascended = ['mirror-wystan'];
    expect(costOf(s, 0, 'zz-zap')).toBe(0);
  });

  it('mirror-whisperbroker: Veiled, Dread: no enemy glyph can choose it and a 2-power unit cannot block it', () => {
    const t = board({ hand: [[], ['zz-zap']], line: [['mirror-whisperbroker'], []], first: 1 });
    expect(tryPlay(t, 'zz-zap', [unit(t, 0, 'mirror-whisperbroker').iid]).ok).toBe(false);
    const s = board({ line: [['mirror-whisperbroker'], ['zz-grunt']] });
    const w = unit(s, 0, 'mirror-whisperbroker');
    act(s, { type: 'declare', unit: w.iid });
    act(s, { type: 'attack' });
    expect(s.phase).toBe('combat'); // the 2-power grunt is no legal blocker, so the block step is skipped
    resolveCombat(s);
    expect(s.players[1].spire).toBe(17);
  });

  it('mirror-masquedancer: Deploy gives an ally Veiled and +1|+0', () => {
    const s = board({ hand: [['mirror-masquedancer'], []], line: [['zz-grunt'], []] });
    play(s, 'mirror-masquedancer', [unit(s, 0, 'zz-grunt').iid]);
    const g = unit(s, 0, 'zz-grunt');
    expect(st(s, g).power).toBe(3);
    expect(st(s, g).keywords).toContain('veiled');
  });

  it('mirror-shardcantor: an enemy glyph makes it deal 2 to a random enemy', () => {
    const s = board({ hand: [[], ['zz-zap']], line: [['mirror-shardcantor'], ['zz-wall']], first: 1 });
    play(s, 'zz-zap', [unit(s, 0, 'mirror-shardcantor').iid]);
    expect(unit(s, 1, 'zz-wall').dmg).toBe(2);
  });

  it('mirror-gallerycopyist: Shatter puts a lasting copy of the strongest enemy in hand', () => {
    const s = board({ line: [['mirror-gallerycopyist'], [BIG]] });
    const c = unit(s, 0, 'mirror-gallerycopyist');
    attack(s, [c], [[unit(s, 1, BIG), c]]);
    resolveCombat(s);
    expect(s.players[0].line).toHaveLength(0);
    const copies = inHand(s, 0, BIG);
    expect(copies).toHaveLength(1);
    expect(copies[0].glimmer).toBeUndefined();
  });

  it('mirror-lookingglassgolem: an enemy glyph summons a Reflection', () => {
    const s = board({ hand: [[], ['zz-zap']], line: [['mirror-lookingglassgolem'], []], first: 1 });
    play(s, 'zz-zap', [unit(s, 0, 'mirror-lookingglassgolem').iid]);
    expect(st(s, unit(s, 0, 'mirror-reflection'))).toMatchObject({ power: 1, health: 1 });
  });

  it('mirror-rooftopinformant: Veiled; Assault deals 2 to the enemy Spire even when blocked', () => {
    const s = board({ line: [['mirror-rooftopinformant'], ['zz-wall']] });
    const r = unit(s, 0, 'mirror-rooftopinformant');
    expect(st(s, r).keywords).toContain('veiled');
    attack(s, [r], [[unit(s, 1, 'zz-wall'), r]]);
    resolveCombat(s);
    expect(s.players[1].spire).toBe(18);
  });

  it('mirror-choirofechoes: the second glyph in a round draws 1, the first does not', () => {
    const s = board({ hand: [['zz-zap', 'zz-zap'], []], line: [['mirror-choirofechoes'], ['zz-wall']] });
    play(s, 'zz-zap', [unit(s, 1, 'zz-wall').iid]);
    expect(s.players[0].hand).toHaveLength(1);
    play(s, 'zz-zap', [unit(s, 1, 'zz-wall').iid]);
    expect(s.players[0].hand).toHaveLength(1);
    expect(s.players[0].hand[0].card).toBe('zz-filler');
  });

  it('mirror-curatoroffaces: Deploy puts a lasting copy of an enemy unit in hand', () => {
    const s = board({ hand: [['mirror-curatoroffaces'], []], line: [[], [BIG]] });
    play(s, 'mirror-curatoroffaces', [unit(s, 1, BIG).iid]);
    const copies = inHand(s, 0, BIG);
    expect(copies).toHaveLength(1);
    expect(copies[0].glimmer).toBeUndefined();
  });

  it('mirror-silveredbastion: an enemy glyph makes it deal 1 to every enemy unit', () => {
    const s = board({ hand: [[], ['zz-zap']], line: [['mirror-silveredbastion'], ['zz-grunt', 'zz-wall']], first: 1 });
    play(s, 'zz-zap', [unit(s, 0, 'mirror-silveredbastion').iid]);
    expect(unit(s, 1, 'zz-grunt').dmg).toBe(1);
    expect(unit(s, 1, 'zz-wall').dmg).toBe(1);
  });

  it('mirror-shadowglassassassin: Veiled, Dread; a Spire hit deals 2 more', () => {
    const s = board({ line: [['mirror-shadowglassassassin'], ['zz-grunt']] });
    const a = unit(s, 0, 'mirror-shadowglassassassin');
    expect(st(s, a).keywords).toEqual(expect.arrayContaining(['veiled', 'dread']));
    act(s, { type: 'declare', unit: a.iid });
    act(s, { type: 'attack' });
    expect(s.phase).toBe('combat'); // the 2-power grunt is no legal blocker, so the block step is skipped
    resolveCombat(s);
    expect(s.players[1].spire).toBe(20 - 6 - 2);
  });

  it('mirror-echocolossus: each glyph you cast deals 1 to the enemy Spire', () => {
    const s = board({ hand: [['zz-zap', 'zz-zap'], []], line: [['mirror-echocolossus'], ['zz-wall']] });
    play(s, 'zz-zap', [unit(s, 1, 'zz-wall').iid]);
    play(s, 'zz-zap', [unit(s, 1, 'zz-wall').iid]);
    expect(s.players[1].spire).toBe(18);
  });

  it('mirror-glasswingdreadnought: Veiled, Aerial; Deploy puts a Glimmer copy of the strongest enemy in hand', () => {
    const s = board({ hand: [['mirror-glasswingdreadnought'], []], line: [[], [SMALL, BIG]] });
    play(s, 'mirror-glasswingdreadnought');
    expect(inHand(s, 0, BIG)).toMatchObject([{ glimmer: true }]);
    expect(inHand(s, 0, SMALL)).toHaveLength(0);
    expect(st(s, unit(s, 0, 'mirror-glasswingdreadnought')).keywords).toEqual(expect.arrayContaining(['veiled', 'aerial']));
  });

  // ---------- glyphs ----------
  it('mirror-flickeredge: Reprise; +1|+1 this round, then the Glimmer copy gives another +1|+1', () => {
    const s = board({ hand: [['mirror-flickeredge'], []], line: [['zz-grunt'], []] });
    const g = unit(s, 0, 'zz-grunt');
    play(s, 'mirror-flickeredge', [g.iid]);
    expect(st(s, g)).toMatchObject({ power: 3, health: 3 });
    expect(inHand(s, 0, 'mirror-flickeredge')).toMatchObject([{ glimmer: true, plain: true }]);
    play(s, 'mirror-flickeredge', [g.iid]);
    expect(st(s, g)).toMatchObject({ power: 4, health: 4 });
    expect(inHand(s, 0, 'mirror-flickeredge')).toHaveLength(0);
  });

  it('mirror-echoneedle: Reprise; deals 1, and its Glimmer copy deals 1 more', () => {
    const s = board({ hand: [['mirror-echoneedle'], []], line: [[], ['zz-wall']] });
    const w = unit(s, 1, 'zz-wall');
    play(s, 'mirror-echoneedle', [w.iid]);
    expect(w.dmg).toBe(1);
    play(s, 'mirror-echoneedle', [w.iid]);
    expect(w.dmg).toBe(2);
  });

  it('mirror-sleightofglass: an ally gains Veiled, so enemy glyphs cannot choose it', () => {
    const s = board({ hand: [['mirror-sleightofglass'], ['zz-zap']], line: [['zz-grunt'], []] });
    const g = unit(s, 0, 'zz-grunt');
    play(s, 'mirror-sleightofglass', [g.iid]);
    expect(st(s, g).keywords).toContain('veiled');
    pass(s);
    expect(tryPlay(s, 'zz-zap', [g.iid]).ok).toBe(false);
  });

  it('mirror-glanceback: puts a Glimmer copy of an enemy unit in hand', () => {
    const s = board({ hand: [['mirror-glanceback'], []], line: [[], [MID]] });
    play(s, 'mirror-glanceback', [unit(s, 1, MID).iid]);
    expect(inHand(s, 0, MID)).toMatchObject([{ glimmer: true }]);
  });

  it('mirror-splitimage: summons two Reflections; Resonant summons three', () => {
    const s = board({ hand: [['mirror-splitimage'], []] });
    play(s, 'mirror-splitimage');
    expect(s.players[0].line.filter((u) => u.card === 'mirror-reflection')).toHaveLength(2);
    const t = board({ hand: [['mirror-splitimage'], []], line: [['mirror-wystan'], []] });
    t.players[0].ascended = ['mirror-wystan'];
    play(t, 'mirror-splitimage');
    expect(t.players[0].line.filter((u) => u.card === 'mirror-reflection')).toHaveLength(3);
  });

  it('mirror-falseglare: Reprise; -2|+0 this round, twice', () => {
    const s = board({ hand: [['mirror-falseglare'], []], line: [[], ['zz-ogre']] });
    const o = unit(s, 1, 'zz-ogre');
    play(s, 'mirror-falseglare', [o.iid]);
    pass(s);
    expect(st(s, o).power).toBe(3);
    pass(s); // the opponent of the stack's starter acts first
    play(s, 'mirror-falseglare', [o.iid]);
    pass(s);
    expect(st(s, o).power).toBe(1);
  });

  it('mirror-stolenverse: copies an enemy glyph on the stack as Glimmer; Resonant makes the copy lasting', () => {
    const s = board({ hand: [['mirror-stolenverse'], [SWIFT]], first: 1 });
    play(s, SWIFT);
    play(s, 'mirror-stolenverse', [s.stack[0].sid]);
    pass(s);
    expect(inHand(s, 0, SWIFT)).toMatchObject([{ glimmer: true }]);
    const t = board({ hand: [['mirror-stolenverse'], [SWIFT]], line: [['mirror-wystan'], []], first: 1 });
    t.players[0].ascended = ['mirror-wystan'];
    play(t, SWIFT);
    play(t, 'mirror-stolenverse', [t.stack[0].sid]);
    pass(t);
    const c = inHand(t, 0, SWIFT);
    expect(c).toHaveLength(1);
    expect(c[0].glimmer).toBeUndefined();
  });

  it('mirror-backdoorsignal: only Veiled allies get +2|+0 this round', () => {
    const s = board({ hand: [['mirror-backdoorsignal'], []], line: [['zz-veiled', 'zz-grunt'], []] });
    play(s, 'mirror-backdoorsignal');
    pass(s);
    expect(st(s, unit(s, 0, 'zz-veiled')).power).toBe(5);
    expect(st(s, unit(s, 0, 'zz-grunt')).power).toBe(2);
  });

  it('mirror-ricochetlight: Reprise; 2 to the enemy Spire, and the Glimmer copy 2 more', () => {
    const s = board({ hand: [['mirror-ricochetlight'], []] });
    play(s, 'mirror-ricochetlight', ['spire1']);
    pass(s);
    expect(s.players[1].spire).toBe(18);
    pass(s);
    play(s, 'mirror-ricochetlight', ['spire1']);
    pass(s);
    expect(s.players[1].spire).toBe(16);
  });

  it('mirror-reversepane: negates an enemy glyph and keeps a Glimmer copy of it', () => {
    const s = board({ hand: [['mirror-reversepane'], [SWIFT]], first: 1 });
    play(s, SWIFT);
    play(s, 'mirror-reversepane', [s.stack[0].sid]);
    pass(s);
    expect(s.players[1].hand).toHaveLength(0); // the draw never happened
    expect(inHand(s, 0, SWIFT)).toMatchObject([{ glimmer: true }]);
  });

  it('mirror-vanityglass: deals damage to an enemy unit equal to its own power', () => {
    const s = board({ hand: [['mirror-vanityglass'], []], line: [[], [BIG]] });
    play(s, 'mirror-vanityglass', [unit(s, 1, BIG).iid]);
    pass(s);
    expect(unit(s, 1, BIG).dmg).toBe(5);
  });

  it('mirror-nightofmasks: every ally gains Veiled; draw 1', () => {
    const s = board({ hand: [['mirror-nightofmasks'], []], line: [['zz-grunt', 'zz-wall'], []] });
    play(s, 'mirror-nightofmasks');
    pass(s);
    expect(st(s, unit(s, 0, 'zz-grunt')).keywords).toContain('veiled');
    expect(st(s, unit(s, 0, 'zz-wall')).keywords).toContain('veiled');
    expect(s.players[0].hand).toHaveLength(1);
  });

  it('mirror-encoreofglass: Reprise; draw 2 and a Glimmer copy comes back', () => {
    const s = board({ hand: [['mirror-encoreofglass'], []] });
    play(s, 'mirror-encoreofglass');
    pass(s);
    expect(s.players[0].hand.filter((h) => h.card === 'zz-filler')).toHaveLength(2);
    expect(inHand(s, 0, 'mirror-encoreofglass')).toMatchObject([{ glimmer: true }]);
  });

  it('mirror-hallofmirrors: a lasting copy of every enemy unit (tokens are skipped)', () => {
    const s = board({ hand: [['mirror-hallofmirrors'], []], line: [[], [SMALL, BIG, 'zz-grunt']] });
    play(s, 'mirror-hallofmirrors');
    pass(s);
    expect(s.players[0].hand.map((h) => h.card).sort()).toEqual([BIG, SMALL].sort());
    expect(s.players[0].hand.every((h) => !h.glimmer)).toBe(true);
  });
});

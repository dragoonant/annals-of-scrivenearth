import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { KEYWORDS } from '../src/engine/validate';
import '../src/data/cards/index';
import { allCards, def } from '../src/engine/query';
import type { CardDef } from '../src/engine/types';
import { KEYWORD_HELP, LOG_LINES, lineSegs, END_REASONS, PLAY_PROMPTS } from '../src/client/text';

describe('client text coverage', () => {
  const src = readFileSync(new URL('../src/engine/rules.ts', import.meta.url), 'utf8');
  const kinds = [...new Set([...src.matchAll(/k: '([A-Za-z]+)'/g)].map((m) => m[1]))];

  it('finds the engine log kinds', () => {
    expect(kinds.length).toBeGreaterThan(20);
  });
  it('every log kind the engine emits has a LOG_LINES entry that renders', () => {
    for (const k of kinds) {
      expect(LOG_LINES[k], `LOG_LINES.${k}`).toBeTypeOf('function');
      const segs = lineSegs({ k, r: 1, seat: 0, card: 'x-y', tcard: 'x-y', via: 'x-y', n: 1, m: 1, s: 'spire', unit: 'u1', tunit: 'u2' });
      expect(segs.length).toBeGreaterThan(0);
    }
  });
  it('an unknown log kind throws', () => {
    expect(() => lineSegs({ k: 'nope', r: 1 })).toThrow();
  });
  it('every keyword has help', () => {
    for (const k of KEYWORDS) expect(KEYWORD_HELP[k]?.text, k).toBeTruthy();
  });
  it('every end reason the engine uses has wording', () => {
    for (const r of ['spire', 'spires', 'deck', 'rounds', 'concede']) expect(END_REASONS[r]).toBeTruthy();
  });
});

describe('per-card target prompts', () => {
  const specCount = (d: CardDef): number[] => {
    const out: number[] = [];
    if (d.type === 'glyph') {
      if (d.targets?.length) out.push(d.targets.length);
      return out;
    }
    for (const f of [d, d.ascended]) {
      const dep = f?.abilities?.find((a) => a.on === 'deploy' && a.targets?.length);
      if (dep?.targets?.length) out.push(dep.targets.length);
    }
    return out;
  };
  it('every card that takes targets has a prompt per target slot', () => {
    let n = 0;
    for (const d of allCards()) {
      const counts = specCount(d);
      if (counts.length === 0) continue;
      n += 1;
      const p = PLAY_PROMPTS[d.id];
      expect(p, `PLAY_PROMPTS.${d.id}`).toBeDefined();
      for (const c of counts) expect(p.length, `${d.id} slots`).toBe(c);
      for (const line of p) expect(line.length, `${d.id} prompt`).toBeGreaterThan(10);
    }
    expect(n).toBeGreaterThan(30);
  });
  it('no prompt exists for a card that takes no targets', () => {
    for (const id of Object.keys(PLAY_PROMPTS)) expect(specCount(def(id)).length, id).toBeGreaterThan(0);
  });
});

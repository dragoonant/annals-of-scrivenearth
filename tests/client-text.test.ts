import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { KEYWORDS } from '../src/engine/validate';
import { KEYWORD_HELP, LOG_LINES, lineSegs, END_REASONS } from '../src/client/text';

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

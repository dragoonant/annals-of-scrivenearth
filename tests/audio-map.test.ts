// Every log kind the engine can emit is either voiced or deliberately silent (no kind is forgotten).
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { SILENT_KINDS, VOICED_KINDS } from '../src/audio/audio';

describe('audio map', () => {
  it('covers every engine log kind', () => {
    const src = readFileSync('src/engine/rules.ts', 'utf8');
    const kinds = [...new Set([...src.matchAll(/\bk: '([a-zA-Z]+)'/g)].map((m) => m[1]))];
    expect(kinds.length).toBeGreaterThan(25);
    const known = new Set([...SILENT_KINDS, ...VOICED_KINDS]);
    expect(kinds.filter((k) => !known.has(k))).toEqual([]);
  });
});

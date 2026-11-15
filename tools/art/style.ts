// One STYLE constant, byte-identical on every generation (changing one character starts a new set).
// Art direction (PLAN D13, Claude's pick for the crystal magitech city): crisp flat-shaded illustration,
// faceted light, blue-hour crystal skyline. Card illustrations use natural heroic proportions, described in
// measurements and materials only (owner rules 7 and 23).
import { existsSync, readFileSync } from 'node:fs';

export const STYLE =
  'crisp digital illustration, flat cel shading with hard-edged faceted highlights, clean confident linework, ' +
  'a city of pale cut crystal spires at the blue hour behind, luminous cyan and amber rim light, deep indigo shadows, ' +
  'adult heroic proportions about seven head-heights tall, stern composed expression, wordless and unlettered, full-bleed';

export const STYLE_GLYPH =
  'crisp digital illustration, flat cel shading with hard-edged faceted highlights, clean confident linework, ' +
  'a city of pale cut crystal spires at the blue hour behind, luminous cyan and amber light, deep indigo shadows, ' +
  'a single dramatic moment in tight framing, wordless and unlettered, full-bleed';

export interface Subject {
  /** Who or what is shown: one visual clause, written once per card. Measurements and materials, no names. */
  subject: string;
  /** What it is doing and where: this card's own scene. */
  scene: string;
}

const TEXT_MAGNETS = ['sign', 'signs', 'banner', 'banners', 'logo', 'emblem', 'book', 'books', 'map', 'maps', 'screen', 'screens', 'scroll', 'scrolls', 'letter', 'letters', 'poster', 'label', 'labels', 'newspaper', 'magazine', 'page', 'pages', 'inscription', 'writing', 'rune', 'runes', 'glyph', 'glyphs', 'text', 'title', 'caption'];
const NEGATIONS = ['no', 'not', 'without', 'never', 'none', "don't", 'nor'];
const COUNTS = ['three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'dozen', 'dozens', 'hundreds', 'thousands'];
const FRANCHISE = ['runeterra', 'riot', 'league', 'hearthstone', 'magic the gathering', 'pokemon', 'disney', 'ghibli', 'marvel', 'warhammer', 'arcane', 'final fantasy', 'zelda', 'blizzard', 'pixar', 'dreamworks'];
const VAGUE = ['shape', 'figure', 'creature', 'thing', 'being', 'cadaverous', 'hollow'];

/** The owner's rule 23 word list lives only in the knowledge base; read it from there so it is never copied. */
export function rule23Words(): string[] {
  const paths = ['docs/knowledge-base/rules.md', '/home/user/tabletop-kb/rules.md'];
  const p = paths.find(existsSync);
  if (!p) throw new Error('rule 23 word list not found: run `git submodule update --init` (docs/knowledge-base)');
  const line = readFileSync(p, 'utf8').split('\n').find((l) => l.startsWith('23.'));
  const m = line?.match(/agent brief:\*\*\s*([^.]+)\./);
  if (!m) throw new Error('could not read the rule 23 word list from rules.md');
  return m[1].split(',').map((w) => w.trim().toLowerCase()).filter(Boolean);
}

/** Problems with one composed prompt. An empty list means it may be rendered. */
export function lintPrompt(id: string, cardName: string, prompt: string, banned: string[]): string[] {
  const out: string[] = [];
  const low = ` ${prompt.toLowerCase().replace(/seven head-heights/g, 'head-heights').replace(/[^a-z0-9' -]/g, ' ').replace(/\s+/g, ' ')} `;
  const has = (w: string): boolean => low.includes(` ${w} `);
  if (prompt.length > 900) out.push(`${id}: ${prompt.length} characters (limit 900)`);
  for (const w of TEXT_MAGNETS) if (has(w)) out.push(`${id}: text-magnet word "${w}"`);
  for (const w of NEGATIONS) if (has(w)) out.push(`${id}: negation "${w}" (diffusion reads the noun; say what IS there)`);
  for (const w of COUNTS) if (has(w)) out.push(`${id}: count above two ("${w}")`);
  if (/\b([3-9]|\d{2,})\b/.test(prompt.replace(/seven head-heights/g, ''))) out.push(`${id}: a numeral above two`);
  for (const w of FRANCHISE) if (low.includes(w)) out.push(`${id}: franchise or studio word "${w}"`);
  for (const w of VAGUE) if (has(w)) out.push(`${id}: vague noun "${w}" (name the thing)`);
  for (const w of banned) if (w.length > 2 ? low.includes(` ${w}`) : has(w)) out.push(`${id}: a word on the owner's rule 23 list`);
  for (const w of cardName.toLowerCase().split(/[^a-z]+/).filter((x) => x.length > 4)) {
    if (has(w) && !['crystal', 'glass', 'storm', 'spark', 'tower', 'spire', 'canal', 'coral', 'thorn', 'beast', 'titan', 'warden', 'guard', 'engine', 'forge', 'ember', 'flame', 'water', 'frost', 'light', 'shield', 'blade', 'rider', 'pilot', 'mother', 'queen', 'doctor', 'captain', 'admiral', 'alpha'].includes(w)) {
      out.push(`${id}: the card's own name word "${w}" (a proper noun invites lettering)`);
    }
  }
  return out;
}

export function compose(s: Subject, glyph: boolean): string {
  return `${s.subject}, ${s.scene}, ${glyph ? STYLE_GLYPH : STYLE}`;
}

// Lints every prompt, then writes tools/art/out/prompts.json. Refuses to write if anything fails (STYLE included).
import '../../src/data/cards/index';
import { mkdirSync, writeFileSync } from 'node:fs';
import { allCards } from '../../src/engine/query';
import { compose, lintPrompt, rule23Words, STYLE, STYLE_GLYPH } from './style';
import { SUBJECTS, EXTRA } from './subjects';

const banned = rule23Words();
const problems: string[] = [...lintPrompt('STYLE', '', STYLE, banned), ...lintPrompt('STYLE_GLYPH', '', STYLE_GLYPH, banned)];
const out: { id: string; prompt: string; aspect: string }[] = [];
const seen = new Map<string, string>();
for (const c of allCards().filter((x) => !x.id.startsWith('zz-'))) {
  const keys = c.ascended ? [c.id, `${c.id}--ascended`] : [c.id]; // heroes and units that Unfold (R-E5) have a second face
  for (const key of keys) {
    const s = SUBJECTS[key];
    if (!s) { problems.push(`${key}: no subject entry (every card needs its own subject and scene)`); continue; }
    const prompt = compose(s, c.type === 'glyph');
    problems.push(...lintPrompt(key, c.name, prompt, banned));
    const dup = seen.get(s.scene);
    if (dup) problems.push(`${key}: same scene clause as ${dup} (template prompts make template plates)`);
    seen.set(s.scene, key);
    out.push({ id: key, prompt, aspect: '3:2' });
  }
}
for (const [key, e] of Object.entries(EXTRA)) {
  problems.push(...lintPrompt(key, '', e.prompt, banned));
  out.push({ id: key, prompt: e.prompt, aspect: e.aspect });
}
for (const key of Object.keys(SUBJECTS)) if (!out.some((o) => o.id === key)) problems.push(`${key}: subject entry for a card that does not exist`);
if (problems.length) {
  console.error(`Prompt lint failed (${problems.length}):\n${problems.slice(0, 60).join('\n')}`);
  process.exit(1);
}
mkdirSync('tools/art/out', { recursive: true });
writeFileSync('tools/art/out/prompts.json', JSON.stringify(out, null, 1));
console.log(`prompts.json written: ${out.length} prompts, lint clean.`);

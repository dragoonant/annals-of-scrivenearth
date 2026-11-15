// Renders card art on the local Flux Studio (http://127.0.0.1:7880), one job at a time. Idempotent.
//   node tools/art/gen.mjs --dry-run            plan only, zero network calls
//   node tools/art/gen.mjs --sample             the three sample cards, then stop and LOOK
//   node tools/art/gen.mjs --limit 20           at most 20 new renders
//   node tools/art/gen.mjs --only tide-maren    exact id
//   node tools/art/gen.mjs --force --only <id>  re-render (the old master is archived first); --reroll N shifts the seed
// Masters go to art-masters/ (gitignored). Delivery files (640x427 WebP) go to public/art/ with manifest.json.
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync, readdirSync } from 'node:fs';

const args = process.argv.slice(2);
const flag = (n) => args.includes(`--${n}`);
const val = (n, d) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : d; };
const HOST = process.env.FLUX_URL ?? 'http://127.0.0.1:7880';
const SAMPLE = ['tide-maren', 'ember-crucible--ascended', 'storm-jax'];
const all = JSON.parse(readFileSync('tools/art/out/prompts.json', 'utf8'));
const only = val('only', null);
const reroll = Number(val('reroll', '0'));
let list = all.filter((p) => (only ? p.id === only : flag('sample') ? SAMPLE.includes(p.id) : true));
if (only && list.length === 0) { console.error(`no prompt with id ${only}`); process.exit(1); }
mkdirSync('art-masters/archive', { recursive: true });
mkdirSync('public/art', { recursive: true });
const master = (id) => `art-masters/${id}.png`;
const todo = list.filter((p) => flag('force') || !existsSync(master(p.id))).slice(0, Number(val('limit', '9999')));
console.log(`${all.length} prompts; ${list.length} selected; ${todo.length} to render; ${list.length - todo.length} already present.`);
if (flag('dry-run')) { for (const p of todo.slice(0, 10)) console.log(`  ${p.id}: ${p.prompt.slice(0, 110)}...`); process.exit(0); }

const seedOf = (id) => { let h = 2166136261; for (const ch of id) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return ((h >>> 0) % 2000000000) + reroll; };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function json(url, init) {
  for (let tries = 0; ; tries++) {
    const r = await fetch(url, init);
    if (r.status === 429 && tries < 6) { await sleep(5000 * (tries + 1)); continue; }
    if (!r.ok) throw new Error(`${url} -> HTTP ${r.status}`);
    return r.json();
  }
}
await json(`${HOST}/api/settings`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ freeAfter: false }) });
let done = 0;
for (const p of todo) {
  const { id: job } = await json(`${HOST}/api/jobs`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ model: 'klein', prompt: p.prompt, aspect: p.aspect, megapixels: 1, batch: 1, seed: seedOf(p.id) }),
  });
  let st;
  for (let i = 0; i < 240; i++) { st = await json(`${HOST}/api/jobs/${job}`); if (st.status === 'done' || st.status === 'error' || st.status === 'failed') break; await sleep(1000); }
  if (st.status !== 'done' || !st.images?.length) { console.error(`FAILED ${p.id}: ${st.status}`); continue; }
  const img = await fetch(`${HOST}/files/${job}/${st.images[0]}`);
  if (!img.ok) { console.error(`FAILED ${p.id}: download HTTP ${img.status}`); continue; }
  if (existsSync(master(p.id))) renameSync(master(p.id), `art-masters/archive/${p.id}-${Date.now()}.png`);
  writeFileSync(master(p.id), Buffer.from(await img.arrayBuffer()));
  console.log(`ok ${++done}/${todo.length} ${p.id}`);
}
await json(`${HOST}/api/settings`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ freeAfter: true }) });

// Delivery encode + contact sheets (sharp). The model signs its work: crop the bottom 5%.
const sharp = (await import('sharp')).default;
const ids = readdirSync('art-masters').filter((f) => f.endsWith('.png')).map((f) => f.slice(0, -4)).sort();
for (const id of ids) {
  const meta = await sharp(master(id)).metadata();
  const wide = meta.width >= meta.height;
  await sharp(master(id)).extract({ left: 0, top: 0, width: meta.width, height: Math.floor(meta.height * 0.95) })
    .resize(wide ? 640 : 427, wide ? 427 : 640, { fit: 'cover' }).webp({ quality: 82 }).toFile(`public/art/${id}.webp`);
}
writeFileSync('public/art/manifest.json', JSON.stringify(ids));
mkdirSync('tools/art/out/sheets', { recursive: true });
for (let i = 0; i < ids.length; i += 16) {
  const tiles = await Promise.all(ids.slice(i, i + 16).map(async (id, k) => ({
    input: await sharp(`public/art/${id}.webp`).resize(320, 214, { fit: 'cover' }).composite([{ input: Buffer.from(`<svg width="320" height="214"><rect y="192" width="320" height="22" fill="black" opacity="0.7"/><text x="6" y="208" font-family="monospace" font-size="14" fill="white">${id}</text></svg>`) }]).png().toBuffer(),
    left: (k % 4) * 320, top: Math.floor(k / 4) * 214,
  })));
  await sharp({ create: { width: 1280, height: 856, channels: 3, background: '#111' } }).composite(tiles).jpeg({ quality: 80 }).toFile(`tools/art/out/sheets/sheet-${String(i / 16 + 1).padStart(2, '0')}.jpg`);
}
console.log(`encoded ${ids.length} plates; contact sheets in tools/art/out/sheets/`);

#!/usr/bin/env node
// Renders tools/audio/manifest.json through the ElevenLabs API (Eleven Music, Sound Effects, Voice Design + Eleven v3
// speech) into audio-masters/eleven/. Masters are then levelled and encoded by level.mjs --masters audio-masters/eleven.
//   ELEVENLABS_API_KEY=... node tools/audio/eleven.mjs [--dry-run] [--only id,id] [--kind music|sfx|voice] [--limit n]
//                                                      [--force] [--takes n] [--keep-voices] [--budget credits]
// The key comes from the environment only; it is never written to disk. Each call's credit cost is read back from the
// account (the subscription's character_count before and after) and recorded in audio-masters/eleven/log.json together
// with the request body, so any master can be reproduced or re-rolled. Starter-tier formats: MP3 only (no WAV/PCM), 128 kbps
// for effects and speech; music tries 192 kbps and falls back.
//   music  POST /v1/music               one call per track, forced instrumental, model music_v2_5 (900 credits a minute)
//   sfx    POST /v1/sound-generation    `--takes` takes per effect (40 credits a second), the better take copied as the master
//   voice  POST /v1/text-to-voice/design -> /v1/text-to-voice (saves a voice) -> /v1/text-to-speech/{voice} (eleven_v3)
//          -> DELETE /v1/voices/{voice} unless --keep-voices (Starter has 10 voice slots). The three design previews are kept.
//          A voice entry whose instruct says "no words" (Brakk's roar) is rendered as a sound effect instead.
import { existsSync, mkdirSync, readFileSync, writeFileSync, copyFileSync, renameSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { SILENT_LUFS, measureFile, round } from './measure-lib.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const MANIFEST = path.join(ROOT, 'tools', 'audio', 'manifest.json');
const MASTERS = path.join(ROOT, 'audio-masters', 'eleven');
const LOG = path.join(MASTERS, 'log.json');
const API = 'https://api.elevenlabs.io';
const HELP = 'Usage: ELEVENLABS_API_KEY=... node tools/audio/eleven.mjs [--dry-run] [--only id,id] [--kind music|sfx|voice] [--limit n] [--force] [--takes n] [--keep-voices] [--budget credits]';

let v;
try {
  v = parseArgs({ args: process.argv.slice(2), strict: true, allowPositionals: false, options: {
    'dry-run': { type: 'boolean' }, only: { type: 'string' }, kind: { type: 'string' }, limit: { type: 'string' }, force: { type: 'boolean' },
    takes: { type: 'string' }, 'keep-voices': { type: 'boolean' }, budget: { type: 'string' }, help: { type: 'boolean' },
  } }).values;
} catch (e) { console.error(`error: ${e.message}\n${HELP}`); process.exit(2); }
if (v.help) { console.log(HELP); process.exit(0); }
const KEY = process.env.ELEVENLABS_API_KEY;
if (!KEY && !v['dry-run']) { console.error('error: ELEVENLABS_API_KEY is not set.'); process.exit(2); }
const TAKES = Math.max(1, Number(v.takes ?? 2));
const BUDGET = v.budget ? Number(v.budget) : Infinity;
const QUIET_LUFS = -30; // an effect master under this gets one more round asked for at full level

const manifest = JSON.parse(readFileSync(MANIFEST, 'utf8'));
const entries = [
  ...manifest.music.map((m) => ({ kind: 'music', ...m })),
  ...manifest.sfx.map((s) => ({ kind: 'sfx', ...s })),
  ...manifest.voice.map((x) => ({ kind: 'voice', ...x })),
].filter((e) => !v.kind || e.kind === v.kind);
const only = v.only ? new Set(v.only.split(',').map((s) => s.trim()).filter(Boolean)) : null;
const masterOf = (e) => path.join(MASTERS, `${e.id}.mp3`);

// ---------- voice design material: a paragraph in character (the design call wants 100 to 1000 characters) and the
// Eleven v3 audio tags for the delivered line. Only these two things are ElevenLabs-specific, so they live here, not in the manifest.
const VOICE = {
  'voice/prism-ysolde': { tags: '', preview: 'Shields up. Not one step back. The wall holds because we hold it, and I have never once seen it fall. Form on me, keep your spacing, and wait for my word. They will break on us.' },
  'voice/prism-oren': { tags: '', preview: "You'll have to hit harder than that. I've stood in front of worse than you and walked away. Come on, then. Take your swing. I've got all day, and the wall behind me isn't going anywhere." },
  'voice/ember-kessa': { tags: '[mischievously] ', preview: "Stand back. This one's going to be loud. No, further back than that. Right, hands over your ears, count to three with me, and whatever you do, don't look straight at it. One. Two." },
  'voice/ember-crucible': { tags: '', preview: 'Furnace at full heat. Production begins. Intake valves open. Pressure nominal. The first casting will be ready in forty seconds. Stand clear of the pour. Stand clear of the pour.' },
  'voice/tide-maren': { tags: '', preview: 'The canals answer to me now. Every lock, every sluice, every drop that moves through this city moves because I allow it. You may keep your bridges. I will decide what passes beneath them.' },
  'voice/tide-ilvane': { tags: '', preview: 'Be still. The hour is mine. You have hurried all your life and it has brought you here, to me, out of breath. Sit. Watch the water. Nothing you do in the next minute will matter at all.' },
  'voice/coil-aruvi': { tags: '', preview: 'Grow, my children. Grow and break them. I planted you in poor soil and you came up strong anyway. Now spread your roots under their feet, and when I say the word, lift the whole street.' },
  'voice/under-sable': { tags: '[mischievously] ', preview: 'Every fuse burns down to me. You can cut one, you can cut ten, and there will still be one you missed, hissing away somewhere in the dark. Shall I tell you which? No. I think I will let you look.' },
  'voice/under-vex': { tags: '', preview: 'Hold still. I only need a little more. There, you see, that barely hurt. Another sample, and then another, and soon I will understand exactly how you are put together. Fascinating. Do stop squirming.' },
  'voice/storm-jax': { tags: '[shouting] ', preview: 'Try and keep up! Faster! The wind is only going to get worse up here, so stop looking down and start looking ahead. If you can still hear me, you are too far behind. Come on!' },
  'voice/storm-corvane': { tags: '[shouting] ', preview: 'All wings, on me. Take the sky. Hold formation through the cloud and break on my signal, not before. I want clean lines and no heroes. We own the air above this city. Act like it.' },
};
const VOICE_SETTINGS = { stability: 0.5, similarity_boost: 0.8, style: 0.0, use_speaker_boost: true };

const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));
function seedOf(id, offset = 0) { // FNV-1a, so a re-roll is reproducible
  let h = 0x811c9dc5;
  for (const ch of `${id}#${offset}`) { h ^= ch.charCodeAt(0); h = Math.imul(h, 0x01000193) >>> 0; }
  return h % 2147483647;
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(method, route, { body, raw = false, retries = 2 } = {}) {
  for (let attempt = 0; ; attempt++) {
    let r;
    try {
      r = await fetch(`${API}${route}`, { method, headers: { 'xi-api-key': KEY, ...(body ? { 'content-type': 'application/json' } : {}) }, body: body ? JSON.stringify(body) : undefined });
    } catch (e) { // network failure: retry the same way as a 5xx
      if (attempt < retries) { await sleep(3000 * (attempt + 1)); continue; }
      throw new Error(`${method} ${route} -> ${e.cause?.code ?? e.message}`);
    }
    if (r.ok) return raw ? Buffer.from(await r.arrayBuffer()) : (r.status === 204 ? null : await r.json());
    const text = await r.text().catch(() => '');
    const retry = (r.status === 429 || r.status >= 500) && attempt < retries;
    if (retry) { await sleep(3000 * (attempt + 1)); continue; }
    const err = new Error(`${method} ${route} -> ${r.status} ${text.slice(0, 300)}`);
    err.status = r.status;
    throw err;
  }
}
async function credits() { const s = await api('GET', '/v1/user/subscription'); return { used: s.character_count, limit: s.character_limit, left: s.character_limit - s.character_count }; }

// ---------- request bodies (manifest fields -> API fields), kept as data so log.json can reproduce every master
function musicBody(e) {
  const loop = e.loop ? ' Written to loop: it ends the way it begins, with no fade-out and no final cadence.' : ' It ends conclusively.';
  return { prompt: `${e.prompt}. ${e.bpm} BPM, in ${e.key}.${loop}`, music_length_ms: e.duration * 1000, model_id: 'music_v2_5', force_instrumental: true };
}
// Prompts the ElevenLabs effects model renders near silence (it hears "soft" and "close" as a level and gives back a
// -45 LUFS file). Same sound, asked for as a physical event at normal level. The Audio Studio keeps the manifest text.
const SFX_TEXT = {
  'sfx/pass': 'a fingernail tapping once on a thick glass pane, one short clear click, a button press, no music, no voices',
  'sfx/play': 'a thick playing card slapped down flat onto a glass table, a hard knock then a bright glass chime, no music, no voices',
};
function sfxBody(e, text = SFX_TEXT[e.id] ?? e.prompt, seconds = e.seconds) {
  return { text, duration_seconds: clamp(seconds, 0.5, 30), prompt_influence: 0.45, loop: false, model_id: 'eleven_text_to_sound_v3' };
}
const isRoar = (e) => /no words/i.test(e.instruct);
function designBody(e) {
  const p = VOICE[e.id];
  return { voice_description: `${e.instruct}. A hero in a fantasy card game, speaking a short battle line. Studio clean, no music, no effects.`, text: p.preview, model_id: 'eleven_ttv_v3', loudness: 0.5, guidance_scale: 5, seed: seedOf(e.id) };
}
function speechBody(e) { return { text: `${VOICE[e.id]?.tags ?? ''}${e.text}`, model_id: 'eleven_v3', voice_settings: VOICE_SETTINGS }; }

function pickTake(paths) {
  const m = paths.map((p) => ({ p, ...measureFile(p) }));
  const live = m.filter((x) => Number.isFinite(x.lufs) && x.lufs >= SILENT_LUFS);
  if (!live.length) return { pick: paths[0], takes: m, note: 'all takes near silent' };
  const loudest = Math.max(...live.map((x) => x.lufs));
  const close = live.filter((x) => x.lufs >= loudest - 6);
  close.sort((a, b) => b.crest - a.crest);
  return { pick: close[0].p, takes: m, note: '' };
}
const brief = (x) => ({ peakDb: round(x.peakDb), lufs: round(x.lufs), crest: round(x.crest), seconds: round(x.seconds, 2) });
function archive(file) {
  if (!existsSync(file)) return;
  const dir = path.join(path.dirname(file), 'archive');
  mkdirSync(dir, { recursive: true });
  renameSync(file, path.join(dir, `${path.basename(file, path.extname(file))}.${Date.now()}${path.extname(file)}`));
}
async function download(route, body, dest, formats) { // try formats in order; a 4xx that names the format falls to the next
  let lastErr;
  for (const f of formats) {
    try {
      const buf = await api('POST', `${route}?output_format=${f}`, { body, raw: true });
      mkdirSync(path.dirname(dest), { recursive: true });
      writeFileSync(dest, buf);
      return f;
    } catch (e) {
      lastErr = e;
      if (!(e.status >= 400 && e.status < 500 && /format|tier|subscription|upgrade/i.test(e.message))) throw e;
    }
  }
  throw lastErr;
}

// ---------- plan
const plan = [];
for (const e of entries) {
  if (only && !only.has(e.id)) continue;
  if (!v.force && existsSync(masterOf(e))) continue;
  plan.push(e);
  if (v.limit && plan.length >= Number(v.limit)) break;
}
const est = (e) => e.kind === 'music' ? Math.ceil(e.duration / 60 * 900) : e.kind === 'sfx' ? 40 * e.seconds * TAKES : isRoar(e) ? 40 * 4 : 1000 + e.text.length + 100;
const estimate = plan.reduce((a, e) => a + est(e), 0);
console.log(`${plan.length} of ${entries.length} entr${entries.length === 1 ? 'y' : 'ies'} to render; estimated about ${estimate} credits (music 900/min, effects 40/s x ${TAKES} takes, voice design about 1000 + 1/char).`);
if (v['dry-run']) { for (const e of plan) console.log(`  ${e.kind.padEnd(5)} ${e.id.padEnd(24)} ~${est(e)}  ${JSON.stringify(e.kind === 'music' ? musicBody(e) : e.kind === 'sfx' ? sfxBody(e) : isRoar(e) ? sfxBody(e, e.instruct, 4) : speechBody(e)).slice(0, 160)}`); process.exit(0); }
if (!plan.length) process.exit(0);

mkdirSync(MASTERS, { recursive: true });
const log = existsSync(LOG) ? JSON.parse(readFileSync(LOG, 'utf8')) : {};
const save = () => writeFileSync(LOG, JSON.stringify(log, null, 1));
let acct = await credits();
console.log(`account: ${acct.used} of ${acct.limit} credits used this period, ${acct.left} left${Number.isFinite(BUDGET) ? `, budget for this run ${BUDGET}` : ''}.`);
const startUsed = acct.used;
let failures = 0;
let ok = 0;

for (const e of plan) {
  if (acct.used - startUsed + est(e) > BUDGET) { console.error(`stop: ${e.id} would exceed the run budget (${acct.used - startUsed} spent).`); break; }
  if (est(e) > acct.left) { console.error(`stop: ${e.id} needs about ${est(e)} credits; ${acct.left} left on the account.`); break; }
  const t0 = Date.now();
  const dest = masterOf(e);
  const rec = { kind: e.kind, at: new Date().toISOString() };
  try {
    if (e.kind === 'music') {
      rec.body = musicBody(e);
      archive(dest);
      rec.format = await download('/v1/music', rec.body, dest, ['mp3_44100_192', 'mp3_44100_128']);
      rec.master = brief(measureFile(dest));
    } else if (e.kind === 'sfx' || isRoar(e)) {
      rec.body = e.kind === 'sfx' ? sfxBody(e) : sfxBody(e, e.instruct, 4);
      const takes = [];
      for (let i = 1; i <= TAKES; i++) {
        const t = path.join(MASTERS, `${e.id}.take${i}.mp3`);
        archive(t);
        rec.format = await download('/v1/sound-generation', rec.body, t, ['mp3_44100_128']);
        takes.push(t);
      }
      let c = pickTake(takes);
      // The effects model takes "soft", "dry" or "close" as a level instruction and can hand back a take 30-50 dB down, which
      // would carry the MP3 noise floor up with it when levelled. One more round asks for the same sound at full level.
      if (!Number.isFinite(c.takes.find((x) => x.p === c.pick).lufs) || c.takes.find((x) => x.p === c.pick).lufs < QUIET_LUFS) {
        rec.loudBody = { ...rec.body, text: `${rec.body.text}, loud, close-miked, recorded at full level`, prompt_influence: 0.3 };
        for (let i = 1; i <= TAKES; i++) {
          const t = path.join(MASTERS, `${e.id}.loud${i}.mp3`);
          archive(t);
          await download('/v1/sound-generation', rec.loudBody, t, ['mp3_44100_128']);
          takes.push(t);
        }
        c = pickTake(takes);
      }
      archive(dest);
      copyFileSync(c.pick, dest);
      rec.takes = c.takes.map((x) => ({ file: path.basename(x.p), ...brief(x) }));
      rec.pick = path.basename(c.pick);
      if (c.note) rec.note = c.note;
      rec.master = brief(measureFile(dest));
    } else {
      if (!VOICE[e.id]) throw new Error(`no preview paragraph for ${e.id} in eleven.mjs`);
      rec.design = designBody(e);
      const d = await api('POST', '/v1/text-to-voice/design?output_format=mp3_44100_128', { body: rec.design });
      rec.previews = [];
      mkdirSync(path.dirname(dest), { recursive: true });
      d.previews.forEach((p, i) => {
        const f = path.join(MASTERS, `${e.id}.preview${i + 1}.mp3`);
        archive(f);
        writeFileSync(f, Buffer.from(p.audio_base_64, 'base64'));
        rec.previews.push({ file: path.basename(f), generated_voice_id: p.generated_voice_id, seconds: round(p.duration_secs, 2) });
      });
      // The first preview is taken (nothing here can judge a voice by ear); the others are kept so the owner can choose.
      const chosen = d.previews[0].generated_voice_id;
      const created = await api('POST', '/v1/text-to-voice', { body: { voice_name: `Annals ${e.id.split('/')[1]}`, voice_description: rec.design.voice_description, generated_voice_id: chosen, labels: { game: 'annals-of-scrivenearth' } } });
      rec.voice_id = created.voice_id;
      rec.generated_voice_id = chosen;
      try {
        rec.body = speechBody(e);
        archive(dest);
        rec.format = await download(`/v1/text-to-speech/${created.voice_id}`, rec.body, dest, ['mp3_44100_128']);
        rec.master = brief(measureFile(dest));
      } finally {
        if (!v['keep-voices']) { await api('DELETE', `/v1/voices/${created.voice_id}`).catch((err) => { rec.deleteError = err.message; }); rec.voiceDeleted = !rec.deleteError; }
      }
    }
    const after = await credits();
    rec.credits = after.used - acct.used;
    acct = after;
    rec.seconds = round((Date.now() - t0) / 1000);
    log[e.id] = rec;
    save();
    ok++;
    failures = 0;
    console.log(`${e.kind.padEnd(5)} ${e.id.padEnd(24)} ${rec.credits} credits  ${rec.seconds} s  ${rec.format}  master ${rec.master.lufs} LUFS peak ${rec.master.peakDb} dB crest ${rec.master.crest} ${rec.master.seconds} s${rec.pick ? `  (${rec.pick})` : ''}${rec.note ? `  NOTE ${rec.note}` : ''}`);
  } catch (err) {
    failures++;
    rec.error = err.message;
    log[e.id] = { ...(log[e.id] ?? {}), lastError: rec };
    save();
    console.error(`FAILED ${e.id}: ${err.message}`);
    if (failures >= 2) { console.error('two failures in a row; stopping.'); break; }
  }
}
console.log(`${ok} of ${plan.length} rendered; ${acct.used - startUsed} credits spent this run, ${acct.left} left on the account. Masters in audio-masters/eleven/, details in log.json. Next: node tools/audio/level.mjs --masters audio-masters/eleven`);
process.exit(ok === plan.length ? 0 : 1);

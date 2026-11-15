# GPU hand-back (EVILAEGIS, 2026-11-15)

Rendered on EVILAEGIS (RTX 5080, 16 GB) by the local Claude session "Asset generation setup", following
`HANDOFF-GPU.md` on branch `gpu/assets`. Studios: Flux Studio 7880 and Audio Studio 7890, each started detached with
`node server.js`, PIDs in `%TEMP%\flux-studio.pid` / `%TEMP%\audio-studio.pid`, stopped by PID at the end (with the
ComfyUI and the two voice engines they had started). Nothing here is verified by ear; the owner judges the sound in
the Settings sound test.

## 1. Card art (FLUX.2 klein, 3:2 at 1 MP, 4 steps)

| | |
|---|---|
| Prompts | 175, `build-prompts.ts` lint clean (154 card faces, 12 Ascended faces, 6 crests, cardback, title-skyline, board-backdrop) |
| Sample | tide-maren, ember-crucible--ascended, storm-jax: 62 s including the cold ComfyUI start. Passed: one flat cel-shaded style, faceted highlights, crystal skyline behind each, adult proportions, no lettering, nothing resembling a published design |
| Full batch | 172 plates in about 9 minutes (about 3 s a plate once the model was loaded); 0 failed jobs |
| Delivered | `public/art/*.webp` 640x427 (bottom 5% cropped by `gen.mjs` against signatures), 8.1 MB; `public/art/manifest.json` lists 175 ids |
| Re-rolled | 6 ids, 8 extra renders (see below) |
| Contact sheets | `tools/art/out/sheets/sheet-01.jpg` to `sheet-11.jpg` on EVILAEGIS (gitignored); sent to the owner as FYI (PLAN D13) |

Every one of the 11 sheets was looked at. Rejections and what was done:

| id | first render | action | result |
|---|---|---|---|
| under-pullplug | control panel with a digital readout and labels (lettering) | `--reroll 1` still drew a panel; scene clause in `subjects.ts` reworded to a bare wet stone wall (no panel) | clean |
| storm-airmail | flying notes covered in pseudo-text | `--reroll 1` same; subject reworded from "paper messages" to "small envelopes, each closed with a single round wax seal" | clean (two couriers instead of one; kept) |
| tide-deepstudy | open tome with lines of pseudo-text | `--reroll 1` | small tome with blank glowing crystal pages; clean |
| under-burnledger | burning papers with scribbled text | `--reroll 1` | papers show plain hatching, no letters; kept |
| ember-crucible | a boxy boiler with no arms; did not read as the same machine as its Ascended face (round cauldron) | `--reroll 1` | round barrel-bodied brass furnace with piston arms; matches |
| coil-brakk--ascended | a two-legged pig-man (humanoid torso, hands) | `--reroll 1` | a boar rearing on its hind legs, bark plates, crystal tusks; matches the base boar |

Judgement calls, left as rendered:
- storm-jax--ascended wears a dark shirt where the base face wears the teal flight suit; same face, hair, goggles and wings, so kept.
- Hero pairs checked side by side on the sheets: prism-ysolde, prism-oren, ember-kessa, tide-maren, tide-ilvane, coil-aruvi, under-sable, under-vex, storm-corvane all read as the same person. ember-crucible and coil-brakk after the re-rolls above.
- The Undervolt plates are the darkest of the set (tunnels), but every one is readable at card size on the sheet.
- `tools/art/subjects.ts` was changed only for the two ids above; `style.ts` STYLE was not touched after the first render.

## 2. Audio (Audio Studio: ACE-Step 1.5, Stable Audio Open 1.0, Qwen3-TTS voice design)

Scripts added under `tools/audio/` (adapted from StellarDerelict, no dependencies beyond ffmpeg/ffprobe):
- `gen.mjs`: renders `manifest.json` to `audio-masters/` (gitignored); `--dry-run --only --kind --limit --force --reroll`; effects as a batch of two takes, both kept, the better copied as the master (the loudest take that is not near silent; among takes within 6 dB of it, the sharper transient); `audio-masters/log.json` records job id, seed, take measurements.
- `level.mjs`: trims, levels, encodes `public/audio/<id>.ogg` (Opus; music 96 kbps stereo, effects and voice 80 kbps mono at 48 kHz), writes `public/audio/manifest.json` (49 ids) and `audio-masters/measure.json`.
- `measure-lib.mjs`: ffmpeg decode, peak, RMS, BS.1770-4 gated loudness, crest, silence bounds.

| | |
|---|---|
| Jobs | 49 (7 music, 30 effects, 12 voice lines), 0 failed, about 12 minutes of GPU in all |
| Measured speeds | music 10-26 s a track (120-150 s tracks in 16 s warm), effects 5 s a pair of takes, voice 16 s a line after a 66 s first-load |
| Re-rolled | sfx/absorb, sfx/spireHeal, sfx/over (`--reroll 1`: first takes near silent or a bare click), sfx/draw (`--reroll 2`: a card slide renders very quietly; the third seed gave a usable take) |
| Levels | effects -18 LUFS gated, voice -18, music -24 (6 dB under the effects); limiter at -1 dBFS |
| Result | effects within 1.3 dB of each other by gated loudness (mean -18.1), voice within 0.5 dB (mean -17.9), music at -24.0 |
| Trim | leading silence over 30 ms and trailing over 100 ms removed from effects and voice (22-589 ms on 13 files); music untouched |
| Compressed | sfx/draw and sfx/resolve only: all transient, so a limiter alone could not lift them to target; a fast 6:1 compressor runs first, then the gain is re-measured |

Crest factor (peak / RMS, linear) of the delivered files: effects 3.1 (attack) to 15.8 (pass), median about 6; voice 3.2 (Brakk's roar) to 8.7; music 5.1 to 20 (title, which is sparse). Per-file peak, RMS, gated LUFS, crest, length, trim and gain are in `audio-masters/measure.json` on EVILAEGIS (the `summary` block has the spreads).

Judgement calls and things to listen for:
- The whole-file RMS spread of the effects is 10.9 dB because the files hold different amounts of near-silence around the event; the gated loudness is what was matched. If the owner wants the files equal by whole-file RMS, the leveller's target field is one line.
- Two lessons for the KB gotchas: (1) with `-ac 1` ffmpeg downmixes stereo after the filter chain using -3 dB coefficients, so effects came out 3 dB over target with peaks past the limiter; the mono mix now happens inside the chain (`pan=mono|c0=0.5*c0+0.5*c1`) before the gain and limiter. (2) An ungated K-weighted mean square under-reads short effects by up to 10 dB; BS.1770 gating fixed the levelling spread from 8 dB to 1.3 dB.
- `voice/coil-brakk` ("Rrraaaaaaargh!") came out of the voice-design model as a 4.5 s low vocalisation with a crest of 3.2; it may read as a growl rather than a roar. If it does not land, Stable Audio Open with a "beast roar" prompt is the alternative.
- Music masters from ACE-Step peaked at 0 dBFS (calm, tense, victory, ascend-sting); they are 7-10 dB down after levelling, so no limiting was needed on them. `music/title` is sparse (crest 20) and was lifted 0.9 dB.
- Nothing was listened to. "Not verified by ear."

## 3. Finish

Both studios, the ComfyUI they started and the two voice engines were stopped by PID. Branch `gpu/assets` pushed twice
(art, then audio), each time after `git pull --rebase`. Commits carry only `public/art/**`, `public/audio/**`, the two
changed subject clauses, the `tools/audio/*.mjs` scripts and this file.

## 4. ElevenLabs pass (2026-11-15, replaces the Audio Studio delivery)

The owner supplied a one-day ElevenLabs key (Starter tier) and asked for the music and sounds to be run through it. The
same 49 ids were rendered with `tools/audio/eleven.mjs` into `audio-masters/eleven/` (gitignored), then levelled by the
same `level.mjs --masters audio-masters/eleven` and written over `public/audio/`. The Audio Studio delivery is kept in
commit 0f69a93 and, on EVILAEGIS, in `audio-masters/studio-delivery/`. The key was only ever in the environment.

| | |
|---|---|
| Music | Eleven Music `music_v2_5`, one call per track, `force_instrumental`, prompt = manifest prompt + bpm + key + a loop or ending instruction; 192 kbps MP3 masters. 5-13 s a track |
| Effects | Sound Effects `eleven_text_to_sound_v3`, two takes an effect at the manifest duration, `prompt_influence` 0.45; the louder take with the sharper transient is the master, both kept. 3-7 s a pair |
| Voices | Voice Design `eleven_ttv_v3` from the manifest instruct plus a 100-200 character in-character paragraph (table in `eleven.mjs`); first of three previews taken (all three kept as `<id>.preview*.mp3`); voice saved, the line spoken with `eleven_v3` (tags: Jax and Corvane `[shouting]`, Kessa and Sable `[mischievously]`), voice deleted again (Starter has 10 slots; the `generated_voice_id`s are in `log.json` to recreate any of them). 14-33 s a hero |
| Brakk | `voice/coil-brakk` is a 4 s Sound Effects render of the roar instruct (two takes), not speech |
| Credits | 11,651 of 40,512 for everything including re-rolls, about 27,000 left. The account counter updates late, so per-call figures in `log.json` are approximate; the run totals are right |
| Result | 49 files, 8.5 MB. Music -24 LUFS; voice within 0.4 dB (mean -18.0); effects mean -18.2 LUFS with a 5 dB spread (see below) |
| Loops | title, calm, battle, tense are marked `loop: true` in the manifest and made seamless: the first four beats (240/bpm s) are lifted off the head and crossfaded over the tail, so the file ends in the material that leads into sample 0. 1.9-2.9 s crossfades; tracks lose that much length |
| Trim | music now loses dead air over 0.1 s at the head and 0.5 s at the tail (before this, music was never trimmed: the studio `music/title` master carried 26 s of silence that the client looped as a pause). Effects and voice trimmed as before |

Re-rolls and judgement calls:
- The effects model reads "soft", "dry" and "close" as a level and returned `sfx/play` and `sfx/pass` at -44 to -58 LUFS three times running. `eleven.mjs` now retries any effect under -30 LUFS once with ", loud, close-miked, recorded at full level" (that fixed `resolve`, `charge`, `maxCharge`), and carries its own prompt text for those two ids (a fingernail tap on glass; a card slapped flat on glass). The manifest text is unchanged for the Audio Studio.
- Four one-shots are 0.1-0.45 s clicks after trimming (`draw`, `play`, `dmg`, `pass`) and stop 2-3 dB under target at the limiter even after the compressor pass; that is the whole 5 dB spread. Nine effects went through the compressor pass. Everything else is within 1.3 dB.
- `music/defeat` came back 12 dB quieter than the other tracks and was lifted 6 dB; nothing was limited on any music.
- Voice previews were chosen blind (the first of three). Kessa, Maren, Ilvane and Aruvi came back 4-6 dB hotter than the rest and were pulled down; Oren is the quietest hero. The 48 kHz PCM/WAV output formats need the Pro tier, so masters are 128 kbps MP3 (192 for music), decoded once into the Opus delivery.
- Nothing was listened to. "Not verified by ear." The Settings sound test plays every id.

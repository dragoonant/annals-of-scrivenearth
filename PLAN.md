# Plan and decisions

The only place a decision lives. `by` is `owner` (with the owner's words) or `default` (stated, correctable in a word).

| # | Date | Decision | By |
|---|---|---|---|
| D1 | 2026-11-15 | **Original game, not a port.** The owner asked to recreate a well-known card game; Claude declined to reproduce that game's name, characters, cards, art or look and offered an original game with similar genre mechanics. Owner: "Yes, browser. Play against ai." Genre mechanics kept: alternating attack rounds, growing Charge with banked Reserve, three glyph speeds, heroes that level up, two-faction decks. Rules, numbers, cards, names and look are written fresh. | owner |
| D2 | 2026-11-15 | Browser, one human against an AI. | owner |
| D3 | 2026-11-15 | Use `dragoonant/tabletop-kb` as the basis ("Check out our tabletop-kb repo for our past work"). | owner |
| D4 | 2026-11-15 | Presentation concept: **Crystal magitech city** ("A bright arcane metropolis: cut crystal, glowing conduits, projected glyphs, clean hard-edged frames"). The owner rejected three writing-themed concepts ("I hate these ideas") and picked this from a second set. Details: `docs/spec/50-client.md`. | owner |
| D5 | 2026-11-15 | Scope: **full pool plus deck builder**: six factions, about 150 cards, 12 heroes, deck builder. | owner |
| D6 | 2026-11-15 | Publish: fast-forward `main` after each gated stage; Pages from `gh-pages`. | owner |
| D7 | 2026-11-15 | Feel: **big hero moments**. Heroes are the centre of every deck; ascension is staged; a **Resonant** bonus rewards having an Ascended hero on the Line. | owner |
| D8 | 2026-11-15 | Stack: Vite + TypeScript strict, plain DOM, no framework; Vitest; Playwright 1.63.0. | default |
| D9 | 2026-11-15 | Art and audio are generated on EVILAEGIS (Flux Studio, Audio Studio): "You can use evilaegis for flux and music/sound gen." Approved batches: about 190 card renders, music, sound effects, hero voice lines; three-image sample first; one GPU job at a time; studios stopped afterwards. This cloud session cannot reach EVILAEGIS, so a Claude session on EVILAEGIS in a clone of this repo runs the jobs and this session messages it (owner's choice). Until then: procedural crystal sigils and synthesized sound (not verified by ear). | owner |
| D10 | 2026-11-15 | Triggered abilities never ask for a target; only Deploy abilities and glyphs do (spec RULING R-S3). | default |
| D11 | 2026-11-15 | The working title stays "Annals of Scrivenearth" (the repo name). | default |
| D12 | 2026-11-15 | Interface depth: "a fully fleshed out UI like xross forge and shadow forge" (targeting layer, animation layer, HUD, preview, title, deck builder, tutorial, sound page), in this game's own look (rule 21). | owner |
| D13 | 2026-11-15 | Card art style: Claude picks; contact sheets go to the owner as FYI. | owner |
| D14 | 2026-11-15 | A unit may be played onto a full Line by scrapping one of your own units (spec R-U1). | owner |
| D15 | 2026-11-15 | Screens for the first playable: desktop and phone landscape; portrait shows a rotate hint until a later stage. | owner |
| D16 | 2026-11-15 | Teaching: a guided first match, plus how-to-play and keyword hover help. | owner |
| D17 | 2026-11-15 | The owner will make the repo public and point Pages at `gh-pages`. | owner |
| D18 | 2026-11-15 | This session has push access to `dragoonant/tabletop-kb` and keeps this game's entry current (rule 19). | owner |
| D19 | 2026-11-15 | Tidewardens' weak AI-versus-AI results (BALANCE B-3) are left alone until the owner has played Tide. | default |
| D20 | 2026-11-15 | The first-pass client is rejected on looks: "Yikes. That's ugly as hell. I hope you're going to improve it." What is wrong, in the owner's picks: the placeholder card art, the flat empty board, and the card frames and type. The crystal magitech concept itself stands. | owner |
| D21 | 2026-11-15 | Finish quality is measured against **Shadowforge** (its rebuilt look: board art, HUD, card view, animation layer); the look stays this game's own. | owner |
| D22 | 2026-11-15 | Overnight: merge each gated stage to `main`, and merge `gpu/assets` (EVILAEGIS art and audio) into the session branch as it lands, without waiting. Leave a morning summary with screenshots and numbered questions. | owner |
| D23 | 2026-11-15 | Audio is now an ElevenLabs render of all 49 ids (Eleven Music, Sound Effects v3, Voice Design and v3 speech; a sound-effect roar for Brakk), replacing the Audio Studio set. As reported by the EVILAEGIS session: the owner supplied a one-day key and asked for it there; this session did not hear that request directly. The Audio Studio set stays in git history (0f69a93). Not verified by ear. | owner (reported by the EVILAEGIS session) |

## Cut order if a session runs short
Cut first: audio polish, deck-builder niceties (filters, import/export), the third AI tier, phone-portrait polish.
Never cut: per-card behaviour tests, the save, open-information viewers, prompts that say what they are about,
the hero ascension moment.

## Open questions for the owner
1. (Answered 2026-11-15: the EVILAEGIS session "Asset generation setup" was sent the job in HANDOFF-GPU.md.)
2. Pages: repo public, Settings -> Pages -> Source "Deploy from a branch", branch `gh-pages` (D17).

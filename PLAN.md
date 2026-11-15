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
| D9 | 2026-11-15 | Card art is a procedural cut-crystal sigil per card until a session on the owner's GPU PC can generate real art (cloud sessions cannot reach the studios). Audio is procedural WebAudio for the same reason; not verified by ear. | default |
| D10 | 2026-11-15 | Triggered abilities never ask for a target; only Deploy abilities and glyphs do (spec RULING R-S3). | default |
| D11 | 2026-11-15 | The working title stays "Annals of Scrivenearth" (the repo name). | default |

## Cut order if a session runs short
Cut first: audio polish, deck-builder niceties (filters, import/export), the third AI tier, phone-portrait polish.
Never cut: per-card behaviour tests, the save, open-information viewers, prompts that say what they are about,
the hero ascension moment.

## Open questions for the owner
1. Pages needs the repository to be public (or a paid plan) and Settings -> Pages -> Source "Deploy from a branch",
   branch `gh-pages`. Until then the link is a 404.
2. Real card art and audio need a session on the GPU PC.

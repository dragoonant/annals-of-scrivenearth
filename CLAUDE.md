# Annals of Scrivenearth: agent orientation

An **original** hero-driven card battler for the browser, one human against an AI. It is not a port: the owner
asked for a well-known card game, Claude declined to recreate it, and the owner chose an original game in the
same genre (PLAN D1). **The spec is the product** (`docs/spec/10-rules.md`, rule ids).

## Regime (original design)
1. Rules live in the spec with ids; code comments and test names cite them. Ambiguities become `RULING:` lines.
2. Balance changes need a sim or bench result written into `BALANCE.md`. Negative results are kept too.
3. Names, card text, world and look are ours. Nothing from any published game, book or show. No publisher art.
4. `PLAN.md` is the only place a decision lives. `STATUS.md` is rewritten, not appended.

## Hard rules (from the owner's knowledge base, dragoonant/tabletop-kb `rules.md`)
- Playable first; every stage ends in something clickable.
- No native tooltips; prompts name what they decide; open information is a rule; never assume a choice; every
  displayed number comes from the engine (rule 8).
- Autosave with Continue (rule 22); no text selection on long press (rule 24); each game has its own look (rule 21).
- One door per rule in the engine: `damage`, `summon`, `draw`, `stats`, `costOf`, `stateCheck`. No silent fallbacks.
- Credit "evilgouki". Never a real name, email or home path in the repo. Grep before every commit.
- The AI only ever receives `view(state, seat)`.

## Layout
- `src/engine/` rules (`types.ts` is the contract), `src/data/cards/` one file per faction, `src/ai/`, `src/client/`.
- `tests/` Vitest (rule-id tests, one behaviour test per card and hero), `e2e/` Playwright (pinned 1.63.0).
- `tools/sim.ts` arena with invariants; `npm run gate` runs everything.
- `docs/AUTHORING.md` card authoring guide; `docs/spec/50-client.md` client and look.

## Commands
`npm test` · `npm run typecheck` · `npm run sim -- --games 100 --a normal --b random` · `npx vite build && npm run e2e` · `npm run gate`

## Deploy
Push to `main` runs the gates and force-pushes `dist/` to `gh-pages` (`.github/workflows/deploy.yml`).

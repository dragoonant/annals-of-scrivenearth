# Client and presentation (spec 50)

Stack: Vite + TypeScript, plain DOM, no framework, no UI library. All game logic lives in `src/engine`; the client
never does rules maths. Every number shown comes from `stats()`, `costOf()`, `face()`, `budget()` or the state
(owner rule 8). Every affordance comes from `legalActions(view)`, `whyNotPlay`, `whyNotChannel`, `whyNotDeclare`,
`whyNotBlockAction` and `targetChoices`.

## Presentation concept (owner's choice 2026-11-15: "Crystal magitech city")
**A city of cut crystal at the blue hour: every surface is a facet, Charge runs through visible conduits, and an
ascending hero overloads the grid.**

Must NOT look like: lorecannae (storybook, gold filigree, serif fairy-tale type), Shadowforge (gothic frames),
Xross Forge (esports broadcast, scoreboard, neon tubes, lower-third captions), or any dark-fantasy parchment game.
No rounded "app" cards, no drop-shadowed web-dashboard panels, no gradients of purple-to-pink.

Visual tokens:
- **Shapes.** Everything is a cut facet: panels, cards and buttons are polygons with chamfered corners made with
  `clip-path` (cut two opposite corners, 10-14% of the short side). No `border-radius` above 2px anywhere.
- **Palette.** Blue-hour sky `#0b1230` to `#1a2a5e` (top to horizon) behind a far skyline of spires; panels are pale
  glass: `rgba(214,236,255,0.10)` fill with a 1px `rgba(190,225,255,0.55)` edge and a bright 1px highlight on the
  top-left cut. Text `#eaf4ff`; secondary `#9fb6d9`. Charge colour `#5ff2e0` (cyan-mint); Reserve `#ffd166` (amber);
  Spire Integrity `#ff5d73` when damaged, `#eaf4ff` when full; Ascended `#fff3b0` white-gold.
- **Faction gems** (hue from `FACTION_INFO[f].hue`): prism 48, ember 14, tide 205, coil 135, under 285, storm 180.
  A card's faction shows as a small cut gem and a thin inner edge, never as the whole border (borders carry
  interaction colour roles only).
- **Type.** Headings and numbers: `"Chakra Petch"`; body and rules text: `"Exo 2"` (Google Fonts, with
  `system-ui, sans-serif` fallback). Uppercase tracking on labels. No serif anywhere.
- **Conduits.** Thin luminous lines (SVG or CSS) link each player's Charge cells to their Line; they pulse when
  Charge is spent.
- **Card art.** No painted art exists yet (art needs the owner's GPU PC). Each card gets a procedural **cut-crystal
  sigil**: an SVG built deterministically from the card id (seeded facets and a glyph of 3-6 strokes) in the faction
  hue; heroes get a larger, brighter sigil with a crown of shards; the Ascended face recolours to white-gold.
  One function `cardArt(cardId, ascended): string` (SVG markup) in `src/client/art.ts`, so real art can replace it later.
- **Motion.** Facets slide and snap (120-200 ms, `cubic-bezier(.2,.9,.2,1)`), nothing bounces. Damage: a white crack
  flash on the unit. Destroyed: the card splits into shards.

Colour roles (interaction only, driven by `legalActions`): **actable** = cyan-mint edge with a slow shared pulse;
**selected / armed** = white edge, lifted; **legal target** = amber edge; **attacking** = unit slides forward into
the battle row; **blocked pair** = a short conduit between the two. Things that cannot act are not dimmed unless the
engine gives a reason, and that reason is shown on hover/press next to the control.

## Screens
1. **Title**: wordmark "ANNALS OF SCRIVENEARTH" as cut-crystal letters over the skyline; buttons: Continue (only with
   a readable save, see Saves), New game, Deck builder (may be a disabled stub in the first build, saying "coming in
   the next build"), How to play. A line: "An original fan-made game. Not affiliated with any publisher."
2. **New game**: pick your deck and the opponent's deck from `premadeDecks()` plus saved custom decks (deck tiles show
   name, the two factions, hero names, a hand-built deck's one-line plan, and a "Peek" that lists every card with
   counts); picking a deck keeps the list's scroll position; "Surprise me" picks at random;
   a default is pre-selected so Start is never disabled; difficulty from `DIFFICULTIES`. "New game" over an existing
   save asks once: "This replaces your saved game (round N vs <deck>). Start anyway?"
3. **Mulligan**: your 4 cards face up; click to mark for replacement; button reads "Keep all 4" or "Replace N".
4. **Board**: the whole window, no scrollbars at any supported size. Opponent across the top, you at the bottom.
   Each side: Spire (Integrity number, crystal that cracks as it falls), Charge cells (filled/empty, maximum) and
   Reserve cells, deck count, hand count (opponent's hand as card backs), Scrap pile (click opens a viewer listing
   every card, both sides: the Scrap is open information), Initiative marker, and a **hero tracker**: one chip per
   hero in that player's deck showing its condition text and progress `n / N` from the counters
   (`players[seat].seen[stat]`, or the best copy on the Line for `who: 'self'`), turning white-gold when Ascended.
   Centre: two Lines of up to 6 units each, a battle row between them for declared attackers and blockers, and the
   glyph **stack** (newest on top, each item showing its caster, card, and a line to its target).
5. **End screen**: who won and why (`endReason`), rounds played, each hero's final progress, "Play again" and "Title".
6. **How to play**: our own words, short, with the keyword list from one table (`KEYWORD_HELP` in `src/client/text.ts`).
7. **Deck builder**: the collection with filters by faction, type, cost, keyword and **set** (First Light, The Mirror
   Quarter, The Starward Rise; a set or faction appears only once it has cards). Hand cards that are Glimmer (R-E1)
   carry a GLIMMER tag and a rose edge, on your hand and on the opponent's card backs (Glimmer is open information).

## Interaction
- **Inspect**: hover (300 ms) or long-press any card anywhere (hand, Line, stack, Scrap, log names, deck peek) to open
  the large card: name, cost, stats (current and printed when they differ), faction, type, speed, full text, keyword
  explanations, for heroes both faces and progress. One delegated listener keyed on `data-card` / `data-unit`.
  The inspector sits above every modal. **No native tooltips: no `title` attributes, no SVG `<title>`.**
  RULING (2026-11-16, owner on the foldable: "the card text is cut off"): the inspector never clips its text. On the
  compact board its card keeps a text column of at least 20 units beside the art (stats on one line, name on at most two),
  a hero's box is wider still to hold the level-condition panel beside the card, and the placer uses a side of the anchor
  only when the box fits there at that width; otherwise it goes above or below, overlapping the anchor as little as it can.
- **Play a card**: first click arms it (lifts, shows its targets in amber, shows a "Play <name> (N Charge)" button in
  the action bar); clicking a legal target, or the button when it takes no target, plays it. Click elsewhere or Esc
  disarms. A card that cannot be played shows why (`whyNotPlay`) in the action bar when clicked. With two targets,
  the bar says which is being chosen ("Choose the unit to take 2 damage", then "Choose the unit to take 1").
  The prompt wording comes from a per-card optional table or falls back to "Choose target 1 of 2 for <name>".
- **Channel**: when legal, the armed hero card shows a second button "Channel into <hero> (1 Charge): repair it, +1|+1".
- **Attack**: when `declare` is legal, your units show as actable; clicking one moves it into the battle row in click
  order; clicking it again withdraws it. A Dueler asks "Force a blocker for <name>?" with the legal enemies in amber
  and a "No forced block" button. The action bar shows "Attack with N" (locks in).
- **Block**: attackers are across the battle row; click one of your units, then the attacker it blocks (or the reverse);
  click a blocker to release it. Bar: "Lock blocks (N of M blocked)". Show for each pair a forecast read from `stats`:
  both powers and remaining health.
- **Pass button** names what passing does, from the state: "Pass" / "End round" (the opponent has already passed and
  nothing is waiting) / "Let it resolve" (glyphs waiting) / "No response: strike" (combat window).
- **Never assume a choice.** Nothing is auto-targeted, auto-blocked or auto-played. Zero-option windows are skipped
  by the engine, not the client.
- Event feed: the last 4 events as plain sentences under the action bar; the full **log** is a drawer; card names in
  it are inspect doorways. Every `LogEntry.k` has a line in `src/client/text.ts` `LOG_LINES`; an unknown kind throws
  (no silent fallback), and a unit test asserts every kind the engine can emit has a line.

## Presentation director
- Keep a **presented** state separate from the live state. After each accepted action the engine returns `events`;
  the director plays them in order on the old board (so a destroyed unit is still there to shatter), then swaps in
  the new state. Input is locked while it plays; any click or key skips to the end.
- Speeds: full / quick / instant (setting, remembered in `localStorage` key `scrivenearth-settings`). `?speed=instant`
  in the URL forces instant (tests).
- Opponent actions are readable: a played card travels to the centre (500 ms), holds (1200 ms), then settles (250 ms).
  Round changes hold 1.6 s with "Round N: <who> holds the Initiative".
- The AI moves only when the director is idle; a watchdog forces the AI's answer if nothing has progressed for 5 s.
- **Ascension is the big moment** (owner: "big hero moments"): on an `ascend` event the board dims, conduits surge to
  white, the hero's card grows to the centre, cracks along its facets and re-forms as its Ascended face with its new
  name, stats and text readable for at least 2 s; then its Ascend effect plays. If the hero ascended in hand or deck,
  a shorter banner ("<name> has Ascended in <owner>'s deck") shows the new face. Skippable like everything else.
- Expose `onEvents(listener)` so an audio module can ride the same event stream later.

## Saves (owner rule 22)
- Autosave after every accepted action and when a game starts, **before the first render**, with
  `makeSave(setup, meta, actions, snapshot)` from `src/engine/save.ts` under `SAVE_KEY`. One slot.
- Title "Continue" names what it reopens: both deck names, round, whose move, both Spire totals, and when it was saved.
  It reopens on the current board with no replayed animation; the AI carries on if it is the AI's move.
- `readSave` failures are shown with their reason and a "Discard save" button. A finished game clears its save.
  If `localStorage` throws, a visible line says "This browser is not storing saves".
- "How to play" notes that saves are per browser and per address.

## Base stylesheet rules
- Owner rule 24, verbatim, in the base stylesheet:
  ```css
  html, body, #root { -webkit-user-select: none; user-select: none; -webkit-touch-callout: none; -webkit-tap-highlight-color: transparent; }
  input, textarea, select, [contenteditable='true'] { -webkit-user-select: text; user-select: text; -webkit-touch-callout: default; }
  img, canvas { -webkit-user-drag: none; }
  button { touch-action: manipulation; }
  ```
  plus `selectstart` and `contextmenu` listeners on `document` that `preventDefault()` unless the target is an input,
  textarea, select or editable element.
- Decorative layers are `pointer-events: none`. Use `dvh`, not `vh`. Tap vs drag by distance, never time.
- Layout sizes derive from one CSS custom property (`--u`) computed from the viewport so the board fits with no
  scrollbars at 1366x768, 1920x1080 and 844x390 (phone landscape). Phone portrait (390x844) shows a "rotate your
  device" overlay and has no board layout yet (PLAN D15); the unused tall-board styles are to be removed or finished
  when portrait is taken up.
  RULING (2026-11-15, owner on a foldable's inner screen: "the text is so small I can't read anything", the battle row
  too large, the opponent's hand strip wasted): the board is chosen by the unit it would get, not by the window's
  shape. The wide board is used while its unit is at least 9 px; otherwise the compact board (tall or short) with the
  larger unit is used, so text is never smaller than on a phone. A compact board with height to spare gives it to the
  hand and the Lines (capped at the wide board's card sizes), never only to the battle row. 900x640 (landscape inner
  screen) and 1024x768 are supported sizes alongside the three above; 640x900 is portrait and shows the rotate overlay.
- Escape every string inserted into HTML, including apostrophes in attributes; prefer `textContent` and DOM APIs.

## Test hooks
- `window.__sv = { state(): GameState, view(): GameState, idle(): boolean, act(a: Action): Result, seat: 0 }`.
- URL params: `?seed=N` (fixed seed), `?speed=instant`, `?bot=random` (opponent plays `randomAction`),
  `?auto=1` (your seat is also played by `randomAction`, for a full-game smoke test), `?decks=i,j` (premade indexes),
  `?skiptitle=1` (start a new game at once).
- Stable hooks: `data-card="<card id>"` on every card face, `data-unit="<iid>"` on units, `data-hand="<iid>"` on hand
  cards, `data-action="pass|attack|blocks|play|channel|mulligan"` on action-bar buttons, `data-screen="title|setup|
  mulligan|board|end|howto"` on the root.

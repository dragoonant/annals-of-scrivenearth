// Title, new game, how to play, end screen, and the modal overlays. Pure DOM builders: every button carries a
// data-ui id that app.ts handles in one delegated click listener.
import type { DeckList, GameState, Seat } from '../engine/types';
import { def, face } from '../engine/query';
import { DIFFICULTIES } from '../ai/ai';
import { FACTION_INFO } from '../data/decks';
import { skylineSvg } from './art';
import { h, heroProgress, lineSegsEl, rowEl } from './cardview';
import type { DeckChoice, SaveState } from './game';
import type { Settings, Speed } from './settings';
import { END_REASONS, HOW_TO_PLAY, KEYWORD_HELP, WORD_HELP } from './text';
import { LIMITS } from '../engine/types';
import { VOICED_KINDS } from '../audio/audio';
import { deckPlan, factionTags } from './deckbuilder';
import { tutorialMenuNote } from './tutorial';

export function backdrop(): HTMLElement {
  const el = h('div', { class: 'backdrop' });
  el.innerHTML = skylineSvg(11);
  return el;
}

const fmtWhen = (iso: string): string => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
};

export function saveSummary(st: Extract<SaveState, { kind: 'ok' }>): { head: string; sub: string } {
  const s = st.save;
  const snap = s.snapshot;
  const [a, b] = s.meta.deckNames;
  const round = snap.round === 0 ? 'Opening hand' : `Round ${snap.round}`;
  const move = snap.phase === 'mulligan' ? 'your move: opening hand' : snap.priority === 0 ? 'your move' : "the opponent's move";
  return {
    head: `${a} vs ${b}`,
    sub: `${round}, ${move}. Spires ${snap.players[0].spire} / ${snap.players[1].spire}. Saved ${fmtWhen(s.savedAt)}`,
  };
}

// ---------- title ----------
export function renderTitle(save: SaveState, settings: Settings, devdecks: boolean): HTMLElement {
  const word = 'SCRIVENEARTH';
  const wm = h('h1', { class: 'wordmark' });
  const small = h('span', { class: 'wm-small', text: 'ANNALS OF' });
  const big = h('span', { class: 'wm-big' });
  [...word].forEach((ch, i) => big.append(h('span', { class: `wm-l wm-${i % 4}`, text: ch })));
  wm.append(small, big);
  const menu = h('div', { class: 'title-menu' });
  if (save.kind === 'ok') {
    const sum = saveSummary(save);
    menu.append(h('button', { class: 'btn primary big-btn continue', data: { ui: 'continue' } }, h('b', { text: 'Continue' }), h('span', { text: sum.head }), h('span', { class: 'sub', text: sum.sub })));
  }
  menu.append(
    h('button', { class: `btn ${save.kind === 'ok' ? '' : 'primary'} big-btn`, data: { ui: 'new' } }, h('b', { text: 'New game' }), h('span', { text: 'Choose decks and a difficulty' })),
    h('button', { class: 'btn big-btn', data: { ui: 'tutorial' } }, h('b', { text: 'Learn to play' }), h('span', { text: 'A short guided match, about five minutes' })),
    h('button', { class: 'btn big-btn', data: { ui: 'builder' } }, h('b', { text: 'Deck builder' }), h('span', { text: 'Build, save and share your own decks' })),
    h('button', { class: 'btn big-btn', data: { ui: 'howto' } }, h('b', { text: 'How to play' }), h('span', { text: 'Rules, keywords and saving' })),
  );
  const root = h('div', { class: 'title' }, wm, menu);
  if (save.kind === 'bad') {
    root.append(h('div', { class: 'note-box facet' }, h('b', { text: 'Your saved game could not be opened' }), h('p', { text: save.reason }), h('button', { class: 'btn', data: { ui: 'discard' }, text: 'Discard save' })));
  }
  if (save.kind === 'nostorage') root.append(h('div', { class: 'note-box facet warn' }, h('b', { text: 'This browser is not storing saves' }), h('p', { text: 'Your game will work, but it cannot be continued after you close the page.' })));
  if (devdecks) root.append(h('div', { class: 'devbadge', text: 'DEV DECKS ON (test only)' }));
  const sp = h('div', { class: 'speedrow' }, h('span', { class: 'lbl', text: 'ANIMATION' }));
  for (const s of ['full', 'quick', 'instant'] as Speed[]) sp.append(h('button', { class: `chipbtn ${settings.speed === s ? 'on' : ''}`, data: { ui: 'speed', v: s }, text: s }));
  root.append(sp, h('button', { class: 'btn small', data: { ui: 'settings' }, text: 'Sound and settings' }), h('p', { class: 'fineprint', text: 'An original fan-made game. Not affiliated with any publisher.' }));
  return root;
}

// ---------- new game ----------
export function deckFactions(d: DeckList): string[] {
  return [...new Set(d.cards.map((c) => def(c).faction))].map((f) => FACTION_INFO[f].name);
}
export function deckHeroes(d: DeckList): string[] {
  return [...new Set(d.cards.filter((c) => def(c).type === 'hero'))].map((c) => def(c).name.split(',')[0]);
}

export interface SetupSel {
  me: number;
  foe: number;
  diff: string;
}

export function renderSetup(catalog: DeckChoice[], sel: SetupSel, devdecks: boolean, problem: string | null = null): HTMLElement {
  const root = h('div', { class: 'setup' }, h('div', { class: 'screen-head' }, h('button', { class: 'btn small', data: { ui: 'back' }, text: 'Back' }), h('h2', { text: 'New game' })));
  if (devdecks) root.append(h('div', { class: 'devbadge', text: 'DEV DECKS ON (test only): repeated cards, not checked by the deck rules' }));
  if (problem) root.append(h('div', { class: 'storage-line', text: problem }));
  if (catalog.length === 0) {
    root.append(h('div', { class: 'note-box facet warn' }, h('b', { text: 'No decks are available yet' }), h('p', { text: 'The card pool is still being written, so no legal premade deck can be built. Add ?devdecks=1 to the address for development test decks.' })));
    return root;
  }
  const cols = h('div', { class: 'deckcols' });
  for (const side of ['me', 'foe'] as const) {
    const col = h('div', { class: 'deckcol' }, h('div', { class: 'col-head' }, h('h3', { text: side === 'me' ? 'Your deck' : "Opponent's deck" }), h('button', { class: 'btn small', data: { ui: 'surprise', side }, text: 'Surprise me' })));
    const list = h('div', { class: 'decklist' });
    catalog.forEach((d, i) => {
      const on = sel[side] === i;
      list.append(
        h(
          'div',
          { class: `deck facet ${on ? 'on' : ''}`, data: { ui: 'pick', side, i } },
          h('div', { class: 'deck-top' }, h('b', { class: 'deck-name', text: d.name }), h('span', { class: 'deck-n', text: `${d.cards.length} cards` }), d.custom ? h('span', { class: 'deck-mine', text: 'YOUR DECK' }) : null),
          factionTags(d.cards),
          h('div', { class: 'deck-heroes', text: `Heroes: ${deckHeroes(d).join(', ') || 'none'}` }),
          d.about ? h('div', { class: 'deck-about', text: d.about }) : null,
          h('div', { class: 'deck-plan', text: deckPlan(d.cards) }),
          h('button', { class: 'btn small peek', data: { ui: 'peek', i }, text: 'Peek' }),
        ),
      );
    });
    col.append(list);
    cols.append(col);
  }
  root.append(cols);
  const diff = h('div', { class: 'diffrow' }, h('span', { class: 'lbl', text: 'DIFFICULTY' }));
  for (const d of DIFFICULTIES) diff.append(h('button', { class: `diffcard facet ${sel.diff === d.id ? 'on' : ''}`, data: { ui: 'diff', v: d.id }, attrs: { type: 'button', 'aria-pressed': String(sel.diff === d.id) } }, h('b', { text: d.name }), h('span', { text: d.blurb })));
  root.append(diff, h('button', { class: 'btn primary big-btn start', data: { ui: 'start' } }, h('b', { text: 'Start' })));
  return root;
}

// ---------- how to play ----------
export function renderHowTo(): HTMLElement {
  const root = h('div', { class: 'howto' }, h('div', { class: 'screen-head' }, h('button', { class: 'btn small', data: { ui: 'back' }, text: 'Back' }), h('h2', { text: 'How to play' })));
  const body = h('div', { class: 'howbody' });
  for (const s of HOW_TO_PLAY) body.append(h('section', { class: 'how facet' }, h('h3', { text: s.h }), ...s.p.map((p) => h('p', { text: p }))));
  const kw = h('section', { class: 'how facet' }, h('h3', { text: 'Keywords' }));
  const dl = h('dl', { class: 'kwlist' });
  for (const k of Object.values(KEYWORD_HELP)) dl.append(h('dt', { text: k.name }), h('dd', { text: k.text }));
  kw.append(dl);
  const words = h('section', { class: 'how facet' }, h('h3', { text: 'Ability words and statuses' }));
  const dl2 = h('dl', { class: 'kwlist' });
  for (const [w, t] of Object.entries(WORD_HELP)) dl2.append(h('dt', { text: w }), h('dd', { text: t }));
  words.append(dl2);
  body.append(kw, words);
  root.append(body);
  return root;
}

// ---------- end ----------
/** The round each of a side's heroes Ascended in, from the log's `ascend` entries. */
export function ascendRounds(v: GameState, seat: Seat): Map<string, number> {
  const out = new Map<string, number>();
  for (const e of v.log) if (e.k === 'ascend' && e.seat === seat && e.card && !out.has(e.card)) out.set(e.card, e.r);
  return out;
}

export function renderEnd(v: GameState, deckNames: [string, string], canReport = true): HTMLElement {
  const w = v.winner;
  const head = w === 'draw' ? 'A draw' : w === 0 ? 'Victory' : 'Defeat';
  const reasonKey = v.endReason ?? '';
  const reason = END_REASONS[reasonKey];
  if (!reason) throw new Error(`No wording for end reason "${reasonKey}"`);
  let who = '';
  if (w === 0) who = reasonKey === 'concede' ? 'The opponent conceded.' : 'You won.';
  else if (w === 1) who = reasonKey === 'concede' ? 'You conceded.' : 'The opponent won.';
  const root = h(
    'div',
    { class: `end ${w === 0 ? 'win' : w === 1 ? 'loss' : 'draw'}` },
    h('h2', { class: 'end-head', text: head }),
    h('p', { class: 'end-who', text: who || 'Neither Spire stood alone.' }),
    h('p', { class: 'end-why', text: reason }),
    h('p', { class: 'end-rounds' }, h('span', { text: `${v.round} ${v.round === 1 ? 'round' : 'rounds'} played` }), h('span', { class: `end-spires`, text: `Spires: you ${v.players[0].spire}, opponent ${v.players[1].spire}` })),
  );
  const cols = h('div', { class: 'end-cols' });
  for (const seat of [0, 1] as Seat[]) {
    const p = v.players[seat];
    const rounds = ascendRounds(v, seat);
    const col = h('div', { class: 'end-col facet' }, h('h3', { text: `${seat === 0 ? 'You' : 'Opponent'}: ${deckNames[seat]}` }), h('div', { class: 'end-spire' }, h('b', { text: String(p.spire) }), h('i', { text: 'SPIRE INTEGRITY LEFT' })));
    const heroes = h('div', { class: 'end-heroes' });
    for (const hid of p.heroes) {
      const pr = heroProgress(v, seat, hid);
      const r = rounds.get(hid);
      heroes.append(
        h('div', { class: `row facet ${pr.done ? 'asc' : ''}`, data: { card: hid, seat } }, h('span', { class: 'row-name', text: face(v, seat, hid).name }), h('span', { class: 'row-type', text: pr.text }), h('span', { class: 'row-n', text: pr.done ? (r !== undefined ? `Ascended in round ${r}` : 'Ascended') : `${pr.n} / ${pr.need}` })),
      );
    }
    if (p.heroes.length === 0) heroes.append(h('p', { class: 'empty', text: 'No heroes in this deck.' }));
    col.append(heroes);
    const stats = h('div', { class: 'end-stats' });
    const stat = (label: string, n: number | undefined): HTMLElement => h('div', { class: 'end-stat' }, h('span', { text: label }), h('b', { text: String(n ?? 0) }));
    stats.append(stat('Damage to the enemy Spire', p.seen.spireDamage), stat('Enemy units destroyed', p.seen.enemiesDied), stat('Glyphs cast', p.seen.glyphsCast));
    col.append(stats);
    cols.append(col);
  }
  const btns = h('div', { class: 'end-btns' }, h('button', { class: 'btn primary big-btn', data: { ui: 'again' }, text: 'Play again' }), h('button', { class: 'btn big-btn', data: { ui: 'title' }, text: 'Title' }));
  if (canReport) btns.append(h('button', { class: 'btn big-btn ghost', data: { ui: 'bugreport' }, text: 'Save bug report' }));
  root.append(cols, btns);
  return root;
}

// ---------- overlays ----------
export type Modal =
  | { kind: 'scrap' }
  | { kind: 'log' }
  | { kind: 'menu'; confirmConcede: boolean }
  | { kind: 'settings' }
  | { kind: 'tutmenu' }
  | { kind: 'peek'; deck: DeckList }
  | { kind: 'confirm'; text: string; yes: string };

function modalShell(cls: string, ...kids: (Node | null)[]): HTMLElement {
  return h('div', { class: 'modal-back', data: { ui: 'backdrop' } }, h('div', { class: `modal facet ${cls}` }, ...kids));
}

export function renderModal(m: Modal, v: GameState | null, settings: Settings, canConcede: boolean): HTMLElement {
  switch (m.kind) {
    case 'scrap': {
      if (!v) throw new Error('scrap needs a game');
      const cols = h('div', { class: 'scrapcols' });
      for (const seat of [0, 1] as Seat[]) {
        const list = h('div', { class: 'scraplist' });
        const counts = new Map<string, number>();
        for (const c of v.players[seat].scrap) counts.set(c, (counts.get(c) ?? 0) + 1);
        if (counts.size === 0) list.append(h('p', { class: 'empty', text: 'Nothing here yet.' }));
        for (const [c, n] of counts) list.append(rowEl(c, seat, n));
        cols.append(h('div', { class: 'scrapcol' }, h('h3', { text: `${seat === 0 ? 'Your' : "Opponent's"} Scrap (${v.players[seat].scrap.length})` }), list));
      }
      return modalShell('wide', h('div', { class: 'modal-head' }, h('h2', { text: 'Scrap piles' }), h('button', { class: 'btn small', data: { ui: 'close' }, text: 'Close' })), h('p', { class: 'hint', text: 'The Scrap is open information. Hover a card to read it.' }), cols);
    }
    case 'log': {
      if (!v) throw new Error('log needs a game');
      const list = h('div', { class: 'drawer-list' });
      for (const e of v.log) {
        if (e.k === 'round') list.append(h('div', { class: 'log-round' }, lineSegsEl(e, v)));
        else list.append(h('div', { class: 'log-line' }, lineSegsEl(e, v)));
      }
      return modalShell('drawer', h('div', { class: 'modal-head' }, h('h2', { text: 'Game log' }), h('button', { class: 'btn small', data: { ui: 'close' }, text: 'Close' })), list);
    }
    case 'menu': {
      const sp = h('div', { class: 'speedrow' }, h('span', { class: 'lbl', text: 'ANIMATION' }));
      for (const s of ['full', 'quick', 'instant'] as Speed[]) sp.append(h('button', { class: `chipbtn ${settings.speed === s ? 'on' : ''}`, data: { ui: 'speed', v: s }, text: s }));
      return modalShell(
        'small',
        h('div', { class: 'modal-head' }, h('h2', { text: 'Menu' }), h('button', { class: 'btn small', data: { ui: 'close' }, text: 'Close' })),
        sp,
        m.confirmConcede
          ? h('div', { class: 'confirm-row' }, h('p', { text: 'Concede this game? You lose and the save is cleared.' }), h('button', { class: 'btn danger', data: { ui: 'concede-yes' }, text: 'Yes, concede' }), h('button', { class: 'btn', data: { ui: 'concede-no' }, text: 'Keep playing' }))
          : h('button', { class: `btn ${canConcede ? '' : 'disabled'}`, data: { ui: 'concede' }, text: canConcede ? 'Concede' : 'Concede (wait for your move)' }),
        h('button', { class: 'btn', data: { ui: 'title' }, text: 'Back to title (the game stays saved)' }),
        h('button', { class: 'btn', data: { ui: 'settings' }, text: 'Sound and settings' }),
        h('button', { class: 'btn', data: { ui: 'howto-from-game' }, text: 'How to play' }),
      );
    }
    case 'tutmenu': {
      const sp = h('div', { class: 'speedrow' }, h('span', { class: 'lbl', text: 'ANIMATION' }));
      for (const x of ['full', 'quick', 'instant'] as Speed[]) sp.append(h('button', { class: `chipbtn ${settings.speed === x ? 'on' : ''}`, data: { ui: 'speed', v: x }, text: x }));
      return modalShell('small', h('div', { class: 'modal-head' }, h('h2', { text: 'Tutorial' }), h('button', { class: 'btn small', data: { ui: 'close' }, text: 'Close' })), h('p', { class: 'hint', text: tutorialMenuNote() }), sp, h('button', { class: 'btn', data: { ui: 'tut-skip' }, text: 'Skip tutorial' }), h('button', { class: 'btn', data: { ui: 'settings' }, text: 'Sound and settings' }));
    }
    case 'settings': {
      const sp = h('div', { class: 'speedrow' }, h('span', { class: 'lbl', text: 'ANIMATION' }));
      for (const s of ['full', 'quick', 'instant'] as Speed[]) sp.append(h('button', { class: `chipbtn ${settings.speed === s ? 'on' : ''}`, data: { ui: 'speed', v: s }, text: s }));
      const vol = h('div', { class: 'speedrow' }, h('span', { class: 'lbl', text: 'VOLUME' }), h('input', { class: 'vol', data: { ui: 'volume' }, attrs: { type: 'range', min: '0', max: '100', value: String(Math.round(settings.volume * 100)) } }), h('button', { class: `chipbtn ${settings.muted ? 'on' : ''}`, data: { ui: 'mute' }, text: settings.muted ? 'muted' : 'mute' }));
      const test = h('div', { class: 'soundtest' });
      for (const k of VOICED_KINDS) test.append(h('button', { class: 'chipbtn', data: { ui: 'audition', v: k }, text: k }));
      return modalShell('small', h('div', { class: 'modal-head' }, h('h2', { text: 'Settings' }), h('button', { class: 'btn small', data: { ui: 'close' }, text: 'Close' })), sp, vol, h('div', { class: 'lbl', text: 'SOUND TEST (tap a sound)' }), test);
    }
    case 'peek': {
      const counts = new Map<string, number>();
      for (const c of m.deck.cards) counts.set(c, (counts.get(c) ?? 0) + 1);
      const order = [...counts.keys()].sort((a, b) => def(a).cost - def(b).cost || def(a).name.localeCompare(def(b).name));
      const list = h('div', { class: 'scraplist' });
      for (const c of order) list.append(rowEl(c, 0, counts.get(c)));
      return modalShell('wide', h('div', { class: 'modal-head' }, h('h2', { text: m.deck.name }), h('button', { class: 'btn small', data: { ui: 'close' }, text: 'Close' })), h('p', { class: 'hint', text: `${m.deck.cards.length} cards of at most ${LIMITS.copies} copies. Hover a card to read it.` }), list);
    }
    case 'confirm':
      return modalShell('small', h('h2', { text: 'Are you sure?' }), h('p', { text: m.text }), h('div', { class: 'confirm-btns' }, h('button', { class: 'btn primary', data: { ui: m.yes }, text: 'Start anyway' }), h('button', { class: 'btn', data: { ui: 'close' }, text: 'Cancel' })));
  }
}

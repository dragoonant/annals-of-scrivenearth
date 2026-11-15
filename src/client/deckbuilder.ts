// The deck builder screen. All rules come from src/deckbuilder/model.ts (whyNotAdd, deckStats, autoDeck's legality,
// import/export); this file only draws and wires clicks. The root element is built once and kept, so the typing
// fields never lose focus: filters and counts update their own parts in place.
import './deckbuilder.css';
import type { CardDef, DeckList, FactionId, GameState } from '../engine/types';
import { LIMITS } from '../engine/types';
import { def } from '../engine/query';
import { autoDeck, collectible, FACTION_INFO, premadeDecks } from '../data/decks';
import { addCard, countOf, deckStats, exportDeck, importDeck, loadDecks, removeCard, saveDecks, whyNotAdd } from '../deckbuilder/model';
import { gem, h, handCardEl, hueOf } from './cardview';
import { KEYWORD_HELP } from './text';

const FACTIONS = Object.keys(FACTION_INFO) as FactionId[];
const TYPES: { id: CardDef['type']; name: string }[] = [
  { id: 'unit', name: 'Unit' },
  { id: 'hero', name: 'Hero' },
  { id: 'glyph', name: 'Glyph' },
];
const COSTS = [0, 1, 2, 3, 4, 5, 6, 7];
const DEFAULT_NAME = 'New deck';

/** A throwaway state so the shared card face can be drawn outside a game. */
export function blankState(): GameState {
  const blank = (): GameState['players'][0] => ({ spire: 20, charge: 0, maxCharge: 0, reserve: 0, deck: [], hand: [], line: [], scrap: [], seen: {}, seenRound: {}, ascended: [], heroes: [], canAttack: false, mulliganed: false, deckList: [] });
  return { v: 1, rng: 1, round: 0, initiative: 0, priority: 0, phase: 'main', passes: 0, stack: [], stackStarter: null, combat: null, players: [blank(), blank()], nextId: 1, winner: null, endReason: null, log: [], acted: [0, 0] };
}

// ---------- shared deck descriptions (also used by the New game screen) ----------
const lcFirst = (t: string): string => t.replace(/^I've /, 'it has ').replace(/^You've /, "you've ").replace(/^Your /, 'your ');

/** A one-line plan for a deck, read from its cards: curve, glyph count, and the first hero's Ascension goal. */
export function deckPlan(cards: string[]): string {
  const st = deckStats(cards);
  const total = cards.reduce((n, id) => n + def(id).cost, 0);
  const avg = cards.length ? total / cards.length : 0;
  const speed = avg <= 2.4 ? 'Quick curve' : avg >= 3.2 ? 'Top-heavy' : 'Even curve';
  const glyphs = st.glyphs > 0 ? `${st.glyphs} glyph${st.glyphs === 1 ? '' : 's'}` : 'no glyphs';
  const hero = st.rows.find((r) => r.card.type === 'hero')?.card;
  const goal = hero?.level ? ` Ascend ${hero.name.split(',')[0]}: ${lcFirst(hero.level.text)}.` : '';
  return `${speed}, ${glyphs}.${goal}`;
}

/** The deck's factions as small cut gems with their names. */
export function factionTags(cards: string[]): HTMLElement {
  const box = h('span', { class: 'ftags' });
  const seen: FactionId[] = [];
  for (const id of cards) {
    const f = def(id).faction;
    if (!seen.includes(f)) seen.push(f);
  }
  for (const f of seen) box.append(h('span', { class: 'ftag' }, h('span', { class: 'gem', style: { '--hue': String(FACTION_INFO[f].hue) } }), h('span', { text: FACTION_INFO[f].name })));
  return box;
}

interface Filters {
  factions: Set<FactionId>;
  types: Set<CardDef['type']>;
  cost: number | null;
  keyword: string | null;
  text: string;
}

type Dialog =
  | { kind: 'open' }
  | { kind: 'premade' }
  | { kind: 'autofill'; a: FactionId | null; b: FactionId | null }
  | { kind: 'import'; problem: string | null }
  | { kind: 'export' }
  | { kind: 'confirm'; text: string; yes: string; run: () => void };

export interface BuilderHost {
  /** Back to the title screen. */
  leave(): void;
}

const PREMADE_NOTE = 'Copies a premade deck into the builder; the original is never changed.';

export class Builder {
  readonly root: HTMLElement;
  private name = DEFAULT_NAME;
  private cards: string[] = [];
  private loadedName: string | null = null;
  private dirty = false;
  private saved: DeckList[] = [];
  private storageProblem: string | null = null;
  private filters: Filters = { factions: new Set(), types: new Set(), cost: null, keyword: null, text: '' };
  private dlg: Dialog | null = null;
  private importText = '';
  private pool: CardDef[];
  private view = blankState();
  // parts
  private nameInput!: HTMLInputElement;
  private searchInput!: HTMLInputElement;
  private grid!: HTMLElement;
  private shown!: HTMLElement;
  private whyLine!: HTMLElement;
  private countEl!: HTMLElement;
  private legalEl!: HTMLElement;
  private statsEl!: HTMLElement;
  private curveEl!: HTMLElement;
  private rowsEl!: HTMLElement;
  private noteEl!: HTMLElement;
  private storageEl!: HTMLElement;
  private dialogEl!: HTMLElement;
  private filterEl!: HTMLElement;
  private saveBtn!: HTMLButtonElement;
  private deleteBtn!: HTMLButtonElement;
  private tiles = new Map<string, HTMLElement>();

  constructor(private host: BuilderHost) {
    this.pool = collectible().sort((a, b) => a.cost - b.cost || a.name.localeCompare(b.name));
    this.root = this.build();
  }

  /** Called every time the screen is entered: re-reads the saved decks (they may have changed). */
  open(): void {
    const r = loadDecks(localStorage);
    this.saved = r.decks;
    this.storageProblem = r.problem;
    this.dlg = null;
    this.renderDialog();
    this.refreshAll();
  }

  /** Esc: close the open dialog. Returns whether there was one. */
  closeDialog(): boolean {
    if (!this.dlg) return false;
    this.dlg = null;
    this.renderDialog();
    return true;
  }

  // ---------- building the skeleton ----------
  private build(): HTMLElement {
    const root = h('div', { class: 'builder' });
    this.nameInput = h('input', { class: 'bd-name', attrs: { type: 'text', maxlength: '40', placeholder: 'Deck name', 'aria-label': 'Deck name', autocomplete: 'off', spellcheck: 'false' }, data: { ui: 'b-name' } });
    this.searchInput = h('input', { class: 'bd-search', attrs: { type: 'search', placeholder: 'Search name or rules text', 'aria-label': 'Search cards', autocomplete: 'off', spellcheck: 'false' }, data: { ui: 'b-search' } });
    this.nameInput.addEventListener('input', () => {
      this.name = this.nameInput.value;
      this.dirty = true;
      this.refreshButtons();
    });
    this.searchInput.addEventListener('input', () => {
      this.filters.text = this.searchInput.value;
      this.buildGrid();
    });

    // left: the collection
    this.filterEl = h('div', { class: 'bd-filters' });
    this.whyLine = h('div', { class: 'bd-why', attrs: { role: 'status', 'aria-live': 'polite' } });
    this.shown = h('span', { class: 'bd-shown' });
    this.grid = h('div', { class: 'bd-grid' });
    const left = h('div', { class: 'bd-left' }, this.filterEl, h('div', { class: 'bd-msgrow' }, this.whyLine, this.shown), this.grid);

    // right: the deck
    this.countEl = h('div', { class: 'bd-count' });
    this.legalEl = h('div', { class: 'bd-legal' });
    this.statsEl = h('div', { class: 'bd-stats' });
    this.curveEl = h('div', { class: 'bd-curve' });
    this.rowsEl = h('div', { class: 'bd-rows' });
    this.noteEl = h('div', { class: 'bd-note' });
    this.storageEl = h('div', { class: 'bd-storage' });
    this.saveBtn = this.mkBtn('Save', 'b-save', 'btn small primary');
    this.deleteBtn = this.mkBtn('Delete', 'b-delete', 'btn small danger');
    const tools = h(
      'div',
      { class: 'bd-tools' },
      this.mkBtn('New deck', 'b-new', 'btn small'),
      this.saveBtn,
      this.deleteBtn,
      this.mkBtn('Open saved', 'b-open', 'btn small'),
      this.mkBtn('Copy a premade', 'b-premade', 'btn small'),
      this.mkBtn('Auto-fill', 'b-autofill', 'btn small'),
      this.mkBtn('Import code', 'b-import', 'btn small'),
      this.mkBtn('Export code', 'b-export', 'btn small'),
    );
    const right = h('div', { class: 'bd-right facet' }, this.nameInput, this.countEl, this.legalEl, this.statsEl, this.curveEl, tools, this.noteEl, this.storageEl, h('div', { class: 'bd-sub', text: 'DECK LIST (click a row to remove a copy)' }), this.rowsEl);

    this.dialogEl = h('div', { class: 'bd-dialog-host' });
    const head = h('div', { class: 'screen-head bd-head' }, this.mkBtn('Back to title', 'b-back', 'btn small'), h('h2', { text: 'Deck builder' }));
    root.append(head, h('div', { class: 'bd-body' }, left, right), this.dialogEl);

    this.buildFilters();
    root.addEventListener('pointerover', (e) => {
      const t = (e.target as Element).closest?.<HTMLElement>('.bd-tile');
      if (t) this.hover(t.dataset.id!);
    });
    root.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const t = e.target as HTMLElement;
      if (t.classList?.contains('bd-tile')) {
        e.preventDefault();
        this.add(t.dataset.id!);
      } else if (t.classList?.contains('bd-row')) {
        e.preventDefault();
        this.remove(t.dataset.id!);
      }
    });
    return root;
  }

  private mkBtn(label: string, ui: string, cls: string, extra: Record<string, string> = {}): HTMLButtonElement {
    return h('button', { class: cls, data: { ui, ...extra }, text: label, attrs: { type: 'button' } });
  }

  private chip(label: string, ui: string, v: string, on: boolean, cls = 'chipbtn'): HTMLButtonElement {
    return h('button', { class: `${cls} ${on ? 'on' : ''}`, data: { ui, v }, text: label, attrs: { type: 'button', 'aria-pressed': String(on) } });
  }

  // ---------- filters ----------
  private buildFilters(): void {
    const f = this.filters;
    const facRow = h('div', { class: 'bd-frow' }, h('span', { class: 'lbl', text: 'FACTION' }));
    for (const id of FACTIONS) {
      const on = f.factions.has(id);
      facRow.append(
        h('button', { class: `bd-fac ${on ? 'on' : ''}`, data: { ui: 'b-faction', v: id }, style: { '--hue': String(FACTION_INFO[id].hue) }, attrs: { type: 'button', 'aria-pressed': String(on) } }, h('span', { class: 'gem' }), h('span', { class: 'bd-facname', text: FACTION_INFO[id].name })),
      );
    }
    const typeRow = h('div', { class: 'bd-frow' }, h('span', { class: 'lbl', text: 'TYPE' }));
    for (const t of TYPES) typeRow.append(this.chip(t.name, 'b-type', t.id, f.types.has(t.id)));
    const top = h('div', { class: 'bd-ftop' }, facRow, typeRow, this.searchInput, this.mkBtn('Clear filters', 'b-clear', 'btn small ghost'));
    const costRow = h('div', { class: 'bd-frow' }, h('span', { class: 'lbl', text: 'COST' }));
    for (const c of COSTS) costRow.append(this.chip(c === 7 ? '7+' : String(c), 'b-cost', String(c), f.cost === c));
    const kwRow = h('div', { class: 'bd-frow bd-kws' }, h('span', { class: 'lbl', text: 'KEYWORD' }));
    for (const [k, v] of Object.entries(KEYWORD_HELP)) kwRow.append(this.chip(v.name, 'b-kw', k, f.keyword === k));
    this.filterEl.replaceChildren(top, h('div', { class: 'bd-more' }, costRow, kwRow));
    // the search field is kept as the same element so typing is never interrupted
  }

  private matches(c: CardDef): boolean {
    const f = this.filters;
    if (f.factions.size && !f.factions.has(c.faction)) return false;
    if (f.types.size && !f.types.has(c.type)) return false;
    if (f.cost !== null && (f.cost >= 7 ? c.cost < 7 : c.cost !== f.cost)) return false;
    if (f.keyword) {
      const kws = [...(c.keywords ?? []), ...(c.ascended?.keywords ?? [])];
      if (!kws.includes(f.keyword as never)) return false;
    }
    const q = f.text.trim().toLowerCase();
    if (q) {
      const hay = `${c.name} ${c.text} ${c.ascended?.name ?? ''} ${c.ascended?.text ?? ''} ${c.tribe ?? ''}`.toLowerCase();
      if (!q.split(/\s+/).every((w) => hay.includes(w))) return false;
    }
    return true;
  }

  private buildGrid(): void {
    const list = this.pool.filter((c) => this.matches(c));
    const frag = document.createDocumentFragment();
    this.tiles.clear();
    for (const c of list) {
      const face = handCardEl(this.view, 0, `bd-${c.id}`, c.id);
      face.removeAttribute('data-hand');
      const tile = h('div', { class: 'bd-tile', data: { ui: 'b-add', id: c.id }, attrs: { role: 'button', tabindex: '0' }, style: { '--hue': String(hueOf(c.id)) } }, face, h('span', { class: 'bd-copies' }));
      this.tiles.set(c.id, tile);
      frag.append(tile);
    }
    if (list.length === 0) frag.append(h('p', { class: 'bd-empty', text: 'No card matches these filters. Clear a filter or change the search.' }));
    this.grid.replaceChildren(frag);
    this.grid.scrollTop = 0;
    this.shown.textContent = `${list.length} of ${this.pool.length} cards`;
    this.refreshTiles();
  }

  private refreshTiles(): void {
    for (const [id, tile] of this.tiles) {
      const n = countOf(this.cards, id);
      const why = whyNotAdd(this.cards, id);
      const badge = tile.querySelector('.bd-copies')!;
      badge.textContent = `${n}/${LIMITS.copies}`;
      tile.classList.toggle('has', n > 0);
      tile.classList.toggle('blocked', why !== null);
      tile.setAttribute('aria-label', `${def(id).name}, ${n} of ${LIMITS.copies} in deck${why ? `, cannot add: ${why}` : ''}`);
    }
  }

  private hover(id: string): void {
    const why = whyNotAdd(this.cards, id);
    this.setMsg(why ? `${def(id).name}: ${why}.` : `Click to add ${def(id).name}.`, why ? 'bad' : '');
  }

  private setMsg(text: string, kind: '' | 'bad' | 'ok' = ''): void {
    this.whyLine.textContent = text;
    this.whyLine.className = `bd-why ${kind}`;
  }

  // ---------- the deck pane ----------
  private refreshAll(): void {
    this.nameInput.value = this.name;
    this.searchInput.value = this.filters.text;
    this.buildFilters();
    this.buildGrid();
    this.refreshDeck();
  }

  private refreshDeck(): void {
    const st = deckStats(this.cards);
    const legal = st.check.ok;
    // counts and legality
    this.countEl.replaceChildren(h('b', { class: `bd-n ${legal ? 'legal' : ''}`, text: `${this.cards.length} / ${LIMITS.deck}` }), h('span', { class: `bd-flag ${legal ? 'legal' : ''}`, text: legal ? 'LEGAL' : 'NOT LEGAL YET' }));
    const lines = legal ? [h('div', { class: 'bd-ok', text: 'Legal deck: it can be saved and played.' })] : st.check.errors.map((e) => h('div', { class: 'bd-err', text: e }));
    this.legalEl.replaceChildren(...lines);
    // type counts, factions
    const stat = (label: string, n: string): HTMLElement => h('span', { class: 'bd-stat' }, h('i', { text: label }), h('b', { text: n }));
    this.statsEl.replaceChildren(stat('UNITS', String(st.units)), stat('GLYPHS', String(st.glyphs)), stat('HEROES', `${st.heroes}/${LIMITS.heroCards}`), st.factions.length ? factionTags(this.cards) : h('span', { class: 'ftags none', text: 'No faction yet' }));
    // charge curve
    const max = Math.max(1, ...st.curve);
    const bars = st.curve.map((n, i) =>
      h('div', { class: 'bd-bar' }, h('b', { text: String(n) }), h('span', { class: 'bd-col' }, h('span', { class: 'fill', style: { height: `${Math.round((n / max) * 100)}%` } })), h('i', { text: i === 7 ? '7+' : String(i) })),
    );
    this.curveEl.replaceChildren(h('div', { class: 'bd-sub', text: 'CHARGE CURVE' }), h('div', { class: 'bd-bars' }, ...bars));
    // rows
    const rows = st.rows.map((r) =>
      h(
        'div',
        { class: 'bd-row row facet', data: { ui: 'b-remove', id: r.card.id, card: r.card.id, seat: 0 }, style: { '--hue': String(hueOf(r.card.id)) }, attrs: { role: 'button', tabindex: '0' } },
        gem(r.card.id),
        h('span', { class: 'row-cost', text: String(r.card.cost) }),
        h('span', { class: 'row-name', text: r.card.name }),
        h('span', { class: 'row-type', text: r.card.type === 'glyph' ? `glyph, ${r.card.speed}` : r.card.type }),
        h('span', { class: 'row-n', text: `x${r.n}` }),
      ),
    );
    this.rowsEl.replaceChildren(...(rows.length ? rows : [h('p', { class: 'bd-empty', text: 'The deck is empty. Click a card on the left to add it, or use Auto-fill.' })]));
    this.storageEl.textContent = this.storageProblem ?? '';
    this.storageEl.classList.toggle('on', !!this.storageProblem);
    this.refreshButtons();
    this.refreshTiles();
  }

  private refreshButtons(): void {
    const legal = deckStats(this.cards).check.ok;
    this.saveBtn.disabled = !legal || this.name.trim() === '';
    this.saveBtn.classList.toggle('disabled', this.saveBtn.disabled);
    this.deleteBtn.disabled = this.loadedName === null;
    this.deleteBtn.classList.toggle('disabled', this.deleteBtn.disabled);
    const hint = !legal ? 'Save becomes available when the deck is legal.' : this.name.trim() === '' ? 'Give the deck a name to save it.' : this.loadedName ? `Editing the saved deck "${this.loadedName}".` : 'Not saved yet.';
    this.noteEl.textContent = hint;
  }

  // ---------- actions ----------
  private add(id: string): void {
    const why = whyNotAdd(this.cards, id);
    if (why) {
      this.setMsg(`Cannot add ${def(id).name}: ${why}.`, 'bad');
      return;
    }
    this.cards = addCard(this.cards, id);
    this.dirty = true;
    this.setMsg(`Added ${def(id).name} (${countOf(this.cards, id)}/${LIMITS.copies}).`, 'ok');
    this.refreshDeck();
  }

  private remove(id: string): void {
    this.cards = removeCard(this.cards, id);
    this.dirty = true;
    this.setMsg(`Removed one ${def(id).name}.`, '');
    this.refreshDeck();
  }

  /** Run `go`, asking first if it would throw away a deck that has unsaved changes. */
  private guard(go: () => void, what = 'This replaces the deck you are building'): void {
    if (this.dirty && this.cards.length > 0) {
      this.dlg = { kind: 'confirm', text: `${what}, and it has unsaved changes. Continue without saving?`, yes: 'Continue', run: go };
      this.renderDialog();
    } else go();
  }

  private load(name: string, cards: string[], loaded: string | null): void {
    this.name = name;
    this.cards = [...cards];
    this.loadedName = loaded;
    this.dirty = false;
    this.dlg = null;
    this.nameInput.value = name;
    this.renderDialog();
    this.refreshDeck();
  }

  private writeSaved(list: DeckList[]): boolean {
    const err = saveDecks(localStorage, list);
    if (err) {
      this.storageProblem = err;
      this.setMsg(`${err} The deck was not saved.`, 'bad');
      this.refreshDeck();
      return false;
    }
    this.saved = list;
    this.storageProblem = null;
    return true;
  }

  private doSave(): void {
    const name = this.name.trim().slice(0, 40);
    const deck: DeckList = { name, cards: [...this.cards] };
    const list = this.saved.some((d) => d.name === name) ? this.saved.map((d) => (d.name === name ? deck : d)) : [...this.saved, deck];
    if (!this.writeSaved(list)) return;
    this.name = name;
    this.nameInput.value = name;
    this.loadedName = name;
    this.dirty = false;
    this.dlg = null;
    this.renderDialog();
    this.setMsg(`Saved "${name}". It now appears on the New game screen.`, 'ok');
    this.refreshDeck();
  }

  private save(): void {
    const st = deckStats(this.cards);
    if (!st.check.ok) {
      this.setMsg('The deck is not legal yet, so it cannot be saved.', 'bad');
      return;
    }
    const name = this.name.trim();
    if (!name) {
      this.setMsg('Give the deck a name first.', 'bad');
      return;
    }
    if (this.saved.some((d) => d.name === name) && this.loadedName !== name) {
      this.dlg = { kind: 'confirm', text: `A saved deck called "${name}" already exists. Replace it with this one?`, yes: 'Replace it', run: () => this.doSave() };
      this.renderDialog();
      return;
    }
    this.doSave();
  }

  private deleteSaved(): void {
    const name = this.loadedName;
    if (name === null) return;
    this.dlg = {
      kind: 'confirm',
      text: `Delete the saved deck "${name}"? This cannot be undone.`,
      yes: 'Delete it',
      run: () => {
        if (!this.writeSaved(this.saved.filter((d) => d.name !== name))) return;
        this.loadedName = null;
        this.dirty = this.cards.length > 0;
        this.dlg = null;
        this.renderDialog();
        this.setMsg(`Deleted "${name}". The cards stay in the builder until you start a new deck.`, '');
        this.refreshDeck();
      },
    };
    this.renderDialog();
  }

  /** Every `data-ui` that starts with "b-" lands here. */
  click(el: HTMLElement): void {
    const ui = el.dataset.ui!;
    const v = el.dataset.v ?? '';
    const id = el.dataset.id ?? '';
    const f = this.filters;
    const toggle = <T>(set: Set<T>, x: T): void => {
      if (set.has(x)) set.delete(x);
      else set.add(x);
    };
    switch (ui) {
      case 'b-add': return this.add(id);
      case 'b-remove': return this.remove(id);
      case 'b-faction': toggle(f.factions, v as FactionId); return this.refilter();
      case 'b-type': toggle(f.types, v as CardDef['type']); return this.refilter();
      case 'b-cost': f.cost = f.cost === Number(v) ? null : Number(v); return this.refilter();
      case 'b-kw': f.keyword = f.keyword === v ? null : v; return this.refilter();
      case 'b-clear':
        this.filters = { factions: new Set(), types: new Set(), cost: null, keyword: null, text: '' };
        this.searchInput.value = '';
        return this.refilter();
      case 'b-back': return this.guard(() => this.host.leave(), 'Leaving the builder discards the deck you are building');
      case 'b-new': return this.guard(() => { this.load(DEFAULT_NAME, [], null); this.setMsg('A new, empty deck.', ''); }, 'A new deck replaces the one you are building');
      case 'b-save': return this.save();
      case 'b-delete': return this.deleteSaved();
      case 'b-open': this.dlg = { kind: 'open' }; return this.renderDialog();
      case 'b-premade': this.dlg = { kind: 'premade' }; return this.renderDialog();
      case 'b-autofill': this.dlg = { kind: 'autofill', a: null, b: null }; return this.renderDialog();
      case 'b-import': this.dlg = { kind: 'import', problem: null }; return this.renderDialog();
      case 'b-export': this.dlg = { kind: 'export' }; return this.renderDialog();
      case 'b-dlg-close': this.dlg = null; return this.renderDialog();
      case 'b-load': {
        const d = this.saved[Number(el.dataset.i)];
        if (d) this.guard(() => this.load(d.name, d.cards, d.name), 'Opening a saved deck replaces the one you are building');
        return;
      }
      case 'b-copy': {
        const d = premadeDecks()[Number(el.dataset.i)];
        if (d) this.guard(() => { this.load(`${d.name} copy`, d.cards, null); this.dirty = true; this.setMsg(`Copied "${d.name}". Change it as you like, then save.`, 'ok'); }, 'Copying a premade deck replaces the one you are building');
        return;
      }
      case 'b-af-a':
      case 'b-af-b': {
        if (this.dlg?.kind !== 'autofill') return;
        if (ui === 'b-af-a') this.dlg.a = v as FactionId;
        else this.dlg.b = v as FactionId;
        return this.renderDialog();
      }
      case 'b-af-go': {
        const d = this.dlg;
        if (d?.kind !== 'autofill' || !d.a || !d.b || d.a === d.b) return;
        const [a, b] = [d.a, d.b];
        this.guard(() => {
          this.load(this.name === DEFAULT_NAME || this.name.trim() === '' ? `${FACTION_INFO[a].name} + ${FACTION_INFO[b].name}` : this.name, autoDeck(a, b), null);
          this.dirty = true;
          this.setMsg(`Filled with ${FACTION_INFO[a].name} and ${FACTION_INFO[b].name} cards.`, 'ok');
        }, 'Auto-fill replaces the deck you are building');
        return;
      }
      case 'b-import-go': return this.doImport();
      case 'b-select-code': {
        const ta = this.dialogEl.querySelector<HTMLTextAreaElement>('textarea');
        ta?.focus();
        ta?.select();
        return;
      }
      case 'b-confirm-yes': {
        const d = this.dlg;
        if (d?.kind !== 'confirm') return;
        this.dlg = null;
        this.renderDialog();
        d.run();
        return;
      }
      default: throw new Error(`unknown builder action ${ui}`);
    }
  }

  private refilter(): void {
    this.buildFilters();
    this.buildGrid();
  }

  private doImport(): void {
    const ta = this.dialogEl.querySelector<HTMLTextAreaElement>('textarea');
    this.importText = ta?.value ?? this.importText;
    const r = importDeck(this.importText);
    if (!r.deck) {
      this.dlg = { kind: 'import', problem: r.problem ?? 'That is not a deck code.' };
      this.renderDialog();
      return;
    }
    const deck = r.deck;
    this.guard(() => {
      this.load(deck.name, deck.cards, null);
      this.dirty = true;
      this.importText = '';
      const check = deckStats(deck.cards).check;
      this.setMsg(check.ok ? `Imported "${deck.name}".` : `Imported "${deck.name}", but it is not legal yet: ${check.errors.join('; ')}.`, check.ok ? 'ok' : 'bad');
    }, 'Importing replaces the deck you are building');
  }

  // ---------- dialogs (inside the builder, so they never touch the game overlay) ----------
  private renderDialog(): void {
    const d = this.dlg;
    if (!d) {
      this.dialogEl.replaceChildren();
      return;
    }
    const head = (title: string): HTMLElement => h('div', { class: 'modal-head' }, h('h2', { text: title }), this.mkBtn('Close', 'b-dlg-close', 'btn small'));
    let body: HTMLElement[];
    let title: string;
    switch (d.kind) {
      case 'confirm': {
        const box = h('div', { class: 'bd-dialog facet small' }, h('h2', { text: 'Are you sure?' }), h('p', { text: d.text }), h('div', { class: 'confirm-btns' }, this.mkBtn(d.yes, 'b-confirm-yes', 'btn primary'), this.mkBtn('Cancel', 'b-dlg-close', 'btn')));
        this.dialogEl.replaceChildren(h('div', { class: 'bd-back' }, box));
        box.querySelector<HTMLElement>('.btn')?.focus();
        return;
      }
      case 'open': {
        title = 'Open a saved deck';
        const list = h('div', { class: 'bd-pick' });
        if (this.saved.length === 0) list.append(h('p', { class: 'bd-empty', text: 'No saved decks yet. Build a legal deck and press Save.' }));
        this.saved.forEach((s, i) => list.append(this.deckPick(s, 'b-load', i)));
        body = [list];
        break;
      }
      case 'premade': {
        title = 'Copy a premade deck';
        const list = h('div', { class: 'bd-pick' });
        premadeDecks().forEach((p, i) => list.append(this.deckPick(p, 'b-copy', i)));
        body = [h('p', { class: 'hint', text: PREMADE_NOTE }), list];
        break;
      }
      case 'autofill': {
        title = 'Auto-fill from two factions';
        const rowFor = (label: string, ui: string, cur: FactionId | null): HTMLElement => {
          const row = h('div', { class: 'bd-frow' }, h('span', { class: 'lbl', text: label }));
          for (const f of FACTIONS) {
            row.append(h('button', { class: `bd-fac ${cur === f ? 'on' : ''}`, data: { ui, v: f }, style: { '--hue': String(FACTION_INFO[f].hue) }, attrs: { type: 'button', 'aria-pressed': String(cur === f) } }, h('span', { class: 'gem' }), h('span', { class: 'bd-facname', text: FACTION_INFO[f].name })));
          }
          return row;
        };
        const ready = !!d.a && !!d.b && d.a !== d.b;
        const msg = !d.a || !d.b ? 'Choose a first and a second faction.' : d.a === d.b ? 'Choose two different factions.' : `${FACTION_INFO[d.a].name} + ${FACTION_INFO[d.b].name}: ${FACTION_INFO[d.a].blurb}`;
        const go = this.mkBtn('Fill the deck', 'b-af-go', `btn primary ${ready ? '' : 'disabled'}`);
        go.disabled = !ready;
        body = [rowFor('FIRST', 'b-af-a', d.a), rowFor('SECOND', 'b-af-b', d.b), h('p', { class: 'hint', text: msg }), h('p', { class: 'hint', text: 'This replaces the cards in the builder with a curve-built deck. You can change any card afterwards.' }), go];
        break;
      }
      case 'import': {
        title = 'Import a deck code';
        const ta = h('textarea', { class: 'bd-code', attrs: { rows: '4', placeholder: 'Paste a deck code here, e.g. My deck|storm-jax*3,...', 'aria-label': 'Deck code', spellcheck: 'false' }, data: { ui: 'b-code-in' } });
        ta.value = this.importText;
        ta.addEventListener('input', () => { this.importText = ta.value; });
        body = [ta, d.problem ? h('div', { class: 'bd-err', text: d.problem }) : h('p', { class: 'hint', text: 'A code looks like name|card*count,card*count. Every card must exist and appear at most 3 times.' }), this.mkBtn('Import', 'b-import-go', 'btn primary')];
        break;
      }
      case 'export': {
        title = 'Export this deck';
        const code = exportDeck({ name: this.name.trim() || DEFAULT_NAME, cards: this.cards });
        const ta = h('textarea', { class: 'bd-code', attrs: { rows: '5', readonly: '', 'aria-label': 'Deck code', spellcheck: 'false' }, data: { ui: 'b-code-out' } });
        ta.value = code;
        ta.addEventListener('focus', () => ta.select());
        body = [ta, h('p', { class: 'hint', text: 'Copy this code to share the deck. Import code turns it back into a deck.' }), this.mkBtn('Select all', 'b-select-code', 'btn')];
        break;
      }
    }
    const box = h('div', { class: 'bd-dialog facet' }, head(title), ...body);
    this.dialogEl.replaceChildren(h('div', { class: 'bd-back' }, box));
    box.querySelector<HTMLElement>('textarea:not([readonly])')?.focus();
  }

  private deckPick(d: DeckList, ui: string, i: number): HTMLElement {
    const st = deckStats(d.cards);
    return h(
      'button',
      { class: 'bd-pickrow facet', data: { ui, i }, attrs: { type: 'button' } },
      h('b', { class: 'deck-name', text: d.name }),
      h('span', { class: 'deck-n', text: `${d.cards.length} cards${st.check.ok ? '' : ', not legal'}` }),
      factionTags(d.cards),
      h('span', { class: 'deck-plan', text: deckPlan(d.cards) }),
    );
  }
}

// Card faces, unit tiles, the inspector content. All text goes in through textContent; the only innerHTML
// is our own generated SVG (art.ts), never card or player data.
import type { GameState, Seat, Unit } from '../engine/types';
import { costOf, def, face, findUnit, stats } from '../engine/query';
import type { Face } from '../engine/query';
import { FACTION_INFO } from '../data/decks';
import { cardArt } from './art';
import { KEYWORD_HELP, WORD_HELP, lineSegs } from './text';
import type { Seg } from './text';
import type { LogEntry } from '../engine/types';

type Kid = Node | string | null | false | undefined;
export interface Attrs {
  class?: string;
  text?: string;
  data?: Record<string, string | number>;
  style?: Record<string, string>;
  attrs?: Record<string, string>;
}

/** Tiny DOM builder. Text is always a text node. */
export function h<K extends keyof HTMLElementTagNameMap>(tag: K, a: Attrs = {}, ...kids: Kid[]): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  if (a.class) el.className = a.class;
  if (a.text !== undefined) el.textContent = a.text;
  if (a.data) for (const [k, v] of Object.entries(a.data)) el.dataset[k] = String(v);
  if (a.style) for (const [k, v] of Object.entries(a.style)) el.style.setProperty(k, v);
  if (a.attrs) for (const [k, v] of Object.entries(a.attrs)) {
    if (k === 'title') throw new Error('No native tooltips: do not set a title attribute');
    el.setAttribute(k, v);
  }
  for (const k of kids) if (k !== null && k !== false && k !== undefined) el.append(k);
  return el;
}

export function art(cardId: string, ascended: boolean): HTMLElement {
  const el = h('span', { class: 'artbox' });
  el.innerHTML = cardArt(cardId, ascended);
  return el;
}

export const hueOf = (cardId: string): number => FACTION_INFO[def(cardId).faction].hue;
const factionName = (cardId: string): string => FACTION_INFO[def(cardId).faction].name;

export function gem(cardId: string): HTMLElement {
  return h('span', { class: 'gem', style: { '--hue': String(hueOf(cardId)) } });
}

export function typeLine(cardId: string): string {
  const d = def(cardId);
  const t = d.type === 'glyph' ? `Glyph, ${d.speed ?? ''}` : d.type === 'hero' ? 'Hero' : 'Unit';
  return `${t}${d.tribe ? ` / ${d.tribe}` : ''}`;
}

export function kwPills(kws: string[]): HTMLElement {
  const box = h('span', { class: 'kws' });
  for (const k of kws) box.append(h('span', { class: `kw kw-${k}`, text: (KEYWORD_HELP[k as keyof typeof KEYWORD_HELP]?.name ?? k).slice(0, 3).toUpperCase() }));
  return box;
}

export interface UnitDisplay {
  f: Face;
  power: number;
  hp: number;
  max: number;
  keywords: string[];
  dmg: number;
}
export function unitDisplay(view: GameState, u: Unit): UnitDisplay {
  const st = stats(view, u);
  return { f: face(view, u.owner, u.card), power: st.power, hp: st.hp, max: st.health, keywords: st.keywords, dmg: u.dmg };
}

function statClass(now: number, printed: number): string {
  return now > printed ? 'up' : now < printed ? 'down' : '';
}

/** A unit tile for a Line or the battle row. */
export function unitEl(view: GameState, u: Unit, extra = ''): HTMLElement {
  const d = unitDisplay(view, u);
  const el = h(
    'div',
    {
      class: `unit facet ${def(u.card).type === 'hero' ? 'hero' : ''} ${d.f.ascended ? 'asc' : ''} ${u.stasis ? 'stasis' : ''} ${u.ward ? 'warded' : ''} ${u.dmg > 0 ? 'hurt' : ''} ${extra}`,
      data: { unit: u.iid, card: u.card, seat: u.owner },
      style: { '--hue': String(d.f.ascended ? 46 : hueOf(u.card)) },
    },
    art(u.card, d.f.ascended),
    h('span', { class: 'u-name', text: d.f.name }),
    d.keywords.length ? kwPills(d.keywords) : null,
    h(
      'span',
      { class: 'u-st' },
      h('span', { class: `pow ${statClass(d.power, d.f.power)}`, text: String(d.power) }),
      h('span', { class: `hp ${d.dmg > 0 ? 'down' : statClass(d.max, d.f.health)}`, text: String(d.hp) }),
    ),
    u.stasis ? h('span', { class: 'u-tag', text: 'STASIS' }) : null,
    u.ward ? h('span', { class: 'u-ward' }) : null,
    d.dmg > 0 ? h('span', { class: 'u-crack' }) : null,
  );
  return el;
}

/** A card in hand (face up). */
export function handCardEl(view: GameState, seat: Seat, iid: string, cardId: string): HTMLElement {
  const d = def(cardId);
  const f = face(view, seat, cardId);
  const cost = costOf(view, seat, cardId);
  const costCls = cost < d.cost ? 'up' : cost > d.cost ? 'down' : '';
  return h(
    'div',
    {
      class: `card hand-card facet t-${d.type} ${f.ascended ? 'asc' : ''}`,
      data: { card: cardId, seat, hand: iid },
      style: { '--hue': String(f.ascended ? 46 : hueOf(cardId)) },
    },
    h('span', { class: 'c-top' }, h('span', { class: `cost ${costCls}`, text: String(cost) }), h('span', { class: 'c-name', text: f.name })),
    h('span', { class: 'c-art' }, art(cardId, f.ascended), d.type !== 'glyph' ? h('span', { class: 'c-st' }, h('span', { class: 'pow', text: String(f.power) }), h('span', { class: 'hp', text: String(f.health) })) : null),
    h('span', { class: 'c-type' }, gem(cardId), h('span', { text: typeLine(cardId) })),
    h('span', { class: 'c-text', text: f.text }),
  );
}

export function cardBack(): HTMLElement {
  return h('span', { class: 'back facet' }, h('span', { class: 'back-mark' }));
}

/** A one-line row for the Scrap, deck lists and stack. */
export function rowEl(cardId: string, seat: Seat, count?: number): HTMLElement {
  const d = def(cardId);
  return h(
    'div',
    { class: 'row facet', data: { card: cardId, seat }, style: { '--hue': String(hueOf(cardId)) } },
    gem(cardId),
    h('span', { class: 'row-cost', text: String(d.cost) }),
    h('span', { class: 'row-name', text: d.name }),
    h('span', { class: 'row-type', text: d.type === 'glyph' ? `glyph, ${d.speed}` : d.type }),
    count && count > 1 ? h('span', { class: 'row-n', text: `x${count}` }) : null,
  );
}

export function nameOf(view: GameState | null, seat: Seat | undefined, id: string): string {
  return seat !== undefined && view ? face(view, seat, id).name : def(id).name;
}

/** A log sentence with card names as inspect doorways. */
export function segsEl(segs: Seg[], view: GameState | null): HTMLElement {
  const el = h('span', { class: 'sentence' });
  for (const s of segs) {
    if (typeof s === 'string') el.append(document.createTextNode(s));
    else el.append(h('span', { class: 'cardname', text: nameOf(view, s.seat, s.card), data: s.seat === undefined ? { card: s.card } : { card: s.card, seat: s.seat } }));
  }
  return el;
}

// ---------- hero progress ----------
export interface Progress {
  n: number;
  need: number;
  text: string;
  done: boolean;
  /** Counted only while a copy is on the Line. */
  onLineOnly: boolean;
}
export function heroProgress(view: GameState, seat: Seat, heroId: string): Progress {
  const lv = def(heroId).level;
  if (!lv) throw new Error(`${heroId} has no level condition`);
  const p = view.players[seat];
  const done = p.ascended.includes(heroId);
  let n: number;
  if (lv.who === 'you') n = p.seen[lv.stat] ?? 0;
  else n = Math.max(0, ...p.line.filter((u) => u.card === heroId).map((u) => u.seen[lv.stat] ?? 0));
  return { n: done ? lv.n : Math.min(n, lv.n), need: lv.n, text: lv.text, done, onLineOnly: lv.who === 'self' };
}

// ---------- big card ----------
export interface BigOpts {
  cardId: string;
  seat: Seat;
  f: Face;
  cost: number | null;
  unit?: { power: number; hp: number; max: number; keywords: string[] };
  note?: string;
}

function statRow(label: string, now: number, printed: number): HTMLElement {
  return h('div', { class: 'ins-stat' }, h('span', { class: 'lbl', text: label }), h('span', { class: `val ${statClass(now, printed)}`, text: String(now) }), now !== printed ? h('span', { class: 'printed', text: `printed ${printed}` }) : null);
}

export function bigCard(o: BigOpts): HTMLElement {
  const d = def(o.cardId);
  const el = h(
    'div',
    { class: `big facet t-${d.type} ${o.f.ascended ? 'asc' : ''}`, style: { '--hue': String(o.f.ascended ? 46 : hueOf(o.cardId)) } },
    h('div', { class: 'big-head' }, o.cost !== null ? h('span', { class: 'cost', text: String(o.cost) }) : null, h('span', { class: 'big-name', text: o.f.name })),
    art(o.cardId, o.f.ascended),
    h('div', { class: 'big-type' }, gem(o.cardId), h('span', { text: `${typeLine(o.cardId)}, ${factionName(o.cardId)}` })),
  );
  if (d.type !== 'glyph') {
    const stats2 = h('div', { class: 'ins-stats' });
    if (o.unit) {
      stats2.append(statRow('Power', o.unit.power, o.f.power), h('div', { class: 'ins-stat' }, h('span', { class: 'lbl', text: 'Health' }), h('span', { class: `val ${o.unit.hp < o.unit.max ? 'down' : statClass(o.unit.max, o.f.health)}`, text: `${o.unit.hp} / ${o.unit.max}` }), o.unit.max !== o.f.health ? h('span', { class: 'printed', text: `printed ${o.f.health}` }) : null));
    } else {
      stats2.append(statRow('Power', o.f.power, o.f.power), statRow('Health', o.f.health, o.f.health));
    }
    el.append(stats2);
  }
  el.append(h('div', { class: 'big-text', text: o.f.text }));
  const kws = o.unit ? o.unit.keywords : o.f.keywords;
  const help: HTMLElement[] = [];
  for (const k of kws) {
    const kh = KEYWORD_HELP[k as keyof typeof KEYWORD_HELP];
    if (!kh) throw new Error(`No KEYWORD_HELP for ${k}`);
    help.push(h('div', { class: 'kwh' }, h('b', { text: kh.name }), h('span', { text: ` ${kh.text}` })));
  }
  const textAll = `${o.f.text} ${d.type === 'hero' ? `${d.text} ${d.ascended?.text ?? ''}` : ''}`;
  for (const [word, say] of Object.entries(WORD_HELP)) {
    if (new RegExp(`\\b${word}\\b`).test(textAll)) help.push(h('div', { class: 'kwh' }, h('b', { text: word }), h('span', { text: ` ${say}` })));
  }
  if (help.length) el.append(h('div', { class: 'kw-help' }, ...help));
  if (o.note) el.append(h('div', { class: 'big-note', text: o.note }));
  return el;
}

/** The inspector: the large card, plus both faces and progress for heroes. */
export function inspectorContent(view: GameState | null, seat: Seat, cardId: string, unitIid?: string): HTMLElement {
  const d = def(cardId);
  const f = face(view, seat, cardId);
  const u = view && unitIid ? findUnit(view, unitIid) : undefined;
  const cost = view ? costOf(view, seat, cardId) : d.cost;
  const root = h('div', { class: 'ins-wrap' });
  root.append(
    bigCard({
      cardId, seat, f, cost,
      unit: u && view ? { power: stats(view, u).power, hp: stats(view, u).hp, max: stats(view, u).health, keywords: stats(view, u).keywords } : undefined,
    }),
  );
  if (d.type === 'hero' && d.level && d.ascended) {
    const pr = view ? heroProgress(view, seat, cardId) : null;
    const other = f.ascended ? face(null, seat, cardId) : null;
    const sec = h(
      'div',
      { class: 'hero-sec facet' },
      h('div', { class: 'hs-head', text: f.ascended ? 'Ascended' : 'Level condition' }),
      h('div', { class: 'hs-text', text: d.level.text }),
      pr ? h('div', { class: `hs-prog ${pr.done ? 'done' : ''}` }, h('span', { class: 'bar' }, h('span', { class: 'fill', style: { width: `${Math.round((pr.n / pr.need) * 100)}%` } })), h('span', { class: 'num', text: `${pr.n} / ${pr.need}` })) : null,
      pr?.onLineOnly ? h('div', { class: 'hs-note', text: 'Counts only while this hero is on your Line.' }) : null,
    );
    if (!f.ascended) {
      sec.append(h('div', { class: 'hs-asc' }, h('b', { text: `Ascended: ${d.ascended.name ?? d.name}` }), h('span', { text: `  ${d.ascended.power}/${d.ascended.health}` }), h('div', { text: d.ascended.text })));
    } else if (other) {
      sec.append(h('div', { class: 'hs-asc' }, h('b', { text: `Before: ${other.name}` }), h('span', { text: `  ${other.power}/${other.health}` }), h('div', { text: other.text })));
    }
    root.append(sec);
  }
  return root;
}

export function lineSegsEl(e: LogEntry, view: GameState | null): HTMLElement {
  return segsEl(lineSegs(e), view);
}

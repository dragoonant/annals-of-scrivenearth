// Card faces, unit tiles, the inspector content. All text goes in through textContent; the only innerHTML
// is our own generated SVG (art.ts), never card or player data.
import type { GameState, Keyword, Seat, Unit } from '../engine/types';
import { costOf, def, face, findUnit, stats, unitFace } from '../engine/query';
import type { Face } from '../engine/query';
import { FACTION_INFO } from '../data/decks';
import { cardArt, crownSvg, frostSvg, keywordIcon, wardRimSvg, wireArtImg } from './art';
import { KEYWORD_HELP, STATUS_HELP, WORD_HELP, lineSegs, roundBuffText } from './text';
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

/** Card art: a real <img> when art/manifest.json lists it, else the procedural sigil. */
export function art(cardId: string, ascended: boolean): HTMLElement {
  const el = h('span', { class: 'artbox' });
  el.innerHTML = cardArt(cardId, ascended);
  const img = el.querySelector('img');
  if (img) wireArtImg(img, cardId, ascended);
  return el;
}

/** A span holding one of our own inline SVGs. */
export function svgSpan(cls: string, markup: string): HTMLElement {
  const el = h('span', { class: cls });
  el.innerHTML = markup;
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

/** Small cut-gem icons, one per keyword. The name is explained in the inspector, never as a tooltip. */
export function kwIcons(kws: string[], cls = 'kwi-row'): HTMLElement {
  const box = h('span', { class: cls });
  for (const k of kws) box.append(svgSpan(`kwi kwi-${k}`, keywordIcon(k as Keyword)));
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
  return { f: unitFace(view, u), power: st.power, hp: st.hp, max: st.health, keywords: st.keywords, dmg: u.dmg };
}

function statClass(now: number, printed: number): string {
  return now > printed ? 'up' : now < printed ? 'down' : '';
}

/** Net this-round buff on a unit (from its mods), or null when it has none. */
export function roundBuff(u: Unit): { power: number; health: number; kw: string[] } | null {
  const r = u.mods.filter((m) => m.dur === 'round');
  if (!r.length) return null;
  return { power: r.reduce((a, m) => a + m.power, 0), health: r.reduce((a, m) => a + m.health, 0), kw: r.flatMap((m) => m.kw ?? []) };
}

/** A unit tile for a Line or the battle row. */
export function unitEl(view: GameState, u: Unit, extra = ''): HTMLElement {
  const d = unitDisplay(view, u);
  const cd = def(u.card);
  const isHero = cd.type === 'hero';
  const prog = isHero && !d.f.ascended && cd.level ? heroProgress(view, u.owner, u.card) : null;
  const buff = roundBuff(u);
  const cls = [
    'unit facet', isHero ? 'hero' : '', d.f.ascended ? 'asc' : '', u.stasis ? 'stasis' : '', u.ward ? 'warded' : '', u.dmg > 0 ? 'hurt' : '',
    d.keywords.includes('unstable') ? 'unstable' : '', u.silenced ? 'silenced' : '', buff ? 'buffed' : '', u.doomed ? 'doomed' : '', extra,
  ].filter(Boolean).join(' ');
  const el = h(
    'div',
    { class: cls, data: { unit: u.iid, card: u.card, seat: u.owner }, style: { '--hue': String(d.f.ascended ? 46 : hueOf(u.card)) } },
    art(u.card, d.f.ascended),
    u.stasis ? svgSpan('u-frost', frostSvg()) : null,
    d.f.ascended ? svgSpan('u-crown', crownSvg()) : null,
    u.ward ? svgSpan('u-ward', wardRimSvg()) : null,
    h('span', { class: 'u-cost', text: String(cd.cost) }),
    d.keywords.length ? kwIcons(d.keywords.slice(0, 5), 'u-kws') : null,
    h('span', { class: 'u-marks' },
      buff ? h('span', { class: 'u-mark buff', attrs: { 'aria-label': 'buffed this round' } }) : null,
      u.silenced ? h('span', { class: 'u-mark sil', attrs: { 'aria-label': 'silenced' } }) : null,
    ),
    h('span', { class: 'u-name', text: d.f.name }),
    h(
      'span',
      { class: 'u-st' },
      h('span', { class: `pow ${statClass(d.power, d.f.power)}`, text: String(d.power) }),
      h('span', { class: `hp ${d.dmg > 0 ? 'down' : statClass(d.max, d.f.health)}`, text: String(d.hp) }),
    ),
    prog ? h('span', { class: 'u-prog' }, h('span', { class: 'fill', style: { width: `${Math.round((prog.n / prog.need) * 100)}%` } })) : null,
    u.stasis ? h('span', { class: 'u-tag', text: 'STASIS' }) : null,
    d.dmg > 0 ? h('span', { class: 'u-crack' }) : null,
  );
  return el;
}

/** Update the shown numbers of a unit tile in place (the director does this as damage, heal and buff events pass). */
export function patchUnitEl(el: HTMLElement, view: GameState, u: Unit): void {
  const d = unitDisplay(view, u);
  const pow = el.querySelector<HTMLElement>('.u-st .pow');
  const hp = el.querySelector<HTMLElement>('.u-st .hp');
  if (pow) {
    pow.textContent = String(d.power);
    pow.className = `pow ${statClass(d.power, d.f.power)}`;
  }
  if (hp) {
    hp.textContent = String(d.hp);
    hp.className = `hp ${d.dmg > 0 ? 'down' : statClass(d.max, d.f.health)}`;
  }
  el.classList.toggle('hurt', d.dmg > 0);
  const crack = el.querySelector('.u-crack');
  if (d.dmg > 0 && !crack) el.append(h('span', { class: 'u-crack' }));
  else if (d.dmg === 0 && crack) crack.remove();
}

/** A card in hand (face up). */
export function handCardEl(view: GameState, seat: Seat, iid: string, cardId: string): HTMLElement {
  const d = def(cardId);
  const f = face(view, seat, cardId);
  const cost = costOf(view, seat, cardId);
  const costCls = cost < d.cost ? 'up' : cost > d.cost ? 'down' : '';
  const kws = d.type === 'glyph' ? [] : f.keywords;
  return h(
    'div',
    {
      class: `card hand-card facet t-${d.type} ${f.ascended ? 'asc' : ''}`,
      data: { card: cardId, seat, hand: iid },
      style: { '--hue': String(f.ascended ? 46 : hueOf(cardId)) },
    },
    h('span', { class: 'c-top' },
      h('span', { class: `cost ${costCls}`, text: String(cost) }),
      costCls === 'up' ? h('span', { class: 'cost-was', text: String(d.cost) }) : null,
      h('span', { class: 'c-name', text: f.name })),
    h('span', { class: 'c-art' }, art(cardId, f.ascended),
      kws.length ? kwIcons(kws.slice(0, 4), 'c-kws') : null,
      d.type !== 'glyph' ? h('span', { class: 'c-st' }, h('span', { class: 'pow', text: String(f.power) }), h('span', { class: 'hp', text: String(f.health) })) : null),
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
    help.push(h('div', { class: 'kwh' }, svgSpan('kwi', keywordIcon(k as Keyword)), h('b', { text: kh.name }), h('span', { text: ` ${kh.text}` })));
  }
  const textAll = `${o.f.text} ${d.type === 'hero' ? `${d.text} ${d.ascended?.text ?? ''}` : ''}`;
  for (const [word, say] of Object.entries(WORD_HELP)) {
    if (new RegExp(`\\b${word}\\b`).test(textAll)) help.push(h('div', { class: 'kwh' }, h('b', { text: word }), h('span', { text: ` ${say}` })));
  }
  if (help.length) el.append(h('div', { class: 'kw-help' }, ...help));
  if (o.note) el.append(h('div', { class: 'big-note', text: o.note }));
  return el;
}

/** The inspector: the large card, plus both faces and progress for heroes, plus the unit's live statuses. */
export function inspectorContent(view: GameState | null, seat: Seat, cardId: string, unitIid?: string): HTMLElement {
  const d = def(cardId);
  const u = view && unitIid ? findUnit(view, unitIid) : undefined;
  const f = u ? unitFace(view, u) : face(view, seat, cardId);
  const cost = view ? costOf(view, seat, cardId) : d.cost;
  const root = h('div', { class: 'ins-wrap' });
  const st = u && view ? stats(view, u) : null;
  const col = h('div', { class: 'ins-col' });
  col.append(
    bigCard({
      cardId, seat, f, cost,
      unit: st ? { power: st.power, hp: st.hp, max: st.health, keywords: st.keywords } : undefined,
    }),
  );
  if (u) {
    const lines: string[] = [];
    if (u.stasis) lines.push(STATUS_HELP.stasis);
    if (u.ward) lines.push(STATUS_HELP.ward);
    if (u.silenced) lines.push(STATUS_HELP.silenced);
    if (u.doomed) lines.push(STATUS_HELP.doomed);
    const rb = roundBuff(u);
    if (rb && (rb.power || rb.health)) lines.push(roundBuffText(rb.power, rb.health));
    if (lines.length) col.append(h('div', { class: 'ins-status' }, ...lines.map((l) => h('div', { class: 'ins-st', text: l }))));
  }
  root.append(col);
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
  if (d.type === 'unit' && d.level && d.ascended) { // R-E5 Unfold
    const n = u?.seen[d.level.stat] ?? 0;
    const sec = h(
      'div',
      { class: 'hero-sec facet' },
      h('div', { class: 'hs-head', text: f.ascended ? 'Unfolded' : 'Unfolds when' }),
      h('div', { class: 'hs-text', text: d.level.text }),
      u ? h('div', { class: `hs-prog ${f.ascended ? 'done' : ''}` }, h('span', { class: 'bar' }, h('span', { class: 'fill', style: { width: `${Math.round((Math.min(n, d.level.n) / d.level.n) * 100)}%` } })), h('span', { class: 'num', text: `${Math.min(n, d.level.n)} / ${d.level.n}` })) : null,
      h('div', { class: 'hs-note', text: 'Counts only while this unit is on your Line. Only this unit Unfolds.' }),
    );
    if (!f.ascended) sec.append(h('div', { class: 'hs-asc' }, h('b', { text: `Unfolded: ${d.ascended.name ?? d.name}` }), h('span', { text: `  ${d.ascended.power}/${d.ascended.health}` }), h('div', { text: d.ascended.text })));
    root.append(sec);
  }
  return root;
}

export function lineSegsEl(e: LogEntry, view: GameState | null): HTMLElement {
  return segsEl(lineSegs(e), view);
}

// ---------- inspector placement ----------
const hits = (a: { left: number; top: number; right: number; bottom: number }, x: number, y: number, w: number, hh: number, m = 6): boolean =>
  x < a.right + m && x + w > a.left - m && y < a.bottom + m && y + hh > a.top - m;

/**
 * Place the inspector box next to `anchor` and never over it: above the hand for a hand card, beside the unit
 * for a Line unit (the other side, above or below when the first does not fit; narrower when only a narrow gap is
 * free), clamped to the viewport.
 */
export function placeInspector(box: HTMLElement, anchor: Element): void {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const pad = 8;
  const gap = 12;
  box.style.width = '';
  const fullW = box.offsetWidth;
  const r = anchor.getBoundingClientRect();
  const inHand = !!anchor.closest('[data-hand], .hand');
  interface Try { x: number; y: number; w: number; h: number }
  const measure = (w: number): { w: number; h: number } => {
    box.style.width = w === fullW ? '' : `${w}px`;
    return { w: box.offsetWidth, h: box.offsetHeight };
  };
  const clampX = (x: number, w: number): number => Math.max(pad, Math.min(vw - w - pad, x));
  const clampY = (y: number, hh: number): number => Math.max(pad, Math.min(vh - hh - pad, y));
  const tries: (() => Try | null)[] = [];
  const above = (): Try | null => { const m = measure(fullW); return { x: clampX(r.left + r.width / 2 - m.w / 2, m.w), y: r.top - m.h - gap, w: m.w, h: m.h }; };
  const below = (): Try | null => { const m = measure(fullW); return { x: clampX(r.left + r.width / 2 - m.w / 2, m.w), y: r.bottom + gap, w: m.w, h: m.h }; };
  // A side is usable only when the box still fits there at its stylesheet floor (min-width): the compact board's
  // inspector keeps its text column readable and falls through to above/below instead of squeezing to a sliver.
  const right = (): Try | null => {
    const avail = vw - pad - (r.right + gap);
    if (avail < 230) return null;
    const m = measure(Math.min(fullW, avail));
    if (m.w > avail + 0.5) return null;
    return { x: r.right + gap, y: clampY(r.top + r.height / 2 - m.h / 2, m.h), w: m.w, h: m.h };
  };
  const left = (): Try | null => {
    const avail = r.left - gap - pad;
    if (avail < 230) return null;
    const m = measure(Math.min(fullW, avail));
    if (m.w > avail + 0.5) return null;
    return { x: r.left - gap - m.w, y: clampY(r.top + r.height / 2 - m.h / 2, m.h), w: m.w, h: m.h };
  };
  if (inHand) tries.push(above, right, left);
  else tries.push(right, left, above, below);
  let best: Try | null = null;
  let bestOver = Infinity;
  for (const t of tries) {
    const c = t();
    if (!c) continue;
    const inside = c.x >= pad - 0.5 && c.y >= pad - 0.5 && c.x + c.w <= vw - pad + 0.5 && c.y + c.h <= vh - pad + 0.5;
    const over = hits(r, c.x, c.y, c.w, c.h) ? 1 + Math.max(0, Math.min(r.right, c.x + c.w) - Math.max(r.left, c.x)) * Math.max(0, Math.min(r.bottom, c.y + c.h) - Math.max(r.top, c.y)) : 0;
    if (inside && over === 0) { best = c; bestOver = 0; break; }
    const score = over + (inside ? 0 : 1e9);
    if (score < bestOver) { best = c; bestOver = score; }
  }
  if (!best) best = { x: pad, y: pad, w: fullW, h: box.offsetHeight };
  const m = measure(best.w);
  box.style.left = `${Math.round(clampX(best.x, m.w))}px`;
  box.style.top = `${Math.round(clampY(best.y, m.h))}px`;
}

// The app opens the inspector (hover 300 ms / long-press) and gives it a first position; this re-places it with
// placeInspector() before it is ever painted, so it never covers the card that opened it.
let placerOn = false;
let lastAnchor: Element | null = null;
export function installInspectorPlacer(): void {
  if (placerOn || typeof document === 'undefined') return;
  placerOn = true;
  const note = (e: Event): void => {
    const t = e.target as Element | null;
    const a = t?.closest?.('[data-card]') ?? null;
    if (a) lastAnchor = a;
  };
  document.addEventListener('pointerover', note, true);
  document.addEventListener('pointerdown', note, true);
  new MutationObserver((muts) => {
    for (const m of muts) {
      for (const n of m.addedNodes) {
        if (!(n instanceof HTMLElement) || !n.classList.contains('inspector')) continue;
        const anchor = lastAnchor && document.contains(lastAnchor) ? lastAnchor : null;
        if (anchor) placeInspector(n, anchor);
      }
    }
  }).observe(document.body, { childList: true, subtree: true });
}

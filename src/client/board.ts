// The board and the mulligan, drawn from the presented view of seat 0. Every affordance comes from the engine's
// legalActions / whyNot* / targetChoices; every number from stats(), costOf(), face(). A full re-render per change,
// plus a targeting overlay (SVG) that is redrawn on hover without re-rendering.
import type { Action, GameState, Result, Seat, Unit } from '../engine/types';
import { LIMITS } from '../engine/types';
import { legalActions, targetChoices, whyNotBlockAction, whyNotChannel, whyNotDeclare, whyNotPlay } from '../engine/rules';
import { costOf, def, face, findUnit, stats, targetSpecs } from '../engine/query';
import { cardBack, handCardEl, h, heroProgress, installInspectorPlacer, lineSegsEl, svgSpan, unitEl } from './cardview';
import { spireSvg } from './art';
import { fxScale } from './fx';
import { targetPrompt } from './text';

export interface BoardUI {
  armed: string | null;
  picked: string[];
  notice: string | null;
  duelFor: string | null;
  blockUnit: string | null;
  blockAtt: string | null;
  mull: Set<string>;
  /** R-U1: the unit of yours chosen to scrap when the Line is full. */
  scrap: string | null;
}
export const newBoardUI = (): BoardUI => ({ armed: null, picked: [], notice: null, duelFor: null, blockUnit: null, blockAtt: null, mull: new Set(), scrap: null });

export interface BoardHost {
  view(): GameState;
  locked(): boolean;
  act(a: Action): Result;
  rerender(): void;
}

const other = (s: Seat): Seat => (s === 0 ? 1 : 0);

export function clearSel(ui: BoardUI): void {
  ui.armed = null;
  ui.picked = [];
  ui.duelFor = null;
  ui.blockUnit = null;
  ui.blockAtt = null;
  ui.scrap = null;
}

// ---------- derived interaction ----------
interface Targets {
  slots: number;
  legal: Set<string>;
  /** Choosing which of your units to scrap (Line full). */
  scrapPhase?: boolean;
}
function lineFullFor(v: GameState, ui: BoardUI): boolean {
  if (!ui.armed) return false;
  const hc = v.players[0].hand.find((x) => x.iid === ui.armed);
  return !!hc && def(hc.card).type !== 'glyph' && v.players[0].line.length >= LIMITS.line;
}
function armedTargets(v: GameState, ui: BoardUI): Targets {
  if (!ui.armed) return { slots: 0, legal: new Set() };
  if (lineFullFor(v, ui) && !ui.scrap) {
    // legal scraps come from legalActions: play actions that carry `replace`
    const legal = new Set<string>();
    for (const a of legalActions(v)) if (a.type === 'play' && a.iid === ui.armed && a.replace) legal.add(a.replace);
    return { slots: 0, legal, scrapPhase: true };
  }
  const choices = targetChoices(v, 0, ui.armed).filter((c) => !ui.scrap || !c.includes(ui.scrap));
  const slots = choices[0]?.length ?? 0;
  if (slots === 0) return { slots: 0, legal: new Set() };
  const legal = new Set<string>();
  for (const c of choices) if (ui.picked.every((p, i) => c[i] === p) && c.length > ui.picked.length) legal.add(c[ui.picked.length]);
  return { slots, legal };
}

function playAction(ui: BoardUI, targets: string[]): Action {
  const a: Action = { type: 'play', iid: ui.armed! };
  if (targets.length) a.targets = targets;
  if (ui.scrap) a.replace = ui.scrap;
  return a;
}

export function passLabel(v: GameState): string {
  if (v.stack.length > 0) return 'Let it resolve';
  if (v.phase === 'combat') return 'No response: strike';
  if (v.passes >= 1) return 'End round';
  return 'Pass';
}

function cardName(v: GameState, seat: Seat, id: string): string {
  return face(v, seat, id).name;
}

// ---------- combat forecast (pure) ----------
export interface Forecast {
  pairIndex: number;
  att: string;
  blk: string | null;
  kind: 'open' | 'blocked' | 'gone';
  /** The attacker's power, and the blocker's (null when nothing blocks it). */
  aPower: number;
  bPower: number | null;
  /** Health left on each side before the strikes. */
  aHp: number;
  bHp: number | null;
  /** Damage that reaches the defending Spire from this pair. */
  spire: number;
  attDestroyed: boolean | null;
  blkDestroyed: boolean | null;
  /** The blocker's Ward will absorb the attacker's strike. */
  blkWard: boolean;
  attWard: boolean;
  text: string;
}

/**
 * What this pair will do if the strikes resolved now, read only from stats() and the rules for power, remaining
 * health, Plated (R-K5), Ward (R-K7), Vanguard (R-K1), Corrosive (R-K12) and Pierce (R-K2). Glyphs cast in the
 * combat window can change it. Null when the pair or its attacker is gone.
 */
export function forecast(v: GameState, pairIndex: number): Forecast | null {
  const pr = v.combat?.pairs[pairIndex];
  if (!pr) return null;
  const att = findUnit(v, pr.att);
  if (!att) return null;
  const a = stats(v, att);
  const base = { pairIndex, att: pr.att, blk: pr.blk, aPower: a.power, aHp: a.hp };
  const pierce = a.keywords.includes('pierce');
  if (pr.blk === null) {
    return { ...base, kind: 'open', bPower: null, bHp: null, spire: a.power, attDestroyed: null, blkDestroyed: null, blkWard: false, attWard: false, text: `${a.power} to the Spire` };
  }
  const blk = pr.blk ? findUnit(v, pr.blk) : undefined;
  if (!blk) {
    // R-B7: the blocker is gone: only Pierce gets through
    const sp = pierce ? a.power : 0;
    return { ...base, kind: 'gone', bPower: null, bHp: null, spire: sp, attDestroyed: false, blkDestroyed: null, blkWard: false, attWard: false, text: sp > 0 ? `${sp} to the Spire (Pierce)` : 'Blocker gone: no damage' };
  }
  const b = stats(v, blk);
  const toBlk = a.power <= 0 ? 0 : blk.ward ? 0 : Math.max(0, a.power - (b.keywords.includes('plated') ? 1 : 0));
  const blkDestroyed = toBlk >= b.hp || (a.keywords.includes('corrosive') && toBlk > 0);
  const excess = pierce ? Math.max(0, toBlk - b.hp) : 0;
  // R-K1: a Vanguard attacker that destroys its blocker takes no strike back
  const strikesBack = b.power > 0 && !(a.keywords.includes('vanguard') && blkDestroyed);
  const toAtt = !strikesBack ? 0 : att.ward ? 0 : Math.max(0, b.power - (a.keywords.includes('plated') ? 1 : 0));
  const attDestroyed = toAtt >= a.hp || (b.keywords.includes('corrosive') && toAtt > 0);
  return {
    ...base, kind: 'blocked', bPower: b.power, bHp: b.hp, spire: excess, attDestroyed, blkDestroyed, blkWard: blk.ward && a.power > 0, attWard: att.ward && strikesBack,
    text: `${a.power} vs ${b.power} · attacker ${attDestroyed ? 'is destroyed' : 'survives'} · blocker ${blkDestroyed ? 'is destroyed' : 'survives'}${excess > 0 ? ` · ${excess} to the Spire` : ''}`,
  };
}

// ---------- clicks ----------
export function handleBoardClick(e: Event, host: BoardHost, ui: BoardUI): void {
  if (host.locked()) return;
  const t = e.target as HTMLElement | null;
  if (!t) return;
  const v = host.view();
  const btn = t.closest<HTMLElement>('[data-action]');
  const acts = v.priority === 0 && v.phase !== 'over' ? legalActions(v) : [];
  const done = (a: Action): void => {
    const r = host.act(a);
    if (r.ok) {
      clearSel(ui);
      ui.notice = null;
    } else {
      ui.notice = r.error ?? 'The engine refused that action';
    }
    host.rerender();
  };
  if (btn) {
    const k = btn.dataset.action;
    switch (k) {
      case 'pass': return done({ type: 'pass' });
      case 'attack': return done({ type: 'attack' });
      case 'blocks': return done({ type: 'blocks' });
      case 'channel': if (ui.armed) return done({ type: 'channel', iid: ui.armed }); return;
      case 'play': {
        if (!ui.armed) return;
        const tg = armedTargets(v, ui);
        if (tg.scrapPhase || ui.picked.length < tg.slots) return;
        return done(playAction(ui, ui.picked));
      }
      case 'cancel': clearSel(ui); ui.notice = null; return host.rerender();
      case 'noforce': if (ui.duelFor) return done({ type: 'declare', unit: ui.duelFor }); return;
      case 'mulligan': return done({ type: 'mulligan', replace: [...ui.mull] });
      default: throw new Error(`unknown action button ${String(k)}`);
    }
  }
  const handEl = t.closest<HTMLElement>('[data-hand]');
  const unitElm = t.closest<HTMLElement>('[data-unit]');
  const spireEl = t.closest<HTMLElement>('[data-spire]');
  const stackEl = t.closest<HTMLElement>('[data-sid]');
  if (v.phase === 'mulligan') {
    if (handEl && v.priority === 0 && !v.players[0].mulliganed) {
      const iid = handEl.dataset.hand!;
      if (ui.mull.has(iid)) ui.mull.delete(iid);
      else ui.mull.add(iid);
      host.rerender();
    }
    return;
  }
  const tg = armedTargets(v, ui);
  const pickTarget = (id: string): boolean => {
    if (!ui.armed || !tg.legal.has(id)) return false;
    ui.notice = null;
    if (tg.scrapPhase) {
      ui.scrap = id;
      const after = armedTargets(v, ui);
      if (after.slots === 0) {
        done(playAction(ui, []));
        if (ui.armed) ui.scrap = null;
      } else host.rerender();
      return true;
    }
    ui.picked.push(id);
    // the last slot chosen plays the card (the owner's rule: a click on a legal target plays it)
    if (ui.picked.length >= tg.slots) {
      done(playAction(ui, [...ui.picked]));
      if (ui.armed) ui.picked.pop(); // refused: keep the card armed, ask again for the last slot
    } else host.rerender();
    return true;
  };
  if (v.priority !== 0) {
    if (handEl || unitElm) {
      ui.notice = 'Not your turn to act';
      host.rerender();
    }
    return;
  }
  if (ui.armed && (unitElm || spireEl || stackEl)) {
    const id = unitElm?.dataset.unit ?? (spireEl ? `spire${spireEl.dataset.spire}` : stackEl!.dataset.sid!);
    if (pickTarget(id)) return;
    if (tg.slots > 0) {
      ui.notice = 'That is not a legal target';
      host.rerender();
      return;
    }
  }
  if (handEl) {
    const iid = handEl.dataset.hand!;
    if (ui.armed === iid) {
      clearSel(ui);
      ui.notice = null;
      return host.rerender();
    }
    clearSel(ui);
    const why = whyNotPlay(v, 0, iid);
    const canChannel = whyNotChannel(v, 0, iid) === null;
    if (why && !canChannel) {
      ui.notice = why;
    } else {
      ui.armed = iid;
      ui.picked = [];
      ui.notice = why;
    }
    return host.rerender();
  }
  if (t.closest('.pslot')) return;
  if (unitElm) {
    const iid = unitElm.dataset.unit!;
    const owner = Number(unitElm.dataset.seat) as Seat;
    ui.notice = null;
    if (ui.duelFor) {
      if (acts.some((a) => a.type === 'declare' && a.unit === ui.duelFor && a.duel === iid)) return done({ type: 'declare', unit: ui.duelFor, duel: iid });
      ui.notice = whyNotDeclare(v, 0, ui.duelFor, iid) ?? 'Choose one of the highlighted enemy units, or press No forced block';
      return host.rerender();
    }
    if (v.phase === 'main' || v.phase === 'declare') {
      if (owner !== 0) return;
      if (v.combat?.pairs.some((p) => p.att === iid)) return done({ type: 'undeclare', unit: iid });
      if (acts.some((a) => a.type === 'declare' && a.unit === iid && a.duel === undefined)) {
        const duels = acts.filter((a) => a.type === 'declare' && a.unit === iid && a.duel !== undefined);
        if (duels.length) {
          ui.duelFor = iid;
          return host.rerender();
        }
        return done({ type: 'declare', unit: iid });
      }
      ui.notice = whyNotDeclare(v, 0, iid);
      return host.rerender();
    }
    if (v.phase === 'block' && v.combat) {
      const pairAsAtt = v.combat.pairs.find((p) => p.att === iid);
      const pairAsBlk = v.combat.pairs.find((p) => p.blk === iid);
      if (owner === 0) {
        if (pairAsBlk) {
          if (pairAsBlk.forced) {
            ui.notice = 'A Dueler forced this block';
            return host.rerender();
          }
          return done({ type: 'unblock', unit: iid });
        }
        if (ui.blockAtt) {
          const why = whyNotBlockAction(v, 0, iid, ui.blockAtt);
          if (why) {
            ui.notice = why;
            return host.rerender();
          }
          const att = ui.blockAtt;
          clearSel(ui);
          return done({ type: 'block', unit: iid, att });
        }
        if (ui.blockUnit === iid) ui.blockUnit = null;
        else {
          ui.blockUnit = iid;
          const first = v.combat.pairs.find((p) => p.blk === null);
          const anyOk = v.combat.pairs.some((p) => p.blk === null && whyNotBlockAction(v, 0, iid, p.att) === null);
          if (!anyOk && first) ui.notice = whyNotBlockAction(v, 0, iid, first.att) ?? 'This unit cannot block';
        }
        return host.rerender();
      }
      if (pairAsAtt) {
        if (pairAsAtt.blk !== null) {
          ui.notice = 'That attacker is already blocked';
          return host.rerender();
        }
        if (ui.blockUnit) {
          const why = whyNotBlockAction(v, 0, ui.blockUnit, iid);
          if (why) {
            ui.notice = why;
            return host.rerender();
          }
          const u = ui.blockUnit;
          clearSel(ui);
          return done({ type: 'block', unit: u, att: iid });
        }
        ui.blockAtt = ui.blockAtt === iid ? null : iid;
        return host.rerender();
      }
    }
    return;
  }
  // click on empty space puts things back
  if (ui.armed || ui.duelFor || ui.blockUnit || ui.blockAtt || ui.notice) {
    clearSel(ui);
    ui.notice = null;
    host.rerender();
  }
}

export function handleBoardKey(e: KeyboardEvent, host: BoardHost, ui: BoardUI): boolean {
  if (e.key === 'Escape' && (ui.armed || ui.duelFor || ui.blockUnit || ui.blockAtt || ui.notice)) {
    clearSel(ui);
    ui.notice = null;
    host.rerender();
    return true;
  }
  return false;
}

// ---------- targeting overlay ----------
// An SVG layer inside .board. It draws (1) a line from the armed card to the hovered legal target, a "1" mark on a
// first-chosen target, and (2) a line from each glyph on the stack to its targets: the newest item's always, any
// other on hover. It is redrawn on pointer movement without re-rendering the board.
const SVGNS = 'http://www.w3.org/2000/svg';
let cur: { host: BoardHost; ui: BoardUI } | null = null;
let hoverTarget: string | null = null;
let hoverSid: string | null = null;
let hoverInstalled = false;

function elOfId(id: string): HTMLElement | null {
  if (id.startsWith('spire')) return document.querySelector<HTMLElement>(`[data-spire="${id.slice(5)}"]`);
  return document.querySelector<HTMLElement>(`[data-unit="${id}"]`) ?? document.querySelector<HTMLElement>(`[data-sid="${id}"]`);
}

function installHover(): void {
  if (hoverInstalled || typeof document === 'undefined') return;
  hoverInstalled = true;
  document.addEventListener('pointerover', (e) => {
    const el = e.target as Element | null;
    const u = el?.closest?.('[data-unit]') as HTMLElement | null;
    const sp = el?.closest?.('[data-spire]') as HTMLElement | null;
    const st = el?.closest?.('[data-sid]') as HTMLElement | null;
    const id = u ? u.dataset.unit! : sp ? `spire${sp.dataset.spire}` : st ? st.dataset.sid! : null;
    const sid = st ? st.dataset.sid! : null;
    if (id === hoverTarget && sid === hoverSid) return;
    hoverTarget = id;
    hoverSid = sid;
    redrawOverlay();
  });
}

function svgEl<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string>): SVGElementTagNameMap[K] {
  const el = document.createElementNS(SVGNS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

function drawLink(svg: SVGSVGElement, org: DOMRect, a: { x: number; y: number }, b: { x: number; y: number }, cls: string): void {
  const x1 = a.x - org.left;
  const y1 = a.y - org.top;
  const x2 = b.x - org.left;
  const y2 = b.y - org.top;
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2 - Math.min(60, Math.hypot(x2 - x1, y2 - y1) * 0.18);
  const d = `M${x1.toFixed(1)},${y1.toFixed(1)} Q${mx.toFixed(1)},${my.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}`;
  svg.append(svgEl('path', { d, class: `tl-glow ${cls}`, fill: 'none' }), svgEl('path', { d, class: `tl-line ${cls}`, fill: 'none' }));
  const s = 7;
  svg.append(svgEl('polygon', { class: `tl-end ${cls}`, points: `${x2},${y2 - s} ${x2 + s},${y2} ${x2},${y2 + s} ${x2 - s},${y2}` }));
}

const topCenter = (r: DOMRect): { x: number; y: number } => ({ x: r.left + r.width / 2, y: r.top + Math.min(10, r.height * 0.1) });
const midCenter = (r: DOMRect): { x: number; y: number } => ({ x: r.left + r.width / 2, y: r.top + r.height / 2 });

export function redrawOverlay(): void {
  const board = typeof document === 'undefined' ? null : document.querySelector<HTMLElement>('.board');
  if (!board || !cur) return;
  let svg = board.querySelector<SVGSVGElement>(':scope > svg.tgt-layer');
  if (!svg) {
    svg = svgEl('svg', { class: 'tgt-layer' });
    board.append(svg);
  }
  svg.replaceChildren();
  const v = cur.host.view();
  const ui = cur.ui;
  const org = board.getBoundingClientRect();
  // 1. the armed card and its targets
  if (ui.armed && !cur.host.locked()) {
    const src = document.querySelector<HTMLElement>(`[data-hand="${ui.armed}"]`);
    const tg = armedTargets(v, ui);
    if (src) {
      const from = topCenter(src.getBoundingClientRect());
      const marks = [...ui.picked];
      if (ui.scrap) marks.unshift(ui.scrap);
      marks.forEach((id, i) => {
        const el = elOfId(id);
        if (!el) return;
        const r = el.getBoundingClientRect();
        if (ui.scrap && i === 0) drawLink(svg!, org, from, midCenter(r), 'scrap');
        else {
          drawLink(svg!, org, from, midCenter(r), 'amber picked');
          const n = i + 1 - (ui.scrap ? 1 : 0);
          const bx = r.left + r.width / 2 - org.left;
          const by = r.top - org.top;
          svg!.append(svgEl('polygon', { class: 'tl-badge', points: `${bx},${by - 12} ${bx + 12},${by} ${bx},${by + 12} ${bx - 12},${by}` }));
          const tx = svgEl('text', { class: 'tl-badge-n', x: String(bx), y: String(by + 5), 'text-anchor': 'middle' });
          tx.textContent = String(n);
          svg!.append(tx);
        }
      });
      if (hoverTarget && tg.legal.has(hoverTarget)) {
        const el = elOfId(hoverTarget);
        if (el) drawLink(svg, org, from, midCenter(el.getBoundingClientRect()), 'amber live');
      }
    }
  }
  // 2. the stack: the newest item always, any other on hover
  const drawn = new Set<string>();
  const items = v.stack;
  const show = [items[items.length - 1]?.sid, hoverSid].filter((x): x is string => !!x);
  for (const sid of show) {
    if (drawn.has(sid)) continue;
    drawn.add(sid);
    const it = items.find((x) => x.sid === sid);
    const srcEl = document.querySelector<HTMLElement>(`[data-sid="${sid}"]`);
    if (!it || !srcEl) continue;
    const sr = srcEl.getBoundingClientRect();
    const from = { x: sr.left, y: sr.top + sr.height / 2 };
    for (const tid of it.targets) {
      const el = elOfId(tid);
      if (!el) continue;
      drawLink(svg, org, from, midCenter(el.getBoundingClientRect()), it.owner === 0 ? 'mine' : 'theirs');
    }
  }
}

// ---------- drawing ----------
function cells(n: number, max: number, cls: string): HTMLElement {
  const box = h('span', { class: `cells ${cls}` });
  const total = Math.max(max, n);
  for (let i = 0; i < total; i++) box.append(h('span', { class: `cell ${i < n ? 'on' : ''} ${i >= max ? 'extra' : ''}`, data: { i } }));
  return box;
}

function heroChips(v: GameState, seat: Seat): HTMLElement {
  const box = h('div', { class: `s-heroes ${v.players[seat].heroes.length > 3 ? 'many' : ''}` });
  for (const hid of v.players[seat].heroes) {
    const pr = heroProgress(v, seat, hid);
    const f = face(v, seat, hid);
    box.append(
      h(
        'div',
        { class: `chip facet ${pr.done ? 'asc' : ''}`, data: { card: hid, seat }, style: { '--hue': String(pr.done ? 46 : 205) } },
        h('span', { class: 'chip-top' }, h('span', { class: 'chip-name', text: f.name.split(',')[0] }), h('span', { class: 'chip-n', text: pr.done ? 'ASCENDED' : `${pr.n} / ${pr.need}` })),
        h('span', { class: 'chip-bar' }, h('span', { class: 'fill', style: { width: `${Math.round((pr.n / pr.need) * 100)}%` } })),
        h('span', { class: 'chip-text', text: pr.text }),
      ),
    );
  }
  return box;
}

function sidePanel(v: GameState, seat: Seat, tg: Targets, canTargetSpire: boolean): HTMLElement {
  const p = v.players[seat];
  const spireTarget = canTargetSpire && tg.legal.has(`spire${seat}`);
  const damaged = p.spire < LIMITS.spire;
  const holds = v.initiative === seat && v.round > 0;
  return h(
    'div',
    { class: `side facet ${seat === 0 ? 'me' : 'opp'} ${holds ? 'holds' : ''}`, data: { side: seat } },
    h('span', { class: 'conduit' }),
    h(
      'div',
      { class: 's-top' },
      h(
        'div',
        { class: `s-spire ${spireTarget ? 'is-target' : ''} ${damaged ? 'damaged' : ''}`, data: { spire: seat } },
        svgSpan('spire-art', spireSvg(p.spire)),
        h('span', { class: 's-int' }, h('b', { text: String(p.spire) }), h('i', { text: 'SPIRE' })),
      ),
      h('div', { class: 's-flags' },
        h('div', { class: 's-who', text: seat === 0 ? 'YOU' : 'OPPONENT' }),
        holds ? h('span', { class: 'init', text: 'INITIATIVE' }) : null,
        p.canAttack && v.phase !== 'over' ? h('span', { class: 'canatk', text: p.extraAttacks > 0 ? `CAN ATTACK +${p.extraAttacks}` : 'CAN ATTACK' }) : null,
      ),
    ),
    h('div', { class: 's-cells' }, h('span', { class: 's-lbl', text: 'CHARGE' }), cells(p.charge, p.maxCharge, 'charge'), h('span', { class: 's-num', text: `${p.charge}/${p.maxCharge}` })),
    h('div', { class: 's-cells' }, h('span', { class: 's-lbl', text: 'RESERVE' }), cells(p.reserve, LIMITS.reserve, 'reserve'), h('span', { class: 's-num', text: String(p.reserve) })),
    h(
      'div',
      { class: 's-counts' },
      h('span', { class: 'cnt cnt-deck' }, h('i', { text: 'DECK' }), h('b', { text: String(p.deck.length) })),
      h('span', { class: 'cnt cnt-hand' }, h('i', { text: 'HAND' }), h('b', { text: String(p.hand.length) })),
      h('button', { class: 'cnt scrapbtn', data: { ui: 'scrap' } }, h('i', { text: 'SCRAP' }), h('b', { text: String(p.scrap.length) })),
    ),
    heroChips(v, seat),
  );
}

/** The forecast chip drawn on the conduit of a pair. */
function chipEl(f: Forecast): HTMLElement {
  if (f.kind === 'open') return h('span', { class: 'fchip open' }, h('b', { text: `${f.spire} to the Spire` }));
  if (f.kind === 'gone') return h('span', { class: 'fchip gone' }, h('b', { text: f.spire > 0 ? `${f.spire} to the Spire` : 'no damage' }), h('i', { text: f.spire > 0 ? 'Pierce' : 'blocker gone' }));
  const aFate = f.attDestroyed ? 'dies' : 'lives';
  const bFate = f.blkDestroyed ? 'dies' : 'lives';
  return h(
    'span',
    { class: 'fchip blocked' },
    h('b', {}, h('span', { class: `fa ${aFate}`, text: String(f.aPower) }), ' vs ', h('span', { class: `fb ${bFate}`, text: String(f.bPower) })),
    h('i', {}, h('span', { class: `fa ${aFate}`, text: f.attDestroyed ? 'attacker destroyed' : 'attacker survives' }), h('span', { class: 'fsep', text: ' · ' }), h('span', { class: `fb ${bFate}`, text: f.blkDestroyed ? 'blocker destroyed' : 'blocker survives' }), f.spire > 0 ? h('span', { class: 'fspire', text: ` · ${f.spire} to the Spire` }) : null),
  );
}

// FLIP: units and stack items that moved since the last render slide from where they were (attackers into the battle
// row, blockers opposite their attacker). Skipped at instant speed and on a resize.
let lastSize = '';
function captureRects(): Map<string, DOMRect> {
  const m = new Map<string, DOMRect>();
  if (typeof document === 'undefined') return m;
  document.querySelectorAll<HTMLElement>('.board [data-unit], .board [data-sid]').forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.width > 0) m.set(el.dataset.unit ? `u:${el.dataset.unit}` : `s:${el.dataset.sid}`, r);
  });
  return m;
}
function playFlip(before: Map<string, DOMRect>): void {
  if (fxScale() <= 0 || before.size === 0) return;
  document.querySelectorAll<HTMLElement>('.board [data-unit], .board [data-sid]').forEach((el) => {
    const old = before.get(el.dataset.unit ? `u:${el.dataset.unit}` : `s:${el.dataset.sid}`);
    if (!old) return;
    const r = el.getBoundingClientRect();
    const dx = old.left - r.left;
    const dy = old.top - r.top;
    if (Math.abs(dx) < 3 && Math.abs(dy) < 3) return;
    el.animate([{ transform: `translate(${dx}px, ${dy}px) scale(${old.width / r.width}, ${old.height / r.height})` }, { transform: 'none' }], { duration: 260 * fxScale(), easing: 'cubic-bezier(.2,.9,.2,1)' });
  });
}

export function renderBoard(host: BoardHost, ui: BoardUI): HTMLElement {
  const before = captureRects(); // the previous board is still mounted: where everything was
  const v = host.view();
  const mine = v.players[0];
  const opp = v.players[1];
  const interactive = !host.locked() && v.priority === 0 && v.phase !== 'over';
  const acts = interactive ? legalActions(v) : [];
  const tg = interactive ? armedTargets(v, ui) : { slots: 0, legal: new Set<string>() };
  const playable = new Set<string>();
  const channelable = new Set<string>();
  const declarable = new Set<string>();
  const blockers = new Set<string>();
  for (const a of acts) {
    if (a.type === 'play') playable.add(a.iid);
    else if (a.type === 'channel') channelable.add(a.iid);
    else if (a.type === 'declare' && a.duel === undefined) declarable.add(a.unit);
    else if (a.type === 'block') blockers.add(a.unit);
  }
  const duelOptions = new Set<string>();
  if (ui.duelFor) for (const a of acts) if (a.type === 'declare' && a.unit === ui.duelFor && a.duel) duelOptions.add(a.duel);
  const inCombatIds = new Set<string>();
  for (const p of v.combat?.pairs ?? []) {
    inCombatIds.add(p.att);
    if (p.blk) inCombatIds.add(p.blk);
  }
  const first = ui.picked[0];

  const board = h('div', { class: 'board' });
  board.append(h('div', { class: 'a-opp' }, sidePanel(v, 1, tg, interactive)), h('div', { class: 'a-me' }, sidePanel(v, 0, tg, interactive)));

  // opponent hand as card backs
  const backs = h('div', { class: 'opphand' });
  for (let i = 0; i < opp.hand.length; i++) backs.append(cardBack());
  board.append(backs);

  // lines
  const lineEl = (seat: Seat): HTMLElement => {
    const p = v.players[seat];
    const el = h('div', { class: `line ${seat === 0 ? 'me' : 'opp'}`, data: { side: seat } }, h('span', { class: 'conduit' }));
    for (let i = 0; i < LIMITS.line; i++) {
      const u = p.line[i];
      if (!u) {
        el.append(h('div', { class: 'slot empty facet' }));
        continue;
      }
      if (inCombatIds.has(u.iid)) {
        el.append(h('div', { class: 'slot ghost facet' }));
        continue;
      }
      const cls: string[] = [];
      if (seat === 0 && (declarable.has(u.iid) || blockers.has(u.iid))) cls.push('actable');
      if (tg.legal.has(u.iid) || duelOptions.has(u.iid)) cls.push('is-target');
      if (ui.blockUnit === u.iid || ui.duelFor === u.iid) cls.push('selected');
      if (first === u.iid || ui.scrap === u.iid) cls.push('picked');
      el.append(unitEl(v, u, cls.join(' ')));
    }
    return el;
  };
  board.append(h('div', { class: 'a-oppline' }, lineEl(1)), h('div', { class: 'a-meline' }, lineEl(0)));

  // battle row: each pair is a column, the opponent's unit above and yours below, joined by a conduit with its chip
  const battle = h('div', { class: 'battle facet' });
  if (v.combat && v.combat.pairs.length) {
    const pairs = h('div', { class: `pairs n${v.combat.pairs.length}` });
    const attackerSeat = v.combat.attacker;
    v.combat.pairs.forEach((pr, idx) => {
      const att = findUnit(v, pr.att);
      if (!att) return;
      const blk = pr.blk ? findUnit(v, pr.blk) : undefined;
      const fc = forecast(v, idx);
      const aCls: string[] = ['mini', 'attacking'];
      if (attackerSeat === 0 && v.phase === 'declare') aCls.push('actable');
      if (ui.blockAtt === att.iid) aCls.push('selected');
      if (v.phase === 'block' && attackerSeat === 1 && pr.blk === null && ui.blockUnit) aCls.push('is-target');
      const attEl = unitEl(v, att, aCls.join(' '));
      let blkEl: HTMLElement | null = null;
      if (blk) blkEl = unitEl(v, blk, `mini blocking ${pr.forced ? 'forced' : ''} ${ui.blockUnit === blk.iid ? 'selected' : ''}`);
      const empty = (label: string): HTMLElement => h('div', { class: 'pslot', text: label });
      const topEl = attackerSeat === 1 ? attEl : blkEl ?? empty(attackerSeat === 0 ? (v.phase === 'declare' ? 'its blocker' : pr.blk === '' ? 'no blocker' : 'open') : 'blocker');
      const botEl = attackerSeat === 0 ? attEl : blkEl ?? empty('your blocker');
      const mid = h('div', { class: `pmid ${blk ? 'blocked' : ''} ${fc?.kind ?? ''}` }, h('span', { class: 'link' }));
      if (fc && v.phase !== 'declare') mid.append(chipEl(fc));
      else if (v.phase === 'declare') mid.append(h('span', { class: 'fchip open' }, h('b', { text: 'to be blocked' })));
      pairs.append(h('div', { class: `pair ${blk ? 'blocked' : ''} ${attackerSeat === 1 ? 'foe-att' : 'my-att'}`, data: { pair: idx } }, topEl, mid, botEl));
    });
    battle.append(pairs);
  } else {
    battle.append(h('div', { class: 'battle-empty', text: 'BATTLE ROW' }));
  }
  battle.append(h('span', { class: 'roundtag', text: `ROUND ${v.round}` }));
  board.append(h('div', { class: 'a-battle' }, battle));

  // stack
  const stack = h('div', { class: 'stack facet' }, h('div', { class: 'stack-h', text: 'STACK' }));
  if (v.stack.length === 0) stack.append(h('div', { class: 'stack-empty', text: 'No glyphs waiting' }));
  v.stack.slice().reverse().forEach((it, i) => {
    const d = def(it.card);
    const tnames = it.targets.map((id) => {
      if (id === 'spire0') return 'Your Spire';
      if (id === 'spire1') return "Opponent's Spire";
      const u = findUnit(v, id);
      if (u) return cardName(v, u.owner, u.card);
      const s = v.stack.find((x) => x.sid === id);
      return s ? def(s.card).name : 'a gone target';
    });
    stack.append(
      h(
        'div',
        { class: `sitem facet ${it.owner === 0 ? 'mine' : 'theirs'} ${i === 0 ? 'newest' : ''} ${tg.legal.has(it.sid) ? 'is-target' : ''}`, data: { sid: it.sid, card: it.card, seat: it.owner }, style: { '--hue': '205' } },
        h('span', { class: 'si-top' }, h('span', { class: 'si-who', text: it.owner === 0 ? 'YOU' : 'OPP' }), h('span', { class: 'si-name', text: d.name }), h('span', { class: 'si-speed', text: d.speed ?? '' })),
        tnames.length ? h('span', { class: 'si-tgt' }, h('span', { class: 'sline' }), h('span', { text: tnames.join(', ') })) : null,
      ),
    );
  });
  board.append(h('div', { class: 'a-stack' }, stack));

  // action bar
  board.append(h('div', { class: 'a-action' }, actionBar(v, ui, interactive, tg, channelable, playable)));

  // hand: a fan, consistent card size, playable cards rise and carry the actable edge
  const hand = h('div', { class: 'hand', data: { count: mine.hand.length } });
  const n = mine.hand.length;
  mine.hand.forEach((hc, i) => {
    const el = handCardEl(v, 0, hc.iid, hc.card);
    const off = i - (n - 1) / 2;
    el.style.setProperty('--fr', `${(off * Math.min(2.4, 14 / Math.max(n, 1))).toFixed(2)}deg`);
    const maxOff = Math.max(1, (n - 1) / 2);
    el.style.setProperty('--fy', `${((off * off - maxOff * maxOff) * 0.09 - 0.6).toFixed(2)}rem`); // the centre stands highest; nothing leaves the board
    el.style.setProperty('--z', String(i + 1));
    if (playable.has(hc.iid) || channelable.has(hc.iid)) el.classList.add('actable');
    if (ui.armed === hc.iid) el.classList.add('armed');
    hand.append(el);
  });
  board.append(h('div', { class: 'a-hand' }, hand));

  board.classList.toggle('nostack', v.stack.length === 0);

  // after mount: the overlay, the FLIP slide
  cur = { host, ui };
  installHover();
  installInspectorPlacer();
  const size = `${window.innerWidth}x${window.innerHeight}`;
  const resized = size !== lastSize;
  lastSize = size;
  requestAnimationFrame(() => {
    redrawOverlay();
    if (!resized) playFlip(before);
  });
  return board;
}

function respondLine(v: GameState): string {
  const who = v.priority === 0 ? 'You' : 'The opponent';
  const att = v.combat?.attacker;
  const first = att === undefined ? '' : att === 0 ? ' You attacked, so you act first.' : ' The opponent attacked, so they act first.';
  return v.passes >= 1
    ? `Combat window: ${who} may respond; the other side has passed. A Swift or Flash glyph, or pass to strike.`
    : `Combat window: ${who} may respond with a Swift or Flash glyph, or pass.${first}`;
}

function actionBar(v: GameState, ui: BoardUI, interactive: boolean, tg: Targets, channelable: Set<string>, playable: Set<string>): HTMLElement {
  const bar = h('div', { class: `actionbar facet ${interactive ? 'live' : 'wait'}` });
  const status = h('div', { class: 'status' });
  const btns = h('div', { class: 'btns' });
  const mine = v.players[0];
  let line: string;
  if (v.phase === 'over') line = 'The game is over.';
  else if (v.priority === 1) {
    line = v.phase === 'block' ? 'The opponent is choosing blocks…'
      : v.phase === 'declare' ? 'The opponent is choosing attackers…'
      : v.phase === 'combat' ? 'Combat window: the opponent may respond with a Swift or Flash glyph, or pass.'
      : v.stack.length ? 'The opponent is responding…' : 'The opponent is thinking…';
  } else if (!interactive) line = 'Resolving…';
  else if (ui.armed) {
    const hc = mine.hand.find((x) => x.iid === ui.armed);
    if (!hc) throw new Error('armed card is not in hand');
    const d = def(hc.card);
    const name = cardName(v, 0, hc.card);
    const specs = targetSpecs(v, 0, hc.card);
    const cost = costOf(v, 0, hc.card);
    if (tg.scrapPhase) line = `Your Line is full: choose one of your units to scrap for ${name}`;
    else if (tg.slots > 0 && ui.picked.length < tg.slots) line = targetPrompt(hc.card, name, ui.picked.length, tg.slots, specs[ui.picked.length]);
    else if (playable.has(hc.iid)) line = `Ready: ${name}. Press Play.`;
    else line = `${name}: ${d.type === 'hero' ? 'Channel it, or put it back' : 'put it back'}.`;
    if (playable.has(hc.iid) && tg.slots === 0 && !tg.scrapPhase) {
      const pay = d.type === 'glyph' ? `${cost} Charge or Reserve` : `${cost} Charge`;
      btns.append(h('button', { class: 'btn primary', data: { action: 'play' }, text: `Play ${name} (${pay})` }));
    }
    if (channelable.has(hc.iid)) {
      btns.append(h('button', { class: 'btn', data: { action: 'channel' }, text: `Channel into ${name} (1 Charge): repair it, +1|+1` }));
    }
    btns.append(h('button', { class: 'btn ghost', data: { action: 'cancel' }, text: 'Put back' }));
  } else if (ui.duelFor) {
    const u = findUnit(v, ui.duelFor);
    line = `Force a blocker for ${u ? cardName(v, 0, u.card) : 'this unit'}?`;
    btns.append(h('button', { class: 'btn', data: { action: 'noforce' }, text: 'No forced block' }));
  } else if (v.phase === 'declare' && v.combat) {
    const n = v.combat.pairs.length;
    line = `Attacking with ${n}. Click more units, click an attacker to withdraw it, or lock it in.`;
    btns.append(h('button', { class: 'btn primary', data: { action: 'attack' }, text: `Attack with ${n}` }));
  } else if (v.phase === 'block' && v.combat) {
    const total = v.combat.pairs.length;
    const blocked = v.combat.pairs.filter((p) => p.blk).length;
    line = ui.blockUnit ? 'Now click the attacker it blocks.' : ui.blockAtt ? 'Now click one of your units to block it.' : `The opponent attacks with ${total}. Click one of your units, then the attacker it blocks.`;
    btns.append(h('button', { class: 'btn primary', data: { action: 'blocks' }, text: `Lock blocks (${blocked} of ${total} blocked)` }));
  } else if (v.phase === 'combat') line = respondLine(v);
  else if (v.stack.length) line = 'Glyphs are waiting. Answer with a Swift or Flash glyph, or let them resolve.';
  else line = mine.canAttack ? 'Your move: play a card, click a unit to attack, or pass.' : 'Your move: play a card or pass.';
  status.append(h('span', { class: 'status-line', text: line }));
  if (ui.notice) status.append(h('span', { class: 'notice', text: ui.notice }));
  if (interactive && (v.phase === 'main' || v.phase === 'combat')) {
    btns.append(h('button', { class: `btn ${ui.armed ? 'ghost' : 'primary'}`, data: { action: 'pass' }, text: passLabel(v) }));
  }
  bar.append(status, btns, h('div', { class: 'menubtns' }, h('button', { class: 'btn small', data: { ui: 'log' }, text: 'Log' }), h('button', { class: 'btn small', data: { ui: 'menu' }, text: 'Menu' })));
  const feed = h('div', { class: 'feed' });
  for (const e of v.log.slice(-4)) feed.append(h('div', { class: 'feed-line' }, lineSegsEl(e, v)));
  bar.append(feed);
  return bar;
}

// ---------- mulligan ----------
export function renderMulligan(host: BoardHost, ui: BoardUI): HTMLElement {
  const v = host.view();
  const me = v.players[0];
  const waiting = me.mulliganed;
  const n = ui.mull.size;
  const hand = h('div', { class: 'mull-hand' });
  for (const hc of me.hand) {
    const el = handCardEl(v, 0, hc.iid, hc.card);
    if (ui.mull.has(hc.iid)) el.classList.add('marked');
    hand.append(el);
  }
  return h(
    'div',
    { class: 'mull' },
    h('div', { class: 'mull-panel facet' },
      h('h2', { text: 'Opening hand' }),
      h('p', { text: waiting ? 'Waiting for the opponent to choose…' : 'Click any cards you want to replace. The replacements are drawn first, then the cards you return are shuffled into your deck.' }),
      hand,
      waiting ? null : h('button', { class: 'btn primary', data: { action: 'mulligan' }, text: n === 0 ? `Keep all ${me.hand.length}` : `Replace ${n}` }),
    ),
  );
}

/** Fit a hand into its container by overlapping cards. Called after mount (needs layout). */
export function fitHand(root: HTMLElement): void {
  const hand = root.querySelector<HTMLElement>('.hand');
  if (!hand) return;
  const cards = hand.querySelectorAll<HTMLElement>('.hand-card');
  if (cards.length < 2) return;
  const cw = cards[0].offsetWidth;
  const avail = hand.clientWidth;
  const gap = parseFloat(getComputedStyle(hand).columnGap || '0') || 0;
  const need = cards.length * cw + (cards.length - 1) * gap;
  const ov = need > avail ? (need - avail) / (cards.length - 1) : 0;
  hand.style.setProperty('--ov', `${Math.ceil(ov)}px`);
}

export { other };

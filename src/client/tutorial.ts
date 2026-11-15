// The tutorial's face: the coach panel, the highlight rings, and the dimming of every input that is not the lesson.
// The script and the one-action-per-step rule live in src/data/tutorial.ts (headless, tested); this file only draws.
import './tutorial.css';
import type { GameState } from '../engine/types';
import type { Click, Focus, Step } from '../data/tutorial';
import { TUTORIAL_STEPS } from '../data/tutorial';
import type { TutorialFlow } from '../data/tutorial';
import type { BoardUI } from './board';
import { h } from './cardview';

const unitSel = (card: string, seat: number): string => `[data-unit][data-card="${card}"][data-seat="${seat}"]`;
const handSel = (card: string): string => `[data-hand][data-card="${card}"]`;
const btnSel = (a: string): string => `.actionbar [data-action="${a}"]`;

const FOCUS_SEL: Record<Focus, string> = {
  charge: '.side.me .cells.charge',
  reserve: '.side.me .cells.reserve',
  initiative: '.side.me .init',
  hero: '.side.me .chip',
  stack: '.a-stack .stack',
  'foe-spire': '.side.opp .s-spire',
};

export interface CoachCtx {
  flow: TutorialFlow;
  v: GameState;
  ui: BoardUI;
  /** The opponent is acting, or a presentation is playing: show a waiting coach, highlight nothing. */
  waiting: boolean;
  /** A correction to show (the player did something other than the lesson). */
  message: string | null;
}

interface Picks {
  /** What to click next (bright ring). */
  hl: string[];
  /** Things to look at (soft ring). */
  look: string[];
  /** Every control the lesson allows right now; everything else is dimmed and refused with a coach line. */
  ok: string[];
}

/** What the lesson wants clicked next, given what is armed or selected on the board right now. */
export function picks(step: Step, v: GameState, ui: BoardUI): Picks {
  const c: Click = step.click;
  const look = (step.focus ?? []).map((f) => FOCUS_SEL[f]);
  switch (c.kind) {
    case 'button':
      return { hl: [btnSel(c.action)], look, ok: [btnSel(c.action)] };
    case 'declare':
      return { hl: [unitSel(c.unit.card, c.unit.seat)], look, ok: [unitSel(c.unit.card, c.unit.seat)] };
    case 'block': {
      const u = unitSel(c.unit.card, c.unit.seat);
      const a = unitSel(c.att.card, c.att.seat);
      if (ui.blockUnit) return { hl: [a], look, ok: [u, a] };
      if (ui.blockAtt) return { hl: [u], look, ok: [u, a] };
      return { hl: [u], look: [...look, a], ok: [u, a] };
    }
    case 'play': {
      const armed = ui.armed ? v.players[0].hand.find((x) => x.iid === ui.armed)?.card : undefined;
      const card = handSel(c.card);
      const ok = [card, btnSel('play'), btnSel('cancel')];
      if (c.target) ok.push(unitSel(c.target.card, c.target.seat));
      if (armed !== c.card) return { hl: [card], look, ok };
      return { hl: [c.target ? unitSel(c.target.card, c.target.seat) : btnSel('play')], look, ok };
    }
  }
}

const all = (root: HTMLElement, sels: string[]): HTMLElement[] => sels.flatMap((s) => [...root.querySelectorAll<HTMLElement>(s)]);

interface Box {
  l: number;
  t: number;
  r: number;
  b: number;
}
const boxOf = (el: Element, pad = 0): Box => {
  const r = el.getBoundingClientRect();
  return { l: r.left - pad, t: r.top - pad, r: r.right + pad, b: r.bottom + pad };
};
const overlap = (a: Box, b: Box): number => {
  const w = Math.min(a.r, b.r) - Math.max(a.l, b.l);
  const hh = Math.min(a.b, b.b) - Math.max(a.t, b.t);
  return w > 0 && hh > 0 ? w * hh : 0;
};

/**
 * Mark the board for the current step and add the coach. Called after every render of the board.
 * `screen` is the element that holds the freshly drawn board.
 */
export function decorate(screen: HTMLElement, ctx: CoachCtx): void {
  const step = ctx.flow.step;
  const layer = h('div', { class: 'tut-layer' });
  screen.append(layer);
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 10;
  const avoid: Box[] = [];
  if (step && !ctx.waiting) {
    const p = picks(step, ctx.v, ctx.ui);
    const ok = new Set(all(screen, p.ok));
    for (const el of ok) el.classList.add('tut-ok');
    for (const el of screen.querySelectorAll<HTMLElement>('[data-hand], [data-unit], .actionbar [data-action]')) {
      if (!el.classList.contains('tut-ok')) el.classList.add('tut-dim');
    }
    const ring = (el: HTMLElement, cls: string): void => {
      const b = boxOf(el, rem * 0.5);
      layer.append(h('div', { class: `tut-ring facet ${cls}`, style: { left: `${b.l}px`, top: `${b.t}px`, width: `${b.r - b.l}px`, height: `${b.b - b.t}px` } }));
      avoid.push(boxOf(el, rem * 0.9));
    };
    for (const el of all(screen, p.hl)) {
      el.classList.add('tut-hl');
      ring(el, 'hl');
    }
    for (const el of all(screen, p.look)) {
      el.classList.add('tut-look');
      ring(el, 'look');
    }
  }
  placeCoach(screen, layer, ctx, avoid, rem);
}

function coachEl(ctx: CoachCtx): HTMLElement {
  const step = ctx.flow.step;
  const total = TUTORIAL_STEPS.length;
  const n = Math.min(ctx.flow.idx + 1, total);
  const head = h('div', { class: 'tc-head' }, h('span', { class: 'tc-step', text: `STEP ${n} OF ${total}` }), h('span', { class: 'tc-topic', text: ctx.waiting && ctx.flow.queue.length > 0 ? 'OPPONENT' : (step?.topic ?? '').toUpperCase() }));
  const text = ctx.waiting ? 'The opponent is taking its turn. Watch the board: your next step starts when it is your move.' : (step?.text ?? '');
  const el = h(
    'div',
    { class: `tut-coach facet ${ctx.waiting ? 'waiting' : ''}`, data: { step: n, topic: step?.id ?? '' } },
    head,
    h('p', { class: 'tc-text', text }),
    ctx.message && !ctx.waiting ? h('p', { class: 'tc-fix', text: `Not yet. ${ctx.message}` }) : null,
    h('div', { class: 'tc-foot' }, h('span', { class: 'tc-bar' }, h('span', { class: 'fill', style: { width: `${Math.round(((n - 1) / total) * 100)}%` } })), h('button', { class: 'btn small ghost', data: { ui: 'tut-skip' }, text: 'Skip tutorial', attrs: { type: 'button' } })),
  );
  return el;
}

/** The coach never covers what it highlights: try the corners and edges in order until one is clear. */
function placeCoach(screen: HTMLElement, layer: HTMLElement, ctx: CoachCtx, avoid: Box[], rem: number): void {
  const el = coachEl(ctx);
  el.style.visibility = 'hidden';
  layer.append(el);
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const w = el.offsetWidth;
  const hh = el.offsetHeight;
  const pad = rem * 0.8;
  const spots: [number, number][] = [
    [pad, pad],
    [vw - w - pad, pad],
    [(vw - w) / 2, pad],
    [pad, (vh - hh) / 2],
    [vw - w - pad, (vh - hh) / 2],
    [(vw - w) / 2, (vh - hh) / 2],
    [pad, vh - hh - pad],
    [vw - w - pad, vh - hh - pad],
    [(vw - w) / 2, vh - hh - pad],
  ];
  // things worth keeping visible when there is room: the pairs in the battle row, the stack, the action bar
  const soft: Box[] = [...screen.querySelectorAll('.pair, .sitem, .actionbar')].map((e) => boxOf(e));
  const cost = (s: [number, number], keep: Box[]): number => {
    const b: Box = { l: s[0], t: s[1], r: s[0] + w, b: s[1] + hh };
    return keep.reduce((n, k) => n + overlap(b, k), 0);
  };
  let best = spots[0];
  let bestScore = Infinity;
  for (const s of spots) {
    const hard = cost(s, avoid);
    const score = hard * 1000 + cost(s, soft);
    if (score < bestScore) {
      best = s;
      bestScore = score;
    }
    if (score === 0) break;
  }
  el.style.left = `${Math.max(pad, Math.round(best[0]))}px`;
  el.style.top = `${Math.max(pad, Math.round(best[1]))}px`;
  el.style.visibility = '';
}

/** True when a click on this element is not what the lesson asks for. Only game inputs are policed. */
export function refuses(target: HTMLElement): boolean {
  const input = target.closest<HTMLElement>('[data-hand], [data-unit], [data-sid], [data-spire], .actionbar [data-action]');
  if (!input) return false;
  return !input.classList.contains('tut-ok');
}

export function renderReady(hero: string): HTMLElement {
  return h(
    'div',
    { class: 'tut-ready-back' },
    h(
      'div',
      { class: 'tut-ready facet' },
      h('h2', { text: "You're ready" }),
      h('p', { text: `${hero} has Ascended: the hero's goal was met and every copy of the card changed for the rest of the game.` }),
      h('p', { text: 'You have now spent Charge, passed priority, attacked, blocked, cast a Flash and a Swift glyph, watched the stack resolve and used your Reserve. The rest is choices.' }),
      h('div', { class: 'tut-ready-btns' }, h('button', { class: 'btn primary big', data: { ui: 'tut-new' }, text: 'New game', attrs: { type: 'button' } }), h('button', { class: 'btn', data: { ui: 'tut-builder' }, text: 'Build a deck', attrs: { type: 'button' } }), h('button', { class: 'btn ghost', data: { ui: 'tut-title' }, text: 'Title', attrs: { type: 'button' } })),
    ),
  );
}

/** The tutorial's menu: no concede, a way out. */
export function tutorialMenuNote(): string {
  return 'The tutorial is a scripted match: it never touches your saved game.';
}

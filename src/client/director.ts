// The presentation director. It keeps a PRESENTED state apart from the live one: after each accepted action the
// engine returns events; they are played in order on the old board (so a destroyed unit is still there to shatter),
// then the new state is swapped in. Input is locked while this runs; any click or key skips to the end.
import type { GameState, LogEntry, Seat } from '../engine/types';
import { face } from '../engine/query';
import { view } from '../engine/view';
import type { Speed } from './settings';
import { bigCard, h } from './cardview';

type Listener = (events: LogEntry[]) => void;
const listeners = new Set<Listener>();
/** Audio (later) rides the same event stream the director plays. Returns an unsubscribe. */
export function onEvents(l: Listener): () => void {
  listeners.add(l);
  return () => listeners.delete(l);
}

interface Item {
  events: LogEntry[];
  after: GameState;
}

const SCALE: Record<Speed, number> = { full: 1, quick: 0.4, instant: 0 };

export class Director {
  speed: Speed = 'full';
  busy = false;
  lastProgress = Date.now();
  onRender: () => void = () => {};
  onIdle: () => void = () => {};
  private queue: Item[] = [];
  private shown: GameState | null = null;
  private lazyLive: GameState | null = null;
  private skipping = false;
  private cancelWait: (() => void) | null = null;

  constructor(private fx: HTMLElement, private rootEl: HTMLElement) {}

  /** The view the board draws (seat 0 only: hidden cards never reach the DOM). */
  get presented(): GameState {
    if (this.lazyLive) {
      this.shown = view(this.lazyLive, 0);
      this.lazyLive = null;
    }
    if (!this.shown) throw new Error('director has no presented state');
    return this.shown;
  }

  hasState(): boolean {
    return this.shown !== null || this.lazyLive !== null;
  }

  reset(live: GameState): void {
    this.queue = [];
    this.shown = view(live, 0);
    this.lazyLive = null;
    this.busy = false;
    this.skipping = false;
    this.fx.replaceChildren();
    this.rootEl.classList.remove('dim', 'surge');
  }

  enqueue(events: LogEntry[], live: GameState): void {
    this.lastProgress = Date.now();
    for (const l of listeners) l(events);
    if (this.speed === 'instant' && !this.busy) {
      this.lazyLive = live; // viewed on demand at the next render
      this.shown = null;
      this.onRender();
      return;
    }
    // keep the board as it was until the events have played
    if (this.lazyLive) {
      this.shown = view(this.lazyLive, 0);
      this.lazyLive = null;
    }
    this.queue.push({ events, after: view(live, 0) });
    void this.drain();
  }

  skip(): void {
    if (!this.busy) return;
    this.skipping = true;
    this.cancelWait?.();
  }

  private async drain(): Promise<void> {
    if (this.busy) return;
    this.busy = true;
    try {
      while (this.queue.length) {
        const it = this.queue.shift()!;
        for (const e of it.events) {
          if (this.skipping) break;
          await this.play(e, it);
          this.lastProgress = Date.now();
        }
        this.shown = it.after;
        this.onRender();
      }
    } finally {
      this.busy = false;
      this.skipping = false;
      this.fx.replaceChildren();
      this.rootEl.classList.remove('dim', 'surge');
      this.lastProgress = Date.now();
      this.onIdle();
    }
  }

  private wait(ms: number): Promise<void> {
    const t = ms * SCALE[this.speed];
    if (this.skipping || t <= 0) return Promise.resolve();
    return new Promise((res) => {
      const done = (): void => {
        clearTimeout(timer);
        this.cancelWait = null;
        res();
      };
      const timer = setTimeout(done, t);
      this.cancelWait = done;
    });
  }

  private flash(sel: string, cls: string, ms: number): void {
    const t = ms * SCALE[this.speed] + 40;
    document.querySelectorAll(sel).forEach((el) => {
      el.classList.add(cls);
      setTimeout(() => el.classList.remove(cls), t);
    });
  }

  private anim(el: HTMLElement, frames: Keyframe[], ms: number): void {
    const t = ms * SCALE[this.speed];
    if (t <= 0 || this.skipping) return;
    el.animate(frames, { duration: t, easing: 'cubic-bezier(.2,.9,.2,1)', fill: 'forwards' });
  }

  private async play(e: LogEntry, it: Item): Promise<void> {
    switch (e.k) {
      case 'play':
      case 'cast':
        if ((e.n ?? 0) > 0) this.flash(`.side[data-side="${e.seat}"] .conduit, .line[data-side="${e.seat}"] .conduit`, 'spent', 700);
        if (e.seat === 1) await this.travel(e, it);
        else await this.wait(e.k === 'cast' ? 260 : 160);
        return;
      case 'channel':
        this.flash(`[data-unit="${e.tunit}"]`, 'surge-unit', 500);
        await this.wait(300);
        return;
      case 'attack':
        await this.wait(380);
        return;
      case 'blocks':
        await this.wait(260);
        return;
      case 'strike':
        this.flash(`[data-unit="${e.unit}"]`, 'lunge', 260);
        await this.wait(200);
        return;
      case 'dmg':
        this.flash(`[data-unit="${e.tunit}"]`, 'crack-flash', 340);
        await this.wait(260);
        return;
      case 'ward':
      case 'absorb':
        this.flash(`[data-unit="${e.tunit}"]`, 'ward-flash', 300);
        await this.wait(200);
        return;
      case 'spireDmg':
        this.flash(`[data-spire="${e.seat}"]`, 'crack-flash', 400);
        await this.wait(300);
        return;
      case 'spireHeal':
        this.flash(`[data-spire="${e.seat}"]`, 'heal-flash', 400);
        await this.wait(200);
        return;
      case 'heal':
        this.flash(`[data-unit="${e.tunit}"]`, 'heal-flash', 300);
        await this.wait(160);
        return;
      case 'die':
        this.flash(`[data-unit="${e.unit}"]`, 'shatter', 420);
        await this.wait(400);
        return;
      case 'resolve':
        await this.wait(300);
        return;
      case 'negate':
      case 'fizzle':
        await this.wait(300);
        return;
      case 'round':
        await this.banner(e);
        return;
      case 'ascend':
        await this.ascension(e, it);
        return;
      case 'over':
        await this.wait(900);
        return;
      default:
        return;
    }
  }

  private async banner(e: LogEntry): Promise<void> {
    const mine = e.seat === 0;
    const el = h('div', { class: 'banner facet' }, h('b', { text: `Round ${e.n ?? 0}` }), h('span', { text: `${mine ? 'You hold' : 'The opponent holds'} the Initiative` }));
    this.fx.append(el);
    this.anim(el, [{ opacity: 0, transform: 'translate(-50%,-50%) scaleX(.6)' }, { opacity: 1, transform: 'translate(-50%,-50%) scaleX(1)' }], 200);
    await this.wait(1600);
    el.remove();
  }

  private async travel(e: LogEntry, it: Item): Promise<void> {
    if (SCALE[this.speed] === 0 || this.skipping || !e.card) return;
    const seat = (e.seat ?? 1) as Seat;
    const el = h('div', { class: 'travel' }, bigCard({ cardId: e.card, seat, f: face(it.after, seat, e.card), cost: e.n ?? null }));
    this.fx.append(el);
    this.anim(el, [{ opacity: 0, transform: 'translate(-50%,-160%) scale(.4)' }, { opacity: 1, transform: 'translate(-50%,-50%) scale(1)' }], 500);
    await this.wait(500);
    await this.wait(1200);
    this.anim(el, [{ opacity: 1, transform: 'translate(-50%,-50%) scale(1)' }, { opacity: 0, transform: 'translate(-50%,20%) scale(.5)' }], 250);
    await this.wait(250);
    el.remove();
  }

  private async ascension(e: LogEntry, it: Item): Promise<void> {
    if (SCALE[this.speed] === 0 || this.skipping || !e.card) return;
    const seat = (e.seat ?? 0) as Seat;
    const id = e.card;
    const before = face(this.shown, seat, id);
    const after = face(it.after, seat, id);
    const owner = seat === 0 ? 'your' : "the opponent's";
    if (!e.n) {
      // ascended in hand or deck: a shorter banner with the new face
      const ban = h('div', { class: 'banner asc-banner facet' }, h('b', { text: `${before.name} has Ascended in ${owner} deck` }), h('div', { class: 'asc-mini' }, bigCard({ cardId: id, seat, f: after, cost: null })));
      this.fx.append(ban);
      this.anim(ban, [{ opacity: 0, transform: 'translate(-50%,-50%) scale(.8)' }, { opacity: 1, transform: 'translate(-50%,-50%) scale(1)' }], 250);
      await this.wait(1900);
      ban.remove();
      return;
    }
    this.rootEl.classList.add('dim', 'surge');
    const layer = h('div', { class: 'asc-layer' });
    const stage = h('div', { class: 'asc-stage' }, bigCard({ cardId: id, seat, f: before, cost: null }));
    layer.append(stage);
    this.fx.append(layer);
    this.anim(stage, [{ transform: 'translate(-50%,-50%) scale(.3)', opacity: 0 }, { transform: 'translate(-50%,-50%) scale(1)', opacity: 1 }], 650);
    await this.wait(700);
    stage.classList.add('cracking');
    await this.wait(800);
    stage.replaceChildren(bigCard({ cardId: id, seat, f: after, cost: null, note: 'ASCENDED' }));
    stage.classList.remove('cracking');
    stage.classList.add('reformed');
    await this.wait(2600);
    this.anim(layer, [{ opacity: 1 }, { opacity: 0 }], 300);
    await this.wait(300);
    layer.remove();
    this.rootEl.classList.remove('dim', 'surge');
  }
}

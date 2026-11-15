// The presentation director. It keeps a PRESENTED state apart from the live one: after each accepted action the
// engine returns events; they are played in order on the old board (so a destroyed unit is still there to shatter),
// updating the shown numbers of the affected unit or Spire as each damage / heal / buff event passes, then the new
// state is swapped in. Input is locked while this runs; any click or key skips to the end.
import type { GameState, LogEntry, Seat, Unit } from '../engine/types';
import { LIMITS } from '../engine/types';
import { def, face, findUnit } from '../engine/query';
import { view } from '../engine/view';
import type { Speed } from './settings';
import { bigCard, cardBack, h, hueOf, patchUnitEl } from './cardview';
import { spireSvg } from './art';
import { Fx, boxOf, centerOf, setFxScale } from './fx';
import type { Box } from './fx';
import { playEvent } from '../audio/audio';

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

const q = (sel: string): HTMLElement | null => document.querySelector<HTMLElement>(sel);
const unitNode = (iid: string | undefined): HTMLElement | null => (iid ? q(`[data-unit="${iid}"]`) : null);
const spireNode = (seat: number): HTMLElement | null => q(`[data-spire="${seat}"]`);
const sidNode = (sid: string): HTMLElement | null => q(`[data-sid="${sid}"]`);
/** A target id from an event: a unit iid, or 'spire0' / 'spire1'. */
const targetNode = (id: string | undefined): HTMLElement | null => (!id ? null : id.startsWith('spire') ? spireNode(Number(id.slice(5))) : unitNode(id));
const hueOfNode = (el: HTMLElement | null, fallback: number): number => {
  const v = Number(el?.style.getPropertyValue('--hue'));
  return Number.isFinite(v) && el?.style.getPropertyValue('--hue') ? v : fallback;
};

export class Director {
  busy = false;
  lastProgress = Date.now();
  onRender: () => void = () => {};
  onIdle: () => void = () => {};
  private _speed: Speed = 'full';
  private queue: Item[] = [];
  private shown: GameState | null = null;
  private lazyLive: GameState | null = null;
  private skipping = false;
  private cancelWait: (() => void) | null = null;
  private f: Fx;
  private lastCast: { card: string; seat: Seat; target?: string } | null = null;
  private provisional = 0;

  constructor(private fx: HTMLElement, private rootEl: HTMLElement) {
    this.f = new Fx(fx);
  }

  get speed(): Speed {
    return this._speed;
  }
  set speed(s: Speed) {
    this._speed = s;
    setFxScale(SCALE[s]);
  }

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
    this.f.clear();
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
        if (this.shown && this.shown.phase === 'mulligan' && it.after.phase !== 'mulligan' && this.scale > 0 && !this.skipping) {
          // the opening hands are settled: show the board at once, so the first round banner plays over it
          this.shown = it.after;
          await this.refresh();
        }
        for (const e of it.events) {
          if (this.skipping) break;
          await this.play(e, it);
          this.lastProgress = Date.now();
        }
        this.shown = it.after;
        this.provisional = 0;
        this.onRender();
      }
    } finally {
      this.busy = false;
      this.skipping = false;
      this.f.clear();
      this.fx.replaceChildren();
      this.rootEl.classList.remove('dim', 'surge');
      this.lastProgress = Date.now();
      this.onIdle();
    }
  }

  // ---------- timing ----------
  private get scale(): number {
    return SCALE[this.speed];
  }

  private wait(ms: number): Promise<void> {
    return this.waitRaw(ms * this.scale);
  }

  /** A hold that does not shrink at quick speed (it still ends on a skip, and at instant speed). */
  private hold(ms: number): Promise<void> {
    return this.waitRaw(this.scale > 0 ? ms : 0);
  }

  private waitRaw(t: number): Promise<void> {
    if (this.skipping || t <= 0) return Promise.resolve();
    this.lastProgress = Date.now(); // a long hold (the Ascension) is progress, not a stall for the watchdog
    return new Promise((res) => {
      const done = (): void => {
        clearTimeout(timer);
        this.cancelWait = null;
        this.lastProgress = Date.now();
        res();
      };
      const timer = setTimeout(done, t);
      this.cancelWait = done;
    });
  }

  /** Re-render the presented board from the working copy and let the new DOM exist before the next effect. */
  private async refresh(): Promise<void> {
    this.onRender();
    if (this.scale <= 0 || this.skipping) return;
    await new Promise<void>((res) => {
      let n = 0;
      const tick = (): void => {
        if (++n >= 3) res();
        else requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      setTimeout(res, 90);
    });
  }

  private flash(sel: string, cls: string, ms: number): void {
    const t = ms * this.scale + 40;
    document.querySelectorAll(sel).forEach((el) => {
      el.classList.add(cls);
      setTimeout(() => el.classList.remove(cls), t);
    });
  }

  private anim(el: Element | null, frames: Keyframe[], ms: number, easing = 'cubic-bezier(.2,.9,.2,1)'): void {
    const t = ms * this.scale;
    if (!el || t <= 0 || this.skipping) return;
    el.animate(frames, { duration: t, easing, fill: 'forwards' });
  }

  private get sh(): GameState {
    if (!this.shown) throw new Error('director has no presented state');
    return this.shown;
  }

  // ---------- one event ----------
  private async play(e: LogEntry, it: Item): Promise<void> {
    if (this.speed !== 'instant' && !this.skipping) playEvent(e, 0);
    switch (e.k) {
      case 'play':
        return this.playUnit(e, it);
      case 'cast':
        return this.castGlyph(e, it);
      case 'channel': {
        await this.spend(e.seat as Seat, LIMITS.channelCost, false);
        this.takeFromHand(e.seat as Seat, e.card);
        const u = e.tunit ? findUnit(this.sh, e.tunit) : undefined;
        if (u) {
          u.dmg = 0;
          u.mods.push({ power: 1, health: 1, dur: 'perm' });
        }
        await this.refresh();
        const node = unitNode(e.tunit);
        this.f.float(boxOf(node), '+1|+1', 'buff');
        this.anim(node, [{ filter: 'brightness(2.4)', transform: 'scale(1.06)' }, { filter: 'none', transform: 'none' }], 500);
        await this.wait(420);
        return;
      }
      case 'attack':
        this.flash('.battle', 'locked', 500);
        await this.wait(380);
        return;
      case 'blocks':
        this.flash('.pmid .link', 'lockflash', 500);
        await this.wait(300);
        return;
      case 'strike':
        return this.strike(e);
      case 'dmg':
        return this.damage(e);
      case 'ward': {
        const node = unitNode(e.tunit);
        this.f.shield(boxOf(node));
        const u = e.tunit ? findUnit(this.sh, e.tunit) : undefined;
        if (u) u.ward = false;
        node?.querySelector('.u-ward')?.remove();
        node?.classList.remove('warded');
        this.f.float(boxOf(node), 'WARD', 'ward');
        await this.wait(300);
        return;
      }
      case 'absorb': {
        const node = unitNode(e.tunit);
        this.anim(node, [{ filter: 'brightness(2)' }, { filter: 'none' }], 300);
        this.f.float(boxOf(node), '0', 'zero');
        await this.wait(220);
        return;
      }
      case 'spireDmg': {
        const node = spireNode(e.seat ?? 0);
        this.f.crack(boxOf(node));
        this.f.float(boxOf(node), `-${e.n ?? 0}`, 'dmg big');
        this.anim(node, [{ transform: 'translate(0,0)' }, { transform: 'translate(-.6rem,.2rem)' }, { transform: 'translate(.6rem,-.2rem)' }, { transform: 'translate(-.4rem,0)' }, { transform: 'translate(0,0)' }], 420, 'linear');
        this.setSpire(e.seat ?? 0, -(e.n ?? 0));
        await this.wait(380);
        return;
      }
      case 'spireHeal': {
        const node = spireNode(e.seat ?? 0);
        this.f.float(boxOf(node), `+${e.n ?? 0}`, 'heal big');
        this.anim(node, [{ filter: 'brightness(1.8) saturate(1.6)' }, { filter: 'none' }], 450);
        this.setSpire(e.seat ?? 0, e.n ?? 0);
        await this.wait(320);
        return;
      }
      case 'heal': {
        const node = unitNode(e.tunit);
        const u = e.tunit ? findUnit(this.sh, e.tunit) : undefined;
        this.f.float(boxOf(node), `+${e.n ?? 0}`, 'heal');
        this.anim(node, [{ filter: 'brightness(1.7) saturate(1.6)' }, { filter: 'none' }], 450);
        if (u && node) {
          u.dmg = Math.max(0, u.dmg - (e.n ?? 0));
          patchUnitEl(node, this.sh, u);
        }
        await this.wait(300);
        return;
      }
      case 'buff':
        return this.buff(e);
      case 'grant': {
        const u = e.tunit ? findUnit(this.sh, e.tunit) : undefined;
        const kws = (e.s ?? '').split(',').filter(Boolean);
        if (u && kws.length) {
          u.mods.push({ power: 0, health: 0, kw: kws as never, dur: 'perm' });
          if (kws.includes('ward')) u.ward = true;
        }
        await this.refresh();
        const node = unitNode(e.tunit);
        this.anim(node, [{ filter: 'brightness(2)' }, { filter: 'none' }], 450);
        await this.wait(280);
        return;
      }
      case 'stasis': {
        const u = e.tunit ? findUnit(this.sh, e.tunit) : undefined;
        if (u) u.stasis = true;
        await this.refresh();
        this.f.frost(boxOf(unitNode(e.tunit)));
        await this.wait(560);
        return;
      }
      case 'silence': {
        const u = e.tunit ? findUnit(this.sh, e.tunit) : undefined;
        if (u) {
          u.silenced = true;
          u.mods = [];
        }
        await this.refresh();
        this.anim(unitNode(e.tunit), [{ filter: 'grayscale(1) brightness(1.6)' }, { filter: 'none' }], 500);
        await this.wait(300);
        return;
      }
      case 'summon':
        return this.summon(e);
      case 'die':
        return this.die(e);
      case 'destroy':
        this.anim(unitNode(e.tunit), [{ filter: 'brightness(2.6) saturate(0)' }, { filter: 'none' }], 400);
        await this.wait(220);
        return;
      case 'recall': {
        const node = unitNode(e.tunit);
        this.anim(node, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-1.6rem) scale(.8)' }], 320);
        await this.wait(300);
        const seat = (e.seat ?? 0) as Seat;
        this.sh.players[seat].line = this.sh.players[seat].line.filter((u) => u.iid !== e.tunit);
        await this.refresh();
        return;
      }
      case 'resolve':
        return this.resolve(e);
      case 'negate':
      case 'fizzle': {
        const i = this.lastStackIndex(e.card, e.seat as Seat);
        const node = i >= 0 ? sidNode(this.sh.stack[i].sid) : q('.stack');
        this.f.shards(boxOf(node), 205, 6);
        this.f.float(boxOf(node), e.k === 'negate' ? 'NEGATED' : 'FIZZLED', 'ward');
        await this.wait(420);
        if (i >= 0) {
          this.sh.stack.splice(i, 1);
          await this.refresh();
        }
        return;
      }
      case 'draw':
        return this.draw(e);
      case 'round':
        return this.banner(e);
      case 'ascend':
        return this.ascension(e, it);
      case 'over':
        await this.wait(900);
        return;
      default:
        return;
    }
  }

  // ---------- charge ----------
  /** Drain the spent cells with a conduit pulse, then show the reduced pool. */
  private async spend(seat: Seat, n: number, glyph: boolean): Promise<void> {
    if (n <= 0) return;
    const p = this.sh.players[seat];
    const fromRes = glyph ? Math.min(p.reserve, n) : 0;
    const fromChg = n - fromRes;
    const mark = (sel: string, k: number): void => {
      const on = [...document.querySelectorAll<HTMLElement>(`.side[data-side="${seat}"] ${sel} .cell.on`)];
      for (const c of on.slice(Math.max(0, on.length - k))) c.classList.add('drain');
    };
    mark('.cells.charge', fromChg);
    mark('.cells.reserve', fromRes);
    this.flash(`.line[data-side="${seat}"] .conduit`, 'spent', 700);
    this.flash(`.side[data-side="${seat}"]`, 'spending', 500);
    void this.f.pulse(boxOf(q(`.side[data-side="${seat}"] .cells.charge`)), boxOf(q(`.line[data-side="${seat}"]`)), 'cyan', 460);
    await this.wait(300);
    p.reserve -= fromRes;
    p.charge = Math.max(0, p.charge - fromChg);
    await this.refresh();
  }

  private takeFromHand(seat: Seat, card: string | undefined): void {
    const hand = this.sh.players[seat].hand;
    const i = seat === 0 ? hand.findIndex((x) => x.card === card) : 0;
    if (i >= 0 && hand.length) hand.splice(i, 1);
  }

  private setSpire(seat: number, delta: number): void {
    const p = this.sh.players[seat as Seat];
    p.spire = Math.min(LIMITS.spire, p.spire + delta);
    const node = spireNode(seat);
    if (!node) return;
    const art = node.querySelector<HTMLElement>('.spire-art');
    if (art) art.innerHTML = spireSvg(p.spire);
    const b = node.querySelector('.s-int b');
    if (b) b.textContent = String(p.spire);
    node.classList.toggle('damaged', p.spire < LIMITS.spire);
  }

  // ---------- cards entering play ----------
  private async playUnit(e: LogEntry, it: Item): Promise<void> {
    const seat = (e.seat ?? 0) as Seat;
    await this.spend(seat, e.n ?? 0, false);
    const lineBox = boxOf(q(`.line[data-side="${seat}"]`));
    if (seat === 1) {
      this.takeFromHand(1, e.card);
      await this.refresh();
      await this.spotlight(e, it, lineBox);
      return;
    }
    const node = q(`[data-hand]${e.card ? `[data-card="${e.card}"]` : ''}`);
    if (node && lineBox) {
      const from = boxOf(node);
      const ghost = node.cloneNode(true) as HTMLElement;
      ghost.classList.remove('armed', 'actable');
      const to: Box = { left: lineBox.left + lineBox.width / 2 - (from?.width ?? 0) * 0.3, top: lineBox.top + lineBox.height / 2 - (from?.height ?? 0) * 0.3, width: (from?.width ?? 0) * 0.6, height: (from?.height ?? 0) * 0.6 };
      void this.f.fly(ghost, from, to, 320, { fade: true });
    }
    this.takeFromHand(0, e.card);
    await this.refresh();
    await this.wait(260);
  }

  private async castGlyph(e: LogEntry, it: Item): Promise<void> {
    const seat = (e.seat ?? 0) as Seat;
    await this.spend(seat, e.n ?? 0, true);
    this.lastCast = { card: e.card ?? '', seat, target: e.tunit };
    const stackBox = boxOf(q('.stack'));
    const flashSpeed = e.s === 'flash';
    if (seat === 1) {
      this.takeFromHand(1, e.card);
      await this.refresh();
      await this.spotlight(e, it, stackBox);
    } else {
      const node = q(`[data-hand]${e.card ? `[data-card="${e.card}"]` : ''}`);
      if (node && stackBox) {
        const from = boxOf(node);
        const ghost = node.cloneNode(true) as HTMLElement;
        ghost.classList.remove('armed', 'actable');
        const to: Box = { left: stackBox.left + stackBox.width * 0.2, top: stackBox.top + 24, width: stackBox.width * 0.6, height: (from?.height ?? 100) * 0.5 };
        void this.f.fly(ghost, from, to, 380, { fade: true });
      }
      this.takeFromHand(0, e.card);
      await this.refresh();
      await this.wait(360);
    }
    if (!flashSpeed && e.card) {
      // the glyph now waits on the stack: show it there until the real state is swapped in
      this.sh.stack.push({ sid: `s-pending-${this.provisional++}`, card: e.card, owner: seat, targets: e.tunit ? [e.tunit] : [] });
      await this.refresh();
    }
  }

  /** The opponent's played card in the centre: travel 500 ms, hold 1200 ms, settle 250 ms. */
  private async spotlight(e: LogEntry, it: Item, dest: Box | null): Promise<void> {
    if (this.scale <= 0 || this.skipping || !e.card) return;
    const seat = (e.seat ?? 1) as Seat;
    const card = h('div', { class: 'travel' }, bigCard({ cardId: e.card, seat, f: face(it.after, seat, e.card), cost: e.n ?? null }));
    this.fx.append(card);
    const start = boxOf(q('.opphand')) ?? { left: window.innerWidth / 2, top: 0, width: 10, height: 10 };
    const centre = { x: window.innerWidth / 2, y: window.innerHeight * 0.42 };
    const dx = start.left + start.width / 2 - centre.x;
    const dy = start.top + start.height / 2 - centre.y;
    this.anim(card, [{ opacity: 0, transform: `translate(-50%,-50%) translate(${dx}px,${dy}px) scale(.25)` }, { opacity: 1, transform: 'translate(-50%,-50%) scale(1)' }], 500);
    await this.wait(500);
    await this.wait(1200);
    if (this.skipping) {
      card.remove();
      return;
    }
    const d = dest ? centerOf(dest) : { x: centre.x, y: centre.y + 160 };
    this.anim(card, [{ opacity: 1, transform: 'translate(-50%,-50%) scale(1)' }, { opacity: 0, transform: `translate(-50%,-50%) translate(${d.x - centre.x}px,${d.y - centre.y}px) scale(.22)` }], 250);
    await this.wait(250);
    card.remove();
  }

  private async summon(e: LogEntry): Promise<void> {
    const seat = (e.seat ?? 0) as Seat;
    if (!e.card || !e.unit) return;
    const line = this.sh.players[seat].line;
    if (!line.some((u) => u.iid === e.unit)) {
      const u: Unit = {
        iid: e.unit, card: e.card, owner: seat, dmg: 0, mods: [], stasis: false, ward: face(this.sh, seat, e.card).keywords.includes('ward'),
        silenced: false, doomed: false, seen: {}, summonRound: this.sh.round,
      };
      line.push(u);
    }
    await this.refresh();
    const node = unitNode(e.unit);
    this.anim(node, [{ opacity: 0.2, transform: 'scale(.85)', filter: 'brightness(2.4)' }, { opacity: 1, transform: 'none', filter: 'none' }], 480);
    this.f.assemble(boxOf(node), hueOfNode(node, hueOf(e.card)));
    await this.wait(460);
  }

  // ---------- combat and damage ----------
  private async strike(e: LogEntry): Promise<void> {
    const a = unitNode(e.unit);
    const t = targetNode(e.tunit);
    const ba = boxOf(a);
    const bt = boxOf(t);
    if (a && ba && bt) {
      const ca = centerOf(ba);
      const ct = centerOf(bt);
      let dx = (ct.x - ca.x) * 0.5;
      let dy = (ct.y - ca.y) * 0.5;
      const len = Math.hypot(dx, dy);
      const cap = 110;
      if (len > cap) {
        dx = (dx / len) * cap;
        dy = (dy / len) * cap;
      }
      this.anim(a, [{ transform: 'translate(0,0) scale(1)' }, { transform: `translate(${(-dx * 0.12).toFixed(1)}px, ${(-dy * 0.12).toFixed(1)}px) scale(1)`, offset: 0.2 }, { transform: `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px) scale(1.1)`, offset: 0.55 }, { transform: 'translate(0,0) scale(1)' }], 380, 'cubic-bezier(.3,.1,.2,1)');
    }
    await this.wait(230);
  }

  private async damage(e: LogEntry): Promise<void> {
    const node = unitNode(e.tunit);
    const u = e.tunit ? findUnit(this.sh, e.tunit) : undefined;
    const box = boxOf(node);
    this.f.crack(box);
    this.f.float(box, `-${e.n ?? 0}`, 'dmg');
    this.anim(node, [{ transform: 'translate(0,0)', filter: 'brightness(3)' }, { transform: 'translate(-.5rem,0)', filter: 'brightness(2)' }, { transform: 'translate(.5rem,0)', filter: 'brightness(1.5)' }, { transform: 'translate(0,0)', filter: 'none' }], 360, 'linear');
    if (u && node) {
      u.dmg += e.n ?? 0;
      patchUnitEl(node, this.sh, u);
    }
    await this.wait(300);
  }

  private async buff(e: LogEntry): Promise<void> {
    const u = e.tunit ? findUnit(this.sh, e.tunit) : undefined;
    const p = e.n ?? 0;
    const hh = e.m ?? 0;
    if (u) u.mods.push({ power: p, health: hh, dur: e.s === 'round' ? 'round' : 'perm' });
    await this.refresh();
    const node = unitNode(e.tunit);
    const sgn = (n: number): string => `${n >= 0 ? '+' : ''}${n}`;
    this.f.float(boxOf(node), `${sgn(p)}|${sgn(hh)}`, p < 0 || hh < 0 ? 'dmg' : 'buff');
    node?.querySelectorAll('.pow, .hp').forEach((s) => this.anim(s, [{ transform: 'scale(2)', filter: 'brightness(2.4)' }, { transform: 'scale(1)', filter: 'none' }], 520));
    await this.wait(380);
  }

  private async die(e: LogEntry): Promise<void> {
    const seat = (e.seat ?? 0) as Seat;
    const node = unitNode(e.unit);
    const box = boxOf(node);
    if (node && box) {
      this.f.shards(box, hueOfNode(node, e.card ? hueOf(e.card) : 205), 7 + (Math.random() < 0.5 ? 1 : 0));
      node.style.visibility = 'hidden';
    }
    await this.wait(280);
    const p = this.sh.players[seat];
    p.line = p.line.filter((u) => u.iid !== e.unit);
    if (e.card && !def(e.card).token) p.scrap.push(e.card);
    await this.refresh();
    await this.wait(120);
  }

  private lastStackIndex(card: string | undefined, seat: Seat): number {
    for (let i = this.sh.stack.length - 1; i >= 0; i--) if (this.sh.stack[i].card === card && this.sh.stack[i].owner === seat) return i;
    return -1;
  }

  /** A pulse from the stack item to its target(s). */
  private async resolve(e: LogEntry): Promise<void> {
    const seat = (e.seat ?? 0) as Seat;
    const i = this.lastStackIndex(e.card, seat);
    const item = i >= 0 ? this.sh.stack[i] : undefined;
    const src = item ? sidNode(item.sid) ?? q('.stack') : q('.stack');
    const targets = item ? item.targets : this.lastCast && this.lastCast.card === e.card && this.lastCast.target ? [this.lastCast.target] : [];
    this.anim(src, [{ filter: 'brightness(2.2)' }, { filter: 'none' }], 450);
    for (const t of targets) void this.f.pulse(boxOf(src), boxOf(targetNode(t) ?? (t.startsWith('s') ? sidNode(t) : null)), 'amber', 460);
    await this.wait(480);
    if (i >= 0) {
      this.sh.stack.splice(i, 1);
      await this.refresh();
    }
  }

  private async draw(e: LogEntry): Promise<void> {
    if (this.scale <= 0 || this.skipping) return;
    const seat = (e.seat ?? 0) as Seat;
    const from = boxOf(q(`.side[data-side="${seat}"] .cnt-deck`));
    const dest = boxOf(seat === 0 ? q('.hand') : q('.opphand'));
    if (!from || !dest) return;
    const n = Math.min(e.n ?? 1, 3);
    const cw = 36;
    const ch = 50;
    for (let i = 0; i < n; i++) {
      const back = cardBack();
      back.classList.add('flyback');
      const a: Box = { left: from.left + from.width / 2 - cw / 2, top: from.top + from.height / 2 - ch / 2, width: cw, height: ch };
      const b: Box = { left: dest.left + dest.width / 2 - cw / 2 + i * 14, top: dest.top + dest.height / 2 - ch / 2, width: cw, height: ch };
      void this.f.fly(back, a, b, 520, { fade: true, spin: seat === 0 ? -8 : 8 });
      await this.wait(130);
    }
    await this.wait(300);
  }

  // ---------- round banner and the Initiative ----------
  private async banner(e: LogEntry): Promise<void> {
    const mine = e.seat === 0;
    const oldMarker = boxOf(q('.side .init'));
    this.sh.round = e.n ?? this.sh.round;
    this.sh.initiative = (e.seat ?? 0) as Seat;
    const el = h('div', { class: 'banner facet' }, h('b', { text: `Round ${e.n ?? 0}` }), h('span', { text: `${mine ? 'You hold' : 'The opponent holds'} the Initiative` }));
    this.fx.append(el);
    this.anim(el, [{ opacity: 0, transform: 'translate(-50%,-50%) scaleX(.6)' }, { opacity: 1, transform: 'translate(-50%,-50%) scaleX(1)' }], 200);
    await this.refresh();
    const marker = q(`.side[data-side="${e.seat}"] .init`);
    const nb = boxOf(marker);
    if (marker && nb && oldMarker && (Math.abs(oldMarker.left - nb.left) > 4 || Math.abs(oldMarker.top - nb.top) > 4)) {
      this.anim(marker, [{ transform: `translate(${oldMarker.left - nb.left}px, ${oldMarker.top - nb.top}px) scale(1.5)`, filter: 'brightness(2.2)' }, { transform: 'none', filter: 'none' }], 900, 'cubic-bezier(.4,0,.2,1)');
    }
    await this.wait(1600);
    el.remove();
  }

  // ---------- Ascension ----------
  private async ascension(e: LogEntry, it: Item): Promise<void> {
    if (this.scale <= 0 || this.skipping || !e.card) return;
    const seat = (e.seat ?? 0) as Seat;
    const id = e.card;
    const before = face(this.shown, seat, id);
    const after = face(it.after, seat, id);
    const owner = seat === 0 ? 'your' : "the opponent's";
    const flip = (): void => {
      const p = this.sh.players[seat];
      if (!p.ascended.includes(id)) p.ascended.push(id);
      for (const u of p.line) if (u.card === id) u.dmg = 0;
    };
    if (!e.n) {
      // ascended in hand or deck: a shorter banner with the new face
      flip();
      const ban = h('div', { class: 'banner asc-banner facet' }, h('b', { text: `${before.name} has Ascended in ${owner} deck` }), h('div', { class: 'asc-mini' }, bigCard({ cardId: id, seat, f: after, cost: null })));
      this.fx.append(ban);
      this.anim(ban, [{ opacity: 0, transform: 'translate(-50%,-50%) scale(.8)' }, { opacity: 1, transform: 'translate(-50%,-50%) scale(1)' }], 250);
      await this.hold(2000);
      ban.remove();
      await this.refresh();
      return;
    }
    // on the Line: dim, conduits surge white, the card grows to the centre, cracks, re-forms, holds, returns
    const unit = q(`[data-unit][data-card="${id}"][data-seat="${seat}"]`);
    const home = boxOf(unit);
    this.rootEl.classList.add('dim', 'surge');
    const layer = h('div', { class: 'asc-layer' });
    const stage = h('div', { class: 'asc-stage' }, bigCard({ cardId: id, seat, f: before, cost: null }));
    layer.append(stage);
    this.fx.append(layer);
    const centre = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const from = home ? { dx: home.left + home.width / 2 - centre.x, dy: home.top + home.height / 2 - centre.y, s: Math.max(0.15, home.width / 360) } : { dx: 0, dy: 0, s: 0.3 };
    const at = (dx: number, dy: number, s: number): string => `translate(-50%,-50%) translate(${dx}px,${dy}px) scale(${s})`;
    this.anim(layer, [{ opacity: 0 }, { opacity: 1 }], 400);
    this.anim(stage, [{ transform: at(from.dx, from.dy, from.s), opacity: 0.6 }, { transform: at(0, 0, 1), opacity: 1 }], 800, 'cubic-bezier(.3,.1,.2,1)');
    await this.wait(900);
    // cracks along its facets
    const cracks = h('div', { class: 'asc-cracks' });
    cracks.innerHTML = '<svg viewBox="0 0 100 100" preserveAspectRatio="none"><polyline points="50,0 44,18 56,34 40,52 52,70 46,100"/><polyline points="0,38 22,42 34,36 56,34 78,40 100,34"/><polyline points="12,0 22,42 18,64 30,100"/><polyline points="88,0 78,40 84,66 72,100"/><polyline points="40,52 18,64 0,60"/><polyline points="52,70 84,66 100,72"/></svg>';
    stage.append(cracks);
    this.anim(stage, [{ transform: at(0, 0, 1), filter: 'brightness(1)' }, { transform: at(-6, 0, 1.01), filter: 'brightness(1.8)' }, { transform: at(6, 0, 1.02), filter: 'brightness(2.4)' }, { transform: at(0, 0, 1.04), filter: 'brightness(4)' }], 900, 'linear');
    await this.wait(950);
    // re-form as the Ascended face
    const flare = h('div', { class: 'asc-flare' });
    layer.append(flare);
    this.anim(flare, [{ opacity: 1 }, { opacity: 0 }], 700, 'ease-out');
    this.f.burst({ left: centre.x - 20, top: centre.y - 20, width: 40, height: 40 }, 28);
    stage.replaceChildren(bigCard({ cardId: id, seat, f: after, cost: null, note: 'ASCENDED' }));
    stage.classList.add('reformed');
    flip();
    await this.refresh();
    this.anim(stage, [{ transform: at(0, 0, 1.12), filter: 'brightness(4)' }, { transform: at(0, 0, 1), filter: 'none' }], 700);
    await this.hold(this.speed === 'full' ? 3000 : 2200); // readable for at least 2 seconds
    // back to its place
    if (this.skipping) {
      layer.remove();
      this.rootEl.classList.remove('dim', 'surge');
      return;
    }
    const nowHome = boxOf(q(`[data-unit][data-card="${id}"][data-seat="${seat}"]`)) ?? home;
    const back = nowHome ? { dx: nowHome.left + nowHome.width / 2 - centre.x, dy: nowHome.top + nowHome.height / 2 - centre.y, s: Math.max(0.15, nowHome.width / 360) } : { dx: 0, dy: 0, s: 0.3 };
    this.anim(stage, [{ transform: at(0, 0, 1), opacity: 1 }, { transform: at(back.dx, back.dy, back.s), opacity: 0.4 }], 500);
    this.anim(layer, [{ opacity: 1 }, { opacity: 0 }], 500);
    this.rootEl.classList.remove('surge');
    await this.wait(520);
    layer.remove();
    this.rootEl.classList.remove('dim');
  }
}

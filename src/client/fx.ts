// The effects layer: floating numbers, cracks, shards, frost, shield breaks, assembling facets, travelling pulses.
// Everything here is decoration drawn on a pointer-events:none layer in viewport coordinates; no game state lives
// here. All durations are multiplied by the current speed scale (full 1, quick 0.4, instant 0 = nothing is drawn).
import { h } from './cardview';

let scale = 1;
/** Set by the director when the speed changes. */
export function setFxScale(n: number): void {
  scale = n;
}
export const fxScale = (): number => scale;

export interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

export const boxOf = (el: Element | null): Box | null => {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return r.width === 0 && r.height === 0 ? null : { left: r.left, top: r.top, width: r.width, height: r.height };
};
export const centerOf = (b: Box): { x: number; y: number } => ({ x: b.left + b.width / 2, y: b.top + b.height / 2 });

const rnd = (a: number, b: number): number => a + Math.random() * (b - a);

export class Fx {
  constructor(public layer: HTMLElement) {}

  get on(): boolean {
    return scale > 0;
  }

  clear(): void {
    this.layer.replaceChildren();
  }

  private add<T extends HTMLElement | SVGElement>(node: T): T {
    this.layer.append(node);
    return node;
  }

  /** Animate a node, then remove it. */
  private run(node: Element, frames: Keyframe[], ms: number, easing = 'cubic-bezier(.2,.9,.2,1)', remove = true): Promise<void> {
    const d = ms * scale;
    if (d <= 0) {
      if (remove) node.remove();
      return Promise.resolve();
    }
    const a = node.animate(frames, { duration: d, easing, fill: 'forwards' });
    return a.finished.then(
      () => { if (remove) node.remove(); },
      () => { if (remove) node.remove(); },
    );
  }

  /** A number that floats up from a box (damage, repair, buff). */
  float(box: Box | null, text: string, cls: string): void {
    if (!this.on || !box) return;
    const n = this.add(h('div', { class: `fxn ${cls}`, text }));
    n.style.left = `${box.left + box.width / 2}px`;
    n.style.top = `${box.top + box.height * 0.3}px`;
    void this.run(n, [
      { transform: 'translate(-50%, 0) scale(.5)', opacity: 0 },
      { transform: 'translate(-50%, -1.2rem) scale(1.25)', opacity: 1, offset: 0.25 },
      { transform: 'translate(-50%, -3.6rem) scale(1)', opacity: 1, offset: 0.7 },
      { transform: 'translate(-50%, -4.6rem) scale(.95)', opacity: 0 },
    ], 1000, 'ease-out');
  }

  /** A white crack and flash over a box. */
  crack(box: Box | null): void {
    if (!this.on || !box) return;
    const wrap = this.add(h('div', { class: 'fx-crack' }));
    Object.assign(wrap.style, { left: `${box.left}px`, top: `${box.top}px`, width: `${box.width}px`, height: `${box.height}px` });
    const w = box.width;
    const hh = box.height;
    const pts = (n: number): string => {
      let x = rnd(0.25, 0.75) * w;
      let y = 0;
      const out = [`${x},${y}`];
      for (let i = 1; i <= n; i++) {
        x += rnd(-0.18, 0.18) * w;
        y = (i / n) * hh;
        out.push(`${Math.max(0, Math.min(w, x))},${y}`);
      }
      return out.join(' ');
    };
    wrap.innerHTML = `<svg width="${w}" height="${hh}" viewBox="0 0 ${w} ${hh}"><polyline points="${pts(5)}" fill="none" stroke="#fff" stroke-width="3" stroke-linejoin="miter"/><polyline points="${pts(4)}" fill="none" stroke="#fff" stroke-width="2" stroke-opacity=".85"/><polyline points="${pts(3)}" fill="none" stroke="#fff" stroke-width="1.5" stroke-opacity=".7"/></svg>`;
    wrap.append(h('div', { class: 'fx-flash' }));
    void this.run(wrap, [{ opacity: 1 }, { opacity: 1, offset: 0.35 }, { opacity: 0 }], 420, 'ease-out');
  }

  /** The card breaks into shards that fall. */
  shards(box: Box | null, hue: number, count = 7): void {
    if (!this.on || !box) return;
    const { left, top, width: w, height: hh } = box;
    const cx = rnd(0.35, 0.65) * w;
    const cy = rnd(0.35, 0.65) * hh;
    // points around the rectangle perimeter, with its corners so the shards cover the whole card
    const per = (t: number): [number, number] => {
      const side = Math.floor(t) % 4;
      const f = t - Math.floor(t);
      return side === 0 ? [f * w, 0] : side === 1 ? [w, f * hh] : side === 2 ? [w - f * w, hh] : [0, hh - f * hh];
    };
    const ts: number[] = [];
    for (let i = 0; i < count; i++) ts.push((i / count) * 4 + rnd(-0.15, 0.15) + 4);
    ts.sort((a, b) => a - b);
    for (let i = 0; i < count; i++) {
      const t0 = ts[i];
      const t1 = i === count - 1 ? ts[0] + 4 : ts[i + 1];
      const poly: [number, number][] = [[cx, cy], per(t0)];
      for (let c = Math.floor(t0) + 1; c < t1; c++) poly.push(per(c));
      poly.push(per(t1));
      const shard = this.add(h('div', { class: 'fx-shard' }));
      Object.assign(shard.style, {
        left: `${left}px`, top: `${top}px`, width: `${w}px`, height: `${hh}px`,
        clipPath: `polygon(${poly.map(([x, y]) => `${x.toFixed(1)}px ${y.toFixed(1)}px`).join(',')})`,
        background: `linear-gradient(${Math.round(rnd(0, 360))}deg, hsl(${hue} 70% ${Math.round(rnd(52, 72))}%), hsl(${hue} 60% ${Math.round(rnd(22, 38))}%))`,
      });
      const mx = poly.reduce((a, p) => a + p[0], 0) / poly.length - w / 2;
      const my = poly.reduce((a, p) => a + p[1], 0) / poly.length - hh / 2;
      const dx = mx * rnd(0.4, 0.9) + rnd(-12, 12);
      const dy = my * 0.3 + rnd(90, 190);
      const rot = rnd(-40, 40);
      void this.run(shard, [
        { transform: 'translate(0,0) rotate(0)', opacity: 1, filter: 'brightness(2.4)' },
        { transform: `translate(${dx * 0.3}px, ${-rnd(4, 14)}px) rotate(${rot * 0.2}deg)`, opacity: 1, filter: 'brightness(1.4)', offset: 0.2 },
        { transform: `translate(${dx}px, ${dy}px) rotate(${rot}deg)`, opacity: 0, filter: 'brightness(1)' },
      ], rnd(620, 820), 'cubic-bezier(.4,0,.9,.6)');
    }
  }

  /** A frost sweep across a box (Stasis). */
  frost(box: Box | null): void {
    if (!this.on || !box) return;
    const wrap = this.add(h('div', { class: 'fx-frost' }));
    Object.assign(wrap.style, { left: `${box.left}px`, top: `${box.top}px`, width: `${box.width}px`, height: `${box.height}px` });
    const bar = h('div', { class: 'fx-frost-bar' });
    wrap.append(bar);
    bar.animate([{ transform: 'translateX(-110%)' }, { transform: 'translateX(210%)' }], { duration: 650 * scale, easing: 'ease-in-out', fill: 'forwards' });
    void this.run(wrap, [{ opacity: 1 }, { opacity: 1, offset: 0.8 }, { opacity: 0 }], 800, 'linear');
  }

  /** The shield rim breaks and its pieces fly outward (Ward spent). */
  shield(box: Box | null): void {
    if (!this.on || !box) return;
    const c = centerOf(box);
    const ring = this.add(h('div', { class: 'fx-shield' }));
    Object.assign(ring.style, { left: `${box.left}px`, top: `${box.top}px`, width: `${box.width}px`, height: `${box.height}px` });
    void this.run(ring, [{ opacity: 1, transform: 'scale(1)' }, { opacity: 1, transform: 'scale(1.08)', offset: 0.3 }, { opacity: 0, transform: 'scale(1.35)' }], 520, 'ease-out');
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + rnd(-0.2, 0.2);
      const p = this.add(h('div', { class: 'fx-wshard' }));
      const sx = c.x + Math.cos(a) * box.width * 0.42;
      const sy = c.y + Math.sin(a) * box.height * 0.42;
      p.style.left = `${sx}px`;
      p.style.top = `${sy}px`;
      void this.run(p, [
        { transform: `translate(-50%,-50%) rotate(${i * 45}deg) scale(1)`, opacity: 1 },
        { transform: `translate(calc(-50% + ${Math.cos(a) * 46}px), calc(-50% + ${Math.sin(a) * 46 + 12}px)) rotate(${i * 45 + 120}deg) scale(.4)`, opacity: 0 },
      ], rnd(480, 640), 'ease-out');
    }
  }

  /** Facets assemble into a card (summon). */
  assemble(box: Box | null, hue: number): void {
    if (!this.on || !box) return;
    const n = 9;
    for (let i = 0; i < n; i++) {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const w = box.width / 3;
      const hh = box.height / 3;
      const piece = this.add(h('div', { class: 'fx-facet' }));
      Object.assign(piece.style, {
        left: `${box.left + col * w}px`, top: `${box.top + row * hh}px`, width: `${w}px`, height: `${hh}px`,
        background: `linear-gradient(${Math.round(rnd(0, 360))}deg, hsl(${hue} 80% 75%), hsl(${hue} 70% 45%))`,
        clipPath: i % 2 ? 'polygon(0 0, 100% 0, 0 100%)' : 'polygon(100% 0, 100% 100%, 0 100%)',
      });
      const dx = (col - 1) * rnd(40, 90) + rnd(-20, 20);
      const dy = (row - 1) * rnd(40, 90) + rnd(-30, 10);
      void this.run(piece, [
        { transform: `translate(${dx}px, ${dy}px) rotate(${rnd(-80, 80)}deg) scale(.5)`, opacity: 0 },
        { transform: `translate(${dx * 0.4}px, ${dy * 0.4}px) rotate(${rnd(-30, 30)}deg) scale(.9)`, opacity: 0.95, offset: 0.4 },
        { transform: 'translate(0,0) rotate(0) scale(1)', opacity: 0.85, offset: 0.8 },
        { transform: 'translate(0,0) rotate(0) scale(1)', opacity: 0 },
      ], 520, 'cubic-bezier(.2,.9,.2,1)');
    }
    const flash = this.add(h('div', { class: 'fx-flash solo' }));
    Object.assign(flash.style, { left: `${box.left}px`, top: `${box.top}px`, width: `${box.width}px`, height: `${box.height}px` });
    void this.run(flash, [{ opacity: 0 }, { opacity: 0, offset: 0.55 }, { opacity: 0.8, offset: 0.75 }, { opacity: 0 }], 560, 'linear');
  }

  /** A pulse of light travelling from one box to another (a glyph resolving, Charge being spent). */
  pulse(from: Box | null, to: Box | null, cls = 'amber', ms = 480): Promise<void> {
    if (!this.on || !from || !to) return Promise.resolve();
    const a = centerOf(from);
    const b = centerOf(to);
    const dist = Math.hypot(b.x - a.x, b.y - a.y);
    const ang = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
    const trail = this.add(h('div', { class: `fx-trail ${cls}` }));
    Object.assign(trail.style, { left: `${a.x}px`, top: `${a.y}px`, width: `${dist}px`, transform: `rotate(${ang}deg)` });
    const dot = this.add(h('div', { class: `fx-dot ${cls}` }));
    dot.style.left = `${a.x}px`;
    dot.style.top = `${a.y}px`;
    void this.run(trail, [{ clipPath: 'inset(0 100% 0 0)', opacity: 1 }, { clipPath: 'inset(0 0 0 0)', opacity: 1, offset: 0.6 }, { clipPath: 'inset(0 0 0 0)', opacity: 0 }], ms * 1.5, 'ease-out');
    return this.run(dot, [
      { transform: 'translate(-50%,-50%) scale(.6)', opacity: 1 },
      { transform: `translate(calc(-50% + ${b.x - a.x}px), calc(-50% + ${b.y - a.y}px)) scale(1.4)`, opacity: 1, offset: 0.9 },
      { transform: `translate(calc(-50% + ${b.x - a.x}px), calc(-50% + ${b.y - a.y}px)) scale(2.4)`, opacity: 0 },
    ], ms, 'cubic-bezier(.3,.1,.2,1)');
  }

  /** Move a node (a clone of a card, a card back) from one box to another. */
  fly(node: HTMLElement, from: Box | null, to: Box | null, ms: number, opts: { fade?: boolean; spin?: number } = {}): Promise<void> {
    if (!this.on || !from || !to) {
      return Promise.resolve();
    }
    const el = this.add(node);
    Object.assign(el.style, { position: 'absolute', left: `${from.left}px`, top: `${from.top}px`, width: `${from.width}px`, height: `${from.height}px`, margin: '0', transformOrigin: 'top left' });
    const sx = to.width / from.width;
    const sy = to.height / from.height;
    return this.run(el, [
      { transform: 'translate(0,0) scale(1,1) rotate(0)', opacity: 1 },
      { transform: `translate(${to.left - from.left}px, ${to.top - from.top}px) scale(${sx},${sy}) rotate(${opts.spin ?? 0}deg)`, opacity: opts.fade ? 0.2 : 1 },
    ], ms, 'cubic-bezier(.2,.9,.2,1)');
  }

  /** A burst of gold shards from a point (the Ascension). */
  burst(box: Box | null, n = 18): void {
    if (!this.on || !box) return;
    const c = centerOf(box);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + rnd(-0.15, 0.15);
      const d = rnd(box.width * 0.5, box.width * 1.1);
      const s = this.add(h('div', { class: 'fx-gold' }));
      s.style.left = `${c.x}px`;
      s.style.top = `${c.y}px`;
      void this.run(s, [
        { transform: `translate(-50%,-50%) rotate(${a}rad) scale(.4)`, opacity: 1 },
        { transform: `translate(calc(-50% + ${Math.cos(a) * d}px), calc(-50% + ${Math.sin(a) * d}px)) rotate(${a}rad) scale(1.2)`, opacity: 0 },
      ], rnd(700, 1100), 'cubic-bezier(.1,.8,.2,1)');
    }
  }
}

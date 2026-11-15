// Procedural cut-crystal sigils. One function, cardArt(cardId, ascended), returns SVG markup so real
// painted art can replace it later without touching the callers. Deterministic from the card id.
import { def } from '../engine/query';
import { FACTION_INFO } from '../data/decks';

function hash(str: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

export function rngFrom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const f1 = (n: number): string => (Math.round(n * 10) / 10).toString();
const pt = (x: number, y: number): string => `${f1(x)},${f1(y)}`;

const cache = new Map<string, string>();

export function cardArt(cardId: string, ascended: boolean): string {
  const key = `${cardId}|${ascended ? 1 : 0}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const d = def(cardId);
  const hero = d.type === 'hero';
  const glyph = d.type === 'glyph';
  const hue = ascended ? 46 : FACTION_INFO[d.faction].hue;
  const r = rngFrom(hash(cardId + (ascended ? '!' : '')));
  const out: string[] = [];
  out.push(`<rect width="100" height="100" fill="hsl(${hue} 50% ${ascended ? 16 : 9}%)"/>`);
  const cx = 50 + (r() - 0.5) * 8;
  const cy = (hero ? 56 : 50) + (r() - 0.5) * 8;
  const n = 7 + Math.floor(r() * 5);
  const R1 = (hero ? 44 : 54) + r() * 8;
  const R2 = 20 + r() * 12;
  const lightDir = r() * Math.PI * 2;
  const outer: [number, number, number][] = [];
  const inner: [number, number, number][] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + (r() - 0.5) * 0.5;
    const ro = R1 * (0.8 + r() * 0.4);
    const ri = R2 * (0.75 + r() * 0.5);
    outer.push([cx + Math.cos(a) * ro, cy + Math.sin(a) * ro * 0.95, a]);
    inner.push([cx + Math.cos(a + 0.3) * ri, cy + Math.sin(a + 0.3) * ri, a + 0.3]);
  }
  const fill = (a: number, boost: number): string => {
    const lit = Math.cos(a - lightDir);
    const l = (glyph ? 24 : 28) + lit * 16 + r() * 10 + boost + (ascended ? 14 : 0);
    const h = hue + (r() - 0.5) * 22;
    const s = ascended ? 70 : 52 + r() * 22;
    return `hsl(${f1(h)} ${f1(s)}% ${f1(Math.max(8, Math.min(86, l)))}%)`;
  };
  const edge = 'rgba(234,244,255,.22)';
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const [ox, oy, oa] = outer[i];
    const [px, py] = outer[j];
    const [ix, iy, ia] = inner[i];
    const [jx, jy] = inner[j];
    const tri = (pts: string, a: number, boost = 0): void => {
      out.push(`<polygon points="${pts}" fill="${fill(a, boost)}" stroke="${edge}" stroke-width=".6" stroke-linejoin="miter"/>`);
    };
    tri(`${pt(ox, oy)} ${pt(px, py)} ${pt(ix, iy)}`, oa + 0.2);
    tri(`${pt(px, py)} ${pt(jx, jy)} ${pt(ix, iy)}`, oa + 0.6, 4);
    tri(`${pt(ix, iy)} ${pt(jx, jy)} ${pt(cx, cy)}`, ia + 0.4, 9);
  }
  // glyph: 3-6 strokes joined end to end on a small hex lattice
  const slots: [number, number][] = [[cx, cy]];
  for (let k = 0; k < 6; k++) slots.push([cx + Math.cos((k / 6) * Math.PI * 2 + 0.5) * 17, cy + Math.sin((k / 6) * Math.PI * 2 + 0.5) * 17]);
  const strokes = 3 + Math.floor(r() * 4);
  let cur = Math.floor(r() * 7);
  const path: string[] = [pt(slots[cur][0], slots[cur][1])];
  for (let k = 0; k < strokes; k++) {
    let nx = Math.floor(r() * 7);
    if (nx === cur) nx = (nx + 3) % 7;
    cur = nx;
    path.push(pt(slots[cur][0], slots[cur][1]));
  }
  const gcol = ascended ? '#fff3b0' : `hsl(${hue} 95% 88%)`;
  out.push(`<polyline points="${path.join(' ')}" fill="none" stroke="hsl(${hue} 90% 60% / .35)" stroke-width="6" stroke-linejoin="miter" stroke-linecap="square"/>`);
  out.push(`<polyline points="${path.join(' ')}" fill="none" stroke="${gcol}" stroke-width="2.4" stroke-linejoin="miter" stroke-linecap="square"/>`);
  if (hero) {
    // a crown of shards
    const m = ascended ? 7 : 5;
    for (let k = 0; k < m; k++) {
      const x = 14 + (72 * (k + 0.5)) / m;
      const h = 12 + r() * 16 + (k === Math.floor(m / 2) ? 10 : 0);
      const w = 72 / m / 2;
      out.push(`<polygon points="${pt(x - w, 0)} ${pt(x, h)} ${pt(x + w, 0)}" fill="${ascended ? '#fff3b0' : `hsl(${hue} 85% 76%)`}" opacity=".92" stroke="rgba(255,255,255,.5)" stroke-width=".5"/>`);
    }
  }
  for (let k = 0; k < 3; k++) {
    const x = r() * 100;
    const y = r() * 100;
    out.push(`<line x1="${f1(x)}" y1="${f1(y)}" x2="${f1(x + 10 + r() * 16)}" y2="${f1(y - 6 - r() * 10)}" stroke="rgba(255,255,255,.28)" stroke-width=".5"/>`);
  }
  const svg = `<svg class="art" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">${out.join('')}</svg>`;
  cache.set(key, svg);
  return svg;
}

/** A far city of crystal spires, bottom-anchored. Deterministic. */
export function skylineSvg(seed = 7): string {
  const r = rngFrom(seed);
  const layers: string[] = [];
  const cols = ['#18265a', '#111c48', '#0c1536'];
  const wins: string[] = [];
  for (let li = 0; li < 3; li++) {
    let x = -20;
    const parts: string[] = [];
    while (x < 1040) {
      const w = 22 + r() * 46;
      const h = 50 + r() * (110 + li * 40) + (li === 0 ? 40 : 0);
      const y = 300 - h;
      const kind = r();
      if (kind < 0.25) {
        parts.push(`<polygon points="${pt(x, 300)} ${pt(x, y + 14)} ${pt(x + w / 2, y - 30 - r() * 40)} ${pt(x + w, y + 14)} ${pt(x + w, 300)}"/>`);
      } else if (kind < 0.55) {
        parts.push(`<polygon points="${pt(x, 300)} ${pt(x, y + 16)} ${pt(x + 12, y)} ${pt(x + w, y)} ${pt(x + w, 300)}"/>`);
      } else if (kind < 0.8) {
        parts.push(`<polygon points="${pt(x, 300)} ${pt(x, y)} ${pt(x + w - 14, y)} ${pt(x + w, y + 14)} ${pt(x + w, 300)}"/>`);
      } else {
        parts.push(`<polygon points="${pt(x, 300)} ${pt(x + 4, y + 20)} ${pt(x + w / 2, y - 6)} ${pt(x + w - 4, y + 20)} ${pt(x + w, 300)}"/>`);
        parts.push(`<polygon points="${pt(x + w / 2 - 3, y - 6)} ${pt(x + w / 2, y - 50 - r() * 30)} ${pt(x + w / 2 + 3, y - 6)}"/>`);
      }
      if (li === 1 || li === 2) {
        const nw = Math.floor(r() * 4);
        for (let k = 0; k < nw; k++) {
          if (r() < 0.55) wins.push(`<rect x="${f1(x + 4 + r() * (w - 10))}" y="${f1(y + 20 + r() * (h - 30))}" width="2" height="3" fill="hsl(${r() < 0.8 ? 175 : 48} 90% 70% / ${f1(0.35 + r() * 0.4)})"/>`);
        }
      }
      x += w * (0.55 + r() * 0.5);
    }
    layers.push(`<g fill="${cols[li]}">${parts.join('')}</g>`);
  }
  return `<svg class="skyline" viewBox="0 0 1000 300" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">${layers.join('')}${wins.join('')}</svg>`;
}

/** The Spire crystal for a side: cracks as Integrity falls. */
export function spireSvg(integrity: number, max = 20): string {
  const lost = Math.max(0, max - integrity);
  const cracks = Math.min(6, Math.ceil(lost / 3.5));
  const col = integrity >= max ? '#eaf4ff' : '#ff5d73';
  const lines: string[] = [];
  const spots: [number, number, number, number][] = [[20, 12, 14, 34], [20, 18, 28, 40], [20, 24, 12, 46], [20, 10, 26, 28], [20, 30, 10, 38], [20, 34, 30, 52]];
  for (let i = 0; i < cracks; i++) {
    const [x1, y1, x2, y2] = spots[i];
    lines.push(`<polyline points="${x1},${y1} ${(x1 + x2) / 2 + 3},${(y1 + y2) / 2 - 2} ${x2},${y2}" fill="none" stroke="#0b1230" stroke-width="1.6"/>`);
  }
  return `<svg class="spire-svg" viewBox="0 0 40 64" aria-hidden="true" focusable="false">
<polygon points="20,1 34,20 30,56 20,63 10,56 6,20" fill="${col}" fill-opacity=".16" stroke="${col}" stroke-width="1.4" stroke-linejoin="miter"/>
<polygon points="20,1 34,20 20,26" fill="${col}" fill-opacity=".5"/>
<polygon points="20,1 6,20 20,26" fill="${col}" fill-opacity=".28"/>
<polygon points="6,20 20,26 10,56" fill="${col}" fill-opacity=".16"/>
<polygon points="34,20 20,26 30,56" fill="${col}" fill-opacity=".34"/>
${lines.join('')}</svg>`;
}

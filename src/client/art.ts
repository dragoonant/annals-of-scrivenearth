// Procedural cut-crystal sigils. One function, cardArt(cardId, ascended), returns SVG markup so real
// painted art can replace it later without touching the callers. Deterministic from the card id.
import { allCards, def } from '../engine/query';
import { FACTION_INFO } from '../data/decks';
import type { Keyword } from '../engine/types';

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

// ---------- real art hook ----------
// './art/manifest.json' is a JSON array of ids ('tide-maren', 'tide-maren--ascended'). An id in the list is drawn
// from './art/<id>.webp'; every other id keeps its procedural sigil. A missing manifest means sigils everywhere.
let manifest: Set<string> | null = null;
let manifestLoaded: Promise<void> | null = null;

export const artKey = (cardId: string, ascended: boolean): string => (ascended ? `${cardId}--ascended` : cardId);

export function loadArtManifest(url = './art/manifest.json'): Promise<void> {
  if (manifestLoaded) return manifestLoaded;
  manifestLoaded = (async () => {
    try {
      const res = await fetch(url, { cache: 'no-cache' });
      if (!res.ok) return;
      const data = (await res.json()) as unknown;
      if (Array.isArray(data) && data.every((x) => typeof x === 'string')) manifest = new Set(data as string[]);
    } catch {
      /* no manifest (404, an HTML fallback page, offline): every card keeps its sigil */
    }
  })();
  return manifestLoaded;
}
if (typeof window !== 'undefined' && typeof fetch === 'function') void loadArtManifest();

/** For a settings readout: the ids with real art, and the card ids (and Ascended faces) still on sigils. */
export function artStatus(): { listed: string[]; missing: string[] } {
  const listed = manifest ? [...manifest].sort() : [];
  const missing: string[] = [];
  for (const d of allCards()) {
    if (d.token || d.unimplemented || d.id.startsWith('zz-')) continue;
    if (!manifest?.has(artKey(d.id, false))) missing.push(d.id);
    if (d.type === 'hero' && d.ascended && !manifest?.has(artKey(d.id, true))) missing.push(artKey(d.id, true));
  }
  return { listed, missing };
}

/** Is there real art for this face? */
export const hasRealArt = (cardId: string, ascended: boolean): boolean => !!manifest?.has(artKey(cardId, ascended));

const escAttr = (s: string): string => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/** Markup for a face: an <img> when the manifest lists it, the procedural sigil otherwise. */
export function cardArt(cardId: string, ascended: boolean): string {
  if (hasRealArt(cardId, ascended)) {
    const key = artKey(cardId, ascended);
    return `<img class="art real" data-art="${escAttr(key)}" src="./art/${encodeURIComponent(key)}.webp" alt="" loading="lazy" decoding="async" draggable="false">`;
  }
  return sigilSvg(cardId, ascended);
}

/** Decode a listed image before it is shown; a listed image that fails is a loud console error, then its sigil. */
export function wireArtImg(img: HTMLImageElement, cardId: string, ascended: boolean): void {
  const key = artKey(cardId, ascended);
  img.style.opacity = '0';
  const fail = (): void => {
    console.error(`art: "${key}" is listed in art/manifest.json but its image failed to load; showing the sigil instead`);
    const holder = document.createElement('span');
    holder.innerHTML = sigilSvg(cardId, ascended);
    const svg = holder.firstElementChild;
    if (svg && img.parentNode) img.replaceWith(svg);
  };
  const show = (): void => {
    img.style.transition = 'opacity .18s';
    img.style.opacity = '1';
  };
  img.addEventListener('error', fail, { once: true });
  const go = (): void => {
    if (typeof img.decode === 'function') img.decode().then(show, () => { if (!img.complete || img.naturalWidth === 0) fail(); else show(); });
    else show();
  };
  if (img.complete && img.naturalWidth > 0) go();
  else img.addEventListener('load', go, { once: true });
}

export function sigilSvg(cardId: string, ascended: boolean): string {
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

/** Crack stage of a Spire: 0 whole, 1 at 15 or less, 2 at 10 or less, 3 at 5 or less. */
export function spireStage(integrity: number): 0 | 1 | 2 | 3 {
  return integrity <= 5 ? 3 : integrity <= 10 ? 2 : integrity <= 15 ? 1 : 0;
}

/** The Spire crystal for a side: it cracks at 15, 10 and 5 Integrity and warms towards red. */
export function spireSvg(integrity: number, max = 20): string {
  const stage = spireStage(integrity);
  const hurt = integrity < max;
  const col = stage === 0 ? '#eaf4ff' : stage === 1 ? '#ffc2cb' : '#ff5d73';
  const lines: string[] = [];
  const cracks: string[][] = [
    ['20,6 17,15 21,22 16,31 19,38'],
    ['20,22 28,28 26,36 31,44', '17,15 10,21 12,30'],
    ['21,22 14,34 18,44 13,54', '26,36 22,48 27,57', '28,28 33,24'],
  ];
  for (let i = 0; i < stage; i++) for (const pts of cracks[i]) lines.push(`<polyline points="${pts}" fill="none" stroke="#0b1230" stroke-width="2.2" stroke-linejoin="miter"/><polyline points="${pts}" fill="none" stroke="#fff" stroke-width=".7" stroke-opacity=".8" stroke-linejoin="miter"/>`);
  return `<svg class="spire-svg stage-${stage}${hurt ? ' hurt' : ''}" viewBox="0 0 40 64" aria-hidden="true" focusable="false">
<polygon points="20,1 34,20 30,56 20,63 10,56 6,20" fill="${col}" fill-opacity=".16" stroke="${col}" stroke-width="1.4" stroke-linejoin="miter"/>
<polygon points="20,1 34,20 20,26" fill="${col}" fill-opacity=".5"/>
<polygon points="20,1 6,20 20,26" fill="${col}" fill-opacity=".28"/>
<polygon points="6,20 20,26 10,56" fill="${col}" fill-opacity=".16"/>
<polygon points="34,20 20,26 30,56" fill="${col}" fill-opacity=".34"/>
${lines.join('')}</svg>`;
}

// ---------- keyword gems ----------
// One small cut gem per keyword; the keyword's name is shown in the inspector, never as a tooltip.
const KW_ICON: Record<Keyword, { hue: number; glyph: string }> = {
  vanguard: { hue: 28, glyph: '<polyline points="6,15 12,9 18,15" /><polyline points="6,20 12,14 18,20" />' },
  pierce: { hue: 340, glyph: '<line x1="6" y1="19" x2="16" y2="9"/><polygon points="19,6 18,13 12,7" fill="#fff"/>' },
  aerial: { hue: 195, glyph: '<polygon points="12,17 4,9 9,13 12,7 15,13 20,9" />' },
  spotter: { hue: 165, glyph: '<polygon points="3,12 12,6 21,12 12,18" /><circle cx="12" cy="12" r="2.4" fill="#fff"/>' },
  plated: { hue: 215, glyph: '<line x1="6" y1="9" x2="18" y2="9"/><line x1="6" y1="13" x2="18" y2="13"/><line x1="6" y1="17" x2="18" y2="17"/>' },
  siphon: { hue: 300, glyph: '<polygon points="12,5 17,13 12,19 7,13" fill="#fff" fill-opacity=".85"/>' },
  ward: { hue: 48, glyph: '<polygon points="12,4 19,7 18,15 12,20 6,15 5,7" />' },
  dueler: { hue: 8, glyph: '<line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/>' },
  dread: { hue: 270, glyph: '<polygon points="5,6 19,6 12,19" /><line x1="9" y1="9" x2="10" y2="9"/><line x1="14" y1="9" x2="15" y2="9"/>' },
  unstable: { hue: 58, glyph: '<polyline points="14,4 8,13 13,13 10,20" />' },
  mend: { hue: 140, glyph: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>' },
  corrosive: { hue: 95, glyph: '<line x1="8" y1="5" x2="8" y2="15"/><line x1="12" y1="5" x2="12" y2="19"/><line x1="16" y1="5" x2="16" y2="12"/>' },
};

export function keywordIcon(kw: Keyword): string {
  const k = KW_ICON[kw];
  if (!k) throw new Error(`no keyword icon for ${kw}`);
  return `<svg class="kw-icon kw-${kw}" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><polygon points="12,0 24,8 24,16 12,24 0,16 0,8" fill="hsl(${k.hue} 60% 22%)" stroke="hsl(${k.hue} 90% 68%)" stroke-width="1.6" stroke-linejoin="miter"/><polygon points="12,0 24,8 12,11 0,8" fill="hsl(${k.hue} 90% 80%)" fill-opacity=".22"/><g fill="none" stroke="#fff" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter">${k.glyph}</g></svg>`;
}

/** A frosted shard overlay for Stasis. */
export function frostSvg(): string {
  return '<svg class="frost-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false"><polygon points="0,0 46,0 22,38 0,30" fill="#dff2ff" fill-opacity=".34"/><polygon points="46,0 100,0 100,26 62,44 22,38" fill="#bfe4ff" fill-opacity=".26"/><polygon points="0,30 22,38 14,100 0,100" fill="#bfe4ff" fill-opacity=".3"/><polygon points="62,44 100,26 100,100 48,100 40,70" fill="#dff2ff" fill-opacity=".3"/><polygon points="22,38 62,44 40,70 14,100 48,100" fill="#eaf8ff" fill-opacity=".2"/><polyline points="0,30 22,38 62,44 100,26" fill="none" stroke="#fff" stroke-opacity=".8" stroke-width=".8"/><polyline points="22,38 40,70 48,100" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width=".8"/></svg>';
}

/** A crown of shards for an Ascended hero on the Line. */
export function crownSvg(): string {
  const spikes = [[4, 0, 12, 16, 20, 0], [20, 0, 30, 22, 40, 0], [40, 0, 50, 28, 60, 0], [60, 0, 70, 22, 80, 0], [80, 0, 88, 16, 96, 0]];
  return `<svg class="crown-svg" viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true" focusable="false">${spikes.map((p) => `<polygon points="${p[0]},${p[1]} ${p[2]},${p[3]} ${p[4]},${p[5]}" fill="#fff3b0" stroke="#fff" stroke-width=".6"/>`).join('')}</svg>`;
}

/** A faceted shield rim for Ward. */
export function wardRimSvg(): string {
  return '<svg class="ward-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false"><polygon points="12,1 88,1 99,12 99,70 50,99 1,70 1,12" fill="rgba(255,243,176,.07)" stroke="#fff3b0" stroke-width="2.4" stroke-linejoin="miter" vector-effect="non-scaling-stroke"/><polyline points="1,12 50,24 99,12" fill="none" stroke="#fff3b0" stroke-opacity=".55" stroke-width="1" vector-effect="non-scaling-stroke"/><polyline points="50,24 50,99" fill="none" stroke="#fff3b0" stroke-opacity=".4" stroke-width="1" vector-effect="non-scaling-stroke"/></svg>';
}

// A game session: setup, live state, the action list, autosave, and the AI turn loop.
// The human is always seat 0. The AI (seat 1) is only ever handed view(state, 1).
import type { Action, DeckList, GameState, Result, Seat, Setup } from '../engine/types';
import { applyAction, createGame } from '../engine/rules';
import { view } from '../engine/view';
import { makeSave, readSave, SAVE_KEY } from '../engine/save';
import type { SaveEnvelope, SaveMeta } from '../engine/save';
import { checkDeck } from '../engine/validate';
import { collectible, premadeDecks } from '../data/decks';
import { chooseAction, randomAction } from '../ai/ai';
import type { Difficulty } from '../ai/ai';
import { rngFrom } from './art';
import type { Director } from './director';
import type { Params } from './settings';

export const DECKS_KEY = 'scrivenearth-decks';

// ---------- deck catalogue ----------
export interface DeckChoice extends DeckList {
  dev?: boolean;
}

/** Two 40-card test decks made by repeating whatever collectible cards exist. Development only, bypasses checkDeck. */
export function devDecks(): DeckChoice[] {
  const pool = collectible().sort((a, b) => a.id.localeCompare(b.id));
  if (pool.length === 0) return [];
  const make = (offset: number, name: string): DeckChoice => {
    const cards: string[] = [];
    for (let i = 0; i < 40; i++) cards.push(pool[(offset + i) % pool.length].id);
    return { name, cards, dev: true };
  };
  return [make(0, 'Dev deck A (test only)'), make(Math.floor(pool.length / 2) + 1, 'Dev deck B (test only)')];
}

export function customDecks(): DeckChoice[] {
  try {
    const raw = localStorage.getItem(DECKS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as unknown;
    if (!Array.isArray(arr)) return [];
    const out: DeckChoice[] = [];
    for (const d of arr as { name?: unknown; cards?: unknown }[]) {
      if (typeof d?.name !== 'string' || !Array.isArray(d.cards) || !d.cards.every((c) => typeof c === 'string')) continue;
      if (checkDeck(d.cards as string[]).ok) out.push({ name: d.name, cards: d.cards as string[] });
    }
    return out;
  } catch {
    return [];
  }
}

export function deckCatalog(params: Params): DeckChoice[] {
  if (params.devdecks) return devDecks();
  return [...premadeDecks(), ...customDecks()];
}

// ---------- saves ----------
export type SaveState =
  | { kind: 'none' }
  | { kind: 'ok'; save: SaveEnvelope }
  | { kind: 'bad'; reason: string }
  | { kind: 'nostorage' };

export function readStoredSave(): SaveState {
  let text: string | null;
  try {
    text = localStorage.getItem(SAVE_KEY);
  } catch {
    return { kind: 'nostorage' };
  }
  if (text === null) return { kind: 'none' };
  const r = readSave(text);
  return r.ok ? { kind: 'ok', save: r.save } : { kind: 'bad', reason: r.reason };
}

export function clearSave(): void {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
    /* nothing stored, nothing to clear */
  }
}

// ---------- session ----------
export class Session {
  storageOk = true;
  private constructor(
    public setup: Setup,
    public meta: SaveMeta,
    public actions: Action[],
    public state: GameState,
  ) {}

  static start(setup: Setup, meta: SaveMeta): Session {
    const s = new Session(setup, meta, [], createGame(setup));
    s.persist(); // before the first render (owner rule 22)
    return s;
  }

  static fromSave(env: SaveEnvelope): Session {
    return new Session(env.setup, env.meta, env.actions, env.snapshot);
  }

  /** Apply an action for whoever has priority. A refused action changes nothing and is not recorded. */
  apply(a: Action): Result {
    const r = applyAction(this.state, a);
    if (!r.ok) return r;
    this.actions.push(a);
    if (this.state.phase === 'over') clearSave();
    else this.persist();
    return r;
  }

  persist(): void {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(makeSave(this.setup, this.meta, this.actions, this.state)));
    } catch {
      this.storageOk = false;
    }
  }
}

// ---------- the AI turn loop ----------
export class Runner {
  private timer: number | null = null;
  private dead = false;
  private watchdog: number;
  private rnd: () => number;
  /** Set by the app: apply an action through the director. */
  commit: (a: Action) => Result = () => ({ ok: false, events: [] });

  constructor(
    private session: Session,
    private director: Director,
    private params: Params,
    private level: Difficulty,
  ) {
    this.rnd = rngFrom((session.setup.seed ^ 0x9e3779b9) >>> 0);
    this.watchdog = window.setInterval(() => this.check(), 1000);
  }

  stop(): void {
    this.dead = true;
    if (this.timer !== null) clearTimeout(this.timer);
    clearInterval(this.watchdog);
  }

  /** Is it the machine's turn to act (the AI, or our seat too in ?auto=1)? */
  private machineTurn(): boolean {
    const s = this.session.state;
    if (s.phase === 'over') return false;
    return s.priority === 1 || this.params.auto;
  }

  /** The AI moves only when the director is idle; a watchdog forces its answer after 5 s of no progress. */
  pump(): void {
    if (this.dead || this.timer !== null || !this.machineTurn()) return;
    const delay = this.director.speed === 'instant' ? 0 : this.director.speed === 'quick' ? 250 : this.session.state.priority === 1 ? 650 : 400;
    this.timer = window.setTimeout(() => {
      this.timer = null;
      this.tick();
    }, delay);
  }

  private check(): void {
    if (this.dead || !this.machineTurn()) return;
    if (Date.now() - this.director.lastProgress > 5000) {
      this.director.skip();
      if (this.timer !== null) {
        clearTimeout(this.timer);
        this.timer = null;
      }
      this.director.lastProgress = Date.now();
      this.tick();
    }
  }

  private step(): void {
    const s = this.session.state;
    const seat: Seat = s.priority;
    const v = view(s, seat);
    const a = seat === 0 || this.params.bot === 'random' ? randomAction(v, this.rnd) : chooseAction(v, seat, this.level, this.rnd);
    const r = this.commit(a);
    if (!r.ok) throw new Error(`The ${seat === 1 ? 'AI' : 'auto player'} chose an action the engine refused: ${JSON.stringify(a)} (${r.error ?? ''})`);
  }

  private tick(): void {
    if (this.dead) return;
    if (this.director.busy) return; // onIdle will pump again
    if (!this.machineTurn()) return;
    const t0 = performance.now();
    // in instant mode run several moves per slice, then yield so the page can paint
    do {
      this.step();
    } while (this.director.speed === 'instant' && !this.director.busy && this.machineTurn() && performance.now() - t0 < 12);
    this.pump();
  }
}

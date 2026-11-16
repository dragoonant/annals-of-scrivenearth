// The app: screen router, session wiring, delegated input, inspector, test hooks.
import type { Action, GameState, Result, Seat } from '../engine/types';
import { view } from '../engine/view';
import { DIFFICULTIES } from '../ai/ai';
import type { Difficulty } from '../ai/ai';
import { Director, onEvents } from './director';
import { Runner, Session, bugReport, clearSave, deckCatalog, downloadText, readStoredSave } from './game';
import type { DeckChoice, SaveState } from './game';
import { fitHand, handleBoardClick, handleBoardKey, newBoardUI, renderBoard, renderMulligan } from './board';
import type { BoardHost } from './board';
import { backdrop, renderEnd, renderHowTo, renderModal, renderSetup, renderTitle } from './screens';
import type { Modal, SetupSel } from './screens';
import { Builder, blankState } from './deckbuilder';
import { decorate, refuses, renderReady } from './tutorial';
import { TUTORIAL_HERO, TUTORIAL_NAMES, TutorialFlow, tutorialSetup } from '../data/tutorial';
import { h, inspectorContent } from './cardview';
import { loadSettings, readParams, saveSettings } from './settings';
import type { Params, Settings, Speed } from './settings';
import { premadeDecks } from '../data/decks';
import { audition, installAudioUnlock, loadSamples, setMuted, setMusic, setVolume, type MusicMood } from '../audio/audio';

export type Screen = 'title' | 'setup' | 'mulligan' | 'board' | 'end' | 'howto' | 'builder';
const SCREENS: Screen[] = ['title', 'setup', 'mulligan', 'board', 'end', 'howto', 'builder'];

declare global {
  interface Window {
    __sv: {
      state(): GameState;
      view(): GameState;
      idle(): boolean;
      act(a: Action): Result;
      seat: 0;
      onEvents: typeof onEvents;
    };
  }
}

export class App {
  params: Params;
  settings: Settings;
  screen: Screen = 'title';
  private prevScreen: Screen = 'title';
  private session: Session | null = null;
  private runner: Runner | null = null;
  private director: Director;
  private ui = newBoardUI();
  private catalog: DeckChoice[] = [];
  private deckProblem: string | null = null;
  private builder: Builder;
  /** The guided first match, when one is running (never saved, never uses the AI). */
  private tut: TutorialFlow | null = null;
  private tutMsg: string | null = null;
  private tutTimer = 0;
  private sel: SetupSel = { me: 0, foe: 1, diff: 'normal' };
  private modal: Modal | null = null;
  private saveState: SaveState = { kind: 'none' };
  private scheduled = false;
  private screenEl: HTMLElement;
  private overlayEl: HTMLElement;
  private fxEl: HTMLElement;
  private inspEl: HTMLElement;
  private endView: GameState | null = null;

  constructor(private root: HTMLElement) {
    this.params = readParams(location.search);
    this.settings = loadSettings();
    this.root.replaceChildren();
    this.root.append(backdrop());
    this.screenEl = h('div', { class: 'screen', attrs: { id: 'screen' } });
    this.overlayEl = h('div', { class: 'overlay' });
    this.fxEl = h('div', { class: 'fx' });
    this.inspEl = h('div', { class: 'inspector-host' });
    this.root.append(this.screenEl, this.overlayEl, this.fxEl, this.inspEl, h('div', { class: 'rotate' }, h('b', { text: 'Rotate your device' }), h('span', { text: 'Annals of Scrivenearth is played in landscape.' })));
    this.builder = new Builder({ leave: () => this.go('title') });
    this.director = new Director(this.fxEl, this.root);
    this.director.speed = this.params.speed ?? this.settings.speed;
    this.director.onRender = () => this.requestRender();
    this.director.onIdle = () => {
      this.requestRender();
      this.pump();
    };
  }

  start(): void {
    installAudioUnlock();
    // Generated effects, voices and music (public/audio). A missing manifest means none were delivered: synth only.
    void loadSamples().then(() => this.syncMusic()).catch((e: unknown) => { console.error(e); });
    setVolume(this.settings.volume);
    setMuted(this.settings.muted);
    this.refreshCatalog();
    document.body.dataset.premade = String(premadeDecks().length);
    this.sel.diff = this.settings.difficulty;
    this.sel.foe = this.catalog.length > 1 ? 1 : 0;
    if (this.params.decks) {
      const [a, b] = this.params.decks;
      if (a >= 0 && a < this.catalog.length) this.sel.me = a;
      if (b >= 0 && b < this.catalog.length) this.sel.foe = b;
    }
    this.installHooks();
    this.layout();
    this.saveState = readStoredSave();
    if (this.params.tutorial) this.startTutorial();
    else if (this.params.skiptitle && this.catalog.length > 0) this.startGame();
    else if (this.params.skiptitle) this.go('setup');
    else this.go('title');
    if (this.params.demo === 'ascend') this.demoAscend();
  }

  // ---------- routing ----------
  go(screen: Screen): void {
    if (!SCREENS.includes(screen)) throw new Error(`unknown screen ${String(screen)}`);
    if (screen !== this.screen) this.prevScreen = this.screen;
    this.screen = screen;
    this.modal = null;
    if (screen === 'title') this.saveState = readStoredSave();
    if (screen === 'setup') this.refreshCatalog(); // decks saved in the builder appear at once
    if (screen === 'builder') this.builder.open();
    this.requestRender();
  }

  /** Premade decks plus the saved ones; keeps the chosen decks pointing at something that exists. */
  private refreshCatalog(): void {
    const c = deckCatalog(this.params);
    this.catalog = c.decks;
    this.deckProblem = c.problem;
    const last = Math.max(0, this.catalog.length - 1);
    this.sel.me = Math.min(this.sel.me, last);
    this.sel.foe = Math.min(this.sel.foe, last);
  }

  requestRender(): void {
    if (this.scheduled) return;
    this.scheduled = true;
    setTimeout(() => {
      this.scheduled = false;
      this.render();
    }, 0);
  }

  private syncScreen(): void {
    if (!this.session || !['mulligan', 'board', 'end'].includes(this.screen)) return;
    if (!this.director.hasState()) return;
    const p = this.director.presented;
    const want: Screen = p.phase === 'mulligan' ? 'mulligan' : p.phase === 'over' ? 'end' : 'board';
    if (want === 'end' && this.director.busy) return;
    if (want !== this.screen) {
      this.screen = want;
      if (want === 'end') this.endView = p;
      this.modal = null;
    }
  }

  private host: BoardHost = {
    view: () => this.director.presented,
    locked: () => this.director.busy,
    act: (a) => this.playerAct(a),
    rerender: () => this.requestRender(),
  };

  /** Music follows the screen and the state of the match (read from the presented state, never rules maths). */
  private syncMusic(): void {
    let mood: MusicMood = 'title';
    if (this.params.speed === 'instant') mood = 'none';
    else if (this.screen === 'board' || this.screen === 'mulligan') {
      const v = this.director.presented;
      const low = v ? Math.min(v.players[0].spire, v.players[1].spire) : 20;
      mood = low <= 7 ? 'tense' : v && v.combat ? 'battle' : 'calm';
    } else if (this.screen === 'end' && this.endView) {
      mood = this.endView.winner === 0 ? 'victory' : 'defeat';
    }
    void setMusic(mood).catch((e: unknown) => { console.error(e); });
  }

  render(): void {
    this.syncScreen();
    this.syncMusic();
    this.layout();
    this.root.dataset.screen = this.screen;
    let content: HTMLElement;
    switch (this.screen) {
      case 'title':
        content = renderTitle(this.saveState, this.settings, this.params.devdecks);
        break;
      case 'setup':
        content = renderSetup(this.catalog, this.sel, this.params.devdecks, this.deckProblem);
        break;
      case 'builder':
        content = this.builder.root;
        break;
      case 'howto':
        content = renderHowTo();
        break;
      case 'mulligan':
        content = renderMulligan(this.host, this.ui);
        break;
      case 'board':
        content = renderBoard(this.host, this.ui);
        break;
      case 'end': {
        if (!this.endView || !this.session) throw new Error('end screen without a finished game');
        content = renderEnd(this.endView, this.session.meta.deckNames, !this.session.ephemeral);
        break;
      }
      default:
        throw new Error(`unknown screen ${String(this.screen)}`);
    }
    content.classList.add('screen-body');
    this.screenEl.replaceChildren(content);
    if (this.screen === 'board' || this.screen === 'mulligan') fitHand(this.screenEl);
    if (this.tut && this.screen === 'board') this.renderTutorial();
    // storage warning on every screen if saving failed
    if (this.session && !this.session.storageOk) {
      this.screenEl.append(h('div', { class: 'storage-warn', text: 'This browser is not storing saves' }));
    }
    this.renderOverlay();
  }

  private renderOverlay(): void {
    const keepScroll = this.overlayEl.querySelector<HTMLElement>('.drawer-list');
    const wasAtBottom = keepScroll ? keepScroll.scrollTop + keepScroll.clientHeight >= keepScroll.scrollHeight - 4 : true;
    const prevTop = keepScroll?.scrollTop ?? 0;
    if (!this.modal) {
      this.overlayEl.replaceChildren();
      return;
    }
    const v = this.director.hasState() && this.session ? this.director.presented : null;
    const canConcede = !!v && v.priority === 0 && v.phase !== 'over' && v.phase !== 'mulligan' && !this.director.busy;
    this.overlayEl.replaceChildren(renderModal(this.modal, v, this.settings, canConcede));
    const list = this.overlayEl.querySelector<HTMLElement>('.drawer-list');
    if (list) list.scrollTop = keepScroll && !wasAtBottom ? prevTop : list.scrollHeight;
  }

  /** One --u from the viewport so the board fits with no scrollbars at any supported size. */
  layout(): void {
    const w = window.innerWidth;
    const hh = window.innerHeight;
    // The unit each board design would get on this screen (design sizes in units: wide 136.6x76.8, short 84.4x39,
    // tall 39x84.4). The wide board (three columns, opponent hand across the top) is kept while its unit stays at
    // least 9 px (1280x720 and up); below that a near-square screen (a foldable's inner screen, a tablet) takes
    // whichever compact board gives it the larger unit, so text never shrinks under phone size to make room for the
    // desktop layout (50-client.md RULING, 2026-11-15: a 900x640 inner screen had 9 px body text in the wide board).
    const fit = { wide: Math.min(w / 136.6, hh / 76.8), short: Math.min(w / 84.4, hh / 39), tall: Math.min(w / 39, hh / 84.4) };
    const mode: 'wide' | 'short' | 'tall' = fit.wide >= 9 ? 'wide' : fit.tall >= fit.short ? 'tall' : 'short';
    const u = fit[mode];
    document.documentElement.style.setProperty('--u', `${u.toFixed(3)}px`);
    this.root.dataset.mode = mode;
    this.root.className = this.root.className.replace(/\bmode-\w+/g, '').trim();
    this.root.classList.add(`mode-${mode}`);
  }

  // ---------- game ----------
  private difficulty(): Difficulty {
    const d = DIFFICULTIES.find((x) => x.id === this.sel.diff);
    return (d ? d.id : 'normal') as Difficulty;
  }

  startGame(): void {
    const me = this.catalog[this.sel.me];
    const foe = this.catalog[this.sel.foe];
    if (!me || !foe) throw new Error('no deck chosen');
    const seed = this.params.seed ?? Math.floor(Math.random() * 0xffffffff);
    this.settings.difficulty = this.sel.diff;
    saveSettings(this.settings);
    const session = Session.start({ seed, decks: [me.cards, foe.cards] }, { deckNames: [me.name, foe.name], difficulty: this.sel.diff });
    this.attach(session, this.difficulty());
  }

  continueGame(): void {
    if (this.saveState.kind !== 'ok') throw new Error('nothing to continue');
    const env = this.saveState.save;
    const session = Session.fromSave(env);
    this.attach(session, (DIFFICULTIES.find((d) => d.id === env.meta.difficulty)?.id ?? 'normal') as Difficulty);
  }

  private attach(session: Session, level: Difficulty): void {
    this.runner?.stop();
    this.session = session;
    this.ui = newBoardUI();
    this.endView = null;
    this.director.reset(session.state);
    // the tutorial's opponent plays its script: no AI runner
    if (this.tut) this.runner = null;
    else {
      this.runner = new Runner(session, this.director, this.params, level);
      this.runner.commit = (a) => this.commit(a);
    }
    this.modal = null;
    this.screen = session.state.phase === 'mulligan' ? 'mulligan' : 'board';
    this.requestRender();
    this.pump();
  }

  /** Let whoever is not the human move: the AI runner, or the tutorial's script. */
  private pump(): void {
    if (this.tut) this.pumpTutorial();
    else this.runner?.pump();
  }

  /** Apply an action through the director (the only way state changes). */
  commit(a: Action): Result {
    if (!this.session) throw new Error('no game in progress');
    const r = this.session.apply(a);
    if (r.ok) this.director.enqueue(r.events, this.session.state);
    this.pump();
    return r;
  }

  // ---------- the guided first match ----------
  startTutorial(): void {
    this.tut = new TutorialFlow();
    this.tutMsg = null;
    const session = Session.start(tutorialSetup(), { deckNames: TUTORIAL_NAMES, difficulty: 'normal' }, true);
    this.attach(session, 'normal');
  }

  private leaveTutorial(): void {
    window.clearTimeout(this.tutTimer);
    this.tut = null;
    this.tutMsg = null;
    this.leaveGame();
  }

  /** The human's action. In the tutorial only the lesson's own action goes through; anything else is answered, not ignored. */
  private playerAct(a: Action): Result {
    const t = this.tut;
    if (!t || !this.session) return this.commit(a);
    const g = t.gate(a, this.session.state);
    if (!g.ok) {
      this.tutMsg = g.why;
      this.requestRender();
      return { ok: false, error: g.why, events: [] };
    }
    const r = this.commit(a);
    if (r.ok) {
      this.tutMsg = null;
      t.accepted();
      this.pump();
    }
    return r;
  }

  /** The opponent's scripted replies, one at a time, only when the board is at rest. */
  private pumpTutorial(): void {
    const t = this.tut;
    const s = this.session;
    if (!t || !s || this.tutTimer || s.state.phase === 'over' || t.queue.length === 0) return;
    const delay = this.director.speed === 'instant' ? 0 : this.director.speed === 'quick' ? 250 : 700;
    this.tutTimer = window.setTimeout(() => {
      this.tutTimer = 0;
      if (!this.tut || !this.session) return;
      if (this.director.busy) return; // onIdle pumps again
      if (this.session.state.priority !== 1) throw new Error('Tutorial script: the opponent is queued to act but it is not its priority');
      const a = this.tut.nextOpp(this.session.state);
      if (!a) return;
      const r = this.commit(a);
      if (!r.ok) throw new Error(`Tutorial script: the opponent's action was refused (${r.error ?? ''})`);
      this.requestRender();
    }, delay);
  }

  /** Coach panel, highlights and dimming for the board; the "You're ready" panel when the script has run out. */
  private renderTutorial(): void {
    const t = this.tut;
    if (!t || !this.session || !this.director.hasState()) return;
    const v = this.director.presented;
    const finished = t.finished && t.queue.length === 0 && !this.director.busy;
    if (finished) {
      const hero = this.session.state.players[0].ascended.includes(TUTORIAL_HERO) ? 'Jax Windlash' : 'Your hero';
      this.screenEl.append(renderReady(hero === 'Jax Windlash' ? 'Jax Windlash' : hero));
      return;
    }
    const waiting = this.director.busy || t.queue.length > 0 || v.priority !== 0 || v.phase === 'over' || this.session.state.priority !== 0;
    decorate(this.screenEl, { flow: t, v, ui: this.ui, waiting, message: this.tutMsg });
  }

  private leaveGame(): void {
    this.runner?.stop();
    this.runner = null;
    this.session = null;
    this.endView = null;
    this.director.reset(view(this.emptyState(), 0));
  }

  private emptyState(): GameState {
    // a throwaway state so the director holds nothing from the finished game
    return blankState();
  }

  // ---------- input ----------
  private onUi(el: HTMLElement): void {
    const k = el.dataset.ui!;
    if (k.startsWith('b-')) {
      this.builder.click(el);
      return;
    }
    const v = el.dataset.v;
    switch (k) {
      case 'new':
        this.go('setup');
        return;
      case 'continue':
        this.continueGame();
        return;
      case 'howto':
        this.go('howto');
        return;
      case 'howto-from-game':
        this.modal = null;
        this.prevScreen = this.screen;
        this.screen = 'howto';
        this.requestRender();
        return;
      case 'back':
        this.screen = this.session && this.prevScreen !== 'title' && this.prevScreen !== 'setup' ? this.prevScreen : 'title';
        this.requestRender();
        return;
      case 'builder':
        this.go('builder');
        return;
      case 'tutorial':
        this.startTutorial();
        return;
      case 'tut-skip':
        this.leaveTutorial();
        this.go('title');
        return;
      case 'tut-title':
        this.leaveTutorial();
        this.go('title');
        return;
      case 'tut-new':
        this.leaveTutorial();
        this.go('setup');
        return;
      case 'tut-builder':
        this.leaveTutorial();
        this.go('builder');
        return;
      case 'bugreport': {
        if (!this.session) return;
        const r = bugReport(this.session);
        downloadText(r.name, r.json);
        el.textContent = 'Bug report saved';
        return;
      }
      case 'discard':
        clearSave();
        this.saveState = readStoredSave();
        this.requestRender();
        return;
      case 'speed':
        this.setSpeed(v as Speed);
        return;
      case 'pick': {
        const side = el.dataset.side as 'me' | 'foe';
        this.sel[side] = Number(el.dataset.i);
        this.requestRender();
        return;
      }
      case 'peek': {
        const d = this.catalog[Number(el.dataset.i)];
        this.modal = { kind: 'peek', deck: d };
        this.renderOverlay();
        return;
      }
      case 'surprise': {
        const side = el.dataset.side as 'me' | 'foe';
        this.sel[side] = Math.floor(Math.random() * this.catalog.length);
        this.requestRender();
        return;
      }
      case 'diff':
        this.sel.diff = v!;
        this.requestRender();
        return;
      case 'start': {
        this.saveState = readStoredSave();
        if (this.saveState.kind === 'ok') {
          const sm = this.saveState.save;
          this.modal = { kind: 'confirm', text: `This replaces your saved game (round ${sm.snapshot.round} vs ${sm.meta.deckNames[1]}). Start anyway?`, yes: 'start-yes' };
          this.renderOverlay();
        } else this.startGame();
        return;
      }
      case 'start-yes':
        this.modal = null;
        this.startGame();
        return;
      case 'settings':
        this.modal = { kind: 'settings' };
        this.renderOverlay();
        return;
      case 'mute':
        this.settings.muted = !this.settings.muted;
        setMuted(this.settings.muted);
        saveSettings(this.settings);
        this.renderOverlay();
        return;
      case 'audition':
        audition(v!);
        return;
      case 'volume':
        return;
      case 'close':
      case 'backdrop':
        this.modal = null;
        this.renderOverlay();
        return;
      case 'scrap':
        this.modal = { kind: 'scrap' };
        this.renderOverlay();
        return;
      case 'log':
        this.modal = { kind: 'log' };
        this.renderOverlay();
        return;
      case 'menu':
        this.modal = this.tut ? { kind: 'tutmenu' } : { kind: 'menu', confirmConcede: false };
        this.renderOverlay();
        return;
      case 'concede':
        if (this.modal?.kind === 'menu' && this.session && this.session.state.priority === 0) {
          this.modal = { kind: 'menu', confirmConcede: true };
          this.renderOverlay();
        }
        return;
      case 'concede-no':
        this.modal = { kind: 'menu', confirmConcede: false };
        this.renderOverlay();
        return;
      case 'concede-yes':
        this.modal = null;
        if (this.session && this.session.state.priority === 0) this.commit({ type: 'concede' });
        this.requestRender();
        return;
      case 'title':
        if (this.screen === 'end' && !this.session?.ephemeral) clearSave();
        this.leaveGame();
        this.go('title');
        return;
      case 'again':
        this.startGame();
        return;
      default:
        throw new Error(`unknown ui action ${k}`);
    }
  }

  private setSpeed(s: Speed): void {
    this.settings.speed = s;
    saveSettings(this.settings);
    this.director.speed = this.params.speed ?? s;
    if (s === 'instant') this.director.skip();
    this.requestRender();
    this.renderOverlay();
  }

  // ---------- inspector ----------
  private inspKey = '';
  private hoverTimer = 0;
  private pressTimer = 0;
  private pressXY: [number, number] | null = null;
  private suppressClick = false;

  private hideInspector(): void {
    window.clearTimeout(this.hoverTimer);
    this.inspKey = '';
    this.inspEl.replaceChildren();
  }

  private keyOf(el: Element | null): string {
    if (!el) return '';
    const d = (el as HTMLElement).dataset;
    return `${d.card}|${d.unit ?? ''}|${d.seat ?? ''}`;
  }

  private showInspector(el: HTMLElement): void {
    const d = el.dataset;
    if (!d.card) return;
    const seat = (d.seat === '1' ? 1 : 0) as Seat;
    const v = this.session && this.director.hasState() ? this.director.presented : null;
    const content = inspectorContent(v, seat, d.card, d.unit);
    const box = h('div', { class: 'inspector facet' }, content);
    this.inspEl.replaceChildren(box);
    this.inspKey = this.keyOf(el);
    const r = el.getBoundingClientRect();
    const bw = box.offsetWidth;
    const bh = box.offsetHeight;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const pad = 8;
    let x: number;
    let y: number;
    if (this.root.dataset.mode === 'tall') {
      x = Math.max(pad, (vw - bw) / 2);
      y = r.top + r.height / 2 > vh / 2 ? pad : vh - bh - pad;
    } else {
      x = r.right + 12;
      if (x + bw > vw - pad) x = r.left - bw - 12;
      if (x < pad) x = Math.max(pad, Math.min(vw - bw - pad, r.left));
      y = Math.max(pad, Math.min(vh - bh - pad, r.top + r.height / 2 - bh / 2));
    }
    box.style.left = `${Math.round(x)}px`;
    box.style.top = `${Math.round(y)}px`;
  }

  // ---------- hooks ----------
  private installHooks(): void {
    const root = this.root;
    document.addEventListener('selectstart', (e) => {
      if (!this.editable(e.target)) e.preventDefault();
    });
    document.addEventListener('contextmenu', (e) => {
      if (!this.editable(e.target)) e.preventDefault();
    });
    document.addEventListener('input', (e) => {
      const t = e.target as HTMLInputElement;
      if (t?.dataset?.ui === 'volume') {
        this.settings.volume = Number(t.value) / 100;
        setVolume(this.settings.volume);
        saveSettings(this.settings);
      }
    });
    window.addEventListener('resize', () => {
      this.layout();
      this.requestRender();
    });
    // any click or key skips the presentation to its end
    document.addEventListener('pointerdown', () => this.director.skip(), true);
    document.addEventListener('keydown', (e) => {
      this.director.skip();
      if (e.key === 'Escape') {
        if (this.inspKey) this.hideInspector();
        else if (this.screen === 'builder' && this.builder.closeDialog()) return;
        else if (this.modal) {
          this.modal = null;
          this.renderOverlay();
        } else if (this.screen === 'board' && handleBoardKey(e, this.host, this.ui)) return;
      }
    });
    // tutorial: a click on a game input that is not the lesson is answered with a coach line instead of going through
    document.addEventListener(
      'click',
      (e) => {
        const t = e.target as HTMLElement | null;
        if (!this.tut || this.screen !== 'board' || this.modal || !t || !root.contains(t)) return;
        if (!refuses(t) || !this.session) return;
        e.stopPropagation();
        e.preventDefault();
        const st = this.tut.step;
        this.tutMsg = this.tut.queue.length > 0 ? 'Wait for the opponent to finish.' : (st?.hint ?? 'The tutorial is over.');
        this.requestRender();
      },
      true,
    );
    document.addEventListener('click', (e) => {
      if (this.suppressClick) {
        this.suppressClick = false;
        e.stopPropagation();
        e.preventDefault();
        return;
      }
      const t = e.target as HTMLElement | null;
      if (!t || !root.contains(t)) return;
      const ui = t.closest<HTMLElement>('[data-ui]');
      // a click inside a modal that is not on its backdrop must not close it
      if (ui && ui.dataset.ui === 'backdrop' && t !== ui) return;
      if (ui && !ui.hasAttribute('disabled')) {
        // the deck tile is a div: its Peek button sits inside it
        this.onUi(ui);
        return;
      }
      if (this.modal) return;
      if (this.screen === 'board' || this.screen === 'mulligan') handleBoardClick(e, this.host, this.ui);
    });
    // inspector: hover (300 ms) for a mouse, long-press for touch (distance cancels, never time)
    document.addEventListener('pointerover', (e) => {
      if (e.pointerType === 'touch') return;
      const el = (e.target as Element).closest?.('[data-card]') ?? null;
      const key = this.keyOf(el);
      if (key === this.inspKey && key) return;
      window.clearTimeout(this.hoverTimer);
      if (!el) {
        this.hideInspector();
        return;
      }
      this.inspKey = '';
      this.inspEl.replaceChildren();
      this.hoverTimer = window.setTimeout(() => this.showInspector(el as HTMLElement), 300);
    });
    document.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'touch') return;
      this.hideInspector();
      const el = (e.target as Element).closest?.('[data-card]') as HTMLElement | null;
      if (!el) return;
      this.pressXY = [e.clientX, e.clientY];
      window.clearTimeout(this.pressTimer);
      this.pressTimer = window.setTimeout(() => {
        this.showInspector(el);
        this.suppressClick = true;
      }, 420);
    });
    document.addEventListener('pointermove', (e) => {
      if (this.pressXY && Math.hypot(e.clientX - this.pressXY[0], e.clientY - this.pressXY[1]) > 10) {
        window.clearTimeout(this.pressTimer);
        this.pressXY = null;
      }
    });
    const endPress = (): void => {
      window.clearTimeout(this.pressTimer);
      this.pressXY = null;
    };
    document.addEventListener('pointerup', endPress);
    document.addEventListener('pointercancel', endPress);

    window.__sv = {
      state: () => this.need().state,
      view: () => view(this.need().state, 0),
      idle: () => !this.director.busy && !this.scheduled,
      act: (a) => {
        const s = this.need();
        if (s.state.priority !== 0) return { ok: false, error: 'Not your turn to act', events: [] };
        return this.playerAct(a);
      },
      seat: 0,
      onEvents,
    };
  }

  private need(): Session {
    if (!this.session) throw new Error('no game in progress');
    return this.session;
  }

  private editable(t: EventTarget | null): boolean {
    const el = t as HTMLElement | null;
    return !!el && !!el.closest?.("input, textarea, select, [contenteditable='true']");
  }

  // ---------- dev-only demo ----------
  /** ?demo=ascend: put the first hero of your deck on your Line and play its Ascension sequence. Development only. */
  private demoAscend(): void {
    if (!this.session) return;
    const s = this.session.state;
    const hid = s.players[0].heroes[0];
    if (!hid) throw new Error('demo=ascend needs a hero in your deck');
    // dev-only mutation of the live state, then a fabricated Ascend event for the director
    s.players[0].line.push({ iid: `u${s.nextId++}`, card: hid, owner: 0, dmg: 0, mods: [], stasis: false, ward: false, silenced: false, doomed: false, seen: {}, summonRound: s.round });
    this.director.reset(s);
    s.players[0].ascended.push(hid);
    setTimeout(() => {
      this.render();
      this.director.enqueue([{ k: 'ascend', r: s.round, seat: 0, card: hid, n: 1 }], s);
    }, 300);
  }
}

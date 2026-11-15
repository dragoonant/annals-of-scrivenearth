// The board and the mulligan, drawn from the presented view of seat 0. Every affordance comes from the engine's
// legalActions / whyNot* / targetChoices; every number from stats(), costOf(), face(). A full re-render per change.
import type { Action, GameState, Result, Seat, Unit } from '../engine/types';
import { LIMITS } from '../engine/types';
import { legalActions, targetChoices, whyNotBlockAction, whyNotChannel, whyNotDeclare, whyNotPlay } from '../engine/rules';
import { costOf, def, face, findUnit, targetSpecs } from '../engine/query';
import { cardBack, handCardEl, h, heroProgress, lineSegsEl, unitDisplay, unitEl } from './cardview';
import { spireSvg } from './art';
import { targetPrompt } from './text';

export interface BoardUI {
  armed: string | null;
  picked: string[];
  notice: string | null;
  duelFor: string | null;
  blockUnit: string | null;
  blockAtt: string | null;
  mull: Set<string>;
}
export const newBoardUI = (): BoardUI => ({ armed: null, picked: [], notice: null, duelFor: null, blockUnit: null, blockAtt: null, mull: new Set() });

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
}

// ---------- derived interaction ----------
interface Targets {
  slots: number;
  legal: Set<string>;
}
function armedTargets(v: GameState, ui: BoardUI): Targets {
  if (!ui.armed) return { slots: 0, legal: new Set() };
  const choices = targetChoices(v, 0, ui.armed);
  const slots = choices[0]?.length ?? 0;
  if (slots === 0) return { slots: 0, legal: new Set() };
  const legal = new Set<string>();
  for (const c of choices) if (ui.picked.every((p, i) => c[i] === p) && c.length > ui.picked.length) legal.add(c[ui.picked.length]);
  return { slots, legal };
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
        if (ui.picked.length < tg.slots) return;
        return done(ui.picked.length ? { type: 'play', iid: ui.armed, targets: ui.picked } : { type: 'play', iid: ui.armed });
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
    ui.picked.push(id);
    ui.notice = null;
    // the last slot chosen plays the card (the owner's rule: a click on a legal target plays it)
    if (ui.picked.length >= tg.slots) {
      done({ type: 'play', iid: ui.armed, targets: [...ui.picked] });
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

// ---------- drawing ----------
function cells(n: number, max: number, cls: string): HTMLElement {
  const box = h('span', { class: `cells ${cls}` });
  const total = Math.max(max, n);
  for (let i = 0; i < total; i++) box.append(h('span', { class: `cell ${i < n ? 'on' : ''} ${i >= max ? 'extra' : ''}` }));
  return box;
}

function heroChips(v: GameState, seat: Seat): HTMLElement {
  const box = h('div', { class: 's-heroes' });
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
  return h(
    'div',
    { class: `side facet ${seat === 0 ? 'me' : 'opp'}`, data: { side: seat } },
    h('span', { class: 'conduit' }),
    h(
      'div',
      { class: `s-spire ${spireTarget ? 'is-target' : ''} ${damaged ? 'damaged' : ''}`, data: { spire: seat } },
      (() => { const s = h('span', { class: 'spire-art' }); s.innerHTML = spireSvg(p.spire); return s; })(),
      h('span', { class: 's-int' }, h('b', { text: String(p.spire) }), h('i', { text: 'SPIRE' })),
    ),
    h('div', { class: 's-who', text: seat === 0 ? 'YOU' : 'OPPONENT' }),
    v.initiative === seat && v.round > 0 ? h('span', { class: 'init', text: 'INITIATIVE' }) : null,
    h(
      'div',
      { class: 's-cells' },
      h('span', { class: 's-lbl', text: 'CHARGE' }),
      cells(p.charge, p.maxCharge, 'charge'),
      h('span', { class: 's-num', text: `${p.charge}/${p.maxCharge}` }),
    ),
    h('div', { class: 's-cells' }, h('span', { class: 's-lbl', text: 'RESERVE' }), cells(p.reserve, LIMITS.reserve, 'reserve'), h('span', { class: 's-num', text: String(p.reserve) })),
    h(
      'div',
      { class: 's-counts' },
      h('span', { class: 'cnt' }, h('i', { text: 'DECK' }), h('b', { text: String(p.deck.length) })),
      h('span', { class: 'cnt' }, h('i', { text: 'HAND' }), h('b', { text: String(p.hand.length) })),
      h('button', { class: 'cnt scrapbtn', data: { ui: 'scrap' } }, h('i', { text: 'SCRAP' }), h('b', { text: String(p.scrap.length) })),
    ),
    heroChips(v, seat),
  );
}

function forecast(v: GameState, att: Unit, blk: Unit): HTMLElement {
  const a = unitDisplay(v, att);
  const b = unitDisplay(v, blk);
  const aLeft = Math.max(0, a.hp - b.power);
  const bLeft = Math.max(0, b.hp - a.power);
  return h(
    'span',
    { class: 'forecast' },
    h('span', { class: 'fc' }, h('i', { text: `hits ${a.power}` }), h('b', { class: aLeft === 0 ? 'dies' : '', text: aLeft === 0 ? 'falls' : `${aLeft} left` })),
    h('span', { class: 'fc' }, h('i', { text: `hits ${b.power}` }), h('b', { class: bLeft === 0 ? 'dies' : '', text: bLeft === 0 ? 'falls' : `${bLeft} left` })),
  );
}

export function renderBoard(host: BoardHost, ui: BoardUI): HTMLElement {
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
      el.append(unitEl(v, u, cls.join(' ')));
    }
    return el;
  };
  board.append(h('div', { class: 'a-oppline' }, lineEl(1)), h('div', { class: 'a-meline' }, lineEl(0)));

  // battle row
  const battle = h('div', { class: 'battle facet' });
  if (v.combat && v.combat.pairs.length) {
    const pairs = h('div', { class: 'pairs' });
    const attackerSeat = v.combat.attacker;
    for (const pr of v.combat.pairs) {
      const att = findUnit(v, pr.att);
      if (!att) continue;
      const blk = pr.blk ? findUnit(v, pr.blk) : undefined;
      const aCls: string[] = ['mini', 'attacking'];
      if (attackerSeat === 0 && v.phase === 'declare') aCls.push('actable');
      if (ui.blockAtt === att.iid) aCls.push('selected');
      if (v.phase === 'block' && attackerSeat === 1 && pr.blk === null && ui.blockUnit) aCls.push('is-target');
      const pair = h('div', { class: `pair ${blk ? 'blocked' : ''}` }, unitEl(v, att, aCls.join(' ')));
      pair.append(h('span', { class: 'link' }));
      if (blk) {
        pair.append(unitEl(v, blk, `mini blocking ${pr.forced ? 'forced' : ''} ${ui.blockUnit === blk.iid ? 'selected' : ''}`));
        if (v.phase === 'block' || v.phase === 'combat') pair.append(forecast(v, att, blk));
      } else {
        const d = unitDisplay(v, att);
        pair.append(h('div', { class: 'nob' }, h('b', { text: v.phase === 'declare' ? 'to be' : 'open' }), h('i', { text: v.phase === 'declare' ? 'blocked' : `${d.power} to Spire` })));
      }
      pairs.append(pair);
    }
    battle.append(pairs);
  } else {
    battle.append(h('div', { class: 'battle-empty', text: 'BATTLE ROW' }));
  }
  board.append(h('div', { class: 'a-battle' }, battle));

  // stack
  const stack = h('div', { class: 'stack facet' }, h('div', { class: 'stack-h', text: 'STACK' }));
  if (v.stack.length === 0) stack.append(h('div', { class: 'stack-empty', text: 'No glyphs waiting' }));
  for (const it of [...v.stack].reverse()) {
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
        { class: `sitem facet ${tg.legal.has(it.sid) ? 'is-target' : ''}`, data: { sid: it.sid, card: it.card, seat: it.owner }, style: { '--hue': '205' } },
        h('span', { class: 'si-top' }, h('span', { class: 'si-who', text: it.owner === 0 ? 'YOU' : 'OPP' }), h('span', { class: 'si-name', text: d.name }), h('span', { class: 'si-speed', text: d.speed ?? '' })),
        tnames.length ? h('span', { class: 'si-tgt' }, h('span', { class: 'sline' }), h('span', { text: tnames.join(', ') })) : null,
      ),
    );
  }
  board.append(h('div', { class: 'a-stack' }, stack));

  // action bar
  board.append(h('div', { class: 'a-action' }, actionBar(v, ui, interactive, tg, channelable, playable)));

  // hand
  const hand = h('div', { class: 'hand', data: { count: mine.hand.length } });
  for (const hc of mine.hand) {
    const el = handCardEl(v, 0, hc.iid, hc.card);
    if (playable.has(hc.iid) || channelable.has(hc.iid)) el.classList.add('actable');
    if (ui.armed === hc.iid) el.classList.add('armed');
    hand.append(el);
  }
  board.append(h('div', { class: 'a-hand' }, hand));

  const menu = h('div', { class: 'topbtns' }, h('button', { class: 'btn small', data: { ui: 'log' }, text: 'Log' }), h('button', { class: 'btn small', data: { ui: 'menu' }, text: 'Menu' }));
  board.append(menu);
  return board;
}

function actionBar(v: GameState, ui: BoardUI, interactive: boolean, tg: Targets, channelable: Set<string>, playable: Set<string>): HTMLElement {
  const bar = h('div', { class: `actionbar facet ${interactive ? 'live' : 'wait'}` });
  const status = h('div', { class: 'status' });
  const btns = h('div', { class: 'btns' });
  const mine = v.players[0];
  let line: string;
  if (v.phase === 'over') line = 'The game is over.';
  else if (v.priority === 1) {
    line = v.phase === 'block' ? 'The opponent is choosing blocks…' : v.stack.length ? 'The opponent is responding…' : 'The opponent is thinking…';
  } else if (!interactive) line = 'Resolving…';
  else if (ui.armed) {
    const hc = mine.hand.find((x) => x.iid === ui.armed);
    if (!hc) throw new Error('armed card is not in hand');
    const d = def(hc.card);
    const name = cardName(v, 0, hc.card);
    const specs = targetSpecs(v, 0, hc.card);
    const cost = costOf(v, 0, hc.card);
    if (tg.slots > 0 && ui.picked.length < tg.slots) line = targetPrompt(hc.card, name, ui.picked.length, tg.slots, specs[ui.picked.length]);
    else if (playable.has(hc.iid)) line = `Ready: ${name}. Press Play.`;
    else line = `${name}: ${d.type === 'hero' ? 'Channel it, or put it back' : 'put it back'}.`;
    if (playable.has(hc.iid) && tg.slots === 0) {
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
  } else if (v.phase === 'combat') line = 'Blocks are locked. Cast a Swift or Flash glyph, or let the strike happen.';
  else if (v.stack.length) line = 'Glyphs are waiting. Answer with a Swift or Flash glyph, or let them resolve.';
  else line = mine.canAttack ? 'Your move: play a card, click a unit to attack, or pass.' : 'Your move: play a card or pass.';
  status.append(h('span', { class: 'status-line', text: line }));
  if (ui.notice) status.append(h('span', { class: 'notice', text: ui.notice }));
  if (interactive && (v.phase === 'main' || v.phase === 'combat')) {
    btns.append(h('button', { class: `btn ${ui.armed ? 'ghost' : 'primary'}`, data: { action: 'pass' }, text: passLabel(v) }));
  }
  bar.append(status, btns);
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

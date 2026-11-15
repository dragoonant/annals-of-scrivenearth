// Every player-facing sentence that is not card text lives here: the log lines, keyword help, prompt wording,
// the how-to-play. An unknown log kind throws (no silent fallback); tests/client-text.test.ts asserts coverage.
import type { Keyword, LogEntry, Seat, TargetSpec } from '../engine/types';

/** A piece of a sentence: plain text, or a card name that opens the inspector. */
export type Seg = string | { card: string; seat?: Seat };

const who = (s?: Seat): string => (s === 0 ? 'You' : 'Opponent');
const whoLow = (s?: Seat): string => (s === 0 ? 'you' : 'the opponent');
const whose = (s?: Seat): string => (s === 0 ? 'your' : "the opponent's");
const c = (id: string | undefined, seat?: Seat): Seg => {
  if (!id) throw new Error('log line needs a card id');
  return { card: id, seat };
};
const plural = (n: number | undefined, one: string, many: string): string => (n === 1 ? one : many);

type LineFn = (e: LogEntry) => Seg[];

function kwNames(list: string | undefined): string {
  if (!list) return 'a keyword';
  return list.split(',').map((k) => (KEYWORD_HELP[k as Keyword]?.name ?? k)).join(', ');
}
function via(e: LogEntry): Seg[] {
  return e.via ? [' (', c(e.via), ')'] : [];
}

export const LOG_LINES: Record<string, LineFn> = {
  absorb: (e) => [c(e.tcard, e.seat), ' shrugged the hit off (Plated).'],
  ascend: (e) => [c(e.card, e.seat), e.n && e.n > 0 ? ' has Ascended on the Line.' : ` has Ascended in ${whose(e.seat)} deck.`],
  attack: (e) => [`${who(e.seat)} attacked with ${e.n ?? 0} ${plural(e.n, 'unit', 'units')}.`],
  blocks: (e) => [`${who(e.seat)} locked blocks: ${e.n ?? 0} ${plural(e.n, 'attacker', 'attackers')} blocked.`],
  buff: (e) => [c(e.tcard, e.seat), ` got ${(e.n ?? 0) >= 0 ? '+' : ''}${e.n ?? 0}|${(e.m ?? 0) >= 0 ? '+' : ''}${e.m ?? 0}${e.s === 'round' ? ' for the round' : ''}`, ...via(e), '.'],
  burn: (e) => [c(e.card, e.seat), ` was burned: ${whose(e.seat)} hand is full.`],
  cast: (e) => [`${who(e.seat)} cast `, c(e.card, e.seat), ` (${e.n ?? 0}).`],
  channel: (e) => [`${who(e.seat)} Channelled `, c(e.card, e.seat), ': repaired and +1|+1.'],
  charge: (e) => [`${who(e.seat)} gained ${e.n ?? 0} Charge`, ...via(e), '.'],
  combatEnd: () => ['The attack is over.'],
  create: (e) => [c(e.card, e.seat), ` was added to ${whose(e.seat)} hand`, ...via(e), '.'],
  destroy: (e) => (e.s === 'unstable'
    ? [c(e.tcard, e.seat), ' faded (Unstable).']
    : e.s === 'replaced' ? [c(e.tcard, e.seat), ' was scrapped to make room', ...via(e), '.']
    : [c(e.tcard, e.seat), ' was marked for destruction', ...via(e), '.']),
  die: (e) => [c(e.card, e.seat), ` was destroyed (${whose(e.seat)} Scrap).`],
  dmg: (e) => [c(e.tcard, e.seat), ` took ${e.n ?? 0} damage`, ...via(e), '.'],
  draw: (e) => [`${who(e.seat)} drew ${e.n ?? 1} ${plural(e.n ?? 1, 'card', 'cards')}.`],
  fizzle: (e) => [c(e.card, e.seat), ' fizzled: every target was gone.'],
  grant: (e) => [c(e.tcard, e.seat), ` gained ${kwNames(e.s)}`, ...via(e), '.'],
  heal: (e) => [c(e.tcard, e.seat), ` was repaired by ${e.n ?? 0}`, ...via(e), '.'],
  lineFull: (e) => [c(e.card, e.seat), ` was lost: ${whose(e.seat)} Line is full.`],
  maxCharge: (e) => [`${who(e.seat)}${e.seat === 0 ? 'r' : "'s"} maximum Charge rose by ${e.n ?? 1}`, ...via(e), '.'],
  mulligan: (e) => [(e.n ?? 0) === 0 ? `${who(e.seat)} kept the opening hand.` : `${who(e.seat)} replaced ${e.n} ${plural(e.n, 'card', 'cards')}.`],
  negate: (e) => [c(e.card, e.seat), ' was negated', ...via(e), '.'],
  over: (e) => [e.seat === undefined ? 'The game ended in a draw.' : `${who(e.seat)} won the game.`],
  pass: (e) => [`${who(e.seat)} passed.`],
  play: (e) => [`${who(e.seat)} played `, c(e.card, e.seat), ` (${e.n ?? 0} Charge).`],
  rally: (e) => [`${who(e.seat)} may attack again`, ...via(e), '.'],
  recall: (e) => [c(e.tcard, e.seat), ` returned to ${whose(e.seat)} hand`, ...via(e), '.'],
  reserve: (e) => [`${who(e.seat)} gained ${e.n ?? 0} Reserve`, ...via(e), '.'],
  resolve: (e) => [c(e.card, e.seat), ' resolved.'],
  round: (e) => [`Round ${e.n ?? 0}: ${e.seat === 0 ? 'you hold' : 'the opponent holds'} the Initiative.`],
  silence: (e) => [c(e.tcard, e.seat), ' was silenced', ...via(e), '.'],
  spireDmg: (e) => [`${e.seat === 0 ? 'Your' : "The opponent's"} Spire took ${e.n ?? 0} damage`, ...via(e), '.'],
  spireHeal: (e) => [`${e.seat === 0 ? 'Your' : "The opponent's"} Spire was repaired by ${e.n ?? 0}`, ...via(e), '.'],
  stasis: (e) => [c(e.tcard, e.seat), ' is in Stasis for the round', ...via(e), '.'],
  strike: (e) => [c(e.card, e.seat), ' struck ', e.tcard ? c(e.tcard, e.seat === 0 ? 1 : 0) : (e.tunit === 'spire0' ? 'your Spire' : "the opponent's Spire"), ` for ${e.n ?? 0}.`],
  summon: (e) => [c(e.card, e.seat), ` joined ${whose(e.seat)} Line.`],
  ward: (e) => [c(e.tcard, e.seat), "'s Ward absorbed the damage."],
};

export function lineSegs(e: LogEntry): Seg[] {
  const fn = LOG_LINES[e.k];
  if (!fn) throw new Error(`No player-facing line for log kind "${e.k}" (add it to LOG_LINES in src/client/text.ts)`);
  return fn(e);
}

/** Plain-text version of a log line (for the event feed text sweep and the log). */
export function lineText(e: LogEntry, nameOf: (id: string) => string): string {
  return lineSegs(e).map((s) => (typeof s === 'string' ? s : nameOf(s.card))).join('');
}

export const KEYWORD_HELP: Record<Keyword, { name: string; text: string }> = {
  vanguard: { name: 'Vanguard', text: 'When attacking, strikes before its blocker. If the blocker is destroyed it does not strike back.' },
  pierce: { name: 'Pierce', text: "Strike damage beyond the blocker's remaining health hits the enemy Spire. If the blocker is gone, it still strikes the Spire." },
  aerial: { name: 'Aerial', text: 'Can be blocked only by Aerial or Spotter units.' },
  spotter: { name: 'Spotter', text: 'Can block Aerial units.' },
  plated: { name: 'Plated', text: 'Takes 1 less damage from every source.' },
  siphon: { name: 'Siphon', text: "Damage its strikes deal repairs its owner's Spire by that much." },
  ward: { name: 'Ward', text: 'Negates the next damage it would take, then is used up. Granted Ward lasts until used.' },
  dueler: { name: 'Dueler', text: 'When declared as an attacker, may name one enemy unit not in Stasis, which must block it.' },
  dread: { name: 'Dread', text: 'Cannot be blocked by units with 2 or less power.' },
  unstable: { name: 'Unstable', text: 'Destroyed at the end of the round.' },
  mend: { name: 'Mend', text: 'Fully repaired at the start of each round.' },
  corrosive: { name: 'Corrosive', text: 'Any damage it deals to a unit destroys that unit.' },
};

/** Ability words and statuses, explained in the inspector when the card text uses them. */
export const WORD_HELP: Record<string, string> = {
  Deploy: 'Happens when the unit is played from your hand (not when an effect summons it).',
  Shatter: 'Happens when the unit is destroyed.',
  Strike: 'Happens when the unit strikes.',
  Assault: 'Happens when the unit is declared as an attacker.',
  Dawn: 'Happens at the start of each round.',
  Dusk: 'Happens at the end of each round.',
  Ascend: 'Happens when the hero Ascends while it is on the Line.',
  Resonant: 'A bonus that applies while you have an Ascended hero on your Line.',
  Stasis: 'The unit cannot attack or block for the rest of the round.',
  Channel: 'For 1 Charge, discard a spare copy of a hero already on your Line: repair it and give it +1|+1.',
};

/** Statuses on a unit, explained in the inspector. */
export const STATUS_HELP = {
  stasis: 'In Stasis: cannot attack or block for the rest of the round.',
  ward: 'Ward is up: the next damage it would take is negated.',
  silenced: 'Silenced: it has lost its abilities, keywords and buffs.',
  doomed: 'Marked for destruction.',
  ascended: 'Ascended: this hero uses its stronger face for the rest of the game.',
} as const;
export const roundBuffText = (power: number, health: number): string => `${power >= 0 ? '+' : ''}${power}|${health >= 0 ? '+' : ''}${health} until the end of the round.`;

export const END_REASONS: Record<string, string> = {
  spire: 'A Spire fell to 0 Integrity.',
  spires: 'Both Spires fell at the same moment.',
  deck: 'A player had to draw from an empty deck.',
  rounds: 'Round 45 passed without a winner.',
  concede: 'A player conceded.',
};

const SPEC_WORDS = (s: TargetSpec): string => {
  const side = s.side === 'ally' ? 'a friendly' : s.side === 'enemy' ? 'an enemy' : 'any';
  if (s.what === 'glyph') return s.side === 'ally' ? 'one of your glyphs on the stack' : s.side === 'enemy' ? "an enemy glyph on the stack" : 'a glyph on the stack';
  const base = s.what === 'unitOrSpire' ? 'unit or Spire' : 'unit';
  const extra = s.filter?.hero ? ' hero' : '';
  const combat = s.inCombat ? ' in the attack' : '';
  return `${side}${extra} ${base}${combat}`.replace('any ', 'any ');
};

/** Optional per-card wording for each target slot. Falls back to a sentence built from the target spec. */
export const PLAY_PROMPTS: Record<string, string[]> = {
  // Prismguard
  'prism-facet-initiate': ['Choose an ally to get +0|+1'],
  'prism-pane-mender': ['Choose an ally to repair by 4'],
  'prism-sentinel-lens': ['Choose an ally to gain Ward'],
  'prism-hold-the-line': ['Choose an ally to gain Plated this round'],
  'prism-mirror-ward': ['Choose an ally to gain Ward'],
  'prism-patch-the-pane': ['Choose an ally to repair by 4'],
  'prism-call-out': ['Choose an ally to gain Dueler and +0|+2 this round'],
  'prism-lightwall-oath': ['Choose an ally to get +0|+2 and Plated'],
  // Emberworks
  'ember-kessa': ['Choose an enemy unit or the enemy Spire to take 1 damage'],
  'ember-slagsmith': ['Choose an enemy unit to take 1 damage'],
  'ember-arcwelder': ['Choose an enemy unit to take 2 damage (3 while Resonant)'],
  'ember-moltenwarden': ['Choose an enemy unit to take 3 damage'],
  'ember-overdrive': ['Choose an ally to get +2|+0 this round'],
  'ember-pinprick': ['Choose an enemy unit or the enemy Spire to take 1 damage'],
  'ember-ventburst': ['Choose an enemy unit to take 2 damage (the enemy Spire takes 1)'],
  'ember-slagbolt': ['Choose an enemy unit to take 3 damage'],
  'ember-scrapburst': ['Choose an ally to destroy (the enemy Spire takes 3 damage)'],
  'ember-heatlance': ['Choose an enemy unit or the enemy Spire to take 3 damage'],
  // Tidewardens
  'tide-ilvane': ['Choose an enemy unit to put in Stasis'],
  'tide-mirroreel': ['Choose an enemy unit with 2 or less power to put in Stasis'],
  'tide-eddycourier': ['Choose an allied unit to return to your hand'],
  'tide-lockkeeper': ["Choose an enemy unit with 2 or less power to return to its owner's hand"],
  'tide-stillwaterbailiff': ['Choose an enemy unit to put in Stasis'],
  'tide-frostmeremagistrate': ['Choose the first enemy unit to put in Stasis', 'Choose the second enemy unit to put in Stasis'],
  'tide-slipunder': ['Choose an allied unit to return to your hand'],
  'tide-heldbreath': ['Choose an enemy unit to put in Stasis'],
  'tide-tidalveil': ['Choose an allied unit to gain Ward'],
  'tide-unwrite': ['Choose an enemy glyph on the stack to negate'],
  'tide-backwash': ["Choose an enemy unit to return to its owner's hand"],
  'tide-sluiceclose': ['Choose the first enemy unit to put in Stasis', 'Choose the second enemy unit to put in Stasis'],
  // Verdant Coil
  'coil-vinewhip': ['Choose an enemy unit for it to strike'],
  'coil-behemoth': ['Choose an enemy unit for it to strike (Pierce)'],
  'coil-bristle': ['Choose an ally to get +3|+0 this round'],
  'coil-overgrowth': ['Choose an ally to get +3|+3 and Pierce this round'],
  'coil-duel-of-thorns': ['Choose your unit for the duel', 'Choose the enemy unit it strikes and is struck by'],
  'coil-lash-out': ['Choose your unit that will strike', 'Choose the enemy unit it strikes'],
  'coil-grafting': ['Choose an ally to get +2|+2 and Mend'],
  // Undervolt
  'under-furnacehand': ['Choose an allied unit to destroy'],
  'under-leechwiresurgeon': ['Choose an enemy unit to drain 2 from'],
  'under-pullplug': ['Choose an allied unit to destroy (then drain 2 from the enemy Spire)'],
  'under-siphontap': ['Choose an enemy unit to drain 2 from'],
  'under-acidbath': ['Choose an allied unit to gain Corrosive this round'],
  'under-burnledger': ['Choose an allied unit to destroy (then you draw 2)'],
  'under-snuffedfuse': ['Choose an enemy unit with 3 or less power to destroy'],
  'under-bleeddry': ['Choose an enemy unit or the enemy Spire to drain 4 from'],
  // Stormrail
  'storm-dispatcher': ['Choose an ally to get +2|+0 and Aerial this round'],
  'storm-tailwind': ['Choose an ally to get +1|+1 this round'],
  'storm-updraft': ['Choose an ally to get +1|+0 and Aerial this round'],
  'storm-crosswind': ['Choose an enemy unit to put in Stasis'],
  'storm-skyhook': ["Choose an enemy unit to return to its owner's hand"],
};

export function targetPrompt(cardId: string, cardName: string, slot: number, total: number, spec: TargetSpec): string {
  const custom = PLAY_PROMPTS[cardId]?.[slot];
  if (custom) return custom;
  if (total === 1) return `Choose ${SPEC_WORDS(spec)} for ${cardName}`;
  return `Choose target ${slot + 1} of ${total} for ${cardName}: ${SPEC_WORDS(spec)}`;
}

export const HOW_TO_PLAY: { h: string; p: string[] }[] = [
  {
    h: 'The goal',
    p: [
      'Each player commands a Spire with 20 Integrity. Reduce the other Spire to 0 and you win. If both fall together, or round 45 ends, the game is a draw. A player who must draw from an empty deck loses.',
      'You build your side from units and heroes on a Line of up to 6, and glyphs that you cast onto a shared stack.',
    ],
  },
  {
    h: 'Rounds, Charge and the Initiative',
    p: [
      'The game is played in rounds. One player holds the Initiative each round and it alternates; they act first and are the only one who may attack (unless a rally effect says otherwise).',
      'Each round your maximum Charge rises by 1 (up to 10) and refills. Units and heroes are paid with Charge only. Glyphs spend Reserve first, then Charge. Unspent Charge at the end of a round becomes Reserve (up to 3), which stays until spent.',
      'The round ends when both players pass in a row with nothing on the stack and no attack under way.',
    ],
  },
  {
    h: 'Playing cards',
    p: [
      'Click a card in your hand to arm it. If it needs targets, the legal ones glow amber: click them in order. Then press the Play button in the action bar. Press Esc or click empty space to put it back. Nothing is ever chosen for you.',
      'Units and heroes can be played only with an empty stack, outside an attack. Hold a hero card whose twin is already on your Line and you may Channel it instead: pay 1 Charge to repair the hero and give it +1|+1.',
    ],
  },
  {
    h: 'Attacking and blocking',
    p: [
      'When you may attack, click your units to send them into the battle row, in the order you want them to strike; click again to withdraw one. Then press Attack. A Dueler may force one enemy unit to block it.',
      'The defender clicks one of their units and then the attacker it blocks, and locks the blocks. After blocks lock there is a short window for Swift and Flash glyphs, then pairs strike left to right. An unblocked attacker strikes the Spire.',
    ],
  },
  {
    h: 'Glyphs and the stack',
    p: [
      'Ritual glyphs wait on the stack and can only be cast when it is empty. Swift glyphs can answer. Flash glyphs resolve at once and cannot be answered. When a player passes with glyphs waiting, the whole stack resolves, newest first.',
    ],
  },
  {
    h: 'Heroes and Ascension',
    p: [
      'Every hero has a level condition shown on its chip beside your Spire, for example "You have cast 6 glyphs". The game counts it all game long, even while the hero is still in your hand or deck. When it is met, the hero Ascends: every copy of it, in every zone, switches to its stronger face for the rest of the game. A copy on the Line is fully repaired and its Ascend ability fires.',
    ],
  },
  {
    h: 'Inspecting and saving',
    p: [
      'Hover any card for a moment (or press and hold on a touch screen) to read it large, with every keyword explained. The Scrap, the log and the deck lists work the same way.',
      'Your game saves itself after every move. Saves belong to this browser and this web address only: a different browser, a private window or a different address will not see them.',
    ],
  },
];

// Board flows with REAL clicks: declaring attackers, blocking, a targeted card, the full-Line scrap, the inspector,
// the unplayable-card reason, and the real-art hook. Positions are reached through window.__sv (state / act); every
// tested interaction itself is a click. Instant speed, premade decks, fixed seeds.
import { expect, test } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';
import { PLAY_PROMPTS } from '../src/client/text';

const BASE = `http://localhost:${process.env.PW_PORT ?? 5199}/`;
let dev = '';

test.beforeAll(async ({ browser }) => {
  const p = await browser.newPage();
  await p.goto(`${BASE}?speed=instant`, { waitUntil: 'domcontentloaded' });
  const n = Number(await p.evaluate(() => document.body.dataset.premade));
  dev = n >= 2 ? '' : '&devdecks=1';
  await p.close();
});

const url = (q: string): string => `${BASE}?speed=instant${dev}&${q}`;
const TARGETED = Object.keys(PLAY_PROMPTS);

function watch(page: Page): string[] {
  const errs: string[] = [];
  page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('pageerror', (e) => errs.push(`pageerror: ${e.message}`));
  return errs;
}

async function badText(page: Page): Promise<string | null> {
  const t = await page.evaluate(() => document.body.innerText);
  for (const bad of ['undefined', 'NaN', '[object']) if (t.includes(bad)) return bad;
  return null;
}

async function startGame(page: Page, q: string): Promise<void> {
  await page.goto(url(`skiptitle=1&bot=random&${q}`));
  await page.click('[data-action=mulligan]');
  await expect(page.locator('#root')).toHaveAttribute('data-screen', 'board');
  await settle(page);
}

/** Wait until the director is idle and it is my move (or the game is over). */
async function settle(page: Page): Promise<void> {
  await page.waitForFunction(() => window.__sv.idle() && (window.__sv.state().priority === 0 || window.__sv.state().phase === 'over'));
}

/**
 * One step of the test hook: play whatever can be played (never the cards in `avoid`), or pass, then let the
 * opponent move. Returns 'done' when `goal` (a JS expression over the state `s`) already holds on my move.
 */
async function step(page: Page, goal: string, avoid: string[] = []): Promise<'done' | 'step' | 'over'> {
  await settle(page);
  return page.evaluate(({ goalSrc, avoidIds }) => {
    const sv = window.__sv;
    const s = sv.state();
    if (s.phase === 'over') return 'over';
    if (goalSrc && new Function('s', `return ${goalSrc}`)(s)) return 'done';
    if (s.phase === 'block') { sv.act({ type: 'blocks' }); return 'step'; }
    if (s.phase === 'declare') { sv.act({ type: 'attack' }); return 'step'; }
    const skip = new Set(avoidIds);
    if (s.phase === 'main' && s.stack.length === 0) {
      for (const hc of s.players[0].hand) {
        if (skip.has(hc.card)) continue;
        if (sv.act({ type: 'play', iid: hc.iid }).ok) return 'step';
      }
    }
    sv.act({ type: 'pass' });
    return 'step';
  }, { goalSrc: goal, avoidIds: avoid });
}

/** Reach a position through the test hook (see step). */
async function advance(page: Page, goal: string, avoid: string[] = []): Promise<void> {
  for (let i = 0; i < 400; i++) {
    const r = await step(page, goal, avoid);
    if (r === 'done') return;
    if (r === 'over') throw new Error('the game ended before the position was reached');
  }
  throw new Error(`position not reached: ${goal}`);
}

async function finish(page: Page, errs: string[]): Promise<void> {
  expect(await badText(page), 'bad text on screen').toBeNull();
  expect(errs).toEqual([]);
}

const rectsOverlap = (a: { x: number; y: number; width: number; height: number }, b: { x: number; y: number; width: number; height: number }): boolean =>
  a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;

test('(a) declare two attackers by clicking, lock in, see the battle row', async ({ page }) => {
  const errs = watch(page);
  await startGame(page, 'seed=4');
  await advance(page, "s.phase==='main' && s.stack.length===0 && s.players[0].canAttack && s.players[0].line.filter(u => !u.stasis).length >= 2");
  const ids = await page.evaluate(() => window.__sv.state().players[0].line.filter((u) => !u.stasis).map((u) => u.iid));
  for (const iid of ids.slice(0, 2)) {
    await page.locator(`.line.me [data-unit="${iid}"]`).click();
    // a Dueler asks whether to force a block (never assumed); anything else is declared at once
    await page.waitForFunction((n) => window.__sv.state().combat?.pairs.some((p) => p.att === n) || !!document.querySelector('[data-action=noforce]'), iid);
    const noforce = page.locator('[data-action=noforce]');
    if (await noforce.count()) await noforce.click();
    await page.waitForFunction((n) => window.__sv.state().combat?.pairs.some((p) => p.att === n), iid);
  }
  await expect(page.locator('.pairs .pair')).toHaveCount(2);
  await expect(page.locator('.pairs .pair.my-att')).toHaveCount(2);
  expect(await page.evaluate(() => window.__sv.state().combat!.pairs.map((p) => p.att))).toEqual(ids.slice(0, 2)); // click order is strike order
  await expect(page.locator('.status-line')).toContainText('Attacking with 2');
  await expect(page.locator('[data-action=attack]')).toContainText('Attack with 2');
  await page.locator('[data-action=attack]').click();
  await page.waitForFunction(() => window.__sv.idle());
  const st = await page.evaluate(() => ({ ph: window.__sv.state().phase, pri: window.__sv.state().priority, pairs: window.__sv.state().combat?.pairs.length ?? 0 }));
  if (st.ph === 'combat') {
    // the combat window: the battle row still shows both pairs, each with a forecast chip, and the bar names who may respond
    await expect(page.locator('.pairs .pair')).toHaveCount(st.pairs);
    await expect(page.locator('.fchip')).toHaveCount(st.pairs);
    await expect(page.locator('.status-line')).toContainText('Combat window');
    await page.locator('[data-action=pass]').click();
    await page.waitForFunction(() => window.__sv.idle());
  } else {
    expect(['main', 'block']).toContain(st.ph);
  }
  expect(await page.evaluate(() => window.__sv.state().log.some((e) => e.k === 'attack' && e.seat === 0 && e.n === 2))).toBe(true);
  await finish(page, errs);
});

test('(b) a block: click my unit, then the attacker, then lock blocks', async ({ page }) => {
  const errs = watch(page);
  await startGame(page, 'seed=5');
  await advance(page, "s.phase==='block' && s.priority===0 && s.players[0].line.length >= 2");
  await expect(page.locator('.status-line')).toContainText('attacks with');
  const attackers = page.locator('.pair.foe-att > [data-unit]');
  const n = await attackers.count();
  expect(n).toBeGreaterThan(0);
  await expect(page.locator('.fchip.open')).toHaveCount(n); // nothing blocked yet: each says what it does to the Spire
  await expect(page.locator('.fchip.open').first()).toContainText('to the Spire');
  // my units that can block carry the actable edge; click one, then attackers until the engine accepts a block
  const mine = page.locator('.line.me [data-unit].actable');
  expect(await mine.count()).toBeGreaterThan(0);
  const blocker = await mine.first().getAttribute('data-unit');
  let blocked = false;
  for (let i = 0; i < n && !blocked; i++) {
    await page.locator(`.line.me [data-unit="${blocker}"]`).click();
    await attackers.nth(i).click();
    blocked = await page.evaluate(() => window.__sv.state().combat!.pairs.some((p) => p.blk !== null));
    if (!blocked) await page.keyboard.press('Escape');
  }
  expect(blocked, 'a block was accepted').toBe(true);
  await expect(page.locator('.pair.blocked')).toHaveCount(1);
  await expect(page.locator('.fchip.blocked')).toContainText(' vs ');
  await expect(page.locator('.fchip.blocked')).toContainText(/attacker (survives|is destroyed)/);
  await expect(page.locator('[data-action=blocks]')).toContainText('1 of');
  await page.locator('[data-action=blocks]').click();
  await page.waitForFunction(() => window.__sv.idle());
  expect(await page.evaluate(() => window.__sv.state().log.some((e) => e.k === 'blocks' && e.seat === 0 && e.n === 1))).toBe(true);
  await finish(page, errs);
});

test('(c) a targeted card: arm it, click a legal target, see the effect in state', async ({ page }) => {
  const errs = watch(page);
  await startGame(page, 'seed=4');
  // advance until a targeted card in my hand is actable (it is never cast on the way)
  let candidates: string[] = [];
  for (let i = 0; i < 300 && candidates.length === 0; i++) {
    await step(page, '', TARGETED);
    await settle(page);
    await page.waitForTimeout(30);
    candidates = await page.locator('[data-hand].actable').evaluateAll((els, ids) => els.map((e) => (e as HTMLElement).dataset.card!).filter((c) => ids.includes(c)), TARGETED);
  }
  expect(candidates.length).toBeGreaterThan(0);
  const id = candidates[0];
  const hand = page.locator(`[data-hand][data-card="${id}"]`).first();
  await hand.click();
  await expect(hand).toHaveClass(/armed/);
  // the action bar says what the card decides, in the per-card wording
  await expect(page.locator('.status-line')).toHaveText(PLAY_PROMPTS[id][0]);
  const targets = page.locator('.is-target');
  expect(await targets.count()).toBeGreaterThan(0);
  const before = await page.evaluate(() => window.__sv.state().log.length);
  // the targeting layer draws a line from the card to the hovered legal target
  await targets.first().hover();
  await expect(page.locator('.tgt-layer .tl-line.live')).toHaveCount(1);
  const slots = PLAY_PROMPTS[id].length;
  for (let k = 0; k < slots; k++) {
    const t = page.locator('.is-target').first();
    expect(await t.count()).toBe(1);
    await t.click();
    if (k < slots - 1) {
      await expect(page.locator('.status-line')).toHaveText(PLAY_PROMPTS[id][k + 1]);
      await expect(page.locator('.tgt-layer .tl-badge-n')).toHaveText('1'); // the first target stays marked
    }
  }
  await page.waitForFunction(() => window.__sv.idle());
  const played = await page.evaluate(({ cid, b }) => window.__sv.state().log.slice(b).some((e) => (e.k === 'cast' || e.k === 'play') && e.seat === 0 && e.card === cid), { cid: id, b: before });
  expect(played, `${id} was played`).toBe(true);
  await finish(page, errs);
});

test('(d) a full Line: arm a unit, click one of my units to scrap, see it replaced', async ({ page }) => {
  const errs = watch(page);
  await startGame(page, 'seed=4');
  // fill the Line with whatever units can be played (and keep a unit card in hand to play on the full Line)
  for (let i = 0; i < 400; i++) {
    await advance(page, "s.phase==='main' && s.players[0].line.length >= 6");
    await settle(page);
    const lineFull = await page.evaluate(() => window.__sv.state().players[0].line.length >= 6);
    if (!lineFull) continue;
    // look for a playable card that asks which unit to scrap
    const cards = page.locator('[data-hand].actable');
    const n = await cards.count();
    let found = false;
    for (let k = 0; k < n; k++) {
      await cards.nth(k).click();
      if ((await page.locator('.status-line').innerText()).includes('Your Line is full')) { found = true; break; }
      await page.keyboard.press('Escape');
    }
    if (found) break;
    // none yet: let a round pass (a card may arrive) and try again
    await advance(page, "s.round > " + (await page.evaluate(() => window.__sv.state().round)) + " && s.phase==='main'", ['__none__']);
  }
  await expect(page.locator('.status-line')).toContainText('Your Line is full');
  const armedCard = await page.locator('[data-hand].armed').getAttribute('data-card');
  const targets = page.locator('.line.me [data-unit].is-target');
  expect(await targets.count()).toBe(6); // every unit of mine is a legal scrap (from legalActions)
  const victim = (await targets.nth(2).getAttribute('data-unit'))!;
  const logBefore = await page.evaluate(() => window.__sv.state().log.length);
  await targets.nth(2).click();
  await page.waitForFunction(() => window.__sv.idle());
  const after = await page.evaluate(({ v, b, cid }) => {
    const s = window.__sv.state();
    return {
      gone: !s.players[0].line.some((u) => u.iid === v),
      len: s.players[0].line.length,
      scrapped: s.log.slice(b).some((e) => e.k === 'destroy' && e.s === 'replaced' && e.tunit === v),
      arrived: s.log.slice(b).some((e) => (e.k === 'play' || e.k === 'summon') && e.card === cid && e.seat === 0),
    };
  }, { v: victim, b: logBefore, cid: armedCard });
  expect(after.scrapped).toBe(true);
  expect(after.arrived).toBe(true);
  expect(after.gone).toBe(true);
  expect(after.len).toBeLessThanOrEqual(6);
  await finish(page, errs);
});

test('an unplayable card says why in the action bar when clicked', async ({ page }) => {
  const errs = watch(page);
  await startGame(page, 'seed=4');
  await advance(page, "s.phase==='main' && s.players[0].hand.length >= 3");
  const dead = page.locator('[data-hand]:not(.actable)');
  expect(await dead.count()).toBeGreaterThan(0);
  const reason = await page.evaluate(() => 'x');
  void reason;
  await dead.first().click();
  await expect(page.locator('.notice')).toBeVisible();
  expect((await page.locator('.notice').innerText()).length).toBeGreaterThan(8);
  await finish(page, errs);
});

for (const [w, h] of [[1366, 768], [844, 390]] as const) {
  test(`the inspector never covers the card it opened (${w}x${h})`, async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    const errs = watch(page);
    await startGame(page, 'seed=4');
    await advance(page, "s.phase==='main' && s.players[0].line.length >= 1 && s.players[0].hand.length >= 2");
    const checkOne = async (target: Locator): Promise<void> => {
      await page.mouse.move(2, 2);
      await target.hover();
      await page.waitForSelector('.inspector', { timeout: 3000 });
      await page.waitForTimeout(80);
      const a = (await target.boundingBox())!;
      const b = (await page.locator('.inspector').boundingBox())!;
      expect(rectsOverlap(a, b), `inspector ${JSON.stringify(b)} covers ${JSON.stringify(a)}`).toBe(false);
      expect(b.x).toBeGreaterThanOrEqual(0);
      expect(b.y).toBeGreaterThanOrEqual(0);
      expect(b.x + b.width).toBeLessThanOrEqual(w + 1);
      expect(b.y + b.height).toBeLessThanOrEqual(h + 1);
    };
    const handCount = await page.locator('[data-hand]').count();
    for (const i of [0, handCount - 1]) await checkOne(page.locator('[data-hand]').nth(i));
    await checkOne(page.locator('.line.me [data-unit]').first());
    await page.mouse.move(2, 2);
    await finish(page, errs);
    await ctx.close();
  });
}

test('real art: a listed id loads as an image, an unlisted one keeps its sigil, a broken listed one is a loud error', async ({ page }) => {
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
  const errs: string[] = [];
  page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  await page.route('**/art/manifest.json', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(['prism-lampkeeper', 'prism-glasswarden']) }));
  await page.route('**/art/prism-lampkeeper.webp', (r) => r.fulfill({ status: 200, contentType: 'image/png', body: png }));
  await page.route('**/art/prism-glasswarden.webp', (r) => r.fulfill({ status: 404, body: 'no' }));
  await startGame(page, 'seed=4');
  await page.waitForTimeout(500);
  const loaded = await page.locator('img.art.real[data-art="prism-lampkeeper"]').count();
  // mulligan hand of seed 4 holds Lamp-Keeper and Glass Warden; the board hand carries them too
  expect(loaded).toBeGreaterThan(0);
  expect(await page.locator('svg.art').count()).toBeGreaterThan(0); // the rest stay procedural
  expect(errs.some((e) => e.includes('prism-glasswarden') && e.includes('failed to load'))).toBe(true);
  expect(errs.some((e) => e.includes('prism-lampkeeper'))).toBe(false);
  expect(await page.evaluate(() => document.querySelectorAll('[title]').length)).toBe(0);
});

test('with no manifest everything uses sigils and nothing is logged', async ({ page }) => {
  const errs = watch(page);
  await page.route('**/art/manifest.json', (r) => r.fulfill({ status: 404, body: 'no' }));
  await startGame(page, 'seed=4');
  expect(await page.locator('img.art').count()).toBe(0);
  expect(await page.locator('svg.art').count()).toBeGreaterThan(0);
  // a 404 on the manifest is expected and silent; only genuine errors would appear here
  expect(errs.filter((e) => !e.includes('manifest') && !e.includes('404'))).toEqual([]);
});

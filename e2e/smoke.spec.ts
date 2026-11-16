import { chromium, expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

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

test('full game plays itself to the end screen', async ({ page }) => {
  const errs = watch(page);
  await page.goto(url('skiptitle=1&auto=1&bot=random&seed=11'));
  const start = Date.now();
  while (Date.now() - start < 58000) {
    const screen = await page.evaluate(() => document.getElementById('root')!.dataset.screen);
    const bad = await badText(page);
    expect(bad, 'bad text on screen').toBeNull();
    if (screen === 'end') break;
    await page.waitForTimeout(250);
  }
  await expect(page.locator('#root')).toHaveAttribute('data-screen', 'end', { timeout: 2000 });
  expect(await badText(page)).toBeNull();
  expect(errs).toEqual([]);
});

test('human path: title, new game, mulligan, play, pass', async ({ page }) => {
  const errs = watch(page);
  await page.goto(url('seed=3&bot=random'));
  await expect(page.locator('#root')).toHaveAttribute('data-screen', 'title');
  await page.click('[data-ui=new]');
  await expect(page.locator('#root')).toHaveAttribute('data-screen', 'setup');
  await page.click('[data-ui=start]');
  await expect(page.locator('#root')).toHaveAttribute('data-screen', 'mulligan');
  await page.click('[data-action=mulligan]');
  await expect(page.locator('#root')).toHaveAttribute('data-screen', 'board');
  // pass until a hand card is playable, then arm and play it
  let played = false;
  for (let i = 0; i < 60 && !played; i++) {
    await page.waitForFunction(() => window.__sv.idle() && window.__sv.state().priority === 0);
    await page.waitForTimeout(60);
    const card = page.locator('[data-hand].actable').first();
    if (await card.count()) {
      const before = await page.evaluate(() => window.__sv.state().players[0].hand.length);
      await card.click();
      await expect(page.locator('[data-hand].armed')).toHaveCount(1);
      const play = page.locator('[data-action=play]');
      if (await play.count()) await play.click();
      else {
        const t = page.locator('.is-target').first();
        if (!(await t.count())) { await page.keyboard.press('Escape'); await page.click('[data-action=pass]'); continue; }
        await t.click();
      }
      await page.waitForFunction((b) => window.__sv.state().players[0].hand.length < b || window.__sv.state().priority !== 0, before);
      played = true;
    } else {
      await page.click('[data-action=pass]');
    }
  }
  expect(played).toBe(true);
  await page.waitForFunction(() => window.__sv.idle());
  const pass = page.locator('[data-action=pass]');
  if (await pass.count()) await pass.click();
  await page.waitForFunction(() => window.__sv.idle());
  const feed = await page.locator('.feed-line').allInnerTexts();
  expect(feed.length).toBeGreaterThan(0);
  expect(feed[feed.length - 1].length).toBeGreaterThan(5);
  expect(errs).toEqual([]);
});

test('rule 24 and no scrollbars (844x390), rotate overlay in portrait', async ({ browser }) => {
  for (const [w, h] of [[844, 390], [1366, 768]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    const page = await ctx.newPage();
    await page.goto(url('skiptitle=1&seed=4&bot=random'));
    await page.click('[data-action=mulligan]');
    await expect(page.locator('#root')).toHaveAttribute('data-screen', 'board');
    expect(await page.evaluate(() => getComputedStyle(document.body).userSelect)).toBe('none');
    await page.locator('.status-line').first().click({ clickCount: 3 });
    expect(await page.evaluate(() => getSelection()!.toString())).toBe('');
    const m = await page.evaluate(() => ({
      sw: document.documentElement.scrollWidth, iw: innerWidth, sh: document.documentElement.scrollHeight, ih: innerHeight,
      boardOver: (() => { const b = document.querySelector('.board')!; return b.scrollHeight > b.clientHeight + 1 || b.scrollWidth > b.clientWidth + 1; })(),
    }));
    expect(m.sw).toBeLessThanOrEqual(m.iw);
    expect(m.sh).toBeLessThanOrEqual(m.ih);
    expect(m.boardOver).toBe(false);
    await ctx.close();
  }
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  await page.goto(url('skiptitle=1&seed=4'));
  await expect(page.locator('.rotate')).toBeVisible();
  await ctx.close();
});

test('no native tooltips on title or board', async ({ page }) => {
  await page.goto(url(''));
  expect(await page.locator('[title]').count()).toBe(0);
  expect(await page.locator('svg title').count()).toBe(0);
  await page.goto(url('skiptitle=1&seed=4&bot=random'));
  await page.click('[data-action=mulligan]');
  await expect(page.locator('#root')).toHaveAttribute('data-screen', 'board');
  expect(await page.locator('[title]').count()).toBe(0);
  expect(await page.locator('svg title').count()).toBe(0);
});

test('save: continue after reopening, and a corrupt save is explained', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'sv-'));
  const open = async () => {
    const ctx = await chromium.launchPersistentContext(dir, { viewport: { width: 1366, height: 768 } });
    return { ctx, page: ctx.pages()[0] ?? (await ctx.newPage()) };
  };
  let { ctx, page } = await open();
  await page.goto(url('skiptitle=1&seed=7&bot=random'));
  await page.click('[data-action=mulligan]');
  let done = 0;
  for (let i = 0; i < 3; i++) {
    await page.waitForFunction(() => window.__sv.idle() && window.__sv.state().priority === 0);
    const r = await page.evaluate(() => window.__sv.act({ type: 'pass' }));
    if (r.ok) done++;
  }
  expect(done).toBe(3);
  await page.waitForFunction(() => window.__sv.idle() && window.__sv.state().priority === 0);
  await page.waitForTimeout(200);
  const rec = await page.evaluate(() => { const s = window.__sv.state(); return { round: s.round, log: s.log.length, hand: s.players[0].hand.length }; });
  await ctx.close();
  ({ ctx, page } = await open());
  await page.goto(`${BASE}?speed=instant${dev}`);
  const cont = page.locator('[data-ui=continue]');
  await expect(cont).toContainText(`Round ${rec.round}`);
  await cont.click();
  await expect(page.locator('#root')).toHaveAttribute('data-screen', 'board');
  const now = await page.evaluate(() => { const s = window.__sv.state(); return { round: s.round, log: s.log.length, hand: s.players[0].hand.length }; });
  expect(now).toEqual(rec);
  // corrupt value
  await page.evaluate(() => localStorage.setItem('scrivenearth-save', '{not json'));
  await page.goto(`${BASE}?speed=instant${dev}`);
  await expect(page.locator('.note-box')).toContainText('unreadable');
  await page.click('[data-ui=discard]');
  await expect(page.locator('.note-box')).toHaveCount(0);
  await ctx.close();
});

// 50-client.md RULING 2026-11-15: a foldable's inner screen (near-square) gets a compact board with a phone-sized unit, never
// the wide board shrunk until its text is unreadable; spare height goes to the hand and the Lines, not only the battle row.
test('a foldable inner screen (900x640) keeps phone-sized text, no scrollbars, battle row under a third; portrait rotates', async ({ browser }) => {
  for (const [w, h, mode] of [[900, 640, 'short'], [1024, 768, 'short'], [1280, 720, 'wide']] as const) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    const page = await ctx.newPage();
    await page.goto(url('skiptitle=1&seed=4&bot=random'));
    await page.click('[data-action=mulligan]');
    await expect(page.locator('#root')).toHaveAttribute('data-screen', 'board');
    const m = await page.evaluate(() => ({
      mode: document.getElementById('root')!.dataset.mode, u: parseFloat(getComputedStyle(document.documentElement).fontSize),
      battle: document.querySelector('.a-battle')!.getBoundingClientRect().height, hand: document.querySelector('.hand-card')!.getBoundingClientRect().height,
      sw: document.documentElement.scrollWidth, iw: innerWidth, sh: document.documentElement.scrollHeight, ih: innerHeight,
      boardOver: (() => { const b = document.querySelector('.board')!; return b.scrollHeight > b.clientHeight + 1 || b.scrollWidth > b.clientWidth + 1; })(),
    }));
    expect(m.mode, `${w}x${h}`).toBe(mode);
    expect(m.u, `${w}x${h} unit`).toBeGreaterThanOrEqual(mode === 'wide' ? 9 : 10); // the wide board keeps 9 px and up; a compact board never under the phones' 10 px
    expect(m.battle, `${w}x${h} battle row`).toBeLessThan(h / 3);
    expect(m.hand, `${w}x${h} hand card`).toBeGreaterThanOrEqual(10 * 8.8); // at least the phone-landscape card
    expect(m.sw).toBeLessThanOrEqual(m.iw);
    expect(m.sh).toBeLessThanOrEqual(m.ih);
    expect(m.boardOver).toBe(false);
    await ctx.close();
  }
  const ctx = await browser.newContext({ viewport: { width: 640, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(url('skiptitle=1&seed=4'));
  await expect(page.locator('.rotate')).toBeVisible();
  await ctx.close();
});

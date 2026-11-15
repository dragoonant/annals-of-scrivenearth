import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

const BASE = `http://localhost:${process.env.PW_PORT ?? 5199}/`;
const url = (q = ''): string => `${BASE}?speed=instant&${q}`;

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

/** Follow the highlights with real clicks until the "You're ready" panel shows. Returns the step numbers seen. */
/** `each` runs before every click (so the second click of a two-click step is checked too). */
async function followHighlights(page: Page, each?: (step: number) => Promise<void>): Promise<number[]> {
  const seen: number[] = [];
  for (let guard = 0; guard < 200; guard++) {
    await page.waitForFunction(() => window.__sv.idle());
    await page.waitForTimeout(40);
    if (await page.locator('.tut-ready').count()) return seen;
    if (await page.locator('.tut-coach.waiting').count()) continue;
    const step = Number(await page.locator('.tut-coach').getAttribute('data-step'));
    if (!seen.includes(step)) seen.push(step);
    const hl = page.locator('.tut-hl').first();
    await expect(hl, `step ${step} has something highlighted`).toBeVisible();
    if (each) await each(step);
    await hl.click();
  }
  throw new Error(`the tutorial did not finish; seen steps ${seen.join(',')}`);
}

test('click through the whole tutorial following the highlights, to the You\'re ready panel', async ({ page }) => {
  const errs = watch(page);
  await page.goto(url('tutorial=1'));
  await expect(page.locator('#root')).toHaveAttribute('data-screen', 'board');
  await expect(page.locator('.tut-coach')).toBeVisible();
  const seen = await followHighlights(page, async () => {
    expect(await badText(page)).toBeNull();
  });
  expect(seen).toHaveLength(20);
  await expect(page.locator('.tut-ready')).toContainText("You're ready");
  await expect(page.locator('.tut-ready [data-ui=tut-new]')).toBeVisible();
  const st = await page.evaluate(() => ({ asc: window.__sv.state().players[0].ascended, over: window.__sv.state().phase, spire: window.__sv.state().players[1].spire }));
  expect(st.asc).toContain('storm-jax');
  expect(st.over).not.toBe('over');
  expect(st.spire).toBeLessThan(20);
  expect(await page.locator('[title]').count()).toBe(0);
  expect(await badText(page)).toBeNull();
  // New game leads to the real setup screen
  await page.click('[data-ui=tut-new]');
  await expect(page.locator('#root')).toHaveAttribute('data-screen', 'setup');
  expect(errs).toEqual([]);
});

test('a wrong click is answered with the coach\'s correction, and nothing changes', async ({ page }) => {
  const errs = watch(page);
  await page.goto(url('tutorial=1'));
  await expect(page.locator('.tut-coach')).toBeVisible();
  const before = await page.evaluate(() => JSON.stringify(window.__sv.state().players[0].hand));
  // another card in hand
  const jax = page.locator('[data-hand][data-card="storm-jax"]');
  await expect(jax).toHaveClass(/tut-dim/);
  await jax.click();
  await expect(page.locator('.tc-fix')).toContainText('Signal Kite');
  // the pass button is set aside too, and answers
  await page.click('.actionbar [data-action=pass]');
  await expect(page.locator('.tc-fix')).toContainText('Signal Kite');
  expect(await page.evaluate(() => JSON.stringify(window.__sv.state().players[0].hand))).toBe(before);
  expect(await page.evaluate(() => window.__sv.state().players[0].line.length)).toBe(0);
  // the engine path is gated too
  const r = await page.evaluate(() => window.__sv.act({ type: 'pass' }));
  expect(r.ok).toBe(false);
  expect(r.error).toContain('Signal Kite');
  // the right click still works afterwards
  await page.locator('[data-hand][data-card="storm-signalkite"]').click();
  await page.locator('.tut-hl').click();
  await expect(page.locator('.tut-coach[data-step="2"]')).toBeVisible();
  expect(errs).toEqual([]);
});

test('the coach never covers what it highlights, at 1366x768 and 844x390', async ({ browser }) => {
  for (const [w, h] of [[1366, 768], [844, 390]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    const page = await ctx.newPage();
    const errs = watch(page);
    await page.goto(url('tutorial=1'));
    await expect(page.locator('.tut-coach')).toBeVisible();
    const seen = await followHighlights(page, async (step) => {
      const boxes = await page.evaluate(() => {
        const c = document.querySelector('.tut-coach')!.getBoundingClientRect();
        const hl = [...document.querySelectorAll('.tut-hl')].map((e) => e.getBoundingClientRect());
        return { c: { l: c.left, t: c.top, r: c.right, b: c.bottom }, hl: hl.map((r) => ({ l: r.left, t: r.top, r: r.right, b: r.bottom })), vw: innerWidth, vh: innerHeight };
      });
      for (const r of boxes.hl) {
        const overlapW = Math.min(boxes.c.r, r.r) - Math.max(boxes.c.l, r.l);
        const overlapH = Math.min(boxes.c.b, r.b) - Math.max(boxes.c.t, r.t);
        expect(overlapW > 0 && overlapH > 0, `step ${step} at ${w}x${h}: the coach covers a highlighted control`).toBe(false);
      }
      expect(boxes.c.l).toBeGreaterThanOrEqual(0);
      expect(boxes.c.r).toBeLessThanOrEqual(boxes.vw);
      expect(boxes.c.b).toBeLessThanOrEqual(boxes.vh);
    });
    expect(seen).toHaveLength(20);
    const m = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: innerWidth, sh: document.documentElement.scrollHeight, ih: innerHeight }));
    expect(m.sw).toBeLessThanOrEqual(m.iw);
    expect(m.sh).toBeLessThanOrEqual(m.ih);
    expect(errs).toEqual([]);
    await ctx.close();
  }
});

test('the tutorial never touches the saved game; Skip tutorial leaves cleanly', async ({ page }) => {
  const errs = watch(page);
  // a real game with an autosave
  await page.goto(url('skiptitle=1&seed=5&bot=random'));
  await page.click('[data-action=mulligan]');
  await page.waitForFunction(() => window.__sv.idle() && window.__sv.state().priority === 0);
  await page.evaluate(() => window.__sv.act({ type: 'pass' }));
  await page.waitForFunction(() => window.__sv.idle());
  const save = await page.evaluate(() => localStorage.getItem('scrivenearth-save'));
  expect(save).not.toBeNull();
  // tutorial: play a few steps, then skip
  await page.goto(url('tutorial=1'));
  await expect(page.locator('.tut-coach')).toBeVisible();
  await page.locator('[data-hand][data-card="storm-signalkite"]').click();
  await page.locator('.tut-hl').click();
  await expect(page.locator('.tut-coach[data-step="2"]')).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('scrivenearth-save'))).toBe(save);
  await page.click('[data-ui=tut-skip]');
  await expect(page.locator('#root')).toHaveAttribute('data-screen', 'title');
  expect(await page.evaluate(() => localStorage.getItem('scrivenearth-save'))).toBe(save);
  await expect(page.locator('[data-ui=continue]')).toBeVisible();
  // and from the title button, with no save at all, the tutorial leaves no save behind
  await page.evaluate(() => localStorage.removeItem('scrivenearth-save'));
  await page.goto(url());
  await page.click('[data-ui=tutorial]');
  await expect(page.locator('#root')).toHaveAttribute('data-screen', 'board');
  await page.locator('[data-hand][data-card="storm-signalkite"]').click();
  await page.locator('.tut-hl').click();
  await expect(page.locator('.tut-coach[data-step="2"]')).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('scrivenearth-save'))).toBeNull();
  expect(errs).toEqual([]);
});

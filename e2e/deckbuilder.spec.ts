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

const screen = (page: Page) => page.locator('#root');
const countText = async (page: Page): Promise<number> => Number((await page.locator('.bd-n').innerText()).split('/')[0].trim());

test('build, save, reload, find it on New game, and play it', async ({ page }) => {
  const errs = watch(page);
  await page.goto(url());
  await page.click('[data-ui=builder]');
  await expect(screen(page)).toHaveAttribute('data-screen', 'builder');
  await expect(page.locator('.bd-tile')).toHaveCount(300);
  expect(await badText(page)).toBeNull();
  // Auto-fill from two factions
  await page.click('[data-ui=b-autofill]');
  await page.click('[data-ui=b-af-a][data-v=ember]');
  await page.click('[data-ui=b-af-b][data-v=storm]');
  await page.click('[data-ui=b-af-go]');
  expect(await countText(page)).toBe(40);
  await expect(page.locator('.bd-n')).toHaveClass(/legal/);
  // swap two cards by clicks: remove one copy of the first non-hero row, then add a different card
  const row = page.locator('.bd-row').nth(2);
  const removedId = (await row.getAttribute('data-card'))!;
  await row.click();
  expect(await countText(page)).toBe(39);
  await expect(page.locator('.bd-n')).not.toHaveClass(/legal/);
  await expect(page.locator('.bd-legal')).toContainText('exactly 40');
  const target = page.locator(`.bd-tile[data-id]:not(.blocked):not([data-id="${removedId}"])`).first();
  const addedId = (await target.getAttribute('data-id'))!;
  await target.click();
  expect(await countText(page)).toBe(40);
  await expect(page.locator('.bd-n')).toHaveClass(/legal/);
  await expect(page.locator('.bd-legal')).toContainText('Legal deck');
  // name, save
  await page.fill('.bd-name', 'Click-built deck');
  await expect(page.locator('[data-ui=b-save]')).toBeEnabled();
  await page.click('[data-ui=b-save]');
  await expect(page.locator('.bd-why')).toContainText('Saved "Click-built deck"');
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('scrivenearth-decks')!));
  expect(stored).toHaveLength(1);
  expect(stored[0].name).toBe('Click-built deck');
  expect(stored[0].cards).toHaveLength(40);
  expect(stored[0].cards).toContain(addedId);
  // reload: it is on the New game screen for both players
  await page.goto(url());
  await page.click('[data-ui=new]');
  await expect(page.locator('.deckcol').first().locator('.deck', { hasText: 'Click-built deck' })).toHaveCount(1);
  await expect(page.locator('.deckcol').nth(1).locator('.deck', { hasText: 'Click-built deck' })).toHaveCount(1);
  await page.locator('.deckcol').first().locator('.deck', { hasText: 'Click-built deck' }).click();
  await page.click('[data-ui=start]');
  await expect(screen(page)).toHaveAttribute('data-screen', 'mulligan');
  await page.click('[data-action=mulligan]');
  await expect(screen(page)).toHaveAttribute('data-screen', 'board');
  const deckNames = await page.evaluate(() => window.__sv.state().players[0].deckList.length);
  expect(deckNames).toBe(40);
  expect(await badText(page)).toBeNull();
  expect(errs).toEqual([]);
});

test('an illegal add shows its reason, in words, next to the collection', async ({ page }) => {
  const errs = watch(page);
  await page.goto(url());
  await page.click('[data-ui=builder]');
  const tile = page.locator('.bd-tile[data-id="storm-signalkite"]');
  await tile.click();
  await tile.click();
  await tile.click();
  await expect(tile.locator('.bd-copies')).toHaveText('3/3');
  await tile.click(); // the fourth copy
  await expect(page.locator('.bd-why')).toContainText('At most 3 copies');
  await expect(tile).toHaveClass(/blocked/);
  expect(await countText(page)).toBe(3);
  // hovering a card opens the inspector (the same one as everywhere else)
  await page.locator('.bd-tile[data-id="storm-jax"]').hover();
  await expect(page.locator('.inspector')).toBeVisible();
  await expect(page.locator('.inspector')).toContainText('Level condition');
  // a card from a third faction
  await page.locator('.bd-tile[data-id="ember-ashrunner"]').click();
  await page.locator('.bd-tile[data-id="prism-glasswarden"]').click();
  await expect(page.locator('.bd-why')).toContainText('at most 2 factions');
  expect(await countText(page)).toBe(4);
  expect(await badText(page)).toBeNull();
  expect(errs).toEqual([]);
});

test('import: a bad code shows its problem; a good code loads and is checked', async ({ page }) => {
  const errs = watch(page);
  await page.goto(url());
  await page.click('[data-ui=builder]');
  await page.click('[data-ui=b-import]');
  await page.fill('.bd-code', 'this is not a deck code');
  await page.click('[data-ui=b-import-go]');
  await expect(page.locator('.bd-dialog .bd-err')).toContainText('not a deck code');
  await page.fill('.bd-code', 'Bad|no-such-card*2');
  await page.click('[data-ui=b-import-go]');
  await expect(page.locator('.bd-dialog .bd-err')).toContainText('Unknown or invalid entry');
  await page.fill('.bd-code', 'Tiny|storm-jax*3,storm-signalkite*2');
  await page.click('[data-ui=b-import-go]');
  await expect(page.locator('.bd-dialog')).toHaveCount(0);
  expect(await countText(page)).toBe(5);
  await expect(page.locator('.bd-name')).toHaveValue('Tiny');
  await expect(page.locator('.bd-legal')).toContainText('exactly 40');
  // export shows a selectable code that round-trips
  await page.click('[data-ui=b-export]');
  const code = await page.locator('.bd-code').inputValue();
  expect(code).toMatch(/^Tiny\|/);
  expect(code).toContain('storm-jax*3');
  expect(await badText(page)).toBeNull();
  expect(errs).toEqual([]);
});

test('filters, overwrite and delete each ask once; Save is off while illegal; no scrollbars', async ({ browser }) => {
  for (const [w, h] of [[1366, 768], [844, 390]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    const page = await ctx.newPage();
    const errs = watch(page);
    await page.goto(url());
    await page.click('[data-ui=builder]');
    // filters narrow the list
    await page.click('[data-ui=b-faction][data-v=storm]');
    const stormOnly = await page.locator('.bd-tile').count();
    expect(stormOnly).toBeGreaterThan(5);
    expect(stormOnly).toBeLessThan(60);
    await page.click('[data-ui=b-type][data-v=hero]');
    const heroes = await page.locator('.bd-tile').count();
    expect(heroes).toBeGreaterThan(0);
    expect(heroes).toBeLessThan(stormOnly);
    await page.click('[data-ui=b-clear]');
    await expect(page.locator('.bd-tile')).toHaveCount(300);
    if (w < 900) await page.click('[data-ui=b-more]');
    await page.click('[data-ui=b-cost][data-v="1"]');
    const cost1 = await page.locator('.bd-tile').count();
    expect(cost1).toBeGreaterThan(5);
    await page.click('[data-ui=b-cost][data-v="1"]');
    await page.click('[data-ui=b-kw][data-v=ward]');
    expect(await page.locator('.bd-tile').count()).toBeGreaterThan(2);
    await page.click('[data-ui=b-kw][data-v=ward]');
    // the search box stays typeable and selectable
    await page.fill('.bd-search', 'draw');
    await page.locator('.bd-search').click({ clickCount: 3 });
    expect(await page.evaluate(() => (document.activeElement as HTMLInputElement).selectionEnd! - (document.activeElement as HTMLInputElement).selectionStart!)).toBeGreaterThan(0);
    const drawN = await page.locator('.bd-tile').count();
    expect(drawN).toBeGreaterThan(3);
    expect(drawN).toBeLessThan(300);
    await page.fill('.bd-search', 'zzzzqq');
    await expect(page.locator('.bd-grid .bd-empty')).toContainText('No card matches');
    await page.click('[data-ui=b-clear]');
    // Save is disabled while the deck is illegal, and says why
    await expect(page.locator('[data-ui=b-save]')).toBeDisabled();
    await expect(page.locator('.bd-note')).toContainText('Save becomes available');
    // build a legal deck, save it, then try to save another under the same name
    await page.click('[data-ui=b-autofill]');
    await page.click('[data-ui=b-af-a][data-v=prism]');
    await page.click('[data-ui=b-af-b][data-v=coil]');
    await page.click('[data-ui=b-af-go]');
    await page.fill('.bd-name', 'Twice');
    await page.click('[data-ui=b-save]');
    await expect(page.locator('.bd-why')).toContainText('Saved');
    await page.click('[data-ui=b-new]');
    expect(await countText(page)).toBe(0);
    await page.click('[data-ui=b-autofill]');
    await page.click('[data-ui=b-af-a][data-v=prism]');
    await page.click('[data-ui=b-af-b][data-v=coil]');
    await page.click('[data-ui=b-af-go]');
    await page.fill('.bd-name', 'Twice');
    await page.click('[data-ui=b-save]');
    await expect(page.locator('.bd-dialog')).toContainText('already exists');
    await page.click('[data-ui=b-confirm-yes]');
    await expect(page.locator('.bd-why')).toContainText('Saved');
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('scrivenearth-decks')!).length)).toBe(1);
    // delete asks once
    await page.click('[data-ui=b-delete]');
    await expect(page.locator('.bd-dialog')).toContainText('Delete the saved deck');
    await page.click('[data-ui=b-dlg-close]');
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('scrivenearth-decks')!).length)).toBe(1);
    await page.click('[data-ui=b-delete]');
    await page.click('[data-ui=b-confirm-yes]');
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('scrivenearth-decks')!).length)).toBe(0);
    // no page scrollbars; the panes scroll inside themselves
    const m = await page.evaluate(() => ({
      sw: document.documentElement.scrollWidth, iw: innerWidth, sh: document.documentElement.scrollHeight, ih: innerHeight,
      gridScrolls: (() => { const g = document.querySelector('.bd-grid') as HTMLElement; return g.scrollHeight > g.clientHeight; })(),
    }));
    expect(m.sw).toBeLessThanOrEqual(m.iw);
    expect(m.sh).toBeLessThanOrEqual(m.ih);
    expect(m.gridScrolls).toBe(true);
    expect(await page.locator('[title]').count()).toBe(0);
    expect(await badText(page)).toBeNull();
    expect(errs).toEqual([]);
    await ctx.close();
  }
});

test('a damaged saved-deck list is reported as a visible line, not dropped silently', async ({ page }) => {
  const errs = watch(page);
  await page.goto(url());
  await page.evaluate(() => localStorage.setItem('scrivenearth-decks', '{not json'));
  await page.goto(url());
  await page.click('[data-ui=new]');
  await expect(page.locator('.storage-line')).toContainText('unreadable');
  await page.click('[data-ui=back]');
  await page.click('[data-ui=builder]');
  await expect(page.locator('.bd-storage')).toContainText('unreadable');
  expect(errs).toEqual([]);
});

test('end screen: winner, reason, heroes, totals, and a bug report download', async ({ page }) => {
  const errs = watch(page);
  await page.goto(url('skiptitle=1&seed=21&bot=random'));
  await page.click('[data-action=mulligan]');
  await page.waitForFunction(() => window.__sv.idle() && window.__sv.state().priority === 0);
  await page.evaluate(() => window.__sv.act({ type: 'pass' }));
  await page.waitForFunction(() => window.__sv.idle() && window.__sv.state().priority === 0);
  await page.evaluate(() => window.__sv.act({ type: 'concede' }));
  await expect(screen(page)).toHaveAttribute('data-screen', 'end');
  await expect(page.locator('.end-head')).toHaveText('Defeat');
  await expect(page.locator('.end-who')).toContainText('You conceded');
  await expect(page.locator('.end-why')).toContainText('conceded');
  await expect(page.locator('.end-rounds')).toContainText('round');
  await expect(page.locator('.end-col')).toHaveCount(2);
  expect(await page.locator('.end-col').first().locator('.row').count()).toBeGreaterThan(0);
  await expect(page.locator('.end-col').first()).toContainText('Damage to the enemy Spire');
  await expect(page.locator('.end-col').first()).toContainText('Enemy units destroyed');
  await expect(page.locator('.end-col').first()).toContainText('Glyphs cast');
  expect(await badText(page)).toBeNull();
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-ui=bugreport]')]);
  expect(dl.suggestedFilename()).toMatch(/^scrivenearth-bug-21-\d+\.json$/);
  const path = await dl.path();
  const { readFileSync } = await import('node:fs');
  const rep = JSON.parse(readFileSync(path!, 'utf8'));
  expect(rep.seed).toBe(21);
  expect(rep.setup.decks).toHaveLength(2);
  expect(Array.isArray(rep.actions)).toBe(true);
  expect(rep.actions.at(-1)).toEqual({ type: 'concede' });
  expect(rep.save.snapshot.phase).toBe('over');
  expect(rep.save.game).toBe('annals-of-scrivenearth');
  expect(typeof rep.userAgent).toBe('string');
  expect(rep.userAgent.length).toBeGreaterThan(5);
  expect(errs).toEqual([]);
});

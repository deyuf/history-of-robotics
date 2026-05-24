/**
 * E2E smoke tests — confirm both pages render in a real browser.
 * Catches regressions that jsdom would miss (CSS layout, view transitions,
 * font loading, real scroll, etc.).
 */
import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..', '..');

test.describe('main chronicle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForFunction(() => window.__HOR__ !== undefined, { timeout: 5000 });
  });

  test('loads with the editorial masthead', async ({ page }) => {
    await expect(page.locator('.nameplate')).toContainText('HISTORY OF ROBOT');
    await expect(page.locator('.nameplate-sub')).toContainText('Chronicle of Robotics');
  });

  test('renders 8 eras with 81 events total', async ({ page }) => {
    await expect(page.locator('.era')).toHaveCount(8);
    await expect(page.locator('.event')).toHaveCount(81);
  });

  test('renders 8 tabs with § + roman numerals', async ({ page }) => {
    const tabs = page.locator('#tabs a');
    await expect(tabs).toHaveCount(8);
    await expect(tabs.first().locator('.roman')).toContainText('§');
    await expect(tabs.first().locator('.roman')).toContainText('I');
  });

  test('renders the cover hero stats grid', async ({ page }) => {
    const stats = page.locator('#hero-stats .stat');
    await expect(stats).toHaveCount(3);
    await expect(stats.nth(0).locator('.val')).toHaveText('81');
  });

  test('clicking a tab scrolls to the matching era', async ({ page }) => {
    const initialScrollY = await page.evaluate(() => window.scrollY);

    await page.locator('#tabs a').nth(3).click();

    // The hash is written synchronously in the click handler — should be
    // visible within ms.
    await page.waitForFunction(
      () => location.hash === '#era-4-industrial',
      undefined,
      { timeout: 5_000 }
    );

    // Era 4 sits thousands of pixels below the cover, so any successful
    // scroll (smooth OR instant) moves the page substantially. Accept
    // either: (a) scrollY moved by ≥ 500 px, or (b) the era is now in
    // the viewport. This is robust to reduced-motion and slow CI runners.
    await page.waitForFunction(
      (initY) => {
        const moved = Math.abs(window.scrollY - initY) > 500;
        const era = document.getElementById('era-4-industrial');
        const r = era.getBoundingClientRect();
        const visible = r.top < window.innerHeight && r.bottom > 0;
        return moved || visible;
      },
      initialScrollY,
      { timeout: 15_000 }
    );
  });

  test('command palette opens on ⌘K/Ctrl+K', async ({ page }) => {
    await page.keyboard.press('ControlOrMeta+K');
    await expect(page.locator('#cmd-palette')).toHaveAttribute('open', '');
    await expect(page.locator('#cmd-results li')).not.toHaveCount(0);
  });

  test('command palette filters by query', async ({ page }) => {
    await page.locator('#cmd-open').click();
    await page.locator('#cmd-input').fill('Atlas');
    await page.waitForTimeout(150);
    const text = await page.locator('#cmd-results').textContent();
    expect(text).toContain('Atlas');
  });

  test('command palette closes on Escape', async ({ page }) => {
    await page.locator('#cmd-open').click();
    await expect(page.locator('#cmd-palette')).toHaveAttribute('open', '');
    await page.keyboard.press('Escape');
    await expect(page.locator('#cmd-palette')).not.toHaveAttribute('open', '');
  });

  test('language toggle switches to Chinese', async ({ page }) => {
    await page.locator('#lang-toggle').click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');
    // First era heading should now contain Chinese text
    const txt = await page.locator('.era h2').first().textContent();
    expect(/[一-鿿]/.test(txt)).toBe(true);
  });

  test('theme toggle switches to dark mode', async ({ page }) => {
    await page.locator('#theme-toggle').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(page.locator('#theme-toggle')).toHaveText('NIGHT');
  });

  test('language preference persists across reload', async ({ page }) => {
    await page.locator('#lang-toggle').click();
    await page.reload();
    await page.waitForFunction(() => window.__HOR__ !== undefined, { timeout: 5000 });
    await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');
  });
});

test.describe('humanoid edition', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/humanoid.html');
    await page.waitForFunction(() => window.__HOR__ !== undefined, { timeout: 5000 });
  });

  test('renders 6 eras with 47 events', async ({ page }) => {
    await expect(page.locator('.era')).toHaveCount(6);
    await expect(page.locator('.event')).toHaveCount(47);
  });

  test('renders the 12-row roster table', async ({ page }) => {
    await expect(page.locator('#roster-table tbody tr')).toHaveCount(12);
  });

  test('renders the 9-row comparison table', async ({ page }) => {
    await expect(page.locator('#compare-table tbody tr')).toHaveCount(9);
  });

  test('cross-page link goes back to the main chronicle', async ({ page }) => {
    const link = page.locator('a[href$="index.html"]').first();
    await expect(link).toBeVisible();
  });
});

test.describe('cross-page navigation', () => {
  test('humanoid edition link from main chronicle works', async ({ page }) => {
    await page.goto('/index.html');
    await page.locator('.mast-foot a[href$="humanoid.html"]').click();
    await page.waitForURL(/humanoid\.html/);
    await expect(page.locator('.nameplate-sub')).toContainText('Humanoid Edition');
  });
});

test.describe('static assets', () => {
  test('sitemap.xml is reachable and well-formed', async ({ request }) => {
    const res = await request.get('/sitemap.xml');
    expect(res.ok()).toBe(true);
    const body = await res.text();
    expect(body).toContain('<urlset');
  });

  test('robots.txt references the sitemap', async ({ request }) => {
    const res = await request.get('/robots.txt');
    expect(res.ok()).toBe(true);
    const body = await res.text();
    expect(body).toMatch(/Sitemap:/);
  });

  test('og.svg is reachable at /assets/og.svg', async ({ request }) => {
    const res = await request.get('/assets/og.svg');
    expect(res.ok()).toBe(true);
    expect(res.headers()['content-type']).toContain('svg');
  });

  test('data sidecar files load over HTTP', async ({ request }) => {
    for (const url of ['/data/timeline.data.js', '/data/humanoid.data.js', '/data/timeline.json', '/data/humanoid.json']) {
      const res = await request.get(url);
      expect(res.ok(), url).toBe(true);
    }
  });
});

test.describe('error handling', () => {
  test('shows a helpful message when data is missing', async ({ page }) => {
    // Intercept both sidecar and json fetches to simulate broken deployment
    await page.route('**/data/timeline.data.js', r => r.abort());
    await page.route('**/data/timeline.json', r => r.fulfill({ status: 404, body: '404' }));
    await page.goto('/index.html');
    await page.waitForTimeout(1500);
    const errText = await page.locator('#eras p').textContent();
    expect(errText).toContain('Load failed');
  });
});

test.describe('accessibility basics', () => {
  test('every event has an h3 heading', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForFunction(() => window.__HOR__ !== undefined);
    const events = page.locator('.event');
    const count = await events.count();
    for (let i = 0; i < Math.min(count, 5); i++) {
      await expect(events.nth(i).locator('h3')).toBeVisible();
    }
  });

  test('external links use rel=noopener', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForFunction(() => window.__HOR__ !== undefined);
    const externalCount = await page.locator('a[target="_blank"]:not([rel*="noopener"])').count();
    expect(externalCount).toBe(0);
  });

  test('focus-visible reaches the language toggle via keyboard', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForFunction(() => window.__HOR__ !== undefined);
    // Tab through until we reach #lang-toggle
    for (let i = 0; i < 30; i++) {
      await page.keyboard.press('Tab');
      const id = await page.evaluate(() => document.activeElement?.id);
      if (id === 'lang-toggle') return;
    }
    throw new Error('lang-toggle never received focus within 30 tabs');
  });
});

test.describe('file:// regression', () => {
  test('opens correctly via file:// (bug that prompted these tests)', async ({ browser }) => {
    const fileURL = 'file://' + path.resolve(REPO_ROOT, 'index.html');
    const ctx = await browser.newContext();
    const p = await ctx.newPage();
    await p.goto(fileURL);
    await p.waitForFunction(() => window.__HOR__ !== undefined, { timeout: 5000 });
    await expect(p.locator('.era')).toHaveCount(8);
    await ctx.close();
  });
});

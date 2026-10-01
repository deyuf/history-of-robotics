import { test, expect } from '@playwright/test';

test('shared search URLs open results and navigate to a specific event', async ({ page }) => {
  await page.goto('/?q=Unimate');
  await expect(page.locator('#cmd-palette')).toHaveAttribute('open', '');
  await expect(page.locator('#cmd-input')).toHaveValue('Unimate');
  await expect(page.locator('#cmd-results')).toContainText('Unimate Joins');
  await page.locator('#cmd-input').press('Enter');
  await expect.poll(() => page.evaluate(() => document.getElementById(location.hash.slice(1))?.className)).toBe('event');
  await expect(page).not.toHaveURL(/[?&]q=/);
  const hash = await page.evaluate(() => location.hash);
  await page.reload();
  await expect(page.locator(hash)).toBeInViewport();
});

test('search finds the other edition and navigates to its exact event', async ({ page }) => {
  await page.goto('/?q=WABOT');
  const result = page.locator('#cmd-results li').filter({ hasText: 'Humanoid edition' }).first();
  await expect(result).toBeVisible();
  await result.click();
  await expect(page).toHaveURL(/humanoid\.html\?lang=en#/);
  await expect.poll(() => page.evaluate(() => document.getElementById(location.hash.slice(1))?.className)).toBe('event');
  const ids = await page.locator('.event').evaluateAll(events => events.map(event => event.id));
  expect(new Set(ids).size).toBe(ids.length);
});

test('URL language overrides preferences and searches both languages', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.setItem('hor-lang', 'en'));
  await page.goto('/?lang=zh');
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');
  await page.goto('/?lang=en&q=机器人');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('#cmd-results .cmd-empty')).toHaveCount(0);
  await expect(page.locator('#cmd-results li').first()).toBeVisible();
});

test('project navigation exposes the other sites and correct source repository', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.mast-foot a[href="https://me.deyuf.org/"]')).toBeVisible();
  await expect(page.locator('.mast-foot a[href="https://urdf.deyuf.org/"]')).toBeVisible();
  await expect(page.locator('.mast-foot a[href="https://github.com/deyuf/history-of-robotics"]')).toBeVisible();
});

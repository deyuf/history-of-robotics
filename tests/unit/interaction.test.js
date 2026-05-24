/**
 * Interaction tests — language toggle, theme toggle, command palette.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mountPage, DATA_TIMELINE } from '../setup.js';

describe('language toggle', () => {
  beforeEach(() => mountPage('main'));

  it('starts in English by default', () => {
    expect(window.__HOR__.state.lang).toBe('en');
    expect(document.documentElement.lang).toBe('en');
  });

  it('clicking the toggle switches to Chinese and rerenders', () => {
    const btn = document.getElementById('lang-toggle');
    btn.click();
    expect(window.__HOR__.state.lang).toBe('zh');
    expect(document.documentElement.lang).toBe('zh-CN');
    expect(document.documentElement.getAttribute('data-lang')).toBe('zh');
    // First era's heading should now be the zh title
    const firstH2 = document.querySelector('.era h2');
    expect(firstH2.textContent).toBe(DATA_TIMELINE.eras[0].title);
  });

  it('toggling twice returns to English', () => {
    const btn = document.getElementById('lang-toggle');
    btn.click();
    btn.click();
    expect(window.__HOR__.state.lang).toBe('en');
    const firstH2 = document.querySelector('.era h2');
    expect(firstH2.textContent).toBe(DATA_TIMELINE.eras[0].titleEn);
  });

  it('persists language choice to localStorage', () => {
    const btn = document.getElementById('lang-toggle');
    btn.click();
    expect(localStorage.getItem('hor-lang')).toBe('zh');
  });

  it('button label reflects the target language', () => {
    const btn = document.getElementById('lang-toggle');
    expect(btn.textContent.trim()).toContain('EN');
    btn.click();
    expect(btn.textContent.trim()).toContain('中文');
  });
});

describe('theme toggle', () => {
  beforeEach(() => mountPage('main'));

  it('starts in light mode by default', () => {
    expect(document.documentElement.dataset.theme).toBeFalsy();
    const btn = document.getElementById('theme-toggle');
    expect(btn.textContent).toBe('DAY');
  });

  it('clicking the toggle switches to dark mode', () => {
    const btn = document.getElementById('theme-toggle');
    btn.click();
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(btn.textContent).toBe('NIGHT');
  });

  it('persists theme to localStorage', () => {
    document.getElementById('theme-toggle').click();
    expect(localStorage.getItem('hor-theme')).toBe('dark');
  });

  it('toggling twice returns to light', () => {
    const btn = document.getElementById('theme-toggle');
    btn.click(); btn.click();
    expect(document.documentElement.dataset.theme).toBeFalsy();
    expect(btn.textContent).toBe('DAY');
  });
});

describe('command palette (⌘K)', () => {
  beforeEach(() => mountPage('main'));

  it('clicking ARCHIVE button opens the dialog', () => {
    const dlg = document.getElementById('cmd-palette');
    expect(dlg.hasAttribute('open')).toBe(false);
    document.getElementById('cmd-open').click();
    expect(dlg.hasAttribute('open')).toBe(true);
  });

  it('shows a default result list on open', () => {
    document.getElementById('cmd-open').click();
    const results = document.querySelectorAll('#cmd-results li');
    expect(results.length).toBeGreaterThan(5);
  });

  it('filters results when typing a query', () => {
    document.getElementById('cmd-open').click();
    const input = document.getElementById('cmd-input');
    input.value = 'ASIMO';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    const results = document.querySelectorAll('#cmd-results li');
    expect(results.length).toBeGreaterThan(0);
    // At least one result must mention ASIMO
    const text = Array.from(results).map(li => li.textContent).join(' ');
    expect(text).toContain('ASIMO');
  });

  it('shows empty state for nonsense query', () => {
    document.getElementById('cmd-open').click();
    const input = document.getElementById('cmd-input');
    input.value = 'zzzzzzzqqqqq';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    const empty = document.querySelector('#cmd-results .cmd-empty');
    expect(empty).toBeTruthy();
  });

  it('Ctrl+K opens the palette', () => {
    const dlg = document.getElementById('cmd-palette');
    expect(dlg.hasAttribute('open')).toBe(false);
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }));
    expect(dlg.hasAttribute('open')).toBe(true);
  });

  it('arrow keys move the selection cursor', () => {
    document.getElementById('cmd-open').click();
    const input = document.getElementById('cmd-input');
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    const selected = document.querySelector('#cmd-results [aria-selected="true"]');
    expect(selected).toBeTruthy();
    expect(selected.getAttribute('data-idx')).toBe('1');
  });

  it('result count is displayed', () => {
    document.getElementById('cmd-open').click();
    const meta = document.getElementById('cmd-count').textContent;
    expect(meta).toMatch(/\d+/);
  });
});

describe('command palette index covers all content kinds', () => {
  beforeEach(() => mountPage('humanoid'));

  it('indexes era, event, person and roster entries', () => {
    document.getElementById('cmd-open').click();
    const input = document.getElementById('cmd-input');

    input.value = 'optimus';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    const results = Array.from(document.querySelectorAll('#cmd-results li'));
    // Optimus should appear as both a roster entry and event mentions
    expect(results.length).toBeGreaterThan(0);
    const text = results.map(r => r.textContent).join(' ').toLowerCase();
    expect(text).toContain('optimus');
  });
});

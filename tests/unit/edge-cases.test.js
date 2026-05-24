/**
 * Edge-case tests — error paths, view-transition fallback, scroll behaviour,
 * inline data, smooth-scroll handlers. Pushes branch coverage above 80%.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mountPage, DATA_TIMELINE, DATA_HUMANOID, HTML_INDEX } from '../setup.js';

describe('boot — error handling', () => {
  it('shows a helpful error when neither global nor fetch is available', async () => {
    // Apply HTML manually without seeding __HOR_DATA__
    const dom = new DOMParser().parseFromString(HTML_INDEX, 'text/html');
    document.documentElement.innerHTML = dom.documentElement.innerHTML;
    const bodyAttrs = HTML_INDEX.match(/<body([^>]*)>/);
    if (bodyAttrs) {
      const re = /(\w[\w-]*)\s*=\s*"([^"]*)"/g;
      let m;
      while ((m = re.exec(bodyAttrs[1])) !== null) {
        document.body.setAttribute(m[1], m[2]);
      }
    }
    // No __HOR_DATA__; jsdom has no fetch — boot's catch should fire
    HTMLDialogElement.prototype.showModal ||= function () { this.setAttribute('open', ''); };
    HTMLDialogElement.prototype.close     ||= function () { this.removeAttribute('open'); };
    window.matchMedia ||= () => ({ matches: false, addEventListener:()=>{}, removeEventListener:()=>{} });
    window.IntersectionObserver ||= class { observe(){} unobserve(){} disconnect(){} };
    window.fetch = undefined;

    vi.resetModules();
    await import('../../app.js?t=err1=' + Date.now());
    await new Promise(r => setTimeout(r, 20));

    const erasErr = document.querySelector('#eras p[style*="negative"]');
    expect(erasErr).toBeTruthy();
    expect(erasErr.textContent.toLowerCase()).toMatch(/load failed|fetch|http/);
  });

  it('falls back to inline <script type=application/json id=hor-data> when no global', async () => {
    const dom = new DOMParser().parseFromString(HTML_INDEX, 'text/html');
    document.documentElement.innerHTML = dom.documentElement.innerHTML;
    const bodyAttrs = HTML_INDEX.match(/<body([^>]*)>/);
    if (bodyAttrs) {
      const re = /(\w[\w-]*)\s*=\s*"([^"]*)"/g;
      let m;
      while ((m = re.exec(bodyAttrs[1])) !== null) {
        document.body.setAttribute(m[1], m[2]);
      }
    }
    HTMLDialogElement.prototype.showModal ||= function () { this.setAttribute('open', ''); };
    HTMLDialogElement.prototype.close     ||= function () { this.removeAttribute('open'); };
    window.matchMedia ||= () => ({ matches: false, addEventListener:()=>{}, removeEventListener:()=>{} });
    window.IntersectionObserver ||= class { observe(){} unobserve(){} disconnect(){} };

    // Inject inline JSON
    const inline = document.createElement('script');
    inline.type = 'application/json';
    inline.id = 'hor-data';
    inline.textContent = JSON.stringify(DATA_TIMELINE);
    document.head.appendChild(inline);
    delete window.__HOR_DATA__;

    vi.resetModules();
    await import('../../app.js?t=inline=' + Date.now());
    await new Promise(r => setTimeout(r, 20));

    expect(document.querySelectorAll('.era').length).toBe(8);
  });
});

describe('view transition fallback', () => {
  beforeEach(() => mountPage('main'));

  it('lang-toggle works whether or not document.startViewTransition exists', () => {
    // Even without startViewTransition (jsdom), toggle still works
    expect(document.startViewTransition).toBeUndefined();
    document.getElementById('lang-toggle').click();
    expect(window.__HOR__.state.lang).toBe('zh');
  });

  it('theme-toggle works whether or not document.startViewTransition exists', () => {
    document.getElementById('theme-toggle').click();
    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it('uses document.startViewTransition when available', () => {
    const calls = [];
    document.startViewTransition = (cb) => {
      calls.push('vt');
      cb();
      return { finished: Promise.resolve() };
    };
    document.getElementById('lang-toggle').click();
    expect(calls).toEqual(['vt']);
    delete document.startViewTransition;
  });
});

describe('hash-link smooth scroll', () => {
  beforeEach(() => mountPage('main'));

  it('clicking an in-page anchor calls scrollIntoView and updates history', () => {
    const scrolls = [];
    Element.prototype.scrollIntoView = vi.fn(function () { scrolls.push(this.id); });

    // Click the second tab (anchor)
    const link = document.querySelectorAll('#tabs a')[1];
    const oldHash = location.hash;
    link.click();
    expect(scrolls.length).toBeGreaterThan(0);
    // history updated
    expect(location.hash).toBe(link.getAttribute('href'));
  });

  it('ignores external links (different host)', () => {
    const scrolls = [];
    Element.prototype.scrollIntoView = vi.fn(function () { scrolls.push(1); });
    const external = document.createElement('a');
    external.href = 'https://example.com';
    external.textContent = 'ext';
    document.body.appendChild(external);
    external.click();
    expect(scrolls.length).toBe(0);
  });
});

describe('chart rendering details', () => {
  beforeEach(() => mountPage('main'));

  it('industrial chart contains a data-line path', () => {
    const path = document.querySelector('#chart-industrial path[d]');
    expect(path).toBeTruthy();
    expect(path.getAttribute('d').length).toBeGreaterThan(50);
  });

  it('funding chart contains rectangles for every funding round', () => {
    const rects = document.querySelectorAll('#chart-funding rect');
    expect(rects.length).toBeGreaterThanOrEqual(DATA_TIMELINE.stats.humanoidFunding.data.length);
  });

  it('charts include data-source attribution', () => {
    const sources = document.querySelectorAll('.chart-source a');
    expect(sources.length).toBeGreaterThanOrEqual(2);
    sources.forEach(a => expect(a.href).toMatch(/^https?:\/\//));
  });
});

describe('lang persistence', () => {
  it('loads from localStorage on subsequent mount', async () => {
    localStorage.setItem('hor-lang', 'zh');
    document.documentElement.setAttribute('data-lang', 'zh');
    await mountPage('main');
    expect(window.__HOR__.state.lang).toBe('zh');
    const firstH2 = document.querySelector('.era h2');
    expect(firstH2.textContent).toBe(DATA_TIMELINE.eras[0].title);
  });
});

describe('command palette — selection wraparound', () => {
  beforeEach(() => mountPage('main'));

  it('selection clamps to result list length', () => {
    document.getElementById('cmd-open').click();
    const input = document.getElementById('cmd-input');
    // Press ArrowDown many times — should clamp, not exceed
    for (let i = 0; i < 50; i++) {
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    }
    const selected = document.querySelector('#cmd-results [aria-selected="true"]');
    const idx = +selected.dataset.idx;
    const total = document.querySelectorAll('#cmd-results li').length;
    expect(idx).toBeLessThan(total);
  });

  it('ArrowUp moves selection up', () => {
    document.getElementById('cmd-open').click();
    const input = document.getElementById('cmd-input');
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    const selected = document.querySelector('#cmd-results [aria-selected="true"]');
    expect(+selected.dataset.idx).toBe(1);
  });

  it('Enter activates the selected result and scrolls to its target', () => {
    const scrolls = [];
    Element.prototype.scrollIntoView = function () { scrolls.push(this.id); };
    document.getElementById('cmd-open').click();
    const input = document.getElementById('cmd-input');
    input.value = 'Unimate';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(scrolls.length).toBeGreaterThan(0);
  });

  it('clicking a result list item activates it', () => {
    const scrolls = [];
    Element.prototype.scrollIntoView = function () { scrolls.push(this.id); };
    document.getElementById('cmd-open').click();
    const li = document.querySelectorAll('#cmd-results li')[0];
    li.click();
    expect(scrolls.length).toBeGreaterThan(0);
  });

  it('clicking outside the dialog content closes it', () => {
    document.getElementById('cmd-open').click();
    const dlg = document.getElementById('cmd-palette');
    expect(dlg.hasAttribute('open')).toBe(true);
    dlg.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(dlg.hasAttribute('open')).toBe(false);
  });

  it('/ keyboard shortcut opens the palette when no input is focused', () => {
    expect(document.getElementById('cmd-palette').hasAttribute('open')).toBe(false);
    window.dispatchEvent(new KeyboardEvent('keydown', { key: '/', bubbles: true }));
    expect(document.getElementById('cmd-palette').hasAttribute('open')).toBe(true);
  });
});

describe('humanoid — extra coverage', () => {
  beforeEach(() => mountPage('humanoid'));

  it('switching language re-renders roster headers', () => {
    document.getElementById('lang-toggle').click();
    const ths = document.querySelectorAll('#roster-table thead th');
    // First header should be 中文 (机型)
    expect(ths[0].textContent).toMatch(/[一-鿿]/);
  });

  it('compare table first column is the metric label', () => {
    const firstCell = document.querySelector('#compare-table tbody tr td');
    expect(firstCell.textContent.length).toBeGreaterThan(0);
  });
});

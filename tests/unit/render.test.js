/**
 * Rendering tests — boot app.js in jsdom and verify the rendered DOM
 * matches the data. Exercises most code paths in app.js.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { mountPage, DATA_TIMELINE, DATA_HUMANOID } from '../setup.js';

describe('index.html — main chronicle rendering', () => {
  beforeEach(() => mountPage('main'));

  it('boots and exposes __HOR__ hook', () => {
    expect(window.__HOR__).toBeTruthy();
    expect(window.__HOR__.state.data).toBeTruthy();
    expect(window.__HOR__.state.lang).toBe('en');
  });

  it('renders all 8 era sections', () => {
    const eras = document.querySelectorAll('.era');
    expect(eras.length).toBe(8);
    // Each must have an h2
    eras.forEach((era, i) => {
      const h2 = era.querySelector('h2');
      expect(h2.textContent).toBeTruthy();
      expect(era.id).toBe(DATA_TIMELINE.eras[i].id);
    });
  });

  it('renders all 81 events with year + title + at least one source', () => {
    const events = document.querySelectorAll('.event');
    expect(events.length).toBe(81);
    events.forEach(ev => {
      expect(ev.querySelector('.event-year').textContent).toBeTruthy();
      expect(ev.querySelector('h3').textContent).toBeTruthy();
      const sources = ev.querySelectorAll('.event-sources a');
      expect(sources.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('renders 8 navigation tabs with § + roman numerals', () => {
    const tabs = document.querySelectorAll('#tabs a');
    expect(tabs.length).toBe(8);
    const romans = ['I','II','III','IV','V','VI','VII','VIII'];
    tabs.forEach((tab, i) => {
      expect(tab.querySelector('.roman').textContent).toContain(romans[i]);
      expect(tab.getAttribute('href')).toBe('#' + DATA_TIMELINE.eras[i].id);
    });
  });

  it('renders the era index grid (8 entries)', () => {
    const idx = document.querySelectorAll('#era-index a');
    expect(idx.length).toBe(8);
  });

  it('renders 6 people cards', () => {
    const cards = document.querySelectorAll('.person');
    expect(cards.length).toBe(6);
    cards.forEach(c => {
      expect(c.querySelector('.name').textContent).toBeTruthy();
      expect(c.querySelector('.role').textContent).toBeTruthy();
      expect(c.querySelector('.quote').textContent).toBeTruthy();
    });
  });

  it('renders the cover hero with title, lede and 3-stat grid', () => {
    expect(document.getElementById('hero-title').innerHTML.length).toBeGreaterThan(20);
    expect(document.getElementById('hero-lede').textContent.length).toBeGreaterThan(40);
    const stats = document.querySelectorAll('#hero-stats .stat');
    expect(stats.length).toBe(3);
    expect(stats[0].querySelector('.val').textContent).toBe('81');
  });

  it('renders two SVG charts in the data section', () => {
    const charts = document.querySelectorAll('#data svg');
    expect(charts.length).toBe(2);
    // Both must contain text labels
    charts.forEach(c => {
      expect(c.querySelectorAll('text').length).toBeGreaterThan(3);
    });
  });

  it('image figures use the Wikimedia Special:FilePath URL pattern', () => {
    const imgs = document.querySelectorAll('.event-img img');
    expect(imgs.length).toBeGreaterThan(5);
    imgs.forEach(img => {
      expect(img.src).toContain('commons.wikimedia.org/wiki/Special:FilePath/');
    });
  });

  it('event sources are external links with rel=noopener', () => {
    const links = document.querySelectorAll('.event-sources a');
    expect(links.length).toBeGreaterThan(100);
    links.forEach(a => {
      expect(a.target).toBe('_blank');
      expect(a.rel).toContain('noopener');
      expect(a.href).toMatch(/^https?:\/\//);
    });
  });

  it('renders footer left + right blocks', () => {
    expect(document.getElementById('footer-left').textContent).toContain('CC BY 4.0');
    expect(document.getElementById('footer-right').textContent).toContain('historyofmarket');
  });
});

describe('humanoid.html — sister page rendering', () => {
  beforeEach(() => mountPage('humanoid'));

  it('renders 6 era sections', () => {
    expect(document.querySelectorAll('.era').length).toBe(6);
  });

  it('renders all 47 humanoid events', () => {
    expect(document.querySelectorAll('.event').length).toBe(47);
  });

  it('renders the roster table with 12 rows', () => {
    const rows = document.querySelectorAll('#roster-table tbody tr');
    expect(rows.length).toBe(12);
    // Each row has 9 cells (Robot, Year, Origin, Height, Weight, DOF, Payload, Drive, Status)
    rows.forEach(r => expect(r.children.length).toBe(9));
  });

  it('renders the comparison table with 9 metric rows', () => {
    const rows = document.querySelectorAll('#compare-table tbody tr');
    expect(rows.length).toBe(9);
    rows.forEach(r => expect(r.children.length).toBe(7)); // 1 label + 6 models
  });

  it('roster names link to their primary source', () => {
    const links = document.querySelectorAll('#roster-table tbody td.name a');
    expect(links.length).toBe(12);
    links.forEach(a => expect(a.href).toMatch(/^https?:\/\//));
  });

  it('cross-page link in the cover body points to the main chronicle', () => {
    const body = document.getElementById('hero-body');
    const link = body.querySelector('a[href$="index.html"]');
    expect(link).toBeTruthy();
  });
});

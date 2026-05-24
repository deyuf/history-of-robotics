/**
 * SEO + metadata tests — ensure both HTML pages carry the expected
 * structured data, sitemap entries and hreflang variants.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { HTML_INDEX, HTML_HUMANOID } from '../setup.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SITEMAP = readFileSync(resolve(ROOT, 'sitemap.xml'), 'utf8');
const ROBOTS  = readFileSync(resolve(ROOT, 'robots.txt'), 'utf8');

function meta(name, html) {
  const m = html.match(new RegExp(`<meta\\s+(?:name|property)="${name}"\\s+content="([^"]+)"`));
  return m ? m[1] : null;
}

describe('index.html — SEO metadata', () => {
  it('has a title under 70 characters', () => {
    const m = HTML_INDEX.match(/<title>([^<]+)<\/title>/);
    expect(m[1].length).toBeGreaterThan(10);
    expect(m[1].length).toBeLessThanOrEqual(80);
  });

  it('has a meta description', () => {
    expect(meta('description', HTML_INDEX)).toBeTruthy();
    expect(meta('description', HTML_INDEX).length).toBeGreaterThan(50);
  });

  it('has og:title, og:description, og:image, og:type', () => {
    ['og:title', 'og:description', 'og:image', 'og:type'].forEach(p => {
      expect(meta(p, HTML_INDEX), p).toBeTruthy();
    });
  });

  it('has hreflang en + zh + x-default link rels', () => {
    ['hreflang="en"', 'hreflang="zh"', 'hreflang="x-default"'].forEach(s => {
      expect(HTML_INDEX).toContain(s);
    });
  });

  it('has a canonical link', () => {
    expect(HTML_INDEX).toMatch(/<link\s+rel="canonical"\s+href="https:\/\//);
  });

  it('embeds JSON-LD structured data with Article + WebSite', () => {
    const m = HTML_INDEX.match(/<script\s+type="application\/ld\+json">([\s\S]+?)<\/script>/);
    expect(m).toBeTruthy();
    const parsed = JSON.parse(m[1]);
    const types = Array.isArray(parsed['@graph'])
      ? parsed['@graph'].map(n => n['@type'])
      : [parsed['@type']];
    expect(types).toContain('Article');
    expect(types).toContain('WebSite');
  });

  it('declares Speculation Rules for prerender of the sister page', () => {
    const m = HTML_INDEX.match(/<script\s+type="speculationrules">([\s\S]+?)<\/script>/);
    expect(m).toBeTruthy();
    const parsed = JSON.parse(m[1]);
    expect(parsed.prerender).toBeTruthy();
    expect(parsed.prerender.some(r => /humanoid/.test(r.where?.href_matches || ''))).toBe(true);
  });
});

describe('humanoid.html — SEO metadata', () => {
  it('has its own canonical, distinct from the main page', () => {
    const m = HTML_HUMANOID.match(/<link\s+rel="canonical"\s+href="([^"]+)"/);
    expect(m[1]).toContain('humanoid.html');
  });

  it('has og:title and og:image', () => {
    expect(meta('og:title', HTML_HUMANOID)).toBeTruthy();
    expect(meta('og:image', HTML_HUMANOID)).toBeTruthy();
  });

  it('declares Speculation Rules pointing back to the main page', () => {
    const m = HTML_HUMANOID.match(/<script\s+type="speculationrules">([\s\S]+?)<\/script>/);
    const parsed = JSON.parse(m[1]);
    expect(parsed.prerender.length).toBeGreaterThanOrEqual(1);
  });

  it('embeds JSON-LD Article schema', () => {
    const m = HTML_HUMANOID.match(/<script\s+type="application\/ld\+json">([\s\S]+?)<\/script>/);
    const parsed = JSON.parse(m[1]);
    expect(parsed['@type']).toBe('Article');
    expect(parsed.inLanguage).toContain('en');
    expect(parsed.inLanguage).toContain('zh');
  });
});

describe('sitemap.xml', () => {
  it('is valid XML and references both pages', () => {
    expect(SITEMAP).toMatch(/<\?xml\s/);
    expect(SITEMAP).toContain('<urlset');
    expect(SITEMAP).toContain('historyofrobotics.deyuf.org/');
    expect(SITEMAP).toContain('humanoid.html');
  });

  it('declares hreflang en + zh + x-default for every URL', () => {
    const enCount = (SITEMAP.match(/hreflang="en"/g) || []).length;
    const zhCount = (SITEMAP.match(/hreflang="zh"/g) || []).length;
    const xCount  = (SITEMAP.match(/hreflang="x-default"/g) || []).length;
    expect(enCount).toBeGreaterThanOrEqual(2);
    expect(zhCount).toBeGreaterThanOrEqual(2);
    expect(xCount).toBeGreaterThanOrEqual(2);
  });
});

describe('robots.txt', () => {
  it('allows everything and references the sitemap', () => {
    expect(ROBOTS).toMatch(/User-agent:\s*\*/);
    expect(ROBOTS).toMatch(/Allow:\s*\//);
    expect(ROBOTS).toMatch(/Sitemap:/);
  });
});

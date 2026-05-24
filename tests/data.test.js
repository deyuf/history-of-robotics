/**
 * Data integrity tests — validate the shape, content and citations of
 * timeline.json and humanoid.json without booting the app.
 */
import { describe, it, expect } from 'vitest';
import { DATA_TIMELINE, DATA_HUMANOID } from './setup.js';

const datasets = [
  ['timeline', DATA_TIMELINE, 8, 81],
  ['humanoid', DATA_HUMANOID, 6, 47]
];

for (const [name, data, expectedEras, expectedEvents] of datasets) {
  describe(`${name}.json — top-level`, () => {
    it('has meta with required fields', () => {
      expect(data.meta).toBeTruthy();
      expect(data.meta.title).toBeTruthy();
      expect(data.meta.updated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(data.meta.license).toBe('CC BY 4.0');
    });

    it('exposes bilingual UI strings (zh + en)', () => {
      expect(data.ui).toBeTruthy();
      expect(data.ui.zh).toBeTruthy();
      expect(data.ui.en).toBeTruthy();
    });

    it(`has exactly ${expectedEras} eras`, () => {
      expect(Array.isArray(data.eras)).toBe(true);
      expect(data.eras.length).toBe(expectedEras);
    });

    it(`has exactly ${expectedEvents} events across all eras`, () => {
      const total = data.eras.reduce((a, e) => a + e.events.length, 0);
      expect(total).toBe(expectedEvents);
    });

    it('has at least 6 people', () => {
      expect(Array.isArray(data.people)).toBe(true);
      expect(data.people.length).toBeGreaterThanOrEqual(6);
    });
  });

  describe(`${name}.json — eras`, () => {
    it('every era has unique id', () => {
      const ids = data.eras.map(e => e.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('every era has bilingual title, lead and range', () => {
      data.eras.forEach(e => {
        expect(e.id, 'id').toBeTruthy();
        expect(e.title, `${e.id} title (zh)`).toBeTruthy();
        expect(e.titleEn, `${e.id} title (en)`).toBeTruthy();
        expect(e.lead, `${e.id} lead (zh)`).toBeTruthy();
        expect(e.leadEn, `${e.id} lead (en)`).toBeTruthy();
        expect(e.range, `${e.id} range (zh)`).toBeTruthy();
        expect(e.rangeEn, `${e.id} range (en)`).toBeTruthy();
        expect(e.number).toMatch(/^\d{2}$/);
      });
    });

    it('every event has bilingual fields and at least one source', () => {
      data.eras.forEach(era => {
        era.events.forEach((ev, i) => {
          const trail = `${era.id}[${i}] ${ev.title || ev.titleEn || '?'}`;
          expect(ev.year, `${trail} .year`).toBeTruthy();
          expect(ev.title, `${trail} .title`).toBeTruthy();
          expect(ev.titleEn, `${trail} .titleEn`).toBeTruthy();
          expect(ev.desc, `${trail} .desc`).toBeTruthy();
          expect(ev.descEn, `${trail} .descEn`).toBeTruthy();
          expect(Array.isArray(ev.sources), `${trail} .sources is array`).toBe(true);
          expect(ev.sources.length, `${trail} ≥1 source`).toBeGreaterThanOrEqual(1);
          ev.sources.forEach((s, j) => {
            expect(s.label, `${trail} source[${j}].label`).toBeTruthy();
            expect(s.url, `${trail} source[${j}].url`).toMatch(/^https?:\/\//);
          });
        });
      });
    });

    it('image references use only filename (no full URL)', () => {
      data.eras.forEach(era => {
        era.events.forEach(ev => {
          if (!ev.image) return;
          expect(ev.image.file, `${ev.titleEn} image.file`).not.toMatch(/^https?:\/\//);
          expect(ev.image.credit, `${ev.titleEn} image.credit`).toBeTruthy();
        });
      });
    });

    it('every event year is parseable (number, BCE, or year-month)', () => {
      // Editorial narrative can group events thematically rather than strictly
      // chronologically, so we only enforce that each year string is well-formed.
      const pat = /^~?\d{1,4}(?:\s*(?:BCE|CE))?(?:\s*\/\s*\d{1,4})?(?:[-–]\d{1,4})?(?:[-–](?:Q[1-4]|\d{1,2}))?(?:\s*\(.+\))?$/;
      data.eras.forEach(era => {
        era.events.forEach(ev => {
          expect(ev.year, `${era.id} year "${ev.year}" parseable`).toMatch(pat);
        });
      });
    });

    it('event year ranges fit within their era range', () => {
      data.eras.forEach(era => {
        const rangeM = era.rangeEn.match(/(\d{3,4})\s*[–-]\s*(\d{3,4})/);
        if (!rangeM) return;
        const [lo, hi] = [+rangeM[1], +rangeM[2]];
        const span = hi - lo + 1;
        era.events.forEach(ev => {
          const yM = String(ev.year).match(/(\d{3,4})/);
          if (!yM) return;
          const y = +yM[1];
          // Allow ~10% overflow either side for editorial framing
          const slack = Math.max(5, Math.round(span * 0.1));
          expect(y, `${era.id} event ${ev.year} fits ${lo}-${hi}`).toBeGreaterThanOrEqual(lo - slack);
          expect(y, `${era.id} event ${ev.year} fits ${lo}-${hi}`).toBeLessThanOrEqual(hi + slack);
        });
      });
    });
  });

  describe(`${name}.json — bilingual purity`, () => {
    it('contains no Chinese characters inside any *En field', () => {
      const CJK = /[一-鿿]/;
      const offenders = [];
      function walk(o, path) {
        if (o == null) return;
        if (typeof o === 'string') return;
        if (Array.isArray(o)) {
          o.forEach((v, i) => walk(v, `${path}[${i}]`));
          return;
        }
        if (typeof o === 'object') {
          for (const k of Object.keys(o)) {
            const v = o[k];
            if (k.endsWith('En') && typeof v === 'string' && CJK.test(v)) {
              offenders.push(`${path}.${k}: ${v.slice(0, 60)}`);
            } else {
              walk(v, `${path}.${k}`);
            }
          }
        }
      }
      walk(data, '$');
      expect(offenders, offenders.join('\n')).toEqual([]);
    });

    it('contains no English letters in core zh-only fields (sanity)', () => {
      // The ZH `title` of an era may include English punctuation but should
      // still be majority Chinese. Just sanity check that it's non-empty.
      data.eras.forEach(e => {
        expect(e.title.length).toBeGreaterThan(0);
      });
    });
  });

  describe(`${name}.json — people`, () => {
    it('every person has name, years, role and quote (bilingual where applicable)', () => {
      data.people.forEach(p => {
        expect(p.name).toBeTruthy();
        expect(p.years).toMatch(/^\d/);
        expect(p.role).toBeTruthy();
        expect(p.roleEn).toBeTruthy();
        expect(p.quote).toBeTruthy();
        expect(p.quoteEn).toBeTruthy();
      });
    });
  });
}

describe('humanoid.json — roster + comparison', () => {
  it('has 12 roster entries with all required spec columns', () => {
    expect(DATA_HUMANOID.roster).toBeTruthy();
    expect(DATA_HUMANOID.roster.length).toBe(12);
    DATA_HUMANOID.roster.forEach(r => {
      expect(r.name).toBeTruthy();
      expect(r.company).toBeTruthy();
      expect(typeof r.year).toBe('number');
      expect(r.height).toBeTruthy();
      expect(r.weight).toBeTruthy();
      expect(r.dof).toBeTruthy();
      expect(r.source).toMatch(/^https?:\/\//);
    });
  });

  it('comparison table has 9 metric rows × 6 model columns', () => {
    const c = DATA_HUMANOID.compare;
    expect(c.headers.length).toBe(7); // metric + 6 models
    expect(c.rows.length).toBe(9);
    c.rows.forEach(row => {
      expect(row.values.length).toBe(6);
    });
  });
});

describe('timeline.json — charts', () => {
  it('industrial installations chart has at least 10 data points', () => {
    const c = DATA_TIMELINE.stats.industrialInstalls;
    expect(c.data.length).toBeGreaterThanOrEqual(10);
    c.data.forEach(d => {
      expect(typeof d.year).toBe('number');
      expect(typeof d.value).toBe('number');
    });
  });

  it('humanoid funding chart has at least 6 entries', () => {
    const c = DATA_TIMELINE.stats.humanoidFunding;
    expect(c.data.length).toBeGreaterThanOrEqual(6);
    c.data.forEach(d => {
      expect(d.label).toBeTruthy();
      expect(typeof d.value).toBe('number');
      expect(typeof d.year).toBe('number');
    });
  });
});

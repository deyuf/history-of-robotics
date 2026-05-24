/**
 * Build-data tool tests — verify the .data.js sidecars are in sync with
 * the .json sources (would have caught my page-load bug at CI time).
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, statSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

function evalSidecar(file) {
  const raw = readFileSync(resolve(ROOT, file), 'utf8');
  const win = {};
  const fn = new Function('window', raw);
  fn(win);
  return win.__HOR_DATA__;
}

describe('data sidecar (.data.js)', () => {
  it('timeline.data.js exports the same content as timeline.json', () => {
    const sidecar = evalSidecar('data/timeline.data.js');
    const json = JSON.parse(readFileSync(resolve(ROOT, 'data/timeline.json'), 'utf8'));
    expect(sidecar.timeline).toEqual(json);
  });

  it('humanoid.data.js exports the same content as humanoid.json', () => {
    const sidecar = evalSidecar('data/humanoid.data.js');
    const json = JSON.parse(readFileSync(resolve(ROOT, 'data/humanoid.json'), 'utf8'));
    expect(sidecar.humanoid).toEqual(json);
  });

  it('sidecars are not stale (newer or equal to source)', () => {
    const pairs = [
      ['data/timeline.json', 'data/timeline.data.js'],
      ['data/humanoid.json', 'data/humanoid.data.js']
    ];
    for (const [src, out] of pairs) {
      const srcM = statSync(resolve(ROOT, src)).mtimeMs;
      const outM = statSync(resolve(ROOT, out)).mtimeMs;
      // 5-second grace
      expect(outM, `${out} stale vs ${src}`).toBeGreaterThanOrEqual(srcM - 5000);
    }
  });

  it('sidecars use the JSONP global pattern', () => {
    const t = readFileSync(resolve(ROOT, 'data/timeline.data.js'), 'utf8');
    expect(t).toContain('window.__HOR_DATA__');
    expect(t).toContain('["timeline"]');
  });

  it('the build tool can be executed and produces fresh outputs', async () => {
    const { execSync } = await import('node:child_process');
    const out = execSync('node tools/build.mjs', { cwd: ROOT, encoding: 'utf8' });
    expect(out).toContain('build: OK');
    expect(out).toContain('data/timeline.data.js');
    expect(out).toContain('data/humanoid.data.js');
    expect(out).toContain('app.bundle.js');
  });

  it('app.bundle.js exists, is IIFE-wrapped, and has no ESM exports', () => {
    const b = readFileSync(resolve(ROOT, 'app.bundle.js'), 'utf8');
    expect(b).toContain('(function () {');
    expect(b).toContain('})();');
    expect(b).not.toMatch(/^\s*export\s/m);
    // Must still contain the boot() function from app.js
    expect(b).toContain('async function boot()');
  });

  it('both HTML pages reference app.bundle.js (not app.js)', () => {
    const idx = readFileSync(resolve(ROOT, 'index.html'), 'utf8');
    const hum = readFileSync(resolve(ROOT, 'humanoid.html'), 'utf8');
    expect(idx).toMatch(/src="\.\/app\.bundle\.js"/);
    expect(hum).toMatch(/src="\.\/app\.bundle\.js"/);
    // The non-bundled app.js must NOT be referenced from the HTML (avoids
    // file:// breakage from <script type="module">).
    expect(idx).not.toMatch(/src="\.\/app\.js"/);
    expect(hum).not.toMatch(/src="\.\/app\.js"/);
  });
});

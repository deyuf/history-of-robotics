// Vitest global setup — mounts the real HTML and dynamically imports
// app.js as an ES module so v8 coverage instrumentation kicks in.

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { vi, beforeEach, afterEach } from 'vitest';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

export const HTML_INDEX    = readFileSync(resolve(ROOT, 'index.html'), 'utf8');
export const HTML_HUMANOID = readFileSync(resolve(ROOT, 'humanoid.html'), 'utf8');
export const DATA_TIMELINE = JSON.parse(readFileSync(resolve(ROOT, 'data/timeline.json'), 'utf8'));
export const DATA_HUMANOID = JSON.parse(readFileSync(resolve(ROOT, 'data/humanoid.json'), 'utf8'));

// Inject the <body> innerHTML of a page into the current jsdom document.
function applyPage(html) {
  const dom = new DOMParser().parseFromString(html, 'text/html');
  // Wipe document and copy children
  document.documentElement.innerHTML = dom.documentElement.innerHTML;
  // Restore body data attributes
  const bodyAttrs = html.match(/<body([^>]*)>/);
  if (bodyAttrs) {
    const re = /(\w[\w-]*)\s*=\s*"([^"]*)"/g;
    let m;
    while ((m = re.exec(bodyAttrs[1])) !== null) {
      document.body.setAttribute(m[1], m[2]);
    }
  }
}

function stubBrowserAPIs() {
  if (!window.matchMedia) {
    window.matchMedia = vi.fn().mockReturnValue({
      matches: false, addEventListener: () => {}, removeEventListener: () => {}
    });
  }
  if (!HTMLDialogElement.prototype.showModal) {
    HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
    HTMLDialogElement.prototype.close     = function () { this.removeAttribute('open'); };
  }
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = () => {};
  }
  if (!window.IntersectionObserver) {
    window.IntersectionObserver = class {
      observe() {} unobserve() {} disconnect() {}
    };
  }
}

export async function mountPage(which = 'main') {
  const html = which === 'humanoid' ? HTML_HUMANOID : HTML_INDEX;
  applyPage(html);
  window.__HOR_DATA__ = { timeline: DATA_TIMELINE, humanoid: DATA_HUMANOID };
  stubBrowserAPIs();

  // Re-import app.js to get a fresh module evaluation
  vi.resetModules();
  await import('../app.js?t=' + Date.now());

  // Boot is auto-fired by app.js; give it a microtask to settle
  await new Promise(r => setTimeout(r, 10));
}

beforeEach(() => {
  document.documentElement.setAttribute('lang', 'en');
  document.documentElement.setAttribute('data-lang', 'en');
  document.documentElement.removeAttribute('data-theme');
  try { localStorage.clear(); } catch (e) {}
});

afterEach(() => {
  delete window.__HOR_DATA__;
  delete window.__HOR__;
});

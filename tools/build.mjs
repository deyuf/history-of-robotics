#!/usr/bin/env node
// Build everything the deployed site needs:
//   1. data/*.data.js sidecars (JSONP, lets the page boot on file://)
//   2. app.bundle.js — app.js stripped of ESM `export` clauses and wrapped
//      in an IIFE so it loads as a classic <script> on file:// too.
// app.js itself stays an ES module so tests can import it for coverage.

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

// ── 1. Data sidecars ───────────────────────────────────────────
const datasets = [
  { in: 'data/timeline.json', out: 'data/timeline.data.js', key: 'timeline' },
  { in: 'data/humanoid.json', out: 'data/humanoid.data.js', key: 'humanoid' }
];
for (const s of datasets) {
  const raw = await readFile(join(root, s.in), 'utf8');
  const data = JSON.parse(raw);
  const body =
`/* AUTO-GENERATED from ${s.in}. Run \`npm run build\` to refresh. */
window.__HOR_DATA__ = window.__HOR_DATA__ || {};
window.__HOR_DATA__[${JSON.stringify(s.key)}] = ${JSON.stringify(data)};
`;
  await writeFile(join(root, s.out), body);
  console.log(`  ${s.out}  (${(body.length / 1024).toFixed(1)} KB)`);
}

// ── 2. app.bundle.js — strip ESM exports, wrap in IIFE ─────────
let app = await readFile(join(root, 'app.js'), 'utf8');
// Remove the trailing `export { … };` block.
app = app.replace(/\n\/\/ ── Named exports[\s\S]*?export\s*\{[\s\S]*?\};?\s*$/m, '\n');
// Wrap in IIFE; classic-script semantics work on file:// in Chrome.
const bundle =
`/* AUTO-GENERATED from app.js. Run \`npm run build\` to refresh. */
(function () { 'use strict';
${app}
})();
`;
await writeFile(join(root, 'app.bundle.js'), bundle);
console.log(`  app.bundle.js  (${(bundle.length / 1024).toFixed(1)} KB)`);

console.log('build: OK');

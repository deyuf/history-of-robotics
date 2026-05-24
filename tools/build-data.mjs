#!/usr/bin/env node
// Generate JSONP-style sibling .data.js files from JSON sources so the
// site can be opened via file:// (Chrome blocks fetch() on file://).
// Idempotent: re-running just refreshes the .data.js outputs.

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

const sources = [
  { in: 'data/timeline.json', out: 'data/timeline.data.js', key: 'timeline' },
  { in: 'data/humanoid.json', out: 'data/humanoid.data.js', key: 'humanoid' }
];

for (const s of sources) {
  const raw = await readFile(join(root, s.in), 'utf8');
  const data = JSON.parse(raw); // throws if malformed
  const body =
`/* AUTO-GENERATED from ${s.in}. Run \`npm run build\` to refresh. */
window.__HOR_DATA__ = window.__HOR_DATA__ || {};
window.__HOR_DATA__[${JSON.stringify(s.key)}] = ${JSON.stringify(data)};
`;
  await writeFile(join(root, s.out), body);
  console.log(`  wrote ${s.out}  (${(body.length / 1024).toFixed(1)} KB)`);
}
console.log('build-data: OK');

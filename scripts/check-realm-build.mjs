import { readFile, readdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
const files = await readdir(new URL('../dist/assets/', import.meta.url));
const output = (await Promise.all(files.filter(name => /\.(js|css)$/.test(name)).map(name => readFile(new URL(`../dist/assets/${name}`, import.meta.url), 'utf8')))).join('\n');
for (const marker of ['/__realm-preview', 'sample-task-', 'realm-scene-plan', 'realm-building-activities', 'Careful foundations', 'Quiet meadow', 'The bridgewright', 'Pažljivi temelji', 'Planinski prevoj']) {
  assert.ok(!output.includes(marker), `Realm content leaked into production: ${marker}`);
}
assert.ok(!files.some(name => /Realm|VillageScene|BuildingActivities|expansionCopy/.test(name)), 'Realm chunk emitted');
console.log('Ten-building Realm code, styles, sample rewards and bilingual catalogs excluded from production.');

// A DEV-only chunk must not leak its imported illustrations into dist either.
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const approvedDir = new URL('../docs/design/realm-stage4b3/assets/', import.meta.url);
const art = await readdir(approvedDir);
const approvedHashes = new Set(await Promise.all(art.filter(name => name.endsWith('.png')).map(async name => hash(await readFile(new URL(name, approvedDir))))));
approvedHashes.add(hash(await readFile(new URL('../docs/design/realm-stage4a/clean-v1/clean-terrain.png', import.meta.url))));
for (const file of files) assert.ok(!approvedHashes.has(hash(await readFile(new URL(`../dist/assets/${file}`, import.meta.url)))), `Realm artwork leaked into production: ${file}`);
assert.ok(!output.includes('clean-terrain') && !output.includes('realm-stage4b3'), 'Realm artwork reference leaked');
console.log('Approved terrain and all ten RGBA sprites excluded from production.');

const tierDir = new URL('../docs/design/realm-stage5a/assets/', import.meta.url);
const tierHashes = new Set(await Promise.all((await readdir(tierDir)).filter(name => name.endsWith('.png')).map(async name => hash(await readFile(new URL(name, tierDir))))));
for (const file of files) assert.ok(!tierHashes.has(hash(await readFile(new URL(`../dist/assets/${file}`, import.meta.url)))), `Town Hall tier leaked: ${file}`);
assert.ok(!output.includes('realm-stage5a') && !output.includes('hall-early') && !output.includes('hall-developed'), 'Town Hall tier reference leaked');
console.log('Town Hall visual tiers excluded from production.');

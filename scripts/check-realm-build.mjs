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

for (const stage of ['realm-stage5a', 'realm-stage5b', 'realm-stage5c', 'realm-stage5d']) {
  const tierDir = new URL(`../docs/design/${stage}/assets/`, import.meta.url);
  const tierHashes = new Set(await Promise.all((await readdir(tierDir)).filter(name => name.endsWith('.png')).map(async name => hash(await readFile(new URL(name, tierDir))))));
  for (const file of files) assert.ok(!tierHashes.has(hash(await readFile(new URL(`../dist/assets/${file}`, import.meta.url)))), `Building tier leaked: ${file}`);
  assert.ok(!output.includes(stage), `Building tier reference leaked: ${stage}`);
}
for (const name of ['hall-early', 'hall-developed', 'farm-early', 'farm-developed', 'sawmill-early', 'sawmill-developed', 'workshop-early', 'workshop-developed', 'marketplace-early', 'marketplace-developed', 'guild-early', 'guild-developed', 'academy-early', 'academy-developed', 'mine-early', 'mine-developed', 'quarry-early', 'quarry-developed', 'tavern-early', 'tavern-developed']) assert.ok(!output.includes(name), `Building tier reference leaked: ${name}`);
console.log('All ten building visual tier sets excluded from production.');

const supportingDir = new URL('../docs/design/realm-stage6a/assets/', import.meta.url);
const supportingHashes = new Set(await Promise.all((await readdir(supportingDir)).map(async name => hash(await readFile(new URL(name, supportingDir))))));
for (const file of files) assert.ok(!supportingHashes.has(hash(await readFile(new URL(`../dist/assets/${file}`, import.meta.url)))), `Realm supporting artwork leaked: ${file}`);
for (const marker of ['realm-stage6a', 'realm-resource-icon', 'realm-hero-portrait', 'ResourceArtwork']) assert.ok(!output.includes(marker), `Realm supporting artwork reference leaked: ${marker}`);
console.log('Five resource illustrations and Wayfinder portrait excluded from production.');

const explorationDir = new URL('../docs/design/realm-stage6b/assets/', import.meta.url);
const explorationHashes = new Set(await Promise.all((await readdir(explorationDir)).map(async name => hash(await readFile(new URL(name, explorationDir))))));
for (const file of files) assert.ok(!explorationHashes.has(hash(await readFile(new URL(`../dist/assets/${file}`, import.meta.url)))), `Exploration artwork leaked: ${file}`);
for (const marker of ['realm-stage6b', 'realm-exploration-art', 'ExplorationArtwork']) assert.ok(!output.includes(marker), `Exploration artwork reference leaked: ${marker}`);
console.log('All six exploration landscapes excluded from production.');

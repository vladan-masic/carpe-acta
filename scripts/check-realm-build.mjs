import { readFile, readdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
const files = await readdir(new URL('../dist/assets/', import.meta.url));
const output = (await Promise.all(files.filter(name => /\.(js|css)$/.test(name)).map(name => readFile(new URL(`../dist/assets/${name}`, import.meta.url), 'utf8')))).join('\n');
for (const marker of ['/__realm-preview', 'sample-task-', 'realm-scene-plan', 'realm-building-activities', 'Careful foundations', 'Quiet meadow', 'The bridgewright', 'Pažljivi temelji', 'Planinski prevoj']) {
  assert.ok(!output.includes(marker), `Realm content leaked into production: ${marker}`);
}
assert.ok(!files.some(name => /Realm|VillageScene|BuildingActivities|expansionCopy/.test(name)), 'Realm chunk emitted');
console.log('Ten-building Realm code, styles, sample rewards and bilingual catalogs excluded from production.');

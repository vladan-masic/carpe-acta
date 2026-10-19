import { readFile, readdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
const names=await readdir(new URL('../dist/assets/',import.meta.url));
const scripts=await Promise.all(names.filter(name=>name.endsWith('.js')).map(name=>readFile(new URL(`../dist/assets/${name}`,import.meta.url),'utf8')));
const bundle=scripts.join('\n');
for(const marker of ['/__realm-preview','Development-only reward simulator','Simulator nagrada','Lifetime rewards issued','Visit Japan in spring','Build my portfolio website','sample-0']) {
 assert.ok(!bundle.includes(marker),`Unpublished fixture or feature in production: ${marker}`);
}
assert.ok(bundle.includes('/tasks'),'Production task route missing');
assert.ok(names.some(name=>/^TasksPage.*\.js$/.test(name)),'Lazy task bundle missing');
assert.ok(!names.some(name=>/RealmPreview|KanbanPreview|TasksPreview|RewardSimulator/.test(name)),'Preview chunk emitted');
const config=JSON.parse(await readFile(new URL('../vercel.json',import.meta.url),'utf8'));
assert.ok(config.rewrites.some(rule=>rule.source==='/tasks'&&rule.destination==='/index.html'),'Direct task URL rewrite missing');
console.log('Production task route present; Realm and task sample fixtures excluded.');

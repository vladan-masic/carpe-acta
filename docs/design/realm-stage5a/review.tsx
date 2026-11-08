import React from 'react';
import { createRoot } from 'react-dom/client';
import { VillageScene } from '../../../src/dev/realm/VillageScene';
import { BuildingArtwork } from '../../../src/dev/realm/artwork';
import { buildings, initialRealm } from '../../../src/dev/realm/model';
import { realmCopy } from '../../../src/dev/realm/copy';
import { expansionCopy } from '../../../src/dev/realm/expansionCopy';
import '../../../src/dev/realm/realm.css';
const village = initialRealm().village;
const levels = Object.fromEntries(buildings.map(id => [id, 5])) as typeof village.levels;
createRoot(document.getElementById('root')!).render(<main className="realm-preview">
<style>{`body{margin:0;background:#f6efdf;color:#343b30;font:16px system-ui}main{padding:20px}h1,h2,p{margin:12px 0}.comparison{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;background:#e7e0d0;padding:20px}.comparison .sprite{height:150px}.realm-scene-heading{display:none}.realm-scene-scroll{margin:0}.realm-village{margin-bottom:30px}button{cursor:pointer}@media(max-width:600px){main{padding:10px}.comparison .sprite{height:60px}}`}</style>
<h1>Town Hall visual progression</h1><p>Development review only · shared bottom-center anchor · approved terrain and nine other sprites unchanged</p>
<div className="comparison">{[1,3,5].map(level=><section key={level}><h2>{level===1?'Levels 1–2':level===3?'Levels 3–4':'Level 5'}</h2><div className="sprite"><BuildingArtwork building="hall" level={level}/></div></section>)}</div>
{[1,3,5].map(level=><section id={`tier-${level}`} key={level}><h2>Town Hall level {level}</h2><VillageScene village={{...village,levels:{...levels,hall:level}}} selected={null} onSelect={()=>{}} copy={realmCopy.en} expansion={expansionCopy.en}/></section>)}
</main>);

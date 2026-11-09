import React from 'react';
import { createRoot } from 'react-dom/client';
import { VillageScene } from '../../../src/dev/realm/VillageScene';
import { BuildingArtwork } from '../../../src/dev/realm/artwork';
import { buildings, initialRealm } from '../../../src/dev/realm/model';
import { realmCopy } from '../../../src/dev/realm/copy';
import { expansionCopy } from '../../../src/dev/realm/expansionCopy';
import '../../../src/dev/realm/realm.css';
const village = initialRealm().village;
const order = ['hall','farm','sawmill','workshop','marketplace','guild','academy','mine','quarry','tavern'] as const;
const stages = [{level:1,label:'Levels 1–2'},{level:3,label:'Levels 3–4'},{level:5,label:'Level 5'}];
createRoot(document.getElementById('root')!).render(<main className="realm-preview">
<style>{`body{margin:0;background:#f6efdf;color:#343b30;font:16px system-ui}main{padding:20px}h1,h2,p{margin:12px 0}.matrix-scroll{overflow:auto}.matrix{min-width:1000px;background:#eee6d6;padding:16px}.row{display:grid;grid-template-columns:190px repeat(3,minmax(0,1fr));align-items:center;gap:20px;padding:10px 0;border-bottom:1px solid #c6bda9}.row h3{font-size:16px;margin:0}.sprite{height:116px}.realm-scene-heading{display:none}.realm-scene-scroll{margin:0}.realm-village{margin-bottom:30px}button{cursor:pointer}@media(max-width:600px){main{padding:10px}}`}</style>
<h1>The Realm — all ten building progressions</h1><p>Approved artwork only. Review fixtures show all buildings at a shared visual tier; gameplay prerequisites remain unchanged.</p>
<div className="matrix-scroll"><section className="matrix" id="comparison"><div className="row"><strong>Building</strong>{stages.map(s=><strong key={s.level}>{s.label}</strong>)}</div>{order.map(building=><div className="row" key={building}><h3>{realmCopy.en.buildings[building]}</h3>{stages.map(s=><div className="sprite" key={s.level}><BuildingArtwork building={building} level={s.level}/></div>)}</div>)}</section></div>
{stages.map(s=><section id={`tier-${s.level}`} key={s.level}><h2>Whole village — {s.label}</h2><VillageScene village={{...village,levels:Object.fromEntries(buildings.map(id=>[id,s.level])) as typeof village.levels}} selected={null} onSelect={()=>{}} copy={realmCopy.en} expansion={expansionCopy.en}/></section>)}
</main>);

import { useRef, type CSSProperties } from 'react';
import { buildings, hallUnlock, type Building, type Village } from './model';
import type { RealmCopy } from './copy';
import type { ExpansionCopy } from './expansionCopy';
import { placements } from './placement';
import { BuildingArtwork, sceneArtwork } from './artwork';

export function VillageScene({ village, selected, onSelect, copy: c, expansion: e }: { village: Village; selected: Building | null; onSelect: (id: Building) => void; copy: RealmCopy; expansion: ExpansionCopy }) {
  const scroll = useRef<HTMLDivElement>(null);
  const scene = useRef<HTMLDivElement>(null);
  const status = (id: Building) => village.levels[id] ? `${c.level} ${village.levels[id]}` : village.levels.hall < hallUnlock[id] ? `${e.locked} · ${e.hall} ${hallUnlock[id]}` : e.available;
  function select(id: Building) {
    const location = placements.find(p => p.building === id)!;
    if (scroll.current && scene.current) scroll.current.scrollLeft = scene.current.clientWidth * location.x / 100 - scroll.current.clientWidth / 2;
    onSelect(id);
  }
  return <section className="realm-village" aria-label={c.village}>
    <div className="realm-scene-heading"><h2>{c.village}</h2><p>{e.terrain}</p>
      <label>{e.selector}<select value={selected ?? ''} onChange={event => select(event.target.value as Building)}><option value="" disabled>{c.choose}</option>{buildings.map(id => <option key={id} value={id}>{c.buildings[id]} · {status(id)}</option>)}</select></label>
      <p id="realm-pan-help">{e.pan}</p></div>
    <div ref={scroll} className="realm-scene-scroll" tabIndex={0} role="region" aria-label={c.village} aria-describedby="realm-pan-help">
      <div ref={scene} className="realm-scene-plan">
        <img className="realm-terrain" src={sceneArtwork.terrain} alt=""/>
        {placements.map(({ building: id, x, y, width, height, z }) => {
          const built = village.levels[id] > 0;
          return <button key={id} id={`plot-${id}`} className="realm-location" data-built={built} data-locked={village.levels.hall < hallUnlock[id]} style={{ '--x': `${x}%`, '--y': `${y}%`, '--width': `${width}%`, '--height': `${height}%`, zIndex: z } as CSSProperties} aria-label={`${c.buildings[id]}, ${status(id)}`} aria-pressed={selected === id} title={`${c.buildings[id]} · ${status(id)}`} onClick={() => onSelect(id)}>
            {built ? <BuildingArtwork building={id}/> : <span className="realm-plot-marker" aria-hidden="true">{c.buildings[id]}<small>{status(id)}</small></span>}
          </button>;
        })}
      </div>
    </div>
  </section>;
}

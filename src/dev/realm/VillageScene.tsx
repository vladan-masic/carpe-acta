import { Fragment, type CSSProperties } from 'react';
import { buildings, hallUnlock, type Building, type Village } from './model';
import type { RealmCopy } from './copy';
import type { ExpansionCopy } from './expansionCopy';
import { placements, sceneArtwork } from './placement';
export function VillageScene({ village, selected, onSelect, copy: c, expansion: e }: { village: Village; selected: Building | null; onSelect: (id: Building) => void; copy: RealmCopy; expansion: ExpansionCopy }) {
  const names = c.buildings;
  const status = (id: Building) => village.levels[id] ? `${c.level} ${village.levels[id]}` : village.levels.hall < hallUnlock[id] ? `${e.locked} · ${e.hall} ${hallUnlock[id]}` : e.available;
  return <section className="realm-village" aria-label={c.village}>
    <div className="realm-scene-heading"><h2>{c.village}</h2><p>{e.terrain}</p>
      <label>{e.selector}<select value={selected ?? ''} onChange={event => onSelect(event.target.value as Building)}><option value="" disabled>{c.choose}</option>{buildings.map(id => <option key={id} value={id}>{names[id]} · {status(id)}</option>)}</select></label>
      <p id="realm-pan-help">{e.pan}</p></div>
    <div className="realm-scene-scroll" tabIndex={0} role="region" aria-label={c.village} aria-describedby="realm-pan-help">
      <div className="realm-scene-plan">
        {sceneArtwork.terrain && <img className="realm-terrain" src={sceneArtwork.terrain} alt=""/>}
        {placements.map(({ building: id, x, y, width, height, z }, index) => {
          const level = village.levels[id], art = level ? sceneArtwork.buildings[id]?.[level as 1 | 2 | 3 | 4 | 5] : undefined;
          return <Fragment key={id}>{art && <img className="realm-building-art" src={art} alt="" style={{ left: `${x}%`, top: `${y}%`, width: `${width}%`, zIndex: z }}/>}<button id={`plot-${id}`} className="realm-location" data-built={level > 0} data-locked={village.levels.hall < hallUnlock[id]} style={{ '--x': `${x}%`, '--y': `${y}%`, '--width': `${width}%`, '--height': `${height}%`, zIndex: z } as CSSProperties} aria-label={`${names[id]}, ${level ? `${c.level} ${level}` : c.plot}`} aria-describedby={`plot-status-${id}`} aria-pressed={selected === id} onClick={() => onSelect(id)}>
            <span className="realm-location-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
            <strong>{names[id]}</strong><span id={`plot-status-${id}`}>{status(id)}</span><small>{e.districts[id]}</small>
          </button></Fragment>;
        })}
      </div>
    </div>
  </section>;
}

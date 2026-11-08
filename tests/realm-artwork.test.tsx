// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { VillageScene } from '../src/dev/realm/VillageScene';
import { buildings, initialRealm } from '../src/dev/realm/model';
import { placements, terrainManifest } from '../src/dev/realm/placement';
import { sceneArtwork } from '../src/dev/realm/artwork';
import { realmCopy } from '../src/dev/realm/copy';
import { expansionCopy } from '../src/dev/realm/expansionCopy';
import approved from '../docs/design/realm-stage4a/revised/proposal.json';
import metrics from '../docs/design/realm-stage4b3/asset-validation.json';
afterEach(cleanup);
it('matches every approved anchor, ground footprint, artwork envelope and draw order', () => {
  for (const p of approved.buildings) expect(placements.find(b => b.building === p.building)).toEqual({ building: p.building, x: p.x, y: p.y, width: p.level5Envelope.width, height: p.level5Envelope.height, groundWidth: p.groundWidth, groundDepth: p.groundDepth, groundPolygon: p.groundPolygon, z: p.z });
  expect(terrainManifest.bridge).toEqual(approved.bridge.center);
  expect(terrainManifest.bridgeCorridor).toEqual(approved.bridge.corridor);
  expect(terrainManifest.river).toEqual(approved.river.nearCenterline);
});
it.each(['en', 'sr-Latn'] as const)('shows only constructed sprites; all five levels and empty/locked sites remain selectable in %s', locale => {
  const village = initialRealm().village, onSelect = vi.fn();
  const props = {village, selected: null, onSelect, copy: realmCopy[locale], expansion: expansionCopy[locale]};
  const view = render(<VillageScene {...props}/>);
  expect(view.container.querySelectorAll('.realm-location svg')).toHaveLength(3);
  expect(view.container.querySelector('#plot-tavern svg')).toBeNull();
  for (const level of [1,2,3,4,5]) {
    const updated = { ...village, levels: Object.fromEntries(buildings.map(id => [id, level])) as typeof village.levels };
    view.rerender(<VillageScene {...props} village={updated}/>);
    for (const id of buildings) {
      const button = view.container.querySelector(`#plot-${id}`)!;
      expect(button.getAttribute('aria-label')).toContain(`${realmCopy[locale].level} ${level}`);
      expect(button.querySelector('image')?.getAttribute('href')).toBe(sceneArtwork.buildings[id]);
      const [l,t,r,b] = metrics[id].visibleBounds;
      expect(button.querySelector('svg')?.getAttribute('viewBox')).toBe(`${l} ${t} ${r-l} ${b-t}`);
      fireEvent.click(button); expect(onSelect).toHaveBeenLastCalledWith(id);
    }
  }
  view.rerender(<VillageScene {...props}/>);
  expect(view.container.querySelector('#plot-tavern svg')).toBeNull();
  fireEvent.change(screen.getByRole('combobox'), {target:{value:'tavern'}});
  expect(onSelect).toHaveBeenLastCalledWith('tavern');
});

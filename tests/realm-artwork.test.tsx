// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { VillageScene } from '../src/dev/realm/VillageScene';
import { buildings, construct, initialRealm } from '../src/dev/realm/model';
import { placements, terrainManifest } from '../src/dev/realm/placement';
import { buildingArtwork, sceneArtwork } from '../src/dev/realm/artwork';
import { realmCopy } from '../src/dev/realm/copy';
import { expansionCopy } from '../src/dev/realm/expansionCopy';
import approved from '../docs/design/realm-stage4a/revised/proposal.json';

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
      expect(button.querySelector('image')?.getAttribute('href')).toBe(buildingArtwork(id, level).src);
      const [l,t,r,b] = buildingArtwork(id, level).bounds;
      expect(button.querySelector('svg')?.getAttribute('viewBox')).toBe(`${l} ${t} ${r-l} ${b-t}`);
      fireEvent.click(button); expect(onSelect).toHaveBeenLastCalledWith(id);
    }
  }
  view.rerender(<VillageScene {...props}/>);
  expect(view.container.querySelector('#plot-tavern svg')).toBeNull();
  fireEvent.change(screen.getByRole('combobox'), {target:{value:'tavern'}});
  expect(onSelect).toHaveBeenLastCalledWith('tavern');
});

it.each(['hall', 'farm', 'sawmill', 'workshop', 'marketplace'] as const)('changes %s tiers at levels 3 and 5, reusing the approved middle sprite', building => {
  expect(buildingArtwork(building, 1)).toEqual(buildingArtwork(building, 2));
  expect(buildingArtwork(building, 3)).toEqual(buildingArtwork(building, 4));
  expect(buildingArtwork(building, 3).src).toBe(sceneArtwork.buildings[building]);
  expect(new Set([1,3,5].map(level => buildingArtwork(building, level).src)).size).toBe(3);
  for (const id of buildings.filter(id => !['hall', 'farm', 'sawmill', 'workshop', 'marketplace'].includes(id))) for (const level of [1,2,3,4,5]) expect(buildingArtwork(id, level).src).toBe(sceneArtwork.buildings[id]);
  const ratios = [1,3,5].map(level => { const [l,t,r,b] = buildingArtwork(building, level).bounds; return (r-l)/(b-t); });
  for (const ratio of ratios) expect(ratio).toBeCloseTo(ratios[0], 8);
});

it('updates the rendered tier through real upgrade actions without moving the plot; rejected upgrades retain artwork', () => {
  let state = initialRealm();
  state.village.stock = { coins: 1000, wood: 1000, stone: 1000, food: 1000, iron: 1000 };
  const props = { selected: null, onSelect: vi.fn(), copy: realmCopy.en, expansion: expansionCopy.en };
  const view = render(<VillageScene {...props} village={state.village}/>);
  const plot = () => view.container.querySelector('#plot-hall')!;
  const geometry = plot().getAttribute('style');
  expect(view.container.querySelector('#plot-quarry image')).toBeNull();
  state = construct(state, 'quarry');
  view.rerender(<VillageScene {...props} village={state.village}/>);
  expect(view.container.querySelector('#plot-quarry image')?.getAttribute('href')).toBe(sceneArtwork.buildings.quarry);
  for (const target of [2,3,4,5]) {
    if (target >= 3) {
      expect(construct(state, 'hall')).toBe(state); // Workshop prerequisite still applies.
      state = construct(state, 'workshop');
    }
    state = construct(state, 'hall');
    expect(state.village.levels.hall).toBe(target);
    view.rerender(<VillageScene {...props} village={state.village}/>);
    expect(plot().querySelector('image')?.getAttribute('href')).toBe(buildingArtwork('hall', target).src);
    expect(plot().getAttribute('style')).toBe(geometry);
  }
  expect(construct(state, 'hall')).toBe(state);
});

it.each(['farm', 'sawmill', 'workshop', 'marketplace'] as const)('shows %s construction and upgrades without shifting its frame, with no sprite for an empty plot', building => {
  let state = initialRealm();
  state.village.levels = { ...state.village.levels, hall: 5, workshop: 3, [building]: 0 };
  state.village.stock = { coins: 1000, wood: 1000, stone: 1000, food: 1000, iron: 1000 };
  const props = { selected: null, onSelect: vi.fn(), copy: realmCopy.en, expansion: expansionCopy.en };
  const view = render(<VillageScene {...props} village={state.village}/>);
  const plot = () => view.container.querySelector(`#plot-${building}`)!;
  const geometry = plot().getAttribute('style');
  expect(plot().querySelector('image')).toBeNull();
  for (const target of [1,2,3,4,5]) {
    state = construct(state, building);
    expect(state.village.levels[building]).toBe(target);
    view.rerender(<VillageScene {...props} village={state.village}/>);
    expect(plot().querySelector('image')?.getAttribute('href')).toBe(buildingArtwork(building, target).src);
    expect(plot().getAttribute('style')).toBe(geometry);
    expect(buildingArtwork(building, target).bounds).toEqual(buildingArtwork(building, 3).bounds);
  }
  expect(construct(state, building)).toBe(state);
});

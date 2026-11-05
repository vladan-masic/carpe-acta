// @vitest-environment jsdom
import { useState } from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { BuildingActivities } from '../src/dev/realm/BuildingActivities';
import { VillageScene } from '../src/dev/realm/VillageScene';
import { realmCopy } from '../src/dev/realm/copy';
import { expansionCopy } from '../src/dev/realm/expansionCopy';
import { buildings, initialRealm, type Building } from '../src/dev/realm/model';
import { destinations } from '../src/dev/realm/catalog';
afterEach(cleanup);
function Harness({ building, locale }: { building: Building; locale: 'en' | 'sr-Latn' }) {
  const [state, setState] = useState(() => {
    const value = initialRealm();
    buildings.forEach(id => { value.village.levels[id] = 5; });
    value.village.stock = { coins: 10, wood: 100, stone: 100, food: 100, iron: 100 };
    value.xp = 200; value.village.explored = 3;
    if (building === 'tavern') value.village.destinations = destinations.map(item => item.id);
    return value;
  });
  return <><BuildingActivities building={building} state={state} copy={realmCopy[locale]} expansion={expansionCopy[locale]} onAction={setState}/><output aria-label="state">{JSON.stringify(state.village)}</output></>;
}
it.each(['en', 'sr-Latn'] as const)('shows exact trades and updates balances in %s', locale => {
  const e = expansionCopy[locale]; render(<Harness building="marketplace" locale={locale}/>);
  expect(screen.getByText(new RegExp(e.rate)).textContent).toContain('6');
  expect(screen.getByText(new RegExp(e.rate)).textContent).toContain('5');
  expect(screen.getByText(e.after + ':').parentElement?.textContent).toContain('94');
  fireEvent.click(screen.getByRole('button', { name: e.trade }));
  expect(JSON.parse(screen.getByLabelText('state').textContent!).stock).toEqual({ coins: 10, wood: 94, stone: 105, food: 100, iron: 100 });
});
it.each(['en', 'sr-Latn'] as const)('supports finite research, travel and contract controls in %s', locale => {
  const e = expansionCopy[locale];
  const a = render(<Harness building="academy" locale={locale}/>);
  const learn = screen.getByRole('button', { name: `${e.doResearch}: ${e.researchNames.foundations}` });
  fireEvent.click(learn); expect((learn as HTMLButtonElement).disabled).toBe(true);
  expect(JSON.parse(screen.getByLabelText('state').textContent!).research).toEqual(['foundations']); a.unmount();
  const g = render(<Harness building="guild" locale={locale}/>);
  const visit = screen.getByRole('button', { name: `${e.visit}: ${e.destinations.meadow}` });
  fireEvent.click(visit); expect((visit as HTMLButtonElement).disabled).toBe(true);
  expect(JSON.parse(screen.getByLabelText('state').textContent!).explored).toBe(3); g.unmount();
  render(<Harness building="tavern" locale={locale}/>);
  const contract = screen.getByRole('button', { name: `${e.contract}: ${e.travelers.storyteller}` });
  fireEvent.click(contract); expect((contract as HTMLButtonElement).disabled).toBe(true);
  expect(screen.getByText(e.done)).toBeTruthy();
});
it.each(['en', 'sr-Latn'] as const)('offers all ten locations through the mobile selector, including locked plots in %s', locale => {
  const select = vi.fn(), e = expansionCopy[locale];
  render(<VillageScene village={initialRealm().village} selected="hall" onSelect={select} copy={realmCopy[locale]} expansion={e}/>);
  fireEvent.change(screen.getByRole('combobox', { name: e.selector }), { target: { value: 'tavern' } });
  expect(select).toHaveBeenCalledWith('tavern');
  expect(screen.getAllByRole('button')).toHaveLength(10);
  expect(screen.getByRole('button', { name: new RegExp(realmCopy[locale].buildings.tavern) }).getAttribute('data-locked')).toBe('true');
  expect(screen.queryAllByRole('img')).toHaveLength(0);
});

// @vitest-environment jsdom
import { afterEach, expect, it } from 'vitest';
import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import { useState } from 'react';
import { BuildingActivities } from '../src/dev/realm/BuildingActivities';
import { RealmPreview } from '../src/dev/realm/RealmPreview';
import { initialRealm, type Realm } from '../src/dev/realm/model';
import { destinations } from '../src/dev/realm/catalog';
import { realmCopy } from '../src/dev/realm/copy';
import { expansionCopy } from '../src/dev/realm/expansionCopy';
afterEach(() => { cleanup(); localStorage.clear(); });
function Guild({ initial, locale }: { initial: Realm; locale: 'en' | 'sr-Latn' }) {
 const [state, setState] = useState(initial);
 return <><BuildingActivities building="guild" state={state} copy={realmCopy[locale]} expansion={expansionCopy[locale]} onAction={setState}/><output>{JSON.stringify(state)}</output></>;
}
it.each(['en','sr-Latn'] as const)('keeps illustrated destination requirements and one-time completion in %s', locale => {
 const e=expansionCopy[locale], c=realmCopy[locale], state=initialRealm();
 const locked=render(<Guild initial={state} locale={locale}/>);
 for(const item of destinations){
  const image=screen.getByAltText(e.destinationArtwork[item.id]);
  expect(image.getAttribute('loading')).toBe('lazy');
  expect(image.getAttribute('srcset')).toContain('800w');
  expect((screen.getByRole('button',{name:`${e.visit}: ${e.destinations[item.id]}`}) as HTMLButtonElement).disabled).toBe(true);
 }
 locked.unmount();state.village.levels.guild=5;state.village.explored=3;state.xp=200;
 state.village.stock={coins:10,wood:100,stone:100,food:100,iron:100};
 render(<Guild initial={state} locale={locale}/>);
 for(const item of destinations){
  const button=screen.getByRole('button',{name:`${e.visit}: ${e.destinations[item.id]}`}) as HTMLButtonElement;
  expect(button.disabled).toBe(false);fireEvent.click(button);expect(button.disabled).toBe(true);
  expect(button.parentElement?.textContent).toContain(c.reasons.completed);
  const before=screen.getByRole('status').textContent;fireEvent.click(button);expect(screen.getByRole('status').textContent).toBe(before);
 }
 const next=JSON.parse(screen.getByRole('status').textContent!);
 expect(next.village.destinations).toEqual(destinations.map(d=>d.id));expect(next.village.explored).toBe(3);expect(next.xp).toBe(200);expect(next.village.stock.coins).toBe(10);
});
it.each(['en','sr-Latn'] as const)('describes the existing forest illustration in %s', locale => {
 localStorage.setItem('carpe-acta-locale',locale);render(<RealmPreview/>);
 expect(screen.getByAltText(realmCopy[locale].forestArtwork).getAttribute('width')).toBe('800');
 expect((screen.getByRole('button',{name:realmCopy[locale].depart}) as HTMLButtonElement).disabled).toBe(true);
});

// @vitest-environment jsdom
import { afterEach, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { RealmPreview } from '../src/dev/realm/RealmPreview';
import { realmCopy } from '../src/dev/realm/copy';
import { resources } from '../src/dev/realm/model';
import { resourceArtwork } from '../src/dev/realm/ResourceArtwork';

afterEach(() => { cleanup(); localStorage.clear(); });
it.each(['en', 'sr-Latn'] as const)('retains localized resource and hero information alongside decorative artwork in %s', locale => {
  localStorage.setItem('carpe-acta-locale', locale);
  const { container } = render(<RealmPreview/>);
  const c = realmCopy[locale];
  for (const key of resources) {
    const balance = container.querySelector(`.realm-balance.realm-${key}`)!;
    expect(balance.textContent).toContain(c.resources[key]);
    expect(balance.querySelector('img')?.getAttribute('src')).toBe(resourceArtwork[key]);
  }
  for (const image of container.querySelectorAll('.realm-resource-icon, .realm-hero-portrait')) {
    expect(image.getAttribute('alt')).toBe('');
    expect(image.getAttribute('aria-hidden')).toBe('true');
  }
  expect(container.querySelector('.realm-hero-profile')?.textContent).toContain(c.heroName);
  expect(container.querySelector('progress')?.getAttribute('aria-label')).toBe(c.xp);
  expect(container.querySelectorAll('.realm-cost .realm-resource-icon').length).toBeGreaterThan(0);
  expect(container.querySelectorAll('.realm-supply-grid .realm-resource-icon')).toHaveLength(8);
  expect(container.querySelectorAll('.realm-resource-line .realm-resource-icon').length).toBeGreaterThan(0);
});

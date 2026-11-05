// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { RealmPreview } from '../src/dev/realm/RealmPreview';
import * as model from '../src/dev/realm/model';
import * as locales from '../src/i18n/locales';
import { realmCopy } from '../src/dev/realm/copy';
import { expansionCopy } from '../src/dev/realm/expansionCopy';
const createRealm = model.initialRealm;
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });
for (const locale of ['en', 'sr-Latn'] as const) for (const theme of ['light', 'dark']) {
  it.each(model.buildings)(`checks %s construction, upgrades and maximum in ${locale}/${theme}`, building => {
    vi.spyOn(locales, 'getInitialLocale').mockReturnValue(locale);
    vi.stubGlobal('matchMedia', (query: string) => ({ matches: query.includes('prefers-color-scheme') && theme === 'dark' }));
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => { callback(0); return 1; });
    HTMLElement.prototype.scrollIntoView = vi.fn();
    const c = realmCopy[locale];
    for (const level of [0, 1, 4, 5]) {
      const fixture = createRealm();
      model.buildings.forEach(id => { fixture.village.levels[id] = 5; });
      fixture.village.levels[building] = level;
      fixture.village.stock = { coins: 10000, wood: 10000, stone: 10000, food: 10000, iron: 10000 };
      vi.spyOn(model, 'initialRealm').mockReturnValue(fixture);
      const view = render(<RealmPreview/>);
      fireEvent.change(screen.getByRole('combobox', { name: expansionCopy[locale].selector }), { target: { value: building } });
      const detail = screen.getByRole('complementary', { name: c.buildings[building] });
      expect(document.documentElement.dataset.theme).toBe(theme);
      if (level === 5) {
        const button = within(detail).getByRole('button', { name: `${c.fullyUpgraded} — ${c.level} 5` }) as HTMLButtonElement;
        expect(button.disabled).toBe(true);
        expect(button.classList.contains('realm-fully-upgraded')).toBe(true);
        expect(button.getAttribute('aria-describedby')).toBe('realm-build-reason');
        expect(within(detail).getByText(c.reasons.maximum)).toBeTruthy();
        expect(within(detail).queryByText(c.instant)).toBeNull();
        expect(within(detail).queryByRole('button', { name: new RegExp(c.upgrade) })).toBeNull();
        expect(detail.querySelector('.realm-cost')).toBeNull();
        fireEvent.click(button);
        expect(within(detail).getByText(`${c.level} 5 / 5`)).toBeTruthy();
      } else {
        const button = within(detail).getByRole('button', { name: level ? `${c.upgrade} ${level + 1}` : c.construct, exact: true }) as HTMLButtonElement;
        expect(button.disabled).toBe(model.buildReason(fixture, building) !== 'ready');
        expect(detail.querySelectorAll('.realm-cost li').length).toBeGreaterThan(0);
        expect(within(detail).getByText(c.instant)).toBeTruthy();
        if (!button.disabled) {
          fireEvent.click(button);
          expect(within(detail).getByText(`${c.level} ${level + 1} / 5`)).toBeTruthy();
          if (level === 4) expect((within(detail).getByRole('button', { name: `${c.fullyUpgraded} — ${c.level} 5` }) as HTMLButtonElement).disabled).toBe(true);
        }
      }
      view.unmount();
    }
  });
}

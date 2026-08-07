export const localeOptions = [
  { id: "en", name: "English" },
  { id: "sr-Latn", name: "Srpski" },
] as const;

export type Locale = (typeof localeOptions)[number]["id"];

export const defaultLocale: Locale = "en";
export const localeStorageKey = "carpe-acta-locale";

export function isLocale(value: unknown): value is Locale {
  return localeOptions.some((locale) => locale.id === value);
}

export function detectBrowserLocale(language: string | undefined): Locale {
  return language?.toLowerCase().startsWith("sr") ? "sr-Latn" : defaultLocale;
}

export function getInitialLocale(): Locale {
  try {
    const storedLocale = window.localStorage.getItem(localeStorageKey);

    if (isLocale(storedLocale)) {
      return storedLocale;
    }
  } catch {
    // Storage can be unavailable in privacy-focused browser contexts.
  }

  return detectBrowserLocale(window.navigator.language);
}

export function persistLocale(locale: Locale): void {
  try {
    window.localStorage.setItem(localeStorageKey, locale);
  } catch {
    // The in-memory selection still works when storage is unavailable.
  }
}

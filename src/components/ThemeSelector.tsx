import type { Locale } from "../i18n/locales";
import { useTheme, type ThemePreference } from "../hooks/useTheme";

import { PreferenceSelector } from "./PreferenceSelector";

const messages = {
  en: { label: "Theme", system: "System", light: "Light", dark: "Dark" },
  "sr-Latn": { label: "Tema", system: "Sistemski", light: "Svetli", dark: "Tamni" },
};
export function ThemeSelector({ locale }: { locale: Locale }) {
  const { preference, select } = useTheme();
  const copy = messages[locale];
  return <PreferenceSelector<ThemePreference>
    ariaLabel={copy.label}
    value={preference}
    iconOnly
    options={(["system", "light", "dark"] as const).map(id => ({ id, name: copy[id] }))}
    onSelect={select}
    icon={<svg aria-hidden="true" className="preference-selector-icon" fill="none" viewBox="0 0 24 24">
      {preference === "light" ? <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" /></>
        : preference === "dark" ? <path d="M20.5 14A8.5 8.5 0 0 1 10 3.5 8.5 8.5 0 1 0 20.5 14Z" />
        : <><rect x="3" y="4" width="18" height="13" rx="2" /><path d="M12 17v4m-4 0h8" /></>}
    </svg>}
  />;
}

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
    options={(["system", "light", "dark"] as const).map(id => ({ id, name: copy[id] }))}
    onSelect={select}
    icon={<svg aria-hidden="true" className="preference-selector-icon" fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 3.5a8.5 8.5 0 0 1 0 17Z" fill="currentColor" stroke="none" />
    </svg>}
  />;
}

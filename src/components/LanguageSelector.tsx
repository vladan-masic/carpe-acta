import { localeOptions, type Locale } from "../i18n/locales";
import { PreferenceSelector } from "./PreferenceSelector";

type LanguageSelectorProps = {
  ariaLabel: string;
  locale: Locale;
  onSelectLocale: (locale: Locale) => void;
};

export function LanguageSelector({ ariaLabel, locale, onSelectLocale }: LanguageSelectorProps) {
  return <PreferenceSelector
    ariaLabel={ariaLabel}
    value={locale}
    options={localeOptions.map(option => ({ ...option, lang: option.id }))}
    onSelect={onSelectLocale}
    icon={<svg aria-hidden="true" className="preference-selector-icon" fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.75 12h16.5M12 3.5c2.15 2.3 3.25 5.13 3.25 8.5S14.15 18.2 12 20.5C9.85 18.2 8.75 15.37 8.75 12S9.85 5.8 12 3.5Z" />
    </svg>}
  />;
}

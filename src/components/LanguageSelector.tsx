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
    triggerLabel={locale === "en" ? "EN" : "SR"}
    icon={<svg aria-hidden="true" className="language-flag" viewBox="0 0 30 20" width="21" height="14">
      {locale === "en" ? <>
        <path fill="#253b74" d="M0 0h30v20H0z" />
        <path stroke="#fff" strokeWidth="5" d="m0 0 30 20M30 0 0 20" />
        <path stroke="#c73543" strokeWidth="2" d="m0 0 30 20M30 0 0 20" />
        <path stroke="#fff" strokeWidth="7" d="M15 0v20M0 10h30" />
        <path stroke="#c73543" strokeWidth="4" d="M15 0v20M0 10h30" />
      </> : <>
        <path fill="#c73543" d="M0 0h30v7H0z" /><path fill="#253b74" d="M0 7h30v7H0z" /><path fill="#fff" d="M0 14h30v6H0z" />
        <path fill="#fff" stroke="#d8ac52" strokeWidth=".7" d="M8 6h7v6q-3.5 5-7 0Z" />
        <path stroke="#c73543" strokeWidth="1.5" d="M11.5 7v6M9 10h5" /><path fill="#d8ac52" d="m8 5-1-3 3 1 1.5-2L13 3l3-1-1 3Z" />
      </>}
    </svg>}
  />;
}

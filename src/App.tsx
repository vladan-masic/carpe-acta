import { useEffect, useMemo, useState } from "react";
import {
  CategoryFilter,
  type CategoryFilterValue,
} from "./components/CategoryFilter";
import { AppFooter } from "./components/AppFooter";
import { DailyQuest } from "./components/DailyQuest";
import { LanguageSelector } from "./components/LanguageSelector";
import { TipCard } from "./components/TipCard";
import { TipsPreview } from "./components/TipsPreview";
import { tips } from "./data/tips";
import {
  getInitialLocale,
  persistLocale,
  type Locale,
} from "./i18n/locales";
import { messages } from "./i18n/messages";
import type { LocalizedTip, Tip } from "./types/tip";
import { getDailyQuest, getRandomTip } from "./utils/tips";

function localizeTip(tip: Tip, locale: Locale): LocalizedTip {
  const copy = messages[locale];

  return {
    ...tip,
    ...copy.tips[tip.id],
    category: copy.categories[tip.categoryId],
    effort: copy.formatEffort(tip.effortMinutes),
  };
}

export function App() {
  const dailyQuest = useMemo(() => getDailyQuest(tips), []);
  const categoryIds = useMemo(
    () => Array.from(new Set(tips.map((tip) => tip.categoryId))),
    [],
  );

  const [locale, setLocale] = useState(getInitialLocale);
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryFilterValue>("all");
  const [activeTip, setActiveTip] = useState(() => getRandomTip(tips));

  const copy = messages[locale];
  const localizedTips = useMemo(
    () => tips.map((tip) => localizeTip(tip, locale)),
    [locale],
  );
  const localizedDailyQuest = useMemo(
    () => localizeTip(dailyQuest, locale),
    [dailyQuest, locale],
  );
  const localizedActiveTip = useMemo(
    () => localizeTip(activeTip, locale),
    [activeTip, locale],
  );
  const categoryOptions = useMemo(
    () => [
      { id: "all" as const, label: copy.generator.allCategories },
      ...categoryIds.map((categoryId) => ({
        id: categoryId,
        label: copy.categories[categoryId],
      })),
    ],
    [categoryIds, copy],
  );

  const filteredTips = useMemo(() => {
    if (selectedCategory === "all") {
      return tips;
    }

    return tips.filter((tip) => tip.categoryId === selectedCategory);
  }, [selectedCategory]);

  useEffect(() => {
    persistLocale(locale);
    document.documentElement.lang = locale;
    document
      .querySelector<HTMLMetaElement>('meta[name="description"]')
      ?.setAttribute("content", copy.metadata.description);
  }, [copy.metadata.description, locale]);

  function handleGenerateTip() {
    setActiveTip((currentTip) => getRandomTip(filteredTips, currentTip.id));
  }

  function handleCategoryChange(category: CategoryFilterValue) {
    setSelectedCategory(category);
    const nextTips =
      category === "all"
        ? tips
        : tips.filter((tip) => tip.categoryId === category);
    setActiveTip(getRandomTip(nextTips));
  }

  return (
    <>
      <main className="app-shell" id="page-top">
        <div className="app-toolbar">
          <LanguageSelector
            ariaLabel={copy.languageSelectorLabel}
            locale={locale}
            onSelectLocale={setLocale}
          />
        </div>

        <section className="hero-section">
          <div className="hero-copy">
            <p className="eyebrow">{copy.hero.eyebrow}</p>
            <h1>Carpe Acta</h1>
            <p className="hero-lede">{copy.hero.lede}</p>
          </div>

          <DailyQuest
            label={copy.dailyQuestLabel}
            quest={localizedDailyQuest}
          />
        </section>

        <section className="generator-section" aria-labelledby="tip-generator">
          <div className="section-heading">
            <p className="eyebrow">{copy.generator.eyebrow}</p>
            <h2 id="tip-generator">{copy.generator.title}</h2>
          </div>

          <CategoryFilter
            ariaLabel={copy.generator.categoriesLabel}
            categories={categoryOptions}
            selectedCategory={selectedCategory}
            onSelectCategory={handleCategoryChange}
          />

          <TipCard
            actionLabel={copy.generator.actionLabel}
            buttonLabel={copy.generator.generateButton}
            tip={localizedActiveTip}
            onGenerateTip={handleGenerateTip}
          />
        </section>

        <TipsPreview
          eyebrow={copy.preview.eyebrow}
          title={copy.preview.title}
          tips={localizedTips}
        />
      </main>

      <AppFooter
        backToTopLabel={copy.footer.backToTop}
        createdByLabel={copy.footer.createdBy}
        motto={copy.footer.motto}
      />
    </>
  );
}

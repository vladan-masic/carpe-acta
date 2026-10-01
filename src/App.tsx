import { useEffect, useMemo, useState } from "react";
import {
  CategoryFilter,
  type CategoryFilterValue,
} from "./components/CategoryFilter";
import { AppFooter } from "./components/AppFooter";
import { BrandEmblem } from "./components/BrandEmblem";
import { DailyQuest } from "./components/DailyQuest";
import { LanguageSelector } from "./components/LanguageSelector";
import { TipCard } from "./components/TipCard";
import { TipsPreview } from "./components/TipsPreview";
import { tips } from "./data/tips";
import { getInitialLocale, persistLocale } from "./i18n/locales";
import { messages } from "./i18n/messages";
import { localizeTip } from "./i18n/localizeTip";
import { getDailyQuest, getRandomTip } from "./utils/tips";
import { useTipCompletion } from "./hooks/useTipCompletion";
import { useFavorites } from "./hooks/useFavorites";
import { FavoriteButton } from "./components/FavoriteButton";
import { FavoriteTips } from "./components/FavoriteTips";
import type { LocalizedTip } from "./types/tip";
import { completionMessages } from "./i18n/completions";
import { useAuth } from "./hooks/useAuth";
import { favoritesMessages } from "./i18n/favorites";
import { AuthPanel } from "./components/AuthPanel";

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
  const auth = useAuth();
  const completion = useTipCompletion(auth);
  const completionCopy = completionMessages[locale];
  const favorites = useFavorites(auth);
  const favoritesCopy = favoritesMessages[locale];

  const copy = messages[locale];
  const localizedTips = useMemo(
    () => tips.map((tip) => localizeTip(tip, locale)),
    [locale],
  );
  const favoriteTips = useMemo(() => {
    const byId = new Map<string, LocalizedTip>(localizedTips.map((tip) => [tip.id, tip]));
    return favorites.ids.flatMap((id) => {
      const tip = byId.get(id);
      return tip ? [tip] : [];
    });
  }, [favorites.ids, localizedTips]);
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
    completion.reset();
  }

  function handleCategoryChange(category: CategoryFilterValue) {
    setSelectedCategory(category);
    const nextTips =
      category === "all"
        ? tips
        : tips.filter((tip) => tip.categoryId === category);
    setActiveTip(getRandomTip(nextTips));
    completion.reset();
  }

  function handleOpenFavorite(tip: LocalizedTip) {
    const original = tips.find((entry) => entry.id === tip.id);
    if (!original) return;
    setActiveTip(original);
    setSelectedCategory(original.categoryId);
    completion.reset();
    requestAnimationFrame(() => {
      const heading = document.getElementById("active-tip-title");
      heading?.focus({ preventScroll: true });
      heading?.scrollIntoView({
        block: "start",
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
      });
    });
  }

  function renderFavoriteButton(tip: LocalizedTip) {
    return (
      <FavoriteButton
        selected={favorites.ids.includes(tip.id)}
        disabled={favorites.disabled}
        title={tip.title}
        labels={copy.favorites}
        onToggle={() => favorites.toggle(tip.id)}
      />
    );
  }

  return (
    <>
      <main className="app-shell" id="page-top">
        <div className="app-toolbar">
          <AuthPanel locale={locale} auth={auth} />
          <a className="favorites-link" href="#favorites-title">
            {copy.favorites.title} ({favoriteTips.length})
          </a>
          <LanguageSelector
            ariaLabel={copy.languageSelectorLabel}
            locale={locale}
            onSelectLocale={setLocale}
          />
        </div>

        <section className="hero-section">
          <div className="hero-copy">
            <p className="eyebrow">{copy.hero.eyebrow}</p>
            <div className="hero-brand">
              <BrandEmblem variant="hero" />
              <h1>
                Carpe <br />Acta
              </h1>
            </div>
            <p className="hero-lede">{copy.hero.lede}</p>
          </div>

          <DailyQuest
            label={copy.dailyQuestLabel}
            quest={localizedDailyQuest}
            favoriteButton={renderFavoriteButton(localizedDailyQuest)}
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
            completionCopy={copy.completion}
            completionStatus={completion.status}
            completionBusy={completion.busy}
            savingLabel={completionCopy.saving}
            failedLabel={completionCopy.failed}
            retryLabel={completionCopy.retry}
            onRetry={completion.retry}
            onComplete={() => completion.complete(activeTip.id)}
            favoriteButton={renderFavoriteButton(localizedActiveTip)}
          />
          <div className="favorites-storage-status" role="status" aria-atomic="true">
            {favorites.busy ? <p>{favoritesCopy.busy}</p> : favorites.error ? <p>{favoritesCopy.error}</p> : !favorites.persisted && <p>{copy.favorites.unsaved}</p>}
          </div>
        </section>

        <section className="favorites-section" aria-labelledby="completed-actions-title">
          <div className="section-heading">
            <h2 id="completed-actions-title">{completionCopy.title}{completion.count !== null ? ` (${completion.count})` : ""}</h2>
            <p>{completion.signedIn ? completionCopy.account : completionCopy.guest}</p>
          </div>
          <div role="status" aria-atomic="true">
            {completion.error && <p>{completionCopy.unavailable}</p>}
            {completion.guestUnreadable && <p>{completionCopy.unreadable}</p>}
            {completion.imported && <p>{completionCopy.imported}</p>}
          </div>
          {completion.signedIn && <div className="favorites-sync-controls">
            <button type="button" className="secondary-button" disabled={completion.busy} onClick={completion.refresh}>{completionCopy.refresh}</button>
            {completion.canImport && <div>
              <p>{completionCopy.importHint}</p>
              <button type="button" className="secondary-button" disabled={completion.busy} onClick={completion.importGuest}>{completionCopy.import}</button>
            </div>}
          </div>}
        </section>

        <FavoriteTips
          title={copy.favorites.title}
          description={favorites.signedIn ? favoritesCopy.account : favorites.persisted ? copy.favorites.description : copy.favorites.unsaved}
          disabled={favorites.disabled}
          loading={favorites.busy || favorites.error}
          controls={favorites.signedIn && (
            <div className="favorites-sync-controls">
              <button type="button" className="secondary-button" disabled={favorites.busy} onClick={favorites.refresh}>{favoritesCopy.refresh}</button>
              {favorites.canImport && <div>
                <p>{favoritesCopy.importHint}</p>
                <button type="button" className="secondary-button" disabled={favorites.disabled} onClick={favorites.importGuest}>{favoritesCopy.import}</button>
              </div>}
            </div>
          )}
          emptyMessage={copy.favorites.empty}
          openLabel={copy.favorites.open}
          actionLabel={copy.generator.actionLabel}
          labels={copy.favorites}
          tips={favoriteTips}
          onToggle={favorites.toggle}
          onOpen={handleOpenFavorite}
        />

        <TipsPreview
          eyebrow={copy.preview.eyebrow}
          title={copy.preview.title}
          tips={localizedTips}
          renderFavoriteButton={renderFavoriteButton}
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

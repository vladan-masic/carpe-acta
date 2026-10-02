import { CompletionFeedback } from "./components/CompletionFeedback";
import { HelpMeStart } from "./components/HelpMeStart";
import { TipLibrary } from "./components/TipLibrary";
import { helpMeStartMessages } from "./i18n/helpMeStart";
import { useTipSelection } from "./hooks/useTipSelection";
import { ProgressView } from "./components/ProgressView";
import { useEffect, useMemo, useState } from "react";
import {
  CategoryFilter,
  type CategoryFilterValue,
} from "./components/CategoryFilter";
import { AppFooter } from "./components/AppFooter";
import { AppToolbar } from "./components/AppToolbar";
import { BackToTop } from "./components/BackToTop";
import { BrandEmblem } from "./components/BrandEmblem";
import { DailyQuest } from "./components/DailyQuest";
import { LanguageSelector } from "./components/LanguageSelector";
import { TipCard } from "./components/TipCard";
import { TipsPreview } from "./components/TipsPreview";
import { tips } from "./data/tips";
import { getInitialLocale, persistLocale } from "./i18n/locales";
import { messages } from "./i18n/messages";
import { localizeTip } from "./i18n/localizeTip";
import { getDailyQuest } from "./utils/tips";
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
  const selection = useTipSelection();
  const { activeTip, category: selectedCategory } = selection;
  const startCopy = helpMeStartMessages[locale];
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

  useEffect(() => {
    persistLocale(locale);
    document.documentElement.lang = locale;
    document
      .querySelector<HTMLMetaElement>('meta[name="description"]')
      ?.setAttribute("content", copy.metadata.description);
  }, [copy.metadata.description, locale]);

  function handleGenerateTip() {
    selection.generate();
    completion.reset();
  }

  function handleCategoryChange(category: CategoryFilterValue) {
    selection.selectCategory(category);
    completion.reset();
  }

  function handleOpenTip(tip: LocalizedTip) {
    const original = tips.find((entry) => entry.id === tip.id);
    if (!original) return;
    selection.openTip(original);
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
      <main className="app-shell" id="page-top" tabIndex={-1}>
        <AppToolbar label={copy.menuLabel}>
          <AuthPanel locale={locale} auth={auth} />
          <a className="favorites-link" href="#favorites-title">
            {copy.favorites.title} ({favoriteTips.length})
          </a>
          <LanguageSelector
            ariaLabel={copy.languageSelectorLabel}
            locale={locale}
            onSelectLocale={setLocale}
          />
        </AppToolbar>

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
            <p className="eyebrow">{selection.helping ? startCopy.title : copy.generator.eyebrow}</p>
            <h2 id="tip-generator">{selection.helping ? startCopy.title : copy.generator.title}</h2>
          </div>

          <button type="button" className="secondary-button help-start-toggle" onClick={() => {
            if (selection.helping) selection.leave(); else selection.start();
            completion.reset();
          }}>{selection.helping ? startCopy.back : startCopy.title}</button>

          {selection.helping ? <HelpMeStart locale={locale} selected={selection.barrier}
            timeBudget={selection.timeBudget} hasSuggestion={selection.hasSuggestion}
            onTimeSelect={(budget) => { selection.selectTimeBudget(budget); completion.reset(); }} onSelect={(barrier) => {
            selection.selectBarrier(barrier);
            completion.reset();
          }} /> : <CategoryFilter
            ariaLabel={copy.generator.categoriesLabel}
            moreLabel={copy.generator.moreCategories}
            lessLabel={copy.generator.fewerCategories}
            categories={categoryOptions}
            selectedCategory={selectedCategory}
            onSelectCategory={handleCategoryChange}
          />}

          {selection.hasSuggestion && <TipCard
            actionLabel={copy.generator.actionLabel}
            buttonLabel={selection.helping ? startCopy.another : copy.generator.generateButton}
            tip={localizedActiveTip}
            onGenerateTip={handleGenerateTip}
            completionCopy={selection.helping ? { ...copy.completion, next: startCopy.another } : copy.completion}
            completionStatus={completion.status}
            completionBusy={completion.busy}
            savingLabel={completionCopy.saving}
            failedLabel={completionCopy.failed}
            retryLabel={completionCopy.retry}
            onRetry={completion.retry}
            onComplete={() => completion.complete(activeTip.id)}
            favoriteButton={renderFavoriteButton(localizedActiveTip)}
            extraActions={selection.helping && <button type="button" className="secondary-button"
              disabled={!selection.canGoSmaller} onClick={() => { selection.smaller(); completion.reset(); }}>
              {startCopy.smaller}
            </button>}
            feedback={completion.completedRecord && <CompletionFeedback
              key={`${auth.session?.user.id ?? "guest"}:${completion.completedRecord.id}`}
              record={completion.completedRecord} owner={auth.session?.user.id ?? null}
              client={auth.client} locale={locale} onSaved={completion.refresh} disabled={completion.busy}
            />}
          />}
          {selection.helping && selection.hasSuggestion && !selection.canGoSmaller && <p className="help-start-minimum">{startCopy.shortest}</p>}
          <div className="favorites-storage-status" role="status" aria-atomic="true">
            {favorites.busy ? <p>{favoritesCopy.busy}</p> : favorites.error ? <p>{favoritesCopy.error}</p> : !favorites.persisted && <p>{copy.favorites.unsaved}</p>}
          </div>
        </section>

        <TipLibrary tips={localizedTips} locale={locale} renderFavoriteButton={renderFavoriteButton} onTry={handleOpenTip} />

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
          <ProgressView progress={completion.progress} locale={locale} tips={localizedTips} busy={completion.busy} onTry={handleOpenTip} />
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
          onOpen={handleOpenTip}
        />

        <TipsPreview
          eyebrow={copy.preview.eyebrow}
          title={copy.preview.title}
          tips={localizedTips}
          renderFavoriteButton={renderFavoriteButton}
        />
      </main>

      <AppFooter
        createdByLabel={copy.footer.createdBy}
        motto={copy.footer.motto}
      />
      <BackToTop label={copy.footer.backToTop} />
    </>
  );
}

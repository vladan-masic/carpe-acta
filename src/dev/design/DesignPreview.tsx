import { useEffect, useRef, useState } from "react";
import { BrandEmblem } from "../../components/BrandEmblem";
import { DailyQuest } from "../../components/DailyQuest";
import { TipCard } from "../../components/TipCard";
import { FavoriteButton } from "../../components/FavoriteButton";
import { HelpMeStart } from "../../components/HelpMeStart";
import { useTipSelection } from "../../hooks/useTipSelection";
import { useActionTimer } from "../../hooks/useActionTimer";
import { tips } from "../../data/tips";
import { localizeTip } from "../../i18n/localizeTip";
import { messages } from "../../i18n/messages";
import { timerMessages } from "../../i18n/timer";
import { helpMeStartMessages } from "../../i18n/helpMeStart";
import { weeklyGoalMessages } from "../../i18n/weeklyGoal";
import type { Locale } from "../../i18n/locales";
import type { CategoryId, LocalizedTip } from "../../types/tip";
import { CategoryIcon, JourneyArt } from "./Illustrations";
import "./preview.css";

type Variant = "a" | "b" | "c";
const variants = [
  { id: "a", name: "Playful Momentum" },
  { id: "b", name: "Illustrated Notebook" },
  { id: "c", name: "Optimistic Adventure" },
] as const;
const categories = [...new Set(tips.map(tip => tip.categoryId))];
const featured: CategoryId[] = ["focus", "starting", "planning", "low-energy", "perfectionism"];
const initialTip = tips[0];
// Fixed catalog examples make comparisons independent of the current date.
const dailyExample = tips[2];
const copy = {
  en: {
    lab: "Carpe Acta · Design studio", phase: "Phase 0 / visual exploration",
    note: "Interactive samples only. Nothing is saved to your browser or account. The daily tip and progress are fixed examples.",
    variant: "Design direction", theme: "Preview theme", light: "Light", dark: "Dark", reset: "Reset sample", current: "Current application",
    compare: "Switch designs to compare the same content. Your selection and timer stay in place.",
    example: "Illustrative progress · fixed sample", week: "This week", undo: "Undo sample completion", completed: "Preview completion only — not saved.",
    specimen: "Typography check", scope: "This is a representative slice. Account, library, history and timer notifications remain in the current application.",
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], sample: "Sample data",
    skip: "Skip to the current action", active: "Active day", inactive: "No action in this sample",
  },
  "sr-Latn": {
    lab: "Carpe Acta · Dizajn studio", phase: "Faza 0 / vizuelno istraživanje",
    note: "Samo interaktivni primeri. Ništa se ne čuva u pregledaču ili na nalogu. Dnevni savet i napredak su fiksni primeri.",
    variant: "Vizuelni pravac", theme: "Tema pregleda", light: "Svetla", dark: "Tamna", reset: "Vrati početni primer", current: "Trenutna aplikacija",
    compare: "Promeni dizajn i uporedi isti sadržaj. Izbor i tajmer ostaju nepromenjeni.",
    example: "Ilustrativni napredak · fiksni primer", week: "Ove nedelje", undo: "Poništi završetak u primeru", completed: "Završetak samo u pregledu — nije sačuvan.",
    specimen: "Provera tipografije", scope: "Ovo je reprezentativni deo interfejsa. Nalog, biblioteka, istorija i obaveštenja tajmera ostaju u trenutnoj aplikaciji.",
    days: ["pon", "uto", "sre", "čet", "pet", "sub", "ned"], sample: "Primer podataka",
    skip: "Pređi na trenutnu radnju", active: "Aktivan dan", inactive: "Bez radnje u ovom primeru",
  },
};

function PreviewTimer({ minutes, locale }: { minutes: number; locale: Locale }) {
  // Real timer engine; no alerts hook, storage, notification permissions or sound.
  const timer = useActionTimer(minutes);
  const startButton = useRef<HTMLButtonElement>(null);
  const t = timerMessages[locale];
  const running = timer.phase === "running";
  const expired = timer.phase === "expired";
  return <section className="p0-timer" aria-label={t.title}>
    <span className="p0-time"><CategoryIcon category="deadlines" /><span role="timer" aria-live="off" aria-label={timer.extra ? t.extra : t.remaining}>
      {Math.floor(timer.seconds / 60)}:{String(timer.seconds % 60).padStart(2, "0")}
    </span></span>
    <button ref={startButton} className="secondary-button" type="button" onClick={() => {
      if (expired) timer.keepGoing(); else if (running) timer.pause(); else timer.start();
    }}>{expired ? t.keepGoing : running ? t.pause : timer.phase === "paused" ? t.resume : t.start}</button>
    {timer.phase !== "idle" && <button className="p0-text-button" type="button" onClick={() => { timer.reset(); startButton.current?.focus(); }}>{t.reset}</button>}
    <p role="status">{timer.phase === "idle" ? "" : expired ? t.expired : running ? timer.extra ? t.continuing : t.running : t.paused}</p>
  </section>;
}

export function DesignPreview() {
  const [variant, setVariant] = useState<Variant>("b");
  const [locale, setLocale] = useState<Locale>("en");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [expanded, setExpanded] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [completed, setCompleted] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const selection = useTipSelection();
  const c = copy[locale];
  const common = messages[locale];
  const guided = helpMeStartMessages[locale];
  const weekly = weeklyGoalMessages[locale];
  const tip = localizeTip(selection.activeTip, locale);
  const daily = localizeTip(dailyExample, locale);
  const direction = variants.find(item => item.id === variant)!;

  useEffect(() => { selection.openTip(initialTip); }, []);

  function resetAttempt() { setCompleted(false); setAttempt(value => value + 1); }
  function resetSample() {
    selection.openTip(initialTip); setFavorites([]); setExpanded(false); resetAttempt();
  }
  function favoriteButton(value: LocalizedTip) {
    return <FavoriteButton title={value.title} selected={favorites.includes(value.id)} labels={common.favorites}
      onToggle={() => setFavorites(current => current.includes(value.id) ? current.filter(id => id !== value.id) : [...current, value.id])} />;
  }
  const shownCategories = expanded ? categories : [...new Set([...featured, selection.category].filter((id): id is CategoryId => id !== "all"))];

  return <div className="p0" data-variant={variant} data-preview-theme={theme} lang={locale}>
    <a className="p0-skip" href="#active-tip-title">{c.skip}</a>
    <header className="p0-studio">
      <div className="p0-studio-top"><strong>{c.lab}</strong><a href="/">{c.current} ↗</a></div>
      <div className="p0-studio-controls">
        <fieldset className="p0-variants"><legend>{c.variant}</legend>
          {variants.map(item => <button key={item.id} type="button" aria-pressed={variant === item.id} onClick={() => setVariant(item.id)}><b>{item.id.toUpperCase()}</b>{" "}<span>{item.name}</span></button>)}
        </fieldset>
        <div className="p0-preferences">
          <label>{c.theme}<select value={theme} onChange={event => setTheme(event.target.value as typeof theme)}><option value="light">{c.light}</option><option value="dark">{c.dark}</option></select></label>
          <label>{common.languageSelectorLabel}<select value={locale} onChange={event => setLocale(event.target.value as Locale)}><option value="en">English</option><option value="sr-Latn">Srpski</option></select></label>
          <button className="p0-reset" type="button" onClick={resetSample}>{c.reset}</button>
        </div>
      </div>
      <p>{c.compare}</p>
      <p>{c.note}</p>
    </header>

    <main className="p0-page">
      <div className="p0-direction"><span>{c.phase}</span><span>{variant.toUpperCase()} — {direction.name}</span></div>
      <div className="p0-introduction">
        <section className="p0-hero" aria-labelledby="p0-brand">
          <p className="eyebrow">{common.hero.eyebrow}</p>
          <div className="hero-brand"><BrandEmblem variant="hero" /><h1 id="p0-brand">Carpe Acta<span className="p0-brand-dot" aria-hidden="true">.</span></h1></div>
          <p className="p0-motto">{common.footer.motto}</p>
          <p className="hero-lede">{common.hero.lede}</p>
          <JourneyArt variant={variant} />
        </section>
        <DailyQuest label={common.dailyQuestLabel} locale={locale} quest={daily} favoriteButton={favoriteButton(daily)} />
      </div>

      <section className="p0-generator" aria-labelledby="p0-generator-title">
        <div className="p0-section-heading"><div><p className="eyebrow">{selection.helping ? guided.title : common.generator.eyebrow}</p><h2 id="p0-generator-title">{selection.helping ? guided.title : common.generator.title}</h2></div>
          <button className="p0-help" type="button" onClick={() => { selection.helping ? selection.leave() : selection.start(); resetAttempt(); }}><CategoryIcon category="starting" />{selection.helping ? guided.back : guided.title}</button>
        </div>
        {selection.helping ? <HelpMeStart locale={locale} selected={selection.barrier} timeBudget={selection.timeBudget} hasSuggestion={selection.hasSuggestion}
          onSelect={barrier => { selection.selectBarrier(barrier); resetAttempt(); }} onTimeSelect={budget => { selection.selectTimeBudget(budget); resetAttempt(); }} /> : <>
          <div className="p0-categories" role="group" aria-label={common.generator.categoriesLabel}>
            <button type="button" aria-pressed={selection.category === "all"} onClick={() => { selection.selectCategory("all"); resetAttempt(); }}>{common.generator.allCategories}</button>
            {shownCategories.map(category => <button key={category} type="button" aria-pressed={selection.category === category} onClick={() => { selection.selectCategory(category); resetAttempt(); }}><CategoryIcon category={category} />{common.categories[category]}</button>)}
          </div>
          <button className="p0-text-button p0-category-toggle" type="button" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>{expanded ? common.generator.fewerCategories : common.generator.moreCategories} <span aria-hidden="true">{expanded ? "−" : "+"}</span></button>
        </>}
        {selection.hasSuggestion && <div className="p0-action" data-completed={completed}>
          <span className="p0-action-marker" aria-hidden="true"><CategoryIcon category={tip.categoryId} /></span>
          <TipCard locale={locale} tip={tip} actionLabel={common.generator.actionLabel} explanationLabel={common.generator.explanationLabel}
            buttonLabel={selection.helping ? guided.another : common.generator.generateButton}
            completionCopy={common.completion} completionStatus={completed ? "saved" : null} completionBusy={false}
            savingLabel="" failedLabel="" retryLabel="" onRetry={() => {}}
            onComplete={() => setCompleted(true)} onGenerateTip={() => { selection.generate(); resetAttempt(); }} favoriteButton={favoriteButton(tip)}
            timer={!completed && <PreviewTimer key={`${tip.id}:${attempt}`} minutes={tip.effortMinutes} locale={locale} />}
            extraActions={selection.helping && <button className="secondary-button" type="button" disabled={!selection.canGoSmaller} onClick={() => { selection.smaller(); resetAttempt(); }}>{guided.smaller}</button>}
            feedback={completed && <div className="p0-demo-completion"><span>{c.completed}</span><button className="secondary-button" type="button" onClick={() => { resetAttempt(); document.getElementById("active-tip-title")?.focus(); }}>{c.undo}</button></div>} />
        </div>}
        {selection.helping && selection.hasSuggestion && !selection.canGoSmaller && <p className="p0-minimum">{guided.shortest}</p>}
      </section>

      <section className="p0-progress" aria-labelledby="p0-progress-title">
        <div className="p0-progress-copy"><p className="eyebrow">{c.example}</p><h2 id="p0-progress-title"><CategoryIcon category="habits" />{weekly.title}</h2><p>{weekly.progress(3, 4)}</p><p className="p0-small">{weekly.hint}</p></div>
        <div className="p0-week"><div className="p0-week-heading"><span>{c.week}</span><strong>3 <span>/ 4</span></strong></div><progress value={3} max={4} aria-label={`${c.sample}: ${weekly.title}`} />
          <div className="p0-days">{c.days.map((day, index) => <span key={day} data-active={[0, 1, 3].includes(index)}><span>{day}</span><span role="img" aria-label={`${day}: ${[0, 1, 3].includes(index) ? c.active : c.inactive}`}>{[0, 1, 3].includes(index) ? "✓" : "·"}</span></span>)}</div>
        </div>
      </section>
      <footer className="p0-preview-footer"><p>{c.scope}</p><details><summary>{c.specimen}</summary><p className="p0-font-display">Č ć Ž ž Š š Đ đ Ć ć — Počni svojim tempom.</p><p>Č ć Ž ž Š š Đ đ Ć ć — Small actions. Real momentum. 0123456789</p></details></footer>
    </main>
  </div>;
}

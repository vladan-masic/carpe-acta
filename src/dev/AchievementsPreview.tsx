import { useState } from "react";
import { PersonalMilestones } from "../components/PersonalMilestones";
import { PersonalBest } from "../components/PersonalBest";
import { CategoryExploration } from "../components/CategoryExploration";
import { WhatHelpsMe } from "../components/WhatHelpsMe";
import { tips } from "../data/tips";
import { localizeTip } from "../i18n/localizeTip";
import type { Locale } from "../i18n/locales";
import { summarizeMilestones } from "../utils/milestones";
import { summarizePersonalBest } from "../utils/personalBests";
import { exploredCategories } from "../utils/categoryExploration";
import { summarizeHelpfulTips } from "../utils/helpfulTips";

// Real presentation and calculations, in-memory sample records only.
export function AchievementsPreview() {
  const [locale, setLocale] = useState<Locale>("en");
  const [state, setState] = useState("sample");
  const [open, setOpen] = useState(true);
  const [notice, setNotice] = useState("");
  const now = new Date(2026, 9, 11, 12);
  const samples = [1, 1, 3, 5, 7, 10, 14, 20, 30, 40, 60, 90].map((offset, i) => ({
    id: `sample-${i}`, tipId: tips[i].id, feedback: i % 3 !== 0,
    completedAt: new Date(2026, 9, 11 - offset, 9).toISOString(),
  }));
  const records = state === "empty" ? [] : samples;
  const pending = state === "loading" || state === "error";
  const retry = () => setState("sample");
  return <main className="app-shell">
    <h1>Notebook collection · visual review</h1>
    <p>In-memory examples, using real components and calculations. No account or browser records are changed.</p>
    <div className="calendar-controls">
      <label>Language <select value={locale} onChange={e => setLocale(e.target.value as Locale)}><option value="en">English</option><option value="sr-Latn">Srpski</option></select></label>
      <label>Theme <select defaultValue="light" onChange={e => { document.documentElement.dataset.theme = e.target.value; }}><option value="light">Light</option><option value="dark">Dark</option></select></label>
      <label>State <select value={state} onChange={e => setState(e.target.value)}><option value="sample">Sample accomplishments</option><option value="empty">Empty</option><option value="loading">Loading</option><option value="error">Error</option></select></label>
    </div>
    <div className="achievement-panels">
      <PersonalMilestones totals={pending ? null : summarizeMilestones(records, now)} error={state === "error"} retry={retry} locale={locale} completionId={null} />
      <PersonalBest best={pending ? null : summarizePersonalBest(records, now)} error={state === "error"} retry={retry} locale={locale} />
      <CategoryExploration locale={locale} open={open} onOpenChange={setOpen} categories={pending ? null : exploredCategories(records.map(r => r.tipId))} error={state === "error"} retry={retry} onExplore={category => setNotice(`Library category requested: ${category}`)} />
    </div>
    <WhatHelpsMe entries={summarizeHelpfulTips(records, now)} tips={tips.map(tip => localizeTip(tip, locale))} locale={locale} onTry={tip => setNotice(`Action requested: ${tip.title}`)} />
    <p role="status">{notice}</p>
  </main>;
}

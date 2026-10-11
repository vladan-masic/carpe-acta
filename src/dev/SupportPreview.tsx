import { useState } from "react";
import { HelpfulActionPicker } from "../components/HelpfulActionPicker";
import { ReturnMessage } from "../components/ReturnMessage";
import { tips } from "../data/tips";
import { localizeTip } from "../i18n/localizeTip";
import type { Locale } from "../i18n/locales";
import { summarizeHelpfulTips } from "../utils/helpfulTips";

// Development-only fixtures for history-dependent visual states. No completion
// records or account calls are created. ReturnMessage uses its own preview owner.
export function SupportPreview() {
  const [locale, setLocale] = useState<Locale>("en");
  const [chosen, setChosen] = useState("");
  const [visit] = useState(() => String(Date.now()));
  const localized = tips.map(tip => localizeTip(tip, locale));
  const entries = summarizeHelpfulTips(tips.slice(0, 6).map((tip, index) => ({
    id: `sample-${index}`, tipId: tip.id, feedback: true, completedAt: `2026-01-0${index + 1}T12:00:00Z`,
  })));
  return <main className="app-shell">
    <h1>Guided support · visual review</h1>
    <p>Development fixtures, not your activity. Retry only displays the selected title here.</p>
    <label>Language <select value={locale} onChange={event => setLocale(event.target.value as Locale)}>
      <option value="en">English</option><option value="sr-Latn">Srpski</option>
    </select></label>{" "}
    <label>Theme <select defaultValue="light" onChange={event => { document.documentElement.dataset.theme = event.target.value; }}>
      <option value="light">Light</option><option value="dark">Dark</option>
    </select></label>
    <ReturnMessage locale={locale} owner="phase4-visual-preview" ready latestId={visit} latestAt="2026-01-01T12:00:00Z" completed={false} />
    <div className="action-entry-controls"><HelpfulActionPicker entries={entries} tips={localized} locale={locale} onTry={tip => setChosen(tip.title)} /></div>
    <p role="status">{chosen}</p>
  </main>;
}

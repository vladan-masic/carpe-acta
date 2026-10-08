import type { Locale } from "./locales";
type ProgressCopy = {
  achievements: string;
  yearHint: string; view: string; weeks: string; year: string; yearTitle: string; previousYear: string; nextYear: string;
  loadingYear: string; yearError: string; retryYear: string;
  weekSummary: (total: number, active: number) => string;
  dayCount: (count: number) => string;
  calendar: string; calendarHint: string; less: string; more: string;
  clearDay: string; emptyDay: string; recent: string; empty: string;
  unknown: string; loading: string; unavailable: string;
};

const srPlural = new Intl.PluralRules("sr-Latn");
function srActions(count: number, completed = false) {
  const category = srPlural.select(count);
  return category === "one" ? (completed ? "završena radnja" : "radnja")
    : category === "few" ? (completed ? "završene radnje" : "radnje")
    : (completed ? "završenih radnji" : "radnji");
}

export const progressMessages: Record<Locale, ProgressCopy> = {
  en: {
    achievements: "Achievements",
    yearHint: "Scroll horizontally to see the whole year on smaller screens.",
    view: "Calendar view", weeks: "12 weeks", year: "Year", yearTitle: "Your activity",
    previousYear: "Previous year", nextYear: "Next year", loadingYear: "Loading this year’s activity…",
    yearError: "This year’s activity could not be loaded.", retryYear: "Retry year",
    weekSummary: (total, active) => `Past seven days: ${total.toLocaleString("en")} ${total === 1 ? "action" : "actions"} · active days: ${active}/7`,
    calendar: "Your activity · 12 weeks", calendarHint: "Weeks start on Monday, in your device’s timezone. Hover, focus, or tap a day for its count; select it to see actions. Use arrow keys to explore.",
    less: "Less", more: "More", clearDay: "Show recent actions", emptyDay: "No completed actions on this day.",
    dayCount: (count) => `${count.toLocaleString("en")} completed ${count === 1 ? "action" : "actions"}`,
    recent: "Recent completed actions",
    empty: "Your completed actions will appear here. One small action is enough to begin.",
    unknown: "Previously available tip", loading: "Loading your progress…", unavailable: "Progress is unavailable. Try refreshing completed actions.",
  },
  "sr-Latn": {
    achievements: "Dostignuća",
    yearHint: "Na manjim ekranima pomeraj kalendar vodoravno da vidiš celu godinu.",
    view: "Prikaz kalendara", weeks: "12 nedelja", year: "Godina", yearTitle: "Tvoja aktivnost",
    previousYear: "Prethodna godina", nextYear: "Sledeća godina", loadingYear: "Učitavanje aktivnosti za ovu godinu…",
    yearError: "Aktivnost za ovu godinu nije mogla da se učita.", retryYear: "Pokušaj ponovo",
    weekSummary: (total, active) => `Prethodnih sedam dana: ${total.toLocaleString("sr-Latn")} ${srActions(total)} · aktivnih dana: ${active}/7`,
    calendar: "Tvoja aktivnost · 12 nedelja", calendarHint: "Nedelje počinju ponedeljkom, u vremenskoj zoni tvog uređaja. Pređi pokazivačem, fokusiraj ili dodirni dan za broj radnji; izaberi ga za pregled. Koristi strelice za kretanje.",
    less: "Manje", more: "Više", clearDay: "Prikaži nedavne radnje", emptyDay: "Nema završenih radnji ovog dana.",
    dayCount: (count) => `${count.toLocaleString("sr-Latn")} ${srActions(count, true)}`,
    recent: "Nedavno završene radnje",
    empty: "Ovde će se pojaviti tvoje završene radnje. Jedna mala radnja je dovoljna za početak.",
    unknown: "Ranije dostupan savet", loading: "Učitavanje napretka…", unavailable: "Napredak nije dostupan. Pokušaj da osvežiš završene radnje.",
  },
};

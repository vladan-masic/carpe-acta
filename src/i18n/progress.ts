import type { Locale } from "./locales";
type ProgressCopy = { week: string; recent: string; total: string; activeDays: string; empty: string; unknown: string; loading: string; unavailable: string; today: string; timezone: string };
export const progressMessages: Record<Locale, ProgressCopy> = {
  en: {
    week: "Your past seven days", recent: "Recent completed actions", total: "Actions completed", activeDays: "Days with an action",
    empty: "Your completed actions will appear here. One small action is enough to begin.",
    unknown: "Previously available tip", loading: "Loading your progress…", unavailable: "Progress is unavailable. Try refreshing completed actions.",
    today: "Today", timezone: "Today and the previous six days, in your device’s timezone. Showing up to ten recent completions.",
  },
  "sr-Latn": {
    week: "Tvojih prethodnih sedam dana", recent: "Nedavno završene radnje", total: "Završene radnje", activeDays: "Dani sa završenom radnjom",
    empty: "Ovde će se pojaviti tvoje završene radnje. Jedna mala radnja je dovoljna za početak.",
    unknown: "Ranije dostupan savet", loading: "Učitavanje napretka…", unavailable: "Napredak nije dostupan. Pokušaj da osvežiš završene radnje.",
    today: "Danas", timezone: "Danas i prethodnih šest dana, u vremenskoj zoni tvog uređaja. Prikazano je do deset nedavnih radnji.",
  },
};

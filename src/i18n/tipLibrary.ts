import type { Locale } from "./locales";

type LibraryMessages = {
  title: string;
  intro: string;
  search: string;
  category: string;
  effort: string;
  anyEffort: string;
  upTo: (minutes: number) => string;
  results: (shown: number, total: number) => string;
  empty: string;
  reset: string;
  more: string;
  try: string;
};

export const tipLibraryMessages: Record<Locale, LibraryMessages> = {
  en: {
    title: "Browse all tips",
    intro: "Find one small action. Search titles, descriptions, and actions; time estimates apply to the immediate action.",
    search: "Search tips", category: "Category", effort: "Maximum effort",
    anyEffort: "Any duration", upTo: (minutes) => `Up to ${minutes} min`,
    results: (shown, total) => `Showing ${shown} of ${total} tips`,
    empty: "No tips match. Try different words, a different category, or more time.",
    reset: "Clear search and filters", more: "Show more", try: "Try this",
  },
  "sr-Latn": {
    title: "Pregledaj sve savete",
    intro: "Pronađi jednu malu akciju. Pretraži naslove, opise i akcije; procenjeno vreme se odnosi na neposrednu akciju.",
    search: "Pretraži savete", category: "Kategorija", effort: "Najviše vremena",
    anyEffort: "Bilo koje trajanje", upTo: (minutes) => `Do ${minutes} min`,
    results: (shown, total) => `Prikazano ${shown} od ${total} saveta`,
    empty: "Nema saveta koji odgovaraju pretrazi. Probaj druge reči, drugu kategoriju ili više vremena.",
    reset: "Obriši pretragu i filtere", more: "Prikaži još", try: "Probaj ovo",
  },
};

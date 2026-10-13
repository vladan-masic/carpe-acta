import type { Locale } from "./locales";

type FavoritesSearchMessages = {
  invitation: string;
  search: string;
  category: string;
  all: string;
  reset: string;
  empty: string;
  results: (shown: number, total: number) => string;
};

export const favoritesSearchMessages: Record<Locale, FavoritesSearchMessages> = {
  en: {
    invitation: "A little collection for the days ahead.",
    search: "Search favorites",
    category: "Favorite category",
    all: "All categories",
    reset: "Clear search and filters",
    empty: "No favorites match. Try different words or another category, or clear the filters.",
    results: (shown, total) => `Showing ${shown} of ${total} favorites`,
  },
  "sr-Latn": {
    invitation: "Mala zbirka za dane koji dolaze.",
    search: "Pretraži omiljene savete",
    category: "Kategorija omiljenih saveta",
    all: "Sve kategorije",
    reset: "Obriši pretragu i filtere",
    empty: "Nema omiljenih saveta koji odgovaraju pretrazi. Probaj druge reči ili drugu kategoriju, ili obriši filtere.",
    results: (shown, total) => `Prikazano ${shown} od ${total} omiljenih saveta`,
  },
};

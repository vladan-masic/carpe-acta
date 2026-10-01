import type { Locale } from "./locales";

type SyncMessages = { account: string; busy: string; error: string; refresh: string; import: string; importHint: string };
export const favoritesMessages: Record<Locale, SyncMessages> = {
  en: {
    account: "Saved to your account. Available when you sign in on another device.",
    busy: "Syncing favorites…",
    error: "Couldn’t sync favorites. Refresh to check your saved tips before making more changes.",
    refresh: "Refresh favorites",
    import: "Import browser favorites",
    importHint: "Add this browser’s guest favorites to your account. Your browser copy will stay here.",
  },
  "sr-Latn": {
    account: "Sačuvano na tvom nalogu. Dostupno kada se prijaviš na drugom uređaju.",
    busy: "Sinhronizacija omiljenih saveta…",
    error: "Sinhronizacija nije uspela. Osveži omiljene savete pre novih izmena.",
    refresh: "Osveži omiljene savete",
    import: "Uvezi omiljene savete iz pregledača",
    importHint: "Dodaj omiljene savete sačuvane bez prijave na svoj nalog. Kopija u pregledaču ostaje sačuvana.",
  },
};

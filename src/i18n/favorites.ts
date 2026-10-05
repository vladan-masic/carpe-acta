import type { Locale } from "./locales";

type SyncMessages = { busy: string; error: string; refresh: string; import: string };
export const favoritesMessages: Record<Locale, SyncMessages> = {
  en: {
    busy: "Syncing favorites…",
    error: "Couldn’t sync favorites. Refresh to check your saved tips before making more changes.",
    refresh: "Refresh favorites",
    import: "Import browser favorites",
  },
  "sr-Latn": {
    busy: "Sinhronizacija omiljenih saveta…",
    error: "Sinhronizacija nije uspela. Osveži omiljene savete pre novih izmena.",
    refresh: "Osveži omiljene savete",
    import: "Uvezi omiljene savete iz pregledača",
  },
};

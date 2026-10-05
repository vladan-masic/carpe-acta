import type { Locale } from "./locales";
type Copy = { title: string; saving: string; failed: string; retry: string; refresh: string; import: string; imported: string; unavailable: string; unreadable: string };
export const completionMessages: Record<Locale, Copy> = {
  en: {
    title: "Completed actions",
    saving: "Saving…",
    failed: "We couldn’t confirm this save. Retry before moving on; retries won’t create duplicates.",
    retry: "Retry save",
    refresh: "Refresh completed actions",
    import: "Import browser history",
    imported: "Browser history imported.",
    unavailable: "Couldn’t sync completed actions. Refresh or retry the save.",
    unreadable: "Your browser history could not be read. It has been left untouched.",
  },
  "sr-Latn": {
    title: "Završene radnje",
    saving: "Čuvanje…",
    failed: "Nismo uspeli da potvrdimo čuvanje. Pokušaj ponovo pre nego što nastaviš; ponovni pokušaj neće napraviti duplikat.",
    retry: "Pokušaj ponovo",
    refresh: "Osveži završene radnje",
    import: "Uvezi istoriju iz pregledača",
    imported: "Istorija iz pregledača je uvezena.",
    unavailable: "Sinhronizacija završenih radnji nije uspela. Osveži prikaz ili ponovo pokušaj čuvanje.",
    unreadable: "Istorija u pregledaču nije mogla da se pročita. Ostala je neizmenjena.",
  },
};

import type { Locale } from "./locales";
type Copy = { title: string; account: string; guest: string; saving: string; failed: string; retry: string; refresh: string; import: string; importHint: string; imported: string; unavailable: string; unreadable: string };
export const completionMessages: Record<Locale, Copy> = {
  en: {
    title: "Completed actions",
    account: "Saved to your account. Refresh to see actions completed on another device.",
    guest: "Saved in this browser. Sign in to sync completed actions across devices.",
    saving: "Saving…",
    failed: "We couldn’t confirm this save. Retry before moving on; retries won’t create duplicates.",
    retry: "Retry save",
    refresh: "Refresh completed actions",
    import: "Import browser history",
    importHint: "Add this browser’s completed actions to your account. The browser copy stays here; importing again won’t duplicate records.",
    imported: "Browser history imported.",
    unavailable: "Couldn’t sync completed actions. Refresh or retry the save.",
    unreadable: "Your browser history could not be read. It has been left untouched.",
  },
  "sr-Latn": {
    title: "Završene radnje",
    account: "Sačuvano na tvom nalogu. Osveži prikaz da vidiš radnje završene na drugom uređaju.",
    guest: "Sačuvano u ovom pregledaču. Prijavi se za sinhronizaciju završenih radnji između uređaja.",
    saving: "Čuvanje…",
    failed: "Nismo uspeli da potvrdimo čuvanje. Pokušaj ponovo pre nego što nastaviš; ponovni pokušaj neće napraviti duplikat.",
    retry: "Pokušaj ponovo",
    refresh: "Osveži završene radnje",
    import: "Uvezi istoriju iz pregledača",
    importHint: "Dodaj završene radnje iz ovog pregledača na svoj nalog. Kopija ostaje u pregledaču; ponovni uvoz neće napraviti duplikate.",
    imported: "Istorija iz pregledača je uvezena.",
    unavailable: "Sinhronizacija završenih radnji nije uspela. Osveži prikaz ili ponovo pokušaj čuvanje.",
    unreadable: "Istorija u pregledaču nije mogla da se pročita. Ostala je neizmenjena.",
  },
};

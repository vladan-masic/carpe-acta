import type { Locale } from "./locales";

type Copy = {
  browser: string; account: string; checking: string; location: string;
  guestHint: string; accountHint: string; separate: string; logout: string;
  importTitle: string; importHint: string; favorites: string; history: string;
  count: (count: number) => string; unreadable: string; empty: string;
  added: string; syncing: string; failed: string; refresh: string;
};
export const storageMessages: Record<Locale, Copy> = {
  en: {
    browser: "This browser only", account: "Your account", checking: "Checking storage…",
    location: "Favorites & history",
    guestHint: "Log in to save across devices.",
    accountHint: "Available on devices where you sign in.",
    separate: "Signing in does not import your browser saves.",
    logout: "Logging out brings back this browser’s separate saves.",
    importTitle: "Copy browser saves to your account",
    importHint: "Browser copies stay here. Repeating an import won’t create duplicates.",
    favorites: "Favorites", history: "Completed actions",
    count: (count) => `${count} in this browser`,
    unreadable: "Browser storage couldn’t be confirmed.",
    empty: "Nothing in this browser to copy.",
    added: "Already copied to this account.", syncing: "Syncing account data…",
    failed: "Couldn’t finish. Refresh and try again.", refresh: "Refresh account data",
  },
  "sr-Latn": {
    browser: "Samo ovaj pregledač", account: "Tvoj nalog", checking: "Proveravamo mesto čuvanja…",
    location: "Omiljeni saveti i istorija",
    guestHint: "Prijavi se za čuvanje na više uređaja.",
    accountHint: "Dostupno na uređajima na kojima se prijaviš.",
    separate: "Prijava ne uvozi podatke sačuvane u pregledaču.",
    logout: "Posle odjave ponovo vidiš zasebne podatke iz ovog pregledača.",
    importTitle: "Kopiraj podatke iz pregledača na nalog",
    importHint: "Kopije ostaju u pregledaču. Ponovni uvoz ne pravi duplikate.",
    favorites: "Omiljeni saveti", history: "Završene radnje",
    count: (count) => `${count} u ovom pregledaču`,
    unreadable: "Nije moguće potvrditi podatke sačuvane u pregledaču.",
    empty: "U ovom pregledaču nema podataka za kopiranje.",
    added: "Već kopirano na ovaj nalog.", syncing: "Sinhronizacija podataka naloga…",
    failed: "Nije uspelo. Osveži podatke i pokušaj ponovo.", refresh: "Osveži podatke naloga",
  },
};

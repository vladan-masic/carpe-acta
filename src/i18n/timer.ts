import type { Locale } from "./locales";

type TimerMessages = {
  alerts: string; sound: string; preview: string; notifications: string; tab: string; dismiss: string;
  finishedTitle: string; notificationBody: string; limitation: string; blocked: string; unavailable: string;
  soundFailed: string; unsaved: string; requesting: string;
  title: string; start: string; pause: string; resume: string; reset: string; keepGoing: string;
  remaining: string; extra: string; running: string; paused: string; expired: string; continuing: string;
};

export const timerMessages: Record<Locale, TimerMessages> = {
  en: {
    alerts: "Timer alerts", sound: "Play a soft chime", preview: "Preview sound",
    notifications: "Browser notification", tab: "Show timer finished in the tab title", dismiss: "Dismiss alert",
    finishedTitle: "Timer finished", notificationBody: "Your timer is done. You can keep going or mark the action complete.",
    limitation: "Settings stay in this browser. Keep this page open; alerts may be delayed if your browser suspends it. Notifications are not supported in every browser, especially on mobile.",
    blocked: "Notifications are blocked. Allow them in your browser’s site settings, then enable this option again.",
    unavailable: "Notifications are unavailable in this browser. The timer and tab-title alert still work.",
    soundFailed: "Sound could not play. Try Preview sound, and check your browser’s sound settings.",
    unsaved: "These settings could not be saved. They apply to this timer only.", requesting: "Waiting for notification permission…",
    title: "Action timer", start: "Start timer", pause: "Pause", resume: "Resume", reset: "Reset timer",
    keepGoing: "Keep going", remaining: "Time remaining", extra: "Extra time",
    running: "Timer running. You can pause or stop whenever you need.", paused: "Timer paused.",
    expired: "Time’s up. You can stop here or keep going. Mark the action done only when you’re ready.",
    continuing: "Counting extra time. You can stop whenever you need.",
  },
  "sr-Latn": {
    alerts: "Obaveštenja tajmera", sound: "Pusti blag zvuk", preview: "Preslušaj zvuk",
    notifications: "Obaveštenje pregledača", tab: "Prikaži istek tajmera u naslovu kartice", dismiss: "Ukloni obaveštenje",
    finishedTitle: "Vreme je isteklo", notificationBody: "Tajmer je završen. Možeš da nastaviš ili označiš akciju kao urađenu.",
    limitation: "Podešavanja ostaju u ovom pregledaču. Ostavi stranicu otvorenu; obaveštenja mogu kasniti ako je pregledač suspenduje. Ne podržavaju svi pregledači obaveštenja, naročito na telefonu.",
    blocked: "Obaveštenja su blokirana. Dozvoli ih u podešavanjima sajta u pregledaču, pa ponovo uključi ovu opciju.",
    unavailable: "Obaveštenja nisu dostupna u ovom pregledaču. Tajmer i obaveštenje u naslovu kartice i dalje rade.",
    soundFailed: "Zvuk nije mogao da se pusti. Probaj Preslušaj zvuk i proveri podešavanja zvuka u pregledaču.",
    unsaved: "Podešavanja nisu sačuvana. Važe samo za ovaj tajmer.", requesting: "Čeka se dozvola za obaveštenja…",
    title: "Tajmer za akciju", start: "Pokreni tajmer", pause: "Pauziraj", resume: "Nastavi", reset: "Resetuj tajmer",
    keepGoing: "Nastavi dalje", remaining: "Preostalo vreme", extra: "Dodatno vreme",
    running: "Tajmer je pokrenut. Možeš da pauziraš ili staneš kad god ti je potrebno.", paused: "Tajmer je pauziran.",
    expired: "Vreme je isteklo. Možeš da staneš ili nastaviš. Označi akciju kao urađenu tek kada budeš spreman/spremna.",
    continuing: "Meri se dodatno vreme. Možeš da staneš kad god ti je potrebno.",
  },
};

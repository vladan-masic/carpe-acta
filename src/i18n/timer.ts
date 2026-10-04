import type { Locale } from "./locales";

type TimerMessages = {
  title: string; start: string; pause: string; resume: string; reset: string; keepGoing: string;
  remaining: string; extra: string; running: string; paused: string; expired: string; continuing: string;
};

export const timerMessages: Record<Locale, TimerMessages> = {
  en: {
    title: "Action timer", start: "Start timer", pause: "Pause", resume: "Resume", reset: "Reset timer",
    keepGoing: "Keep going", remaining: "Time remaining", extra: "Extra time",
    running: "Timer running. You can pause or stop whenever you need.", paused: "Timer paused.",
    expired: "Time’s up. You can stop here or keep going. Mark the action done only when you’re ready.",
    continuing: "Counting extra time. You can stop whenever you need.",
  },
  "sr-Latn": {
    title: "Tajmer za akciju", start: "Pokreni tajmer", pause: "Pauziraj", resume: "Nastavi", reset: "Resetuj tajmer",
    keepGoing: "Nastavi dalje", remaining: "Preostalo vreme", extra: "Dodatno vreme",
    running: "Tajmer je pokrenut. Možeš da pauziraš ili staneš kad god ti je potrebno.", paused: "Tajmer je pauziran.",
    expired: "Vreme je isteklo. Možeš da staneš ili nastaviš. Označi akciju kao urađenu tek kada budeš spreman/spremna.",
    continuing: "Meri se dodatno vreme. Možeš da staneš kad god ti je potrebno.",
  },
};

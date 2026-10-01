import type { Locale } from "./locales";
export const feedbackMessages: Record<Locale, { question: string; yes: string; no: string; saving: string; saved: string; error: string }> = {
  en: { question: "Was this helpful? (Optional)", yes: "Helped me start", no: "Not helpful this time", saving: "Saving feedback…", saved: "Feedback saved. You can change your answer.", error: "Couldn’t save feedback. Select an answer to retry." },
  "sr-Latn": { question: "Da li je pomoglo? (Opciono)", yes: "Pomoglo mi je da počnem", no: "Ovog puta nije pomoglo", saving: "Čuvanje odgovora…", saved: "Odgovor je sačuvan. Možeš da ga promeniš.", error: "Odgovor nije sačuvan. Izaberi odgovor da pokušaš ponovo." },
};

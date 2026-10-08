import type { Locale } from "./locales";

export const personalBestMessages: Record<Locale, {
  title: string; label: string; hint: string; empty: string; loading: string;
  error: string; retry: string; days: (count: number) => string; week: (date: string) => string;
}> = {
  en: {
    title: "Personal best", label: "Most active days in a week",
    hint: "Monday–Sunday, including this week. Days don’t need to be consecutive. A moment to appreciate, not a target to beat.",
    empty: "Your first completed action will start your record.", loading: "Loading your personal best…",
    error: "Your personal best could not be loaded.", retry: "Retry personal best",
    days: count => `${count} active ${count === 1 ? "day" : "days"}`,
    week: date => `First reached in the week starting ${date}.`,
  },
  "sr-Latn": {
    title: "Lični rekord", label: "Najviše aktivnih dana u jednoj nedelji",
    hint: "Ponedeljak–nedelja, uključujući ovu nedelju. Dani ne moraju biti uzastopni. Trenutak da ceniš svoj trud, bez obaveze da nadmašiš rekord.",
    empty: "Prva završena radnja započeće tvoj rekord.", loading: "Učitavanje ličnog rekorda…",
    error: "Lični rekord nije mogao da se učita.", retry: "Ponovo učitaj lični rekord",
    days: count => `${count} ${count === 1 ? "aktivan dan" : count < 5 ? "aktivna dana" : "aktivnih dana"}`,
    week: date => `Prvi put ostvareno u nedelji koja počinje ${date}`,
  },
};

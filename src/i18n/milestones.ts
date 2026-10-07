import type { Locale } from "./locales";
type Copy = { title: string; hint: string; all: string; loading: string; error: string; retry: string;
  actions: string; days: string; badge: (kind: "actions" | "days", n: number) => string;
  earned: string; locked: string; none: string; next: (n: number, target: number) => string; complete: string; celebration: string };
export const milestoneMessages: Record<Locale, Copy> = {
  en: {
    title: "Personal milestones", hint: "Every saved action counts. Active days don’t need to be consecutive.", all: "View earned and next milestones",
    loading: "Loading milestones…", error: "Milestones could not be loaded.", retry: "Retry milestones",
    actions: "Completed actions", days: "Active days", badge: (kind, n) => kind === "actions" ? n === 1 ? "First action" : `${n} actions` : n === 1 ? "First active day" : `${n} active days`,
    earned: "Earned", locked: "Not yet earned", none: "Your first badge is ahead.", next: (n, target) => `${n} of ${target} toward the next badge`, complete: "All milestones in this group reached.", celebration: "New milestone reached:",
  },
  "sr-Latn": {
    title: "Lična dostignuća", hint: "Svaka sačuvana radnja se računa. Aktivni dani ne moraju biti uzastopni.", all: "Prikaži ostvarena i sledeća dostignuća",
    loading: "Učitavanje dostignuća…", error: "Dostignuća nisu mogla da se učitaju.", retry: "Pokušaj ponovo",
    actions: "Završene radnje", days: "Aktivni dani", badge: (kind, n) => kind === "actions" ? n === 1 ? "Prva radnja" : `${n} radnji` : n === 1 ? "Prvi aktivan dan" : `${n} aktivnih dana`,
    earned: "Ostvareno", locked: "Još nije ostvareno", none: "Prva značka te čeka.", next: (n, target) => `${n} od ${target} do sledeće značke`, complete: "Sva dostignuća u ovoj grupi su ostvarena.", celebration: "Novo dostignuće:",
  },
};

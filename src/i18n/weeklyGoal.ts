import type { Locale } from "./locales";
type Copy = { achievements: string; achievementHint: string; achievementError: string; retryAchievements: string; loadingAchievements: string; achievementHistory: string; weeksMet: (n: number) => string; achievedWeek: (date: string, target: number) => string; title: string; hint: string; target: string; off: string; suggested: string; days: (n: number) => string; progress: (n: number, target: number) => string; reached: string; active: string; inactive: string; future: string; browser: string; account: string; loading: string; saving: string; error: string };
export const weeklyGoalMessages: Record<Locale, Copy> = {
  en: {
    achievements: "Weeks I met my goal", achievementHint: "Recorded from now on when you reach your goal in the app. Each week keeps its original achieved target; weeks don’t need to be consecutive.",
    achievementError: "Weekly achievements could not be saved or loaded.", retryAchievements: "Retry achievements", loadingAchievements: "Loading weekly achievements…", achievementHistory: "View achieved weeks",
    weeksMet: n => `${n} ${n === 1 ? "week" : "weeks"} achieved`, achievedWeek: (date, target) => `Week of ${date} · Goal: ${target} ${target === 1 ? "active day" : "active days"}`,

    title: "Weekly activity goal", hint: "Monday–Sunday · Any days count; they don’t need to be consecutive.",
    target: "Active days per week", off: "Off", suggested: "3 days (suggested)", days: n => `${n} ${n === 1 ? "day" : "days"}`,
    progress: (n, target) => `You took action on ${n} of ${target} days this week.`, reached: "Weekly goal reached.",
    active: "Active", inactive: "No actions", future: "Upcoming",
    browser: "Goal saved in this browser.", account: "Goal saved to your account.", loading: "Loading weekly goal…", saving: "Saving goal…", error: "Could not load or save your goal. Try choosing it again or refresh the page.",
  },
  "sr-Latn": {
    achievements: "Nedelje u kojima je cilj ostvaren", achievementHint: "Beleži se od sada, kada ostvariš cilj u aplikaciji. Svaka nedelja čuva cilj sa kojim je ostvarena; nedelje ne moraju biti uzastopne.",
    achievementError: "Nedeljna dostignuća nisu mogla da se sačuvaju ili učitaju.", retryAchievements: "Pokušaj ponovo", loadingAchievements: "Učitavanje nedeljnih dostignuća…", achievementHistory: "Prikaži ostvarene nedelje",
    weeksMet: n => `Broj ostvarenih nedelja: ${n}`, achievedWeek: (date, target) => `Nedelja od ${date} · Cilj: ${target} ${target === 1 ? "aktivan dan" : target < 5 ? "aktivna dana" : "aktivnih dana"}`,

    title: "Nedeljni cilj aktivnosti", hint: "Ponedeljak–nedelja · Dani ne moraju biti uzastopni.",
    target: "Broj aktivnih dana nedeljno", off: "Isključeno", suggested: "3 dana (predlog)", days: n => `${n} ${n === 1 ? "dan" : "dana"}`,
    progress: (n, target) => `Aktivnih dana ove nedelje: ${n} od ${target}.`, reached: "Nedeljni cilj je ostvaren.",
    active: "Aktivan dan", inactive: "Bez radnji", future: "Predstoji",
    browser: "Cilj se čuva u ovom pregledaču.", account: "Cilj se čuva na tvom nalogu.", loading: "Učitavanje nedeljnog cilja…", saving: "Čuvanje cilja…", error: "Cilj nije mogao da se učita ili sačuva. Pokušaj ponovo da ga izabereš ili osveži stranicu.",
  },
};

import type { CategoryId } from "../types/tip";
import type { Locale } from "./locales";

type Messages = {
  metadata: {
    description: string;
  };
  languageSelectorLabel: string;
  menuLabel: string;
  navigation: { label: string; start: string; browse: string; progress: string };
  hero: {
    eyebrow: string;
    lede: string;
  };
  dailyQuestLabel: string;
  generator: {
    eyebrow: string;
    title: string;
    categoriesLabel: string;
    allCategories: string;
    moreCategories: string;
    fewerCategories: string;
    actionLabel: string;
    generateButton: string;
  };
  completion: {
    button: string;
    completed: string;
    confirmation: string;
    unsaved: string;
    next: string;
  };
  favorites: {
    title: string;
    save: string;
    saved: string;
    toggle: string;
    description: string;
    empty: string;
    open: string;
    unsaved: string;
  };
  footer: {
    motto: string;
    createdBy: string;
    backToTop: string;
  };
  categories: Record<CategoryId, string>;
  formatEffort: (minutes: number) => string;
};

const en = {
  favorites: {
    title: "Favorites",
    save: "Save tip",
    saved: "Saved",
    toggle: "Favorite",
    description: "Your useful tips, newest saves first. Saved in this browser.",
    empty: "No favorites yet. Use the star on any tip to keep it here for later.",
    open: "Use this tip",
    unsaved: "Your browser couldn’t save your favorites. Changes will only last for this visit.",
  },
  completion: {
    button: "I did it ✓",
    completed: "Completed ✓",
    confirmation: "One small action done. That’s progress.",
    unsaved: "Your browser couldn’t save this completion. It will only be remembered for this visit.",
    next: "Try another action",
  },
  metadata: {
    description:
      "Carpe Acta helps you beat procrastination with practical tips and small daily quests.",
  },
  languageSelectorLabel: "Select language",
  menuLabel: "Menu",
  navigation: { label: "Main navigation", start: "Start", browse: "Browse tips", progress: "Progress" },
  hero: {
    eyebrow: "Anti-procrastination quests",
    lede:
      "Stop waiting for motivation. Draw one practical action, do the next small thing, and build momentum one quest at a time.",
  },
  dailyQuestLabel: "Today’s Quest",
  generator: {
    eyebrow: "Random tip",
    title: "Generate your next move",
    categoriesLabel: "Tip categories",
    allCategories: "All",
    moreCategories: "Show categories",
    fewerCategories: "Hide categories",
    actionLabel: "Do this now",
    generateButton: "Generate a New Quest",
  },
  footer: {
    motto: "Small actions. Real momentum.",
    createdBy: "Created by",
    backToTop: "Back to top",
  },
  categories: {
    focus: "Focus",
    dopamine: "Dopamine",
    planning: "Planning",
    creativity: "Creativity",
    coding: "Coding & Creative Projects",
    studying: "Studying & Learning",
    environment: "Environment",
    discipline: "Discipline",
    starting: "Starting",
    overwhelm: "Overwhelm",
    perfectionism: "Perfectionism",
    "low-motivation": "Low Motivation",
    "low-energy": "Low Energy",
    "fear-anxiety": "Fear & Anxiety",
    "overthinking": "Overthinking & Decision Paralysis",
    "habits": "Habits & Consistency",
    "deadlines": "Time & Deadlines",
    "work": "Work & Career",
    "exercise": "Exercise & Physical Activity",
    "life-admin": "Household / Life Admin",
    "digital-distraction": "Phone & Internet Procrastination",
  },
  formatEffort: (minutes) => `${minutes} min`,
} satisfies Messages;

const srLatn = {
  favorites: {
    title: "Omiljeni saveti",
    save: "Sačuvaj savet",
    saved: "Sačuvano",
    toggle: "Omiljeni savet",
    description: "Korisni saveti, od najskorije sačuvanih. Čuvaju se u ovom pregledaču.",
    empty: "Još nema omiljenih saveta. Označi zvezdicu na savetu da ga sačuvaš ovde za kasnije.",
    open: "Primeni ovaj savet",
    unsaved: "Pregledač nije mogao da sačuva omiljene savete. Promene će važiti samo tokom ove posete.",
  },
  completion: {
    button: "Urađeno ✓",
    completed: "Završeno ✓",
    confirmation: "Jedna mala akcija je završena. To je napredak.",
    unsaved: "Pregledač nije mogao da sačuva ovu završenu akciju. Biće zapamćena samo tokom ove posete.",
    next: "Probaj drugu akciju",
  },
  metadata: {
    description:
      "Carpe Acta pomaže u borbi protiv odlaganja praktičnim savetima i malim dnevnim misijama.",
  },
  languageSelectorLabel: "Izaberi jezik",
  menuLabel: "Meni",
  navigation: { label: "Glavna navigacija", start: "Počni", browse: "Pregledaj savete", progress: "Napredak" },
  hero: {
    eyebrow: "Misije protiv odlaganja",
    lede:
      "Prestani da čekaš motivaciju. Izaberi jednu praktičnu akciju, uradi sledeću malu stvar i gradi zamah, misiju po misiju.",
  },
  dailyQuestLabel: "Današnja misija",
  generator: {
    eyebrow: "Nasumični savet",
    title: "Odredi svoj sledeći potez",
    categoriesLabel: "Kategorije saveta",
    allCategories: "Sve",
    moreCategories: "Prikaži kategorije",
    fewerCategories: "Sakrij kategorije",
    actionLabel: "Uradi ovo sada",
    generateButton: "Generiši novu misiju",
  },
  footer: {
    motto: "Mali koraci. Pravi zamah.",
    createdBy: "Kreirao",
    backToTop: "Nazad na vrh",
  },
  categories: {
    focus: "Fokus",
    dopamine: "Dopamin",
    planning: "Planiranje",
    creativity: "Kreativnost",
    coding: "Programiranje i kreativni projekti",
    studying: "Učenje i usvajanje znanja",
    environment: "Okruženje",
    discipline: "Disciplina",
    starting: "Započinjanje",
    overwhelm: "Preopterećenost",
    perfectionism: "Perfekcionizam",
    "low-motivation": "Slaba motivacija",
    "low-energy": "Manjak energije",
    "fear-anxiety": "Strah i anksioznost",
    "overthinking": "Preterano razmišljanje i neodlučnost",
    "habits": "Navike i doslednost",
    "deadlines": "Vreme i rokovi",
    "work": "Posao i karijera",
    "exercise": "Vežbanje i fizička aktivnost",
    "life-admin": "Domaćinstvo i svakodnevne obaveze",
    "digital-distraction": "Odlaganje uz telefon i internet",
  },
  formatEffort: (minutes) => `${minutes} min`,
} satisfies Messages;

export const messages: Record<Locale, Messages> = {
  en,
  "sr-Latn": srLatn,
};

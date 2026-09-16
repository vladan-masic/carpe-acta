import type { CategoryId } from "../types/tip";
import type { Locale } from "./locales";

type Messages = {
  metadata: {
    description: string;
  };
  languageSelectorLabel: string;
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
    actionLabel: string;
    generateButton: string;
  };
  preview: {
    eyebrow: string;
    title: string;
  };
  completion: {
    button: string;
    completed: string;
    confirmation: string;
    unsaved: string;
    next: string;
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
    actionLabel: "Do this now",
    generateButton: "Generate a New Quest",
  },
  preview: {
    eyebrow: "Content base",
    title: "Browse starter tips",
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
    coding: "Coding",
    studying: "Studying",
    environment: "Environment",
    discipline: "Discipline",
    starting: "Starting",
    overwhelm: "Overwhelm",
    perfectionism: "Perfectionism",
  },
  formatEffort: (minutes) => `${minutes} min`,
} satisfies Messages;

const srLatn = {
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
    actionLabel: "Uradi ovo sada",
    generateButton: "Generiši novu misiju",
  },
  preview: {
    eyebrow: "Baza sadržaja",
    title: "Pregledaj početne savete",
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
    coding: "Programiranje",
    studying: "Učenje",
    environment: "Okruženje",
    discipline: "Disciplina",
    starting: "Započinjanje",
    overwhelm: "Preopterećenost",
    perfectionism: "Perfekcionizam",
  },
  formatEffort: (minutes) => `${minutes} min`,
} satisfies Messages;

export const messages: Record<Locale, Messages> = {
  en,
  "sr-Latn": srLatn,
};

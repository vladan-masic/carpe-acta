import type { CategoryId, TipId, TipTranslation } from "../types/tip";
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
  categories: Record<CategoryId, string>;
  tips: Record<TipId, TipTranslation>;
  formatEffort: (minutes: number) => string;
};

const en = {
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
  categories: {
    focus: "Focus",
    dopamine: "Dopamine",
    planning: "Planning",
    creativity: "Creativity",
    coding: "Coding",
    studying: "Studying",
    environment: "Environment",
    discipline: "Discipline",
  },
  tips: {
    "two-minute-start": {
      title: "Two-Minute Start",
      text: "Lower the entry cost until starting feels almost too small to resist.",
      action: "Work on your most important task for exactly two minutes.",
    },
    "phone-distance": {
      title: "Move the Phone",
      text: "Friction beats willpower. Make the distraction physically harder to reach.",
      action: "Put your phone in another room before starting your next task.",
    },
    "next-visible-step": {
      title: "Name the Next Visible Step",
      text: "Vague tasks create resistance. Concrete next actions give your brain a target.",
      action: "Write one sentence that starts with: The next visible step is...",
    },
    "messy-first-pass": {
      title: "Messy First Pass",
      text: "Perfectionism often disguises procrastination. Give yourself permission to draft badly.",
      action: "Create a rough version for ten minutes without editing it.",
    },
    "single-tab-sprint": {
      title: "Single-Tab Sprint",
      text: "Context switching drains momentum. One task and one tab is enough for a short sprint.",
      action: "Close unrelated tabs and code one small improvement for fifteen minutes.",
    },
    "study-recall": {
      title: "Recall Before Review",
      text: "Active recall turns passive reading into useful memory work.",
      action: "Before rereading, write down everything you remember about the topic.",
    },
    "reset-desk": {
      title: "Reset the Surface",
      text: "A cleaner workspace reduces the number of decisions competing for attention.",
      action: "Clear your desk until only the current task remains visible.",
    },
    "commitment-line": {
      title: "Commitment Line",
      text: "A tiny written promise can make action feel more real than an intention in your head.",
      action: "Write: I will work on this until the next natural stopping point.",
    },
  },
  formatEffort: (minutes) => `${minutes} min`,
} satisfies Messages;

const srLatn = {
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
  categories: {
    focus: "Fokus",
    dopamine: "Dopamin",
    planning: "Planiranje",
    creativity: "Kreativnost",
    coding: "Programiranje",
    studying: "Učenje",
    environment: "Okruženje",
    discipline: "Disciplina",
  },
  tips: {
    "two-minute-start": {
      title: "Početak od dva minuta",
      text: "Smanji težinu početka sve dok prvi korak ne postane gotovo previše mali da bi mu se odupreo.",
      action: "Radi na svom najvažnijem zadatku tačno dva minuta.",
    },
    "phone-distance": {
      title: "Skloni telefon",
      text: "Dodatni napor pobeđuje snagu volje. Učini da do ometanja bude fizički teže doći.",
      action: "Ostavi telefon u drugoj prostoriji pre nego što započneš sledeći zadatak.",
    },
    "next-visible-step": {
      title: "Imenuj sledeći vidljivi korak",
      text: "Nejasni zadaci stvaraju otpor. Konkretne sledeće akcije daju mozgu jasan cilj.",
      action: "Napiši jednu rečenicu koja počinje sa: Sledeći vidljivi korak je...",
    },
    "messy-first-pass": {
      title: "Neuredna prva verzija",
      text: "Perfekcionizam često prikriva odlaganje. Dozvoli sebi da prva verzija bude loša.",
      action: "Deset minuta pravi grubu verziju bez ikakvog uređivanja.",
    },
    "single-tab-sprint": {
      title: "Sprint sa jednom karticom",
      text: "Prebacivanje između zadataka troši zamah. Jedan zadatak i jedna kartica dovoljni su za kratak sprint.",
      action: "Zatvori nepovezane kartice i petnaest minuta programiraj jedno malo poboljšanje.",
    },
    "study-recall": {
      title: "Priseti se pre ponavljanja",
      text: "Aktivno prisećanje pretvara pasivno čitanje u korisno vežbanje pamćenja.",
      action: "Pre ponovnog čitanja zapiši sve čega se sećaš o toj temi.",
    },
    "reset-desk": {
      title: "Raščisti radnu površinu",
      text: "Uredniji radni prostor smanjuje broj odluka koje se bore za tvoju pažnju.",
      action: "Raščisti sto tako da samo trenutni zadatak ostane vidljiv.",
    },
    "commitment-line": {
      title: "Rečenica obaveze",
      text: "Malo zapisano obećanje može učiniti akciju stvarnijom od namere koja ti je samo u glavi.",
      action: "Napiši: Radiću na ovome do sledeće prirodne tačke za zaustavljanje.",
    },
  },
  formatEffort: (minutes) => `${minutes} min`,
} satisfies Messages;

export const messages: Record<Locale, Messages> = {
  en,
  "sr-Latn": srLatn,
};

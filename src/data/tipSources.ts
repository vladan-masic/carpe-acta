import type { TipId } from "../types/tip";
import type { Locale } from "../i18n/locales";

export const habitSources = {
  "atomic-habits": { title: "Atomic Habits", author: "James Clear" },
  "tiny-habits": { title: "Tiny Habits", author: "BJ Fogg" },
} as const;
export type HabitSourceId = keyof typeof habitSources;
export type TipSource = {
  source: HabitSourceId;
  relationship: "inspired-by" | "related-reading";
  url: string;
  explanation: Record<Locale, string>;
};

// Conceptual overlap is not evidence of the existing tip's historical origin.
export const tipSources: Partial<Record<TipId, readonly TipSource[]>> = {
  "acknowledge-a-small-finish": [{
    source: "tiny-habits", relationship: "inspired-by", url: "https://tinyhabits.com/rewire/",
    explanation: {
      en: "Inspired by Fogg's practice of acknowledging a tiny behavior immediately afterward. This is an original exercise, not a promise about how quickly a habit will form.",
      "sr-Latn": "Inspirisano Foggovom praksom da se mala radnja prizna odmah po završetku. Ovo je originalna vežba, a ne obećanje o brzini stvaranja navike.",
    },
  }],
  "practice-one-quality": [{
    source: "atomic-habits", relationship: "inspired-by", url: "https://jamesclear.com/identity-based-habits",
    explanation: {
      en: "Inspired by Clear's connection between identity and concrete actions. This exercise practices a chosen quality without treating a missed action as a judgment of your worth.",
      "sr-Latn": "Inspirisano vezom između identiteta i konkretnih radnji koju opisuje Clear. Vežba služi praktikovanju izabrane osobine, bez procenjivanja tvoje vrednosti na osnovu propuštene radnje.",
    },
  }],
  "add-enjoyment-to-the-task": [{
    source: "atomic-habits", relationship: "inspired-by", url: "https://jamesclear.com/temptation-bundling",
    explanation: {
      en: "Inspired by Clear's explanation of pairing routine work with enjoyment. His article acknowledges earlier work, including Katy Milkman; this label does not claim he invented the technique.",
      "sr-Latn": "Inspirisano Clearovim objašnjenjem povezivanja rutinskog rada sa nečim prijatnim. Njegov članak navodi raniji rad, uključujući Katy Milkman; oznaka ne tvrdi da je on izumeo tehniku.",
    },
  }],
  "attach-to-an-existing-cue": [
    { source: "tiny-habits", relationship: "related-reading", url: "https://tinyhabits.com/design/", explanation: {
      en: "Fogg describes pairing a small behavior with an existing routine. This tip uses a similar cue-planning idea; this link does not establish its original source.",
      "sr-Latn": "Fogg opisuje povezivanje male radnje sa postojećom rutinom. Ovaj savet koristi sličnu ideju planiranja znaka za početak; veza ne potvrđuje njegovo izvorno poreklo.",
    } },
    { source: "atomic-habits", relationship: "related-reading", url: "https://jamesclear.com/habit-stacking", explanation: {
      en: "Clear discusses linking a new habit to an existing one and explicitly credits BJ Fogg for the anchoring method.",
      "sr-Latn": "Clear govori o povezivanju nove navike sa postojećom i izričito pripisuje metodu oslanjanja na postojeću rutinu BJ Foggu.",
    } },
  ],
};

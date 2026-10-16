import type { Locale } from "./locales";

export const annotations: Record<Locale, { generator: string; journey: string; footer: string }> = {
  en: {
    generator: "Small steps. Real change.",
    journey: "Every little step counts.",
    footer: "A brighter you. A kinder world. One small step at a time.",
  },
  "sr-Latn": {
    generator: "Mali koraci. Prava promena.",
    journey: "Svaki mali korak znači.",
    footer: "Vedriji ti. Nežniji svet. Korak po korak.",
  },
};

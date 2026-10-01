import type { Locale } from "./locales";
import type { StartBarrier } from "../data/startBarriers";
type Copy = { title: string; intro: string; question: string; back: string; another: string; prompt: string; matched: string; choices: Record<StartBarrier, string> };
export const helpMeStartMessages: Record<Locale, Copy> = {
  en: {
    title: "Help me start", intro: "Choose what’s getting in the way. Get one action you can try in five minutes or less.",
    question: "What’s making it hard to start?", back: "Back to random tips", another: "Try another suggestion",
    prompt: "Choose an option above to get a starting action.", matched: "A starting action for:",
    choices: { energy: "I have little energy", overwhelm: "There’s too much to do", fear: "I’m worried about it", uncertainty: "I don’t know the next step", perfectionism: "I want it to be perfect", distraction: "I keep getting distracted", motivation: "I don’t feel motivated", unsure: "I’m not sure" },
  },
  "sr-Latn": {
    title: "Pomozi mi da počnem", intro: "Izaberi šta te sprečava. Dobićeš jednu radnju koju možeš da probaš za najviše pet minuta.",
    question: "Šta ti otežava da počneš?", back: "Nazad na nasumične savete", another: "Predloži drugu radnju",
    prompt: "Izaberi opciju iznad da dobiješ radnju za početak.", matched: "Radnja za početak kada kažeš:",
    choices: { energy: "Imam malo energije", overwhelm: "Imam previše obaveza", fear: "Brinem zbog zadatka", uncertainty: "Ne znam sledeći korak", perfectionism: "Želim da bude savršeno", distraction: "Stalno mi nešto odvlači pažnju", motivation: "Nemam motivaciju", unsure: "Nisam siguran/na" },
  },
};

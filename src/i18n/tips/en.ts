import type { TipId, TipTranslation } from "../../types/tip";

export const enTips = {
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
} satisfies Record<TipId, TipTranslation>;

import type { TipMetadata } from "../types/tipMetadata";

export const tips = [
  {
    id: "two-minute-start",
    categoryId: "focus",
    effortMinutes: 2,
    tags: [],
  },
  {
    id: "phone-distance",
    categoryId: "dopamine",
    effortMinutes: 1,
    tags: [],
  },
  {
    id: "next-visible-step",
    categoryId: "planning",
    effortMinutes: 3,
    tags: [],
  },
  {
    id: "messy-first-pass",
    categoryId: "creativity",
    effortMinutes: 10,
    tags: [],
  },
  {
    id: "single-tab-sprint",
    categoryId: "coding",
    effortMinutes: 15,
    tags: [],
  },
  {
    id: "study-recall",
    categoryId: "studying",
    effortMinutes: 5,
    tags: [],
  },
  {
    id: "reset-desk",
    categoryId: "environment",
    effortMinutes: 4,
    tags: [],
  },
  {
    id: "commitment-line",
    categoryId: "discipline",
    effortMinutes: 1,
    tags: [],
  },
] as const satisfies readonly TipMetadata[];

export type CategoryId =
  | "focus"
  | "dopamine"
  | "planning"
  | "creativity"
  | "coding"
  | "studying"
  | "environment"
  | "discipline"
  | "starting"
  | "overwhelm"
  | "perfectionism"
  | "low-motivation"
  | "low-energy"
  | "fear-anxiety"
  | "overthinking"
  | "habits"
  | "deadlines"
  | "work"
  | "exercise"
  | "life-admin"
  | "digital-distraction";

export type TipMetadata = {
  id: string;
  categoryId: CategoryId;
  effortMinutes: number;
  tags: readonly string[];
};

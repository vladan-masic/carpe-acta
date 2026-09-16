export type CategoryId =
  | "focus"
  | "dopamine"
  | "planning"
  | "creativity"
  | "coding"
  | "studying"
  | "environment"
  | "discipline";

export type TipMetadata = {
  id: string;
  categoryId: CategoryId;
  effortMinutes: number;
  tags: readonly string[];
};

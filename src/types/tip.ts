export type CategoryId =
  | "focus"
  | "dopamine"
  | "planning"
  | "creativity"
  | "coding"
  | "studying"
  | "environment"
  | "discipline";

export type TipId =
  | "two-minute-start"
  | "phone-distance"
  | "next-visible-step"
  | "messy-first-pass"
  | "single-tab-sprint"
  | "study-recall"
  | "reset-desk"
  | "commitment-line";

export type Tip = {
  id: TipId;
  categoryId: CategoryId;
  effortMinutes: number;
};

export type TipTranslation = {
  title: string;
  text: string;
  action: string;
};

export type LocalizedTip = Tip &
  TipTranslation & {
    category: string;
    effort: string;
  };

import type { tips } from "../data/tips";
import type { TipMetadata } from "./tipMetadata";

export type { CategoryId, TipMetadata } from "./tipMetadata";

export type TipId = (typeof tips)[number]["id"];

export type Tip = TipMetadata & {
  id: TipId;
};

export type TipTranslation = {
  title: string;
  text: string;
  action: string;
  whyItWorks?: string;
};

export type LocalizedTip = Tip &
  TipTranslation & {
    category: string;
    effort: string;
  };

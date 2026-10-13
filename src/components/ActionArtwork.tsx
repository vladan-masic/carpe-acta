import type { CategoryId } from "../types/tip";
import beginning from "../assets/illustrations/action-a-small-beginning-640.webp";
import beginningSmall from "../assets/illustrations/action-a-small-beginning-320.webp";
import focus from "../assets/illustrations/action-a-moment-of-focus-640.webp";
import focusSmall from "../assets/illustrations/action-a-moment-of-focus-320.webp";
import breathe from "../assets/illustrations/action-room-to-breathe-640.webp";
import breatheSmall from "../assets/illustrations/action-room-to-breathe-320.webp";
import step from "../assets/illustrations/action-the-next-step-640.webp";
import stepSmall from "../assets/illustrations/action-the-next-step-320.webp";

const scenes = {
  beginning: [beginningSmall, beginning], focus: [focusSmall, focus],
  breathe: [breatheSmall, breathe], step: [stepSmall, step],
} as const;
type Scene = keyof typeof scenes;
// The art sets a theme; it never describes an action or changes its meaning.
const themes: Record<CategoryId, Scene> = {
  focus: "focus", dopamine: "breathe", planning: "beginning", creativity: "beginning",
  coding: "focus", studying: "focus", environment: "breathe", discipline: "step",
  starting: "beginning", overwhelm: "breathe", perfectionism: "beginning",
  "low-motivation": "step", "low-energy": "breathe", "fear-anxiety": "breathe",
  overthinking: "breathe", habits: "step", deadlines: "focus", work: "focus",
  exercise: "step", "life-admin": "beginning", "digital-distraction": "breathe",
};

// Both desk scenes share a visual family, so saved cards can avoid adjacent repeats.
export function artworkFamily(category: CategoryId) {
  const scene = themes[category];
  return scene === "beginning" || scene === "focus" ? "desk" : scene;
}

export function ActionArtwork({ category, scene, thumbnail = false }: {
  category?: CategoryId; scene?: Scene; thumbnail?: boolean;
}) {
  const theme = scene ?? (category ? themes[category] : "beginning");
  // The hero already supplies the large path scene. Reserve the second path
  // for collection thumbnails, avoiding two neighboring panoramic landscapes.
  const [small, large] = scenes[!thumbnail && theme === "step" ? "beginning" : theme];
  return <img className="action-scene" src={small} srcSet={`${small} 320w, ${large} 640w`}
    sizes={thumbnail ? "112px" : "(min-width: 1100px) 260px, 160px"}
    width="640" height="480" alt="" loading="lazy" decoding="async" />;
}

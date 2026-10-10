import type { CategoryId } from "../types/tip";

// One small, shared line vocabulary; category identity never depends on colour.
const paths: Record<CategoryId | "all", string> = {
  all: "M4 4h6v6H4z M14 4h6v6h-6z M4 14h6v6H4z M14 14h6v6h-6z",
  focus: "M9 3H3v6 M15 3h6v6 M3 15v6h6 M21 15v6h-6 M9 12h6 M12 9v6",
  dopamine: "m13 3-8 11h6l-1 7 9-12h-6z",
  planning: "M7 5h13 M7 12h13 M7 19h13 M3 5h.01 M3 12h.01 M3 19h.01",
  creativity: "m4 17-1 4 4-1L20 7l-3-3z M14 7l3 3",
  coding: "m8 6-6 6 6 6 M16 6l6 6-6 6 M14 3l-4 18",
  studying: "M12 6v15 M12 6C9 3 5 3 2 4v15c4-1 7-1 10 2 3-3 6-3 10-2V4c-3-1-7-1-10 2",
  environment: "M4 21V10l8-7 8 7v11 M9 21v-7h6v7 M2 21h20",
  discipline: "M12 3 4 6v6c0 4 4 7 8 9 4-2 8-5 8-9V6z m-4 9 3 3 5-6",
  starting: "M5 20V4l14 8z",
  overwhelm: "M3 7h18 M6 12h12 M9 17h6",
  perfectionism: "M20 8a9 9 0 1 0 1 7 M8 12l3 3 9-11",
  "low-motivation": "M12 3v3 M3 12h3 M18 12h3 M5 5l2 2 M19 5l-2 2 M7 18a6 6 0 1 1 10 0 M3 21h18",
  "low-energy": "M3 7h16v12H3z M19 11h3v4h-3 M6 10v6",
  "fear-anxiety": "M12 20C3 15 1 8 6 5c3-2 5 0 6 2 1-2 3-4 6-2 5 3 3 10-6 15z",
  overthinking: "M4 20v-6c0-3 3-4 8-4s8-1 8-4-4-4-8-3 M4 14c0-3 16-2 16 2s-7 5-11 4 M1 17l3 3 3-3",
  habits: "M20 10a8 8 0 0 0-14-5L3 8 M3 3v5h5 M4 14a8 8 0 0 0 14 5l3-3 M16 16h5v5",
  deadlines: "M8 3h8 M12 3v3 M18 5l2 2 M12 9v5l3 2 M21 14a9 9 0 1 1-18 0 9 9 0 0 1 18 0",
  work: "M8 7V3h8v4 M3 7h18v14H3z M3 12c6 3 12 3 18 0 M12 12v4",
  exercise: "M3 8v8 M7 5v14 M17 5v14 M21 8v8 M7 12h10",
  "life-admin": "M8 5H4v16h16V5h-4 M8 3h8v5H8z M8 13l2 2 6-4 M8 18h8",
  "digital-distraction": "M8 2h8a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2 M10 18h4 M3 3l18 18",
};

export function CategoryIcon({ category }: { category: CategoryId | "all" }) {
  return <svg className="category-icon" viewBox="0 0 24 24" width="20" height="20" fill="none"
    stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true" focusable="false"><path d={paths[category]} /></svg>;
}

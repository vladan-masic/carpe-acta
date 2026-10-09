import type { CategoryId } from "../../types/tip";

// One stroke vocabulary; category identity never relies on colour alone.
const paths: Record<CategoryId, string> = {
  focus: "M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16 M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8",
  starting: "M4 18h5v-5h5V8h6 M16 4l4 4-4 4",
  planning: "M5 5h14v15H5z M8 3v4 M16 3v4 M8 11h8 M8 15h5",
  "low-energy": "M12 21V11 M12 15C3 16 3 8 4 6c7 0 9 4 8 9 M12 11c0-6 4-8 8-8 0 5-2 9-8 8",
  perfectionism: "M18 5a8 8 0 1 0 3 7 M13 10l7-7 2 2-7 7-3 1z",
  dopamine: "M13 3 5 14h6l-1 7 9-12h-7z",
  creativity: "M12 3v4 M3 12h4 M17 12h4 M12 17v4 M6 6l3 3 M15 15l3 3 M6 18l3-3 M15 9l3-3",
  coding: "m8 6-6 6 6 6 M16 6l6 6-6 6 M14 3l-4 18",
  studying: "M12 6C8 3 5 3 2 4v15c4-1 7-1 10 2 3-3 6-3 10-2V4c-3-1-6-1-10 2v15",
  environment: "M3 13h18 M6 13V8h12v5 M5 13v8 M19 13v8 M9 8V4h6v4",
  discipline: "M12 2 3 6v6c0 5 9 10 9 10s9-5 9-10V6z m-5 10 3 3 6-7",
  overwhelm: "M3 6h18 M5 12h14 M8 18h8",
  "low-motivation": "M12 21V4 M12 4c4-2 5 3 9 1v9c-4 2-5-3-9-1 M7 21h10",
  "fear-anxiety": "M12 20S2 14 2 8c0-5 7-6 10-1 3-5 10-4 10 1 0 6-10 12-10 12z",
  overthinking: "M4 4h6v6H4z M14 14h6v6h-6z M17 4v6 M14 7h6 M7 14v6 M4 17h6",
  habits: "M5 8a8 8 0 0 1 14-2 M19 2v4h-4 M19 16A8 8 0 0 1 5 18 M5 22v-4h4",
  deadlines: "M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16 M12 7v5l3 2 M9 1h6",
  work: "M3 7h18v13H3z M8 7V3h8v4 M3 12h18 M10 12v3h4v-3",
  exercise: "m4 4 16 16 M2 7l5-5 M17 22l5-5 M1 4l3-3 M20 23l3-3 M8 8l8 8",
  "life-admin": "m3 11 9-8 9 8 M5 9v12h14V9 M10 21v-7h4v7",
  "digital-distraction": "M7 2h10v20H7z M10 18h4 M3 3l18 18",
};
export function CategoryIcon({ category }: { category: CategoryId }) {
  return <svg className="p0-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d={paths[category]} /></svg>;
}
export function JourneyArt({ variant }: { variant: "a" | "b" | "c" }) {
  return <svg className="p0-journey-art" viewBox="0 0 400 150" fill="none" aria-hidden="true" focusable="false">
    {variant === "a" ? <g stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M90 126c55-50 98 12 137-27 39-39-2-55 47-67" strokeDasharray="4 12" />
      <path d="m257 23 25 4-10 24 M314 71v16 M306 79h16 M56 91l6 8m-20 0 8 1" />
      <circle cx="329" cy="28" r="15" /><circle cx="150" cy="109" r="6" />
    </g> : variant === "b" ? <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M269 17c-36-18-71 14-59 40 15 32 58 30 71 10 14-21 7-37-4-45 M190 107l98-12 M195 113l89-7" />
      <path d="m300 105 56-60 6 6-55 60-11 4z m49-63 8 8 M72 126q45-26 94-5 M79 133q40-16 71-7" />
    </g> : <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M114 150c83-27 21-53 86-64 56-10 44-35 77-40" strokeDasharray="3 6" />
      <circle cx="297" cy="33" r="18" fill="var(--p0-sun)" stroke="none" />
      {[55, 92, 319, 356].map((x, i) => <g key={x} transform={`translate(${x} ${i % 2 ? 15 : 0})`}><path d="M0 139q5-26 0-60 M2 119c-24 1-26-15-26-15 17-3 22 3 26 15 M3 103c22-2 22-18 22-18-17 0-21 8-22 18" fill="var(--p0-leaf)" /></g>)}
    </g>}
  </svg>;
}

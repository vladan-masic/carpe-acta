type Section = "generate" | "journey" | "goal" | "milestones" | "best" | "favorites" | "calendar";
const paths: Record<Section, string> = {
  generate: "m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3ZM3 3v4M1 5h4",
  journey: "M5 21v-5a4 4 0 0 1 4-4h6a4 4 0 0 0 0-8h-3m0 0 3-3m-3 3 3 3",
  goal: "M21 12a9 9 0 1 1-9-9m5 9a5 5 0 1 1-5-5m0 5L22 2m-5 0v5h5",
  milestones: "m2 20 7-13 5 9 3-5 5 9H2ZM9 7V2h6l-2 2 2 2H9",
  best: "M8 3h8v6a4 4 0 0 1-8 0V3Zm0 2H4v3a4 4 0 0 0 4 4m8-7h4v3a4 4 0 0 1-4 4m-4 1v6m-4 2h8m-6-2h4",
  favorites: "M6 3h12v18l-6-4-6 4V3Z",
  calendar: "M4 5h16v16H4V5Zm3-3v6m10-6v6M4 10h16m-12 4h1m3 0h1m3 0h1m-9 3h1m3 0h1",
};
export function SectionIcon({ section }: { section: Section }) {
  return <svg className={`section-icon section-icon--${section}`} aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d={paths[section]} /></svg>;
}

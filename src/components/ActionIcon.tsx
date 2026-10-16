const paths = {
  play: "m9 5 10 7-10 7V5Z",
  pause: "M8 5v14M16 5v14",
  complete: "m8 12 3 3 5-6M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  generate: "m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z",
};
export function ActionIcon({ action }: { action: keyof typeof paths }) {
  return <svg className="action-icon" aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill={action === "play" ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d={paths[action]} /></svg>;
}

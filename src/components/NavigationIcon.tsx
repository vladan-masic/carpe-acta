type NavigationDestination = "start" | "library" | "progress" | "favorites";

const paths: Record<NavigationDestination, string> = {
  start: "m9 5 10 7-10 7V5Z",
  library: "M4 5h6a3 3 0 0 1 3 3v12a3 3 0 0 0-3-3H4V5Zm16 0h-4a3 3 0 0 0-3 3m0 12a3 3 0 0 1 3-3h4V5Z",
  progress: "M4 19h16M7 15v-4m5 4V7m5 8V3",
  favorites: "M6 4h12v17l-6-4-6 4V4Z",
};

export function NavigationIcon({ destination }: { destination: NavigationDestination }) {
  return <svg className="navigation-icon" aria-hidden="true" width="17" height="17" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round">
    <path d={paths[destination]} />
  </svg>;
}

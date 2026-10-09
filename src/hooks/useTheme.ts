import { useEffect, useState } from "react";

export const themeStorageKey = "carpe-acta-theme-v1";
export type ThemePreference = "system" | "light" | "dark";
export function isThemePreference(value: unknown): value is ThemePreference {
  return value === "system" || value === "light" || value === "dark";
}
function initialPreference(): ThemePreference {
  try {
    const value = localStorage.getItem(themeStorageKey);
    return isThemePreference(value) ? value : "system";
  } catch { return "system"; }
}

export function useTheme() {
  const [preference, setPreference] = useState<ThemePreference>(initialPreference);
  useEffect(() => {
    const media = window.matchMedia?.("(prefers-color-scheme: dark)");
    const apply = () => {
      document.documentElement.dataset.theme = preference === "system"
        ? media?.matches ? "dark" : "light" : preference;
    };
    apply();
    media?.addEventListener?.("change", apply);
    return () => media?.removeEventListener?.("change", apply);
  }, [preference]);
  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key === themeStorageKey || event.key === null) {
        setPreference(isThemePreference(event.newValue) ? event.newValue : "system");
      }
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  const select = (value: ThemePreference) => {
    setPreference(value);
    try { localStorage.setItem(themeStorageKey, value); } catch { /* Keep the in-memory choice. */ }
  };
  return { preference, select };
}

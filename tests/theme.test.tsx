// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { ThemeSelector } from "../src/components/ThemeSelector";
import { themeStorageKey } from "../src/hooks/useTheme";
function chooseTheme(name: string) {
  fireEvent.click(screen.getByRole("button", { name: /^Theme:/ }));
  fireEvent.click(screen.getByRole("option", { name, exact: true }));
}
let media: EventTarget & { matches: boolean };
beforeEach(() => {
  localStorage.clear();
  media = Object.assign(new EventTarget(), { matches: false });
  vi.stubGlobal("matchMedia", () => media);
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); delete document.documentElement.dataset.theme; });
it("follows system changes only while System is selected and persists explicit choices", () => {
  render(<ThemeSelector locale="en" />);
  expect(document.documentElement.dataset.theme).toBe("light");
  act(() => { media.matches = true; media.dispatchEvent(new Event("change")); });
  expect(document.documentElement.dataset.theme).toBe("dark");
  chooseTheme("Light");
  act(() => media.dispatchEvent(new Event("change")));
  expect(document.documentElement.dataset.theme).toBe("light");
  expect(localStorage.getItem(themeStorageKey)).toBe("light");
  chooseTheme("System");
  expect(document.documentElement.dataset.theme).toBe("dark");
});
it("restores the preference, keeps it across language changes, and syncs other tabs", () => {
  localStorage.setItem(themeStorageKey, "dark");
  const { rerender } = render(<ThemeSelector locale="en" />);
  expect(document.documentElement.dataset.theme).toBe("dark");
  rerender(<ThemeSelector locale="sr-Latn" />);
  expect(screen.getByRole("button", { name: "Tema: Tamni" })).toBeTruthy();
  fireEvent(window, new StorageEvent("storage", { key: themeStorageKey, newValue: "light" }));
  expect(document.documentElement.dataset.theme).toBe("light");
  fireEvent(window, new StorageEvent("storage", { key: null }));
  expect(screen.getByRole("button", { name: "Tema: Sistemski" })).toBeTruthy();
});
it("remains usable when storage reads and writes throw", () => {
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("blocked"); });
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("blocked"); });
  render(<ThemeSelector locale="en" />);
  chooseTheme("Dark");
  expect(document.documentElement.dataset.theme).toBe("dark");
});
it.each(["dark", "light", "system", "invalid"])("applies %s before React loads", preference => {
  localStorage.setItem(themeStorageKey, preference);
  media.matches = true;
  const html = readFileSync("index.html", "utf8");
  const script = html.match(/<script>([\s\S]*?)<\/script>/)![1];
  new Function(script)();
  expect(document.documentElement.dataset.theme).toBe(preference === "light" ? "light" : "dark");
});
it("initializes with system preference when storage is blocked", () => {
  media.matches = true;
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("blocked"); });
  const html = readFileSync("index.html", "utf8");
  new Function(html.match(/<script>([\s\S]*?)<\/script>/)![1])();
  expect(document.documentElement.dataset.theme).toBe("dark");
});

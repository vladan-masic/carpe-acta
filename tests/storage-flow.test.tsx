// @vitest-environment jsdom
import { summarizeProgress } from "../src/utils/progress";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { App } from "../src/App";
import { BrowserImport } from "../src/components/BrowserImport";
import { storageMessages } from "../src/i18n/storage";
import { favoritesMessages } from "../src/i18n/favorites";
import { completionMessages } from "../src/i18n/completions";
import { authMessages } from "../src/i18n/auth";
import { favoritesStorageKey } from "../src/utils/favorites";
import { completionStorageKey } from "../src/utils/completions";
import { addFavorites, fetchFavorites } from "../src/favorites/api";
import { uploadCompletions, countCompletions, fetchProgress } from "../src/completions/api";

const mock = vi.hoisted(() => ({ session: null as Session | null, loading: false, client: {} as SupabaseClient }));
vi.mock("../src/hooks/useAuth", () => ({ useAuth: () => ({ ...mock, recovering: false, setRecovering: vi.fn(), clearError: vi.fn(), error: null }) }));
vi.mock("../src/favorites/api", () => ({ fetchFavorites: vi.fn(), addFavorites: vi.fn(), removeFavorite: vi.fn() }));
vi.mock("../src/completions/api", () => ({ fetchProgress: vi.fn(), countCompletions: vi.fn(), uploadCompletions: vi.fn(), deleteCompletion: vi.fn() }));
const guest = { id: "guest-one", tipId: "one-tiny-step", completedAt: "2026-10-01T12:00:00Z", feedback: true };
beforeEach(() => {
  vi.resetAllMocks(); localStorage.clear(); mock.session = null; mock.loading = false;
  Object.defineProperty(HTMLDialogElement.prototype, "showModal", { configurable: true, value() { this.setAttribute("open", ""); } });
  Object.defineProperty(HTMLDialogElement.prototype, "close", { configurable: true, value() { this.removeAttribute("open"); this.dispatchEvent(new Event("close")); } });
  vi.mocked(fetchFavorites).mockResolvedValue([]);
  vi.mocked(countCompletions).mockResolvedValue(0);
  vi.mocked(fetchProgress).mockResolvedValue(summarizeProgress([]));
  vi.mocked(addFavorites).mockResolvedValue(); vi.mocked(uploadCompletions).mockResolvedValue();
});
afterEach(() => { cleanup(); localStorage.clear(); });

it.each(["en", "sr-Latn"] as const)("explains storage, keeps imports explicit, and restores browser data after logout in %s", async (locale) => {
  localStorage.setItem("carpe-acta-locale", locale);
  localStorage.setItem(favoritesStorageKey, JSON.stringify(["one-tiny-step"]));
  localStorage.setItem(completionStorageKey, JSON.stringify([guest]));
  const storage = storageMessages[locale];
  const { rerender } = render(<App />);
  expect(within(screen.getByRole("main")).getAllByText(storage.browser)).toHaveLength(2);
  fireEvent.click(screen.getByRole("button", { name: authMessages[locale].login, exact: true }));
  expect(screen.getByText(storage.separate)).toBeTruthy();
  mock.session = { user: { id: "alice", email: "alice@example.com" } } as Session;
  rerender(<App />);
  const imports = within(screen.getByRole("region", { name: storage.importTitle }));
  const favoriteImport = imports.getByRole("button", { name: favoritesMessages[locale].import });
  const historyImport = imports.getByRole("button", { name: completionMessages[locale].import });
  await waitFor(() => expect(favoriteImport.getAttribute("aria-disabled")).toBe("false"));
  expect(screen.getAllByText(storage.account)).toHaveLength(3);
  expect(imports.getAllByText(storage.count(1))).toHaveLength(2);
  expect(imports.getByText(storage.importHint)).toBeTruthy();
  expect(addFavorites).not.toHaveBeenCalled(); expect(uploadCompletions).not.toHaveBeenCalled();
  vi.mocked(fetchFavorites).mockResolvedValue(["one-tiny-step"]);
  fireEvent.click(favoriteImport);
  await waitFor(() => expect(imports.getByText(storage.added)).toBeTruthy());
  expect(favoriteImport.getAttribute("aria-disabled")).toBe("true");
  expect(addFavorites).toHaveBeenCalledExactlyOnceWith(mock.client, "alice", ["one-tiny-step"]);
  fireEvent.click(historyImport);
  await waitFor(() => expect(imports.getByText(completionMessages[locale].imported)).toBeTruthy());
  expect(uploadCompletions).toHaveBeenCalledExactlyOnceWith(mock.client, "alice", [guest]);
  expect(JSON.parse(localStorage.getItem(completionStorageKey)!)).toEqual([guest]);
  expect(JSON.parse(localStorage.getItem(favoritesStorageKey)!)).toEqual(["one-tiny-step"]);
  mock.session = null;
  rerender(<App />);
  expect(screen.queryByRole("region", { name: storage.importTitle })).toBeNull();
  expect(screen.getAllByText(storage.browser)).toHaveLength(3);
});

it("shows checking storage while auth initializes, then distinguishes empty and unreadable browser saves", async () => {
  localStorage.setItem("carpe-acta-locale", "en"); mock.loading = true;
  const { rerender } = render(<App />);
  expect(screen.getAllByText(storageMessages.en.checking)).toHaveLength(2);
  expect(within(screen.getByRole("main")).queryByText(storageMessages.en.browser)).toBeNull();
  mock.loading = false;
  mock.session = { user: { id: "alice" } } as Session;
  rerender(<App />);
  fireEvent.click(screen.getByRole("button", { name: "Account", exact: true }));
  await waitFor(() => expect(screen.getAllByText(storageMessages.en.empty)).toHaveLength(2));
  expect(screen.queryByRole("button", { name: "Import browser history" })).toBeNull();
});

it("shows import errors and refresh, disables busy actions, and keeps unavailable data distinct from empty data", () => {
  const refresh = vi.fn(), onImport = vi.fn();
  const props = { locale: "en" as const, title: "History", label: "Import history", count: 2, canImport: true, copied: true, busy: false, disabled: false, error: true, onImport, onRefresh: refresh };
  const { rerender } = render(<BrowserImport {...props} />);
  expect(screen.queryByText(storageMessages.en.added)).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: storageMessages.en.refresh }));
  expect(refresh).toHaveBeenCalledOnce();
  rerender(<BrowserImport {...props} busy disabled />);
  fireEvent.click(screen.getByRole("button", { name: "Import history" }));
  expect(onImport).not.toHaveBeenCalled();
  expect(screen.getByRole("status").textContent).toBe(storageMessages.en.syncing);
  rerender(<BrowserImport {...props} count={null} copied={false} canImport={false} error={false} />);
  expect(screen.getByText(storageMessages.en.unreadable)).toBeTruthy();
  expect(screen.queryByText(storageMessages.en.empty)).toBeNull();
});

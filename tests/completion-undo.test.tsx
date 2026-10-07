// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { App } from "../src/App";
import { CompletionUndoNotice, undoNoticeDuration } from "../src/components/CompletionUndoNotice";
import { undoMessages } from "../src/i18n/undo";
import { completionStorageKey, loadCompletions, saveCompletionFeedback } from "../src/utils/completions";
import { messages } from "../src/i18n/messages";

vi.mock("../src/auth/client", () => ({ getSupabaseClient: () => null }));
beforeEach(() => { localStorage.clear(); vi.useFakeTimers(); });
afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });
const record = { id: "one", tipId: "two-minute-start", completedAt: "2026-10-04T12:00:00Z" };
const tick = (ms: number) => act(() => { vi.advanceTimersByTime(ms); });

it.each(["en", "sr-Latn"] as const)("undoes a completion and feedback and allows a fresh attempt in %s", (locale) => {
  localStorage.setItem("carpe-acta-locale", locale);
  vi.stubGlobal("matchMedia", () => ({ matches: true }));
  render(<App />);
  fireEvent.click(screen.getByRole("button", { name: messages[locale].completion.button }));
  const id = loadCompletions().records[0].id;
  saveCompletionFeedback(id, true);
  fireEvent.click(screen.getByRole("button", { name: undoMessages[locale].undo, exact: true }));
  expect(loadCompletions().records).toEqual([]);
  expect(screen.getByText(undoMessages[locale].done)).toBeTruthy();
  expect(screen.getByRole("button", { name: messages[locale].completion.button }).hasAttribute("disabled")).toBe(false);
  fireEvent.click(screen.getByRole("button", { name: messages[locale].completion.button }));
  expect(loadCompletions().records).toHaveLength(1);
  expect(loadCompletions().records[0].id).not.toBe(id);
  expect(loadCompletions().records[0].feedback).toBeUndefined();
});

it("expires the offer without changing history and preserves it through a language change", () => {
  localStorage.setItem("carpe-acta-locale", "en");
  const { unmount } = render(<App />);
  fireEvent.click(screen.getByRole("button", { name: "I did it ✓" }));
  tick(undoNoticeDuration - 1);
  expect(screen.getByRole("button", { name: "Undo", exact: true })).toBeTruthy();
  tick(1);
  expect(screen.queryByRole("button", { name: "Undo", exact: true })).toBeNull();
  expect(loadCompletions().records).toHaveLength(1);
  unmount();
  const onDismiss = vi.fn();
  const props = { undo: { record, phase: "available" as const }, title: "Tip", busy: false, onUndo: vi.fn(), onDismiss };
  const { rerender } = render(<CompletionUndoNotice {...props} locale="en" />);
  tick(5000);
  rerender(<CompletionUndoNotice {...props} locale="sr-Latn" />);
  tick(10000);
  expect(onDismiss).toHaveBeenCalledTimes(1);
});

it("pauses expiry during keyboard focus, hover and sync, and never expires an error", () => {
  const onDismiss = vi.fn();
  const props = { undo: { record, phase: "available" as const }, title: "Tip", busy: false, onUndo: vi.fn(), onDismiss, locale: "en" as const };
  const { rerender } = render(<CompletionUndoNotice {...props} />);
  const button = screen.getByRole("button", { name: "Undo", exact: true });
  fireEvent.focus(button);
  tick(30000);
  expect(onDismiss).not.toHaveBeenCalled();
  fireEvent.blur(button);
  fireEvent.mouseEnter(screen.getByText("Tip"));
  tick(30000);
  expect(onDismiss).not.toHaveBeenCalled();
  fireEvent.mouseLeave(screen.getByText("Tip"));
  rerender(<CompletionUndoNotice {...props} busy />);
  tick(30000);
  expect(onDismiss).not.toHaveBeenCalled();
  rerender(<CompletionUndoNotice {...props} undo={{ record, phase: "error" }} />);
  tick(30000);
  expect(onDismiss).not.toHaveBeenCalled();
  expect(screen.getByRole("button", { name: "Retry undo" })).toBeTruthy();
});

it("keeps keyboard focus on the success control and restores the action heading on dismissal", () => {
  const onDismiss = vi.fn();
  const props = { title: "Tip", busy: false, onUndo: vi.fn(), onDismiss, locale: "en" as const };
  const view = (phase: "available" | "done") => <><h3 id="active-tip-title" tabIndex={-1}>Action</h3><CompletionUndoNotice {...props} undo={{ record, phase }} /></>;
  const { rerender } = render(view("available"));
  act(() => screen.getByRole("button", { name: "Undo", exact: true }).focus());
  rerender(view("done"));
  expect(document.activeElement).toBe(screen.getByRole("button", { name: "Dismiss" }));
  fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));
  expect(document.activeElement).toBe(screen.getByRole("heading"));
  expect(onDismiss).toHaveBeenCalledTimes(1);
});

it("keeps undo for the original tip after moving to a new action", () => {
  localStorage.setItem("carpe-acta-locale", "en");
  render(<App />);
  fireEvent.click(screen.getByRole("button", { name: "I did it ✓" }));
  const original = localStorage.getItem(completionStorageKey);
  fireEvent.click(screen.getByRole("button", { name: messages.en.completion.next }));
  const nextTitle = document.getElementById("active-tip-title")!.textContent;
  fireEvent.click(screen.getByRole("button", { name: "Undo", exact: true }));
  expect(original).not.toBe("[]");
  expect(loadCompletions().records).toEqual([]);
  expect(document.getElementById("active-tip-title")!.textContent).toBe(nextTitle);
});

it("keeps one weekly goal and celebrates then revokes first-action milestones through the real completion flow", () => {
  localStorage.setItem("carpe-acta-locale", "en");
  render(<App />);
  expect(screen.getAllByRole("heading", { name: "Weekly activity goal" })).toHaveLength(1);
  const milestones = within(screen.getByRole("region", { name: "Personal milestones" }));
  expect(milestones.getByRole("status").textContent).toBe("");
  fireEvent.click(screen.getByRole("button", { name: "I did it ✓" }));
  expect(milestones.getByRole("status").textContent).toContain("First action");
  expect(milestones.getByRole("status").textContent).toContain("First active day");
  fireEvent.click(screen.getByRole("button", { name: "Undo", exact: true }));
  expect(milestones.getByRole("status").textContent).toBe("");
  expect(milestones.getAllByText("Your first badge is ahead.")).toHaveLength(2);
});

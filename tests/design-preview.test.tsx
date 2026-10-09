// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { DesignPreview } from "../src/dev/design/DesignPreview";

afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks(); });

it("keeps the exact selected content, favorite and running timer across treatments and locales", () => {
  vi.useFakeTimers();
  render(<DesignPreview />);
  fireEvent.click(screen.getByRole("button", { name: "Favorite: Two-Minute Start" }));
  fireEvent.click(screen.getByRole("button", { name: "Start timer", exact: true }));
  act(() => vi.advanceTimersByTime(3000));
  expect(screen.getByRole("timer").textContent).toBe("1:57");
  for (const name of ["A Playful Momentum", "C Optimistic Adventure", "B Illustrated Notebook"]) {
    fireEvent.click(screen.getByRole("button", { name }));
    expect(screen.getByRole("heading", { name: "Two-Minute Start" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Favorite: Two-Minute Start" }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("timer").textContent).toBe("1:57");
  }
  fireEvent.change(screen.getByRole("combobox", { name: "Select language" }), { target: { value: "sr-Latn" } });
  expect(screen.getByRole("timer").textContent).toBe("1:57");
  expect(screen.getByRole("button", { name: "Pauziraj", exact: true })).toBeTruthy();
});

it("does not write storage or call the network for preview interactions", () => {
  const write = vi.spyOn(Storage.prototype, "setItem");
  const fetchSpy = vi.spyOn(globalThis, "fetch");
  render(<DesignPreview />);
  fireEvent.change(screen.getByRole("combobox", { name: "Preview theme" }), { target: { value: "dark" } });
  fireEvent.click(screen.getByRole("button", { name: "Favorite: Two-Minute Start" }));
  fireEvent.click(screen.getByRole("button", { name: "I did it ✓" }));
  expect(screen.getByText("Preview completion only — not saved.")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Undo sample completion" }));
  expect(screen.getByRole("button", { name: "Start timer", exact: true })).toBeTruthy();
  expect(write).not.toHaveBeenCalled();
  expect(fetchSpy).not.toHaveBeenCalled();
});

it("uses existing guided selection and exposes all real categories", () => {
  render(<DesignPreview />);
  fireEvent.click(screen.getByRole("button", { name: "Show categories" }));
  expect(within(screen.getByRole("group", { name: "Tip categories" })).getAllByRole("button")).toHaveLength(22);
  fireEvent.click(screen.getByRole("button", { name: "Help me start", exact: true }));
  expect(screen.queryByRole("heading", { name: "Two-Minute Start" })).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "I have little energy" }));
  fireEvent.click(screen.getByRole("button", { name: "Up to 1 minute" }));
  expect(screen.getByText("1 min")).toBeTruthy();
  expect(screen.getByRole("button", { name: "Something smaller" }).hasAttribute("disabled")).toBe(true);
  fireEvent.click(screen.getByRole("button", { name: "Reset sample" }));
  expect(screen.getByRole("heading", { name: "Two-Minute Start" })).toBeTruthy();
});

it("keeps the fixed active-day example distinct from local completion and timer expiry", () => {
  vi.useFakeTimers();
  render(<DesignPreview />);
  fireEvent.click(screen.getByRole("button", { name: "Start timer", exact: true }));
  act(() => vi.advanceTimersByTime(120000));
  expect(screen.getByRole("button", { name: "I did it ✓" }).hasAttribute("disabled")).toBe(false);
  expect(screen.getByRole("button", { name: "Keep going" })).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "I did it ✓" }));
  expect(screen.getByRole("progressbar").getAttribute("value")).toBe("3");
  expect(screen.getByRole("progressbar").getAttribute("max")).toBe("4");
});

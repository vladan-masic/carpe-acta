// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, renderHook, screen } from "@testing-library/react";
import { useActionTimer } from "../src/hooks/useActionTimer";
import { ActionTimer } from "../src/components/ActionTimer";
import { timerMessages } from "../src/i18n/timer";
import { App } from "../src/App";

vi.mock("../src/auth/client", () => ({ getSupabaseClient: () => null }));
beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date("2026-10-04T12:00:00Z")); });
afterEach(() => { cleanup(); vi.useRealTimers(); localStorage.clear(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });
const tick = (ms: number) => act(() => { vi.advanceTimersByTime(ms); });

it("starts only on request, preserves partial seconds across pauses, and resets", () => {
  const { result, unmount } = renderHook(() => useActionTimer(2));
  expect(vi.getTimerCount()).toBe(0);
  tick(5000);
  expect(result.current.seconds).toBe(120);
  act(() => result.current.start());
  tick(1250);
  act(() => result.current.pause());
  tick(10000);
  expect(result.current.milliseconds).toBe(118750);
  act(() => result.current.start());
  tick(750);
  expect(result.current.seconds).toBe(118);
  act(() => result.current.reset());
  expect(result.current.phase).toBe("idle");
  expect(result.current.seconds).toBe(120);
  expect(vi.getTimerCount()).toBe(0);
  act(() => result.current.start());
  unmount();
  expect(vi.getTimerCount()).toBe(0);
});

it("catches up after background delays, stops at zero and allows extra time", () => {
  const { result } = renderHook(() => useActionTimer(1));
  act(() => result.current.start());
  act(() => {
    vi.setSystemTime(Date.now() + 90000);
    document.dispatchEvent(new Event("visibilitychange"));
  });
  expect(result.current.phase).toBe("expired");
  expect(result.current.seconds).toBe(0);
  expect(vi.getTimerCount()).toBe(0);
  tick(20000);
  expect(result.current.seconds).toBe(0);
  act(() => result.current.keepGoing());
  tick(3250);
  expect(result.current.seconds).toBe(3);
  act(() => result.current.pause());
  tick(5000);
  expect(result.current.seconds).toBe(3);
  act(() => result.current.start());
  tick(750);
  expect(result.current.seconds).toBe(4);
  act(() => result.current.reset());
  expect(result.current.extra).toBe(false);
  expect(result.current.seconds).toBe(60);
});

it.each(["en", "sr-Latn"] as const)("provides accessible timer controls in %s", (locale) => {
  const copy = timerMessages[locale];
  render(<ActionTimer minutes={1} locale={locale} />);
  expect(screen.queryByRole("timer")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: new RegExp(copy.start) }));
  expect(screen.getByRole("timer").textContent).toBe("1:00");
  expect(screen.getByRole("timer").getAttribute("aria-live")).toBe("off");
  fireEvent.click(screen.getByRole("button", { name: copy.pause }));
  expect(screen.getByRole("status").textContent).toBe(copy.paused);
  fireEvent.click(screen.getByRole("button", { name: copy.resume }));
  tick(60000);
  expect(screen.getByRole("status").textContent).toBe(copy.expired);
  fireEvent.click(screen.getByRole("button", { name: copy.keepGoing }));
  tick(2000);
  expect(screen.getByRole("timer", { name: copy.extra }).textContent).toBe("0:02");
  fireEvent.click(screen.getByRole("button", { name: copy.reset }));
  expect(document.activeElement).toBe(screen.getByRole("button", { name: new RegExp(copy.start) }));
});

it("preserves the running timer when the language changes", () => {
  const { rerender } = render(<ActionTimer minutes={5} locale="en" />);
  fireEvent.click(screen.getByRole("button", { name: /Start timer/ }));
  tick(10000);
  rerender(<ActionTimer minutes={5} locale="sr-Latn" />);
  expect(screen.getByRole("timer").textContent).toBe("4:50");
  expect(screen.getByRole("button", { name: "Pauziraj" })).toBeTruthy();
});

it("never completes an action on expiry, resets a reopened tip, and stops on manual completion", () => {
  localStorage.setItem("carpe-acta-locale", "en");
  vi.stubGlobal("matchMedia", () => ({ matches: true }));
  Element.prototype.scrollIntoView = vi.fn();
  render(<App />);
  fireEvent.click(screen.getByRole("button", { name: "Browse all tips" }));
  const tryButton = screen.getAllByRole("button", { name: /^Try this:/ })[0];
  fireEvent.click(tryButton);
  fireEvent.click(screen.getByRole("button", { name: /Start timer/ }));
  tick(60 * 60 * 1000);
  expect(screen.getByRole("timer").textContent).toBe("0:00");
  expect(screen.queryByRole("button", { name: "Completed ✓" })).toBeNull();
  expect((screen.getByRole("button", { name: "I did it ✓" }) as HTMLButtonElement).disabled).toBe(false);
  fireEvent.click(tryButton);
  expect(screen.queryByRole("timer")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: /Start timer/ }));
  fireEvent.click(screen.getByRole("button", { name: "I did it ✓" }));
  expect(screen.queryByRole("region", { name: "Action timer" })).toBeNull();
  expect(screen.getByRole("button", { name: "Completed ✓" })).toBeTruthy();
  tick(100);
});

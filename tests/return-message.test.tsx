// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ReturnMessage, hasReturnGap } from "../src/components/ReturnMessage";
const now = new Date(2026, 9, 7, 12);
const props = { locale: "en" as const, owner: null as string | null, ready: true, latestId: "old", latestAt: new Date(2026, 9, 4, 23).toISOString(), completed: false };
beforeEach(() => { localStorage.clear(); vi.useFakeTimers({ toFake: ["Date"] }); vi.setSystemTime(now); });
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.useRealTimers(); });
it("uses three local calendar dates across month/year and DST boundaries", () => {
  expect(hasReturnGap(new Date(2026, 9, 5).toISOString(), now)).toBe(false);
  expect(hasReturnGap(props.latestAt, now)).toBe(true);
  expect(hasReturnGap(new Date(2025, 11, 30, 23).toISOString(), new Date(2026, 0, 2))).toBe(true);
  expect(hasReturnGap(new Date(2026, 2, 27, 23).toISOString(), new Date(2026, 2, 30))).toBe(true);
  for (const value of [undefined, "bad", new Date(2030, 0, 1).toISOString()]) expect(hasReturnGap(value, now)).toBe(false);
});
it.each(["en", "sr-Latn"] as const)("shows a gentle dismissible message in %s", locale => {
  render(<ReturnMessage {...props} locale={locale} />);
  expect(screen.getByRole("status").textContent).toContain(locale === "en" ? "One small action counts" : "jedna mala radnja");
  fireEvent.click(screen.getByRole("button", { name: locale === "en" ? "Dismiss welcome message" : "Zatvori poruku dobrodošlice" }));
  expect(screen.queryByRole("status")).toBeNull();
});
it("waits for history and suppresses new-user and recent-activity welcomes", () => {
  const { rerender } = render(<ReturnMessage {...props} ready={false} />);
  expect(screen.queryByRole("status")).toBeNull();
  rerender(<ReturnMessage {...props} latestId={undefined} latestAt={undefined} />);
  expect(screen.queryByRole("status")).toBeNull();
  rerender(<ReturnMessage {...props} />); // Import is not another return visit.
  expect(screen.queryByRole("status")).toBeNull();
});
it("shows once per gap, separately for each account, and allows a later gap", () => {
  const { unmount } = render(<ReturnMessage {...props} />);
  expect(screen.getByRole("status")).toBeTruthy();
  unmount();
  const { rerender } = render(<ReturnMessage {...props} />);
  expect(screen.queryByRole("status")).toBeNull();
  rerender(<ReturnMessage {...props} key="account-a" owner="a" />);
  expect(screen.getByRole("status")).toBeTruthy();
  rerender(<ReturnMessage {...props} key="later-visit" latestId="newer" />);
  expect(screen.getByRole("status")).toBeTruthy();
});
it("clears after completion and does not reappear on Undo or refresh", () => {
  const { rerender } = render(<ReturnMessage {...props} />);
  rerender(<ReturnMessage {...props} completed />);
  expect(screen.queryByRole("status")).toBeNull();
  rerender(<ReturnMessage {...props} />);
  expect(screen.queryByRole("status")).toBeNull();
});
it("works for this visit when storage is unavailable", () => {
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("blocked"); });
  render(<ReturnMessage {...props} />);
  expect(screen.getByRole("status")).toBeTruthy();
});

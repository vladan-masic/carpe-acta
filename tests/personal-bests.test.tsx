// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { summarizePersonalBest } from "../src/utils/personalBests";
import { PersonalBest } from "../src/components/PersonalBest";
import { App } from "../src/App";
import { personalBestMessages } from "../src/i18n/personalBests";
const now = new Date(2026, 9, 8, 18);
const record = (id: string, date: string) => ({ id, tipId: "any", completedAt: date });
vi.mock("../src/auth/client", () => ({ getSupabaseClient: () => null }));
afterEach(() => { cleanup(); localStorage.clear(); vi.useRealTimers(); vi.unstubAllGlobals(); });
it("counts distinct local days, nonconsecutive days and the current partial week", () => {
  const records = [record("a","2026-10-05T12:00:00"), record("b","2026-10-05T13:00:00"), record("c","2026-10-08T12:00:00"), record("old","2026-09-01T12:00:00")];
  expect(summarizePersonalBest(records,now)).toEqual({ days: 2, week: "2026-10-05" });
  expect(summarizePersonalBest(records.filter(r=>r.id!=="c"),now)).toEqual({ days: 1, week: "2026-08-31" });
});
it("keeps earliest tied week, separates Sunday/Monday and crosses year boundaries", () => {
  const records = [record("a","2026-01-05T12:00:00"), record("b","2026-01-04T12:00:00"), record("c","2025-12-29T12:00:00")];
  expect(summarizePersonalBest(records,now)).toEqual({ days: 2, week: "2025-12-29" });
  expect(summarizePersonalBest(records.slice(0,2),now)).toEqual({ days: 1, week: "2025-12-29" });
});
it("ignores future and invalid dates, deduplicates IDs and handles empty history", () => {
  const a = record("a","2026-10-05T12:00:00");
  expect(summarizePersonalBest([a,a,record("bad","invalid"),record("future","2999-01-01")],now)).toEqual({ days: 1, week: "2026-10-05" });
  expect(summarizePersonalBest([],now)).toEqual({ days: 0, week: null });
});
it("counts a complete week through DST using local calendar arithmetic", () => {
  const records = Array.from({length:7},(_,i)=>record(String(i),new Date(2026,2,23+i,12).toISOString()));
  expect(summarizePersonalBest(records,now)).toEqual({days:7,week:"2026-03-23"});
});
it.each(["en","sr-Latn"] as const)("renders quiet updates, empty and error states in %s", locale => {
  const copy = personalBestMessages[locale];
  const retry = vi.fn();
  const {rerender}=render(<PersonalBest locale={locale} best={{days:3,week:"2026-10-05"}} error={false} retry={retry}/>);
  expect(screen.getByRole("status").textContent).toContain(copy.days(3));
  expect(screen.queryByRole("progressbar")).toBeNull();
  rerender(<PersonalBest locale={locale} best={{days:2,week:"2026-10-05"}} error={false} retry={retry}/>);
  expect(screen.getByRole("status").textContent).toContain(copy.days(2));
  rerender(<PersonalBest locale={locale} best={{days:0,week:null}} error={false} retry={retry}/>);
  expect(screen.getByText(copy.empty)).toBeTruthy();
  rerender(<PersonalBest locale={locale} best={null} error={true} retry={retry}/>);
  fireEvent.click(screen.getByRole("button",{name:copy.retry}));
  expect(retry).toHaveBeenCalledOnce();
});

it("updates the app record on completion and restores it after Undo", () => {
  vi.useFakeTimers();
  vi.setSystemTime(now);
  vi.stubGlobal("matchMedia", () => ({ matches: true }));
  localStorage.setItem("carpe-acta-locale", "en");
  localStorage.setItem("carpe-acta-completions-v1", JSON.stringify([
    record("a", "2026-10-05T12:00:00"), record("b", "2026-10-07T12:00:00"),
  ]));
  render(<App />);
  const best = screen.getByRole("region", { name: "Personal best", exact: true });
  expect(best.textContent).toContain("2 active days");
  fireEvent.click(screen.getByRole("button", { name: "I did it ✓" }));
  expect(best.textContent).toContain("3 active days");
  fireEvent.click(screen.getByRole("button", { name: "Undo", exact: true }));
  expect(best.textContent).toContain("2 active days");
});

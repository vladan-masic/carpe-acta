// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, renderHook, screen } from "@testing-library/react";
import { tips } from "../src/data/tips";
import { getStartingTips, startBarrierIds, startBarriers } from "../src/data/startBarriers";
import { useTipSelection } from "../src/hooks/useTipSelection";
import { HelpMeStart } from "../src/components/HelpMeStart";
import { helpMeStartMessages } from "../src/i18n/helpMeStart";
afterEach(cleanup);
it.each(startBarrierIds)("%s has several short relevant suggestions with stable catalog IDs", (barrier) => {
  const pool = getStartingTips(tips, barrier);
  expect(pool.length).toBeGreaterThan(1);
  expect(pool.every((tip) => tip.effortMinutes <= 5 && tip.effortMinutes > 0)).toBe(true);
  expect(pool.every((tip) => (startBarriers[barrier] as readonly string[]).includes(tip.categoryId))).toBe(true);
  expect(pool.every((tip) => tips.some((entry) => entry === tip))).toBe(true);
});
it("waits for a choice, keeps further suggestions relevant and excludes immediate repeats", () => {
  const { result } = renderHook(useTipSelection);
  act(() => result.current.start());
  const initial = result.current.activeTip;
  expect(result.current.barrier).toBeNull();
  act(() => result.current.generate());
  expect(result.current.activeTip).toBe(initial);
  act(() => result.current.selectBarrier("energy"));
  const first = result.current.activeTip;
  act(() => result.current.generate());
  expect(result.current.activeTip.id).not.toBe(first.id);
  expect(result.current.activeTip.categoryId).toBe("low-energy");
  expect(result.current.activeTip.effortMinutes).toBeLessThanOrEqual(5);
});
it("changing a blocker replaces the suggestion and leaving restores the previous category", () => {
  const { result } = renderHook(useTipSelection);
  act(() => result.current.selectCategory("studying"));
  act(() => result.current.start());
  act(() => result.current.selectBarrier("energy"));
  act(() => result.current.selectBarrier("overwhelm"));
  expect(result.current.activeTip.categoryId).toBe("overwhelm");
  act(() => result.current.leave());
  expect(result.current.helping).toBe(false);
  expect(result.current.barrier).toBeNull();
  expect(result.current.category).toBe("studying");
  expect(result.current.activeTip.categoryId).toBe("studying");
});
it("opening a favorite leaves the guided flow and uses that tip's category", () => {
  const { result } = renderHook(useTipSelection);
  act(() => result.current.selectBarrier("fear"));
  act(() => result.current.openTip(tips[0]));
  expect(result.current.helping).toBe(false);
  expect(result.current.barrier).toBeNull();
  expect(result.current.activeTip.id).toBe(tips[0].id);
  expect(result.current.category).toBe(tips[0].categoryId);
});
it.each(["en", "sr-Latn"] as const)("renders accessible choices and selected feedback in %s", (locale) => {
  const onSelect = vi.fn();
  const copy = helpMeStartMessages[locale];
  const { rerender } = render(<HelpMeStart locale={locale} selected={null} onSelect={onSelect} />);
  expect(screen.getByRole("group", { name: copy.question })).toBeTruthy();
  expect(screen.getByRole("status").textContent).toBe(copy.prompt);
  fireEvent.click(screen.getByRole("button", { name: copy.choices.energy }));
  expect(onSelect).toHaveBeenCalledWith("energy");
  rerender(<HelpMeStart locale={locale} selected="energy" onSelect={onSelect} />);
  expect(screen.getByRole("button", { name: copy.choices.energy }).getAttribute("aria-pressed")).toBe("true");
  expect(screen.getByRole("status").textContent).toContain(copy.choices.energy);
});
it("language changes retain the selected blocker", () => {
  const onSelect = vi.fn();
  const { rerender } = render(<HelpMeStart locale="en" selected="fear" onSelect={onSelect} />);
  rerender(<HelpMeStart locale="sr-Latn" selected="fear" onSelect={onSelect} />);
  expect(screen.getByRole("button", { name: helpMeStartMessages["sr-Latn"].choices.fear }).getAttribute("aria-pressed")).toBe("true");
  expect(onSelect).not.toHaveBeenCalled();
});

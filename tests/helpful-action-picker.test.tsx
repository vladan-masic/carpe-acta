// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { HelpfulActionPicker } from "../src/components/HelpfulActionPicker";
import { tips } from "../src/data/tips";
import { localizeTip } from "../src/i18n/localizeTip";
import { summarizeHelpfulTips } from "../src/utils/helpfulTips";
afterEach(cleanup);
const entries = summarizeHelpfulTips(tips.slice(0, 6).map((tip, i) => ({ id: String(i), tipId: tip.id, feedback: true, completedAt: `2026-01-0${i + 1}T12:00:00Z` })));
it.each(["en", "sr-Latn"] as const)("offers recent helpful actions and opens the exact localized choice in %s", locale => {
  const localized = tips.map(tip => localizeTip(tip, locale));
  const onTry = vi.fn();
  render(<HelpfulActionPicker entries={entries} tips={localized} locale={locale} onTry={onTry} />);
  fireEvent.click(screen.getByRole("button"));
  const choices = screen.getAllByRole("listitem");
  expect(choices).toHaveLength(5);
  expect(choices[0].textContent).toContain(localized[5].title);
  fireEvent.click(screen.getByRole("button", { name: localized[5].title, exact: true }));
  expect(onTry).toHaveBeenCalledExactlyOnceWith(localized[5]);
  expect(screen.queryByRole("region")).toBeNull();
});
it("hides without actionable history and updates when feedback disappears", () => {
  const localized = tips.map(tip => localizeTip(tip, "en"));
  const { rerender } = render(<HelpfulActionPicker entries={entries} tips={[]} locale="en" onTry={() => {}} />);
  expect(screen.queryByRole("button")).toBeNull();
  rerender(<HelpfulActionPicker entries={entries} tips={localized} locale="en" onTry={() => {}} />);
  fireEvent.click(screen.getByRole("button"));
  rerender(<HelpfulActionPicker entries={[]} tips={localized} locale="en" onTry={() => {}} />);
  expect(screen.queryByRole("button")).toBeNull();
});
it("expands the full list and Escape returns focus without choosing an action", () => {
  const onTry = vi.fn();
  render(<HelpfulActionPicker entries={entries} tips={tips.map(tip => localizeTip(tip, "en"))} locale="en" onTry={onTry} />);
  const trigger = screen.getByRole("button");
  fireEvent.click(trigger);
  fireEvent.click(screen.getByRole("button", { name: "Show all helpful tips" }));
  expect(screen.getAllByRole("listitem")).toHaveLength(6);
  fireEvent.keyDown(screen.getByRole("region"), { key: "Escape" });
  expect(document.activeElement).toBe(trigger);
  expect(screen.queryByRole("region")).toBeNull();
  expect(onTry).not.toHaveBeenCalled();
});

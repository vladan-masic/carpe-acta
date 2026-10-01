// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { summarizeHelpfulTips } from "../src/utils/helpfulTips";
import { WhatHelpsMe } from "../src/components/WhatHelpsMe";
import { tips } from "../src/data/tips";
import { localizeTip } from "../src/i18n/localizeTip";
import { whatHelpsMessages } from "../src/i18n/whatHelps";
import type { TipCompletion } from "../src/utils/completions";
const now = new Date("2026-10-02T12:00:00Z");
const event = (id: string, tipId: string, feedback?: boolean, completedAt = "2026-09-01T12:00:00Z"): TipCompletion => ({ id, tipId, feedback, completedAt });
afterEach(cleanup);
it("aggregates all history, counts repeat events, and includes mixed feedback with the latest answer", () => {
  const result = summarizeHelpfulTips([event("one", "tip", true), event("two", "tip", true), event("three", "tip", false, "2026-10-01T12:00:00Z")], now);
  expect(result).toHaveLength(1);
  expect(result[0]).toMatchObject({ helpfulCount: 2, notHelpfulCount: 1, latest: { helpful: false, completedAt: "2026-10-01T12:00:00Z" } });
});
it("deduplicates events and omits unrated, exclusively negative, invalid and future records", () => {
  const first = event("one", "tip", true);
  const result = summarizeHelpfulTips([first, first, event("none", "unrated"), event("no", "negative", false), event("future", "future", true, "2027-01-01"), event("invalid", "bad", true, "invalid")], now);
  expect(result.map((entry) => entry.tipId)).toEqual(["tip"]);
  expect(result[0].helpfulCount).toBe(1);
});
it("orders by most recent helpful completion rather than positive count", () => {
  const result = summarizeHelpfulTips([event("a", "old", true), event("b", "old", true), event("c", "new", true, "2026-10-01T10:00:00Z")], now);
  expect(result.map((entry) => entry.tipId)).toEqual(["new", "old"]);
});
it.each(["en", "sr-Latn"] as const)("opens the exact localized tip without saving or completing it in %s", (locale) => {
  const tip = localizeTip(tips[0], locale);
  const onTry = vi.fn();
  render(<WhatHelpsMe entries={summarizeHelpfulTips([event("one", tip.id, true)], now)} tips={[tip]} locale={locale} onTry={onTry} />);
  fireEvent.click(screen.getByRole("button", { name: `${whatHelpsMessages[locale].retry}: ${tip.title}` }));
  expect(onTry).toHaveBeenCalledExactlyOnceWith(tip);
  expect(screen.getByText(tip.action)).toBeTruthy();
});
it("retains helpful counts for retired tips without an unusable action button", () => {
  render(<WhatHelpsMe entries={summarizeHelpfulTips([event("one", "retired", true)], now)} tips={[]} locale="en" onTry={() => {}} />);
  expect(screen.getByText(whatHelpsMessages.en.unavailable)).toBeTruthy();
  expect(screen.queryByRole("button")).toBeNull();
});
it("offers all tips without initially overwhelming the section", () => {
  const localized = tips.slice(0, 6).map((tip) => localizeTip(tip, "en"));
  const entries = summarizeHelpfulTips(localized.map((tip, index) => event(String(index), tip.id, true)), now);
  render(<WhatHelpsMe entries={entries} tips={localized} locale="en" onTry={() => {}} />);
  expect(screen.getAllByRole("listitem")).toHaveLength(5);
  fireEvent.click(screen.getByRole("button", { name: "Show all helpful tips" }));
  expect(screen.getAllByRole("listitem")).toHaveLength(6);
  fireEvent.click(screen.getByRole("button", { name: "Show fewer tips" }));
  expect(screen.getAllByRole("listitem")).toHaveLength(5);
});
it("shows an invitation rather than an effectiveness claim when no helpful feedback exists", () => {
  render(<WhatHelpsMe entries={[]} tips={[]} locale="en" />);
  expect(screen.getByText(whatHelpsMessages.en.empty)).toBeTruthy();
});

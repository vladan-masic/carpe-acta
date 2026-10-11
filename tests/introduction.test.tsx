// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { App } from "../src/App";
import { DailyQuest } from "../src/components/DailyQuest";
import { tips } from "../src/data/tips";
import { localizeTip } from "../src/i18n/localizeTip";
import { messages } from "../src/i18n/messages";

vi.mock("../src/auth/client", () => ({ getSupabaseClient: () => null }));
afterEach(() => { cleanup(); localStorage.clear(); vi.unstubAllGlobals(); });

it.each(["en", "sr-Latn"] as const)("moves from the %s introduction to the generator without changing the suggestion", locale => {
  localStorage.setItem("carpe-acta-locale", locale);
  vi.stubGlobal("matchMedia", () => Object.assign(new EventTarget(), { matches: false }));
  render(<App />);
  const current = document.getElementById("active-tip-title")!.textContent;
  const hero = screen.getByRole("region", { name: "Carpe Acta" });
  const start = within(hero).getByRole("link", { name: messages[locale].navigation.start });
  expect(start.getAttribute("href")).toBe("#tip-generator");
  fireEvent.click(start);
  expect(document.activeElement).toBe(document.getElementById("tip-generator"));
  expect(document.getElementById("active-tip-title")!.textContent).toBe(current);
});

it.each(["en", "sr-Latn"] as const)("retains the %s daily action, favourite and source disclosure", locale => {
  const quest = localizeTip(tips.find(tip => tip.id === "acknowledge-a-small-finish")!, locale);
  const favorite = vi.fn();
  render(<DailyQuest locale={locale} label={messages[locale].dailyQuestLabel} quest={quest}
    favoriteButton={<button onClick={favorite}>Save</button>} />);
  const entry = screen.getByRole("article", { name: quest.title });
  expect(within(entry).getByText(quest.action)).toBeTruthy();
  expect(within(entry).getByText(quest.category)).toBeTruthy();
  fireEvent.click(within(entry).getByRole("button", { name: "Save" }));
  expect(favorite).toHaveBeenCalledOnce();
  expect(within(entry).getByText(/Tiny Habits · BJ Fogg/, { selector: "summary" })).toBeTruthy();
  expect(within(entry).queryByRole("progressbar")).toBeNull();
});

// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within, waitFor } from "@testing-library/react";
import { useState } from "react";
import { TipLibrary } from "../src/components/TipLibrary";
import { FavoriteButton } from "../src/components/FavoriteButton";
import { tips } from "../src/data/tips";
import { localizeTip } from "../src/i18n/localizeTip";
import { tipLibraryMessages } from "../src/i18n/tipLibrary";
import { messages } from "../src/i18n/messages";
import { filterLibraryTips } from "../src/utils/tipLibrary";
import type { Locale } from "../src/i18n/locales";
import { App } from "../src/App";

vi.mock("../src/auth/client", () => ({ getSupabaseClient: () => null }));
afterEach(() => { cleanup(); localStorage.clear(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

it.each(["en", "sr-Latn"] as const)("searches every content field in %s and preserves catalog order", (locale) => {
  const localized = tips.map((tip) => localizeTip(tip, locale));
  for (const tip of localized) {
    for (const field of [tip.title, tip.text, tip.action]) {
      expect(filterLibraryTips(localized, `  ${field.toUpperCase()}  `, "all", null)).toContain(tip);
    }
  }
  expect(filterLibraryTips(localized, " \t ", "all", null)).toEqual(localized);
  expect(filterLibraryTips(localized, "", "low-energy", 1)).toEqual(
    localized.filter((tip) => tip.categoryId === "low-energy" && tip.effortMinutes <= 1),
  );
  expect(filterLibraryTips(localized, "no-such-text-123", "all", null)).toEqual([]);
  expect(tips).toHaveLength(177);
});

it("normalizes Serbian Latin accents and searches only the supplied language", () => {
  const fixture = { ...localizeTip(tips[0], "sr-Latn"), title: "Čaša i šolja", text: "Pronađi svoj cilj", action: "Započni vežbu" };
  expect(filterLibraryTips([fixture], "CASA pronadji vezbu", "all", null)).toEqual([fixture]);
  expect(filterLibraryTips([fixture], localizeTip(tips[0], "en").title, "all", null)).toEqual([]);
  expect(filterLibraryTips([fixture], "casa", "work", null)).toEqual([]);
});

function Library({ locale = "en", disabled = false, onTry = vi.fn() }: { locale?: Locale; disabled?: boolean; onTry?: ReturnType<typeof vi.fn> }) {
  const [saved, setSaved] = useState<string[]>([]);
  return <TipLibrary tips={tips.map((tip) => localizeTip(tip, locale))} locale={locale} onTry={onTry}
    renderFavoriteButton={(tip) => <FavoriteButton title={tip.title} labels={messages[locale].favorites}
      selected={saved.includes(tip.id)} disabled={disabled}
      onToggle={() => setSaved((ids) => ids.includes(tip.id) ? ids.filter((id) => id !== tip.id) : [...ids, tip.id])} />} />;
}

it.each(["en", "sr-Latn"] as const)("supports disclosure, filters, favorites, empty results and exact selection in %s", (locale) => {
  const copy = tipLibraryMessages[locale];
  const onTry = vi.fn();
  render(<Library locale={locale} onTry={onTry} />);
  expect(screen.queryByRole("searchbox")).toBeNull();
  const toggle = screen.getByRole("button", { name: copy.title });
  expect(toggle.getAttribute("aria-expanded")).toBe("false");
  fireEvent.click(toggle);
  expect(screen.getAllByRole("article")).toHaveLength(6);
  const first = localizeTip(tips[0], locale);
  const star = screen.getByRole("button", { name: `${messages[locale].favorites.toggle}: ${first.title}` });
  fireEvent.click(star);
  expect(star.getAttribute("aria-pressed")).toBe("true");
  fireEvent.click(star);
  expect(star.getAttribute("aria-pressed")).toBe("false");
  fireEvent.click(screen.getByRole("button", { name: `${copy.try}: ${first.title}` }));
  expect(onTry).toHaveBeenCalledExactlyOnceWith(first);
  fireEvent.change(screen.getByRole("combobox", { name: copy.category }), { target: { value: "low-energy" } });
  fireEvent.change(screen.getByRole("combobox", { name: copy.effort }), { target: { value: "1" } });
  const expected = tips.filter((tip) => tip.categoryId === "low-energy" && tip.effortMinutes <= 1);
  expect(screen.getAllByRole("article").map((card) => within(card).getByRole("heading").textContent)).toEqual(expected.map((tip) => localizeTip(tip, locale).title));
  fireEvent.change(screen.getByRole("searchbox"), { target: { value: "zzz-no-match" } });
  expect(screen.queryByRole("article")).toBeNull();
  expect(screen.getByText(copy.empty)).toBeTruthy();
  expect(screen.queryByRole("button", { name: copy.more })).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: copy.reset }));
  expect(screen.getAllByRole("article")).toHaveLength(6);
  expect(screen.getByRole("status").textContent).toBe(copy.results(6, 177));
});

it("pages through the whole catalog, focuses new results, and resets after criteria or language changes", async () => {
  const { rerender } = render(<Library />);
  fireEvent.click(screen.getByRole("button", { name: "Browse all tips" }));
  fireEvent.click(screen.getByRole("button", { name: "Show more" }));
  expect(screen.getAllByRole("article")).toHaveLength(12);
  await waitFor(() => expect(document.activeElement?.textContent).toBe(localizeTip(tips[6], "en").title));
  fireEvent.change(screen.getByRole("searchbox"), { target: { value: "a" } });
  fireEvent.change(screen.getByRole("searchbox"), { target: { value: "" } });
  expect(screen.getAllByRole("article")).toHaveLength(6);
  fireEvent.click(screen.getByRole("button", { name: "Show more" }));
  rerender(<Library locale="sr-Latn" disabled />);
  expect(screen.getAllByRole("article")).toHaveLength(6);
  expect((screen.getAllByRole("button", { name: /^Omiljeni savet:/ })[0] as HTMLButtonElement).disabled).toBe(true);
  while (screen.queryByRole("button", { name: "Prikaži još" })) {
    fireEvent.click(screen.getByRole("button", { name: "Prikaži još" }));
  }
  expect(screen.getAllByRole("article")).toHaveLength(177);
  expect(screen.getByRole("status").textContent).toBe("Prikazano 177 od 177 saveta");
});

it("integrates with the action card, completion reset, guided mode, and shared guest favorites", async () => {
  localStorage.setItem("carpe-acta-locale", "en");
  vi.stubGlobal("matchMedia", () => ({ matches: true }));
  Element.prototype.scrollIntoView = vi.fn();
  render(<App />);
  const active = () => document.getElementById("active-tip-title")!;
  const initial = active().textContent;
  const quest = document.querySelector(".daily-quest h2")!.textContent;
  fireEvent.click(screen.getByRole("button", { name: "Browse all tips" }));
  const library = within(screen.getByRole("region", { name: "Browse all tips" }));
  fireEvent.change(library.getByRole("searchbox"), { target: { value: localizeTip(tips[0], "en").title } });
  expect(active().textContent).toBe(initial);
  const star = library.getByRole("button", { name: `Favorite: ${localizeTip(tips[0], "en").title}` });
  fireEvent.click(star);
  expect(screen.getByRole("link", { name: "Favorites (1)" })).toBeTruthy();
  const tryButton = library.getByRole("button", { name: `Try this: ${localizeTip(tips[0], "en").title}` });
  fireEvent.click(tryButton);
  await waitFor(() => expect(document.activeElement).toBe(active()));
  fireEvent.click(screen.getByRole("button", { name: "I did it ✓" }));
  expect((screen.getByRole("button", { name: "Completed ✓" }) as HTMLButtonElement).disabled).toBe(true);
  fireEvent.click(tryButton);
  expect((screen.getByRole("button", { name: "I did it ✓" }) as HTMLButtonElement).disabled).toBe(false);
  fireEvent.click(screen.getByRole("button", { name: "Help me start" }));
  expect(document.getElementById("active-tip-title")).toBeNull();
  fireEvent.click(tryButton);
  expect(active().textContent).toBe(localizeTip(tips[0], "en").title);
  expect(document.querySelector(".daily-quest h2")!.textContent).toBe(quest);
  expect(screen.queryByRole("button", { name: "Back to random tips" })).toBeNull();
});

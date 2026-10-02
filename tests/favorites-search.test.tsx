// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { FavoriteTips } from "../src/components/FavoriteTips";
import { tips } from "../src/data/tips";
import { localizeTip } from "../src/i18n/localizeTip";
import { messages } from "../src/i18n/messages";
import { favoritesSearchMessages } from "../src/i18n/favoritesSearch";
import type { Locale } from "../src/i18n/locales";

afterEach(cleanup);
const saved = [tips[2], tips[0], tips[1]];
function props(locale: Locale) {
  const copy = messages[locale];
  return {
    locale, title: copy.favorites.title, description: copy.favorites.description,
    emptyMessage: copy.favorites.empty, openLabel: copy.favorites.open,
    actionLabel: copy.generator.actionLabel, labels: copy.favorites,
    tips: saved.map((tip) => localizeTip(tip, locale)),
    onToggle: vi.fn(), onOpen: vi.fn(),
  };
}

it.each(["en", "sr-Latn"] as const)("searches all three fields and preserves saved order in %s", (locale) => {
  const input = props(locale);
  const copy = favoritesSearchMessages[locale];
  render(<FavoriteTips {...input} />);
  const titles = () => screen.getAllByRole("article").map((card) => within(card).getByRole("heading").textContent);
  expect(titles()).toEqual(input.tips.map((tip) => tip.title));
  const target = input.tips[1];
  for (const field of [target.title, target.text, target.action]) {
    fireEvent.change(screen.getByRole("searchbox", { name: copy.search }), { target: { value: `  ${field.toUpperCase()}  ` } });
    expect(titles()).toEqual([target.title]);
  }
  expect(screen.getByRole("heading", { name: `${input.title} (3)` })).toBeTruthy();
  expect(screen.getByRole("status").textContent).toBe(copy.results(1, 3));
  fireEvent.change(screen.getByRole("combobox", { name: copy.category }), { target: { value: "planning" } });
  expect(screen.queryByRole("article")).toBeNull();
  expect(screen.getByText(copy.empty)).toBeTruthy();
  expect(screen.queryByText(input.emptyMessage)).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: copy.reset }));
  expect(titles()).toEqual(input.tips.map((tip) => tip.title));
  expect(input.onToggle).not.toHaveBeenCalled();
  expect(input.onOpen).not.toHaveBeenCalled();
});

it("opens and removes the exact filtered favorite using existing callbacks", () => {
  const input = props("en");
  const { rerender } = render(<FavoriteTips {...input} />);
  fireEvent.change(screen.getByRole("combobox"), { target: { value: "focus" } });
  fireEvent.click(screen.getByRole("button", { name: input.openLabel }));
  expect(input.onOpen).toHaveBeenCalledExactlyOnceWith(input.tips[1]);
  fireEvent.click(screen.getByRole("button", { name: `Favorite: ${input.tips[1].title}` }));
  expect(input.onToggle).toHaveBeenCalledExactlyOnceWith(input.tips[1].id);
  expect(document.activeElement?.id).toBe("favorites-title");
  rerender(<FavoriteTips {...input} tips={input.tips.filter((tip) => tip.categoryId !== "focus")} />);
  expect((screen.getByRole("combobox") as HTMLSelectElement).value).toBe("focus");
  expect(screen.getByText(favoritesSearchMessages.en.empty)).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: favoritesSearchMessages.en.reset }));
  expect(screen.getAllByRole("article")).toHaveLength(2);
});

it("retains the filters and searches localized content after switching language", () => {
  const { rerender } = render(<FavoriteTips {...props("en")} />);
  fireEvent.change(screen.getByRole("combobox"), { target: { value: "focus" } });
  fireEvent.change(screen.getByRole("searchbox"), { target: { value: "pocetak" } });
  expect(screen.queryByRole("article")).toBeNull();
  rerender(<FavoriteTips {...props("sr-Latn")} />);
  expect((screen.getByRole("combobox") as HTMLSelectElement).value).toBe("focus");
  expect((screen.getByRole("searchbox") as HTMLInputElement).value).toBe("pocetak");
  expect(screen.getAllByRole("article")).toHaveLength(1);
  expect(screen.getByRole("heading", { name: localizeTip(tips[0], "sr-Latn").title })).toBeTruthy();
});

it("keeps account controls and disabled favorites intact while filtering", () => {
  const input = props("en");
  render(<FavoriteTips {...input} disabled controls={<button>Refresh account favorites</button>} />);
  fireEvent.change(screen.getByRole("combobox"), { target: { value: "focus" } });
  expect(screen.getByRole("button", { name: "Refresh account favorites" })).toBeTruthy();
  const star = screen.getByRole("button", { name: `Favorite: ${input.tips[1].title}` });
  expect((star as HTMLButtonElement).disabled).toBe(true);
  fireEvent.click(star);
  expect(input.onToggle).not.toHaveBeenCalled();
});

it("distinguishes no saved tips from unavailable or loading account data", () => {
  const input = props("en");
  const { rerender } = render(<FavoriteTips {...input} tips={[]} loading />);
  expect(screen.queryByText(input.emptyMessage)).toBeNull();
  expect(screen.queryByRole("searchbox")).toBeNull();
  rerender(<FavoriteTips {...input} tips={[]} />);
  expect(screen.getByText(input.emptyMessage)).toBeTruthy();
  expect(screen.queryByText(favoritesSearchMessages.en.empty)).toBeNull();
});

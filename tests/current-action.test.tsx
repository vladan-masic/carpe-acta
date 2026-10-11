// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { TipCard } from "../src/components/TipCard";
import { ActionTimer } from "../src/components/ActionTimer";
import { CategoryFilter } from "../src/components/CategoryFilter";
import { tips } from "../src/data/tips";
import { localizeTip } from "../src/i18n/localizeTip";
import { messages } from "../src/i18n/messages";
import { timerMessages } from "../src/i18n/timer";
import type { CategoryId } from "../src/types/tip";

afterEach(cleanup);

it.each(["en", "sr-Latn"] as const)("keeps timer optional and before completion in the %s reading order", (locale) => {
  const copy = messages[locale];
  const tip = localizeTip(tips[0], locale);
  const complete = vi.fn();
  render(<TipCard locale={locale} tip={tip} actionLabel={copy.generator.actionLabel}
    explanationLabel={copy.generator.explanationLabel} buttonLabel={copy.generator.generateButton}
    onGenerateTip={vi.fn()} completionCopy={copy.completion} completionStatus={null}
    completionBusy={false} savingLabel="Saving" failedLabel="Failed" retryLabel="Retry"
    onRetry={vi.fn()} onComplete={complete} favoriteButton={null}
    timer={<ActionTimer locale={locale} minutes={tip.effortMinutes} />} />);
  const card = screen.getByRole("article", { name: tip.title });
  expect(within(card).getByText(tip.text)).toBeTruthy();
  expect(within(card).getByText(tip.action)).toBeTruthy();
  const timer = within(card).getByRole("region", { name: timerMessages[locale].title });
  expect(within(timer).getByText(timerMessages[locale].optional)).toBeTruthy();
  const done = within(card).getByRole("button", { name: copy.completion.button });
  expect(timer.compareDocumentPosition(done) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  fireEvent.click(done);
  expect(complete).toHaveBeenCalledOnce();
  expect(screen.queryByRole("timer")).toBeNull();
});

it.each(["en", "sr-Latn"] as const)("keeps all 21 category names, IDs and accessible selection in %s", (locale) => {
  const copy = messages[locale];
  const select = vi.fn();
  const categories = Object.entries(copy.categories).map(([id, label]) => ({ id: id as CategoryId, label }));
  render(<CategoryFilter ariaLabel={copy.generator.categoriesLabel} moreLabel={copy.generator.moreCategories}
    lessLabel={copy.generator.fewerCategories} categories={categories} selectedCategory="focus" onSelectCategory={select} />);
  fireEvent.click(screen.getByRole("button", { name: new RegExp(copy.generator.moreCategories) }));
  const group = screen.getByRole("group", { name: copy.generator.categoriesLabel });
  expect(within(group).getAllByRole("button")).toHaveLength(21);
  for (const { id, label } of categories) {
    const button = within(group).getByRole("button", { name: label, exact: true });
    expect(button.getAttribute("aria-pressed")).toBe(String(id === "focus"));
    fireEvent.click(button);
    expect(select).toHaveBeenLastCalledWith(id);
  }
  expect(within(group).queryByRole("img")).toBeNull();
});

it.each(["en", "sr-Latn"] as const)("offers every existing category in the compact mobile selector in %s", (locale) => {
  const copy = messages[locale];
  const select = vi.fn();
  const categories = [{ id: "all" as const, label: copy.generator.allCategories },
    ...Object.entries(copy.categories).map(([id, label]) => ({ id: id as CategoryId, label }))];
  const props = { ariaLabel: copy.generator.categoriesLabel, moreLabel: copy.generator.moreCategories,
    lessLabel: copy.generator.fewerCategories, categories, selectedCategory: "focus" as const, onSelectCategory: select };
  const { rerender } = render(<CategoryFilter {...props} />);
  const picker = screen.getByRole("combobox", { name: copy.generator.categoriesLabel }) as HTMLSelectElement;
  expect(within(picker).getAllByRole("option")).toHaveLength(22);
  expect(picker.value).toBe("focus");
  for (const category of categories) {
    expect(within(picker).getByRole("option", { name: category.label, exact: true }).getAttribute("value")).toBe(category.id);
    fireEvent.change(picker, { target: { value: category.id } });
    expect(select).toHaveBeenLastCalledWith(category.id);
  }
  rerender(<CategoryFilter {...props} selectedCategory="digital-distraction" />);
  expect(picker.value).toBe("digital-distraction");
});

// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TipCard } from "../src/components/TipCard";
import { tips } from "../src/data/tips";
import { localizeTip } from "../src/i18n/localizeTip";
import { messages } from "../src/i18n/messages";
import type { Locale } from "../src/i18n/locales";

afterEach(cleanup);
const explained = tips.filter((tip) => localizeTip(tip, "en").whyItWorks);
function props(locale: Locale) {
  const copy = messages[locale];
  return {
    tip: localizeTip(explained[0], locale), actionLabel: copy.generator.actionLabel,
    explanationLabel: copy.generator.explanationLabel, buttonLabel: copy.generator.generateButton,
    onGenerateTip: vi.fn(), onComplete: vi.fn(), onRetry: vi.fn(), completionCopy: copy.completion,
    completionStatus: null, completionBusy: false, savingLabel: "Saving", failedLabel: "Failed",
    retryLabel: "Retry", favoriteButton: null,
  };
}

it.each(["en", "sr-Latn"] as const)("offers the existing explanation collapsed and toggles it in %s", async (locale) => {
  const input = props(locale);
  const { container } = render(<TipCard {...input} />);
  const details = container.querySelector("details")!;
  const summary = screen.getByText(input.explanationLabel);
  expect(details.open).toBe(false);
  expect(details.querySelector("p")!.textContent).toBe(input.tip.whyItWorks);
  expect(screen.getByText(input.tip.action)).toBeTruthy();
  // Action buttons precede the optional explanation in reading order.
  expect(screen.getByRole("button", { name: input.completionCopy.button }).compareDocumentPosition(details) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  const user = userEvent.setup();
  await user.click(summary);
  expect(details.open).toBe(true);
  await user.click(summary);
  expect(details.open).toBe(false);
  expect(input.onGenerateTip).not.toHaveBeenCalled();
  expect(input.onComplete).not.toHaveBeenCalled();
});

it("preserves expansion across languages and collapses for a different tip", async () => {
  const { container, rerender } = render(<TipCard {...props("en")} />);
  await userEvent.click(screen.getByText(messages.en.generator.explanationLabel));
  expect(container.querySelector("details")!.open).toBe(true);
  rerender(<TipCard {...props("sr-Latn")} />);
  expect(container.querySelector("details")!.open).toBe(true);
  expect(screen.getByText(localizeTip(explained[0], "sr-Latn").whyItWorks!)).toBeTruthy();
  rerender(<TipCard {...props("sr-Latn")} tip={localizeTip(explained[1], "sr-Latn")} />);
  expect(container.querySelector("details")!.open).toBe(false);
});

it.each([undefined, "", "  "])("omits the disclosure when an explanation is missing or blank (%s)", (whyItWorks) => {
  const input = props("en");
  const { container } = render(<TipCard {...input} tip={{ ...input.tip, whyItWorks }} />);
  expect(container.querySelector("details")).toBeNull();
  expect(screen.getByText(input.tip.action)).toBeTruthy();
});

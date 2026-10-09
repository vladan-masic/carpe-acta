// @vitest-environment jsdom
import { afterEach, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { TipSources } from "../src/components/TipSources";
import { tipSources } from "../src/data/tipSources";
import { tips } from "../src/data/tips";
afterEach(cleanup);
it.each(["en", "sr-Latn"] as const)("distinguishes inspired content from related reading in %s", locale => {
  const { rerender } = render(<TipSources tipId="acknowledge-a-small-finish" locale={locale} />);
  expect(screen.getByText(/Tiny Habits · BJ Fogg/, { selector: "summary" }).textContent).toContain(locale === "en" ? "Inspired by" : "Inspirisano metodom");
  expect(screen.getByRole("link", { hidden: true }).getAttribute("href")).toBe("https://tinyhabits.com/rewire/");
  rerender(<TipSources tipId="attach-to-an-existing-cue" locale={locale} />);
  expect(screen.getAllByText(locale === "en" ? /Related reading/ : /Povezano štivo/, { selector: "summary" })).toHaveLength(2);
  expect(screen.queryByText(locale === "en" ? /This action and its wording/ : /Ova radnja i njen tekst/)).toBeNull();
});
it("omits source UI for unlabeled tips", () => {
  const { container } = render(<TipSources tipId="two-minute-start" locale="en" />);
  expect(container.innerHTML).toBe("");
});
it("maps sources only to live tips with bilingual notes and official HTTPS links", () => {
  const ids = new Set<string>(tips.map(t => t.id));
  for (const [id, refs] of Object.entries(tipSources)) {
    expect(ids.has(id)).toBe(true);
    for (const ref of refs) {
      const url = new URL(ref.url);
      expect(url.protocol).toBe("https:");
      expect(["jamesclear.com", "tinyhabits.com"]).toContain(url.hostname);
      expect(ref.explanation.en.length).toBeGreaterThan(0);
      expect(ref.explanation["sr-Latn"].length).toBeGreaterThan(0);
    }
  }
  expect(tips.slice(-3).map(t => t.id)).toEqual(["acknowledge-a-small-finish", "practice-one-quality", "add-enjoyment-to-the-task"]);
});

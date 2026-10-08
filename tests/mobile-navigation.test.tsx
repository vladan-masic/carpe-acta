// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { AppToolbar } from "../src/components/AppToolbar";
import { CategoryFilter } from "../src/components/CategoryFilter";
import { BackToTop } from "../src/components/BackToTop";
import { messages } from "../src/i18n/messages";

afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

it.each(["en", "sr-Latn"] as const)("discloses categories without selecting a new tip in %s", (locale) => {
  const copy = messages[locale];
  const select = vi.fn();
  render(<CategoryFilter ariaLabel={copy.generator.categoriesLabel}
    moreLabel={copy.generator.moreCategories} lessLabel={copy.generator.fewerCategories}
    categories={[{ id: "all", label: copy.generator.allCategories }, { id: "work", label: copy.categories.work }]}
    selectedCategory="work" onSelectCategory={select} />);
  const toggle = screen.getByRole("button", { name: new RegExp(copy.generator.moreCategories) });
  expect(toggle.textContent).toContain(copy.categories.work);
  expect(toggle.getAttribute("aria-expanded")).toBe("false");
  fireEvent.click(toggle);
  expect(toggle.getAttribute("aria-expanded")).toBe("true");
  expect(select).not.toHaveBeenCalled();
  expect(screen.getByRole("button", { name: copy.categories.work }).getAttribute("aria-pressed")).toBe("true");
  fireEvent.click(screen.getByRole("button", { name: copy.generator.allCategories }));
  expect(select).toHaveBeenCalledExactlyOnceWith("all");
  fireEvent.click(toggle);
  expect(toggle.getAttribute("aria-expanded")).toBe("false");
});

it("supports Escape, outside dismissal and focus on the favorites destination", () => {
  render(<><AppToolbar label="Menu"><button>Account</button><a href="#favorites-title">Favorites</a></AppToolbar>
    <h2 id="favorites-title" tabIndex={-1}>Saved tips</h2><button>Outside</button></>);
  const toggle = screen.getByRole("button", { name: "Menu" });
  fireEvent.click(toggle);
  fireEvent.keyDown(screen.getByRole("button", { name: "Account" }), { key: "Escape" });
  expect(toggle.getAttribute("aria-expanded")).toBe("false");
  expect(document.activeElement).toBe(toggle);
  fireEvent.click(toggle);
  fireEvent.pointerDown(screen.getByRole("button", { name: "Outside" }));
  expect(toggle.getAttribute("aria-expanded")).toBe("false");
  fireEvent.click(toggle);
  fireEvent.click(screen.getByRole("link", { name: "Favorites" }));
  expect(toggle.getAttribute("aria-expanded")).toBe("false");
  expect(document.activeElement).toBe(screen.getByRole("heading", { name: "Saved tips" }));
});

it("lets nested controls consume Escape without also closing the toolbar", () => {
  render(<AppToolbar label="Menu"><button onKeyDown={(event) => event.preventDefault()}>Language</button></AppToolbar>);
  const toggle = screen.getByRole("button", { name: "Menu" });
  fireEvent.click(toggle);
  fireEvent.keyDown(screen.getByRole("button", { name: "Language" }), { key: "Escape" });
  expect(toggle.getAttribute("aria-expanded")).toBe("true");
});

it.each(["en", "sr-Latn"] as const)("provides a labeled top link and returns keyboard focus in %s", (locale) => {
  vi.stubGlobal("matchMedia", () => ({ matches: false }));
  vi.stubGlobal("scrollY", 1000);
  const scroll = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  render(<><main id="page-top" tabIndex={-1}>Page</main><BackToTop label={messages[locale].footer.backToTop} /></>);
  const link = screen.getByRole("link", { name: messages[locale].footer.backToTop });
  expect(link.getAttribute("href")).toBe("#page-top");
  fireEvent.click(link);
  expect(document.activeElement).toBe(screen.getByRole("main"));
  expect(scroll).toHaveBeenCalledWith({ top: 0, left: 0, behavior: "smooth" });
});

it("returns to the top without animation when reduced motion is requested", () => {
  vi.stubGlobal("matchMedia", () => ({ matches: true }));
  vi.stubGlobal("scrollY", 1000);
  const scroll = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  render(<BackToTop label="Back to top" />);
  fireEvent.click(screen.getByRole("link", { name: "Back to top" }));
  expect(scroll).toHaveBeenCalledWith({ top: 0, left: 0, behavior: "instant" });
});

it("hides the top link until the introduction has scrolled away", () => {
  vi.stubGlobal("scrollY", 0);
  render(<BackToTop label="Back to top" />);
  expect(screen.queryByRole("link", { name: "Back to top" })).toBeNull();
  vi.stubGlobal("scrollY", 1000);
  fireEvent.scroll(window);
  expect(screen.getByRole("link", { name: "Back to top" })).toBeTruthy();
  vi.stubGlobal("scrollY", 0);
  fireEvent.scroll(window);
  expect(screen.queryByRole("link", { name: "Back to top" })).toBeNull();
});

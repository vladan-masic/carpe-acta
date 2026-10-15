// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App } from "../src/App";
import { AccountIdentity } from "../src/components/AccountIdentity";

vi.mock("../src/auth/client", () => ({ getSupabaseClient: () => null }));
afterEach(() => { cleanup(); localStorage.clear(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

it.each(["en", "sr-Latn"] as const)("opens existing library search from the %s mobile toolbar without clearing the query", async locale => {
  localStorage.setItem("carpe-acta-locale", locale);
  vi.stubGlobal("matchMedia", () => Object.assign(new EventTarget(), { matches: false }));
  Element.prototype.scrollIntoView = vi.fn();
  render(<App />);
  const menu = screen.getByRole("button", { name: locale === "en" ? "Menu" : "Meni" });
  menu.focus();
  fireEvent.click(menu);
  fireEvent.click(screen.getByRole("button", { name: locale === "en" ? "Search tips" : "Pretraži savete" }));
  const search = document.getElementById("tip-library-search")!;
  await waitFor(() => expect(document.activeElement).toBe(search));
  expect(document.getElementById("tip-library-content")!.hidden).toBe(false);
  expect(menu.getAttribute("aria-expanded")).toBe("false");
  fireEvent.change(search, { target: { value: "focus" } });
  menu.focus();
  fireEvent.click(menu);
  fireEvent.click(screen.getByRole("button", { name: locale === "en" ? "Search tips" : "Pretraži savete" }));
  await waitFor(() => expect(document.activeElement).toBe(search));
  expect((search as HTMLInputElement).value).toBe("focus");
});

it("keeps full language names and restores focus with keyboard selection and Escape", async () => {
  vi.stubGlobal("matchMedia", () => Object.assign(new EventTarget(), { matches: false }));
  localStorage.setItem("carpe-acta-locale", "en");
  const user = userEvent.setup();
  render(<App />);
  const trigger = screen.getByRole("button", { name: /: English$/ });
  expect(trigger.textContent).toBe("EN");
  trigger.focus();
  await user.keyboard("{ArrowDown}{End}{Enter}");
  await waitFor(() => expect(document.activeElement).toBe(trigger));
  expect(trigger.textContent).toBe("SR");
  expect(localStorage.getItem("carpe-acta-locale")).toBe("sr-Latn");
  await user.keyboard("{ArrowDown}{Escape}");
  await waitFor(() => expect(document.activeElement).toBe(trigger));
  expect(screen.queryByRole("listbox")).toBeNull();
});

it("renders safe provider identity and falls back when the image fails", () => {
  const { container } = render(<AccountIdentity metadata={{ full_name: "Mina Petrović", avatar_url: "https://example.com/avatar.png" }} greeting="Good day," fallback="Account" />);
  const image = container.querySelector("img")!;
  expect(image.getAttribute("referrerpolicy")).toBe("no-referrer");
  fireEvent.error(image);
  expect(container.querySelector("img")).toBeNull();
  expect(screen.getByText("MP")).toBeTruthy();
  expect(screen.getByText("Mina Petrović")).toBeTruthy();
});

it.each([undefined, { full_name: "private@example.com", avatar_url: "javascript:alert(1)" }, { name: 123, picture: "http://example.com/avatar" }])("uses a neutral identity for missing or malformed metadata", metadata => {
  const { container } = render(<AccountIdentity metadata={metadata} greeting="Dobar dan," fallback="Nalog" />);
  expect(screen.getByText("Nalog")).toBeTruthy();
  expect(container.querySelector("img")).toBeNull();
  expect(container.textContent).not.toContain("private@example.com");
});

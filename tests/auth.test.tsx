// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, renderHook, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { AuthChangeEvent, Session, SupabaseClient } from "@supabase/supabase-js";
import { authErrorKey, authRedirectUrl, getAuthConfig } from "../src/auth/config";
import { performAuthAction } from "../src/auth/actions";
import { authMessages } from "../src/i18n/auth";

const mock = vi.hoisted(() => ({
  handlers: new Set<(event: AuthChangeEvent, session: Session | null) => void>(),
  auth: {
    initialize: vi.fn(), getSession: vi.fn(), onAuthStateChange: vi.fn(),
    signInWithPassword: vi.fn(), signUp: vi.fn(), signInWithOtp: vi.fn(),
    resetPasswordForEmail: vi.fn(), updateUser: vi.fn(), signInWithOAuth: vi.fn(), signOut: vi.fn(),
  },
}));
vi.mock("../src/auth/client", () => ({ getSupabaseClient: () => ({ auth: mock.auth }) }));
import { useAuth } from "../src/hooks/useAuth";
import { AuthPanel as AuthPanelView } from "../src/components/AuthPanel";

function AuthPanel({ locale }: { locale: "en" | "sr-Latn" }) {
  const auth = useAuth();
  return <AuthPanelView locale={locale} auth={auth} />;
}

const client = { auth: mock.auth } as unknown as SupabaseClient;
const session = { user: { id: "test-user", email: "reader@example.com" } } as Session;
function emit(event: AuthChangeEvent, value: Session | null) {
  act(() => { mock.handlers.forEach((handler) => handler(event, value)); });
}

beforeEach(() => {
  vi.resetAllMocks();
  mock.handlers.clear();
  window.history.replaceState(null, "", "/");
  Object.defineProperty(HTMLDialogElement.prototype, "showModal", { configurable: true, value() { this.setAttribute("open", ""); } });
  Object.defineProperty(HTMLDialogElement.prototype, "close", { configurable: true, value() { this.removeAttribute("open"); this.dispatchEvent(new Event("close")); } });
  mock.auth.initialize.mockResolvedValue({ error: null });
  mock.auth.getSession.mockResolvedValue({ data: { session: null }, error: null });
  mock.auth.onAuthStateChange.mockImplementation((handler) => {
    mock.handlers.add(handler);
    return { data: { subscription: { unsubscribe: () => mock.handlers.delete(handler) } } };
  });
  for (const method of [mock.auth.signInWithPassword, mock.auth.signUp, mock.auth.signInWithOtp, mock.auth.resetPasswordForEmail, mock.auth.updateUser, mock.auth.signInWithOAuth, mock.auth.signOut]) {
    method.mockResolvedValue({ data: { session: null }, error: null });
  }
});
afterEach(cleanup);

describe("auth configuration and errors", () => {
  it("accepts public configuration and rejects missing, insecure, and server keys", () => {
    expect(getAuthConfig("https://project.supabase.co", "sb_publishable_test")).toEqual({ url: "https://project.supabase.co", key: "sb_publishable_test" });
    expect(getAuthConfig("http://localhost:54321", "sb_publishable_test")).not.toBeNull();
    expect(getAuthConfig()).toBeNull();
    expect(getAuthConfig("http://project.supabase.co", "sb_publishable_test")).toBeNull();
    expect(getAuthConfig("not a url", "sb_publishable_test")).toBeNull();
    expect(getAuthConfig("https://project.supabase.co", "sb_secret_test")).toBeNull();
    for (const role of ["anon", "service_role"]) {
      expect(Boolean(getAuthConfig("https://project.supabase.co", `header.${btoa(JSON.stringify({ role }))}.signature`))).toBe(role === "anon");
    }
  });
  it("never carries tokens or an external next URL into redirects", () => {
    window.history.replaceState(null, "", "/?next=https://other.example&code=secret#access_token=secret");
    expect(authRedirectUrl()).toBe(`${window.location.origin}/`);
  });
  it("maps errors to translated keys without exposing arbitrary server messages", () => {
    expect(authErrorKey({ code: "invalid_credentials" })).toBe("invalidCredentials");
    expect(authErrorKey({ code: "otp_expired" })).toBe("expiredLink");
    expect(authErrorKey({ code: "over_email_send_rate_limit" })).toBe("rateLimit");
    expect(authErrorKey(new Error("sensitive internal message"))).toBe("genericError");
    for (const value of Object.values(authMessages)) {
      expect(Object.keys(value).sort()).toEqual(Object.keys(authMessages.en).sort());
      expect(Object.values(value).every((text) => text.trim())).toBe(true);
    }
  });
});

describe("Supabase actions", () => {
  it("sends password credentials without changing the password", async () => {
    await performAuthAction(client, "login", " reader@example.com ", " password ");
    expect(mock.auth.signInWithPassword).toHaveBeenCalledWith({ email: "reader@example.com", password: " password " });
  });
  it("handles signup confirmation and immediately available sessions", async () => {
    expect(await performAuthAction(client, "signup", "reader@example.com", "password123")).toBe("signupSent");
    expect(mock.auth.signUp).toHaveBeenCalledWith(expect.objectContaining({ options: { emailRedirectTo: `${window.location.origin}/` } }));
    mock.auth.signUp.mockResolvedValue({ data: { session }, error: null });
    expect(await performAuthAction(client, "signup")).toBeNull();
  });
  it("uses the app URL for email links, Google, and password recovery", async () => {
    expect(await performAuthAction(client, "link", "reader@example.com")).toBe("checkEmail");
    expect(mock.auth.signInWithOtp).toHaveBeenCalledWith({ email: "reader@example.com", options: { emailRedirectTo: `${window.location.origin}/`, shouldCreateUser: true } });
    await performAuthAction(client, "google");
    expect(mock.auth.signInWithOAuth).toHaveBeenCalledWith({ provider: "google", options: { redirectTo: `${window.location.origin}/` } });
    expect(await performAuthAction(client, "reset", "reader@example.com")).toBe("resetSent");
    expect(mock.auth.resetPasswordForEmail).toHaveBeenCalledWith("reader@example.com", { redirectTo: `${window.location.origin}/` });
  });
  it("updates passwords and signs out only this device without clearing guest data", async () => {
    localStorage.setItem("carpe-acta-favorites-v1", '["two-minute-start"]');
    expect(await performAuthAction(client, "password", "", "new-password")).toBe("passwordSaved");
    expect(mock.auth.updateUser).toHaveBeenCalledWith({ password: "new-password" });
    await performAuthAction(client, "logout");
    expect(mock.auth.signOut).toHaveBeenCalledWith({ scope: "local" });
    expect(localStorage.getItem("carpe-acta-favorites-v1")).toBe('["two-minute-start"]');
  });
  it("propagates service failures instead of showing false success", async () => {
    const error = { code: "invalid_credentials" };
    mock.auth.signInWithPassword.mockResolvedValue({ error });
    await expect(performAuthAction(client, "login")).rejects.toEqual(error);
  });
});

describe("session lifecycle", () => {
  it("allows guest mode without configuration", () => {
    const { result } = renderHook(() => useAuth(null));
    expect(result.current.loading).toBe(false);
    expect(result.current.session).toBeNull();
    expect(mock.auth.getSession).not.toHaveBeenCalled();
  });
  it("restores a session, receives logout, and cleans up its subscription", async () => {
    mock.auth.getSession.mockResolvedValue({ data: { session }, error: null });
    const { result, unmount } = renderHook(() => useAuth(client));
    await waitFor(() => expect(result.current.session).toBe(session));
    emit("SIGNED_OUT", null);
    expect(result.current.session).toBeNull();
    unmount();
    expect(mock.handlers.size).toBe(0);
  });
  it("does not overwrite a newer auth event with a stale session read", async () => {
    let resolve!: (value: unknown) => void;
    mock.auth.getSession.mockReturnValue(new Promise((done) => { resolve = done; }));
    const { result } = renderHook(() => useAuth(client));
    await waitFor(() => expect(mock.auth.getSession).toHaveBeenCalled());
    emit("SIGNED_IN", session);
    await act(async () => resolve({ data: { session: null }, error: null }));
    expect(result.current.session).toBe(session);
  });
  it("reports callback failure, strips the failed code, and preserves an existing session", async () => {
    window.history.replaceState(null, "", "/?code=expired");
    mock.auth.getSession.mockResolvedValue({ data: { session }, error: null });
    const { result } = renderHook(() => useAuth(client));
    await waitFor(() => expect(result.current.error).toBe("expiredLink"));
    await waitFor(() => expect(result.current.session).toBe(session));
    expect(window.location.search).toBe("");
  });
  it("handles unexpected initialization failure without leaving the app loading", async () => {
    mock.auth.initialize.mockRejectedValue(new Error("Offline"));
    const { result } = renderHook(() => useAuth(client));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("genericError");
  });
  it("handles cancelled OAuth without showing raw URL error text", async () => {
    window.history.replaceState(null, "", "/#error=access_denied&error_description=private-message");
    const { result } = renderHook(() => useAuth(client));
    await waitFor(() => expect(result.current.error).toBe("callbackError"));
    expect(window.location.hash).toBe("");
  });
});

async function openLogin(locale: "en" | "sr-Latn" = "en") {
  const user = userEvent.setup();
  render(<AuthPanel locale={locale} />);
  await user.click(await screen.findByRole("button", { name: authMessages[locale].login, exact: true }));
  return user;
}

describe("login interface", () => {
  it.each(["en", "sr-Latn"] as const)("dismisses the account card on a backdrop click and restores focus in %s", async (locale) => {
    mock.auth.getSession.mockResolvedValue({ data: { session }, error: null });
    render(<AuthPanel locale={locale} />);
    const trigger = await screen.findByRole("button", { name: authMessages[locale].account, exact: true });
    fireEvent.click(trigger);
    const dialog = screen.getByRole("dialog");
    vi.spyOn(dialog, "getBoundingClientRect").mockReturnValue({ left: 100, right: 500, top: 100, bottom: 500 } as DOMRect);
    fireEvent(dialog, new MouseEvent("pointerdown", { bubbles: true, clientX: 20, clientY: 20, button: 0 }));
    fireEvent.click(dialog, { clientX: 20, clientY: 20 });
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(trigger);
    expect(mock.auth.signOut).not.toHaveBeenCalled();
  });

  it("keeps the card open for interior clicks and drags that cross the backdrop", async () => {
    await openLogin();
    const dialog = screen.getByRole("dialog");
    vi.spyOn(dialog, "getBoundingClientRect").mockReturnValue({ left: 100, right: 500, top: 100, bottom: 500 } as DOMRect);
    const point = (x: number) => ({ bubbles: true, clientX: x, clientY: 200, button: 0 });
    // Padding belongs to the card even though its event target is the dialog.
    for (const [start, end] of [[110, 110], [200, 20], [20, 200]]) {
      fireEvent(dialog, new MouseEvent("pointerdown", point(start)));
      fireEvent.click(dialog, point(end));
      expect(screen.getByRole("dialog")).toBe(dialog);
    }
    fireEvent.click(screen.getByLabelText("Email address"));
    expect(screen.getByRole("dialog")).toBe(dialog);
    fireEvent(dialog, new MouseEvent("pointerdown", point(20)));
    fireEvent.pointerCancel(dialog);
    fireEvent.click(dialog, point(20));
    expect(screen.getByRole("dialog")).toBe(dialog);
  });

  it("clears entered passwords when the login card is dismissed outside", async () => {
    const user = await openLogin();
    await user.type(screen.getByLabelText("Password", { exact: true }), "temporary-password");
    const dialog = screen.getByRole("dialog");
    vi.spyOn(dialog, "getBoundingClientRect").mockReturnValue({ left: 100, right: 500, top: 100, bottom: 500 } as DOMRect);
    fireEvent(dialog, new MouseEvent("pointerdown", { bubbles: true, clientX: 20, clientY: 20, button: 0 }));
    fireEvent.click(dialog, { clientX: 20, clientY: 20 });
    await user.click(screen.getByRole("button", { name: "Log in", exact: true }));
    expect((screen.getByLabelText("Password", { exact: true }) as HTMLInputElement).value).toBe("");
  });

  it("offers all three methods and localizes the complete form", async () => {
    const user = await openLogin("sr-Latn");
    expect(screen.getByRole("button", { name: "Nastavi preko Google-a" })).toBeTruthy();
    expect(screen.getByLabelText("Imejl adresa")).toBeTruthy();
    expect(screen.getByLabelText("Lozinka", { exact: true })).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Pošalji mi link za prijavu" }));
    expect(screen.queryByLabelText("Lozinka", { exact: true })).toBeNull();
    await user.type(screen.getByLabelText("Imejl adresa"), "reader@example.com");
    await user.click(screen.getByRole("button", { name: "Pošalji mi link za prijavu" }));
    expect(await screen.findByText(authMessages["sr-Latn"].checkEmail)).toBeTruthy();
  });
  it("displays login errors, prevents duplicate requests, and allows a retry", async () => {
    const user = await openLogin();
    let resolve!: (value: unknown) => void;
    mock.auth.signInWithPassword.mockReturnValueOnce(new Promise((done) => { resolve = done; }));
    await user.type(screen.getByLabelText("Email address"), "reader@example.com");
    await user.type(screen.getByLabelText("Password", { exact: true }), "wrong-password");
    const form = screen.getByLabelText("Email address").closest("form")!;
    fireEvent.submit(form); fireEvent.submit(form);
    expect(mock.auth.signInWithPassword).toHaveBeenCalledTimes(1);
    await act(async () => resolve({ error: { code: "invalid_credentials" } }));
    expect(await screen.findByText(authMessages.en.invalidCredentials)).toBeTruthy();
    fireEvent.submit(form);
    await waitFor(() => expect(mock.auth.signInWithPassword).toHaveBeenCalledTimes(2));
  });
  it("rejects mismatched signup passwords before calling the service", async () => {
    const user = await openLogin();
    await user.click(screen.getByRole("button", { name: "Create an account" }));
    await user.type(screen.getByLabelText("Email address"), "reader@example.com");
    await user.type(screen.getByLabelText("Password", { exact: true }), "first-password");
    await user.type(screen.getByLabelText("Confirm password"), "other-password");
    await user.click(screen.getByRole("button", { name: "Create an account" }));
    expect(screen.getByText(authMessages.en.mismatch)).toBeTruthy();
    expect(mock.auth.signUp).not.toHaveBeenCalled();
  });
  it("opens the recovery form on callback, saves a new password, and shows account status", async () => {
    render(<AuthPanel locale="en" />);
    await screen.findByRole("button", { name: "Log in" });
    emit("PASSWORD_RECOVERY", session);
    expect(await screen.findByRole("heading", { name: "Set a new password" })).toBeTruthy();
    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Password", { exact: true }), "new-password");
    await user.type(screen.getByLabelText("Confirm password"), "new-password");
    await user.click(screen.getByRole("button", { name: "Save password" }));
    expect(await screen.findByText(authMessages.en.passwordSaved)).toBeTruthy();
    expect(screen.getByText("reader@example.com")).toBeTruthy();
    expect(screen.getByText(authMessages.en.localData)).toBeTruthy();
  });
  it("reports Google failure and restores focus after closing", async () => {
    mock.auth.signInWithOAuth.mockResolvedValue({ error: { code: "provider_disabled" } });
    const user = await openLogin();
    await user.click(screen.getByRole("button", { name: "Continue with Google" }));
    expect(await screen.findByText(authMessages.en.genericError)).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Log in" }));
  });
  it("requests a password reset and displays the non-enumerating confirmation", async () => {
    const user = await openLogin();
    await user.click(screen.getByRole("button", { name: "Forgot password?" }));
    await user.type(screen.getByLabelText("Email address"), "reader@example.com");
    await user.click(screen.getByRole("button", { name: "Send reset link" }));
    expect(await screen.findByText(authMessages.en.resetSent)).toBeTruthy();
    expect(mock.auth.resetPasswordForEmail).toHaveBeenCalledTimes(1);
  });
  it("restores the account panel and logs out without discarding browser favorites", async () => {
    mock.auth.getSession.mockResolvedValue({ data: { session }, error: null });
    mock.auth.signOut.mockImplementation(async () => {
      mock.handlers.forEach((handler) => handler("SIGNED_OUT", null));
      return { error: null };
    });
    localStorage.setItem("carpe-acta-favorites-v1", '["two-minute-start"]');
    render(<AuthPanel locale="en" />);
    const user = userEvent.setup();
    await user.click(await screen.findByRole("button", { name: "Account" }));
    expect(screen.getByText("reader@example.com")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Log out" }));
    expect(await screen.findByRole("button", { name: "Log in" })).toBeTruthy();
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(localStorage.getItem("carpe-acta-favorites-v1")).toBe('["two-minute-start"]');
  });
});

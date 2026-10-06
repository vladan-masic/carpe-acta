// @vitest-environment jsdom
import { StrictMode } from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, renderHook, screen } from "@testing-library/react";
import { useTimerAlerts } from "../src/hooks/useTimerAlerts";
import { ActionTimer } from "../src/components/ActionTimer";
import { timerMessages } from "../src/i18n/timer";

const audio = vi.hoisted(() => ({ prepare: vi.fn(), play: vi.fn(), dispose: vi.fn() }));
vi.mock("../src/utils/timerChime", () => ({ createTimerChime: () => audio }));
const requestPermission = vi.fn();
const sent: MockNotification[] = [];
class MockNotification {
  static permission: NotificationPermission = "default";
  static requestPermission = requestPermission;
  onclick: (() => void) | null = null;
  close = vi.fn();
  constructor(public title: string, public options: NotificationOptions) { sent.push(this); }
}
const key = "carpe-acta-timer-alerts-v1";
beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
  sent.length = 0;
  MockNotification.permission = "default";
  requestPermission.mockResolvedValue("granted");
  audio.prepare.mockResolvedValue(true);
  audio.play.mockResolvedValue(true);
  vi.stubGlobal("Notification", MockNotification);
  vi.stubGlobal("isSecureContext", true);
  document.title = "Carpe Acta";
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); localStorage.clear(); });

it("defaults to quiet alerts, never requests permission on load, and restores the title", () => {
  const { result, rerender, unmount } = renderHook(({ expired }) => useTimerAlerts(expired, "en"), { initialProps: { expired: false } });
  expect(result.current.preferences).toEqual({ sound: false, notification: false, tab: true });
  rerender({ expired: true });
  expect(document.title).toBe("Timer finished · Carpe Acta");
  expect(audio.play).not.toHaveBeenCalled();
  expect(requestPermission).not.toHaveBeenCalled();
  expect(sent).toHaveLength(0);
  act(() => result.current.dismiss());
  expect(document.title).toBe("Carpe Acta");
  rerender({ expired: false });
  rerender({ expired: true });
  unmount();
  expect(document.title).toBe("Carpe Acta");
});

it("plays and notifies once per expiry, localizes without replay, and closes on reset", async () => {
  localStorage.setItem(key, JSON.stringify({ sound: true, notification: true, tab: true }));
  MockNotification.permission = "granted";
  const { rerender, unmount } = renderHook(({ expired, locale }) => useTimerAlerts(expired, locale), {
    initialProps: { expired: false, locale: "en" as "en" | "sr-Latn" }, wrapper: StrictMode,
  });
  await act(async () => rerender({ expired: true, locale: "en" }));
  expect(audio.play).toHaveBeenCalledTimes(1);
  expect(sent).toHaveLength(1);
  expect(sent[0].options.silent).toBe(true);
  rerender({ expired: true, locale: "sr-Latn" });
  expect(document.title).toBe("Vreme je isteklo · Carpe Acta");
  expect(audio.play).toHaveBeenCalledTimes(1);
  expect(sent).toHaveLength(1);
  rerender({ expired: false, locale: "sr-Latn" });
  expect(sent[0].close).toHaveBeenCalled();
  expect(document.title).toBe("Carpe Acta");
  await act(async () => rerender({ expired: true, locale: "sr-Latn" }));
  expect(sent[1].title).toBe("Vreme je isteklo");
  unmount();
  expect(audio.dispose).toHaveBeenCalled();
  expect(sent[1].close).toHaveBeenCalled();
});

it("requests permission only on opt-in, preserves changes made while waiting, and persists preferences", async () => {
  let resolve!: (value: NotificationPermission) => void;
  requestPermission.mockReturnValue(new Promise(done => { resolve = done; }));
  const { result, unmount } = renderHook(() => useTimerAlerts(false, "en"));
  act(() => { void result.current.toggleNotifications(); });
  expect(requestPermission).toHaveBeenCalledTimes(1);
  expect(result.current.requesting).toBe(true);
  act(() => result.current.toggleTab());
  await act(async () => resolve("granted"));
  expect(result.current.preferences).toEqual({ sound: false, notification: true, tab: false });
  unmount();
  const restored = renderHook(() => useTimerAlerts(false, "en"));
  expect(restored.result.current.preferences.notification).toBe(true);
  expect(restored.result.current.preferences.tab).toBe(false);
});

it("handles denial, unsupported notifications, delivery failure, and sound failure without affecting expiry", async () => {
  MockNotification.permission = "denied";
  const { result, rerender } = renderHook(({ expired }) => useTimerAlerts(expired, "en"), { initialProps: { expired: false } });
  await act(async () => result.current.toggleNotifications());
  expect(result.current.notice).toBe("blocked");
  expect(result.current.preferences.notification).toBe(false);
  expect(requestPermission).not.toHaveBeenCalled();
  MockNotification.permission = "granted";
  await act(async () => result.current.toggleNotifications());
  vi.stubGlobal("Notification", class extends MockNotification { constructor() { super("", {}); throw new Error("Unsupported"); } });
  audio.play.mockResolvedValue(false);
  await act(async () => result.current.toggleSound());
  await act(async () => rerender({ expired: true }));
  expect(result.current.notice).toBe("unavailable");
  expect(result.current.soundFailed).toBe(true);
  expect(document.title).toBe("Timer finished · Carpe Acta");
  vi.stubGlobal("Notification", undefined);
  rerender({ expired: false });
  expect(result.current.notificationSupported).toBe(false);
});

it("does not persist a permission response after the timer is removed", async () => {
  let resolve!: (value: NotificationPermission) => void;
  requestPermission.mockReturnValue(new Promise(done => { resolve = done; }));
  const { result, unmount } = renderHook(() => useTimerAlerts(false, "en"));
  act(() => { void result.current.toggleNotifications(); });
  unmount();
  await act(async () => resolve("granted"));
  expect(localStorage.getItem(key)).toBeNull();
});

it("returns to the action and acknowledges the alert when a notification is clicked", () => {
  localStorage.setItem(key, JSON.stringify({ notification: true }));
  MockNotification.permission = "granted";
  const focus = vi.spyOn(window, "focus").mockImplementation(() => {});
  const title = document.createElement("h3");
  title.id = "active-tip-title"; title.tabIndex = -1;
  document.body.append(title);
  renderHook(() => useTimerAlerts(true, "en"));
  act(() => sent[0].onclick?.());
  expect(focus).toHaveBeenCalled();
  expect(document.activeElement).toBe(title);
  expect(document.title).toBe("Carpe Acta");
  expect(sent[0].close).toHaveBeenCalled();
  title.remove();
});

it.each(["en", "sr-Latn"] as const)("offers localized optional controls and previews without enabling sound in %s", async locale => {
  render(<ActionTimer minutes={1} locale={locale} />);
  const copy = timerMessages[locale];
  fireEvent.click(screen.getByText(copy.alerts));
  expect((screen.getByLabelText(copy.sound) as HTMLInputElement).checked).toBe(false);
  await act(async () => fireEvent.click(screen.getByRole("button", { name: copy.preview })));
  expect(audio.play).toHaveBeenCalledTimes(1);
  expect(localStorage.getItem(key)).toBeNull();
  await act(async () => fireEvent.click(screen.getByLabelText(copy.sound)));
  expect(audio.prepare).toHaveBeenCalled();
  await act(async () => fireEvent.click(screen.getByRole("button", { name: new RegExp(copy.start) })));
  expect(audio.prepare).toHaveBeenCalledTimes(2);
});

it("tolerates blocked storage and reports that preferences cannot be remembered", () => {
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error(); });
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error(); });
  const { result } = renderHook(() => useTimerAlerts(false, "en"));
  act(() => result.current.toggleTab());
  expect(result.current.preferences.tab).toBe(false);
  expect(result.current.unsaved).toBe(true);
});

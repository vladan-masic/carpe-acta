import { useEffect, useRef, useState } from "react";
import type { Locale } from "../i18n/locales";
import { timerMessages } from "../i18n/timer";
import { createTimerChime } from "../utils/timerChime";

const storageKey = "carpe-acta-timer-alerts-v1";
type Preferences = { sound: boolean; notification: boolean; tab: boolean };
function readPreferences(): Preferences {
  try {
    const value = JSON.parse(localStorage.getItem(storageKey) || "null");
    return { sound: value?.sound === true, notification: value?.notification === true, tab: value?.tab !== false };
  } catch { return { sound: false, notification: false, tab: true }; }
}
const supported = () => typeof Notification !== "undefined" && window.isSecureContext;

export function useTimerAlerts(expired: boolean, locale: Locale) {
  const [preferences, setPreferences] = useState(readPreferences);
  const latestPreferences = useRef(preferences);
  const [pending, setPending] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [notice, setNotice] = useState<"blocked" | "unavailable" | null>(null);
  const [soundFailed, setSoundFailed] = useState(false);
  const [unsaved, setUnsaved] = useState(false);
  const chime = useRef<ReturnType<typeof createTimerChime> | null>(null);
  const notification = useRef<Notification | null>(null);
  const handled = useRef(false);
  const mounted = useRef(false);
  const copy = timerMessages[locale];

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      chime.current?.dispose();
      chime.current = null;
      notification.current?.close();
    };
  }, []);

  function update(key: keyof Preferences, value: boolean) {
    const next = { ...latestPreferences.current, [key]: value };
    latestPreferences.current = next;
    setPreferences(next);
    try { localStorage.setItem(storageKey, JSON.stringify(next)); setUnsaved(false); }
    catch { setUnsaved(true); }
  }
  function dismiss() {
    setPending(false);
    notification.current?.close();
    notification.current = null;
  }
  function audio() { return chime.current ??= createTimerChime(); }
  async function prepareSound() {
    if (!preferences.sound) return;
    const ready = await audio().prepare();
    if (mounted.current) setSoundFailed(!ready);
  }
  async function preview() {
    const played = await audio().play();
    if (mounted.current) setSoundFailed(!played);
  }
  async function toggleNotifications() {
    if (preferences.notification) {
      update("notification", false);
      notification.current?.close();
      setNotice(null);
      return;
    }
    if (!supported()) { setNotice("unavailable"); return; }
    setRequesting(true);
    try {
      const permission = Notification.permission === "default"
        ? await Notification.requestPermission() : Notification.permission;
      if (!mounted.current) return;
      if (permission === "granted") { update("notification", true); setNotice(null); }
      else setNotice(permission === "denied" ? "blocked" : null);
    } catch { if (mounted.current) setNotice("unavailable"); }
    finally { if (mounted.current) setRequesting(false); }
  }

  useEffect(() => {
    if (!expired) { handled.current = false; dismiss(); return; }
    // Locale changes and preference changes must never replay an expired alert.
    if (handled.current) return;
    handled.current = true;
    setPending(true);
    if (preferences.sound) void audio().play().then(played => {
      if (mounted.current) setSoundFailed(!played);
    });
    if (!preferences.notification) return;
    if (!supported()) { setNotice("unavailable"); return; }
    if (Notification.permission !== "granted") { setNotice("blocked"); return; }
    try {
      const alert = new Notification(copy.finishedTitle, {
        body: copy.notificationBody, tag: "carpe-acta-timer", silent: true,
      });
      notification.current = alert;
      alert.onclick = () => {
        window.focus();
        document.getElementById("active-tip-title")?.focus();
        dismiss();
      };
    } catch { setNotice("unavailable"); }
  }, [expired, locale, preferences]);

  useEffect(() => {
    if (!pending || !preferences.tab) return;
    const original = document.title;
    const title = `${copy.finishedTitle} · Carpe Acta`;
    document.title = title;
    return () => { if (document.title === title) document.title = original; };
  }, [pending, preferences.tab, copy.finishedTitle]);

  return {
    preferences, pending, requesting, notice, soundFailed, unsaved,
    notificationSupported: supported(), dismiss, prepareSound, preview, toggleNotifications,
    toggleTab: () => update("tab", !preferences.tab),
    toggleSound: () => {
      update("sound", !preferences.sound);
      if (!preferences.sound) void audio().prepare().then(ready => {
        if (mounted.current) setSoundFailed(!ready);
      });
      else { chime.current?.dispose(); chime.current = null; setSoundFailed(false); }
    },
  };
}

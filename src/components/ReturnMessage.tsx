import { useEffect, useRef, useState } from "react";
import type { Locale } from "../i18n/locales";

const copy = {
  en: { message: "Good to see you. One small action counts.", dismiss: "Dismiss welcome message" },
  "sr-Latn": { message: "Lepo je što si ponovo tu. I jedna mala radnja se računa.", dismiss: "Zatvori poruku dobrodošlice" },
};
export function hasReturnGap(timestamp: string | undefined, now = new Date()) {
  if (!timestamp) return false;
  const previous = new Date(timestamp);
  if (!Number.isFinite(previous.getTime()) || previous > now) return false;
  // Compare local calendar dates, not 72-hour intervals across DST transitions.
  const day = (date: Date) => Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000;
  return day(now) - day(previous) >= 3;
}
type Props = { locale: Locale; owner: string | null; ready: boolean; latestId?: string; latestAt?: string; completed: boolean };
// Key this component by account: one welcome decision after history is ready,
// rather than turning Undo, refreshes or imports into new return visits.
export function ReturnMessage({ locale, owner, ready, latestId, latestAt, completed }: Props) {
  const evaluated = useRef(false);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!ready || evaluated.current) return;
    evaluated.current = true;
    if (completed || !latestId || !hasReturnGap(latestAt)) return;
    const key = `carpe-acta-return-message-v1:${owner ?? "guest"}`;
    try {
      if (localStorage.getItem(key) === latestId) return;
      localStorage.setItem(key, latestId);
    } catch { /* Keep the welcome usable for this visit when storage is blocked. */ }
    setVisible(true);
  }, [ready, owner, latestId, latestAt, completed]);
  useEffect(() => { if (completed) setVisible(false); }, [completed]);
  if (!visible || !ready || completed) return null;
  return <div className="return-message">
    <p role="status">{copy[locale].message}</p>
    <button type="button" className="secondary-button" aria-label={copy[locale].dismiss} onClick={() => setVisible(false)}><span aria-hidden="true">×</span></button>
  </div>;
}

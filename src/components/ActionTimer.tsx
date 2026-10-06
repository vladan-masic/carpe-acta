import { useId, useRef } from "react";
import { useTimerAlerts } from "../hooks/useTimerAlerts";
import { useActionTimer } from "../hooks/useActionTimer";
import type { Locale } from "../i18n/locales";
import { messages } from "../i18n/messages";
import { timerMessages } from "../i18n/timer";

export function ActionTimer({ minutes, locale }: { minutes: number; locale: Locale }) {
  const timer = useActionTimer(minutes);
  const copy = timerMessages[locale];
  const primary = useRef<HTMLButtonElement>(null);
  const time = `${Math.floor(timer.seconds / 60)}:${String(timer.seconds % 60).padStart(2, "0")}`;
  const idle = timer.phase === "idle";
  const expired = timer.phase === "expired";
  const alerts = useTimerAlerts(expired, locale);
  const alertHint = useId();
  const running = timer.phase === "running";

  return <section className="action-timer" aria-label={copy.title}>
    {!idle && <p className="timer-readout">
      <span>{timer.extra ? copy.extra : copy.remaining}</span>
      <span role="timer" aria-live="off" aria-label={timer.extra ? copy.extra : copy.remaining}>{time}</span>
    </p>}
    <div className="tip-actions">
      <button className="secondary-button" type="button" ref={primary}
        onClick={() => {
          if (expired) timer.keepGoing();
          else if (running) timer.pause();
          else { void alerts.prepareSound(); timer.start(); }
        }}>
        {idle ? `${copy.start} · ${messages[locale].formatEffort(minutes)}` : expired ? copy.keepGoing : running ? copy.pause : copy.resume}
      </button>
      {!idle && <button className="secondary-button" type="button" onClick={() => {
        timer.reset();
        primary.current?.focus();
      }}>{copy.reset}</button>}
    </div>
    <details className="timer-alerts">
      <summary>{copy.alerts}</summary>
      <div className="timer-alert-options" aria-describedby={alertHint}>
        <label><input type="checkbox" checked={alerts.preferences.sound} onChange={alerts.toggleSound} /> {copy.sound}</label>
        <button className="secondary-button" type="button" onClick={() => void alerts.preview()}>{copy.preview}</button>
        <label><input type="checkbox" checked={alerts.preferences.notification}
          disabled={alerts.requesting || !alerts.notificationSupported}
          onChange={() => void alerts.toggleNotifications()} /> {copy.notifications}</label>
        <label><input type="checkbox" checked={alerts.preferences.tab} onChange={alerts.toggleTab} /> {copy.tab}</label>
        <p id={alertHint}>{copy.limitation}</p>
        <div aria-live="polite">
          {alerts.requesting && <p>{copy.requesting}</p>}
          {(!alerts.notificationSupported || alerts.notice) && <p>{copy[alerts.notice || "unavailable"]}</p>}
          {alerts.soundFailed && <p>{copy.soundFailed}</p>}
          {alerts.unsaved && <p>{copy.unsaved}</p>}
        </div>
      </div>
    </details>
    {alerts.pending && <button className="secondary-button" type="button" onClick={() => { alerts.dismiss(); primary.current?.focus(); }}>{copy.dismiss}</button>}
    <div role="status" aria-atomic="true">
      {!idle && <p>{expired ? copy.expired : timer.phase === "paused" ? copy.paused : timer.extra ? copy.continuing : copy.running}</p>}
    </div>
  </section>;
}

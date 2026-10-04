import { useRef } from "react";
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
  const running = timer.phase === "running";

  return <section className="action-timer" aria-label={copy.title}>
    {!idle && <p className="timer-readout">
      <span>{timer.extra ? copy.extra : copy.remaining}</span>
      <span role="timer" aria-live="off" aria-label={timer.extra ? copy.extra : copy.remaining}>{time}</span>
    </p>}
    <div className="tip-actions">
      <button className="secondary-button" type="button" ref={primary}
        onClick={expired ? timer.keepGoing : running ? timer.pause : timer.start}>
        {idle ? `${copy.start} · ${messages[locale].formatEffort(minutes)}` : expired ? copy.keepGoing : running ? copy.pause : copy.resume}
      </button>
      {!idle && <button className="secondary-button" type="button" onClick={() => {
        timer.reset();
        primary.current?.focus();
      }}>{copy.reset}</button>}
    </div>
    <div role="status" aria-atomic="true">
      {!idle && <p>{expired ? copy.expired : timer.phase === "paused" ? copy.paused : timer.extra ? copy.continuing : copy.running}</p>}
    </div>
  </section>;
}

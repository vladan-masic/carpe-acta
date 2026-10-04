import { useEffect, useState } from "react";

type TimerState = {
  phase: "idle" | "running" | "paused" | "expired";
  extra: boolean;
  milliseconds: number;
  startedAt: number | null;
};

function advance(timer: TimerState, now: number): TimerState {
  if (timer.phase !== "running" || timer.startedAt === null) return timer;
  const elapsed = Math.max(0, now - timer.startedAt);
  const milliseconds = timer.extra ? timer.milliseconds + elapsed : Math.max(0, timer.milliseconds - elapsed);
  return {
    ...timer, milliseconds, startedAt: now,
    phase: !timer.extra && milliseconds === 0 ? "expired" : "running",
  };
}

export function useActionTimer(minutes: number) {
  const initial: TimerState = { phase: "idle", extra: false, milliseconds: minutes * 60_000, startedAt: null };
  const [timer, setTimer] = useState<TimerState>(initial);

  useEffect(() => {
    if (timer.phase !== "running") return;
    const tick = () => setTimer((current) => advance(current, Date.now()));
    const interval = window.setInterval(tick, 250);
    document.addEventListener("visibilitychange", tick);
    window.addEventListener("focus", tick);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", tick);
      window.removeEventListener("focus", tick);
    };
  }, [timer.phase]);

  return {
    ...timer,
    seconds: timer.extra ? Math.floor(timer.milliseconds / 1000) : Math.ceil(timer.milliseconds / 1000),
    start: () => setTimer((current) => current.phase === "idle" || current.phase === "paused"
      ? { ...current, phase: "running", startedAt: Date.now() } : current),
    pause: () => setTimer((current) => {
      const updated = advance(current, Date.now());
      return updated.phase === "running" ? { ...updated, phase: "paused", startedAt: null } : updated;
    }),
    reset: () => setTimer(initial),
    keepGoing: () => setTimer((current) => current.phase === "expired"
      ? { phase: "running", extra: true, milliseconds: 0, startedAt: Date.now() } : current),
  };
}

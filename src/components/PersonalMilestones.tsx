import { useEffect, useRef, useState } from "react";
import type { Locale } from "../i18n/locales";
import { milestoneMessages } from "../i18n/milestones";
import { milestoneThresholds, visibleMilestones, earnedMilestones, type MilestoneTotals } from "../utils/milestones";
type Props = { totals: MilestoneTotals | null; error: boolean; retry: () => void; locale: Locale; completionId: string | null };
export function PersonalMilestones({ totals, error, retry, locale, completionId }: Props) {
  const copy = milestoneMessages[locale];
  const previous = useRef<string[] | null>(null);
  const handled = useRef(completionId);
  const [celebration, setCelebration] = useState<string[]>([]);
  // Baseline loads/imports are quiet. Only a new completion in this visit can
  // celebrate; Undo immediately removes any now-unearned badge and message.
  useEffect(() => {
    if (!totals) { setCelebration([]); return; }
    const earned = earnedMilestones(totals);
    const fresh = completionId !== null && completionId !== handled.current;
    setCelebration(previous.current && fresh ? earned.filter(id => !previous.current!.includes(id)) : []);
    handled.current = completionId;
    previous.current = earned;
  }, [totals?.actions, totals?.days, !!totals, completionId]);
  function badgeLabel(id: string) {
    const [kind, n] = id.split("-");
    return copy.badge(kind as "actions" | "days", Number(n));
  }
  return <section className="personal-milestones" aria-labelledby="milestones-title">
    <h3 id="milestones-title">{copy.title}</h3>
    <p>{copy.hint}</p>
    <p role="status">{totals && celebration.length > 0 ? `${copy.celebration} ${celebration.map(badgeLabel).join(" · ")}` : ""}</p>
    {!totals ? <p>{error ? <>{copy.error} <button type="button" className="secondary-button" onClick={retry}>{copy.retry}</button></> : copy.loading}</p> : <>
      <div className="milestone-groups">{(["actions", "days"] as const).map(kind => {
        const thresholds = milestoneThresholds(kind, totals[kind]);
        const earned = thresholds.filter(n => totals[kind] >= n);
        const latest = earned[earned.length - 1];
        const next = thresholds.find(n => totals[kind] < n);
        return <div key={kind}><h4>{copy[kind]}</h4>
          <p>{latest ? <span className="milestone-badge"><span aria-hidden="true">✦ </span>{copy.badge(kind, latest)} · {copy.earned}</span> : copy.none}</p>
          <p>{next ? copy.next(totals[kind], next) : copy.complete}</p>
          {next && <progress aria-label={copy[kind]} max={next} value={totals[kind]} />}
        </div>;
      })}</div>
      <details><summary>{copy.all}</summary><ul className="milestone-collection">{(["actions", "days"] as const).flatMap(kind => visibleMilestones(milestoneThresholds(kind, totals[kind]), totals[kind]).map(n =>
        <li key={`${kind}-${n}`}><span aria-hidden="true">{totals[kind] >= n ? "✦" : "○"} </span>{copy.badge(kind, n)} — {totals[kind] >= n ? copy.earned : copy.locked}</li>))}</ul></details>
    </>}
  </section>;
}

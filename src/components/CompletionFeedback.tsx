import { useEffect, useRef, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Locale } from "../i18n/locales";
import { feedbackMessages } from "../i18n/feedback";
import { saveCompletionFeedback, type TipCompletion } from "../utils/completions";
import { saveAccountFeedback } from "../completions/feedback";

type Props = { disabled?: boolean; record: TipCompletion; owner: string | null; client: SupabaseClient | null; locale: Locale; onSaved: () => void };
// The parent keys this component by account and completion ID, isolating requests
// when the user changes cards or accounts. Feedback never changes completion status.
export function CompletionFeedback({ disabled = false, record, owner, client, locale, onSaved }: Props) {
  const copy = feedbackMessages[locale];
  const [selected, setSelected] = useState(record.feedback);
  const [status, setStatus] = useState<"saving" | "saved" | "error" | null>(null);
  const pending = useRef(false);
  const active = useRef(false);
  useEffect(() => { active.current = true; return () => { active.current = false; }; }, []);
  async function choose(helpful: boolean) {
    if (pending.current || disabled) return;
    pending.current = true;
    setStatus("saving");
    try {
      if (owner) {
        if (!client) throw new Error("No client");
        await saveAccountFeedback(client, owner, record.id, helpful);
      } else if (!saveCompletionFeedback(record.id, helpful)) throw new Error("Storage unavailable");
      if (active.current) { setSelected(helpful); setStatus("saved"); onSaved(); }
    } catch { if (active.current) setStatus("error"); }
    finally { pending.current = false; }
  }
  return <div className="completion-feedback">
    <fieldset disabled={disabled || status === "saving"} className="help-start-choices">
      <legend>{copy.question}</legend>
      <button type="button" className="category-button" aria-pressed={selected === true} data-active={selected === true} onClick={() => void choose(true)}>{copy.yes}</button>
      <button type="button" className="category-button" aria-pressed={selected === false} data-active={selected === false} onClick={() => void choose(false)}>{copy.no}</button>
    </fieldset>
    <p role="status" aria-atomic="true">{status ? copy[status] : ""}</p>
  </div>;
}

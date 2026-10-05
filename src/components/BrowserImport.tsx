import { useId } from "react";
import type { Locale } from "../i18n/locales";
import { storageMessages } from "../i18n/storage";

export type BrowserImportProps = {
  locale: Locale; title: string; label: string; count: number | null;
  canImport: boolean; copied: boolean; busy: boolean; disabled: boolean;
  success?: string;
  error: boolean; onImport: () => void; onRefresh: () => void;
};

export function BrowserImport({ locale, title, label, count, canImport, copied, success, busy, disabled, error, onImport, onRefresh }: BrowserImportProps) {
  const copy = storageMessages[locale];
  const titleId = useId();
  const descriptionId = useId();
  return <section className="browser-import" aria-labelledby={titleId}>
    <h4 id={titleId}>{title}</h4>
    <p id={descriptionId}>{count === null ? copy.unreadable : copy.count(count)}</p>
    <div role="status" aria-atomic="true">
      {busy ? <p>{copy.syncing}</p> : error ? <p>{copy.failed}</p> : count === 0 ? <p>{copy.empty}</p> : copied ? <p>{copy.added}</p> : success && <p>{success}</p>}
    </div>
    {error && <button type="button" className="secondary-button" disabled={busy} onClick={onRefresh}>{copy.refresh}</button>}
    {(canImport || copied) && <button type="button" className="secondary-button" aria-disabled={disabled || !canImport}
      aria-describedby={descriptionId} onClick={() => { if (!disabled && canImport) onImport(); }}>{label}</button>}
  </section>;
}

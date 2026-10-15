import { useState } from "react";

// Provider metadata is optional and untrusted. Never derive a name from email.
export function AccountIdentity({ metadata, greeting, fallback }: {
  metadata?: Record<string, unknown>; greeting: string; fallback: string;
}) {
  const name = [metadata?.full_name, metadata?.name, metadata?.display_name]
    .find((value): value is string => typeof value === "string" && Boolean(value.trim()) && value.length <= 120 && !value.includes("@"))?.trim();
  const picture = [metadata?.avatar_url, metadata?.picture].find((value): value is string => {
    if (typeof value !== "string") return false;
    try { const url = new URL(value); return url.protocol === "https:" && !url.username && !url.password; }
    catch { return false; }
  });
  const [failedPicture, setFailedPicture] = useState<string>();
  const initials = name?.split(/\s+/u).slice(0, 2).map(part => Array.from(part)[0]).join("").toLocaleUpperCase();
  return <>
    <span className="account-avatar" aria-hidden="true">
      {picture && picture !== failedPicture ? <img src={picture} alt="" referrerPolicy="no-referrer" onError={() => setFailedPicture(picture)} />
        : initials || <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="8" r="3.5" /><path d="M5 21v-2a7 7 0 0 1 14 0v2" /></svg>}
    </span>
    <span className="account-identity"><span className="account-greeting">{greeting}</span><span className="account-name">{name ?? fallback}</span></span>
    <svg aria-hidden="true" className="account-chevron" width="10" height="6" viewBox="0 0 12 8" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m1 1 5 5 5-5" /></svg>
  </>;
}

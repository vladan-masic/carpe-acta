import { useEffect, useState } from "react";
import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { TipLibrary } from "../components/TipLibrary";
import { FavoriteTips } from "../components/FavoriteTips";
import { FavoriteButton } from "../components/FavoriteButton";
import { AuthPanel } from "../components/AuthPanel";
import { BrowserImport } from "../components/BrowserImport";
import { tips } from "../data/tips";
import { localizeTip } from "../i18n/localizeTip";
import { messages } from "../i18n/messages";
import { storageMessages } from "../i18n/storage";
import { favoritesMessages } from "../i18n/favorites";
import type { Locale } from "../i18n/locales";
import type { LocalizedTip, TipId } from "../types/tip";

// Development-only visual states: no network, auth SDK initialization or storage.
export function DiscoveryPreview() {
  const [locale, setLocale] = useState<Locale>("en");
  const [open, setOpen] = useState(true);
  const [ids, setIds] = useState<TipId[]>(tips.slice(0, 3).map(t => t.id));
  const [scenario, setScenario] = useState("guest");
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState("");
  useEffect(() => { document.documentElement.lang = locale; }, [locale]);
  const copy = messages[locale];
  const storage = storageMessages[locale];
  const localized = tips.map(t => localizeTip(t, locale));
  const toggle = (id: TipId) => setIds(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]);
  const onTry = (tip: LocalizedTip) => setNotice(`Selected action: ${tip.title}`);
  const response = async () => ({ data: { session: null }, error: { code: "invalid_credentials" } });
  const client = { auth: { signInWithPassword: response, signUp: response, signInWithOtp: response, resetPasswordForEmail: response, updateUser: response, signInWithOAuth: response, signOut: response } } as unknown as SupabaseClient;
  const account = scenario !== "guest";
  const auth = { client, session: account ? { user: { id: "preview-only", email: "notebook@example.test" } } as Session : null, loading: false, recovering: false, setRecovering: () => {}, error: null, clearError: () => {} };
  return <main className="app-shell">
    <h1>Discovery & account · visual review</h1>
    <p>Real components with in-memory examples. No account connection. All authentication requests return a simulated error.</p>
    <div className="calendar-controls">
      <label>Language <select value={locale} onChange={e => setLocale(e.target.value as Locale)}><option value="en">English</option><option value="sr-Latn">Srpski</option></select></label>
      <label>Theme <select defaultValue="light" onChange={e => { document.documentElement.dataset.theme = e.target.value; }}><option value="light">Light</option><option value="dark">Dark</option></select></label>
      <label>Storage example <select value={scenario} onChange={e => { setScenario(e.target.value); setCopied(false); }}><option value="guest">Guest</option><option value="account">Account</option><option value="busy">Syncing</option><option value="error">Sync error</option><option value="unreadable">Unreadable browser storage</option></select></label>
      <button className="secondary-button" onClick={() => setIds(ids.length ? [] : tips.slice(0, 3).map(t => t.id))}>{ids.length ? "Empty saved collection" : "Restore sample saves"}</button>
      <AuthPanel key={scenario} locale={locale} auth={auth} imports={<BrowserImport locale={locale} title={storage.favorites} label={favoritesMessages[locale].import} count={scenario === "unreadable" ? null : 3} canImport={!copied && scenario !== "unreadable"} copied={copied} busy={scenario === "busy"} disabled={scenario === "busy" || scenario === "error"} error={scenario === "error"} onImport={() => setCopied(true)} onRefresh={() => setScenario("account")} />} />
    </div>
    <TipLibrary tips={localized} locale={locale} open={open} onOpenChange={setOpen} renderFavoriteButton={tip => <FavoriteButton selected={ids.includes(tip.id)} title={tip.title} labels={copy.favorites} onToggle={() => toggle(tip.id)} />} onTry={onTry} />
    <FavoriteTips title={copy.favorites.title} locale={locale} description={<span className="storage-description"><strong className="storage-label">{account ? storage.account : storage.browser}</strong><span>{account ? storage.accountHint : storage.guestHint}</span></span>} emptyMessage={copy.favorites.empty} openLabel={copy.favorites.open} actionLabel={copy.generator.actionLabel} labels={copy.favorites} tips={localized.filter(t => ids.includes(t.id))} onToggle={toggle} onOpen={onTry} />
    <p role="status">{notice}</p>
  </main>;
}

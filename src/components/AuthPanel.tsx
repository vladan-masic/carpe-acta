import { useEffect, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import type { useAuth } from "../hooks/useAuth";
import { authErrorKey } from "../auth/config";
import { performAuthAction, type AuthAction, type AuthNotice } from "../auth/actions";
import { authMessages, type AuthMessages } from "../i18n/auth";
import type { Locale } from "../i18n/locales";
import { useDialogDismiss } from "../hooks/useDialogDismiss";

type FormMode = "login" | "signup" | "link" | "reset" | "password";

export function AuthPanel({ locale, auth }: { locale: Locale; auth: ReturnType<typeof useAuth> }) {
  const copy = authMessages[locale];
  const dialog = useRef<HTMLDialogElement>(null);
  const dismissDialog = useDialogDismiss();
  const trigger = useRef<HTMLButtonElement>(null);
  const pending = useRef(false);
  const [mode, setMode] = useState<FormMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<keyof AuthMessages | null>(null);
  const [notice, setNotice] = useState<AuthNotice>(null);

  useEffect(() => {
    if (auth.recovering) {
      setMode("password");
      setNotice(null);
      setError(null);
      dialog.current?.showModal();
    }
  }, [auth.recovering]);

  useEffect(() => {
    if (auth.error) { setError(auth.error); dialog.current?.showModal(); }
  }, [auth.error]);

  useEffect(() => {
    setPassword("");
    setConfirmation("");
    if (!auth.session) setMode("login");
  }, [auth.session?.user.id]);

  function changeMode(next: FormMode) {
    setMode(next);
    setPassword("");
    setConfirmation("");
    setError(null);
    setNotice(null);
  }

  function open() {
    if (!pending.current) changeMode(auth.recovering ? "password" : "login");
    dialog.current?.showModal();
  }

  function close() {
    dialog.current?.close();
  }

  async function run(action: AuthAction) {
    if (!auth.client || pending.current) return;
    if ((action === "signup" || action === "password") && password !== confirmation) {
      setError("mismatch"); return;
    }
    pending.current = true;
    setBusy(true);
    setError(null);
    setNotice(null);
    auth.clearError();
    try {
      const result = await performAuthAction(auth.client, action, email, password);
      setNotice(result);
      setPassword("");
      setConfirmation("");
      if (action === "password") { auth.setRecovering(false); setMode("login"); }
      if (action === "logout") { setEmail(""); close(); }
    } catch (cause) {
      setError(authErrorKey(cause));
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void run(mode);
  }

  const accountView = Boolean(auth.session) && mode !== "password";
  const title = accountView ? copy.account : ({ login: copy.login, signup: copy.signup, link: copy.link, reset: copy.reset, password: copy.newPassword })[mode];
  const submitLabel = ({ login: copy.login, signup: copy.signup, link: copy.link, reset: copy.sendReset, password: copy.savePassword })[mode];
  const newPassword = mode === "signup" || mode === "password";

  return <>
    <button className="auth-trigger secondary-button" type="button" ref={trigger} onClick={open} disabled={auth.loading}>
      {auth.loading ? copy.loading : auth.session ? copy.account : copy.login}
    </button>
    {createPortal(<dialog {...dismissDialog} className="auth-dialog" ref={dialog} aria-labelledby="auth-title" onClose={() => {
      setPassword(""); setConfirmation(""); trigger.current?.focus();
    }}>
      <div className="auth-heading">
        <h2 id="auth-title">{title}</h2>
        <button className="auth-close" type="button" onClick={close} aria-label={copy.close}>×</button>
      </div>
      {!auth.client ? <p>{copy.unavailable}</p> : accountView ? <>
        <p>{copy.signedIn} <strong className="auth-email">{auth.session?.user.email}</strong></p>
        <p className="auth-note">{copy.localData}</p>
        <div className="auth-account-actions">
          <button className="secondary-button" type="button" disabled={busy} onClick={() => changeMode("password")}>{copy.newPassword}</button>
          <button className="primary-button" type="button" disabled={busy} onClick={() => void run("logout")}>{busy ? copy.busy : copy.logout}</button>
        </div>
      </> : <>
        <p className="auth-note">{copy.intro}</p>
        {["login", "signup", "link"].includes(mode) && <>
          <button className="secondary-button auth-google" type="button" disabled={busy} onClick={() => void run("google")}>{copy.google}</button>
          <p className="auth-divider">{copy.or}</p>
        </>}
        <form onSubmit={submit} aria-busy={busy}>
          <fieldset disabled={busy}>
            {mode !== "password" && <label htmlFor="auth-email">{copy.email}
              <input id="auth-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
            </label>}
            {(mode === "login" || newPassword) && <label htmlFor="auth-password">{copy.password}
              <input id="auth-password" type="password" autoComplete={newPassword ? "new-password" : "current-password"} minLength={newPassword ? 8 : undefined} required value={password} onChange={(event) => setPassword(event.target.value)} aria-describedby={newPassword ? "auth-password-hint" : undefined} />
            </label>}
            {newPassword && <>
              <p className="auth-note" id="auth-password-hint">{copy.passwordHint}</p>
              <label htmlFor="auth-confirm">{copy.confirmPassword}
                <input id="auth-confirm" type="password" autoComplete="new-password" minLength={8} required value={confirmation} onChange={(event) => setConfirmation(event.target.value)} />
              </label>
            </>}
            <button className="primary-button" type="submit">{busy ? copy.busy : submitLabel}</button>
          </fieldset>
        </form>
        <div className="auth-links">
          {mode === "login" ? <>
            <button type="button" disabled={busy} onClick={() => changeMode("link")}>{copy.link}</button>
            <button type="button" disabled={busy} onClick={() => changeMode("signup")}>{copy.signup}</button>
            <button type="button" disabled={busy} onClick={() => changeMode("reset")}>{copy.forgot}</button>
          </> : <button type="button" disabled={busy} onClick={() => {
            auth.setRecovering(false); changeMode("login");
          }}>{auth.session ? copy.account : copy.back}</button>}
        </div>
      </>}
      <div role="alert">{error && <p className="auth-error">{copy[error]}</p>}</div>
      <div role="status" aria-live="polite">{notice && <p className="auth-success">{copy[notice]}</p>}</div>
    </dialog>, document.body)}
  </>;
}

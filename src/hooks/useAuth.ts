import { useEffect, useState } from "react";
import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseClient } from "../auth/client";
import { authErrorKey, type AuthErrorKey } from "../auth/config";

export function useAuth(clientOverride?: SupabaseClient | null) {
  const [client, setClient] = useState<SupabaseClient | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(clientOverride !== null);
  const [recovering, setRecovering] = useState(false);
  const [error, setError] = useState<AuthErrorKey | null>(null);

  useEffect(() => {
    // Construct and subscribe together so initialization cannot emit recovery
    // before React has attached its listener (including under Strict Mode).
    const client = clientOverride === undefined ? getSupabaseClient() : clientOverride;
    setClient(client);
    if (!client) { setLoading(false); return; }
    let active = true;
    let eventReceived = false;
    const { data: { subscription } } = client.auth.onAuthStateChange((event, nextSession) => {
      if (!active) return;
      eventReceived = true;
      setSession(nextSession);
      setLoading(false);
      if (event === "PASSWORD_RECOVERY") setRecovering(true);
      if (event === "SIGNED_OUT") setRecovering(false);
    });
    // Subscribe first so a recovery event from URL initialization is never missed.
    void client.auth.initialize().then(({ error: initializationError }) => {
      if (!active) return null;
      const url = new URL(window.location.href);
      const fragment = new URLSearchParams(url.hash.slice(1));
      // An unconsumed code usually means this browser lacks the PKCE verifier.
      const callbackError = url.searchParams.has("error") || fragment.has("error");
      const failedCallback = url.searchParams.has("code") || callbackError;
      if (initializationError || failedCallback) {
        setError(callbackError ? "callbackError" : failedCallback ? "expiredLink" : authErrorKey(initializationError));
        for (const key of ["code", "error", "error_code", "error_description"]) url.searchParams.delete(key);
        if (fragment.has("error")) url.hash = "";
        window.history.replaceState(window.history.state, "", url);
      }
      return client.auth.getSession();
    }).then((result) => {
      if (!active || !result) return;
      const { data, error: sessionError } = result;
      if (sessionError) setError(authErrorKey(sessionError));
      if (!eventReceived) setSession(data.session);
      setLoading(false);
    }).catch(() => {
      if (active) { setError("genericError"); setLoading(false); }
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, [clientOverride]);

  return { client, session, loading, recovering, setRecovering, error, clearError: () => setError(null) };
}

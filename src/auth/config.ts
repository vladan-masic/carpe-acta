export type AuthConfig = { url: string; key: string };

// Vite exposes these values to the browser. Never accept a server-side key.
export function getAuthConfig(url?: string, key?: string): AuthConfig | null {
  if (!url?.trim() || !key?.trim()) return null;
  try {
    const parsed = new URL(url.trim());
    if (parsed.protocol !== "https:" && !(parsed.protocol === "http:" && ["localhost", "127.0.0.1"].includes(parsed.hostname))) return null;
    const publicKey = key.trim();
    if (!/^sb_publishable_[A-Za-z0-9_-]+$/.test(publicKey)) {
      if (publicKey.split(".").length !== 3) return null;
      const payload = publicKey.split(".")[1];
      if (!payload || JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/"))).role !== "anon") return null;
    }
    return { url: parsed.origin, key: publicKey };
  } catch {
    return null;
  }
}

export function authRedirectUrl() {
  // Always return to this app, without carrying callback tokens or arbitrary redirects.
  return `${window.location.origin}${window.location.pathname}`;
}

export type AuthErrorKey = "invalidCredentials" | "emailUnconfirmed" | "weakPassword" | "rateLimit" | "expiredLink" | "samePassword" | "callbackError" | "genericError";

export function authErrorKey(error: unknown): AuthErrorKey {
  const code = error && typeof error === "object" && "code" in error ? error.code : null;
  switch (code) {
    case "invalid_credentials": return "invalidCredentials";
    case "email_not_confirmed": return "emailUnconfirmed";
    case "weak_password": return "weakPassword";
    case "over_request_rate_limit":
    case "over_email_send_rate_limit": return "rateLimit";
    case "otp_expired":
    case "flow_state_expired":
    case "flow_state_not_found":
    case "bad_code_verifier": return "expiredLink";
    case "same_password": return "samePassword";
    default: return "genericError";
  }
}

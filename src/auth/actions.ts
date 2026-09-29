import type { SupabaseClient } from "@supabase/supabase-js";
import { authRedirectUrl } from "./config";

export type AuthAction = "login" | "signup" | "link" | "reset" | "password" | "google" | "logout";
export type AuthNotice = "checkEmail" | "signupSent" | "resetSent" | "passwordSaved" | null;

export async function performAuthAction(
  client: SupabaseClient,
  action: AuthAction,
  email = "",
  password = "",
): Promise<AuthNotice> {
  const redirectTo = authRedirectUrl();
  switch (action) {
    case "login": {
      const { error } = await client.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw error;
      return null;
    }
    case "signup": {
      const { data, error } = await client.auth.signUp({ email: email.trim(), password, options: { emailRedirectTo: redirectTo } });
      if (error) throw error;
      return data.session ? null : "signupSent";
    }
    case "link": {
      const { error } = await client.auth.signInWithOtp({ email: email.trim(), options: { emailRedirectTo: redirectTo, shouldCreateUser: true } });
      if (error) throw error;
      return "checkEmail";
    }
    case "reset": {
      const { error } = await client.auth.resetPasswordForEmail(email.trim(), { redirectTo });
      if (error) throw error;
      return "resetSent";
    }
    case "password": {
      const { error } = await client.auth.updateUser({ password });
      if (error) throw error;
      return "passwordSaved";
    }
    case "google": {
      const { error } = await client.auth.signInWithOAuth({ provider: "google", options: { redirectTo } });
      if (error) throw error;
      return null;
    }
    case "logout": {
      const { error } = await client.auth.signOut({ scope: "local" });
      if (error) throw error;
      return null;
    }
  }
}

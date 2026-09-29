import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getAuthConfig } from "./config";

const config = getAuthConfig(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);

let client: SupabaseClient | null = null;

export function getSupabaseClient() {
  if (!config) return null;
  client ??= createClient(config.url, config.key, {
    auth: { flowType: "pkce", persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });
  return client;
}

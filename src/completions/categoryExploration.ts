import type { SupabaseClient } from "@supabase/supabase-js";
import { tips } from "../data/tips";
export async function fetchExploredTips(client: SupabaseClient, owner: string, now = new Date()): Promise<string[]> {
  const { data, error } = await client.rpc("completed_catalog_tip_ids", {
    p_owner: owner, p_tip_ids: tips.map(tip => tip.id), p_until: now.toISOString(),
  });
  if (error) throw error;
  if (!Array.isArray(data) || !data.every(id => typeof id === "string")) throw new Error("Invalid completed tip IDs");
  return data;
}

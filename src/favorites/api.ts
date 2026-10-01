import type { SupabaseClient } from "@supabase/supabase-js";

export async function fetchFavorites(client: SupabaseClient, userId: string): Promise<string[]> {
  const { data, error } = await client.from("tip_favorites").select("tip_id")
    .eq("user_id", userId).order("created_at", { ascending: false }).order("tip_id");
  if (error) throw error;
  return (data ?? []).map((row) => row.tip_id as string);
}

export async function addFavorites(client: SupabaseClient, userId: string, ids: string[]) {
  if (!ids.length) return;
  // Existing records retain their original save dates. Tied imports sort by ID.
  const { error } = await client.from("tip_favorites").upsert(
    [...new Set(ids)].map((tip_id) => ({ user_id: userId, tip_id })),
    { onConflict: "user_id,tip_id", ignoreDuplicates: true },
  );
  if (error) throw error;
}

export async function removeFavorite(client: SupabaseClient, userId: string, tipId: string) {
  const { error } = await client.from("tip_favorites").delete()
    .eq("user_id", userId).eq("tip_id", tipId);
  if (error) throw error;
}

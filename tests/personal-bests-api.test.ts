import { expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchPersonalBest } from "../src/completions/personalBests";
it("requests one timezone-aware account summary", async () => {
  const best = {days:3,week:"2026-10-05"};
  const rpc=vi.fn().mockResolvedValue({data:[best],error:null});
  const now=new Date("2026-10-08T12:00:00Z");
  expect(await fetchPersonalBest({rpc} as unknown as SupabaseClient,"owner",now)).toEqual(best);
  expect(rpc).toHaveBeenCalledWith("personal_best_week",{p_owner:"owner",p_timezone:Intl.DateTimeFormat().resolvedOptions().timeZone,p_until:now.toISOString()});
});
it.each([{days:8,week:"2026-10-05"},{days:1,week:null},{days:0,week:"2026-10-05"},{days:1,week:"2026-10-06"},{days:1,week:"2026-02-30"},null])("rejects malformed data %j", async row => {
  const rpc=vi.fn().mockResolvedValue({data:[row],error:null});
  await expect(fetchPersonalBest({rpc} as unknown as SupabaseClient,"owner")).rejects.toThrow("Invalid personal best");
});
it("propagates read failures",async()=>{
 const rpc=vi.fn().mockResolvedValue({data:null,error:new Error("offline")});
 await expect(fetchPersonalBest({rpc} as unknown as SupabaseClient,"owner")).rejects.toThrow("offline");
});

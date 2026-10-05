import { useEffect, useRef, useState } from "react";
import type { useAuth } from "./useAuth";
import { useGuestFavorites } from "./useGuestFavorites";
import { addFavorites, fetchFavorites, removeFavorite } from "../favorites/api";
import type { TipId } from "../types/tip";

type AccountState = { owner: string | null; ids: string[]; busy: boolean; ready: boolean; error: boolean };
type Operation = { kind: "refresh" } | { kind: "toggle"; id: TipId } | { kind: "import"; ids: string[] };

export function useFavorites(auth: Pick<ReturnType<typeof useAuth>, "client" | "session" | "loading">) {
  const guest = useGuestFavorites();
  const userId = auth.session?.user.id ?? null;
  const [account, setAccount] = useState<AccountState>({ owner: null, ids: [], busy: false, ready: false, error: false });
  const run = useRef<(operation: Operation) => void>(() => {});

  useEffect(() => {
    const client = auth.client;
    run.current = () => {};
    if (!client || !userId || auth.loading) return;
    let active = true;
    let pending = false;
    let state: AccountState = { owner: userId, ids: [], busy: false, ready: false, error: false };
    function publish(next: AccountState) {
      state = next;
      if (active) setAccount(next);
    }
    async function execute(operation: Operation) {
      if (!active || pending || (operation.kind !== "refresh" && !state.ready)) return;
      pending = true;
      publish({ ...state, busy: true, error: false });
      try {
        if (operation.kind === "toggle") {
          if (state.ids.includes(operation.id)) await removeFavorite(client!, userId!, operation.id);
          else await addFavorites(client!, userId!, [operation.id]);
        } else if (operation.kind === "import") {
          await addFavorites(client!, userId!, operation.ids);
        }
        if (!active) return;
        const ids = await fetchFavorites(client!, userId!);
        if (active) publish({ ...state, ids, ready: true, busy: false, error: false });
      } catch {
        // A write may have succeeded despite a lost response. Refresh before
        // accepting further edits, rather than guessing the remote state.
        if (active) publish({ ...state, busy: false, ready: false, error: true });
      } finally { pending = false; }
    }
    run.current = (operation) => { void execute(operation); };
    const refresh = () => { void execute({ kind: "refresh" }); };
    const onVisible = () => { if (document.visibilityState === "visible") refresh(); };
    refresh();
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      active = false;
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [auth.client, userId, auth.loading]);

  const owned = account.owner === userId;
  const ids = userId ? (owned ? account.ids : []) : guest.ids;
  const busy = auth.loading || (!!userId && (!owned || account.busy));
  const error = !!userId && owned && account.error;
  const disabled = busy || (!!userId && (!owned || !account.ready));
  const importIds = guest.ids.filter((id) => !ids.includes(id));
  return {
    ids, busy, error, disabled, signedIn: !!userId,
    persisted: userId ? true : guest.persisted,
    canImport: !!userId && importIds.length > 0,
    browserCount: guest.persisted ? guest.ids.length : null,
    toggle: (id: TipId) => {
      if (disabled) return;
      if (userId) run.current({ kind: "toggle", id });
      else guest.toggle(id);
    },
    refresh: () => run.current({ kind: "refresh" }),
    importGuest: () => { if (!disabled) run.current({ kind: "import", ids: importIds }); },
  };
}

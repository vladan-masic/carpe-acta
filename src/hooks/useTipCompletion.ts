import { useEffect, useRef, useState } from "react";
import type { TipId } from "../types/tip";
import type { useAuth } from "./useAuth";
import { completionStorageKey, loadCompletions, saveCompletion, type TipCompletion } from "../utils/completions";
import { summarizeProgress, type ProgressData } from "../utils/progress";
import { fetchProgress, countCompletions, uploadCompletions } from "../completions/api";

export type CompletionStatus = "saving" | "saved" | "unsaved" | "error" | null;
type Operation = { kind: "refresh" } | { kind: "save"; record: TipCompletion } | { kind: "import" };
type State = { progress: ProgressData | null; owner: string | null; count: number | null; busy: boolean; error: boolean; imported: boolean };

export function useTipCompletion(auth: Pick<ReturnType<typeof useAuth>, "client" | "session" | "loading">) {
  const owner = auth.session?.user.id ?? null;
  const [guest, setGuest] = useState(loadCompletions);
  const [state, setState] = useState<State>({ progress: null, owner: null, count: null, busy: false, error: false, imported: false });
  const [attempt, setAttempt] = useState<{ owner: string | null; status: CompletionStatus }>({ owner: null, status: null });
  const record = useRef<TipCompletion | null>(null);
  const run = useRef<(operation: Operation) => void>(() => {});
  const locked = useRef(false);

  useEffect(() => {
    const sync = () => setGuest(loadCompletions());
    const storage = (event: StorageEvent) => { if (event.key === completionStorageKey || event.key === null) sync(); };
    window.addEventListener("storage", storage);
    window.addEventListener("focus", sync);
    return () => { window.removeEventListener("storage", storage); window.removeEventListener("focus", sync); };
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    function schedule() {
      const now = new Date();
      const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      timer = setTimeout(() => {
        setGuest(loadCompletions());
        run.current({ kind: "refresh" });
        schedule();
      }, midnight.getTime() - now.getTime() + 100);
    }
    schedule();
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let active = true;
    record.current = null;
    locked.current = false;
    setAttempt({ owner, status: null });
    run.current = () => {};
    const client = auth.client;
    if (!client || !owner || auth.loading) return;
    let snapshot: State = { progress: null, owner, count: null, busy: false, error: false, imported: false };
    function publish(patch: Partial<State>) {
      snapshot = { ...snapshot, ...patch };
      if (active) setState(snapshot);
    }
    async function execute(operation: Operation) {
      if (!active || locked.current) return;
      locked.current = true;
      publish({ busy: true, error: false });
      try {
        if (operation.kind === "save") {
          await uploadCompletions(client!, owner!, [operation.record]);
          if (!active) return;
          if (record.current === operation.record) setAttempt({ owner, status: "saved" });
        } else if (operation.kind === "import") {
          const history = loadCompletions();
          if (!history.readable) throw new Error("Unreadable guest history");
          await uploadCompletions(client!, owner!, history.records);
          if (!active) return;
          publish({ imported: true });
        }
        const [count, progress] = await Promise.all([countCompletions(client!, owner!), fetchProgress(client!, owner!)]);
        if (active) publish({ count, progress });
      } catch {
        if (!active) return;
        publish({ error: true });
        if (operation.kind === "save" && record.current === operation.record) {
          // The server may have committed despite a lost response. Keep the
          // original event ID for retries, including after a failed count read.
          setAttempt({ owner, status: "error" });
        }
      } finally {
        if (active) { locked.current = false; publish({ busy: false }); }
      }
    }
    run.current = (operation) => { void execute(operation); };
    const refresh = () => { void execute({ kind: "refresh" }); };
    const visible = () => { if (document.visibilityState === "visible") refresh(); };
    refresh();
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", visible);
    return () => {
      active = false;
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", visible);
    };
  }, [auth.client, owner, auth.loading]);

  const busy = auth.loading || (!!owner && (state.owner !== owner || state.busy));
  const status = attempt.owner === owner ? attempt.status : null;
  function complete(tipId: TipId) {
    if (busy || locked.current || record.current) return;
    const next = { id: crypto.randomUUID(), tipId, completedAt: new Date().toISOString() };
    record.current = next;
    if (owner) {
      setAttempt({ owner, status: "saving" });
      run.current({ kind: "save", record: next });
    } else {
      setAttempt({ owner, status: saveCompletion(next) ? "saved" : "unsaved" });
      setGuest(loadCompletions());
    }
  }
  return {
    completedRecord: attempt.owner === owner && status === "saved" ? record.current : null,
    status, complete, busy, signedIn: !!owner,
    progress: owner ? (state.owner === owner ? state.progress : null) : guest.readable ? summarizeProgress(guest.records) : null,
    count: owner ? (state.owner === owner ? state.count : null) : guest.readable ? guest.records.length : null,
    error: !!owner && state.owner === owner && state.error,
    guestUnreadable: !guest.readable,
    canImport: !!owner && guest.readable && guest.records.length > 0,
    imported: !!owner && state.owner === owner && state.imported,
    importGuest: () => { if (!busy) run.current({ kind: "import" }); },
    refresh: () => { if (!owner) setGuest(loadCompletions()); else if (!busy) run.current({ kind: "refresh" }); },
    retry: () => {
      if (!busy && status === "error" && record.current) {
        setAttempt({ owner, status: "saving" });
        run.current({ kind: "save", record: record.current });
      }
    },
    reset: () => { record.current = null; setAttempt({ owner, status: null }); },
  };
}

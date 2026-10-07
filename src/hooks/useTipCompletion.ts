import { useCalendarHistory } from "./useCalendarHistory";
import { useCallback, useEffect, useRef, useState } from "react";
import type { TipId } from "../types/tip";
import type { useAuth } from "./useAuth";
import { completionStorageKey, loadCompletions, removeCompletion, saveCompletion, type TipCompletion } from "../utils/completions";
import { summarizeProgress, type ProgressData } from "../utils/progress";
import { deleteCompletion, fetchProgress, countCompletions, uploadCompletions } from "../completions/api";

export type CompletionStatus = "saving" | "saved" | "unsaved" | "error" | null;
type Operation = { kind: "refresh" } | { kind: "save" | "undo"; record: TipCompletion } | { kind: "import" };
export type CompletionUndo = { record: TipCompletion; phase: "available" | "undoing" | "error" | "done" };
type State = { progress: ProgressData | null; owner: string | null; count: number | null; busy: boolean; error: boolean; imported: boolean };

export function useTipCompletion(auth: Pick<ReturnType<typeof useAuth>, "client" | "session" | "loading">) {
  const owner = auth.session?.user.id ?? null;
  const [guest, setGuest] = useState(loadCompletions);
  const [state, setState] = useState<State>({ progress: null, owner: null, count: null, busy: false, error: false, imported: false });
  const [attempt, setAttempt] = useState<{ owner: string | null; status: CompletionStatus }>({ owner: null, status: null });
  const record = useRef<TipCompletion | null>(null);
  const run = useRef<(operation: Operation) => void>(() => {});
  const locked = useRef(false);
  const [undo, setUndo] = useState<CompletionUndo | null>(null);
  const undoRef = useRef<CompletionUndo | null>(null);
  function publishUndo(next: CompletionUndo | null) {
    undoRef.current = next;
    setUndo(next);
  }
  const dismissUndo = useCallback(() => {
    if (undoRef.current?.phase === "undoing") return;
    undoRef.current = null;
    setUndo(null);
  }, []);
  function finishUndo(target: TipCompletion) {
    if (record.current === target) {
      record.current = null;
      setAttempt({ owner, status: null });
    }
    publishUndo({ record: target, phase: "done" });
  }

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
    publishUndo(null);
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
      let writeSucceeded = false;
      try {
        if (operation.kind === "save") {
          await uploadCompletions(client!, owner!, [operation.record]);
          if (!active) return;
          writeSucceeded = true;
          if (record.current === operation.record) setAttempt({ owner, status: "saved" });
        } else if (operation.kind === "undo") {
          await deleteCompletion(client!, owner!, operation.record.id);
          if (!active) return;
          writeSucceeded = true;
          finishUndo(operation.record);
          // Do not display a stale completion/feedback summary if the read fails.
          publish({ count: null, progress: null });
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
        if (operation.kind === "save" && !writeSucceeded && record.current === operation.record) {
          // The server may have committed despite a lost response. Keep the
          // original event ID for retries. Read failures do not undo a confirmed save.
          setAttempt({ owner, status: "error" });
        }
        if (operation.kind === "undo" && !writeSucceeded) publishUndo({ record: operation.record, phase: "error" });
      } finally {
        if (active) {
          if (operation.kind === "save" && writeSucceeded) publishUndo({ record: operation.record, phase: "available" });
          locked.current = false;
          publish({ busy: false });
        }
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
  const calendarHistory = useCalendarHistory({ client: auth.client, owner, loading: auth.loading, guest, progress: state.progress, busy });
  const status = attempt.owner === owner ? attempt.status : null;
  function complete(tipId: TipId) {
    if (busy || locked.current || record.current) return;
    const next = { id: crypto.randomUUID(), tipId, completedAt: new Date().toISOString() };
    record.current = next;
    if (owner) {
      setAttempt({ owner, status: "saving" });
      run.current({ kind: "save", record: next });
    } else {
      const saved = saveCompletion(next);
      setAttempt({ owner, status: saved ? "saved" : "unsaved" });
      if (saved) publishUndo({ record: next, phase: "available" });
      setGuest(loadCompletions());
    }
  }
  return {
    calendarHistory,
    completedRecord: attempt.owner === owner && status === "saved" &&
      !(undo?.record === record.current && (undo.phase === "undoing" || undo.phase === "error")) ? record.current : null,
    undo: attempt.owner === owner ? undo : null,
    dismissUndo,
    undoCompletion: () => {
      const target = undoRef.current;
      if (busy || locked.current || !target || (target.phase !== "available" && target.phase !== "error")) return;
      publishUndo({ ...target, phase: "undoing" });
      if (owner) run.current({ kind: "undo", record: target.record });
      else {
        if (removeCompletion(target.record.id)) finishUndo(target.record);
        else publishUndo({ ...target, phase: "error" });
        setGuest(loadCompletions());
      }
    },
    status, complete, busy, signedIn: !!owner,
    progress: owner ? (state.owner === owner ? state.progress : null) : guest.readable ? summarizeProgress(guest.records) : null,
    count: owner ? (state.owner === owner ? state.count : null) : guest.readable ? guest.records.length : null,
    error: !!owner && state.owner === owner && state.error,
    guestUnreadable: !guest.readable,
    browserCount: guest.readable ? guest.records.length : null,
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

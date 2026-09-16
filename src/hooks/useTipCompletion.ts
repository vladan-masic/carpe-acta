import { useRef, useState } from "react";
import type { TipId } from "../types/tip";
import { saveCompletion } from "../utils/completions";

export function useTipCompletion() {
  const completed = useRef(false);
  const [status, setStatus] = useState<"saved" | "unsaved" | null>(null);

  function complete(tipId: TipId) {
    // Guard synchronously, including two clicks before React renders again.
    if (completed.current) return;
    completed.current = true;
    const saved = saveCompletion({
      id: crypto.randomUUID(),
      tipId,
      completedAt: new Date().toISOString(),
    });
    setStatus(saved ? "saved" : "unsaved");
  }

  function reset() {
    completed.current = false;
    setStatus(null);
  }

  return { status, complete, reset };
}

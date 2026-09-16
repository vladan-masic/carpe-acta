import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { completionStorageKey, saveCompletion } from "../src/utils/completions";

describe("local completion history", () => {
  let values: Map<string, string>;
  let storage: { getItem: ReturnType<typeof vi.fn>; setItem: ReturnType<typeof vi.fn> };
  const first = {
    id: "completion-1",
    tipId: "two-minute-start",
    completedAt: "2026-09-16T10:00:00.000Z",
  };

  beforeEach(() => {
    values = new Map();
    storage = {
      getItem: vi.fn((key: string) => values.get(key) ?? null),
      setItem: vi.fn((key: string, value: string) => values.set(key, value)),
    };
    vi.stubGlobal("window", { localStorage: storage });
  });
  afterEach(() => vi.unstubAllGlobals());

  it("saves an action ID and timestamp separately from other preferences", () => {
    values.set("carpe-acta-locale", "sr-Latn");
    expect(saveCompletion(first)).toBe(true);
    expect(JSON.parse(values.get(completionStorageKey)!)).toEqual([first]);
    expect(values.get("carpe-acta-locale")).toBe("sr-Latn");
  });

  it("retains history and allows the same action on later occasions", () => {
    values.set(completionStorageKey, JSON.stringify([first]));
    const next = { ...first, id: "completion-2", completedAt: "2026-09-17T10:00:00.000Z" };
    expect(saveCompletion(next)).toBe(true);
    expect(JSON.parse(values.get(completionStorageKey)!)).toEqual([first, next]);
  });

  it("does not duplicate the same completion record", () => {
    expect(saveCompletion(first)).toBe(true);
    expect(saveCompletion(first)).toBe(true);
    expect(storage.setItem).toHaveBeenCalledTimes(1);
  });

  it("preserves records for tips that are no longer in the catalog", () => {
    const retired = { ...first, id: "older", tipId: "retired-tip" };
    values.set(completionStorageKey, JSON.stringify([retired]));
    expect(saveCompletion(first)).toBe(true);
    expect(JSON.parse(values.get(completionStorageKey)!)).toEqual([retired, first]);
  });

  it.each(["not json", "null", "{}", '[{"id":"broken"}]'])(
    "leaves invalid history untouched: %s", (raw) => {
      values.set(completionStorageKey, raw);
      expect(saveCompletion(first)).toBe(false);
      expect(values.get(completionStorageKey)).toBe(raw);
      expect(storage.setItem).not.toHaveBeenCalled();
    },
  );

  it("handles blocked storage access", () => {
    vi.stubGlobal("window", {
      get localStorage() { throw new Error("Storage blocked"); },
    });
    expect(saveCompletion(first)).toBe(false);
  });

  it("handles write failure without discarding existing history", () => {
    const raw = JSON.stringify([first]);
    values.set(completionStorageKey, raw);
    storage.setItem.mockImplementation(() => { throw new Error("Quota exceeded"); });
    expect(saveCompletion({ ...first, id: "second" })).toBe(false);
    expect(values.get(completionStorageKey)).toBe(raw);
  });
});

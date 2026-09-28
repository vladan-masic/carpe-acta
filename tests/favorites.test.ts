import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { favoritesStorageKey, loadFavorites, saveFavorites, setFavorite } from "../src/utils/favorites";

describe("favorite selection", () => {
  it("adds newest first without mutating the previous list", () => {
    const before = ["two-minute-start"];
    expect(setFavorite(before, "phone-distance", true)).toEqual(["phone-distance", "two-minute-start"]);
    expect(before).toEqual(["two-minute-start"]);
  });

  it("does not duplicate or reorder an already saved tip", () => {
    const ids = ["phone-distance", "two-minute-start"];
    expect(setFavorite(ids, "two-minute-start", true)).toEqual(ids);
  });

  it("removes only the requested tip and can remove the final favorite", () => {
    expect(setFavorite(["phone-distance", "two-minute-start"], "phone-distance", false)).toEqual(["two-minute-start"]);
    expect(setFavorite(["two-minute-start"], "two-minute-start", false)).toEqual([]);
    expect(setFavorite([], "two-minute-start", false)).toEqual([]);
  });
});

describe("favorite persistence", () => {
  let values: Map<string, string>;
  let storage: { getItem: ReturnType<typeof vi.fn>; setItem: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    values = new Map();
    storage = {
      getItem: vi.fn((key: string) => values.get(key) ?? null),
      setItem: vi.fn((key: string, value: string) => values.set(key, value)),
    };
    vi.stubGlobal("window", { localStorage: storage });
  });
  afterEach(() => vi.unstubAllGlobals());

  it("starts with an empty list without writing during initialization", () => {
    expect(loadFavorites()).toEqual({ ids: [], persisted: true });
    expect(storage.setItem).not.toHaveBeenCalled();
  });

  it("restores saved IDs and order on a subsequent load", () => {
    expect(saveFavorites(["phone-distance", "two-minute-start"])).toBe(true);
    expect(loadFavorites()).toEqual({ ids: ["phone-distance", "two-minute-start"], persisted: true });
  });

  it("persists removal, including an empty list", () => {
    saveFavorites(["two-minute-start"]);
    expect(saveFavorites(setFavorite(loadFavorites().ids, "two-minute-start", false))).toBe(true);
    expect(loadFavorites()).toEqual({ ids: [], persisted: true });
  });

  it("normalizes duplicates while preserving unavailable IDs", () => {
    values.set(favoritesStorageKey, JSON.stringify(["retired-tip", "two-minute-start", "retired-tip"]));
    expect(loadFavorites().ids).toEqual(["retired-tip", "two-minute-start"]);
    saveFavorites(setFavorite(loadFavorites().ids, "phone-distance", true));
    expect(loadFavorites().ids).toEqual(["phone-distance", "retired-tip", "two-minute-start"]);
  });

  it("keeps completion history and language preference separate", () => {
    values.set("carpe-acta-completions-v1", "existing history");
    values.set("carpe-acta-locale", "sr-Latn");
    saveFavorites(["two-minute-start"]);
    expect(values.get("carpe-acta-completions-v1")).toBe("existing history");
    expect(values.get("carpe-acta-locale")).toBe("sr-Latn");
  });

  it.each(["broken json", "null", "{}", '[42]', '["valid", ""]'])(
    "does not crash or overwrite malformed storage: %s", (raw) => {
      values.set(favoritesStorageKey, raw);
      expect(loadFavorites()).toEqual({ ids: [], persisted: false });
      expect(saveFavorites(["two-minute-start"])).toBe(false);
      expect(values.get(favoritesStorageKey)).toBe(raw);
      expect(storage.setItem).not.toHaveBeenCalled();
    },
  );

  it("handles denied storage access", () => {
    vi.stubGlobal("window", {
      get localStorage() { throw new Error("Blocked"); },
    });
    expect(loadFavorites()).toEqual({ ids: [], persisted: false });
    expect(saveFavorites(["two-minute-start"])).toBe(false);
  });

  it("reports failed writes without losing the previously stored list", () => {
    saveFavorites(["two-minute-start"]);
    storage.setItem.mockImplementation(() => { throw new Error("Quota exceeded"); });
    expect(saveFavorites(["phone-distance", "two-minute-start"])).toBe(false);
    expect(loadFavorites().ids).toEqual(["two-minute-start"]);
  });

  it("reads fresh values instead of caching a previous visit", () => {
    expect(loadFavorites().ids).toEqual([]);
    values.set(favoritesStorageKey, '["phone-distance"]');
    expect(loadFavorites().ids).toEqual(["phone-distance"]);
  });
});

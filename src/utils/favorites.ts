export const favoritesStorageKey = "carpe-acta-favorites-v1";

export type FavoritesState = {
  ids: string[];
  persisted: boolean;
};

function parseFavorites(raw: string | null): string[] {
  const value: unknown = raw === null ? [] : JSON.parse(raw);
  if (!Array.isArray(value) || !value.every((id) => typeof id === "string" && id.trim().length > 0)) {
    throw new Error("Invalid favorites data");
  }
  // Keep unknown IDs so temporarily unavailable tips are not silently forgotten.
  return [...new Set(value)];
}

export function loadFavorites(): FavoritesState {
  try {
    return { ids: parseFavorites(window.localStorage.getItem(favoritesStorageKey)), persisted: true };
  } catch {
    return { ids: [], persisted: false };
  }
}

export function saveFavorites(ids: readonly string[]): boolean {
  try {
    const storage = window.localStorage;
    // Leave malformed data untouched instead of silently replacing a damaged list.
    parseFavorites(storage.getItem(favoritesStorageKey));
    storage.setItem(favoritesStorageKey, JSON.stringify([...new Set(ids)]));
    return true;
  } catch {
    return false;
  }
}

export function setFavorite(ids: readonly string[], tipId: string, selected: boolean): string[] {
  if (!selected) return ids.filter((id) => id !== tipId);
  return ids.includes(tipId) ? [...ids] : [tipId, ...ids];
}

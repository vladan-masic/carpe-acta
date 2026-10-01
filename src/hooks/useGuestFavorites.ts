import { useEffect, useRef, useState } from "react";
import type { TipId } from "../types/tip";
import { favoritesStorageKey, loadFavorites, saveFavorites, setFavorite } from "../utils/favorites";

export function useGuestFavorites() {
  const [state, setState] = useState(loadFavorites);
  const current = useRef(state);

  useEffect(() => {
    function sync(event: StorageEvent) {
      if ((event.key === favoritesStorageKey || event.key === null) && current.current.persisted) {
        const next = loadFavorites();
        current.current = next;
        setState(next);
      }
    }
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  function toggle(tipId: TipId) {
    const previous = current.current;
    // Read the latest saved list, but retain this visit's edits after a failed save.
    const latest = previous.persisted ? loadFavorites() : previous;
    const base = latest.persisted ? latest.ids : previous.ids;
    const ids = setFavorite(base, tipId, !previous.ids.includes(tipId));
    const next = { ids, persisted: saveFavorites(ids) };
    current.current = next;
    setState(next);
  }

  return { ...state, toggle };
}

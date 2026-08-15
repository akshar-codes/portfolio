import { useCallback, useState } from "react";

const STORAGE_KEY = "admin:recentSearches";
const MAX_RECENT = 5;

function readFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Persists up to MAX_RECENT unique search terms in localStorage so the
 * Global Search command palette can show "recent searches" when the
 * input is empty.
 *
 * - Terms shorter than 2 chars are ignored (too noisy to persist).
 * - List is deduplicated: adding an existing term moves it to the top.
 * - State is kept in sync across the tab session via useState; the
 *   storage is the cross-session persistence layer.
 */
export function useRecentSearches() {
  const [recent, setRecent] = useState(readFromStorage);

  const addSearch = useCallback((term) => {
    const trimmed = (term ?? "").trim();
    if (trimmed.length < 2) return;

    setRecent((prev) => {
      const deduped = [trimmed, ...prev.filter((t) => t !== trimmed)].slice(0, MAX_RECENT);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(deduped));
      } catch {
        // Storage full or private browsing — degrade silently.
      }
      return deduped;
    });
  }, []);

  const clearSearches = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setRecent([]);
  }, []);

  return { recent, addSearch, clearSearches };
}


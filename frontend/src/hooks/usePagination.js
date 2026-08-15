import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";

/**
 * URL-backed pagination state. `page` lives in the URL query string as
 * `?page=<n>` so links and refreshes restore the user's position.
 *
 * Uses the same functional-updater pattern as useFilters so both hooks
 * can coexist on the same page without clobbering each other's URL writes.
 *
 * `limit` is kept in memory (not in the URL) — it's a per-page constant
 * that doesn't need to be bookmarkable.
 *
 * Page 1 is represented by the *absence* of the `page` param, keeping
 * URLs clean: `/admin/projects` rather than `/admin/projects?page=1`.
 */
export function usePagination({ initialLimit = 10 } = {}) {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));

  const setPage = useCallback(
    (next) => {
      const n = Math.max(1, next);
      setSearchParams(
        (prev) => {
          const params = new URLSearchParams(prev);
          if (n === 1) params.delete("page"); // page 1 = no param
          else params.set("page", String(n));
          return params;
        },
        { replace: false }, // page changes are meaningful history entries
      );
    },
    [setSearchParams],
  );

  // Kept for API compatibility with existing pages that call `reset()`.
  const reset = useCallback(() => {
    setSearchParams(
      (prev) => {
        const params = new URLSearchParams(prev);
        params.delete("page");
        return params;
      },
      { replace: false },
    );
  }, [setSearchParams]);

  return { page, limit: initialLimit, setPage, reset };
}

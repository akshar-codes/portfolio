import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

/**
 * URL-backed filter state using React Router's useSearchParams.
 *
 * Design decisions:
 *
 * 1. **Functional updater pattern** — every write goes through
 *    `setSearchParams(prev => ...)`. This is the only safe way to
 *    share the URL with another hook (e.g. usePagination) on the same
 *    page: the functional form always reads the *latest* param snapshot
 *    before patching, so two hooks calling setSearchParams in the same
 *    event won't clobber each other.
 *
 * 2. **Automatic page reset** — `setFilter` deletes `page` from the
 *    URL by default so the user is never stranded on page 4 after
 *    narrowing a filter. Pass `{ resetPage: false }` to suppress this.
 *
 * 3. **Empty values are deleted** — `""`, `null`, and `undefined` all
 *    remove the key from the URL, keeping it clean. Default values
 *    from `initialFilters` are the source of truth for "no filter set".
 *
 * 4. **replace vs push** — dropdowns and sort changes push a history
 *    entry (user can go back); debounced search flushes should use
 *    `replace: true` to avoid polluting history with intermediate states.
 *    Callers decide: `setFilter('search', v, { replace: true })`.
 */
export function useFilters(initialFilters = {}) {
  const [searchParams, setSearchParams] = useSearchParams();

  // Derive current filter values from URL, falling back to initialFilters
  // for any key not yet present. Re-runs only when the URL changes.
  const filters = useMemo(() => {
    const result = { ...initialFilters };
    for (const key of Object.keys(initialFilters)) {
      const val = searchParams.get(key);
      if (val !== null) result[key] = val;
    }
    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]); // initialFilters intentionally omitted — treated as a stable literal

  /** Set a single filter key.
   *  @param {string} key
   *  @param {string} value  — `""` / `null` / `undefined` deletes the key
   *  @param {{ replace?: boolean, resetPage?: boolean }} options */
  const setFilter = useCallback(
    (key, value, { replace = false, resetPage = true } = {}) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (value === "" || value == null) {
            next.delete(key);
          } else {
            next.set(key, String(value));
          }
          if (resetPage) next.delete("page");
          return next;
        },
        { replace },
      );
    },
    [setSearchParams],
  );

  /** Set multiple filter keys atomically in a single URL write. */
  const setFilters = useCallback(
    (patch, { replace = false, resetPage = true } = {}) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const [key, value] of Object.entries(patch)) {
            if (value === "" || value == null) {
              next.delete(key);
            } else {
              next.set(key, String(value));
            }
          }
          if (resetPage) next.delete("page");
          return next;
        },
        { replace },
      );
    },
    [setSearchParams],
  );

  /** Remove all known filter keys and reset page. */
  const resetFilters = useCallback(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        for (const key of Object.keys(initialFilters)) next.delete(key);
        next.delete("page");
        return next;
      },
      { replace: false },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setSearchParams]); // initialFilters intentionally stable

  return { filters, setFilter, setFilters, resetFilters };
}

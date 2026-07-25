import { useCallback, useState } from "react";

/**
 * Generic filter-object state, decoupled from any specific resource.
 * Covers search text, status dropdowns, sort field/direction — any
 * key a page's query params need. Pages read `filters` and pass it
 * straight into their React Query hook's params.
 */
export function useFilters(initialFilters = {}) {
  const [filters, setFiltersState] = useState(initialFilters);

  const setFilter = useCallback((key, value) => {
    setFiltersState((prev) => ({ ...prev, [key]: value }));
  }, []);

  const setFilters = useCallback((patch) => {
    setFiltersState((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetFilters = useCallback(() => setFiltersState(initialFilters), [initialFilters]);

  return { filters, setFilter, setFilters, resetFilters };
}

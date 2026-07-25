import { useCallback, useState } from "react";

/**
 * Generic pagination state, decoupled from any specific resource.
 * Pages pass `{ page, limit }` straight through as query params.
 */
export function usePagination({ initialPage = 1, initialLimit = 10 } = {}) {
  const [page, setPageState] = useState(initialPage);
  const [limit, setLimitState] = useState(initialLimit);

  const setPage = useCallback((next) => setPageState(Math.max(1, next)), []);

  const setLimit = useCallback((next) => {
    setLimitState(next);
    setPageState(1);
  }, []);

  const reset = useCallback(() => {
    setPageState(initialPage);
    setLimitState(initialLimit);
  }, [initialPage, initialLimit]);

  return { page, limit, setPage, setLimit, reset };
}

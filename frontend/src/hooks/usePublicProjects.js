import { useQuery } from "@tanstack/react-query";
import { publicProjectsApi } from "../api/publicProjectsApi";

const LIST_STALE_TIME = 60_000;

/** Paginated, filterable, searchable public project listing. */
export function usePublicProjectsQuery(params, options = {}) {
  return useQuery({
    queryKey: ["projects", "public", "list", params ?? {}],
    queryFn: () => publicProjectsApi.list(params),
    // Keeps the previous page's rows on screen while a new page/filter
    // loads, instead of flashing an empty grid on every keystroke/click.
    placeholderData: (previousData) => previousData,
    staleTime: LIST_STALE_TIME,
    ...options,
  });
}

/** Single project — backs the details modal. */
export function usePublicProjectQuery(id, options = {}) {
  return useQuery({
    queryKey: ["projects", "public", "item", id],
    queryFn: () => publicProjectsApi.getById(id),
    enabled: Boolean(id),
    staleTime: LIST_STALE_TIME,
    ...options,
  });
}

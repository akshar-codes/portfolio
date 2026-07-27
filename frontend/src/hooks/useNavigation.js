import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { navigationApi } from "../api/navigationApi";

export const NAVIGATION_QUERY_KEY = ["navigation", "admin"];

/* ── Admin read ────────────────────────────────────────────────────── */

export function useAdminNavigationQuery() {
  return useQuery({
    queryKey: NAVIGATION_QUERY_KEY,
    queryFn: navigationApi.get,
    staleTime: 0, // always fresh in the admin panel
  });
}

/* ── Shared mutation factory — every mutation replaces the whole
 * cached document with the server's confirmed response, matching
 * useSiteSettings.js/useProfile.js/useAbout.js. ─────────────────── */

function useNavigationMutation(mutationFn) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: (updated) => {
      queryClient.setQueryData(NAVIGATION_QUERY_KEY, updated);
    },
  });
}

export function useUpdateNavigation() {
  return useNavigationMutation((payload) => navigationApi.update(payload));
}

export function usePublishNavigation() {
  return useNavigationMutation(() => navigationApi.publish());
}

export function useUnpublishNavigation() {
  return useNavigationMutation(() => navigationApi.unpublish());
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { footerApi } from "../api/footerApi";

export const FOOTER_QUERY_KEY = ["footer", "admin"];

/* ── Admin read ────────────────────────────────────────────────────── */

export function useAdminFooterQuery() {
  return useQuery({
    queryKey: FOOTER_QUERY_KEY,
    queryFn: footerApi.get,
    staleTime: 0, // always fresh in the admin panel
  });
}

/* ── Shared mutation factory ──────────────────────────────────────── */

function useFooterMutation(mutationFn) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: (updated) => {
      queryClient.setQueryData(FOOTER_QUERY_KEY, updated);
    },
  });
}

export function useUpdateFooter() {
  return useFooterMutation((payload) => footerApi.update(payload));
}

export function usePublishFooter() {
  return useFooterMutation(() => footerApi.publish());
}

export function useUnpublishFooter() {
  return useFooterMutation(() => footerApi.unpublish());
}

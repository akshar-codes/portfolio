import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { seoApi } from "../api/seoApi";

export const SEO_QUERY_KEY = ["seo", "admin"];

/* ── Admin read ────────────────────────────────────────────────────── */

export function useAdminSeoQuery() {
  return useQuery({
    queryKey: SEO_QUERY_KEY,
    queryFn: seoApi.get,
    staleTime: 0, // always fresh in the admin panel
  });
}

/* ── Shared mutation factory ──────────────────────────────────────── */

function useSeoMutation(mutationFn) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: (updated) => {
      queryClient.setQueryData(SEO_QUERY_KEY, updated);
    },
  });
}

export function useUpdateSeo() {
  return useSeoMutation((payload) => seoApi.update(payload));
}

export function usePublishSeo() {
  return useSeoMutation(() => seoApi.publish());
}

export function useUnpublishSeo() {
  return useSeoMutation(() => seoApi.unpublish());
}

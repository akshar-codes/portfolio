import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../services/api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";
import { aboutApi } from "../api/aboutApi";
import { portfolioSnapshotApi } from "../api/portfolioSnapshotApi";

export const ABOUT_QUERY_KEY = ["about"];
export const ADMIN_ABOUT_QUERY_KEY = ["about", "admin"];

/* ── Public read ───────────────────────────────────────────────────── */

export function useAbout({ preview = false } = {}) {
  return useQuery({
    queryKey: [...ABOUT_QUERY_KEY, { preview }],
    queryFn: async () => {
      if (!preview) return portfolioSnapshotApi.load().then((snapshot) => snapshot.about);
      const { data } = await api.get(API_ENDPOINTS.adminAbout);
      return data;
    },
    staleTime: preview ? 0 : 5 * 60 * 1000,
    retry: 2,
  });
}

/* ── Admin read ────────────────────────────────────────────────────── */

export function useAdminAboutQuery() {
  return useQuery({
    queryKey: ADMIN_ABOUT_QUERY_KEY,
    queryFn: aboutApi.get,
    staleTime: 0, // always fresh in the admin panel
  });
}

/* ── Shared mutation factory ──────────────────────────────────────── */

function useAboutMutation(mutationFn) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: (updated) => {
      queryClient.setQueryData(ADMIN_ABOUT_QUERY_KEY, updated);
      queryClient.setQueryData(ABOUT_QUERY_KEY, updated);
    },
  });
}

export function useUpdateAbout() {
  return useAboutMutation((payload) => aboutApi.update(payload));
}

export function usePublishAbout() {
  return useAboutMutation(() => aboutApi.publish());
}

export function useUnpublishAbout() {
  return useAboutMutation(() => aboutApi.unpublish());
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../services/api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";

export const ABOUT_QUERY_KEY = ["about"];

/* ── Public read ───────────────────────────────────────────────────── */

export function useAbout() {
  return useQuery({
    queryKey: ABOUT_QUERY_KEY,
    queryFn: async () => {
      const { data } = await api.get(API_ENDPOINTS.about);
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes — content changes rarely
    retry: 2,
  });
}

/* ── Admin read ────────────────────────────────────────────────────── */

export function useAdminAbout() {
  return useQuery({
    queryKey: [...ABOUT_QUERY_KEY, "admin"],
    queryFn: async () => {
      const { data } = await api.get(API_ENDPOINTS.adminAbout);
      return data;
    },
    staleTime: 0, // always fresh in the admin panel
  });
}

/* ── PATCH mutation ────────────────────────────────────────────────── */

export function useUpdateAbout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ section, value }) => {
      const { data } = await api.patch(API_ENDPOINTS.adminAbout, {
        section,
        value,
      });
      return data;
    },
    onSuccess: (updatedAbout) => {
      // Update both caches so the public About page reflects changes immediately
      queryClient.setQueryData(ABOUT_QUERY_KEY, updatedAbout);
      queryClient.setQueryData([...ABOUT_QUERY_KEY, "admin"], updatedAbout);
    },
  });
}

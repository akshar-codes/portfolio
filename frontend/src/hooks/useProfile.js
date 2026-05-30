import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../services/api";

export const PROFILE_QUERY_KEY = ["profile"];

/* ── Public read ───────────────────────────────────────────────────── */

export function useProfile() {
  return useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: async () => {
      const { data } = await api.get("/profile");
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes — profile changes rarely
    retry: 2,
  });
}

/* ── Admin read ────────────────────────────────────────────────────── */

export function useAdminProfile() {
  return useQuery({
    queryKey: [...PROFILE_QUERY_KEY, "admin"],
    queryFn: async () => {
      const { data } = await api.get("/admin/profile");
      return data;
    },
    staleTime: 0, // always fresh in the admin panel
  });
}

/* ── PATCH mutation ────────────────────────────────────────────────── */

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates) => {
      const { data } = await api.patch("/admin/profile", updates);
      return data;
    },
    onSuccess: (updatedProfile) => {
      // Update both query caches so Sidebar reflects changes immediately
      queryClient.setQueryData(PROFILE_QUERY_KEY, updatedProfile);
      queryClient.setQueryData([...PROFILE_QUERY_KEY, "admin"], updatedProfile);
    },
  });
}

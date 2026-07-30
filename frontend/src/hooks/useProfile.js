import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../services/api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";
import { profileApi } from "../api/profileApi";

export const PROFILE_QUERY_KEY = ["profile"];
export const ADMIN_PROFILE_QUERY_KEY = ["profile", "admin"];

/* ── Public read ───────────────────────────────────────────────────── */

export function useProfile() {
  return useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: async () => {
      const { data } = await api.get(API_ENDPOINTS.profile);
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes — profile changes rarely
    retry: 2,
  });
}

/* ── Admin read ────────────────────────────────────────────────────── */

export function useAdminProfileQuery() {
  return useQuery({
    queryKey: ADMIN_PROFILE_QUERY_KEY,
    queryFn: profileApi.get,
    staleTime: 0, // always fresh in the admin panel
  });
}

/* ── Shared mutation factory — every mutation replaces both cached
 * documents with the server's confirmed response. ─────────────────── */

function useProfileMutation(mutationFn) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: (updated) => {
      queryClient.setQueryData(ADMIN_PROFILE_QUERY_KEY, updated);
      queryClient.setQueryData(PROFILE_QUERY_KEY, updated);
    },
  });
}

export function useUpdateProfile() {
  return useProfileMutation((payload) => profileApi.update(payload));
}

export function usePublishProfile() {
  return useProfileMutation(() => profileApi.publish());
}

export function useUnpublishProfile() {
  return useProfileMutation(() => profileApi.unpublish());
}

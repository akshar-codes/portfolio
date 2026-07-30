import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../services/api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";
import { resumeApi } from "../api/resumeApi";

export const RESUME_QUERY_KEY = ["resume"];
export const ADMIN_RESUME_QUERY_KEY = ["resume", "admin"];

/* ── Public read ───────────────────────────────────────────────────── */

export function useResume() {
  return useQuery({
    queryKey: RESUME_QUERY_KEY,
    queryFn: async () => {
      const { data } = await api.get(API_ENDPOINTS.resume);
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes — content changes rarely
    retry: 2,
  });
}

/* ── Admin read ────────────────────────────────────────────────────── */

export function useAdminResumeQuery() {
  return useQuery({
    queryKey: ADMIN_RESUME_QUERY_KEY,
    queryFn: resumeApi.get,
    staleTime: 0, // always fresh in the admin panel
  });
}

/* ── Shared mutation factory ──────────────────────────────────────── */

function useResumeMutation(mutationFn) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: (updated) => {
      queryClient.setQueryData(ADMIN_RESUME_QUERY_KEY, updated);
      queryClient.setQueryData(RESUME_QUERY_KEY, updated);
    },
  });
}

export function useUpdateResume() {
  return useResumeMutation((payload) => resumeApi.update(payload));
}

export function usePublishResume() {
  return useResumeMutation(() => resumeApi.publish());
}

export function useUnpublishResume() {
  return useResumeMutation(() => resumeApi.unpublish());
}

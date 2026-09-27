import { useQuery } from "@tanstack/react-query";
import api from "../services/api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";
import { portfolioSnapshotApi } from "../api/portfolioSnapshotApi";

// Site-wide chrome changes rarely — cache aggressively so Navbar/Footer
// (mounted on every route) don't refetch on every navigation.
const SITE_STALE_TIME = 5 * 60 * 1000;

export function usePublicNavigation({ preview = false, ...options } = {}) {
  return useQuery({
    queryKey: ["navigation", "public", { preview }],
    queryFn: () => preview ? api.get(API_ENDPOINTS.adminNavigation).then(r => r.data) : portfolioSnapshotApi.load().then((snapshot) => snapshot.navigation),
    staleTime: preview ? 0 : SITE_STALE_TIME,
    retry: 1,
    ...options,
  });
}

export function usePublicFooter({ preview = false, ...options } = {}) {
  return useQuery({
    queryKey: ["footer", "public", { preview }],
    queryFn: () => preview ? api.get(API_ENDPOINTS.adminFooter).then(r => r.data) : portfolioSnapshotApi.load().then((snapshot) => snapshot.footer),
    staleTime: preview ? 0 : SITE_STALE_TIME,
    retry: 1,
    ...options,
  });
}

export function usePublicSiteSettings({ preview = false, ...options } = {}) {
  return useQuery({
    queryKey: ["siteSettings", "public", { preview }],
    queryFn: () => preview ? api.get(API_ENDPOINTS.adminSettings).then(r => r.data) : portfolioSnapshotApi.load().then((snapshot) => snapshot.siteSettings),
    staleTime: preview ? 0 : SITE_STALE_TIME,
    retry: 1,
    ...options,
  });
}

export function usePublicSeo({ preview = false, ...options } = {}) {
  return useQuery({
    queryKey: ["seo", "public", { preview }],
    queryFn: () => preview ? api.get(API_ENDPOINTS.adminSeo).then(r => r.data) : portfolioSnapshotApi.load().then((snapshot) => snapshot.seo),
    staleTime: preview ? 0 : SITE_STALE_TIME,
    retry: 1,
    ...options,
  });
}

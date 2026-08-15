import { useQuery } from "@tanstack/react-query";
import { publicSiteApi } from "../api/publicSiteApi";

// Site-wide chrome changes rarely — cache aggressively so Navbar/Footer
// (mounted on every route) don't refetch on every navigation.
const SITE_STALE_TIME = 5 * 60 * 1000;

export function usePublicNavigation(options = {}) {
  return useQuery({
    queryKey: ["navigation", "public"],
    queryFn: publicSiteApi.getNavigation,
    staleTime: SITE_STALE_TIME,
    retry: 1,
    ...options,
  });
}

export function usePublicFooter(options = {}) {
  return useQuery({
    queryKey: ["footer", "public"],
    queryFn: publicSiteApi.getFooter,
    staleTime: SITE_STALE_TIME,
    retry: 1,
    ...options,
  });
}

export function usePublicSiteSettings(options = {}) {
  return useQuery({
    queryKey: ["siteSettings", "public"],
    queryFn: publicSiteApi.getSiteSettings,
    staleTime: SITE_STALE_TIME,
    retry: 1,
    ...options,
  });
}

export function usePublicSeo(options = {}) {
  return useQuery({
    queryKey: ["seo", "public"],
    queryFn: publicSiteApi.getSeo,
    staleTime: SITE_STALE_TIME,
    retry: 1,
    ...options,
  });
}

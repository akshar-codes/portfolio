import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { siteSettingsApi } from "../api/siteSettingsApi";

export const SITE_SETTINGS_QUERY_KEY = ["siteSettings", "admin"];

/* ── Admin read ────────────────────────────────────────────────────── */

export function useSiteSettingsQuery() {
  return useQuery({
    queryKey: SITE_SETTINGS_QUERY_KEY,
    queryFn: siteSettingsApi.get,
    staleTime: 0, // always fresh in the admin panel
  });
}

/* ── Shared mutation factory — every mutation below replaces the whole
 * cached document with the server's confirmed response, exactly like
 * useProfile.js/useAbout.js do for their own PATCH mutations. ────── */

function useSiteSettingsMutation(mutationFn) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: (updated) => {
      queryClient.setQueryData(SITE_SETTINGS_QUERY_KEY, updated);
    },
  });
}

export function useUpdateSiteSettings() {
  return useSiteSettingsMutation((payload) => siteSettingsApi.update(payload));
}

export function usePublishSiteSettings() {
  return useSiteSettingsMutation(() => siteSettingsApi.publish());
}

export function useUnpublishSiteSettings() {
  return useSiteSettingsMutation(() => siteSettingsApi.unpublish());
}

export function useUploadLogo() {
  return useSiteSettingsMutation(({ file, onUploadProgress }) =>
    siteSettingsApi.uploadLogo(file, onUploadProgress),
  );
}

export function useRemoveLogo() {
  return useSiteSettingsMutation(() => siteSettingsApi.removeLogo());
}

export function useUploadFavicon() {
  return useSiteSettingsMutation(({ file, onUploadProgress }) =>
    siteSettingsApi.uploadFavicon(file, onUploadProgress),
  );
}

export function useRemoveFavicon() {
  return useSiteSettingsMutation(() => siteSettingsApi.removeFavicon());
}

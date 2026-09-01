import asyncHandler from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";
import {
  fetchSiteSettingsAdmin,
  fetchSiteSettingsPublic,
  patchSiteSettings,
  publishSiteSettings,
  unpublishSiteSettings,
  archiveSiteSettings,
  restoreSiteSettings,
  scheduleSiteSettings,
  uploadSiteLogo,
  removeSiteLogo,
  uploadSiteFavicon,
  removeSiteFavicon,
  // Previously imported from "../services/siteSettingsService.js" — no
  // such file exists (the real file is SiteSettingsService.js,
  // capitalized). Fixed to the real filename.
} from "../services/SiteSettingsService.js";
import { createSingletonController } from "./singletonController.js";
// Previously imported "./SingletonController.js" (capitalized), which
// doesn't exist as a real file — fixed to singletonController.js.

const service = {
  fetchAdmin: fetchSiteSettingsAdmin,
  fetchPublic: fetchSiteSettingsPublic,
  patchSingleton: patchSiteSettings,
  publish: publishSiteSettings,
  unpublish: unpublishSiteSettings,
  archive: archiveSiteSettings,
  restore: restoreSiteSettings,
  schedule: scheduleSiteSettings,
};

const {
  getPublicResource: getPublicSiteSettings,
  getAdminResource: getAdminSiteSettings,
  updateResource: updateSiteSettings,
  publishResource: publishSiteSettingsHandler,
  unpublishResource: unpublishSiteSettingsHandler,
  archiveResource: archiveSiteSettingsHandler,
  restoreResource: restoreSiteSettingsHandler,
  scheduleResource: scheduleSiteSettingsHandler,
} = createSingletonController({ service, resourceName: "Site settings" });

/* ------------------------------------------------------------------ *
 * PATCH /api/admin/site-settings/logo  (protected, multipart/form-data)
 * ------------------------------------------------------------------ */
export const uploadSiteSettingsLogo = asyncHandler(async (req, res) => {
  const updated = await uploadSiteLogo(req.file ?? null);
  return sendSuccess(res, updated, "Logo uploaded successfully");
});

/* ------------------------------------------------------------------ *
 * DELETE /api/admin/site-settings/logo  (protected)
 * ------------------------------------------------------------------ */
export const deleteSiteSettingsLogo = asyncHandler(async (_req, res) => {
  const updated = await removeSiteLogo();
  return sendSuccess(res, updated, "Logo removed successfully");
});

/* ------------------------------------------------------------------ *
 * PATCH /api/admin/site-settings/favicon  (protected, multipart/form-data)
 * ------------------------------------------------------------------ */
export const uploadSiteSettingsFavicon = asyncHandler(async (req, res) => {
  const updated = await uploadSiteFavicon(req.file ?? null);
  return sendSuccess(res, updated, "Favicon uploaded successfully");
});

/* ------------------------------------------------------------------ *
 * DELETE /api/admin/site-settings/favicon  (protected)
 * ------------------------------------------------------------------ */
export const deleteSiteSettingsFavicon = asyncHandler(async (_req, res) => {
  const updated = await removeSiteFavicon();
  return sendSuccess(res, updated, "Favicon removed successfully");
});

export {
  getPublicSiteSettings,
  getAdminSiteSettings,
  updateSiteSettings,
  publishSiteSettingsHandler as publishSiteSettings,
  unpublishSiteSettingsHandler as unpublishSiteSettings,
  archiveSiteSettingsHandler as archiveSiteSettings,
  restoreSiteSettingsHandler as restoreSiteSettings,
  scheduleSiteSettingsHandler as scheduleSiteSettings,
};

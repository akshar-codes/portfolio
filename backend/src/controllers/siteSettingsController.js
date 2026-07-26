import asyncHandler from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";
import {
  fetchSiteSettingsAdmin,
  fetchSiteSettingsPublic,
  patchSiteSettings,
  setSiteSettingsStatus,
  uploadSiteLogo,
  removeSiteLogo,
  uploadSiteFavicon,
  removeSiteFavicon,
} from "../services/siteSettingsService.js";
import { createSingletonController } from "./SingletonController.js";

const service = {
  fetchAdmin: fetchSiteSettingsAdmin,
  fetchPublic: fetchSiteSettingsPublic,
  patchSingleton: patchSiteSettings,
  setStatus: setSiteSettingsStatus,
};

const {
  getPublicResource: getPublicSiteSettings,
  getAdminResource: getAdminSiteSettings,
  updateResource: updateSiteSettings,
  publishResource: publishSiteSettings,
  unpublishResource: unpublishSiteSettings,
} = createSingletonController({ service, resourceName: "Site settings" });

/* ------------------------------------------------------------------ *
 * PATCH /api/admin/site-settings/logo  (protected, multipart/form-data)
 * File-presence validation happens inside the service (mirrors
 * mediaController.uploadMedia), since an uploaded file lives on
 * req.file, not req.body.
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
  publishSiteSettings,
  unpublishSiteSettings,
};

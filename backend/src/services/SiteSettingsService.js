import {
  getSingleton,
  findDefault,
  create,
} from "../repositories/siteSettingsRepository.js";
import { createSingletonService } from "./SingletonService.js";
import { ServiceError } from "./ServiceError.js";
import {
  cloudinaryFolder,
  uploadToCloudinary,
  destroyFromCloudinary,
} from "../config/cloudinary.js";
import logger from "../utils/logger.js";

const repository = { getSingleton, findDefault, create };

const PATCHABLE_FIELDS = [
  "siteName",
  "tagline",
  "timezone",
  "defaultLocale",
  "primaryColor",
  "secondaryColor",
  "announcementBar",
  "contactEmails",
  "contactPhones",
  "contactAddress",
  "resumeDownload",
  "theme",
  "analytics",
  "socialLinksEnabled",
  "maintenanceMode",
  "maintenanceMessage",
];

// `logo` and `favicon` are deliberately excluded from the generic PATCH.
// Each carries a Cloudinary public_id that must stay in lockstep with
// the actual uploaded asset, so they can only be mutated through
// uploadSiteLogo/removeSiteLogo and uploadSiteFavicon/removeSiteFavicon
// below (Stage → Save → Destroy) — never through an arbitrary object
// PATCH, which would risk an invalid/unowned public_id or an orphaned
// Cloudinary asset.
const ORDERED_ARRAY_FIELDS = ["contactEmails", "contactPhones"];

// Required-by-schema fields need a default so the singleton can be
// created on first read/write without the caller having to supply them.
const DEFAULTS = {
  siteName: "My Portfolio",
};

const {
  fetchAdmin: fetchSiteSettingsAdmin,
  fetchPublic: fetchSiteSettingsPublic,
  patchSingleton: patchSiteSettings,
  setStatus: setSiteSettingsStatus,
  invalidateCache: invalidateSiteSettingsCache,
} = createSingletonService({
  repository,
  cacheKey: "siteSettings:public",
  patchableFields: PATCHABLE_FIELDS,
  orderedArrayFields: ORDERED_ARRAY_FIELDS,
  defaults: DEFAULTS,
  resourceName: "Site settings",
});

/* ------------------------------------------------------------------ *
 * Logo / Favicon — Stage → Save → Destroy
 *
 * Mirrors services/mediaService.js's replaceMedia and
 * services/projectService.js's thumbnail replacement: the new asset is
 * uploaded first, the document save happens second, and the previous
 * Cloudinary asset is only destroyed once that save has succeeded. On
 * save failure the newly uploaded asset is rolled back so nothing is
 * orphaned either way.
 * ------------------------------------------------------------------ */

const sortContactArrays = (doc) => ({
  ...doc,
  contactEmails: [...(doc.contactEmails ?? [])].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0),
  ),
  contactPhones: [...(doc.contactPhones ?? [])].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0),
  ),
});

async function replaceImageAsset({ field, file, folderSuffix, label }) {
  if (!file) {
    throw new ServiceError(
      `${label} file is required.`,
      400,
      `SITE_SETTINGS_${field.toUpperCase()}_REQUIRED`,
    );
  }

  const folder = cloudinaryFolder(`site-settings/${folderSuffix}`);

  let uploaded;
  try {
    uploaded = await uploadToCloudinary(file, folder);
  } catch (err) {
    throw new ServiceError(
      err.message,
      400,
      `SITE_SETTINGS_${field.toUpperCase()}_UPLOAD_FAILED`,
    );
  }

  const existing = (await findDefault()) ?? (await create(DEFAULTS));
  const oldPublicId = existing[field]?.public_id || null;

  existing[field] = {
    url: uploaded.secure_url,
    public_id: uploaded.public_id,
  };

  try {
    await existing.validate();
    await existing.save();
  } catch (saveErr) {
    logger.warn(
      `[SiteSettingsService] Rolling back Cloudinary ${field} upload after DB save failure`,
      { publicId: uploaded.public_id, error: saveErr.message },
    );
    await destroyFromCloudinary(uploaded.public_id, logger);
    throw saveErr;
  }

  if (oldPublicId) {
    await destroyFromCloudinary(oldPublicId, logger);
  }

  invalidateSiteSettingsCache();
  return sortContactArrays(existing.toObject());
}

async function removeImageAsset({ field, label }) {
  const existing = await findDefault();

  if (!existing || !existing[field]?.public_id) {
    throw new ServiceError(
      `No ${label.toLowerCase()} to remove.`,
      404,
      `SITE_SETTINGS_${field.toUpperCase()}_NOT_FOUND`,
    );
  }

  const publicId = existing[field].public_id;
  existing[field] = { url: "", public_id: "" };

  await existing.validate();
  await existing.save();
  await destroyFromCloudinary(publicId, logger);

  invalidateSiteSettingsCache();
  return sortContactArrays(existing.toObject());
}

export const uploadSiteLogo = (file) =>
  replaceImageAsset({ field: "logo", file, folderSuffix: "logo", label: "Logo" });

export const removeSiteLogo = () =>
  removeImageAsset({ field: "logo", label: "Logo" });

export const uploadSiteFavicon = (file) =>
  replaceImageAsset({
    field: "favicon",
    file,
    folderSuffix: "favicon",
    label: "Favicon",
  });

export const removeSiteFavicon = () =>
  removeImageAsset({ field: "favicon", label: "Favicon" });

export {
  fetchSiteSettingsAdmin,
  fetchSiteSettingsPublic,
  patchSiteSettings,
  setSiteSettingsStatus,
  invalidateSiteSettingsCache,
};

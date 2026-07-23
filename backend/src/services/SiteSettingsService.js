import {
  getSingleton,
  findDefault,
  create,
} from "../repositories/siteSettingsRepository.js";
import { createSingletonService } from "./SingletonService.js";

const repository = { getSingleton, findDefault, create };

const PATCHABLE_FIELDS = [
  "siteName",
  "tagline",
  "logoUrl",
  "faviconUrl",
  "primaryColor",
  "secondaryColor",
  "contactEmail",
  "maintenanceMode",
  "maintenanceMessage",
  "timezone",
  "defaultLocale",
];

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
  defaults: DEFAULTS,
  resourceName: "Site settings",
});

export {
  fetchSiteSettingsAdmin,
  fetchSiteSettingsPublic,
  patchSiteSettings,
  setSiteSettingsStatus,
  invalidateSiteSettingsCache,
};

import {
  fetchSiteSettingsAdmin,
  fetchSiteSettingsPublic,
  patchSiteSettings,
  setSiteSettingsStatus,
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

export {
  getPublicSiteSettings,
  getAdminSiteSettings,
  updateSiteSettings,
  publishSiteSettings,
  unpublishSiteSettings,
};

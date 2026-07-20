import {
  fetchSiteSettings,
  patchSiteSettings,
} from "../services/siteSettingsService.js";
import { createSingletonController } from "./SingletonController.js";

const service = {
  fetchSingleton: fetchSiteSettings,
  patchSingleton: patchSiteSettings,
};

const { getResource: getSiteSettings, updateResource: updateSiteSettings } =
  createSingletonController({
    service,
    resourceName: "Site settings",
  });

export { getSiteSettings, updateSiteSettings };

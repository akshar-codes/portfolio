import {
  fetchNavigationAdmin,
  fetchNavigationPublic,
  patchNavigation,
  setNavigationStatus,
} from "../services/navigationService.js";
import { createSingletonController } from "./SingletonController.js";

const service = {
  fetchAdmin: fetchNavigationAdmin,
  fetchPublic: fetchNavigationPublic,
  patchSingleton: patchNavigation,
  setStatus: setNavigationStatus,
};

const {
  getPublicResource: getPublicNavigation,
  getAdminResource: getAdminNavigation,
  updateResource: updateNavigation,
  publishResource: publishNavigation,
  unpublishResource: unpublishNavigation,
} = createSingletonController({ service, resourceName: "Navigation" });

export {
  getPublicNavigation,
  getAdminNavigation,
  updateNavigation,
  publishNavigation,
  unpublishNavigation,
};

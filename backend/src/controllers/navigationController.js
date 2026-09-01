import {
  fetchNavigationAdmin,
  fetchNavigationPublic,
  patchNavigation,
  publishNavigation,
  unpublishNavigation,
  archiveNavigation,
  restoreNavigation,
  scheduleNavigation,
  // Previously imported from "../services/navigationService.js" — on a
  // case-insensitive filesystem this silently resolved to
  // NavigationService.js, an orphaned, simpler service WITHOUT the
  // nested dropdown-children sanitization the frontend's nav editor
  // requires. Fixed to the real, actively-used file.
} from "../services/navigation.service.js";
import { createSingletonController } from "./singletonController.js";
// Previously imported "./SingletonController.js" (capitalized), which
// doesn't exist as a real file — fixed to singletonController.js.

const service = {
  fetchAdmin: fetchNavigationAdmin,
  fetchPublic: fetchNavigationPublic,
  patchSingleton: patchNavigation,
  publish: publishNavigation,
  unpublish: unpublishNavigation,
  archive: archiveNavigation,
  restore: restoreNavigation,
  schedule: scheduleNavigation,
};

const {
  getPublicResource: getPublicNavigation,
  getAdminResource: getAdminNavigation,
  updateResource: updateNavigation,
  publishResource: publishNavigationHandler,
  unpublishResource: unpublishNavigationHandler,
  archiveResource: archiveNavigationHandler,
  restoreResource: restoreNavigationHandler,
  scheduleResource: scheduleNavigationHandler,
} = createSingletonController({ service, resourceName: "Navigation" });

export {
  getPublicNavigation,
  getAdminNavigation,
  updateNavigation,
  publishNavigationHandler as publishNavigation,
  unpublishNavigationHandler as unpublishNavigation,
  archiveNavigationHandler as archiveNavigation,
  restoreNavigationHandler as restoreNavigation,
  scheduleNavigationHandler as scheduleNavigation,
};

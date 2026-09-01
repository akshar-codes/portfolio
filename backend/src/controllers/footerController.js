import {
  fetchFooterAdmin,
  fetchFooterPublic,
  patchFooter,
  publishFooter,
  unpublishFooter,
  archiveFooter,
  restoreFooter,
  scheduleFooter,
  // Previously imported from "../services/footerService.js", a file
  // that doesn't exist — only resolved locally on a case-insensitive
  // filesystem. Fixed to the real file, footer.service.js.
} from "../services/footer.service.js";
import { createSingletonController } from "./singletonController.js";
// Previously imported from "./SingletonController.js" (capitalized),
// which also doesn't exist as a real file — fixed to the real,
// lowercase singletonController.js.

const service = {
  fetchAdmin: fetchFooterAdmin,
  fetchPublic: fetchFooterPublic,
  patchSingleton: patchFooter,
  publish: publishFooter,
  unpublish: unpublishFooter,
  archive: archiveFooter,
  restore: restoreFooter,
  schedule: scheduleFooter,
};

const {
  getPublicResource: getPublicFooter,
  getAdminResource: getAdminFooter,
  updateResource: updateFooter,
  publishResource: publishFooterHandler,
  unpublishResource: unpublishFooterHandler,
  archiveResource: archiveFooterHandler,
  restoreResource: restoreFooterHandler,
  scheduleResource: scheduleFooterHandler,
} = createSingletonController({ service, resourceName: "Footer" });

export {
  getPublicFooter,
  getAdminFooter,
  updateFooter,
  publishFooterHandler as publishFooter,
  unpublishFooterHandler as unpublishFooter,
  archiveFooterHandler as archiveFooter,
  restoreFooterHandler as restoreFooter,
  scheduleFooterHandler as scheduleFooter,
};

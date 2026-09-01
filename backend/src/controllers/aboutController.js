import {
  fetchAdminAbout,
  fetchPublicAbout,
  patchAbout,
  publishAbout,
  unpublishAbout,
  archiveAbout,
  restoreAbout,
  scheduleAbout,
} from "../services/aboutService.js";
import { createSingletonController } from "./singletonController.js";

const service = {
  fetchAdmin: fetchAdminAbout,
  fetchPublic: fetchPublicAbout,
  patchSingleton: patchAbout,
  publish: publishAbout,
  unpublish: unpublishAbout,
  archive: archiveAbout,
  restore: restoreAbout,
  schedule: scheduleAbout,
};

// Exported name `updateAboutSection` is kept for route-file
// compatibility — this is a whole-object-subset PATCH (any of
// biography/skillsSummary/services/timeline/highlights/personalInfo/
// images may be sent, together or individually).
const {
  getPublicResource: getPublicAbout,
  getAdminResource: getAdminAbout,
  updateResource: updateAboutSection,
  publishResource: publishAboutHandler,
  unpublishResource: unpublishAboutHandler,
  archiveResource: archiveAboutHandler,
  restoreResource: restoreAboutHandler,
  scheduleResource: scheduleAboutHandler,
} = createSingletonController({ service, resourceName: "About" });

export {
  getPublicAbout,
  getAdminAbout,
  updateAboutSection,
  publishAboutHandler as publishAbout,
  unpublishAboutHandler as unpublishAbout,
  archiveAboutHandler as archiveAbout,
  restoreAboutHandler as restoreAbout,
  scheduleAboutHandler as scheduleAbout,
};

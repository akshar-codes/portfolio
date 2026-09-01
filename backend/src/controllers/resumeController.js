import {
  fetchResumeAdmin,
  fetchResumePublic,
  patchResume,
  publishResume,
  unpublishResume,
  archiveResume,
  restoreResume,
  scheduleResume,
} from "../services/resumeService.js";
import { createSingletonController } from "./singletonController.js";
// Previously imported "./SingletonController.js" (capitalized), which
// doesn't exist as a real file — fixed to singletonController.js.

const service = {
  fetchAdmin: fetchResumeAdmin,
  fetchPublic: fetchResumePublic,
  patchSingleton: patchResume,
  publish: publishResume,
  unpublish: unpublishResume,
  archive: archiveResume,
  restore: restoreResume,
  schedule: scheduleResume,
};

const {
  getPublicResource: getPublicResume,
  getAdminResource: getAdminResume,
  updateResource: updateResume,
  publishResource: publishResumeHandler,
  unpublishResource: unpublishResumeHandler,
  archiveResource: archiveResumeHandler,
  restoreResource: restoreResumeHandler,
  scheduleResource: scheduleResumeHandler,
} = createSingletonController({ service, resourceName: "Resume" });

export {
  getPublicResume,
  getAdminResume,
  updateResume,
  publishResumeHandler as publishResume,
  unpublishResumeHandler as unpublishResume,
  archiveResumeHandler as archiveResume,
  restoreResumeHandler as restoreResume,
  scheduleResumeHandler as scheduleResume,
};

import {
  fetchAdminProfile,
  fetchPublicProfile,
  patchProfile,
  publishProfile,
  unpublishProfile,
  archiveProfile,
  restoreProfile,
  scheduleProfile,
} from "../services/profileService.js";
import { createSingletonController } from "./singletonController.js";

const service = {
  fetchAdmin: fetchAdminProfile,
  fetchPublic: fetchPublicProfile,
  patchSingleton: patchProfile,
  publish: publishProfile,
  unpublish: unpublishProfile,
  archive: archiveProfile,
  restore: restoreProfile,
  schedule: scheduleProfile,
};

const {
  getPublicResource: getPublicProfile,
  getAdminResource: getAdminProfile,
  updateResource: updateProfile,
  publishResource: publishProfileHandler,
  unpublishResource: unpublishProfileHandler,
  archiveResource: archiveProfileHandler,
  restoreResource: restoreProfileHandler,
  scheduleResource: scheduleProfileHandler,
} = createSingletonController({ service, resourceName: "Profile" });

export {
  getPublicProfile,
  getAdminProfile,
  updateProfile,
  publishProfileHandler as publishProfile,
  unpublishProfileHandler as unpublishProfile,
  archiveProfileHandler as archiveProfile,
  restoreProfileHandler as restoreProfile,
  scheduleProfileHandler as scheduleProfile,
};

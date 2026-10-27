import {
  fetchAdminProfile,
  fetchPublicProfile,
  patchProfile,
  publishProfile,
  unpublishProfile,
  archiveProfile,
  restoreProfile,
  scheduleProfile,
  refreshStatistic,
} from "../services/profileService.js";
import asyncHandler from "../utils/asyncHandler.js";
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

const refreshProfileStatistic = asyncHandler(async (req, res) => {
  const result = await refreshStatistic(req.params.statId);
  res.status(200).json(result);
});

export {
  getPublicProfile,
  getAdminProfile,
  updateProfile,
  publishProfileHandler as publishProfile,
  unpublishProfileHandler as unpublishProfile,
  archiveProfileHandler as archiveProfile,
  restoreProfileHandler as restoreProfile,
  scheduleProfileHandler as scheduleProfile,
  refreshProfileStatistic,
};

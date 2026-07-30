import {
  fetchAdminProfile,
  fetchPublicProfile,
  patchProfile,
  setProfileStatus,
} from "../services/profileService.js";
import { createSingletonController } from "./singletonController.js";

const service = {
  fetchAdmin: fetchAdminProfile,
  fetchPublic: fetchPublicProfile,
  patchSingleton: patchProfile,
  setStatus: setProfileStatus,
};

const {
  getPublicResource: getPublicProfile,
  getAdminResource: getAdminProfile,
  updateResource: updateProfile,
  publishResource: publishProfile,
  unpublishResource: unpublishProfile,
} = createSingletonController({ service, resourceName: "Profile" });

export {
  getPublicProfile,
  getAdminProfile,
  updateProfile,
  publishProfile,
  unpublishProfile,
};

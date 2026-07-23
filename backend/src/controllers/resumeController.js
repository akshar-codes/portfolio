import {
  fetchResumeAdmin,
  fetchResumePublic,
  patchResume,
  setResumeStatus,
} from "../services/resumeService.js";
import { createSingletonController } from "./SingletonController.js";

const service = {
  fetchAdmin: fetchResumeAdmin,
  fetchPublic: fetchResumePublic,
  patchSingleton: patchResume,
  setStatus: setResumeStatus,
};

const {
  getPublicResource: getPublicResume,
  getAdminResource: getAdminResume,
  updateResource: updateResume,
  publishResource: publishResume,
  unpublishResource: unpublishResume,
} = createSingletonController({ service, resourceName: "Resume" });

export {
  getPublicResume,
  getAdminResume,
  updateResume,
  publishResume,
  unpublishResume,
};

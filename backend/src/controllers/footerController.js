import {
  fetchFooterAdmin,
  fetchFooterPublic,
  patchFooter,
  setFooterStatus,
} from "../services/footerService.js";
import { createSingletonController } from "./SingletonController.js";

const service = {
  fetchAdmin: fetchFooterAdmin,
  fetchPublic: fetchFooterPublic,
  patchSingleton: patchFooter,
  setStatus: setFooterStatus,
};

const {
  getPublicResource: getPublicFooter,
  getAdminResource: getAdminFooter,
  updateResource: updateFooter,
  publishResource: publishFooter,
  unpublishResource: unpublishFooter,
} = createSingletonController({ service, resourceName: "Footer" });

export {
  getPublicFooter,
  getAdminFooter,
  updateFooter,
  publishFooter,
  unpublishFooter,
};

import {
  fetchAdminAbout,
  fetchPublicAbout,
  patchAbout,
  setAboutStatus,
} from "../services/aboutService.js";
import { createSingletonController } from "./singletonController.js";

const service = {
  fetchAdmin: fetchAdminAbout,
  fetchPublic: fetchPublicAbout,
  patchSingleton: patchAbout,
  setStatus: setAboutStatus,
};

// Exported name `updateAboutSection` is kept for route-file
// compatibility (routes/admin/aboutRoutes.js already imports it under
// that name). Behaviour has changed, though — this is now a
// whole-object-subset PATCH (any of biography/skillsSummary/services/
// timeline/highlights/personalInfo/images may be sent, together or
// individually), matching Resume/Navigation/Footer's convention,
// rather than the old `{ section, value }` shape. Frontend action:
// ManageAbout.jsx has been rewritten accordingly.
const {
  getPublicResource: getPublicAbout,
  getAdminResource: getAdminAbout,
  updateResource: updateAboutSection,
  publishResource: publishAbout,
  unpublishResource: unpublishAbout,
} = createSingletonController({ service, resourceName: "About" });

export {
  getPublicAbout,
  getAdminAbout,
  updateAboutSection,
  publishAbout,
  unpublishAbout,
};

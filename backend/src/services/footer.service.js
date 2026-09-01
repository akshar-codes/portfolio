import {
  getSingleton,
  findDefault,
  create,
} from "../repositories/footerRepository.js";
import { createSingletonService } from "./SingletonService.js";

const repository = { getSingleton, findDefault, create };

const PATCHABLE_FIELDS = [
  "columns",
  "description",
  "copyrightText",
  "showSocialLinks",
  "showContactInfo",
  "newsletter",
  // "legalLinks" was previously missing here even though
  // validators/footerValidators.js validates it and ManageFooter.jsx
  // sends it — any PATCH containing only legalLinks would have been
  // silently rejected as "No valid fields provided for update."
  "legalLinks",
];
const ORDERED_ARRAY_FIELDS = ["columns", "legalLinks"];

const {
  fetchAdmin: fetchFooterAdmin,
  fetchPublic: fetchFooterPublic,
  patchSingleton: patchFooter,
  publish: publishFooter,
  unpublish: unpublishFooter,
  archive: archiveFooter,
  restore: restoreFooter,
  schedule: scheduleFooter,
  invalidateCache: invalidateFooterCache,
} = createSingletonService({
  repository,
  cacheKey: "footer:public",
  patchableFields: PATCHABLE_FIELDS,
  orderedArrayFields: ORDERED_ARRAY_FIELDS,
  resourceName: "Footer",
});

export {
  fetchFooterAdmin,
  fetchFooterPublic,
  patchFooter,
  publishFooter,
  unpublishFooter,
  archiveFooter,
  restoreFooter,
  scheduleFooter,
  invalidateFooterCache,
};

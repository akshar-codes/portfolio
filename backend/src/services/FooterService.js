import {
  getSingleton,
  findDefault,
  create,
} from "../repositories/footerRepository.js";
import { createSingletonService } from "./SingletonService.js";

const repository = { getSingleton, findDefault, create };

const PATCHABLE_FIELDS = ["columns", "copyrightText", "showSocialLinks"];
const ORDERED_ARRAY_FIELDS = ["columns"];

const {
  fetchAdmin: fetchFooterAdmin,
  fetchPublic: fetchFooterPublic,
  patchSingleton: patchFooter,
  setStatus: setFooterStatus,
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
  setFooterStatus,
  invalidateFooterCache,
};

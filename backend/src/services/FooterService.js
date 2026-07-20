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
  fetchSingleton: fetchFooter,
  patchSingleton: patchFooter,
  invalidateCache: invalidateFooterCache,
} = createSingletonService({
  repository,
  cacheKey: "footer:public",
  patchableFields: PATCHABLE_FIELDS,
  orderedArrayFields: ORDERED_ARRAY_FIELDS,
});

export { fetchFooter, patchFooter, invalidateFooterCache };

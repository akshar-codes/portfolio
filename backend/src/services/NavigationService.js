import {
  getSingleton,
  findDefault,
  create,
} from "../repositories/navigationRepository.js";
import { createSingletonService } from "./SingletonService.js";

const repository = { getSingleton, findDefault, create };

const PATCHABLE_FIELDS = ["items", "ctaEnabled", "ctaLabel", "ctaUrl"];
const ORDERED_ARRAY_FIELDS = ["items"];

const {
  fetchSingleton: fetchNavigation,
  patchSingleton: patchNavigation,
  invalidateCache: invalidateNavigationCache,
} = createSingletonService({
  repository,
  cacheKey: "navigation:public",
  patchableFields: PATCHABLE_FIELDS,
  orderedArrayFields: ORDERED_ARRAY_FIELDS,
});

export { fetchNavigation, patchNavigation, invalidateNavigationCache };

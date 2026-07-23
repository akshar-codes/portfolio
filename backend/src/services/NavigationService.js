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
  fetchAdmin: fetchNavigationAdmin,
  fetchPublic: fetchNavigationPublic,
  patchSingleton: patchNavigation,
  setStatus: setNavigationStatus,
  invalidateCache: invalidateNavigationCache,
} = createSingletonService({
  repository,
  cacheKey: "navigation:public",
  patchableFields: PATCHABLE_FIELDS,
  orderedArrayFields: ORDERED_ARRAY_FIELDS,
  resourceName: "Navigation",
});

export {
  fetchNavigationAdmin,
  fetchNavigationPublic,
  patchNavigation,
  setNavigationStatus,
  invalidateNavigationCache,
};

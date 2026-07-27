import {
  getSingleton,
  findDefault,
  create,
} from "../repositories/navigationRepository.js";
import { createSingletonService } from "./SingletonService.js";
import { sanitizeNestedItems } from "../utils/ordering.js";

const repository = { getSingleton, findDefault, create };

const PATCHABLE_FIELDS = ["items", "ctaEnabled", "ctaLabel", "ctaUrl"];

// `items` is deliberately NOT passed as an `orderedArrayFields` entry
// below — that generic SingletonService path only re-sequences a flat
// array's `order` field and has no concept of a nested `children`
// array. Order normalisation (at both levels) is handled explicitly
// in `patchNavigation`/`sortNestedItems` instead.
const {
  fetchAdmin: fetchNavigationAdminRaw,
  fetchPublic: fetchNavigationPublicRaw,
  patchSingleton: patchNavigationRaw,
  setStatus: setNavigationStatusRaw,
  invalidateCache: invalidateNavigationCache,
} = createSingletonService({
  repository,
  cacheKey: "navigation:public",
  patchableFields: PATCHABLE_FIELDS,
  resourceName: "Navigation",
});

/** Sorts items by `order`, then each item's `children` by their own `order`. */
function sortNestedItems(doc) {
  if (!Array.isArray(doc?.items)) return doc;
  return {
    ...doc,
    items: [...doc.items]
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((item) => ({
        ...item,
        children: Array.isArray(item.children)
          ? [...item.children].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          : [],
      })),
  };
}

const fetchNavigationAdmin = async () => sortNestedItems(await fetchNavigationAdminRaw());
const fetchNavigationPublic = async () => sortNestedItems(await fetchNavigationPublicRaw());
const setNavigationStatus = async (status) =>
  sortNestedItems(await setNavigationStatusRaw(status));

const patchNavigation = async (updates) => {
  const sanitized = { ...updates };
  if (Array.isArray(sanitized.items)) {
    sanitized.items = sanitizeNestedItems(sanitized.items, "children");
  }
  return sortNestedItems(await patchNavigationRaw(sanitized));
};

export {
  fetchNavigationAdmin,
  fetchNavigationPublic,
  patchNavigation,
  setNavigationStatus,
  invalidateNavigationCache,
};

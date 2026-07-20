import { ServiceError } from "./ServiceError.js";
import { stripTempIds, normaliseOrder } from "../utils/ordering.js";
import cache from "../utils/cache.js";
import { CACHE_TTL_MS } from "../utils/constants.js";

/**
 * Factory that builds the standard business-logic layer for a singleton
 * CMS resource (SiteSettings, Navigation, Footer, SEO, ...).
 *
 * Wraps a `SingletonRepository` instance with:
 *   - TTL-cached public reads (mirrors aboutService/categoryService)
 *   - whole-object PATCH semantics restricted to an explicit allow-list
 *     of top-level fields (mirrors profileService)
 *   - order re-numbering + `_tempId` stripping for any array fields that
 *     represent orderable sub-lists (nav items, footer columns, ...),
 *     mirroring aboutService/resumeService's array-section handling
 *
 * @param {object} options
 * @param {{getSingleton: Function, findDefault: Function, create: Function}} options.repository
 * @param {string} options.cacheKey - cache key used for the public read
 * @param {string[]} options.patchableFields - top-level fields a PATCH may modify
 * @param {string[]} [options.orderedArrayFields] - subset of patchableFields that are
 *   arrays of orderable items (order re-numbered, `_tempId` stripped before persisting)
 * @param {object} [options.defaults] - default values used the first time the
 *   singleton document is created, so schema-required fields are always satisfied
 */
export function createSingletonService({
  repository,
  cacheKey,
  patchableFields,
  orderedArrayFields = [],
  defaults = {},
}) {
  if (!repository || typeof repository.getSingleton !== "function") {
    throw new Error(
      "createSingletonService: a valid repository (getSingleton/findDefault/create) is required.",
    );
  }
  if (!cacheKey) {
    throw new Error("createSingletonService: cacheKey is required.");
  }
  if (!Array.isArray(patchableFields) || patchableFields.length === 0) {
    throw new Error(
      "createSingletonService: patchableFields must be a non-empty array.",
    );
  }

  const invalidateCache = () => cache.del(cacheKey);

  /** Sorts any configured array fields by `order` before returning to the client. */
  const sortOrderedFields = (doc) => {
    const result = { ...doc };
    for (const field of orderedArrayFields) {
      if (Array.isArray(result[field])) {
        result[field] = [...result[field]].sort(
          (a, b) => (a.order ?? 0) - (b.order ?? 0),
        );
      }
    }
    return result;
  };

  /** Filters + normalises an incoming PATCH body against the allow-list. */
  const sanitizeUpdates = (updates) => {
    if (!updates || typeof updates !== "object" || Array.isArray(updates)) {
      throw new ServiceError(
        "Request body must be an object.",
        400,
        "SINGLETON_INVALID_BODY",
      );
    }

    const sanitized = {};
    for (const field of patchableFields) {
      if (updates[field] !== undefined) {
        sanitized[field] = updates[field];
      }
    }

    if (Object.keys(sanitized).length === 0) {
      throw new ServiceError(
        "No valid fields provided for update.",
        400,
        "SINGLETON_NO_VALID_FIELDS",
      );
    }

    for (const field of orderedArrayFields) {
      if (sanitized[field] === undefined) continue;
      if (!Array.isArray(sanitized[field])) {
        throw new ServiceError(
          `Field "${field}" must be an array.`,
          400,
          "SINGLETON_INVALID_ARRAY_FIELD",
        );
      }
      sanitized[field] = normaliseOrder(stripTempIds(sanitized[field]));
    }

    return sanitized;
  };

  /** GET — cached read, creating the singleton on first access. */
  const fetchSingleton = async () => {
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    const doc = await repository.getSingleton(defaults);
    const result = sortOrderedFields(doc);

    cache.set(cacheKey, result, CACHE_TTL_MS);
    return result;
  };

  /** PATCH — partial update restricted to `patchableFields`. */
  const patchSingleton = async (updates) => {
    const sanitized = sanitizeUpdates(updates);

    const existing = await repository.findDefault();

    let resultDoc;
    if (!existing) {
      const created = await repository.create({ ...defaults, ...sanitized });
      resultDoc = created.toObject();
    } else {
      for (const [key, value] of Object.entries(sanitized)) {
        existing[key] = value;
      }
      await existing.validate();
      await existing.save();
      resultDoc = existing.toObject();
    }

    invalidateCache();
    const result = sortOrderedFields(resultDoc);
    cache.set(cacheKey, result, CACHE_TTL_MS);
    return result;
  };

  return { fetchSingleton, patchSingleton, invalidateCache };
}

export default createSingletonService;

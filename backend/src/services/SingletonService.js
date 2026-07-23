import { ServiceError } from "./ServiceError.js";
import { stripTempIds, normaliseOrder } from "../utils/ordering.js";
import cache from "../utils/cache.js";
import {
  CACHE_TTL_MS,
  CONTENT_STATUSES,
  CONTENT_STATUS_DRAFT,
} from "../utils/constants.js";

/**
 * Factory that builds the standard business-logic layer for a singleton
 * CMS resource (SiteSettings, Navigation, Footer, SEO, Resume, ...).
 *
 * Wraps a `SingletonRepository` instance with:
 *   - a TTL-cached PUBLIC read that 404s while the resource is explicitly
 *     in "draft" status (see the note on CONTENT_STATUS_DRAFT in
 *     utils/constants.js for why this checks "=== draft" rather than
 *     "!== published")
 *   - an always-fresh ADMIN read that ignores status entirely
 *   - whole-object PATCH semantics restricted to an explicit allow-list
 *     of top-level fields (mirrors profileService), which never touches
 *     `status`
 *   - `setStatus()` for the dedicated publish/unpublish actions
 *   - order re-numbering + `_tempId` stripping for any array fields that
 *     represent orderable sub-lists (nav items, footer columns, ...)
 *
 * @param {object} options
 * @param {{getSingleton: Function, findDefault: Function, create: Function}} options.repository
 * @param {string} options.cacheKey - cache key used for the public read
 * @param {string[]} options.patchableFields - top-level fields a PATCH may modify
 * @param {string[]} [options.orderedArrayFields] - subset of patchableFields that are
 *   arrays of orderable items (order re-numbered, `_tempId` stripped before persisting)
 * @param {object} [options.defaults] - default values used the first time the
 *   singleton document is created, so schema-required fields are always satisfied
 * @param {string} [options.resourceName] - human-readable name used in error/status messages
 */
export function createSingletonService({
  repository,
  cacheKey,
  patchableFields,
  orderedArrayFields = [],
  defaults = {},
  resourceName = "Resource",
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

  const adminCacheKey = `${cacheKey}:admin`;

  const invalidateCache = () => {
    cache.del(cacheKey);
    cache.del(adminCacheKey);
  };

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

  /** ADMIN read — always returns the full document, regardless of status. */
  const fetchAdmin = async () => {
    const cached = cache.get(adminCacheKey);
    if (cached) return cached;

    const doc = await repository.getSingleton(defaults);
    const result = sortOrderedFields(doc);

    cache.set(adminCacheKey, result, CACHE_TTL_MS);
    return result;
  };

  /** PUBLIC read — 404s only while the resource is explicitly "draft". */
  const fetchPublic = async () => {
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    const doc = await repository.getSingleton(defaults);

    if (doc.status === CONTENT_STATUS_DRAFT) {
      throw new ServiceError(
        `${resourceName} is not currently published.`,
        404,
        "CONTENT_NOT_PUBLISHED",
      );
    }

    const result = sortOrderedFields(doc);
    cache.set(cacheKey, result, CACHE_TTL_MS);
    return result;
  };

  /** PATCH — partial update restricted to `patchableFields`. Never touches `status`. */
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
    return sortOrderedFields(resultDoc);
  };

  /** Sets the publish status ("draft" | "published"). */
  const setStatus = async (status) => {
    if (!CONTENT_STATUSES.includes(status)) {
      throw new ServiceError(
        `status must be one of: ${CONTENT_STATUSES.join(", ")}`,
        400,
        "SINGLETON_INVALID_STATUS",
      );
    }

    const existing = await repository.findDefault();

    let resultDoc;
    if (!existing) {
      const created = await repository.create({ ...defaults, status });
      resultDoc = created.toObject();
    } else {
      existing.status = status;
      await existing.validate();
      await existing.save();
      resultDoc = existing.toObject();
    }

    invalidateCache();
    return sortOrderedFields(resultDoc);
  };

  return { fetchAdmin, fetchPublic, patchSingleton, setStatus, invalidateCache };
}

export default createSingletonService;

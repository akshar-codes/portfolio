import { ServiceError } from "./ServiceError.js";
import { stripTempIds, normaliseOrder } from "../utils/ordering.js";
import {
  applyStatusTransition,
} from "../utils/contentStatus.js";
import cache from "../utils/cache.js";
import {
  CACHE_TTL_MS,
  CONTENT_STATUS_PUBLISHED,
  CONTENT_STATUS_DRAFT,
  CONTENT_STATUS_SCHEDULED,
  CONTENT_STATUS_UNPUBLISHED,
  CONTENT_STATUS_ARCHIVED,
} from "../constants/index.js";

/**
 * Factory that builds the standard business-logic layer for a singleton
 * CMS resource (SiteSettings, Navigation, Footer, SEO, Profile, About,
 * Resume, ...).
 *
 * Owns two concerns:
 *   1. Content editing — `patchSingleton`, restricted to `patchableFields`,
 *      and NEVER touches `status` or its timestamps.
 *   2. The publishing workflow — `publish` / `unpublish` / `archive` /
 *      `restore` / `schedule`, each a validated status transition (see
 *      utils/contentStatus.js). These are the only ways `status` ever
 *      changes on a singleton.
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

  /** PUBLIC read — 404s unless the resource is explicitly "published". */
  const fetchPublic = async () => {
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    const doc = await repository.getSingleton(defaults);

    if (doc.status !== CONTENT_STATUS_PUBLISHED) {
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

  /** PATCH — partial content update restricted to `patchableFields`. Never touches `status`. */
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

  /** Shared transition runner — loads (or lazily creates) the singleton, validates and applies the transition. */
  const transitionStatus = async (target, opts = {}) => {
    let doc = await repository.findDefault();
    if (!doc) {
      doc = await repository.create({ ...defaults });
    }

    await applyStatusTransition(doc, target, opts);

    invalidateCache();
    return sortOrderedFields(doc.toObject());
  };

  const publish = () => transitionStatus(CONTENT_STATUS_PUBLISHED);
  const unpublish = () => transitionStatus(CONTENT_STATUS_UNPUBLISHED);
  const archive = () => transitionStatus(CONTENT_STATUS_ARCHIVED);
  const restore = () => transitionStatus(CONTENT_STATUS_DRAFT);
  const schedule = (publishAt) =>
    transitionStatus(CONTENT_STATUS_SCHEDULED, { publishAt });

  return {
    fetchAdmin,
    fetchPublic,
    patchSingleton,
    publish,
    unpublish,
    archive,
    restore,
    schedule,
    invalidateCache,
  };
}

export default createSingletonService;

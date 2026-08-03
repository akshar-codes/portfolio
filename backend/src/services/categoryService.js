import mongoose from "mongoose";
import {
  aggregateCategories,
  findBySlug,
  findById,
  create as createCategoryDoc,
  deleteById,
  updateById,
  findMaxOrder,
  findManyByIds,
  bulkWrite,
  findAllForResequence,
} from "../repositories/categoryRepository.js";
import { countByCategory } from "../repositories/projectRepository.js";
import { generateSlug, normalizeName } from "../utils/slug.js";
import { ServiceError } from "./ServiceError.js";
import cache from "../utils/cache.js";
import { buildSearchFilter } from "../utils/queryHelpers.js";
import {
  CACHE_TTL_MS,
  CONTENT_STATUSES,
  CONTENT_STATUS_DRAFT,
  DEFAULT_CONTENT_STATUS,
  CATEGORY_SORT_FIELDS,
  DEFAULT_CATEGORY_SORT_FIELD,
} from "../utils/constants.js";

/* ── Cache ─────────────────────────────────────────────────────────── */

const CACHE_PREFIX = "categories:";

export function invalidateCategoryCache() {
  cache.delByPrefix(CACHE_PREFIX);
}

function buildCacheKey(scope, params = {}) {
  return `${CACHE_PREFIX}${scope}:${JSON.stringify(params)}`;
}

/* ── Pipeline helper ───────────────────────────────────────────────── */

function buildCategoryPipeline({
  publicOnly = false,
  search = "",
  status = "",
  sortBy = DEFAULT_CATEGORY_SORT_FIELD,
  sortOrder = "asc",
} = {}) {
  const matchStage = {};

  if (publicOnly) {
    matchStage.projectCount = { $gt: 0 };
    // Excludes only EXPLICIT drafts — see the note on
    // CONTENT_STATUS_DRAFT in utils/constants.js.
    matchStage.status = { $ne: CONTENT_STATUS_DRAFT };
  } else if (status && CONTENT_STATUSES.includes(status)) {
    matchStage.status = status;
  }

  if (search) {
    Object.assign(matchStage, buildSearchFilter(search, ["name"]));
  }

  const pipeline = [
    {
      $lookup: {
        from: "projects",
        localField: "_id",
        foreignField: "category",
        as: "projects",
      },
    },
    { $addFields: { projectCount: { $size: "$projects" } } },
  ];

  if (Object.keys(matchStage).length > 0) {
    pipeline.push({ $match: matchStage });
  }

  pipeline.push({ $project: { projects: 0 } });

  if (publicOnly) {
    // The public listing always follows the admin-curated display
    // order (drag-reordered via reorderCategories below), regardless
    // of any sortBy/sortOrder param — those only drive the admin
    // table's own column sorting.
    pipeline.push({ $sort: { order: 1, name: 1 } });
  } else {
    const sortField = CATEGORY_SORT_FIELDS.includes(sortBy)
      ? sortBy
      : DEFAULT_CATEGORY_SORT_FIELD;
    const direction = sortOrder === "desc" ? -1 : 1;
    pipeline.push({ $sort: { [sortField]: direction } });
  }

  return pipeline;
}

/* ── fetchPublicCategories ─────────────────────────────────────────── */

export const fetchPublicCategories = async () => {
  const cacheKey = buildCacheKey("public");
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const result = await aggregateCategories(
    buildCategoryPipeline({ publicOnly: true }),
  );

  cache.set(cacheKey, result, CACHE_TTL_MS);
  return result;
};

/* ── fetchAllCategories  (admin — searchable, filterable, sortable) ── */

export const fetchAllCategories = async ({
  search = "",
  status = "",
  sortBy = DEFAULT_CATEGORY_SORT_FIELD,
  sortOrder = "asc",
} = {}) => {
  const params = { search, status, sortBy, sortOrder };
  const cacheKey = buildCacheKey("admin", params);
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const result = await aggregateCategories(buildCategoryPipeline(params));

  cache.set(cacheKey, result, CACHE_TTL_MS);
  return result;
};

/* ── createCategory ────────────────────────────────────────────────── */

export const createCategory = async (rawName, status = DEFAULT_CONTENT_STATUS) => {
  const name = normalizeName(rawName);
  const slug = generateSlug(name);

  if (!slug) {
    throw new ServiceError(
      "Category name is invalid — it must contain at least one alphanumeric character.",
      400,
      "CATEGORY_INVALID_NAME",
    );
  }

  const existing = await findBySlug(slug);
  if (existing) {
    throw new ServiceError(
      `Category "${existing.name}" already exists.`,
      409,
      "CATEGORY_DUPLICATE",
    );
  }

  const safeStatus = CONTENT_STATUSES.includes(status)
    ? status
    : DEFAULT_CONTENT_STATUS;

  // New categories are appended to the end of the display order,
  // matching addProject's `findMaxOrder() + 1` convention.
  const maxOrderDoc = await findMaxOrder();
  const nextOrder = maxOrderDoc ? (maxOrderDoc.order ?? 0) + 1 : 0;

  const category = await createCategoryDoc({
    name,
    slug,
    status: safeStatus,
    order: nextOrder,
  });
  invalidateCategoryCache();
  return category;
};

/* ── updateCategory  (rename and/or change publish status) ──────────── */

export const updateCategory = async (id, { name, status } = {}) => {
  const category = await findById(id);
  if (!category) {
    throw new ServiceError("Category not found.", 404, "CATEGORY_NOT_FOUND");
  }

  const updates = {};

  if (name !== undefined) {
    const normalizedName = normalizeName(name);
    const slug = generateSlug(normalizedName);

    if (!slug) {
      throw new ServiceError(
        "Category name is invalid — it must contain at least one alphanumeric character.",
        400,
        "CATEGORY_INVALID_NAME",
      );
    }

    const existingSlug = await findBySlug(slug);
    if (existingSlug && existingSlug._id.toString() !== id) {
      throw new ServiceError(
        `Category "${existingSlug.name}" already exists.`,
        409,
        "CATEGORY_DUPLICATE",
      );
    }

    updates.name = normalizedName;
    updates.slug = slug;
  }

  if (status !== undefined) {
    if (!CONTENT_STATUSES.includes(status)) {
      throw new ServiceError(
        `status must be one of: ${CONTENT_STATUSES.join(", ")}`,
        400,
        "CATEGORY_INVALID_STATUS",
      );
    }
    updates.status = status;
  }

  if (Object.keys(updates).length === 0) {
    throw new ServiceError(
      "No valid fields provided for update.",
      400,
      "CATEGORY_NO_VALID_FIELDS",
    );
  }

  const updated = await updateById(id, updates);
  invalidateCategoryCache();
  return updated;
};

/* ── resequenceCategories — renumber order 0..N after a delete ──────── */

async function resequenceCategories() {
  const categories = await findAllForResequence();

  const ops = categories.map((c, idx) => ({
    updateOne: {
      filter: { _id: c._id },
      update: { $set: { order: idx } },
    },
  }));

  if (ops.length) {
    await bulkWrite(ops);
  }
}

/* ── removeCategory ────────────────────────────────────────────────── */

export const removeCategory = async (id) => {
  const category = await findById(id);
  if (!category) {
    throw new ServiceError("Category not found.", 404, "CATEGORY_NOT_FOUND");
  }

  const projectCount = await countByCategory(id);
  if (projectCount > 0) {
    throw new ServiceError(
      `Cannot delete — ${projectCount} project${projectCount === 1 ? "" : "s"} use this category. Reassign or delete those projects first.`,
      409,
      "CATEGORY_IN_USE",
    );
  }

  await deleteById(id);
  await resequenceCategories();
  invalidateCategoryCache();
};

/* ── reorderCategories  (drag-reorder from the admin panel) ─────────── */

export const reorderCategories = async (orderedIds) => {
  if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
    throw new ServiceError(
      "orderedIds must be a non-empty array of category IDs.",
      400,
      "CATEGORY_REORDER_INVALID",
    );
  }

  const invalidIds = orderedIds.filter(
    (id) => !mongoose.Types.ObjectId.isValid(id),
  );
  if (invalidIds.length) {
    throw new ServiceError(
      `Invalid category ID(s): ${invalidIds.join(", ")}`,
      400,
      "CATEGORY_REORDER_INVALID_ID",
    );
  }

  const found = await findManyByIds(orderedIds);

  if (found.length !== orderedIds.length) {
    throw new ServiceError(
      "One or more category IDs were not found.",
      404,
      "CATEGORY_REORDER_NOT_FOUND",
    );
  }

  const ops = orderedIds.map((id, idx) => ({
    updateOne: {
      filter: { _id: id },
      update: { $set: { order: idx } },
    },
  }));

  await bulkWrite(ops);
  invalidateCategoryCache();
};

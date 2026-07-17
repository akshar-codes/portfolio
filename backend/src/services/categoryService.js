import {
  aggregateCategories,
  findBySlug,
  findById,
  create as createCategoryDoc,
  deleteById,
} from "../repositories/categoryRepository.js";
import { countByCategory } from "../repositories/projectRepository.js";
import { generateSlug, normalizeName } from "../utils/slug.js";
import { ServiceError } from "./ServiceError.js";
import cache from "../utils/cache.js";
import { CACHE_TTL_MS } from "../utils/constants.js";

/* ── Cache ─────────────────────────────────────────────────────────── */

export const CATEGORY_CACHE_PUBLIC = "categories:public";
export const CATEGORY_CACHE_ADMIN = "categories:admin";

export function invalidateCategoryCache() {
  cache.del(CATEGORY_CACHE_PUBLIC);
  cache.del(CATEGORY_CACHE_ADMIN);
}

/* ── Pipeline helper ───────────────────────────────────────────────── */

function buildCategoryPipeline({ publicOnly = false } = {}) {
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
    { $project: { projects: 0 } },
    { $sort: { name: 1 } },
  ];

  if (publicOnly) {
    pipeline.splice(2, 0, { $match: { projectCount: { $gt: 0 } } });
  }

  return pipeline;
}

/* ── fetchPublicCategories ─────────────────────────────────────────── */

export const fetchPublicCategories = async () => {
  const cached = cache.get(CATEGORY_CACHE_PUBLIC);
  if (cached) return cached;

  const result = await aggregateCategories(
    buildCategoryPipeline({ publicOnly: true }),
  );

  cache.set(CATEGORY_CACHE_PUBLIC, result, CACHE_TTL_MS);
  return result;
};

/* ── fetchAllCategories ────────────────────────────────────────────── */

export const fetchAllCategories = async () => {
  const cached = cache.get(CATEGORY_CACHE_ADMIN);
  if (cached) return cached;

  const result = await aggregateCategories(buildCategoryPipeline());

  cache.set(CATEGORY_CACHE_ADMIN, result, CACHE_TTL_MS);
  return result;
};

/* ── createCategory ────────────────────────────────────────────────── */

export const createCategory = async (rawName) => {
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

  const category = await createCategoryDoc({ name, slug });
  invalidateCategoryCache();
  return category;
};

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
  invalidateCategoryCache();
};

import Category from "../models/Category.js";
import Project from "../models/Project.js";
import { generateSlug, normalizeName } from "../utils/slug.js";
import { ServiceError } from "./errors.js";
import cache from "../utils/cache.js";

/* ------------------------------------------------------------------ *
 * Cache
 * ------------------------------------------------------------------ */

const CACHE_TTL_MS = 60_000;
export const CATEGORY_CACHE_PUBLIC = "categories:public";
export const CATEGORY_CACHE_ADMIN = "categories:admin";

/**
 * Invalidate both category cache keys.
 * Called by categoryService itself and also by projectService when
 * a project is added/removed (which changes per-category project counts).
 */
export function invalidateCategoryCache() {
  cache.del(CATEGORY_CACHE_PUBLIC);
  cache.del(CATEGORY_CACHE_ADMIN);
}

/* ------------------------------------------------------------------ *
 * Shared aggregation pipeline helper
 * ------------------------------------------------------------------ */

/**
 * Returns a pipeline that joins projects onto categories and adds a
 * `projectCount` field.  Optionally filters to only categories with
 * at least one project.
 */
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
    {
      $addFields: { projectCount: { $size: "$projects" } },
    },
    {
      // Exclude the full project array — we only needed it for the count
      $project: { projects: 0 },
    },
    { $sort: { name: 1 } },
  ];

  if (publicOnly) {
    // Insert match after addFields (index 2)
    pipeline.splice(2, 0, { $match: { projectCount: { $gt: 0 } } });
  }

  return pipeline;
}

/* ------------------------------------------------------------------ *
 * fetchPublicCategories
 * ------------------------------------------------------------------ */

/**
 * Returns only categories that have at least one project.
 * Used by the public Portfolio page — hides empty/unused categories.
 */
export const fetchPublicCategories = async () => {
  const cached = cache.get(CATEGORY_CACHE_PUBLIC);
  if (cached) return cached;

  const result = await Category.aggregate(
    buildCategoryPipeline({ publicOnly: true }),
  );

  cache.set(CATEGORY_CACHE_PUBLIC, result, CACHE_TTL_MS);
  return result;
};

/* ------------------------------------------------------------------ *
 * fetchAllCategories
 * ------------------------------------------------------------------ */

/**
 * Returns every category (including unused ones) with project counts.
 * Used by the admin dashboard.
 */
export const fetchAllCategories = async () => {
  const cached = cache.get(CATEGORY_CACHE_ADMIN);
  if (cached) return cached;

  const result = await Category.aggregate(buildCategoryPipeline());

  cache.set(CATEGORY_CACHE_ADMIN, result, CACHE_TTL_MS);
  return result;
};

/* ------------------------------------------------------------------ *
 * createCategory
 * ------------------------------------------------------------------ */

/**
 * Normalises the name, generates a slug, checks for duplicates, then
 * inserts the Category document.
 *
 * Duplicate detection uses the slug so that "React", "react", and
 * " React " are all treated as the same category.
 */
export const createCategory = async (rawName) => {
  const name = normalizeName(rawName);
  const slug = generateSlug(name);

  if (!slug) {
    throw new ServiceError(
      "Category name is invalid — it must contain at least one alphanumeric character.",
      400,
    );
  }

  const existing = await Category.findOne({ slug }).lean();
  if (existing) {
    throw new ServiceError(`Category "${existing.name}" already exists.`, 409);
  }

  const category = await Category.create({ name, slug });
  invalidateCategoryCache();
  return category;
};

/* ------------------------------------------------------------------ *
 * removeCategory
 * ------------------------------------------------------------------ */

/**
 * Deletes a category only when no projects reference it.
 * Returns 404 if not found, 409 if in use.
 */
export const removeCategory = async (id) => {
  const category = await Category.findById(id).lean();
  if (!category) {
    throw new ServiceError("Category not found.", 404);
  }

  const projectCount = await Project.countDocuments({ category: id });
  if (projectCount > 0) {
    throw new ServiceError(
      `Cannot delete — ${projectCount} project${projectCount === 1 ? "" : "s"} use this category. Reassign or delete those projects first.`,
      409,
    );
  }

  await Category.findByIdAndDelete(id);
  invalidateCategoryCache();
};

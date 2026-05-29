import mongoose from "mongoose";
import Project from "../models/Project.js";
import Category from "../models/Category.js";
import { cloudinary, uploadToCloudinary } from "../utils/cloudinary.js";
import { ServiceError } from "./errors.js";
import cache from "../utils/cache.js";
import { invalidateCategoryCache } from "./categoryService.js";

/* ── Cache ─────────────────────────────────────────────────────────── */

const CACHE_TTL_MS = 60_000;
const CACHE_PREFIX = "projects:";

function buildCacheKey(page, limit, category) {
  return `${CACHE_PREFIX}page=${page}:limit=${limit}:cat=${category}`;
}

export function invalidateProjectsCache() {
  cache.delByPrefix(CACHE_PREFIX);
}

/* ── Category resolution ───────────────────────────────────────────── */

async function resolveCategoryFilter(category) {
  if (!category || category === "All") return {};

  let cat;
  if (mongoose.Types.ObjectId.isValid(category)) {
    cat = await Category.findById(category).lean();
  } else {
    cat = await Category.findOne({ slug: category.toLowerCase() }).lean();
  }

  return cat ? { category: cat._id } : null;
}

/* ── fetchAllProjects ──────────────────────────────────────────────── */

export const fetchAllProjects = async ({
  page = 1,
  limit = 9,
  category = "",
} = {}) => {
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(Math.max(1, limit), 50);
  const skip = (safePage - 1) * safeLimit;

  const cacheKey = buildCacheKey(safePage, safeLimit, category);
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const filter = await resolveCategoryFilter(category);

  if (filter === null) {
    return {
      projects: [],
      total: 0,
      page: safePage,
      limit: safeLimit,
      totalPages: 0,
    };
  }

  const [projects, total] = await Promise.all([
    Project.find(filter)
      .select("-image.public_id")
      .populate("category", "name slug")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .lean(),
    Project.countDocuments(filter),
  ]);

  const result = {
    projects,
    total,
    page: safePage,
    limit: safeLimit,
    totalPages: Math.ceil(total / safeLimit),
  };
  cache.set(cacheKey, result, CACHE_TTL_MS);
  return result;
};

/* ── addProject ────────────────────────────────────────────────────── */

export const addProject = async ({
  title,
  description,
  categoryId,
  projectUrl,
  file,
}) => {
  if (!file) {
    throw new ServiceError("Image is required.", 400, "PROJECT_IMAGE_REQUIRED");
  }

  const category = await Category.findById(categoryId).lean();
  if (!category) {
    throw new ServiceError(
      "Invalid category — not found.",
      400,
      "PROJECT_INVALID_CATEGORY",
    );
  }

  const uploadResult = await uploadToCloudinary(file);

  const project = await Project.create({
    title,
    description,
    category: category._id,
    projectUrl,
    image: {
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
    },
  });

  invalidateProjectsCache();
  invalidateCategoryCache();
  return project;
};

/* ── removeProject ─────────────────────────────────────────────────── */

export const removeProject = async (id) => {
  const project = await Project.findById(id);
  if (!project) {
    throw new ServiceError("Project not found.", 404, "PROJECT_NOT_FOUND");
  }

  if (project.image?.public_id) {
    await cloudinary.uploader.destroy(project.image.public_id);
  }

  await project.deleteOne();
  invalidateProjectsCache();
  invalidateCategoryCache();
};

import Project from "../models/Project.js";
import { cloudinary, uploadToCloudinary } from "../utils/cloudinary.js";
import { ServiceError } from "./errors.js";
import cache from "../utils/cache.js";

/* ------------------------------------------------------------------ *
 * Cache configuration
 * ------------------------------------------------------------------ */

const CACHE_TTL_MS = 60_000; // 60 seconds
const CACHE_PREFIX = "projects:";

function buildCacheKey(page, limit, category) {
  return `${CACHE_PREFIX}page=${page}:limit=${limit}:category=${category}`;
}

export function invalidateProjectsCache() {
  cache.delByPrefix(CACHE_PREFIX);
}

/* ------------------------------------------------------------------ *
 * fetchAllProjects  (public)
 * ------------------------------------------------------------------ */
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

  const filter = category && category !== "All" ? { category } : {};

  const [projects, total] = await Promise.all([
    Project.find(filter)
      .select("-image.public_id") // never expose the Cloudinary public_id publicly
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .lean(), // plain JS objects — faster serialization, lower memory
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

/* ------------------------------------------------------------------ *
 * addProject
 * ------------------------------------------------------------------ */
export const addProject = async ({
  title,
  description,
  category,
  projectUrl,
  file,
}) => {
  if (!file) throw new ServiceError("Image is required.", 400);

  const result = await uploadToCloudinary(file);

  const project = await Project.create({
    title,
    description,
    category,
    projectUrl,
    image: {
      url: result.secure_url,
      public_id: result.public_id,
    },
  });

  invalidateProjectsCache();
  return project;
};

/* ------------------------------------------------------------------ *
 * removeProject
 * ------------------------------------------------------------------ */
export const removeProject = async (id) => {
  const project = await Project.findById(id);

  if (!project) throw new ServiceError("Project not found.", 404);

  if (project.image?.public_id) {
    await cloudinary.uploader.destroy(project.image.public_id);
  }

  await project.deleteOne();
  invalidateProjectsCache();
};

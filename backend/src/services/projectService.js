import mongoose from "mongoose";
import {
  findPaginated,
  countAll,
  findByIdPublic,
  findById,
  findMaxOrder,
  create,
  findManyByIds,
  bulkWrite,
  findAllForResequence,
} from "../repositories/projectRepository.js";
import {
  findById as findCategoryById,
  findBySlug as findCategoryBySlug,
} from "../repositories/categoryRepository.js";
import {
  cloudinaryFolder,
  uploadToCloudinary,
  destroyManyFromCloudinary,
} from "../config/cloudinary.js";
import { ServiceError } from "./ServiceError.js";
import cache from "../utils/cache.js";
import { invalidateCategoryCache } from "./categoryService.js";
import logger from "../utils/logger.js";
import {
  CACHE_TTL_MS,
  DEFAULT_PROJECTS_PAGE_SIZE,
  MAX_PAGE_SIZE,
  MAX_GALLERY_IMAGES,
} from "../utils/constants.js";

/* ================================================================== *
 * Cache helpers
 * ================================================================== */

const CACHE_PREFIX = "projects:";

function buildCacheKey(page, limit, category) {
  return `${CACHE_PREFIX}page=${page}:limit=${limit}:cat=${category}`;
}

export function invalidateProjectsCache() {
  cache.delByPrefix(CACHE_PREFIX);
}

async function resequenceProjects(filter = {}) {
  const projects = await findAllForResequence(filter);

  const ops = projects.map((p, idx) => ({
    updateOne: {
      filter: { _id: p._id },
      update: { $set: { order: idx } },
    },
  }));

  if (ops.length) {
    await bulkWrite(ops);
  }
}

/* ================================================================== *
 * Field-parsing helpers
 * ================================================================== */

function parseGroupedField(value) {
  if (Array.isArray(value)) {
    if (value.length === 0) return [];
    if (
      typeof value[0] === "object" &&
      value[0] !== null &&
      "group" in value[0]
    ) {
      return value;
    }
    const items = value.filter((v) => typeof v === "string" && v.trim());
    return items.length ? [{ group: "General", items }] : [];
  }

  if (typeof value !== "string" || value.trim() === "") return [];

  try {
    const parsed = JSON.parse(value.trim());
    if (!Array.isArray(parsed)) return [];
    if (parsed.length === 0) return [];

    if (
      typeof parsed[0] === "object" &&
      parsed[0] !== null &&
      "group" in parsed[0]
    ) {
      return parsed.map((g) => ({
        group: String(g.group ?? "General").trim(),
        items: Array.isArray(g.items)
          ? g.items.filter((i) => typeof i === "string" && i.trim())
          : [],
      }));
    }

    const items = parsed.filter((v) => typeof v === "string" && v.trim());
    return items.length ? [{ group: "General", items }] : [];
  } catch {
    return [];
  }
}

function parseArrayField(value) {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string" || value.trim() === "") return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/* ================================================================== *
 * Category resolution helper
 * ================================================================== */

async function resolveCategoryFilter(category) {
  if (!category || category === "All") return {};

  let cat;
  if (mongoose.Types.ObjectId.isValid(category)) {
    cat = await findCategoryById(category);
  } else {
    cat = await findCategoryBySlug(category.toLowerCase());
  }

  return cat ? { category: cat._id } : null;
}

/* ================================================================== *
 * fetchAllProjects  (public)
 * ================================================================== */

export const fetchAllProjects = async ({
  page = 1,
  limit = DEFAULT_PROJECTS_PAGE_SIZE,
  category = "",
} = {}) => {
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(Math.max(1, limit), MAX_PAGE_SIZE);
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
    findPaginated({ filter, skip, limit: safeLimit }),
    countAll(filter),
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

/* ================================================================== *
 * fetchProjectById  (public)
 * ================================================================== */

export const fetchProjectById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ServiceError("Invalid project ID.", 400, "PROJECT_INVALID_ID");
  }

  const project = await findByIdPublic(id);

  if (!project) {
    throw new ServiceError("Project not found.", 404, "PROJECT_NOT_FOUND");
  }

  if (project.gallery?.length) {
    project.gallery = [...project.gallery].sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0),
    );
  }

  return project;
};

/* ================================================================== *
 * addProject
 * ================================================================== */

export const addProject = async ({
  title,
  description,
  categoryId,
  projectUrl,
  liveUrl,
  githubUrl,
  technologies,
  features,
  challenge,
  solution,
  file,
  bannerFile,
  galleryFiles,
}) => {
  if (!file) {
    throw new ServiceError("Image is required.", 400, "PROJECT_IMAGE_REQUIRED");
  }

  const category = await findCategoryById(categoryId);
  if (!category) {
    throw new ServiceError(
      "Invalid category — not found.",
      400,
      "PROJECT_INVALID_CATEGORY",
    );
  }

  const uploadedPublicIds = [];

  try {
    // Thumbnail (required) + optional banner — concurrent
    const thumbFolder = cloudinaryFolder("portfolio/projects");
    const bannerFolder = cloudinaryFolder("portfolio/projects/banners");

    const [thumbResult, bannerResult] = await Promise.all([
      uploadToCloudinary(file, thumbFolder).then((r) => {
        uploadedPublicIds.push(r.public_id);
        return r;
      }),
      bannerFile?.buffer
        ? uploadToCloudinary(bannerFile, bannerFolder).then((r) => {
            uploadedPublicIds.push(r.public_id);
            return r;
          })
        : Promise.resolve(null),
    ]);

    // Gallery — concurrent (up to MAX_GALLERY_IMAGES images)
    const galleryFolder = cloudinaryFolder("portfolio/projects/gallery");
    const validGallery = (galleryFiles ?? []).filter((gf) => gf?.buffer);
    const galleryResults = await Promise.all(
      validGallery.map((gf) =>
        uploadToCloudinary(gf, galleryFolder).then((r) => {
          uploadedPublicIds.push(r.public_id);
          return r;
        }),
      ),
    );

    const maxOrderDoc = await findMaxOrder();
    const nextOrder = maxOrderDoc ? (maxOrderDoc.order ?? 0) + 1 : 0;

    const project = await create({
      title,
      description,
      category: category._id,
      projectUrl: liveUrl || projectUrl || "",
      liveUrl: liveUrl || projectUrl || "",
      githubUrl: githubUrl || "",
      technologies: parseGroupedField(technologies),
      features: parseArrayField(features),
      challenge: challenge || "",
      solution: solution || "",
      order: nextOrder,
      image: {
        url: thumbResult.secure_url,
        public_id: thumbResult.public_id,
      },
      bannerImage: bannerResult
        ? { url: bannerResult.secure_url, public_id: bannerResult.public_id }
        : { url: "", public_id: "" },
      gallery: galleryResults.map((r, i) => ({
        url: r.secure_url,
        public_id: r.public_id,
        order: i,
      })),
    });

    // DB succeeded — uploads are no longer "pending"
    invalidateProjectsCache();
    invalidateCategoryCache();
    return project;
  } catch (err) {
    if (uploadedPublicIds.length > 0) {
      logger.warn(
        "[addProject] Rolling back Cloudinary uploads after failure",
        {
          count: uploadedPublicIds.length,
          publicIds: uploadedPublicIds,
          error: err.message,
        },
      );
      await destroyManyFromCloudinary(uploadedPublicIds, logger);
    }

    // Re-throw so the controller returns the correct error response
    throw err;
  }
};

/* ================================================================== *
 * updateProject
 * ================================================================== */

export const updateProject = async (id, updates) => {
  const project = await findById(id);
  if (!project) {
    throw new ServiceError("Project not found.", 404, "PROJECT_NOT_FOUND");
  }

  /* ---------------------------------------------------------------- *
   * Scalar fields — direct assignment, no Cloudinary involved
   * ---------------------------------------------------------------- */
  const SCALAR_UPDATABLE = [
    "title",
    "description",
    "projectUrl",
    "liveUrl",
    "githubUrl",
    "challenge",
    "solution",
  ];
  for (const key of SCALAR_UPDATABLE) {
    if (updates[key] !== undefined) project[key] = updates[key];
  }

  if (updates.technologies !== undefined) {
    project.technologies = parseGroupedField(updates.technologies);
  }
  if (updates.features !== undefined) {
    project.features = parseArrayField(updates.features);
  }

  if (updates.categoryId) {
    const category = await findCategoryById(updates.categoryId);
    if (!category) {
      throw new ServiceError(
        "Invalid category — not found.",
        400,
        "PROJECT_INVALID_CATEGORY",
      );
    }
    project.category = category._id;
  }

  // Track { newPublicId, oldPublicId } pairs for post-save cleanup
  const pendingDestroys = [];

  // — Thumbnail replacement
  if (updates.file?.buffer) {
    const folder = cloudinaryFolder("portfolio/projects");
    const result = await uploadToCloudinary(updates.file, folder);

    const oldPublicId = project.image?.public_id || null;
    project.image = { url: result.secure_url, public_id: result.public_id };
    pendingDestroys.push(oldPublicId);
  }

  // — Banner replacement
  if (updates.bannerFile?.buffer) {
    const folder = cloudinaryFolder("portfolio/projects/banners");
    const result = await uploadToCloudinary(updates.bannerFile, folder);

    const oldPublicId = project.bannerImage?.public_id || null;
    project.bannerImage = {
      url: result.secure_url,
      public_id: result.public_id,
    };
    pendingDestroys.push(oldPublicId);
  }

  // — New gallery images appended
  if (Array.isArray(updates.galleryFiles) && updates.galleryFiles.length > 0) {
    const folder = cloudinaryFolder("portfolio/projects/gallery");
    const currentCount = project.gallery?.length ?? 0;
    const toUpload = updates.galleryFiles.filter(
      (gf, i) => gf?.buffer && currentCount + i < MAX_GALLERY_IMAGES,
    );

    // Upload new gallery images concurrently
    const galleryResults = await Promise.all(
      toUpload.map((gf) => uploadToCloudinary(gf, folder)),
    );

    galleryResults.forEach((result, i) => {
      project.gallery.push({
        url: result.secure_url,
        public_id: result.public_id,
        order: currentCount + i,
      });
    });
  }

  /* ---------------------------------------------------------------- *
   * Gallery reorder (in-memory only, no Cloudinary involved)
   * ---------------------------------------------------------------- */
  if (updates.galleryOrder !== undefined) {
    const orderedIds = JSON.parse(updates.galleryOrder || "[]");
    const galleryMap = new Map(
      project.gallery.map((g) => [g._id.toString(), g]),
    );
    const reordered = orderedIds
      .map((gid, idx) => {
        const item = galleryMap.get(gid);
        if (item) return { ...item.toObject(), order: idx };
        return null;
      })
      .filter(Boolean);
    project.gallery = reordered;
  }

  const galleryPublicIdsToDestroy = [];

  if (updates.deleteGalleryIds) {
    const toDelete = JSON.parse(updates.deleteGalleryIds || "[]");

    // Collect public_ids of items being removed
    for (const gid of toDelete) {
      const item = project.gallery.find((g) => g._id.toString() === gid);
      if (item?.public_id) {
        galleryPublicIdsToDestroy.push(item.public_id);
      }
    }

    // Remove from the document and re-number order
    project.gallery = project.gallery
      .filter((g) => !toDelete.includes(g._id.toString()))
      .map((g, i) => ({
        ...(g.toObject ? g.toObject() : g),
        order: i,
      }));
  }

  try {
    await project.save();
  } catch (saveErr) {
    const newlyUploadedIds = [
      updates.file?.buffer ? project.image?.public_id : null,
      updates.bannerFile?.buffer ? project.bannerImage?.public_id : null,
      ...(Array.isArray(updates.galleryFiles) && updates.galleryFiles.length > 0
        ? project.gallery
            .slice(-updates.galleryFiles.length)
            .map((g) => g.public_id)
        : []),
    ].filter(Boolean);

    if (newlyUploadedIds.length > 0) {
      logger.warn(
        "[updateProject] Rolling back new Cloudinary uploads after DB save failure",
        {
          count: newlyUploadedIds.length,
          publicIds: newlyUploadedIds,
          error: saveErr.message,
        },
      );
      await destroyManyFromCloudinary(newlyUploadedIds, logger);
    }

    throw saveErr;
  }

  if (pendingDestroys.length > 0) {
    await destroyManyFromCloudinary(pendingDestroys, logger);
  }
  if (galleryPublicIdsToDestroy.length > 0) {
    await destroyManyFromCloudinary(galleryPublicIdsToDestroy, logger);
  }

  invalidateProjectsCache();
  return project;
};

/* ================================================================== *
 * removeProject
 * ================================================================== */

export const removeProject = async (id) => {
  const project = await findById(id);
  if (!project) {
    throw new ServiceError("Project not found.", 404, "PROJECT_NOT_FOUND");
  }

  // Delete from MongoDB first — the source of truth
  await project.deleteOne();
  await resequenceProjects();

  // Best-effort Cloudinary cleanup AFTER the DB record is gone
  const publicIds = [
    project.image?.public_id,
    project.bannerImage?.public_id,
    ...(project.gallery ?? []).map((g) => g.public_id),
  ];
  await destroyManyFromCloudinary(publicIds, logger);

  invalidateProjectsCache();
  invalidateCategoryCache();
};

/* ================================================================== *
 * reorderProjects
 * ================================================================== */

export const reorderProjects = async (orderedIds) => {
  if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
    throw new ServiceError(
      "orderedIds must be a non-empty array of project IDs.",
      400,
      "PROJECT_REORDER_INVALID",
    );
  }

  const invalidIds = orderedIds.filter(
    (id) => !mongoose.Types.ObjectId.isValid(id),
  );
  if (invalidIds.length) {
    throw new ServiceError(
      `Invalid project ID(s): ${invalidIds.join(", ")}`,
      400,
      "PROJECT_REORDER_INVALID_ID",
    );
  }

  const found = await findManyByIds(orderedIds);

  if (found.length !== orderedIds.length) {
    throw new ServiceError(
      "One or more project IDs were not found.",
      404,
      "PROJECT_REORDER_NOT_FOUND",
    );
  }

  const ops = orderedIds.map((id, idx) => ({
    updateOne: {
      filter: { _id: id },
      update: { $set: { order: idx } },
    },
  }));

  await bulkWrite(ops);
  invalidateProjectsCache();
};

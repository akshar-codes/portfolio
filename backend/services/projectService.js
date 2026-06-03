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

async function resequenceProjects(filter = {}) {
  const projects = await Project.find(filter)
    .select("_id order")
    .sort({ order: 1 })
    .lean();

  const ops = projects.map((p, idx) => ({
    updateOne: {
      filter: { _id: p._id },
      update: { $set: { order: idx } },
    },
  }));

  if (ops.length) {
    await Project.bulkWrite(ops, { ordered: false });
  }
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
      .select("-image.public_id -bannerImage.public_id -gallery.public_id")
      .populate("category", "name slug")
      .sort({ order: 1, createdAt: -1 })
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

/* ── fetchProjectById ──────────────────────────────────────────────── */

export const fetchProjectById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ServiceError("Invalid project ID.", 400, "PROJECT_INVALID_ID");
  }

  const project = await Project.findById(id)
    .select("-image.public_id -bannerImage.public_id -gallery.public_id")
    .populate("category", "name slug")
    .lean();

  if (!project) {
    throw new ServiceError("Project not found.", 404, "PROJECT_NOT_FOUND");
  }

  // Sort gallery by order
  if (project.gallery?.length) {
    project.gallery = [...project.gallery].sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0),
    );
  }

  return project;
};

/* ── addProject ────────────────────────────────────────────────────── */

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
  file, // thumbnail (required)
  bannerFile, // banner image (optional)
  galleryFiles, // array of gallery images (optional)
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

  // Upload thumbnail
  const uploadResult = await uploadToCloudinary(file, "portfolio/projects");

  // Upload banner if provided
  let bannerImage = { url: "", public_id: "" };
  if (bannerFile?.buffer) {
    const bannerResult = await uploadToCloudinary(
      bannerFile,
      "portfolio/projects/banners",
    );
    bannerImage = {
      url: bannerResult.secure_url,
      public_id: bannerResult.public_id,
    };
  }

  // Upload gallery images if provided
  const gallery = [];
  if (Array.isArray(galleryFiles) && galleryFiles.length > 0) {
    for (let i = 0; i < galleryFiles.length; i++) {
      const gf = galleryFiles[i];
      if (gf?.buffer) {
        const gResult = await uploadToCloudinary(
          gf,
          "portfolio/projects/gallery",
        );
        gallery.push({
          url: gResult.secure_url,
          public_id: gResult.public_id,
          order: i,
        });
      }
    }
  }

  // Assign next order value
  const maxOrderDoc = await Project.findOne()
    .sort({ order: -1 })
    .select("order")
    .lean();
  const nextOrder = maxOrderDoc ? (maxOrderDoc.order ?? 0) + 1 : 0;

  // Parse arrays from form data strings if needed
  const parsedTechnologies = Array.isArray(technologies)
    ? technologies
    : typeof technologies === "string"
      ? JSON.parse(technologies || "[]")
      : [];

  const parsedFeatures = Array.isArray(features)
    ? features
    : typeof features === "string"
      ? JSON.parse(features || "[]")
      : [];

  const project = await Project.create({
    title,
    description,
    category: category._id,
    projectUrl: liveUrl || projectUrl || "",
    liveUrl: liveUrl || projectUrl || "",
    githubUrl: githubUrl || "",
    technologies: parsedTechnologies,
    features: parsedFeatures,
    challenge: challenge || "",
    solution: solution || "",
    order: nextOrder,
    image: {
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
    },
    bannerImage,
    gallery,
  });

  invalidateProjectsCache();
  invalidateCategoryCache();
  return project;
};

/* ── updateProject ─────────────────────────────────────────────────── */

export const updateProject = async (id, updates) => {
  const project = await Project.findById(id);
  if (!project) {
    throw new ServiceError("Project not found.", 404, "PROJECT_NOT_FOUND");
  }

  const UPDATABLE = [
    "title",
    "description",
    "projectUrl",
    "liveUrl",
    "githubUrl",
    "technologies",
    "features",
    "challenge",
    "solution",
  ];

  for (const key of UPDATABLE) {
    if (updates[key] !== undefined) {
      project[key] = updates[key];
    }
  }

  // Handle category update
  if (updates.categoryId) {
    const category = await Category.findById(updates.categoryId).lean();
    if (!category) {
      throw new ServiceError(
        "Invalid category — not found.",
        400,
        "PROJECT_INVALID_CATEGORY",
      );
    }
    project.category = category._id;
  }

  // Handle new thumbnail
  if (updates.file?.buffer) {
    if (project.image?.public_id) {
      await cloudinary.uploader.destroy(project.image.public_id);
    }
    const result = await uploadToCloudinary(updates.file, "portfolio/projects");
    project.image = { url: result.secure_url, public_id: result.public_id };
  }

  // Handle new banner
  if (updates.bannerFile?.buffer) {
    if (project.bannerImage?.public_id) {
      await cloudinary.uploader.destroy(project.bannerImage.public_id);
    }
    const result = await uploadToCloudinary(
      updates.bannerFile,
      "portfolio/projects/banners",
    );
    project.bannerImage = {
      url: result.secure_url,
      public_id: result.public_id,
    };
  }

  // Handle gallery additions
  if (Array.isArray(updates.galleryFiles) && updates.galleryFiles.length > 0) {
    const currentCount = project.gallery?.length ?? 0;
    for (let i = 0; i < updates.galleryFiles.length; i++) {
      const gf = updates.galleryFiles[i];
      if (gf?.buffer && currentCount + i < 10) {
        const result = await uploadToCloudinary(
          gf,
          "portfolio/projects/gallery",
        );
        project.gallery.push({
          url: result.secure_url,
          public_id: result.public_id,
          order: currentCount + i,
        });
      }
    }
  }

  // Handle gallery reorder / removal
  if (updates.galleryOrder !== undefined) {
    const orderedIds = JSON.parse(updates.galleryOrder || "[]");
    const galleryMap = new Map(
      project.gallery.map((g) => [g._id.toString(), g]),
    );
    const reordered = orderedIds
      .map((id, idx) => {
        const item = galleryMap.get(id);
        if (item) return { ...item.toObject(), order: idx };
        return null;
      })
      .filter(Boolean);
    project.gallery = reordered;
  }

  // Handle gallery image deletions
  if (updates.deleteGalleryIds) {
    const toDelete = JSON.parse(updates.deleteGalleryIds || "[]");
    for (const gid of toDelete) {
      const item = project.gallery.find((g) => g._id.toString() === gid);
      if (item?.public_id) {
        await cloudinary.uploader.destroy(item.public_id);
      }
    }
    project.gallery = project.gallery.filter(
      (g) => !toDelete.includes(g._id.toString()),
    );
    // Re-sequence gallery order
    project.gallery = project.gallery.map((g, i) => ({
      ...(g.toObject ? g.toObject() : g),
      order: i,
    }));
  }

  await project.save();
  invalidateProjectsCache();
  return project;
};

/* ── removeProject ─────────────────────────────────────────────────── */

export const removeProject = async (id) => {
  const project = await Project.findById(id);
  if (!project) {
    throw new ServiceError("Project not found.", 404, "PROJECT_NOT_FOUND");
  }

  // Delete all cloudinary assets
  const destroyPromises = [];
  if (project.image?.public_id) {
    destroyPromises.push(cloudinary.uploader.destroy(project.image.public_id));
  }
  if (project.bannerImage?.public_id) {
    destroyPromises.push(
      cloudinary.uploader.destroy(project.bannerImage.public_id),
    );
  }
  for (const img of project.gallery ?? []) {
    if (img.public_id) {
      destroyPromises.push(cloudinary.uploader.destroy(img.public_id));
    }
  }
  await Promise.allSettled(destroyPromises);

  await project.deleteOne();
  await resequenceProjects();

  invalidateProjectsCache();
  invalidateCategoryCache();
};

/* ── reorderProjects ───────────────────────────────────────────────── */

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

  const found = await Project.find({ _id: { $in: orderedIds } })
    .select("_id")
    .lean();

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

  await Project.bulkWrite(ops, { ordered: false });
  invalidateProjectsCache();
};

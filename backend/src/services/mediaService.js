import mongoose from "mongoose";
import {
  create,
  findById,
  findPaginated,
  countAll,
  deleteById,
  deleteManyByIds,
  updateById,
  findManyByIds,
  bulkWrite,
} from "../repositories/mediaRepository.js";
import {
  cloudinaryFolder,
  uploadToCloudinary,
  destroyFromCloudinary,
  destroyManyFromCloudinary,
} from "../config/cloudinary.js";
import { ServiceError } from "./ServiceError.js";
import cache from "../utils/cache.js";
import logger from "../utils/logger.js";
import {
  CACHE_TTL_MS,
  DEFAULT_MEDIA_PAGE_SIZE,
  MAX_PAGE_SIZE,
  MEDIA_DEFAULT_FOLDER,
  MAX_MEDIA_TAGS,
  MEDIA_CAPTION_MAX_LENGTH,
  MEDIA_SORT_FIELDS,
  DEFAULT_MEDIA_SORT_FIELD,
} from "../constants/index.js";

/* ================================================================== *
 * Cache helpers — mirrors projectService.js's cache-key-per-query-shape
 * ================================================================== */

const CACHE_PREFIX = "media:";

function buildCacheKey({ page, limit, folder, search, format, status, sortBy, sortOrder }) {
  return (
    `${CACHE_PREFIX}page=${page}:limit=${limit}:folder=${folder || "all"}:` +
    `search=${search || ""}:format=${format || "all"}:status=${status}:` +
    `sort=${sortBy}:${sortOrder}`
  );
}

export function invalidateMediaCache() {
  cache.delByPrefix(CACHE_PREFIX);
}

/* ================================================================== *
 * Field-parsing / filter helpers
 * ================================================================== */

function parseTags(value) {
  const normalise = (arr) =>
    [
      ...new Set(
        arr
          .filter((t) => typeof t === "string" && t.trim())
          .map((t) => t.trim().toLowerCase()),
      ),
    ].slice(0, MAX_MEDIA_TAGS);

  if (Array.isArray(value)) return normalise(value);
  if (typeof value !== "string" || value.trim() === "") return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? normalise(parsed) : [];
  } catch {
    return [];
  }
}

function resolveFolder(folder, fallback = MEDIA_DEFAULT_FOLDER) {
  const trimmed = (folder || "").trim().toLowerCase();
  return trimmed || fallback;
}

function resolveCaption(caption) {
  return (caption || "").trim().slice(0, MEDIA_CAPTION_MAX_LENGTH);
}

function buildSort(sortBy, sortOrder) {
  const field = MEDIA_SORT_FIELDS.includes(sortBy) ? sortBy : DEFAULT_MEDIA_SORT_FIELD;
  const direction = sortOrder === "asc" ? 1 : -1;
  return { [field]: direction };
}

function validateIds(ids) {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new ServiceError("ids must be a non-empty array.", 400, "MEDIA_BULK_INVALID");
  }
  const invalid = ids.filter((id) => !mongoose.Types.ObjectId.isValid(id));
  if (invalid.length) {
    throw new ServiceError(
      `Invalid media ID(s): ${invalid.join(", ")}`,
      400,
      "MEDIA_BULK_INVALID_ID",
    );
  }
}

/* ================================================================== *
 * fetchMediaLibrary — List + Search + Folder/Format filter + Sort +
 * Pagination + active/trash status
 * ================================================================== */

export const fetchMediaLibrary = async ({
  page = 1,
  limit = DEFAULT_MEDIA_PAGE_SIZE,
  folder = "",
  search = "",
  format = "",
  status = "active",
  sortBy = DEFAULT_MEDIA_SORT_FIELD,
  sortOrder = "desc",
} = {}) => {
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(Math.max(1, limit), MAX_PAGE_SIZE);
  const skip = (safePage - 1) * safeLimit;
  const safeStatus = status === "trash" ? "trash" : "active";

  const cacheKey = buildCacheKey({
    page: safePage,
    limit: safeLimit,
    folder,
    search,
    format,
    status: safeStatus,
    sortBy,
    sortOrder,
  });
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const filter = { deletedAt: safeStatus === "trash" ? { $ne: null } : null };
  if (folder) filter.folder = folder;
  if (format) filter.format = format.toLowerCase();
  if (search) filter.$text = { $search: search };

  const sort = search ? { score: { $meta: "textScore" } } : buildSort(sortBy, sortOrder);
  const projection = search ? { score: { $meta: "textScore" } } : null;

  const [media, total] = await Promise.all([
    findPaginated({ filter, skip, limit: safeLimit, sort, projection }),
    countAll(filter),
  ]);

  const result = {
    media,
    total,
    page: safePage,
    limit: safeLimit,
    totalPages: Math.ceil(total / safeLimit),
  };

  cache.set(cacheKey, result, CACHE_TTL_MS);
  return result;
};

/* ================================================================== *
 * addMedia — Upload endpoint
 * ================================================================== */

export const addMedia = async ({ file, folder, altText, caption, tags }) => {
  if (!file) {
    throw new ServiceError("File is required.", 400, "MEDIA_FILE_REQUIRED");
  }

  const safeFolder = resolveFolder(folder);
  const cloudFolder = cloudinaryFolder(`media/${safeFolder}`);

  let uploaded;
  try {
    uploaded = await uploadToCloudinary(file, cloudFolder);
  } catch (err) {
    throw new ServiceError(err.message, 400, "MEDIA_UPLOAD_FAILED");
  }

  try {
    const media = await create({
      originalName: file.originalname,
      url: uploaded.secure_url,
      public_id: uploaded.public_id,
      folder: safeFolder,
      format: uploaded.format || "",
      mimeType: file.mimetype,
      resourceType: "image",
      width: uploaded.width || 0,
      height: uploaded.height || 0,
      bytes: uploaded.bytes,
      altText: altText || "",
      caption: resolveCaption(caption),
      tags: parseTags(tags),
    });

    invalidateMediaCache();
    return media;
  } catch (err) {
    logger.warn("[addMedia] Rolling back Cloudinary upload after DB failure", {
      publicId: uploaded.public_id,
      error: err.message,
    });
    await destroyFromCloudinary(uploaded.public_id, logger);
    throw err;
  }
};

/* ================================================================== *
 * updateMediaMetadata — altText / caption / tags / folder only, no
 * Cloudinary interaction at all.
 * ================================================================== */

export const updateMediaMetadata = async (id, { altText, caption, tags, folder }) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ServiceError("Invalid media ID.", 400, "MEDIA_INVALID_ID");
  }

  if (
    altText === undefined &&
    caption === undefined &&
    tags === undefined &&
    folder === undefined
  ) {
    throw new ServiceError(
      "No valid fields provided for update.",
      400,
      "MEDIA_NO_VALID_FIELDS",
    );
  }

  const media = await findById(id);
  if (!media) {
    throw new ServiceError("Media not found.", 404, "MEDIA_NOT_FOUND");
  }

  if (altText !== undefined) media.altText = altText;
  if (caption !== undefined) media.caption = resolveCaption(caption);
  if (tags !== undefined) media.tags = parseTags(tags);
  if (folder !== undefined) media.folder = resolveFolder(folder);

  await media.save();
  invalidateMediaCache();
  return media;
};

/* ================================================================== *
 * replaceMedia — swap the underlying Cloudinary asset in place
 * ================================================================== */

export const replaceMedia = async (id, { file, folder, altText, tags, caption }) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ServiceError("Invalid media ID.", 400, "MEDIA_INVALID_ID");
  }
  if (!file) {
    throw new ServiceError(
      "A new file is required to replace media.",
      400,
      "MEDIA_FILE_REQUIRED",
    );
  }

  const media = await findById(id);
  if (!media) {
    throw new ServiceError("Media not found.", 404, "MEDIA_NOT_FOUND");
  }

  const safeFolder = resolveFolder(folder, media.folder);
  const cloudFolder = cloudinaryFolder(`media/${safeFolder}`);

  let uploaded;
  try {
    uploaded = await uploadToCloudinary(file, cloudFolder);
  } catch (err) {
    throw new ServiceError(err.message, 400, "MEDIA_UPLOAD_FAILED");
  }

  const oldPublicId = media.public_id;

  media.originalName = file.originalname;
  media.url = uploaded.secure_url;
  media.public_id = uploaded.public_id;
  media.folder = safeFolder;
  media.format = uploaded.format || "";
  media.mimeType = file.mimetype;
  media.width = uploaded.width || 0;
  media.height = uploaded.height || 0;
  media.bytes = uploaded.bytes;
  if (altText !== undefined) media.altText = altText;
  if (caption !== undefined) media.caption = resolveCaption(caption);
  if (tags !== undefined) media.tags = parseTags(tags);

  try {
    await media.save();
  } catch (saveErr) {
    logger.warn(
      "[replaceMedia] Rolling back new Cloudinary upload after DB save failure",
      { publicId: uploaded.public_id, error: saveErr.message },
    );
    await destroyFromCloudinary(uploaded.public_id, logger);
    throw saveErr;
  }

  // Old asset is only removed after the new one is safely persisted.
  await destroyFromCloudinary(oldPublicId, logger);

  invalidateMediaCache();
  return media;
};

/* ================================================================== *
 * Trash workflow — soft delete / restore / permanent delete
 * ================================================================== */

export const softDeleteMedia = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ServiceError("Invalid media ID.", 400, "MEDIA_INVALID_ID");
  }

  const media = await updateById(id, { deletedAt: new Date() });
  if (!media) {
    throw new ServiceError("Media not found.", 404, "MEDIA_NOT_FOUND");
  }

  invalidateMediaCache();
  return media;
};

export const restoreMedia = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ServiceError("Invalid media ID.", 400, "MEDIA_INVALID_ID");
  }

  const media = await updateById(id, { deletedAt: null });
  if (!media) {
    throw new ServiceError("Media not found.", 404, "MEDIA_NOT_FOUND");
  }

  invalidateMediaCache();
  return media;
};

/** Permanently deletes the document AND destroys the Cloudinary asset.
 * Not gated on the item currently being in the trash — callers (the
 * admin UI) only expose this action from the Trash view, but the
 * service itself doesn't need to assume that to stay correct. */
export const permanentlyDeleteMedia = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ServiceError("Invalid media ID.", 400, "MEDIA_INVALID_ID");
  }

  const media = await findById(id);
  if (!media) {
    throw new ServiceError("Media not found.", 404, "MEDIA_NOT_FOUND");
  }

  await deleteById(id);
  await destroyFromCloudinary(media.public_id, logger);

  invalidateMediaCache();
};

/* ── Bulk operations ─────────────────────────────────────────────── */

export const bulkSoftDelete = async (ids) => {
  validateIds(ids);
  const ops = ids.map((id) => ({
    updateOne: { filter: { _id: id }, update: { $set: { deletedAt: new Date() } } },
  }));
  const result = await bulkWrite(ops);
  invalidateMediaCache();
  return { matched: result.matchedCount ?? 0, modified: result.modifiedCount ?? 0 };
};

export const bulkRestore = async (ids) => {
  validateIds(ids);
  const ops = ids.map((id) => ({
    updateOne: { filter: { _id: id }, update: { $set: { deletedAt: null } } },
  }));
  const result = await bulkWrite(ops);
  invalidateMediaCache();
  return { matched: result.matchedCount ?? 0, modified: result.modifiedCount ?? 0 };
};

export const bulkPermanentlyDelete = async (ids) => {
  validateIds(ids);

  const items = await findManyByIds(ids);
  if (items.length === 0) {
    throw new ServiceError("No matching media found.", 404, "MEDIA_BULK_NOT_FOUND");
  }

  const publicIds = items.map((m) => m.public_id).filter(Boolean);

  await deleteManyByIds(ids);
  await destroyManyFromCloudinary(publicIds, logger);

  invalidateMediaCache();
  return { deleted: items.length };
};

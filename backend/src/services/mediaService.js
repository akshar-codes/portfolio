import {
  create,
  findById,
  findPaginated,
  countAll,
  deleteById,
} from "../repositories/mediaRepository.js";
import {
  cloudinaryFolder,
  uploadToCloudinary,
  destroyFromCloudinary,
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
} from "../utils/constants.js";

/* ================================================================== *
 * Cache helpers — mirrors projectService.js's cache-key-per-query-shape
 * ================================================================== */

const CACHE_PREFIX = "media:";

function buildCacheKey({ page, limit, folder, search }) {
  return `${CACHE_PREFIX}page=${page}:limit=${limit}:folder=${folder || "all"}:search=${search || ""}`;
}

export function invalidateMediaCache() {
  cache.delByPrefix(CACHE_PREFIX);
}

/* ================================================================== *
 * Tag parsing — mirrors projectService.js's parseArrayField helper.
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

/* ================================================================== *
 * fetchMediaLibrary — List + Search + Folder filter + Pagination
 * ================================================================== */

export const fetchMediaLibrary = async ({
  page = 1,
  limit = DEFAULT_MEDIA_PAGE_SIZE,
  folder = "",
  search = "",
} = {}) => {
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(Math.max(1, limit), MAX_PAGE_SIZE);
  const skip = (safePage - 1) * safeLimit;

  const cacheKey = buildCacheKey({
    page: safePage,
    limit: safeLimit,
    folder,
    search,
  });
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const filter = {};
  if (folder) filter.folder = folder;
  if (search) filter.$text = { $search: search };

  // Relevance-sort search results; otherwise newest first.
  const sort = search ? { score: { $meta: "textScore" } } : { createdAt: -1 };
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

export const addMedia = async ({ file, folder, altText, tags }) => {
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
 * replaceMedia — Replace endpoint
 * ================================================================== */

export const replaceMedia = async (id, { file, folder, altText, tags }) => {
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
 * removeMedia — Delete endpoint
 * ================================================================== */

export const removeMedia = async (id) => {
  const media = await findById(id);
  if (!media) {
    throw new ServiceError("Media not found.", 404, "MEDIA_NOT_FOUND");
  }

  await deleteById(id);
  await destroyFromCloudinary(media.public_id, logger);

  invalidateMediaCache();
};

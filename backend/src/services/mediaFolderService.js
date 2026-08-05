import mongoose from "mongoose";
import {
  findAll,
  findBySlug,
  findById,
  create as createFolderDoc,
  updateById,
  deleteById,
  findMaxOrder,
} from "../repositories/mediaFolderRepository.js";
import { countActiveByFolder, reassignFolder } from "../repositories/mediaRepository.js";
import { invalidateMediaCache } from "./mediaService.js";
import { generateSlug, normalizeName } from "../utils/slug.js";
import { ServiceError } from "./ServiceError.js";
import cache from "../utils/cache.js";
import { CACHE_TTL_MS, MEDIA_DEFAULT_FOLDER } from "../constants/index.js";

const CACHE_KEY = "mediaFolders:list";

export function invalidateMediaFolderCache() {
  cache.del(CACHE_KEY);
}

/** Guarantees the protected "General" default bucket always exists,
 * so it's always browsable as a real folder even though every media
 * upload can fall back to it without one ever being explicitly
 * created. Idempotent — safe to call on every fetch. */
async function ensureDefaultFolder() {
  const existing = await findBySlug(MEDIA_DEFAULT_FOLDER);
  if (existing) return;
  await createFolderDoc({ name: "General", slug: MEDIA_DEFAULT_FOLDER, order: -1 });
}

export const fetchFolders = async () => {
  const cached = cache.get(CACHE_KEY);
  if (cached) return cached;

  await ensureDefaultFolder();

  const folders = await findAll();
  const withCounts = await Promise.all(
    folders.map(async (folder) => ({
      ...folder,
      mediaCount: await countActiveByFolder(folder.slug),
    })),
  );

  cache.set(CACHE_KEY, withCounts, CACHE_TTL_MS);
  return withCounts;
};

export const createFolder = async (rawName) => {
  const name = normalizeName(rawName ?? "");
  const slug = generateSlug(name);

  if (!slug) {
    throw new ServiceError(
      "Folder name is invalid — it must contain at least one alphanumeric character.",
      400,
      "MEDIA_FOLDER_INVALID_NAME",
    );
  }

  const existing = await findBySlug(slug);
  if (existing) {
    throw new ServiceError(
      `Folder "${existing.name}" already exists.`,
      409,
      "MEDIA_FOLDER_DUPLICATE",
    );
  }

  const maxOrderDoc = await findMaxOrder();
  const nextOrder = maxOrderDoc ? (maxOrderDoc.order ?? 0) + 1 : 0;

  const folder = await createFolderDoc({ name, slug, order: nextOrder });
  invalidateMediaFolderCache();
  return folder;
};

export const renameFolder = async (id, rawName) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ServiceError("Invalid folder ID.", 400, "MEDIA_FOLDER_INVALID_ID");
  }

  const folder = await findById(id);
  if (!folder) {
    throw new ServiceError("Folder not found.", 404, "MEDIA_FOLDER_NOT_FOUND");
  }

  if (folder.slug === MEDIA_DEFAULT_FOLDER) {
    throw new ServiceError(
      "The General folder cannot be renamed.",
      400,
      "MEDIA_FOLDER_PROTECTED",
    );
  }

  const name = normalizeName(rawName ?? "");
  const slug = generateSlug(name);

  if (!slug) {
    throw new ServiceError(
      "Folder name is invalid — it must contain at least one alphanumeric character.",
      400,
      "MEDIA_FOLDER_INVALID_NAME",
    );
  }

  const existingSlug = await findBySlug(slug);
  if (existingSlug && existingSlug._id.toString() !== id) {
    throw new ServiceError(
      `Folder "${existingSlug.name}" already exists.`,
      409,
      "MEDIA_FOLDER_DUPLICATE",
    );
  }

  // Cascade: remap every Media doc (active AND trashed) pointing at the
  // OLD slug to the NEW one, so a rename never orphans its contents.
  if (slug !== folder.slug) {
    await reassignFolder(folder.slug, slug);
    invalidateMediaCache();
  }

  const updated = await updateById(id, { name, slug });
  invalidateMediaFolderCache();
  return updated;
};

export const deleteFolder = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ServiceError("Invalid folder ID.", 400, "MEDIA_FOLDER_INVALID_ID");
  }

  const folder = await findById(id);
  if (!folder) {
    throw new ServiceError("Folder not found.", 404, "MEDIA_FOLDER_NOT_FOUND");
  }

  if (folder.slug === MEDIA_DEFAULT_FOLDER) {
    throw new ServiceError(
      "The General folder cannot be deleted.",
      400,
      "MEDIA_FOLDER_PROTECTED",
    );
  }

  const mediaCount = await countActiveByFolder(folder.slug);
  if (mediaCount > 0) {
    throw new ServiceError(
      `Cannot delete — ${mediaCount} file${mediaCount === 1 ? "" : "s"} use this folder. Move or delete those files first.`,
      409,
      "MEDIA_FOLDER_IN_USE",
    );
  }

  await deleteById(id);
  invalidateMediaFolderCache();
};

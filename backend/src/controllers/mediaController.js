import { validationResult } from "express-validator";
import AppError from "../utils/AppError.js";
import {
  fetchMediaLibrary,
  addMedia,
  updateMediaMetadata,
  replaceMedia,
  softDeleteMedia,
  restoreMedia,
  permanentlyDeleteMedia,
  bulkSoftDelete,
  bulkRestore,
  bulkPermanentlyDelete,
} from "../services/mediaService.js";
import { sendSuccess, sendNoContent } from "../utils/response.js";
import asyncHandler from "../utils/asyncHandler.js";
import { DEFAULT_MEDIA_PAGE_SIZE } from "../constants/index.js";

/* ------------------------------------------------------------------ *
 * GET /api/admin/media
 * Supports ?page, ?limit, ?folder, ?search, ?format, ?status
 * (active|trash), ?sortBy, ?sortOrder
 * ------------------------------------------------------------------ */
export const getMedia = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || DEFAULT_MEDIA_PAGE_SIZE;

  if (page < 1) throw new AppError("page must be a positive integer.", 400);
  if (limit < 1) throw new AppError("limit must be a positive integer.", 400);

  const folder =
    typeof req.query.folder === "string" ? req.query.folder.trim().toLowerCase() : "";
  const search =
    typeof req.query.search === "string" ? req.query.search.trim() : "";
  const format =
    typeof req.query.format === "string" ? req.query.format.trim().toLowerCase() : "";
  const status = req.query.status === "trash" ? "trash" : "active";
  const sortBy =
    typeof req.query.sortBy === "string" ? req.query.sortBy.trim() : undefined;
  const sortOrder =
    typeof req.query.sortOrder === "string" ? req.query.sortOrder.trim() : undefined;

  const result = await fetchMediaLibrary({
    page,
    limit,
    folder,
    search,
    format,
    status,
    sortBy,
    sortOrder,
  });
  return sendSuccess(res, result, "Media retrieved successfully");
});

/* ------------------------------------------------------------------ *
 * POST /api/admin/media  (multipart/form-data)
 * ------------------------------------------------------------------ */
export const uploadMedia = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(errors.array()[0].msg, 400);
  }

  const { folder, altText, caption, tags } = req.body;
  const file = req.file ?? null;

  const media = await addMedia({ file, folder, altText, caption, tags });
  return sendSuccess(res, media, "Media uploaded successfully", 201);
});

/* ------------------------------------------------------------------ *
 * PATCH /api/admin/media/:id  (JSON body — metadata only, no file)
 * ------------------------------------------------------------------ */
export const updateMediaMetadataHandler = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(errors.array()[0].msg, 400);
  }

  const { altText, caption, tags, folder } = req.body;
  const media = await updateMediaMetadata(req.params.id, { altText, caption, tags, folder });
  return sendSuccess(res, media, "Media updated successfully");
});

/* ------------------------------------------------------------------ *
 * PATCH /api/admin/media/:id/replace  (multipart/form-data)
 * ------------------------------------------------------------------ */
export const replaceMediaHandler = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(errors.array()[0].msg, 400);
  }

  const { folder, altText, caption, tags } = req.body;
  const file = req.file ?? null;

  const media = await replaceMedia(req.params.id, { file, folder, altText, caption, tags });
  return sendSuccess(res, media, "Media replaced successfully");
});

/* ------------------------------------------------------------------ *
 * DELETE /api/admin/media/:id — soft delete (move to trash)
 * ------------------------------------------------------------------ */
export const deleteMedia = asyncHandler(async (req, res) => {
  await softDeleteMedia(req.params.id);
  return sendNoContent(res);
});

/* ------------------------------------------------------------------ *
 * PATCH /api/admin/media/:id/restore
 * ------------------------------------------------------------------ */
export const restoreMediaHandler = asyncHandler(async (req, res) => {
  const media = await restoreMedia(req.params.id);
  return sendSuccess(res, media, "Media restored successfully");
});

/* ------------------------------------------------------------------ *
 * DELETE /api/admin/media/:id/permanent — hard delete + Cloudinary destroy
 * ------------------------------------------------------------------ */
export const permanentDeleteHandler = asyncHandler(async (req, res) => {
  await permanentlyDeleteMedia(req.params.id);
  return sendNoContent(res);
});

/* ------------------------------------------------------------------ *
 * POST /api/admin/media/bulk-delete   { ids: string[] }
 * ------------------------------------------------------------------ */
export const bulkDeleteHandler = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(errors.array()[0].msg, 400);
  }

  const result = await bulkSoftDelete(req.body.ids);
  return sendSuccess(res, result, "Media moved to trash successfully");
});

/* ------------------------------------------------------------------ *
 * POST /api/admin/media/bulk-restore  { ids: string[] }
 * ------------------------------------------------------------------ */
export const bulkRestoreHandler = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(errors.array()[0].msg, 400);
  }

  const result = await bulkRestore(req.body.ids);
  return sendSuccess(res, result, "Media restored successfully");
});

/* ------------------------------------------------------------------ *
 * POST /api/admin/media/bulk-permanent-delete  { ids: string[] }
 * ------------------------------------------------------------------ */
export const bulkPermanentDeleteHandler = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(errors.array()[0].msg, 400);
  }

  const result = await bulkPermanentlyDelete(req.body.ids);
  return sendSuccess(res, result, "Media permanently deleted successfully");
});

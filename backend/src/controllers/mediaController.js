import { validationResult } from "express-validator";
import AppError from "../utils/AppError.js";
import {
  fetchMediaLibrary,
  addMedia,
  replaceMedia,
  removeMedia,
} from "../services/mediaService.js";
import { sendSuccess, sendNoContent } from "../utils/response.js";
import asyncHandler from "../utils/asyncHandler.js";
import { DEFAULT_MEDIA_PAGE_SIZE } from "../utils/constants.js";

/* ------------------------------------------------------------------ *
 * GET /api/admin/media  (protected)
 * Query params: page, limit, folder, search — list, search, folder
 * filtering, and pagination are all served by this one endpoint, the
 * same convention getProjects() uses for category filter + pagination.
 * ------------------------------------------------------------------ */
export const getMedia = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || DEFAULT_MEDIA_PAGE_SIZE;

  if (page < 1) throw new AppError("page must be a positive integer.", 400);
  if (limit < 1) throw new AppError("limit must be a positive integer.", 400);

  const folder =
    typeof req.query.folder === "string"
      ? req.query.folder.trim().toLowerCase()
      : "";
  const search =
    typeof req.query.search === "string" ? req.query.search.trim() : "";

  const result = await fetchMediaLibrary({ page, limit, folder, search });
  return sendSuccess(res, result, "Media retrieved successfully");
});

/* ------------------------------------------------------------------ *
 * POST /api/admin/media  (protected, multipart/form-data)
 * ------------------------------------------------------------------ */
export const uploadMedia = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(errors.array()[0].msg, 400);
  }

  const { folder, altText, tags } = req.body;
  const file = req.file ?? null;

  const media = await addMedia({ file, folder, altText, tags });
  return sendSuccess(res, media, "Media uploaded successfully", 201);
});

/* ------------------------------------------------------------------ *
 * PATCH /api/admin/media/:id/replace  (protected, multipart/form-data)
 * ------------------------------------------------------------------ */
export const replaceMediaHandler = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(errors.array()[0].msg, 400);
  }

  const { folder, altText, tags } = req.body;
  const file = req.file ?? null;

  const media = await replaceMedia(req.params.id, {
    file,
    folder,
    altText,
    tags,
  });
  return sendSuccess(res, media, "Media replaced successfully");
});

/* ------------------------------------------------------------------ *
 * DELETE /api/admin/media/:id  (protected)
 * ------------------------------------------------------------------ */
export const deleteMedia = asyncHandler(async (req, res) => {
  await removeMedia(req.params.id);
  return sendNoContent(res);
});

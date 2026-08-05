import { validationResult } from "express-validator";
import AppError from "../utils/AppError.js";
import {
  fetchFolders,
  createFolder,
  renameFolder,
  deleteFolder,
} from "../services/mediaFolderService.js";
import { sendSuccess, sendNoContent } from "../utils/response.js";
import asyncHandler from "../utils/asyncHandler.js";

/* GET /api/admin/media-folders */
export const getMediaFolders = asyncHandler(async (_req, res) => {
  const folders = await fetchFolders();
  return sendSuccess(res, folders, "Folders retrieved successfully");
});

/* POST /api/admin/media-folders */
export const createMediaFolder = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(errors.array()[0].msg, 400);
  }

  const folder = await createFolder(req.body.name);
  return sendSuccess(res, folder, "Folder created successfully", 201);
});

/* PATCH /api/admin/media-folders/:id */
export const updateMediaFolder = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(errors.array()[0].msg, 400);
  }

  const folder = await renameFolder(req.params.id, req.body.name);
  return sendSuccess(res, folder, "Folder renamed successfully");
});

/* DELETE /api/admin/media-folders/:id */
export const deleteMediaFolder = asyncHandler(async (req, res) => {
  await deleteFolder(req.params.id);
  return sendNoContent(res);
});

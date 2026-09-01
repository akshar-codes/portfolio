import { validationResult } from "express-validator";
import AppError from "../utils/AppError.js";
import {
  fetchPublicCategories,
  fetchAllCategories,
  createCategory,
  updateCategory,
  removeCategory,
  reorderCategories,
  publishCategory,
  unpublishCategory,
  archiveCategory,
  restoreCategory,
  scheduleCategory,
} from "../services/categoryService.js";
import { sendSuccess, sendNoContent } from "../utils/response.js";
import asyncHandler from "../utils/asyncHandler.js";

/* ------------------------------------------------------------------ *
 * GET /api/categories  (public)
 * ------------------------------------------------------------------ */
export const getPublicCategories = asyncHandler(async (_req, res) => {
  const categories = await fetchPublicCategories();
  return sendSuccess(res, categories, "Categories retrieved successfully");
});

/* ------------------------------------------------------------------ *
 * GET /api/admin/categories  (protected)
 * ------------------------------------------------------------------ */
export const getAllCategories = asyncHandler(async (req, res) => {
  const search =
    typeof req.query.search === "string" ? req.query.search.trim() : "";
  const status =
    typeof req.query.status === "string" ? req.query.status.trim() : "";
  const sortBy =
    typeof req.query.sortBy === "string" ? req.query.sortBy.trim() : undefined;
  const sortOrder =
    typeof req.query.sortOrder === "string"
      ? req.query.sortOrder.trim()
      : undefined;

  const categories = await fetchAllCategories({
    search,
    status,
    sortBy,
    sortOrder,
  });
  return sendSuccess(res, categories, "Categories retrieved successfully");
});

/* ------------------------------------------------------------------ *
 * POST /api/admin/categories  (protected)
 * ------------------------------------------------------------------ */
export const addCategory = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(errors.array()[0].msg, 400);
  }

  const { name, status } = req.body;
  const category = await createCategory(name, status);
  return sendSuccess(res, category, "Category created successfully", 201);
});

/* ------------------------------------------------------------------ *
 * PATCH /api/admin/categories/:id  (protected)
 * Renames the category. Status changes go through the dedicated
 * publish/unpublish/archive/restore/schedule endpoints below.
 * ------------------------------------------------------------------ */
export const updateCategoryHandler = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(errors.array()[0].msg, 400);
  }

  const { name } = req.body;
  const category = await updateCategory(req.params.id, { name });
  return sendSuccess(res, category, "Category updated successfully");
});

/* ------------------------------------------------------------------ *
 * PATCH /api/admin/categories/reorder  (protected)
 * ------------------------------------------------------------------ */
export const reorderCategoriesHandler = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(errors.array()[0].msg, 400);
  }

  const { orderedIds } = req.body;
  await reorderCategories(orderedIds);
  return sendSuccess(res, null, "Categories reordered successfully");
});

/* ------------------------------------------------------------------ *
 * PATCH /api/admin/categories/:id/publish | /unpublish | /archive | /restore
 * ------------------------------------------------------------------ */
export const publishCategoryHandler = asyncHandler(async (req, res) => {
  const category = await publishCategory(req.params.id);
  return sendSuccess(res, category, "Category published successfully");
});

export const unpublishCategoryHandler = asyncHandler(async (req, res) => {
  const category = await unpublishCategory(req.params.id);
  return sendSuccess(res, category, "Category unpublished successfully");
});

export const archiveCategoryHandler = asyncHandler(async (req, res) => {
  const category = await archiveCategory(req.params.id);
  return sendSuccess(res, category, "Category archived successfully");
});

export const restoreCategoryHandler = asyncHandler(async (req, res) => {
  const category = await restoreCategory(req.params.id);
  return sendSuccess(res, category, "Category restored to draft successfully");
});

/* ------------------------------------------------------------------ *
 * PATCH /api/admin/categories/:id/schedule  { publishAt: ISO8601 date }
 * ------------------------------------------------------------------ */
export const scheduleCategoryHandler = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(errors.array()[0].msg, 400);
  }

  const category = await scheduleCategory(req.params.id, req.body.publishAt);
  return sendSuccess(res, category, "Category scheduled successfully");
});

/* ------------------------------------------------------------------ *
 * DELETE /api/admin/categories/:id  (protected)
 * ------------------------------------------------------------------ */
export const deleteCategoryById = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(errors.array()[0].msg, 400);
  }

  await removeCategory(req.params.id);
  return sendNoContent(res);
});

import { validationResult } from "express-validator";
import AppError from "../utils/AppError.js";
import {
  fetchPublicCategories,
  fetchAllCategories,
  createCategory,
  updateCategory,
  removeCategory,
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
 * Supports ?search, ?status, ?sortBy, ?sortOrder
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
 * Renames the category and/or changes its publish status.
 * ------------------------------------------------------------------ */
export const updateCategoryHandler = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(errors.array()[0].msg, 400);
  }

  const { name, status } = req.body;
  const category = await updateCategory(req.params.id, { name, status });
  return sendSuccess(res, category, "Category updated successfully");
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

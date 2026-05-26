import { validationResult } from "express-validator";
import AppError from "../utils/AppError.js";
import {
  fetchPublicCategories,
  fetchAllCategories,
  createCategory,
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
 * ------------------------------------------------------------------ */
export const getAllCategories = asyncHandler(async (_req, res) => {
  const categories = await fetchAllCategories();
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

  const { name } = req.body;
  const category = await createCategory(name);
  return sendSuccess(res, category, "Category created successfully", 201);
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

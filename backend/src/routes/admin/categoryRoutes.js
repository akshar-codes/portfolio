import express from "express";
import { protect } from "../../middleware/authMiddleware.js";
import {
  getAllCategories,
  addCategory,
  updateCategoryHandler,
  deleteCategoryById,
  reorderCategoriesHandler,
} from "../../controllers/categoryController.js";
import {
  createCategoryValidator,
  updateCategoryValidator,
  deleteCategoryValidator,
  reorderCategoriesValidator,
} from "../../validators/categoryValidators.js";

const router = express.Router();

// Every route in this file requires a valid admin JWT cookie.
router.use(protect);

/* ------------------------------------------------------------------ *
 * GET /api/admin/categories
 * ------------------------------------------------------------------ */
router.get("/", getAllCategories);

/* ------------------------------------------------------------------ *
 * POST /api/admin/categories
 * ------------------------------------------------------------------ */
router.post("/", createCategoryValidator, addCategory);

/* ------------------------------------------------------------------ *
 * PATCH /api/admin/categories/reorder
 * Registered BEFORE the "/:id" route below — Express matches routes
 * in registration order, and "/:id" would otherwise swallow "reorder"
 * as an :id param (same convention as routes/admin/projectRoutes.js).
 * ------------------------------------------------------------------ */
router.patch("/reorder", reorderCategoriesValidator, reorderCategoriesHandler);

/* ------------------------------------------------------------------ *
 * PATCH /api/admin/categories/:id
 * ------------------------------------------------------------------ */
router.patch("/:id", updateCategoryValidator, updateCategoryHandler);

/* ------------------------------------------------------------------ *
 * DELETE /api/admin/categories/:id
 * ------------------------------------------------------------------ */
router.delete("/:id", deleteCategoryValidator, deleteCategoryById);

export default router;

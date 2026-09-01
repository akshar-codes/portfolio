import express from "express";
import { protect } from "../../middleware/authMiddleware.js";
import {
  getAllCategories,
  addCategory,
  updateCategoryHandler,
  deleteCategoryById,
  reorderCategoriesHandler,
  publishCategoryHandler,
  unpublishCategoryHandler,
  archiveCategoryHandler,
  restoreCategoryHandler,
  scheduleCategoryHandler,
} from "../../controllers/categoryController.js";
import {
  createCategoryValidator,
  updateCategoryValidator,
  deleteCategoryValidator,
  reorderCategoriesValidator,
  categoryStatusActionValidator,
  scheduleCategoryValidator,
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
 * Registered BEFORE "/:id" — Express matches routes in registration
 * order, and "/:id" would otherwise swallow "reorder" as an :id param.
 * ------------------------------------------------------------------ */
router.patch("/reorder", reorderCategoriesValidator, reorderCategoriesHandler);

/* ------------------------------------------------------------------ *
 * PATCH /api/admin/categories/:id/publish | /unpublish | /archive | /restore
 * PATCH /api/admin/categories/:id/schedule  { publishAt: ISO8601 date }
 * (3-segment paths — no ordering conflict with "/:id" below)
 * ------------------------------------------------------------------ */
router.patch("/:id/publish", categoryStatusActionValidator, publishCategoryHandler);
router.patch("/:id/unpublish", categoryStatusActionValidator, unpublishCategoryHandler);
router.patch("/:id/archive", categoryStatusActionValidator, archiveCategoryHandler);
router.patch("/:id/restore", categoryStatusActionValidator, restoreCategoryHandler);
router.patch("/:id/schedule", scheduleCategoryValidator, scheduleCategoryHandler);

/* ------------------------------------------------------------------ *
 * PATCH /api/admin/categories/:id  (rename only)
 * ------------------------------------------------------------------ */
router.patch("/:id", updateCategoryValidator, updateCategoryHandler);

/* ------------------------------------------------------------------ *
 * DELETE /api/admin/categories/:id
 * ------------------------------------------------------------------ */
router.delete("/:id", deleteCategoryValidator, deleteCategoryById);

export default router;

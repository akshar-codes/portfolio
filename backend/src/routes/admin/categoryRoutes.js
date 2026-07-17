import express from "express";
import { protect } from "../../middleware/authMiddleware.js";
import {
  getAllCategories,
  addCategory,
  deleteCategoryById,
} from "../../controllers/categoryController.js";
import {
  createCategoryValidator,
  deleteCategoryValidator,
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
 * DELETE /api/admin/categories/:id
 * ------------------------------------------------------------------ */
router.delete("/:id", deleteCategoryValidator, deleteCategoryById);

export default router;

import express from "express";
import { body, param } from "express-validator";
import { protect } from "../middleware/authMiddleware.js";
import {
  getAllCategories,
  addCategory,
  deleteCategoryById,
} from "../controllers/categoryController.js";

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
router.post(
  "/",
  [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Category name is required")
      .isLength({ min: 2 })
      .withMessage("Category name must be at least 2 characters")
      .isLength({ max: 80 })
      .withMessage("Category name must not exceed 80 characters"),
  ],
  addCategory,
);

/* ------------------------------------------------------------------ *
 * DELETE /api/admin/categories/:id
 * ------------------------------------------------------------------ */
router.delete(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid category ID format")],
  deleteCategoryById,
);

export default router;

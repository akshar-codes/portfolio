import { body, param } from "express-validator";
import { CONTENT_STATUSES } from "../constants/index.js";
import { publishAtValidator } from "./common.js";

export const createCategoryValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Category name is required")
    .isLength({ min: 2 })
    .withMessage("Category name must be at least 2 characters")
    .isLength({ max: 80 })
    .withMessage("Category name must not exceed 80 characters"),

  // Initial value only — literal assignment at creation, not a
  // transition (see services/categoryService.js createCategory).
  body("status")
    .optional()
    .isIn(CONTENT_STATUSES)
    .withMessage(`status must be one of: ${CONTENT_STATUSES.join(", ")}`),
];

/**
 * `status` is intentionally NOT accepted here — renaming and changing
 * publish status are separate concerns now. Status changes go through
 * publishCategoryValidator / unpublishCategoryValidator /
 * archiveCategoryValidator / restoreCategoryValidator /
 * scheduleCategoryValidator below.
 */
export const updateCategoryValidator = [
  param("id").isMongoId().withMessage("Invalid category ID format"),

  body("name")
    .trim()
    .notEmpty()
    .withMessage("Category name is required")
    .isLength({ min: 2 })
    .withMessage("Category name must be at least 2 characters")
    .isLength({ max: 80 })
    .withMessage("Category name must not exceed 80 characters"),
];

export const deleteCategoryValidator = [
  param("id").isMongoId().withMessage("Invalid category ID format"),
];

export const categoryStatusActionValidator = [
  param("id").isMongoId().withMessage("Invalid category ID format"),
];

export const scheduleCategoryValidator = [
  param("id").isMongoId().withMessage("Invalid category ID format"),
  publishAtValidator(),
];

/** Mirrors validators/projectValidators.js's reorderProjectsValidator. */
export const reorderCategoriesValidator = [
  body("orderedIds")
    .isArray({ min: 1 })
    .withMessage("orderedIds must be a non-empty array"),
  body("orderedIds.*")
    .isMongoId()
    .withMessage("Each orderedId must be a valid MongoDB ObjectId"),
];

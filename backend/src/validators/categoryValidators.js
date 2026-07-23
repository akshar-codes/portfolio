import { body, param } from "express-validator";
import { CONTENT_STATUSES } from "../utils/constants.js";

export const createCategoryValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Category name is required")
    .isLength({ min: 2 })
    .withMessage("Category name must be at least 2 characters")
    .isLength({ max: 80 })
    .withMessage("Category name must not exceed 80 characters"),

  body("status")
    .optional()
    .isIn(CONTENT_STATUSES)
    .withMessage(`status must be one of: ${CONTENT_STATUSES.join(", ")}`),
];

export const updateCategoryValidator = [
  param("id").isMongoId().withMessage("Invalid category ID format"),

  body("name")
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage("Category name must be at least 2 characters")
    .isLength({ max: 80 })
    .withMessage("Category name must not exceed 80 characters"),

  body("status")
    .optional()
    .isIn(CONTENT_STATUSES)
    .withMessage(`status must be one of: ${CONTENT_STATUSES.join(", ")}`),
];

export const deleteCategoryValidator = [
  param("id").isMongoId().withMessage("Invalid category ID format"),
];

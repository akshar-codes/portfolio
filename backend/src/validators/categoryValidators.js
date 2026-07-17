import { body, param } from "express-validator";

export const createCategoryValidator = [
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

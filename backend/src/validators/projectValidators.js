import { body, param } from "express-validator";

export const projectIdParamValidator = [
  param("id").isMongoId().withMessage("Invalid project ID"),
];

export const projectCreateValidators = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Project title is required")
    .isLength({ min: 2, max: 120 })
    .withMessage("Title must be between 2 and 120 characters"),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Project description is required")
    .isLength({ min: 10, max: 2000 })
    .withMessage("Description must be between 10 and 2000 characters"),

  body("category")
    .notEmpty()
    .withMessage("Category is required")
    .isMongoId()
    .withMessage("Invalid category ID format"),

  body("liveUrl")
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^https?:\/\/.+/)
    .withMessage("Live URL must be a valid HTTP/HTTPS address")
    .isLength({ max: 2048 })
    .withMessage("Live URL must not exceed 2048 characters"),

  body("githubUrl")
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^https?:\/\/.+/)
    .withMessage("GitHub URL must be a valid HTTP/HTTPS address")
    .isLength({ max: 2048 })
    .withMessage("GitHub URL must not exceed 2048 characters"),

  body("challenge")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Challenge must not exceed 1000 characters"),

  body("solution")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Solution must not exceed 1000 characters"),
];

export const projectUpdateValidators = [
  body("title")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Project title cannot be empty")
    .isLength({ min: 2, max: 120 })
    .withMessage("Title must be between 2 and 120 characters"),

  body("description")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Project description cannot be empty")
    .isLength({ min: 10, max: 2000 })
    .withMessage("Description must be between 10 and 2000 characters"),

  body("category")
    .optional({ checkFalsy: true })
    .isMongoId()
    .withMessage("Invalid category ID format"),

  body("liveUrl")
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^https?:\/\/.+/)
    .withMessage("Live URL must be a valid HTTP/HTTPS address")
    .isLength({ max: 2048 })
    .withMessage("Live URL must not exceed 2048 characters"),

  body("githubUrl")
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^https?:\/\/.+/)
    .withMessage("GitHub URL must be a valid HTTP/HTTPS address")
    .isLength({ max: 2048 })
    .withMessage("GitHub URL must not exceed 2048 characters"),

  body("challenge")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Challenge must not exceed 1000 characters"),

  body("solution")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Solution must not exceed 1000 characters"),
];

export const reorderProjectsValidator = [
  body("orderedIds")
    .isArray({ min: 1 })
    .withMessage("orderedIds must be a non-empty array"),
  body("orderedIds.*")
    .isMongoId()
    .withMessage("Each orderedId must be a valid MongoDB ObjectId"),
];

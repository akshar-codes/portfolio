import { body, param, query } from "express-validator";
import {
  CONTENT_STATUSES,
  PROJECT_ADMIN_SORT_FIELDS,
} from "../utils/constants.js";

export const projectIdParamValidator = [
  param("id").isMongoId().withMessage("Invalid project ID"),
];

/**
 * Validates the `seo` field, sent as a JSON-stringified object in
 * multipart/form-data — same convention AddProject/ManageProjects
 * already use for `technologies`/`features` (see
 * services/projectService.js parseSeoField for the persistence-side
 * counterpart). Deep field limits mirror models/Project.js's
 * projectSeoSchema.
 */
function validateSeoField(value) {
  if (value === undefined || value === "") return true;

  let parsed = value;
  if (typeof value === "string") {
    try {
      parsed = JSON.parse(value);
    } catch {
      throw new Error("seo must be valid JSON");
    }
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error("seo must be a JSON object");
  }

  if (
    parsed.metaTitle !== undefined &&
    (typeof parsed.metaTitle !== "string" || parsed.metaTitle.length > 70)
  ) {
    throw new Error("seo.metaTitle must be a string of at most 70 characters");
  }

  if (
    parsed.metaDescription !== undefined &&
    (typeof parsed.metaDescription !== "string" ||
      parsed.metaDescription.length > 160)
  ) {
    throw new Error(
      "seo.metaDescription must be a string of at most 160 characters",
    );
  }

  if (parsed.metaKeywords !== undefined) {
    if (!Array.isArray(parsed.metaKeywords)) {
      throw new Error("seo.metaKeywords must be an array");
    }
    if (parsed.metaKeywords.length > 20) {
      throw new Error("seo.metaKeywords must not exceed 20 entries");
    }
    if (
      !parsed.metaKeywords.every(
        (k) => typeof k === "string" && k.length <= 60,
      )
    ) {
      throw new Error(
        "Each seo.metaKeywords entry must be a string of at most 60 characters",
      );
    }
  }

  if (
    parsed.ogImage !== undefined &&
    parsed.ogImage !== "" &&
    !/^https?:\/\/.+/.test(parsed.ogImage)
  ) {
    throw new Error("seo.ogImage must be a valid HTTP/HTTPS URL or empty");
  }

  return true;
}

export const projectCreateValidators = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Project title is required")
    .isLength({ min: 2, max: 120 })
    .withMessage("Title must be between 2 and 120 characters"),

  // Rich text (Tiptap HTML). The authoritative 5000-character ceiling
  // is enforced by the Mongoose schema AFTER server-side sanitization
  // (services/projectService.js) strips markup — this is only a
  // generous first-line-of-defense against absurdly large payloads on
  // the raw, pre-sanitized HTML (mirrors validators/aboutValidators.js).
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Project description is required")
    .isLength({ max: 20000 })
    .withMessage("Description is too long"),

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
    .isLength({ max: 20000 })
    .withMessage("Challenge is too long"),

  body("solution")
    .optional({ checkFalsy: true })
    .isLength({ max: 20000 })
    .withMessage("Solution is too long"),

  body("status")
    .optional()
    .isIn(CONTENT_STATUSES)
    .withMessage(`status must be one of: ${CONTENT_STATUSES.join(", ")}`),

  body("featured")
    .optional()
    .isBoolean()
    .withMessage("featured must be a boolean")
    .toBoolean(),

  body("seo").optional({ checkFalsy: true }).custom(validateSeoField),
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
    .isLength({ max: 20000 })
    .withMessage("Description is too long"),

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
    .isLength({ max: 20000 })
    .withMessage("Challenge is too long"),

  body("solution")
    .optional({ checkFalsy: true })
    .isLength({ max: 20000 })
    .withMessage("Solution is too long"),

  body("status")
    .optional()
    .isIn(CONTENT_STATUSES)
    .withMessage(`status must be one of: ${CONTENT_STATUSES.join(", ")}`),

  body("featured")
    .optional()
    .isBoolean()
    .withMessage("featured must be a boolean")
    .toBoolean(),

  body("seo").optional({ checkFalsy: true }).custom(validateSeoField),
];

export const reorderProjectsValidator = [
  body("orderedIds")
    .isArray({ min: 1 })
    .withMessage("orderedIds must be a non-empty array"),
  body("orderedIds.*")
    .isMongoId()
    .withMessage("Each orderedId must be a valid MongoDB ObjectId"),
];

/**
 * Query validators for GET /api/admin/projects — the admin-only
 * listing that, unlike the public listing, can filter by status,
 * featured flag, and sort by an admin-chosen field.
 */
export const projectAdminListValidators = [
  query("page").optional().isInt({ min: 1 }).withMessage("page must be a positive integer").toInt(),
  query("limit").optional().isInt({ min: 1 }).withMessage("limit must be a positive integer").toInt(),
  query("status")
    .optional()
    .isIn(CONTENT_STATUSES)
    .withMessage(`status must be one of: ${CONTENT_STATUSES.join(", ")}`),
  query("featured")
    .optional()
    .isIn(["true", "false"])
    .withMessage("featured must be 'true' or 'false'"),
  query("search").optional().trim().isLength({ max: 200 }).withMessage("search must not exceed 200 characters"),
  query("category").optional().trim(),
  query("sortBy")
    .optional()
    .isIn(PROJECT_ADMIN_SORT_FIELDS)
    .withMessage(`sortBy must be one of: ${PROJECT_ADMIN_SORT_FIELDS.join(", ")}`),
  query("sortOrder")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("sortOrder must be 'asc' or 'desc'"),
];

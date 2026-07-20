import { body } from "express-validator";
import {
  optionalBoolean,
  optionalOrder,
  optionalTrimmedString,
} from "./common.js";

const PATH_OR_URL_PATTERN = /^\/|^https?:\/\/.+/;

export const updateNavigationValidator = [
  body("items")
    .optional()
    .isArray({ max: 20 })
    .withMessage("items must be an array with at most 20 entries"),

  body("items.*.label")
    .trim()
    .notEmpty()
    .withMessage("Each nav item must have a label")
    .isLength({ max: 50 })
    .withMessage("Nav item label must not exceed 50 characters"),

  body("items.*.path")
    .trim()
    .notEmpty()
    .withMessage("Each nav item must have a path")
    .matches(PATH_OR_URL_PATTERN)
    .withMessage(
      "Nav item path must start with '/' or be a valid HTTP/HTTPS URL",
    )
    .isLength({ max: 2048 })
    .withMessage("Nav item path must not exceed 2048 characters"),

  body("items.*.isExternal")
    .optional()
    .isBoolean()
    .withMessage("isExternal must be a boolean")
    .toBoolean(),

  body("items.*.openInNewTab")
    .optional()
    .isBoolean()
    .withMessage("openInNewTab must be a boolean")
    .toBoolean(),

  body("items.*.visible")
    .optional()
    .isBoolean()
    .withMessage("visible must be a boolean")
    .toBoolean(),

  optionalOrder("items.*.order"),

  optionalBoolean("ctaEnabled"),
  optionalTrimmedString("ctaLabel", { max: 40 }),

  body("ctaUrl")
    .optional({ checkFalsy: true })
    .trim()
    .matches(PATH_OR_URL_PATTERN)
    .withMessage("CTA URL must start with '/' or be a valid HTTP/HTTPS URL")
    .isLength({ max: 2048 })
    .withMessage("CTA URL must not exceed 2048 characters"),
];

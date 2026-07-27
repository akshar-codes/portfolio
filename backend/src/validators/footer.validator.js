import { body } from "express-validator";
import {
  optionalBoolean,
  optionalOrder,
  optionalTrimmedString,
} from "./common.js";
import {
  FOOTER_DESCRIPTION_MAX,
  FOOTER_NEWSLETTER_LIMITS,
} from "../utils/constants.js";

const PATH_OR_URL_PATTERN = /^\/|^https?:\/\/.+/;

export const updateFooterValidator = [
  body("columns")
    .optional()
    .isArray({ max: 6 })
    .withMessage("columns must be an array with at most 6 entries"),

  body("columns.*.title")
    .trim()
    .notEmpty()
    .withMessage("Each footer column must have a title")
    .isLength({ max: 60 })
    .withMessage("Footer column title must not exceed 60 characters"),

  optionalOrder("columns.*.order"),

  body("columns.*.links")
    .optional()
    .isArray({ max: 15 })
    .withMessage("Each footer column may have at most 15 links"),

  body("columns.*.links.*.label")
    .trim()
    .notEmpty()
    .withMessage("Each footer link must have a label")
    .isLength({ max: 50 })
    .withMessage("Footer link label must not exceed 50 characters"),

  body("columns.*.links.*.url")
    .trim()
    .notEmpty()
    .withMessage("Each footer link must have a URL")
    .matches(PATH_OR_URL_PATTERN)
    .withMessage(
      "Footer link URL must start with '/' or be a valid HTTP/HTTPS URL",
    )
    .isLength({ max: 2048 })
    .withMessage("Footer link URL must not exceed 2048 characters"),

  optionalTrimmedString("description", { max: FOOTER_DESCRIPTION_MAX }),
  optionalTrimmedString("copyrightText", { max: 300 }),
  optionalBoolean("showSocialLinks"),
  optionalBoolean("showContactInfo"),

  body("newsletter")
    .optional()
    .isObject()
    .withMessage("newsletter must be an object"),
  optionalBoolean("newsletter.enabled"),
  optionalTrimmedString("newsletter.heading", {
    max: FOOTER_NEWSLETTER_LIMITS.HEADING_MAX,
  }),
  optionalTrimmedString("newsletter.description", {
    max: FOOTER_NEWSLETTER_LIMITS.DESCRIPTION_MAX,
  }),
  optionalTrimmedString("newsletter.placeholder", {
    max: FOOTER_NEWSLETTER_LIMITS.PLACEHOLDER_MAX,
  }),
  optionalTrimmedString("newsletter.buttonLabel", {
    max: FOOTER_NEWSLETTER_LIMITS.BUTTON_LABEL_MAX,
  }),
];

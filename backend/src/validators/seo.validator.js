import { body } from "express-validator";
import {
  optionalTrimmedString,
  optionalUrl,
  optionalBoolean,
} from "./common.js";

export const updateSeoValidator = [
  body("defaultMetaTitle")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Default meta title cannot be empty")
    .isLength({ min: 2, max: 70 })
    .withMessage("Default meta title must be 2-70 characters"),

  optionalTrimmedString("defaultMetaDescription", { max: 160 }),
  optionalUrl("defaultOgImage"),

  body("twitterHandle")
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^@[A-Za-z0-9_]{1,15}$/)
    .withMessage("Twitter handle must start with '@' and be 1-15 characters"),

  optionalUrl("canonicalBaseUrl"),
  optionalBoolean("robotsIndex"),
  optionalBoolean("robotsFollow"),
  optionalBoolean("sitemapEnabled"),
  optionalTrimmedString("googleAnalyticsId", { max: 40 }),
  optionalTrimmedString("googleSiteVerification", { max: 100 }),

  body("organization")
    .optional()
    .isObject()
    .withMessage("organization must be an object"),

  optionalTrimmedString("organization.name", { max: 150 }),
  optionalUrl("organization.url"),
  optionalUrl("organization.logoUrl"),
];

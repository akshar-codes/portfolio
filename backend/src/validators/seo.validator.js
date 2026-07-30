import { body } from "express-validator";
import {
  optionalTrimmedString,
  optionalUrl,
  optionalBoolean,
} from "./common.js";
import {
  SEO_KEYWORDS_MAX,
  SEO_KEYWORD_MAX_LENGTH,
  OG_TYPES,
  TWITTER_CARD_TYPES,
  STRUCTURED_DATA_MAX_LENGTH,
} from "../constants/index.js";

export const updateSeoValidator = [
  body("defaultMetaTitle")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Default meta title cannot be empty")
    .isLength({ min: 2, max: 70 })
    .withMessage("Default meta title must be 2-70 characters"),

  optionalTrimmedString("defaultMetaDescription", { max: 160 }),

  body("defaultKeywords")
    .optional()
    .isArray({ max: SEO_KEYWORDS_MAX })
    .withMessage(
      `defaultKeywords must be an array with at most ${SEO_KEYWORDS_MAX} entries`,
    ),
  body("defaultKeywords.*")
    .trim()
    .notEmpty()
    .withMessage("Keywords cannot be empty strings")
    .isLength({ max: SEO_KEYWORD_MAX_LENGTH })
    .withMessage(`Each keyword must not exceed ${SEO_KEYWORD_MAX_LENGTH} characters`),

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
  optionalTrimmedString("bingSiteVerification", { max: 100 }),

  body("openGraph")
    .optional()
    .isObject()
    .withMessage("openGraph must be an object"),
  optionalTrimmedString("openGraph.title", { max: 70 }),
  optionalTrimmedString("openGraph.description", { max: 200 }),
  optionalUrl("openGraph.image"),
  body("openGraph.type")
    .optional()
    .isIn(OG_TYPES)
    .withMessage(`openGraph.type must be one of: ${OG_TYPES.join(", ")}`),

  body("twitterCard")
    .optional()
    .isObject()
    .withMessage("twitterCard must be an object"),
  body("twitterCard.cardType")
    .optional()
    .isIn(TWITTER_CARD_TYPES)
    .withMessage(
      `twitterCard.cardType must be one of: ${TWITTER_CARD_TYPES.join(", ")}`,
    ),
  optionalTrimmedString("twitterCard.title", { max: 70 }),
  optionalTrimmedString("twitterCard.description", { max: 200 }),
  optionalUrl("twitterCard.image"),

  body("structuredData")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: STRUCTURED_DATA_MAX_LENGTH })
    .withMessage(
      `structuredData must not exceed ${STRUCTURED_DATA_MAX_LENGTH} characters`,
    )
    .custom((value) => {
      try {
        JSON.parse(value);
        return true;
      } catch {
        throw new Error("structuredData must be valid JSON (JSON-LD)");
      }
    }),

  body("organization")
    .optional()
    .isObject()
    .withMessage("organization must be an object"),

  optionalTrimmedString("organization.name", { max: 150 }),
  optionalUrl("organization.url"),
  optionalUrl("organization.logoUrl"),
];

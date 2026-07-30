import { body } from "express-validator";
import { ABOUT_LIMITS } from "../utils/constants.js";
import { optionalOrder, optionalTrimmedString } from "./common.js";

export const updateAboutValidator = [
  // Rich text (Tiptap HTML). The authoritative 8000-character ceiling
  // is enforced by the Mongoose schema AFTER server-side sanitization
  // (services/aboutService.js) strips markup — this is only a
  // generous first-line-of-defense against absurdly large payloads.
  optionalTrimmedString("biography", { max: 30000 }),

  // ── Skills summary — flat tag list ───────────────────────────
  body("skillsSummary")
    .optional()
    .isArray({ max: ABOUT_LIMITS.SKILLS_SUMMARY_MAX })
    .withMessage(
      `skillsSummary must be an array with at most ${ABOUT_LIMITS.SKILLS_SUMMARY_MAX} entries`,
    ),
  body("skillsSummary.*")
    .trim()
    .notEmpty()
    .withMessage("Skill summary items cannot be empty")
    .isLength({ max: 60 })
    .withMessage("Each skill summary item must not exceed 60 characters"),

  // ── Services ──────────────────────────────────────────────────
  body("services")
    .optional()
    .isArray({ max: ABOUT_LIMITS.SERVICES_MAX })
    .withMessage(
      `services must be an array with at most ${ABOUT_LIMITS.SERVICES_MAX} entries`,
    ),
  body("services.*.title")
    .trim()
    .notEmpty()
    .withMessage("Each service must have a title")
    .isLength({ min: 2, max: 100 })
    .withMessage("Service title must be between 2 and 100 characters"),
  body("services.*.description")
    .trim()
    .notEmpty()
    .withMessage("Each service must have a description")
    .isLength({ min: 10, max: 500 })
    .withMessage("Service description must be between 10 and 500 characters"),
  body("services.*.icon")
    .trim()
    .notEmpty()
    .withMessage("Each service must have an icon key")
    .toLowerCase()
    .matches(/^[a-z0-9_-]+$/)
    .withMessage(
      "Icon key may only contain lowercase letters, numbers, hyphens, and underscores",
    )
    .isLength({ max: 40 })
    .withMessage("Icon key must not exceed 40 characters"),
  optionalOrder("services.*.order"),

  // ── Timeline ──────────────────────────────────────────────────
  body("timeline")
    .optional()
    .isArray({ max: ABOUT_LIMITS.TIMELINE_MAX })
    .withMessage(
      `timeline must be an array with at most ${ABOUT_LIMITS.TIMELINE_MAX} entries`,
    ),
  body("timeline.*.title")
    .trim()
    .notEmpty()
    .withMessage("Each timeline entry must have a title")
    .isLength({ min: 2, max: 120 })
    .withMessage("Title must be between 2 and 120 characters"),
  body("timeline.*.subtitle")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 150 })
    .withMessage("Subtitle must not exceed 150 characters"),
  body("timeline.*.dateRange")
    .trim()
    .notEmpty()
    .withMessage("Each timeline entry must have a date range")
    .isLength({ max: 80 })
    .withMessage("Date range must not exceed 80 characters"),
  body("timeline.*.description")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description must not exceed 1000 characters"),
  body("timeline.*.icon")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 60 })
    .withMessage("Icon key must not exceed 60 characters"),
  optionalOrder("timeline.*.order"),

  // ── Highlights ────────────────────────────────────────────────
  body("highlights")
    .optional()
    .isArray({ max: ABOUT_LIMITS.HIGHLIGHTS_MAX })
    .withMessage(
      `highlights must be an array with at most ${ABOUT_LIMITS.HIGHLIGHTS_MAX} entries`,
    ),
  body("highlights.*.value")
    .trim()
    .notEmpty()
    .withMessage("Each highlight must have a value")
    .isLength({ max: 20 })
    .withMessage("Value must not exceed 20 characters"),
  body("highlights.*.label")
    .trim()
    .notEmpty()
    .withMessage("Each highlight must have a label")
    .isLength({ max: 60 })
    .withMessage("Label must not exceed 60 characters"),
  body("highlights.*.icon")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 60 })
    .withMessage("Icon key must not exceed 60 characters"),
  optionalOrder("highlights.*.order"),

  // ── Personal info ─────────────────────────────────────────────
  body("personalInfo")
    .optional()
    .isArray({ max: ABOUT_LIMITS.PERSONAL_INFO_MAX })
    .withMessage(
      `personalInfo must be an array with at most ${ABOUT_LIMITS.PERSONAL_INFO_MAX} entries`,
    ),
  body("personalInfo.*.label")
    .trim()
    .notEmpty()
    .withMessage("Each personal info row must have a label")
    .isLength({ max: 40 })
    .withMessage("Label must not exceed 40 characters"),
  body("personalInfo.*.value")
    .trim()
    .notEmpty()
    .withMessage("Each personal info row must have a value")
    .isLength({ max: 150 })
    .withMessage("Value must not exceed 150 characters"),
  optionalOrder("personalInfo.*.order"),

  // ── Images ────────────────────────────────────────────────────
  body("images")
    .optional()
    .isArray({ max: ABOUT_LIMITS.IMAGES_MAX })
    .withMessage(
      `images must be an array with at most ${ABOUT_LIMITS.IMAGES_MAX} entries`,
    ),
  body("images.*.url")
    .trim()
    .notEmpty()
    .withMessage("Each image must have a URL")
    .matches(/^https?:\/\/.+/)
    .withMessage("Image URL must be a valid HTTP/HTTPS address")
    .isLength({ max: 2048 })
    .withMessage("Image URL must not exceed 2048 characters"),
  body("images.*.altText")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 200 })
    .withMessage("Alt text must not exceed 200 characters"),
  body("images.*.caption")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 200 })
    .withMessage("Caption must not exceed 200 characters"),
  optionalOrder("images.*.order"),
];

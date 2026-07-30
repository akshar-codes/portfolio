import { body } from "express-validator";
import { PROFILE_LIMITS, CTA_BUTTON_STYLES } from "../utils/constants.js";

export const updateProfileValidator = [
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Name cannot be empty")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be 2–100 characters"),

  body("title")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Title cannot be empty")
    .isLength({ min: 2, max: 100 })
    .withMessage("Title must be 2–100 characters"),

  // Rich text (Tiptap HTML). The authoritative 2000-character ceiling
  // is enforced by the Mongoose schema AFTER server-side sanitization
  // (services/profileService.js) strips markup — this check is only a
  // generous first-line-of-defense against absurdly large payloads on
  // the raw, pre-sanitized HTML.
  body("introduction")
    .optional({ checkFalsy: true })
    .isLength({ max: 20000 })
    .withMessage("Introduction is too long"),

  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail()
    .isLength({ max: 254 })
    .withMessage("Email must not exceed 254 characters"),

  body("phone")
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage("Phone must not exceed 30 characters"),

  body("location")
    .optional()
    .trim()
    .isLength({ max: 120 })
    .withMessage("Location must not exceed 120 characters"),

  body("avatar")
    .optional()
    .trim()
    .custom((val) => {
      if (val === "" || /^https?:\/\/.+/.test(val)) return true;
      throw new Error("Avatar must be a valid HTTP/HTTPS URL or empty");
    }),

  // ── Social links array ───────────────────────────────────────
  body("socialLinks")
    .optional()
    .isArray({ max: PROFILE_LIMITS.SOCIAL_LINKS_MAX })
    .withMessage(
      `socialLinks must be an array with at most ${PROFILE_LIMITS.SOCIAL_LINKS_MAX} entries`,
    ),

  body("socialLinks.*.label")
    .trim()
    .notEmpty()
    .withMessage("Each social link must have a label")
    .isLength({ max: 50 })
    .withMessage("Label must not exceed 50 characters"),

  body("socialLinks.*.url")
    .trim()
    .notEmpty()
    .withMessage("Each social link must have a URL")
    .matches(/^https?:\/\/.+/)
    .withMessage("Each social link URL must be a valid HTTP/HTTPS address")
    .isLength({ max: 2048 })
    .withMessage("URL must not exceed 2048 characters"),

  body("socialLinks.*.icon")
    .trim()
    .notEmpty()
    .withMessage("Each social link must have an icon key")
    .toLowerCase()
    .matches(/^[a-z0-9_-]+$/)
    .withMessage(
      "Icon key may only contain lowercase letters, numbers, hyphens, and underscores",
    )
    .isLength({ max: 40 })
    .withMessage("Icon key must not exceed 40 characters"),

  body("socialLinks.*.order")
    .optional()
    .isInt({ min: 0 })
    .withMessage("order must be a non-negative integer"),

  // ── CTA buttons array ────────────────────────────────────────
  body("ctaButtons")
    .optional()
    .isArray({ max: PROFILE_LIMITS.CTA_BUTTONS_MAX })
    .withMessage(
      `ctaButtons must be an array with at most ${PROFILE_LIMITS.CTA_BUTTONS_MAX} entries`,
    ),

  body("ctaButtons.*.label")
    .trim()
    .notEmpty()
    .withMessage("Each CTA button must have a label")
    .isLength({ max: 40 })
    .withMessage("CTA label must not exceed 40 characters"),

  body("ctaButtons.*.url")
    .trim()
    .notEmpty()
    .withMessage("Each CTA button must have a URL")
    .matches(/^\/|^https?:\/\/.+/)
    .withMessage("CTA URL must start with '/' or be a valid HTTP/HTTPS address")
    .isLength({ max: 2048 })
    .withMessage("CTA URL must not exceed 2048 characters"),

  body("ctaButtons.*.style")
    .optional()
    .isIn(CTA_BUTTON_STYLES)
    .withMessage(`style must be one of: ${CTA_BUTTON_STYLES.join(", ")}`),

  body("ctaButtons.*.openInNewTab")
    .optional()
    .isBoolean()
    .withMessage("openInNewTab must be a boolean")
    .toBoolean(),

  body("ctaButtons.*.order")
    .optional()
    .isInt({ min: 0 })
    .withMessage("order must be a non-negative integer"),

  // ── Statistics array ─────────────────────────────────────────
  body("statistics")
    .optional()
    .isArray({ max: PROFILE_LIMITS.STATISTICS_MAX })
    .withMessage(
      `statistics must be an array with at most ${PROFILE_LIMITS.STATISTICS_MAX} entries`,
    ),

  body("statistics.*.value")
    .isFloat({ min: 0 })
    .withMessage("Statistic value must be a non-negative number")
    .toFloat(),

  body("statistics.*.suffix")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 10 })
    .withMessage("Suffix must not exceed 10 characters"),

  body("statistics.*.label")
    .trim()
    .notEmpty()
    .withMessage("Each statistic must have a label")
    .isLength({ max: 60 })
    .withMessage("Label must not exceed 60 characters"),

  body("statistics.*.icon")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 60 })
    .withMessage("Icon key must not exceed 60 characters"),

  body("statistics.*.order")
    .optional()
    .isInt({ min: 0 })
    .withMessage("order must be a non-negative integer"),
];

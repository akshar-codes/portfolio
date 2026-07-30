import { body } from "express-validator";
import {
  optionalTrimmedString,
  optionalUrl,
  optionalHexColor,
  optionalBoolean,
  optionalOrder,
} from "./common.js";
import { THEME_MODES, SITE_SETTINGS_LIMITS } from "../constants/index.js";

const PATH_OR_URL_PATTERN = /^\/|^https?:\/\/.+/;

export const updateSiteSettingsValidator = [
  /* ══════════════════════════════════════════════════════════════
   * WEBSITE
   * ══════════════════════════════════════════════════════════════ */
  body("siteName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Site name cannot be empty")
    .isLength({ min: 2, max: 100 })
    .withMessage("Site name must be 2-100 characters"),

  optionalTrimmedString("tagline", { max: 200 }),
  optionalTrimmedString("timezone", { max: 60 }),
  optionalTrimmedString("defaultLocale", { max: 10 }),

  /* ══════════════════════════════════════════════════════════════
   * BRAND COLORS
   * ══════════════════════════════════════════════════════════════ */
  optionalHexColor("primaryColor"),
  optionalHexColor("secondaryColor"),

  /* ══════════════════════════════════════════════════════════════
   * ANNOUNCEMENT BAR
   * ══════════════════════════════════════════════════════════════ */
  body("announcementBar")
    .optional()
    .isObject()
    .withMessage("announcementBar must be an object"),

  optionalBoolean("announcementBar.enabled"),
  optionalTrimmedString("announcementBar.message", { max: 300 }),
  optionalTrimmedString("announcementBar.ctaLabel", { max: 40 }),

  body("announcementBar.ctaUrl")
    .optional({ checkFalsy: true })
    .trim()
    .matches(PATH_OR_URL_PATTERN)
    .withMessage(
      "Announcement CTA URL must start with '/' or be a valid HTTP/HTTPS URL",
    )
    .isLength({ max: 2048 })
    .withMessage("Announcement CTA URL must not exceed 2048 characters"),

  optionalHexColor("announcementBar.backgroundColor"),
  optionalHexColor("announcementBar.textColor"),
  optionalBoolean("announcementBar.dismissible"),

  /* ══════════════════════════════════════════════════════════════
   * CONTACT INFORMATION — Emails
   * ══════════════════════════════════════════════════════════════ */
  body("contactEmails")
    .optional()
    .isArray({ max: SITE_SETTINGS_LIMITS.CONTACT_EMAILS_MAX })
    .withMessage(
      `contactEmails must be an array with at most ${SITE_SETTINGS_LIMITS.CONTACT_EMAILS_MAX} entries`,
    ),

  body("contactEmails.*.label")
    .trim()
    .notEmpty()
    .withMessage("Each contact email must have a label")
    .isLength({ max: 50 })
    .withMessage("Label must not exceed 50 characters"),

  body("contactEmails.*.email")
    .trim()
    .isEmail()
    .withMessage("Each contact email must be a valid email address")
    .normalizeEmail()
    .isLength({ max: 254 })
    .withMessage("Email must not exceed 254 characters"),

  optionalOrder("contactEmails.*.order"),

  /* ══════════════════════════════════════════════════════════════
   * CONTACT INFORMATION — Phones
   * ══════════════════════════════════════════════════════════════ */
  body("contactPhones")
    .optional()
    .isArray({ max: SITE_SETTINGS_LIMITS.CONTACT_PHONES_MAX })
    .withMessage(
      `contactPhones must be an array with at most ${SITE_SETTINGS_LIMITS.CONTACT_PHONES_MAX} entries`,
    ),

  body("contactPhones.*.label")
    .trim()
    .notEmpty()
    .withMessage("Each contact phone must have a label")
    .isLength({ max: 50 })
    .withMessage("Label must not exceed 50 characters"),

  body("contactPhones.*.phone")
    .trim()
    .notEmpty()
    .withMessage("Each contact phone must have a number")
    .isLength({ max: 30 })
    .withMessage("Phone must not exceed 30 characters"),

  optionalOrder("contactPhones.*.order"),

  /* ══════════════════════════════════════════════════════════════
   * CONTACT INFORMATION — Address
   * ══════════════════════════════════════════════════════════════ */
  body("contactAddress")
    .optional()
    .isObject()
    .withMessage("contactAddress must be an object"),

  optionalTrimmedString("contactAddress.line1", { max: 150 }),
  optionalTrimmedString("contactAddress.line2", { max: 150 }),
  optionalTrimmedString("contactAddress.city", { max: 100 }),
  optionalTrimmedString("contactAddress.state", { max: 100 }),
  optionalTrimmedString("contactAddress.postalCode", { max: 20 }),
  optionalTrimmedString("contactAddress.country", { max: 100 }),

  /* ══════════════════════════════════════════════════════════════
   * RESUME (site-wide download CTA)
   * ══════════════════════════════════════════════════════════════ */
  body("resumeDownload")
    .optional()
    .isObject()
    .withMessage("resumeDownload must be an object"),

  optionalBoolean("resumeDownload.enabled"),
  optionalUrl("resumeDownload.url"),
  optionalTrimmedString("resumeDownload.label", { max: 40 }),

  /* ══════════════════════════════════════════════════════════════
   * THEME
   * ══════════════════════════════════════════════════════════════ */
  body("theme").optional().isObject().withMessage("theme must be an object"),

  body("theme.mode")
    .optional()
    .isIn(THEME_MODES)
    .withMessage(`theme.mode must be one of: ${THEME_MODES.join(", ")}`),

  /* ══════════════════════════════════════════════════════════════
   * ANALYTICS IDS
   * ══════════════════════════════════════════════════════════════ */
  body("analytics")
    .optional()
    .isObject()
    .withMessage("analytics must be an object"),

  optionalTrimmedString("analytics.googleAnalyticsId", { max: 40 }),
  optionalTrimmedString("analytics.googleTagManagerId", { max: 40 }),
  optionalTrimmedString("analytics.facebookPixelId", { max: 40 }),
  optionalTrimmedString("analytics.hotjarId", { max: 40 }),
  optionalTrimmedString("analytics.microsoftClarityId", { max: 40 }),

  /* ══════════════════════════════════════════════════════════════
   * SOCIAL LINKS — visibility switch only (data owned by Profile)
   * ══════════════════════════════════════════════════════════════ */
  optionalBoolean("socialLinksEnabled"),

  /* ══════════════════════════════════════════════════════════════
   * MAINTENANCE MODE
   * ══════════════════════════════════════════════════════════════ */
  optionalBoolean("maintenanceMode"),
  optionalTrimmedString("maintenanceMessage", { max: 500 }),
];

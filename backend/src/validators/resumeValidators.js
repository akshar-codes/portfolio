import { body } from "express-validator";
import {
  optionalBoolean,
  optionalOrder,
  optionalTrimmedString,
  optionalUrl,
} from "./common.js";
import {
  RESUME_AVAILABILITY_STATUSES,
  RESUME_LANGUAGE_PROFICIENCIES,
  RESUME_DOWNLOAD_FILE_TYPES,
  RESUME_LIMITS,
} from "../utils/constants.js";

export const updateResumeValidator = [
  /* ══════════════════════════════════════════════════════════════
   * HERO
   * ══════════════════════════════════════════════════════════════ */
  body("hero").optional().isObject().withMessage("hero must be an object"),
  optionalTrimmedString("hero.greeting", { max: 60 }),
  optionalTrimmedString("hero.headline", { max: 100 }),
  optionalTrimmedString("hero.summary", { max: 300 }),
  body("hero.availabilityStatus")
    .optional()
    .isIn(RESUME_AVAILABILITY_STATUSES)
    .withMessage(
      `availabilityStatus must be one of: ${RESUME_AVAILABILITY_STATUSES.join(", ")}`,
    ),
  optionalTrimmedString("hero.ctaLabel", { max: 40 }),
  optionalBoolean("hero.ctaEnabled"),

  /* ══════════════════════════════════════════════════════════════
   * ABOUT ME
   * ══════════════════════════════════════════════════════════════ */
  body("aboutMe")
    .optional()
    .isObject()
    .withMessage("aboutMe must be an object"),
  optionalTrimmedString("aboutMe.summary", { max: 2000 }),

  /* ══════════════════════════════════════════════════════════════
   * EXPERIENCE
   * ══════════════════════════════════════════════════════════════ */
  body("experience")
    .optional()
    .isArray({ max: RESUME_LIMITS.EXPERIENCE_MAX })
    .withMessage(
      `experience must be an array with at most ${RESUME_LIMITS.EXPERIENCE_MAX} entries`,
    ),

  body("experience.*.role")
    .trim()
    .notEmpty()
    .withMessage("Each experience entry must have a role")
    .isLength({ min: 2, max: 100 })
    .withMessage("Role must be between 2 and 100 characters"),

  body("experience.*.company")
    .trim()
    .notEmpty()
    .withMessage("Each experience entry must have a company")
    .isLength({ min: 2, max: 150 })
    .withMessage("Company must be between 2 and 150 characters"),

  body("experience.*.location")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 120 })
    .withMessage("Location must not exceed 120 characters"),

  body("experience.*.startDate")
    .trim()
    .notEmpty()
    .withMessage("Each experience entry must have a start date")
    .isLength({ max: 40 })
    .withMessage("Start date must not exceed 40 characters"),

  body("experience.*.endDate")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 40 })
    .withMessage("End date must not exceed 40 characters"),

  body("experience.*.current")
    .optional()
    .isBoolean()
    .withMessage("current must be a boolean")
    .toBoolean(),

  body("experience.*.description")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 1500 })
    .withMessage("Description must not exceed 1500 characters"),

  optionalOrder("experience.*.order"),

  /* ══════════════════════════════════════════════════════════════
   * EDUCATION
   * ══════════════════════════════════════════════════════════════ */
  body("education")
    .optional()
    .isArray({ max: RESUME_LIMITS.EDUCATION_MAX })
    .withMessage(
      `education must be an array with at most ${RESUME_LIMITS.EDUCATION_MAX} entries`,
    ),

  body("education.*.institution")
    .trim()
    .notEmpty()
    .withMessage("Each education entry must have an institution")
    .isLength({ min: 2, max: 200 })
    .withMessage("Institution must be between 2 and 200 characters"),

  body("education.*.duration")
    .trim()
    .notEmpty()
    .withMessage("Each education entry must have a duration")
    .isLength({ max: 80 })
    .withMessage("Duration must not exceed 80 characters"),

  body("education.*.description")
    .trim()
    .notEmpty()
    .withMessage("Each education entry must have a description")
    .isLength({ min: 10, max: 1000 })
    .withMessage("Description must be between 10 and 1000 characters"),

  optionalOrder("education.*.order"),

  /* ══════════════════════════════════════════════════════════════
   * CERTIFICATIONS
   * ══════════════════════════════════════════════════════════════ */
  body("certifications")
    .optional()
    .isArray({ max: RESUME_LIMITS.CERTIFICATIONS_MAX })
    .withMessage(
      `certifications must be an array with at most ${RESUME_LIMITS.CERTIFICATIONS_MAX} entries`,
    ),

  body("certifications.*.title")
    .trim()
    .notEmpty()
    .withMessage("Each certification must have a title")
    .isLength({ min: 2, max: 150 })
    .withMessage("Title must be between 2 and 150 characters"),

  body("certifications.*.issuer")
    .trim()
    .notEmpty()
    .withMessage("Each certification must have an issuer")
    .isLength({ min: 2, max: 150 })
    .withMessage("Issuer must be between 2 and 150 characters"),

  body("certifications.*.issueDate")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 40 })
    .withMessage("Issue date must not exceed 40 characters"),

  optionalUrl("certifications.*.credentialUrl"),

  optionalOrder("certifications.*.order"),

  /* ══════════════════════════════════════════════════════════════
   * SKILLS  (unchanged shape — category + items[] + order)
   * ══════════════════════════════════════════════════════════════ */
  body("skills")
    .optional()
    .isArray({ max: RESUME_LIMITS.SKILLS_MAX })
    .withMessage(
      `skills must be an array with at most ${RESUME_LIMITS.SKILLS_MAX} categories`,
    ),

  body("skills.*.category")
    .trim()
    .notEmpty()
    .withMessage("Each skill group must have a category name")
    .isLength({ min: 2, max: 80 })
    .withMessage("Category name must be between 2 and 80 characters"),

  body("skills.*.items")
    .optional()
    .isArray({ min: 0, max: 30 })
    .withMessage("Items must be an array with at most 30 entries"),

  body("skills.*.items.*")
    .trim()
    .notEmpty()
    .withMessage("Skill items cannot be empty strings")
    .isLength({ max: 100 })
    .withMessage("Each skill item must not exceed 100 characters"),

  optionalOrder("skills.*.order"),

  /* ══════════════════════════════════════════════════════════════
   * LANGUAGES
   * ══════════════════════════════════════════════════════════════ */
  body("languages")
    .optional()
    .isArray({ max: RESUME_LIMITS.LANGUAGES_MAX })
    .withMessage(
      `languages must be an array with at most ${RESUME_LIMITS.LANGUAGES_MAX} entries`,
    ),

  body("languages.*.name")
    .trim()
    .notEmpty()
    .withMessage("Each language entry must have a name")
    .isLength({ min: 2, max: 60 })
    .withMessage("Name must be between 2 and 60 characters"),

  body("languages.*.proficiency")
    .optional()
    .isIn(RESUME_LANGUAGE_PROFICIENCIES)
    .withMessage(
      `proficiency must be one of: ${RESUME_LANGUAGE_PROFICIENCIES.join(", ")}`,
    ),

  optionalOrder("languages.*.order"),

  /* ══════════════════════════════════════════════════════════════
   * INTERESTS
   * ══════════════════════════════════════════════════════════════ */
  body("interests")
    .optional()
    .isArray({ max: RESUME_LIMITS.INTERESTS_MAX })
    .withMessage(
      `interests must be an array with at most ${RESUME_LIMITS.INTERESTS_MAX} entries`,
    ),

  body("interests.*.name")
    .trim()
    .notEmpty()
    .withMessage("Each interest must have a name")
    .isLength({ min: 1, max: 60 })
    .withMessage("Name must be between 1 and 60 characters"),

  body("interests.*.icon")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 60 })
    .withMessage("Icon key must not exceed 60 characters"),

  optionalOrder("interests.*.order"),

  /* ══════════════════════════════════════════════════════════════
   * DOWNLOADS
   * ══════════════════════════════════════════════════════════════ */
  body("downloads")
    .optional()
    .isArray({ max: RESUME_LIMITS.DOWNLOADS_MAX })
    .withMessage(
      `downloads must be an array with at most ${RESUME_LIMITS.DOWNLOADS_MAX} entries`,
    ),

  body("downloads.*.label")
    .trim()
    .notEmpty()
    .withMessage("Each download must have a label")
    .isLength({ min: 2, max: 80 })
    .withMessage("Label must be between 2 and 80 characters"),

  body("downloads.*.url")
    .trim()
    .notEmpty()
    .withMessage("Each download must have a URL")
    .matches(/^https?:\/\/.+/)
    .withMessage("Download URL must be a valid HTTP/HTTPS address")
    .isLength({ max: 2048 })
    .withMessage("Download URL must not exceed 2048 characters"),

  body("downloads.*.fileType")
    .optional()
    .isIn(RESUME_DOWNLOAD_FILE_TYPES)
    .withMessage(
      `fileType must be one of: ${RESUME_DOWNLOAD_FILE_TYPES.join(", ")}`,
    ),

  optionalOrder("downloads.*.order"),
];

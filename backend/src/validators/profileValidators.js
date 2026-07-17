import { body } from "express-validator";

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
    .isArray({ max: 10 })
    .withMessage("socialLinks must be an array with at most 10 entries"),

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
];

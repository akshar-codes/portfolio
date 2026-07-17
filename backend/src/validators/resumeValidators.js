import { body } from "express-validator";

export const updateResumeValidator = [
  body("section")
    .isIn(["education", "skills"])
    .withMessage('section must be "education" or "skills"'),

  body("value").isArray({ min: 0 }).withMessage("value must be an array"),

  // ── Education item validators ────────────────────────────────
  body("value.*.institution")
    .if(body("section").equals("education"))
    .trim()
    .notEmpty()
    .withMessage("Each education entry must have an institution")
    .isLength({ max: 200 })
    .withMessage("Institution must not exceed 200 characters"),

  body("value.*.duration")
    .if(body("section").equals("education"))
    .trim()
    .notEmpty()
    .withMessage("Each education entry must have a duration")
    .isLength({ max: 80 })
    .withMessage("Duration must not exceed 80 characters"),

  body("value.*.description")
    .if(body("section").equals("education"))
    .trim()
    .notEmpty()
    .withMessage("Each education entry must have a description")
    .isLength({ min: 10, max: 1000 })
    .withMessage("Description must be between 10 and 1000 characters"),

  // ── Skill category validators ────────────────────────────────
  body("value.*.category")
    .if(body("section").equals("skills"))
    .trim()
    .notEmpty()
    .withMessage("Each skill group must have a category name")
    .isLength({ max: 80 })
    .withMessage("Category name must not exceed 80 characters"),

  body("value.*.items")
    .if(body("section").equals("skills"))
    .isArray({ min: 0, max: 30 })
    .withMessage("Items must be an array with at most 30 entries"),

  body("value.*.items.*")
    .if(body("section").equals("skills"))
    .trim()
    .notEmpty()
    .withMessage("Skill items cannot be empty strings")
    .isLength({ max: 100 })
    .withMessage("Each skill item must not exceed 100 characters"),

  body("value.*.order")
    .if(body("section").equals("skills"))
    .optional()
    .isInt({ min: 0 })
    .withMessage("order must be a non-negative integer"),
];

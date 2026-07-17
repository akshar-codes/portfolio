import { body } from "express-validator";

export const updateAboutValidator = [
  body("section")
    .isIn(["paragraphs", "services"])
    .withMessage('section must be "paragraphs" or "services"'),

  body("value").isArray({ min: 0 }).withMessage("value must be an array"),

  // ── Paragraph validators ─────────────────────────────────────
  body("value.*.text")
    .if(body("section").equals("paragraphs"))
    .trim()
    .notEmpty()
    .withMessage("Each paragraph must have text")
    .isLength({ min: 10, max: 1000 })
    .withMessage("Paragraph text must be between 10 and 1000 characters"),

  body("value.*.order")
    .if(body("section").equals("paragraphs"))
    .isInt({ min: 0 })
    .withMessage("order must be a non-negative integer"),

  // ── Service validators ───────────────────────────────────────
  body("value.*.title")
    .if(body("section").equals("services"))
    .trim()
    .notEmpty()
    .withMessage("Each service must have a title")
    .isLength({ min: 2, max: 100 })
    .withMessage("Service title must be between 2 and 100 characters"),

  body("value.*.description")
    .if(body("section").equals("services"))
    .trim()
    .notEmpty()
    .withMessage("Each service must have a description")
    .isLength({ min: 10, max: 500 })
    .withMessage("Service description must be between 10 and 500 characters"),

  body("value.*.icon")
    .if(body("section").equals("services"))
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

  body("value.*.order")
    .if(body("section").equals("services"))
    .isInt({ min: 0 })
    .withMessage("order must be a non-negative integer"),
];

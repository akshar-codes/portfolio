import { body } from "express-validator";

export const sendMessageValidator = [
  body("fullname")
    .trim()
    .notEmpty()
    .withMessage("Full name is required")
    .isLength({ min: 2 })
    .withMessage("Name must be at least 2 characters"),

  body("email")
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail(),

  body("message")
    .trim()
    .notEmpty()
    .withMessage("Message cannot be empty")
    .isLength({ min: 10 })
    .withMessage("Message must be at least 10 characters"),

  body("website").optional().equals("").withMessage("Bot detected"),
];

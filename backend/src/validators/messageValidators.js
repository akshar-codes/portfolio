import { body, param } from "express-validator";
import { MESSAGE_STATUSES } from "../utils/constants.js";

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

export const updateMessageStatusValidator = [
  param("id").isMongoId().withMessage("Invalid message ID"),
  body("status")
    .isIn(MESSAGE_STATUSES)
    .withMessage(`status must be one of: ${MESSAGE_STATUSES.join(", ")}`),
];

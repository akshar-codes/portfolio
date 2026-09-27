import { body, param, query } from "express-validator";
import {
  MESSAGE_STATUSES,
  MESSAGE_SORT_FIELDS,
  MESSAGE_BULK_MAX,
} from "../constants/index.js";

/* ================================================================== *
 * Public — contact form submission (unchanged contract)
 * ================================================================== */

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

/* ================================================================== *
 * Admin — single-message param/body validators
 * ================================================================== */

export const messageIdParamValidator = [
  param("id").isMongoId().withMessage("Invalid message ID"),
];

export const updateMessageStatusValidator = [
  param("id").isMongoId().withMessage("Invalid message ID"),
  body("status")
    .isIn(MESSAGE_STATUSES)
    .withMessage(`status must be one of: ${MESSAGE_STATUSES.join(", ")}`),
];

export const replyMessageValidator = [
  param("id").isMongoId().withMessage("Invalid message ID"),
  body("subject")
    .trim()
    .customSanitizer((value) => value.replace(/[\r\n]+/g, " "))
    .notEmpty()
    .withMessage("Email subject is required")
    .isLength({ max: 200 })
    .withMessage("Email subject must not exceed 200 characters"),
  body("body")
    .trim()
    .notEmpty()
    .withMessage("Reply message is required")
    .isLength({ max: 10000 })
    .withMessage("Reply must not exceed 10,000 characters"),
];

export const toggleSpamValidator = [
  param("id").isMongoId().withMessage("Invalid message ID"),
  body("isSpam")
    .isBoolean()
    .withMessage("isSpam must be a boolean")
    .toBoolean(),
];

/* ================================================================== *
 * Admin — listing query validators
 * ================================================================== */

export const messageListQueryValidator = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("page must be a positive integer")
    .toInt(),
  query("limit")
    .optional()
    .isInt({ min: 1 })
    .withMessage("limit must be a positive integer")
    .toInt(),
  query("status")
    .optional()
    .isIn(MESSAGE_STATUSES)
    .withMessage(`status must be one of: ${MESSAGE_STATUSES.join(", ")}`),
  query("archived")
    .optional()
    .isIn(["true", "false", "all"])
    .withMessage("archived must be 'true', 'false', or 'all'"),
  query("spam")
    .optional()
    .isIn(["true", "false", "all"])
    .withMessage("spam must be 'true', 'false', or 'all'"),
  query("search")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("search must not exceed 200 characters"),
  query("dateFrom")
    .optional()
    .isISO8601()
    .withMessage("dateFrom must be a valid date"),
  query("dateTo")
    .optional()
    .isISO8601()
    .withMessage("dateTo must be a valid date"),
  query("sortBy")
    .optional()
    .isIn(MESSAGE_SORT_FIELDS)
    .withMessage(`sortBy must be one of: ${MESSAGE_SORT_FIELDS.join(", ")}`),
  query("sortOrder")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("sortOrder must be 'asc' or 'desc'"),
];

/* ================================================================== *
 * Admin — bulk action validators
 * ================================================================== */

export const bulkIdsValidator = [
  body("ids")
    .isArray({ min: 1, max: MESSAGE_BULK_MAX })
    .withMessage(
      `ids must be an array with between 1 and ${MESSAGE_BULK_MAX} entries`,
    ),
  body("ids.*")
    .isMongoId()
    .withMessage("Each id must be a valid MongoDB ObjectId"),
];

export const bulkStatusValidator = [
  ...bulkIdsValidator,
  body("status")
    .isIn(MESSAGE_STATUSES)
    .withMessage(`status must be one of: ${MESSAGE_STATUSES.join(", ")}`),
];

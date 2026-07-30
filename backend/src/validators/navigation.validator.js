import { body } from "express-validator";
import {
  optionalBoolean,
  optionalOrder,
  optionalTrimmedString,
} from "./common.js";
import { NAV_MAX_ITEMS, NAV_MAX_CHILDREN_PER_ITEM } from "../constants/index.js";

const PATH_OR_URL_PATTERN = /^\/|^https?:\/\/.+/;

/**
 * Collects every internal (non-external) path across the top-level
 * items AND their nested children, and flags the request if any path
 * repeats. External links are exempt — the same external URL may
 * legitimately appear more than once (e.g. a repeated social/CTA
 * link), but two internal routes can never point anywhere but one
 * page, so a duplicate internal path always signals a mistake.
 */
function hasDuplicateInternalPaths(items = []) {
  const seen = new Set();
  for (const item of items) {
    const candidates = [
      item,
      ...(Array.isArray(item.children) ? item.children : []),
    ];
    for (const candidate of candidates) {
      if (candidate.isExternal) continue;
      const normalized = (candidate.path || "").trim().toLowerCase();
      if (!normalized) continue;
      if (seen.has(normalized)) return true;
      seen.add(normalized);
    }
  }
  return false;
}

export const updateNavigationValidator = [
  body("items")
    .optional()
    .isArray({ max: NAV_MAX_ITEMS })
    .withMessage(`items must be an array with at most ${NAV_MAX_ITEMS} entries`)
    .custom((items) => {
      if (hasDuplicateInternalPaths(items)) {
        throw new Error(
          "Duplicate internal route detected — each internal path (non-external link) must be unique across the navigation, including dropdown items.",
        );
      }
      return true;
    }),

  body("items.*.label")
    .trim()
    .notEmpty()
    .withMessage("Each nav item must have a label")
    .isLength({ max: 50 })
    .withMessage("Nav item label must not exceed 50 characters"),

  body("items.*.path")
    .trim()
    .notEmpty()
    .withMessage("Each nav item must have a path")
    .matches(PATH_OR_URL_PATTERN)
    .withMessage(
      "Nav item path must start with '/' or be a valid HTTP/HTTPS URL",
    )
    .isLength({ max: 2048 })
    .withMessage("Nav item path must not exceed 2048 characters"),

  body("items.*.isExternal")
    .optional()
    .isBoolean()
    .withMessage("isExternal must be a boolean")
    .toBoolean(),

  body("items.*.openInNewTab")
    .optional()
    .isBoolean()
    .withMessage("openInNewTab must be a boolean")
    .toBoolean(),

  body("items.*.visible")
    .optional()
    .isBoolean()
    .withMessage("visible must be a boolean")
    .toBoolean(),

  optionalOrder("items.*.order"),

  /* ── Nested dropdown children ─────────────────────────────────── */
  body("items.*.children")
    .optional()
    .isArray({ max: NAV_MAX_CHILDREN_PER_ITEM })
    .withMessage(
      `Each nav item must not exceed ${NAV_MAX_CHILDREN_PER_ITEM} dropdown children`,
    ),

  body("items.*.children.*.label")
    .trim()
    .notEmpty()
    .withMessage("Each dropdown item must have a label")
    .isLength({ max: 50 })
    .withMessage("Dropdown item label must not exceed 50 characters"),

  body("items.*.children.*.path")
    .trim()
    .notEmpty()
    .withMessage("Each dropdown item must have a path")
    .matches(PATH_OR_URL_PATTERN)
    .withMessage(
      "Dropdown item path must start with '/' or be a valid HTTP/HTTPS URL",
    )
    .isLength({ max: 2048 })
    .withMessage("Dropdown item path must not exceed 2048 characters"),

  body("items.*.children.*.isExternal")
    .optional()
    .isBoolean()
    .withMessage("isExternal must be a boolean")
    .toBoolean(),

  body("items.*.children.*.openInNewTab")
    .optional()
    .isBoolean()
    .withMessage("openInNewTab must be a boolean")
    .toBoolean(),

  body("items.*.children.*.visible")
    .optional()
    .isBoolean()
    .withMessage("visible must be a boolean")
    .toBoolean(),

  optionalOrder("items.*.children.*.order"),

  optionalBoolean("ctaEnabled"),
  optionalTrimmedString("ctaLabel", { max: 40 }),

  body("ctaUrl")
    .optional({ checkFalsy: true })
    .trim()
    .matches(PATH_OR_URL_PATTERN)
    .withMessage("CTA URL must start with '/' or be a valid HTTP/HTTPS URL")
    .isLength({ max: 2048 })
    .withMessage("CTA URL must not exceed 2048 characters"),
];

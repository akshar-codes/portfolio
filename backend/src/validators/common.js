import { body } from "express-validator";

/**
 * Reusable, standardized validation-chain builders shared across every
 * singleton CMS resource (SiteSettings, Navigation, Footer, SEO, ...).
 * Keeps constraint patterns (URL shape, hex colors, email, booleans,
 * order integers) defined once instead of re-typed per validator file.
 */

/** Optional trimmed string. Empty string is treated as "unset" and skips length checks. */
export function optionalTrimmedString(field, { min, max } = {}) {
  let chain = body(field).optional({ checkFalsy: true }).trim();

  if (min !== undefined) {
    chain = chain
      .isLength({ min })
      .withMessage(`${field} must be at least ${min} characters`);
  }
  if (max !== undefined) {
    chain = chain
      .isLength({ max })
      .withMessage(`${field} must not exceed ${max} characters`);
  }
  return chain;
}

/** Optional field that must be empty or a valid http(s) URL. */
export function optionalUrl(field, { max = 2048 } = {}) {
  return body(field)
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^https?:\/\/.+/)
    .withMessage(`${field} must be a valid HTTP/HTTPS URL`)
    .isLength({ max })
    .withMessage(`${field} must not exceed ${max} characters`);
}

/** Optional field that must be empty or a #rgb / #rrggbb / #rrggbbaa hex color. */
export function optionalHexColor(field) {
  return body(field)
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/)
    .withMessage(`${field} must be a valid hex color (e.g. #00ff88)`);
}

/** Optional field that must be empty or a valid, normalized email address. */
export function optionalEmail(field, { max = 254 } = {}) {
  return body(field)
    .optional({ checkFalsy: true })
    .trim()
    .isEmail()
    .withMessage(`${field} must be a valid email address`)
    .normalizeEmail()
    .isLength({ max })
    .withMessage(`${field} must not exceed ${max} characters`);
}

/** Optional boolean field, coerced to a real boolean when present. */
export function optionalBoolean(field) {
  return body(field)
    .optional()
    .isBoolean()
    .withMessage(`${field} must be a boolean`)
    .toBoolean();
}

/** Optional non-negative integer `order` field, used by orderable array items. */
export function optionalOrder(field = "order") {
  return body(field)
    .optional()
    .isInt({ min: 0 })
    .withMessage(`${field} must be a non-negative integer`)
    .toInt();
}

import logger from "../utils/logger.js";

const DANGEROUS_KEY = /^\$|\./;
const REPLACE_WITH = "_";

function sanitize(value) {
  if (Array.isArray(value)) {
    return value.map(sanitize);
  }

  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, val]) => {
        const safeKey = DANGEROUS_KEY.test(key)
          ? key.replace(/^\$+/, REPLACE_WITH).replace(/\./g, REPLACE_WITH)
          : key;

        if (safeKey !== key) {
          logger.warn("[mongoSanitize] Replaced dangerous key", {
            original: key,
            replacement: safeKey,
          });
        }

        return [safeKey, sanitize(val)];
      }),
    );
  }

  return value;
}

/**
 * Mutates an object's keys/values in-place.
 * Used for req.query in Express 5 where the property is a read-only getter
 * — direct reassignment (req.query = ...) throws a TypeError.
 */
function sanitizeInPlace(obj) {
  for (const key of Object.keys(obj)) {
    const safeKey = DANGEROUS_KEY.test(key)
      ? key.replace(/^\$+/, REPLACE_WITH).replace(/\./g, REPLACE_WITH)
      : key;

    const safeVal = sanitize(obj[key]);

    if (safeKey !== key) {
      logger.warn("[mongoSanitize] Replaced dangerous key", {
        original: key,
        replacement: safeKey,
      });
      delete obj[key];
    }

    obj[safeKey] = safeVal;
  }
}

const mongoSanitize = (req, _res, next) => {
  // req.body and req.params can be reassigned normally
  if (req.body && typeof req.body === "object") {
    req.body = sanitize(req.body);
  }

  if (req.params && typeof req.params === "object") {
    req.params = sanitize(req.params);
  }

  // Express 5: req.query is a read-only getter — cannot reassign.
  // Mutate the existing parsed object in-place instead.
  if (req.query && typeof req.query === "object") {
    sanitizeInPlace(req.query);
  }

  next();
};

export default mongoSanitize;

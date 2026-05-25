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

const mongoSanitize = (req, _res, next) => {
  if (req.body && typeof req.body === "object") {
    req.body = sanitize(req.body);
  }

  if (req.params && typeof req.params === "object") {
    req.params = sanitize(req.params);
  }

  if (req.query && typeof req.query === "object") {
    req.query = sanitize(req.query);
  }

  next();
};

export default mongoSanitize;

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
          console.warn(
            `[mongoSanitize] Replaced dangerous key "${key}" → "${safeKey}"`,
          );
        }

        return [safeKey, sanitize(val)];
      }),
    );
  }

  return value;
}

const mongoSanitize = (req, res, next) => {
  if (req.body && typeof req.body === "object") {
    req.body = sanitize(req.body);
  }

  if (req.params && typeof req.params === "object") {
    req.params = sanitize(req.params);
  }

  next();
};

export default mongoSanitize;

const HTTP_URL_PATTERN = /^https?:\/\/.+/;

/** True if `value` is empty-safe-checked http(s) URL. */
export function isValidHttpUrl(value) {
  return HTTP_URL_PATTERN.test((value ?? "").trim());
}

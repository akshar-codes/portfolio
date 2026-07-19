import { isValidHttpUrl } from "./url.js";

/** Validates the { label, url, icon } shape used by the social-link editor. */
export function isValidSocialLink({ label, url, icon }) {
  return Boolean(
    label?.trim() && url?.trim() && icon?.trim() && isValidHttpUrl(url),
  );
}

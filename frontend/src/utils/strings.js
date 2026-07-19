/**
 * Returns up to 2 uppercase initials from a full name.
 * Extracted from admin/Messages.jsx — the only prior consumer.
 */
export function getInitials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

/** Truncates text to `max` characters, appending an ellipsis if cut. */
export function truncate(text = "", max = 100) {
  if (!text) return "";
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

/**
 * Strips markup from CMS rich-text (Tiptap HTML) fields, for use in
 * <meta name="description"> tags, card previews, and anywhere else a
 * plain-text excerpt is needed. Collapses whitespace left behind by
 * stripped block-level tags.
 */
export function stripHtml(html = "") {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Truncates plain text to `max` characters, appending an ellipsis if cut. */
export function truncateText(text = "", max = 160) {
  if (!text) return "";
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;
}

/** Convenience: strip + truncate in one call, for meta descriptions. */
export function excerptFromHtml(html = "", max = 160) {
  return truncateText(stripHtml(html), max);
}

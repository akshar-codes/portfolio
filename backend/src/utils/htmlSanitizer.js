import sanitizeHtml from "sanitize-html";
import { RICH_TEXT_ALLOWED_TAGS } from "./constants.js";

/**
 * Server-side sanitizer for rich text fields persisted from the admin
 * Tiptap editor (RichTextEditor.jsx). The frontend already sanitizes
 * with DOMPurify before it ever hits the wire, but that is a UX
 * safeguard, not a security boundary — anyone calling the API
 * directly (Postman, a script, a compromised admin session token)
 * bypasses it entirely. Every rich text field that is later rendered
 * with `dangerouslySetInnerHTML` on the public site MUST be sanitized
 * here before it reaches Mongoose, not just in the browser.
 *
 * The allow-list mirrors RichTextEditor.jsx's SANITIZE_CONFIG exactly
 * so admin-authored content never renders differently than what the
 * editor showed at save time.
 */
const ALLOWED_ATTRIBUTES = {
  a: ["href", "target", "rel"],
};

const ALLOWED_SCHEMES = ["http", "https", "mailto"];

export function sanitizeRichText(html) {
  if (typeof html !== "string" || html.trim() === "") return "";

  const clean = sanitizeHtml(html, {
    allowedTags: RICH_TEXT_ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRIBUTES,
    allowedSchemes: ALLOWED_SCHEMES,
    allowedSchemesByTag: { a: ALLOWED_SCHEMES },
    disallowedTagsMode: "discard",
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", {
        rel: "noopener noreferrer",
      }),
    },
  });

  return clean.trim();
}

export default sanitizeRichText;

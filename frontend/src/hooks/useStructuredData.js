import { useEffect } from "react";

/**
 * Injects one or more JSON-LD structured-data objects as a
 * `<script type="application/ld+json">` element in `<head>`.
 *
 * The script is removed (not just emptied) when the component unmounts,
 * so navigating away from a page never leaves orphaned JSON-LD behind.
 *
 * @param {object|object[]|null} schema
 *   A single schema.org JSON-LD object, an array of them, or null/undefined
 *   to skip injection (useful while async data is still loading).
 *
 * @example
 * // Emit a Person schema
 * useStructuredData({
 *   "@context": "https://schema.org",
 *   "@type": "Person",
 *   name: profile.name,
 *   url: seo.canonicalBaseUrl,
 * });
 *
 * @example
 * // Emit multiple schemas in one <script> block
 * useStructuredData([personSchema, websiteSchema]);
 */
export function useStructuredData(schema) {
  useEffect(() => {
    // Skip if there's nothing to inject (still loading, etc.).
    if (!schema) return;

    const payload = Array.isArray(schema) ? schema : [schema];

    // Filter out any null/undefined entries produced while data loads.
    const valid = payload.filter(Boolean);
    if (valid.length === 0) return;

    const script = document.createElement("script");
    script.setAttribute("type", "application/ld+json");
    script.textContent = JSON.stringify(
      valid.length === 1 ? valid[0] : valid,
      null,
      0, // minified — no pretty-printing in production
    );
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [schema]); // Re-inject whenever the schema reference changes
}

export default useStructuredData;

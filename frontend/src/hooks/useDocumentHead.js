import { useEffect } from "react";

/* ------------------------------------------------------------------ *
 * DOM helpers
 * ------------------------------------------------------------------ */

/**
 * Upsert a <meta> element identified by an attribute key+value pair.
 * Returns the previous content value so the caller can restore it.
 */
function upsertMeta(attr, key, content) {
  if (!content && content !== "") return undefined; // nothing to write
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  const prev = el ? el.getAttribute("content") : null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
  return prev;
}

/**
 * Upsert a <link> element identified by its `rel` attribute.
 * Returns the previous href value.
 */
function upsertLink(rel, href) {
  if (!href) return undefined;
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  const prev = el ? el.getAttribute("href") : null;
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
  return prev;
}

/**
 * Remove a <meta> element whose attribute key+value pair matches, but
 * only if it was *created* by this hook (i.e. it had no prior value).
 * Otherwise restore the previous value.
 */
function restoreMeta(attr, key, prev) {
  const el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) return;
  if (prev === null) {
    el.parentNode?.removeChild(el); // we created it — remove it
  } else {
    el.setAttribute("content", prev); // restore previous value
  }
}

/** Same restore logic for <link rel="…"> elements. */
function restoreLink(rel, prev) {
  const el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) return;
  if (prev === null) {
    el.parentNode?.removeChild(el);
  } else {
    el.setAttribute("href", prev);
  }
}

/* ------------------------------------------------------------------ *
 * Public API — merges global CMS SEO data with per-page overrides
 * ------------------------------------------------------------------ */

/**
 * Build the final meta-tag values for a page by layering page-specific
 * overrides on top of the global CMS SEO singleton's data.
 *
 * Fallback chain (left-to-right, first non-empty wins):
 *   title       : pageTitle → seo.defaultMetaTitle
 *   description : pageDescription → seo.defaultMetaDescription
 *   image       : pageImage → seo.openGraph.image → seo.defaultOgImage
 *   canonical   : pageCanonical (full URL, already built by the caller)
 *   keywords    : pageKeywords → seo.defaultKeywords
 *   robots      : robotsIndex/Follow from seo singleton
 *   ogType      : pageOgType → seo.openGraph.type → "website"
 *   ogSiteName  : seo.canonicalBaseUrl (hostname only)
 *   twitter     : seo.twitterCard + seo.twitterHandle
 *   verification: seo.googleSiteVerification, seo.bingSiteVerification
 */
export function buildPageSeo(seo = {}, overrides = {}) {
  const {
    pageTitle,
    pageDescription,
    pageImage,
    pageCanonical,
    pageKeywords = [],
    pageOgType,
  } = overrides;

  const image =
    pageImage ||
    seo.openGraph?.image ||
    seo.defaultOgImage ||
    "";

  const keywords = pageKeywords.length
    ? pageKeywords
    : seo.defaultKeywords ?? [];

  const ogTitle =
    seo.openGraph?.title || pageTitle || seo.defaultMetaTitle || "";

  const ogDescription =
    seo.openGraph?.description || pageDescription || seo.defaultMetaDescription || "";

  const twitterTitle =
    seo.twitterCard?.title || ogTitle;

  const twitterDescription =
    seo.twitterCard?.description || ogDescription;

  const twitterImage =
    seo.twitterCard?.image || image;

  let siteName = "";
  try {
    if (seo.canonicalBaseUrl) {
      siteName = new URL(seo.canonicalBaseUrl).hostname;
    }
  } catch {
    // invalid URL — leave siteName empty
  }

  const robotsIndex  = seo.robotsIndex  ?? true;
  const robotsFollow = seo.robotsFollow ?? true;
  const robots = [
    robotsIndex  ? "index"   : "noindex",
    robotsFollow ? "follow"  : "nofollow",
  ].join(", ");

  return {
    title       : pageTitle || seo.defaultMetaTitle || "",
    description : pageDescription || seo.defaultMetaDescription || "",
    keywords    : keywords.join(", "),
    canonical   : pageCanonical || "",
    robots,
    // OpenGraph
    ogTitle,
    ogDescription,
    ogImage     : image,
    ogType      : pageOgType || seo.openGraph?.type || "website",
    ogUrl       : pageCanonical || seo.canonicalBaseUrl || "",
    ogSiteName  : siteName,
    // Twitter
    twitterCard        : seo.twitterCard?.cardType || "summary_large_image",
    twitterSite        : seo.twitterHandle || "",
    twitterTitle,
    twitterDescription,
    twitterImage,
    // Verification
    googleSiteVerification : seo.googleSiteVerification || "",
    bingSiteVerification   : seo.bingSiteVerification   || "",
  };
}

/* ------------------------------------------------------------------ *
 * Hook
 * ------------------------------------------------------------------ */

/**
 * Manages per-page document <head> meta tags.
 *
 * Pass the resolved values from `buildPageSeo()` (or a manual object
 * with the same shape). Every tag this effect writes is tracked and
 * either restored to its previous value or removed entirely on unmount,
 * so navigating between pages never leaves stale tags behind.
 *
 * @param {object} meta
 * @param {string} [meta.title]
 * @param {string} [meta.description]
 * @param {string} [meta.keywords]
 * @param {string} [meta.canonical]
 * @param {string} [meta.robots]            e.g. "index, follow"
 * @param {string} [meta.ogTitle]
 * @param {string} [meta.ogDescription]
 * @param {string} [meta.ogImage]
 * @param {string} [meta.ogType]            defaults to "website"
 * @param {string} [meta.ogUrl]
 * @param {string} [meta.ogSiteName]
 * @param {string} [meta.twitterCard]       defaults to "summary_large_image"
 * @param {string} [meta.twitterSite]       @handle
 * @param {string} [meta.twitterTitle]
 * @param {string} [meta.twitterDescription]
 * @param {string} [meta.twitterImage]
 * @param {string} [meta.googleSiteVerification]
 * @param {string} [meta.bingSiteVerification]
 */
export function useDocumentHead({
  title,
  description,
  keywords,
  canonical,
  robots,
  ogTitle,
  ogDescription,
  ogImage,
  ogType,
  ogUrl,
  ogSiteName,
  twitterCard,
  twitterSite,
  twitterTitle,
  twitterDescription,
  twitterImage,
  googleSiteVerification,
  bingSiteVerification,
} = {}) {
  useEffect(() => {
    const previousTitle = document.title;
    if (title) document.title = title;

    // ── Primary meta ────────────────────────────────────────────────
    const prevDescription  = upsertMeta("name", "description",  description);
    const prevKeywords     = upsertMeta("name", "keywords",     keywords);
    const prevRobots       = upsertMeta("name", "robots",       robots);
    const prevCanonical    = upsertLink("canonical",            canonical);

    // ── OpenGraph ───────────────────────────────────────────────────
    const prevOgTitle       = upsertMeta("property", "og:title",       ogTitle       || title);
    const prevOgDesc        = upsertMeta("property", "og:description",  ogDescription || description);
    const prevOgImage       = upsertMeta("property", "og:image",       ogImage);
    const prevOgType        = upsertMeta("property", "og:type",        ogType        || "website");
    const prevOgUrl         = upsertMeta("property", "og:url",         ogUrl         || canonical);
    const prevOgSiteName    = upsertMeta("property", "og:site_name",   ogSiteName);

    // ── Twitter Card ────────────────────────────────────────────────
    const prevTwCard        = upsertMeta("name", "twitter:card",        twitterCard        || "summary_large_image");
    const prevTwSite        = upsertMeta("name", "twitter:site",        twitterSite);
    const prevTwTitle       = upsertMeta("name", "twitter:title",       twitterTitle       || ogTitle || title);
    const prevTwDesc        = upsertMeta("name", "twitter:description", twitterDescription || ogDescription || description);
    const prevTwImage       = upsertMeta("name", "twitter:image",       twitterImage       || ogImage);

    // ── Verification ─────────────────────────────────────────────────
    const prevGoogleVerif   = upsertMeta("name", "google-site-verification", googleSiteVerification);
    const prevBingVerif     = upsertMeta("name", "msvalidate.01",            bingSiteVerification);

    return () => {
      document.title = previousTitle;

      restoreMeta("name", "description",  prevDescription);
      restoreMeta("name", "keywords",     prevKeywords);
      restoreMeta("name", "robots",       prevRobots);
      restoreLink("canonical",            prevCanonical);

      restoreMeta("property", "og:title",       prevOgTitle);
      restoreMeta("property", "og:description", prevOgDesc);
      restoreMeta("property", "og:image",       prevOgImage);
      restoreMeta("property", "og:type",        prevOgType);
      restoreMeta("property", "og:url",         prevOgUrl);
      restoreMeta("property", "og:site_name",   prevOgSiteName);

      restoreMeta("name", "twitter:card",        prevTwCard);
      restoreMeta("name", "twitter:site",        prevTwSite);
      restoreMeta("name", "twitter:title",       prevTwTitle);
      restoreMeta("name", "twitter:description", prevTwDesc);
      restoreMeta("name", "twitter:image",       prevTwImage);

      restoreMeta("name", "google-site-verification", prevGoogleVerif);
      restoreMeta("name", "msvalidate.01",            prevBingVerif);
    };
  }, [
    title, description, keywords, canonical, robots,
    ogTitle, ogDescription, ogImage, ogType, ogUrl, ogSiteName,
    twitterCard, twitterSite, twitterTitle, twitterDescription, twitterImage,
    googleSiteVerification, bingSiteVerification,
  ]);
}

export default useDocumentHead;

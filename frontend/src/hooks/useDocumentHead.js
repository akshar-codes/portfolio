import { useEffect } from "react";

function upsertMeta(attr, key, content) {
  if (!content) return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertLink(rel, href) {
  if (!href) return;
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

/**
 * Minimal, dependency-free document-head manager for the public site.
 * Deliberately not react-helmet-async (or any new package) — a handful
 * of imperative DOM writes in a `useEffect` covers everything an
 * individual portfolio's SEO singleton needs (title, description,
 * canonical, OpenGraph/Twitter title+description+image), without an
 * extra dependency for the app to carry.
 *
 * Restores the previous document title on unmount so navigating away
 * from a page never leaves a stale title behind if a later effect
 * doesn't get the chance to overwrite it.
 */
export function useDocumentHead({ title, description, image, canonical, robots } = {}) {
  useEffect(() => {
    const previousTitle = document.title;
    if (title) document.title = title;

    upsertMeta("name", "description", description);
    upsertMeta("property", "og:title", title);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:image", image);
    upsertMeta("name", "twitter:title", title);
    upsertMeta("name", "twitter:description", description);
    upsertMeta("name", "twitter:image", image);
    if (robots) upsertMeta("name", "robots", robots);
    if (canonical) upsertLink("canonical", canonical);

    return () => {
      document.title = previousTitle;
    };
  }, [title, description, image, canonical, robots]);
}

export default useDocumentHead;

import About from "../models/About.js";
import cache from "../utils/cache.js";
import { ServiceError } from "./ServiceError.js";
import { stripTempIds, normaliseOrder } from "../utils/ordering.js";

/* ── Cache ─────────────────────────────────────────────────────────── */

const CACHE_KEY = "about:public";
const CACHE_TTL_MS = 60_000; // 60 seconds

function invalidateAboutCache() {
  cache.del(CACHE_KEY);
}

/* ── fetchAbout (public) ───────────────────────────────────────────── */

export const fetchAbout = async () => {
  const cached = cache.get(CACHE_KEY);
  if (cached) return cached;

  const doc = await About.getSingleton();

  // Sort by order before returning so the client never has to sort
  const result = {
    ...doc,
    paragraphs: [...doc.paragraphs].sort((a, b) => a.order - b.order),
    services: [...doc.services].sort((a, b) => a.order - b.order),
  };

  cache.set(CACHE_KEY, result, CACHE_TTL_MS);
  return result;
};

/* ── patchAboutSection ─────────────────────────────────────────────── */

export const patchAboutSection = async (section, value) => {
  const ALLOWED = new Set(["paragraphs", "services"]);

  if (!ALLOWED.has(section)) {
    throw new ServiceError(
      `Invalid section "${section}". Allowed: ${[...ALLOWED].join(", ")}.`,
      400,
      "ABOUT_INVALID_SECTION",
    );
  }

  if (!Array.isArray(value)) {
    throw new ServiceError(
      `Section "${section}" must be an array.`,
      400,
      "ABOUT_INVALID_VALUE",
    );
  }

  // Remove transient client-side IDs and normalise order
  const cleaned = normaliseOrder(stripTempIds(value));

  const existing = await About.findOne({ owner: "default" });

  if (!existing) {
    const created = await About.create({
      owner: "default",
      [section]: cleaned,
    });
    invalidateAboutCache();
    return created.toObject();
  }

  existing[section] = cleaned;
  await existing.validate();
  await existing.save();

  invalidateAboutCache();
  return existing.toObject();
};

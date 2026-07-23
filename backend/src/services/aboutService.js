import {
  getSingleton,
  findDefault,
  create,
} from "../repositories/aboutRepository.js";
import cache from "../utils/cache.js";
import { ServiceError } from "./ServiceError.js";
import { stripTempIds, normaliseOrder } from "../utils/ordering.js";
import {
  CACHE_TTL_MS,
  CONTENT_STATUSES,
  CONTENT_STATUS_DRAFT,
} from "../utils/constants.js";

/* ── Cache ─────────────────────────────────────────────────────────── */

const CACHE_KEY = "about:public";

function invalidateAboutCache() {
  cache.del(CACHE_KEY);
}

const sortSections = (doc) => ({
  ...doc,
  paragraphs: [...(doc.paragraphs ?? [])].sort((a, b) => a.order - b.order),
  services: [...(doc.services ?? [])].sort((a, b) => a.order - b.order),
});

/* ── ADMIN read — always returns the full document ────────────────── */

export const fetchAdminAbout = async () => {
  const doc = await getSingleton();
  return sortSections(doc);
};

/* ── PUBLIC read (cached) — 404s only while explicitly draft ───────── */

export const fetchPublicAbout = async () => {
  const cached = cache.get(CACHE_KEY);
  if (cached) return cached;

  const doc = await getSingleton();

  if (doc.status === CONTENT_STATUS_DRAFT) {
    throw new ServiceError(
      "About is not currently published.",
      404,
      "CONTENT_NOT_PUBLISHED",
    );
  }

  const result = sortSections(doc);
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

  const cleaned = normaliseOrder(stripTempIds(value));

  const existing = await findDefault();

  if (!existing) {
    const created = await create({
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

/* ── setAboutStatus — publish / unpublish ───────────────────────────── */

export const setAboutStatus = async (status) => {
  if (!CONTENT_STATUSES.includes(status)) {
    throw new ServiceError(
      `status must be one of: ${CONTENT_STATUSES.join(", ")}`,
      400,
      "ABOUT_INVALID_STATUS",
    );
  }

  const existing = await findDefault();

  let resultDoc;
  if (!existing) {
    const created = await create({ owner: "default", status });
    resultDoc = created.toObject();
  } else {
    existing.status = status;
    await existing.validate();
    await existing.save();
    resultDoc = existing.toObject();
  }

  invalidateAboutCache();
  return sortSections(resultDoc);
};

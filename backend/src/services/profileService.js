import {
  getSingleton,
  findDefault,
} from "../repositories/profileRepository.js";
import { ServiceError } from "./ServiceError.js";
import { stripTempIds, normaliseOrder } from "../utils/ordering.js";
import { CONTENT_STATUSES, CONTENT_STATUS_DRAFT } from "../utils/constants.js";

const PATCHABLE_FIELDS = new Set([
  "name",
  "title",
  "email",
  "phone",
  "location",
  "avatar",
  "socialLinks",
]);

const sortSocialLinks = (doc) => ({
  ...doc,
  socialLinks: [...(doc.socialLinks ?? [])].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0),
  ),
});

/* ── ADMIN read — always returns the full document ────────────────── */

export const fetchAdminProfile = async () => {
  const doc = await getSingleton();
  return sortSocialLinks(doc);
};

/* ── PUBLIC read — 404s only while explicitly in draft status ──────── */

export const fetchPublicProfile = async () => {
  const doc = await getSingleton();

  if (doc.status === CONTENT_STATUS_DRAFT) {
    throw new ServiceError(
      "Profile is not currently published.",
      404,
      "CONTENT_NOT_PUBLISHED",
    );
  }

  return sortSocialLinks(doc);
};

/* ── patchProfile ──────────────────────────────────────────────────── */

export const patchProfile = async (updates) => {
  const sanitized = Object.fromEntries(
    Object.entries(updates).filter(([key]) => PATCHABLE_FIELDS.has(key)),
  );

  if (Object.keys(sanitized).length === 0) {
    throw new ServiceError(
      "No valid fields provided for update.",
      400,
      "PROFILE_NO_VALID_FIELDS",
    );
  }

  if (Array.isArray(sanitized.socialLinks)) {
    sanitized.socialLinks = normaliseOrder(stripTempIds(sanitized.socialLinks));
  }

  const existing = await findDefault();

  if (!existing) {
    throw new ServiceError(
      "Profile not found. Run the seed script first.",
      404,
      "PROFILE_NOT_FOUND",
    );
  }

  for (const [key, value] of Object.entries(sanitized)) {
    existing[key] = value;
  }

  await existing.validate();
  await existing.save();

  return sortSocialLinks(existing.toObject());
};

/* ── setProfileStatus — publish / unpublish ─────────────────────────── */

export const setProfileStatus = async (status) => {
  if (!CONTENT_STATUSES.includes(status)) {
    throw new ServiceError(
      `status must be one of: ${CONTENT_STATUSES.join(", ")}`,
      400,
      "PROFILE_INVALID_STATUS",
    );
  }

  const existing = await findDefault();
  if (!existing) {
    throw new ServiceError(
      "Profile not found. Run the seed script first.",
      404,
      "PROFILE_NOT_FOUND",
    );
  }

  existing.status = status;
  await existing.validate();
  await existing.save();

  return sortSocialLinks(existing.toObject());
};

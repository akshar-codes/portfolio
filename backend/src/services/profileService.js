import {
  getSingleton,
  findDefault,
} from "../repositories/profileRepository.js";
import { ServiceError } from "./ServiceError.js";
import { stripTempIds, normaliseOrder } from "../utils/ordering.js";

const PATCHABLE_FIELDS = new Set([
  "name",
  "title",
  "email",
  "phone",
  "location",
  "avatar",
  "socialLinks",
]);

/* ── fetchProfile ──────────────────────────────────────────────────── */

export const fetchProfile = async () => {
  const doc = await getSingleton();
  return {
    ...doc,
    socialLinks: [...doc.socialLinks].sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0),
    ),
  };
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

  const result = existing.toObject();
  return {
    ...result,
    socialLinks: [...result.socialLinks].sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0),
    ),
  };
};

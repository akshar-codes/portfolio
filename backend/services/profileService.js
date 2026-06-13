import Profile from "../models/Profile.js";
import { ServiceError } from "./ServiceError.js";

const PATCHABLE_FIELDS = new Set([
  "name",
  "title",
  "email",
  "phone",
  "location",
  "avatar",
  "socialLinks",
]);

/* ── Shared ordering helpers (mirrors aboutService.js) ─────────────── */

function stripTempIds(arr) {
  return arr.map(({ _tempId, ...rest }) => rest); // eslint-disable-line no-unused-vars
}

function normaliseOrder(arr) {
  return arr
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((item, idx) => ({ ...item, order: idx }));
}

/* ── fetchProfile ──────────────────────────────────────────────────── */

export const fetchProfile = async () => {
  const doc = await Profile.getSingleton();
  // Sort social links by order before returning
  return {
    ...doc,
    socialLinks: [...doc.socialLinks].sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0),
    ),
  };
};

/* ── patchProfile ──────────────────────────────────────────────────── */

export const patchProfile = async (updates) => {
  // Strip unknown keys
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

  // Normalise social links order if provided
  if (Array.isArray(sanitized.socialLinks)) {
    sanitized.socialLinks = normaliseOrder(stripTempIds(sanitized.socialLinks));
  }

  const existing = await Profile.findOne({ owner: "default" });

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
  // Always return social links sorted by order
  return {
    ...result,
    socialLinks: [...result.socialLinks].sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0),
    ),
  };
};

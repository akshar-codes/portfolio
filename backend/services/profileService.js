import Profile from "../models/Profile.js";
import { ServiceError } from "./errors.js";

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
  return Profile.getSingleton();
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

  const existing = await Profile.findOne({ owner: "default" });

  if (!existing) {
    // Shouldn't happen (getSingleton auto-creates), but guard anyway
    throw new ServiceError(
      "Profile not found. Run the seed script first.",
      404,
      "PROFILE_NOT_FOUND",
    );
  }

  // Apply each sanitized field
  for (const [key, value] of Object.entries(sanitized)) {
    existing[key] = value;
  }

  // Run full Mongoose validators before saving
  await existing.validate();
  await existing.save();

  return existing.toObject();
};

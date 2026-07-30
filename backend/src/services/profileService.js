import {
  getSingleton,
  findDefault,
  create,
} from "../repositories/profileRepository.js";
import { createSingletonService } from "./SingletonService.js";
import { sanitizeRichText } from "../utils/htmlSanitizer.js";

const repository = { getSingleton, findDefault, create };

const PATCHABLE_FIELDS = [
  "name",
  "title",
  "introduction",
  "email",
  "phone",
  "location",
  "avatar",
  "socialLinks",
  "ctaButtons",
  "statistics",
];

const ORDERED_ARRAY_FIELDS = ["socialLinks", "ctaButtons", "statistics"];

// Required-by-schema fields need a default so the singleton can be
// created on first read/write without the caller having to supply
// them — mirrors the fallback the old Profile.getSingleton() static
// used to provide directly on the model.
const DEFAULTS = {
  name: "Your Name",
  title: "Web Developer",
  email: "you@example.com",
};

const {
  fetchAdmin: fetchAdminProfile,
  fetchPublic: fetchPublicProfile,
  patchSingleton: patchProfileRaw,
  setStatus: setProfileStatus,
  invalidateCache: invalidateProfileCache,
} = createSingletonService({
  repository,
  cacheKey: "profile:public",
  patchableFields: PATCHABLE_FIELDS,
  orderedArrayFields: ORDERED_ARRAY_FIELDS,
  defaults: DEFAULTS,
  resourceName: "Profile",
});

/**
 * Sanitizes rich text before delegating to the generic singleton PATCH.
 * Client-side DOMPurify (RichTextEditor.jsx) is a UX safeguard, not a
 * security boundary — this is the real defense against stored XSS for
 * a field rendered with dangerouslySetInnerHTML on the public site.
 */
const patchProfile = async (updates) => {
  const sanitized = { ...updates };
  if (typeof sanitized.introduction === "string") {
    sanitized.introduction = sanitizeRichText(sanitized.introduction);
  }
  return patchProfileRaw(sanitized);
};

export {
  fetchAdminProfile,
  fetchPublicProfile,
  patchProfile,
  setProfileStatus,
  invalidateProfileCache,
};

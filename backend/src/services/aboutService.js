import {
  getSingleton,
  findDefault,
  create,
} from "../repositories/aboutRepository.js";
import { createSingletonService } from "./SingletonService.js";
import { sanitizeRichText } from "../utils/htmlSanitizer.js";

const repository = { getSingleton, findDefault, create };

const PATCHABLE_FIELDS = [
  "biography",
  "skillsSummary",
  "services",
  "timeline",
  "highlights",
  "personalInfo",
  "images",
];

// `skillsSummary` is deliberately NOT included here — it is a flat
// string array (no per-item `order` field), and the generic
// ORDERED_ARRAY_FIELDS path expects each item to be an object it can
// strip `_tempId` from / renumber `order` on. Routing plain strings
// through that path would spread each character into an indexed
// object (JS destructuring `{...rest}` on a string primitive) and
// silently corrupt the data — see stripTempIds in utils/ordering.js.
const ORDERED_ARRAY_FIELDS = [
  "services",
  "timeline",
  "highlights",
  "personalInfo",
  "images",
];

const {
  fetchAdmin: fetchAdminAbout,
  fetchPublic: fetchPublicAbout,
  patchSingleton: patchAboutRaw,
  setStatus: setAboutStatus,
  invalidateCache: invalidateAboutCache,
} = createSingletonService({
  repository,
  cacheKey: "about:public",
  patchableFields: PATCHABLE_FIELDS,
  orderedArrayFields: ORDERED_ARRAY_FIELDS,
  resourceName: "About",
});

/**
 * Sanitizes the rich-text biography before delegating to the generic
 * singleton PATCH. See profileService.js's patchProfile for the same
 * rationale (server-side sanitization is the real XSS boundary, not
 * the client-side DOMPurify pass).
 */
const patchAbout = async (updates) => {
  const sanitized = { ...updates };
  if (typeof sanitized.biography === "string") {
    sanitized.biography = sanitizeRichText(sanitized.biography);
  }
  return patchAboutRaw(sanitized);
};

export {
  fetchAdminAbout,
  fetchPublicAbout,
  patchAbout,
  setAboutStatus,
  invalidateAboutCache,
};

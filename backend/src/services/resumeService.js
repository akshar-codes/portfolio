import {
  getSingleton,
  findDefault,
  create,
} from "../repositories/resumeRepository.js";
import { createSingletonService } from "./SingletonService.js";
import { sanitizeRichText } from "../utils/htmlSanitizer.js";

const repository = { getSingleton, findDefault, create };

/**
 * Every top-level field a PATCH may modify. Any subset may be sent in
 * a single request — e.g. { education: [...] } alone, or
 * { hero: {...}, aboutMe: {...} } together.
 */
const PATCHABLE_FIELDS = [
  "hero",
  "aboutMe",
  "experience",
  "education",
  "certifications",
  "skills",
  "languages",
  "interests",
  "downloads",
];

/**
 * Subset of PATCHABLE_FIELDS that are arrays of orderable items —
 * order is re-numbered and any client-only `_tempId` is stripped
 * before persisting.
 */
const ORDERED_ARRAY_FIELDS = [
  "experience",
  "education",
  "certifications",
  "skills",
  "languages",
  "interests",
  "downloads",
];

const {
  fetchAdmin: fetchResumeAdmin,
  fetchPublic: fetchResumePublic,
  patchSingleton: patchResumeRaw,
  setStatus: setResumeStatus,
  invalidateCache: invalidateResumeCache,
} = createSingletonService({
  repository,
  cacheKey: "resume:public",
  patchableFields: PATCHABLE_FIELDS,
  orderedArrayFields: ORDERED_ARRAY_FIELDS,
  resourceName: "Resume",
});

/**
 * Sanitizes the two rich-text surfaces (Resume.aboutMe.summary and
 * each Resume.experience[].description) before delegating to the
 * generic singleton PATCH. Client-side DOMPurify (RichTextEditor.jsx)
 * is a UX safeguard only — this is the real defense against stored
 * XSS for content rendered with dangerouslySetInnerHTML publicly.
 */
const patchResume = async (updates) => {
  const sanitized = { ...updates };

  if (sanitized.aboutMe && typeof sanitized.aboutMe.summary === "string") {
    sanitized.aboutMe = {
      ...sanitized.aboutMe,
      summary: sanitizeRichText(sanitized.aboutMe.summary),
    };
  }

  if (Array.isArray(sanitized.experience)) {
    sanitized.experience = sanitized.experience.map((entry) =>
      typeof entry?.description === "string"
        ? { ...entry, description: sanitizeRichText(entry.description) }
        : entry,
    );
  }

  return patchResumeRaw(sanitized);
};

export {
  fetchResumeAdmin,
  fetchResumePublic,
  patchResume,
  setResumeStatus,
  invalidateResumeCache,
};

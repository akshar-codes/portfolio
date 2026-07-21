import {
  getSingleton,
  findDefault,
  create,
} from "../repositories/resumeRepository.js";
import { createSingletonService } from "./SingletonService.js";

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
 * before persisting (mirrors aboutService/resumeService's previous
 * per-section handling, now applied uniformly across every list).
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
  fetchSingleton: fetchResume,
  patchSingleton: patchResume,
  invalidateCache: invalidateResumeCache,
} = createSingletonService({
  repository,
  cacheKey: "resume:public",
  patchableFields: PATCHABLE_FIELDS,
  orderedArrayFields: ORDERED_ARRAY_FIELDS,
});

export { fetchResume, patchResume, invalidateResumeCache };

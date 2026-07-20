import {
  getSingleton,
  findDefault,
  create,
} from "../repositories/seoRepository.js";
import { createSingletonService } from "./SingletonService.js";

const repository = { getSingleton, findDefault, create };

const PATCHABLE_FIELDS = [
  "defaultMetaTitle",
  "defaultMetaDescription",
  "defaultOgImage",
  "twitterHandle",
  "canonicalBaseUrl",
  "robotsIndex",
  "robotsFollow",
  "sitemapEnabled",
  "googleAnalyticsId",
  "googleSiteVerification",
  "organization",
];

// Required-by-schema fields need a default so the singleton can be
// created on first read/write without the caller having to supply them.
const DEFAULTS = {
  defaultMetaTitle: "My Portfolio",
  defaultMetaDescription: "B.Tech CSE student and Full Stack MERN developer.",
};

const {
  fetchSingleton: fetchSeo,
  patchSingleton: patchSeo,
  invalidateCache: invalidateSeoCache,
} = createSingletonService({
  repository,
  cacheKey: "seo:public",
  patchableFields: PATCHABLE_FIELDS,
  defaults: DEFAULTS,
});

export { fetchSeo, patchSeo, invalidateSeoCache };

import express from "express";
import { timingSafeEqual } from "node:crypto";
import { fetchPublicProfile } from "../../services/profileService.js";
import { fetchPublicAbout } from "../../services/aboutService.js";
import { fetchResumePublic } from "../../services/resumeService.js";
import { fetchAllProjects } from "../../services/projectService.js";
import { fetchPublicCategories } from "../../services/categoryService.js";
import { fetchNavigationPublic } from "../../services/NavigationService.js";
import { fetchFooterPublic } from "../../services/FooterService.js";
import { fetchSiteSettingsPublic } from "../../services/SiteSettingsService.js";
import { fetchSeoPublic } from "../../services/SEOService.js";
import AppError from "../../utils/AppError.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { MAX_PAGE_SIZE } from "../../constants/index.js";

const router = express.Router();

async function getPublishedOrNull(read) {
  try {
    return await read();
  } catch (error) {
    if (error.statusCode === 404) return null;
    throw error;
  }
}

function authorizeBuild(req) {
  const expected = process.env.PORTFOLIO_SNAPSHOT_TOKEN ?? "";
  const supplied = req.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  const expectedBuffer = Buffer.from(expected);
  const suppliedBuffer = Buffer.from(supplied);
  if (!expected || expectedBuffer.length !== suppliedBuffer.length || !timingSafeEqual(expectedBuffer, suppliedBuffer)) {
    throw new AppError("Not authorized.", 401, "SNAPSHOT_UNAUTHORIZED");
  }
}

router.get("/build-snapshot", asyncHandler(async (req, res) => {
  authorizeBuild(req);
  const firstPage = await fetchAllProjects({ page: 1, limit: MAX_PAGE_SIZE });
  const projectPages = await Promise.all(Array.from(
    { length: Math.max(0, firstPage.totalPages - 1) },
    (_, index) => fetchAllProjects({ page: index + 2, limit: MAX_PAGE_SIZE }),
  ));

  const [profile, about, resume, categories, navigation, footer, siteSettings, seo] = await Promise.all([
    getPublishedOrNull(fetchPublicProfile), getPublishedOrNull(fetchPublicAbout), getPublishedOrNull(fetchResumePublic), fetchPublicCategories(),
    getPublishedOrNull(fetchNavigationPublic), getPublishedOrNull(fetchFooterPublic), getPublishedOrNull(fetchSiteSettingsPublic), getPublishedOrNull(fetchSeoPublic),
  ]);

  res.setHeader("Cache-Control", "private, no-store");
  return res.json({
    version: 1,
    generatedAt: new Date().toISOString(),
    profile, about, resume,
    projects: [...firstPage.projects, ...projectPages.flatMap((page) => page.projects)],
    categories, navigation, footer, siteSettings, seo,
  });
}));

export default router;

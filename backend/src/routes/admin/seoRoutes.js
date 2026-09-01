import express from "express";
import { protect } from "../../middleware/authMiddleware.js";
import {
  getAdminSeo,
  updateSeo,
  publishSeo,
  unpublishSeo,
  archiveSeo,
  restoreSeo,
  scheduleSeo,
} from "../../controllers/seoController.js";
import { updateSeoValidator } from "../../validators/seo.validator.js";
import { publishAtValidator } from "../../validators/common.js";

const router = express.Router();

// Every route in this file requires a valid admin JWT cookie.
router.use(protect);

/* ------------------------------------------------------------------ *
 * GET /api/admin/seo
 * ------------------------------------------------------------------ */
router.get("/", getAdminSeo);

/* ------------------------------------------------------------------ *
 * PATCH /api/admin/seo
 * ------------------------------------------------------------------ */
router.patch("/", updateSeoValidator, updateSeo);

/* ------------------------------------------------------------------ *
 * PATCH /api/admin/seo/publish | /unpublish | /archive | /restore
 * PATCH /api/admin/seo/schedule  { publishAt: ISO8601 date }
 * ------------------------------------------------------------------ */
router.patch("/publish", publishSeo);
router.patch("/unpublish", unpublishSeo);
router.patch("/archive", archiveSeo);
router.patch("/restore", restoreSeo);
router.patch("/schedule", publishAtValidator(), scheduleSeo);

export default router;

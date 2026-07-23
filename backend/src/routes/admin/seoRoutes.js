import express from "express";
import { protect } from "../../middleware/authMiddleware.js";
import {
  getAdminSeo,
  updateSeo,
  publishSeo,
  unpublishSeo,
} from "../../controllers/seoController.js";
import { updateSeoValidator } from "../../validators/seoValidators.js";

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
 * PATCH /api/admin/seo/publish | /unpublish
 * ------------------------------------------------------------------ */
router.patch("/publish", publishSeo);
router.patch("/unpublish", unpublishSeo);

export default router;

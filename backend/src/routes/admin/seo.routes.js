import express from "express";
import { protect } from "../../middleware/authMiddleware.js";
import { getSeo, updateSeo } from "../../controllers/seoController.js";
import { updateSeoValidator } from "../../validators/seoValidators.js";

const router = express.Router();

// Every route in this file requires a valid admin JWT cookie.
router.use(protect);

/* ------------------------------------------------------------------ *
 * GET /api/admin/seo
 * ------------------------------------------------------------------ */
router.get("/", getSeo);

/* ------------------------------------------------------------------ *
 * PATCH /api/admin/seo
 * ------------------------------------------------------------------ */
router.patch("/", updateSeoValidator, updateSeo);

export default router;

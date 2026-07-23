import express from "express";
import { protect } from "../../middleware/authMiddleware.js";
import {
  getAdminFooter,
  updateFooter,
  publishFooter,
  unpublishFooter,
} from "../../controllers/footerController.js";
import { updateFooterValidator } from "../../validators/footerValidators.js";

const router = express.Router();

// Every route in this file requires a valid admin JWT cookie.
router.use(protect);

/* ------------------------------------------------------------------ *
 * GET /api/admin/footer
 * ------------------------------------------------------------------ */
router.get("/", getAdminFooter);

/* ------------------------------------------------------------------ *
 * PATCH /api/admin/footer
 * ------------------------------------------------------------------ */
router.patch("/", updateFooterValidator, updateFooter);

/* ------------------------------------------------------------------ *
 * PATCH /api/admin/footer/publish | /unpublish
 * ------------------------------------------------------------------ */
router.patch("/publish", publishFooter);
router.patch("/unpublish", unpublishFooter);

export default router;

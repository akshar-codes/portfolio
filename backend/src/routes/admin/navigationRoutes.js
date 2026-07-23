import express from "express";
import { protect } from "../../middleware/authMiddleware.js";
import {
  getAdminNavigation,
  updateNavigation,
  publishNavigation,
  unpublishNavigation,
} from "../../controllers/navigationController.js";
import { updateNavigationValidator } from "../../validators/navigationValidators.js";

const router = express.Router();

// Every route in this file requires a valid admin JWT cookie.
router.use(protect);

/* ------------------------------------------------------------------ *
 * GET /api/admin/navigation
 * ------------------------------------------------------------------ */
router.get("/", getAdminNavigation);

/* ------------------------------------------------------------------ *
 * PATCH /api/admin/navigation
 * ------------------------------------------------------------------ */
router.patch("/", updateNavigationValidator, updateNavigation);

/* ------------------------------------------------------------------ *
 * PATCH /api/admin/navigation/publish | /unpublish
 * ------------------------------------------------------------------ */
router.patch("/publish", publishNavigation);
router.patch("/unpublish", unpublishNavigation);

export default router;

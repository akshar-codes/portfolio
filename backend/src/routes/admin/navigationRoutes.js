import express from "express";
import { protect } from "../../middleware/authMiddleware.js";
import {
  getNavigation,
  updateNavigation,
} from "../../controllers/navigationController.js";
import { updateNavigationValidator } from "../../validators/navigationValidators.js";

const router = express.Router();

// Every route in this file requires a valid admin JWT cookie.
router.use(protect);

/* ------------------------------------------------------------------ *
 * GET /api/admin/navigation
 * ------------------------------------------------------------------ */
router.get("/", getNavigation);

/* ------------------------------------------------------------------ *
 * PATCH /api/admin/navigation
 * ------------------------------------------------------------------ */
router.patch("/", updateNavigationValidator, updateNavigation);

export default router;

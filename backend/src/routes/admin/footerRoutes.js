import express from "express";
import { protect } from "../../middleware/authMiddleware.js";
import {
  getFooter,
  updateFooter,
} from "../../controllers/footerController.js";
import { updateFooterValidator } from "../../validators/footerValidators.js";

const router = express.Router();

// Every route in this file requires a valid admin JWT cookie.
router.use(protect);

/* ------------------------------------------------------------------ *
 * GET /api/admin/footer
 * ------------------------------------------------------------------ */
router.get("/", getFooter);

/* ------------------------------------------------------------------ *
 * PATCH /api/admin/footer
 * ------------------------------------------------------------------ */
router.patch("/", updateFooterValidator, updateFooter);

export default router;

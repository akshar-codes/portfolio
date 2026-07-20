import express from "express";
import { protect } from "../../middleware/authMiddleware.js";
import { upload } from "../../config/cloudinary.js";
import {
  getMedia,
  uploadMedia,
  replaceMediaHandler,
  deleteMedia,
} from "../../controllers/mediaController.js";
import {
  mediaIdParamValidator,
  mediaUploadValidators,
} from "../../validators/mediaValidators.js";

const router = express.Router();

// Every route in this file requires a valid admin JWT cookie.
router.use(protect);

/* ------------------------------------------------------------------ *
 * GET /api/admin/media
 * Supports ?page, ?limit, ?folder, ?search
 * ------------------------------------------------------------------ */
router.get("/", getMedia);

/* ------------------------------------------------------------------ *
 * POST /api/admin/media
 * `upload` is the existing single-file multer instance from
 * config/cloudinary.js (5 MB limit, image-only fileFilter) — reused
 * as-is rather than declaring a new multer config.
 * ------------------------------------------------------------------ */
router.post("/", upload.single("file"), mediaUploadValidators, uploadMedia);

/* ------------------------------------------------------------------ *
 * PATCH /api/admin/media/:id/replace
 * Dedicated sub-path so "swap the underlying asset" stays a distinct,
 * explicit action from a hypothetical future metadata-only update.
 * ------------------------------------------------------------------ */
router.patch(
  "/:id/replace",
  mediaIdParamValidator,
  upload.single("file"),
  mediaUploadValidators,
  replaceMediaHandler,
);

/* ------------------------------------------------------------------ *
 * DELETE /api/admin/media/:id
 * ------------------------------------------------------------------ */
router.delete("/:id", mediaIdParamValidator, deleteMedia);

export default router;

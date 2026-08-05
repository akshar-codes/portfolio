import express from "express";
import { protect } from "../../middleware/authMiddleware.js";
import { upload } from "../../config/cloudinary.js";
import {
  getMedia,
  uploadMedia,
  updateMediaMetadataHandler,
  replaceMediaHandler,
  deleteMedia,
  restoreMediaHandler,
  permanentDeleteHandler,
  bulkDeleteHandler,
  bulkRestoreHandler,
  bulkPermanentDeleteHandler,
} from "../../controllers/mediaController.js";
import {
  mediaIdParamValidator,
  mediaUploadValidators,
  updateMediaValidator,
  bulkIdsValidator,
} from "../../validators/mediaValidators.js";

const router = express.Router();

// Every route in this file requires a valid admin JWT cookie.
router.use(protect);

/* ------------------------------------------------------------------ *
 * GET /api/admin/media
 * Supports ?page, ?limit, ?folder, ?search, ?format, ?status,
 * ?sortBy, ?sortOrder
 * ------------------------------------------------------------------ */
router.get("/", getMedia);

/* ------------------------------------------------------------------ *
 * POST /api/admin/media
 * `upload` is the existing single-file multer instance from
 * config/cloudinary.js (5 MB limit, image-only fileFilter).
 * ------------------------------------------------------------------ */
router.post("/", upload.single("file"), mediaUploadValidators, uploadMedia);

/* ------------------------------------------------------------------ *
 * Bulk actions — plain POST routes, so there's no method/path overlap
 * with the "/:id" routes below regardless of registration order (kept
 * up top for readability, matching the existing project/category
 * reorder-route convention).
 * ------------------------------------------------------------------ */
router.post("/bulk-delete", bulkIdsValidator, bulkDeleteHandler);
router.post("/bulk-restore", bulkIdsValidator, bulkRestoreHandler);
router.post("/bulk-permanent-delete", bulkIdsValidator, bulkPermanentDeleteHandler);

/* ------------------------------------------------------------------ *
 * PATCH /api/admin/media/:id
 * JSON body — metadata only (altText/caption/tags/folder), no file.
 * ------------------------------------------------------------------ */
router.patch("/:id", mediaIdParamValidator, updateMediaValidator, updateMediaMetadataHandler);

/* ------------------------------------------------------------------ *
 * PATCH /api/admin/media/:id/replace
 * Dedicated sub-path so "swap the underlying asset" stays a distinct,
 * explicit action from the metadata-only PATCH above.
 * ------------------------------------------------------------------ */
router.patch(
  "/:id/replace",
  mediaIdParamValidator,
  upload.single("file"),
  mediaUploadValidators,
  replaceMediaHandler,
);

/* ------------------------------------------------------------------ *
 * PATCH /api/admin/media/:id/restore
 * ------------------------------------------------------------------ */
router.patch("/:id/restore", mediaIdParamValidator, restoreMediaHandler);

/* ------------------------------------------------------------------ *
 * DELETE /api/admin/media/:id
 * Soft delete — moves the item to the trash (deletedAt set). The
 * Cloudinary asset is left untouched until a permanent delete.
 * ------------------------------------------------------------------ */
router.delete("/:id", mediaIdParamValidator, deleteMedia);

/* ------------------------------------------------------------------ *
 * DELETE /api/admin/media/:id/permanent
 * Hard delete — removes the document and destroys the Cloudinary asset.
 * ------------------------------------------------------------------ */
router.delete("/:id/permanent", mediaIdParamValidator, permanentDeleteHandler);

export default router;

import express from "express";
import { protect } from "../../middleware/authMiddleware.js";
import {
  getMediaFolders,
  createMediaFolder,
  updateMediaFolder,
  deleteMediaFolder,
} from "../../controllers/mediaFolderController.js";
import {
  mediaFolderIdParamValidator,
  createMediaFolderValidator,
  updateMediaFolderValidator,
} from "../../validators/mediaFolderValidators.js";

const router = express.Router();

// Every route in this file requires a valid admin JWT cookie.
router.use(protect);

/* GET /api/admin/media-folders */
router.get("/", getMediaFolders);

/* POST /api/admin/media-folders */
router.post("/", createMediaFolderValidator, createMediaFolder);

/* PATCH /api/admin/media-folders/:id */
router.patch("/:id", mediaFolderIdParamValidator, updateMediaFolderValidator, updateMediaFolder);

/* DELETE /api/admin/media-folders/:id */
router.delete("/:id", mediaFolderIdParamValidator, deleteMediaFolder);

export default router;

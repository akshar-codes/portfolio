import express from "express";
import { protect } from "../../middleware/authMiddleware.js";
import { getVersions, restoreVersion } from "../../controllers/contentVersionController.js";

const router = express.Router();
router.use(protect);
router.get("/:resource/:id/versions", getVersions);
router.post("/:resource/:id/versions/:versionId/restore", restoreVersion);
export default router;

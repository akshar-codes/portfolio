import express from "express";
import {
  createProject,
  editProject,
  deleteProject,
  reorderProjectsHandler,
  publishProjectHandler,
  unpublishProjectHandler,
} from "../../controllers/projectController.js";
import { protect } from "../../middleware/authMiddleware.js";
import { uploadProjectImages } from "../../config/cloudinary.js";
import {
  projectIdParamValidator,
  projectCreateValidators,
  projectUpdateValidators,
  reorderProjectsValidator,
} from "../../validators/projectValidators.js";

const router = express.Router();

// Multi-field upload: thumbnail (image), banner (bannerImage), gallery (gallery[])
const projectUpload = uploadProjectImages.fields([
  { name: "image", maxCount: 1 },
  { name: "bannerImage", maxCount: 1 },
  { name: "gallery", maxCount: 10 },
]);

// Every route in this file requires a valid admin JWT cookie.
router.use(protect);

router.post("/", projectUpload, projectCreateValidators, createProject);

router.patch("/reorder", reorderProjectsValidator, reorderProjectsHandler);

// Publish/unpublish — dedicated JSON-friendly status toggles (no body
// required), matching the singleton CMS resources' publish/unpublish
// convention. Registered before the generic "/:id" PATCH below so
// Express's sequential route matching doesn't need to disambiguate —
// both are 2-segment patterns distinct from the 1-segment "/:id".
router.patch(
  "/:id/publish",
  projectIdParamValidator,
  publishProjectHandler,
);
router.patch(
  "/:id/unpublish",
  projectIdParamValidator,
  unpublishProjectHandler,
);

router.patch(
  "/:id",
  projectIdParamValidator,
  projectUpload,
  projectUpdateValidators,
  editProject,
);

router.delete("/:id", deleteProject);

export default router;

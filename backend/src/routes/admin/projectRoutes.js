import express from "express";
import {
  createProject,
  editProject,
  deleteProject,
  reorderProjectsHandler,
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

router.patch(
  "/:id",
  projectIdParamValidator,
  projectUpload,
  projectUpdateValidators,
  editProject,
);

router.delete("/:id", deleteProject);

export default router;

import express from "express";
import { body, param } from "express-validator";
import {
  getProjects,
  getProjectById,
  createProject,
  editProject,
  deleteProject,
  reorderProjectsHandler,
} from "../controllers/projectController.js";
import { protect } from "../middleware/authMiddleware.js";
import { uploadProjectImages } from "../config/cloudinary.js";

const router = express.Router();

// Multi-field upload: thumbnail (image), banner (bannerImage), gallery (gallery[])
const projectUpload = uploadProjectImages.fields([
  { name: "image", maxCount: 1 },
  { name: "bannerImage", maxCount: 1 },
  { name: "gallery", maxCount: 10 },
]);

// ── Public ───────────────────────────────────────────────────────────

router.get("/", getProjects);

router.get("/:id", getProjectById);

// ── Protected ────────────────────────────────────────────────────────

router.post("/", protect, projectUpload, createProject);

router.patch(
  "/reorder",
  protect,
  [
    body("orderedIds")
      .isArray({ min: 1 })
      .withMessage("orderedIds must be a non-empty array"),
    body("orderedIds.*")
      .isMongoId()
      .withMessage("Each orderedId must be a valid MongoDB ObjectId"),
  ],
  reorderProjectsHandler,
);

router.patch(
  "/:id",
  protect,
  [param("id").isMongoId().withMessage("Invalid project ID")],
  projectUpload,
  editProject,
);

router.delete("/:id", protect, deleteProject);

export default router;

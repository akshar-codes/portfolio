import express from "express";
import {
  getProjects,
  createProject,
  deleteProject,
} from "../controllers/projectController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../utils/cloudinary.js";

const router = express.Router();

// Get all projects
router.get("/", getProjects);

// Create project (with image upload)
router.post("/", protect, upload.single("image"), createProject);

// Delete project (protected)
router.delete("/:id", protect, deleteProject);

export default router;

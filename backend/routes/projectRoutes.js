import express from "express";
import {
  getProjects,
  createProject,
  deleteProject,
} from "../controllers/projectController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../utils/cloudinary.js";

const router = express.Router();

// ── Public ───────────────────────────────────────────────────────────

router.get("/", getProjects);

// ── Protected ────────────────────────────────────────────────────────

router.post("/", protect, upload.single("image"), createProject);

router.delete("/:id", protect, deleteProject);

export default router;

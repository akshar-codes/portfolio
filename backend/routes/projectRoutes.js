import express from "express";
import { body } from "express-validator";
import {
  getProjects,
  createProject,
  deleteProject,
  reorderProjectsHandler,
} from "../controllers/projectController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../utils/cloudinary.js";

const router = express.Router();

// ── Public ───────────────────────────────────────────────────────────

router.get("/", getProjects);

// ── Protected ────────────────────────────────────────────────────────

router.post("/", protect, upload.single("image"), createProject);

router.delete("/:id", protect, deleteProject);

/* ------------------------------------------------------------------ *
 * PATCH /api/projects/reorder
 * ------------------------------------------------------------------ */
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

export default router;

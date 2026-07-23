import express from "express";
import { protect } from "../../middleware/authMiddleware.js";
import {
  getAdminProjects,
  getAdminProjectById,
} from "../../controllers/projectController.js";
import {
  projectIdParamValidator,
  projectAdminListValidators,
} from "../../validators/projectValidators.js";

const router = express.Router();

// Every route in this file requires a valid admin JWT cookie.
router.use(protect);

/* ------------------------------------------------------------------ *
 * GET /api/admin/projects
 * Full admin listing — includes drafts, supports ?status, ?search,
 * ?category, ?page, ?limit. Distinct from the public /api/projects
 * listing, which only ever returns published projects.
 *
 * NOTE (frontend integration required): ManageProjects.jsx currently
 * lists projects by calling the PUBLIC endpoint (`GET /api/projects`),
 * which after this change will never include drafts. The admin panel
 * must switch its listing/edit-fetch calls to this endpoint (and to
 * GET /api/admin/projects/:id below) so drafts remain manageable.
 * ------------------------------------------------------------------ */
router.get("/", projectAdminListValidators, getAdminProjects);

/* ------------------------------------------------------------------ *
 * GET /api/admin/projects/:id
 * Returns a project regardless of publish status.
 * ------------------------------------------------------------------ */
router.get("/:id", projectIdParamValidator, getAdminProjectById);

export default router;

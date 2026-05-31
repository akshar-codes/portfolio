import {
  fetchAllProjects,
  addProject,
  removeProject,
  reorderProjects,
} from "../services/projectService.js";
import AppError from "../utils/AppError.js";
import { sendSuccess, sendNoContent } from "../utils/response.js";
import asyncHandler from "../utils/asyncHandler.js";

/* ------------------------------------------------------------------ *
 * GET /api/projects  (public)
 * ------------------------------------------------------------------ */
export const getProjects = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 9;

  if (page < 1) throw new AppError("page must be a positive integer.", 400);
  if (limit < 1) throw new AppError("limit must be a positive integer.", 400);

  const category =
    typeof req.query.category === "string" ? req.query.category.trim() : "";

  const result = await fetchAllProjects({ page, limit, category });
  return sendSuccess(res, result, "Projects retrieved successfully");
});

/* ------------------------------------------------------------------ *
 * POST /api/projects  (protected, multipart/form-data)
 * ------------------------------------------------------------------ */
export const createProject = asyncHandler(async (req, res) => {
  const { title, description, category: categoryId, projectUrl } = req.body;

  const project = await addProject({
    title,
    description,
    categoryId,
    projectUrl,
    file: req.file,
  });

  return sendSuccess(res, project, "Project created successfully", 201);
});

/* ------------------------------------------------------------------ *
 * DELETE /api/projects/:id  (protected)
 * ------------------------------------------------------------------ */
export const deleteProject = asyncHandler(async (req, res) => {
  await removeProject(req.params.id);
  return sendNoContent(res);
});

/* ------------------------------------------------------------------ *
 * PATCH /api/projects/reorder  (protected)
 * ------------------------------------------------------------------ */
export const reorderProjectsHandler = asyncHandler(async (req, res) => {
  const { orderedIds } = req.body;

  if (!Array.isArray(orderedIds)) {
    throw new AppError("orderedIds must be an array.", 400);
  }

  await reorderProjects(orderedIds);
  return sendSuccess(res, null, "Projects reordered successfully");
});

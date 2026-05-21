import {
  fetchAllProjects,
  addProject,
  removeProject,
} from "../services/projectService.js";
import { PROJECT_CATEGORIES } from "../models/Project.js";
import AppError from "../utils/AppError.js";
import { sendSuccess } from "../utils/response.js";
import asyncHandler from "../utils/asyncHandler.js";

/* ------------------------------------------------------------------ *
 * GET /api/projects/categories  (public)
 * ------------------------------------------------------------------ */
export const getCategories = (_req, res) => {
  return sendSuccess(
    res,
    PROJECT_CATEGORIES,
    "Categories retrieved successfully",
  );
};

/* ------------------------------------------------------------------ *
 * GET /api/projects
 * ------------------------------------------------------------------ */
export const getProjects = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 9;
  const category = req.query.category?.trim() ?? "";

  if (page < 1) throw new AppError("page must be a positive integer.", 400);
  if (limit < 1) throw new AppError("limit must be a positive integer.", 400);

  const result = await fetchAllProjects({ page, limit, category });
  return sendSuccess(res, result, "Projects retrieved successfully");
});

/* ------------------------------------------------------------------ *
 * POST /api/projects  (protected, multipart/form-data)
 * ------------------------------------------------------------------ */
export const createProject = asyncHandler(async (req, res) => {
  const { title, description, category, projectUrl } = req.body;

  const project = await addProject({
    title,
    description,
    category,
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
  return sendSuccess(res, null, "Project deleted successfully");
});

import { validationResult } from "express-validator";
import AppError from "../utils/AppError.js";
import {
  fetchAllProjects,
  fetchProjectById,
  addProject,
  updateProject,
  removeProject,
  reorderProjects,
} from "../services/projectService.js";
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
 * GET /api/projects/:id  (public)
 * ------------------------------------------------------------------ */
export const getProjectById = asyncHandler(async (req, res) => {
  const project = await fetchProjectById(req.params.id);
  return sendSuccess(res, project, "Project retrieved successfully");
});

/* ------------------------------------------------------------------ *
 * POST /api/projects  (protected, multipart/form-data)
 * ------------------------------------------------------------------ */
export const createProject = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(errors.array()[0].msg, 400);
  }

  const {
    title,
    description,
    category: categoryId,
    projectUrl,
    liveUrl,
    githubUrl,
    technologies,
    features,
    challenge,
    solution,
  } = req.body;

  // req.files is populated by uploadProjectImages.fields(...)
  const files = req.files ?? {};
  const file = files.image?.[0] ?? req.file ?? null;
  const bannerFile = files.bannerImage?.[0] ?? null;
  const galleryFiles = files.gallery ?? [];

  const project = await addProject({
    title,
    description,
    categoryId,
    projectUrl,
    liveUrl,
    githubUrl,
    technologies,
    features,
    challenge,
    solution,
    file,
    bannerFile,
    galleryFiles,
  });

  return sendSuccess(res, project, "Project created successfully", 201);
});

/* ------------------------------------------------------------------ *
 * PATCH /api/projects/:id  (protected, multipart/form-data)
 * ------------------------------------------------------------------ */
export const editProject = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(errors.array()[0].msg, 400);
  }

  const files = req.files ?? {};

  const updates = {
    ...req.body,
    file: files.image?.[0] ?? null,
    bannerFile: files.bannerImage?.[0] ?? null,
    galleryFiles: files.gallery ?? [],
    categoryId: req.body.category || undefined,
  };

  const project = await updateProject(req.params.id, updates);
  return sendSuccess(res, project, "Project updated successfully");
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
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(errors.array()[0].msg, 400);
  }

  const { orderedIds } = req.body;
  await reorderProjects(orderedIds);
  return sendSuccess(res, null, "Projects reordered successfully");
});

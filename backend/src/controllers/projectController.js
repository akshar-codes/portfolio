import { validationResult } from "express-validator";
import AppError from "../utils/AppError.js";
import {
  fetchAllProjects,
  fetchAllProjectsAdmin,
  fetchProjectById,
  fetchProjectByIdAdmin,
  addProject,
  updateProject,
  removeProject,
  reorderProjects,
  setProjectStatus,
} from "../services/projectService.js";
import { sendSuccess, sendNoContent } from "../utils/response.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  DEFAULT_PROJECTS_PAGE_SIZE,
  DEFAULT_PROJECTS_ADMIN_PAGE_SIZE,
  CONTENT_STATUS_DRAFT,
  CONTENT_STATUS_PUBLISHED,
} from "../utils/constants.js";

/* ------------------------------------------------------------------ *
 * GET /api/projects  (public — published only, supports ?search)
 * ------------------------------------------------------------------ */
export const getProjects = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || DEFAULT_PROJECTS_PAGE_SIZE;

  if (page < 1) throw new AppError("page must be a positive integer.", 400);
  if (limit < 1) throw new AppError("limit must be a positive integer.", 400);

  const category =
    typeof req.query.category === "string" ? req.query.category.trim() : "";
  const search =
    typeof req.query.search === "string" ? req.query.search.trim() : "";

  const result = await fetchAllProjects({ page, limit, category, search });
  return sendSuccess(res, result, "Projects retrieved successfully");
});

/* ------------------------------------------------------------------ *
 * GET /api/admin/projects  (protected — every status, filterable)
 * Mounted at a dedicated prefix (not /api/projects) so it can't be
 * shadowed by the public router's `GET /`, which is already registered
 * on that same path.
 * ------------------------------------------------------------------ */
export const getAdminProjects = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit =
    parseInt(req.query.limit, 10) || DEFAULT_PROJECTS_ADMIN_PAGE_SIZE;

  if (page < 1) throw new AppError("page must be a positive integer.", 400);
  if (limit < 1) throw new AppError("limit must be a positive integer.", 400);

  const category =
    typeof req.query.category === "string" ? req.query.category.trim() : "";
  const search =
    typeof req.query.search === "string" ? req.query.search.trim() : "";
  const status =
    typeof req.query.status === "string" ? req.query.status.trim() : "";

  const result = await fetchAllProjectsAdmin({
    page,
    limit,
    category,
    search,
    status,
  });
  return sendSuccess(res, result, "Projects retrieved successfully");
});

/* ------------------------------------------------------------------ *
 * GET /api/projects/:id  (public — 404s for drafts)
 * ------------------------------------------------------------------ */
export const getProjectById = asyncHandler(async (req, res) => {
  const project = await fetchProjectById(req.params.id);
  return sendSuccess(res, project, "Project retrieved successfully");
});

/* ------------------------------------------------------------------ *
 * GET /api/admin/projects/:id  (protected — any status)
 * ------------------------------------------------------------------ */
export const getAdminProjectById = asyncHandler(async (req, res) => {
  const project = await fetchProjectByIdAdmin(req.params.id);
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
    status,
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
    status,
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

/* ------------------------------------------------------------------ *
 * PATCH /api/projects/:id/publish  (protected)
 * ------------------------------------------------------------------ */
export const publishProjectHandler = asyncHandler(async (req, res) => {
  const project = await setProjectStatus(req.params.id, CONTENT_STATUS_PUBLISHED);
  return sendSuccess(res, project, "Project published successfully");
});

/* ------------------------------------------------------------------ *
 * PATCH /api/projects/:id/unpublish  (protected)
 * ------------------------------------------------------------------ */
export const unpublishProjectHandler = asyncHandler(async (req, res) => {
  const project = await setProjectStatus(req.params.id, CONTENT_STATUS_DRAFT);
  return sendSuccess(res, project, "Project unpublished successfully");
});

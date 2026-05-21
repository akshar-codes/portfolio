import {
  fetchAllProjects,
  addProject,
  removeProject,
} from "../services/projectService.js";
import { sendSuccess } from "../utils/response.js";
import asyncHandler from "../utils/asyncHandler.js";

/* ---------------------------------------------------------------
   GET /api/projects
--------------------------------------------------------------- */
export const getProjects = asyncHandler(async (req, res) => {
  const projects = await fetchAllProjects();
  return sendSuccess(res, projects, "Projects retrieved successfully");
});

/* ---------------------------------------------------------------
   POST /api/projects  (protected, multipart/form-data)
--------------------------------------------------------------- */
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

/* ---------------------------------------------------------------
   DELETE /api/projects/:id  (protected)
--------------------------------------------------------------- */
export const deleteProject = asyncHandler(async (req, res) => {
  await removeProject(req.params.id);
  return sendSuccess(res, null, "Project deleted successfully");
});

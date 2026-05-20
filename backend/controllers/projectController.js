import { ServiceError } from "../services/errors.js";
import {
  fetchAllProjects,
  addProject,
  removeProject,
} from "../services/projectService.js";

function toHttpError(error) {
  if (error instanceof ServiceError) {
    return { status: error.status, message: error.message };
  }

  if (error.name === "MulterError") {
    const multerMessages = {
      LIMIT_FILE_SIZE: "File too large. Maximum size is 5 MB.",
      LIMIT_FILE_COUNT: "Only one file may be uploaded at a time.",
    };
    return {
      status: 400,
      message: multerMessages[error.code] ?? `Upload error: ${error.message}`,
    };
  }

  const knownPrefixes = [
    "Invalid file type",
    "File content does not match",
    "No file buffer",
  ];
  if (knownPrefixes.some((p) => error.message?.startsWith(p))) {
    return { status: 400, message: error.message };
  }

  console.error("[projectController] Unexpected error:", error);
  return { status: 500, message: "An unexpected error occurred." };
}

/* ---------------------------------------------------------------
   GET /api/projects
--------------------------------------------------------------- */
export const getProjects = async (req, res) => {
  try {
    const projects = await fetchAllProjects();
    res.json(projects);
  } catch (error) {
    const { status, message } = toHttpError(error);
    res.status(status).json({ message });
  }
};

/* ---------------------------------------------------------------
   POST /api/projects  (protected, multipart/form-data)
--------------------------------------------------------------- */
export const createProject = async (req, res) => {
  try {
    const { title, description, category, projectUrl } = req.body;

    const project = await addProject({
      title,
      description,
      category,
      projectUrl,
      file: req.file,
    });

    res.status(201).json(project);
  } catch (error) {
    const { status, message } = toHttpError(error);
    res.status(status).json({ message });
  }
};

/* ---------------------------------------------------------------
   DELETE /api/projects/:id  (protected)
--------------------------------------------------------------- */
export const deleteProject = async (req, res) => {
  try {
    await removeProject(req.params.id);
    res.json({ message: "Project and image deleted successfully." });
  } catch (error) {
    const { status, message } = toHttpError(error);
    res.status(status).json({ message });
  }
};

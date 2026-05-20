import Project from "../models/Project.js";
import { cloudinary, uploadToCloudinary } from "../utils/cloudinary.js";

function handleUploadError(error) {
  if (error.name === "MulterError") {
    if (error.code === "LIMIT_FILE_SIZE") {
      return { status: 400, message: "File too large. Maximum size is 5 MB." };
    }
    if (error.code === "LIMIT_FILE_COUNT") {
      return {
        status: 400,
        message: "Only one file may be uploaded at a time.",
      };
    }
    return { status: 400, message: `Upload error: ${error.message}` };
  }

  if (
    error.message?.startsWith("Invalid file type") ||
    error.message?.startsWith("File content does not match") ||
    error.message?.startsWith("No file buffer")
  ) {
    return { status: 400, message: error.message };
  }

  console.error("[uploadToCloudinary] Unexpected error:", error);
  return { status: 500, message: "Image upload failed. Please try again." };
}

/* ---------------------------------------------------------------
   GET /api/projects
--------------------------------------------------------------- */
export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    console.error("GET PROJECTS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch projects." });
  }
};

export const createProject = async (req, res) => {
  try {
    const { title, description, category, link } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Image is required." });
    }

    const result = await uploadToCloudinary(req.file);

    const project = await Project.create({
      title,
      description,
      category,
      projectUrl: link,
      image: {
        url: result.secure_url,
        public_id: result.public_id,
      },
    });

    res.status(201).json(project);
  } catch (error) {
    const { status, message } = handleUploadError(error);
    res.status(status).json({ message });
  }
};

/* ---------------------------------------------------------------
   DELETE /api/projects/:id
--------------------------------------------------------------- */
export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    if (project.image?.public_id) {
      await cloudinary.uploader.destroy(project.image.public_id);
    }

    await project.deleteOne();

    res.json({ message: "Project and image deleted successfully." });
  } catch (error) {
    console.error("DELETE PROJECT ERROR:", error);
    res.status(500).json({ message: "Failed to delete project." });
  }
};

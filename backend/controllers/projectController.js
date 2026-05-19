import Project from "../models/Project.js";
import { cloudinary } from "../utils/cloudinary.js";

// GET all projects
export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE project
export const createProject = async (req, res) => {
  try {
    const { title, description, category, projectUrl } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    const uploadPromise = new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: "image",
          folder: "portfolio/projects",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        },
      );

      stream.end(req.file.buffer);
    });

    const result = await uploadPromise;

    const project = await Project.create({
      title,
      description,
      category,
      projectUrl,
      image: {
        url: result.secure_url,
        public_id: result.public_id,
      },
    });

    res.status(201).json(project);
  } catch (error) {
    console.error("CREATE PROJECT ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// DELETE project
export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.image && project.image.public_id) {
      await cloudinary.uploader.destroy(project.image.public_id);
    }

    await project.deleteOne();

    res.json({ message: "Project and image deleted successfully" });
  } catch (error) {
    console.error("DELETE PROJECT ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

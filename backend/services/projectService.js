import Project from "../models/Project.js";
import { cloudinary, uploadToCloudinary } from "../utils/cloudinary.js";
import { ServiceError } from "./errors.js";

/* ---------------------------------------------------------------
   Fetch all projects, newest first.
--------------------------------------------------------------- */
export const fetchAllProjects = async () => {
  return Project.find().sort({ createdAt: -1 });
};

export const addProject = async ({
  title,
  description,
  category,
  projectUrl,
  file,
}) => {
  if (!file) {
    throw new ServiceError("Image is required.", 400);
  }

  const result = await uploadToCloudinary(file);

  return Project.create({
    title,
    description,
    category,
    projectUrl,
    image: {
      url: result.secure_url,
      public_id: result.public_id,
    },
  });
};

export const removeProject = async (id) => {
  const project = await Project.findById(id);

  if (!project) {
    throw new ServiceError("Project not found.", 404);
  }

  if (project.image?.public_id) {
    await cloudinary.uploader.destroy(project.image.public_id);
  }

  await project.deleteOne();
};

import Project from "../models/Project.js";
import { cloudinary, uploadToCloudinary } from "../utils/cloudinary.js";
import { ServiceError } from "./errors.js";

/* ------------------------------------------------------------------ *
 * fetchAllProjects
 *
 * @param {number} page     - 1-based page number  (default: 1)
 * @param {number} limit    - documents per page    (default: 9, max: 50)
 * @param {string} category - optional filter value (default: "All" / "")
 *
 * Returns { projects, total, page, limit, totalPages }
 * ------------------------------------------------------------------ */
export const fetchAllProjects = async ({
  page = 1,
  limit = 9, // 3-column grid lands on a complete row by default
  category = "",
} = {}) => {
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(Math.max(1, limit), 50); // clamp: 1–50
  const skip = (safePage - 1) * safeLimit;

  const filter = category && category !== "All" ? { category } : {};

  const [projects, total] = await Promise.all([
    Project.find(filter).sort({ createdAt: -1 }).skip(skip).limit(safeLimit),
    Project.countDocuments(filter),
  ]);

  return {
    projects,
    total,
    page: safePage,
    limit: safeLimit,
    totalPages: Math.ceil(total / safeLimit),
  };
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

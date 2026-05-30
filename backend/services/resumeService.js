import Resume from "../models/Resume.js";
import { ServiceError } from "./errors.js"; // re-uses existing errors.js

const PATCHABLE_SECTIONS = new Set(["education", "skills"]);

export const fetchResume = async () => {
  return Resume.getSingleton();
};

export const patchResumeSection = async (section, value) => {
  if (!PATCHABLE_SECTIONS.has(section)) {
    throw new ServiceError(
      `Invalid section "${section}". Allowed: ${[...PATCHABLE_SECTIONS].join(", ")}.`,
      400,
      "RESUME_INVALID_SECTION",
    );
  }

  if (!Array.isArray(value)) {
    throw new ServiceError(
      `Section "${section}" must be an array.`,
      400,
      "RESUME_INVALID_VALUE",
    );
  }

  // Ensure the singleton exists, then patch the target section
  const existing = await Resume.findOne({ owner: "default" });

  if (!existing) {
    // Create with just the patched section; other sections default to []
    const created = await Resume.create({
      owner: "default",
      [section]: value,
    });
    return created.toObject();
  }

  existing[section] = value;

  // Run validators (length limits, field constraints)
  await existing.validate();
  await existing.save();

  return existing.toObject();
};

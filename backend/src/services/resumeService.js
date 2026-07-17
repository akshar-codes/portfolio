import {
  getSingleton,
  findDefault,
  create,
} from "../repositories/resumeRepository.js";
import { ServiceError } from "./ServiceError.js";
import { stripTempIds, normaliseOrder } from "../utils/ordering.js";

const PATCHABLE_SECTIONS = new Set(["education", "skills"]);

/* ── fetchResume ───────────────────────────────────────────────────── */

export const fetchResume = async () => {
  const doc = await getSingleton();

  return {
    ...doc,
    skills: [...doc.skills].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
  };
};

/* ── patchResumeSection ────────────────────────────────────────────── */

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

  const cleaned =
    section === "skills"
      ? normaliseOrder(stripTempIds(value))
      : stripTempIds(value);

  const existing = await findDefault();

  if (!existing) {
    const created = await create({
      owner: "default",
      [section]: cleaned,
    });
    const result = created.toObject();
    return {
      ...result,
      skills: [...result.skills].sort(
        (a, b) => (a.order ?? 0) - (b.order ?? 0),
      ),
    };
  }

  existing[section] = cleaned;

  await existing.validate();
  await existing.save();

  const result = existing.toObject();
  return {
    ...result,
    skills: [...result.skills].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
  };
};

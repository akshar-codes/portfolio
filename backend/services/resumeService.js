import Resume from "../models/Resume.js";
import { ServiceError } from "./ServiceError.js"; // re-uses existing errors.js

const PATCHABLE_SECTIONS = new Set(["education", "skills"]);

/* ── Ordering helpers (mirrors aboutService.js) ─────────────────────── */

function stripTempIds(arr) {
  return arr.map(({ _tempId, ...rest }) => rest); // eslint-disable-line no-unused-vars
}

function normaliseOrder(arr) {
  return arr
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((item, idx) => ({ ...item, order: idx }));
}

/* ── fetchResume ───────────────────────────────────────────────────── */

export const fetchResume = async () => {
  const doc = await Resume.getSingleton();

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

  // Normalise order for skills; education has no explicit ordering
  const cleaned =
    section === "skills"
      ? normaliseOrder(stripTempIds(value))
      : stripTempIds(value);

  const existing = await Resume.findOne({ owner: "default" });

  if (!existing) {
    const created = await Resume.create({
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

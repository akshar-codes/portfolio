import mongoose from "mongoose";
import singletonPlugin from "../utils/singletonPlugin.js";
import {
  RESUME_AVAILABILITY_STATUSES,
  RESUME_LANGUAGE_PROFICIENCIES,
  RESUME_DOWNLOAD_FILE_TYPES,
  RESUME_LIMITS,
} from "../utils/constants.js";

/* ================================================================== *
 * Sub-schemas
 * ================================================================== */

/* ── Hero — resume-page presentation content only.
 * Identity fields (name/title/email/phone/avatar) already live on
 * Profile and are intentionally NOT duplicated here. ────────────── */
const heroSchema = new mongoose.Schema(
  {
    greeting: {
      type: String,
      trim: true,
      default: "Hello, I'm",
      maxlength: [60, "Greeting must not exceed 60 characters"],
    },
    headline: {
      type: String,
      trim: true,
      default: "",
      maxlength: [100, "Headline must not exceed 100 characters"],
    },
    summary: {
      type: String,
      trim: true,
      default: "",
      maxlength: [300, "Hero summary must not exceed 300 characters"],
    },
    availabilityStatus: {
      type: String,
      enum: {
        values: RESUME_AVAILABILITY_STATUSES,
        message: `availabilityStatus must be one of: ${RESUME_AVAILABILITY_STATUSES.join(", ")}`,
      },
      default: "available",
    },
    ctaLabel: {
      type: String,
      trim: true,
      default: "Download CV",
      maxlength: [40, "CTA label must not exceed 40 characters"],
    },
    ctaEnabled: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false },
);

/* ── About Me — resume-specific long-form summary. Distinct from the
 * site-wide About model (paragraphs/services shown on the About page). */
const aboutMeSchema = new mongoose.Schema(
  {
    summary: {
      type: String,
      trim: true,
      default: "",
      maxlength: [2000, "About Me summary must not exceed 2000 characters"],
    },
  },
  { _id: false },
);

const experienceEntrySchema = new mongoose.Schema(
  {
    role: {
      type: String,
      required: [true, "Role/title is required"],
      trim: true,
      minlength: [2, "Role must be at least 2 characters"],
      maxlength: [100, "Role must not exceed 100 characters"],
    },
    company: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
      minlength: [2, "Company must be at least 2 characters"],
      maxlength: [150, "Company must not exceed 150 characters"],
    },
    location: {
      type: String,
      trim: true,
      default: "",
      maxlength: [120, "Location must not exceed 120 characters"],
    },
    startDate: {
      type: String,
      required: [true, "Start date is required"],
      trim: true,
      maxlength: [40, "Start date must not exceed 40 characters"],
    },
    endDate: {
      type: String,
      trim: true,
      default: "",
      maxlength: [40, "End date must not exceed 40 characters"],
    },
    current: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: [1500, "Description must not exceed 1500 characters"],
    },
    order: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { _id: true },
);

const educationEntrySchema = new mongoose.Schema(
  {
    institution: {
      type: String,
      required: [true, "Institution name is required"],
      trim: true,
      minlength: [2, "Institution must be at least 2 characters"],
      maxlength: [200, "Institution must not exceed 200 characters"],
    },
    duration: {
      type: String,
      required: [true, "Duration is required"],
      trim: true,
      maxlength: [80, "Duration must not exceed 80 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters"],
      maxlength: [1000, "Description must not exceed 1000 characters"],
    },
    order: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { _id: true },
);

const certificationEntrySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Certification title is required"],
      trim: true,
      minlength: [2, "Title must be at least 2 characters"],
      maxlength: [150, "Title must not exceed 150 characters"],
    },
    issuer: {
      type: String,
      required: [true, "Issuer is required"],
      trim: true,
      minlength: [2, "Issuer must be at least 2 characters"],
      maxlength: [150, "Issuer must not exceed 150 characters"],
    },
    issueDate: {
      type: String,
      trim: true,
      default: "",
      maxlength: [40, "Issue date must not exceed 40 characters"],
    },
    credentialUrl: {
      type: String,
      trim: true,
      default: "",
      maxlength: [2048, "Credential URL must not exceed 2048 characters"],
      match: [
        /^$|^https?:\/\/.+/,
        "Credential URL must be empty or a valid HTTP/HTTPS URL",
      ],
    },
    order: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { _id: true },
);

const skillCategorySchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      minlength: [2, "Category name must be at least 2 characters"],
      maxlength: [80, "Category name must not exceed 80 characters"],
    },
    items: {
      type: [
        {
          type: String,
          trim: true,
          minlength: [1, "Skill item cannot be empty"],
          maxlength: [100, "Skill item must not exceed 100 characters"],
        },
      ],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length <= 30,
        message: "Skills list must not exceed 30 items",
      },
      default: [],
    },
    order: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { _id: true },
);

const languageEntrySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Language name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [60, "Name must not exceed 60 characters"],
    },
    proficiency: {
      type: String,
      enum: {
        values: RESUME_LANGUAGE_PROFICIENCIES,
        message: `proficiency must be one of: ${RESUME_LANGUAGE_PROFICIENCIES.join(", ")}`,
      },
      default: "professional",
    },
    order: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { _id: true },
);

const interestEntrySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Interest name is required"],
      trim: true,
      minlength: [1, "Name cannot be empty"],
      maxlength: [60, "Name must not exceed 60 characters"],
    },
    icon: {
      type: String,
      trim: true,
      default: "",
      maxlength: [60, "Icon key must not exceed 60 characters"],
    },
    order: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { _id: true },
);

/* ── Downloads — URL references to already-hosted files (e.g. a
 * Cloudinary raw asset or external link). Uploading raw (non-image)
 * files through Cloudinary is out of scope here — the existing
 * config/cloudinary.js pipeline only accepts image mimetypes/magic
 * bytes; see the accompanying migration/PR notes. ─────────────────── */
const downloadEntrySchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: [true, "Download label is required"],
      trim: true,
      minlength: [2, "Label must be at least 2 characters"],
      maxlength: [80, "Label must not exceed 80 characters"],
    },
    url: {
      type: String,
      required: [true, "Download URL is required"],
      trim: true,
      maxlength: [2048, "URL must not exceed 2048 characters"],
      match: [/^https?:\/\/.+/, "URL must be a valid HTTP/HTTPS address"],
    },
    fileType: {
      type: String,
      enum: {
        values: RESUME_DOWNLOAD_FILE_TYPES,
        message: `fileType must be one of: ${RESUME_DOWNLOAD_FILE_TYPES.join(", ")}`,
      },
      default: "pdf",
    },
    order: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { _id: true },
);

/* ================================================================== *
 * Root schema — ONE document per portfolio (singleton pattern via
 * singletonPlugin, matching Navigation/Footer/SEO/SiteSettings).
 * ================================================================== */

const resumeSchema = new mongoose.Schema(
  {
    hero: {
      type: heroSchema,
      default: () => ({}),
    },

    aboutMe: {
      type: aboutMeSchema,
      default: () => ({}),
    },

    experience: {
      type: [experienceEntrySchema],
      validate: {
        validator: (arr) =>
          Array.isArray(arr) && arr.length <= RESUME_LIMITS.EXPERIENCE_MAX,
        message: `Experience list must not exceed ${RESUME_LIMITS.EXPERIENCE_MAX} entries`,
      },
      default: [],
    },

    education: {
      type: [educationEntrySchema],
      validate: {
        validator: (arr) =>
          Array.isArray(arr) && arr.length <= RESUME_LIMITS.EDUCATION_MAX,
        message: `Education list must not exceed ${RESUME_LIMITS.EDUCATION_MAX} entries`,
      },
      default: [],
    },

    certifications: {
      type: [certificationEntrySchema],
      validate: {
        validator: (arr) =>
          Array.isArray(arr) && arr.length <= RESUME_LIMITS.CERTIFICATIONS_MAX,
        message: `Certifications list must not exceed ${RESUME_LIMITS.CERTIFICATIONS_MAX} entries`,
      },
      default: [],
    },

    skills: {
      type: [skillCategorySchema],
      validate: {
        validator: (arr) =>
          Array.isArray(arr) && arr.length <= RESUME_LIMITS.SKILLS_MAX,
        message: `Skills must not exceed ${RESUME_LIMITS.SKILLS_MAX} categories`,
      },
      default: [],
    },

    languages: {
      type: [languageEntrySchema],
      validate: {
        validator: (arr) =>
          Array.isArray(arr) && arr.length <= RESUME_LIMITS.LANGUAGES_MAX,
        message: `Languages must not exceed ${RESUME_LIMITS.LANGUAGES_MAX} entries`,
      },
      default: [],
    },

    interests: {
      type: [interestEntrySchema],
      validate: {
        validator: (arr) =>
          Array.isArray(arr) && arr.length <= RESUME_LIMITS.INTERESTS_MAX,
        message: `Interests must not exceed ${RESUME_LIMITS.INTERESTS_MAX} entries`,
      },
      default: [],
    },

    downloads: {
      type: [downloadEntrySchema],
      validate: {
        validator: (arr) =>
          Array.isArray(arr) && arr.length <= RESUME_LIMITS.DOWNLOADS_MAX,
        message: `Downloads must not exceed ${RESUME_LIMITS.DOWNLOADS_MAX} entries`,
      },
      default: [],
    },
  },
  { timestamps: true },
);

// Adds the `owner` field + unique sparse index (singleton pattern),
// matching Navigation/Footer/SEO/SiteSettings instead of re-declaring
// it inline as the old Resume/About/Profile models did.
resumeSchema.plugin(singletonPlugin);

export default mongoose.model("Resume", resumeSchema, "resumes");

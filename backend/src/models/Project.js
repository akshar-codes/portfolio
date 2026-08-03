import mongoose from "mongoose";
import { CONTENT_STATUSES, DEFAULT_CONTENT_STATUS } from "../utils/constants.js";

/* ------------------------------------------------------------------ *
 * Sub-schema: one technology group (e.g. "Frontend": ["React","Vite"])
 * ------------------------------------------------------------------ */
const techGroupSchema = new mongoose.Schema(
  {
    group: {
      type: String,
      required: [true, "Technology group name is required"],
      trim: true,
      minlength: [1, "Group name cannot be empty"],
      maxlength: [80, "Group name must not exceed 80 characters"],
    },
    items: {
      type: [
        {
          type: String,
          trim: true,
          minlength: [1, "Technology item cannot be empty"],
          maxlength: [60, "Technology item must not exceed 60 characters"],
        },
      ],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length <= 30,
        message: "Each technology group must not exceed 30 items",
      },
      default: [],
    },
  },
  { _id: true },
);

/* ------------------------------------------------------------------ *
 * Sub-schema: per-project SEO overrides. Mirrors models/SEO.js's
 * field shapes/limits (metaTitle 70 / metaDescription 160) and reuses
 * the same keyword cap the SEO singleton uses, so a per-project
 * override never behaves differently from the site-wide default it's
 * shadowing. `ogImage` is a Media-Library URL reference (picked via
 * the frontend's LibraryImageField), NOT an owned Cloudinary upload —
 * unlike image/bannerImage/gallery below, there is no public_id to
 * track or destroy here.
 * ------------------------------------------------------------------ */
const projectSeoSchema = new mongoose.Schema(
  {
    metaTitle: {
      type: String,
      trim: true,
      default: "",
      maxlength: [70, "Meta title must not exceed 70 characters"],
    },
    metaDescription: {
      type: String,
      trim: true,
      default: "",
      maxlength: [160, "Meta description must not exceed 160 characters"],
    },
    metaKeywords: {
      type: [
        {
          type: String,
          trim: true,
          lowercase: true,
          maxlength: [60, "Each meta keyword must not exceed 60 characters"],
        },
      ],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length <= 20,
        message: "Meta keywords must not exceed 20 entries",
      },
      default: [],
    },
    ogImage: {
      type: String,
      trim: true,
      default: "",
      maxlength: [2048, "OG image URL must not exceed 2048 characters"],
      match: [
        /^$|^https?:\/\/.+/,
        "OG image must be empty or a valid HTTP/HTTPS URL",
      ],
    },
  },
  { _id: false },
);

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Project title is required"],
      trim: true,
      minlength: [2, "Title must be at least 2 characters"],
      maxlength: [120, "Title must not exceed 120 characters"],
    },
    // Rich text (Tiptap HTML), sanitized server-side in
    // services/projectService.js before persistence — see
    // utils/htmlSanitizer.js. The 2000-character plain-text ceiling
    // this used to carry is widened to account for markup overhead;
    // mirrors the About.biography / Resume.experience[].description
    // convention (schema max is the authoritative POST-sanitization
    // ceiling).
    description: {
      type: String,
      trim: true,
      required: [true, "Project description is required"],
      maxlength: [5000, "Description must not exceed 5000 characters"],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    status: {
      type: String,
      enum: {
        values: CONTENT_STATUSES,
        message: `status must be one of: ${CONTENT_STATUSES.join(", ")}`,
      },
      default: DEFAULT_CONTENT_STATUS,
    },

    // Surfaces this project in a "Featured Projects" section ahead of
    // the rest of the (order-sorted) portfolio grid.
    featured: {
      type: Boolean,
      default: false,
    },

    image: {
      url: {
        type: String,
        required: [true, "Image URL is required"],
        trim: true,
        maxlength: [2048, "Image URL must not exceed 2048 characters"],
        match: [/^https?:\/\/.+/, "Image URL must be a valid HTTP/HTTPS URL"],
      },
      public_id: {
        type: String,
        required: [true, "Image public_id is required"],
        trim: true,
        maxlength: [500, "Image public_id must not exceed 500 characters"],
      },
    },
    // ── Extended detail fields ─────────────────────────────────────
    bannerImage: {
      url: {
        type: String,
        trim: true,
        default: "",
        maxlength: [2048, "Banner image URL must not exceed 2048 characters"],
        match: [
          /^$|^https?:\/\/.+/,
          "Banner image must be a valid URL or empty",
        ],
      },
      public_id: {
        type: String,
        trim: true,
        default: "",
        maxlength: [
          500,
          "Banner image public_id must not exceed 500 characters",
        ],
      },
    },

    // ── technologies: grouped structure ───────────────────────────

    technologies: {
      type: [techGroupSchema],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length <= 10,
        message: "Technologies must not exceed 10 groups",
      },
      default: [],
    },

    features: {
      type: [
        {
          type: String,
          trim: true,
          minlength: [1, "Feature cannot be empty"],
          maxlength: [200, "Feature must not exceed 200 characters"],
        },
      ],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length <= 20,
        message: "Features list must not exceed 20 entries",
      },
      default: [],
    },
    gallery: {
      type: [
        {
          url: {
            type: String,
            required: true,
            trim: true,
            maxlength: [
              2048,
              "Gallery image URL must not exceed 2048 characters",
            ],
            match: [/^https?:\/\/.+/, "Gallery image must be a valid URL"],
          },
          public_id: {
            type: String,
            required: true,
            trim: true,
            maxlength: [
              500,
              "Gallery image public_id must not exceed 500 characters",
            ],
          },
          order: {
            type: Number,
            default: 0,
          },
        },
      ],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length <= 10,
        message: "Gallery must not exceed 10 images",
      },
      default: [],
    },
    githubUrl: {
      type: String,
      trim: true,
      default: "",
      maxlength: [2048, "GitHub URL must not exceed 2048 characters"],
      match: [
        /^$|^https?:\/\/.+/,
        "GitHub URL must be empty or a valid HTTP/HTTPS URL",
      ],
    },
    liveUrl: {
      type: String,
      trim: true,
      default: "",
      maxlength: [2048, "Live URL must not exceed 2048 characters"],
      match: [
        /^$|^https?:\/\/.+/,
        "Live URL must be empty or a valid HTTP/HTTPS URL",
      ],
    },
    // Rich text — sanitized server-side, same rationale as
    // `description` above.
    challenge: {
      type: String,
      trim: true,
      default: "",
      maxlength: [3000, "Challenge must not exceed 3000 characters"],
    },
    solution: {
      type: String,
      trim: true,
      default: "",
      maxlength: [3000, "Solution must not exceed 3000 characters"],
    },
    // ── Keep legacy projectUrl for backward-compat ─────────────────
    projectUrl: {
      type: String,
      trim: true,
      default: "",
      maxlength: [2048, "Project URL must not exceed 2048 characters"],
      match: [
        /^$|^https?:\/\/.+/,
        "Project URL must be empty or a valid HTTP/HTTPS URL",
      ],
    },
    order: {
      type: Number,
      required: true,
      default: 0,
    },

    // Per-project SEO overrides — see projectSeoSchema above.
    seo: {
      type: projectSeoSchema,
      default: () => ({}),
    },
  },
  { timestamps: true },
);

projectSchema.index({ order: 1 });
projectSchema.index({ category: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ title: 1 });
projectSchema.index({ featured: 1 });

export default mongoose.model("Project", projectSchema);

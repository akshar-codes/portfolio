import mongoose from "mongoose";
import singletonPlugin from "../utils/singletonPlugin.js";
import { ABOUT_LIMITS } from "../utils/constants.js";

/* ------------------------------------------------------------------ *
 * Sub-schemas
 * ------------------------------------------------------------------ */

const serviceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Service title is required"],
      trim: true,
      minlength: [2, "Title must be at least 2 characters"],
      maxlength: [100, "Title must not exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Service description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters"],
      maxlength: [500, "Description must not exceed 500 characters"],
    },
    icon: {
      type: String,
      required: [true, "Icon key is required"],
      trim: true,
      lowercase: true,
      maxlength: [40, "Icon key must not exceed 40 characters"],
      match: [
        /^[a-z0-9_-]+$/,
        "Icon key may only contain lowercase letters, numbers, hyphens, and underscores",
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

/** A single personal-history entry — education, a milestone, an award, etc. */
const timelineEntrySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Timeline title is required"],
      trim: true,
      minlength: [2, "Title must be at least 2 characters"],
      maxlength: [120, "Title must not exceed 120 characters"],
    },
    subtitle: {
      type: String,
      trim: true,
      default: "",
      maxlength: [150, "Subtitle must not exceed 150 characters"],
    },
    dateRange: {
      type: String,
      required: [true, "Date range is required"],
      trim: true,
      maxlength: [80, "Date range must not exceed 80 characters"],
    },
    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: [1000, "Description must not exceed 1000 characters"],
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

/** A short stat badge — "3+ Years Experience", "50+ Projects Completed". */
const highlightSchema = new mongoose.Schema(
  {
    value: {
      type: String,
      required: [true, "Highlight value is required"],
      trim: true,
      minlength: [1, "Value cannot be empty"],
      maxlength: [20, "Value must not exceed 20 characters"],
    },
    label: {
      type: String,
      required: [true, "Highlight label is required"],
      trim: true,
      minlength: [1, "Label cannot be empty"],
      maxlength: [60, "Label must not exceed 60 characters"],
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

/** A key/value row for the "About Me" info grid (Nationality, Freelance, ...). */
const personalInfoSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: [true, "Label is required"],
      trim: true,
      minlength: [1, "Label cannot be empty"],
      maxlength: [40, "Label must not exceed 40 characters"],
    },
    value: {
      type: String,
      required: [true, "Value is required"],
      trim: true,
      minlength: [1, "Value cannot be empty"],
      maxlength: [150, "Value must not exceed 150 characters"],
    },
    order: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { _id: true },
);

/**
 * A gallery image, picked from the centralized Media Library
 * (models/Media.js) by URL reference. No `public_id` tracking is
 * needed here — the Media collection owns that asset's Cloudinary
 * lifecycle; this is a reference, not an owned upload.
 */
const aboutImageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: [true, "Image URL is required"],
      trim: true,
      maxlength: [2048, "URL must not exceed 2048 characters"],
      match: [/^https?:\/\/.+/, "Image URL must be a valid HTTP/HTTPS URL"],
    },
    altText: {
      type: String,
      trim: true,
      default: "",
      maxlength: [200, "Alt text must not exceed 200 characters"],
    },
    caption: {
      type: String,
      trim: true,
      default: "",
      maxlength: [200, "Caption must not exceed 200 characters"],
    },
    order: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { _id: true },
);

/* ------------------------------------------------------------------ *
 * Root schema — ONE document per portfolio (singleton pattern via
 * singletonPlugin, matching Navigation/Footer/SEO/SiteSettings/Resume
 * instead of the bespoke owner/status fields this model used to
 * declare inline).
 *
 * `biography` (rich text) supersedes the previous flat `paragraphs[]`
 * array — see scripts/migrateAboutSchema.js for the one-time
 * conversion of existing data.
 * ------------------------------------------------------------------ */
const aboutSchema = new mongoose.Schema(
  {
    // Sanitized server-side in services/aboutService.js before
    // persistence — see utils/htmlSanitizer.js.
    biography: {
      type: String,
      trim: true,
      default: "",
      maxlength: [8000, "Biography must not exceed 8000 characters"],
    },

    // Lightweight tag list (top skills strip), distinct from Resume's
    // structured category+items skills — no `order` field, matching
    // the existing unordered-tag-array convention already used by
    // Project.features / SEO.defaultKeywords.
    skillsSummary: {
      type: [
        {
          type: String,
          trim: true,
          minlength: [1, "Skill summary item cannot be empty"],
          maxlength: [60, "Each skill summary item must not exceed 60 characters"],
        },
      ],
      validate: {
        validator: (arr) =>
          Array.isArray(arr) && arr.length <= ABOUT_LIMITS.SKILLS_SUMMARY_MAX,
        message: `Skills summary must not exceed ${ABOUT_LIMITS.SKILLS_SUMMARY_MAX} entries`,
      },
      default: [],
    },

    services: {
      type: [serviceSchema],
      validate: {
        validator: (arr) =>
          Array.isArray(arr) && arr.length <= ABOUT_LIMITS.SERVICES_MAX,
        message: `Services list must not exceed ${ABOUT_LIMITS.SERVICES_MAX} entries`,
      },
      default: [],
    },

    timeline: {
      type: [timelineEntrySchema],
      validate: {
        validator: (arr) =>
          Array.isArray(arr) && arr.length <= ABOUT_LIMITS.TIMELINE_MAX,
        message: `Timeline must not exceed ${ABOUT_LIMITS.TIMELINE_MAX} entries`,
      },
      default: [],
    },

    highlights: {
      type: [highlightSchema],
      validate: {
        validator: (arr) =>
          Array.isArray(arr) && arr.length <= ABOUT_LIMITS.HIGHLIGHTS_MAX,
        message: `Highlights must not exceed ${ABOUT_LIMITS.HIGHLIGHTS_MAX} entries`,
      },
      default: [],
    },

    personalInfo: {
      type: [personalInfoSchema],
      validate: {
        validator: (arr) =>
          Array.isArray(arr) && arr.length <= ABOUT_LIMITS.PERSONAL_INFO_MAX,
        message: `Personal info must not exceed ${ABOUT_LIMITS.PERSONAL_INFO_MAX} entries`,
      },
      default: [],
    },

    images: {
      type: [aboutImageSchema],
      validate: {
        validator: (arr) =>
          Array.isArray(arr) && arr.length <= ABOUT_LIMITS.IMAGES_MAX,
        message: `Images must not exceed ${ABOUT_LIMITS.IMAGES_MAX} entries`,
      },
      default: [],
    },
  },
  { timestamps: true },
);

aboutSchema.plugin(singletonPlugin);

export default mongoose.model("About", aboutSchema);

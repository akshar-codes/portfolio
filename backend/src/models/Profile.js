import mongoose from "mongoose";
import singletonPlugin from "../utils/singletonPlugin.js";
import { PROFILE_LIMITS, CTA_BUTTON_STYLES } from "../constants/index.js";

/* ------------------------------------------------------------------ *
 * Sub-schemas
 * ------------------------------------------------------------------ */

const socialLinkSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: [true, "Social link label is required"],
      trim: true,
      minlength: [1, "Label cannot be empty"],
      maxlength: [50, "Label must not exceed 50 characters"],
    },
    url: {
      type: String,
      required: [true, "Social link URL is required"],
      trim: true,
      maxlength: [2048, "URL must not exceed 2048 characters"],
      match: [/^https?:\/\/.+/, "URL must be a valid HTTP/HTTPS address"],
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

/**
 * Hero call-to-action row (e.g. "Download CV" + "Contact Me"). This is
 * intentionally distinct from Navigation.ctaEnabled/ctaLabel/ctaUrl
 * (models/Navigation.js), which drives the single navbar CTA button —
 * ctaButtons here supports a small *row* of buttons scoped to the
 * profile hero section specifically, not the site-wide nav.
 */
const ctaButtonSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: [true, "CTA label is required"],
      trim: true,
      minlength: [1, "Label cannot be empty"],
      maxlength: [40, "Label must not exceed 40 characters"],
    },
    url: {
      type: String,
      required: [true, "CTA URL is required"],
      trim: true,
      maxlength: [2048, "URL must not exceed 2048 characters"],
      match: [
        /^\/|^https?:\/\/.+/,
        "URL must start with '/' or be a valid HTTP/HTTPS address",
      ],
    },
    style: {
      type: String,
      enum: {
        values: CTA_BUTTON_STYLES,
        message: `style must be one of: ${CTA_BUTTON_STYLES.join(", ")}`,
      },
      default: "primary",
    },
    openInNewTab: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { _id: true },
);

/** Hero "impact" strip — years of experience, commits, DSA solved, etc. */
const statisticSchema = new mongoose.Schema(
  {
    value: {
      type: Number,
      required: [true, "Statistic value is required"],
      min: [0, "Value cannot be negative"],
    },
    suffix: {
      type: String,
      trim: true,
      default: "",
      maxlength: [10, "Suffix must not exceed 10 characters"],
    },
    label: {
      type: String,
      required: [true, "Statistic label is required"],
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

/* ------------------------------------------------------------------ *
 * Root schema — ONE document per portfolio (singleton pattern via
 * singletonPlugin, matching Navigation/Footer/SEO/SiteSettings/Resume
 * instead of the bespoke owner/status fields this model used to
 * declare inline).
 * ------------------------------------------------------------------ */
const profileSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name must not exceed 100 characters"],
    },

    title: {
      type: String,
      required: [true, "Title / role is required"],
      trim: true,
      minlength: [2, "Title must be at least 2 characters"],
      maxlength: [100, "Title must not exceed 100 characters"],
    },

    // Short rich-text hero introduction. Sanitized server-side in
    // services/profileService.js before persistence — see
    // utils/htmlSanitizer.js.
    introduction: {
      type: String,
      trim: true,
      default: "",
      maxlength: [2000, "Introduction must not exceed 2000 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      maxlength: [254, "Email must not exceed 254 characters"],
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
    },

    phone: {
      type: String,
      trim: true,
      default: "",
      maxlength: [30, "Phone must not exceed 30 characters"],
    },

    location: {
      type: String,
      trim: true,
      default: "",
      maxlength: [120, "Location must not exceed 120 characters"],
    },

    avatar: {
      type: String,
      trim: true,
      default: "",
      maxlength: [2048, "Avatar URL must not exceed 2048 characters"],
      match: [
        /^$|^https?:\/\/.+/,
        "Avatar must be empty or a valid HTTP/HTTPS URL",
      ],
    },

    socialLinks: {
      type: [socialLinkSchema],
      validate: {
        validator: (arr) =>
          Array.isArray(arr) && arr.length <= PROFILE_LIMITS.SOCIAL_LINKS_MAX,
        message: `Social links must not exceed ${PROFILE_LIMITS.SOCIAL_LINKS_MAX} entries`,
      },
      default: [],
    },

    ctaButtons: {
      type: [ctaButtonSchema],
      validate: {
        validator: (arr) =>
          Array.isArray(arr) && arr.length <= PROFILE_LIMITS.CTA_BUTTONS_MAX,
        message: `CTA buttons must not exceed ${PROFILE_LIMITS.CTA_BUTTONS_MAX} entries`,
      },
      default: [],
    },

    statistics: {
      type: [statisticSchema],
      validate: {
        validator: (arr) =>
          Array.isArray(arr) && arr.length <= PROFILE_LIMITS.STATISTICS_MAX,
        message: `Statistics must not exceed ${PROFILE_LIMITS.STATISTICS_MAX} entries`,
      },
      default: [],
    },
  },
  { timestamps: true },
);

// Adds `owner` + `status` (publish/draft) fields and their indexes —
// see utils/singletonPlugin.js. The actual singleton find/create logic
// lives in repositories/SingletonRepository.js, consumed via
// repositories/profileRepository.js.
profileSchema.plugin(singletonPlugin);

export default mongoose.model("Profile", profileSchema);

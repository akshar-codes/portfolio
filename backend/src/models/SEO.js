import mongoose from "mongoose";
import singletonPlugin from "../utils/singletonPlugin.js";

/* ------------------------------------------------------------------ *
 * Sub-schema — JSON-LD "Organization" fields
 * ------------------------------------------------------------------ */

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default: "",
      maxlength: [150, "Organization name must not exceed 150 characters"],
    },
    url: {
      type: String,
      trim: true,
      default: "",
      maxlength: [2048, "Organization URL must not exceed 2048 characters"],
      match: [
        /^$|^https?:\/\/.+/,
        "Organization URL must be empty or a valid HTTP/HTTPS URL",
      ],
    },
    logoUrl: {
      type: String,
      trim: true,
      default: "",
      maxlength: [
        2048,
        "Organization logo URL must not exceed 2048 characters",
      ],
      match: [
        /^$|^https?:\/\/.+/,
        "Organization logo URL must be empty or a valid HTTP/HTTPS URL",
      ],
    },
  },
  { _id: false },
);

/* ------------------------------------------------------------------ *
 * Root schema — ONE document, global default SEO configuration
 * ------------------------------------------------------------------ */

const seoSchema = new mongoose.Schema(
  {
    defaultMetaTitle: {
      type: String,
      required: [true, "Default meta title is required"],
      trim: true,
      minlength: [2, "Default meta title must be at least 2 characters"],
      maxlength: [70, "Default meta title must not exceed 70 characters"],
    },

    defaultMetaDescription: {
      type: String,
      trim: true,
      default: "",
      maxlength: [
        160,
        "Default meta description must not exceed 160 characters",
      ],
    },

    defaultOgImage: {
      type: String,
      trim: true,
      default: "",
      maxlength: [2048, "OG image URL must not exceed 2048 characters"],
      match: [
        /^$|^https?:\/\/.+/,
        "OG image URL must be empty or a valid HTTP/HTTPS URL",
      ],
    },

    twitterHandle: {
      type: String,
      trim: true,
      default: "",
      maxlength: [16, "Twitter handle must not exceed 16 characters"],
      match: [
        /^$|^@[A-Za-z0-9_]{1,15}$/,
        "Twitter handle must be empty or start with '@'",
      ],
    },

    canonicalBaseUrl: {
      type: String,
      trim: true,
      default: "",
      maxlength: [2048, "Canonical base URL must not exceed 2048 characters"],
      match: [
        /^$|^https?:\/\/.+/,
        "Canonical base URL must be empty or a valid HTTP/HTTPS URL",
      ],
    },

    robotsIndex: {
      type: Boolean,
      default: true,
    },

    robotsFollow: {
      type: Boolean,
      default: true,
    },

    sitemapEnabled: {
      type: Boolean,
      default: true,
    },

    googleAnalyticsId: {
      type: String,
      trim: true,
      default: "",
      maxlength: [40, "Google Analytics ID must not exceed 40 characters"],
    },

    googleSiteVerification: {
      type: String,
      trim: true,
      default: "",
      maxlength: [
        100,
        "Google site verification token must not exceed 100 characters",
      ],
    },

    organization: {
      type: organizationSchema,
      default: () => ({}),
    },
  },
  { timestamps: true },
);

seoSchema.plugin(singletonPlugin);

export default mongoose.model("SEO", seoSchema, "seo");

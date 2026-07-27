import mongoose from "mongoose";
import singletonPlugin from "../utils/singletonPlugin.js";
import {
  OG_TYPES,
  TWITTER_CARD_TYPES,
  SEO_KEYWORDS_MAX,
  SEO_KEYWORD_MAX_LENGTH,
  STRUCTURED_DATA_MAX_LENGTH,
} from "../utils/constants.js";

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

/**
 * OpenGraph overrides. Falls back to defaultMetaTitle/
 * defaultMetaDescription/defaultOgImage when left blank — see
 * services/seoService equivalent resolution notes in the frontend
 * preview component. `defaultOgImage` is kept below for backward
 * compatibility with documents created before this sub-schema
 * existed; `openGraph.image` is the field new/updated documents
 * should use going forward.
 */
const openGraphSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      default: "",
      maxlength: [70, "OpenGraph title must not exceed 70 characters"],
    },
    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: [200, "OpenGraph description must not exceed 200 characters"],
    },
    image: {
      type: String,
      trim: true,
      default: "",
      maxlength: [2048, "OpenGraph image URL must not exceed 2048 characters"],
      match: [
        /^$|^https?:\/\/.+/,
        "OpenGraph image must be empty or a valid HTTP/HTTPS URL",
      ],
    },
    type: {
      type: String,
      enum: {
        values: OG_TYPES,
        message: `OpenGraph type must be one of: ${OG_TYPES.join(", ")}`,
      },
      default: "website",
    },
  },
  { _id: false },
);

const twitterCardSchema = new mongoose.Schema(
  {
    cardType: {
      type: String,
      enum: {
        values: TWITTER_CARD_TYPES,
        message: `Twitter card type must be one of: ${TWITTER_CARD_TYPES.join(", ")}`,
      },
      default: "summary_large_image",
    },
    title: {
      type: String,
      trim: true,
      default: "",
      maxlength: [70, "Twitter card title must not exceed 70 characters"],
    },
    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: [200, "Twitter card description must not exceed 200 characters"],
    },
    image: {
      type: String,
      trim: true,
      default: "",
      maxlength: [2048, "Twitter card image URL must not exceed 2048 characters"],
      match: [
        /^$|^https?:\/\/.+/,
        "Twitter card image must be empty or a valid HTTP/HTTPS URL",
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

    defaultKeywords: {
      type: [
        {
          type: String,
          trim: true,
          lowercase: true,
          maxlength: [
            SEO_KEYWORD_MAX_LENGTH,
            `Each keyword must not exceed ${SEO_KEYWORD_MAX_LENGTH} characters`,
          ],
        },
      ],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length <= SEO_KEYWORDS_MAX,
        message: `Keywords must not exceed ${SEO_KEYWORDS_MAX} entries`,
      },
      default: [],
    },

    // Superseded by openGraph.image for new/updated documents — kept
    // for backward compatibility with pre-existing SEO singletons.
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

    bingSiteVerification: {
      type: String,
      trim: true,
      default: "",
      maxlength: [
        100,
        "Bing site verification token must not exceed 100 characters",
      ],
    },

    openGraph: {
      type: openGraphSchema,
      default: () => ({}),
    },

    twitterCard: {
      type: twitterCardSchema,
      default: () => ({}),
    },

    // Raw JSON-LD, merged onto the page alongside the `organization`
    // block below rather than replacing it — lets an admin add e.g. a
    // WebSite or BreadcrumbList block without a dedicated UI for every
    // possible schema.org type.
    structuredData: {
      type: String,
      trim: true,
      default: "",
      maxlength: [
        STRUCTURED_DATA_MAX_LENGTH,
        `Structured data must not exceed ${STRUCTURED_DATA_MAX_LENGTH} characters`,
      ],
      validate: {
        validator: (val) => {
          if (!val) return true;
          try {
            JSON.parse(val);
            return true;
          } catch {
            return false;
          }
        },
        message: "Structured data must be valid JSON (JSON-LD)",
      },
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

import mongoose from "mongoose";
import singletonPlugin from "../utils/singletonPlugin.js";
import {
  FOOTER_DESCRIPTION_MAX,
  FOOTER_NEWSLETTER_LIMITS,
} from "../constants/index.js";

/* ------------------------------------------------------------------ *
 * Sub-schemas
 * ------------------------------------------------------------------ */

/**
 * A single bottom-bar legal link (e.g. "Privacy Policy", "Terms of
 * Service"). Rendered in the footer's copyright row alongside the
 * copyright text — distinct from footer *column* links, which live
 * inside the main column grid.
 */
const legalLinkSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: [true, "Legal link label is required"],
      trim: true,
      minlength: [1, "Label cannot be empty"],
      maxlength: [50, "Label must not exceed 50 characters"],
    },
    url: {
      type: String,
      required: [true, "Legal link URL is required"],
      trim: true,
      maxlength: [2048, "URL must not exceed 2048 characters"],
      match: [
        /^\/|^https?:\/\/.+/,
        "URL must start with '/' or be a valid HTTP/HTTPS URL",
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

const footerLinkSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: [true, "Footer link label is required"],
      trim: true,
      minlength: [1, "Label cannot be empty"],
      maxlength: [50, "Label must not exceed 50 characters"],
    },
    url: {
      type: String,
      required: [true, "Footer link URL is required"],
      trim: true,
      maxlength: [2048, "URL must not exceed 2048 characters"],
      match: [
        /^\/|^https?:\/\/.+/,
        "URL must start with '/' or be a valid HTTP/HTTPS URL",
      ],
    },
  },
  { _id: true },
);

const footerColumnSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Footer column title is required"],
      trim: true,
      minlength: [1, "Title cannot be empty"],
      maxlength: [60, "Title must not exceed 60 characters"],
    },
    links: {
      type: [footerLinkSchema],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length <= 15,
        message: "Each footer column must not exceed 15 links",
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

/**
 * Newsletter signup block rendered in the site footer. Sending actual
 * subscription emails is out of scope here (no email-provider
 * integration exists in this codebase yet) — this schema only owns
 * the on/off switch and the copy shown around the signup form.
 */
const newsletterSchema = new mongoose.Schema(
  {
    enabled: {
      type: Boolean,
      default: false,
    },
    heading: {
      type: String,
      trim: true,
      default: "Subscribe to our newsletter",
      maxlength: [
        FOOTER_NEWSLETTER_LIMITS.HEADING_MAX,
        `Newsletter heading must not exceed ${FOOTER_NEWSLETTER_LIMITS.HEADING_MAX} characters`,
      ],
    },

    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: [
        FOOTER_NEWSLETTER_LIMITS.DESCRIPTION_MAX,
        `Newsletter description must not exceed ${FOOTER_NEWSLETTER_LIMITS.DESCRIPTION_MAX} characters`,
      ],
    },
    placeholder: {
      type: String,
      trim: true,
      default: "Enter your email",
      maxlength: [
        FOOTER_NEWSLETTER_LIMITS.PLACEHOLDER_MAX,
        `Placeholder must not exceed ${FOOTER_NEWSLETTER_LIMITS.PLACEHOLDER_MAX} characters`,
      ],
    },
    buttonLabel: {
      type: String,
      trim: true,
      default: "Subscribe",
      maxlength: [
        FOOTER_NEWSLETTER_LIMITS.BUTTON_LABEL_MAX,
        `Button label must not exceed ${FOOTER_NEWSLETTER_LIMITS.BUTTON_LABEL_MAX} characters`,
      ],
    },
  },
  { _id: false },
);

/* ------------------------------------------------------------------ *
 * Root schema — ONE document, global site footer
 * ------------------------------------------------------------------ */

const footerSchema = new mongoose.Schema(
  {
    columns: {
      type: [footerColumnSchema],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length <= 6,
        message: "Footer must not exceed 6 columns",
      },
      default: [],
    },

    // May contain sanitized HTML — same rationale as
    // newsletter.description above.
    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: [
        FOOTER_DESCRIPTION_MAX,
        `Footer description must not exceed ${FOOTER_DESCRIPTION_MAX} characters`,
      ],
    },

    copyrightText: {
      type: String,
      trim: true,

      default: () => `© ${new Date().getFullYear()} All rights reserved.`,
      maxlength: [300, "Copyright text must not exceed 300 characters"],
    },

    showSocialLinks: {
      type: Boolean,
      default: true,
    },

    showContactInfo: {
      type: Boolean,
      default: true,
    },

    newsletter: {
      type: newsletterSchema,
      default: () => ({}),
    },

    /**
     * Bottom-bar legal links (Privacy Policy, Terms of Service, etc.).
     * Rendered next to the copyright text in the footer's bottom row.
     * Capped at 10 — typical sites have 2–4 legal links; more than that
     * saturates the bottom bar on small screens.
     */
    legalLinks: {
      type: [legalLinkSchema],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length <= 10,
        message: "Footer must not exceed 10 legal links",
      },
      default: [],
    },
  },
  { timestamps: true },
);

footerSchema.plugin(singletonPlugin);

export default mongoose.model("Footer", footerSchema, "footer");

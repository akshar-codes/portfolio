import mongoose from "mongoose";
import singletonPlugin from "../utils/singletonPlugin.js";

/* ------------------------------------------------------------------ *
 * Root schema — ONE document, global site-wide configuration
 * ------------------------------------------------------------------ */

const siteSettingsSchema = new mongoose.Schema(
  {
    siteName: {
      type: String,
      required: [true, "Site name is required"],
      trim: true,
      minlength: [2, "Site name must be at least 2 characters"],
      maxlength: [100, "Site name must not exceed 100 characters"],
    },

    tagline: {
      type: String,
      trim: true,
      default: "",
      maxlength: [200, "Tagline must not exceed 200 characters"],
    },

    logoUrl: {
      type: String,
      trim: true,
      default: "",
      maxlength: [2048, "Logo URL must not exceed 2048 characters"],
      match: [
        /^$|^https?:\/\/.+/,
        "Logo URL must be empty or a valid HTTP/HTTPS URL",
      ],
    },

    faviconUrl: {
      type: String,
      trim: true,
      default: "",
      maxlength: [2048, "Favicon URL must not exceed 2048 characters"],
      match: [
        /^$|^https?:\/\/.+/,
        "Favicon URL must be empty or a valid HTTP/HTTPS URL",
      ],
    },

    primaryColor: {
      type: String,
      trim: true,
      default: "#00ff88",
      match: [
        /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/,
        "primaryColor must be a valid hex color",
      ],
    },

    secondaryColor: {
      type: String,
      trim: true,
      default: "#1c1c1e",
      match: [
        /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/,
        "secondaryColor must be a valid hex color",
      ],
    },

    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
      maxlength: [254, "Contact email must not exceed 254 characters"],
      match: [
        /^$|^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid contact email",
      ],
    },

    maintenanceMode: {
      type: Boolean,
      default: false,
    },

    maintenanceMessage: {
      type: String,
      trim: true,
      default: "We'll be back shortly. Thanks for your patience.",
      maxlength: [500, "Maintenance message must not exceed 500 characters"],
    },

    timezone: {
      type: String,
      trim: true,
      default: "Asia/Kolkata",
      maxlength: [60, "Timezone must not exceed 60 characters"],
    },

    defaultLocale: {
      type: String,
      trim: true,
      default: "en",
      maxlength: [10, "Locale must not exceed 10 characters"],
    },
  },
  { timestamps: true },
);

siteSettingsSchema.plugin(singletonPlugin);

export default mongoose.model(
  "SiteSettings",
  siteSettingsSchema,
  "siteSettings",
);

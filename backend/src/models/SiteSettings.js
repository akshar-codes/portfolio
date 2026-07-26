import mongoose from "mongoose";
import singletonPlugin from "../utils/singletonPlugin.js";
import {
  THEME_MODES,
  DEFAULT_THEME_MODE,
  SITE_SETTINGS_LIMITS,
} from "../utils/constants.js";

/* ------------------------------------------------------------------ *
 * Sub-schemas
 * ------------------------------------------------------------------ */

/**
 * Shared shape for any Cloudinary-backed image field (logo, favicon).
 * Mirrors Project.image / Media's url+public_id pairing so the same
 * Stage → Save → Destroy lifecycle (see
 * services/SiteSettingsService.js `uploadSiteLogo`/`uploadSiteFavicon`)
 * can track and clean up the underlying asset. Deliberately excluded
 * from the generic PATCH allow-list for that reason — see
 * PATCHABLE_FIELDS in SiteSettingsService.js.
 */
const imageAssetSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      trim: true,
      default: "",
      maxlength: [2048, "Image URL must not exceed 2048 characters"],
      match: [
        /^$|^https?:\/\/.+/,
        "Image URL must be empty or a valid HTTP/HTTPS URL",
      ],
    },
    public_id: {
      type: String,
      trim: true,
      default: "",
      maxlength: [500, "Image public_id must not exceed 500 characters"],
    },
  },
  { _id: false },
);

const announcementBarSchema = new mongoose.Schema(
  {
    enabled: {
      type: Boolean,
      default: false,
    },
    message: {
      type: String,
      trim: true,
      default: "",
      maxlength: [300, "Announcement message must not exceed 300 characters"],
    },
    ctaLabel: {
      type: String,
      trim: true,
      default: "",
      maxlength: [40, "CTA label must not exceed 40 characters"],
    },
    ctaUrl: {
      type: String,
      trim: true,
      default: "",
      maxlength: [2048, "CTA URL must not exceed 2048 characters"],
      match: [
        /^$|^\/|^https?:\/\/.+/,
        "CTA URL must be empty, start with '/', or be a valid HTTP/HTTPS URL",
      ],
    },
    backgroundColor: {
      type: String,
      trim: true,
      default: "#00ff88",
      match: [
        /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/,
        "backgroundColor must be a valid hex color",
      ],
    },
    textColor: {
      type: String,
      trim: true,
      default: "#1c1c1e",
      match: [
        /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/,
        "textColor must be a valid hex color",
      ],
    },
    dismissible: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false },
);

const contactEmailSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: [true, "Email label is required"],
      trim: true,
      maxlength: [50, "Label must not exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email address is required"],
      trim: true,
      lowercase: true,
      maxlength: [254, "Email must not exceed 254 characters"],
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
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

const contactPhoneSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: [true, "Phone label is required"],
      trim: true,
      maxlength: [50, "Label must not exceed 50 characters"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      maxlength: [30, "Phone must not exceed 30 characters"],
    },
    order: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { _id: true },
);

const contactAddressSchema = new mongoose.Schema(
  {
    line1: {
      type: String,
      trim: true,
      default: "",
      maxlength: [150, "Address line 1 must not exceed 150 characters"],
    },
    line2: {
      type: String,
      trim: true,
      default: "",
      maxlength: [150, "Address line 2 must not exceed 150 characters"],
    },
    city: {
      type: String,
      trim: true,
      default: "",
      maxlength: [100, "City must not exceed 100 characters"],
    },
    state: {
      type: String,
      trim: true,
      default: "",
      maxlength: [100, "State must not exceed 100 characters"],
    },
    postalCode: {
      type: String,
      trim: true,
      default: "",
      maxlength: [20, "Postal code must not exceed 20 characters"],
    },
    country: {
      type: String,
      trim: true,
      default: "",
      maxlength: [100, "Country must not exceed 100 characters"],
    },
  },
  { _id: false },
);

/**
 * Site-wide "Download CV" CTA (e.g. rendered in the navbar). Kept
 * deliberately independent of:
 *   - Resume.hero.ctaEnabled/ctaLabel (models/Resume.js) — that drives
 *     the CTA shown only on the /resume page itself.
 *   - Resume.downloads[] — structured file records, pending the raw
 *     (non-image) Cloudinary upload pipeline flagged as outstanding in
 *     docs/architecture.md.
 * This field lets a global CTA point at any already-hosted URL without
 * depending on that pipeline landing first.
 */
const resumeDownloadSchema = new mongoose.Schema(
  {
    enabled: {
      type: Boolean,
      default: false,
    },
    url: {
      type: String,
      trim: true,
      default: "",
      maxlength: [2048, "Resume download URL must not exceed 2048 characters"],
      match: [
        /^$|^https?:\/\/.+/,
        "Resume download URL must be empty or a valid HTTP/HTTPS URL",
      ],
    },
    label: {
      type: String,
      trim: true,
      default: "Download CV",
      maxlength: [40, "Label must not exceed 40 characters"],
    },
  },
  { _id: false },
);

const themeSchema = new mongoose.Schema(
  {
    mode: {
      type: String,
      enum: {
        values: THEME_MODES,
        message: `mode must be one of: ${THEME_MODES.join(", ")}`,
      },
      default: DEFAULT_THEME_MODE,
    },
  },
  { _id: false },
);

/**
 * Tracking/analytics provider IDs. Kept separate from
 * SEO.googleAnalyticsId (models/SEO.js), which exists specifically for
 * meta/structured-data purposes — this is the canonical place for
 * analytics + tag-manager IDs going forward. SEO's field is left as-is
 * to avoid a breaking change to that model, but should be treated as
 * superseded for this purpose.
 */
const analyticsSchema = new mongoose.Schema(
  {
    googleAnalyticsId: {
      type: String,
      trim: true,
      default: "",
      maxlength: [40, "Google Analytics ID must not exceed 40 characters"],
    },
    googleTagManagerId: {
      type: String,
      trim: true,
      default: "",
      maxlength: [40, "Google Tag Manager ID must not exceed 40 characters"],
    },
    facebookPixelId: {
      type: String,
      trim: true,
      default: "",
      maxlength: [40, "Facebook Pixel ID must not exceed 40 characters"],
    },
    hotjarId: {
      type: String,
      trim: true,
      default: "",
      maxlength: [40, "Hotjar ID must not exceed 40 characters"],
    },
    microsoftClarityId: {
      type: String,
      trim: true,
      default: "",
      maxlength: [40, "Microsoft Clarity ID must not exceed 40 characters"],
    },
  },
  { _id: false },
);

/* ------------------------------------------------------------------ *
 * Root schema — ONE document, global site-wide configuration
 * ------------------------------------------------------------------ */

const siteSettingsSchema = new mongoose.Schema(
  {
    /* ── Website ──────────────────────────────────────────────────── */
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

    /* ── Logo / Favicon ───────────────────────────────────────────── */
    logo: {
      type: imageAssetSchema,
      default: () => ({}),
    },
    favicon: {
      type: imageAssetSchema,
      default: () => ({}),
    },

    /* ── Brand Colors ─────────────────────────────────────────────── */
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

    /* ── Announcement Bar ─────────────────────────────────────────── */
    announcementBar: {
      type: announcementBarSchema,
      default: () => ({}),
    },

    /* ── Contact Information ──────────────────────────────────────── */
    contactEmails: {
      type: [contactEmailSchema],
      validate: {
        validator: (arr) =>
          Array.isArray(arr) &&
          arr.length <= SITE_SETTINGS_LIMITS.CONTACT_EMAILS_MAX,
        message: `Contact emails must not exceed ${SITE_SETTINGS_LIMITS.CONTACT_EMAILS_MAX} entries`,
      },
      default: [],
    },
    contactPhones: {
      type: [contactPhoneSchema],
      validate: {
        validator: (arr) =>
          Array.isArray(arr) &&
          arr.length <= SITE_SETTINGS_LIMITS.CONTACT_PHONES_MAX,
        message: `Contact phones must not exceed ${SITE_SETTINGS_LIMITS.CONTACT_PHONES_MAX} entries`,
      },
      default: [],
    },
    contactAddress: {
      type: contactAddressSchema,
      default: () => ({}),
    },

    /* ── Resume (site-wide download CTA — see resumeDownloadSchema) ─ */
    resumeDownload: {
      type: resumeDownloadSchema,
      default: () => ({}),
    },

    /* ── Theme ────────────────────────────────────────────────────── */
    theme: {
      type: themeSchema,
      default: () => ({}),
    },

    /* ── Analytics IDs ────────────────────────────────────────────── */
    analytics: {
      type: analyticsSchema,
      default: () => ({}),
    },

    /**
     * Global visibility switch only — the social links themselves
     * remain owned by Profile (models/Profile.js:socialLinks) so this
     * never duplicates that data, it only gates whether the public
     * site renders it.
     */
    socialLinksEnabled: {
      type: Boolean,
      default: true,
    },

    /* ── Maintenance Mode ─────────────────────────────────────────── */
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
  },
  { timestamps: true },
);

siteSettingsSchema.plugin(singletonPlugin);

export default mongoose.model(
  "SiteSettings",
  siteSettingsSchema,
  "siteSettings",
);

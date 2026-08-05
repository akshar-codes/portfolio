/* ── Auth / cookies ──────────────────────────────────────────────── */
export const COOKIE_NAME = "admin_token";
export const JWT_EXPIRES_IN = "1d";
export const COOKIE_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 1 day

/* ── Pagination defaults ─────────────────────────────────────────── */
export const DEFAULT_PROJECTS_PAGE_SIZE = 9;
export const DEFAULT_PROJECTS_ADMIN_PAGE_SIZE = 10;
export const DEFAULT_MESSAGES_PAGE_SIZE = 10;
export const DEFAULT_MEDIA_PAGE_SIZE = 24;
export const MAX_PAGE_SIZE = 50;

/* ── Cache TTLs (ms) ──────────────────────────────────────────────── */
export const CACHE_TTL_MS = 60_000;

/* ── Rate limiting ────────────────────────────────────────────────── */
export const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
export const LOGIN_RATE_LIMIT_MAX = 5;
export const CONTACT_FORM_RATE_LIMIT_MAX = 20;
export const GLOBAL_RATE_LIMIT_MAX = 300;

/* ── File upload constraints ──────────────────────────────────────── */
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
export const MAX_PROJECT_UPLOAD_FILES = 12;
export const MAX_GALLERY_IMAGES = 10;

export const ALLOWED_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

/* ── Media library ─────────────────────────────────────────────────
 * MEDIA_SORT_FIELDS / DEFAULT_MEDIA_SORT_FIELD back the admin Media
 * Library dashboard's sortable columns (see services/mediaService.js
 * buildSort) — centralized here for the same drift-prevention reason
 * as PROJECT_ADMIN_SORT_FIELDS below.
 * ------------------------------------------------------------------ */
export const MEDIA_DEFAULT_FOLDER = "general";
export const MAX_MEDIA_TAGS = 20;
export const MEDIA_CAPTION_MAX_LENGTH = 300;
export const MEDIA_SORT_FIELDS = ["createdAt", "originalName", "bytes"];
export const DEFAULT_MEDIA_SORT_FIELD = "createdAt";

/* ── Content publish/draft workflow ───────────────────────────────────
 * Applies to every CMS resource with a public-facing representation:
 * singleton pages (SiteSettings, Navigation, Footer, SEO, Profile,
 * About, Resume) and list resources (Project, Category).
 *
 * Deliberately NOT applied to Media (admin-only asset registry, no
 * public route — "publish" has no meaning for a raw asset; it has its
 * own active/trash concept instead, see MEDIA_DEFAULT_FOLDER above) or
 * to Messages (transactional records, not content — see
 * MESSAGE_STATUSES below for their own read/unread concept instead).
 *
 * IMPORTANT: public-read gating checks `status === CONTENT_STATUS_DRAFT`
 * (never `!== CONTENT_STATUS_PUBLISHED`). Mongoose does not backfill
 * schema defaults onto already-persisted documents read via `.lean()`,
 * so any document that existed before this field was introduced will
 * have `status === undefined`. Gating on "is it explicitly draft" keeps
 * every pre-existing document publicly visible without requiring a
 * migration to run first; `scripts/migrateContentStatus.js` backfills
 * the field for cleanliness, but the application does not depend on it.
 * ------------------------------------------------------------------ */
export const CONTENT_STATUS_DRAFT = "draft";
export const CONTENT_STATUS_PUBLISHED = "published";
export const CONTENT_STATUSES = [CONTENT_STATUS_DRAFT, CONTENT_STATUS_PUBLISHED];
export const DEFAULT_CONTENT_STATUS = CONTENT_STATUS_PUBLISHED;

/* ── Category listing (admin) ─────────────────────────────────────────
 * "order" was added alongside the manual drag-reorder feature (mirrors
 * Project.order / reorderProjects) — see services/categoryService.js
 * reorderCategories() and routes/admin/categoryRoutes.js PATCH /reorder.
 * ------------------------------------------------------------------ */
export const CATEGORY_SORT_FIELDS = ["name", "createdAt", "projectCount", "order"];
export const DEFAULT_CATEGORY_SORT_FIELD = "name";

/* ── Contact messages ─────────────────────────────────────────────── */
export const MESSAGE_CAP = 500;
export const MESSAGE_STATUS_UNREAD = "unread";
export const MESSAGE_STATUS_READ = "read";
export const MESSAGE_STATUSES = [MESSAGE_STATUS_UNREAD, MESSAGE_STATUS_READ];
export const DEFAULT_MESSAGE_STATUS = MESSAGE_STATUS_UNREAD;

/* ── Resume CMS ────────────────────────────────────────────────────
 * Centralized here (rather than inlined separately in the Mongoose
 * schema and the express-validator chain) so both validation layers
 * stay in lockstep — a drift between them would mean the API accepts
 * a value the schema then silently rejects (or vice versa).
 * ------------------------------------------------------------------ */
export const RESUME_AVAILABILITY_STATUSES = [
  "available",
  "unavailable",
  "open_to_offers",
];

export const RESUME_LANGUAGE_PROFICIENCIES = [
  "basic",
  "intermediate",
  "professional",
  "fluent",
  "native",
];

export const RESUME_DOWNLOAD_FILE_TYPES = ["pdf", "docx", "other"];

export const RESUME_LIMITS = {
  EXPERIENCE_MAX: 30,
  EDUCATION_MAX: 20,
  CERTIFICATIONS_MAX: 30,
  SKILLS_MAX: 15,
  LANGUAGES_MAX: 15,
  INTERESTS_MAX: 20,
  DOWNLOADS_MAX: 5,
};

/* ── Site Settings CMS ─────────────────────────────────────────────
 * Same centralization rationale as RESUME_LIMITS above: THEME_MODES
 * and SITE_SETTINGS_LIMITS are consumed by both
 * models/SiteSettings.js (Mongoose enum/array validators) and
 * validators/siteSettings.validator.js (express-validator chains) so
 * the two layers cannot drift apart.
 * ------------------------------------------------------------------ */
export const THEME_MODES = ["light", "dark", "system"];
export const DEFAULT_THEME_MODE = "dark";

export const SITE_SETTINGS_LIMITS = {
  CONTACT_EMAILS_MAX: 5,
  CONTACT_PHONES_MAX: 5,
};

/* ── Body size limits ─────────────────────────────────────────────── */
export const JSON_BODY_LIMIT = "150kb";

/* ── Navigation CMS ────────────────────────────────────────────────
 * NAV_MAX_ITEMS matches the limit that used to be hardcoded inline on
 * Navigation.items (models/Navigation.js) — centralized now that a
 * second, per-item limit (dropdown children) needs to live alongside
 * it, for the same drift-prevention reason as RESUME_LIMITS above.
 * ------------------------------------------------------------------ */
export const NAV_MAX_ITEMS = 20;
export const NAV_MAX_CHILDREN_PER_ITEM = 10;

/* ── Footer CMS ────────────────────────────────────────────────────── */
export const FOOTER_DESCRIPTION_MAX = 1000;

export const FOOTER_NEWSLETTER_LIMITS = {
  HEADING_MAX: 100,
  DESCRIPTION_MAX: 1000,
  PLACEHOLDER_MAX: 100,
  BUTTON_LABEL_MAX: 40,
};

/* ── SEO CMS ───────────────────────────────────────────────────────── */
export const SEO_KEYWORDS_MAX = 20;
export const SEO_KEYWORD_MAX_LENGTH = 60;
export const OG_TYPES = ["website", "article", "profile"];
export const TWITTER_CARD_TYPES = ["summary", "summary_large_image"];
export const STRUCTURED_DATA_MAX_LENGTH = 5000;

/* ── Project CMS ───────────────────────────────────────────────────
 * `featured` powers a homepage/portfolio "featured projects" filter;
 * `seo.*` mirrors the SEO singleton's field shapes/limits (metaTitle
 * 70 chars, metaDescription 160 chars, metaKeywords capped at
 * SEO_KEYWORDS_MAX/SEO_KEYWORD_MAX_LENGTH above — reused rather than
 * re-declared) so per-project overrides stay visually/behaviorally
 * consistent with the global SEO defaults they override.
 * ------------------------------------------------------------------ */
export const PROJECT_ADMIN_SORT_FIELDS = ["order", "title", "createdAt"];
export const DEFAULT_PROJECT_ADMIN_SORT_FIELD = "order";

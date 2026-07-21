/* ── Auth / cookies ──────────────────────────────────────────────── */
export const COOKIE_NAME = "admin_token";
export const JWT_EXPIRES_IN = "1d";
export const COOKIE_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 1 day

/* ── Pagination defaults ─────────────────────────────────────────── */
export const DEFAULT_PROJECTS_PAGE_SIZE = 9;
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

/* ── Media library ────────────────────────────────────────────────── */
export const MEDIA_DEFAULT_FOLDER = "general";
export const MAX_MEDIA_TAGS = 20;

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

/* ── Contact messages ─────────────────────────────────────────────── */
export const MESSAGE_CAP = 500;

/* ── Body size limits ─────────────────────────────────────────────── */
export const JSON_BODY_LIMIT = "150kb";

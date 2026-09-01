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

/* ── Media library ───────────────────────────────────────────────── */
export const MEDIA_DEFAULT_FOLDER = "general";
export const MAX_MEDIA_TAGS = 20;
export const MEDIA_CAPTION_MAX_LENGTH = 300;
export const MEDIA_SORT_FIELDS = ["createdAt", "originalName", "bytes"];
export const DEFAULT_MEDIA_SORT_FIELD = "createdAt";

/* ══════════════════════════════════════════════════════════════════ *
 * Content publish/draft/schedule/archive workflow
 *
 * Applies to every CMS resource with a public-facing representation:
 * singleton pages (SiteSettings, Navigation, Footer, SEO, Profile,
 * About, Resume) and list resources (Project, Category).
 *
 * Deliberately NOT applied to Media (admin-only asset registry — has
 * its own active/trash concept, see MEDIA_DEFAULT_FOLDER above) or to
 * Messages (transactional records, not content — see MESSAGE_STATUSES
 * below for their own read/unread + archive/spam concept instead).
 *
 * Five states:
 *   draft        — being authored, never shown publicly
 *   scheduled    — will automatically become "published" once
 *                  `publishAt` elapses (see scheduledPublishSweep.js,
 *                  which runs every SCHEDULE_SWEEP_INTERVAL_MS)
 *   published    — the ONLY state visible on the public site
 *   unpublished  — was published, has since been taken down; distinct
 *                  from "draft" so the history/intent ("this existed
 *                  and was pulled") is preserved
 *   archived     — retired from the active workflow entirely; must be
 *                  restored to "draft" before it can be published again
 *
 * PUBLIC-READ CONTRACT (breaking change from the old two-state model):
 * public queries/services must check `status === CONTENT_STATUS_PUBLISHED`
 * *strictly* — never `!== draft` and never `$ne: draft`. A resource
 * missing the field entirely (pre-migration data) is NOT publicly
 * visible under this contract. Run scripts/migrateStatusWorkflow.js
 * BEFORE deploying this change, or previously-live content will
 * disappear from the public site. See that script for details.
 *
 * ADMIN-READ CONTRACT: admin GET endpoints always return the full
 * document regardless of status — draft/scheduled/unpublished/archived
 * content is visible in the admin preview, never on the public site.
 * ══════════════════════════════════════════════════════════════════ */
export const CONTENT_STATUS_DRAFT = "draft";
export const CONTENT_STATUS_SCHEDULED = "scheduled";
export const CONTENT_STATUS_PUBLISHED = "published";
export const CONTENT_STATUS_UNPUBLISHED = "unpublished";
export const CONTENT_STATUS_ARCHIVED = "archived";

export const CONTENT_STATUSES = [
  CONTENT_STATUS_DRAFT,
  CONTENT_STATUS_SCHEDULED,
  CONTENT_STATUS_PUBLISHED,
  CONTENT_STATUS_UNPUBLISHED,
  CONTENT_STATUS_ARCHIVED,
];

// New documents start as drafts — standard CMS behavior. Pre-existing
// documents from before this field existed are backfilled to
// "published" by the migration script, preserving their prior
// (implicitly-public) visibility.
export const DEFAULT_CONTENT_STATUS = CONTENT_STATUS_DRAFT;

// How often the scheduled-publish sweep checks for due content.
export const SCHEDULE_SWEEP_INTERVAL_MS = 30_000;

/* ── Category listing (admin) ─────────────────────────────────────── */
export const CATEGORY_SORT_FIELDS = ["name", "createdAt", "projectCount", "order"];
export const DEFAULT_CATEGORY_SORT_FIELD = "name";

/* ── Contact messages ─────────────────────────────────────────────── */
export const MESSAGE_CAP = 500;
export const MESSAGE_STATUS_UNREAD = "unread";
export const MESSAGE_STATUS_READ = "read";
export const MESSAGE_STATUSES = [MESSAGE_STATUS_UNREAD, MESSAGE_STATUS_READ];
export const DEFAULT_MESSAGE_STATUS = MESSAGE_STATUS_UNREAD;
export const MESSAGE_SORT_FIELDS = ["createdAt", "fullname"];
export const DEFAULT_MESSAGE_SORT_FIELD = "createdAt";
export const MESSAGE_RECENT_LIMIT = 5;
export const MESSAGE_BULK_MAX = 200;
export const MESSAGE_SPAM_SCORE_THRESHOLD = 50;
export const MESSAGE_SPAM_RAPID_SUBMIT_WINDOW_MS = 60_000;

/* ── Resume CMS ──────────────────────────────────────────────────── */
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

/* ── Site Settings CMS ─────────────────────────────────────────────── */
export const THEME_MODES = ["light", "dark", "system"];
export const DEFAULT_THEME_MODE = "dark";

export const SITE_SETTINGS_LIMITS = {
  CONTACT_EMAILS_MAX: 5,
  CONTACT_PHONES_MAX: 5,
};

/* ── Body size limits ─────────────────────────────────────────────── */
export const JSON_BODY_LIMIT = "150kb";

/* ── Navigation CMS ──────────────────────────────────────────────── */
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

/* ── SEO CMS ─────────────────────────────────────────────────────── */
export const SEO_KEYWORDS_MAX = 20;
export const SEO_KEYWORD_MAX_LENGTH = 60;
export const OG_TYPES = ["website", "article", "profile"];
export const TWITTER_CARD_TYPES = ["summary", "summary_large_image"];
export const STRUCTURED_DATA_MAX_LENGTH = 5000;

/* ── Project CMS ─────────────────────────────────────────────────── */
export const PROJECT_ADMIN_SORT_FIELDS = ["order", "title", "createdAt"];
export const DEFAULT_PROJECT_ADMIN_SORT_FIELD = "order";

/* ── Rich Text ───────────────────────────────────────────────────── */
export const RICH_TEXT_ALLOWED_TAGS = ["p", "br", "strong", "em", "u", "s", "h2", "h3", "ul", "ol", "li", "blockquote", "a"];

/* ── Profile CMS ─────────────────────────────────────────────────── */
export const PROFILE_LIMITS = {
  SOCIAL_LINKS_MAX: 10,
  CTA_BUTTONS_MAX: 5,
  STATISTICS_MAX: 10,
};

export const CTA_BUTTON_STYLES = ["primary", "secondary", "outline", "text"];

/* ── About CMS ───────────────────────────────────────────────────── */
export const ABOUT_LIMITS = {
  SKILLS_SUMMARY_MAX: 20,
  SERVICES_MAX: 20,
  TIMELINE_MAX: 30,
  HIGHLIGHTS_MAX: 15,
  PERSONAL_INFO_MAX: 15,
  IMAGES_MAX: 10,
};

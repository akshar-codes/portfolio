/**
 * Mirrors backend/src/utils/contentStatus.js's transition rules and
 * backend/src/constants/index.js's status constants. Kept in sync
 * manually (frontend and backend are separate apps) — if the backend
 * transition matrix ever changes, update CONTENT_STATUS_TRANSITIONS
 * here to match, or PublishActionsMenu will offer actions the API
 * will reject with a 409.
 */
export const CONTENT_STATUS_DRAFT = "draft";
export const CONTENT_STATUS_SCHEDULED = "scheduled";
export const CONTENT_STATUS_PUBLISHED = "published";
export const CONTENT_STATUS_UNPUBLISHED = "unpublished";
export const CONTENT_STATUS_ARCHIVED = "archived";

/** Display metadata for StatusBadge — label + MUI Chip color/variant. */
export const CONTENT_STATUS_META = {
  [CONTENT_STATUS_DRAFT]: {
    label: "Draft",
    color: "default",
    variant: "outlined",
  },
  [CONTENT_STATUS_SCHEDULED]: {
    label: "Scheduled",
    color: "info",
    variant: "filled",
  },
  [CONTENT_STATUS_PUBLISHED]: {
    label: "Published",
    color: "success",
    variant: "filled",
  },
  [CONTENT_STATUS_UNPUBLISHED]: {
    label: "Unpublished",
    color: "warning",
    variant: "outlined",
  },
  [CONTENT_STATUS_ARCHIVED]: {
    label: "Archived",
    color: "default",
    variant: "outlined",
  },
};

/** Which actions are legal from each current status — must match the backend exactly. */
export const CONTENT_STATUS_TRANSITIONS = {
  [CONTENT_STATUS_DRAFT]: [
    CONTENT_STATUS_SCHEDULED,
    CONTENT_STATUS_PUBLISHED,
    CONTENT_STATUS_ARCHIVED,
  ],
  [CONTENT_STATUS_SCHEDULED]: [
    CONTENT_STATUS_DRAFT,
    CONTENT_STATUS_PUBLISHED,
    CONTENT_STATUS_ARCHIVED,
  ],
  [CONTENT_STATUS_PUBLISHED]: [
    CONTENT_STATUS_UNPUBLISHED,
    CONTENT_STATUS_ARCHIVED,
  ],
  [CONTENT_STATUS_UNPUBLISHED]: [
    CONTENT_STATUS_DRAFT,
    CONTENT_STATUS_SCHEDULED,
    CONTENT_STATUS_PUBLISHED,
    CONTENT_STATUS_ARCHIVED,
  ],
  [CONTENT_STATUS_ARCHIVED]: [CONTENT_STATUS_DRAFT],
};

/** Which of the 5 actions each transition target corresponds to, for menu labeling. */
export const STATUS_ACTION_LABELS = {
  [CONTENT_STATUS_PUBLISHED]: "Publish now",
  [CONTENT_STATUS_UNPUBLISHED]: "Unpublish",
  [CONTENT_STATUS_ARCHIVED]: "Archive",
  [CONTENT_STATUS_DRAFT]: "Restore to draft",
  [CONTENT_STATUS_SCHEDULED]: "Schedule…",
};

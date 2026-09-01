import { CONTENT_STATUSES, DEFAULT_CONTENT_STATUS } from "../constants/index.js";

/**
 * Mongoose schema plugin that turns a schema into a singleton-per-owner
 * document store with the full publish/draft/schedule/archive workflow.
 *
 * Adds:
 *   owner        — singleton discriminator, always "default"
 *   status       — one of CONTENT_STATUSES (draft/scheduled/published/
 *                  unpublished/archived)
 *   publishAt    — when set (status === "scheduled"), the time at which
 *                  the background sweep (services/scheduledPublishSweep.js)
 *                  promotes this document to "published"
 *   publishedAt  — last time this document transitioned to "published"
 *   unpublishedAt— last time this document transitioned to "unpublished"
 *   archivedAt   — last time this document transitioned to "archived"
 *
 * The actual "find or create" / "find default" behaviour lives in
 * `SingletonRepository.js`; transition/publish semantics live in
 * `SingletonService.js` (backed by `utils/contentStatus.js`) — this
 * plugin only owns the schema shape and its indexes.
 */
export default function singletonPlugin(schema) {
  schema.add({
    owner: {
      type: String,
      default: "default",
      immutable: true,
      match: [/^[a-z0-9_-]+$/, "Invalid owner value"],
    },
    status: {
      type: String,
      enum: {
        values: CONTENT_STATUSES,
        message: `status must be one of: ${CONTENT_STATUSES.join(", ")}`,
      },
      default: DEFAULT_CONTENT_STATUS,
    },
    publishAt: {
      type: Date,
      default: null,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
    unpublishedAt: {
      type: Date,
      default: null,
    },
    archivedAt: {
      type: Date,
      default: null,
    },
  });

  schema.index({ owner: 1 }, { unique: true, sparse: true });
  schema.index({ status: 1 });
  // Powers the scheduled-publish sweep's `{ status: scheduled, publishAt: { $lte: now } }` query.
  schema.index({ status: 1, publishAt: 1 });
}

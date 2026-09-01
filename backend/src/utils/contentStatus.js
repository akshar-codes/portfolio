import { ServiceError } from "../services/ServiceError.js";
import {
  CONTENT_STATUS_DRAFT,
  CONTENT_STATUS_SCHEDULED,
  CONTENT_STATUS_PUBLISHED,
  CONTENT_STATUS_UNPUBLISHED,
  CONTENT_STATUS_ARCHIVED,
} from "../constants/index.js";

/**
 * Single source of truth for legal status transitions across every CMS
 * module (singletons via SingletonService, Project, Category). Kept
 * here instead of duplicated per-service so the workflow can't drift
 * between modules.
 *
 *   draft       → scheduled, published, archived
 *   scheduled   → draft (cancel), published, scheduled (reschedule), archived
 *   published   → unpublished, archived
 *   unpublished → draft, scheduled, published, archived
 *   archived    → draft (must re-enter the workflow via draft)
 */
export const CONTENT_STATUS_TRANSITIONS = Object.freeze({
  [CONTENT_STATUS_DRAFT]: [
    CONTENT_STATUS_SCHEDULED,
    CONTENT_STATUS_PUBLISHED,
    CONTENT_STATUS_ARCHIVED,
  ],
  [CONTENT_STATUS_SCHEDULED]: [
    CONTENT_STATUS_DRAFT,
    CONTENT_STATUS_PUBLISHED,
    CONTENT_STATUS_SCHEDULED,
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
});

/**
 * Throws a 409 ServiceError if `current -> target` is not an allowed
 * transition. Every status-changing service method must call this
 * before mutating a document — never assign `status` directly.
 */
export function assertValidTransition(current, target) {
  const allowed = CONTENT_STATUS_TRANSITIONS[current] ?? [];
  if (!allowed.includes(target)) {
    throw new ServiceError(
      `Cannot change status from "${current}" to "${target}".`,
      409,
      "CONTENT_STATUS_INVALID_TRANSITION",
    );
  }
}

/** Validates and coerces a `publishAt` value for the schedule action. */
export function assertFuturePublishAt(publishAt) {
  if (!publishAt) {
    throw new ServiceError(
      "publishAt is required to schedule content.",
      400,
      "CONTENT_STATUS_PUBLISH_AT_REQUIRED",
    );
  }

  const date = new Date(publishAt);
  if (Number.isNaN(date.getTime())) {
    throw new ServiceError(
      "publishAt must be a valid date.",
      400,
      "CONTENT_STATUS_INVALID_PUBLISH_AT",
    );
  }

  if (date.getTime() <= Date.now()) {
    throw new ServiceError(
      "publishAt must be a future date/time. To publish immediately, use the publish action instead.",
      400,
      "CONTENT_STATUS_PUBLISH_AT_NOT_FUTURE",
    );
  }

  return date;
}

/**
 * Given a validated target status, returns the field mutations
 * (status + the relevant timestamp) to apply to a document. Centralizes
 * the timestamp bookkeeping so every module's transition method behaves
 * identically.
 */
export function buildStatusMutation(target, { publishAt } = {}) {
  const now = new Date();

  switch (target) {
    case CONTENT_STATUS_PUBLISHED:
      return { status: CONTENT_STATUS_PUBLISHED, publishedAt: now, publishAt: null };
    case CONTENT_STATUS_UNPUBLISHED:
      return { status: CONTENT_STATUS_UNPUBLISHED, unpublishedAt: now };
    case CONTENT_STATUS_ARCHIVED:
      return { status: CONTENT_STATUS_ARCHIVED, archivedAt: now };
    case CONTENT_STATUS_DRAFT:
      return { status: CONTENT_STATUS_DRAFT, publishAt: null };
    case CONTENT_STATUS_SCHEDULED:
      return {
        status: CONTENT_STATUS_SCHEDULED,
        publishAt: assertFuturePublishAt(publishAt),
      };
    default:
      throw new ServiceError(
        `Unknown target status "${target}".`,
        400,
        "CONTENT_STATUS_UNKNOWN",
      );
  }
}

/**
 * Runs a full validated transition against an already-loaded Mongoose
 * document: asserts the transition is legal, applies the mutation,
 * validates, and saves. Shared by SingletonService and any list
 * resource (Project, Category) that owns the workflow directly.
 *
 * @param {import("mongoose").Document} doc
 * @param {string} target
 * @param {{ publishAt?: string|Date }} [opts]
 * @returns {Promise<import("mongoose").Document>}
 */
export async function applyStatusTransition(doc, target, opts = {}) {
  assertValidTransition(doc.status, target);
  const mutation = buildStatusMutation(target, opts);
  Object.assign(doc, mutation);
  await doc.validate();
  await doc.save();
  return doc;
}

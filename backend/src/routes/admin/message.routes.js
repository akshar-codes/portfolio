import express from "express";
import {
  getMessages,
  getMessagesSummary,
  getMessageById,
  deleteMessage,
  updateMessageStatusHandler,
  archiveMessageHandler,
  restoreMessageHandler,
  toggleSpamHandler,
  bulkUpdateStatusHandler,
  bulkArchiveHandler,
  bulkRestoreHandler,
  bulkDeleteHandler,
  replyToMessageHandler,
} from "../../controllers/message.controller.js";
import { protect } from "../../middleware/authMiddleware.js";
import { emailReplyLimiter } from "../../middleware/rateLimiters.js";
import {
  messageIdParamValidator,
  updateMessageStatusValidator,
  toggleSpamValidator,
  messageListQueryValidator,
  bulkIdsValidator,
  bulkStatusValidator,
  replyMessageValidator,
} from "../../validators/message.validators.js";

const router = express.Router();

// Every route in this file requires a valid admin JWT cookie.
router.use(protect);

/* ------------------------------------------------------------------ *
 * GET /api/messages/summary  (admin dashboard widget)
 * Registered BEFORE "/" and "/:id" so Express never treats "summary"
 * as an :id param — same convention as
 * routes/admin/categoryRoutes.js's "/reorder" route.
 * ------------------------------------------------------------------ */
router.get("/summary", getMessagesSummary);

/* ------------------------------------------------------------------ *
 * GET /api/messages  (admin listing)
 * Supports ?page, ?limit, ?search, ?status, ?archived, ?spam,
 * ?dateFrom, ?dateTo, ?sortBy, ?sortOrder
 * ------------------------------------------------------------------ */
router.get("/", messageListQueryValidator, getMessages);

/* ------------------------------------------------------------------ *
 * Bulk actions — POST verbs on dedicated sub-paths, mirroring
 * routes/admin/mediaRoutes.js's bulk-* convention. No path/verb
 * overlap with the "/:id" routes below regardless of registration
 * order, but kept together up top for readability.
 * ------------------------------------------------------------------ */
router.post("/bulk-status", bulkStatusValidator, bulkUpdateStatusHandler);
router.post("/bulk-archive", bulkIdsValidator, bulkArchiveHandler);
router.post("/bulk-restore", bulkIdsValidator, bulkRestoreHandler);
router.post("/bulk-delete", bulkIdsValidator, bulkDeleteHandler);

/* ------------------------------------------------------------------ *
 * POST /api/messages/:id/reply — send a reply from the configured site
 * ------------------------------------------------------------------ */
router.post("/:id/reply", emailReplyLimiter, replyMessageValidator, replyToMessageHandler);

/* ------------------------------------------------------------------ *
 * GET /api/messages/:id
 * Pure read (no side effects) — marking a message read always happens
 * via the explicit PATCH /:id/status below, never as a hidden effect
 * of fetching it.
 * ------------------------------------------------------------------ */
router.get("/:id", messageIdParamValidator, getMessageById);

/* ------------------------------------------------------------------ *
 * PATCH /api/messages/:id/status
 * ------------------------------------------------------------------ */
router.patch("/:id/status", updateMessageStatusValidator, updateMessageStatusHandler);

/* ------------------------------------------------------------------ *
 * PATCH /api/messages/:id/archive | /restore
 * ------------------------------------------------------------------ */
router.patch("/:id/archive", messageIdParamValidator, archiveMessageHandler);
router.patch("/:id/restore", messageIdParamValidator, restoreMessageHandler);

/* ------------------------------------------------------------------ *
 * PATCH /api/messages/:id/spam  { isSpam: boolean }
 * ------------------------------------------------------------------ */
router.patch("/:id/spam", toggleSpamValidator, toggleSpamHandler);

/* ------------------------------------------------------------------ *
 * DELETE /api/messages/:id  (admin, permanent)
 * ------------------------------------------------------------------ */
router.delete("/:id", messageIdParamValidator, deleteMessage);

export default router;

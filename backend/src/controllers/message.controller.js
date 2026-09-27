import { validationResult } from "express-validator";
import AppError from "../utils/AppError.js";
import {
  createMessage,
  fetchAllMessages,
  fetchMessageById,
  fetchMessagesSummary,
  removeMessage,
  setMessageStatus,
  archiveMessage,
  restoreMessage,
  toggleMessageSpam,
  bulkUpdateMessageStatus,
  bulkArchiveMessages,
  bulkRestoreMessages,
  bulkDeleteMessages,
  replyToMessage,
} from "../services/message.service.js";
import { sendSuccess, sendNoContent } from "../utils/response.js";
import asyncHandler from "../utils/asyncHandler.js";
import { DEFAULT_MESSAGES_PAGE_SIZE } from "../constants/index.js";

/* ------------------------------------------------------------------ *
 * POST /api/messages  (public)
 * ------------------------------------------------------------------ */
export const sendMessage = asyncHandler(async (req, res) => {
  // Honeypot field — real visitors never see or fill this input.
  if (req.body.website) {
    return sendSuccess(res, null, "Message sent successfully", 201);
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(errors.array()[0].msg, 400);
  }

  const { fullname, email, message } = req.body;

  // Best-effort — `trust proxy` is already configured in app.js, so
  // req.ip reflects the real client address behind the reverse proxy.
  const ipAddress = req.ip || req.socket?.remoteAddress || "";
  const userAgent = req.headers["user-agent"] || "";

  const newMessage = await createMessage({
    fullname,
    email,
    message,
    ipAddress,
    userAgent,
  });
  return sendSuccess(res, newMessage, "Message sent successfully", 201);
});

/* ------------------------------------------------------------------ *
 * GET /api/messages  (admin)
 * Supports ?page, ?limit, ?search, ?status, ?archived, ?spam,
 * ?dateFrom, ?dateTo, ?sortBy, ?sortOrder
 * ------------------------------------------------------------------ */
export const getMessages = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(errors.array()[0].msg, 400);
  }

  const {
    page,
    limit,
    search,
    status,
    archived,
    spam,
    dateFrom,
    dateTo,
    sortBy,
    sortOrder,
  } = req.query;

  const result = await fetchAllMessages({
    page: page || 1,
    limit: limit || DEFAULT_MESSAGES_PAGE_SIZE,
    search: typeof search === "string" ? search.trim() : "",
    status: typeof status === "string" ? status.trim() : "",
    archived: typeof archived === "string" ? archived : "false",
    spam: typeof spam === "string" ? spam : "false",
    dateFrom: typeof dateFrom === "string" ? dateFrom : "",
    dateTo: typeof dateTo === "string" ? dateTo : "",
    sortBy: typeof sortBy === "string" ? sortBy : undefined,
    sortOrder: typeof sortOrder === "string" ? sortOrder : "desc",
  });
  return sendSuccess(res, result, "Messages retrieved successfully");
});

/* ------------------------------------------------------------------ *
 * GET /api/messages/summary  (admin dashboard widget data)
 * ------------------------------------------------------------------ */
export const getMessagesSummary = asyncHandler(async (_req, res) => {
  const summary = await fetchMessagesSummary();
  return sendSuccess(res, summary, "Message summary retrieved successfully");
});

/* ------------------------------------------------------------------ *
 * GET /api/messages/:id  (admin — pure read, no side effects)
 * ------------------------------------------------------------------ */
export const getMessageById = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(errors.array()[0].msg, 400);
  }

  const message = await fetchMessageById(req.params.id);
  return sendSuccess(res, message, "Message retrieved successfully");
});

/* ------------------------------------------------------------------ *
 * DELETE /api/messages/:id  (admin — permanent)
 * ------------------------------------------------------------------ */
export const deleteMessage = asyncHandler(async (req, res) => {
  await removeMessage(req.params.id);
  return sendNoContent(res);
});

/* ------------------------------------------------------------------ *
 * PATCH /api/messages/:id/status  (admin)
 * ------------------------------------------------------------------ */
export const updateMessageStatusHandler = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(errors.array()[0].msg, 400);
  }

  const message = await setMessageStatus(req.params.id, req.body.status);
  return sendSuccess(res, message, "Message status updated successfully");
});

/* ------------------------------------------------------------------ *
 * POST /api/messages/:id/reply (admin — send from the website)
 * ------------------------------------------------------------------ */
export const replyToMessageHandler = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(errors.array()[0].msg, 400);
  }

  const result = await replyToMessage(req.params.id, req.body);
  return sendSuccess(res, result, "Reply sent successfully");
});

/* ------------------------------------------------------------------ *
 * PATCH /api/messages/:id/archive  (admin)
 * ------------------------------------------------------------------ */
export const archiveMessageHandler = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(errors.array()[0].msg, 400);
  }

  const message = await archiveMessage(req.params.id);
  return sendSuccess(res, message, "Message archived successfully");
});

/* ------------------------------------------------------------------ *
 * PATCH /api/messages/:id/restore  (admin)
 * ------------------------------------------------------------------ */
export const restoreMessageHandler = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(errors.array()[0].msg, 400);
  }

  const message = await restoreMessage(req.params.id);
  return sendSuccess(res, message, "Message restored successfully");
});

/* ------------------------------------------------------------------ *
 * PATCH /api/messages/:id/spam  { isSpam: boolean }  (admin)
 * ------------------------------------------------------------------ */
export const toggleSpamHandler = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(errors.array()[0].msg, 400);
  }

  const message = await toggleMessageSpam(req.params.id, req.body.isSpam);
  const label = req.body.isSpam ? "spam" : "not spam";
  return sendSuccess(res, message, `Message marked as ${label}`);
});

/* ------------------------------------------------------------------ *
 * POST /api/messages/bulk-status  { ids, status }  (admin)
 * ------------------------------------------------------------------ */
export const bulkUpdateStatusHandler = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(errors.array()[0].msg, 400);
  }

  const result = await bulkUpdateMessageStatus(req.body.ids, req.body.status);
  return sendSuccess(res, result, "Messages updated successfully");
});

/* ------------------------------------------------------------------ *
 * POST /api/messages/bulk-archive  { ids }  (admin)
 * ------------------------------------------------------------------ */
export const bulkArchiveHandler = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(errors.array()[0].msg, 400);
  }

  const result = await bulkArchiveMessages(req.body.ids);
  return sendSuccess(res, result, "Messages archived successfully");
});

/* ------------------------------------------------------------------ *
 * POST /api/messages/bulk-restore  { ids }  (admin)
 * ------------------------------------------------------------------ */
export const bulkRestoreHandler = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(errors.array()[0].msg, 400);
  }

  const result = await bulkRestoreMessages(req.body.ids);
  return sendSuccess(res, result, "Messages restored successfully");
});

/* ------------------------------------------------------------------ *
 * POST /api/messages/bulk-delete  { ids }  (admin — permanent)
 * ------------------------------------------------------------------ */
export const bulkDeleteHandler = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(errors.array()[0].msg, 400);
  }

  const result = await bulkDeleteMessages(req.body.ids);
  return sendSuccess(res, result, "Messages deleted successfully");
});

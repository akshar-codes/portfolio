import { validationResult } from "express-validator";
import AppError from "../utils/AppError.js";
import {
  createMessage,
  fetchAllMessages,
  removeMessage,
  setMessageStatus,
} from "../services/messageService.js";
import { sendSuccess, sendNoContent } from "../utils/response.js";
import asyncHandler from "../utils/asyncHandler.js";
import { DEFAULT_MESSAGES_PAGE_SIZE } from "../utils/constants.js";

/* ------------------------------------------------------------------ *
 * POST /api/messages  (public)
 * ------------------------------------------------------------------ */
export const sendMessage = asyncHandler(async (req, res) => {
  if (req.body.website) {
    return sendSuccess(res, null, "Message sent successfully", 201);
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(errors.array()[0].msg, 400);
  }

  const { fullname, email, message } = req.body;
  const newMessage = await createMessage({ fullname, email, message });
  return sendSuccess(res, newMessage, "Message sent successfully", 201);
});

/* ------------------------------------------------------------------ *
 * GET /api/messages  (admin)
 * Supports ?search, ?status (unread|read), ?sortOrder (asc|desc)
 * ------------------------------------------------------------------ */
export const getMessages = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || DEFAULT_MESSAGES_PAGE_SIZE;

  if (page < 1) throw new AppError("page must be a positive integer.", 400);
  if (limit < 1) throw new AppError("limit must be a positive integer.", 400);

  const search =
    typeof req.query.search === "string" ? req.query.search.trim() : "";
  const status =
    typeof req.query.status === "string" ? req.query.status.trim() : "";
  const sortOrder =
    typeof req.query.sortOrder === "string"
      ? req.query.sortOrder.trim()
      : "desc";

  const result = await fetchAllMessages({
    page,
    limit,
    search,
    status,
    sortOrder,
  });
  return sendSuccess(res, result, "Messages retrieved successfully");
});

/* ------------------------------------------------------------------ *
 * DELETE /api/messages/:id  (admin)
 * ------------------------------------------------------------------ */
export const deleteMessage = asyncHandler(async (req, res) => {
  await removeMessage(req.params.id);
  return sendNoContent(res); // 204 — REST standard for successful delete
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

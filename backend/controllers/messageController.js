import { validationResult } from "express-validator";
import AppError from "../utils/AppError.js";
import {
  createMessage,
  fetchAllMessages,
  removeMessage,
} from "../services/messageService.js";
import { sendSuccess } from "../utils/response.js";
import asyncHandler from "../utils/asyncHandler.js";

/* ------------------------------------------------------------------ *
 * POST /api/messages  (public)
 * ------------------------------------------------------------------ */
export const sendMessage = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(errors.array()[0].msg, 400);
  }

  const { fullname, email, message } = req.body;
  const newMessage = await createMessage({ fullname, email, message });
  return sendSuccess(res, newMessage, "Message sent successfully", 201);
});

export const getMessages = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;

  if (page < 1) throw new AppError("page must be a positive integer.", 400);
  if (limit < 1) throw new AppError("limit must be a positive integer.", 400);

  const result = await fetchAllMessages({ page, limit });
  return sendSuccess(res, result, "Messages retrieved successfully");
});

/* ------------------------------------------------------------------ *
 * DELETE /api/messages/:id  (admin)
 * ------------------------------------------------------------------ */
export const deleteMessage = asyncHandler(async (req, res) => {
  await removeMessage(req.params.id);
  return sendSuccess(res, null, "Message deleted successfully");
});

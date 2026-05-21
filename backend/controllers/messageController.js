import { validationResult } from "express-validator";
import AppError from "../utils/AppError.js";
import {
  createMessage,
  fetchAllMessages,
  removeMessage,
} from "../services/messageService.js";
import { sendSuccess } from "../utils/response.js";
import asyncHandler from "../utils/asyncHandler.js";

/* ---------------------------------------------------------------
   POST /api/messages  (public)
--------------------------------------------------------------- */
export const sendMessage = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Throw so errorMiddleware handles formatting — consistent with
    // every other 400 in the codebase
    throw new AppError(errors.array()[0].msg, 400);
  }

  const { fullname, email, message } = req.body;
  const newMessage = await createMessage({ fullname, email, message });
  return sendSuccess(res, newMessage, "Message sent successfully", 201);
});

/* ---------------------------------------------------------------
   GET /api/messages  (admin)
--------------------------------------------------------------- */
export const getMessages = asyncHandler(async (req, res) => {
  const messages = await fetchAllMessages();
  return sendSuccess(res, messages, "Messages retrieved successfully");
});

/* ---------------------------------------------------------------
   DELETE /api/messages/:id  (admin)
--------------------------------------------------------------- */
export const deleteMessage = asyncHandler(async (req, res) => {
  await removeMessage(req.params.id);
  return sendSuccess(res, null, "Message deleted successfully");
});

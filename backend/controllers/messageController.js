import { validationResult } from "express-validator";
import { ServiceError } from "../services/errors.js";
import {
  createMessage,
  fetchAllMessages,
  removeMessage,
} from "../services/messageService.js";

/* ---------------------------------------------------------------
   POST /api/messages  (public)
--------------------------------------------------------------- */
export const sendMessage = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { fullname, email, message } = req.body;
    const newMessage = await createMessage({ fullname, email, message });
    res.status(201).json(newMessage);
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.status).json({ message: error.message });
    }
    console.error("[sendMessage]", error);
    res.status(500).json({ message: "Failed to send message." });
  }
};

/* ---------------------------------------------------------------
   GET /api/messages  (admin)
--------------------------------------------------------------- */
export const getMessages = async (req, res) => {
  try {
    const messages = await fetchAllMessages();
    res.json(messages);
  } catch (error) {
    console.error("[getMessages]", error);
    res.status(500).json({ message: "Failed to fetch messages." });
  }
};

/* ---------------------------------------------------------------
   DELETE /api/messages/:id  (admin)
--------------------------------------------------------------- */
export const deleteMessage = async (req, res) => {
  try {
    await removeMessage(req.params.id);
    res.json({ message: "Message deleted successfully." });
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.status).json({ message: error.message });
    }
    console.error("[deleteMessage]", error);
    res.status(500).json({ message: "Failed to delete message." });
  }
};

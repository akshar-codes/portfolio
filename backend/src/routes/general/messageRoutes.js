import express from "express";
import { sendMessage } from "../../controllers/messageController.js";
import { contactFormLimiter } from "../../middleware/rateLimiters.js";
import { sendMessageValidator } from "../../validators/messageValidators.js";

const router = express.Router();

/* ------------------------------------------------------------------ *
 * POST /api/messages  (public)
 * ------------------------------------------------------------------ */
router.post("/", contactFormLimiter, sendMessageValidator, sendMessage);

export default router;

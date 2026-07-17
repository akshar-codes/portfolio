import express from "express";
import {
  getMessages,
  deleteMessage,
} from "../../controllers/messageController.js";
import { protect } from "../../middleware/authMiddleware.js";

const router = express.Router();

// Every route in this file requires a valid admin JWT cookie.
router.use(protect);

/* ------------------------------------------------------------------ *
 * GET /api/messages  (admin)
 * ------------------------------------------------------------------ */
router.get("/", getMessages);

/* ------------------------------------------------------------------ *
 * DELETE /api/messages/:id  (admin)
 * ------------------------------------------------------------------ */
router.delete("/:id", deleteMessage);

export default router;

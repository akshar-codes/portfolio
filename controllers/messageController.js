import Message from "../models/Message.js";
import { validationResult } from "express-validator";

/* ===============================
   Send Message (Public)
================================ */
export const sendMessage = async (req, res) => {
  try {
    // Validation errors check
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    // Database cap safeguard
    const totalMessages = await Message.countDocuments();
    if (totalMessages >= 500) {
      return res.status(403).json({
        message: "Message limit reached. Try again later.",
      });
    }

    const { fullname, email, message } = req.body;

    const newMessage = await Message.create({
      fullname,
      email,
      message,
    });

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ===============================
   Get All Messages (Admin)
================================ */
export const getMessages = async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ===============================
   Delete Message (Admin)
================================ */
export const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    await message.deleteOne();

    res.json({ message: "Message deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

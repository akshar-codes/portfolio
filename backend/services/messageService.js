import Message from "../models/Message.js";
import { ServiceError } from "./errors.js";

const MESSAGE_CAP = 500;

export const createMessage = async ({ fullname, email, message }) => {
  const total = await Message.countDocuments();

  if (total >= MESSAGE_CAP) {
    throw new ServiceError("Message limit reached. Try again later.", 403);
  }

  const newMessage = await Message.create({ fullname, email, message });

  return newMessage;
};

export const fetchAllMessages = async ({ page = 1, limit = 10 } = {}) => {
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(Math.max(1, limit), 50); // clamp: 1–50
  const skip = (safePage - 1) * safeLimit;

  const [messages, total] = await Promise.all([
    Message.find().sort({ createdAt: -1 }).skip(skip).limit(safeLimit),
    Message.countDocuments(),
  ]);

  return {
    messages,
    total,
    page: safePage,
    limit: safeLimit,
    totalPages: Math.ceil(total / safeLimit),
  };
};

export const removeMessage = async (id) => {
  const message = await Message.findById(id);

  if (!message) {
    throw new ServiceError("Message not found", 404);
  }

  await message.deleteOne();
};

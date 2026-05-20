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

export const fetchAllMessages = async () => {
  return Message.find().sort({ createdAt: -1 });
};

export const removeMessage = async (id) => {
  const message = await Message.findById(id);

  if (!message) {
    throw new ServiceError("Message not found", 404);
  }

  await message.deleteOne();
};

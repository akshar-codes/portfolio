import {
  countAll,
  create,
  findPaginated,
  findById,
} from "../repositories/messageRepository.js";
import { ServiceError } from "./ServiceError.js";
import {
  MESSAGE_CAP,
  DEFAULT_MESSAGES_PAGE_SIZE,
  MAX_PAGE_SIZE,
} from "../utils/constants.js";

export const createMessage = async ({ fullname, email, message }) => {
  const total = await countAll();

  if (total >= MESSAGE_CAP) {
    throw new ServiceError(
      "Message limit reached. Try again later.",
      403,
      "MESSAGE_LIMIT_REACHED",
    );
  }

  const newMessage = await create({ fullname, email, message });
  return newMessage;
};

export const fetchAllMessages = async ({
  page = 1,
  limit = DEFAULT_MESSAGES_PAGE_SIZE,
} = {}) => {
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(Math.max(1, limit), MAX_PAGE_SIZE);
  const skip = (safePage - 1) * safeLimit;

  const [messages, total] = await Promise.all([
    findPaginated({ skip, limit: safeLimit }),
    countAll(),
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
  const message = await findById(id);

  if (!message) {
    throw new ServiceError("Message not found", 404, "MESSAGE_NOT_FOUND");
  }

  await message.deleteOne();
};

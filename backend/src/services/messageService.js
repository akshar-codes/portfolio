import {
  countAll,
  create,
  findPaginated,
  findById,
  updateStatus,
} from "../repositories/messageRepository.js";
import { ServiceError } from "./ServiceError.js";
import { buildSearchFilter, parseSort } from "../utils/queryHelpers.js";
import {
  MESSAGE_CAP,
  DEFAULT_MESSAGES_PAGE_SIZE,
  MAX_PAGE_SIZE,
  MESSAGE_STATUSES,
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

/**
 * Admin inbox listing — supports full-text-style search across
 * fullname/email/message, filtering by read/unread status, and
 * configurable sort order (default newest first).
 */
export const fetchAllMessages = async ({
  page = 1,
  limit = DEFAULT_MESSAGES_PAGE_SIZE,
  search = "",
  status = "",
  sortOrder = "desc",
} = {}) => {
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(Math.max(1, limit), MAX_PAGE_SIZE);
  const skip = (safePage - 1) * safeLimit;

  const filter = {};
  if (status && MESSAGE_STATUSES.includes(status)) {
    filter.status = status;
  }
  Object.assign(
    filter,
    buildSearchFilter(search, ["fullname", "email", "message"]),
  );

  const sort = parseSort(undefined, sortOrder, ["createdAt"], "createdAt");

  const [messages, total] = await Promise.all([
    findPaginated({ filter, skip, limit: safeLimit, sort }),
    countAll(filter),
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

/** Marks a message as read/unread — the inbox equivalent of publish/draft. */
export const setMessageStatus = async (id, status) => {
  if (!MESSAGE_STATUSES.includes(status)) {
    throw new ServiceError(
      `status must be one of: ${MESSAGE_STATUSES.join(", ")}`,
      400,
      "MESSAGE_INVALID_STATUS",
    );
  }

  const message = await updateStatus(id, status);
  if (!message) {
    throw new ServiceError("Message not found", 404, "MESSAGE_NOT_FOUND");
  }
  return message;
};

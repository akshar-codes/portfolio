import {
  countAll,
  create,
  findPaginated,
  findById,
  updateStatus,
  updateArchivedStatus,
  updateSpamStatus,
  updateMany,
  deleteMany,
  findManyByIds,
  countRecentByIp,
} from "../repositories/messageRepository.js";
import { ServiceError } from "./ServiceError.js";
import { buildSearchFilter } from "../utils/queryHelpers.js";
import { analyzeSpam } from "../utils/spamDetector.js";
import {
  MESSAGE_CAP,
  DEFAULT_MESSAGES_PAGE_SIZE,
  MAX_PAGE_SIZE,
  MESSAGE_STATUSES,
  MESSAGE_STATUS_UNREAD,
  MESSAGE_RECENT_LIMIT,
  MESSAGE_SPAM_RAPID_SUBMIT_WINDOW_MS,
  MESSAGE_SORT_FIELDS,
  DEFAULT_MESSAGE_SORT_FIELD,
} from "../constants/index.js";

/* ================================================================== *
 * Helpers
 * ================================================================== */

/** Throws unless every id in `ids` resolves to an existing message —
 * mirrors services/projectService.js reorderProjects' existence
 * check, so a bulk action never silently no-ops on a bad id. */
async function assertMessagesExist(ids) {
  const found = await findManyByIds(ids);
  if (found.length !== ids.length) {
    throw new ServiceError(
      "One or more message IDs were not found.",
      404,
      "MESSAGE_BULK_NOT_FOUND",
    );
  }
}

function toBulkResult(result) {
  return {
    matched: result.matchedCount ?? 0,
    modified: result.modifiedCount ?? 0,
  };
}

/* ================================================================== *
 * createMessage  (public contact-form submission)
 * ================================================================== */

export const createMessage = async ({
  fullname,
  email,
  message,
  ipAddress = "",
  userAgent = "",
}) => {
  const total = await countAll();

  if (total >= MESSAGE_CAP) {
    throw new ServiceError(
      "Message limit reached. Try again later.",
      403,
      "MESSAGE_LIMIT_REACHED",
    );
  }

  const recentFromSameIp = await countRecentByIp(
    ipAddress,
    new Date(Date.now() - MESSAGE_SPAM_RAPID_SUBMIT_WINDOW_MS),
  );

  const { isSpam, spamScore, reasons } = analyzeSpam({
    fullname,
    email,
    message,
    recentFromSameIp,
  });

  // Built explicitly from computed values only — never spreads raw
  // req.body — so a client can never spoof isSpam/spamScore/ipAddress
  // by including them in the submission payload.
  const newMessage = await create({
    fullname,
    email,
    message,
    ipAddress,
    userAgent,
    isSpam,
    spamScore,
    spamReasons: reasons,
  });

  return newMessage;
};

/* ================================================================== *
 * fetchAllMessages  (admin listing — search, filter, paginate, sort)
 * ================================================================== */

export const fetchAllMessages = async ({
  page = 1,
  limit = DEFAULT_MESSAGES_PAGE_SIZE,
  search = "",
  status = "",
  archived = "false",
  spam = "false",
  dateFrom = "",
  dateTo = "",
  sortBy = DEFAULT_MESSAGE_SORT_FIELD,
  sortOrder = "desc",
} = {}) => {
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(Math.max(1, limit), MAX_PAGE_SIZE);
  const skip = (safePage - 1) * safeLimit;

  const filter = {};

  if (status && MESSAGE_STATUSES.includes(status)) {
    filter.status = status;
  }

  // `$ne: true` (rather than an equality match on `false`) so
  // pre-existing documents that predate the archive/spam fields — and
  // therefore read back `undefined` for them — remain visible in the
  // default inbox view. Mirrors the CONTENT_STATUS_DRAFT convention
  // documented in utils/constants.js.
  if (archived === "true") filter.isArchived = true;
  else if (archived !== "all") filter.isArchived = { $ne: true };

  if (spam === "true") filter.isSpam = true;
  else if (spam !== "all") filter.isSpam = { $ne: true };

  const dateFilter = {};
  if (dateFrom) {
    const from = new Date(dateFrom);
    if (!Number.isNaN(from.getTime())) dateFilter.$gte = from;
  }
  if (dateTo) {
    const to = new Date(dateTo);
    if (!Number.isNaN(to.getTime())) {
      // Explicit UTC end-of-day so the boundary doesn't drift with the
      // server's local timezone (setHours would; setUTCHours won't).
      to.setUTCHours(23, 59, 59, 999);
      dateFilter.$lte = to;
    }
  }
  if (Object.keys(dateFilter).length > 0) filter.createdAt = dateFilter;

  Object.assign(
    filter,
    buildSearchFilter(search, ["fullname", "email", "message"]),
  );

  const sortField = MESSAGE_SORT_FIELDS.includes(sortBy)
    ? sortBy
    : DEFAULT_MESSAGE_SORT_FIELD;
  const direction = sortOrder === "asc" ? 1 : -1;
  const sort = { [sortField]: direction };

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

/* ================================================================== *
 * fetchMessageById  (admin detail view)
 *
 * Pure read — no side effects. Marking a message read is always an
 * explicit, separate PATCH triggered by the client (see
 * setMessageStatus below); a GET must stay safe/idempotent so caching,
 * retries, and React Query's refetch-on-focus can never silently flip
 * a message's read state as a side effect of simply fetching it.
 * ================================================================== */

export const fetchMessageById = async (id) => {
  const message = await findById(id);
  if (!message) {
    throw new ServiceError("Message not found", 404, "MESSAGE_NOT_FOUND");
  }
  return message;
};

/* ================================================================== *
 * fetchMessagesSummary  (admin dashboard widget data)
 * ================================================================== */

export const fetchMessagesSummary = async () => {
  const activeFilter = { isArchived: { $ne: true }, isSpam: { $ne: true } };

  const [unreadCount, archivedCount, spamCount, totalCount, recent] =
    await Promise.all([
      countAll({ ...activeFilter, status: MESSAGE_STATUS_UNREAD }),
      countAll({ isArchived: true }),
      countAll({ isSpam: true }),
      countAll(activeFilter),
      findPaginated({
        filter: activeFilter,
        skip: 0,
        limit: MESSAGE_RECENT_LIMIT,
        sort: { createdAt: -1 },
      }),
    ]);

  return { unreadCount, archivedCount, spamCount, totalCount, recent };
};

/* ================================================================== *
 * removeMessage  (permanent delete)
 * ================================================================== */

export const removeMessage = async (id) => {
  const message = await findById(id);

  if (!message) {
    throw new ServiceError("Message not found", 404, "MESSAGE_NOT_FOUND");
  }

  await message.deleteOne();
};

/* ================================================================== *
 * setMessageStatus  (read / unread)
 * ================================================================== */

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

/* ================================================================== *
 * Archive / Restore (single)
 * ================================================================== */

export const archiveMessage = async (id) => {
  const message = await updateArchivedStatus(id, true);
  if (!message) {
    throw new ServiceError("Message not found", 404, "MESSAGE_NOT_FOUND");
  }
  return message;
};

export const restoreMessage = async (id) => {
  const message = await updateArchivedStatus(id, false);
  if (!message) {
    throw new ServiceError("Message not found", 404, "MESSAGE_NOT_FOUND");
  }
  return message;
};

/* ================================================================== *
 * Spam toggle (single, admin override)
 * ================================================================== */

export const toggleMessageSpam = async (id, isSpam) => {
  const message = await updateSpamStatus(id, Boolean(isSpam));
  if (!message) {
    throw new ServiceError("Message not found", 404, "MESSAGE_NOT_FOUND");
  }
  return message;
};

/* ================================================================== *
 * Bulk actions
 * ================================================================== */

export const bulkUpdateMessageStatus = async (ids, status) => {
  if (!MESSAGE_STATUSES.includes(status)) {
    throw new ServiceError(
      `status must be one of: ${MESSAGE_STATUSES.join(", ")}`,
      400,
      "MESSAGE_INVALID_STATUS",
    );
  }
  await assertMessagesExist(ids);
  const result = await updateMany({ _id: { $in: ids } }, { $set: { status } });
  return toBulkResult(result);
};

export const bulkArchiveMessages = async (ids) => {
  await assertMessagesExist(ids);
  const result = await updateMany(
    { _id: { $in: ids } },
    { $set: { isArchived: true } },
  );
  return toBulkResult(result);
};

export const bulkRestoreMessages = async (ids) => {
  await assertMessagesExist(ids);
  const result = await updateMany(
    { _id: { $in: ids } },
    { $set: { isArchived: false } },
  );
  return toBulkResult(result);
};

export const bulkDeleteMessages = async (ids) => {
  await assertMessagesExist(ids);
  const result = await deleteMany({ _id: { $in: ids } });
  return { deleted: result.deletedCount ?? 0 };
};

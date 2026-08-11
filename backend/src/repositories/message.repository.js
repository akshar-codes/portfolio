import Message from "../models/Message.js";

export const countAll = (filter = {}) => Message.countDocuments(filter);

export const create = (data) => Message.create(data);

export const findPaginated = ({
  filter = {},
  skip,
  limit,
  sort = { createdAt: -1 },
}) => Message.find(filter).sort(sort).skip(skip).limit(limit);

export const findById = (id) => Message.findById(id);

export const updateStatus = (id, status) =>
  Message.findByIdAndUpdate(id, { status }, { new: true });

export const updateArchivedStatus = (id, isArchived) =>
  Message.findByIdAndUpdate(id, { isArchived }, { new: true });

export const updateSpamStatus = (id, isSpam) =>
  Message.findByIdAndUpdate(id, { isSpam }, { new: true });

/** Bulk status/archive mutation — powers the bulk-action endpoints. */
export const updateMany = (filter, update) => Message.updateMany(filter, update);

/** Bulk permanent delete. */
export const deleteMany = (filter) => Message.deleteMany(filter);

/** Existence check for bulk actions — mirrors
 * repositories/projectRepository.js findManyByIds, so a bulk action
 * never silently no-ops on a typo'd/stale id. */
export const findManyByIds = (ids) =>
  Message.find({ _id: { $in: ids } }).select("_id");

/** Same-IP resubmission check used by the spam heuristic at creation
 * time — counts messages from the same IP within a short window. */
export const countRecentByIp = (ipAddress, since) =>
  ipAddress
    ? Message.countDocuments({ ipAddress, createdAt: { $gte: since } })
    : Promise.resolve(0);

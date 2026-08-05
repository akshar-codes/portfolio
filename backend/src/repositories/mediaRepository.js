import Media from "../models/Media.js";

/**
 * Data-access layer for the Media collection. Services go through this
 * repository rather than importing the Mongoose model directly, so
 * query shape (projections, filters, lean vs. hydrated) is defined
 * once — matches the convention used by every other repository in
 * this codebase (see repositories/projectRepository.js,
 * repositories/categoryRepository.js).
 */

export const create = (data) => Media.create(data);

/** Hydrated document — callers that need `.save()` (metadata edits,
 * replace, soft-delete rollback context) use this instead of the lean
 * `findManyByIds` below. */
export const findById = (id) => Media.findById(id);

export const findPaginated = ({ filter, skip, limit, sort, projection }) =>
  Media.find(filter, projection).sort(sort).skip(skip).limit(limit).lean();

export const countAll = (filter) => Media.countDocuments(filter);

/** Hard delete — only ever called from the "permanent delete" path. */
export const deleteById = (id) => Media.findByIdAndDelete(id);

export const deleteManyByIds = (ids) => Media.deleteMany({ _id: { $in: ids } });

export const updateById = (id, data) =>
  Media.findByIdAndUpdate(id, data, { new: true, runValidators: true });

/** Lean — used for read-only bulk operations (collecting public_ids, etc). */
export const findManyByIds = (ids) => Media.find({ _id: { $in: ids } }).lean();

export const bulkWrite = (ops) => Media.bulkWrite(ops, { ordered: false });

/** Active (non-trashed) file count for a given folder slug — used to
 * gate folder deletion and to populate per-folder counts in the
 * sidebar. See services/mediaFolderService.js. */
export const countActiveByFolder = (folder) =>
  Media.countDocuments({ folder, deletedAt: null });

/** Cascades a folder rename onto every Media document (active AND
 * trashed) that referenced the old slug. */
export const reassignFolder = (oldFolder, newFolder) =>
  Media.updateMany({ folder: oldFolder }, { $set: { folder: newFolder } });

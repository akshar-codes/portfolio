import Admin from "../models/Admin.js";

/**
 * Data-access layer for the Admin collection. Services and middleware
 * go through this repository rather than importing the Mongoose model
 * directly, so query shape (projections, filters) is defined once.
 */

// The CMS is deliberately single-admin; auth methods resolve to that existing
// account and never create or link accounts from submitted profile data.
export const findSoleAdmin = async () => {
  const [count, admin] = await Promise.all([
    Admin.countDocuments({}),
    Admin.findOne({}),
  ]);
  return count === 1 ? admin : null;
};

export const findByIdSafe = (id) => Admin.findById(id).select("-password");

export const findByIdWithPassword = (id) => Admin.findById(id);

export const updatePasswordAndIncrementTokenVersion = (
  id,
  currentHash,
  password,
) =>
  Admin.findOneAndUpdate(
    { _id: id, password: currentHash },
    { $set: { password }, $inc: { tokenVersion: 1 } },
    { new: true, runValidators: true },
  );

export const incrementTokenVersion = (id) =>
  Admin.findByIdAndUpdate(id, { $inc: { tokenVersion: 1 } });

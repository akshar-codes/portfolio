import Admin from "../models/Admin.js";

/**
 * Data-access layer for the Admin collection. Services and middleware
 * go through this repository rather than importing the Mongoose model
 * directly, so query shape (projections, filters) is defined once.
 */

export const findByUsername = (username) => Admin.findOne({ username });

export const findByIdSafe = (id) => Admin.findById(id).select("-password");

export const incrementTokenVersion = (id) =>
  Admin.findByIdAndUpdate(id, { $inc: { tokenVersion: 1 } });

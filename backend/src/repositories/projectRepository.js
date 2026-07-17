import Project from "../models/Project.js";

export const countByCategory = (categoryId) =>
  Project.countDocuments({ category: categoryId });

export const findPaginated = ({ filter, skip, limit }) =>
  Project.find(filter)
    .select("-image.public_id -bannerImage.public_id -gallery.public_id")
    .populate("category", "name slug")
    .sort({ order: 1, createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

export const countAll = (filter) => Project.countDocuments(filter);

export const findByIdPublic = (id) =>
  Project.findById(id)
    .select("-image.public_id -bannerImage.public_id -gallery.public_id")
    .populate("category", "name slug")
    .lean();

export const findById = (id) => Project.findById(id);

export const findMaxOrder = () =>
  Project.findOne().sort({ order: -1 }).select("order").lean();

export const create = (data) => Project.create(data);

export const findManyByIds = (ids) =>
  Project.find({ _id: { $in: ids } })
    .select("_id")
    .lean();

export const bulkWrite = (ops) => Project.bulkWrite(ops, { ordered: false });

export const findAllForResequence = (filter) =>
  Project.find(filter).select("_id order").sort({ order: 1 }).lean();

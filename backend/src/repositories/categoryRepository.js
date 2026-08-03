import Category from "../models/Category.js";

export const aggregateCategories = (pipeline) => Category.aggregate(pipeline);

export const findBySlug = (slug) => Category.findOne({ slug }).lean();

export const findById = (id) => Category.findById(id).lean();

export const create = (data) => Category.create(data);

export const deleteById = (id) => Category.findByIdAndDelete(id);

export const updateById = (id, data) =>
  Category.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).lean();

/* ── Ordering helpers — mirror repositories/projectRepository.js ──── */

export const findMaxOrder = () =>
  Category.findOne().sort({ order: -1 }).select("order").lean();

export const findManyByIds = (ids) =>
  Category.find({ _id: { $in: ids } })
    .select("_id")
    .lean();

export const bulkWrite = (ops) => Category.bulkWrite(ops, { ordered: false });

export const findAllForResequence = () =>
  Category.find().select("_id order").sort({ order: 1 }).lean();

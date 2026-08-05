import MediaFolder from "../models/MediaFolder.js";

export const findAll = () => MediaFolder.find().sort({ order: 1, name: 1 }).lean();

export const findBySlug = (slug) => MediaFolder.findOne({ slug }).lean();

export const findById = (id) => MediaFolder.findById(id).lean();

export const create = (data) => MediaFolder.create(data);

export const updateById = (id, data) =>
  MediaFolder.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();

export const deleteById = (id) => MediaFolder.findByIdAndDelete(id);

export const findMaxOrder = () =>
  MediaFolder.findOne().sort({ order: -1 }).select("order").lean();

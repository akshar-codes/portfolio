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

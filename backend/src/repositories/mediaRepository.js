import Media from "../models/Media.js";

export const create = (data) => Media.create(data);

export const findById = (id) => Media.findById(id);

export const findPaginated = ({ filter, skip, limit, sort, projection }) =>
  Media.find(filter, projection).sort(sort).skip(skip).limit(limit).lean();

export const countAll = (filter) => Media.countDocuments(filter);

export const deleteById = (id) => Media.findByIdAndDelete(id);

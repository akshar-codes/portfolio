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

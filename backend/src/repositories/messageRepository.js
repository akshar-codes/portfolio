import Message from "../models/Message.js";

export const countAll = () => Message.countDocuments();

export const create = (data) => Message.create(data);

export const findPaginated = ({ skip, limit }) =>
  Message.find().sort({ createdAt: -1 }).skip(skip).limit(limit);

export const findById = (id) => Message.findById(id);

import About from "../models/About.js";

export const getSingleton = () => About.getSingleton();

export const findDefault = () => About.findOne({ owner: "default" });

export const create = (data) => About.create(data);

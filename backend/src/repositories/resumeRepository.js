import Resume from "../models/Resume.js";

export const getSingleton = () => Resume.getSingleton();

export const findDefault = () => Resume.findOne({ owner: "default" });

export const create = (data) => Resume.create(data);

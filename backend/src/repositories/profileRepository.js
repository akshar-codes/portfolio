import Profile from "../models/Profile.js";

export const getSingleton = () => Profile.getSingleton();

export const findDefault = () => Profile.findOne({ owner: "default" });

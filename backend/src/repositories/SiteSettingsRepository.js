import SiteSettings from "../models/SiteSettings.js";
import { createSingletonRepository } from "./SingletonRepository.js";

const { getSingleton, findDefault, create } =
  createSingletonRepository(SiteSettings);

export { getSingleton, findDefault, create };

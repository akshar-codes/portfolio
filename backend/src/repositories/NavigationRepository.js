import Navigation from "../models/Navigation.js";
import { createSingletonRepository } from "./SingletonRepository.js";

const { getSingleton, findDefault, create } =
  createSingletonRepository(Navigation);

export { getSingleton, findDefault, create };

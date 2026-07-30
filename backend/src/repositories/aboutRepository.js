import About from "../models/About.js";
import { createSingletonRepository } from "./SingletonRepository.js";

const { getSingleton, findDefault, create } = createSingletonRepository(About);

export { getSingleton, findDefault, create };
